import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import type { CreateIndexParams } from '@mastra/core/vector';
import type { DeleteIndexParams } from '@mastra/core/vector';
import type { DeleteVectorParams } from '@mastra/core/vector';
import type { DescribeIndexParams } from '@mastra/core/vector';
import type { EvalRow } from '@mastra/core/storage';
import type { IndexStats } from '@mastra/core/vector';
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
import type { StorageGetTracesArg } from '@mastra/core/storage';
import type { StorageThreadType } from '@mastra/core/memory';
import type { TABLE_NAMES } from '@mastra/core/storage';
import type { UpdateVectorParams } from '@mastra/core/vector';
import type { UpsertVectorParams } from '@mastra/core/vector';
import type { VectorFilter } from '@mastra/core/vector/filter';
import type { WorkflowRun } from '@mastra/core/storage';
import type { WorkflowRuns } from '@mastra/core/storage';
import type { WorkflowRunState } from '@mastra/core/workflows';

/**
 * Vector store specific prompt that details supported operators and examples.
 * This prompt helps users construct valid filters for Upstash Vector.
 */
declare const UPSTASH_PROMPT = "When querying Upstash Vector, you can ONLY use the operators listed below. Any other operators will be rejected.\nImportant: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.\nIf a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.\n\nBasic Comparison Operators:\n- $eq: Exact match (default when using field: value)\n  Example: { \"category\": \"electronics\" }\n- $ne: Not equal\n  Example: { \"category\": { \"$ne\": \"electronics\" } }\n- $gt: Greater than\n  Example: { \"price\": { \"$gt\": 100 } }\n- $gte: Greater than or equal\n  Example: { \"price\": { \"$gte\": 100 } }\n- $lt: Less than\n  Example: { \"price\": { \"$lt\": 100 } }\n- $lte: Less than or equal\n  Example: { \"price\": { \"$lte\": 100 } }\n\nArray Operators:\n- $in: Match any value in array\n  Example: { \"category\": { \"$in\": [\"electronics\", \"books\"] } }\n- $nin: Does not match any value in array\n  Example: { \"category\": { \"$nin\": [\"electronics\", \"books\"] } }\n\nLogical Operators:\n- $and: Logical AND (can be implicit or explicit)\n  Implicit Example: { \"price\": { \"$gt\": 100 }, \"category\": \"electronics\" }\n  Explicit Example: { \"$and\": [{ \"price\": { \"$gt\": 100 } }, { \"category\": \"electronics\" }] }\n- $or: Logical OR\n  Example: { \"$or\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n\nElement Operators:\n- $exists: Check if field exists\n  Example: { \"rating\": { \"$exists\": true } }\n\nRestrictions:\n- Regex patterns are not supported\n- Only $and and $or logical operators are supported at the top level\n- Empty arrays in $in/$nin will return no results\n- Nested fields are supported using dot notation\n- Multiple conditions on the same field are supported with both implicit and explicit $and\n- At least one key-value pair is required in filter object\n- Empty objects and undefined values are treated as no filter\n- Invalid types in comparison operators will throw errors\n- All non-logical operators must be used within a field condition\n  Valid: { \"field\": { \"$gt\": 100 } }\n  Valid: { \"$and\": [...] }\n  Invalid: { \"$gt\": 100 }\n- Logical operators must contain field conditions, not direct operators\n  Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  Invalid: { \"$and\": [{ \"$gt\": 100 }] }\n- Logical operators ($and, $or):\n  - Can only be used at top level or nested within other logical operators\n  - Can not be used on a field level, or be nested inside a field\n  - Can not be used inside an operator\n  - Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  - Valid: { \"$or\": [{ \"$and\": [{ \"field\": { \"$gt\": 100 } }] }] }\n  - Invalid: { \"field\": { \"$and\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$or\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$gt\": { \"$and\": [{...}] } } }\n\nExample Complex Query:\n{\n  \"$and\": [\n    { \"category\": { \"$in\": [\"electronics\", \"computers\"] } },\n    { \"price\": { \"$gte\": 100, \"$lte\": 1000 } },\n    { \"rating\": { \"$exists\": true, \"$gt\": 4 } },\n    { \"$or\": [\n      { \"stock\": { \"$gt\": 0 } },\n      { \"preorder\": true }\n    ]}\n  ]\n}";
export { UPSTASH_PROMPT }
export { UPSTASH_PROMPT as UPSTASH_PROMPT_alias_1 }

declare interface UpstashConfig {
    url: string;
    token: string;
}
export { UpstashConfig }
export { UpstashConfig as UpstashConfig_alias_1 }

export declare class UpstashFilterTranslator extends BaseFilterTranslator {
    protected getSupportedOperators(): OperatorSupport;
    translate(filter?: VectorFilter): string | undefined;
    private translateNode;
    private readonly COMPARISON_OPS;
    private translateOperator;
    private readonly NEGATED_OPERATORS;
    private formatNot;
    private formatValue;
    private formatArray;
    private formatComparison;
    private joinConditions;
}

