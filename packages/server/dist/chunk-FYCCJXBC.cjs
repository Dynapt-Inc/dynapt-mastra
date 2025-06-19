'use strict';

var chunkASKESBJW_cjs = require('./chunk-ASKESBJW.cjs');
var chunk57CJTIPW_cjs = require('./chunk-57CJTIPW.cjs');
var chunk64U3UDTH_cjs = require('./chunk-64U3UDTH.cjs');
var chunkOCWPVYNI_cjs = require('./chunk-OCWPVYNI.cjs');
var chunk75ZPJI57_cjs = require('./chunk-75ZPJI57.cjs');
var runtimeContext = require('@mastra/core/runtime-context');

// src/server/handlers/agents.ts
var agents_exports = {};
chunk75ZPJI57_cjs.__export(agents_exports, {
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
            inputSchema: _tool.inputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(_tool.inputSchema)) : void 0,
            outputSchema: _tool.outputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(_tool.outputSchema)) : void 0
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
    return chunk64U3UDTH_cjs.handleError(error, "Error getting agents");
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
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Agent not found" });
    }
    const tools = await agent.getTools({ runtimeContext });
    const serializedAgentTools = Object.entries(tools || {}).reduce((acc, [key, tool]) => {
      const _tool = tool;
      acc[key] = {
        ..._tool,
        inputSchema: _tool.inputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(_tool.inputSchema)) : void 0,
        outputSchema: _tool.outputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(_tool.outputSchema)) : void 0
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
    return chunk64U3UDTH_cjs.handleError(error, "Error getting agent");
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
    return chunk64U3UDTH_cjs.handleError(error, "Error getting test evals");
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
    return chunk64U3UDTH_cjs.handleError(error, "Error getting live evals");
  }
}
async function generateHandler({
  mastra,
  runtimeContext: runtimeContext$1,
  agentId,
  body
}) {
  try {
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Agent not found" });
    }
    const { messages, resourceId, resourceid, runtimeContext: agentRuntimeContext, ...rest } = body;
    const finalResourceId = resourceId ?? resourceid;
    const finalRuntimeContext = new runtimeContext.RuntimeContext([
      ...Array.from(runtimeContext$1.entries()),
      ...Array.from(Object.entries(agentRuntimeContext ?? {}))
    ]);
    chunk57CJTIPW_cjs.validateBody({ messages });
    const result = await agent.generate(messages, {
      ...rest,
      // @ts-expect-error TODO fix types
      resourceId: finalResourceId,
      runtimeContext: finalRuntimeContext
    });
    return result;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error generating from agent");
  }
}
async function streamGenerateHandler({
  mastra,
  runtimeContext: runtimeContext$1,
  agentId,
  body
}) {
  try {
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Agent not found" });
    }
    const { messages, resourceId, resourceid, runtimeContext: agentRuntimeContext, ...rest } = body;
    const finalResourceId = resourceId ?? resourceid;
    const finalRuntimeContext = new runtimeContext.RuntimeContext([
      ...Array.from(runtimeContext$1.entries()),
      ...Array.from(Object.entries(agentRuntimeContext ?? {}))
    ]);
    chunk57CJTIPW_cjs.validateBody({ messages });
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
    throw new chunkOCWPVYNI_cjs.HTTPException(error?.status ?? 500, { message: error?.message ?? "Error streaming from agent" });
  }
}

exports.agents_exports = agents_exports;
exports.generateHandler = generateHandler;
exports.getAgentByIdHandler = getAgentByIdHandler;
exports.getAgentsHandler = getAgentsHandler;
exports.getEvalsByAgentIdHandler = getEvalsByAgentIdHandler;
exports.getLiveEvalsByAgentIdHandler = getLiveEvalsByAgentIdHandler;
exports.streamGenerateHandler = streamGenerateHandler;
