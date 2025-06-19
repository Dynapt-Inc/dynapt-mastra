import { ReactNode } from '../../node_modules/@types/react';
import { ChatProps } from '../types';

export declare function MastraNetworkRuntimeProvider({ children, agentId, initialMessages, memory, threadId, refreshThreadList, modelSettings, }: Readonly<{
    children: ReactNode;
}> & ChatProps): import("react/jsx-runtime").JSX.Element;
