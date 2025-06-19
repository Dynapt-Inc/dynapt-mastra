import { AbstractAgent } from '@ag-ui/client';
import { ServerInfo, MCPToolType, ServerDetailInfo } from '@mastra/core/mcp';
import { processDataStream } from '@ai-sdk/ui-utils';
import { CoreMessage, AiMessageType, StorageThreadType, MastraMessageV1, LegacyWorkflowRuns, WorkflowRuns, WorkflowRun, QueryResult, GenerateReturn } from '@mastra/core';
import { JSONSchema7 } from 'json-schema';
import { ZodSchema } from 'zod';
import { AgentGenerateOptions, AgentStreamOptions, ToolsInput } from '@mastra/core/agent';
import { LogLevel, BaseLogMessage } from '@mastra/core/logger';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { Workflow as Workflow$1, WatchEvent, WorkflowResult } from '@mastra/core/workflows';
import { StepAction, StepGraph, LegacyWorkflowRunResult as LegacyWorkflowRunResult$1 } from '@mastra/core/workflows/legacy';
import * as stream_web from 'stream/web';
import { AgentCard, TaskSendParams, Task, TaskQueryParams, TaskIdParams } from '@mastra/core/a2a';

interface ClientOptions {
    /** Base URL for API requests */
    baseUrl: string;
    /** Number of retry attempts for failed requests */
    retries?: number;
    /** Initial backoff time in milliseconds between retries */
    backoffMs?: number;
    /** Maximum backoff time in milliseconds between retries */
    maxBackoffMs?: number;
    /** Custom headers to include with requests */
    headers?: Record<string, string>;
}
interface RequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    stream?: boolean;
    signal?: AbortSignal;
}
type WithoutMethods<T> = {
    [K in keyof T as T[K] extends (...args: any[]) => any ? never : T[K] extends {
        (): any;
    } ? never : T[K] extends undefined | ((...args: any[]) => any) ? never : K]: T[K];
};
interface GetAgentResponse {
    name: string;
    instructions: string;
    tools: Record<string, GetToolResponse>;
    workflows: Record<string, GetWorkflowResponse>;
    provider: string;
    modelId: string;
    defaultGenerateOptions: WithoutMethods<AgentGenerateOptions>;
    defaultStreamOptions: WithoutMethods<AgentStreamOptions>;
}
type GenerateParams<T extends JSONSchema7 | ZodSchema | undefined = undefined> = {
    messages: string | string[] | CoreMessage[] | AiMessageType[];
    output?: T;
    experimental_output?: T;
    runtimeContext?: RuntimeContext | Record<string, any>;
    clientTools?: ToolsInput;
} & WithoutMethods<Omit<AgentGenerateOptions<T>, 'output' | 'experimental_output' | 'runtimeContext' | 'clientTools'>>;
type StreamParams<T extends JSONSchema7 | ZodSchema | undefined = undefined> = {
    messages: string | string[] | CoreMessage[] | AiMessageType[];
    output?: T;
    experimental_output?: T;
    runtimeContext?: RuntimeContext | Record<string, any>;
    clientTools?: ToolsInput;
} & WithoutMethods<Omit<AgentStreamOptions<T>, 'output' | 'experimental_output' | 'runtimeContext' | 'clientTools'>>;
interface GetEvalsByAgentIdResponse extends GetAgentResponse {
    evals: any[];
    instructions: string;
    name: string;
    id: string;
}
interface GetToolResponse {
    id: string;
    description: string;
    inputSchema: string;
    outputSchema: string;
}
interface GetLegacyWorkflowResponse {
    name: string;
    triggerSchema: string;
    steps: Record<string, StepAction<any, any, any, any>>;
    stepGraph: StepGraph;
    stepSubscriberGraph: Record<string, StepGraph>;
    workflowId?: string;
}
interface GetWorkflowRunsParams {
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
    resourceId?: string;
}
type GetLegacyWorkflowRunsResponse = LegacyWorkflowRuns;
type GetWorkflowRunsResponse = WorkflowRuns;
type GetWorkflowRunByIdResponse = WorkflowRun;
type GetWorkflowRunExecutionResultResponse = WatchEvent['payload']['workflowState'];
type LegacyWorkflowRunResult = {
    activePaths: Record<string, {
        status: string;
        suspendPayload?: any;
        stepPath: string[];
    }>;
    results: LegacyWorkflowRunResult$1<any, any, any>['results'];
    timestamp: number;
    runId: string;
};
interface GetWorkflowResponse {
    name: string;
    description?: string;
    steps: {
        [key: string]: {
            id: string;
            description: string;
            inputSchema: string;
            outputSchema: string;
            resumeSchema: string;
            suspendSchema: string;
        };
    };
    stepGraph: Workflow$1['serializedStepGraph'];
    inputSchema: string;
    outputSchema: string;
}
type WorkflowWatchResult = WatchEvent & {
    runId: string;
};
type WorkflowRunResult = WorkflowResult<any, any>;
interface UpsertVectorParams {
    indexName: string;
    vectors: number[][];
    metadata?: Record<string, any>[];
    ids?: string[];
}
interface CreateIndexParams {
    indexName: string;
    dimension: number;
    metric?: 'cosine' | 'euclidean' | 'dotproduct';
}
interface QueryVectorParams {
    indexName: string;
    queryVector: number[];
    topK?: number;
    filter?: Record<string, any>;
    includeVector?: boolean;
}
interface QueryVectorResponse {
    results: QueryResult[];
}
interface GetVectorIndexResponse {
    dimension: number;
    metric: 'cosine' | 'euclidean' | 'dotproduct';
    count: number;
}
interface SaveMessageToMemoryParams {
    messages: MastraMessageV1[];
    agentId: string;
}
type SaveMessageToMemoryResponse = MastraMessageV1[];
interface CreateMemoryThreadParams {
    title?: string;
    metadata?: Record<string, any>;
    resourceId: string;
    threadId?: string;
    agentId: string;
}
type CreateMemoryThreadResponse = StorageThreadType;
interface GetMemoryThreadParams {
    resourceId: string;
    agentId: string;
}
type GetMemoryThreadResponse = StorageThreadType[];
interface UpdateMemoryThreadParams {
    title: string;
    metadata: Record<string, any>;
    resourceId: string;
}
interface GetMemoryThreadMessagesParams {
    /**
     * Limit the number of messages to retrieve (default: 40)
     */
    limit?: number;
}
interface GetMemoryThreadMessagesResponse {
    messages: CoreMessage[];
    uiMessages: AiMessageType[];
}
interface GetLogsParams {
    transportId: string;
    fromDate?: Date;
    toDate?: Date;
    logLevel?: LogLevel;
    filters?: Record<string, string>;
    page?: number;
    perPage?: number;
}
interface GetLogParams {
    runId: string;
    transportId: string;
    fromDate?: Date;
    toDate?: Date;
    logLevel?: LogLevel;
    filters?: Record<string, string>;
    page?: number;
    perPage?: number;
}
type GetLogsResponse = {
    logs: BaseLogMessage[];
    total: number;
    page: number;
    perPage: number;
    hasMore: boolean;
};
type RequestFunction = (path: string, options?: RequestOptions) => Promise<any>;
type SpanStatus = {
    code: number;
};
type SpanOther = {
    droppedAttributesCount: number;
    droppedEventsCount: number;
    droppedLinksCount: number;
};
type SpanEventAttributes = {
    key: string;
    value: {
        [key: string]: string | number | boolean | null;
    };
};
type SpanEvent = {
    attributes: SpanEventAttributes[];
    name: string;
    timeUnixNano: string;
    droppedAttributesCount: number;
};
type Span = {
    id: string;
    parentSpanId: string | null;
    traceId: string;
    name: string;
    scope: string;
    kind: number;
    status: SpanStatus;
    events: SpanEvent[];
    links: any[];
    attributes: Record<string, string | number | boolean | null>;
    startTime: number;
    endTime: number;
    duration: number;
    other: SpanOther;
    createdAt: string;
};
interface GetTelemetryResponse {
    traces: Span[];
}
interface GetTelemetryParams {
    name?: string;
    scope?: string;
    page?: number;
    perPage?: number;
    attribute?: Record<string, string>;
    fromDate?: Date;
    toDate?: Date;
}
interface GetNetworkResponse {
    name: string;
    instructions: string;
    agents: Array<{
        name: string;
        provider: string;
        modelId: string;
    }>;
    routingModel: {
        provider: string;
        modelId: string;
    };
    state?: Record<string, any>;
}
interface McpServerListResponse {
    servers: ServerInfo[];
    next: string | null;
    total_count: number;
}
interface McpToolInfo {
    id: string;
    name: string;
    description?: string;
    inputSchema: string;
    toolType?: MCPToolType;
}
interface McpServerToolListResponse {
    tools: McpToolInfo[];
}

