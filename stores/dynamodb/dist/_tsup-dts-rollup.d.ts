import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Entity } from 'electrodb';
import type { EvalRow } from '@mastra/core';
import type { MastraMessageContentV2 } from '@mastra/core/agent';
import type { MastraMessageV1 } from '@mastra/core';
import type { MastraMessageV2 } from '@mastra/core';
import { MastraStorage } from '@mastra/core/storage';
import type { PaginationInfo } from '@mastra/core';
import { Service } from 'electrodb';
import type { StorageColumn } from '@mastra/core';
import type { StorageGetMessagesArg } from '@mastra/core';
import type { StorageGetTracesArg } from '@mastra/core';
import type { StorageThreadType } from '@mastra/core';
import type { TABLE_NAMES } from '@mastra/core/storage';
import type { Trace } from '@mastra/core/telemetry';
import type { WorkflowRun } from '@mastra/core';
import type { WorkflowRuns } from '@mastra/core';
import type { WorkflowRunState } from '@mastra/core';

export declare const baseAttributes: {
    readonly createdAt: {
        readonly type: "string";
        readonly required: true;
        readonly readOnly: true;
        readonly set: (value?: Date | string) => string;
        readonly default: () => string;
    };
    readonly updatedAt: {
        readonly type: "string";
        readonly required: true;
        readonly set: (value?: Date | string) => string;
        readonly default: () => string;
    };
    readonly metadata: {
        readonly type: "string";
        readonly set: (value?: Record<string, unknown> | string) => string | undefined;
        readonly get: (value?: string) => any;
    };
};

