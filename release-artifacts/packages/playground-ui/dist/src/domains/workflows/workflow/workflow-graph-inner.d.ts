import { GetWorkflowResponse } from '@mastra/client-js';

export interface WorkflowGraphInnerProps {
    workflow: {
        stepGraph: GetWorkflowResponse['stepGraph'];
    };
    onShowTrace: ({ runId, stepName }: {
        runId: string;
        stepName: string;
    }) => void;
}
export declare function WorkflowGraphInner({ workflow, onShowTrace }: WorkflowGraphInnerProps): import("react/jsx-runtime").JSX.Element;
