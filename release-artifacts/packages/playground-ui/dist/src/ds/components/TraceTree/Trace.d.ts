import { default as React } from '../../../../node_modules/@types/react';
import { SpanProps } from './Span';

export interface TraceProps {
    name: string;
    spans: React.ReactNode;
    durationMs: number;
    tokenCount?: number;
    onClick?: () => void;
    variant: SpanProps['variant'];
    isActive?: boolean;
    totalDurationMs: number;
}
export declare const Trace: ({ name, spans, durationMs, tokenCount, onClick, variant, isActive, totalDurationMs, }: TraceProps) => import("react/jsx-runtime").JSX.Element;
