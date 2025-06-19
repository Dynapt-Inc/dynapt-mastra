import { SerializedStepFlowEntry } from '@mastra/core/workflows';

export interface WorkflowNestedGraphProps {
    stepGraph: SerializedStepFlowEntry[];
    open: boolean;
    workflowName: string;
}
export declare function WorkflowNestedGraph({ stepGraph, open, workflowName }: WorkflowNestedGraphProps): import("react/jsx-runtime").JSX.Element;
