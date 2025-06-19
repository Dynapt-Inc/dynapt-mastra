import { MessageList } from '@mastra/core/agent';
import { MastraStorage, TABLE_THREADS, TABLE_MESSAGES, TABLE_WORKFLOW_SNAPSHOT, TABLE_TRACES, TABLE_EVALS } from '@mastra/core/storage';
import Cloudflare from 'cloudflare';
import { parseSqlIdentifier } from '@mastra/core/utils';

// src/storage/index.ts
var SqlBuilder = class {
  sql = "";
  params = [];
  whereAdded = false;
  // Basic query building
  select(columns) {
    if (!columns || Array.isArray(columns) && columns.length === 0) {
      this.sql = "SELECT *";
    } else {
      const cols = Array.isArray(columns) ? columns : [columns];
      const parsedCols = cols.map((col) => parseSelectIdentifier(col));
      this.sql = `SELECT ${parsedCols.join(", ")}`;
    }
    return this;
  }
  from(table) {
    const parsedTableName = parseSqlIdentifier(table, "table name");
    this.sql += ` FROM ${parsedTableName}`;
    return this;
  }
  /**
   * Add a WHERE clause to the query
   * @param condition The condition to add
   * @param params Parameters to bind to the condition
   */
  where(condition, ...params) {
    this.sql += ` WHERE ${condition}`;
    this.params.push(...params);
    this.whereAdded = true;
    return this;
  }
  /**
   * Add a WHERE clause if it hasn't been added yet, otherwise add an AND clause
   * @param condition The condition to add
   * @param params Parameters to bind to the condition
   */
  whereAnd(condition, ...params) {
    if (this.whereAdded) {
      return this.andWhere(condition, ...params);
    } else {
      return this.where(condition, ...params);
    }
  }
  andWhere(condition, ...params) {
    this.sql += ` AND ${condition}`;
    this.params.push(...params);
    return this;
  }
  orWhere(condition, ...params) {
    this.sql += ` OR ${condition}`;
    this.params.push(...params);
    return this;
  }
  orderBy(column, direction = "ASC") {
    const parsedColumn = parseSqlIdentifier(column, "column name");
    if (!["ASC", "DESC"].includes(direction)) {
      throw new Error(`Invalid sort direction: ${direction}`);
    }
    this.sql += ` ORDER BY ${parsedColumn} ${direction}`;
    return this;
  }
  limit(count) {
    this.sql += ` LIMIT ?`;
    this.params.push(count);
    return this;
  }
  offset(count) {
    this.sql += ` OFFSET ?`;
    this.params.push(count);
    return this;
  }
  count() {
    this.sql += "SELECT COUNT(*) AS count";
    return this;
  }
  /**
   * Insert a row, or update specific columns on conflict (upsert).
   * @param table Table name
   * @param columns Columns to insert
   * @param values Values to insert
   * @param conflictColumns Columns to check for conflict (usually PK or UNIQUE)
   * @param updateMap Object mapping columns to update to their new value (e.g. { name: 'excluded.name' })
   */
  insert(table, columns, values, conflictColumns, updateMap) {
    const parsedTableName = parseSqlIdentifier(table, "table name");
    const parsedColumns = columns.map((col) => parseSqlIdentifier(col, "column name"));
    const placeholders = parsedColumns.map(() => "?").join(", ");
    if (conflictColumns && updateMap) {
      const parsedConflictColumns = conflictColumns.map((col) => parseSqlIdentifier(col, "column name"));
      const updateClause = Object.entries(updateMap).map(([col, expr]) => `${col} = ${expr}`).join(", ");
      this.sql = `INSERT INTO ${parsedTableName} (${parsedColumns.join(", ")}) VALUES (${placeholders}) ON CONFLICT(${parsedConflictColumns.join(", ")}) DO UPDATE SET ${updateClause}`;
      this.params.push(...values);
      return this;
    }
    this.sql = `INSERT INTO ${parsedTableName} (${parsedColumns.join(", ")}) VALUES (${placeholders})`;
    this.params.push(...values);
    return this;
  }
  // Update operations
  update(table, columns, values) {
    const parsedTableName = parseSqlIdentifier(table, "table name");
    const parsedColumns = columns.map((col) => parseSqlIdentifier(col, "column name"));
    const setClause = parsedColumns.map((col) => `${col} = ?`).join(", ");
    this.sql = `UPDATE ${parsedTableName} SET ${setClause}`;
    this.params.push(...values);
    return this;
  }
  // Delete operations
  delete(table) {
    const parsedTableName = parseSqlIdentifier(table, "table name");
    this.sql = `DELETE FROM ${parsedTableName}`;
    return this;
  }
  /**
   * Create a table if it doesn't exist
   * @param table The table name
   * @param columnDefinitions The column definitions as an array of strings
   * @param tableConstraints Optional constraints for the table
   * @returns The builder instance
   */
  createTable(table, columnDefinitions, tableConstraints) {
    const parsedTableName = parseSqlIdentifier(table, "table name");
    const parsedColumnDefinitions = columnDefinitions.map((def) => {
      const colName = def.split(/\s+/)[0];
      if (!colName) throw new Error("Empty column name in definition");
      parseSqlIdentifier(colName, "column name");
      return def;
    });
    const columns = parsedColumnDefinitions.join(", ");
    const constraints = tableConstraints && tableConstraints.length > 0 ? ", " + tableConstraints.join(", ") : "";
    this.sql = `CREATE TABLE IF NOT EXISTS ${parsedTableName} (${columns}${constraints})`;
    return this;
  }
  /**
   * Check if an index exists in the database
   * @param indexName The name of the index to check
   * @param tableName The table the index is on
   * @returns The builder instance
   */
  checkIndexExists(indexName, tableName) {
    this.sql = `SELECT name FROM sqlite_master WHERE type='index' AND name=? AND tbl_name=?`;
    this.params.push(indexName, tableName);
    return this;
  }
  /**
   * Create an index if it doesn't exist
   * @param indexName The name of the index to create
   * @param tableName The table to create the index on
   * @param columnName The column to index
   * @param indexType Optional index type (e.g., 'UNIQUE')
   * @returns The builder instance
   */
  createIndex(indexName, tableName, columnName, indexType = "") {
    const parsedIndexName = parseSqlIdentifier(indexName, "index name");
    const parsedTableName = parseSqlIdentifier(tableName, "table name");
    const parsedColumnName = parseSqlIdentifier(columnName, "column name");
    this.sql = `CREATE ${indexType ? indexType + " " : ""}INDEX IF NOT EXISTS ${parsedIndexName} ON ${parsedTableName}(${parsedColumnName})`;
    return this;
  }
  /**
   * Add a LIKE condition to the query
   * @param column The column to check
   * @param value The value to match (will be wrapped with % for LIKE)
   * @param exact If true, will not add % wildcards
   */
  like(column, value, exact = false) {
    const parsedColumnName = parseSqlIdentifier(column, "column name");
    const likeValue = exact ? value : `%${value}%`;
    if (this.whereAdded) {
      this.sql += ` AND ${parsedColumnName} LIKE ?`;
    } else {
      this.sql += ` WHERE ${parsedColumnName} LIKE ?`;
      this.whereAdded = true;
    }
    this.params.push(likeValue);
    return this;
  }
  /**
   * Add a JSON LIKE condition for searching in JSON fields
   * @param column The JSON column to search in
   * @param key The JSON key to match
   * @param value The value to match
   */
  jsonLike(column, key, value) {
    const parsedColumnName = parseSqlIdentifier(column, "column name");
    const parsedKey = parseSqlIdentifier(key, "key name");
    const jsonPattern = `%"${parsedKey}":"${value}"%`;
    if (this.whereAdded) {
      this.sql += ` AND ${parsedColumnName} LIKE ?`;
    } else {
      this.sql += ` WHERE ${parsedColumnName} LIKE ?`;
      this.whereAdded = true;
    }
    this.params.push(jsonPattern);
    return this;
  }
  /**
   * Get the built query
   * @returns Object containing the SQL string and parameters array
   */
  build() {
    return {
      sql: this.sql,
      params: this.params
    };
  }
  /**
   * Reset the builder for reuse
   * @returns The reset builder instance
   */
  reset() {
    this.sql = "";
    this.params = [];
    this.whereAdded = false;
    return this;
  }
};
function createSqlBuilder() {
  return new SqlBuilder();
}
var SQL_IDENTIFIER_PATTERN = /^[a-zA-Z0-9_]+(\s+AS\s+[a-zA-Z0-9_]+)?$/;
function parseSelectIdentifier(column) {
  if (column !== "*" && !SQL_IDENTIFIER_PATTERN.test(column)) {
    throw new Error(
      `Invalid column name: "${column}". Must be "*" or a valid identifier (letters, numbers, underscores), optionally with "AS alias".`
    );
  }
  return column;
}