declare class BaseResource {
    readonly options: ClientOptions;
    constructor(options: ClientOptions);
    /**
     * Makes an HTTP request to the API with retries and exponential backoff
     * @param path - The API endpoint path
     * @param options - Optional request configuration
     * @returns Promise containing the response data
     */
    request<T>(path: string, options?: RequestOptions): Promise<T>;
}

declare class AgentVoice extends BaseResource {
    private agentId;
    constructor(options: ClientOptions, agentId: string);
    /**
     * Convert text to speech using the agent's voice provider
     * @param text - Text to convert to speech
     * @param options - Optional provider-specific options for speech generation
     * @returns Promise containing the audio data
     */
    speak(text: string, options?: {
        speaker?: string;
        [key: string]: any;
    }): Promise<Response>;
    /**
     * Convert speech to text using the agent's voice provider
     * @param audio - Audio data to transcribe
     * @param options - Optional provider-specific options
     * @returns Promise containing the transcribed text
     */
    listen(audio: Blob, options?: Record<string, any>): Promise<{
        text: string;
    }>;
    /**
     * Get available speakers for the agent's voice provider
     * @returns Promise containing list of available speakers
     */
    getSpeakers(): Promise<Array<{
        voiceId: string;
        [key: string]: any;
    }>>;
    /**
     * Get the listener configuration for the agent's voice provider
     * @returns Promise containing a check if the agent has listening capabilities
     */
    getListener(): Promise<{
        enabled: boolean;
    }>;
}
declare class Agent extends BaseResource {
    private agentId;
    readonly voice: AgentVoice;
    constructor(options: ClientOptions, agentId: string);
    /**
     * Retrieves details about the agent
     * @returns Promise containing agent details including model and instructions
     */
    details(): Promise<GetAgentResponse>;
    /**
     * Generates a response from the agent
     * @param params - Generation parameters including prompt
     * @returns Promise containing the generated response
     */
    generate<T extends JSONSchema7 | ZodSchema | undefined = undefined>(params: GenerateParams<T> & {
        output?: never;
        experimental_output?: never;
    }): Promise<GenerateReturn<T>>;
    generate<T extends JSONSchema7 | ZodSchema | undefined = undefined>(params: GenerateParams<T> & {
        output: T;
        experimental_output?: never;
    }): Promise<GenerateReturn<T>>;
    generate<T extends JSONSchema7 | ZodSchema | undefined = undefined>(params: GenerateParams<T> & {
        output?: never;
        experimental_output: T;
    }): Promise<GenerateReturn<T>>;
    /**
     * Streams a response from the agent
     * @param params - Stream parameters including prompt
     * @returns Promise containing the enhanced Response object with processDataStream method
     */
    stream<T extends JSONSchema7 | ZodSchema | undefined = undefined>(params: StreamParams<T>): Promise<Response & {
        processDataStream: (options?: Omit<Parameters<typeof processDataStream>[0], 'stream'>) => Promise<void>;
    }>;
    /**
     * Gets details about a specific tool available to the agent
     * @param toolId - ID of the tool to retrieve
     * @returns Promise containing tool details
     */
    getTool(toolId: string): Promise<GetToolResponse>;
    /**
     * Executes a tool for the agent
     * @param toolId - ID of the tool to execute
     * @param params - Parameters required for tool execution
     * @returns Promise containing the tool execution results
     */
    executeTool(toolId: string, params: {
        data: any;
        runtimeContext?: RuntimeContext;
    }): Promise<any>;
    /**
     * Retrieves evaluation results for the agent
     * @returns Promise containing agent evaluations
     */
    evals(): Promise<GetEvalsByAgentIdResponse>;
    /**
     * Retrieves live evaluation results for the agent
     * @returns Promise containing live agent evaluations
     */
    liveEvals(): Promise<GetEvalsByAgentIdResponse>;
}

