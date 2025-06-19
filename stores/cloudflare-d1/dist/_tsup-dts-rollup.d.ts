import type { D1Database as D1Database_2 } from '@cloudflare/workers-types';
import type { EvalRow } from '@mastra/core/storage';
import type { MastraMessageContentV2 } from '@mastra/core/agent';
import type { MastraMessageV1 } from '@mastra/core/memory';
import type { MastraMessageV2 } from '@mastra/core/memory';
import { MastraStorage } from '@mastra/core/storage';
import type { PaginationInfo } from '@mastra/core/storage';
import type { StorageColumn } from '@mastra/core/storage';
import type { StorageGetMessagesArg } from '@mastra/core/storage';
import type { StorageThreadType } from '@mastra/core/memory';
import type { TABLE_NAMES } from '@mastra/core/storage';
import type { Trace } from '@mastra/core/telemetry';
import type { WorkflowRun } from '@mastra/core/storage';
import type { WorkflowRuns } from '@mastra/core/storage';
import type { WorkflowRunState } from '@mastra/core/workflows';

export declare const createSampleTrace: (name: string, scope?: string, attributes?: Record<string, string>) => {
    id: string;
    parentSpanId: string;
    traceId: string;
    name: string;
    scope: string | undefined;
    kind: string;
    status: string;
    events: string;
    links: string;
    attributes: string | undefined;
    startTime: string;
    endTime: string;
    other: string;
    createdAt: string;
};

export declare function createSqlBuilder(): SqlBuilder;

/**
 * Configuration for D1 using the REST API
 */
declare interface D1Config {
    /** Cloudflare account ID */
    accountId: string;
    /** Cloudflare API token with D1 access */
    apiToken: string;
    /** D1 database ID */
    databaseId: string;
    /** Optional prefix for table names */
    tablePrefix?: string;
}
export { D1Config }
export { D1Config as D1Config_alias_1 }

