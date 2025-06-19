import type { Agent } from '@mastra/core';
import type { BaseContext } from 'inngest';
import { ClientOptions } from 'inngest';
import { DefaultExecutionEngine } from '@mastra/core/workflows';
import type { Emitter } from '@mastra/core/workflows';
import type { ExecuteFunction } from '@mastra/core/workflows';
import type { ExecutionContext } from '@mastra/core/workflows';
import type { ExecutionEngine } from '@mastra/core/workflows';
import type { ExecutionGraph } from '@mastra/core/workflows';
import { Handler } from 'inngest';
import type { Inngest } from 'inngest';
import { InngestFunction } from 'inngest';
import { InngestMiddleware } from 'inngest';
import type { Mastra } from '@mastra/core';
import { Run } from '@mastra/core/workflows';
import { RuntimeContext } from '@mastra/core/di';
import type { SerializedStepFlowEntry } from '@mastra/core/workflows';
import { serve as serve_2 } from 'inngest/hono';
import type { Span } from '@opentelemetry/api';
import type { Step } from '@mastra/core/workflows';
import type { StepFlowEntry } from '@mastra/core/workflows';
import type { StepResult } from '@mastra/core/workflows';
import type { StreamEvent } from '@mastra/core/workflows';
import { Tool } from '@mastra/core/tools';
import type { ToolExecutionContext } from '@mastra/core';
import type { WatchEvent } from '@mastra/core/workflows';
import { Workflow } from '@mastra/core/workflows';
import type { WorkflowConfig } from '@mastra/core/workflows';
import type { WorkflowResult } from '@mastra/core/workflows';
import type { WorkflowRun } from '@mastra/core';
import type { WorkflowRuns } from '@mastra/core';
import { z } from 'zod';

export declare function createStep<TStepId extends string, TStepInput extends z.ZodType<any>, TStepOutput extends z.ZodType<any>, TResumeSchema extends z.ZodType<any>, TSuspendSchema extends z.ZodType<any>>(params: {
    id: TStepId;
    description?: string;
    inputSchema: TStepInput;
    outputSchema: TStepOutput;
    resumeSchema?: TResumeSchema;
    suspendSchema?: TSuspendSchema;
    execute: ExecuteFunction<z.infer<TStepInput>, z.infer<TStepOutput>, z.infer<TResumeSchema>, z.infer<TSuspendSchema>, InngestEngineType>;
}): Step<TStepId, TStepInput, TStepOutput, TResumeSchema, TSuspendSchema, InngestEngineType>;

export declare function createStep<TStepId extends string, TStepInput extends z.ZodObject<{
    prompt: z.ZodString;
}>, TStepOutput extends z.ZodObject<{
    text: z.ZodString;
}>, TResumeSchema extends z.ZodType<any>, TSuspendSchema extends z.ZodType<any>>(agent: Agent<TStepId, any, any>): Step<TStepId, TStepInput, TStepOutput, TResumeSchema, TSuspendSchema, InngestEngineType>;

export declare function createStep<TSchemaIn extends z.ZodType<any>, TSchemaOut extends z.ZodType<any>, TContext extends ToolExecutionContext<TSchemaIn>>(tool: Tool<TSchemaIn, TSchemaOut, TContext> & {
    inputSchema: TSchemaIn;
    outputSchema: TSchemaOut;
    execute: (context: TContext) => Promise<any>;
}): Step<string, TSchemaIn, TSchemaOut, z.ZodType<any>, z.ZodType<any>, InngestEngineType>;

export declare function init(inngest: Inngest): {
    createWorkflow<TWorkflowId extends string = string, TInput extends z.ZodType<any> = z.ZodType<any, z.ZodTypeDef, any>, TOutput extends z.ZodType<any> = z.ZodType<any, z.ZodTypeDef, any>, TSteps extends Step<string, any, any, any, any, InngestEngineType>[] = Step<string, any, any, any, any, InngestEngineType>[]>(params: WorkflowConfig<TWorkflowId, TInput, TOutput, TSteps>): InngestWorkflow<InngestEngineType, TSteps, TWorkflowId, TInput, TOutput, TInput>;
    createStep: typeof createStep;
    cloneStep<TStepId extends string>(step: Step<string, any, any, any, any, InngestEngineType>, opts: {
        id: TStepId;
    }): Step<TStepId, any, any, any, any, InngestEngineType>;
    cloneWorkflow<TWorkflowId extends string = string, TInput extends z.ZodType<any> = z.ZodType<any, z.ZodTypeDef, any>, TOutput extends z.ZodType<any> = z.ZodType<any, z.ZodTypeDef, any>, TSteps extends Step<string, any, any, any, any, InngestEngineType>[] = Step<string, any, any, any, any, InngestEngineType>[]>(workflow: Workflow<InngestEngineType, TSteps, string, TInput, TOutput, TInput>, opts: {
        id: TWorkflowId;
    }): Workflow<InngestEngineType, TSteps, TWorkflowId, TInput, TOutput, TInput>;
};

