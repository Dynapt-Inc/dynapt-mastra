import type { EvalRow } from '@mastra/core/storage';
import type { KVNamespace as KVNamespace_2 } from '@cloudflare/workers-types';
import { KVNamespaceListKey as KVNamespaceListKey_2 } from '@cloudflare/workers-types';
import type { MastraMessageContentV2 } from '@mastra/core/agent';
import type { MastraMessageV1 } from '@mastra/core/memory';
import type { MastraMessageV2 } from '@mastra/core/memory';
import { MastraStorage } from '@mastra/core/storage';
import type { PaginationInfo } from '@mastra/core/storage';
import type { StorageColumn } from '@mastra/core/storage';
import type { StorageGetMessagesArg } from '@mastra/core/storage';
import type { StorageGetTracesArg } from '@mastra/core/storage';
import type { StorageThreadType } from '@mastra/core/memory';
import type { TABLE_EVALS } from '@mastra/core/storage';
import type { TABLE_MESSAGES } from '@mastra/core/storage';
import type { TABLE_NAMES } from '@mastra/core/storage';
import type { TABLE_THREADS } from '@mastra/core/storage';
import type { TABLE_TRACES } from '@mastra/core/storage';
import type { TABLE_WORKFLOW_SNAPSHOT } from '@mastra/core/storage';
import type { Trace } from '@mastra/core/telemetry';
import type { WorkflowRun } from '@mastra/core/storage';
import type { WorkflowRuns } from '@mastra/core/storage';
import type { WorkflowRunState } from '@mastra/core/workflows';
import type { WorkflowRunState as WorkflowRunState_2 } from '@mastra/core';

/**
 * Configuration for Cloudflare KV using REST API
 */
export declare interface CloudflareRestConfig {
    /** Cloudflare account ID */
    accountId: string;
    /** Cloudflare API token with KV access */
    apiToken: string;
    /**
     * Prefix for KV namespace names.
     * Recommended for production use to ensure data isolation between different instances.
     * If not provided, no prefix will be used
     */
    namespacePrefix?: string;
}

