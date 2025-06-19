import { RefinedTrace } from '../../traces/types';

export interface AgentTracesProps {
    className?: string;
    traces: RefinedTrace[];
    error: {
        message: string;
    } | null;
}
export declare function AgentTraces({ className, traces, error }: AgentTracesProps): import("react/jsx-runtime").JSX.Element;
