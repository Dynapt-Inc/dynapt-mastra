import { NodeProps, Node } from '@xyflow/react';

export type DefaultNode = Node<{
    label: string;
    description?: string;
    withoutTopHandle?: boolean;
    withoutBottomHandle?: boolean;
    mapConfig?: string;
}, 'default-node'>;
export interface WorkflowDefaultNodeProps {
    data: DefaultNode['data'];
    onShowTrace?: ({ runId, stepName }: {
        runId: string;
        stepName: string;
    }) => void;
    parentWorkflowName?: string;
}
export declare function WorkflowDefaultNode({ data, onShowTrace, parentWorkflowName, }: NodeProps<DefaultNode> & WorkflowDefaultNodeProps): import("react/jsx-runtime").JSX.Element;