declare class CloudflareStore extends MastraStorage {
    private client?;
    private accountId?;
    private namespacePrefix;
    private bindings?;
    private validateWorkersConfig;
    private validateRestConfig;
    constructor(config: CloudflareStoreConfig);
    private getBinding;
    private listNamespaces;
    private getNamespaceValue;
    private putNamespaceValue;
    private deleteNamespaceValue;
    listNamespaceKeys(tableName: TABLE_NAMES, options?: ListOptions): Promise<KVNamespaceListKey_2<unknown, string>[]>;
    private createNamespaceById;
    private getNamespaceIdByName;
    private createNamespace;
    private getOrCreateNamespaceId;
    private getNamespaceId;
    private LEGACY_NAMESPACE_MAP;
    /**
     * There were a few legacy mappings for tables such as
     * - messages -> threads
     * - workflow_snapshot -> mastra_workflows
     * - traces -> evals
     * This has been updated to use dedicated namespaces for each table.
     * In the case of data for a table existing in the legacy namespace, warn the user to migrate to the new namespace.
     *
     * @param tableName The table name to check for legacy data
     * @param prefix The namespace prefix
     * @returns The legacy namespace ID if data exists; otherwise, null
     */
    private checkLegacyNamespace;
    /**
     * Helper to safely serialize data for KV storage
     */
    private safeSerialize;
    /**
     * Helper to safely parse data from KV storage
     */
    private safeParse;
    private putKV;
    private getKV;
    private deleteKV;
    private listKV;
    private getSortedMessages;
    private updateSorting;
    private getIncludedMessagesWithContext;
    private getRecentMessages;
    private fetchAndParseMessages;
    /**
     * Queue for serializing sorted order updates.
     * Updates the sorted order for a given key. This operation is eventually consistent.
     */
    private updateQueue;
    /**
     * Updates the sorted order for a given key. This operation is eventually consistent.
     * Note: Operations on the same orderKey are serialized using a queue to prevent
     * concurrent updates from conflicting with each other.
     */
    private updateSortedMessages;
    private getRank;
    private getRange;
    private getLastN;
    private getFullOrder;
    private getKey;
    private getSchemaKey;
    private getTableSchema;
    private validateColumnValue;
    private validateAgainstSchema;
    private validateRecord;
    private ensureMetadata;
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
    insert<T extends TABLE_NAMES>({ tableName, record, }: {
        tableName: T;
        record: Record<string, any>;
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
    private getMessageKey;
    private getThreadMessagesKey;
    saveMessages(args: {
        messages: MastraMessageV1[];
        format?: undefined | 'v1';
    }): Promise<MastraMessageV1[]>;
    saveMessages(args: {
        messages: MastraMessageV2[];
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    getMessages(args: StorageGetMessagesArg & {
        format?: 'v1';
    }): Promise<MastraMessageV1[]>;
    getMessages(args: StorageGetMessagesArg & {
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    private validateWorkflowParams;
    private validateWorkflowState;
    private normalizeSteps;
    private normalizeWorkflowState;
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
    batchInsert<T extends TABLE_NAMES>(input: {
        tableName: T;
        records: Partial<RecordTypes[T]>[];
    }): Promise<void>;
    getTraces({ name, scope, page, perPage, attributes, fromDate, toDate, }: {
        name?: string;
        scope?: string;
        page: number;
        perPage: number;
        attributes?: Record<string, string>;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<any[]>;
    private parseJSON;
    getEvalsByAgentName(_agentName: string, _type?: 'test' | 'live'): Promise<EvalRow[]>;
    private parseWorkflowRun;
    private buildWorkflowSnapshotPrefix;
    getWorkflowRuns({ namespace, workflowName, limit, offset, resourceId, fromDate, toDate, }?: {
        namespace?: string;
        workflowName?: string;
        limit?: number;
        offset?: number;
        resourceId?: string;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<WorkflowRuns>;
    getWorkflowRunById({ namespace, runId, workflowName, }: {
        namespace: string;
        runId: string;
        workflowName: string;
    }): Promise<WorkflowRun | null>;
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
export { CloudflareStore }
export { CloudflareStore as CloudflareStore_alias_1 }

/**
 * Combined configuration type supporting both REST API and Workers Binding API
 */
export declare type CloudflareStoreConfig = CloudflareRestConfig | CloudflareWorkersConfig;

/**
 * Configuration for Cloudflare KV using Workers Binding API
 */
export declare interface CloudflareWorkersConfig {
    /** KV namespace bindings from Workers environment */
    bindings: {
        [key in TABLE_NAMES]: KVNamespace_2;
    };
    /** Optional prefix for keys within namespaces */
    keyPrefix?: string;
}

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

export declare const createSampleWorkflowSnapshot: (threadId: string, status: string, createdAt?: Date) => {
    snapshot: WorkflowRunState_2;
    runId: string;
    stepId: string;
};

/**
 * Helper to determine if a config is using Workers bindings
 */
export declare function isWorkersConfig(config: CloudflareStoreConfig): config is CloudflareWorkersConfig;

/**
 * Interface for KV operations with type support
 */
export declare interface KVOperation {
    /** Table/namespace to operate on */
    tableName: TABLE_NAMES;
    /** Key to read/write */
    key: string;
    /** Value to write (for put operations) */
    value?: any;
    /** Optional metadata to associate with the value */
    metadata?: any;
}

export declare type ListOptions = {
    limit?: number;
    prefix?: string;
};

export declare type RecordTypes = {
    [TABLE_THREADS]: StorageThreadType;
    [TABLE_MESSAGES]: MastraMessageV2;
    [TABLE_WORKFLOW_SNAPSHOT]: WorkflowRunState;
    [TABLE_EVALS]: EvalRow;
    [TABLE_TRACES]: any;
};

export declare const retryUntil: <T>(fn: () => Promise<T>, condition: (result: T) => boolean, timeout?: number, // REST API needs longer timeout due to higher latency
interval?: number) => Promise<T>;

export { }
