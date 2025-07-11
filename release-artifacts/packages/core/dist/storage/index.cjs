'use strict';

var chunkKKCGZKNC_cjs = require('../chunk-KKCGZKNC.cjs');
var chunk6NCAW2KJ_cjs = require('../chunk-6NCAW2KJ.cjs');
var chunkL5FURQXC_cjs = require('../chunk-L5FURQXC.cjs');

// src/storage/mock.ts
var MockStore = class extends chunkKKCGZKNC_cjs.MastraStorage {
  data = {
    mastra_workflow_snapshot: {},
    mastra_evals: {},
    mastra_messages: {},
    mastra_threads: {},
    mastra_traces: {}
  };
  constructor() {
    super({ name: "MockStore" });
    this.hasInitialized = Promise.resolve(true);
  }
  async createTable(_) {
  }
  async alterTable({
    tableName
  }) {
    this.logger.debug(`MockStore: alterTable called for ${tableName}`);
  }
  async clearTable({ tableName }) {
    this.logger.debug(`MockStore: clearTable called for ${tableName}`);
    this.data[tableName] = {};
  }
  async insert({ tableName, record }) {
    this.logger.debug(`MockStore: insert called for ${tableName}`, record);
    this.data[tableName][record.run_id] = JSON.parse(JSON.stringify(record));
  }
  async batchInsert({ tableName, records }) {
    this.logger.debug(`MockStore: batchInsert called for ${tableName} with ${records.length} records`);
    for (const record of records) {
      this.data[tableName][record.run_id] = JSON.parse(JSON.stringify(record));
    }
  }
  async load({ tableName, keys }) {
    this.logger.debug(`MockStore: load called for ${tableName} with keys`, keys);
    const record = this.data[tableName][keys.run_id];
    return record ? record : null;
  }
  async getThreadById({ threadId }) {
    this.logger.debug(`MockStore: getThreadById called for ${threadId}`);
    const thread = Object.values(this.data.mastra_threads).find((t) => t.id === threadId);
    return thread ? thread : null;
  }
  async getThreadsByResourceId({ resourceId }) {
    this.logger.debug(`MockStore: getThreadsByResourceId called for ${resourceId}`);
    const threads = Object.values(this.data.mastra_threads).filter((t) => t.resourceId === resourceId);
    return threads;
  }
  async saveThread({ thread }) {
    this.logger.debug(`MockStore: saveThread called for ${thread.id}`);
    const key = thread.id;
    this.data.mastra_threads[key] = thread;
    return thread;
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    this.logger.debug(`MockStore: updateThread called for ${id}`);
    const thread = this.data.mastra_threads[id];
    if (thread) {
      thread.title = title;
      thread.metadata = { ...thread.metadata, ...metadata };
      thread.updatedAt = /* @__PURE__ */ new Date();
    }
    return thread;
  }
  async deleteThread({ threadId }) {
    this.logger.debug(`MockStore: deleteThread called for ${threadId}`);
    delete this.data.mastra_threads[threadId];
    this.data.mastra_messages = Object.fromEntries(
      Object.entries(this.data.mastra_messages).filter(([, msg]) => msg.threadId !== threadId)
    );
  }
  async getMessages({ threadId, selectBy }) {
    this.logger.debug(`MockStore: getMessages called for thread ${threadId}`);
    let messages = Object.values(this.data.mastra_messages).filter((msg) => msg.threadId === threadId);
    if (selectBy?.last) {
      messages = messages.slice(-selectBy.last);
    }
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return messages;
  }
  async saveMessages(args) {
    const { messages, format = "v1" } = args;
    this.logger.debug(`MockStore: saveMessages called with ${messages.length} messages`);
    for (const message of messages) {
      const key = message.id;
      this.data.mastra_messages[key] = message;
    }
    const list = new chunk6NCAW2KJ_cjs.MessageList().add(messages, "memory");
    if (format === `v2`) return list.get.all.v2();
    return list.get.all.v1();
  }
  async updateMessages(args) {
    this.logger.debug(`MockStore: updateMessages called with ${args.messages.length} messages`);
    const messages = args.messages.map((m) => this.data.mastra_messages[m.id]);
    return messages;
  }
  async getTraces({
    name,
    scope,
    page,
    perPage,
    attributes,
    filters,
    fromDate,
    toDate
  }) {
    this.logger.debug(`MockStore: getTraces called`);
    let traces = Object.values(this.data.mastra_traces);
    if (name) traces = traces.filter((t) => t.name?.startsWith(name));
    if (scope) traces = traces.filter((t) => t.scope === scope);
    if (attributes) {
      traces = traces.filter(
        (t) => Object.entries(attributes).every(([key, value]) => t.attributes?.[key] === value)
      );
    }
    if (filters) {
      traces = traces.filter((t) => Object.entries(filters).every(([key, value]) => t[key] === value));
    }
    if (fromDate) traces = traces.filter((t) => new Date(t.createdAt) >= fromDate);
    if (toDate) traces = traces.filter((t) => new Date(t.createdAt) <= toDate);
    traces.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    const start = page * perPage;
    const end = start + perPage;
    return traces.slice(start, end);
  }
  async getEvalsByAgentName(agentName, type) {
    this.logger.debug(`MockStore: getEvalsByAgentName called for ${agentName}`);
    let evals = Object.values(this.data.mastra_evals).filter((e) => e.agentName === agentName);
    if (type === "test") {
      evals = evals.filter((e) => e.testInfo && e.testInfo.testPath);
    } else if (type === "live") {
      evals = evals.filter((e) => !e.testInfo || !e.testInfo.testPath);
    }
    evals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return evals;
  }
  async getWorkflowRuns({
    workflowName,
    fromDate,
    toDate,
    limit,
    offset,
    resourceId
  } = {}) {
    this.logger.debug(`MockStore: getWorkflowRuns called`);
    let runs = Object.values(this.data.mastra_workflow_snapshot || {});
    if (workflowName) runs = runs.filter((run) => run.workflow_name === workflowName);
    if (fromDate) runs = runs.filter((run) => new Date(run.createdAt) >= fromDate);
    if (toDate) runs = runs.filter((run) => new Date(run.createdAt) <= toDate);
    if (resourceId) runs = runs.filter((run) => run.resourceId === resourceId);
    const total = runs.length;
    runs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (limit !== void 0 && offset !== void 0) {
      const start = offset;
      const end = start + limit;
      runs = runs.slice(start, end);
    }
    const parsedRuns = runs.map((run) => ({
      ...run,
      snapshot: typeof run.snapshot === "string" ? JSON.parse(run.snapshot) : { ...run.snapshot },
      createdAt: new Date(run.createdAt),
      updatedAt: new Date(run.updatedAt),
      runId: run.run_id,
      workflowName: run.workflow_name
    }));
    return { runs: parsedRuns, total };
  }
  async getWorkflowRunById({
    runId,
    workflowName
  }) {
    this.logger.debug(`MockStore: getWorkflowRunById called for runId ${runId}`);
    let run = Object.values(this.data.mastra_workflow_snapshot || {}).find((r) => r.run_id === runId);
    if (run && workflowName && run.workflow_name !== workflowName) {
      run = void 0;
    }
    if (!run) return null;
    const parsedRun = {
      ...run,
      snapshot: typeof run.snapshot === "string" ? JSON.parse(run.snapshot) : run.snapshot,
      createdAt: new Date(run.createdAt),
      updatedAt: new Date(run.updatedAt),
      runId: run.run_id,
      workflowName: run.workflow_name
    };
    return parsedRun;
  }
  async getTracesPaginated({
    name,
    scope,
    attributes,
    page,
    perPage,
    fromDate,
    toDate
  }) {
    this.logger.debug(`MockStore: getTracesPaginated called`);
    let traces = Object.values(this.data.mastra_traces);
    if (name) traces = traces.filter((t) => t.name?.startsWith(name));
    if (scope) traces = traces.filter((t) => t.scope === scope);
    if (attributes) {
      traces = traces.filter(
        (t) => Object.entries(attributes).every(([key, value]) => t.attributes?.[key] === value)
      );
    }
    if (fromDate) traces = traces.filter((t) => new Date(t.createdAt) >= fromDate);
    if (toDate) traces = traces.filter((t) => new Date(t.createdAt) <= toDate);
    traces.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    const start = page * perPage;
    const end = start + perPage;
    return {
      traces: traces.slice(start, end),
      total: traces.length,
      page,
      perPage,
      hasMore: traces.length > end
    };
  }
  async getThreadsByResourceIdPaginated(args) {
    this.logger.debug(`MockStore: getThreadsByResourceIdPaginated called for ${args.resourceId}`);
    const threads = Object.values(this.data.mastra_threads).filter((t) => t.resourceId === args.resourceId);
    return {
      threads: threads.slice(args.page * args.perPage, (args.page + 1) * args.perPage),
      total: threads.length,
      page: args.page,
      perPage: args.perPage,
      hasMore: threads.length > (args.page + 1) * args.perPage
    };
  }
  async getMessagesPaginated({
    threadId,
    selectBy
  }) {
    this.logger.debug(`MockStore: getMessagesPaginated called for thread ${threadId}`);
    const { page = 0, perPage = 40 } = selectBy?.pagination || {};
    let messages = Object.values(this.data.mastra_messages).filter((msg) => msg.threadId === threadId);
    if (selectBy?.last) {
      messages = messages.slice(-selectBy.last);
    }
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const start = page * perPage;
    const end = start + perPage;
    return {
      messages: messages.slice(start, end),
      total: messages.length,
      page,
      perPage,
      hasMore: messages.length > end
    };
  }
};

Object.defineProperty(exports, "MastraStorage", {
  enumerable: true,
  get: function () { return chunkKKCGZKNC_cjs.MastraStorage; }
});
Object.defineProperty(exports, "TABLE_EVALS", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.TABLE_EVALS; }
});
Object.defineProperty(exports, "TABLE_MESSAGES", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.TABLE_MESSAGES; }
});
Object.defineProperty(exports, "TABLE_SCHEMAS", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.TABLE_SCHEMAS; }
});
Object.defineProperty(exports, "TABLE_THREADS", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.TABLE_THREADS; }
});
Object.defineProperty(exports, "TABLE_TRACES", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.TABLE_TRACES; }
});
Object.defineProperty(exports, "TABLE_WORKFLOW_SNAPSHOT", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.TABLE_WORKFLOW_SNAPSHOT; }
});
exports.MockStore = MockStore;
