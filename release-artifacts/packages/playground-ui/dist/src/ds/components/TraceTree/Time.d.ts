export interface TimeProps {
    durationMs: number;
    tokenCount?: number;
    variant?: 'agent';
    progressPercent: number;
    offsetPercent: number;
}
export declare const Time: ({ durationMs, tokenCount, variant, progressPercent, offsetPercent }: TimeProps) => import("react/jsx-runtime").JSX.Element;
