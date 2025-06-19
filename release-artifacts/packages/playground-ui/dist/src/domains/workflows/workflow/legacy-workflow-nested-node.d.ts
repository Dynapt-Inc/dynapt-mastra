import { NodeProps, Node } from '@xyflow/react';

type LegacyWorkflowNestedNode = Node<{
    label: string;
    description?: string;
    withoutTopHandle?: boolean;
    withoutBottomHandle?: boolean;
    stepGraph: any;
    stepSubscriberGraph: any;
}, 'nested-node'>;
export declare function LegacyWorkflowNestedNode({ data }: NodeProps<LegacyWorkflowNestedNode>): import("react/jsx-runtime").JSX.Element;
export {};
