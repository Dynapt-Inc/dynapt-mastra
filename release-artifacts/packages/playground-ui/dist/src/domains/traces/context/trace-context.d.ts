import { Span, RefinedTrace } from '../types';

export type TraceContextType = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    trace: Span[] | null;
    setTrace: React.Dispatch<React.SetStateAction<Span[] | null>>;
    traces: RefinedTrace[];
    currentTraceIndex: number;
    setCurrentTraceIndex: React.Dispatch<React.SetStateAction<number>>;
    nextTrace: () => void;
    prevTrace: () => void;
    span: Span | null;
    setSpan: React.Dispatch<React.SetStateAction<Span | null>>;
    clearData: () => void;
};
export declare const TraceContext: import('../../../../node_modules/@types/react').Context<TraceContextType>;
export declare function TraceProvider({ children, initialTraces: traces, }: {
    children: React.ReactNode;
    initialTraces?: RefinedTrace[];
}): import("react/jsx-runtime").JSX.Element;
