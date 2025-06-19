import { GetWorkflowResponse } from '@mastra/client-js';

export interface WorkflowGraphProps {
    workflowId: string;
    isLoading?: boolean;
    workflow?: GetWorkflowResponse;
    onShowTrace: ({ runId, stepName }: {
        runId: string;
        stepName: string;
    }) => void;
}
export declare function WorkflowGraph({ workflowId, onShowTrace, workflow, isLoading }: WorkflowGraphProps): import("react/jsx-runtime").JSX.Element;
