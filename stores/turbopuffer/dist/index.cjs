'use strict';

var vector = require('@mastra/core/vector');
var turbopuffer = require('@turbopuffer/turbopuffer');
var filter = require('@mastra/core/vector/filter');

// src/vector/index.ts
var TurbopufferFilterTranslator = class extends filter.BaseFilterTranslator {
  getSupportedOperators() {
    return {
      ...filter.BaseFilterTranslator.DEFAULT_OPERATORS,
      logical: ["$and", "$or"],
      array: ["$in", "$nin", "$all"],
      element: ["$exists"],
      regex: [],
      // No regex support in Turbopuffer
      custom: []
      // No custom operators
    };
  }
  /**
   * Map Mastra operators to Turbopuffer operators
   */
  operatorMap = {
    $eq: "Eq",
    $ne: "NotEq",
    $gt: "Gt",
    $gte: "Gte",
    $lt: "Lt",
    $lte: "Lte",
    $in: "In",
    $nin: "NotIn"
  };
  /**
   * Convert the Mastra filter to Turbopuffer format
   */
  translate(filter) {
    if (this.isEmpty(filter)) {
      return void 0;
    }
    this.validateFilter(filter);
    const result = this.translateNode(filter);
    if (!Array.isArray(result) || result.length !== 2 || result[0] !== "And" && result[0] !== "Or") {
      return ["And", [result]];
    }
    return result;
  }
  /**
   * Recursively translate a filter node
   */
  translateNode(node) {
    if (node === null || node === void 0 || Object.keys(node).length === 0) {
      return ["And", []];
    }
    if (this.isPrimitive(node)) {
      throw new Error("Direct primitive values not valid in this context for Turbopuffer");
    }
    if (Array.isArray(node)) {
      throw new Error("Direct array values not valid in this context for Turbopuffer");
    }
    const entries = Object.entries(node);
    if (entries.length === 0) {
      return ["And", []];
    }
    const [key, value] = entries[0];
    if (key && this.isLogicalOperator(key)) {
      return this.translateLogical(key, value);
    }
    if (entries.length > 1) {
      const conditions = entries.map(([field, fieldValue]) => this.translateFieldCondition(field, fieldValue));
      return ["And", conditions];
    }
    return this.translateFieldCondition(key, value);
  }
  /**
   * Translate a field condition
   */
  translateFieldCondition(field, value) {
    if (value instanceof Date) {
      return [field, "Eq", this.normalizeValue(value)];
    }
    if (this.isPrimitive(value)) {
      return [field, "Eq", this.normalizeValue(value)];
    }
    if (Array.isArray(value)) {
      return [field, "In", this.normalizeArrayValues(value)];
    }
    if (typeof value === "object" && value !== null) {
      const operators = Object.keys(value);
      if (operators.length > 1) {
        const allOperators = operators.every((op2) => this.isOperator(op2));
        if (allOperators) {
          const conditions = operators.map((op2) => this.translateOperator(field, op2, value[op2]));
          return ["And", conditions];
        } else {
          const conditions = operators.map((op2) => {
            const nestedField = `${field}.${op2}`;
            return this.translateFieldCondition(nestedField, value[op2]);
          });
          return ["And", conditions];
        }
      }
      const op = operators[0];
      if (op && this.isOperator(op)) {
        return this.translateOperator(field, op, value[op]);
      }
      if (op && !this.isOperator(op)) {
        const nestedField = `${field}.${op}`;
        return this.translateFieldCondition(nestedField, value[op]);
      }
    }
    throw new Error(`Unsupported filter format for field: ${field}`);
  }
  /**
   * Translate a logical operator
   */
  translateLogical(operator, conditions) {
    const logicalOp = operator === "$and" ? "And" : "Or";
    if (!Array.isArray(conditions)) {
      throw new Error(`Logical operator ${operator} requires an array of conditions`);
    }
    const translatedConditions = conditions.map((condition) => {
      if (typeof condition !== "object" || condition === null) {
        throw new Error(`Invalid condition for logical operator ${operator}`);
      }
      return this.translateNode(condition);
    });
    return [logicalOp, translatedConditions];
  }
  /**
   * Translate a specific operator
   */
  translateOperator(field, operator, value) {
    if (operator && this.operatorMap[operator]) {
      return [field, this.operatorMap[operator], this.normalizeValue(value)];
    }
    switch (operator) {
      case "$exists":
        return value ? [field, "NotEq", null] : [field, "Eq", null];
      case "$all":
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error("$all operator requires a non-empty array");
        }
        const allConditions = value.map((item) => [field, "In", [this.normalizeValue(item)]]);
        return ["And", allConditions];
      default:
        throw new Error(`Unsupported operator: ${operator || "undefined"}`);
    }
  }
  /**
   * Normalize a value for comparison operations
   */
  normalizeValue(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }
  /**
   * Normalize array values
   */
  normalizeArrayValues(values) {
    return values.map((value) => this.normalizeValue(value));
  }
};

