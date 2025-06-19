'use strict';

var lancedb = require('@lancedb/lancedb');
var agent = require('@mastra/core/agent');
var storage = require('@mastra/core/storage');
var apacheArrow = require('apache-arrow');
var vector = require('@mastra/core/vector');
var filter = require('@mastra/core/vector/filter');

// src/storage/index.ts
var LanceStorage = class _LanceStorage extends storage.MastraStorage {
  lanceClient;
  /**
   * Creates a new instance of LanceStorage
   * @param uri The URI to connect to LanceDB
   * @param options connection options
   *
   * Usage:
   *
   * Connect to a local database
   * ```ts
   * const store = await LanceStorage.create('/path/to/db');
   * ```
   *
   * Connect to a LanceDB cloud database
   * ```ts
   * const store = await LanceStorage.create('db://host:port');
   * ```
   *
   * Connect to a cloud database
   * ```ts
   * const store = await LanceStorage.create('s3://bucket/db', { storageOptions: { timeout: '60s' } });
   * ```
   */
  static async create(name, uri, options) {
    const instance = new _LanceStorage(name);
    try {
      instance.lanceClient = await lancedb.connect(uri, options);
      return instance;
    } catch (e) {
      throw new Error(`Failed to connect to LanceDB: ${e}`);
    }
  }
  /**
   * @internal
   * Private constructor to enforce using the create factory method
   */
  constructor(name) {
    super({ name });
  }
  async createTable({
    tableName,
    schema
  }) {
    try {
      const arrowSchema = this.translateSchema(schema);
      await this.lanceClient.createEmptyTable(tableName, arrowSchema);
    } catch (error) {
      throw new Error(`Failed to create table: ${error}`);
    }
  }
  translateSchema(schema) {
    const fields = Object.entries(schema).map(([name, column]) => {
      let arrowType;
      switch (column.type.toLowerCase()) {
        case "text":
        case "uuid":
          arrowType = new apacheArrow.Utf8();
          break;
        case "int":
        case "integer":
          arrowType = new apacheArrow.Int32();
          break;
        case "bigint":
          arrowType = new apacheArrow.Float64();
          break;
        case "float":
          arrowType = new apacheArrow.Float32();
          break;
        case "jsonb":
        case "json":
          arrowType = new apacheArrow.Utf8();
          break;
        case "binary":
          arrowType = new apacheArrow.Binary();
          break;
        case "timestamp":
          arrowType = new apacheArrow.Float64();
          break;
        default:
          arrowType = new apacheArrow.Utf8();
      }
      return new apacheArrow.Field(name, arrowType, column.nullable ?? true);
    });
    return new apacheArrow.Schema(fields);
  }
  /**
   * Drop a table if it exists
   * @param tableName Name of the table to drop
   */
  async dropTable(tableName) {
    try {
      await this.lanceClient.dropTable(tableName);
    } catch (error) {
      if (error.toString().includes("was not found")) {
        this.logger.debug(`Table '${tableName}' does not exist, skipping drop`);
        return;
      }
      throw new Error(`Failed to drop table: ${error}`);
    }
  }
  /**
   * Get table schema
   * @param tableName Name of the table
   * @returns Table schema
   */
  async getTableSchema(tableName) {
    try {
      const table = await this.lanceClient.openTable(tableName);
      const rawSchema = await table.schema();
      const fields = rawSchema.fields;
      return {
        fields,
        metadata: /* @__PURE__ */ new Map(),
        get names() {
          return fields.map((field) => field.name);
        }
      };
    } catch (error) {
      throw new Error(`Failed to get table schema: ${error}`);
    }
  }
  getDefaultValue(type) {
    switch (type) {
      case "text":
        return "''";
      case "timestamp":
        return "CURRENT_TIMESTAMP";
      case "integer":
      case "bigint":
        return "0";
      case "jsonb":
        return "'{}'";
      case "uuid":
        return "''";
      default:
        return super.getDefaultValue(type);
    }
  }
  /**
   * Alters table schema to add columns if they don't exist
   * @param tableName Name of the table
   * @param schema Schema of the table
   * @param ifNotExists Array of column names to add if they don't exist
   */
  async alterTable({
    tableName,
    schema,
    ifNotExists
  }) {
    const table = await this.lanceClient.openTable(tableName);
    const currentSchema = await table.schema();
    const existingFields = new Set(currentSchema.fields.map((f) => f.name));
    const typeMap = {
      text: "string",
      integer: "int",
      bigint: "bigint",
      timestamp: "timestamp",
      jsonb: "string",
      uuid: "string"
    };
    const columnsToAdd = ifNotExists.filter((col) => schema[col] && !existingFields.has(col)).map((col) => {
      const colDef = schema[col];
      return {
        name: col,
        valueSql: colDef?.nullable ? `cast(NULL as ${typeMap[colDef.type ?? "text"]})` : `cast(${this.getDefaultValue(colDef?.type ?? "text")} as ${typeMap[colDef?.type ?? "text"]})`
      };
    });
    if (columnsToAdd.length > 0) {
      await table.addColumns(columnsToAdd);
      this.logger?.info?.(`Added columns [${columnsToAdd.map((c) => c.name).join(", ")}] to table ${tableName}`);
    }
  }
  async clearTable({ tableName }) {
    const table = await this.lanceClient.openTable(tableName);
    await table.delete("1=1");
  }
  /**
   * Insert a single record into a table. This function overwrites the existing record if it exists. Use this function for inserting records into tables with custom schemas.
   * @param tableName The name of the table to insert into.
   * @param record The record to insert.
   */
  async insert({ tableName, record }) {
    try {
      const table = await this.lanceClient.openTable(tableName);
      const processedRecord = { ...record };
      for (const key in processedRecord) {
        if (processedRecord[key] !== null && typeof processedRecord[key] === "object" && !(processedRecord[key] instanceof Date)) {
          this.logger.debug("Converting object to JSON string: ", processedRecord[key]);
          processedRecord[key] = JSON.stringify(processedRecord[key]);
        }
      }
      await table.add([processedRecord], { mode: "overwrite" });
    } catch (error) {
      throw new Error(`Failed to insert record: ${error}`);
    }
  }
  /**
   * Insert multiple records into a table. This function overwrites the existing records if they exist. Use this function for inserting records into tables with custom schemas.
   * @param tableName The name of the table to insert into.
   * @param records The records to insert.
   */
  async batchInsert({ tableName, records }) {
    try {
      const table = await this.lanceClient.openTable(tableName);
      const processedRecords = records.map((record) => {
        const processedRecord = { ...record };
        for (const key in processedRecord) {
          if (processedRecord[key] == null) continue;
          if (processedRecord[key] !== null && typeof processedRecord[key] === "object" && !(processedRecord[key] instanceof Date)) {
            processedRecord[key] = JSON.stringify(processedRecord[key]);
          }
        }
        return processedRecord;
      });
      await table.add(processedRecords, { mode: "overwrite" });
    } catch (error) {
      throw new Error(`Failed to batch insert records: ${error}`);
    }
  }
  /**
   * Load a record from the database by its key(s)
   * @param tableName The name of the table to query
   * @param keys Record of key-value pairs to use for lookup
   * @throws Error if invalid types are provided for keys
   * @returns The loaded record with proper type conversions, or null if not found
   */
  async load({ tableName, keys }) {
    try {
      const table = await this.lanceClient.openTable(tableName);
      const tableSchema = await this.getTableSchema(tableName);
      const query = table.query();
      if (Object.keys(keys).length > 0) {
        this.validateKeyTypes(keys, tableSchema);
        const filterConditions = Object.entries(keys).map(([key, value]) => {
          const isCamelCase = /^[a-z][a-zA-Z]*$/.test(key) && /[A-Z]/.test(key);
          const quotedKey = isCamelCase ? `\`${key}\`` : key;
          if (typeof value === "string") {
            return `${quotedKey} = '${value}'`;
          } else if (value === null) {
            return `${quotedKey} IS NULL`;
          } else {
            return `${quotedKey} = ${value}`;
          }
        }).join(" AND ");
        this.logger.debug("where clause generated: " + filterConditions);
        query.where(filterConditions);
      }
      const result = await query.limit(1).toArray();
      if (result.length === 0) {
        this.logger.debug("No record found");
        return null;
      }
      return this.processResultWithTypeConversion(result[0], tableSchema);
    } catch (error) {
      throw new Error(`Failed to load record: ${error}`);
    }
  }
  /**
   * Validates that key types match the schema definition
   * @param keys The keys to validate
   * @param tableSchema The table schema to validate against
   * @throws Error if a key has an incompatible type
   */
  validateKeyTypes(keys, tableSchema) {
    const fieldTypes = new Map(
      tableSchema.fields.map((field) => [field.name, field.type?.toString().toLowerCase()])
    );
    for (const [key, value] of Object.entries(keys)) {
      const fieldType = fieldTypes.get(key);
      if (!fieldType) {
        throw new Error(`Field '${key}' does not exist in table schema`);
      }
      if (value !== null) {
        if ((fieldType.includes("int") || fieldType.includes("bigint")) && typeof value !== "number") {
          throw new Error(`Expected numeric value for field '${key}', got ${typeof value}`);
        }
        if (fieldType.includes("utf8") && typeof value !== "string") {
          throw new Error(`Expected string value for field '${key}', got ${typeof value}`);
        }
        if (fieldType.includes("timestamp") && !(value instanceof Date) && typeof value !== "string") {
          throw new Error(`Expected Date or string value for field '${key}', got ${typeof value}`);
        }
      }
    }
  }
  /**
   * Process a database result with appropriate type conversions based on the table schema
   * @param rawResult The raw result object from the database
   * @param tableSchema The schema of the table containing type information
   * @returns Processed result with correct data types
   */
  processResultWithTypeConversion(rawResult, tableSchema) {
    const fieldTypeMap = /* @__PURE__ */ new Map();
    tableSchema.fields.forEach((field) => {
      const fieldName = field.name;
      const fieldTypeStr = field.type.toString().toLowerCase();
      fieldTypeMap.set(fieldName, fieldTypeStr);
    });
    if (Array.isArray(rawResult)) {
      return rawResult.map((item) => this.processResultWithTypeConversion(item, tableSchema));
    }
    const processedResult = { ...rawResult };
    for (const key in processedResult) {
      const fieldTypeStr = fieldTypeMap.get(key);
      if (!fieldTypeStr) continue;
      if (typeof processedResult[key] === "string") {
        if (fieldTypeStr.includes("int32") || fieldTypeStr.includes("float32")) {
          if (!isNaN(Number(processedResult[key]))) {
            processedResult[key] = Number(processedResult[key]);
          }
        } else if (fieldTypeStr.includes("int64")) {
          processedResult[key] = Number(processedResult[key]);
        } else if (fieldTypeStr.includes("utf8")) {
          try {
            processedResult[key] = JSON.parse(processedResult[key]);
          } catch (e) {
            this.logger.debug(`Failed to parse JSON for key ${key}: ${e}`);
          }
        }
      } else if (typeof processedResult[key] === "bigint") {
        processedResult[key] = Number(processedResult[key]);
      }
    }
    return processedResult;
  }
  getThreadById({ threadId }) {
    try {
      return this.load({ tableName: storage.TABLE_THREADS, keys: { id: threadId } });
    } catch (error) {
      throw new Error(`Failed to get thread by ID: ${error}`);
    }
  }
  async getThreadsByResourceId({ resourceId }) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_THREADS);
      const query = table.query().where(`\`resourceId\` = '${resourceId}'`);
      const records = await query.toArray();
      return this.processResultWithTypeConversion(
        records,
        await this.getTableSchema(storage.TABLE_THREADS)
      );
    } catch (error) {
      throw new Error(`Failed to get threads by resource ID: ${error}`);
    }
  }
  /**
   * Saves a thread to the database. This function doesn't overwrite existing threads.
   * @param thread - The thread to save
   * @returns The saved thread
   */
  async saveThread({ thread }) {
    try {
      const record = { ...thread, metadata: JSON.stringify(thread.metadata) };
      const table = await this.lanceClient.openTable(storage.TABLE_THREADS);
      await table.add([record], { mode: "append" });
      return thread;
    } catch (error) {
      throw new Error(`Failed to save thread: ${error}`);
    }
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    try {
      const record = { id, title, metadata: JSON.stringify(metadata) };
      const table = await this.lanceClient.openTable(storage.TABLE_THREADS);
      await table.add([record], { mode: "overwrite" });
      const query = table.query().where(`id = '${id}'`);
      const records = await query.toArray();
      return this.processResultWithTypeConversion(
        records[0],
        await this.getTableSchema(storage.TABLE_THREADS)
      );
    } catch (error) {
      throw new Error(`Failed to update thread: ${error}`);
    }
  }
  async deleteThread({ threadId }) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_THREADS);
      await table.delete(`id = '${threadId}'`);
    } catch (error) {
      throw new Error(`Failed to delete thread: ${error}`);
    }
  }
  /**
   * Processes messages to include context messages based on withPreviousMessages and withNextMessages
   * @param records - The sorted array of records to process
   * @param include - The array of include specifications with context parameters
   * @returns The processed array with context messages included
   */
  processMessagesWithContext(records, include) {
    const messagesWithContext = include.filter((item) => item.withPreviousMessages || item.withNextMessages);
    if (messagesWithContext.length === 0) {
      return records;
    }
    const messageIndexMap = /* @__PURE__ */ new Map();
    records.forEach((message, index) => {
      messageIndexMap.set(message.id, index);
    });
    const additionalIndices = /* @__PURE__ */ new Set();
    for (const item of messagesWithContext) {
      const messageIndex = messageIndexMap.get(item.id);
      if (messageIndex !== void 0) {
        if (item.withPreviousMessages) {
          const startIdx = Math.max(0, messageIndex - item.withPreviousMessages);
          for (let i = startIdx; i < messageIndex; i++) {
            additionalIndices.add(i);
          }
        }
        if (item.withNextMessages) {
          const endIdx = Math.min(records.length - 1, messageIndex + item.withNextMessages);
          for (let i = messageIndex + 1; i <= endIdx; i++) {
            additionalIndices.add(i);
          }
        }
      }
    }
    if (additionalIndices.size === 0) {
      return records;
    }
    const originalMatchIds = new Set(include.map((item) => item.id));
    const allIndices = /* @__PURE__ */ new Set();
    records.forEach((record, index) => {
      if (originalMatchIds.has(record.id)) {
        allIndices.add(index);
      }
    });
    additionalIndices.forEach((index) => {
      allIndices.add(index);
    });
    return Array.from(allIndices).sort((a, b) => a - b).map((index) => records[index]);
  }
  async getMessages({
    threadId,
    resourceId,
    selectBy,
    format,
    threadConfig
  }) {
    try {
      if (threadConfig) {
        throw new Error("ThreadConfig is not supported by LanceDB storage");
      }
      const table = await this.lanceClient.openTable(storage.TABLE_MESSAGES);
      let query = table.query().where(`\`threadId\` = '${threadId}'`);
      if (selectBy) {
        if (selectBy.include && selectBy.include.length > 0) {
          const includeIds = selectBy.include.map((item) => item.id);
          const includeClause = includeIds.map((id) => `\`id\` = '${id}'`).join(" OR ");
          query = query.where(`(\`threadId\` = '${threadId}' OR (${includeClause}))`);
        }
      }
      let records = await query.toArray();
      records.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
      if (selectBy?.include && selectBy.include.length > 0) {
        records = this.processMessagesWithContext(records, selectBy.include);
      }
      if (selectBy?.last !== void 0 && selectBy.last !== false) {
        records = records.slice(-selectBy.last);
      }
      const messages = this.processResultWithTypeConversion(records, await this.getTableSchema(storage.TABLE_MESSAGES));
      const normalized = messages.map((msg) => ({
        ...msg,
        content: typeof msg.content === "string" ? (() => {
          try {
            return JSON.parse(msg.content);
          } catch {
            return msg.content;
          }
        })() : msg.content
      }));
      const list = new agent.MessageList({ threadId, resourceId }).add(normalized, "memory");
      if (format === "v2") return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      throw new Error(`Failed to get messages: ${error}`);
    }
  }
  async saveMessages(args) {
    try {
      const { messages, format = "v1" } = args;
      if (messages.length === 0) {
        return [];
      }
      const threadId = messages[0]?.threadId;
      if (!threadId) {
        throw new Error("Thread ID is required");
      }
      const transformedMessages = messages.map((message) => ({
        ...message,
        content: JSON.stringify(message.content)
      }));
      const table = await this.lanceClient.openTable(storage.TABLE_MESSAGES);
      await table.add(transformedMessages, { mode: "overwrite" });
      const list = new agent.MessageList().add(messages, "memory");
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      throw new Error(`Failed to save messages: ${error}`);
    }
  }
  async saveTrace({ trace }) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_TRACES);
      const record = {
        ...trace,
        attributes: JSON.stringify(trace.attributes),
        status: JSON.stringify(trace.status),
        events: JSON.stringify(trace.events),
        links: JSON.stringify(trace.links),
        other: JSON.stringify(trace.other)
      };
      await table.add([record], { mode: "append" });
      return trace;
    } catch (error) {
      throw new Error(`Failed to save trace: ${error}`);
    }
  }
  async getTraceById({ traceId }) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_TRACES);
      const query = table.query().where(`id = '${traceId}'`);
      const records = await query.toArray();
      return this.processResultWithTypeConversion(records[0], await this.getTableSchema(storage.TABLE_TRACES));
    } catch (error) {
      throw new Error(`Failed to get trace by ID: ${error}`);
    }
  }
  async getTraces({
    name,
    scope,
    page = 1,
    perPage = 10,
    attributes
  }) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_TRACES);
      const query = table.query();
      if (name) {
        query.where(`name = '${name}'`);
      }
      if (scope) {
        query.where(`scope = '${scope}'`);
      }
      if (attributes) {
        query.where(`attributes = '${JSON.stringify(attributes)}'`);
      }
      const offset = (page - 1) * perPage;
      query.limit(perPage);
      if (offset > 0) {
        query.offset(offset);
      }
      const records = await query.toArray();
      return records.map((record) => {
        return {
          ...record,
          attributes: JSON.parse(record.attributes),
          status: JSON.parse(record.status),
          events: JSON.parse(record.events),
          links: JSON.parse(record.links),
          other: JSON.parse(record.other),
          startTime: new Date(record.startTime),
          endTime: new Date(record.endTime),
          createdAt: new Date(record.createdAt)
        };
      });
    } catch (error) {
      throw new Error(`Failed to get traces: ${error}`);
    }
  }
  async saveEvals({ evals }) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_EVALS);
      const transformedEvals = evals.map((evalRecord) => ({
        input: evalRecord.input,
        output: evalRecord.output,
        agent_name: evalRecord.agentName,
        metric_name: evalRecord.metricName,
        result: JSON.stringify(evalRecord.result),
        instructions: evalRecord.instructions,
        test_info: JSON.stringify(evalRecord.testInfo),
        global_run_id: evalRecord.globalRunId,
        run_id: evalRecord.runId,
        created_at: new Date(evalRecord.createdAt).getTime()
      }));
      await table.add(transformedEvals, { mode: "append" });
      return evals;
    } catch (error) {
      throw new Error(`Failed to save evals: ${error}`);
    }
  }
  async getEvalsByAgentName(agentName, type) {
    try {
      if (type) {
        this.logger.warn("Type is not implemented yet in LanceDB storage");
      }
      const table = await this.lanceClient.openTable(storage.TABLE_EVALS);
      const query = table.query().where(`agent_name = '${agentName}'`);
      const records = await query.toArray();
      return records.map((record) => {
        return {
          id: record.id,
          input: record.input,
          output: record.output,
          agentName: record.agent_name,
          metricName: record.metric_name,
          result: JSON.parse(record.result),
          instructions: record.instructions,
          testInfo: JSON.parse(record.test_info),
          globalRunId: record.global_run_id,
          runId: record.run_id,
          createdAt: new Date(record.created_at).toString()
        };
      });
    } catch (error) {
      throw new Error(`Failed to get evals by agent name: ${error}`);
    }
  }
  parseWorkflowRun(row) {
    let parsedSnapshot = row.snapshot;
    if (typeof parsedSnapshot === "string") {
      try {
        parsedSnapshot = JSON.parse(row.snapshot);
      } catch (e) {
        console.warn(`Failed to parse snapshot for workflow ${row.workflow_name}: ${e}`);
      }
    }
    return {
      workflowName: row.workflow_name,
      runId: row.run_id,
      snapshot: parsedSnapshot,
      createdAt: this.ensureDate(row.createdAt),
      updatedAt: this.ensureDate(row.updatedAt),
      resourceId: row.resourceId
    };
  }
  async getWorkflowRuns(args) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_WORKFLOW_SNAPSHOT);
      const query = table.query();
      if (args?.workflowName) {
        query.where(`workflow_name = '${args.workflowName}'`);
      }
      if (args?.fromDate) {
        query.where(`\`createdAt\` >= ${args.fromDate.getTime()}`);
      }
      if (args?.toDate) {
        query.where(`\`createdAt\` <= ${args.toDate.getTime()}`);
      }
      if (args?.limit) {
        query.limit(args.limit);
      }
      if (args?.offset) {
        query.offset(args.offset);
      }
      const records = await query.toArray();
      return {
        runs: records.map((record) => this.parseWorkflowRun(record)),
        total: records.length
      };
    } catch (error) {
      throw new Error(`Failed to get workflow runs: ${error}`);
    }
  }
  /**
   * Retrieve a single workflow run by its runId.
   * @param args The ID of the workflow run to retrieve
   * @returns The workflow run object or null if not found
   */
  async getWorkflowRunById(args) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_WORKFLOW_SNAPSHOT);
      let whereClause = `run_id = '${args.runId}'`;
      if (args.workflowName) {
        whereClause += ` AND workflow_name = '${args.workflowName}'`;
      }
      const query = table.query().where(whereClause);
      const records = await query.toArray();
      if (records.length === 0) return null;
      const record = records[0];
      return this.parseWorkflowRun(record);
    } catch (error) {
      throw new Error(`Failed to get workflow run by id: ${error}`);
    }
  }
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_WORKFLOW_SNAPSHOT);
      const query = table.query().where(`workflow_name = '${workflowName}' AND run_id = '${runId}'`);
      const records = await query.toArray();
      let createdAt;
      const now = Date.now();
      let mode = "append";
      if (records.length > 0) {
        createdAt = records[0].createdAt ?? now;
        mode = "overwrite";
      } else {
        createdAt = now;
      }
      const record = {
        workflow_name: workflowName,
        run_id: runId,
        snapshot: JSON.stringify(snapshot),
        createdAt,
        updatedAt: now
      };
      await table.add([record], { mode });
    } catch (error) {
      throw new Error(`Failed to persist workflow snapshot: ${error}`);
    }
  }
  async loadWorkflowSnapshot({
    workflowName,
    runId
  }) {
    try {
      const table = await this.lanceClient.openTable(storage.TABLE_WORKFLOW_SNAPSHOT);
      const query = table.query().where(`workflow_name = '${workflowName}' AND run_id = '${runId}'`);
      const records = await query.toArray();
      return records.length > 0 ? JSON.parse(records[0].snapshot) : null;
    } catch (error) {
      throw new Error(`Failed to load workflow snapshot: ${error}`);
    }
  }
  async getTracesPaginated(_args) {
    throw new Error("Method not implemented.");
  }
  async getThreadsByResourceIdPaginated(_args) {
    throw new Error("Method not implemented.");
  }
  async getMessagesPaginated(_args) {
    throw new Error("Method not implemented.");
  }
  async updateMessages(_args) {
    this.logger.error("updateMessages is not yet implemented in LanceStore");
    throw new Error("Method not implemented");
  }
};
var LanceFilterTranslator = class extends filter.BaseFilterTranslator {
  translate(filter) {
    if (!filter || Object.keys(filter).length === 0) {
      return "";
    }
    if (typeof filter === "object" && filter !== null) {
      const keys = Object.keys(filter);
      for (const key of keys) {
        if (key.includes(".") && !this.isNormalNestedField(key)) {
          throw new Error(`Field names containing periods (.) are not supported: ${key}`);
        }
      }
    }
    return this.processFilter(filter);
  }
  processFilter(filter$1, parentPath = "") {
    if (filter$1 === null) {
      return `${parentPath} IS NULL`;
    }
    if (filter$1 instanceof Date) {
      return `${parentPath} = ${this.formatValue(filter$1)}`;
    }
    if (typeof filter$1 === "object" && filter$1 !== null) {
      const obj = filter$1;
      const keys = Object.keys(obj);
      if (keys.length === 1 && this.isOperator(keys[0])) {
        const operator = keys[0];
        const operatorValue = obj[operator];
        if (this.isLogicalOperator(operator)) {
          if (operator === "$and" || operator === "$or") {
            return this.processLogicalOperator(operator, operatorValue);
          }
          throw new Error(filter.BaseFilterTranslator.ErrorMessages.UNSUPPORTED_OPERATOR(operator));
        }
        throw new Error(filter.BaseFilterTranslator.ErrorMessages.INVALID_TOP_LEVEL_OPERATOR(operator));
      }
      for (const key of keys) {
        if (key.includes(".") && !this.isNormalNestedField(key)) {
          throw new Error(`Field names containing periods (.) are not supported: ${key}`);
        }
      }
      if (keys.length > 1) {
        const conditions = keys.map((key) => {
          const value = obj[key];
          if (this.isNestedObject(value) && !this.isDateObject(value)) {
            return this.processNestedObject(key, value);
          } else {
            return this.processField(key, value);
          }
        });
        return conditions.join(" AND ");
      }
      if (keys.length === 1) {
        const key = keys[0];
        const value = obj[key];
        if (this.isNestedObject(value) && !this.isDateObject(value)) {
          return this.processNestedObject(key, value);
        } else {
          return this.processField(key, value);
        }
      }
    }
    return "";
  }
  processLogicalOperator(operator, conditions) {
    if (!Array.isArray(conditions)) {
      throw new Error(`Logical operator ${operator} must have an array value`);
    }
    if (conditions.length === 0) {
      return operator === "$and" ? "true" : "false";
    }
    const sqlOperator = operator === "$and" ? "AND" : "OR";
    const processedConditions = conditions.map((condition) => {
      if (typeof condition !== "object" || condition === null) {
        throw new Error(filter.BaseFilterTranslator.ErrorMessages.INVALID_LOGICAL_OPERATOR_CONTENT(operator));
      }
      const condObj = condition;
      const keys = Object.keys(condObj);
      if (keys.length === 1 && this.isOperator(keys[0])) {
        if (this.isLogicalOperator(keys[0])) {
          return `(${this.processLogicalOperator(keys[0], condObj[keys[0]])})`;
        } else {
          throw new Error(filter.BaseFilterTranslator.ErrorMessages.UNSUPPORTED_OPERATOR(keys[0]));
        }
      }
      if (keys.length > 1) {
        return `(${this.processFilter(condition)})`;
      }
      return this.processFilter(condition);
    });
    return processedConditions.join(` ${sqlOperator} `);
  }
  processNestedObject(path, value) {
    if (typeof value !== "object" || value === null) {
      throw new Error(`Expected object for nested path ${path}`);
    }
    const obj = value;
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return `${path} = {}`;
    }
    if (keys.every((k) => this.isOperator(k))) {
      return this.processOperators(path, obj);
    }
    const conditions = keys.map((key) => {
      const nestedPath = key.includes(".") ? `${path}.${key}` : `${path}.${key}`;
      if (this.isNestedObject(obj[key]) && !this.isDateObject(obj[key])) {
        return this.processNestedObject(nestedPath, obj[key]);
      } else {
        return this.processField(nestedPath, obj[key]);
      }
    });
    return conditions.join(" AND ");
  }
  processField(field, value) {
    if (field.includes(".") && !this.isNormalNestedField(field)) {
      throw new Error(`Field names containing periods (.) are not supported: ${field}`);
    }
    const escapedField = this.escapeFieldName(field);
    if (value === null) {
      return `${escapedField} IS NULL`;
    }
    if (value instanceof Date) {
      return `${escapedField} = ${this.formatValue(value)}`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "false";
      }
      const normalizedValues = this.normalizeArrayValues(value);
      return `${escapedField} IN (${this.formatArrayValues(normalizedValues)})`;
    }
    if (this.isOperatorObject(value)) {
      return this.processOperators(field, value);
    }
    return `${escapedField} = ${this.formatValue(this.normalizeComparisonValue(value))}`;
  }
  processOperators(field, operators) {
    const escapedField = this.escapeFieldName(field);
    const operatorKeys = Object.keys(operators);
    if (operatorKeys.some((op) => this.isLogicalOperator(op))) {
      const logicalOp = operatorKeys.find((op) => this.isLogicalOperator(op)) || "";
      throw new Error(`Unsupported operator: ${logicalOp} cannot be used at field level`);
    }
    return operatorKeys.map((op) => {
      const value = operators[op];
      if (!this.isFieldOperator(op) && !this.isCustomOperator(op)) {
        throw new Error(filter.BaseFilterTranslator.ErrorMessages.UNSUPPORTED_OPERATOR(op));
      }
      switch (op) {
        case "$eq":
          if (value === null) {
            return `${escapedField} IS NULL`;
          }
          return `${escapedField} = ${this.formatValue(this.normalizeComparisonValue(value))}`;
        case "$ne":
          if (value === null) {
            return `${escapedField} IS NOT NULL`;
          }
          return `${escapedField} != ${this.formatValue(this.normalizeComparisonValue(value))}`;
        case "$gt":
          return `${escapedField} > ${this.formatValue(this.normalizeComparisonValue(value))}`;
        case "$gte":
          return `${escapedField} >= ${this.formatValue(this.normalizeComparisonValue(value))}`;
        case "$lt":
          return `${escapedField} < ${this.formatValue(this.normalizeComparisonValue(value))}`;
        case "$lte":
          return `${escapedField} <= ${this.formatValue(this.normalizeComparisonValue(value))}`;
        case "$in":
          if (!Array.isArray(value)) {
            throw new Error(`$in operator requires array value for field: ${field}`);
          }
          if (value.length === 0) {
            return "false";
          }
          const normalizedValues = this.normalizeArrayValues(value);
          return `${escapedField} IN (${this.formatArrayValues(normalizedValues)})`;
        case "$like":
          return `${escapedField} LIKE ${this.formatValue(value)}`;
        case "$notLike":
          return `${escapedField} NOT LIKE ${this.formatValue(value)}`;
        case "$regex":
          return `regexp_match(${escapedField}, ${this.formatValue(value)})`;
        default:
          throw new Error(filter.BaseFilterTranslator.ErrorMessages.UNSUPPORTED_OPERATOR(op));
      }
    }).join(" AND ");
  }
  formatValue(value) {
    if (value === null) {
      return "NULL";
    }
    if (typeof value === "string") {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === "number") {
      return value.toString();
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (value instanceof Date) {
      return `timestamp '${value.toISOString()}'`;
    }
    if (typeof value === "object") {
      if (value instanceof Date) {
        return `timestamp '${value.toISOString()}'`;
      }
      return JSON.stringify(value);
    }
    return String(value);
  }
  formatArrayValues(array) {
    return array.map((item) => this.formatValue(item)).join(", ");
  }
  normalizeArrayValues(array) {
    return array.map((item) => {
      if (item instanceof Date) {
        return item;
      }
      return this.normalizeComparisonValue(item);
    });
  }
  normalizeComparisonValue(value) {
    if (value instanceof Date) {
      return value;
    }
    return super.normalizeComparisonValue(value);
  }
  isOperatorObject(value) {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const obj = value;
    const keys = Object.keys(obj);
    return keys.length > 0 && keys.some((key) => this.isOperator(key));
  }
  isNestedObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  isNormalNestedField(field) {
    const parts = field.split(".");
    return !field.startsWith(".") && !field.endsWith(".") && parts.every((part) => part.trim().length > 0);
  }
  escapeFieldName(field) {
    if (field.includes(" ") || field.includes("-") || /^[A-Z]+$/.test(field) || this.isSqlKeyword(field)) {
      if (field.includes(".")) {
        return field.split(".").map((part) => `\`${part}\``).join(".");
      }
      return `\`${field}\``;
    }
    return field;
  }
  isSqlKeyword(str) {
    const sqlKeywords = [
      "SELECT",
      "FROM",
      "WHERE",
      "AND",
      "OR",
      "NOT",
      "INSERT",
      "UPDATE",
      "DELETE",
      "CREATE",
      "ALTER",
      "DROP",
      "TABLE",
      "VIEW",
      "INDEX",
      "JOIN",
      "INNER",
      "OUTER",
      "LEFT",
      "RIGHT",
      "FULL",
      "UNION",
      "ALL",
      "DISTINCT",
      "AS",
      "ON",
      "BETWEEN",
      "LIKE",
      "IN",
      "IS",
      "NULL",
      "TRUE",
      "FALSE",
      "ASC",
      "DESC",
      "GROUP",
      "ORDER",
      "BY",
      "HAVING",
      "LIMIT",
      "OFFSET",
      "CASE",
      "WHEN",
      "THEN",
      "ELSE",
      "END",
      "CAST",
      "CUBE"
    ];
    return sqlKeywords.includes(str.toUpperCase());
  }
  isDateObject(value) {
    return value instanceof Date;
  }
  /**
   * Override getSupportedOperators to add custom operators for LanceDB
   */
  getSupportedOperators() {
    return {
      ...filter.BaseFilterTranslator.DEFAULT_OPERATORS,
      custom: ["$like", "$notLike", "$regex"]
    };
  }
};