declare class DynamoDBStore extends MastraStorage {
    private tableName;
    private client;
    private service;
    protected hasInitialized: Promise<boolean> | null;
    constructor({ name, config }: {
        name: string;
        config: DynamoDBStoreConfig;
    });
    /**
     * This method is modified for DynamoDB with ElectroDB single-table design.
     * It assumes the table is created and managed externally via CDK/CloudFormation.
     *
     * This implementation only validates that the required table exists and is accessible.
     * No table creation is attempted - we simply check if we can access the table.
     */
    createTable({ tableName }: {
        tableName: TABLE_NAMES;
        schema: Record<string, any>;
    }): Promise<void>;
    /**
     * Validates that the required DynamoDB table exists and is accessible.
     * This does not check the table structure - it assumes the table
     * was created with the correct structure via CDK/CloudFormation.
     */
    private validateTableExists;
    /**
     * Initialize storage, validating the externally managed table is accessible.
     * For the single-table design, we only validate once that we can access
     * the table that was created via CDK/CloudFormation.
     */
    init(): Promise<void>;
    /**
     * Performs the actual table validation and stores the promise.
     * Handles resetting the stored promise on failure to allow retries.
     */
    private _performInitializationAndStore;
    /**
     * Pre-processes a record to ensure Date objects are converted to ISO strings
     * This is necessary because ElectroDB validation happens before setters are applied
     */
    private preprocessRecord;
    alterTable(_args: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
        ifNotExists: string[];
    }): Promise<void>;
    /**
     * Clear all items from a logical "table" (entity type)
     */
    clearTable({ tableName }: {
        tableName: TABLE_NAMES;
    }): Promise<void>;
    /**
     * Insert a record into the specified "table" (entity)
     */
    insert({ tableName, record }: {
        tableName: TABLE_NAMES;
        record: Record<string, any>;
    }): Promise<void>;
    /**
     * Insert multiple records as a batch
     */
    batchInsert({ tableName, records }: {
        tableName: TABLE_NAMES;
        records: Record<string, any>[];
    }): Promise<void>;
    /**
     * Load a record by its keys
     */
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
    private parseMessageData;
    getTraces(args: {
        name?: string;
        scope?: string;
        page: number;
        perPage: number;
        attributes?: Record<string, string>;
        filters?: Record<string, any>;
    }): Promise<any[]>;
    batchTraceInsert({ records }: {
        records: Record<string, any>[];
    }): Promise<void>;
    persistWorkflowSnapshot({ workflowName, runId, snapshot, }: {
        workflowName: string;
        runId: string;
        snapshot: WorkflowRunState;
    }): Promise<void>;
    loadWorkflowSnapshot({ workflowName, runId, }: {
        workflowName: string;
        runId: string;
    }): Promise<WorkflowRunState | null>;
    getWorkflowRuns(args?: {
        workflowName?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
        resourceId?: string;
    }): Promise<WorkflowRuns>;
    getWorkflowRunById(args: {
        runId: string;
        workflowName?: string;
    }): Promise<WorkflowRun | null>;
    private formatWorkflowRun;
    private getEntityNameForTable;
    getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
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
    /**
     * Closes the DynamoDB client connection and cleans up resources.
     * Should be called when the store is no longer needed, e.g., at the end of tests or application shutdown.
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
export { DynamoDBStore }
export { DynamoDBStore as DynamoDBStore_alias_1 }

declare interface DynamoDBStoreConfig {
    region?: string;
    tableName: string;
    endpoint?: string;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    };
}
export { DynamoDBStoreConfig }
export { DynamoDBStoreConfig as DynamoDBStoreConfig_alias_1 }

export declare const evalEntity: Entity<string, string, string, {
    model: {
        entity: string;
        version: string;
        service: string;
    };
    attributes: {
        input: {
            type: "string";
            required: true;
        };
        output: {
            type: "string";
            required: true;
        };
        result: {
            type: "string";
            required: true;
            set: (value?: any) => any;
            get: (value?: string) => any;
        };
        agent_name: {
            type: "string";
            required: true;
        };
        metric_name: {
            type: "string";
            required: true;
        };
        instructions: {
            type: "string";
            required: true;
        };
        test_info: {
            type: "string";
            required: false;
            set: (value?: any) => any;
            get: (value?: string) => string | undefined;
        };
        global_run_id: {
            type: "string";
            required: true;
        };
        run_id: {
            type: "string";
            required: true;
        };
        created_at: {
            type: "string";
            required: true;
            default: () => string;
            set: (value?: Date | string) => string;
        };
        createdAt: {
            readonly type: "string";
            readonly required: true;
            readonly readOnly: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        updatedAt: {
            readonly type: "string";
            readonly required: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        metadata: {
            readonly type: "string";
            readonly set: (value?: Record<string, unknown> | string) => string | undefined;
            readonly get: (value?: string) => any;
        };
        entity: {
            type: "string";
            required: true;
        };
    };
    indexes: {
        primary: {
            pk: {
                field: string;
                composite: ("entity" | "run_id")[];
            };
            sk: {
                field: string;
                composite: never[];
            };
        };
        byAgent: {
            index: string;
            pk: {
                field: string;
                composite: ("entity" | "agent_name")[];
            };
            sk: {
                field: string;
                composite: "created_at"[];
            };
        };
    };
}>;

export declare function getElectroDbService(client: DynamoDBDocumentClient, tableName: string): Service<{
    thread: Entity<string, string, string, {
    model: {
    entity: string;
    version: string;
    service: string;
    };
    attributes: {
    id: {
    type: "string";
    required: true;
    };
    resourceId: {
    type: "string";
    required: true;
    };
    title: {
    type: "string";
    required: true;
    };
    metadata: {
    type: "string";
    required: false;
    set: (value?: Record<string, unknown> | string) => string | undefined;
    get: (value?: string) => any;
    };
    createdAt: {
    readonly type: "string";
    readonly required: true;
    readonly readOnly: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    updatedAt: {
    readonly type: "string";
    readonly required: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    entity: {
    type: "string";
    required: true;
    };
    };
    indexes: {
    primary: {
    pk: {
    field: string;
    composite: ("entity" | "id")[];
    };
    sk: {
    field: string;
    composite: "id"[];
    };
    };
    byResource: {
    index: string;
    pk: {
    field: string;
    composite: ("entity" | "resourceId")[];
    };
    sk: {
    field: string;
    composite: "createdAt"[];
    };
    };
    };
    }>;
    message: Entity<string, string, string, {
    model: {
    entity: string;
    version: string;
    service: string;
    };
    attributes: {
    id: {
    type: "string";
    required: true;
    };
    threadId: {
    type: "string";
    required: true;
    };
    content: {
    type: "string";
    required: true;
    set: (value?: string | void | undefined) => string | void;
    get: (value?: string) => any;
    };
    role: {
    type: "string";
    required: true;
    };
    type: {
    type: "string";
    default: string;
    };
    resourceId: {
    type: "string";
    required: false;
    };
    toolCallIds: {
    type: "string";
    required: false;
    set: (value?: string[] | string) => string | undefined;
    get: (value?: string) => any;
    };
    toolCallArgs: {
    type: "string";
    required: false;
    set: (value?: Record<string, unknown>[] | string) => string | undefined;
    get: (value?: string) => any;
    };
    toolNames: {
    type: "string";
    required: false;
    set: (value?: string[] | string) => string | undefined;
    get: (value?: string) => any;
    };
    createdAt: {
    readonly type: "string";
    readonly required: true;
    readonly readOnly: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    updatedAt: {
    readonly type: "string";
    readonly required: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    metadata: {
    readonly type: "string";
    readonly set: (value?: Record<string, unknown> | string) => string | undefined;
    readonly get: (value?: string) => any;
    };
    entity: {
    type: "string";
    required: true;
    };
    };
    indexes: {
    primary: {
    pk: {
    field: string;
    composite: ("entity" | "id")[];
    };
    sk: {
    field: string;
    composite: "entity"[];
    };
    };
    byThread: {
    index: string;
    pk: {
    field: string;
    composite: ("entity" | "threadId")[];
    };
    sk: {
    field: string;
    composite: "createdAt"[];
    };
    };
    };
    }>;
    eval: Entity<string, string, string, {
    model: {
    entity: string;
    version: string;
    service: string;
    };
    attributes: {
    input: {
    type: "string";
    required: true;
    };
    output: {
    type: "string";
    required: true;
    };
    result: {
    type: "string";
    required: true;
    set: (value?: any) => any;
    get: (value?: string) => any;
    };
    agent_name: {
    type: "string";
    required: true;
    };
    metric_name: {
    type: "string";
    required: true;
    };
    instructions: {
    type: "string";
    required: true;
    };
    test_info: {
    type: "string";
    required: false;
    set: (value?: any) => any;
    get: (value?: string) => string | undefined;
    };
    global_run_id: {
    type: "string";
    required: true;
    };
    run_id: {
    type: "string";
    required: true;
    };
    created_at: {
    type: "string";
    required: true;
    default: () => string;
    set: (value?: Date | string) => string;
    };
    createdAt: {
    readonly type: "string";
    readonly required: true;
    readonly readOnly: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    updatedAt: {
    readonly type: "string";
    readonly required: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    metadata: {
    readonly type: "string";
    readonly set: (value?: Record<string, unknown> | string) => string | undefined;
    readonly get: (value?: string) => any;
    };
    entity: {
    type: "string";
    required: true;
    };
    };
    indexes: {
    primary: {
    pk: {
    field: string;
    composite: ("entity" | "run_id")[];
    };
    sk: {
    field: string;
    composite: never[];
    };
    };
    byAgent: {
    index: string;
    pk: {
    field: string;
    composite: ("entity" | "agent_name")[];
    };
    sk: {
    field: string;
    composite: "created_at"[];
    };
    };
    };
    }>;
    trace: Entity<string, string, string, {
    model: {
    entity: string;
    version: string;
    service: string;
    };
    attributes: {
    id: {
    type: "string";
    required: true;
    };
    parentSpanId: {
    type: "string";
    required: false;
    };
    name: {
    type: "string";
    required: true;
    };
    traceId: {
    type: "string";
    required: true;
    };
    scope: {
    type: "string";
    required: true;
    };
    kind: {
    type: "number";
    required: true;
    };
    attributes: {
    type: "string";
    required: false;
    set: (value?: any) => any;
    get: (value?: string) => any;
    };
    status: {
    type: "string";
    required: false;
    set: (value?: any) => any;
    get: (value?: string) => string | undefined;
    };
    events: {
    type: "string";
    required: false;
    set: (value?: any) => any;
    get: (value?: string) => string | undefined;
    };
    links: {
    type: "string";
    required: false;
    set: (value?: any) => any;
    get: (value?: string) => string | undefined;
    };
    other: {
    type: "string";
    required: false;
    };
    startTime: {
    type: "number";
    required: true;
    };
    endTime: {
    type: "number";
    required: true;
    };
    createdAt: {
    readonly type: "string";
    readonly required: true;
    readonly readOnly: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    updatedAt: {
    readonly type: "string";
    readonly required: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    metadata: {
    readonly type: "string";
    readonly set: (value?: Record<string, unknown> | string) => string | undefined;
    readonly get: (value?: string) => any;
    };
    entity: {
    type: "string";
    required: true;
    };
    };
    indexes: {
    primary: {
    pk: {
    field: string;
    composite: ("entity" | "id")[];
    };
    sk: {
    field: string;
    composite: never[];
    };
    };
    byName: {
    index: string;
    pk: {
    field: string;
    composite: ("entity" | "name")[];
    };
    sk: {
    field: string;
    composite: "startTime"[];
    };
    };
    byScope: {
    index: string;
    pk: {
    field: string;
    composite: ("entity" | "scope")[];
    };
    sk: {
    field: string;
    composite: "startTime"[];
    };
    };
    };
    }>;
    workflowSnapshot: Entity<string, string, string, {
    model: {
    entity: string;
    version: string;
    service: string;
    };
    attributes: {
    workflow_name: {
    type: "string";
    required: true;
    };
    run_id: {
    type: "string";
    required: true;
    };
    snapshot: {
    type: "string";
    required: true;
    set: (value?: any) => any;
    get: (value?: string) => any;
    };
    resourceId: {
    type: "string";
    required: false;
    };
    createdAt: {
    readonly type: "string";
    readonly required: true;
    readonly readOnly: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    updatedAt: {
    readonly type: "string";
    readonly required: true;
    readonly set: (value?: Date | string) => string;
    readonly default: () => string;
    };
    metadata: {
    readonly type: "string";
    readonly set: (value?: Record<string, unknown> | string) => string | undefined;
    readonly get: (value?: string) => any;
    };
    entity: {
    type: "string";
    required: true;
    };
    };
    indexes: {
    primary: {
    pk: {
    field: string;
    composite: ("entity" | "workflow_name")[];
    };
    sk: {
    field: string;
    composite: "run_id"[];
    };
    };
    gsi2: {
    index: string;
    pk: {
    field: string;
    composite: ("entity" | "run_id")[];
    };
    sk: {
    field: string;
    composite: "workflow_name"[];
    };
    };
    };
    }>;
}>;

export declare const messageEntity: Entity<string, string, string, {
    model: {
        entity: string;
        version: string;
        service: string;
    };
    attributes: {
        id: {
            type: "string";
            required: true;
        };
        threadId: {
            type: "string";
            required: true;
        };
        content: {
            type: "string";
            required: true;
            set: (value?: string | void | undefined) => string | void;
            get: (value?: string) => any;
        };
        role: {
            type: "string";
            required: true;
        };
        type: {
            type: "string";
            default: string;
        };
        resourceId: {
            type: "string";
            required: false;
        };
        toolCallIds: {
            type: "string";
            required: false;
            set: (value?: string[] | string) => string | undefined;
            get: (value?: string) => any;
        };
        toolCallArgs: {
            type: "string";
            required: false;
            set: (value?: Record<string, unknown>[] | string) => string | undefined;
            get: (value?: string) => any;
        };
        toolNames: {
            type: "string";
            required: false;
            set: (value?: string[] | string) => string | undefined;
            get: (value?: string) => any;
        };
        createdAt: {
            readonly type: "string";
            readonly required: true;
            readonly readOnly: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        updatedAt: {
            readonly type: "string";
            readonly required: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        metadata: {
            readonly type: "string";
            readonly set: (value?: Record<string, unknown> | string) => string | undefined;
            readonly get: (value?: string) => any;
        };
        entity: {
            type: "string";
            required: true;
        };
    };
    indexes: {
        primary: {
            pk: {
                field: string;
                composite: ("entity" | "id")[];
            };
            sk: {
                field: string;
                composite: "entity"[];
            };
        };
        byThread: {
            index: string;
            pk: {
                field: string;
                composite: ("entity" | "threadId")[];
            };
            sk: {
                field: string;
                composite: "createdAt"[];
            };
        };
    };
}>;

export declare const threadEntity: Entity<string, string, string, {
    model: {
        entity: string;
        version: string;
        service: string;
    };
    attributes: {
        id: {
            type: "string";
            required: true;
        };
        resourceId: {
            type: "string";
            required: true;
        };
        title: {
            type: "string";
            required: true;
        };
        metadata: {
            type: "string";
            required: false;
            set: (value?: Record<string, unknown> | string) => string | undefined;
            get: (value?: string) => any;
        };
        createdAt: {
            readonly type: "string";
            readonly required: true;
            readonly readOnly: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        updatedAt: {
            readonly type: "string";
            readonly required: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        entity: {
            type: "string";
            required: true;
        };
    };
    indexes: {
        primary: {
            pk: {
                field: string;
                composite: ("entity" | "id")[];
            };
            sk: {
                field: string;
                composite: "id"[];
            };
        };
        byResource: {
            index: string;
            pk: {
                field: string;
                composite: ("entity" | "resourceId")[];
            };
            sk: {
                field: string;
                composite: "createdAt"[];
            };
        };
    };
}>;

export declare const traceEntity: Entity<string, string, string, {
    model: {
        entity: string;
        version: string;
        service: string;
    };
    attributes: {
        id: {
            type: "string";
            required: true;
        };
        parentSpanId: {
            type: "string";
            required: false;
        };
        name: {
            type: "string";
            required: true;
        };
        traceId: {
            type: "string";
            required: true;
        };
        scope: {
            type: "string";
            required: true;
        };
        kind: {
            type: "number";
            required: true;
        };
        attributes: {
            type: "string";
            required: false;
            set: (value?: any) => any;
            get: (value?: string) => any;
        };
        status: {
            type: "string";
            required: false;
            set: (value?: any) => any;
            get: (value?: string) => string | undefined;
        };
        events: {
            type: "string";
            required: false;
            set: (value?: any) => any;
            get: (value?: string) => string | undefined;
        };
        links: {
            type: "string";
            required: false;
            set: (value?: any) => any;
            get: (value?: string) => string | undefined;
        };
        other: {
            type: "string";
            required: false;
        };
        startTime: {
            type: "number";
            required: true;
        };
        endTime: {
            type: "number";
            required: true;
        };
        createdAt: {
            readonly type: "string";
            readonly required: true;
            readonly readOnly: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        updatedAt: {
            readonly type: "string";
            readonly required: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        metadata: {
            readonly type: "string";
            readonly set: (value?: Record<string, unknown> | string) => string | undefined;
            readonly get: (value?: string) => any;
        };
        entity: {
            type: "string";
            required: true;
        };
    };
    indexes: {
        primary: {
            pk: {
                field: string;
                composite: ("entity" | "id")[];
            };
            sk: {
                field: string;
                composite: never[];
            };
        };
        byName: {
            index: string;
            pk: {
                field: string;
                composite: ("entity" | "name")[];
            };
            sk: {
                field: string;
                composite: "startTime"[];
            };
        };
        byScope: {
            index: string;
            pk: {
                field: string;
                composite: ("entity" | "scope")[];
            };
            sk: {
                field: string;
                composite: "startTime"[];
            };
        };
    };
}>;

export declare const workflowSnapshotEntity: Entity<string, string, string, {
    model: {
        entity: string;
        version: string;
        service: string;
    };
    attributes: {
        workflow_name: {
            type: "string";
            required: true;
        };
        run_id: {
            type: "string";
            required: true;
        };
        snapshot: {
            type: "string";
            required: true;
            set: (value?: any) => any;
            get: (value?: string) => any;
        };
        resourceId: {
            type: "string";
            required: false;
        };
        createdAt: {
            readonly type: "string";
            readonly required: true;
            readonly readOnly: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        updatedAt: {
            readonly type: "string";
            readonly required: true;
            readonly set: (value?: Date | string) => string;
            readonly default: () => string;
        };
        metadata: {
            readonly type: "string";
            readonly set: (value?: Record<string, unknown> | string) => string | undefined;
            readonly get: (value?: string) => any;
        };
        entity: {
            type: "string";
            required: true;
        };
    };
    indexes: {
        primary: {
            pk: {
                field: string;
                composite: ("entity" | "workflow_name")[];
            };
            sk: {
                field: string;
                composite: "run_id"[];
            };
        };
        gsi2: {
            index: string;
            pk: {
                field: string;
                composite: ("entity" | "run_id")[];
            };
            sk: {
                field: string;
                composite: "workflow_name"[];
            };
        };
    };
}>;

export { }
