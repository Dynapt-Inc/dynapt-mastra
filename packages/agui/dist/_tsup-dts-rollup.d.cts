import { AbstractAgent } from '@ag-ui/client';
import type { Agent } from '@mastra/core/agent';
import type { AgentConfig } from '@ag-ui/client';
import type { BaseEvent } from '@ag-ui/client';
import type { Context } from 'hono';
import { CopilotServiceAdapter } from '@copilotkit/runtime';
import type { CoreMessage } from '@mastra/core';
import type { Mastra } from '@mastra/core';
import type { Message } from '@ag-ui/client';
import { Observable } from 'rxjs';
import type { RunAgentInput } from '@ag-ui/client';
import { RuntimeContext } from '@mastra/core/runtime-context';

export declare class AGUIAdapter extends AbstractAgent {
    agent: Agent;
    resourceId?: string;
    runtimeContext?: RuntimeContext;
    constructor({ agent, agentId, resourceId, runtimeContext, ...rest }: MastraAgentConfig);
    protected run(input: RunAgentInput): Observable<BaseEvent>;
}

export declare function convertMessagesToMastraMessages(messages: Message[]): CoreMessage[];

export declare function getAGUI({ mastra, resourceId, runtimeContext, }: {
    mastra: Mastra;
    resourceId?: string;
    runtimeContext?: RuntimeContext;
}): {
    [x: string]: AbstractAgent;
};

export declare function getAGUIAgent({ mastra, agentId, resourceId, runtimeContext, }: {
    mastra: Mastra;
    agentId: string;
    resourceId?: string;
    runtimeContext?: RuntimeContext;
}): AbstractAgent;

export declare function getAGUINetwork({ mastra, networkId, resourceId, runtimeContext, }: {
    mastra: Mastra;
    networkId: string;
    resourceId?: string;
    runtimeContext?: RuntimeContext;
}): AbstractAgent;

declare interface MastraAgentConfig extends AgentConfig {
    agent: Agent;
    agentId: string;
    resourceId?: string;
    runtimeContext?: RuntimeContext;
}

export declare function registerCopilotKit<T extends Record<string, any> | unknown = unknown>({ path, resourceId, serviceAdapter, agents, setContext, }: {
    path: string;
    resourceId: string;
    serviceAdapter?: CopilotServiceAdapter;
    agents?: Record<string, AbstractAgent>;
    setContext?: (c: Context<{
        Variables: {
            mastra: Mastra;
        };
    }>, runtimeContext: RuntimeContext<T>) => void | Promise<void>;
}): any;

export { }
