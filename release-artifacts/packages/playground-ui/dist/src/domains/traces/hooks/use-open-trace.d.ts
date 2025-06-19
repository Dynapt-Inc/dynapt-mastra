import { Span } from '../types';

export declare const useOpenTrace: () => {
    openTrace: (trace: Span[], traceIndex: number) => void;
};
