import { ReactNode } from '../../../../../node_modules/@types/react';
import { ModelSettings } from '../../../../types';
import { GetAgentResponse } from '@mastra/client-js';

type AgentContextType = {
    modelSettings: ModelSettings;
    chatWithGenerate: boolean;
    setModelSettings: (modelSettings: ModelSettings) => void;
    resetModelSettings: () => void;
    setChatWithGenerate: (chatWithGenerate: boolean) => void;
};
export declare const AgentContext: import('../../../../../node_modules/@types/react').Context<AgentContextType>;
export declare function AgentProvider({ agentId, defaultGenerateOptions, defaultStreamOptions, children, }: {
    agentId: string;
    defaultGenerateOptions?: GetAgentResponse['defaultGenerateOptions'];
    defaultStreamOptions?: GetAgentResponse['defaultStreamOptions'];
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
