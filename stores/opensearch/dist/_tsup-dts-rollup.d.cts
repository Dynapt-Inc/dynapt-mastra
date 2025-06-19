import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import type { CreateIndexParams } from '@mastra/core';
import type { DeleteIndexParams } from '@mastra/core';
import type { DeleteVectorParams } from '@mastra/core';
import type { DescribeIndexParams } from '@mastra/core';
import type { IndexStats } from '@mastra/core';
import { MastraVector } from '@mastra/core/vector';
import type { OperatorSupport } from '@mastra/core/vector/filter';
import type { QueryResult } from '@mastra/core';
import type { QueryVectorParams } from '@mastra/core';
import type { UpdateVectorParams } from '@mastra/core';
import type { UpsertVectorParams } from '@mastra/core';
import type { VectorFilter } from '@mastra/core/vector/filter';

/**
 * Vector store prompt for OpenSearch. This prompt details supported filter operators, syntax, and usage examples.
 * Use this as a guide for constructing valid filters for OpenSearch vector queries in Mastra.
 */
export declare const OPENSEARCH_PROMPT = "When querying OpenSearch, you can ONLY use the operators listed below. Any other operators will be rejected.\nImportant: Do not explain how to construct the filter\u2014use the specified operators and fields to search the content and return relevant results.\nIf a user tries to use an unsupported operator, reject the filter entirely and let them know that the operator is not supported.\n\nBasic Comparison Operators:\n- $eq: Exact match (default for field: value)\n  Example: { \"category\": \"electronics\" }\n- $ne: Not equal\n  Example: { \"category\": { \"$ne\": \"electronics\" } }\n- $gt: Greater than\n  Example: { \"price\": { \"$gt\": 100 } }\n- $gte: Greater than or equal\n  Example: { \"price\": { \"$gte\": 100 } }\n- $lt: Less than\n  Example: { \"price\": { \"$lt\": 100 } }\n- $lte: Less than or equal\n  Example: { \"price\": { \"$lte\": 100 } }\n\nArray Operators:\n- $in: Match any value in array\n  Example: { \"category\": { \"$in\": [\"electronics\", \"books\"] } }\n- $nin: Does not match any value in array\n  Example: { \"category\": { \"$nin\": [\"electronics\", \"books\"] } }\n- $all: Match all values in array\n  Example: { \"tags\": { \"$all\": [\"premium\", \"sale\"] } }\n\nLogical Operators:\n- $and: Logical AND (implicit when using multiple conditions)\n  Example: { \"$and\": [{ \"price\": { \"$gt\": 100 } }, { \"category\": \"electronics\" }] }\n- $or: Logical OR\n  Example: { \"$or\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n- $not: Logical NOT\n  Example: { \"$not\": { \"category\": \"electronics\" } }\n\nElement Operators:\n- $exists: Check if field exists\n  Example: { \"rating\": { \"$exists\": true } }\n\nRegex Operator:\n- $regex: Match using a regular expression (ECMAScript syntax)\n  Example: { \"name\": { \"$regex\": \"^Sam.*son$\" } }\n  Note: Regex queries are supported for string fields only. Use valid ECMAScript patterns; invalid patterns will throw an error.\n\nRestrictions:\n- Nested fields are supported using dot notation (e.g., \"address.city\").\n- Multiple conditions on the same field are supported (e.g., { \"price\": { \"$gte\": 100, \"$lte\": 1000 } }).\n- Only logical operators ($and, $or, $not) can be used at the top level.\n- All other operators must be used within a field condition.\n  Valid: { \"field\": { \"$gt\": 100 } }\n  Valid: { \"$and\": [...] }\n  Invalid: { \"$gt\": 100 }\n- Logical operators must contain field conditions, not direct operators.\n  Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  Invalid: { \"$and\": [{ \"$gt\": 100 }] }\n- $not operator:\n  - Must be an object\n  - Cannot be empty\n  - Can be used at field level or top level\n  - Valid: { \"$not\": { \"field\": \"value\" } }\n  - Valid: { \"field\": { \"$not\": { \"$eq\": \"value\" } } }\n- Array operators work on array fields only.\n- Empty arrays in conditions are handled gracefully.\n- Regex queries are case-sensitive by default; use patterns accordingly.\n\nExample Complex Query:\n{\n  \"$and\": [\n    { \"category\": { \"$in\": [\"electronics\", \"computers\"] } },\n    { \"price\": { \"$gte\": 100, \"$lte\": 1000 } },\n    { \"tags\": { \"$all\": [\"premium\"] } },\n    { \"rating\": { \"$exists\": true, \"$gt\": 4 } },\n    { \"$or\": [\n      { \"stock\": { \"$gt\": 0 } },\n      { \"preorder\": true }\n    ]},\n    { \"name\": { \"$regex\": \"^Sam.*son$\" } }\n  ]\n}";

