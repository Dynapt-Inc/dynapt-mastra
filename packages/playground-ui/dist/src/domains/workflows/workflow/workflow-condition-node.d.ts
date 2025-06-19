import { NodeProps, Node } from '@xyflow/react';
import { Condition } from './utils';

export type ConditionNode = Node<{
    conditions: Condition[];
    previousStepId: string;
    nextStepId: string;
    mapConfig?: string;
}, 'condition-node'>;
export declare function WorkflowConditionNode({ data }: NodeProps<ConditionNode>): import("react/jsx-runtime").JSX.Element;