declare class Network extends BaseResource {
    private networkId;
    constructor(options: ClientOptions, networkId: string);
    /**
     * Retrieves details about the network
     * @returns Promise containing network details
     */
    details(): Promise<GetNetworkResponse>;
    /**
     * Generates a response from the agent
     * @param params - Generation parameters including prompt
     * @returns Promise containing the generated response
     */
    generate<T extends JSONSchema7 | ZodSchema | undefined = undefined>(params: GenerateParams<T>): Promise<GenerateReturn<T>>;
    /**
     * Streams a response from the agent
     * @param params - Stream parameters including prompt
     * @returns Promise containing the enhanced Response object with processDataStream method
     */
    stream<T extends JSONSchema7 | ZodSchema | undefined = undefined>(params: StreamParams<T>): Promise<Response & {
        processDataStream: (options?: Omit<Parameters<typeof processDataStream>[0], 'stream'>) => Promise<void>;
    }>;
}

declare class MemoryThread extends BaseResource {
    private threadId;
    private agentId;
    constructor(options: ClientOptions, threadId: string, agentId: string);
    /**
     * Retrieves the memory thread details
     * @returns Promise containing thread details including title and metadata
     */
    get(): Promise<StorageThreadType>;
    /**
     * Updates the memory thread properties
     * @param params - Update parameters including title and metadata
     * @returns Promise containing updated thread details
     */
    update(params: UpdateMemoryThreadParams): Promise<StorageThreadType>;
    /**
     * Deletes the memory thread
     * @returns Promise containing deletion result
     */
    delete(): Promise<{
        result: string;
    }>;
    /**
     * Retrieves messages associated with the thread
     * @param params - Optional parameters including limit for number of messages to retrieve
     * @returns Promise containing thread messages and UI messages
     */
    getMessages(params?: GetMemoryThreadMessagesParams): Promise<GetMemoryThreadMessagesResponse>;
}

