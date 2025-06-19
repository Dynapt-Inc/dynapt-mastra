import { ArrayOperator } from '@mastra/core/vector/filter';
import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import { BasicOperator } from '@mastra/core/vector/filter';
import type { ConnectionOptions } from '@lancedb/lancedb';
import type { CreateIndexParams } from '@mastra/core';
import type { CreateTableOptions } from '@lancedb/lancedb';
import type { DeleteIndexParams } from '@mastra/core';
import type { DeleteVectorParams } from '@mastra/core';
import type { DescribeIndexParams } from '@mastra/core';
import type { EvalRow } from '@mastra/core/storage';
import type { IndexStats } from '@mastra/core';
import { LogicalOperator } from '@mastra/core/vector/filter';
import type { MastraMessageContentV2 } from '@mastra/core/agent';
import type { MastraMessageV1 } from '@mastra/core/memory';
import type { MastraMessageV2 } from '@mastra/core/memory';
import { MastraStorage } from '@mastra/core/storage';
import { MastraVector } from '@mastra/core/vector';
import { NumericOperator } from '@mastra/core/vector/filter';
import type { PaginationInfo } from '@mastra/core/storage';
import type { QueryResult } from '@mastra/core';
import type { QueryVectorParams } from '@mastra/core';
import { RegexOperator } from '@mastra/core/vector/filter';
import type { SchemaLike } from '@lancedb/lancedb';
import type { StorageColumn } from '@mastra/core/storage';
import type { StorageGetMessagesArg } from '@mastra/core/storage';
import type { StorageGetTracesArg } from '@mastra/core/storage';
import type { StorageThreadType } from '@mastra/core/memory';
import type { Table } from '@lancedb/lancedb';
import type { TABLE_NAMES } from '@mastra/core/storage';
import type { TableLike } from '@lancedb/lancedb';
import type { Trace } from '@mastra/core/telemetry';
import type { TraceType } from '@mastra/core/memory';
import type { UpdateVectorParams } from '@mastra/core';
import type { UpsertVectorParams } from '@mastra/core';
import type { VectorFilter } from '@mastra/core/vector/filter';
import type { WorkflowRuns } from '@mastra/core/storage';
import type { WorkflowRunState } from '@mastra/core/workflows';

declare interface HNSWConfig {
    m?: number;
    efConstruction?: number;
}

export declare interface IndexConfig {
    type?: IndexType;
    ivf?: IVFConfig;
    hnsw?: HNSWConfig;
}

export declare type IndexType = 'ivfflat' | 'hnsw';

declare interface IVFConfig {
    lists?: number;
}

declare interface LanceCreateIndexParams extends CreateIndexParams {
    indexConfig?: LanceIndexConfig;
    tableName?: string;
}

export declare class LanceFilterTranslator extends BaseFilterTranslator {
    translate(filter: VectorFilter): string;
    private processFilter;
    private processLogicalOperator;
    private processNestedObject;
    private processField;
    private processOperators;
    private formatValue;
    private formatArrayValues;
    normalizeArrayValues(array: unknown[]): unknown[];
    normalizeComparisonValue(value: unknown): unknown;
    private isOperatorObject;
    private isNestedObject;
    private isNormalNestedField;
    private escapeFieldName;
    private isSqlKeyword;
    private isDateObject;
    /**
     * Override getSupportedOperators to add custom operators for LanceDB
     */
    protected getSupportedOperators(): {
        custom: string[];
        logical: LogicalOperator[];
        basic: BasicOperator[];
        numeric: NumericOperator[];
        array: ArrayOperator[];
        element: "$exists"[];
        regex: RegexOperator[];
    };
}

declare interface LanceIndexConfig extends IndexConfig {
    numPartitions?: number;
    numSubVectors?: number;
}

declare interface LanceQueryVectorParams extends QueryVectorParams {
    tableName: string;
    columns?: string[];
    includeAllColumns?: boolean;
}

