'use strict';

var vector = require('@mastra/core/vector');
var chromadb = require('chromadb');
var filter = require('@mastra/core/vector/filter');

// src/vector/index.ts
var ChromaFilterTranslator = class extends filter.BaseFilterTranslator {
  getSupportedOperators() {
    return {
      ...filter.BaseFilterTranslator.DEFAULT_OPERATORS,
      logical: ["$and", "$or"],
      array: ["$in", "$nin"],
      element: [],
      regex: [],
      custom: []
    };
  }
  translate(filter) {
    if (this.isEmpty(filter)) return filter;
    this.validateFilter(filter);
    return this.translateNode(filter);
  }
  translateNode(node, currentPath = "") {
    if (this.isRegex(node)) {
      throw new Error("Regex is not supported in Chroma");
    }
    if (this.isPrimitive(node)) return this.normalizeComparisonValue(node);
    if (Array.isArray(node)) return { $in: this.normalizeArrayValues(node) };
    const entries = Object.entries(node);
    const firstEntry = entries[0];
    if (entries.length === 1 && firstEntry && this.isOperator(firstEntry[0])) {
      const [operator, value] = firstEntry;
      const translated = this.translateOperator(operator, value);
      return this.isLogicalOperator(operator) ? { [operator]: translated } : translated;
    }
    const result = {};
    const multiOperatorConditions = [];
    for (const [key, value] of entries) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      if (this.isOperator(key)) {
        result[key] = this.translateOperator(key, value);
        continue;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const valueEntries = Object.entries(value);
        if (valueEntries.every(([op]) => this.isOperator(op)) && valueEntries.length > 1) {
          valueEntries.forEach(([op, opValue]) => {
            multiOperatorConditions.push({
              [newPath]: { [op]: this.normalizeComparisonValue(opValue) }
            });
          });
          continue;
        }
        if (Object.keys(value).length === 0) {
          result[newPath] = this.translateNode(value);
        } else {
          const hasOperators = Object.keys(value).some((k) => this.isOperator(k));
          if (hasOperators) {
            const normalizedValue = {};
            for (const [op, opValue] of Object.entries(value)) {
              normalizedValue[op] = this.isOperator(op) ? this.translateOperator(op, opValue) : opValue;
            }
            result[newPath] = normalizedValue;
          } else {
            Object.assign(result, this.translateNode(value, newPath));
          }
        }
      } else {
        result[newPath] = this.translateNode(value);
      }
    }
    if (multiOperatorConditions.length > 0) {
      return { $and: multiOperatorConditions };
    }
    if (Object.keys(result).length > 1 && !currentPath) {
      return {
        $and: Object.entries(result).map(([key, value]) => ({ [key]: value }))
      };
    }
    return result;
  }
  translateOperator(operator, value) {
    if (this.isLogicalOperator(operator)) {
      return Array.isArray(value) ? value.map((item) => this.translateNode(item)) : this.translateNode(value);
    }
    return this.normalizeComparisonValue(value);
  }
};