declare class Vector extends BaseResource {
    private vectorName;
    constructor(options: ClientOptions, vectorName: string);
    /**
     * Retrieves details about a specific vector index
     * @param indexName - Name of the index to get details for
     * @returns Promise containing vector index details
     */
    details(indexName: string): Promise<GetVectorIndexResponse>;
    /**
     * Deletes a vector index
     * @param indexName - Name of the index to delete
     * @returns Promise indicating deletion success
     */
    delete(indexName: string): Promise<{
        success: boolean;
    }>;
    /**
     * Retrieves a list of all available indexes
     * @returns Promise containing array of index names
     */
    getIndexes(): Promise<{
        indexes: string[];
    }>;
    /**
     * Creates a new vector index
     * @param params - Parameters for index creation including dimension and metric
     * @returns Promise indicating creation success
     */
    createIndex(params: CreateIndexParams): Promise<{
        success: boolean;
    }>;
    /**
     * Upserts vectors into an index
     * @param params - Parameters containing vectors, metadata, and optional IDs
     * @returns Promise containing array of vector IDs
     */
    upsert(params: UpsertVectorParams): Promise<string[]>;
    /**
     * Queries vectors in an index
     * @param params - Query parameters including query vector and search options
     * @returns Promise containing query results
     */
    query(params: QueryVectorParams): Promise<QueryVectorResponse>;
}

