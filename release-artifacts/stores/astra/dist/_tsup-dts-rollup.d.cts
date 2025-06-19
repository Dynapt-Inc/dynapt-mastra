import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import type { CreateIndexParams } from '@mastra/core/vector';
import type { DeleteIndexParams } from '@mastra/core/vector';
import type { DeleteVectorParams } from '@mastra/core/vector';
import type { DescribeIndexParams } from '@mastra/core/vector';
import type { IndexStats } from '@mastra/core/vector';
import { MastraVector } from '@mastra/core/vector';
import type { OperatorSupport } from '@mastra/core/vector/filter';
import type { QueryResult } from '@mastra/core/vector';
import type { QueryVectorParams } from '@mastra/core/vector';
import type { UpdateVectorParams } from '@mastra/core/vector';
import type { UpsertVectorParams } from '@mastra/core/vector';
import type { VectorFilter } from '@mastra/core/vector/filter';

/**
 * Vector store specific prompt that details supported operators and examples.
 * This prompt helps users construct valid filters for Astra Vector.
 */
declare const ASTRA_PROMPT = "When querying Astra, you can ONLY use the operators listed below. Any other operators will be rejected.\nImportant: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.\nIf a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.\n\nBasic Comparison Operators:\n- $eq: Exact match (default when using field: value)\n  Example: { \"category\": \"electronics\" }\n- $ne: Not equal\n  Example: { \"category\": { \"$ne\": \"electronics\" } }\n- $gt: Greater than\n  Example: { \"price\": { \"$gt\": 100 } }\n- $gte: Greater than or equal\n  Example: { \"price\": { \"$gte\": 100 } }\n- $lt: Less than\n  Example: { \"price\": { \"$lt\": 100 } }\n- $lte: Less than or equal\n  Example: { \"price\": { \"$lte\": 100 } }\n\nArray Operators:\n- $in: Match any value in array\n  Example: { \"category\": { \"$in\": [\"electronics\", \"books\"] } }\n- $nin: Does not match any value in array\n  Example: { \"category\": { \"$nin\": [\"electronics\", \"books\"] } }\n- $all: Match all values in array\n  Example: { \"tags\": { \"$all\": [\"premium\", \"sale\"] } }\n\nLogical Operators:\n- $and: Logical AND (can be implicit or explicit)\n  Implicit Example: { \"price\": { \"$gt\": 100 }, \"category\": \"electronics\" }\n  Explicit Example: { \"$and\": [{ \"price\": { \"$gt\": 100 } }, { \"category\": \"electronics\" }] }\n- $or: Logical OR\n  Example: { \"$or\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n- $not: Logical NOT\n  Example: { \"$not\": { \"category\": \"electronics\" } }\n\nElement Operators:\n- $exists: Check if field exists\n  Example: { \"rating\": { \"$exists\": true } }\n\nSpecial Operators:\n- $size: Array length check\n  Example: { \"tags\": { \"$size\": 2 } }\n\nRestrictions:\n- Regex patterns are not supported\n- Only $and, $or, and $not logical operators are supported\n- Nested fields are supported using dot notation\n- Multiple conditions on the same field are supported with both implicit and explicit $and\n- Empty arrays in $in/$nin will return no results\n- A non-empty array is required for $all operator\n- Only logical operators ($and, $or, $not) can be used at the top level\n- All other operators must be used within a field condition\n  Valid: { \"field\": { \"$gt\": 100 } }\n  Valid: { \"$and\": [...] }\n  Invalid: { \"$gt\": 100 }\n- Logical operators must contain field conditions, not direct operators\n  Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  Invalid: { \"$and\": [{ \"$gt\": 100 }] }\n- $not operator:\n  - Must be an object\n  - Cannot be empty\n  - Can be used at field level or top level\n  - Valid: { \"$not\": { \"field\": \"value\" } }\n  - Valid: { \"field\": { \"$not\": { \"$eq\": \"value\" } } }\n- Other logical operators ($and, $or):\n  - Can only be used at top level or nested within other logical operators\n  - Can not be used on a field level, or be nested inside a field\n  - Can not be used inside an operator\n  - Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  - Valid: { \"$or\": [{ \"$and\": [{ \"field\": { \"$gt\": 100 } }] }] }\n  - Invalid: { \"field\": { \"$and\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$or\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$gt\": { \"$and\": [{...}] } } }\n\nExample Complex Query:\n{\n  \"$and\": [\n    { \"category\": { \"$in\": [\"electronics\", \"computers\"] } },\n    { \"price\": { \"$gte\": 100, \"$lte\": 1000 } },\n    { \"tags\": { \"$all\": [\"premium\"] } },\n    { \"rating\": { \"$exists\": true, \"$gt\": 4 } },\n    { \"$or\": [\n      { \"stock\": { \"$gt\": 0 } },\n      { \"preorder\": true }\n    ]}\n  ]\n}";
export { ASTRA_PROMPT }
export { ASTRA_PROMPT as ASTRA_PROMPT_alias_1 }

