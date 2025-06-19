import { Evals } from '../../evals/types';

export interface AgentEvalsProps {
    liveEvals: Array<Evals>;
    ciEvals: Array<Evals>;
    onRefetchLiveEvals: () => void;
    onRefetchCiEvals: () => void;
}
export declare function AgentEvals({ liveEvals, ciEvals, onRefetchLiveEvals, onRefetchCiEvals }: AgentEvalsProps): import("react/jsx-runtime").JSX.Element;
