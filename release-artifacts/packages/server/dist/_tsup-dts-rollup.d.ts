import type { Agent } from '@mastra/core/agent';
import type { AgentCard } from '@mastra/core/a2a';
import type { AgentNetwork } from '@mastra/core/network';
import type { Artifact } from '@mastra/core/a2a';
import type { BaseLogMessage } from '@mastra/core/logger';
import { CoreMessage } from 'ai';
import type { CoreMessage as CoreMessage_2 } from '@mastra/core/llm';
import { EvalRow } from '@mastra/core/storage';
import { GenerateObjectResult } from 'ai';
import { GenerateTextResult } from 'ai';
import type { IMastraLogger } from '@mastra/core/logger';
import type { JSONRPCError } from '@mastra/core/a2a';
import { JSONRPCResponse } from '@mastra/core/a2a';
import { LegacyStep } from '@mastra/core/workflows/legacy';
import type { LegacyWorkflow } from '@mastra/core/workflows/legacy';
import { LegacyWorkflowRunResult } from '@mastra/core/workflows/legacy';
import type { LegacyWorkflowRuns } from '@mastra/core/storage';
import type { LogLevel } from '@mastra/core/logger';
import type { Mastra } from '@mastra/core/mastra';
import type { MastraMemory } from '@mastra/core/memory';
import { MastraMessageV1 } from '@mastra/core/memory';
import type { Message } from '@mastra/core/a2a';
import type { QueryResult } from '@mastra/core/vector';
import { ReadableStream as ReadableStream_2 } from 'node:stream/web';
import { RuntimeContext } from '@mastra/core/runtime-context';
import type { RuntimeContext as RuntimeContext_2 } from '@mastra/core/di';
import type { SerializedStepFlowEntry } from '@mastra/core/workflows';
import { Step } from '@mastra/core/workflows';
import { StepExecutionContext } from '@mastra/core/workflows/legacy';
import { StepGraph } from '@mastra/core/workflows/legacy';
import { StorageThreadType } from '@mastra/core/memory';
import { StreamEvent } from '@mastra/core/workflows';
import { Task } from '@mastra/core/a2a';
import { TaskAndHistory } from '@mastra/core/a2a';
import type { TaskContext } from '@mastra/core/a2a';
import type { TaskIdParams } from '@mastra/core/a2a';
import type { TaskQueryParams } from '@mastra/core/a2a';
import type { TaskSendParams } from '@mastra/core/a2a';
import type { TaskStatus } from '@mastra/core/a2a';
import type { ToolAction } from '@mastra/core/tools';
import { UIMessage } from 'ai';
import type { VercelTool } from '@mastra/core/tools';
import type { WatchEvent } from '@mastra/core/workflows';
import type { Workflow } from '@mastra/core/workflows';
import { WorkflowContext as WorkflowContext_2 } from '@mastra/core/workflows/legacy';
import { WorkflowResult } from '@mastra/core/workflows';
import type { WorkflowRuns } from '@mastra/core/storage';
import { ZodType } from 'zod';
import { ZodTypeDef } from 'zod';

export declare namespace a2a {
    export {
        getAgentCardByIdHandler,
        handleTaskSend,
        handleTaskGet,
        handleTaskSendSubscribe,
        handleTaskCancel,
        getAgentExecutionHandler
    }
}

export declare namespace agents {
    export {
        getAgentsHandler,
        getAgentByIdHandler,
        getEvalsByAgentIdHandler,
        getLiveEvalsByAgentIdHandler,
        generateHandler,
        streamGenerateHandler
    }
}

export declare interface ApiError extends Error {
    message: string;
    status?: number;
}

export declare function applyUpdateToTaskAndHistory(current: TaskAndHistory, update: Omit<TaskStatus, 'timestamp'> | Artifact): TaskAndHistory;

declare type ClientErrorStatusCode = 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451;

export declare interface Context {
    mastra: Mastra;
}

