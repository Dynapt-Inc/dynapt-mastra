import { ReactNode } from '../../node_modules/@types/react';
import { MastraClient } from '@mastra/client-js';

export declare const MastraClientProvider: ({ children, baseUrl, headers, }: {
    children: ReactNode;
    baseUrl?: string;
    headers?: Record<string, string>;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useMastraClient: () => MastraClient;
