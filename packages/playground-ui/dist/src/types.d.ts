export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: any;
    isError?: boolean;
}
export interface ModelSettings {
    frequencyPenalty?: number;
    presencePenalty?: number;
    maxRetries?: number;
    maxSteps?: number;
    maxTokens?: number;
    temperature?: number;
    topK?: number;
    topP?: number;
    instructions?: string;
}
export interface ChatProps {
    agentId: string;
    agentName?: string;
    threadId?: string;
    initialMessages?: Message[];
    memory?: boolean;
    refreshThreadList?: () => void;
    modelSettings?: ModelSettings;
    chatWithGenerate?: boolean;
    runtimeContext?: Record<string, any>;
    showFileSupport?: boolean;
}
export type SpanStatus = {
    code: number;
};
export type SpanOther = {
    droppedAttributesCount: number;
    droppedEventsCount: number;
    droppedLinksCount: number;
};
export type SpanEvent = {
    attributes: Record<string, string | number | boolean | null>[];
    name: string;
    timeUnixNano: string;
    droppedAttributesCount: number;
};
export type Span = {
    id: string;
    parentSpanId: string | null;
    traceId: string;
    name: string;
    scope: string;
    kind: number;
    status: SpanStatus;
    events: SpanEvent[];
    links: any[];
    attributes: Record<string, string | number | boolean | null>;
    startTime: number;
    endTime: number;
    duration: number;
    other: SpanOther;
    createdAt: string;
};
export type RefinedTrace = {
    traceId: string;
    serviceName: string;
    duration: number;
    started: number;
    status: SpanStatus;
    trace: Span[];
    runId?: string;
};
export * from './domains/traces/types';
