export type Step = {
    error?: any;
    startedAt: number;
    endedAt?: number;
    status: 'running' | 'success' | 'failed' | 'suspended';
    output?: any;
    input?: any;
};
type UseCurrentRunReturnType = {
    steps: Record<string, Step>;
    isRunning: boolean;
    runId?: string;
};
export declare const useCurrentRun: () => UseCurrentRunReturnType;
export {};