declare class LegacyWorkflow extends BaseResource {
    private workflowId;
    constructor(options: ClientOptions, workflowId: string);
    /**
     * Retrieves details about the legacy workflow
     * @returns Promise containing legacy workflow details including steps and graphs
     */
    details(): Promise<GetLegacyWorkflowResponse>;
    /**
     * Retrieves all runs for a legacy workflow
     * @param params - Parameters for filtering runs
     * @returns Promise containing legacy workflow runs array
     */
    runs(params?: GetWorkflowRunsParams): Promise<GetLegacyWorkflowRunsResponse>;
    /**
     * Creates a new legacy workflow run
     * @returns Promise containing the generated run ID
     */
    createRun(params?: {
        runId?: string;
    }): Promise<{
        runId: string;
    }>;
    /**
     * Starts a legacy workflow run synchronously without waiting for the workflow to complete
     * @param params - Object containing the runId and triggerData
     * @returns Promise containing success message
     */
    start(params: {
        runId: string;
        triggerData: Record<string, any>;
    }): Promise<{
        message: string;
    }>;
    /**
     * Resumes a suspended legacy workflow step synchronously without waiting for the workflow to complete
     * @param stepId - ID of the step to resume
     * @param runId - ID of the legacy workflow run
     * @param context - Context to resume the legacy workflow with
     * @returns Promise containing the legacy workflow resume results
     */
    resume({ stepId, runId, context, }: {
        stepId: string;
        runId: string;
        context: Record<string, any>;
    }): Promise<{
        message: string;
    }>;
    /**
     * Starts a workflow run asynchronously and returns a promise that resolves when the workflow is complete
     * @param params - Object containing the optional runId and triggerData
     * @returns Promise containing the workflow execution results
     */
    startAsync(params: {
        runId?: string;
        triggerData: Record<string, any>;
    }): Promise<LegacyWorkflowRunResult>;
    /**
     * Resumes a suspended legacy workflow step asynchronously and returns a promise that resolves when the workflow is complete
     * @param params - Object containing the runId, stepId, and context
     * @returns Promise containing the workflow resume results
     */
    resumeAsync(params: {
        runId: string;
        stepId: string;
        context: Record<string, any>;
    }): Promise<LegacyWorkflowRunResult>;
    /**
     * Creates an async generator that processes a readable stream and yields records
     * separated by the Record Separator character (\x1E)
     *
     * @param stream - The readable stream to process
     * @returns An async generator that yields parsed records
     */
    private streamProcessor;
    /**
     * Watches legacy workflow transitions in real-time
     * @param runId - Optional run ID to filter the watch stream
     * @returns AsyncGenerator that yields parsed records from the legacy workflow watch stream
     */
    watch({ runId }: {
        runId?: string;
    }, onRecord: (record: LegacyWorkflowRunResult) => void): Promise<void>;
}

declare class Tool extends BaseResource {
    private toolId;
    constructor(options: ClientOptions, toolId: string);
    /**
     * Retrieves details about the tool
     * @returns Promise containing tool details including description and schemas
     */
    details(): Promise<GetToolResponse>;
    /**
     * Executes the tool with the provided parameters
     * @param params - Parameters required for tool execution
     * @returns Promise containing the tool execution results
     */
    execute(params: {
        data: any;
        runId?: string;
        runtimeContext?: RuntimeContext | Record<string, any>;
    }): Promise<any>;
}

