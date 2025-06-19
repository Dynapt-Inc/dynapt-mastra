import { RefinedTrace } from '../../traces/types';

export interface WorkflowTracesProps {
    traces: RefinedTrace[];
    error: {
        message: string;
    } | null;
    runId?: string;
    stepName?: string;
}
export declare function WorkflowTraces({ traces, error, runId, stepName }: WorkflowTracesProps): import("react/jsx-runtime").JSX.Element;