/**
 * Translator for OpenSearch filter queries.
 * Maintains OpenSearch-compatible syntax while ensuring proper validation
 * and normalization of values.
 */
export declare class OpenSearchFilterTranslator extends BaseFilterTranslator {
    protected getSupportedOperators(): OperatorSupport;
    translate(filter?: VectorFilter): VectorFilter;
    private translateNode;
    /**
     * Handles translation of nested objects with dot notation fields
     */
    private translateNestedObject;
    private translateLogicalOperator;
    private translateFieldOperator;
    /**
     * Translates regex patterns to OpenSearch query syntax
     */
    private translateRegexOperator;
    private addKeywordIfNeeded;
    /**
     * Helper method to handle special cases for the $not operator
     */
    private handleNotOperatorSpecialCases;
    private translateOperator;
    /**
     * Translates field conditions to OpenSearch query syntax
     * Handles special cases like range queries and multiple operators
     */
    private translateFieldConditions;
    /**
     * Checks if conditions can be optimized to a range query
     */
    private canOptimizeToRangeQuery;
    /**
     * Creates a range query from numeric operators
     */
    private createRangeQuery;
}

declare class OpenSearchVector extends MastraVector {
    private client;
    /**
     * Creates a new OpenSearchVector client.
     *
     * @param {string} url - The url of the OpenSearch node.
     */
    constructor({ url }: {
        url: string;
    });
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
     * Lists all indexes.
     *
     * @returns {Promise<string[]>} A promise that resolves to an array of indexes.
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
     * Deletes the specified index.
     *
     * @param {string} indexName - The name of the index to delete.
     * @returns {Promise<void>} A promise that resolves when the index is deleted.
     */
    deleteIndex({ indexName }: DeleteIndexParams): Promise<void>;
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
    /**
     * Queries the specified collection using a vector and optional filter.
     *
     * @param {string} indexName - The name of the collection to query.
     * @param {number[]} queryVector - The vector to query with.
     * @param {number} [topK] - The maximum number of results to return.
     * @param {Record<string, any>} [filter] - An optional filter to apply to the query. For more on filters in OpenSearch, see the filtering reference: https://opensearch.org/docs/latest/query-dsl/
     * @param {boolean} [includeVectors=false] - Whether to include the vectors in the response.
     * @returns {Promise<QueryResult[]>} A promise that resolves to an array of query results.
     */
    query({ indexName, queryVector, filter, topK, includeVector, }: QueryVectorParams): Promise<QueryResult[]>;
    /**
     * Validates the dimensions of the vectors.
     *
     * @param {number[][]} vectors - The vectors to validate.
     * @param {number} dimension - The dimension of the vectors.
     * @returns {void}
     */
    private validateVectorDimensions;
    /**
     * Transforms the filter to the OpenSearch DSL.
     *
     * @param {VectorFilter} filter - The filter to transform.
     * @returns {Record<string, any>} The transformed filter.
     */
    private transformFilter;
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
export { OpenSearchVector }
export { OpenSearchVector as OpenSearchVector_alias_1 }

export { }
