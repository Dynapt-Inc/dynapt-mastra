'use strict';

var vector = require('@mastra/core/vector');
var jsClientRest = require('@qdrant/js-client-rest');
var filter = require('@mastra/core/vector/filter');

// src/vector/index.ts
var QdrantFilterTranslator = class extends filter.BaseFilterTranslator {
  isLogicalOperator(key) {
    return super.isLogicalOperator(key) || key === "$hasId" || key === "$hasVector";
  }
  getSupportedOperators() {
    return {
      ...filter.BaseFilterTranslator.DEFAULT_OPERATORS,
      logical: ["$and", "$or", "$not"],
      array: ["$in", "$nin"],
      regex: ["$regex"],
      custom: ["$count", "$geo", "$nested", "$datetime", "$null", "$empty", "$hasId", "$hasVector"]
    };
  }
  translate(filter) {
    if (this.isEmpty(filter)) return filter;
    this.validateFilter(filter);
    return this.translateNode(filter);
  }
  createCondition(type, value, fieldKey) {
    const condition = { [type]: value };
    return fieldKey ? { key: fieldKey, ...condition } : condition;
  }
  translateNode(node, isNested = false, fieldKey) {
    if (!this.isEmpty(node) && typeof node === "object" && "must" in node) {
      return node;
    }
    if (this.isPrimitive(node)) {
      if (node === null) {
        return { is_null: { key: fieldKey } };
      }
      return this.createCondition("match", { value: this.normalizeComparisonValue(node) }, fieldKey);
    }
    if (this.isRegex(node)) {
      throw new Error("Direct regex pattern format is not supported in Qdrant");
    }
    if (Array.isArray(node)) {
      return node.length === 0 ? { is_empty: { key: fieldKey } } : this.createCondition("match", { any: this.normalizeArrayValues(node) }, fieldKey);
    }
    const entries = Object.entries(node);
    const logicalResult = this.handleLogicalOperators(entries, isNested);
    if (logicalResult) {
      return logicalResult;
    }
    const { conditions, range, matchCondition } = this.handleFieldConditions(entries, fieldKey);
    if (Object.keys(range).length > 0) {
      conditions.push({ key: fieldKey, range });
    }
    if (matchCondition) {
      conditions.push({ key: fieldKey, match: matchCondition });
    }
    return this.buildFinalConditions(conditions, isNested);
  }
  buildFinalConditions(conditions, isNested) {
    if (conditions.length === 0) {
      return {};
    } else if (conditions.length === 1 && isNested) {
      return conditions[0];
    } else {
      return { must: conditions };
    }
  }
  handleLogicalOperators(entries, isNested) {
    const firstKey = entries[0]?.[0];
    if (firstKey && this.isLogicalOperator(firstKey) && !this.isCustomOperator(firstKey)) {
      const [key, value] = entries[0];
      const qdrantOp = this.getQdrantLogicalOp(key);
      return {
        [qdrantOp]: Array.isArray(value) ? value.map((v) => this.translateNode(v, true)) : [this.translateNode(value, true)]
      };
    }
    if (entries.length > 1 && !isNested && entries.every(([key]) => !this.isOperator(key) && !this.isCustomOperator(key))) {
      return {
        must: entries.map(([key, value]) => this.translateNode(value, true, key))
      };
    }
    return null;
  }
  handleFieldConditions(entries, fieldKey) {
    const conditions = [];
    let range = {};
    let matchCondition = null;
    for (const [key, value] of entries) {
      if (this.isCustomOperator(key)) {
        const customOp = this.translateCustomOperator(key, value, fieldKey);
        conditions.push(customOp);
      } else if (this.isOperator(key)) {
        const opResult = this.translateOperatorValue(key, value);
        if (opResult.range) {
          Object.assign(range, opResult.range);
        } else {
          matchCondition = opResult;
        }
      } else {
        const nestedKey = fieldKey ? `${fieldKey}.${key}` : key;
        const nestedCondition = this.translateNode(value, true, nestedKey);
        if (nestedCondition.must) {
          conditions.push(...nestedCondition.must);
        } else if (!this.isEmpty(nestedCondition)) {
          conditions.push(nestedCondition);
        }
      }
    }
    return { conditions, range, matchCondition };
  }
  translateCustomOperator(op, value, fieldKey) {
    switch (op) {
      case "$count":
        const countConditions = Object.entries(value).reduce(
          (acc, [k, v]) => ({
            ...acc,
            [k.replace("$", "")]: v
          }),
          {}
        );
        return { key: fieldKey, values_count: countConditions };
      case "$geo":
        const geoOp = this.translateGeoFilter(value.type, value);
        return { key: fieldKey, ...geoOp };
      case "$hasId":
        return { has_id: Array.isArray(value) ? value : [value] };
      case "$nested":
        return {
          nested: {
            key: fieldKey,
            filter: this.translateNode(value)
          }
        };
      case "$hasVector":
        return { has_vector: value };
      case "$datetime":
        return {
          key: fieldKey,
          range: this.normalizeDatetimeRange(value.range)
        };
      case "$null":
        return { is_null: { key: fieldKey } };
      case "$empty":
        return { is_empty: { key: fieldKey } };
      default:
        throw new Error(`Unsupported custom operator: ${op}`);
    }
  }
  getQdrantLogicalOp(op) {
    switch (op) {
      case "$and":
        return "must";
      case "$or":
        return "should";
      case "$not":
        return "must_not";
      default:
        throw new Error(`Unsupported logical operator: ${op}`);
    }
  }
  translateOperatorValue(operator, value) {
    const normalizedValue = this.normalizeComparisonValue(value);
    switch (operator) {
      case "$eq":
        return { value: normalizedValue };
      case "$ne":
        return { except: [normalizedValue] };
      case "$gt":
        return { range: { gt: normalizedValue } };
      case "$gte":
        return { range: { gte: normalizedValue } };
      case "$lt":
        return { range: { lt: normalizedValue } };
      case "$lte":
        return { range: { lte: normalizedValue } };
      case "$in":
        return { any: this.normalizeArrayValues(value) };
      case "$nin":
        return { except: this.normalizeArrayValues(value) };
      case "$regex":
        return { text: value };
      case "exists":
        return value ? {
          must_not: [{ is_null: { key: value } }, { is_empty: { key: value } }]
        } : {
          is_empty: { key: value }
        };
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
  translateGeoFilter(type, value) {
    switch (type) {
      case "box":
        return {
          geo_bounding_box: {
            top_left: value.top_left,
            bottom_right: value.bottom_right
          }
        };
      case "radius":
        return {
          geo_radius: {
            center: value.center,
            radius: value.radius
          }
        };
      case "polygon":
        return {
          geo_polygon: {
            exterior: value.exterior,
            interiors: value.interiors
          }
        };
      default:
        throw new Error(`Unsupported geo filter type: ${type}`);
    }
  }
  normalizeDatetimeRange(value) {
    const range = {};
    for (const [op, val] of Object.entries(value)) {
      if (val instanceof Date) {
        range[op] = val.toISOString();
      } else if (typeof val === "string") {
        range[op] = val;
      }
    }
    return range;
  }
};

// src/vector/index.ts
var BATCH_SIZE = 256;
var DISTANCE_MAPPING = {
  cosine: "Cosine",
  euclidean: "Euclid",
  dotproduct: "Dot"
};
var QdrantVector = class extends vector.MastraVector {
  client;
  /**
   * Creates a new QdrantVector client.
   * @param url - The URL of the Qdrant server.
   * @param apiKey - The API key for Qdrant.
   * @param https - Whether to use HTTPS.
   */
  constructor({ url, apiKey, https }) {
    super();
    const baseClient = new jsClientRest.QdrantClient({
      url,
      apiKey,
      https
    });
    const telemetry = this.__getTelemetry();
    this.client = telemetry?.traceClass(baseClient, {
      spanNamePrefix: "qdrant-vector",
      attributes: {
        "vector.type": "qdrant"
      }
    }) ?? baseClient;
  }
  async upsert({ indexName, vectors, metadata, ids }) {
    const pointIds = ids || vectors.map(() => crypto.randomUUID());
    const records = vectors.map((vector, i) => ({
      id: pointIds[i],
      vector,
      payload: metadata?.[i] || {}
    }));
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await this.client.upsert(indexName, {
        // @ts-expect-error
        points: batch,
        wait: true
      });
    }
    return pointIds;
  }
  async createIndex({ indexName, dimension, metric = "cosine" }) {
    if (!Number.isInteger(dimension) || dimension <= 0) {
      throw new Error("Dimension must be a positive integer");
    }
    if (!DISTANCE_MAPPING[metric]) {
      throw new Error(`Invalid metric: "${metric}". Must be one of: cosine, euclidean, dotproduct`);
    }
    try {
      await this.client.createCollection(indexName, {
        vectors: {
          size: dimension,
          distance: DISTANCE_MAPPING[metric]
        }
      });
    } catch (error) {
      const message = error?.message || error?.toString();
      if (error?.status === 409 || typeof message === "string" && message.toLowerCase().includes("exists")) {
        await this.validateExistingIndex(indexName, dimension, metric);
        return;
      }
    }
  }
  transformFilter(filter) {
    const translator = new QdrantFilterTranslator();
    return translator.translate(filter);
  }
  async query({
    indexName,
    queryVector,
    topK = 10,
    filter,
    includeVector = false
  }) {
    const translatedFilter = this.transformFilter(filter) ?? {};
    const results = (await this.client.query(indexName, {
      query: queryVector,
      limit: topK,
      filter: translatedFilter,
      with_payload: true,
      with_vector: includeVector
    })).points;
    return results.map((match) => {
      let vector = [];
      if (includeVector) {
        if (Array.isArray(match.vector)) {
          vector = match.vector;
        } else if (typeof match.vector === "object" && match.vector !== null) {
          vector = Object.values(match.vector).filter((v) => typeof v === "number");
        }
      }
      return {
        id: match.id,
        score: match.score || 0,
        metadata: match.payload,
        ...includeVector && { vector }
      };
    });
  }
  async listIndexes() {
    const response = await this.client.getCollections();
    return response.collections.map((collection) => collection.name) || [];
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the index to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName }) {
    const { config, points_count } = await this.client.getCollection(indexName);
    const distance = config.params.vectors?.distance;
    return {
      dimension: config.params.vectors?.size,
      count: points_count || 0,
      // @ts-expect-error
      metric: Object.keys(DISTANCE_MAPPING).find((key) => DISTANCE_MAPPING[key] === distance)
    };
  }
  async deleteIndex({ indexName }) {
    await this.client.deleteCollection(indexName);
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
    if (!update.vector && !update.metadata) {
      throw new Error("No updates provided");
    }
    const pointId = this.parsePointId(id);
    try {
      if (update.metadata && !update.vector) {
        await this.client.setPayload(indexName, { payload: update.metadata, points: [pointId] });
        return;
      }
      if (update.vector && !update.metadata) {
        await this.client.updateVectors(indexName, {
          points: [
            {
              id: pointId,
              vector: update.vector
            }
          ]
        });
        return;
      }
      if (update.vector && update.metadata) {
        const point = {
          id: pointId,
          vector: update.vector,
          payload: update.metadata
        };
        await this.client.upsert(indexName, {
          points: [point]
        });
        return;
      }
    } catch (error) {
      console.error(`Failed to update vector by id: ${id} for index name: ${indexName}:`, error);
      throw error;
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
      const pointId = this.parsePointId(id);
      await this.client.delete(indexName, {
        points: [pointId]
      });
    } catch (error) {
      throw new Error(`Failed to delete vector by id: ${id} for index name: ${indexName}: ${error.message}`);
    }
  }
  /**
   * Parses and converts a string ID to the appropriate type (string or number) for Qdrant point operations.
   *
   * Qdrant supports both numeric and string IDs. This helper method ensures IDs are in the correct format
   * before sending them to the Qdrant client API.
   *
   * @param id - The ID string to parse
   * @returns The parsed ID as either a number (if string contains only digits) or the original string
   *
   * @example
   * // Numeric ID strings are converted to numbers
   * parsePointId("123") => 123
   * parsePointId("42") => 42
   * parsePointId("0") => 0
   *
   * // String IDs containing any non-digit characters remain as strings
   * parsePointId("doc-123") => "doc-123"
   * parsePointId("user_42") => "user_42"
   * parsePointId("abc123") => "abc123"
   * parsePointId("123abc") => "123abc"
   * parsePointId("") => ""
   * parsePointId("uuid-5678-xyz") => "uuid-5678-xyz"
   *
   * @remarks
   * - This conversion is important because Qdrant treats numeric and string IDs differently
   * - Only positive integers are converted to numbers (negative numbers with minus signs remain strings)
   * - The method uses base-10 parsing, so leading zeros will be dropped in numeric conversions
   * - reference: https://qdrant.tech/documentation/concepts/points/?q=qdrant+point+id#point-ids
   */
  parsePointId(id) {
    if (/^\d+$/.test(id)) {
      return parseInt(id, 10);
    }
    return id;
  }
};

// src/vector/prompt.ts
var QDRANT_PROMPT = `When querying Qdrant, you can ONLY use the operators listed below. Any other operators will be rejected.
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

Logical Operators:
- $and: Logical AND (can be implicit or explicit)
  Implicit Example: { "price": { "$gt": 100 }, "category": "electronics" }
  Explicit Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }
- $not: Logical NOT
  Example: { "$not": { "category": "electronics" } }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }
- $match: Match text using full-text search
  Example: { "description": { "$match": "gaming laptop" } }
- $null: Check if field is null
  Example: { "rating": { "$null": true } }

Restrictions:
- Regex patterns are not supported
- Only $and, $or, and $not logical operators are supported at the top level
- Empty arrays in $in/$nin will return no results
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
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
- Logical operators ($and, $or, $not):
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
    { "description": { "$match": "gaming laptop" } },
    { "rating": { "$exists": true, "$gt": 4 } },
    { "$or": [
      { "stock": { "$gt": 0 } },
      { "preorder": { "$null": false } }
    ]},
    { "$not": { "status": "discontinued" } }
  ]
}`;

exports.QDRANT_PROMPT = QDRANT_PROMPT;
exports.QdrantVector = QdrantVector;