declare class Workflow extends BaseResource {
    private workflowId;
    constructor(options: ClientOptions, workflowId: string);
    /**
     * Creates an async generator that processes a readable stream and yields workflow records
     * separated by the Record Separator character (\x1E)
     *
     * @param stream - The readable stream to process
     * @returns An async generator that yields parsed records
     */
    private streamProcessor;
    /**
     * Retrieves details about the workflow
     * @returns Promise containing workflow details including steps and graphs
     */
    details(): Promise<GetWorkflowResponse>;
    /**
     * Retrieves all runs for a workflow
     * @param params - Parameters for filtering runs
     * @returns Promise containing workflow runs array
     */
    runs(params?: GetWorkflowRunsParams): Promise<GetWorkflowRunsResponse>;
    /**
     * Retrieves a specific workflow run by its ID
     * @param runId - The ID of the workflow run to retrieve
     * @returns Promise containing the workflow run details
     */
    runById(runId: string): Promise<GetWorkflowRunByIdResponse>;
    /**
     * Retrieves the execution result for a specific workflow run by its ID
     * @param runId - The ID of the workflow run to retrieve the execution result for
     * @returns Promise containing the workflow run execution result
     */
    runExecutionResult(runId: string): Promise<GetWorkflowRunExecutionResultResponse>;
    /**
     * Creates a new workflow run
     * @param params - Optional object containing the optional runId
     * @returns Promise containing the runId of the created run
     */
    createRun(params?: {
        runId?: string;
    }): Promise<{
        runId: string;
    }>;
    /**
     * Starts a workflow run synchronously without waiting for the workflow to complete
     * @param params - Object containing the runId, inputData and runtimeContext
     * @returns Promise containing success message
     */
    start(params: {
        runId: string;
        inputData: Record<string, any>;
        runtimeContext?: RuntimeContext | Record<string, any>;
    }): Promise<{
        message: string;
    }>;
    /**
     * Resumes a suspended workflow step synchronously without waiting for the workflow to complete
     * @param params - Object containing the runId, step, resumeData and runtimeContext
     * @returns Promise containing success message
     */
    resume({ step, runId, resumeData, ...rest }: {
        step: string | string[];
        runId: string;
        resumeData?: Record<string, any>;
        runtimeContext?: RuntimeContext | Record<string, any>;
    }): Promise<{
        message: string;
    }>;
    /**
     * Starts a workflow run asynchronously and returns a promise that resolves when the workflow is complete
     * @param params - Object containing the optional runId, inputData and runtimeContext
     * @returns Promise containing the workflow execution results
     */
    startAsync(params: {
        runId?: string;
        inputData: Record<string, any>;
        runtimeContext?: RuntimeContext | Record<string, any>;
    }): Promise<WorkflowRunResult>;
    /**
     * Starts a vNext workflow run and returns a stream
     * @param params - Object containing the optional runId, inputData and runtimeContext
     * @returns Promise containing the vNext workflow execution results
     */
    stream(params: {
        runId?: string;
        inputData: Record<string, any>;
        runtimeContext?: RuntimeContext;
    }): Promise<stream_web.ReadableStream<WorkflowWatchResult>>;
    /**
     * Resumes a suspended workflow step asynchronously and returns a promise that resolves when the workflow is complete
     * @param params - Object containing the runId, step, resumeData and runtimeContext
     * @returns Promise containing the workflow resume results
     */
    resumeAsync(params: {
        runId: string;
        step: string | string[];
        resumeData?: Record<string, any>;
        runtimeContext?: RuntimeContext | Record<string, any>;
    }): Promise<WorkflowRunResult>;
    /**
     * Watches workflow transitions in real-time
     * @param runId - Optional run ID to filter the watch stream
     * @returns AsyncGenerator that yields parsed records from the workflow watch stream
     */
    watch({ runId }: {
        runId?: string;
    }, onRecord: (record: WorkflowWatchResult) => void): Promise<void>;
    /**
     * Creates a new ReadableStream from an iterable or async iterable of objects,
     * serializing each as JSON and separating them with the record separator (\x1E).
     *
     * @param records - An iterable or async iterable of objects to stream
     * @returns A ReadableStream emitting the records as JSON strings separated by the record separator
     */
    static createRecordStream(records: Iterable<any> | AsyncIterable<any>): ReadableStream;
}

/**
 * Class for interacting with an agent via the A2A protocol
 */
declare class A2A extends BaseResource {
    private agentId;
    constructor(options: ClientOptions, agentId: string);
    /**
     * Get the agent card with metadata about the agent
     * @returns Promise containing the agent card information
     */
    getCard(): Promise<AgentCard>;
    /**
     * Send a message to the agent and get a response
     * @param params - Parameters for the task
     * @returns Promise containing the task response
     */
    sendMessage(params: TaskSendParams): Promise<{
        task: Task;
    }>;
    /**
     * Get the status and result of a task
     * @param params - Parameters for querying the task
     * @returns Promise containing the task response
     */
    getTask(params: TaskQueryParams): Promise<Task>;
    /**
     * Cancel a running task
     * @param params - Parameters identifying the task to cancel
     * @returns Promise containing the task response
     */
    cancelTask(params: TaskIdParams): Promise<{
        task: Task;
    }>;
    /**
     * Send a message and subscribe to streaming updates (not fully implemented)
     * @param params - Parameters for the task
     * @returns Promise containing the task response
     */
    sendAndSubscribe(params: TaskSendParams): Promise<Response>;
}