export declare type InngestEngineType = {
    step: any;
};

export declare class InngestExecutionEngine extends DefaultExecutionEngine {
    private inngestStep;
    private inngestAttempts;
    constructor(mastra: Mastra, inngestStep: BaseContext<Inngest>['step'], inngestAttempts?: number);
    execute<TInput, TOutput>(params: {
        workflowId: string;
        runId: string;
        graph: ExecutionGraph;
        serializedStepGraph: SerializedStepFlowEntry[];
        input?: TInput;
        resume?: {
            steps: string[];
            stepResults: Record<string, StepResult<any, any, any, any>>;
            resumePayload: any;
            resumePath: number[];
        };
        emitter: Emitter;
        retryConfig?: {
            attempts?: number;
            delay?: number;
        };
        runtimeContext: RuntimeContext;
    }): Promise<TOutput>;
    protected fmtReturnValue<TOutput>(executionSpan: Span | undefined, emitter: Emitter, stepResults: Record<string, StepResult<any, any, any, any>>, lastOutput: StepResult<any, any, any, any>, error?: Error | string): Promise<TOutput>;
    superExecuteStep({ workflowId, runId, step, stepResults, executionContext, resume, prevOutput, emitter, runtimeContext, }: {
        workflowId: string;
        runId: string;
        step: Step<string, any, any>;
        stepResults: Record<string, StepResult<any, any, any, any>>;
        executionContext: ExecutionContext;
        resume?: {
            steps: string[];
            resumePayload: any;
        };
        prevOutput: any;
        emitter: Emitter;
        runtimeContext: RuntimeContext;
    }): Promise<StepResult<any, any, any, any>>;
    executeSleep({ id, duration }: {
        id: string;
        duration: number;
    }): Promise<void>;
    executeWaitForEvent({ event, timeout }: {
        event: string;
        timeout?: number;
    }): Promise<any>;
    executeStep({ step, stepResults, executionContext, resume, prevOutput, emitter, runtimeContext, }: {
        step: Step<string, any, any>;
        stepResults: Record<string, StepResult<any, any, any, any>>;
        executionContext: {
            workflowId: string;
            runId: string;
            executionPath: number[];
            suspendedPaths: Record<string, number[]>;
            retryConfig: {
                attempts: number;
                delay: number;
            };
        };
        resume?: {
            steps: string[];
            resumePayload: any;
            runId?: string;
        };
        prevOutput: any;
        emitter: Emitter;
        runtimeContext: RuntimeContext;
    }): Promise<StepResult<any, any, any, any>>;
    persistStepUpdate({ workflowId, runId, stepResults, executionContext, serializedStepGraph, workflowStatus, result, error, }: {
        workflowId: string;
        runId: string;
        stepResults: Record<string, StepResult<any, any, any, any>>;
        serializedStepGraph: SerializedStepFlowEntry[];
        executionContext: ExecutionContext;
        workflowStatus: 'success' | 'failed' | 'suspended' | 'running';
        result?: Record<string, any>;
        error?: string | Error;
    }): Promise<void>;
    executeConditional({ workflowId, runId, entry, prevOutput, prevStep, stepResults, serializedStepGraph, resume, executionContext, emitter, runtimeContext, }: {
        workflowId: string;
        runId: string;
        entry: {
            type: 'conditional';
            steps: StepFlowEntry[];
            conditions: ExecuteFunction<any, any, any, any, InngestEngineType>[];
        };
        prevStep: StepFlowEntry;
        serializedStepGraph: SerializedStepFlowEntry[];
        prevOutput: any;
        stepResults: Record<string, StepResult<any, any, any, any>>;
        resume?: {
            steps: string[];
            stepResults: Record<string, StepResult<any, any, any, any>>;
            resumePayload: any;
            resumePath: number[];
        };
        executionContext: ExecutionContext;
        emitter: Emitter;
        runtimeContext: RuntimeContext;
    }): Promise<StepResult<any, any, any, any>>;
}