declare class D1Store extends MastraStorage {
    private client?;
    private accountId?;
    private databaseId?;
    private binding?;
    private tablePrefix;
    /**
     * Creates a new D1Store instance
     * @param config Configuration for D1 access (either REST API or Workers Binding API)
     */
    constructor(config: D1StoreConfig);
    private getTableName;
    private formatSqlParams;
    private executeWorkersBindingQuery;
    private executeRestQuery;
    /**
     * Execute a SQL query against the D1 database
     * @param options Query options including SQL, parameters, and whether to return only the first result
     * @returns Query results as an array or a single object if first=true
     */
    private executeQuery;
    private getTableColumns;
    private serializeValue;
    private deserializeValue;
    protected getSqlType(type: StorageColumn['type']): string;
    createTable({ tableName, schema, }: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
    }): Promise<void>;
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
    private processRecord;
    insert({ tableName, record }: {
        tableName: TABLE_NAMES;
        record: Record<string, any>;
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
        page: number;
        perPage: number;
    }): Promise<PaginationInfo & {
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
    getMessagesPaginated({ threadId, selectBy, format, }: StorageGetMessagesArg & {
        format?: 'v1' | 'v2';
    }): Promise<PaginationInfo & {
        messages: MastraMessageV1[] | MastraMessageV2[];
    }>;
    persistWorkflowSnapshot({ workflowName, runId, snapshot, }: {
        workflowName: string;
        runId: string;
        snapshot: WorkflowRunState;
    }): Promise<void>;
    loadWorkflowSnapshot(params: {
        workflowName: string;
        runId: string;
    }): Promise<WorkflowRunState | null>;
    /**
     * Insert multiple records in a batch operation
     * @param tableName The table to insert into
     * @param records The records to insert
     */
    batchInsert({ tableName, records }: {
        tableName: TABLE_NAMES;
        records: Record<string, any>[];
    }): Promise<void>;
    /**
     * @deprecated use getTracesPaginated instead
     */
    getTraces({ name, scope, page, perPage, attributes, fromDate, toDate, }: {
        name?: string;
        scope?: string;
        page: number;
        perPage: number;
        attributes?: Record<string, string>;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<Trace[]>;
    getTracesPaginated(args: {
        name?: string;
        scope?: string;
        attributes?: Record<string, string>;
        page: number;
        perPage: number;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<PaginationInfo & {
        traces: Trace[];
    }>;
    /**
     * @deprecated use getEvals instead
     */
    getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
    getEvals(options?: {
        agentName?: string;
        type?: 'test' | 'live';
        page?: number;
        perPage?: number;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<PaginationInfo & {
        evals: EvalRow[];
    }>;
    private parseWorkflowRun;
    private hasColumn;
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
    /**
     * Close the database connection
     * No explicit cleanup needed for D1 in either REST or Workers Binding mode
     */
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
export { D1Store }
export { D1Store as D1Store_alias_1 }

/**
 * Combined configuration type supporting both REST API and Workers Binding API
 */
declare type D1StoreConfig = D1Config | D1WorkersConfig;
export { D1StoreConfig }
export { D1StoreConfig as D1StoreConfig_alias_1 }

/**
 * Configuration for D1 using the Workers Binding API
 */
declare interface D1WorkersConfig {
    /** D1 database binding from Workers environment */
    binding: D1Database_2;
    /** Optional prefix for table names */
    tablePrefix?: string;
}
export { D1WorkersConfig }
export { D1WorkersConfig as D1WorkersConfig_alias_1 }

/**
 * Parses and returns a valid SQL SELECT column identifier.
 * Allows a single identifier (letters, numbers, underscores), or '*', optionally with 'AS alias'.
 *
 * @param column - The column identifier string to parse.
 * @returns The validated column identifier as a branded type.
 * @throws {Error} If invalid.
 *
 * @example
 * const col = parseSelectIdentifier('user_id'); // Ok
 * parseSelectIdentifier('user_id AS uid'); // Ok
 * parseSelectIdentifier('*'); // Ok
 * parseSelectIdentifier('user id'); // Throws error
 */
export declare function parseSelectIdentifier(column: string): SelectIdentifier;

export declare const retryUntil: <T>(fn: () => Promise<T>, condition: (result: T) => boolean, timeout?: number, // REST API needs longer timeout due to higher latency
interval?: number) => Promise<T>;

/** Represents a validated SQL SELECT column identifier (or '*', optionally with 'AS alias'). */
declare type SelectIdentifier = string & {
    __brand: 'SelectIdentifier';
};

/**
 * SQL Builder class for constructing type-safe SQL queries
 * This helps create maintainable and secure SQL queries with proper parameter handling
 */
export declare class SqlBuilder {
    private sql;
    private params;
    private whereAdded;
    select(columns?: string | string[]): SqlBuilder;
    from(table: string): SqlBuilder;
    /**
     * Add a WHERE clause to the query
     * @param condition The condition to add
     * @param params Parameters to bind to the condition
     */
    where(condition: string, ...params: SqlParam[]): SqlBuilder;
    /**
     * Add a WHERE clause if it hasn't been added yet, otherwise add an AND clause
     * @param condition The condition to add
     * @param params Parameters to bind to the condition
     */
    whereAnd(condition: string, ...params: SqlParam[]): SqlBuilder;
    andWhere(condition: string, ...params: SqlParam[]): SqlBuilder;
    orWhere(condition: string, ...params: SqlParam[]): SqlBuilder;
    orderBy(column: string, direction?: 'ASC' | 'DESC'): SqlBuilder;
    limit(count: number): SqlBuilder;
    offset(count: number): SqlBuilder;
    count(): SqlBuilder;
    /**
     * Insert a row, or update specific columns on conflict (upsert).
     * @param table Table name
     * @param columns Columns to insert
     * @param values Values to insert
     * @param conflictColumns Columns to check for conflict (usually PK or UNIQUE)
     * @param updateMap Object mapping columns to update to their new value (e.g. { name: 'excluded.name' })
     */
    insert(table: string, columns: string[], values: SqlParam[], conflictColumns?: string[], updateMap?: Record<string, string>): SqlBuilder;
    update(table: string, columns: string[], values: SqlParam[]): SqlBuilder;
    delete(table: string): SqlBuilder;
    /**
     * Create a table if it doesn't exist
     * @param table The table name
     * @param columnDefinitions The column definitions as an array of strings
     * @param tableConstraints Optional constraints for the table
     * @returns The builder instance
     */
    createTable(table: string, columnDefinitions: string[], tableConstraints?: string[]): SqlBuilder;
    /**
     * Check if an index exists in the database
     * @param indexName The name of the index to check
     * @param tableName The table the index is on
     * @returns The builder instance
     */
    checkIndexExists(indexName: string, tableName: string): SqlBuilder;
    /**
     * Create an index if it doesn't exist
     * @param indexName The name of the index to create
     * @param tableName The table to create the index on
     * @param columnName The column to index
     * @param indexType Optional index type (e.g., 'UNIQUE')
     * @returns The builder instance
     */
    createIndex(indexName: string, tableName: string, columnName: string, indexType?: string): SqlBuilder;
    /**
     * Add a LIKE condition to the query
     * @param column The column to check
     * @param value The value to match (will be wrapped with % for LIKE)
     * @param exact If true, will not add % wildcards
     */
    like(column: string, value: string, exact?: boolean): SqlBuilder;
    /**
     * Add a JSON LIKE condition for searching in JSON fields
     * @param column The JSON column to search in
     * @param key The JSON key to match
     * @param value The value to match
     */
    jsonLike(column: string, key: string, value: string): SqlBuilder;
    /**
     * Get the built query
     * @returns Object containing the SQL string and parameters array
     */
    build(): {
        sql: string;
        params: SqlParam[];
    };
    /**
     * Reset the builder for reuse
     * @returns The reset builder instance
     */
    reset(): SqlBuilder;
}

/**
 * Type definition for SQL query parameters
 */
export declare type SqlParam = string | number | boolean | null | undefined;

/**
 * Interface for SQL query options with generic type support
 */
export declare interface SqlQueryOptions {
    /** SQL query to execute */
    sql: string;
    /** Parameters to bind to the query */
    params?: SqlParam[];
    /** Whether to return only the first result */
    first?: boolean;
}

export { }
