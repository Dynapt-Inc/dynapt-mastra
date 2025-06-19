import { K as VariableReference, N as StepResult, d as LegacyStep, L as LegacyWorkflow, A as Agent, W as WorkflowContext, T as ToolsInput, M as Mastra, O as StepAction, Q as LegacyWorkflowRunResult } from '../../base-CWUtFPZY.js';
export { $ as ActionContext, _ as BaseCondition, aa as DependencyCheckOutput, ah as ExtractSchemaFromStep, ak as ExtractSchemaType, ai as ExtractStepResult, am as LegacyWorkflowRunState, af as LegacyWorkflowState, al as PathsToStringProps, a7 as ResolverFunctionInput, a8 as ResolverFunctionOutput, Z as RetryConfig, a2 as StepCondition, a3 as StepConfig, a1 as StepDef, S as StepExecutionContext, Y as StepGraph, ag as StepId, aj as StepInputType, X as StepNode, ab as StepResolverOutput, U as StepVariableType, a4 as StepsRecord, a9 as SubscriberFunctionOutput, a0 as WhenConditionReturnValue, ad as WorkflowActionParams, ae as WorkflowActions, ac as WorkflowActors, a6 as WorkflowEvent, a5 as WorkflowLogMessage, R as WorkflowOptions, an as WorkflowResumeResult } from '../../base-CWUtFPZY.js';
import { z } from 'zod';
import { M as Metric } from '../../types-Bo1uigWx.js';
import { I as IMastraLogger } from '../../logger-DtVDdb81.js';
import '../../base-DCIyondy.js';
import 'ai';
import 'json-schema';
import '../../tts/index.js';
import '../../vector/index.js';
import '../../vector/filter/index.js';
import 'sift';
import '../../runtime-context/index.js';
import '@opentelemetry/api';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import '../constants.js';
import 'ai/test';
import '../../deployer/index.js';
import '../../bundler/index.js';
import 'hono/cors';
import 'hono-openapi';
import '../../error/index.js';
import 'stream';
import '@opentelemetry/sdk-trace-base';

declare function isErrorEvent(stateEvent: any): stateEvent is {
    type: `xstate.error.actor.${string}`;
    error: Error;
};
declare function isTransitionEvent(stateEvent: any): stateEvent is {
    type: `xstate.done.actor.${string}`;
    output?: unknown;
};
declare function isVariableReference(value: any): value is VariableReference<any, any>;
declare function getStepResult(result?: StepResult<any>): any;
declare function getSuspendedPaths({ value, path, suspendedPaths, }: {
    value: string | Record<string, string>;
    path: string;
    suspendedPaths: Set<string>;
}): void;
declare function isFinalState(status: string): boolean;
declare function isLimboState(status: string): boolean;
declare function recursivelyCheckForFinalState({ value, suspendedPaths, path, }: {
    value: string | Record<string, string>;
    suspendedPaths: Set<string>;
    path: string;
}): boolean;
declare function getActivePathsAndStatus(value: Record<string, any>): Array<{
    stepPath: string[];
    stepId: string;
    status: string;
}>;
declare function mergeChildValue(startStepId: string, parent: Record<string, any>, child: Record<string, any>): Record<string, any>;
declare const updateStepInHierarchy: (value: Record<string, any>, targetStepId: string) => Record<string, any>;
declare function getResultActivePaths(state: {
    value: Record<string, string>;
    context: {
        steps: Record<string, any>;
    };
}): Map<string, {
    status: string;
    suspendPayload?: any;
    stepPath: string[];
}>;
declare function isWorkflow(step: LegacyStep<any, any, any, any> | LegacyWorkflow<any, any, any, any> | Agent<any, any, any>): step is LegacyWorkflow<any, any, any, any>;
declare function isAgent(step: LegacyStep<any, any, any, any> | Agent<any, any, any> | LegacyWorkflow<any, any, any, any>): step is Agent<any, any, any>;
declare function resolveVariables({ runId, logger, variables, context, }: {
    runId: string;
    logger: IMastraLogger;
    variables: Record<string, VariableReference<any, any>>;
    context: WorkflowContext;
}): Record<string, any>;
declare function agentToStep<TAgentId extends string = string, TTools extends ToolsInput = ToolsInput, TMetrics extends Record<string, Metric> = Record<string, Metric>>(agent: Agent<TAgentId, TTools, TMetrics>, { mastra }?: {
    mastra?: Mastra;
}): StepAction<TAgentId, z.ZodObject<{
    prompt: z.ZodString;
}>, z.ZodObject<{
    text: z.ZodString;
}>, any>;
declare function workflowToStep<TSteps extends LegacyStep<any, any, any, any>[], TStepId extends string = any, TTriggerSchema extends z.ZodObject<any> = any, TResultSchema extends z.ZodObject<any> = any>(workflow: LegacyWorkflow<TSteps, TStepId, TTriggerSchema, TResultSchema>, { mastra }: {
    mastra?: Mastra;
}): StepAction<TStepId, TTriggerSchema, z.ZodType<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResultSchema>>, any>;
declare function isConditionalKey(key: string): boolean;

export { LegacyStep, LegacyWorkflow, LegacyWorkflowRunResult, StepAction, StepResult, VariableReference, WorkflowContext, agentToStep, getActivePathsAndStatus, getResultActivePaths, getStepResult, getSuspendedPaths, isAgent, isConditionalKey, isErrorEvent, isFinalState, isLimboState, isTransitionEvent, isVariableReference, isWorkflow, mergeChildValue, recursivelyCheckForFinalState, resolveVariables, updateStepInHierarchy, workflowToStep };