export declare function convertToCoreMessage(message: Message): CoreMessage_2;

export declare function createErrorResponse(id: number | string | null, error: JSONRPCError<unknown>): JSONRPCResponse<null, unknown>;

export declare function createIndex({ mastra, vectorName, index, }: Pick<VectorContext, 'mastra' | 'vectorName'> & {
    index: CreateIndexRequest;
}): Promise<{
    success: boolean;
}>;

declare interface CreateIndexRequest {
    indexName: string;
    dimension: number;
    metric?: 'cosine' | 'euclidean' | 'dotproduct';
}

export declare function createLegacyWorkflowRunHandler({ mastra, workflowId, runId: prevRunId, }: Pick<WorkflowContext, 'mastra' | 'workflowId' | 'runId'>): Promise<{
    runId: string;
}>;

export declare function createSuccessResponse<T>(id: number | string | null, result: T): JSONRPCResponse<T>;

export declare function createTaskContext({ task, userMessage, history, activeCancellations, }: {
    task: Task;
    userMessage: Message;
    history: Message[];
    activeCancellations: Set<string>;
}): TaskContext;

export declare function createThreadHandler({ mastra, agentId, body, }: Pick<MemoryContext, 'mastra' | 'agentId'> & {
    body?: Omit<Parameters<MastraMemory['createThread']>[0], 'resourceId'> & {
        resourceId?: string;
    };
}): Promise<StorageThreadType>;

export declare function createWorkflowRunHandler({ mastra, workflowId, runId: prevRunId, }: Pick<WorkflowContext_3, 'mastra' | 'workflowId' | 'runId'>): Promise<{
    runId: string;
}>;

export declare function deleteIndex({ mastra, vectorName, indexName, }: Pick<VectorContext, 'mastra' | 'vectorName'> & {
    indexName?: string;
}): Promise<{
    success: boolean;
}>;

export declare function deleteThreadHandler({ mastra, agentId, threadId, }: Pick<MemoryContext, 'mastra' | 'agentId' | 'threadId'>): Promise<{
    result: string;
}>;

declare type DeprecatedStatusCode = 305 | 306;

export declare function describeIndex({ mastra, vectorName, indexName, }: Pick<VectorContext, 'mastra' | 'vectorName'> & {
    indexName?: string;
}): Promise<{
    dimension: number;
    count: number;
    metric: string | undefined;
}>;

export declare function executeAgentToolHandler({ mastra, agentId, toolId, data, runtimeContext, }: Pick<ToolsContext, 'mastra' | 'toolId'> & {
    agentId?: string;
    data: any;
    runtimeContext: RuntimeContext_2;
}): Promise<any>;

export declare function executeToolHandler(tools: ToolsContext['tools']): ({ mastra, runId, toolId, data, runtimeContext, }: Pick<ToolsContext, "mastra" | "toolId" | "runId"> & {
    data?: unknown;
    runtimeContext: RuntimeContext_2;
}) => Promise<any>;

export declare function generateHandler({ mastra, runtimeContext, agentId, body, }: Context & {
    runtimeContext: RuntimeContext;
    agentId: string;
    body: GetBody<'generate'> & {
        resourceid?: string;
        runtimeContext?: Record<string, unknown>;
    };
}): Promise<GenerateTextResult<any, unknown>>;

export declare function generateHandler_alias_1({ mastra, runtimeContext, networkId, body, }: NetworkContext & {
    runtimeContext: RuntimeContext;
    body: {
        messages?: Parameters<AgentNetwork['generate']>[0];
    } & Parameters<AgentNetwork['generate']>[1];
}): Promise<GenerateObjectResult<any>>;

/**
 * Generate speech from text
 */
export declare function generateSpeechHandler({ mastra, agentId, body, }: VoiceContext & {
    body?: {
        text?: string;
        speakerId?: string;
    };
}): Promise<NodeJS.ReadableStream>;

