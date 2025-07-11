import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import type { CreateIndexParams } from '@mastra/core/vector';
import type { DeleteIndexParams } from '@mastra/core/vector';
import type { DeleteVectorParams } from '@mastra/core/vector';
import type { DescribeIndexParams } from '@mastra/core/vector';
import type { EvalRow } from '@mastra/core/storage';
import type { IndexStats } from '@mastra/core/vector';
import type { InValue } from '@libsql/client';
import type { MastraMessageContentV2 } from '@mastra/core/agent';
import type { MastraMessageV1 } from '@mastra/core/memory';
import type { MastraMessageV2 } from '@mastra/core/agent';
import { MastraStorage } from '@mastra/core/storage';
import { MastraVector } from '@mastra/core/vector';
import type { OperatorSupport } from '@mastra/core/vector/filter';
import type { PaginationArgs } from '@mastra/core/storage';
import type { PaginationInfo } from '@mastra/core/storage';
import type { QueryResult } from '@mastra/core/vector';
import type { QueryVectorParams } from '@mastra/core/vector';
import type { StorageColumn } from '@mastra/core/storage';
import type { StorageGetMessagesArg } from '@mastra/core/storage';
import type { StorageThreadType } from '@mastra/core/memory';
import type { TABLE_NAMES } from '@mastra/core/storage';
import type { Trace } from '@mastra/core/telemetry';
import type { UpdateVectorParams } from '@mastra/core/vector';
import type { UpsertVectorParams } from '@mastra/core/vector';
import type { VectorFilter } from '@mastra/core/vector/filter';
import type { WorkflowRun } from '@mastra/core/storage';
import type { WorkflowRuns } from '@mastra/core/storage';

export declare function buildFilterQuery(filter: VectorFilter): FilterResult;

declare interface FilterResult {
    sql: string;
    values: InValue[];
}

/**
 * Vector store specific prompt that details supported operators and examples.
 * This prompt helps users construct valid filters for LibSQL Vector.
 */
declare const LIBSQL_PROMPT = "When querying LibSQL Vector, you can ONLY use the operators listed below. Any other operators will be rejected.\nImportant: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.\nIf a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.\n\nBasic Comparison Operators:\n- $eq: Exact match (default when using field: value)\n  Example: { \"category\": \"electronics\" }\n- $ne: Not equal\n  Example: { \"category\": { \"$ne\": \"electronics\" } }\n- $gt: Greater than\n  Example: { \"price\": { \"$gt\": 100 } }\n- $gte: Greater than or equal\n  Example: { \"price\": { \"$gte\": 100 } }\n- $lt: Less than\n  Example: { \"price\": { \"$lt\": 100 } }\n- $lte: Less than or equal\n  Example: { \"price\": { \"$lte\": 100 } }\n\nArray Operators:\n- $in: Match any value in array\n  Example: { \"category\": { \"$in\": [\"electronics\", \"books\"] } }\n- $nin: Does not match any value in array\n  Example: { \"category\": { \"$nin\": [\"electronics\", \"books\"] } }\n- $all: Match all values in array\n  Example: { \"tags\": { \"$all\": [\"premium\", \"sale\"] } }\n- $elemMatch: Match array elements that meet all specified conditions\n  Example: { \"items\": { \"$elemMatch\": { \"price\": { \"$gt\": 100 } } } }\n- $contains: Check if array contains value\n  Example: { \"tags\": { \"$contains\": \"premium\" } }\n\nLogical Operators:\n- $and: Logical AND (implicit when using multiple conditions)\n  Example: { \"$and\": [{ \"price\": { \"$gt\": 100 } }, { \"category\": \"electronics\" }] }\n- $or: Logical OR\n  Example: { \"$or\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n- $not: Logical NOT\n  Example: { \"$not\": { \"category\": \"electronics\" } }\n- $nor: Logical NOR\n  Example: { \"$nor\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n\nElement Operators:\n- $exists: Check if field exists\n  Example: { \"rating\": { \"$exists\": true } }\n\nSpecial Operators:\n- $size: Array length check\n  Example: { \"tags\": { \"$size\": 2 } }\n\nRestrictions:\n- Regex patterns are not supported\n- Direct RegExp patterns will throw an error\n- Nested fields are supported using dot notation\n- Multiple conditions on the same field are supported with both implicit and explicit $and\n- Array operations work on array fields only\n- Basic operators handle array values as JSON strings\n- Empty arrays in conditions are handled gracefully\n- Only logical operators ($and, $or, $not, $nor) can be used at the top level\n- All other operators must be used within a field condition\n  Valid: { \"field\": { \"$gt\": 100 } }\n  Valid: { \"$and\": [...] }\n  Invalid: { \"$gt\": 100 }\n  Invalid: { \"$contains\": \"value\" }\n- Logical operators must contain field conditions, not direct operators\n  Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  Invalid: { \"$and\": [{ \"$gt\": 100 }] }\n- $not operator:\n  - Must be an object\n  - Cannot be empty\n  - Can be used at field level or top level\n  - Valid: { \"$not\": { \"field\": \"value\" } }\n  - Valid: { \"field\": { \"$not\": { \"$eq\": \"value\" } } }\n- Other logical operators ($and, $or, $nor):\n  - Can only be used at top level or nested within other logical operators\n  - Can not be used on a field level, or be nested inside a field\n  - Can not be used inside an operator\n  - Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  - Valid: { \"$or\": [{ \"$and\": [{ \"field\": { \"$gt\": 100 } }] }] }\n  - Invalid: { \"field\": { \"$and\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$or\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$gt\": { \"$and\": [{...}] } } }\n- $elemMatch requires an object with conditions\n  Valid: { \"array\": { \"$elemMatch\": { \"field\": \"value\" } } }\n  Invalid: { \"array\": { \"$elemMatch\": \"value\" } }\n\nExample Complex Query:\n{\n  \"$and\": [\n    { \"category\": { \"$in\": [\"electronics\", \"computers\"] } },\n    { \"price\": { \"$gte\": 100, \"$lte\": 1000 } },\n    { \"tags\": { \"$all\": [\"premium\", \"sale\"] } },\n    { \"items\": { \"$elemMatch\": { \"price\": { \"$gt\": 50 }, \"inStock\": true } } },\n    { \"$or\": [\n      { \"stock\": { \"$gt\": 0 } },\n      { \"preorder\": true }\n    ]}\n  ]\n}";
export { LIBSQL_PROMPT }
export { LIBSQL_PROMPT as LIBSQL_PROMPT_alias_1 }