/**
 * Represents a specific tool available on a specific MCP server.
 * Provides methods to get details and execute the tool.
 */
declare class MCPTool extends BaseResource {
    private serverId;
    private toolId;
    constructor(options: ClientOptions, serverId: string, toolId: string);
    /**
     * Retrieves details about this specific tool from the MCP server.
     * @returns Promise containing the tool's information (name, description, schema).
     */
    details(): Promise<McpToolInfo>;
    /**
     * Executes this specific tool on the MCP server.
     * @param params - Parameters for tool execution, including data/args and optional runtimeContext.
     * @returns Promise containing the result of the tool execution.
     */
    execute(params: {
        data?: any;
        runtimeContext?: RuntimeContext;
    }): Promise<any>;
}

declare class MastraClient extends BaseResource {
    constructor(options: ClientOptions);
    /**
     * Retrieves all available agents
     * @returns Promise containing map of agent IDs to agent details
     */
    getAgents(): Promise<Record<string, GetAgentResponse>>;
    getAGUI({ resourceId }: {
        resourceId: string;
    }): Promise<Record<string, AbstractAgent>>;
    /**
     * Gets an agent instance by ID
     * @param agentId - ID of the agent to retrieve
     * @returns Agent instance
     */
    getAgent(agentId: string): Agent;
    /**
     * Retrieves memory threads for a resource
     * @param params - Parameters containing the resource ID
     * @returns Promise containing array of memory threads
     */
    getMemoryThreads(params: GetMemoryThreadParams): Promise<GetMemoryThreadResponse>;
    /**
     * Creates a new memory thread
     * @param params - Parameters for creating the memory thread
     * @returns Promise containing the created memory thread
     */
    createMemoryThread(params: CreateMemoryThreadParams): Promise<CreateMemoryThreadResponse>;
    /**
     * Gets a memory thread instance by ID
     * @param threadId - ID of the memory thread to retrieve
     * @returns MemoryThread instance
     */
    getMemoryThread(threadId: string, agentId: string): MemoryThread;
    /**
     * Saves messages to memory
     * @param params - Parameters containing messages to save
     * @returns Promise containing the saved messages
     */
    saveMessageToMemory(params: SaveMessageToMemoryParams): Promise<SaveMessageToMemoryResponse>;
    /**
     * Gets the status of the memory system
     * @returns Promise containing memory system status
     */
    getMemoryStatus(agentId: string): Promise<{
        result: boolean;
    }>;
    /**
     * Retrieves all available tools
     * @returns Promise containing map of tool IDs to tool details
     */
    getTools(): Promise<Record<string, GetToolResponse>>;
    /**
     * Gets a tool instance by ID
     * @param toolId - ID of the tool to retrieve
     * @returns Tool instance
     */
    getTool(toolId: string): Tool;
    /**
     * Retrieves all available legacy workflows
     * @returns Promise containing map of legacy workflow IDs to legacy workflow details
     */
    getLegacyWorkflows(): Promise<Record<string, GetLegacyWorkflowResponse>>;
    /**
     * Gets a legacy workflow instance by ID
     * @param workflowId - ID of the legacy workflow to retrieve
     * @returns Legacy Workflow instance
     */
    getLegacyWorkflow(workflowId: string): LegacyWorkflow;
    /**
     * Retrieves all available workflows
     * @returns Promise containing map of workflow IDs to workflow details
     */
    getWorkflows(): Promise<Record<string, GetWorkflowResponse>>;
    /**
     * Gets a workflow instance by ID
     * @param workflowId - ID of the workflow to retrieve
     * @returns Workflow instance
     */
    getWorkflow(workflowId: string): Workflow;
    /**
     * Gets a vector instance by name
     * @param vectorName - Name of the vector to retrieve
     * @returns Vector instance
     */
    getVector(vectorName: string): Vector;
    /**
     * Retrieves logs
     * @param params - Parameters for filtering logs
     * @returns Promise containing array of log messages
     */
    getLogs(params: GetLogsParams): Promise<GetLogsResponse>;
    /**
     * Gets logs for a specific run
     * @param params - Parameters containing run ID to retrieve
     * @returns Promise containing array of log messages
     */
    getLogForRun(params: GetLogParams): Promise<GetLogsResponse>;
    /**
     * List of all log transports
     * @returns Promise containing list of log transports
     */
    getLogTransports(): Promise<{
        transports: string[];
    }>;
    /**
     * List of all traces (paged)
     * @param params - Parameters for filtering traces
     * @returns Promise containing telemetry data
     */
    getTelemetry(params?: GetTelemetryParams): Promise<GetTelemetryResponse>;
    /**
     * Retrieves all available networks
     * @returns Promise containing map of network IDs to network details
     */
    getNetworks(): Promise<Record<string, GetNetworkResponse>>;
    /**
     * Gets a network instance by ID
     * @param networkId - ID of the network to retrieve
     * @returns Network instance
     */
    getNetwork(networkId: string): Network;
    /**
     * Retrieves a list of available MCP servers.
     * @param params - Optional parameters for pagination (limit, offset).
     * @returns Promise containing the list of MCP servers and pagination info.
     */
    getMcpServers(params?: {
        limit?: number;
        offset?: number;
    }): Promise<McpServerListResponse>;
    /**
     * Retrieves detailed information for a specific MCP server.
     * @param serverId - The ID of the MCP server to retrieve.
     * @param params - Optional parameters, e.g., specific version.
     * @returns Promise containing the detailed MCP server information.
     */
    getMcpServerDetails(serverId: string, params?: {
        version?: string;
    }): Promise<ServerDetailInfo>;
    /**
     * Retrieves a list of tools for a specific MCP server.
     * @param serverId - The ID of the MCP server.
     * @returns Promise containing the list of tools.
     */
    getMcpServerTools(serverId: string): Promise<McpServerToolListResponse>;
    /**
     * Gets an MCPTool resource instance for a specific tool on an MCP server.
     * This instance can then be used to fetch details or execute the tool.
     * @param serverId - The ID of the MCP server.
     * @param toolId - The ID of the tool.
     * @returns MCPTool instance.
     */
    getMcpServerTool(serverId: string, toolId: string): MCPTool;
    /**
     * Gets an A2A client for interacting with an agent via the A2A protocol
     * @param agentId - ID of the agent to interact with
     * @returns A2A client instance
     */
    getA2A(agentId: string): A2A;
}

