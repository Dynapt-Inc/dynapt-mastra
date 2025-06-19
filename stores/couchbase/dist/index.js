import { MastraVector } from '@mastra/core/vector';
import { connect, SearchRequest, VectorSearch, VectorQuery, MutateInSpec } from 'couchbase';

// src/vector/index.ts
var DISTANCE_MAPPING = {
  cosine: "cosine",
  euclidean: "l2_norm",
  dotproduct: "dot_product"
};
var CouchbaseVector = class extends MastraVector {
  clusterPromise;
  cluster;
  bucketName;
  collectionName;
  scopeName;
  collection;
  bucket;
  scope;
  vector_dimension;
  constructor({ connectionString, username, password, bucketName, scopeName, collectionName }) {
    super();
    const baseClusterPromise = connect(connectionString, {
      username,
      password,
      configProfile: "wanDevelopment"
    });
    const telemetry = this.__getTelemetry();
    this.clusterPromise = telemetry?.traceClass(baseClusterPromise, {
      spanNamePrefix: "couchbase-vector",
      attributes: {
        "vector.type": "couchbase"
      }
    }) ?? baseClusterPromise;
    this.cluster = null;
    this.bucketName = bucketName;
    this.collectionName = collectionName;
    this.scopeName = scopeName;
    this.collection = null;
    this.bucket = null;
    this.scope = null;
    this.vector_dimension = null;
  }
  async getCollection() {
    if (!this.cluster) {
      this.cluster = await this.clusterPromise;
    }
    if (!this.collection) {
      this.bucket = this.cluster.bucket(this.bucketName);
      this.scope = this.bucket.scope(this.scopeName);
      this.collection = this.scope.collection(this.collectionName);
    }
    return this.collection;
  }
  async createIndex({ indexName, dimension, metric = "dotproduct" }) {
    await this.getCollection();
    if (!Number.isInteger(dimension) || dimension <= 0) {
      throw new Error("Dimension must be a positive integer");
    }
    try {
      await this.scope.searchIndexes().upsertIndex({
        name: indexName,
        sourceName: this.bucketName,
        type: "fulltext-index",
        params: {
          doc_config: {
            docid_prefix_delim: "",
            docid_regexp: "",
            mode: "scope.collection.type_field",
            type_field: "type"
          },
          mapping: {
            default_analyzer: "standard",
            default_datetime_parser: "dateTimeOptional",
            default_field: "_all",
            default_mapping: {
              dynamic: true,
              enabled: false
            },
            default_type: "_default",
            docvalues_dynamic: true,
            // [Doc](https://docs.couchbase.com/server/current/search/search-index-params.html#params) mentions this attribute is required for vector search to return the indexed field
            index_dynamic: true,
            store_dynamic: true,
            // [Doc](https://docs.couchbase.com/server/current/search/search-index-params.html#params) mentions this attribute is required for vector search to return the indexed field
            type_field: "_type",
            types: {
              [`${this.scopeName}.${this.collectionName}`]: {
                dynamic: true,
                enabled: true,
                properties: {
                  embedding: {
                    enabled: true,
                    fields: [
                      {
                        dims: dimension,
                        index: true,
                        name: "embedding",
                        similarity: DISTANCE_MAPPING[metric],
                        type: "vector",
                        vector_index_optimized_for: "recall",
                        store: true,
                        // CHANGED due to https://docs.couchbase.com/server/current/search/search-index-params.html#fields
                        docvalues: true,
                        // CHANGED due to https://docs.couchbase.com/server/current/search/search-index-params.html#fields
                        include_term_vectors: true
                        // CHANGED due to https://docs.couchbase.com/server/current/search/search-index-params.html#fields
                      }
                    ]
                  },
                  content: {
                    enabled: true,
                    fields: [
                      {
                        index: true,
                        name: "content",
                        store: true,
                        type: "text"
                      }
                    ]
                  }
                }
              }
            }
          },
          store: {
            indexType: "scorch",
            segmentVersion: 16
          }
        },
        sourceUuid: "",
        sourceParams: {},
        sourceType: "gocbcore",
        planParams: {
          maxPartitionsPerPIndex: 64,
          indexPartitions: 16,
          numReplicas: 0
        }
      });
      this.vector_dimension = dimension;
    } catch (error) {
      const message = error?.message || error?.toString();
      if (message && message.toLowerCase().includes("index exists")) {
        await this.validateExistingIndex(indexName, dimension, metric);
        return;
      }
      throw error;
    }
  }
  async upsert({ vectors, metadata, ids }) {
    await this.getCollection();
    if (!vectors || vectors.length === 0) {
      throw new Error("No vectors provided");
    }
    if (this.vector_dimension) {
      for (const vector of vectors) {
        if (!vector || this.vector_dimension !== vector.length) {
          throw new Error("Vector dimension mismatch");
        }
      }
    }
    const pointIds = ids || vectors.map(() => crypto.randomUUID());
    const records = vectors.map((vector, i) => {
      const metadataObj = metadata?.[i] || {};
      const record = {
        embedding: vector,
        metadata: metadataObj
      };
      if (metadataObj.text) {
        record.content = metadataObj.text;
      }
      return record;
    });
    const allPromises = [];
    for (let i = 0; i < records.length; i++) {
      allPromises.push(this.collection.upsert(pointIds[i], records[i]));
    }
    await Promise.all(allPromises);
    return pointIds;
  }
  async query({ indexName, queryVector, topK = 10, includeVector = false }) {
    await this.getCollection();
    const index_stats = await this.describeIndex({ indexName });
    if (queryVector.length !== index_stats.dimension) {
      throw new Error(`Query vector dimension mismatch. Expected ${index_stats.dimension}, got ${queryVector.length}`);
    }
    let request = SearchRequest.create(
      VectorSearch.fromVectorQuery(VectorQuery.create("embedding", queryVector).numCandidates(topK))
    );
    const results = await this.scope.search(indexName, request, {
      fields: ["*"]
    });
    if (includeVector) {
      throw new Error("Including vectors in search results is not yet supported by the Couchbase vector store");
    }
    const output = [];
    for (const match of results.rows) {
      const cleanedMetadata = {};
      const fields = match.fields || {};
      for (const key in fields) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) {
          const newKey = key.startsWith("metadata.") ? key.substring("metadata.".length) : key;
          cleanedMetadata[newKey] = fields[key];
        }
      }
      output.push({
        id: match.id,
        score: match.score || 0,
        metadata: cleanedMetadata
        // Use the cleaned metadata object
      });
    }
    return output;
  }
  async listIndexes() {
    await this.getCollection();
    const indexes = await this.scope.searchIndexes().getAllIndexes();
    return indexes?.map((index) => index.name) || [];
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the index to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName }) {
    await this.getCollection();
    if (!(await this.listIndexes()).includes(indexName)) {
      throw new Error(`Index ${indexName} does not exist`);
    }
    const index = await this.scope.searchIndexes().getIndex(indexName);
    const dimensions = index.params.mapping?.types?.[`${this.scopeName}.${this.collectionName}`]?.properties?.embedding?.fields?.[0]?.dims;
    const count = -1;
    const metric = index.params.mapping?.types?.[`${this.scopeName}.${this.collectionName}`]?.properties?.embedding?.fields?.[0]?.similarity;
    return {
      dimension: dimensions,
      count,
      metric: Object.keys(DISTANCE_MAPPING).find(
        (key) => DISTANCE_MAPPING[key] === metric
      )
    };
  }
  async deleteIndex({ indexName }) {
    await this.getCollection();
    if (!(await this.listIndexes()).includes(indexName)) {
      throw new Error(`Index ${indexName} does not exist`);
    }
    await this.scope.searchIndexes().dropIndex(indexName);
    this.vector_dimension = null;
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
  async updateVector({ id, update }) {
    if (!update.vector && !update.metadata) {
      throw new Error("No updates provided");
    }
    if (update.vector && this.vector_dimension && update.vector.length !== this.vector_dimension) {
      throw new Error("Vector dimension mismatch");
    }
    const collection = await this.getCollection();
    try {
      await collection.get(id);
    } catch (err) {
      if (err.code === 13 || err.message?.includes("document not found")) {
        throw new Error(`Vector with id ${id} does not exist`);
      }
      throw err;
    }
    const specs = [];
    if (update.vector) specs.push(MutateInSpec.replace("embedding", update.vector));
    if (update.metadata) specs.push(MutateInSpec.replace("metadata", update.metadata));
    await collection.mutateIn(id, specs);
  }
  /**
   * Deletes a vector by its ID.
   * @param indexName - The name of the index containing the vector.
   * @param id - The ID of the vector to delete.
   * @returns A promise that resolves when the deletion is complete.
   * @throws Will throw an error if the deletion operation fails.
   */
  async deleteVector({ id }) {
    const collection = await this.getCollection();
    try {
      await collection.get(id);
    } catch (err) {
      if (err.code === 13 || err.message?.includes("document not found")) {
        throw new Error(`Vector with id ${id} does not exist`);
      }
      throw err;
    }
    await collection.remove(id);
  }
  async disconnect() {
    if (!this.cluster) {
      return;
    }
    await this.cluster.close();
  }
};

export { CouchbaseVector, DISTANCE_MAPPING };