declare interface AstraDbOptions {
    token: string;
    endpoint: string;
    keyspace?: string;
}
export { AstraDbOptions }
export { AstraDbOptions as AstraDbOptions_alias_1 }

/**
 * Translator for Astra DB filter queries.
 * Maintains MongoDB-compatible syntax while ensuring proper validation
 * and normalization of values.
 */
export declare class AstraFilterTranslator extends BaseFilterTranslator {
    protected getSupportedOperators(): OperatorSupport;
    translate(filter?: VectorFilter): VectorFilter;
    private translateNode;
    private translateOperatorValue;
}

declare class AstraVector extends MastraVector {
    #private;
    constructor({ token, endpoint, keyspace }: AstraDbOptions);
    /**
     * Creates a new collection with the specified configuration.
     *
     * @param {string} indexName - The name of the collection to create.
     * @param {number} dimension - The dimension of the vectors to be stored in the collection.
     * @param {'cosine' | 'euclidean' | 'dotproduct'} [metric=cosine] - The metric to use to sort vectors in the collection.
     * @returns {Promise<void>} A promise that resolves when the collection is created.
     */
    createIndex({ indexName, dimension, metric }: CreateIndexParams): Promise<void>;
    /**
     * Inserts or updates vectors in the specified collection.
     *
     * @param {string} indexName - The name of the collection to upsert into.
     * @param {number[][]} vectors - An array of vectors to upsert.
     * @param {Record<string, any>[]} [metadata] - An optional array of metadata objects corresponding to each vector.
     * @param {string[]} [ids] - An optional array of IDs corresponding to each vector. If not provided, new IDs will be generated.
     * @returns {Promise<string[]>} A promise that resolves to an array of IDs of the upserted vectors.
     */
    upsert({ indexName, vectors, metadata, ids }: UpsertVectorParams): Promise<string[]>;
    transformFilter(filter?: VectorFilter): VectorFilter;
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
    query({ indexName, queryVector, topK, filter, includeVector, }: QueryVectorParams): Promise<QueryResult[]>;
    /**
     * Lists all collections in the database.
     *
     * @returns {Promise<string[]>} A promise that resolves to an array of collection names.
     */
    listIndexes(): Promise<string[]>;
    /**
     * Retrieves statistics about a vector index.
     *
     * @param {string} indexName - The name of the index to describe
     * @returns A promise that resolves to the index statistics including dimension, count and metric
     */
    describeIndex({ indexName }: DescribeIndexParams): Promise<IndexStats>;
    /**
     * Deletes the specified collection.
     *
     * @param {string} indexName - The name of the collection to delete.
     * @returns {Promise<void>} A promise that resolves when the collection is deleted.
     */
    deleteIndex({ indexName }: DeleteIndexParams): Promise<void>;
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
    updateVector({ indexName, id, update }: UpdateVectorParams): Promise<void>;
    /**
     * Deletes a vector by its ID.
     * @param indexName - The name of the index containing the vector.
     * @param id - The ID of the vector to delete.
     * @returns A promise that resolves when the deletion is complete.
     * @throws Will throw an error if the deletion operation fails.
     */
    deleteVector({ indexName, id }: DeleteVectorParams): Promise<void>;
}
export { AstraVector }
export { AstraVector as AstraVector_alias_1 }

export { }
