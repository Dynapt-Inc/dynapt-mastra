import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import type { CreateIndexParams } from '@mastra/core/vector';
import type { DeleteIndexParams } from '@mastra/core/vector';
import type { DeleteVectorParams } from '@mastra/core/vector';
import type { DescribeIndexParams } from '@mastra/core/vector';
import type { Filters } from '@turbopuffer/turbopuffer';
import type { IndexStats } from '@mastra/core/vector';
import { MastraVector } from '@mastra/core/vector';
import type { OperatorSupport } from '@mastra/core/vector/filter';
import type { QueryResult } from '@mastra/core/vector';
import type { QueryVectorParams } from '@mastra/core/vector';
import type { Schema } from '@turbopuffer/turbopuffer';
import type { UpdateVectorParams } from '@mastra/core/vector';
import type { UpsertVectorParams } from '@mastra/core/vector';
import type { VectorFilter } from '@mastra/core/vector/filter';

/**
 * Translator for converting Mastra filters to Turbopuffer format
 *
 * Mastra filters: { field: { $gt: 10 } }
 * Turbopuffer filters: ["And", [["field", "Gt", 10]]]
 */
export declare class TurbopufferFilterTranslator extends BaseFilterTranslator {
    protected getSupportedOperators(): OperatorSupport;
    /**
     * Map Mastra operators to Turbopuffer operators
     */
    private operatorMap;
    /**
     * Convert the Mastra filter to Turbopuffer format
     */
    translate(filter?: VectorFilter): Filters | undefined;
    /**
     * Recursively translate a filter node
     */
    private translateNode;
    /**
     * Translate a field condition
     */
    private translateFieldCondition;
    /**
     * Translate a logical operator
     */
    private translateLogical;
    /**
     * Translate a specific operator
     */
    private translateOperator;
    /**
     * Normalize a value for comparison operations
     */
    protected normalizeValue(value: any): any;
    /**
     * Normalize array values
     */
    protected normalizeArrayValues(values: any[]): any[];
}

declare class TurbopufferVector extends MastraVector {
    private client;
    private filterTranslator;
    private createIndexCache;
    private opts;
    constructor(opts: TurbopufferVectorOptions);
    createIndex({ indexName, dimension, metric }: CreateIndexParams): Promise<void>;
    upsert({ indexName, vectors, metadata, ids }: UpsertVectorParams): Promise<string[]>;
    query({ indexName, queryVector, topK, filter, includeVector }: QueryVectorParams): Promise<QueryResult[]>;
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
}
export { TurbopufferVector }
export { TurbopufferVector as TurbopufferVector_alias_1 }

declare interface TurbopufferVectorOptions {
    /** The API key to authenticate with. */
    apiKey: string;
    /** The base URL. Default is https://api.turbopuffer.com. */
    baseUrl?: string;
    /** The timeout to establish a connection, in ms. Default is 10_000. Only applicable in Node and Deno.*/
    connectTimeout?: number;
    /** The socket idle timeout, in ms. Default is 60_000. Only applicable in Node and Deno.*/
    connectionIdleTimeout?: number;
    /** The number of connections to open initially when creating a new client. Default is 0. */
    warmConnections?: number;
    /** Whether to compress requests and accept compressed responses. Default is true. */
    compression?: boolean;
    /**
     * A callback function that takes an index name and returns a config object for that index.
     * This allows you to define explicit schemas per index.
     *
     * Example:
     * ```typescript
     * schemaConfigForIndex: (indexName: string) => {
     *   // Mastra's default embedding model and index for memory messages:
     *   if (indexName === "memory_messages_384") {
     *     return {
     *       dimensions: 384,
     *       schema: {
     *         thread_id: {
     *           type: "string",
     *           filterable: true,
     *         },
     *       },
     *     };
     *   } else {
     *     throw new Error(`TODO: add schema for index: ${indexName}`);
     *   }
     * },
     * ```
     */
    schemaConfigForIndex?: (indexName: string) => {
        dimensions: number;
        schema: Schema;
    };
}
export { TurbopufferVectorOptions }
export { TurbopufferVectorOptions as TurbopufferVectorOptions_alias_1 }

export { }
