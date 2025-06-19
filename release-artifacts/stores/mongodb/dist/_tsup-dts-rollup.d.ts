import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import type { CreateIndexParams } from '@mastra/core/vector';
import type { DeleteIndexParams } from '@mastra/core/vector';
import type { DeleteVectorParams } from '@mastra/core/vector';
import type { DescribeIndexParams } from '@mastra/core/vector';
import type { EvalRow } from '@mastra/core/storage';
import type { IndexStats } from '@mastra/core/vector';
import type { MastraMessageContentV2 } from '@mastra/core/agent';
import type { MastraMessageV1 } from '@mastra/core/memory';
import type { MastraMessageV2 } from '@mastra/core/memory';
import { MastraStorage } from '@mastra/core/storage';
import { MastraVector } from '@mastra/core/vector';
import type { MongoClientOptions } from 'mongodb';
import type { OperatorSupport } from '@mastra/core/vector/filter';
import type { PaginationInfo } from '@mastra/core/storage';
import type { QueryResult } from '@mastra/core/vector';
import type { QueryVectorParams } from '@mastra/core/vector';
import type { StorageColumn } from '@mastra/core/storage';
import type { StorageGetMessagesArg } from '@mastra/core/storage';
import type { StorageGetTracesArg } from '@mastra/core/storage';
import type { StorageThreadType } from '@mastra/core/memory';
import type { TABLE_NAMES } from '@mastra/core/storage';
import type { Trace } from '@mastra/core/telemetry';
import type { UpdateVectorParams } from '@mastra/core/vector';
import type { UpsertVectorParams } from '@mastra/core/vector';
import type { VectorFilter } from '@mastra/core/vector/filter';
import type { WorkflowRun } from '@mastra/core/storage';
import type { WorkflowRunState } from '@mastra/core/workflows';

/**
 * Vector store specific prompt that details supported operators and examples.
 * This prompt helps users construct valid filters for MongoDB Vector.
 */
declare const MONGODB_PROMPT = "When querying MongoDB Vector, you can ONLY use the operators listed below. Any other operators will be rejected.\nImportant: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.\nIf a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.\n\nBasic Comparison Operators:\n- $eq: Exact match (default when using field: value)\n  Example: { \"category\": \"electronics\" }\n- $ne: Not equal\n  Example: { \"category\": { \"$ne\": \"electronics\" } }\n- $gt: Greater than\n  Example: { \"price\": { \"$gt\": 100 } }\n- $gte: Greater than or equal\n  Example: { \"price\": { \"$gte\": 100 } }\n- $lt: Less than\n  Example: { \"price\": { \"$lt\": 100 } }\n- $lte: Less than or equal\n  Example: { \"price\": { \"$lte\": 100 } }\n\nArray Operators:\n- $in: Match any value in array\n  Example: { \"category\": { \"$in\": [\"electronics\", \"books\"] } }\n- $nin: Does not match any value in array\n  Example: { \"category\": { \"$nin\": [\"electronics\", \"books\"] } }\n- $all: Match all values in array\n  Example: { \"tags\": { \"$all\": [\"premium\", \"sale\"] } }\n- $elemMatch: Match array elements that meet all specified conditions\n  Example: { \"items\": { \"$elemMatch\": { \"price\": { \"$gt\": 100 } } } }\n- $size: Match arrays with specific length\n  Example: { \"tags\": { \"$size\": 3 } }\n\nLogical Operators:\n- $and: Logical AND (can be implicit or explicit)\n  Implicit Example: { \"price\": { \"$gt\": 100 }, \"category\": \"electronics\" }\n  Explicit Example: { \"$and\": [{ \"price\": { \"$gt\": 100 } }, { \"category\": \"electronics\" }] }\n- $or: Logical OR\n  Example: { \"$or\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n- $not: Logical NOT\n  Example: { \"$not\": { \"category\": \"electronics\" } }\n- $nor: Logical NOR\n  Example: { \"$nor\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n\nElement Operators:\n- $exists: Check if field exists\n  Example: { \"rating\": { \"$exists\": true } }\n- $type: Check field type\n  Example: { \"price\": { \"$type\": \"number\" } }\n\nText Search Operators:\n- $text: Full text search\n  Example: { \"$text\": { \"$search\": \"gaming laptop\" } }\n- $regex: Regular expression match\n  Example: { \"name\": { \"$regex\": \"^Gaming\" } }\n\nRestrictions:\n- Only logical operators ($and, $or, $not, $nor) can be used at the top level\n- Empty arrays in array operators will return no results\n- Nested fields are supported using dot notation\n- Multiple conditions on the same field are supported\n- At least one key-value pair is required in filter object\n- Empty objects and undefined values are treated as no filter\n- Invalid types in comparison operators will throw errors\n- All non-logical operators must be used within a field condition\n  Valid: { \"field\": { \"$gt\": 100 } }\n  Valid: { \"$and\": [...] }\n  Invalid: { \"$gt\": 100 }\n- Logical operators must contain field conditions, not direct operators\n  Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  Invalid: { \"$and\": [{ \"$gt\": 100 }] }\n- Logical operators ($and, $or, $not, $nor):\n  - Can only be used at top level or nested within other logical operators\n  - Can not be used on a field level, or be nested inside a field\n  - Can not be used inside an operator\n  - Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  - Valid: { \"$or\": [{ \"$and\": [{ \"field\": { \"$gt\": 100 } }] }] }\n  - Invalid: { \"field\": { \"$and\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$or\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$gt\": { \"$and\": [{...}] } } }\n\nExample Complex Query:\n{\n  \"$and\": [\n    { \"category\": { \"$in\": [\"electronics\", \"computers\"] } },\n    { \"price\": { \"$gte\": 100, \"$lte\": 1000 } },\n    { \"tags\": { \"$all\": [\"premium\", \"sale\"] } },\n    { \"items\": { \"$elemMatch\": { \"price\": { \"$gt\": 50 }, \"inStock\": true } } },\n    { \"$text\": { \"$search\": \"gaming laptop\" } },\n    { \"$or\": [\n      { \"stock\": { \"$gt\": 0 } },\n      { \"preorder\": true }\n    ]},\n    { \"$not\": { \"status\": \"discontinued\" } }\n  ]\n}";
export { MONGODB_PROMPT }
export { MONGODB_PROMPT as MONGODB_PROMPT_alias_1 }

