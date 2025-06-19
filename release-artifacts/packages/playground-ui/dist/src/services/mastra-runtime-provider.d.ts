import { ReactNode } from '../../node_modules/@types/react';
import { ChatProps } from '../types';

export declare function MastraRuntimeProvider({ children, agentId, initialMessages, agentName, memory, threadId, refreshThreadList, modelSettings, chatWithGenerate, runtimeContext, }: Readonly<{
    children: ReactNode;
}> & ChatProps): import("react/jsx-runtime").JSX.Element;
