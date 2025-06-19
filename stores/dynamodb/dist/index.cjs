'use strict';

var clientDynamodb = require('@aws-sdk/client-dynamodb');
var libDynamodb = require('@aws-sdk/lib-dynamodb');
var storage = require('@mastra/core/storage');
var agent = require('@mastra/core/agent');
var electrodb = require('electrodb');

// src/storage/index.ts

// src/entities/utils.ts
var baseAttributes = {
  createdAt: {
    type: "string",
    required: true,
    readOnly: true,
    // Convert Date to ISO string on set
    set: (value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value || (/* @__PURE__ */ new Date()).toISOString();
    },
    // Initialize with current timestamp if not provided
    default: () => (/* @__PURE__ */ new Date()).toISOString()
  },
  updatedAt: {
    type: "string",
    required: true,
    // Convert Date to ISO string on set
    set: (value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value || (/* @__PURE__ */ new Date()).toISOString();
    },
    // Always use current timestamp when creating/updating
    default: () => (/* @__PURE__ */ new Date()).toISOString()
  },
  metadata: {
    type: "string",
    // JSON stringified
    // Stringify objects on set
    set: (value) => {
      if (value && typeof value !== "string") {
        return JSON.stringify(value);
      }
      return value;
    },
    // Parse JSON string to object on get
    get: (value) => {
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    }
  }
};

