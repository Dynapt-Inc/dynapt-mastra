'use strict';

var astraDbTs = require('@datastax/astra-db-ts');
var vector = require('@mastra/core/vector');
var filter = require('@mastra/core/vector/filter');

// src/vector/index.ts
var AstraFilterTranslator = class extends filter.BaseFilterTranslator {
  getSupportedOperators() {
    return {
      ...filter.BaseFilterTranslator.DEFAULT_OPERATORS,
      array: ["$all", "$in", "$nin"],
      logical: ["$and", "$or", "$not"],
      regex: [],
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
      throw new Error("Regex is not supported in Astra DB");
    }
    if (this.isPrimitive(node) || Array.isArray(node)) {
      return node;
    }
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
    if (this.isBasicOperator(operator) || this.isNumericOperator(operator)) {
      return this.normalizeComparisonValue(value);
    }
    if (this.isArrayOperator(operator) && Array.isArray(value)) {
      return this.normalizeArrayValues(value);
    }
    return this.translateNode(value);
  }
};

// src/vector/index.ts
var metricMap = {
  cosine: "cosine",
  euclidean: "euclidean",
  dotproduct: "dot_product"
};
var AstraVector = class extends vector.MastraVector {
  #db;
  constructor({ token, endpoint, keyspace }) {
    super();
    const client = new astraDbTs.DataAPIClient(token);
    this.#db = client.db(endpoint, { keyspace });
  }
  /**
   * Creates a new collection with the specified configuration.
   *
   * @param {string} indexName - The name of the collection to create.
   * @param {number} dimension - The dimension of the vectors to be stored in the collection.
   * @param {'cosine' | 'euclidean' | 'dotproduct'} [metric=cosine] - The metric to use to sort vectors in the collection.
   * @returns {Promise<void>} A promise that resolves when the collection is created.
   */
  async createIndex({ indexName, dimension, metric = "cosine" }) {
    if (!Number.isInteger(dimension) || dimension <= 0) {
      throw new Error("Dimension must be a positive integer");
    }
    await this.#db.createCollection(indexName, {
      vector: {
        dimension,
        metric: metricMap[metric]
      },
      checkExists: false
    });
  }
  /**
   * Inserts or updates vectors in the specified collection.
   *
   * @param {string} indexName - The name of the collection to upsert into.
   * @param {number[][]} vectors - An array of vectors to upsert.
   * @param {Record<string, any>[]} [metadata] - An optional array of metadata objects corresponding to each vector.
   * @param {string[]} [ids] - An optional array of IDs corresponding to each vector. If not provided, new IDs will be generated.
   * @returns {Promise<string[]>} A promise that resolves to an array of IDs of the upserted vectors.
   */
  async upsert({ indexName, vectors, metadata, ids }) {
    const collection = this.#db.collection(indexName);
    const vectorIds = ids || vectors.map(() => astraDbTs.UUID.v7().toString());
    const records = vectors.map((vector, i) => ({
      id: vectorIds[i],
      $vector: vector,
      metadata: metadata?.[i] || {}
    }));
    await collection.insertMany(records);
    return vectorIds;
  }
  transformFilter(filter) {
    const translator = new AstraFilterTranslator();
    return translator.translate(filter);
  }
  /**
   * Queries the specified collection using a vector and optional filter.
   *
   * @param {string} indexName - The name of the collection to query.
   * @param {number[]} queryVector - The vector to query with.
   * @param {number} [topK] - The maximum number of results to return.
   * @param {Record<string, any>} [filter] - An optional filter to apply to the query. For more on filters in Astra DB, see the filtering reference: https://docs.datastax.com/en/astra-db-serverless/api-reference/documents.html#operators
   * @param {boolean} [includeVectors=false] - Whether to include the vectors in the response.
   * @returns {Promise<QueryResult[]>} A promise that resolves to an array of query results.
   */
  async query({
    indexName,
    queryVector,
    topK = 10,
    filter,
    includeVector = false
  }) {
    const collection = this.#db.collection(indexName);
    const translatedFilter = this.transformFilter(filter);
    const cursor = collection.find(translatedFilter ?? {}, {
      sort: { $vector: queryVector },
      limit: topK,
      includeSimilarity: true,
      projection: {
        $vector: includeVector ? true : false
      }
    });
    const results = await cursor.toArray();
    return results.map((result) => ({
      id: result.id,
      score: result.$similarity,
      metadata: result.metadata,
      ...includeVector && { vector: result.$vector }
    }));
  }
  /**
   * Lists all collections in the database.
   *
   * @returns {Promise<string[]>} A promise that resolves to an array of collection names.
   */
  listIndexes() {
    return this.#db.listCollections({ nameOnly: true });
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the index to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName }) {
    const collection = this.#db.collection(indexName);
    const optionsPromise = collection.options();
    const countPromise = collection.countDocuments({}, 100);
    const [options, count] = await Promise.all([optionsPromise, countPromise]);
    const keys = Object.keys(metricMap);
    const metric = keys.find((key) => metricMap[key] === options.vector?.metric);
    return {
      dimension: options.vector?.dimension,
      metric,
      count
    };
  }
  /**
   * Deletes the specified collection.
   *
   * @param {string} indexName - The name of the collection to delete.
   * @returns {Promise<void>} A promise that resolves when the collection is deleted.
   */
  async deleteIndex({ indexName }) {
    const collection = this.#db.collection(indexName);
    await collection.drop();
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
      const collection = this.#db.collection(indexName);
      const updateDoc = {};
      if (update.vector) {
        updateDoc.$vector = update.vector;
      }
      if (update.metadata) {
        updateDoc.metadata = update.metadata;
      }
      await collection.findOneAndUpdate({ id }, { $set: updateDoc });
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
      const collection = this.#db.collection(indexName);
      await collection.deleteOne({ id });
    } catch (error) {
      throw new Error(`Failed to delete vector by id: ${id} for index name: ${indexName}: ${error.message}`);
    }
  }
};

// src/vector/prompt.ts
var ASTRA_PROMPT = `When querying Astra, you can ONLY use the operators listed below. Any other operators will be rejected.
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

Special Operators:
- $size: Array length check
  Example: { "tags": { "$size": 2 } }

Restrictions:
- Regex patterns are not supported
- Only $and, $or, and $not logical operators are supported
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
- Empty arrays in $in/$nin will return no results
- A non-empty array is required for $all operator
- Only logical operators ($and, $or, $not) can be used at the top level
- All other operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- $not operator:
  - Must be an object
  - Cannot be empty
  - Can be used at field level or top level
  - Valid: { "$not": { "field": "value" } }
  - Valid: { "field": { "$not": { "$eq": "value" } } }
- Other logical operators ($and, $or):
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
    { "tags": { "$all": ["premium"] } },
    { "rating": { "$exists": true, "$gt": 4 } },
    { "$or": [
      { "stock": { "$gt": 0 } },
      { "preorder": true }
    ]}
  ]
}`;

exports.ASTRA_PROMPT = ASTRA_PROMPT;
exports.AstraVector = AstraVector;
