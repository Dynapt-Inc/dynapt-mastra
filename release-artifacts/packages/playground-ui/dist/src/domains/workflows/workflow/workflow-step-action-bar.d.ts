export interface WorkflowStepActionBarProps {
    input?: any;
    output?: any;
    error?: any;
    stepName: string;
    mapConfig?: string;
    onShowTrace?: () => void;
}
export declare const WorkflowStepActionBar: ({ input, output, error, mapConfig, stepName, onShowTrace, }: WorkflowStepActionBarProps) => import("react/jsx-runtime").JSX.Element;