// src/storage/index.ts
function isArrayOfRecords(value) {
  return value && Array.isArray(value) && value.length > 0;
}
var D1Store = class extends MastraStorage {
  client;
  accountId;
  databaseId;
  binding;
  // D1Database binding
  tablePrefix;
  /**
   * Creates a new D1Store instance
   * @param config Configuration for D1 access (either REST API or Workers Binding API)
   */
  constructor(config) {
    super({ name: "D1" });
    if (config.tablePrefix && !/^[a-zA-Z0-9_]*$/.test(config.tablePrefix)) {
      throw new Error("Invalid tablePrefix: only letters, numbers, and underscores are allowed.");
    }
    this.tablePrefix = config.tablePrefix || "";
    if ("binding" in config) {
      if (!config.binding) {
        throw new Error("D1 binding is required when using Workers Binding API");
      }
      this.binding = config.binding;
      this.logger.info("Using D1 Workers Binding API");
    } else {
      if (!config.accountId || !config.databaseId || !config.apiToken) {
        throw new Error("accountId, databaseId, and apiToken are required when using REST API");
      }
      this.accountId = config.accountId;
      this.databaseId = config.databaseId;
      this.client = new Cloudflare({
        apiToken: config.apiToken
      });
      this.logger.info("Using D1 REST API");
    }
  }
  // Helper method to get the full table name with prefix
  getTableName(tableName) {
    return `${this.tablePrefix}${tableName}`;
  }
  formatSqlParams(params) {
    return params.map((p) => p === void 0 || p === null ? null : p);
  }
  async executeWorkersBindingQuery({
    sql,
    params = [],
    first = false
  }) {
    if (!this.binding) {
      throw new Error("Workers binding is not configured");
    }
    try {
      const statement = this.binding.prepare(sql);
      const formattedParams = this.formatSqlParams(params);
      let result;
      if (formattedParams.length > 0) {
        if (first) {
          result = await statement.bind(...formattedParams).first();
          if (!result) return null;
          return result;
        } else {
          result = await statement.bind(...formattedParams).all();
          const results = result.results || [];
          if (result.meta) {
            this.logger.debug("Query metadata", { meta: result.meta });
          }
          return results;
        }
      } else {
        if (first) {
          result = await statement.first();
          if (!result) return null;
          return result;
        } else {
          result = await statement.all();
          const results = result.results || [];
          if (result.meta) {
            this.logger.debug("Query metadata", { meta: result.meta });
          }
          return results;
        }
      }
    } catch (workerError) {
      this.logger.error("Workers Binding API error", {
        message: workerError instanceof Error ? workerError.message : String(workerError),
        sql
      });
      throw new Error(`D1 Workers API error: ${workerError.message}`);
    }
  }
  async executeRestQuery({
    sql,
    params = [],
    first = false
  }) {
    if (!this.client || !this.accountId || !this.databaseId) {
      throw new Error("Missing required REST API configuration");
    }
    try {
      const response = await this.client.d1.database.query(this.databaseId, {
        account_id: this.accountId,
        sql,
        params: this.formatSqlParams(params)
      });
      const result = response.result || [];
      const results = result.flatMap((r) => r.results || []);
      if (first) {
        const firstResult = isArrayOfRecords(results) && results.length > 0 ? results[0] : null;
        if (!firstResult) return null;
        return firstResult;
      }
      return results;
    } catch (restError) {
      this.logger.error("REST API error", {
        message: restError instanceof Error ? restError.message : String(restError),
        sql
      });
      throw new Error(`D1 REST API error: ${restError.message}`);
    }
  }
  /**
   * Execute a SQL query against the D1 database
   * @param options Query options including SQL, parameters, and whether to return only the first result
   * @returns Query results as an array or a single object if first=true
   */
  async executeQuery(options) {
    const { sql, params = [], first = false } = options;
    try {
      this.logger.debug("Executing SQL query", { sql, params, first });
      if (this.binding) {
        return this.executeWorkersBindingQuery({ sql, params, first });
      } else if (this.client && this.accountId && this.databaseId) {
        return this.executeRestQuery({ sql, params, first });
      } else {
        throw new Error("No valid D1 configuration provided");
      }
    } catch (error) {
      this.logger.error("Error executing SQL query", {
        message: error instanceof Error ? error.message : String(error),
        sql,
        params,
        first
      });
      throw new Error(`D1 query error: ${error.message}`);
    }
  }
  // Helper to get existing table columns
  async getTableColumns(tableName) {
    try {
      const sql = `PRAGMA table_info(${tableName})`;
      const result = await this.executeQuery({ sql, params: [] });
      if (!result || !Array.isArray(result)) {
        return [];
      }
      return result.map((row) => ({
        name: row.name,
        type: row.type
      }));
    } catch (error) {
      this.logger.error(`Error getting table columns for ${tableName}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }
  // Helper to serialize objects to JSON strings
  serializeValue(value) {
    if (value === null || value === void 0) return null;
    if (value instanceof Date) {
      return this.serializeDate(value);
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return value;
  }
  // Helper to deserialize JSON strings to objects
  deserializeValue(value, type) {
    if (value === null || value === void 0) return null;
    if (type === "date" && typeof value === "string") {
      return new Date(value);
    }
    if (type === "jsonb" && typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
  getSqlType(type) {
    switch (type) {
      case "bigint":
        return "INTEGER";
      // SQLite uses INTEGER for all integer sizes
      case "jsonb":
        return "TEXT";
      // Store JSON as TEXT in SQLite
      default:
        return super.getSqlType(type);
    }
  }
  async createTable({
    tableName,
    schema
  }) {
    const fullTableName = this.getTableName(tableName);
    const columnDefinitions = Object.entries(schema).map(([colName, colDef]) => {
      const type = this.getSqlType(colDef.type);
      const nullable = colDef.nullable === false ? "NOT NULL" : "";
      const primaryKey = colDef.primaryKey ? "PRIMARY KEY" : "";
      return `${colName} ${type} ${nullable} ${primaryKey}`.trim();
    });
    const tableConstraints = [];
    if (tableName === TABLE_WORKFLOW_SNAPSHOT) {
      tableConstraints.push("UNIQUE (workflow_name, run_id)");
    }
    const query = createSqlBuilder().createTable(fullTableName, columnDefinitions, tableConstraints);
    const { sql, params } = query.build();
    try {
      await this.executeQuery({ sql, params });
      this.logger.debug(`Created table ${fullTableName}`);
    } catch (error) {
      this.logger.error(`Error creating table ${fullTableName}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to create table ${fullTableName}: ${error}`);
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
    const fullTableName = this.getTableName(tableName);
    try {
      const existingColumns = await this.getTableColumns(fullTableName);
      const existingColumnNames = new Set(existingColumns.map((col) => col.name.toLowerCase()));
      for (const columnName of ifNotExists) {
        if (!existingColumnNames.has(columnName.toLowerCase()) && schema[columnName]) {
          const columnDef = schema[columnName];
          const sqlType = this.getSqlType(columnDef.type);
          const nullable = columnDef.nullable === false ? "NOT NULL" : "";
          const defaultValue = columnDef.nullable === false ? this.getDefaultValue(columnDef.type) : "";
          const alterSql = `ALTER TABLE ${fullTableName} ADD COLUMN ${columnName} ${sqlType} ${nullable} ${defaultValue}`.trim();
          await this.executeQuery({ sql: alterSql, params: [] });
          this.logger.debug(`Added column ${columnName} to table ${fullTableName}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error altering table ${fullTableName}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to alter table ${fullTableName}: ${error}`);
    }
  }
  async clearTable({ tableName }) {
    const fullTableName = this.getTableName(tableName);
    try {
      const query = createSqlBuilder().delete(fullTableName);
      const { sql, params } = query.build();
      await this.executeQuery({ sql, params });
      this.logger.debug(`Cleared table ${fullTableName}`);
    } catch (error) {
      this.logger.error(`Error clearing table ${fullTableName}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to clear table ${fullTableName}: ${error}`);
    }
  }
  async processRecord(record) {
    const processedRecord = {};
    for (const [key, value] of Object.entries(record)) {
      processedRecord[key] = this.serializeValue(value);
    }
    return processedRecord;
  }
  async insert({ tableName, record }) {
    const fullTableName = this.getTableName(tableName);
    const processedRecord = await this.processRecord(record);
    const columns = Object.keys(processedRecord);
    const values = Object.values(processedRecord);
    const query = createSqlBuilder().insert(fullTableName, columns, values);
    const { sql, params } = query.build();
    try {
      await this.executeQuery({ sql, params });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error inserting into ${fullTableName}:`, { message });
      throw new Error(`Failed to insert into ${fullTableName}: ${error}`);
    }
  }
  async load({ tableName, keys }) {
    const fullTableName = this.getTableName(tableName);
    const query = createSqlBuilder().select("*").from(fullTableName);
    let firstKey = true;
    for (const [key, value] of Object.entries(keys)) {
      if (firstKey) {
        query.where(`${key} = ?`, value);
        firstKey = false;
      } else {
        query.andWhere(`${key} = ?`, value);
      }
    }
    query.limit(1);
    const { sql, params } = query.build();
    try {
      const result = await this.executeQuery({ sql, params, first: true });
      if (!result) return null;
      const processedResult = {};
      for (const [key, value] of Object.entries(result)) {
        processedResult[key] = this.deserializeValue(value);
      }
      return processedResult;
    } catch (error) {
      this.logger.error(`Error loading from ${fullTableName}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }
  async getThreadById({ threadId }) {
    const thread = await this.load({
      tableName: TABLE_THREADS,
      keys: { id: threadId }
    });
    if (!thread) return null;
    try {
      return {
        ...thread,
        createdAt: this.ensureDate(thread.createdAt),
        updatedAt: this.ensureDate(thread.updatedAt),
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata || "{}") : thread.metadata || {}
      };
    } catch (error) {
      this.logger.error(`Error processing thread ${threadId}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }
  /**
   * @deprecated use getThreadsByResourceIdPaginated instead
   */
  async getThreadsByResourceId({ resourceId }) {
    const fullTableName = this.getTableName(TABLE_THREADS);
    try {
      const query = createSqlBuilder().select("*").from(fullTableName).where("resourceId = ?", resourceId);
      const { sql, params } = query.build();
      const results = await this.executeQuery({ sql, params });
      return (isArrayOfRecords(results) ? results : []).map((thread) => ({
        ...thread,
        createdAt: this.ensureDate(thread.createdAt),
        updatedAt: this.ensureDate(thread.updatedAt),
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata || "{}") : thread.metadata || {}
      }));
    } catch (error) {
      this.logger.error(`Error getting threads by resourceId ${resourceId}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }
  async getThreadsByResourceIdPaginated(args) {
    const { resourceId, page, perPage } = args;
    const fullTableName = this.getTableName(TABLE_THREADS);
    const mapRowToStorageThreadType = (row) => ({
      ...row,
      createdAt: this.ensureDate(row.createdAt),
      updatedAt: this.ensureDate(row.updatedAt),
      metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata || "{}") : row.metadata || {}
    });
    const countQuery = createSqlBuilder().count().from(fullTableName).where("resourceId = ?", resourceId);
    const countResult = await this.executeQuery(countQuery.build());
    const total = Number(countResult?.[0]?.count ?? 0);
    const selectQuery = createSqlBuilder().select("*").from(fullTableName).where("resourceId = ?", resourceId).orderBy("createdAt", "DESC").limit(perPage).offset(page * perPage);
    const results = await this.executeQuery(selectQuery.build());
    const threads = results.map(mapRowToStorageThreadType);
    return {
      threads,
      total,
      page,
      perPage,
      hasMore: page * perPage + threads.length < total
    };
  }
  async saveThread({ thread }) {
    const fullTableName = this.getTableName(TABLE_THREADS);
    const threadToSave = {
      id: thread.id,
      resourceId: thread.resourceId,
      title: thread.title,
      metadata: thread.metadata ? JSON.stringify(thread.metadata) : null,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt
    };
    const processedRecord = await this.processRecord(threadToSave);
    const columns = Object.keys(processedRecord);
    const values = Object.values(processedRecord);
    const updateMap = {
      resourceId: "excluded.resourceId",
      title: "excluded.title",
      metadata: "excluded.metadata",
      createdAt: "excluded.createdAt",
      updatedAt: "excluded.updatedAt"
    };
    const query = createSqlBuilder().insert(fullTableName, columns, values, ["id"], updateMap);
    const { sql, params } = query.build();
    try {
      await this.executeQuery({ sql, params });
      return thread;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error saving thread to ${fullTableName}:`, { message });
      throw error;
    }
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    const thread = await this.getThreadById({ threadId: id });
    if (!thread) {
      throw new Error(`Thread ${id} not found`);
    }
    const fullTableName = this.getTableName(TABLE_THREADS);
    const mergedMetadata = {
      ...typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
      ...metadata
    };
    const columns = ["title", "metadata", "updatedAt"];
    const values = [title, JSON.stringify(mergedMetadata), (/* @__PURE__ */ new Date()).toISOString()];
    const query = createSqlBuilder().update(fullTableName, columns, values).where("id = ?", id);
    const { sql, params } = query.build();
    try {
      await this.executeQuery({ sql, params });
      return {
        ...thread,
        title,
        metadata: {
          ...typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
          ...metadata
        },
        updatedAt: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error("Error updating thread:", { message });
      throw error;
    }
  }
  async deleteThread({ threadId }) {
    const fullTableName = this.getTableName(TABLE_THREADS);
    try {
      const deleteThreadQuery = createSqlBuilder().delete(fullTableName).where("id = ?", threadId);
      const { sql: threadSql, params: threadParams } = deleteThreadQuery.build();
      await this.executeQuery({ sql: threadSql, params: threadParams });
      const messagesTableName = this.getTableName(TABLE_MESSAGES);
      const deleteMessagesQuery = createSqlBuilder().delete(messagesTableName).where("thread_id = ?", threadId);
      const { sql: messagesSql, params: messagesParams } = deleteMessagesQuery.build();
      await this.executeQuery({ sql: messagesSql, params: messagesParams });
    } catch (error) {
      this.logger.error(`Error deleting thread ${threadId}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to delete thread ${threadId}: ${error}`);
    }
  }
  async saveMessages(args) {
    const { messages, format = "v1" } = args;
    if (messages.length === 0) return [];
    try {
      const now = /* @__PURE__ */ new Date();
      const threadId = messages[0]?.threadId;
      for (const [i, message] of messages.entries()) {
        if (!message.id) throw new Error(`Message at index ${i} missing id`);
        if (!message.threadId) throw new Error(`Message at index ${i} missing threadId`);
        if (!message.content) throw new Error(`Message at index ${i} missing content`);
        if (!message.role) throw new Error(`Message at index ${i} missing role`);
        const thread = await this.getThreadById({ threadId: message.threadId });
        if (!thread) {
          throw new Error(`Thread ${message.threadId} not found`);
        }
      }
      const messagesToInsert = messages.map((message) => {
        const createdAt = message.createdAt ? new Date(message.createdAt) : now;
        return {
          id: message.id,
          thread_id: message.threadId,
          content: typeof message.content === "string" ? message.content : JSON.stringify(message.content),
          createdAt: createdAt.toISOString(),
          role: message.role,
          type: message.type || "v2",
          resourceId: message.resourceId
        };
      });
      await Promise.all([
        this.batchInsert({
          tableName: TABLE_MESSAGES,
          records: messagesToInsert
        }),
        // Update thread's updatedAt timestamp
        this.executeQuery({
          sql: `UPDATE ${this.getTableName(TABLE_THREADS)} SET updatedAt = ? WHERE id = ?`,
          params: [now.toISOString(), threadId]
        })
      ]);
      this.logger.debug(`Saved ${messages.length} messages`);
      const list = new MessageList().add(messages, "memory");
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      this.logger.error("Error saving messages:", { message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
  async _getIncludedMessages(threadId, selectBy) {
    const include = selectBy?.include;
    if (!include) return null;
    const prevMax = Math.max(...include.map((i) => i.withPreviousMessages || 0));
    const nextMax = Math.max(...include.map((i) => i.withNextMessages || 0));
    const includeIds = include.map((i) => i.id);
    const sql = `
        WITH ordered_messages AS (
          SELECT
            *,
            ROW_NUMBER() OVER (ORDER BY createdAt DESC) AS row_num
          FROM ${this.getTableName(TABLE_MESSAGES)}
          WHERE thread_id = ?
        )
        SELECT
          m.id,
          m.content,
          m.role,
          m.type,
          m.createdAt,
          m.thread_id AS threadId
        FROM ordered_messages m
        WHERE m.id IN (${includeIds.map(() => "?").join(",")})
        OR EXISTS (
          SELECT 1 FROM ordered_messages target
          WHERE target.id IN (${includeIds.map(() => "?").join(",")})
          AND (
            (m.row_num <= target.row_num + ? AND m.row_num > target.row_num)
            OR
            (m.row_num >= target.row_num - ? AND m.row_num < target.row_num)
          )
        )
        ORDER BY m.createdAt DESC
      `;
    const params = [
      threadId,
      ...includeIds,
      // for m.id IN (...)
      ...includeIds,
      // for target.id IN (...)
      prevMax,
      nextMax
    ];
    const messages = await this.executeQuery({ sql, params });
    return messages;
  }
  async getMessages({
    threadId,
    selectBy,
    format
  }) {
    const fullTableName = this.getTableName(TABLE_MESSAGES);
    const limit = typeof selectBy?.last === "number" ? selectBy.last : 40;
    const include = selectBy?.include || [];
    const messages = [];
    try {
      if (include.length) {
        const includeResult = await this._getIncludedMessages(threadId, selectBy);
        if (Array.isArray(includeResult)) messages.push(...includeResult);
      }
      const excludeIds = messages.map((m) => m.id);
      const query = createSqlBuilder().select(["id", "content", "role", "type", "createdAt", "thread_id AS threadId"]).from(fullTableName).where("thread_id = ?", threadId);
      if (excludeIds.length > 0) {
        query.andWhere(`id NOT IN (${excludeIds.map(() => "?").join(",")})`, ...excludeIds);
      }
      query.orderBy("createdAt", "DESC").limit(limit);
      const { sql, params } = query.build();
      const result = await this.executeQuery({ sql, params });
      if (Array.isArray(result)) messages.push(...result);
      messages.sort((a, b) => {
        const aRecord = a;
        const bRecord = b;
        const timeA = new Date(aRecord.createdAt).getTime();
        const timeB = new Date(bRecord.createdAt).getTime();
        return timeA - timeB;
      });
      const processedMessages = messages.map((message) => {
        const processedMsg = {};
        for (const [key, value] of Object.entries(message)) {
          if (key === `type` && value === `v2`) continue;
          processedMsg[key] = this.deserializeValue(value);
        }
        return processedMsg;
      });
      this.logger.debug(`Retrieved ${messages.length} messages for thread ${threadId}`);
      const list = new MessageList().add(processedMessages, "memory");
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      this.logger.error("Error retrieving messages for thread", {
        threadId,
        message: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }
  async getMessagesPaginated({
    threadId,
    selectBy,
    format
  }) {
    const { dateRange, page = 0, perPage = 40 } = selectBy?.pagination || {};
    const { start: fromDate, end: toDate } = dateRange || {};
    const fullTableName = this.getTableName(TABLE_MESSAGES);
    const messages = [];
    if (selectBy?.include?.length) {
      const includeResult = await this._getIncludedMessages(threadId, selectBy);
      if (Array.isArray(includeResult)) messages.push(...includeResult);
    }
    const countQuery = createSqlBuilder().count().from(fullTableName).where("thread_id = ?", threadId);
    if (fromDate) {
      countQuery.andWhere("createdAt >= ?", this.serializeDate(fromDate));
    }
    if (toDate) {
      countQuery.andWhere("createdAt <= ?", this.serializeDate(toDate));
    }
    const countResult = await this.executeQuery(countQuery.build());
    const total = Number(countResult[0]?.count ?? 0);
    const query = createSqlBuilder().select(["id", "content", "role", "type", "createdAt", "thread_id AS threadId"]).from(fullTableName).where("thread_id = ?", threadId);
    if (fromDate) {
      query.andWhere("createdAt >= ?", this.serializeDate(fromDate));
    }
    if (toDate) {
      query.andWhere("createdAt <= ?", this.serializeDate(toDate));
    }
    query.orderBy("createdAt", "DESC").limit(perPage).offset(page * perPage);
    const results = await this.executeQuery(query.build());
    const list = new MessageList().add(results, "memory");
    messages.push(...format === `v2` ? list.get.all.v2() : list.get.all.v1());
    return {
      messages,
      total,
      page,
      perPage,
      hasMore: page * perPage + messages.length < total
    };
  }
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    const fullTableName = this.getTableName(TABLE_WORKFLOW_SNAPSHOT);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const currentSnapshot = await this.load({
      tableName: TABLE_WORKFLOW_SNAPSHOT,
      keys: { workflow_name: workflowName, run_id: runId }
    });
    const persisting = currentSnapshot ? {
      ...currentSnapshot,
      snapshot: JSON.stringify(snapshot),
      updatedAt: now
    } : {
      workflow_name: workflowName,
      run_id: runId,
      snapshot,
      createdAt: now,
      updatedAt: now
    };
    const processedRecord = await this.processRecord(persisting);
    const columns = Object.keys(processedRecord);
    const values = Object.values(processedRecord);
    const updateMap = {
      snapshot: "excluded.snapshot",
      updatedAt: "excluded.updatedAt"
    };
    this.logger.debug("Persisting workflow snapshot", { workflowName, runId });
    const query = createSqlBuilder().insert(fullTableName, columns, values, ["workflow_name", "run_id"], updateMap);
    const { sql, params } = query.build();
    try {
      await this.executeQuery({ sql, params });
    } catch (error) {
      this.logger.error("Error persisting workflow snapshot:", {
        message: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  async loadWorkflowSnapshot(params) {
    const { workflowName, runId } = params;
    this.logger.debug("Loading workflow snapshot", { workflowName, runId });
    const d = await this.load({
      tableName: TABLE_WORKFLOW_SNAPSHOT,
      keys: {
        workflow_name: workflowName,
        run_id: runId
      }
    });
    return d ? d.snapshot : null;
  }
  /**
   * Insert multiple records in a batch operation
   * @param tableName The table to insert into
   * @param records The records to insert
   */
  async batchInsert({ tableName, records }) {
    if (records.length === 0) return;
    const fullTableName = this.getTableName(tableName);
    try {
      const batchSize = 50;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const recordsToInsert = batch;
        if (recordsToInsert.length > 0) {
          const firstRecord = recordsToInsert[0];
          const columns = Object.keys(firstRecord || {});
          for (const record of recordsToInsert) {
            const values = columns.map((col) => {
              if (!record) return null;
              const value = typeof col === "string" ? record[col] : null;
              return this.serializeValue(value);
            });
            const query = createSqlBuilder().insert(fullTableName, columns, values);
            const { sql, params } = query.build();
            await this.executeQuery({ sql, params });
          }
        }
        this.logger.debug(
          `Processed batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(records.length / batchSize)}`
        );
      }
      this.logger.debug(`Successfully batch inserted ${records.length} records into ${tableName}`);
    } catch (error) {
      this.logger.error(`Error batch inserting into ${tableName}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to batch insert into ${tableName}: ${error}`);
    }
  }
  /**
   * @deprecated use getTracesPaginated instead
   */
  async getTraces({
    name,
    scope,
    page,
    perPage,
    attributes,
    fromDate,
    toDate
  }) {
    const fullTableName = this.getTableName(TABLE_TRACES);
    try {
      const query = createSqlBuilder().select("*").from(fullTableName).where("1=1");
      if (name) {
        query.andWhere("name LIKE ?", `%${name}%`);
      }
      if (scope) {
        query.andWhere("scope = ?", scope);
      }
      if (attributes && Object.keys(attributes).length > 0) {
        for (const [key, value] of Object.entries(attributes)) {
          query.jsonLike("attributes", key, value);
        }
      }
      if (fromDate) {
        query.andWhere("createdAt >= ?", fromDate instanceof Date ? fromDate.toISOString() : fromDate);
      }
      if (toDate) {
        query.andWhere("createdAt <= ?", toDate instanceof Date ? toDate.toISOString() : toDate);
      }
      query.orderBy("startTime", "DESC").limit(perPage).offset(page * perPage);
      const { sql, params } = query.build();
      const results = await this.executeQuery({ sql, params });
      return isArrayOfRecords(results) ? results.map(
        (trace) => ({
          ...trace,
          attributes: this.deserializeValue(trace.attributes, "jsonb"),
          status: this.deserializeValue(trace.status, "jsonb"),
          events: this.deserializeValue(trace.events, "jsonb"),
          links: this.deserializeValue(trace.links, "jsonb"),
          other: this.deserializeValue(trace.other, "jsonb")
        })
      ) : [];
    } catch (error) {
      this.logger.error("Error getting traces:", { message: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }
  async getTracesPaginated(args) {
    const { name, scope, page, perPage, attributes, fromDate, toDate } = args;
    const fullTableName = this.getTableName(TABLE_TRACES);
    try {
      const dataQuery = createSqlBuilder().select("*").from(fullTableName).where("1=1");
      const countQuery = createSqlBuilder().count().from(fullTableName).where("1=1");
      if (name) {
        dataQuery.andWhere("name LIKE ?", `%${name}%`);
        countQuery.andWhere("name LIKE ?", `%${name}%`);
      }
      if (scope) {
        dataQuery.andWhere("scope = ?", scope);
        countQuery.andWhere("scope = ?", scope);
      }
      if (attributes && Object.keys(attributes).length > 0) {
        for (const [key, value] of Object.entries(attributes)) {
          dataQuery.jsonLike("attributes", key, value);
          countQuery.jsonLike("attributes", key, value);
        }
      }
      if (fromDate) {
        const fromDateStr = fromDate instanceof Date ? fromDate.toISOString() : fromDate;
        dataQuery.andWhere("createdAt >= ?", fromDateStr);
        countQuery.andWhere("createdAt >= ?", fromDateStr);
      }
      if (toDate) {
        const toDateStr = toDate instanceof Date ? toDate.toISOString() : toDate;
        dataQuery.andWhere("createdAt <= ?", toDateStr);
        countQuery.andWhere("createdAt <= ?", toDateStr);
      }
      const countResult = await this.executeQuery(countQuery.build());
      const total = Number(countResult?.[0]?.count ?? 0);
      dataQuery.orderBy("startTime", "DESC").limit(perPage).offset(page * perPage);
      const results = await this.executeQuery(dataQuery.build());
      const traces = isArrayOfRecords(results) ? results.map(
        (trace) => ({
          ...trace,
          attributes: this.deserializeValue(trace.attributes, "jsonb"),
          status: this.deserializeValue(trace.status, "jsonb"),
          events: this.deserializeValue(trace.events, "jsonb"),
          links: this.deserializeValue(trace.links, "jsonb"),
          other: this.deserializeValue(trace.other, "jsonb")
        })
      ) : [];
      return {
        traces,
        total,
        page,
        perPage,
        hasMore: page * perPage + traces.length < total
      };
    } catch (error) {
      this.logger.error("Error getting traces:", { message: error instanceof Error ? error.message : String(error) });
      return { traces: [], total: 0, page, perPage, hasMore: false };
    }
  }
  /**
   * @deprecated use getEvals instead
   */
  async getEvalsByAgentName(agentName, type) {
    const fullTableName = this.getTableName(TABLE_EVALS);
    try {
      let query = createSqlBuilder().select("*").from(fullTableName).where("agent_name = ?", agentName);
      if (type === "test") {
        query = query.andWhere("test_info IS NOT NULL AND json_extract(test_info, '$.testPath') IS NOT NULL");
      } else if (type === "live") {
        query = query.andWhere("(test_info IS NULL OR json_extract(test_info, '$.testPath') IS NULL)");
      }
      query.orderBy("created_at", "DESC");
      const { sql, params } = query.build();
      const results = await this.executeQuery({ sql, params });
      return isArrayOfRecords(results) ? results.map((row) => {
        const result = this.deserializeValue(row.result);
        const testInfo = row.test_info ? this.deserializeValue(row.test_info) : void 0;
        return {
          input: row.input || "",
          output: row.output || "",
          result,
          agentName: row.agent_name || "",
          metricName: row.metric_name || "",
          instructions: row.instructions || "",
          runId: row.run_id || "",
          globalRunId: row.global_run_id || "",
          createdAt: row.created_at || "",
          testInfo
        };
      }) : [];
    } catch (error) {
      this.logger.error(`Error getting evals for agent ${agentName}:`, {
        message: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }
  async getEvals(options) {
    const { agentName, type, page = 0, perPage = 40, fromDate, toDate } = options || {};
    const fullTableName = this.getTableName(TABLE_EVALS);
    const conditions = [];
    const queryParams = [];
    if (agentName) {
      conditions.push(`agent_name = ?`);
      queryParams.push(agentName);
    }
    if (type === "test") {
      conditions.push(`(test_info IS NOT NULL AND json_extract(test_info, '$.testPath') IS NOT NULL)`);
    } else if (type === "live") {
      conditions.push(`(test_info IS NULL OR json_extract(test_info, '$.testPath') IS NULL)`);
    }
    if (fromDate) {
      conditions.push(`createdAt >= ?`);
      queryParams.push(this.serializeDate(fromDate));
    }
    if (toDate) {
      conditions.push(`createdAt <= ?`);
      queryParams.push(this.serializeDate(toDate));
    }
    const countQueryBuilder = createSqlBuilder().count().from(fullTableName);
    if (conditions.length > 0) {
      countQueryBuilder.where(conditions.join(" AND "), ...queryParams);
    }
    const { sql: countSql, params: countParams } = countQueryBuilder.build();
    const countResult = await this.executeQuery({ sql: countSql, params: countParams, first: true });
    const total = Number(countResult?.count || 0);
    const currentOffset = page * perPage;
    if (total === 0) {
      return {
        evals: [],
        total: 0,
        page,
        perPage,
        hasMore: false
      };
    }
    const dataQueryBuilder = createSqlBuilder().select("*").from(fullTableName);
    if (conditions.length > 0) {
      dataQueryBuilder.where(conditions.join(" AND "), ...queryParams);
    }
    dataQueryBuilder.orderBy("createdAt", "DESC").limit(perPage).offset(currentOffset);
    const { sql: dataSql, params: dataParams } = dataQueryBuilder.build();
    const rows = await this.executeQuery({ sql: dataSql, params: dataParams });
    const evals = (isArrayOfRecords(rows) ? rows : []).map((row) => {
      const result = this.deserializeValue(row.result);
      const testInfo = row.test_info ? this.deserializeValue(row.test_info) : void 0;
      if (!result || typeof result !== "object" || !("score" in result)) {
        throw new Error(`Invalid MetricResult format: ${JSON.stringify(result)}`);
      }
      return {
        input: row.input,
        output: row.output,
        result,
        agentName: row.agent_name,
        metricName: row.metric_name,
        instructions: row.instructions,
        testInfo,
        globalRunId: row.global_run_id,
        runId: row.run_id,
        createdAt: row.createdAt
      };
    });
    const hasMore = currentOffset + evals.length < total;
    return {
      evals,
      total,
      page,
      perPage,
      hasMore
    };
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
  async hasColumn(table, column) {
    const sql = `PRAGMA table_info(${table});`;
    const result = await this.executeQuery({ sql, params: [] });
    if (!result || !Array.isArray(result)) return false;
    return result.some((col) => col.name === column || col.name === column.toLowerCase());
  }
  async getWorkflowRuns({
    workflowName,
    fromDate,
    toDate,
    limit,
    offset,
    resourceId
  } = {}) {
    const fullTableName = this.getTableName(TABLE_WORKFLOW_SNAPSHOT);
    try {
      const builder = createSqlBuilder().select().from(fullTableName);
      const countBuilder = createSqlBuilder().count().from(fullTableName);
      if (workflowName) builder.whereAnd("workflow_name = ?", workflowName);
      if (resourceId) {
        const hasResourceId = await this.hasColumn(fullTableName, "resourceId");
        if (hasResourceId) {
          builder.whereAnd("resourceId = ?", resourceId);
          countBuilder.whereAnd("resourceId = ?", resourceId);
        } else {
          console.warn(`[${fullTableName}] resourceId column not found. Skipping resourceId filter.`);
        }
      }
      if (fromDate) {
        builder.whereAnd("createdAt >= ?", fromDate instanceof Date ? fromDate.toISOString() : fromDate);
        countBuilder.whereAnd("createdAt >= ?", fromDate instanceof Date ? fromDate.toISOString() : fromDate);
      }
      if (toDate) {
        builder.whereAnd("createdAt <= ?", toDate instanceof Date ? toDate.toISOString() : toDate);
        countBuilder.whereAnd("createdAt <= ?", toDate instanceof Date ? toDate.toISOString() : toDate);
      }
      builder.orderBy("createdAt", "DESC");
      if (typeof limit === "number") builder.limit(limit);
      if (typeof offset === "number") builder.offset(offset);
      const { sql, params } = builder.build();
      let total = 0;
      if (limit !== void 0 && offset !== void 0) {
        const { sql: countSql, params: countParams } = countBuilder.build();
        const countResult = await this.executeQuery({ sql: countSql, params: countParams, first: true });
        total = Number(countResult?.count ?? 0);
      }
      const results = await this.executeQuery({ sql, params });
      const runs = (isArrayOfRecords(results) ? results : []).map((row) => this.parseWorkflowRun(row));
      return { runs, total: total || runs.length };
    } catch (error) {
      this.logger.error("Error getting workflow runs:", {
        message: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  async getWorkflowRunById({
    runId,
    workflowName
  }) {
    const fullTableName = this.getTableName(TABLE_WORKFLOW_SNAPSHOT);
    try {
      const conditions = [];
      const params = [];
      if (runId) {
        conditions.push("run_id = ?");
        params.push(runId);
      }
      if (workflowName) {
        conditions.push("workflow_name = ?");
        params.push(workflowName);
      }
      const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
      const sql = `SELECT * FROM ${fullTableName} ${whereClause} ORDER BY createdAt DESC LIMIT 1`;
      const result = await this.executeQuery({ sql, params, first: true });
      if (!result) return null;
      return this.parseWorkflowRun(result);
    } catch (error) {
      this.logger.error("Error getting workflow run by ID:", {
        message: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  /**
   * Close the database connection
   * No explicit cleanup needed for D1 in either REST or Workers Binding mode
   */
  async close() {
    this.logger.debug("Closing D1 connection");
  }
  async updateMessages(_args) {
    this.logger.error("updateMessages is not yet implemented in CloudflareD1Store");
    throw new Error("Method not implemented");
  }
};

export { D1Store };