// src/entities/eval.ts
var evalEntity = new electrodb.Entity({
  model: {
    entity: "eval",
    version: "1",
    service: "mastra"
  },
  attributes: {
    entity: {
      type: "string",
      required: true
    },
    ...baseAttributes,
    input: {
      type: "string",
      required: true
    },
    output: {
      type: "string",
      required: true
    },
    result: {
      type: "string",
      // JSON stringified
      required: true,
      // Stringify object on set
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get
      get: (value) => {
        if (value) {
          return JSON.parse(value);
        }
        return value;
      }
    },
    agent_name: {
      type: "string",
      required: true
    },
    metric_name: {
      type: "string",
      required: true
    },
    instructions: {
      type: "string",
      required: true
    },
    test_info: {
      type: "string",
      // JSON stringified
      required: false,
      // Stringify object on set
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get
      get: (value) => {
        return value;
      }
    },
    global_run_id: {
      type: "string",
      required: true
    },
    run_id: {
      type: "string",
      required: true
    },
    created_at: {
      type: "string",
      required: true,
      // Initialize with current timestamp if not provided
      default: () => (/* @__PURE__ */ new Date()).toISOString(),
      // Convert Date to ISO string on set
      set: (value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value || (/* @__PURE__ */ new Date()).toISOString();
      }
    }
  },
  indexes: {
    primary: {
      pk: { field: "pk", composite: ["entity", "run_id"] },
      sk: { field: "sk", composite: [] }
    },
    byAgent: {
      index: "gsi1",
      pk: { field: "gsi1pk", composite: ["entity", "agent_name"] },
      sk: { field: "gsi1sk", composite: ["created_at"] }
    }
  }
});
var messageEntity = new electrodb.Entity({
  model: {
    entity: "message",
    version: "1",
    service: "mastra"
  },
  attributes: {
    entity: {
      type: "string",
      required: true
    },
    ...baseAttributes,
    id: {
      type: "string",
      required: true
    },
    threadId: {
      type: "string",
      required: true
    },
    content: {
      type: "string",
      required: true,
      // Stringify content object on set if it's not already a string
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get ONLY if it looks like JSON
      get: (value) => {
        if (value && typeof value === "string") {
          try {
            if (value.startsWith("{") || value.startsWith("[")) {
              return JSON.parse(value);
            }
          } catch {
            return value;
          }
        }
        return value;
      }
    },
    role: {
      type: "string",
      required: true
    },
    type: {
      type: "string",
      default: "text"
    },
    resourceId: {
      type: "string",
      required: false
    },
    toolCallIds: {
      type: "string",
      required: false,
      set: (value) => {
        if (Array.isArray(value)) {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to array on get
      get: (value) => {
        if (value && typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }
    },
    toolCallArgs: {
      type: "string",
      required: false,
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get
      get: (value) => {
        if (value && typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }
    },
    toolNames: {
      type: "string",
      required: false,
      set: (value) => {
        if (Array.isArray(value)) {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to array on get
      get: (value) => {
        if (value && typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }
    }
  },
  indexes: {
    primary: {
      pk: { field: "pk", composite: ["entity", "id"] },
      sk: { field: "sk", composite: ["entity"] }
    },
    byThread: {
      index: "gsi1",
      pk: { field: "gsi1pk", composite: ["entity", "threadId"] },
      sk: { field: "gsi1sk", composite: ["createdAt"] }
    }
  }
});
var threadEntity = new electrodb.Entity({
  model: {
    entity: "thread",
    version: "1",
    service: "mastra"
  },
  attributes: {
    entity: {
      type: "string",
      required: true
    },
    ...baseAttributes,
    id: {
      type: "string",
      required: true
    },
    resourceId: {
      type: "string",
      required: true
    },
    title: {
      type: "string",
      required: true
    },
    metadata: {
      type: "string",
      required: false,
      // Stringify metadata object on set if it's not already a string
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get
      get: (value) => {
        if (value && typeof value === "string") {
          try {
            if (value.startsWith("{") || value.startsWith("[")) {
              return JSON.parse(value);
            }
          } catch {
            return value;
          }
        }
        return value;
      }
    }
  },
  indexes: {
    primary: {
      pk: { field: "pk", composite: ["entity", "id"] },
      sk: { field: "sk", composite: ["id"] }
    },
    byResource: {
      index: "gsi1",
      pk: { field: "gsi1pk", composite: ["entity", "resourceId"] },
      sk: { field: "gsi1sk", composite: ["createdAt"] }
    }
  }
});
var traceEntity = new electrodb.Entity({
  model: {
    entity: "trace",
    version: "1",
    service: "mastra"
  },
  attributes: {
    entity: {
      type: "string",
      required: true
    },
    ...baseAttributes,
    id: {
      type: "string",
      required: true
    },
    parentSpanId: {
      type: "string",
      required: false
    },
    name: {
      type: "string",
      required: true
    },
    traceId: {
      type: "string",
      required: true
    },
    scope: {
      type: "string",
      required: true
    },
    kind: {
      type: "number",
      required: true
    },
    attributes: {
      type: "string",
      // JSON stringified
      required: false,
      // Stringify object on set
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get
      get: (value) => {
        return value ? JSON.parse(value) : value;
      }
    },
    status: {
      type: "string",
      // JSON stringified
      required: false,
      // Stringify object on set
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get
      get: (value) => {
        return value;
      }
    },
    events: {
      type: "string",
      // JSON stringified
      required: false,
      // Stringify object on set
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get
      get: (value) => {
        return value;
      }
    },
    links: {
      type: "string",
      // JSON stringified
      required: false,
      // Stringify object on set
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get
      get: (value) => {
        return value;
      }
    },
    other: {
      type: "string",
      required: false
    },
    startTime: {
      type: "number",
      required: true
    },
    endTime: {
      type: "number",
      required: true
    }
  },
  indexes: {
    primary: {
      pk: { field: "pk", composite: ["entity", "id"] },
      sk: { field: "sk", composite: [] }
    },
    byName: {
      index: "gsi1",
      pk: { field: "gsi1pk", composite: ["entity", "name"] },
      sk: { field: "gsi1sk", composite: ["startTime"] }
    },
    byScope: {
      index: "gsi2",
      pk: { field: "gsi2pk", composite: ["entity", "scope"] },
      sk: { field: "gsi2sk", composite: ["startTime"] }
    }
  }
});
var workflowSnapshotEntity = new electrodb.Entity({
  model: {
    entity: "workflow_snapshot",
    version: "1",
    service: "mastra"
  },
  attributes: {
    entity: {
      type: "string",
      required: true
    },
    ...baseAttributes,
    workflow_name: {
      type: "string",
      required: true
    },
    run_id: {
      type: "string",
      required: true
    },
    snapshot: {
      type: "string",
      // JSON stringified
      required: true,
      // Stringify snapshot object on set
      set: (value) => {
        if (value && typeof value !== "string") {
          return JSON.stringify(value);
        }
        return value;
      },
      // Parse JSON string to object on get
      get: (value) => {
        return value ? JSON.parse(value) : value;
      }
    },
    resourceId: {
      type: "string",
      required: false
    }
  },
  indexes: {
    primary: {
      pk: { field: "pk", composite: ["entity", "workflow_name"] },
      sk: { field: "sk", composite: ["run_id"] }
    },
    // GSI to allow querying by run_id efficiently without knowing the workflow_name
    gsi2: {
      index: "gsi2",
      pk: { field: "gsi2pk", composite: ["entity", "run_id"] },
      sk: { field: "gsi2sk", composite: ["workflow_name"] }
    }
  }
});

// src/entities/index.ts
function getElectroDbService(client, tableName) {
  return new electrodb.Service(
    {
      thread: threadEntity,
      message: messageEntity,
      eval: evalEntity,
      trace: traceEntity,
      workflowSnapshot: workflowSnapshotEntity
    },
    {
      client,
      table: tableName
    }
  );
}

// src/storage/index.ts
var DynamoDBStore = class extends storage.MastraStorage {
  tableName;
  client;
  service;
  hasInitialized = null;
  constructor({ name, config }) {
    super({ name });
    if (!config.tableName || typeof config.tableName !== "string" || config.tableName.trim() === "") {
      throw new Error("DynamoDBStore: config.tableName must be provided and cannot be empty.");
    }
    if (!/^[a-zA-Z0-9_.-]{3,255}$/.test(config.tableName)) {
      throw new Error(
        `DynamoDBStore: config.tableName "${config.tableName}" contains invalid characters or is not between 3 and 255 characters long.`
      );
    }
    const dynamoClient = new clientDynamodb.DynamoDBClient({
      region: config.region || "us-east-1",
      endpoint: config.endpoint,
      credentials: config.credentials
    });
    this.tableName = config.tableName;
    this.client = libDynamodb.DynamoDBDocumentClient.from(dynamoClient);
    this.service = getElectroDbService(this.client, this.tableName);
  }
  /**
   * This method is modified for DynamoDB with ElectroDB single-table design.
   * It assumes the table is created and managed externally via CDK/CloudFormation.
   *
   * This implementation only validates that the required table exists and is accessible.
   * No table creation is attempted - we simply check if we can access the table.
   */
  async createTable({ tableName }) {
    this.logger.debug("Validating access to externally managed table", { tableName, physicalTable: this.tableName });
    try {
      const tableExists = await this.validateTableExists();
      if (!tableExists) {
        this.logger.error(
          `Table ${this.tableName} does not exist or is not accessible. It should be created via CDK/CloudFormation.`
        );
        throw new Error(
          `Table ${this.tableName} does not exist or is not accessible. Ensure it's created via CDK/CloudFormation before using this store.`
        );
      }
      this.logger.debug(`Table ${this.tableName} exists and is accessible`);
    } catch (error) {
      this.logger.error("Error validating table access", { tableName: this.tableName, error });
      throw error;
    }
  }
  /**
   * Validates that the required DynamoDB table exists and is accessible.
   * This does not check the table structure - it assumes the table
   * was created with the correct structure via CDK/CloudFormation.
   */
  async validateTableExists() {
    try {
      const command = new clientDynamodb.DescribeTableCommand({
        TableName: this.tableName
      });
      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === "ResourceNotFoundException") {
        return false;
      }
      throw error;
    }
  }
  /**
   * Initialize storage, validating the externally managed table is accessible.
   * For the single-table design, we only validate once that we can access
   * the table that was created via CDK/CloudFormation.
   */
  async init() {
    if (this.hasInitialized === null) {
      this.hasInitialized = this._performInitializationAndStore();
    }
    try {
      await this.hasInitialized;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Performs the actual table validation and stores the promise.
   * Handles resetting the stored promise on failure to allow retries.
   */
  _performInitializationAndStore() {
    return this.validateTableExists().then((exists) => {
      if (!exists) {
        throw new Error(
          `Table ${this.tableName} does not exist or is not accessible. Ensure it's created via CDK/CloudFormation before using this store.`
        );
      }
      return true;
    }).catch((err) => {
      this.hasInitialized = null;
      throw err;
    });
  }
  /**
   * Pre-processes a record to ensure Date objects are converted to ISO strings
   * This is necessary because ElectroDB validation happens before setters are applied
   */
  preprocessRecord(record) {
    const processed = { ...record };
    if (processed.createdAt instanceof Date) {
      processed.createdAt = processed.createdAt.toISOString();
    }
    if (processed.updatedAt instanceof Date) {
      processed.updatedAt = processed.updatedAt.toISOString();
    }
    if (processed.created_at instanceof Date) {
      processed.created_at = processed.created_at.toISOString();
    }
    return processed;
  }
  async alterTable(_args) {
  }
  /**
   * Clear all items from a logical "table" (entity type)
   */
  async clearTable({ tableName }) {
    this.logger.debug("DynamoDB clearTable called", { tableName });
    const entityName = this.getEntityNameForTable(tableName);
    if (!entityName || !this.service.entities[entityName]) {
      throw new Error(`No entity defined for ${tableName}`);
    }
    try {
      const result = await this.service.entities[entityName].scan.go({ pages: "all" });
      if (!result.data.length) {
        this.logger.debug(`No records found to clear for ${tableName}`);
        return;
      }
      this.logger.debug(`Found ${result.data.length} records to delete for ${tableName}`);
      const keysToDelete = result.data.map((item) => {
        const key = { entity: entityName };
        switch (entityName) {
          case "thread":
            if (!item.id) throw new Error(`Missing required key 'id' for entity 'thread'`);
            key.id = item.id;
            break;
          case "message":
            if (!item.id) throw new Error(`Missing required key 'id' for entity 'message'`);
            key.id = item.id;
            break;
          case "workflowSnapshot":
            if (!item.workflow_name)
              throw new Error(`Missing required key 'workflow_name' for entity 'workflowSnapshot'`);
            if (!item.run_id) throw new Error(`Missing required key 'run_id' for entity 'workflowSnapshot'`);
            key.workflow_name = item.workflow_name;
            key.run_id = item.run_id;
            break;
          case "eval":
            if (!item.run_id) throw new Error(`Missing required key 'run_id' for entity 'eval'`);
            key.run_id = item.run_id;
            break;
          case "trace":
            if (!item.id) throw new Error(`Missing required key 'id' for entity 'trace'`);
            key.id = item.id;
            break;
          default:
            this.logger.warn(`Unknown entity type encountered during clearTable: ${entityName}`);
            throw new Error(`Cannot construct delete key for unknown entity type: ${entityName}`);
        }
        return key;
      });
      const batchSize = 25;
      for (let i = 0; i < keysToDelete.length; i += batchSize) {
        const batchKeys = keysToDelete.slice(i, i + batchSize);
        await this.service.entities[entityName].delete(batchKeys).go();
      }
      this.logger.debug(`Successfully cleared all records for ${tableName}`);
    } catch (error) {
      this.logger.error("Failed to clear table", { tableName, error });
      throw error;
    }
  }
  /**
   * Insert a record into the specified "table" (entity)
   */
  async insert({ tableName, record }) {
    this.logger.debug("DynamoDB insert called", { tableName });
    const entityName = this.getEntityNameForTable(tableName);
    if (!entityName || !this.service.entities[entityName]) {
      throw new Error(`No entity defined for ${tableName}`);
    }
    try {
      const dataToSave = { entity: entityName, ...this.preprocessRecord(record) };
      await this.service.entities[entityName].create(dataToSave).go();
    } catch (error) {
      this.logger.error("Failed to insert record", { tableName, error });
      throw error;
    }
  }
  /**
   * Insert multiple records as a batch
   */
  async batchInsert({ tableName, records }) {
    this.logger.debug("DynamoDB batchInsert called", { tableName, count: records.length });
    const entityName = this.getEntityNameForTable(tableName);
    if (!entityName || !this.service.entities[entityName]) {
      throw new Error(`No entity defined for ${tableName}`);
    }
    const recordsToSave = records.map((rec) => ({ entity: entityName, ...this.preprocessRecord(rec) }));
    const batchSize = 25;
    const batches = [];
    for (let i = 0; i < recordsToSave.length; i += batchSize) {
      const batch = recordsToSave.slice(i, i + batchSize);
      batches.push(batch);
    }
    try {
      for (const batch of batches) {
        for (const recordData of batch) {
          if (!recordData.entity) {
            this.logger.error("Missing entity property in record data for batchInsert", { recordData, tableName });
            throw new Error(`Internal error: Missing entity property during batchInsert for ${tableName}`);
          }
          this.logger.debug("Attempting to create record in batchInsert:", { entityName, recordData });
          await this.service.entities[entityName].create(recordData).go();
        }
      }
    } catch (error) {
      this.logger.error("Failed to batch insert records", { tableName, error });
      throw error;
    }
  }
  /**
   * Load a record by its keys
   */
  async load({ tableName, keys }) {
    this.logger.debug("DynamoDB load called", { tableName, keys });
    const entityName = this.getEntityNameForTable(tableName);
    if (!entityName || !this.service.entities[entityName]) {
      throw new Error(`No entity defined for ${tableName}`);
    }
    try {
      const keyObject = { entity: entityName, ...keys };
      const result = await this.service.entities[entityName].get(keyObject).go();
      if (!result.data) {
        return null;
      }
      let data = result.data;
      return data;
    } catch (error) {
      this.logger.error("Failed to load record", { tableName, keys, error });
      throw error;
    }
  }
  // Thread operations
  async getThreadById({ threadId }) {
    this.logger.debug("Getting thread by ID", { threadId });
    try {
      const result = await this.service.entities.thread.get({ entity: "thread", id: threadId }).go();
      if (!result.data) {
        return null;
      }
      const data = result.data;
      return {
        ...data,
        // Convert date strings back to Date objects for consistency
        createdAt: typeof data.createdAt === "string" ? new Date(data.createdAt) : data.createdAt,
        updatedAt: typeof data.updatedAt === "string" ? new Date(data.updatedAt) : data.updatedAt
        // metadata: data.metadata ? JSON.parse(data.metadata) : undefined, // REMOVED by AI
        // metadata is already transformed by the entity's getter
      };
    } catch (error) {
      this.logger.error("Failed to get thread by ID", { threadId, error });
      throw error;
    }
  }
  async getThreadsByResourceId({ resourceId }) {
    this.logger.debug("Getting threads by resource ID", { resourceId });
    try {
      const result = await this.service.entities.thread.query.byResource({ entity: "thread", resourceId }).go();
      if (!result.data.length) {
        return [];
      }
      return result.data.map((data) => ({
        ...data,
        // Convert date strings back to Date objects for consistency
        createdAt: typeof data.createdAt === "string" ? new Date(data.createdAt) : data.createdAt,
        updatedAt: typeof data.updatedAt === "string" ? new Date(data.updatedAt) : data.updatedAt
        // metadata: data.metadata ? JSON.parse(data.metadata) : undefined, // REMOVED by AI
        // metadata is already transformed by the entity's getter
      }));
    } catch (error) {
      this.logger.error("Failed to get threads by resource ID", { resourceId, error });
      throw error;
    }
  }
  async saveThread({ thread }) {
    this.logger.debug("Saving thread", { threadId: thread.id });
    const now = /* @__PURE__ */ new Date();
    const threadData = {
      entity: "thread",
      id: thread.id,
      resourceId: thread.resourceId,
      title: thread.title || `Thread ${thread.id}`,
      createdAt: thread.createdAt?.toISOString() || now.toISOString(),
      updatedAt: now.toISOString(),
      metadata: thread.metadata ? JSON.stringify(thread.metadata) : void 0
    };
    try {
      await this.service.entities.thread.create(threadData).go();
      return {
        id: thread.id,
        resourceId: thread.resourceId,
        title: threadData.title,
        createdAt: thread.createdAt || now,
        updatedAt: now,
        metadata: thread.metadata
      };
    } catch (error) {
      this.logger.error("Failed to save thread", { threadId: thread.id, error });
      throw error;
    }
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    this.logger.debug("Updating thread", { threadId: id });
    try {
      const existingThread = await this.getThreadById({ threadId: id });
      if (!existingThread) {
        throw new Error(`Thread not found: ${id}`);
      }
      const now = /* @__PURE__ */ new Date();
      const updateData = {
        updatedAt: now.toISOString()
      };
      if (title) {
        updateData.title = title;
      }
      if (metadata) {
        updateData.metadata = JSON.stringify(metadata);
      }
      await this.service.entities.thread.update({ entity: "thread", id }).set(updateData).go();
      return {
        ...existingThread,
        title: title || existingThread.title,
        metadata: metadata || existingThread.metadata,
        updatedAt: now
      };
    } catch (error) {
      this.logger.error("Failed to update thread", { threadId: id, error });
      throw error;
    }
  }
  async deleteThread({ threadId }) {
    this.logger.debug("Deleting thread", { threadId });
    try {
      await this.service.entities.thread.delete({ entity: "thread", id: threadId }).go();
    } catch (error) {
      this.logger.error("Failed to delete thread", { threadId, error });
      throw error;
    }
  }
  async getMessages({
    threadId,
    resourceId,
    selectBy,
    format
  }) {
    this.logger.debug("Getting messages", { threadId, selectBy });
    try {
      const query = this.service.entities.message.query.byThread({ entity: "message", threadId });
      if (selectBy?.last && typeof selectBy.last === "number") {
        const results2 = await query.go({ limit: selectBy.last, order: "desc" });
        const list2 = new agent.MessageList({ threadId, resourceId }).add(
          results2.data.map((data) => this.parseMessageData(data)),
          "memory"
        );
        if (format === `v2`) return list2.get.all.v2();
        return list2.get.all.v1();
      }
      const results = await query.go();
      const list = new agent.MessageList({ threadId, resourceId }).add(
        results.data.map((data) => this.parseMessageData(data)),
        "memory"
      );
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      this.logger.error("Failed to get messages", { threadId, error });
      throw error;
    }
  }
  async saveMessages(args) {
    const { messages, format = "v1" } = args;
    this.logger.debug("Saving messages", { count: messages.length });
    if (!messages.length) {
      return [];
    }
    const threadId = messages[0]?.threadId;
    if (!threadId) {
      throw new Error("Thread ID is required");
    }
    const messagesToSave = messages.map((msg) => {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      return {
        entity: "message",
        // Add entity type
        id: msg.id,
        threadId: msg.threadId,
        role: msg.role,
        type: msg.type,
        resourceId: msg.resourceId,
        // Ensure complex fields are stringified if not handled by attribute setters
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
        toolCallArgs: `toolCallArgs` in msg && msg.toolCallArgs ? JSON.stringify(msg.toolCallArgs) : void 0,
        toolCallIds: `toolCallIds` in msg && msg.toolCallIds ? JSON.stringify(msg.toolCallIds) : void 0,
        toolNames: `toolNames` in msg && msg.toolNames ? JSON.stringify(msg.toolNames) : void 0,
        createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt || now,
        updatedAt: now
        // Add updatedAt
      };
    });
    try {
      const batchSize = 25;
      const batches = [];
      for (let i = 0; i < messagesToSave.length; i += batchSize) {
        const batch = messagesToSave.slice(i, i + batchSize);
        batches.push(batch);
      }
      await Promise.all([
        // Process message batches
        ...batches.map(async (batch) => {
          for (const messageData of batch) {
            if (!messageData.entity) {
              this.logger.error("Missing entity property in message data for create", { messageData });
              throw new Error("Internal error: Missing entity property during saveMessages");
            }
            await this.service.entities.message.create(messageData).go();
          }
        }),
        // Update thread's updatedAt timestamp
        this.service.entities.thread.update({ entity: "thread", id: threadId }).set({
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).go()
      ]);
      const list = new agent.MessageList().add(messages, "memory");
      if (format === `v1`) return list.get.all.v1();
      return list.get.all.v2();
    } catch (error) {
      this.logger.error("Failed to save messages", { error });
      throw error;
    }
  }
  // Helper function to parse message data (handle JSON fields)
  parseMessageData(data) {
    return {
      ...data,
      // Ensure dates are Date objects if needed (ElectroDB might return strings)
      createdAt: data.createdAt ? new Date(data.createdAt) : void 0,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : void 0
      // Other fields like content, toolCallArgs etc. are assumed to be correctly
      // transformed by the ElectroDB entity getters.
    };
  }
  // Trace operations
  async getTraces(args) {
    const { name, scope, page, perPage } = args;
    this.logger.debug("Getting traces", { name, scope, page, perPage });
    try {
      let query;
      if (name) {
        query = this.service.entities.trace.query.byName({ entity: "trace", name });
      } else if (scope) {
        query = this.service.entities.trace.query.byScope({ entity: "trace", scope });
      } else {
        this.logger.warn("Performing a scan operation on traces - consider using a more specific query");
        query = this.service.entities.trace.scan;
      }
      let items = [];
      let cursor = null;
      let pagesFetched = 0;
      const startPage = page > 0 ? page : 1;
      do {
        const results = await query.go({ cursor, limit: perPage });
        pagesFetched++;
        if (pagesFetched === startPage) {
          items = results.data;
          break;
        }
        cursor = results.cursor;
        if (!cursor && results.data.length > 0 && pagesFetched < startPage) {
          break;
        }
      } while (cursor && pagesFetched < startPage);
      return items;
    } catch (error) {
      this.logger.error("Failed to get traces", { error });
      throw error;
    }
  }
  async batchTraceInsert({ records }) {
    this.logger.debug("Batch inserting traces", { count: records.length });
    if (!records.length) {
      return;
    }
    try {
      const recordsToSave = records.map((rec) => ({ entity: "trace", ...rec }));
      await this.batchInsert({
        tableName: storage.TABLE_TRACES,
        records: recordsToSave
        // Pass records with 'entity' included
      });
    } catch (error) {
      this.logger.error("Failed to batch insert traces", { error });
      throw error;
    }
  }
  // Workflow operations
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    this.logger.debug("Persisting workflow snapshot", { workflowName, runId });
    try {
      const resourceId = "resourceId" in snapshot ? snapshot.resourceId : void 0;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const data = {
        entity: "workflow_snapshot",
        // Add entity type
        workflow_name: workflowName,
        run_id: runId,
        snapshot: JSON.stringify(snapshot),
        // Stringify the snapshot object
        createdAt: now,
        updatedAt: now,
        resourceId
      };
      await this.service.entities.workflowSnapshot.upsert(data).go();
    } catch (error) {
      this.logger.error("Failed to persist workflow snapshot", { workflowName, runId, error });
      throw error;
    }
  }
  async loadWorkflowSnapshot({
    workflowName,
    runId
  }) {
    this.logger.debug("Loading workflow snapshot", { workflowName, runId });
    try {
      const result = await this.service.entities.workflowSnapshot.get({
        entity: "workflow_snapshot",
        // Add entity type
        workflow_name: workflowName,
        run_id: runId
      }).go();
      if (!result.data?.snapshot) {
        return null;
      }
      return result.data.snapshot;
    } catch (error) {
      this.logger.error("Failed to load workflow snapshot", { workflowName, runId, error });
      throw error;
    }
  }
  async getWorkflowRuns(args) {
    this.logger.debug("Getting workflow runs", { args });
    try {
      const limit = args?.limit || 10;
      const offset = args?.offset || 0;
      let query;
      if (args?.workflowName) {
        query = this.service.entities.workflowSnapshot.query.primary({
          entity: "workflow_snapshot",
          // Add entity type
          workflow_name: args.workflowName
        });
      } else {
        this.logger.warn("Performing a scan operation on workflow snapshots - consider using a more specific query");
        query = this.service.entities.workflowSnapshot.scan;
      }
      const allMatchingSnapshots = [];
      let cursor = null;
      const DYNAMODB_PAGE_SIZE = 100;
      do {
        const pageResults = await query.go({
          limit: DYNAMODB_PAGE_SIZE,
          cursor
        });
        if (pageResults.data && pageResults.data.length > 0) {
          let pageFilteredData = pageResults.data;
          if (args?.fromDate || args?.toDate) {
            pageFilteredData = pageFilteredData.filter((snapshot) => {
              const createdAt = new Date(snapshot.createdAt);
              if (args.fromDate && createdAt < args.fromDate) {
                return false;
              }
              if (args.toDate && createdAt > args.toDate) {
                return false;
              }
              return true;
            });
          }
          if (args?.resourceId) {
            pageFilteredData = pageFilteredData.filter((snapshot) => {
              return snapshot.resourceId === args.resourceId;
            });
          }
          allMatchingSnapshots.push(...pageFilteredData);
        }
        cursor = pageResults.cursor;
      } while (cursor);
      if (!allMatchingSnapshots.length) {
        return { runs: [], total: 0 };
      }
      const total = allMatchingSnapshots.length;
      const paginatedData = allMatchingSnapshots.slice(offset, offset + limit);
      const runs = paginatedData.map((snapshot) => this.formatWorkflowRun(snapshot));
      return {
        runs,
        total
      };
    } catch (error) {
      this.logger.error("Failed to get workflow runs", { error });
      throw error;
    }
  }
  async getWorkflowRunById(args) {
    const { runId, workflowName } = args;
    this.logger.debug("Getting workflow run by ID", { runId, workflowName });
    try {
      if (workflowName) {
        this.logger.debug("WorkflowName provided, using direct GET operation.");
        const result2 = await this.service.entities.workflowSnapshot.get({
          entity: "workflow_snapshot",
          // Entity type for PK
          workflow_name: workflowName,
          run_id: runId
        }).go();
        if (!result2.data) {
          return null;
        }
        const snapshot2 = result2.data.snapshot;
        return {
          workflowName: result2.data.workflow_name,
          runId: result2.data.run_id,
          snapshot: snapshot2,
          createdAt: new Date(result2.data.createdAt),
          updatedAt: new Date(result2.data.updatedAt),
          resourceId: result2.data.resourceId
        };
      }
      this.logger.debug(
        'WorkflowName not provided. Attempting to find workflow run by runId using GSI. Ensure GSI (e.g., "byRunId") is defined on the workflowSnapshot entity with run_id as its key and provisioned in DynamoDB.'
      );
      const result = await this.service.entities.workflowSnapshot.query.gsi2({ entity: "workflow_snapshot", run_id: runId }).go();
      const matchingRunDbItem = result.data && result.data.length > 0 ? result.data[0] : null;
      if (!matchingRunDbItem) {
        return null;
      }
      const snapshot = matchingRunDbItem.snapshot;
      return {
        workflowName: matchingRunDbItem.workflow_name,
        runId: matchingRunDbItem.run_id,
        snapshot,
        createdAt: new Date(matchingRunDbItem.createdAt),
        updatedAt: new Date(matchingRunDbItem.updatedAt),
        resourceId: matchingRunDbItem.resourceId
      };
    } catch (error) {
      this.logger.error("Failed to get workflow run by ID", { runId, workflowName, error });
      throw error;
    }
  }
  // Helper function to format workflow run
  formatWorkflowRun(snapshotData) {
    return {
      workflowName: snapshotData.workflow_name,
      runId: snapshotData.run_id,
      snapshot: snapshotData.snapshot,
      createdAt: new Date(snapshotData.createdAt),
      updatedAt: new Date(snapshotData.updatedAt),
      resourceId: snapshotData.resourceId
    };
  }
  // Helper methods for entity/table mapping
  getEntityNameForTable(tableName) {
    const mapping = {
      [storage.TABLE_THREADS]: "thread",
      [storage.TABLE_MESSAGES]: "message",
      [storage.TABLE_WORKFLOW_SNAPSHOT]: "workflowSnapshot",
      [storage.TABLE_EVALS]: "eval",
      [storage.TABLE_TRACES]: "trace"
    };
    return mapping[tableName] || null;
  }
  // Eval operations
  async getEvalsByAgentName(agentName, type) {
    this.logger.debug("Getting evals for agent", { agentName, type });
    try {
      const query = this.service.entities.eval.query.byAgent({ entity: "eval", agent_name: agentName });
      const results = await query.go({ order: "desc", limit: 100 });
      if (!results.data.length) {
        return [];
      }
      let filteredData = results.data;
      if (type) {
        filteredData = filteredData.filter((evalRecord) => {
          try {
            const testInfo = evalRecord.test_info && typeof evalRecord.test_info === "string" ? JSON.parse(evalRecord.test_info) : void 0;
            if (type === "test" && !testInfo) {
              return false;
            }
            if (type === "live" && testInfo) {
              return false;
            }
          } catch (e) {
            this.logger.warn("Failed to parse test_info during filtering", { record: evalRecord, error: e });
          }
          return true;
        });
      }
      return filteredData.map((evalRecord) => {
        try {
          return {
            input: evalRecord.input,
            output: evalRecord.output,
            // Safely parse result and test_info
            result: evalRecord.result && typeof evalRecord.result === "string" ? JSON.parse(evalRecord.result) : void 0,
            agentName: evalRecord.agent_name,
            createdAt: evalRecord.created_at,
            // Keep as string from DDB?
            metricName: evalRecord.metric_name,
            instructions: evalRecord.instructions,
            runId: evalRecord.run_id,
            globalRunId: evalRecord.global_run_id,
            testInfo: evalRecord.test_info && typeof evalRecord.test_info === "string" ? JSON.parse(evalRecord.test_info) : void 0
          };
        } catch (parseError) {
          this.logger.error("Failed to parse eval record", { record: evalRecord, error: parseError });
          return {
            agentName: evalRecord.agent_name,
            createdAt: evalRecord.created_at,
            runId: evalRecord.run_id,
            globalRunId: evalRecord.global_run_id
          };
        }
      });
    } catch (error) {
      this.logger.error("Failed to get evals by agent name", { agentName, type, error });
      throw error;
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
  /**
   * Closes the DynamoDB client connection and cleans up resources.
   * Should be called when the store is no longer needed, e.g., at the end of tests or application shutdown.
   */
  async close() {
    this.logger.debug("Closing DynamoDB client for store:", { name: this.name });
    try {
      this.client.destroy();
      this.logger.debug("DynamoDB client closed successfully for store:", { name: this.name });
    } catch (error) {
      this.logger.error("Error closing DynamoDB client for store:", { name: this.name, error });
      throw error;
    }
  }
  async updateMessages(_args) {
    this.logger.error("updateMessages is not yet implemented in DynamoDBStore");
    throw new Error("Method not implemented");
  }
};

exports.DynamoDBStore = DynamoDBStore;
