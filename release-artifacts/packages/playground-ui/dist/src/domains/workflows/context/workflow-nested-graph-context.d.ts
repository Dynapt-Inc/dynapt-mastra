import { SerializedStepFlowEntry } from '@mastra/core/workflows';

type WorkflowNestedGraphContextType = {
    showNestedGraph: ({ label, stepGraph, fullStep, }: {
        label: string;
        stepGraph: SerializedStepFlowEntry[];
        fullStep: string;
    }) => void;
    closeNestedGraph: () => void;
};
export declare const WorkflowNestedGraphContext: import('../../../../node_modules/@types/react').Context<WorkflowNestedGraphContextType>;
export declare function WorkflowNestedGraphProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