declare interface MongoDBConfig {
    url: string;
    dbName: string;
    options?: MongoClientOptions;
}
export { MongoDBConfig }
export { MongoDBConfig as MongoDBConfig_alias_1 }

/**
 * Translator for MongoDB filter queries.
 * Maintains MongoDB-compatible syntax while ensuring proper validation
 * and normalization of values.
 */
export declare class MongoDBFilterTranslator extends BaseFilterTranslator {
    protected getSupportedOperators(): OperatorSupport;
    translate(filter?: VectorFilter): any;
    private translateNode;
    private translateOperatorValue;
    isEmpty(filter: any): boolean;
}

declare interface MongoDBIndexReadyParams {
    indexName: string;
    timeoutMs?: number;
    checkIntervalMs?: number;
}
export { MongoDBIndexReadyParams }
export { MongoDBIndexReadyParams as MongoDBIndexReadyParams_alias_1 }

declare interface MongoDBQueryVectorParams extends QueryVectorParams {
    documentFilter?: VectorFilter;
}
export { MongoDBQueryVectorParams }
export { MongoDBQueryVectorParams as MongoDBQueryVectorParams_alias_1 }

declare class MongoDBStore extends MastraStorage {
    #private;
    constructor(config: MongoDBConfig);
    private getConnection;
    private getCollection;
    createTable(): Promise<void>;
    /**
     * No-op: This backend is schemaless and does not require schema changes.
     * @param tableName Name of the table
     * @param schema Schema of the table
     * @param ifNotExists Array of column names to add if they don't exist
     */
    alterTable(_args: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
        ifNotExists: string[];
    }): Promise<void>;
    clearTable({ tableName }: {
        tableName: TABLE_NAMES;
    }): Promise<void>;
    insert({ tableName, record }: {
        tableName: TABLE_NAMES;
        record: Record<string, any>;
    }): Promise<void>;
    batchInsert({ tableName, records }: {
        tableName: TABLE_NAMES;
        records: Record<string, any>[];
    }): Promise<void>;
    load<R>({ tableName, keys }: {
        tableName: TABLE_NAMES;
        keys: Record<string, string>;
    }): Promise<R | null>;
    getThreadById({ threadId }: {
        threadId: string;
    }): Promise<StorageThreadType | null>;
    getThreadsByResourceId({ resourceId }: {
        resourceId: string;
    }): Promise<StorageThreadType[]>;
    saveThread({ thread }: {
        thread: StorageThreadType;
    }): Promise<StorageThreadType>;
    updateThread({ id, title, metadata, }: {
        id: string;
        title: string;
        metadata: Record<string, unknown>;
    }): Promise<StorageThreadType>;
    deleteThread({ threadId }: {
        threadId: string;
    }): Promise<void>;
    getMessages(args: StorageGetMessagesArg & {
        format?: 'v1';
    }): Promise<MastraMessageV1[]>;
    getMessages(args: StorageGetMessagesArg & {
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    saveMessages(args: {
        messages: MastraMessageV1[];
        format?: undefined | 'v1';
    }): Promise<MastraMessageV1[]>;
    saveMessages(args: {
        messages: MastraMessageV2[];
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    getTraces({ name, scope, page, perPage, attributes, filters, }?: {
        name?: string;
        scope?: string;
        page: number;
        perPage: number;
        attributes?: Record<string, string>;
        filters?: Record<string, any>;
    }): Promise<any[]>;
    getWorkflowRuns({ workflowName, fromDate, toDate, limit, offset, }?: {
        workflowName?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        runs: Array<{
            workflowName: string;
            runId: string;
            snapshot: WorkflowRunState | string;
            createdAt: Date;
            updatedAt: Date;
        }>;
        total: number;
    }>;
    getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
    persistWorkflowSnapshot({ workflowName, runId, snapshot, }: {
        workflowName: string;
        runId: string;
        snapshot: WorkflowRunState;
    }): Promise<void>;
    loadWorkflowSnapshot({ workflowName, runId, }: {
        workflowName: string;
        runId: string;
    }): Promise<WorkflowRunState | null>;
    getWorkflowRunById({ runId, workflowName, }: {
        runId: string;
        workflowName?: string;
    }): Promise<WorkflowRun | null>;
    private parseWorkflowRun;
    private parseRow;
    private transformEvalRow;
    getTracesPaginated(_args: StorageGetTracesArg): Promise<PaginationInfo & {
        traces: Trace[];
    }>;
    getThreadsByResourceIdPaginated(_args: {
        resourceId: string;
        page?: number;
        perPage?: number;
    }): Promise<PaginationInfo & {
        threads: StorageThreadType[];
    }>;
    getMessagesPaginated(_args: StorageGetMessagesArg): Promise<PaginationInfo & {
        messages: MastraMessageV1[] | MastraMessageV2[];
    }>;
    close(): Promise<void>;
    updateMessages(_args: {
        messages: Partial<Omit<MastraMessageV2, 'createdAt'>> & {
            id: string;
            content?: {
                metadata?: MastraMessageContentV2['metadata'];
                content?: MastraMessageContentV2['content'];
            };
        }[];
    }): Promise<MastraMessageV2[]>;
}
export { MongoDBStore }
export { MongoDBStore as MongoDBStore_alias_1 }

declare interface MongoDBUpsertVectorParams extends UpsertVectorParams {
    documents?: string[];
}
export { MongoDBUpsertVectorParams }
export { MongoDBUpsertVectorParams as MongoDBUpsertVectorParams_alias_1 }

declare class MongoDBVector extends MastraVector {
    private client;
    private db;
    private collections;
    private readonly embeddingFieldName;
    private readonly metadataFieldName;
    private readonly documentFieldName;
    private collectionForValidation;
    private mongoMetricMap;
    constructor({ uri, dbName, options }: {
        uri: string;
        dbName: string;
        options?: MongoClientOptions;
    });
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    createIndex({ indexName, dimension, metric }: CreateIndexParams): Promise<void>;
    /**
     * Waits for the index to be ready.
     *
     * @param {string} indexName - The name of the index to wait for
     * @param {number} timeoutMs - The maximum time in milliseconds to wait for the index to be ready (default: 60000)
     * @param {number} checkIntervalMs - The interval in milliseconds at which to check if the index is ready (default: 2000)
     * @returns A promise that resolves when the index is ready
     */
    waitForIndexReady({ indexName, timeoutMs, checkIntervalMs, }: MongoDBIndexReadyParams): Promise<void>;
    upsert({ indexName, vectors, metadata, ids, documents }: MongoDBUpsertVectorParams): Promise<string[]>;
    query({ indexName, queryVector, topK, filter, includeVector, documentFilter, }: MongoDBQueryVectorParams): Promise<QueryResult[]>;
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
    private getCollection;
    private validateVectorDimensions;
    private setIndexDimension;
    private transformFilter;
}
export { MongoDBVector }
export { MongoDBVector as MongoDBVector_alias_1 }

export { }
