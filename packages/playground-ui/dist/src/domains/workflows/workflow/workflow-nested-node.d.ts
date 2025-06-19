import { NodeProps, Node } from '@xyflow/react';
import { StepFlowEntry } from '@mastra/core/workflows';

export type NestedNode = Node<{
    label: string;
    description?: string;
    withoutTopHandle?: boolean;
    withoutBottomHandle?: boolean;
    stepGraph: StepFlowEntry[];
    mapConfig?: string;
}, 'nested-node'>;
export declare function WorkflowNestedNode({ data, parentWorkflowName, }: NodeProps<NestedNode> & {
    parentWorkflowName?: string;
}): import("react/jsx-runtime").JSX.Element;