export { type ClientOptions, type CreateIndexParams, type CreateMemoryThreadParams, type CreateMemoryThreadResponse, type GenerateParams, type GetAgentResponse, type GetEvalsByAgentIdResponse, type GetLegacyWorkflowResponse, type GetLegacyWorkflowRunsResponse, type GetLogParams, type GetLogsParams, type GetLogsResponse, type GetMemoryThreadMessagesParams, type GetMemoryThreadMessagesResponse, type GetMemoryThreadParams, type GetMemoryThreadResponse, type GetNetworkResponse, type GetTelemetryParams, type GetTelemetryResponse, type GetToolResponse, type GetVectorIndexResponse, type GetWorkflowResponse, type GetWorkflowRunByIdResponse, type GetWorkflowRunExecutionResultResponse, type GetWorkflowRunsParams, type GetWorkflowRunsResponse, type LegacyWorkflowRunResult, MastraClient, type McpServerListResponse, type McpServerToolListResponse, type McpToolInfo, type QueryVectorParams, type QueryVectorResponse, type RequestFunction, type RequestOptions, type SaveMessageToMemoryParams, type SaveMessageToMemoryResponse, type StreamParams, type UpdateMemoryThreadParams, type UpsertVectorParams, type WorkflowRunResult, type WorkflowWatchResult };
