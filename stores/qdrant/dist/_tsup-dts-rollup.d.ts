import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import type { CreateIndexParams } from '@mastra/core/vector';
import type { DeleteIndexParams } from '@mastra/core/vector';
import type { DeleteVectorParams } from '@mastra/core/vector';
import type { DescribeIndexParams } from '@mastra/core/vector';
import type { IndexStats } from '@mastra/core/vector';
import type { LogicalOperator } from '@mastra/core/vector/filter';
import { MastraVector } from '@mastra/core/vector';
import type { OperatorSupport } from '@mastra/core/vector/filter';
import type { QueryResult } from '@mastra/core/vector';
import type { QueryVectorParams } from '@mastra/core/vector';
import type { UpdateVectorParams } from '@mastra/core/vector';
import type { UpsertVectorParams } from '@mastra/core/vector';
import type { VectorFilter } from '@mastra/core/vector/filter';

/**
 * Vector store specific prompt that details supported operators and examples.
 * This prompt helps users construct valid filters for Qdrant Vector.
 */
declare const QDRANT_PROMPT = "When querying Qdrant, you can ONLY use the operators listed below. Any other operators will be rejected.\nImportant: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.\nIf a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.\n\nBasic Comparison Operators:\n- $eq: Exact match (default when using field: value)\n  Example: { \"category\": \"electronics\" }\n- $ne: Not equal\n  Example: { \"category\": { \"$ne\": \"electronics\" } }\n- $gt: Greater than\n  Example: { \"price\": { \"$gt\": 100 } }\n- $gte: Greater than or equal\n  Example: { \"price\": { \"$gte\": 100 } }\n- $lt: Less than\n  Example: { \"price\": { \"$lt\": 100 } }\n- $lte: Less than or equal\n  Example: { \"price\": { \"$lte\": 100 } }\n\nArray Operators:\n- $in: Match any value in array\n  Example: { \"category\": { \"$in\": [\"electronics\", \"books\"] } }\n- $nin: Does not match any value in array\n  Example: { \"category\": { \"$nin\": [\"electronics\", \"books\"] } }\n\nLogical Operators:\n- $and: Logical AND (can be implicit or explicit)\n  Implicit Example: { \"price\": { \"$gt\": 100 }, \"category\": \"electronics\" }\n  Explicit Example: { \"$and\": [{ \"price\": { \"$gt\": 100 } }, { \"category\": \"electronics\" }] }\n- $or: Logical OR\n  Example: { \"$or\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n- $not: Logical NOT\n  Example: { \"$not\": { \"category\": \"electronics\" } }\n\nElement Operators:\n- $exists: Check if field exists\n  Example: { \"rating\": { \"$exists\": true } }\n- $match: Match text using full-text search\n  Example: { \"description\": { \"$match\": \"gaming laptop\" } }\n- $null: Check if field is null\n  Example: { \"rating\": { \"$null\": true } }\n\nRestrictions:\n- Regex patterns are not supported\n- Only $and, $or, and $not logical operators are supported at the top level\n- Empty arrays in $in/$nin will return no results\n- Nested fields are supported using dot notation\n- Multiple conditions on the same field are supported with both implicit and explicit $and\n- At least one key-value pair is required in filter object\n- Empty objects and undefined values are treated as no filter\n- Invalid types in comparison operators will throw errors\n- All non-logical operators must be used within a field condition\n  Valid: { \"field\": { \"$gt\": 100 } }\n  Valid: { \"$and\": [...] }\n  Invalid: { \"$gt\": 100 }\n- Logical operators must contain field conditions, not direct operators\n  Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  Invalid: { \"$and\": [{ \"$gt\": 100 }] }\n- Logical operators ($and, $or, $not):\n  - Can only be used at top level or nested within other logical operators\n  - Can not be used on a field level, or be nested inside a field\n  - Can not be used inside an operator\n  - Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  - Valid: { \"$or\": [{ \"$and\": [{ \"field\": { \"$gt\": 100 } }] }] }\n  - Invalid: { \"field\": { \"$and\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$or\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$gt\": { \"$and\": [{...}] } } }\n\nExample Complex Query:\n{\n  \"$and\": [\n    { \"category\": { \"$in\": [\"electronics\", \"computers\"] } },\n    { \"price\": { \"$gte\": 100, \"$lte\": 1000 } },\n    { \"description\": { \"$match\": \"gaming laptop\" } },\n    { \"rating\": { \"$exists\": true, \"$gt\": 4 } },\n    { \"$or\": [\n      { \"stock\": { \"$gt\": 0 } },\n      { \"preorder\": { \"$null\": false } }\n    ]},\n    { \"$not\": { \"status\": \"discontinued\" } }\n  ]\n}";
export { QDRANT_PROMPT }
export { QDRANT_PROMPT as QDRANT_PROMPT_alias_1 }

/**
 * Translates MongoDB-style filters to Qdrant compatible filters.
 *
 * Key transformations:
 * - $and -> must
 * - $or -> should
 * - $not -> must_not
 * - { field: { $op: value } } -> { key: field, match/range: { value/gt/lt: value } }
 *
 * Custom operators (Qdrant-specific):
 * - $count -> values_count (array length/value count)
 * - $geo -> geo filters (box, radius, polygon)
 * - $hasId -> has_id filter
 * - $nested -> nested object filters
 * - $hasVector -> vector existence check
 * - $datetime -> RFC 3339 datetime range
 * - $null -> is_null check
 * - $empty -> is_empty check
 */
export declare class QdrantFilterTranslator extends BaseFilterTranslator {
    protected isLogicalOperator(key: string): key is LogicalOperator;
    protected getSupportedOperators(): OperatorSupport;
    translate(filter?: VectorFilter): VectorFilter;
    private createCondition;
    private translateNode;
    private buildFinalConditions;
    private handleLogicalOperators;
    private handleFieldConditions;
    private translateCustomOperator;
    private getQdrantLogicalOp;
    private translateOperatorValue;
    private translateGeoFilter;
    private normalizeDatetimeRange;
}

declare class QdrantVector extends MastraVector {
    private client;
    /**
     * Creates a new QdrantVector client.
     * @param url - The URL of the Qdrant server.
     * @param apiKey - The API key for Qdrant.
     * @param https - Whether to use HTTPS.
     */
    constructor({ url, apiKey, https }: {
        url: string;
        apiKey?: string;
        https?: boolean;
    });
    upsert({ indexName, vectors, metadata, ids }: UpsertVectorParams): Promise<string[]>;
    createIndex({ indexName, dimension, metric }: CreateIndexParams): Promise<void>;
    transformFilter(filter?: VectorFilter): VectorFilter;
    query({ indexName, queryVector, topK, filter, includeVector, }: QueryVectorParams): Promise<QueryResult[]>;
    listIndexes(): Promise<string[]>;
    /**
     * Retrieves statistics about a vector index.
     *
     * @param {string} indexName - The name of the index to describe
     * @returns A promise that resolves to the index statistics including dimension, count and metric
     */
    describeIndex({ indexName }: DescribeIndexParams): Promise<IndexStats>;
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
    private parsePointId;
}
export { QdrantVector }
export { QdrantVector as QdrantVector_alias_1 }

export { }