export declare function getAgentByIdHandler({ mastra, runtimeContext, agentId, isPlayground, }: Context & {
    isPlayground?: boolean;
    runtimeContext: RuntimeContext;
    agentId: string;
}): Promise<{
    name: any;
    instructions: string;
    tools: any;
    workflows: {};
    provider: string;
    modelId: string;
    defaultGenerateOptions: any;
    defaultStreamOptions: any;
}>;

export declare function getAgentCardByIdHandler({ mastra, agentId, executionUrl, provider, version, runtimeContext, }: Context & {
    runtimeContext: RuntimeContext;
    agentId: keyof ReturnType<typeof mastra.getAgents>;
    executionUrl?: string;
    version?: string;
    provider?: {
        organization: string;
        url: string;
    };
}): Promise<AgentCard>;

export declare function getAgentExecutionHandler({ requestId, mastra, agentId, runtimeContext, method, params, taskStore, logger, }: Context & {
    requestId: string;
    runtimeContext: RuntimeContext;
    agentId: string;
    method: 'tasks/send' | 'tasks/sendSubscribe' | 'tasks/get' | 'tasks/cancel';
    params: TaskSendParams | TaskQueryParams | TaskIdParams;
    taskStore?: InMemoryTaskStore;
    logger?: IMastraLogger;
}): Promise<any>;

export declare function getAgentsHandler({ mastra, runtimeContext }: Context & {
    runtimeContext: RuntimeContext;
}): Promise<any>;

declare type GetBody<T extends keyof Agent & {
    [K in keyof Agent]: Agent[K] extends (...args: any) => any ? K : never;
}[keyof Agent]> = {
    messages: Parameters<Agent[T]>[0];
} & Parameters<Agent[T]>[1];

export declare function getEvalsByAgentIdHandler({ mastra, runtimeContext, agentId, }: Context & {
    runtimeContext: RuntimeContext;
    agentId: string;
}): Promise<{
    id: string;
    name: any;
    instructions: string;
    evals: EvalRow[];
}>;

export declare function getLegacyWorkflowByIdHandler({ mastra, workflowId }: WorkflowContext): Promise<{
    stepGraph: StepGraph;
    stepSubscriberGraph: Record<string, StepGraph>;
    serializedStepGraph: StepGraph;
    serializedStepSubscriberGraph: Record<string, StepGraph>;
    name: string;
    triggerSchema: string | undefined;
    steps: any;
}>;

export declare function getLegacyWorkflowRunHandler({ mastra, workflowId, runId, }: Pick<WorkflowContext, 'mastra' | 'workflowId' | 'runId'>): Promise<ReturnType<LegacyWorkflow['getRun']>>;

export declare function getLegacyWorkflowRunsHandler({ mastra, workflowId, fromDate, toDate, limit, offset, resourceId, }: WorkflowContext & {
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
    resourceId?: string;
}): Promise<LegacyWorkflowRuns>;

export declare function getLegacyWorkflowsHandler({ mastra }: WorkflowContext): Promise<any>;

/**
 * Get available listeners for an agent
 */
export declare function getListenerHandler({ mastra, agentId }: VoiceContext): Promise<{
    enabled: boolean;
}>;

export declare function getLiveEvalsByAgentIdHandler({ mastra, runtimeContext, agentId, }: Context & {
    runtimeContext: RuntimeContext;
    agentId: string;
}): Promise<{
    id: string;
    name: any;
    instructions: string;
    evals: EvalRow[];
}>;

export declare function getLogsByRunIdHandler({ mastra, runId, transportId, params, }: Pick<LogsContext, 'mastra' | 'runId' | 'transportId' | 'params'>): Promise<{
    logs: BaseLogMessage[];
    total: number;
    page: number;
    perPage: number;
    hasMore: boolean;
}>;

export declare function getLogsHandler({ mastra, transportId, params, }: Pick<LogsContext, 'mastra' | 'transportId' | 'params'>): Promise<{
    logs: BaseLogMessage[];
    total: number;
    page: number;
    perPage: number;
    hasMore: boolean;
}>;

