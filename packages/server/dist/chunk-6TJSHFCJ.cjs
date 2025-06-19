'use strict';

var chunk57CJTIPW_cjs = require('./chunk-57CJTIPW.cjs');
var chunk64U3UDTH_cjs = require('./chunk-64U3UDTH.cjs');
var chunkOCWPVYNI_cjs = require('./chunk-OCWPVYNI.cjs');
var chunk75ZPJI57_cjs = require('./chunk-75ZPJI57.cjs');

// src/server/handlers/memory.ts
var memory_exports = {};
chunk75ZPJI57_cjs.__export(memory_exports, {
  createThreadHandler: () => createThreadHandler,
  deleteThreadHandler: () => deleteThreadHandler,
  getMemoryStatusHandler: () => getMemoryStatusHandler,
  getMessagesHandler: () => getMessagesHandler,
  getThreadByIdHandler: () => getThreadByIdHandler,
  getThreadsHandler: () => getThreadsHandler,
  saveMessagesHandler: () => saveMessagesHandler,
  updateThreadHandler: () => updateThreadHandler
});
function getMemoryFromContext({
  mastra,
  agentId
}) {
  const agent = agentId ? mastra.getAgent(agentId) : null;
  if (agentId && !agent) {
    throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Agent not found" });
  }
  const memory = agent?.getMemory?.() || mastra.getMemory();
  return memory;
}
async function getMemoryStatusHandler({ mastra, agentId }) {
  try {
    const memory = getMemoryFromContext({ mastra, agentId });
    if (!memory) {
      return { result: false };
    }
    return { result: true };
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error getting memory status");
  }
}
async function getThreadsHandler({
  mastra,
  agentId,
  resourceId
}) {
  try {
    const memory = getMemoryFromContext({ mastra, agentId });
    if (!memory) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Memory is not initialized" });
    }
    chunk57CJTIPW_cjs.validateBody({ resourceId });
    const threads = await memory.getThreadsByResourceId({ resourceId });
    return threads;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error getting threads");
  }
}
async function getThreadByIdHandler({
  mastra,
  agentId,
  threadId
}) {
  try {
    chunk57CJTIPW_cjs.validateBody({ threadId });
    const memory = getMemoryFromContext({ mastra, agentId });
    if (!memory) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Memory is not initialized" });
    }
    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Thread not found" });
    }
    return thread;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error getting thread");
  }
}
async function saveMessagesHandler({
  mastra,
  agentId,
  body
}) {
  try {
    const memory = getMemoryFromContext({ mastra, agentId });
    if (!memory) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Memory is not initialized" });
    }
    if (!body?.messages) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Messages are required" });
    }
    if (!Array.isArray(body.messages)) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Messages should be an array" });
    }
    const processedMessages = body.messages.map((message) => ({
      ...message,
      id: memory.generateId(),
      createdAt: message.createdAt ? new Date(message.createdAt) : /* @__PURE__ */ new Date()
    }));
    const result = await memory.saveMessages({ messages: processedMessages, memoryConfig: {} });
    return result;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error saving messages");
  }
}
async function createThreadHandler({
  mastra,
  agentId,
  body
}) {
  try {
    const memory = getMemoryFromContext({ mastra, agentId });
    if (!memory) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Memory is not initialized" });
    }
    chunk57CJTIPW_cjs.validateBody({ resourceId: body?.resourceId });
    const result = await memory.createThread({
      resourceId: body?.resourceId,
      title: body?.title,
      metadata: body?.metadata,
      threadId: body?.threadId
    });
    return result;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error saving thread to memory");
  }
}
async function updateThreadHandler({
  mastra,
  agentId,
  threadId,
  body
}) {
  try {
    const memory = getMemoryFromContext({ mastra, agentId });
    if (!body) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Body is required" });
    }
    const { title, metadata, resourceId } = body;
    const updatedAt = /* @__PURE__ */ new Date();
    chunk57CJTIPW_cjs.validateBody({ threadId });
    if (!memory) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Memory is not initialized" });
    }
    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Thread not found" });
    }
    const updatedThread = {
      ...thread,
      title: title || thread.title,
      metadata: metadata || thread.metadata,
      resourceId: resourceId || thread.resourceId,
      createdAt: thread.createdAt,
      updatedAt
    };
    const result = await memory.saveThread({ thread: updatedThread });
    return result;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error updating thread");
  }
}
async function deleteThreadHandler({
  mastra,
  agentId,
  threadId
}) {
  try {
    chunk57CJTIPW_cjs.validateBody({ threadId });
    const memory = getMemoryFromContext({ mastra, agentId });
    if (!memory) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Memory is not initialized" });
    }
    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Thread not found" });
    }
    await memory.deleteThread(threadId);
    return { result: "Thread deleted" };
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error deleting thread");
  }
}
async function getMessagesHandler({
  mastra,
  agentId,
  threadId,
  limit
}) {
  if (limit !== void 0 && (!Number.isInteger(limit) || limit <= 0)) {
    throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Invalid limit: must be a positive integer" });
  }
  try {
    chunk57CJTIPW_cjs.validateBody({ threadId });
    const memory = getMemoryFromContext({ mastra, agentId });
    if (!memory) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Memory is not initialized" });
    }
    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Thread not found" });
    }
    const result = await memory.query({
      threadId,
      ...limit && { selectBy: { last: limit } }
    });
    return { messages: result.messages, uiMessages: result.uiMessages };
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error getting messages");
  }
}

exports.createThreadHandler = createThreadHandler;
exports.deleteThreadHandler = deleteThreadHandler;
exports.getMemoryStatusHandler = getMemoryStatusHandler;
exports.getMessagesHandler = getMessagesHandler;
exports.getThreadByIdHandler = getThreadByIdHandler;
exports.getThreadsHandler = getThreadsHandler;
exports.memory_exports = memory_exports;
exports.saveMessagesHandler = saveMessagesHandler;
exports.updateThreadHandler = updateThreadHandler;
