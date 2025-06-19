import { Span } from './types';

export interface SpanViewProps {
    trace: Span[];
}
export default function SpanView({ trace }: SpanViewProps): import("react/jsx-runtime").JSX.Element;