export declare function getLogTransports({ mastra }: Pick<LogsContext, 'mastra'>): Promise<{
    transports: string[];
}>;

export declare function getMemoryStatusHandler({ mastra, agentId }: Pick<MemoryContext, 'mastra' | 'agentId'>): Promise<{
    result: boolean;
}>;

export declare function getMessagesHandler({ mastra, agentId, threadId, limit, }: Pick<MemoryContext, 'mastra' | 'agentId' | 'threadId'> & {
    limit?: number;
}): Promise<{
    messages: CoreMessage[];
    uiMessages: UIMessage[];
}>;

export declare function getNetworkByIdHandler({ mastra, networkId, runtimeContext, }: Pick<NetworkContext, 'mastra' | 'networkId' | 'runtimeContext'>): Promise<{
    id: string;
    name: string;
    instructions: string;
    agents: {
        name: string;
        provider: string;
        modelId: string;
    }[];
    routingModel: {
        provider: string;
        modelId: string;
    };
}>;

export declare function getNetworksHandler({ mastra, runtimeContext, }: Pick<NetworkContext, 'mastra' | 'runtimeContext'>): Promise<{
    id: string;
    name: string;
    instructions: string;
    agents: {
        name: string;
        provider: string;
        modelId: string;
    }[];
    routingModel: {
        provider: string;
        modelId: string;
    };
}[]>;

/**
 * Get available speakers for an agent
 */
export declare function getSpeakersHandler({ mastra, agentId }: VoiceContext): Promise<{
    voiceId: string;
}[]>;

export declare function getTelemetryHandler({ mastra, body }: TelemetryContext): Promise<any[]>;

export declare function getThreadByIdHandler({ mastra, agentId, threadId, }: Pick<MemoryContext, 'mastra' | 'agentId' | 'threadId'>): Promise<StorageThreadType>;

export declare function getThreadsHandler({ mastra, agentId, resourceId, }: Pick<MemoryContext, 'mastra' | 'agentId' | 'resourceId'>): Promise<StorageThreadType[]>;

export declare function getToolByIdHandler({ tools, toolId }: Pick<ToolsContext, 'tools' | 'toolId'>): Promise<any>;

export declare function getToolsHandler({ tools }: Pick<ToolsContext, 'tools'>): Promise<Record<string, any>>;

export declare function getWorkflowByIdHandler({ mastra, workflowId }: WorkflowContext_3): Promise<{
    steps: SerializedStep[];
    name: string | undefined;
    description: string | undefined;
    stepGraph: SerializedStepFlowEntry[];
    inputSchema: string | undefined;
    outputSchema: string | undefined;
}>;

export declare function getWorkflowRunByIdHandler({ mastra, workflowId, runId, }: Pick<WorkflowContext_3, 'mastra' | 'workflowId' | 'runId'>): Promise<ReturnType<Workflow['getWorkflowRunById']>>;

export declare function getWorkflowRunExecutionResultHandler({ mastra, workflowId, runId, }: Pick<WorkflowContext_3, 'mastra' | 'workflowId' | 'runId'>): Promise<WatchEvent['payload']['workflowState']>;

export declare function getWorkflowRunsHandler({ mastra, workflowId, fromDate, toDate, limit, offset, resourceId, }: WorkflowContext_3 & {
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
    resourceId?: string;
}): Promise<WorkflowRuns>;

export declare function getWorkflowsHandler({ mastra }: WorkflowContext_3): Promise<any>;

export declare function handleError(error: unknown, defaultMessage: string): never;

export declare function handleTaskCancel({ requestId, taskStore, agentId, taskId, logger, }: {
    requestId: string;
    taskStore: InMemoryTaskStore;
    agentId: string;
    taskId: string;
    logger?: IMastraLogger;
}): Promise<JSONRPCResponse<Task, unknown>>;

