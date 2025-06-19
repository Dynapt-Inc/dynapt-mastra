import { be as ExecutionEngine, bg as Emitter, bm as StepResult, bd as ExecutionGraph, b6 as SerializedStepFlowEntry, b4 as StepFlowEntry, f as Step, bf as ExecuteFunction, at as DefaultEngineType } from '../base-CWUtFPZY.js';
export { bo as DynamicMapping, br as ExtractSchemaFromStep, bq as ExtractSchemaType, bp as PathsToStringProps, bc as Run, b5 as SerializedStep, bi as StepFailure, bk as StepRunning, bh as StepSuccess, bj as StepSuspended, bl as StepWaiting, bn as StepsRecord, bt as StreamEvent, bs as VariableReference, bu as WatchEvent, e as Workflow, au as WorkflowConfig, bb as WorkflowResult, bw as WorkflowRunState, bv as ZodPathType, b8 as cloneStep, ba as cloneWorkflow, b7 as createStep, b9 as createWorkflow } from '../base-CWUtFPZY.js';
import { Span } from '@opentelemetry/api';
import { RuntimeContext } from '../runtime-context/index.js';
import 'ai';
import '../base-DCIyondy.js';
import '../logger-DtVDdb81.js';
import '../error/index.js';
import 'stream';
import '@opentelemetry/sdk-trace-base';
import 'zod';
import 'json-schema';
import '../tts/index.js';
import '../vector/index.js';
import '../vector/filter/index.js';
import '../types-Bo1uigWx.js';
import 'sift';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import './constants.js';
import 'ai/test';
import '../deployer/index.js';
import '../bundler/index.js';
import 'hono/cors';
import 'hono-openapi';

type ExecutionContext = {
    workflowId: string;
    runId: string;
    executionPath: number[];
    suspendedPaths: Record<string, number[]>;
    retryConfig: {
        attempts: number;
        delay: number;
    };
    executionSpan: Span;
};
/**
 * Default implementation of the ExecutionEngine using XState
 */
declare class DefaultExecutionEngine extends ExecutionEngine {
    protected fmtReturnValue<TOutput>(executionSpan: Span | undefined, emitter: Emitter, stepResults: Record<string, StepResult<any, any, any, any>>, lastOutput: StepResult<any, any, any, any>, error?: Error | string): Promise<TOutput>;
    /**
     * Executes a workflow run with the provided execution graph and input
     * @param graph The execution graph to execute
     * @param input The input data for the workflow
     * @returns A promise that resolves to the workflow output
     */
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
    getStepOutput(stepResults: Record<string, any>, step?: StepFlowEntry): any;
    executeSleep({ duration }: {
        id: string;
        duration: number;
    }): Promise<void>;
    executeWaitForEvent({ event, emitter, timeout, }: {
        event: string;
        emitter: Emitter;
        timeout?: number;
    }): Promise<any>;
    executeStep({ workflowId, runId, step, stepResults, executionContext, resume, prevOutput, emitter, runtimeContext, }: {
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
    executeParallel({ workflowId, runId, entry, prevStep, serializedStepGraph, stepResults, resume, executionContext, emitter, runtimeContext, }: {
        workflowId: string;
        runId: string;
        entry: {
            type: 'parallel';
            steps: StepFlowEntry[];
        };
        serializedStepGraph: SerializedStepFlowEntry[];
        prevStep: StepFlowEntry;
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
    executeConditional({ workflowId, runId, entry, prevOutput, prevStep, serializedStepGraph, stepResults, resume, executionContext, emitter, runtimeContext, }: {
        workflowId: string;
        runId: string;
        serializedStepGraph: SerializedStepFlowEntry[];
        entry: {
            type: 'conditional';
            steps: StepFlowEntry[];
            conditions: ExecuteFunction<any, any, any, any, DefaultEngineType>[];
        };
        prevStep: StepFlowEntry;
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
    executeLoop({ workflowId, runId, entry, prevOutput, stepResults, resume, executionContext, emitter, runtimeContext, }: {
        workflowId: string;
        runId: string;
        entry: {
            type: 'loop';
            step: Step;
            condition: ExecuteFunction<any, any, any, any, DefaultEngineType>;
            loopType: 'dowhile' | 'dountil';
        };
        prevStep: StepFlowEntry;
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
    executeForeach({ workflowId, runId, entry, prevOutput, stepResults, resume, executionContext, emitter, runtimeContext, }: {
        workflowId: string;
        runId: string;
        entry: {
            type: 'foreach';
            step: Step;
            opts: {
                concurrency: number;
            };
        };
        prevStep: StepFlowEntry;
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
    protected persistStepUpdate({ workflowId, runId, stepResults, serializedStepGraph, executionContext, workflowStatus, result, error, }: {
        workflowId: string;
        runId: string;
        stepResults: Record<string, StepResult<any, any, any, any>>;
        serializedStepGraph: SerializedStepFlowEntry[];
        executionContext: ExecutionContext;
        workflowStatus: 'success' | 'failed' | 'suspended' | 'running' | 'waiting';
        result?: Record<string, any>;
        error?: string | Error;
    }): Promise<void>;
    executeEntry({ workflowId, runId, entry, prevStep, serializedStepGraph, stepResults, resume, executionContext, emitter, runtimeContext, }: {
        workflowId: string;
        runId: string;
        entry: StepFlowEntry;
        prevStep: StepFlowEntry;
        serializedStepGraph: SerializedStepFlowEntry[];
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
    }): Promise<{
        result: StepResult<any, any, any, any>;
        stepResults?: Record<string, StepResult<any, any, any, any>>;
        executionContext?: ExecutionContext;
    }>;
}

export { DefaultEngineType, DefaultExecutionEngine, Emitter, ExecuteFunction, type ExecutionContext, ExecutionEngine, ExecutionGraph, SerializedStepFlowEntry, Step, StepFlowEntry, StepResult };
