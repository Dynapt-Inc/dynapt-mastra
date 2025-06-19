import { WorkflowRun } from '@mastra/core';

export interface WorkflowRunsProps {
    workflowId: string;
    runId?: string;
    isLoading: boolean;
    runs: WorkflowRun[];
    onPressRun: ({ workflowId, runId }: {
        workflowId: string;
        runId: string;
    }) => void;
}
export declare const WorkflowRuns: ({ workflowId, runId, isLoading, runs, onPressRun }: WorkflowRunsProps) => import("react/jsx-runtime").JSX.Element;