export declare function handleTaskGet({ requestId, taskStore, agentId, taskId, }: {
    requestId: string;
    taskStore: InMemoryTaskStore;
    agentId: string;
    taskId: string;
}): Promise<JSONRPCResponse<TaskAndHistory, unknown>>;

export declare function handleTaskSend({ requestId, params, taskStore, agent, agentId, logger, runtimeContext, }: {
    requestId: string;
    params: TaskSendParams;
    taskStore: InMemoryTaskStore;
    agent: Agent;
    agentId: string;
    logger?: IMastraLogger;
    runtimeContext: RuntimeContext;
}): Promise<JSONRPCResponse<null, unknown> | JSONRPCResponse<Task, unknown>>;

export declare function handleTaskSendSubscribe({ requestId, params, taskStore, agent, agentId, logger, runtimeContext, }: {
    requestId: string;
    params: TaskSendParams;
    taskStore: InMemoryTaskStore;
    agent: Agent;
    agentId: string;
    logger?: IMastraLogger;
    runtimeContext: RuntimeContext;
}): AsyncGenerator<JSONRPCResponse<null, unknown> | JSONRPCResponse<Task, unknown> | JSONRPCResponse<    {
state: string;
message: {
role: string;
parts: {
type: string;
text: string;
}[];
};
}, unknown>, void, unknown>;

/**
 * `HTTPException` must be used when a fatal error such as authentication failure occurs.
 *
 * @see {@link https://hono.dev/docs/api/exception}
 *
 * @param {StatusCode} status - status code of HTTPException
 * @param {HTTPExceptionOptions} options - options of HTTPException
 * @param {HTTPExceptionOptions["res"]} options.res - response of options of HTTPException
 * @param {HTTPExceptionOptions["message"]} options.message - message of options of HTTPException
 * @param {HTTPExceptionOptions["cause"]} options.cause - cause of options of HTTPException
 *
 * @example
 * ```ts
 * import { HTTPException } from 'hono/http-exception'
 *
 * // ...
 *
 * app.post('/auth', async (c, next) => {
 *   // authentication
 *   if (authorized === false) {
 *     throw new HTTPException(401, { message: 'Custom error message' })
 *   }
 *   await next()
 * })
 * ```
 */
export declare class HTTPException extends Error {
    readonly res?: Response;
    readonly status: StatusCode;
    /**
     * Creates an instance of `HTTPException`.
     * @param status - HTTP status code for the exception. Defaults to 500.
     * @param options - Additional options for the exception.
     */
    constructor(status?: StatusCode, options?: HTTPExceptionOptions);
    /**
     * Returns the response object associated with the exception.
     * If a response object is not provided, a new response is created with the error message and status code.
     * @returns The response object.
     */
    getResponse(): Response;
}

/**
 * Options for creating an `HTTPException`.
 * @property res - Optional response object to use.
 * @property message - Optional custom error message.
 * @property cause - Optional cause of the error.
 */
declare type HTTPExceptionOptions = {
    res?: Response;
    message?: string;
    cause?: unknown;
};

/**
 * @module
 * This module provides the `HTTPException` class.
 */
declare type InfoStatusCode = 100 | 101 | 102 | 103;

export declare class InMemoryTaskStore {
    private store;
    activeCancellations: Set<string>;
    load({ agentId, taskId }: {
        agentId: string;
        taskId: string;
    }): Promise<TaskAndHistory | null>;
    save({ agentId, data }: {
        agentId: string;
        data: TaskAndHistory;
    }): Promise<void>;
}

export declare namespace legacyWorkflows {
    export {
        getLegacyWorkflowsHandler,
        getLegacyWorkflowByIdHandler,
        startAsyncLegacyWorkflowHandler,
        getLegacyWorkflowRunHandler,
        createLegacyWorkflowRunHandler,
        startLegacyWorkflowRunHandler,
        watchLegacyWorkflowHandler,
        resumeAsyncLegacyWorkflowHandler,
        resumeLegacyWorkflowHandler,
        getLegacyWorkflowRunsHandler
    }
}

