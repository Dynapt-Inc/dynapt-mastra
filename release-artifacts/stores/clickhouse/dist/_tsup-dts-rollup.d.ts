import type { ClickHouseClient } from '@clickhouse/client';
import type { EvalRow } from '@mastra/core/storage';
import type { MastraMessageContentV2 } from '@mastra/core/agent';
import type { MastraMessageV1 } from '@mastra/core/memory';
import type { MastraMessageV2 } from '@mastra/core/memory';
import { MastraStorage } from '@mastra/core/storage';
import type { PaginationInfo } from '@mastra/core/storage';
import type { StorageColumn } from '@mastra/core/storage';
import type { StorageGetMessagesArg } from '@mastra/core/storage';
import type { StorageGetTracesArg } from '@mastra/core/storage';
import type { StorageThreadType } from '@mastra/core/memory';
import type { TABLE_NAMES } from '@mastra/core/storage';
import { TABLE_SCHEMAS } from '@mastra/core/storage';
import type { Trace } from '@mastra/core/telemetry';
import type { WorkflowRun } from '@mastra/core/storage';
import type { WorkflowRuns } from '@mastra/core/storage';
import type { WorkflowRunState } from '@mastra/core/workflows';

declare type ClickhouseConfig = {
    url: string;
    username: string;
    password: string;
    ttl?: {
        [TableKey in TABLE_NAMES]?: {
            row?: {
                interval: number;
                unit: IntervalUnit;
                ttlKey?: string;
            };
            columns?: Partial<{
                [ColumnKey in keyof (typeof TABLE_SCHEMAS)[TableKey]]: {
                    interval: number;
                    unit: IntervalUnit;
                    ttlKey?: string;
                };
            }>;
        };
    };
};
export { ClickhouseConfig }
export { ClickhouseConfig as ClickhouseConfig_alias_1 }

declare class ClickhouseStore extends MastraStorage {
    protected db: ClickHouseClient;
    protected ttl: ClickhouseConfig['ttl'];
    constructor(config: ClickhouseConfig);
    private transformEvalRow;
    getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
    batchInsert({ tableName, records }: {
        tableName: TABLE_NAMES;
        records: Record<string, any>[];
    }): Promise<void>;
    getTraces({ name, scope, page, perPage, attributes, filters, fromDate, toDate, }: {
        name?: string;
        scope?: string;
        page: number;
        perPage: number;
        attributes?: Record<string, string>;
        filters?: Record<string, any>;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<any[]>;
    optimizeTable({ tableName }: {
        tableName: TABLE_NAMES;
    }): Promise<void>;
    materializeTtl({ tableName }: {
        tableName: TABLE_NAMES;
    }): Promise<void>;
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
    persistWorkflowSnapshot({ workflowName, runId, snapshot, }: {
        workflowName: string;
        runId: string;
        snapshot: WorkflowRunState;
    }): Promise<void>;
    loadWorkflowSnapshot({ workflowName, runId, }: {
        workflowName: string;
        runId: string;
    }): Promise<WorkflowRunState | null>;
    private parseWorkflowRun;
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
export { ClickhouseStore }
export { ClickhouseStore as ClickhouseStore_alias_1 }

declare const COLUMN_TYPES: Record<StorageColumn['type'], string>;
export { COLUMN_TYPES }
export { COLUMN_TYPES as COLUMN_TYPES_alias_1 }

declare type IntervalUnit = 'NANOSECOND' | 'MICROSECOND' | 'MILLISECOND' | 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

declare const TABLE_ENGINES: Record<TABLE_NAMES, string>;
export { TABLE_ENGINES }
export { TABLE_ENGINES as TABLE_ENGINES_alias_1 }

export { }