// src/vector/index.ts
var TurbopufferVector = class extends vector.MastraVector {
  client;
  filterTranslator;
  // There is no explicit create index operation in Turbopuffer, so just register that
  // someone has called createIndex() and verify that subsequent upsert calls are consistent
  // with how the index was "created"
  createIndexCache = /* @__PURE__ */ new Map();
  opts;
  constructor(opts) {
    super();
    this.filterTranslator = new TurbopufferFilterTranslator();
    this.opts = opts;
    const baseClient = new turbopuffer.Turbopuffer(opts);
    const telemetry = this.__getTelemetry();
    this.client = telemetry?.traceClass(baseClient, {
      spanNamePrefix: "turbopuffer-vector",
      attributes: {
        "vector.type": "turbopuffer"
      }
    }) ?? baseClient;
  }
  async createIndex({ indexName, dimension, metric }) {
    metric = metric ?? "cosine";
    if (this.createIndexCache.has(indexName)) {
      const expected = this.createIndexCache.get(indexName);
      if (dimension !== expected.dimension || metric !== expected.metric) {
        throw new Error(
          `createIndex() called more than once with inconsistent inputs. Index ${indexName} expected dimensions=${expected.dimension} and metric=${expected.metric} but got dimensions=${dimension} and metric=${metric}`
        );
      }
      return;
    }
    if (dimension <= 0) {
      throw new Error("Dimension must be a positive integer");
    }
    let distanceMetric = "cosine_distance";
    switch (metric) {
      case "cosine":
        distanceMetric = "cosine_distance";
        break;
      case "euclidean":
        distanceMetric = "euclidean_squared";
        break;
      case "dotproduct":
        throw new Error("dotproduct is not supported in Turbopuffer");
    }
    this.createIndexCache.set(indexName, {
      indexName,
      dimension,
      metric,
      tpufDistanceMetric: distanceMetric
    });
  }
  async upsert({ indexName, vectors, metadata, ids }) {
    try {
      if (vectors.length === 0) {
        throw new Error("upsert() called with empty vectors");
      }
      const index = this.client.namespace(indexName);
      const createIndex = this.createIndexCache.get(indexName);
      if (!createIndex) {
        throw new Error(`createIndex() not called for this index`);
      }
      const distanceMetric = createIndex.tpufDistanceMetric;
      const vectorIds = ids || vectors.map(() => crypto.randomUUID());
      const records = vectors.map((vector, i) => ({
        id: vectorIds[i],
        vector,
        attributes: metadata?.[i] || {}
      }));
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const upsertOptions = {
          vectors: batch,
          distance_metric: distanceMetric
        };
        const schemaConfig = this.opts.schemaConfigForIndex?.(indexName);
        if (schemaConfig) {
          upsertOptions.schema = schemaConfig.schema;
          if (vectors[0]?.length !== schemaConfig.dimensions) {
            throw new Error(
              `Turbopuffer index ${indexName} was configured with dimensions=${schemaConfig.dimensions} but attempting to upsert vectors[0].length=${vectors[0]?.length}`
            );
          }
        }
        await index.upsert(upsertOptions);
      }
      return vectorIds;
    } catch (error) {
      throw new Error(`Failed to upsert vectors into Turbopuffer namespace ${indexName}: ${error}`);
    }
  }
  async query({ indexName, queryVector, topK, filter, includeVector }) {
    const schemaConfig = this.opts.schemaConfigForIndex?.(indexName);
    if (schemaConfig) {
      if (queryVector.length !== schemaConfig.dimensions) {
        throw new Error(
          `Turbopuffer index ${indexName} was configured with dimensions=${schemaConfig.dimensions} but attempting to query with queryVector.length=${queryVector.length}`
        );
      }
    }
    const createIndex = this.createIndexCache.get(indexName);
    if (!createIndex) {
      throw new Error(`createIndex() not called for this index`);
    }
    const distanceMetric = createIndex.tpufDistanceMetric;
    try {
      const index = this.client.namespace(indexName);
      const translatedFilter = this.filterTranslator.translate(filter);
      const results = await index.query({
        distance_metric: distanceMetric,
        vector: queryVector,
        top_k: topK,
        filters: translatedFilter,
        include_vectors: includeVector,
        include_attributes: true,
        consistency: { level: "strong" }
        // todo: make this configurable somehow?
      });
      return results.map((item) => ({
        id: String(item.id),
        score: typeof item.dist === "number" ? item.dist : 0,
        metadata: item.attributes || {},
        ...includeVector && item.vector ? { vector: item.vector } : {}
      }));
    } catch (error) {
      throw new Error(`Failed to query Turbopuffer namespace ${indexName}: ${error}`);
    }
  }
  async listIndexes() {
    try {
      const namespacesResult = await this.client.namespaces({});
      return namespacesResult.namespaces.map((namespace) => namespace.id);
    } catch (error) {
      throw new Error(`Failed to list Turbopuffer namespaces: ${error}`);
    }
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the index to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName }) {
    try {
      const namespace = this.client.namespace(indexName);
      const metadata = await namespace.metadata();
      const createIndex = this.createIndexCache.get(indexName);
      if (!createIndex) {
        throw new Error(`createIndex() not called for this index`);
      }
      const dimension = metadata.dimensions;
      const count = metadata.approx_count;
      return {
        dimension,
        count,
        metric: createIndex.metric
      };
    } catch (error) {
      throw new Error(`Failed to describe Turbopuffer namespace ${indexName}: ${error}`);
    }
  }
  async deleteIndex({ indexName }) {
    try {
      const namespace = this.client.namespace(indexName);
      await namespace.deleteAll();
      this.createIndexCache.delete(indexName);
    } catch (error) {
      throw new Error(`Failed to delete Turbopuffer namespace ${indexName}: ${error.message}`);
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
      const namespace = this.client.namespace(indexName);
      const createIndex = this.createIndexCache.get(indexName);
      if (!createIndex) {
        throw new Error(`createIndex() not called for this index`);
      }
      const distanceMetric = createIndex.tpufDistanceMetric;
      const record = { id };
      if (update.vector) record.vector = update.vector;
      if (update.metadata) record.attributes = update.metadata;
      await namespace.upsert({
        vectors: [record],
        distance_metric: distanceMetric
      });
    } catch (error) {
      throw new Error(`Failed to update Turbopuffer namespace ${indexName}: ${error.message}`);
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
      const namespace = this.client.namespace(indexName);
      await namespace.delete({ ids: [id] });
    } catch (error) {
      throw new Error(`Failed to delete Turbopuffer namespace ${indexName}: ${error.message}`);
    }
  }
};

exports.TurbopufferVector = TurbopufferVector;