export declare function listIndexes({ mastra, vectorName }: Pick<VectorContext, 'mastra' | 'vectorName'>): Promise<string[]>;

export declare function loadOrCreateTaskAndHistory({ agentId, taskId, taskStore, message, sessionId, metadata, logger, }: {
    agentId: string;
    taskId: string;
    taskStore: InMemoryTaskStore;
    message: Message;
    sessionId?: string | null;
    metadata?: Record<string, unknown> | null;
    logger?: IMastraLogger;
}): Promise<TaskAndHistory>;

export declare namespace logs {
    export {
        getLogsHandler,
        getLogsByRunIdHandler,
        getLogTransports
    }
}

declare type LogsContext = {
    mastra: Mastra;
    transportId?: string;
    runId?: string;
    params?: {
        fromDate?: Date;
        toDate?: Date;
        logLevel?: LogLevel;
        filters?: string | string[];
        page?: number;
        perPage?: number;
    };
};

export declare namespace memory {
    export {
        getMemoryStatusHandler,
        getThreadsHandler,
        getThreadByIdHandler,
        saveMessagesHandler,
        createThreadHandler,
        updateThreadHandler,
        deleteThreadHandler,
        getMessagesHandler
    }
}

declare interface MemoryContext extends Context {
    agentId?: string;
    resourceId?: string;
    threadId?: string;
}

export declare namespace network {
    export {
        getNetworksHandler,
        getNetworkByIdHandler,
        generateHandler_alias_1 as generateHandler,
        streamGenerateHandler_alias_1 as streamGenerateHandler
    }
}

declare interface NetworkContext extends Context {
    networkId?: string;
    runtimeContext: RuntimeContext;
}

export declare function normalizeError(error: any, reqId: number | string | null, taskId?: string, logger?: IMastraLogger): JSONRPCResponse<null, unknown>;

declare interface QueryRequest {
    indexName: string;
    queryVector: number[];
    topK?: number;
    filter?: Record<string, any>;
    includeVector?: boolean;
}

export declare function queryVectors({ mastra, vectorName, query, }: Pick<VectorContext, 'mastra' | 'vectorName'> & {
    query: QueryRequest;
}): Promise<QueryResult[]>;

declare type RedirectStatusCode = 300 | 301 | 302 | 303 | 304 | DeprecatedStatusCode | 307 | 308;

export declare function resumeAsyncLegacyWorkflowHandler({ mastra, workflowId, runId, body, runtimeContext, }: WorkflowContext & {
    body: {
        stepId: string;
        context: any;
    };
    runtimeContext: RuntimeContext;
}): Promise<Omit<LegacyWorkflowRunResult<any, LegacyStep<string, any, any, StepExecutionContext<any, WorkflowContext_2<any, LegacyStep<string, any, any, any>[], Record<string, any>>>>[], any>, "runId"> | undefined>;

export declare function resumeAsyncWorkflowHandler({ mastra, workflowId, runId, body, runtimeContext: payloadRuntimeContext, }: WorkflowContext_3 & {
    body: {
        step: string | string[];
        resumeData?: unknown;
    };
    runtimeContext?: Record<string, any>;
}): Promise<WorkflowResult<ZodType<any, ZodTypeDef, any>, Step<string, any, any, any, any, any>[]>>;

export declare function resumeLegacyWorkflowHandler({ mastra, workflowId, runId, body, runtimeContext, }: WorkflowContext & {
    body: {
        stepId: string;
        context: any;
    };
    runtimeContext: RuntimeContext;
}): Promise<{
    message: string;
}>;

export declare function resumeWorkflowHandler({ mastra, workflowId, runId, body, runtimeContext: payloadRuntimeContext, }: WorkflowContext_3 & {
    body: {
        step: string | string[];
        resumeData?: unknown;
    };
    runtimeContext?: Record<string, any>;
}): Promise<{
    message: string;
}>;