declare class LanceStorage extends MastraStorage {
    private lanceClient;
    /**
     * Creates a new instance of LanceStorage
     * @param uri The URI to connect to LanceDB
     * @param options connection options
     *
     * Usage:
     *
     * Connect to a local database
     * ```ts
     * const store = await LanceStorage.create('/path/to/db');
     * ```
     *
     * Connect to a LanceDB cloud database
     * ```ts
     * const store = await LanceStorage.create('db://host:port');
     * ```
     *
     * Connect to a cloud database
     * ```ts
     * const store = await LanceStorage.create('s3://bucket/db', { storageOptions: { timeout: '60s' } });
     * ```
     */
    static create(name: string, uri: string, options?: ConnectionOptions): Promise<LanceStorage>;
    /**
     * @internal
     * Private constructor to enforce using the create factory method
     */
    private constructor();
    createTable({ tableName, schema, }: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
    }): Promise<void>;
    private translateSchema;
    /**
     * Drop a table if it exists
     * @param tableName Name of the table to drop
     */
    dropTable(tableName: TABLE_NAMES): Promise<void>;
    /**
     * Get table schema
     * @param tableName Name of the table
     * @returns Table schema
     */
    getTableSchema(tableName: TABLE_NAMES): Promise<SchemaLike>;
    protected getDefaultValue(type: StorageColumn['type']): string;
    /**
     * Alters table schema to add columns if they don't exist
     * @param tableName Name of the table
     * @param schema Schema of the table
     * @param ifNotExists Array of column names to add if they don't exist
     */
    alterTable({ tableName, schema, ifNotExists, }: {
        tableName: string;
        schema: Record<string, StorageColumn>;
        ifNotExists: string[];
    }): Promise<void>;
    clearTable({ tableName }: {
        tableName: TABLE_NAMES;
    }): Promise<void>;
    /**
     * Insert a single record into a table. This function overwrites the existing record if it exists. Use this function for inserting records into tables with custom schemas.
     * @param tableName The name of the table to insert into.
     * @param record The record to insert.
     */
    insert({ tableName, record }: {
        tableName: string;
        record: Record<string, any>;
    }): Promise<void>;
    /**
     * Insert multiple records into a table. This function overwrites the existing records if they exist. Use this function for inserting records into tables with custom schemas.
     * @param tableName The name of the table to insert into.
     * @param records The records to insert.
     */
    batchInsert({ tableName, records }: {
        tableName: string;
        records: Record<string, any>[];
    }): Promise<void>;
    /**
     * Load a record from the database by its key(s)
     * @param tableName The name of the table to query
     * @param keys Record of key-value pairs to use for lookup
     * @throws Error if invalid types are provided for keys
     * @returns The loaded record with proper type conversions, or null if not found
     */
    load({ tableName, keys }: {
        tableName: TABLE_NAMES;
        keys: Record<string, any>;
    }): Promise<any>;
    /**
     * Validates that key types match the schema definition
     * @param keys The keys to validate
     * @param tableSchema The table schema to validate against
     * @throws Error if a key has an incompatible type
     */
    private validateKeyTypes;
    /**
     * Process a database result with appropriate type conversions based on the table schema
     * @param rawResult The raw result object from the database
     * @param tableSchema The schema of the table containing type information
     * @returns Processed result with correct data types
     */
    private processResultWithTypeConversion;
    getThreadById({ threadId }: {
        threadId: string;
    }): Promise<StorageThreadType | null>;
    getThreadsByResourceId({ resourceId }: {
        resourceId: string;
    }): Promise<StorageThreadType[]>;
    /**
     * Saves a thread to the database. This function doesn't overwrite existing threads.
     * @param thread - The thread to save
     * @returns The saved thread
     */
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
    /**
     * Processes messages to include context messages based on withPreviousMessages and withNextMessages
     * @param records - The sorted array of records to process
     * @param include - The array of include specifications with context parameters
     * @returns The processed array with context messages included
     */
    private processMessagesWithContext;
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
    saveTrace({ trace }: {
        trace: TraceType;
    }): Promise<TraceType>;
    getTraceById({ traceId }: {
        traceId: string;
    }): Promise<TraceType>;
    getTraces({ name, scope, page, perPage, attributes, }: {
        name?: string;
        scope?: string;
        page: number;
        perPage: number;
        attributes?: Record<string, string>;
    }): Promise<TraceType[]>;
    saveEvals({ evals }: {
        evals: EvalRow[];
    }): Promise<EvalRow[]>;
    getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
    private parseWorkflowRun;
    getWorkflowRuns(args?: {
        namespace?: string;
        workflowName?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<WorkflowRuns>;
    /**
     * Retrieve a single workflow run by its runId.
     * @param args The ID of the workflow run to retrieve
     * @returns The workflow run object or null if not found
     */
    getWorkflowRunById(args: {
        runId: string;
        workflowName?: string;
    }): Promise<{
        workflowName: string;
        runId: string;
        snapshot: any;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    persistWorkflowSnapshot({ workflowName, runId, snapshot, }: {
        workflowName: string;
        runId: string;
        snapshot: WorkflowRunState;
    }): Promise<void>;
    loadWorkflowSnapshot({ workflowName, runId, }: {
        workflowName: string;
        runId: string;
    }): Promise<WorkflowRunState | null>;
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
export { LanceStorage }
export { LanceStorage as LanceStorage_alias_1 }

declare interface LanceUpsertVectorParams extends UpsertVectorParams {
    tableName: string;
}

declare class LanceVectorStore extends MastraVector {
    private lanceClient;
    /**
     * Creates a new instance of LanceVectorStore
     * @param uri The URI to connect to LanceDB
     * @param options connection options
     *
     * Usage:
     *
     * Connect to a local database
     * ```ts
     * const store = await LanceVectorStore.create('/path/to/db');
     * ```
     *
     * Connect to a LanceDB cloud database
     * ```ts
     * const store = await LanceVectorStore.create('db://host:port');
     * ```
     *
     * Connect to a cloud database
     * ```ts
     * const store = await LanceVectorStore.create('s3://bucket/db', { storageOptions: { timeout: '60s' } });
     * ```
     */
    static create(uri: string, options?: ConnectionOptions): Promise<LanceVectorStore>;
    /**
     * @internal
     * Private constructor to enforce using the create factory method
     */
    private constructor();
    close(): void;
    query({ tableName, queryVector, filter, includeVector, topK, columns, includeAllColumns, }: LanceQueryVectorParams): Promise<QueryResult[]>;
    private filterTranslator;
    upsert({ tableName, vectors, metadata, ids }: LanceUpsertVectorParams): Promise<string[]>;
    /**
     * Flattens a nested object, creating new keys with underscores for nested properties.
     * Example: { metadata: { text: 'test' } } → { metadata_text: 'test' }
     */
    private flattenObject;
    createTable(tableName: string, data: Record<string, unknown>[] | TableLike, options?: Partial<CreateTableOptions>): Promise<Table>;
    listTables(): Promise<string[]>;
    getTableSchema(tableName: string): Promise<any>;
    /**
     * indexName is actually a column name in a table in lanceDB
     */
    createIndex({ tableName, indexName, dimension, metric, indexConfig, }: LanceCreateIndexParams): Promise<void>;
    listIndexes(): Promise<string[]>;
    describeIndex({ indexName }: DescribeIndexParams): Promise<IndexStats>;
    deleteIndex({ indexName }: DeleteIndexParams): Promise<void>;
    /**
     * Deletes all tables in the database
     */
    deleteAllTables(): Promise<void>;
    deleteTable(tableName: string): Promise<void>;
    updateVector({ indexName, id, update }: UpdateVectorParams): Promise<void>;
    deleteVector({ indexName, id }: DeleteVectorParams): Promise<void>;
    /**
     * Converts a flattened object with keys using underscore notation back to a nested object.
     * Example: { name: 'test', details_text: 'test' } → { name: 'test', details: { text: 'test' } }
     */
    private unflattenObject;
}
export { LanceVectorStore }
export { LanceVectorStore as LanceVectorStore_alias_1 }

export { }
