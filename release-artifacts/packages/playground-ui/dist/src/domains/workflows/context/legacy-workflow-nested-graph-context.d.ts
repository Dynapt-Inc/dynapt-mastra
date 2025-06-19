type LegacyWorkflowNestedGraphContextType = {
    showNestedGraph: ({ label, stepGraph, stepSubscriberGraph, }: {
        label: string;
        stepGraph: any;
        stepSubscriberGraph: any;
    }) => void;
    closeNestedGraph: () => void;
};
export declare const LegacyWorkflowNestedGraphContext: import('../../../../node_modules/@types/react').Context<LegacyWorkflowNestedGraphContextType>;
export declare function LegacyWorkflowNestedGraphProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
