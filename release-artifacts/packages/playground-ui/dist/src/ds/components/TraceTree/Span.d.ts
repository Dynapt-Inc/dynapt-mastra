import { default as React } from '../../../../node_modules/@types/react';

export interface SpanProps {
    children: React.ReactNode;
    durationMs: number;
    variant: 'tool' | 'agent' | 'workflow' | 'memory' | 'rag' | 'storage' | 'eval' | 'other';
    tokenCount?: number;
    spans?: React.ReactNode;
    isRoot?: boolean;
    onClick?: () => void;
    isActive?: boolean;
    offsetMs: number;
    totalDurationMs: number;
}
export declare const spanIconMap: {
    tool: (props: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
    agent: (props: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
    workflow: (props: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
    memory: (props: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
    rag: (props: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
    storage: (props: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
    eval: (props: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
    other: (props: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
};
export declare const spanVariantClasses: {
    tool: string;
    agent: string;
    workflow: string;
    memory: string;
    rag: string;
    storage: string;
    eval: string;
    other: string;
};
export declare const Span: ({ children, durationMs, variant, tokenCount, spans, isRoot, onClick, isActive, offsetMs, totalDurationMs, }: SpanProps) => import("react/jsx-runtime").JSX.Element;
