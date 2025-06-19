import { o as MastraStorage, p as TABLE_NAMES, q as StorageColumn, r as StorageThreadType, s as MastraMessageV2, t as StorageGetMessagesArg, u as MastraMessageV1, E as EvalRow, v as WorkflowRuns, w as WorkflowRun, P as PaginationInfo } from '../base-CEuVqEGP.cjs';
export { y as LegacyWorkflowRun, x as LegacyWorkflowRuns, z as PaginationArgs, B as StorageGetTracesArg, F as TABLE_EVALS, G as TABLE_MESSAGES, J as TABLE_SCHEMAS, H as TABLE_THREADS, I as TABLE_TRACES, D as TABLE_WORKFLOW_SNAPSHOT } from '../base-CEuVqEGP.cjs';
import { T as Trace } from '../base-CZ7cNkfE.cjs';
import 'ai';
import 'zod';
import '../logger-CpL0z5v_.cjs';
import '../error/index.cjs';
import 'stream';
import 'json-schema';
import '../tts/index.cjs';
import '../vector/index.cjs';
import '../vector/filter/index.cjs';
import '../types-Bo1uigWx.cjs';
import 'sift';
import '../runtime-context/index.cjs';
import '@opentelemetry/api';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import '../workflows/constants.cjs';
import 'ai/test';
import '../deployer/index.cjs';
import '../bundler/index.cjs';
import 'hono/cors';
import 'hono-openapi';
import '@opentelemetry/sdk-trace-base';

declare class MockStore extends MastraStorage {
    private data;
    constructor();
    createTable(_: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
    }): Promise<void>;
    alterTable({ tableName, }: {
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
    getMessages<T extends MastraMessageV2[]>({ threadId, selectBy }: StorageGetMessagesArg): Promise<T>;
    saveMessages(args: {
        messages: MastraMessageV1[];
        format?: undefined | 'v1';
    }): Promise<MastraMessageV1[]>;
    saveMessages(args: {
        messages: MastraMessageV2[];
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    updateMessages(args: {
        messages: Partial<MastraMessageV2> & {
            id: string;
        }[];
    }): Promise<MastraMessageV2[]>;
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
    getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
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
    getTracesPaginated({ name, scope, attributes, page, perPage, fromDate, toDate, }: {
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
    getThreadsByResourceIdPaginated(args: {
        resourceId: string;
        page: number;
        perPage: number;
    }): Promise<PaginationInfo & {
        threads: StorageThreadType[];
    }>;
    getMessagesPaginated({ threadId, selectBy, }: StorageGetMessagesArg & {
        format?: 'v1' | 'v2';
    }): Promise<PaginationInfo & {
        messages: MastraMessageV1[] | MastraMessageV2[];
    }>;
}

export { EvalRow, MastraStorage, MockStore, PaginationInfo, StorageColumn, StorageGetMessagesArg, TABLE_NAMES, WorkflowRun, WorkflowRuns };
