import { MastraVector } from '@mastra/core/vector';
import { MongoClient } from 'mongodb';
import { v4 } from 'uuid';
import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import { MessageList } from '@mastra/core/agent';
import { MastraStorage, TABLE_THREADS, TABLE_MESSAGES, TABLE_TRACES, TABLE_WORKFLOW_SNAPSHOT, TABLE_EVALS } from '@mastra/core/storage';

// src/vector/index.ts
var MongoDBFilterTranslator = class extends BaseFilterTranslator {
  getSupportedOperators() {
    return {
      ...BaseFilterTranslator.DEFAULT_OPERATORS,
      regex: ["$regex"],
      custom: ["$size"]
    };
  }
  translate(filter) {
    if (this.isEmpty(filter)) return filter;
    this.validateFilter(filter);
    return this.translateNode(filter);
  }
  translateNode(node) {
    if (this.isRegex(node)) {
      return node;
    }
    if (this.isPrimitive(node)) return node;
    if (Array.isArray(node)) return node;
    const entries = Object.entries(node);
    const translatedEntries = entries.map(([key, value]) => {
      if (this.isOperator(key)) {
        return [key, this.translateOperatorValue(key, value)];
      }
      return [key, this.translateNode(value)];
    });
    return Object.fromEntries(translatedEntries);
  }
  translateOperatorValue(operator, value) {
    if (this.isLogicalOperator(operator)) {
      if (operator === "$not") {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          throw new Error("$not operator requires an object");
        }
        if (this.isEmpty(value)) {
          throw new Error("$not operator cannot be empty");
        }
        return this.translateNode(value);
      } else {
        if (!Array.isArray(value)) {
          throw new Error(`Value for logical operator ${operator} must be an array`);
        }
        return value.map((item) => this.translateNode(item));
      }
    }
    if (this.isBasicOperator(operator) || this.isNumericOperator(operator)) {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return this.normalizeComparisonValue(value);
    }
    if (operator === "$elemMatch") {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error(`Value for $elemMatch operator must be an object`);
      }
      return this.translateNode(value);
    }
    if (this.isArrayOperator(operator)) {
      if (!Array.isArray(value)) {
        throw new Error(`Value for array operator ${operator} must be an array`);
      }
      return this.normalizeArrayValues(value);
    }
    if (this.isElementOperator(operator)) {
      if (operator === "$exists" && typeof value !== "boolean") {
        throw new Error(`Value for $exists operator must be a boolean`);
      }
      return value;
    }
    if (this.isRegexOperator(operator)) {
      if (!(value instanceof RegExp) && typeof value !== "string") {
        throw new Error(`Value for ${operator} operator must be a RegExp or string`);
      }
      return value;
    }
    if (operator === "$size") {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new Error(`Value for $size operator must be a non-negative integer`);
      }
      return value;
    }
    throw new Error(`Unsupported operator: ${operator}`);
  }
  isEmpty(filter) {
    return filter === void 0 || filter === null || typeof filter === "object" && Object.keys(filter).length === 0;
  }
};