export declare function saveMessagesHandler({ mastra, agentId, body, }: Pick<MemoryContext, 'mastra' | 'agentId'> & {
    body: {
        messages: Parameters<MastraMemory['saveMessages']>[0]['messages'];
    };
}): Promise<MastraMessageV1[]>;

declare type SerializedStep = {
    id: string;
    description: string;
    inputSchema: string | undefined;
    outputSchema: string | undefined;
    resumeSchema: string | undefined;
    suspendSchema: string | undefined;
};

declare type ServerErrorStatusCode = 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

export declare function startAsyncLegacyWorkflowHandler({ mastra, runtimeContext, workflowId, runId, triggerData, }: Pick<WorkflowContext, 'mastra' | 'workflowId' | 'runId'> & {
    triggerData?: unknown;
    runtimeContext: RuntimeContext;
}): Promise<LegacyWorkflowRunResult<any, LegacyStep<string, any, any, StepExecutionContext<any, WorkflowContext_2<any, LegacyStep<string, any, any, any>[], Record<string, any>>>>[], any>>;

export declare function startAsyncWorkflowHandler({ mastra, runtimeContext: payloadRuntimeContext, workflowId, runId, inputData, }: Pick<WorkflowContext_3, 'mastra' | 'workflowId' | 'runId'> & {
    inputData?: unknown;
    runtimeContext?: Record<string, any>;
}): Promise<WorkflowResult<ZodType<any, ZodTypeDef, any>, Step<string, any, any, any, any, any>[]>>;

export declare function startLegacyWorkflowRunHandler({ mastra, runtimeContext, workflowId, runId, triggerData, }: Pick<WorkflowContext, 'mastra' | 'workflowId' | 'runId'> & {
    triggerData?: unknown;
    runtimeContext: RuntimeContext;
}): Promise<{
    message: string;
}>;

export declare function startWorkflowRunHandler({ mastra, runtimeContext: payloadRuntimeContext, workflowId, runId, inputData, }: Pick<WorkflowContext_3, 'mastra' | 'workflowId' | 'runId'> & {
    inputData?: unknown;
    runtimeContext?: Record<string, any>;
}): Promise<{
    message: string;
}>;

/**
 * If you want to use an unofficial status, use `UnofficialStatusCode`.
 */
export declare type StatusCode = InfoStatusCode | SuccessStatusCode | RedirectStatusCode | ClientErrorStatusCode | ServerErrorStatusCode | UnofficialStatusCode;

export declare function storeTelemetryHandler({ mastra, body }: Context & {
    body: {
        resourceSpans: any[];
    };
}): Promise<{
    status: string;
    message: string;
    error: any;
} | {
    status: string;
    message: string;
    traceCount?: undefined;
} | {
    status: string;
    message: string;
    traceCount: number;
}>;

export declare function streamGenerateHandler({ mastra, runtimeContext, agentId, body, }: Context & {
    runtimeContext: RuntimeContext;
    agentId: string;
    body: GetBody<'stream'> & {
        resourceid?: string;
        runtimeContext?: string;
    };
}): Promise<Response | undefined>;

export declare function streamGenerateHandler_alias_1({ mastra, networkId, body, runtimeContext, }: NetworkContext & {
    runtimeContext: RuntimeContext;
    body: {
        messages?: Parameters<AgentNetwork['stream']>[0];
    } & Parameters<AgentNetwork['stream']>[1];
}): Promise<Response>;

export declare function streamWorkflowHandler({ mastra, runtimeContext: payloadRuntimeContext, workflowId, runId, inputData, }: Pick<WorkflowContext_3, 'mastra' | 'workflowId' | 'runId'> & {
    inputData?: unknown;
    runtimeContext?: Record<string, any>;
}): Promise<{
    stream: globalThis.ReadableStream<StreamEvent>;
    getWorkflowState: () => Promise<WorkflowResult<ZodType<any, ZodTypeDef, any>, Step<string, any, any, any, any, any>[]>>;
}>;

