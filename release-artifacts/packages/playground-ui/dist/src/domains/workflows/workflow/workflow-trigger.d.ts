import { ExtendedWorkflowWatchResult } from '../../../hooks/use-workflows';
import { GetWorkflowResponse } from '@mastra/client-js';

interface WorkflowTriggerProps {
    workflowId: string;
    setRunId?: (runId: string) => void;
    workflow?: GetWorkflowResponse;
    isLoading?: boolean;
    createWorkflowRun: ({ workflowId, prevRunId }: {
        workflowId: string;
        prevRunId?: string;
    }) => Promise<{
        runId: string;
    }>;
    startWorkflowRun: ({ workflowId, runId, input, runtimeContext, }: {
        workflowId: string;
        runId: string;
        input: Record<string, unknown>;
        runtimeContext: Record<string, unknown>;
    }) => Promise<void>;
    resumeWorkflow: ({ workflowId, step, runId, resumeData, runtimeContext, }: {
        workflowId: string;
        step: string | string[];
        runId: string;
        resumeData: Record<string, unknown>;
        runtimeContext: Record<string, unknown>;
    }) => Promise<{
        message: string;
    }>;
    watchWorkflow: ({ workflowId, runId }: {
        workflowId: string;
        runId: string;
    }) => Promise<void>;
    watchResult: ExtendedWorkflowWatchResult | null;
    isWatchingWorkflow: boolean;
    isResumingWorkflow: boolean;
}
export declare function WorkflowTrigger({ workflowId, setRunId, workflow, isLoading, createWorkflowRun, startWorkflowRun, resumeWorkflow, watchWorkflow, watchResult, isWatchingWorkflow, isResumingWorkflow, }: WorkflowTriggerProps): import("react/jsx-runtime").JSX.Element | null;
export {};