// src/vector/index.ts
var MongoDBVector = class extends MastraVector {
  client;
  db;
  collections;
  embeddingFieldName = "embedding";
  metadataFieldName = "metadata";
  documentFieldName = "document";
  collectionForValidation = null;
  mongoMetricMap = {
    cosine: "cosine",
    euclidean: "euclidean",
    dotproduct: "dotProduct"
  };
  constructor({ uri, dbName, options }) {
    super();
    this.client = new MongoClient(uri, options);
    this.db = this.client.db(dbName);
    this.collections = /* @__PURE__ */ new Map();
  }
  // Public methods
  async connect() {
    await this.client.connect();
  }
  async disconnect() {
    await this.client.close();
  }
  async createIndex({ indexName, dimension, metric = "cosine" }) {
    if (!Number.isInteger(dimension) || dimension <= 0) {
      throw new Error("Dimension must be a positive integer");
    }
    const mongoMetric = this.mongoMetricMap[metric];
    if (!mongoMetric) {
      throw new Error(`Invalid metric: "${metric}". Must be one of: cosine, euclidean, dotproduct`);
    }
    const collectionExists = await this.db.listCollections({ name: indexName }).hasNext();
    if (!collectionExists) {
      await this.db.createCollection(indexName);
    }
    const collection = await this.getCollection(indexName);
    const indexNameInternal = `${indexName}_vector_index`;
    const embeddingField = this.embeddingFieldName;
    const numDimensions = dimension;
    try {
      await collection.createSearchIndex({
        definition: {
          fields: [
            {
              type: "vector",
              path: embeddingField,
              numDimensions,
              similarity: mongoMetric
            }
          ]
        },
        name: indexNameInternal,
        type: "vectorSearch"
      });
    } catch (error) {
      if (error.codeName !== "IndexAlreadyExists") {
        throw error;
      }
    }
    await collection.updateOne({ _id: "__index_metadata__" }, { $set: { dimension, metric } }, { upsert: true });
  }
  /**
   * Waits for the index to be ready.
   *
   * @param {string} indexName - The name of the index to wait for
   * @param {number} timeoutMs - The maximum time in milliseconds to wait for the index to be ready (default: 60000)
   * @param {number} checkIntervalMs - The interval in milliseconds at which to check if the index is ready (default: 2000)
   * @returns A promise that resolves when the index is ready
   */
  async waitForIndexReady({
    indexName,
    timeoutMs = 6e4,
    checkIntervalMs = 2e3
  }) {
    const collection = await this.getCollection(indexName, true);
    const indexNameInternal = `${indexName}_vector_index`;
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const indexInfo = await collection.listSearchIndexes().toArray();
      const indexData = indexInfo.find((idx) => idx.name === indexNameInternal);
      const status = indexData?.status;
      if (status === "READY") {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
    }
    throw new Error(`Index "${indexNameInternal}" did not become ready within timeout`);
  }
  async upsert({ indexName, vectors, metadata, ids, documents }) {
    const collection = await this.getCollection(indexName);
    this.collectionForValidation = collection;
    const stats = await this.describeIndex({ indexName });
    await this.validateVectorDimensions(vectors, stats.dimension);
    const generatedIds = ids || vectors.map(() => v4());
    const operations = vectors.map((vector, idx) => {
      const id = generatedIds[idx];
      const meta = metadata?.[idx] || {};
      const doc = documents?.[idx];
      const normalizedMeta = Object.keys(meta).reduce(
        (acc, key) => {
          acc[key] = meta[key] instanceof Date ? meta[key].toISOString() : meta[key];
          return acc;
        },
        {}
      );
      const updateDoc = {
        [this.embeddingFieldName]: vector,
        [this.metadataFieldName]: normalizedMeta
      };
      if (doc !== void 0) {
        updateDoc[this.documentFieldName] = doc;
      }
      return {
        updateOne: {
          filter: { _id: id },
          // '_id' is a string as per MongoDBDocument interface
          update: { $set: updateDoc },
          upsert: true
        }
      };
    });
    await collection.bulkWrite(operations);
    return generatedIds;
  }
  async query({
    indexName,
    queryVector,
    topK = 10,
    filter,
    includeVector = false,
    documentFilter
  }) {
    const collection = await this.getCollection(indexName, true);
    const indexNameInternal = `${indexName}_vector_index`;
    const mongoFilter = this.transformFilter(filter);
    const documentMongoFilter = documentFilter ? { [this.documentFieldName]: documentFilter } : {};
    let combinedFilter = {};
    if (Object.keys(mongoFilter).length > 0 && Object.keys(documentMongoFilter).length > 0) {
      combinedFilter = { $and: [mongoFilter, documentMongoFilter] };
    } else if (Object.keys(mongoFilter).length > 0) {
      combinedFilter = mongoFilter;
    } else if (Object.keys(documentMongoFilter).length > 0) {
      combinedFilter = documentMongoFilter;
    }
    const pipeline = [
      {
        $vectorSearch: {
          index: indexNameInternal,
          queryVector,
          path: this.embeddingFieldName,
          numCandidates: 100,
          limit: topK
        }
      },
      // Apply the filter using $match stage
      ...Object.keys(combinedFilter).length > 0 ? [{ $match: combinedFilter }] : [],
      {
        $set: { score: { $meta: "vectorSearchScore" } }
      },
      {
        $project: {
          _id: 1,
          score: 1,
          metadata: `$${this.metadataFieldName}`,
          document: `$${this.documentFieldName}`,
          ...includeVector && { vector: `$${this.embeddingFieldName}` }
        }
      }
    ];
    try {
      const results = await collection.aggregate(pipeline).toArray();
      return results.map((result) => ({
        id: result._id,
        score: result.score,
        metadata: result.metadata,
        vector: includeVector ? result.vector : void 0,
        document: result.document
      }));
    } catch (error) {
      console.error("Error during vector search:", error);
      throw error;
    }
  }
  async listIndexes() {
    const collections = await this.db.listCollections().toArray();
    return collections.map((col) => col.name);
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the index to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName }) {
    const collection = await this.getCollection(indexName, true);
    const count = await collection.countDocuments({ _id: { $ne: "__index_metadata__" } });
    const metadataDoc = await collection.findOne({ _id: "__index_metadata__" });
    const dimension = metadataDoc?.dimension || 0;
    const metric = metadataDoc?.metric || "cosine";
    return {
      dimension,
      count,
      metric
    };
  }
  async deleteIndex({ indexName }) {
    const collection = await this.getCollection(indexName, false);
    if (collection) {
      await collection.drop();
      this.collections.delete(indexName);
    } else {
      throw new Error(`Index (Collection) "${indexName}" does not exist`);
    }
  }
  /**
   * Updates a vector by its ID with the provided vector and/or metadata.
   * @param indexName - The name of the index containing the vector.
   * @param id - The ID of the vector to update.
   * @param update - An object containing the vector and/or metadata to update.
   * @param update.vector - An optional array of numbers representing the new vector.
   * @param update.metadata - An optional record containing the new metadata.
   * @returns A promise that resolves when the update is complete.
   * @throws Will throw an error if no updates are provided or if the update operation fails.
   */
  async updateVector({ indexName, id, update }) {
    try {
      if (!update.vector && !update.metadata) {
        throw new Error("No updates provided");
      }
      const collection = await this.getCollection(indexName, true);
      const updateDoc = {};
      if (update.vector) {
        const stats = await this.describeIndex({ indexName });
        await this.validateVectorDimensions([update.vector], stats.dimension);
        updateDoc[this.embeddingFieldName] = update.vector;
      }
      if (update.metadata) {
        const normalizedMeta = Object.keys(update.metadata).reduce(
          (acc, key) => {
            acc[key] = update.metadata[key] instanceof Date ? update.metadata[key].toISOString() : update.metadata[key];
            return acc;
          },
          {}
        );
        updateDoc[this.metadataFieldName] = normalizedMeta;
      }
      await collection.findOneAndUpdate({ _id: id }, { $set: updateDoc });
    } catch (error) {
      throw new Error(`Failed to update vector by id: ${id} for index name: ${indexName}: ${error.message}`);
    }
  }
  /**
   * Deletes a vector by its ID.
   * @param indexName - The name of the index containing the vector.
   * @param id - The ID of the vector to delete.
   * @returns A promise that resolves when the deletion is complete.
   * @throws Will throw an error if the deletion operation fails.
   */
  async deleteVector({ indexName, id }) {
    try {
      const collection = await this.getCollection(indexName, true);
      await collection.deleteOne({ _id: id });
    } catch (error) {
      throw new Error(`Failed to delete vector by id: ${id} for index name: ${indexName}: ${error.message}`);
    }
  }
  // Private methods
  async getCollection(indexName, throwIfNotExists = true) {
    if (this.collections.has(indexName)) {
      return this.collections.get(indexName);
    }
    const collection = this.db.collection(indexName);
    const collectionExists = await this.db.listCollections({ name: indexName }).hasNext();
    if (!collectionExists && throwIfNotExists) {
      throw new Error(`Index (Collection) "${indexName}" does not exist`);
    }
    this.collections.set(indexName, collection);
    return collection;
  }
  async validateVectorDimensions(vectors, dimension) {
    if (vectors.length === 0) {
      throw new Error("No vectors provided for validation");
    }
    if (dimension === 0) {
      dimension = vectors[0] ? vectors[0].length : 0;
      await this.setIndexDimension(dimension);
    }
    for (let i = 0; i < vectors.length; i++) {
      let v = vectors[i]?.length;
      if (v !== dimension) {
        throw new Error(`Vector at index ${i} has invalid dimension ${v}. Expected ${dimension} dimensions.`);
      }
    }
  }
  async setIndexDimension(dimension) {
    const collection = this.collectionForValidation;
    await collection.updateOne({ _id: "__index_metadata__" }, { $set: { dimension } }, { upsert: true });
  }
  transformFilter(filter) {
    const translator = new MongoDBFilterTranslator();
    if (!filter) return {};
    return translator.translate(filter);
  }
};
function safelyParseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
}
var MongoDBStore = class extends MastraStorage {
  #isConnected = false;
  #client;
  #db;
  #dbName;
  constructor(config) {
    super({ name: "MongoDBStore" });
    this.#isConnected = false;
    if (!config.url?.trim().length) {
      throw new Error(
        "MongoDBStore: url must be provided and cannot be empty. Passing an empty string may cause fallback to local MongoDB defaults."
      );
    }
    if (!config.dbName?.trim().length) {
      throw new Error(
        "MongoDBStore: dbName must be provided and cannot be empty. Passing an empty string may cause fallback to local MongoDB defaults."
      );
    }
    this.#dbName = config.dbName;
    this.#client = new MongoClient(config.url, config.options);
  }
  async getConnection() {
    if (this.#isConnected) {
      return this.#db;
    }
    await this.#client.connect();
    this.#db = this.#client.db(this.#dbName);
    this.#isConnected = true;
    return this.#db;
  }
  async getCollection(collectionName) {
    const db = await this.getConnection();
    return db.collection(collectionName);
  }
  async createTable() {
  }
  /**
   * No-op: This backend is schemaless and does not require schema changes.
   * @param tableName Name of the table
   * @param schema Schema of the table
   * @param ifNotExists Array of column names to add if they don't exist
   */
  async alterTable(_args) {
  }
  async clearTable({ tableName }) {
    try {
      const collection = await this.getCollection(tableName);
      await collection.deleteMany({});
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
    }
  }
  async insert({ tableName, record }) {
    try {
      const collection = await this.getCollection(tableName);
      await collection.insertOne(record);
    } catch (error) {
      this.logger.error(`Error upserting into table ${tableName}: ${error}`);
      throw error;
    }
  }
  async batchInsert({ tableName, records }) {
    if (!records.length) {
      return;
    }
    try {
      const collection = await this.getCollection(tableName);
      await collection.insertMany(records);
    } catch (error) {
      this.logger.error(`Error upserting into table ${tableName}: ${error}`);
      throw error;
    }
  }
  async load({ tableName, keys }) {
    this.logger.info(`Loading ${tableName} with keys ${JSON.stringify(keys)}`);
    try {
      const collection = await this.getCollection(tableName);
      return await collection.find(keys).toArray();
    } catch (error) {
      this.logger.error(`Error loading ${tableName} with keys ${JSON.stringify(keys)}: ${error}`);
      throw error;
    }
  }
  async getThreadById({ threadId }) {
    try {
      const collection = await this.getCollection(TABLE_THREADS);
      const result = await collection.findOne({ id: threadId });
      if (!result) {
        return null;
      }
      return {
        ...result,
        metadata: typeof result.metadata === "string" ? JSON.parse(result.metadata) : result.metadata
      };
    } catch (error) {
      this.logger.error(`Error loading thread with ID ${threadId}: ${error}`);
      throw error;
    }
  }
  async getThreadsByResourceId({ resourceId }) {
    try {
      const collection = await this.getCollection(TABLE_THREADS);
      const results = await collection.find({ resourceId }).toArray();
      if (!results.length) {
        return [];
      }
      return results.map((result) => ({
        ...result,
        metadata: typeof result.metadata === "string" ? JSON.parse(result.metadata) : result.metadata
      }));
    } catch (error) {
      this.logger.error(`Error loading threads by resourceId ${resourceId}: ${error}`);
      throw error;
    }
  }
  async saveThread({ thread }) {
    try {
      const collection = await this.getCollection(TABLE_THREADS);
      await collection.updateOne(
        { id: thread.id },
        {
          $set: {
            ...thread,
            metadata: JSON.stringify(thread.metadata)
          }
        },
        { upsert: true }
      );
      return thread;
    } catch (error) {
      this.logger.error(`Error saving thread ${thread.id}: ${error}`);
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
    const updatedThread = {
      ...thread,
      title,
      metadata: {
        ...thread.metadata,
        ...metadata
      }
    };
    try {
      const collection = await this.getCollection(TABLE_THREADS);
      await collection.updateOne(
        { id },
        {
          $set: {
            title,
            metadata: JSON.stringify(updatedThread.metadata)
          }
        }
      );
    } catch (error) {
      this.logger.error(`Error updating thread ${id}:) ${error}`);
      throw error;
    }
    return updatedThread;
  }
  async deleteThread({ threadId }) {
    try {
      const collectionMessages = await this.getCollection(TABLE_MESSAGES);
      await collectionMessages.deleteMany({ thread_id: threadId });
      const collectionThreads = await this.getCollection(TABLE_THREADS);
      await collectionThreads.deleteOne({ id: threadId });
    } catch (error) {
      this.logger.error(`Error deleting thread ${threadId}: ${error}`);
      throw error;
    }
  }
  async getMessages({
    threadId,
    selectBy,
    format
  }) {
    try {
      const limit = typeof selectBy?.last === "number" ? selectBy.last : 40;
      const include = selectBy?.include || [];
      let messages = [];
      let allMessages = [];
      const collection = await this.getCollection(TABLE_MESSAGES);
      allMessages = (await collection.find({ thread_id: threadId }).sort({ createdAt: -1 }).toArray()).map(
        (row) => this.parseRow(row)
      );
      if (include.length) {
        const idToIndex = /* @__PURE__ */ new Map();
        allMessages.forEach((msg, idx) => {
          idToIndex.set(msg.id, idx);
        });
        const selectedIndexes = /* @__PURE__ */ new Set();
        for (const inc of include) {
          const idx = idToIndex.get(inc.id);
          if (idx === void 0) continue;
          for (let i = 1; i <= (inc.withPreviousMessages || 0); i++) {
            if (idx + i < allMessages.length) selectedIndexes.add(idx + i);
          }
          selectedIndexes.add(idx);
          for (let i = 1; i <= (inc.withNextMessages || 0); i++) {
            if (idx - i >= 0) selectedIndexes.add(idx - i);
          }
        }
        messages.push(
          ...Array.from(selectedIndexes).map((i) => allMessages[i]).filter((m) => !!m)
        );
      }
      const excludeIds = new Set(messages.map((m) => m.id));
      for (const msg of allMessages) {
        if (messages.length >= limit) break;
        if (!excludeIds.has(msg.id)) {
          messages.push(msg);
        }
      }
      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const list = new MessageList().add(messages.slice(0, limit), "memory");
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      this.logger.error("Error getting messages:", error);
      throw error;
    }
  }
  async saveMessages({
    messages,
    format
  }) {
    if (!messages.length) {
      return messages;
    }
    const threadId = messages[0]?.threadId;
    if (!threadId) {
      this.logger.error("Thread ID is required to save messages");
      throw new Error("Thread ID is required");
    }
    try {
      const messagesToInsert = messages.map((message) => {
        const time = message.createdAt || /* @__PURE__ */ new Date();
        return {
          id: message.id,
          thread_id: threadId,
          content: typeof message.content === "string" ? message.content : JSON.stringify(message.content),
          role: message.role,
          type: message.type,
          resourceId: message.resourceId,
          createdAt: time instanceof Date ? time.toISOString() : time
        };
      });
      const collection = await this.getCollection(TABLE_MESSAGES);
      const threadsCollection = await this.getCollection(TABLE_THREADS);
      await Promise.all([
        collection.insertMany(messagesToInsert),
        threadsCollection.updateOne({ id: threadId }, { $set: { updatedAt: /* @__PURE__ */ new Date() } })
      ]);
      const list = new MessageList().add(messages, "memory");
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      this.logger.error("Failed to save messages in database: " + error?.message);
      throw error;
    }
  }
  async getTraces({
    name,
    scope,
    page,
    perPage,
    attributes,
    filters
  } = {
    page: 0,
    perPage: 100
  }) {
    const limit = perPage;
    const offset = page * perPage;
    const query = {};
    if (name) {
      query["name"] = `%${name}%`;
    }
    if (scope) {
      query["scope"] = scope;
    }
    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        query[`attributes.${key}`] = attributes[key];
      });
    }
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query[key] = value;
      });
    }
    const collection = await this.getCollection(TABLE_TRACES);
    const result = await collection.find(query, {
      sort: { startTime: -1 }
    }).limit(limit).skip(offset).toArray();
    return result.map((row) => ({
      id: row.id,
      parentSpanId: row.parentSpanId,
      traceId: row.traceId,
      name: row.name,
      scope: row.scope,
      kind: row.kind,
      status: safelyParseJSON(row.status),
      events: safelyParseJSON(row.events),
      links: safelyParseJSON(row.links),
      attributes: safelyParseJSON(row.attributes),
      startTime: row.startTime,
      endTime: row.endTime,
      other: safelyParseJSON(row.other),
      createdAt: row.createdAt
    }));
  }
  async getWorkflowRuns({
    workflowName,
    fromDate,
    toDate,
    limit,
    offset
  } = {}) {
    const query = {};
    if (workflowName) {
      query["workflow_name"] = workflowName;
    }
    if (fromDate || toDate) {
      query["createdAt"] = {};
      if (fromDate) {
        query["createdAt"]["$gte"] = fromDate;
      }
      if (toDate) {
        query["createdAt"]["$lte"] = toDate;
      }
    }
    const collection = await this.getCollection(TABLE_WORKFLOW_SNAPSHOT);
    let total = 0;
    if (limit !== void 0 && offset !== void 0) {
      total = await collection.countDocuments(query);
    }
    const request = collection.find(query).sort({ createdAt: "desc" });
    if (limit) {
      request.limit(limit);
    }
    if (offset) {
      request.skip(offset);
    }
    const result = await request.toArray();
    const runs = result.map((row) => {
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
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      };
    });
    return { runs, total: total || runs.length };
  }
  async getEvalsByAgentName(agentName, type) {
    try {
      const query = {
        agent_name: agentName
      };
      if (type === "test") {
        query["test_info"] = { $ne: null };
      }
      if (type === "live") {
        query["test_info"] = null;
      }
      const collection = await this.getCollection(TABLE_EVALS);
      const documents = await collection.find(query).sort({ created_at: "desc" }).toArray();
      const result = documents.map((row) => this.transformEvalRow(row));
      return result.filter((row) => {
        if (type === "live") {
          return !Boolean(row.testInfo?.testPath);
        }
        if (type === "test") {
          return row.testInfo?.testPath !== null;
        }
        return true;
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("no such table")) {
        return [];
      }
      this.logger.error("Failed to get evals for the specified agent: " + error?.message);
      throw error;
    }
  }
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    try {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const collection = await this.getCollection(TABLE_WORKFLOW_SNAPSHOT);
      await collection.updateOne(
        { workflow_name: workflowName, run_id: runId },
        {
          $set: {
            snapshot: JSON.stringify(snapshot),
            updatedAt: now
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        { upsert: true }
      );
    } catch (error) {
      this.logger.error(`Error persisting workflow snapshot: ${error}`);
      throw error;
    }
  }
  async loadWorkflowSnapshot({
    workflowName,
    runId
  }) {
    try {
      const result = await this.load({
        tableName: TABLE_WORKFLOW_SNAPSHOT,
        keys: {
          workflow_name: workflowName,
          run_id: runId
        }
      });
      if (!result?.length) {
        return null;
      }
      return JSON.parse(result[0].snapshot);
    } catch (error) {
      console.error("Error loading workflow snapshot:", error);
      throw error;
    }
  }
  async getWorkflowRunById({
    runId,
    workflowName
  }) {
    try {
      const query = {};
      if (runId) {
        query["run_id"] = runId;
      }
      if (workflowName) {
        query["workflow_name"] = workflowName;
      }
      const collection = await this.getCollection(TABLE_WORKFLOW_SNAPSHOT);
      const result = await collection.findOne(query);
      if (!result) {
        return null;
      }
      return this.parseWorkflowRun(result);
    } catch (error) {
      console.error("Error getting workflow run by ID:", error);
      throw error;
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
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      resourceId: row.resourceId
    };
  }
  parseRow(row) {
    let content = row.content;
    try {
      content = JSON.parse(row.content);
    } catch {
    }
    return {
      id: row.id,
      content,
      role: row.role,
      type: row.type,
      createdAt: new Date(row.createdAt),
      threadId: row.thread_id,
      resourceId: row.resourceId
    };
  }
  transformEvalRow(row) {
    let testInfoValue = null;
    if (row.test_info) {
      try {
        testInfoValue = typeof row.test_info === "string" ? JSON.parse(row.test_info) : row.test_info;
      } catch (e) {
        console.warn("Failed to parse test_info:", e);
      }
    }
    return {
      input: row.input,
      output: row.output,
      result: row.result,
      agentName: row.agent_name,
      metricName: row.metric_name,
      instructions: row.instructions,
      testInfo: testInfoValue,
      globalRunId: row.global_run_id,
      runId: row.run_id,
      createdAt: row.created_at
    };
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
  async close() {
    await this.#client.close();
  }
  async updateMessages(_args) {
    this.logger.error("updateMessages is not yet implemented in MongoDBStore");
    throw new Error("Method not implemented");
  }
};

// src/vector/prompt.ts
var MONGODB_PROMPT = `When querying MongoDB Vector, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }
- $all: Match all values in array
  Example: { "tags": { "$all": ["premium", "sale"] } }
- $elemMatch: Match array elements that meet all specified conditions
  Example: { "items": { "$elemMatch": { "price": { "$gt": 100 } } } }
- $size: Match arrays with specific length
  Example: { "tags": { "$size": 3 } }

Logical Operators:
- $and: Logical AND (can be implicit or explicit)
  Implicit Example: { "price": { "$gt": 100 }, "category": "electronics" }
  Explicit Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }
- $not: Logical NOT
  Example: { "$not": { "category": "electronics" } }
- $nor: Logical NOR
  Example: { "$nor": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }
- $type: Check field type
  Example: { "price": { "$type": "number" } }

Text Search Operators:
- $text: Full text search
  Example: { "$text": { "$search": "gaming laptop" } }
- $regex: Regular expression match
  Example: { "name": { "$regex": "^Gaming" } }

Restrictions:
- Only logical operators ($and, $or, $not, $nor) can be used at the top level
- Empty arrays in array operators will return no results
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported
- At least one key-value pair is required in filter object
- Empty objects and undefined values are treated as no filter
- Invalid types in comparison operators will throw errors
- All non-logical operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- Logical operators ($and, $or, $not, $nor):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }

Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics", "computers"] } },
    { "price": { "$gte": 100, "$lte": 1000 } },
    { "tags": { "$all": ["premium", "sale"] } },
    { "items": { "$elemMatch": { "price": { "$gt": 50 }, "inStock": true } } },
    { "$text": { "$search": "gaming laptop" } },
    { "$or": [
      { "stock": { "$gt": 0 } },
      { "preorder": true }
    ]},
    { "$not": { "status": "discontinued" } }
  ]
}`;

export { MONGODB_PROMPT, MongoDBStore, MongoDBVector };
