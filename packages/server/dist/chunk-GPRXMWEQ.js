import { stringify, esm_default } from './chunk-TGJMNUYJ.js';
import { validateBody } from './chunk-H5PTF3Y4.js';
import { handleError } from './chunk-M5ABIP7D.js';
import { HTTPException } from './chunk-NYN7KFXL.js';
import { __export } from './chunk-MLKGABMK.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

// src/server/handlers/agents.ts
var agents_exports = {};
__export(agents_exports, {
  generateHandler: () => generateHandler,
  getAgentByIdHandler: () => getAgentByIdHandler,
  getAgentsHandler: () => getAgentsHandler,
  getEvalsByAgentIdHandler: () => getEvalsByAgentIdHandler,
  getLiveEvalsByAgentIdHandler: () => getLiveEvalsByAgentIdHandler,
  streamGenerateHandler: () => streamGenerateHandler
});
async function getAgentsHandler({ mastra, runtimeContext }) {
  try {
    const agents = mastra.getAgents();
    const serializedAgentsMap = await Promise.all(
      Object.entries(agents).map(async ([id, agent]) => {
        const instructions = await agent.getInstructions({ runtimeContext });
        const tools = await agent.getTools({ runtimeContext });
        const llm = await agent.getLLM({ runtimeContext });
        const defaultGenerateOptions = await agent.getDefaultGenerateOptions({ runtimeContext });
        const defaultStreamOptions = await agent.getDefaultStreamOptions({ runtimeContext });
        const serializedAgentTools = Object.entries(tools || {}).reduce((acc, [key, tool]) => {
          const _tool = tool;
          acc[key] = {
            ..._tool,
            inputSchema: _tool.inputSchema ? stringify(esm_default(_tool.inputSchema)) : void 0,
            outputSchema: _tool.outputSchema ? stringify(esm_default(_tool.outputSchema)) : void 0
          };
          return acc;
        }, {});
        let serializedAgentWorkflows = {};
        if ("getWorkflows" in agent) {
          const logger = mastra.getLogger();
          try {
            const workflows = await agent.getWorkflows({ runtimeContext });
            serializedAgentWorkflows = Object.entries(workflows || {}).reduce((acc, [key, workflow]) => {
              return {
                ...acc,
                [key]: {
                  name: workflow.name
                }
              };
            }, {});
          } catch (error) {
            logger.error("Error getting workflows for agent", { agentName: agent.name, error });
          }
        }
        return {
          id,
          name: agent.name,
          instructions,
          tools: serializedAgentTools,
          workflows: serializedAgentWorkflows,
          provider: llm?.getProvider(),
          modelId: llm?.getModelId(),
          defaultGenerateOptions,
          defaultStreamOptions
        };
      })
    );
    const serializedAgents = serializedAgentsMap.reduce((acc, { id, ...rest }) => {
      acc[id] = rest;
      return acc;
    }, {});
    return serializedAgents;
  } catch (error) {
    return handleError(error, "Error getting agents");
  }
}
async function getAgentByIdHandler({
  mastra,
  runtimeContext,
  agentId,
  isPlayground = false
}) {
  try {
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new HTTPException(404, { message: "Agent not found" });
    }
    const tools = await agent.getTools({ runtimeContext });
    const serializedAgentTools = Object.entries(tools || {}).reduce((acc, [key, tool]) => {
      const _tool = tool;
      acc[key] = {
        ..._tool,
        inputSchema: _tool.inputSchema ? stringify(esm_default(_tool.inputSchema)) : void 0,
        outputSchema: _tool.outputSchema ? stringify(esm_default(_tool.outputSchema)) : void 0
      };
      return acc;
    }, {});
    let serializedAgentWorkflows = {};
    if ("getWorkflows" in agent) {
      const logger = mastra.getLogger();
      try {
        const workflows = await agent.getWorkflows({ runtimeContext });
        serializedAgentWorkflows = Object.entries(workflows || {}).reduce((acc, [key, workflow]) => {
          return {
            ...acc,
            [key]: {
              name: workflow.name,
              steps: Object.entries(workflow.steps).reduce((acc2, [key2, step]) => {
                return {
                  ...acc2,
                  [key2]: {
                    id: step.id,
                    description: step.description
                  }
                };
              }, {})
            }
          };
        }, {});
      } catch (error) {
        logger.error("Error getting workflows for agent", { agentName: agent.name, error });
      }
    }
    let proxyRuntimeContext = runtimeContext;
    if (isPlayground) {
      proxyRuntimeContext = new Proxy(runtimeContext, {
        get(target, prop) {
          if (prop === "get") {
            return function(key) {
              const value = target.get(key);
              return value ?? `<${key}>`;
            };
          }
          return Reflect.get(target, prop);
        }
      });
    }
    const instructions = await agent.getInstructions({ runtimeContext: proxyRuntimeContext });
    const llm = await agent.getLLM({ runtimeContext });
    const defaultGenerateOptions = await agent.getDefaultGenerateOptions({ runtimeContext: proxyRuntimeContext });
    const defaultStreamOptions = await agent.getDefaultStreamOptions({ runtimeContext: proxyRuntimeContext });
    return {
      name: agent.name,
      instructions,
      tools: serializedAgentTools,
      workflows: serializedAgentWorkflows,
      provider: llm?.getProvider(),
      modelId: llm?.getModelId(),
      defaultGenerateOptions,
      defaultStreamOptions
    };
  } catch (error) {
    return handleError(error, "Error getting agent");
  }
}
async function getEvalsByAgentIdHandler({
  mastra,
  runtimeContext,
  agentId
}) {
  try {
    const agent = mastra.getAgent(agentId);
    const evals = await mastra.getStorage()?.getEvalsByAgentName?.(agent.name, "test") || [];
    const instructions = await agent.getInstructions({ runtimeContext });
    return {
      id: agentId,
      name: agent.name,
      instructions,
      evals
    };
  } catch (error) {
    return handleError(error, "Error getting test evals");
  }
}
async function getLiveEvalsByAgentIdHandler({
  mastra,
  runtimeContext,
  agentId
}) {
  try {
    const agent = mastra.getAgent(agentId);
    const evals = await mastra.getStorage()?.getEvalsByAgentName?.(agent.name, "live") || [];
    const instructions = await agent.getInstructions({ runtimeContext });
    return {
      id: agentId,
      name: agent.name,
      instructions,
      evals
    };
  } catch (error) {
    return handleError(error, "Error getting live evals");
  }
}
async function generateHandler({
  mastra,
  runtimeContext,
  agentId,
  body
}) {
  try {
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new HTTPException(404, { message: "Agent not found" });
    }
    const { messages, resourceId, resourceid, runtimeContext: agentRuntimeContext, ...rest } = body;
    const finalResourceId = resourceId ?? resourceid;
    const finalRuntimeContext = new RuntimeContext([
      ...Array.from(runtimeContext.entries()),
      ...Array.from(Object.entries(agentRuntimeContext ?? {}))
    ]);
    validateBody({ messages });
    const result = await agent.generate(messages, {
      ...rest,
      // @ts-expect-error TODO fix types
      resourceId: finalResourceId,
      runtimeContext: finalRuntimeContext
    });
    return result;
  } catch (error) {
    return handleError(error, "Error generating from agent");
  }
}
async function streamGenerateHandler({
  mastra,
  runtimeContext,
  agentId,
  body
}) {
  try {
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new HTTPException(404, { message: "Agent not found" });
    }
    const { messages, resourceId, resourceid, runtimeContext: agentRuntimeContext, ...rest } = body;
    const finalResourceId = resourceId ?? resourceid;
    const finalRuntimeContext = new RuntimeContext([
      ...Array.from(runtimeContext.entries()),
      ...Array.from(Object.entries(agentRuntimeContext ?? {}))
    ]);
    validateBody({ messages });
    const streamResult = await agent.stream(messages, {
      ...rest,
      // @ts-expect-error TODO fix types
      resourceId: finalResourceId,
      runtimeContext: finalRuntimeContext
    });
    const streamResponse = rest.output ? streamResult.toTextStreamResponse({
      headers: {
        "Transfer-Encoding": "chunked"
      }
    }) : streamResult.toDataStreamResponse({
      sendUsage: true,
      sendReasoning: true,
      getErrorMessage: (error) => {
        return `An error occurred while processing your request. ${error instanceof Error ? error.message : JSON.stringify(error)}`;
      },
      headers: {
        "Transfer-Encoding": "chunked"
      }
    });
    return streamResponse;
  } catch (error) {
    throw new HTTPException(error?.status ?? 500, { message: error?.message ?? "Error streaming from agent" });
  }
}

export { agents_exports, generateHandler, getAgentByIdHandler, getAgentsHandler, getEvalsByAgentIdHandler, getLiveEvalsByAgentIdHandler, streamGenerateHandler };