// src/vector/index.ts
var LanceVectorStore = class _LanceVectorStore extends vector.MastraVector {
  lanceClient;
  /**
   * Creates a new instance of LanceVectorStore
   * @param uri The URI to connect to LanceDB
   * @param options connection options
   *
   * Usage:
   *
   * Connect to a local database
   * ```ts
   * const store = await LanceVectorStore.create('/path/to/db');
   * ```
   *
   * Connect to a LanceDB cloud database
   * ```ts
   * const store = await LanceVectorStore.create('db://host:port');
   * ```
   *
   * Connect to a cloud database
   * ```ts
   * const store = await LanceVectorStore.create('s3://bucket/db', { storageOptions: { timeout: '60s' } });
   * ```
   */
  static async create(uri, options) {
    const instance = new _LanceVectorStore();
    try {
      instance.lanceClient = await lancedb.connect(uri, options);
      return instance;
    } catch (e) {
      throw new Error(`Failed to connect to LanceDB: ${e}`);
    }
  }
  /**
   * @internal
   * Private constructor to enforce using the create factory method
   */
  constructor() {
    super();
  }
  close() {
    if (this.lanceClient) {
      this.lanceClient.close();
    }
  }
  async query({
    tableName,
    queryVector,
    filter,
    includeVector = false,
    topK = 10,
    columns = [],
    includeAllColumns = false
  }) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    if (!tableName) {
      throw new Error("tableName is required");
    }
    if (!queryVector) {
      throw new Error("queryVector is required");
    }
    try {
      const table = await this.lanceClient.openTable(tableName);
      const selectColumns = [...columns];
      if (!selectColumns.includes("id")) {
        selectColumns.push("id");
      }
      let query = table.search(queryVector);
      if (filter && Object.keys(filter).length > 0) {
        const whereClause = this.filterTranslator(filter);
        this.logger.debug(`Where clause generated: ${whereClause}`);
        query = query.where(whereClause);
      }
      if (!includeAllColumns && selectColumns.length > 0) {
        query = query.select(selectColumns);
      }
      query = query.limit(topK);
      const results = await query.toArray();
      return results.map((result) => {
        const flatMetadata = {};
        Object.keys(result).forEach((key) => {
          if (key !== "id" && key !== "score" && key !== "vector" && key !== "_distance") {
            if (key.startsWith("metadata_")) {
              const metadataKey = key.substring("metadata_".length);
              flatMetadata[metadataKey] = result[key];
            }
          }
        });
        const metadata = this.unflattenObject(flatMetadata);
        return {
          id: String(result.id || ""),
          metadata,
          vector: includeVector && result.vector ? Array.isArray(result.vector) ? result.vector : Array.from(result.vector) : void 0,
          document: result.document,
          score: result._distance
        };
      });
    } catch (error) {
      throw new Error(`Failed to query vectors: ${error.message}`);
    }
  }
  filterTranslator(filter) {
    const processFilterKeys = (filterObj) => {
      const result = {};
      Object.entries(filterObj).forEach(([key, value]) => {
        if (key === "$or" || key === "$and" || key === "$not" || key === "$in") {
          if (Array.isArray(value)) {
            result[key] = value.map(
              (item) => typeof item === "object" && item !== null ? processFilterKeys(item) : item
            );
          } else {
            result[key] = value;
          }
        } else if (key.startsWith("metadata_")) {
          result[key] = value;
        } else {
          if (key.includes(".")) {
            const convertedKey = `metadata_${key.replace(/\./g, "_")}`;
            result[convertedKey] = value;
          } else {
            result[`metadata_${key}`] = value;
          }
        }
      });
      return result;
    };
    const prefixedFilter = filter && typeof filter === "object" ? processFilterKeys(filter) : {};
    const translator = new LanceFilterTranslator();
    return translator.translate(prefixedFilter);
  }
  async upsert({ tableName, vectors, metadata = [], ids = [] }) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    if (!tableName) {
      throw new Error("tableName is required");
    }
    if (!vectors || !Array.isArray(vectors) || vectors.length === 0) {
      throw new Error("vectors array is required and must not be empty");
    }
    try {
      const tables = await this.lanceClient.tableNames();
      if (!tables.includes(tableName)) {
        throw new Error(`Table ${tableName} does not exist`);
      }
      const table = await this.lanceClient.openTable(tableName);
      const vectorIds = ids.length === vectors.length ? ids : vectors.map((_, i) => ids[i] || crypto.randomUUID());
      const data = vectors.map((vector, i) => {
        const id = String(vectorIds[i]);
        const metadataItem = metadata[i] || {};
        const rowData = {
          id,
          vector
        };
        if (Object.keys(metadataItem).length > 0) {
          const flattenedMetadata = this.flattenObject(metadataItem, "metadata");
          Object.entries(flattenedMetadata).forEach(([key, value]) => {
            rowData[key] = value;
          });
        }
        return rowData;
      });
      await table.add(data, { mode: "overwrite" });
      return vectorIds;
    } catch (error) {
      throw new Error(`Failed to upsert vectors: ${error.message}`);
    }
  }
  /**
   * Flattens a nested object, creating new keys with underscores for nested properties.
   * Example: { metadata: { text: 'test' } } → { metadata_text: 'test' }
   */
  flattenObject(obj, prefix = "") {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}_` : "";
      if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, this.flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  }
  async createTable(tableName, data, options) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    try {
      if (Array.isArray(data)) {
        data = data.map((record) => this.flattenObject(record));
      }
      return await this.lanceClient.createTable(tableName, data, options);
    } catch (error) {
      throw new Error(`Failed to create table: ${error.message}`);
    }
  }
  async listTables() {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    return await this.lanceClient.tableNames();
  }
  async getTableSchema(tableName) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    const table = await this.lanceClient.openTable(tableName);
    return await table.schema();
  }
  /**
   * indexName is actually a column name in a table in lanceDB
   */
  async createIndex({
    tableName,
    indexName,
    dimension,
    metric = "cosine",
    indexConfig = {}
  }) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    try {
      if (!tableName) {
        throw new Error("tableName is required");
      }
      if (!indexName) {
        throw new Error("indexName is required");
      }
      if (typeof dimension !== "number" || dimension <= 0) {
        throw new Error("dimension must be a positive number");
      }
      const tables = await this.lanceClient.tableNames();
      if (!tables.includes(tableName)) {
        throw new Error(
          `Table ${tableName} does not exist. Please create the table first by calling createTable() method.`
        );
      }
      const table = await this.lanceClient.openTable(tableName);
      let metricType;
      if (metric === "euclidean") {
        metricType = "l2";
      } else if (metric === "dotproduct") {
        metricType = "dot";
      } else if (metric === "cosine") {
        metricType = "cosine";
      }
      if (indexConfig.type === "ivfflat") {
        await table.createIndex(indexName, {
          config: lancedb.Index.ivfPq({
            numPartitions: indexConfig.numPartitions || 128,
            numSubVectors: indexConfig.numSubVectors || 16,
            distanceType: metricType
          })
        });
      } else {
        this.logger.debug("Creating HNSW PQ index with config:", indexConfig);
        await table.createIndex(indexName, {
          config: lancedb.Index.hnswPq({
            m: indexConfig?.hnsw?.m || 16,
            efConstruction: indexConfig?.hnsw?.efConstruction || 100,
            distanceType: metricType
          })
        });
      }
    } catch (error) {
      throw new Error(`Failed to create index: ${error.message}`);
    }
  }
  async listIndexes() {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    try {
      const tables = await this.lanceClient.tableNames();
      const allIndices = [];
      for (const tableName of tables) {
        const table = await this.lanceClient.openTable(tableName);
        const tableIndices = await table.listIndices();
        allIndices.push(...tableIndices.map((index) => index.name));
      }
      return allIndices;
    } catch (error) {
      throw new Error(`Failed to list indexes: ${error.message}`);
    }
  }
  async describeIndex({ indexName }) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    if (!indexName) {
      throw new Error("indexName is required");
    }
    try {
      const tables = await this.lanceClient.tableNames();
      for (const tableName of tables) {
        this.logger.debug("Checking table:" + tableName);
        const table = await this.lanceClient.openTable(tableName);
        const tableIndices = await table.listIndices();
        const foundIndex = tableIndices.find((index) => index.name === indexName);
        if (foundIndex) {
          const stats = await table.indexStats(foundIndex.name);
          if (!stats) {
            throw new Error(`Index stats not found for index: ${indexName}`);
          }
          const schema = await table.schema();
          const vectorCol = foundIndex.columns[0] || "vector";
          const vectorField = schema.fields.find((field) => field.name === vectorCol);
          const dimension = vectorField?.type?.["listSize"] || 0;
          return {
            dimension,
            metric: stats.distanceType,
            count: stats.numIndexedRows
          };
        }
      }
      throw new Error(`IndexName: ${indexName} not found`);
    } catch (error) {
      throw new Error(`Failed to describe index: ${error.message}`);
    }
  }
  async deleteIndex({ indexName }) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    if (!indexName) {
      throw new Error("indexName is required");
    }
    try {
      const tables = await this.lanceClient.tableNames();
      for (const tableName of tables) {
        const table = await this.lanceClient.openTable(tableName);
        const tableIndices = await table.listIndices();
        const foundIndex = tableIndices.find((index) => index.name === indexName);
        if (foundIndex) {
          await table.dropIndex(indexName);
          return;
        }
      }
      throw new Error(`Index ${indexName} not found`);
    } catch (error) {
      throw new Error(`Failed to delete index: ${error.message}`);
    }
  }
  /**
   * Deletes all tables in the database
   */
  async deleteAllTables() {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    try {
      await this.lanceClient.dropAllTables();
    } catch (error) {
      throw new Error(`Failed to delete tables: ${error.message}`);
    }
  }
  async deleteTable(tableName) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    try {
      await this.lanceClient.dropTable(tableName);
    } catch (error) {
      throw new Error(`Failed to delete tables: ${error.message}`);
    }
  }
  async updateVector({ indexName, id, update }) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    if (!indexName) {
      throw new Error("indexName is required");
    }
    if (!id) {
      throw new Error("id is required");
    }
    try {
      const tables = await this.lanceClient.tableNames();
      for (const tableName of tables) {
        this.logger.debug("Checking table:" + tableName);
        const table = await this.lanceClient.openTable(tableName);
        try {
          const schema = await table.schema();
          const hasColumn = schema.fields.some((field) => field.name === indexName);
          if (hasColumn) {
            this.logger.debug(`Found column ${indexName} in table ${tableName}`);
            const existingRecord = await table.query().where(`id = '${id}'`).select(schema.fields.map((field) => field.name)).limit(1).toArray();
            if (existingRecord.length === 0) {
              throw new Error(`Record with id '${id}' not found in table ${tableName}`);
            }
            const rowData = {
              id
            };
            Object.entries(existingRecord[0]).forEach(([key, value]) => {
              if (key !== "id" && key !== "_distance") {
                if (key === indexName) {
                  if (!update.vector) {
                    if (Array.isArray(value)) {
                      rowData[key] = [...value];
                    } else if (typeof value === "object" && value !== null) {
                      rowData[key] = Array.from(value);
                    } else {
                      rowData[key] = value;
                    }
                  }
                } else {
                  rowData[key] = value;
                }
              }
            });
            if (update.vector) {
              rowData[indexName] = update.vector;
            }
            if (update.metadata) {
              Object.entries(update.metadata).forEach(([key, value]) => {
                rowData[`metadata_${key}`] = value;
              });
            }
            await table.add([rowData], { mode: "overwrite" });
            return;
          }
        } catch (err) {
          this.logger.error(`Error checking schema for table ${tableName}:` + err);
          continue;
        }
      }
      throw new Error(`No table found with column/index '${indexName}'`);
    } catch (error) {
      throw new Error(`Failed to update index: ${error.message}`);
    }
  }
  async deleteVector({ indexName, id }) {
    if (!this.lanceClient) {
      throw new Error("LanceDB client not initialized. Use LanceVectorStore.create() to create an instance");
    }
    if (!indexName) {
      throw new Error("indexName is required");
    }
    if (!id) {
      throw new Error("id is required");
    }
    try {
      const tables = await this.lanceClient.tableNames();
      for (const tableName of tables) {
        this.logger.debug("Checking table:" + tableName);
        const table = await this.lanceClient.openTable(tableName);
        try {
          const schema = await table.schema();
          const hasColumn = schema.fields.some((field) => field.name === indexName);
          if (hasColumn) {
            this.logger.debug(`Found column ${indexName} in table ${tableName}`);
            await table.delete(`id = '${id}'`);
            return;
          }
        } catch (err) {
          this.logger.error(`Error checking schema for table ${tableName}:` + err);
          continue;
        }
      }
      throw new Error(`No table found with column/index '${indexName}'`);
    } catch (error) {
      throw new Error(`Failed to delete index: ${error.message}`);
    }
  }
  /**
   * Converts a flattened object with keys using underscore notation back to a nested object.
   * Example: { name: 'test', details_text: 'test' } → { name: 'test', details: { text: 'test' } }
   */
  unflattenObject(obj) {
    const result = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const parts = key.split("_");
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!part) continue;
        if (!current[part] || typeof current[part] !== "object") {
          current[part] = {};
        }
        current = current[part];
      }
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        current[lastPart] = value;
      }
    });
    return result;
  }
};

exports.LanceStorage = LanceStorage;
exports.LanceVectorStore = LanceVectorStore;