declare class UpstashStore extends MastraStorage {
    private redis;
    constructor(config: UpstashConfig);
    get supports(): {
        selectByIncludeResourceScope: boolean;
    };
    private transformEvalRecord;
    private parseJSON;
    private getKey;
    /**
     * Scans for keys matching the given pattern using SCAN and returns them as an array.
     * @param pattern Redis key pattern, e.g. "table:*"
     * @param batchSize Number of keys to scan per batch (default: 1000)
     */
    private scanKeys;
    /**
     * Deletes all keys matching the given pattern using SCAN and DEL in batches.
     * @param pattern Redis key pattern, e.g. "table:*"
     * @param batchSize Number of keys to delete per batch (default: 1000)
     */
    private scanAndDelete;
    private getMessageKey;
    private getThreadMessagesKey;
    private parseWorkflowRun;
    private processRecord;
    /**
     * @deprecated Use getEvals instead
     */
    getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
    /**
     * @deprecated use getTracesPaginated instead
     */
    getTraces(args: StorageGetTracesArg): Promise<any[]>;
    getTracesPaginated(args: {
        name?: string;
        scope?: string;
        attributes?: Record<string, string>;
        filters?: Record<string, any>;
    } & PaginationArgs): Promise<PaginationInfo & {
        traces: any[];
    }>;
    createTable({ tableName, schema, }: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
    }): Promise<void>;
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
    batchInsert(input: {
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
    /**
     * @deprecated use getThreadsByResourceIdPaginated instead
     */
    getThreadsByResourceId({ resourceId }: {
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
    saveMessages(args: {
        messages: MastraMessageV1[];
        format?: undefined | 'v1';
    }): Promise<MastraMessageV1[]>;
    saveMessages(args: {
        messages: MastraMessageV2[];
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    private _getIncludedMessages;
    /**
     * @deprecated use getMessagesPaginated instead
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
    persistWorkflowSnapshot(params: {
        namespace: string;
        workflowName: string;
        runId: string;
        snapshot: WorkflowRunState;
    }): Promise<void>;
    loadWorkflowSnapshot(params: {
        namespace: string;
        workflowName: string;
        runId: string;
    }): Promise<WorkflowRunState | null>;
    /**
     * Get all evaluations with pagination and total count
     * @param options Pagination and filtering options
     * @returns Object with evals array and total count
     */
    getEvals(options?: {
        agentName?: string;
        type?: 'test' | 'live';
    } & PaginationArgs): Promise<PaginationInfo & {
        evals: EvalRow[];
    }>;
    getWorkflowRuns({ namespace, workflowName, fromDate, toDate, limit, offset, resourceId, }?: {
        namespace: string;
        workflowName?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
        resourceId?: string;
    }): Promise<WorkflowRuns>;
    getWorkflowRunById({ namespace, runId, workflowName, }: {
        namespace: string;
        runId: string;
        workflowName?: string;
    }): Promise<WorkflowRun | null>;
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
export { UpstashStore }
export { UpstashStore as UpstashStore_alias_1 }

declare class UpstashVector extends MastraVector {
    private client;
    /**
     * Creates a new UpstashVector instance.
     * @param {object} params - The parameters for the UpstashVector.
     * @param {string} params.url - The URL of the Upstash vector index.
     * @param {string} params.token - The token for the Upstash vector index.
     */
    constructor({ url, token }: {
        url: string;
        token: string;
    });
    /**
     * Upserts vectors into the index.
     * @param {UpsertVectorParams} params - The parameters for the upsert operation.
     * @returns {Promise<string[]>} A promise that resolves to the IDs of the upserted vectors.
     */
    upsert({ indexName: namespace, vectors, metadata, ids }: UpsertVectorParams): Promise<string[]>;
    /**
     * Transforms a Mastra vector filter into an Upstash-compatible filter string.
     * @param {VectorFilter} [filter] - The filter to transform.
     * @returns {string | undefined} The transformed filter string, or undefined if no filter is provided.
     */
    transformFilter(filter?: VectorFilter): string | undefined;
    /**
     * Creates a new index. For Upstash, this is a no-op as indexes (known as namespaces in Upstash) are created on-the-fly.
     * @param {CreateIndexParams} _params - The parameters for creating the index (ignored).
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    createIndex(_params: CreateIndexParams): Promise<void>;
    /**
     * Queries the vector index.
     * @param {QueryVectorParams} params - The parameters for the query operation. indexName is the namespace in Upstash.
     * @returns {Promise<QueryResult[]>} A promise that resolves to the query results.
     */
    query({ indexName: namespace, queryVector, topK, filter, includeVector, }: QueryVectorParams): Promise<QueryResult[]>;
    /**
     * Lists all namespaces in the Upstash vector index, which correspond to indexes.
     * @returns {Promise<string[]>} A promise that resolves to a list of index names.
     */
    listIndexes(): Promise<string[]>;
    /**
     * Retrieves statistics about a vector index.
     *
     * @param {string} indexName - The name of the namespace to describe
     * @returns A promise that resolves to the index statistics including dimension, count and metric
     */
    describeIndex({ indexName: namespace }: DescribeIndexParams): Promise<IndexStats>;
    /**
     * Deletes an index (namespace).
     * @param {DeleteIndexParams} params - The parameters for the delete operation.
     * @returns {Promise<void>} A promise that resolves when the deletion is complete.
     */
    deleteIndex({ indexName: namespace }: DeleteIndexParams): Promise<void>;
    /**
     * Updates a vector by its ID with the provided vector and/or metadata.
     * @param indexName - The name of the namespace containing the vector.
     * @param id - The ID of the vector to update.
     * @param update - An object containing the vector and/or metadata to update.
     * @param update.vector - An optional array of numbers representing the new vector.
     * @param update.metadata - An optional record containing the new metadata.
     * @returns A promise that resolves when the update is complete.
     * @throws Will throw an error if no updates are provided or if the update operation fails.
     */
    updateVector({ indexName: namespace, id, update }: UpdateVectorParams): Promise<void>;
    /**
     * Deletes a vector by its ID.
     * @param indexName - The name of the namespace containing the vector.
     * @param id - The ID of the vector to delete.
     * @returns A promise that resolves when the deletion is complete.
     * @throws Will throw an error if the deletion operation fails.
     */
    deleteVector({ indexName: namespace, id }: DeleteVectorParams): Promise<void>;
}
export { UpstashVector }
export { UpstashVector as UpstashVector_alias_1 }

export { }
