import { LegacyWorkflowRunResult, WorkflowWatchResult } from '@mastra/client-js';
import { LegacyWorkflow } from '@mastra/core/workflows/legacy';

export type ExtendedLegacyWorkflowRunResult = LegacyWorkflowRunResult & {
    sanitizedOutput?: string | null;
    sanitizedError?: {
        message: string;
        stack?: string;
    } | null;
};
export type ExtendedWorkflowWatchResult = WorkflowWatchResult & {
    sanitizedOutput?: string | null;
    sanitizedError?: {
        message: string;
        stack?: string;
    } | null;
};
export declare const useLegacyWorkflow: (workflowId: string) => {
    legacyWorkflow: LegacyWorkflow<import('@mastra/core/workflows/legacy').LegacyStep<string, any, any, import('@mastra/core/workflows/legacy').StepExecutionContext<any, import('@mastra/core/workflows/legacy').WorkflowContext<any, import('@mastra/core/workflows/legacy').LegacyStep<string, any, any, any>[], Record<string, any>>>>[], string, any, any> | null;
    isLoading: boolean;
};
export declare const useExecuteWorkflow: () => {
    startLegacyWorkflowRun: ({ workflowId, runId, input, }: {
        workflowId: string;
        runId: string;
        input: any;
    }) => Promise<void>;
    createLegacyWorkflowRun: ({ workflowId, prevRunId }: {
        workflowId: string;
        prevRunId?: string;
    }) => Promise<{
        runId: string;
    }>;
};
export declare const useWatchWorkflow: () => {
    watchLegacyWorkflow: ({ workflowId, runId }: {
        workflowId: string;
        runId: string;
    }) => Promise<void>;
    isWatchingLegacyWorkflow: boolean;
    legacyWatchResult: ExtendedLegacyWorkflowRunResult | null;
};
export declare const useResumeWorkflow: () => {
    resumeLegacyWorkflow: ({ workflowId, stepId, runId, context, }: {
        workflowId: string;
        stepId: string;
        runId: string;
        context: any;
    }) => Promise<{
        message: string;
    }>;
    isResumingLegacyWorkflow: boolean;
};
