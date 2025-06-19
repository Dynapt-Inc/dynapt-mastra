import { AbstractAgent, AgentConfig, RunAgentInput, BaseEvent, Message } from '@ag-ui/client';
import { CopilotServiceAdapter } from '@copilotkit/runtime';
import { CoreMessage, Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { Context } from 'hono';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { Observable } from 'rxjs';

interface MastraAgentConfig<T = unknown> extends AgentConfig {
    agent: Agent;
    agentId: string;
    resourceId?: string;
    runtimeContext?: RuntimeContext<T>;
}
declare class AGUIAdapter<T = unknown> extends AbstractAgent {
    agent: Agent;
    resourceId?: string;
    runtimeContext?: RuntimeContext<T>;
    constructor({ agent, agentId, resourceId, runtimeContext, ...rest }: MastraAgentConfig<T>);
    protected run(input: RunAgentInput): Observable<BaseEvent>;
}
declare function convertMessagesToMastraMessages(messages: Message[]): CoreMessage[];
declare function getAGUI<T = unknown>({ mastra, resourceId, runtimeContext, }: {
    mastra: Mastra;
    resourceId?: string;
    runtimeContext?: RuntimeContext<T>;
}): {
    [x: string]: AbstractAgent;
};
declare function getAGUIAgent({ mastra, agentId, resourceId, runtimeContext, }: {
    mastra: Mastra;
    agentId: string;
    resourceId?: string;
    runtimeContext?: RuntimeContext;
}): AbstractAgent;
declare function getAGUINetwork({ mastra, networkId, resourceId, runtimeContext, }: {
    mastra: Mastra;
    networkId: string;
    resourceId?: string;
    runtimeContext?: RuntimeContext;
}): AbstractAgent;
declare function registerCopilotKit<T extends Record<string, any> | unknown = unknown>({ path, resourceId, serviceAdapter, agents, setContext, }: {
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

export { AGUIAdapter, convertMessagesToMastraMessages, getAGUI, getAGUIAgent, getAGUINetwork, registerCopilotKit };
