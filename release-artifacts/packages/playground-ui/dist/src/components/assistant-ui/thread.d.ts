import { ToolCallContentPartComponent } from '@assistant-ui/react';

export interface ThreadProps {
    ToolFallback?: ToolCallContentPartComponent;
    agentName?: string;
    hasMemory?: boolean;
    showFileSupport?: boolean;
}
export declare const Thread: ({ ToolFallback, agentName, hasMemory, showFileSupport }: ThreadProps) => import("react/jsx-runtime").JSX.Element;
export interface ThreadWelcomeProps {
    agentName?: string;
}