declare interface LibSQLConfig {
    url: string;
    authToken?: string;
    /**
     * Maximum number of retries for write operations if an SQLITE_BUSY error occurs.
     * @default 5
     */
    maxRetries?: number;
    /**
     * Initial backoff time in milliseconds for retrying write operations on SQLITE_BUSY.
     * The backoff time will double with each retry (exponential backoff).
     * @default 100
     */
    initialBackoffMs?: number;
}
export { LibSQLConfig }
export { LibSQLConfig as LibSQLConfig_alias_1 }

/**
 * Translates MongoDB-style filters to LibSQL compatible filters.
 *
 * Key differences from MongoDB:
 *
 * Logical Operators ($and, $or, $nor):
 * - Can be used at the top level or nested within fields
 * - Can take either a single condition or an array of conditions
 *
 */
export declare class LibSQLFilterTranslator extends BaseFilterTranslator {
    protected getSupportedOperators(): OperatorSupport;
    translate(filter?: VectorFilter): VectorFilter;
    private translateNode;
}

declare interface LibSQLQueryVectorParams extends QueryVectorParams {
    minScore?: number;
}

declare class LibSQLStore extends MastraStorage {
    private client;
    private readonly maxRetries;
    private readonly initialBackoffMs;
    constructor(config: LibSQLConfig);
    get supports(): {
        selectByIncludeResourceScope: boolean;
    };
    private getCreateTableSQL;
    createTable({ tableName, schema, }: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
    }): Promise<void>;
    protected getSqlType(type: StorageColumn['type']): string;
    /**
     * Alters table schema to add columns if they don't exist
     * @param tableName Name of the table
     * @param schema Schema of the table
     * @param ifNotExists Array of column names to add if they don't exist
     */
    alterTable({ tableName, schema, ifNotExists, }: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
        ifNotExists: string[];
    }): Promise<void>;
    clearTable({ tableName }: {
        tableName: TABLE_NAMES;
    }): Promise<void>;
    private prepareStatement;
    private executeWriteOperationWithRetry;
    insert(args: {
        tableName: TABLE_NAMES;
        record: Record<string, any>;
    }): Promise<void>;
    private doInsert;
    batchInsert(args: {
        tableName: TABLE_NAMES;
        records: Record<string, any>[];
    }): Promise<void>;
    private doBatchInsert;
    load<R>({ tableName, keys }: {
        tableName: TABLE_NAMES;
        keys: Record<string, string>;
    }): Promise<R | null>;
    getThreadById({ threadId }: {
        threadId: string;
    }): Promise<StorageThreadType | null>;
    /**
     * @deprecated use getThreadsByResourceIdPaginated instead for paginated results.
     */
    getThreadsByResourceId(args: {
        resourceId: string;
    }): Promise<StorageThreadType[]>;
    getThreadsByResourceIdPaginated(args: {
        resourceId: string;
    } & PaginationArgs): Promise<PaginationInfo & {
        threads: StorageThreadType[];
    }>;
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
    private parseRow;
    private _getIncludedMessages;
    /**
     * @deprecated use getMessagesPaginated instead for paginated results.
     */
    getMessages(args: StorageGetMessagesArg & {
        format?: 'v1';
    }): Promise<MastraMessageV1[]>;
    getMessages(args: StorageGetMessagesArg & {
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    getMessagesPaginated(args: StorageGetMessagesArg & {
        format?: 'v1' | 'v2';
    }): Promise<PaginationInfo & {
        messages: MastraMessageV1[] | MastraMessageV2[];
    }>;
    saveMessages(args: {
        messages: MastraMessageV1[];
        format?: undefined | 'v1';
    }): Promise<MastraMessageV1[]>;
    saveMessages(args: {
        messages: MastraMessageV2[];
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    updateMessages({ messages, }: {
        messages: (Partial<Omit<MastraMessageV2, 'createdAt'>> & {
            id: string;
            content?: {
                metadata?: MastraMessageContentV2['metadata'];
                content?: MastraMessageContentV2['content'];
            };
        })[];
    }): Promise<MastraMessageV2[]>;
    private transformEvalRow;
    /** @deprecated use getEvals instead */
    getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
    getEvals(options?: {
        agentName?: string;
        type?: 'test' | 'live';
    } & PaginationArgs): Promise<PaginationInfo & {
        evals: EvalRow[];
    }>;
    /**
     * @deprecated use getTracesPaginated instead.
     */
    getTraces(args: {
        name?: string;
        scope?: string;
        page: number;
        perPage: number;
        attributes?: Record<string, string>;
        filters?: Record<string, any>;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<Trace[]>;
    getTracesPaginated(args: {
        name?: string;
        scope?: string;
        attributes?: Record<string, string>;
        filters?: Record<string, any>;
    } & PaginationArgs): Promise<PaginationInfo & {
        traces: Trace[];
    }>;
    getWorkflowRuns({ workflowName, fromDate, toDate, limit, offset, resourceId, }?: {
        workflowName?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
        resourceId?: string;
    }): Promise<WorkflowRuns>;
    getWorkflowRunById({ runId, workflowName, }: {
        runId: string;
        workflowName?: string;
    }): Promise<WorkflowRun | null>;
    private hasColumn;
    private parseWorkflowRun;
}
export { LibSQLStore as DefaultStorage }
export { LibSQLStore as DefaultStorage_alias_1 }
export { LibSQLStore }
export { LibSQLStore as LibSQLStore_alias_1 }

declare class LibSQLVector extends MastraVector {
    private turso;
    private readonly maxRetries;
    private readonly initialBackoffMs;
    constructor({ connectionUrl, authToken, syncUrl, syncInterval, maxRetries, initialBackoffMs, }: LibSQLVectorConfig);
    private executeWriteOperationWithRetry;
    transformFilter(filter?: VectorFilter): VectorFilter;
    query({ indexName, queryVector, topK, filter, includeVector, minScore, }: LibSQLQueryVectorParams): Promise<QueryResult[]>;
    upsert(args: UpsertVectorParams): Promise<string[]>;
    private doUpsert;
    createIndex(args: CreateIndexParams): Promise<void>;
    private doCreateIndex;
    deleteIndex(args: DeleteIndexParams): Promise<void>;
    private doDeleteIndex;
    listIndexes(): Promise<string[]>;
    /**
     * Retrieves statistics about a vector index.
     *
     * @param {string} indexName - The name of the index to describe
     * @returns A promise that resolves to the index statistics including dimension, count and metric
     */
    describeIndex({ indexName }: DescribeIndexParams): Promise<IndexStats>;
    /**
     * Updates a vector by its ID with the provided vector and/or metadata.
     *
     * @param indexName - The name of the index containing the vector.
     * @param id - The ID of the vector to update.
     * @param update - An object containing the vector and/or metadata to update.
     * @param update.vector - An optional array of numbers representing the new vector.
     * @param update.metadata - An optional record containing the new metadata.
     * @returns A promise that resolves when the update is complete.
     * @throws Will throw an error if no updates are provided or if the update operation fails.
     */
    updateVector(args: UpdateVectorParams): Promise<void>;
    private doUpdateVector;
    /**
     * Deletes a vector by its ID.
     * @param indexName - The name of the index containing the vector.
     * @param id - The ID of the vector to delete.
     * @returns A promise that resolves when the deletion is complete.
     * @throws Will throw an error if the deletion operation fails.
     */
    deleteVector(args: DeleteVectorParams): Promise<void>;
    private doDeleteVector;
    truncateIndex(args: DeleteIndexParams): Promise<void>;
    private _doTruncateIndex;
}
export { LibSQLVector }
export { LibSQLVector as LibSQLVector_alias_1 }

declare interface LibSQLVectorConfig {
    connectionUrl: string;
    authToken?: string;
    syncUrl?: string;
    syncInterval?: number;
    /**
     * Maximum number of retries for write operations if an SQLITE_BUSY error occurs.
     * @default 5
     */
    maxRetries?: number;
    /**
     * Initial backoff time in milliseconds for retrying write operations on SQLITE_BUSY.
     * The backoff time will double with each retry (exponential backoff).
     * @default 100
     */
    initialBackoffMs?: number;
}
export { LibSQLVectorConfig }
export { LibSQLVectorConfig as LibSQLVectorConfig_alias_1 }

export { }