declare type SuccessStatusCode = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;

export declare namespace telemetry {
    export {
        getTelemetryHandler,
        storeTelemetryHandler
    }
}

declare interface TelemetryContext extends Context {
    body?: {
        name?: string;
        scope?: string;
        page?: number;
        perPage?: number;
        attribute?: string | string[];
        fromDate?: Date;
        toDate?: Date;
    };
}

export declare namespace tools {
    export {
        getToolsHandler,
        getToolByIdHandler,
        executeToolHandler,
        executeAgentToolHandler
    }
}

declare interface ToolsContext extends Context {
    tools?: Record<string, ToolAction | VercelTool>;
    toolId?: string;
    runId?: string;
}

/**
 * Transcribe speech to text
 */
export declare function transcribeSpeechHandler({ mastra, agentId, body, }: VoiceContext & {
    body?: {
        audioData?: Buffer;
        options?: Parameters<NonNullable<Agent['voice']>['listen']>[1];
    };
}): Promise<{
    text: string | void | NodeJS.ReadableStream;
}>;

/**
 * @deprecated
 * Use `UnofficialStatusCode` instead.
 */
export declare type UnOfficalStatusCode = UnofficialStatusCode;

/**
 * `UnofficialStatusCode` can be used to specify an unofficial status code.
 * @example
 *
 * ```ts
 * app.get('/unknown', (c) => {
 *   return c.text("Unknown Error", 520 as UnofficialStatusCode)
 * })
 * ```
 */
export declare type UnofficialStatusCode = -1;

export declare function updateThreadHandler({ mastra, agentId, threadId, body, }: Pick<MemoryContext, 'mastra' | 'agentId' | 'threadId'> & {
    body?: Parameters<MastraMemory['saveThread']>[0]['thread'];
}): Promise<StorageThreadType>;

declare interface UpsertRequest {
    indexName: string;
    vectors: number[][];
    metadata?: Record<string, any>[];
    ids?: string[];
}

export declare function upsertVectors({ mastra, vectorName, index }: VectorContext & {
    index: UpsertRequest;
}): Promise<{
    ids: string[];
}>;

export declare function validateBody(body: Record<string, unknown>): void;

export declare namespace vector {
    export {
        upsertVectors,
        createIndex,
        queryVectors,
        listIndexes,
        describeIndex,
        deleteIndex
    }
}

declare interface VectorContext extends Context {
    vectorName?: string;
}

export declare namespace voice {
    export {
        getSpeakersHandler,
        generateSpeechHandler,
        transcribeSpeechHandler,
        getListenerHandler
    }
}

declare interface VoiceContext extends Context {
    agentId?: string;
}

export declare function watchLegacyWorkflowHandler({ mastra, workflowId, runId, }: Pick<WorkflowContext, 'mastra' | 'workflowId' | 'runId'>): Promise<ReadableStream_2<string>>;

export declare function watchWorkflowHandler({ mastra, workflowId, runId, }: Pick<WorkflowContext_3, 'mastra' | 'workflowId' | 'runId'>): Promise<ReadableStream_2<string>>;

declare interface WorkflowContext extends Context {
    workflowId?: string;
    runId?: string;
}

declare interface WorkflowContext_3 extends Context {
    workflowId?: string;
    runId?: string;
}

export declare namespace workflows {
    export {
        getWorkflowsHandler,
        getWorkflowByIdHandler,
        getWorkflowRunByIdHandler,
        getWorkflowRunExecutionResultHandler,
        createWorkflowRunHandler,
        startAsyncWorkflowHandler,
        startWorkflowRunHandler,
        watchWorkflowHandler,
        streamWorkflowHandler,
        resumeAsyncWorkflowHandler,
        resumeWorkflowHandler,
        getWorkflowRunsHandler
    }
}

export { }
