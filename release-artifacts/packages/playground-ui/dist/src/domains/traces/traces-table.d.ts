import { RefinedTrace } from './types';

export interface TracesTableProps {
    traces: RefinedTrace[];
    error: {
        message: string;
    } | null;
}
export declare const TracesTable: ({ traces, error }: TracesTableProps) => import("react/jsx-runtime").JSX.Element;