export declare class InngestRun<TEngineType = InngestEngineType, TSteps extends Step<string, any, any>[] = Step<string, any, any>[], TInput extends z.ZodType<any> = z.ZodType<any>, TOutput extends z.ZodType<any> = z.ZodType<any>> extends Run<TEngineType, TSteps, TInput, TOutput> {
    #private;
    private inngest;
    serializedStepGraph: SerializedStepFlowEntry[];
    constructor(params: {
        workflowId: string;
        runId: string;
        executionEngine: ExecutionEngine;
        executionGraph: ExecutionGraph;
        serializedStepGraph: SerializedStepFlowEntry[];
        mastra?: Mastra;
        retryConfig?: {
            attempts?: number;
            delay?: number;
        };
        cleanup?: () => void;
    }, inngest: Inngest);
    getRuns(eventId: string): Promise<any>;
    getRunOutput(eventId: string): Promise<any>;
    sendEvent(event: string, data: any): Promise<void>;
    start({ inputData, }: {
        inputData?: z.infer<TInput>;
        runtimeContext?: RuntimeContext;
    }): Promise<WorkflowResult<TOutput, TSteps>>;
    resume<TResumeSchema extends z.ZodType<any>>(params: {
        resumeData?: z.infer<TResumeSchema>;
        step: Step<string, any, any, TResumeSchema, any> | [...Step<string, any, any, any, any>[], Step<string, any, any, TResumeSchema, any>] | string | string[];
        runtimeContext?: RuntimeContext;
    }): Promise<WorkflowResult<TOutput, TSteps>>;
    _resume<TResumeSchema extends z.ZodType<any>>(params: {
        resumeData?: z.infer<TResumeSchema>;
        step: Step<string, any, any, TResumeSchema, any> | [...Step<string, any, any, any, any>[], Step<string, any, any, TResumeSchema, any>] | string | string[];
        runtimeContext?: RuntimeContext;
    }): Promise<WorkflowResult<TOutput, TSteps>>;
    watch(cb: (event: WatchEvent) => void, type?: 'watch' | 'watch-v2'): () => void;
    stream({ inputData, runtimeContext }?: {
        inputData?: z.infer<TInput>;
        runtimeContext?: RuntimeContext;
    }): {
        stream: ReadableStream<StreamEvent>;
        getWorkflowState: () => Promise<WorkflowResult<TOutput, TSteps>>;
    };
}

export declare class InngestWorkflow<TEngineType = InngestEngineType, TSteps extends Step<string, any, any>[] = Step<string, any, any>[], TWorkflowId extends string = string, TInput extends z.ZodType<any> = z.ZodType<any>, TOutput extends z.ZodType<any> = z.ZodType<any>, TPrevSchema extends z.ZodType<any> = TInput> extends Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, TPrevSchema> {
    #private;
    inngest: Inngest;
    private function;
    constructor(params: WorkflowConfig<TWorkflowId, TInput, TOutput, TSteps>, inngest: Inngest);
    getWorkflowRuns(args?: {
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
        resourceId?: string;
    }): Promise<WorkflowRuns>;
    getWorkflowRunById(runId: string): Promise<WorkflowRun | null>;
    getWorkflowRunExecutionResult(runId: string): Promise<WatchEvent['payload']['workflowState'] | null>;
    __registerMastra(mastra: Mastra): void;
    createRun(options?: {
        runId?: string;
    }): Run<TEngineType, TSteps, TInput, TOutput>;
    getFunction(): InngestFunction<Omit<InngestFunction.Options<Inngest<ClientOptions>, InngestMiddleware.Stack, InngestFunction.Trigger<string>[] | [{
    cron: string;
    } & Partial<Record<"event" | "if", never>>] | [{
    event: string;
    if?: string;
    } & Partial<Record<"cron", never>>], Handler.Any>, "triggers">, Handler.Any, Handler.Any, Inngest<ClientOptions>, InngestMiddleware.Stack, InngestFunction.Trigger<string>[] | [{
    cron: string;
    } & Partial<Record<"event" | "if", never>>] | [{
    event: string;
    if?: string;
    } & Partial<Record<"cron", never>>]>;
    getNestedFunctions(steps: StepFlowEntry[]): ReturnType<Inngest['createFunction']>[];
    getFunctions(): InngestFunction<Omit<InngestFunction.Options<Inngest<ClientOptions>, InngestMiddleware.Stack, InngestFunction.Trigger<string>[] | [{
    cron: string;
    } & Partial<Record<"event" | "if", never>>] | [{
    event: string;
    if?: string;
    } & Partial<Record<"cron", never>>], Handler.Any>, "triggers">, Handler.Any, Handler.Any, Inngest<ClientOptions>, InngestMiddleware.Stack, InngestFunction.Trigger<string>[] | [{
    cron: string;
    } & Partial<Record<"event" | "if", never>>] | [{
    event: string;
    if?: string;
    } & Partial<Record<"cron", never>>]>[];
}

export declare function serve({ mastra, inngest }: {
    mastra: Mastra;
    inngest: Inngest;
}): ReturnType<typeof serve_2>;

export { }
