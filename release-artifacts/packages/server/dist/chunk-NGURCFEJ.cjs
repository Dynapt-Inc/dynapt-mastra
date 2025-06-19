'use strict';

var chunkASKESBJW_cjs = require('./chunk-ASKESBJW.cjs');
var chunk57CJTIPW_cjs = require('./chunk-57CJTIPW.cjs');
var chunk64U3UDTH_cjs = require('./chunk-64U3UDTH.cjs');
var chunkOCWPVYNI_cjs = require('./chunk-OCWPVYNI.cjs');
var chunk75ZPJI57_cjs = require('./chunk-75ZPJI57.cjs');
var tools = require('@mastra/core/tools');

// src/server/handlers/tools.ts
var tools_exports = {};
chunk75ZPJI57_cjs.__export(tools_exports, {
  executeAgentToolHandler: () => executeAgentToolHandler,
  executeToolHandler: () => executeToolHandler,
  getToolByIdHandler: () => getToolByIdHandler,
  getToolsHandler: () => getToolsHandler
});
async function getToolsHandler({ tools }) {
  try {
    if (!tools) {
      return {};
    }
    const serializedTools = Object.entries(tools).reduce(
      (acc, [id, _tool]) => {
        const tool = _tool;
        acc[id] = {
          ...tool,
          inputSchema: tool.inputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(tool.inputSchema)) : void 0,
          outputSchema: tool.outputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(tool.outputSchema)) : void 0
        };
        return acc;
      },
      {}
    );
    return serializedTools;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error getting tools");
  }
}
async function getToolByIdHandler({ tools, toolId }) {
  try {
    const tool = Object.values(tools || {}).find((tool2) => tool2.id === toolId);
    if (!tool) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Tool not found" });
    }
    const serializedTool = {
      ...tool,
      inputSchema: tool.inputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(tool.inputSchema)) : void 0,
      outputSchema: tool.outputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(tool.outputSchema)) : void 0
    };
    return serializedTool;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error getting tool");
  }
}
function executeToolHandler(tools$1) {
  return async ({
    mastra,
    runId,
    toolId,
    data,
    runtimeContext
  }) => {
    try {
      if (!toolId) {
        throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Tool ID is required" });
      }
      const tool = Object.values(tools$1 || {}).find((tool2) => tool2.id === toolId);
      if (!tool) {
        throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Tool not found" });
      }
      if (!tool?.execute) {
        throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Tool is not executable" });
      }
      chunk57CJTIPW_cjs.validateBody({ data });
      if (tools.isVercelTool(tool)) {
        const result2 = await tool.execute(data);
        return result2;
      }
      const result = await tool.execute({
        context: data,
        mastra,
        runId,
        runtimeContext
      });
      return result;
    } catch (error) {
      return chunk64U3UDTH_cjs.handleError(error, "Error executing tool");
    }
  };
}
async function executeAgentToolHandler({
  mastra,
  agentId,
  toolId,
  data,
  runtimeContext
}) {
  try {
    const agent = agentId ? mastra.getAgent(agentId) : null;
    if (!agent) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Tool not found" });
    }
    const agentTools = await agent.getTools({ runtimeContext });
    const tool = Object.values(agentTools || {}).find((tool2) => tool2.id === toolId);
    if (!tool) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Tool not found" });
    }
    if (!tool?.execute) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Tool is not executable" });
    }
    const result = await tool.execute({
      context: data,
      runtimeContext,
      mastra,
      runId: agentId
    });
    return result;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error executing tool");
  }
}

exports.executeAgentToolHandler = executeAgentToolHandler;
exports.executeToolHandler = executeToolHandler;
exports.getToolByIdHandler = getToolByIdHandler;
exports.getToolsHandler = getToolsHandler;
exports.tools_exports = tools_exports;