// src/vector/index.ts
var ChromaVector = class extends vector.MastraVector {
  client;
  collections;
  constructor({
    path,
    auth
  }) {
    super();
    this.client = new chromadb.ChromaClient({
      path,
      auth
    });
    this.collections = /* @__PURE__ */ new Map();
  }
  async getCollection(indexName, throwIfNotExists = true) {
    try {
      const collection = await this.client.getCollection({ name: indexName, embeddingFunction: void 0 });
      this.collections.set(indexName, collection);
    } catch {
      if (throwIfNotExists) {
        throw new Error(`Index ${indexName} does not exist`);
      }
      return null;
    }
    return this.collections.get(indexName);
  }
  validateVectorDimensions(vectors, dimension) {
    for (let i = 0; i < vectors.length; i++) {
      if (vectors?.[i]?.length !== dimension) {
        throw new Error(
          `Vector at index ${i} has invalid dimension ${vectors?.[i]?.length}. Expected ${dimension} dimensions.`
        );
      }
    }
  }
  async upsert({ indexName, vectors, metadata, ids, documents }) {
    const collection = await this.getCollection(indexName);
    const stats = await this.describeIndex({ indexName });
    this.validateVectorDimensions(vectors, stats.dimension);
    const generatedIds = ids || vectors.map(() => crypto.randomUUID());
    const normalizedMetadata = metadata || vectors.map(() => ({}));
    await collection.upsert({
      ids: generatedIds,
      embeddings: vectors,
      metadatas: normalizedMetadata,
      documents
    });
    return generatedIds;
  }
  HnswSpaceMap = {
    cosine: "cosine",
    euclidean: "l2",
    dotproduct: "ip",
    l2: "euclidean",
    ip: "dotproduct"
  };
  async createIndex({ indexName, dimension, metric = "cosine" }) {
    if (!Number.isInteger(dimension) || dimension <= 0) {
      throw new Error("Dimension must be a positive integer");
    }
    const hnswSpace = this.HnswSpaceMap[metric];
    if (!["cosine", "l2", "ip"].includes(hnswSpace)) {
      throw new Error(`Invalid metric: "${metric}". Must be one of: cosine, euclidean, dotproduct`);
    }
    try {
      await this.client.createCollection({
        name: indexName,
        metadata: {
          dimension,
          "hnsw:space": hnswSpace
        }
      });
    } catch (error) {
      const message = error?.message || error?.toString();
      if (message && message.toLowerCase().includes("already exists")) {
        await this.validateExistingIndex(indexName, dimension, metric);
        return;
      }
      throw error;
    }
  }
  transformFilter(filter) {
    const translator = new ChromaFilterTranslator();
    return translator.translate(filter);
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
    const defaultInclude = ["documents", "metadatas", "distances"];
    const translatedFilter = this.transformFilter(filter);
    const results = await collection.query({
      queryEmbeddings: [queryVector],
      nResults: topK,
      where: translatedFilter,
      whereDocument: documentFilter,
      include: includeVector ? [...defaultInclude, "embeddings"] : defaultInclude
    });
    return (results.ids[0] || []).map((id, index) => ({
      id,
      score: results.distances?.[0]?.[index] || 0,
      metadata: results.metadatas?.[0]?.[index] || {},
      document: results.documents?.[0]?.[index],
      ...includeVector && { vector: results.embeddings?.[0]?.[index] || [] }
    }));
  }
  async listIndexes() {
    const collections = await this.client.listCollections();
    return collections.map((collection) => collection);
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the index to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName }) {
    const collection = await this.getCollection(indexName);
    const count = await collection.count();
    const metadata = collection.metadata;
    const hnswSpace = metadata?.["hnsw:space"];
    return {
      dimension: metadata?.dimension || 0,
      count,
      metric: this.HnswSpaceMap[hnswSpace]
    };
  }
  async deleteIndex({ indexName }) {
    await this.client.deleteCollection({ name: indexName });
    this.collections.delete(indexName);
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
      const updateOptions = { ids: [id] };
      if (update?.vector) {
        const stats = await this.describeIndex({ indexName });
        this.validateVectorDimensions([update.vector], stats.dimension);
        updateOptions.embeddings = [update.vector];
      }
      if (update?.metadata) {
        updateOptions.metadatas = [update.metadata];
      }
      return await collection.update(updateOptions);
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
      await collection.delete({ ids: [id] });
    } catch (error) {
      throw new Error(`Failed to delete vector by id: ${id} for index name: ${indexName}: ${error.message}`);
    }
  }
};

// src/vector/prompt.ts
var CHROMA_PROMPT = `When querying Chroma, you can ONLY use the operators listed below. Any other operators will be rejected.
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
- $and: Logical AND
  Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Restrictions:
- Regex patterns are not supported
- Element operators are not supported
- Only $and and $or logical operators are supported
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
- Empty arrays in $in/$nin will return no results
- If multiple top-level fields exist, they're wrapped in $and
- Only logical operators ($and, $or) can be used at the top level
- All other operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
  Invalid: { "$in": [...] }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- Logical operators ($and, $or):
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
    { "$or": [
      { "inStock": true },
      { "preorder": true }
    ]}
  ]
}`;

exports.CHROMA_PROMPT = CHROMA_PROMPT;
exports.ChromaVector = ChromaVector;
