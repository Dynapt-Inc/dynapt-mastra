import { MessageList } from '@mastra/core/agent';
import { MastraStorage, TABLE_MESSAGES, TABLE_WORKFLOW_SNAPSHOT, TABLE_EVALS, TABLE_TRACES, TABLE_THREADS } from '@mastra/core/storage';
import { Redis } from '@upstash/redis';
import { MastraVector } from '@mastra/core/vector';
import { Index } from '@upstash/vector';
import { BaseFilterTranslator } from '@mastra/core/vector/filter';

// src/storage/index.ts
var UpstashStore = class extends MastraStorage {
  redis;
  constructor(config) {
    super({ name: "Upstash" });
    this.redis = new Redis({
      url: config.url,
      token: config.token
    });
  }
  get supports() {
    return {
      selectByIncludeResourceScope: true
    };
  }
  transformEvalRecord(record) {
    let result = record.result;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result);
      } catch {
        console.warn("Failed to parse result JSON:");
      }
    }
    let testInfo = record.test_info;
    if (typeof testInfo === "string") {
      try {
        testInfo = JSON.parse(testInfo);
      } catch {
        console.warn("Failed to parse test_info JSON:");
      }
    }
    return {
      agentName: record.agent_name,
      input: record.input,
      output: record.output,
      result,
      metricName: record.metric_name,
      instructions: record.instructions,
      testInfo,
      globalRunId: record.global_run_id,
      runId: record.run_id,
      createdAt: typeof record.created_at === "string" ? record.created_at : record.created_at instanceof Date ? record.created_at.toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  parseJSON(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
  getKey(tableName, keys) {
    const keyParts = Object.entries(keys).filter(([_, value]) => value !== void 0).map(([key, value]) => `${key}:${value}`);
    return `${tableName}:${keyParts.join(":")}`;
  }
  /**
   * Scans for keys matching the given pattern using SCAN and returns them as an array.
   * @param pattern Redis key pattern, e.g. "table:*"
   * @param batchSize Number of keys to scan per batch (default: 1000)
   */
  async scanKeys(pattern, batchSize = 1e4) {
    let cursor = "0";
    let keys = [];
    do {
      const [nextCursor, batch] = await this.redis.scan(cursor, {
        match: pattern,
        count: batchSize
      });
      keys.push(...batch);
      cursor = nextCursor;
    } while (cursor !== "0");
    return keys;
  }
  /**
   * Deletes all keys matching the given pattern using SCAN and DEL in batches.
   * @param pattern Redis key pattern, e.g. "table:*"
   * @param batchSize Number of keys to delete per batch (default: 1000)
   */
  async scanAndDelete(pattern, batchSize = 1e4) {
    let cursor = "0";
    let totalDeleted = 0;
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, {
        match: pattern,
        count: batchSize
      });
      if (keys.length > 0) {
        await this.redis.del(...keys);
        totalDeleted += keys.length;
      }
      cursor = nextCursor;
    } while (cursor !== "0");
    return totalDeleted;
  }
  getMessageKey(threadId, messageId) {
    const key = this.getKey(TABLE_MESSAGES, { threadId, id: messageId });
    return key;
  }
  getThreadMessagesKey(threadId) {
    return `thread:${threadId}:messages`;
  }
  parseWorkflowRun(row) {
    let parsedSnapshot = row.snapshot;
    if (typeof parsedSnapshot === "string") {
      try {
        parsedSnapshot = JSON.parse(row.snapshot);
      } catch (e) {
        console.warn(`Failed to parse snapshot for workflow ${row.workflow_name}: ${e}`);
      }
    }
    return {
      workflowName: row.workflow_name,
      runId: row.run_id,
      snapshot: parsedSnapshot,
      createdAt: this.ensureDate(row.createdAt),
      updatedAt: this.ensureDate(row.updatedAt),
      resourceId: row.resourceId
    };
  }
  processRecord(tableName, record) {
    let key;
    if (tableName === TABLE_MESSAGES) {
      key = this.getKey(tableName, { threadId: record.threadId, id: record.id });
    } else if (tableName === TABLE_WORKFLOW_SNAPSHOT) {
      key = this.getKey(tableName, {
        namespace: record.namespace || "workflows",
        workflow_name: record.workflow_name,
        run_id: record.run_id,
        ...record.resourceId ? { resourceId: record.resourceId } : {}
      });
    } else if (tableName === TABLE_EVALS) {
      key = this.getKey(tableName, { id: record.run_id });
    } else {
      key = this.getKey(tableName, { id: record.id });
    }
    const processedRecord = {
      ...record,
      createdAt: this.serializeDate(record.createdAt),
      updatedAt: this.serializeDate(record.updatedAt)
    };
    return { key, processedRecord };
  }
  /**
   * @deprecated Use getEvals instead
   */
  async getEvalsByAgentName(agentName, type) {
    try {
      const pattern = `${TABLE_EVALS}:*`;
      const keys = await this.scanKeys(pattern);
      if (keys.length === 0) {
        return [];
      }
      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();
      const nonNullRecords = results.filter(
        (record) => record !== null && typeof record === "object" && "agent_name" in record && record.agent_name === agentName
      );
      let filteredEvals = nonNullRecords;
      if (type === "test") {
        filteredEvals = filteredEvals.filter((record) => {
          if (!record.test_info) return false;
          try {
            if (typeof record.test_info === "string") {
              const parsedTestInfo = JSON.parse(record.test_info);
              return parsedTestInfo && typeof parsedTestInfo === "object" && "testPath" in parsedTestInfo;
            }
            return typeof record.test_info === "object" && "testPath" in record.test_info;
          } catch {
            return false;
          }
        });
      } else if (type === "live") {
        filteredEvals = filteredEvals.filter((record) => {
          if (!record.test_info) return true;
          try {
            if (typeof record.test_info === "string") {
              const parsedTestInfo = JSON.parse(record.test_info);
              return !(parsedTestInfo && typeof parsedTestInfo === "object" && "testPath" in parsedTestInfo);
            }
            return !(typeof record.test_info === "object" && "testPath" in record.test_info);
          } catch {
            return true;
          }
        });
      }
      return filteredEvals.map((record) => this.transformEvalRecord(record));
    } catch (error) {
      console.error("Failed to get evals for the specified agent:", error);
      return [];
    }
  }
  /**
   * @deprecated use getTracesPaginated instead
   */
  async getTraces(args) {
    if (args.fromDate || args.toDate) {
      args.dateRange = {
        start: args.fromDate,
        end: args.toDate
      };
    }
    const { traces } = await this.getTracesPaginated(args);
    return traces;
  }
  async getTracesPaginated(args) {
    const { name, scope, page = 0, perPage = 100, attributes, filters, dateRange } = args;
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    try {
      const pattern = `${TABLE_TRACES}:*`;
      const keys = await this.scanKeys(pattern);
      if (keys.length === 0) {
        return {
          traces: [],
          total: 0,
          page,
          perPage: perPage || 100,
          hasMore: false
        };
      }
      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();
      let filteredTraces = results.filter(
        (record) => record !== null && typeof record === "object"
      );
      if (name) {
        filteredTraces = filteredTraces.filter((record) => record.name?.toLowerCase().startsWith(name.toLowerCase()));
      }
      if (scope) {
        filteredTraces = filteredTraces.filter((record) => record.scope === scope);
      }
      if (attributes) {
        filteredTraces = filteredTraces.filter((record) => {
          const recordAttributes = record.attributes;
          if (!recordAttributes) return false;
          const parsedAttributes = typeof recordAttributes === "string" ? JSON.parse(recordAttributes) : recordAttributes;
          return Object.entries(attributes).every(([key, value]) => parsedAttributes[key] === value);
        });
      }
      if (filters) {
        filteredTraces = filteredTraces.filter(
          (record) => Object.entries(filters).every(([key, value]) => record[key] === value)
        );
      }
      if (fromDate) {
        filteredTraces = filteredTraces.filter(
          (record) => new Date(record.createdAt).getTime() >= new Date(fromDate).getTime()
        );
      }
      if (toDate) {
        filteredTraces = filteredTraces.filter(
          (record) => new Date(record.createdAt).getTime() <= new Date(toDate).getTime()
        );
      }
      filteredTraces.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const transformedTraces = filteredTraces.map((record) => ({
        id: record.id,
        parentSpanId: record.parentSpanId,
        traceId: record.traceId,
        name: record.name,
        scope: record.scope,
        kind: record.kind,
        status: this.parseJSON(record.status),
        events: this.parseJSON(record.events),
        links: this.parseJSON(record.links),
        attributes: this.parseJSON(record.attributes),
        startTime: record.startTime,
        endTime: record.endTime,
        other: this.parseJSON(record.other),
        createdAt: this.ensureDate(record.createdAt)
      }));
      const total = transformedTraces.length;
      const resolvedPerPage = perPage || 100;
      const start = page * resolvedPerPage;
      const end = start + resolvedPerPage;
      const paginatedTraces = transformedTraces.slice(start, end);
      const hasMore = end < total;
      return {
        traces: paginatedTraces,
        total,
        page,
        perPage: resolvedPerPage,
        hasMore
      };
    } catch (error) {
      console.error("Failed to get traces:", error);
      return {
        traces: [],
        total: 0,
        page,
        perPage: perPage || 100,
        hasMore: false
      };
    }
  }
  async createTable({
    tableName,
    schema
  }) {
    await this.redis.set(`schema:${tableName}`, schema);
  }
  /**
   * No-op: This backend is schemaless and does not require schema changes.
   * @param tableName Name of the table
   * @param schema Schema of the table
   * @param ifNotExists Array of column names to add if they don't exist
   */
  async alterTable(_args) {
  }
  async clearTable({ tableName }) {
    const pattern = `${tableName}:*`;
    await this.scanAndDelete(pattern);
  }
  async insert({ tableName, record }) {
    const { key, processedRecord } = this.processRecord(tableName, record);
    await this.redis.set(key, processedRecord);
  }
  async batchInsert(input) {
    const { tableName, records } = input;
    if (!records.length) return;
    const batchSize = 1e3;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const pipeline = this.redis.pipeline();
      for (const record of batch) {
        const { key, processedRecord } = this.processRecord(tableName, record);
        pipeline.set(key, processedRecord);
      }
      await pipeline.exec();
    }
  }
  async load({ tableName, keys }) {
    const key = this.getKey(tableName, keys);
    const data = await this.redis.get(key);
    return data || null;
  }
  async getThreadById({ threadId }) {
    const thread = await this.load({
      tableName: TABLE_THREADS,
      keys: { id: threadId }
    });
    if (!thread) return null;
    return {
      ...thread,
      createdAt: this.ensureDate(thread.createdAt),
      updatedAt: this.ensureDate(thread.updatedAt),
      metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata
    };
  }
  /**
   * @deprecated use getThreadsByResourceIdPaginated instead
   */
  async getThreadsByResourceId({ resourceId }) {
    try {
      const pattern = `${TABLE_THREADS}:*`;
      const keys = await this.scanKeys(pattern);
      if (keys.length === 0) {
        return [];
      }
      const allThreads = [];
      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();
      for (let i = 0; i < results.length; i++) {
        const thread = results[i];
        if (thread && thread.resourceId === resourceId) {
          allThreads.push({
            ...thread,
            createdAt: this.ensureDate(thread.createdAt),
            updatedAt: this.ensureDate(thread.updatedAt),
            metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata
          });
        }
      }
      allThreads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return allThreads;
    } catch (error) {
      console.error("Error in getThreadsByResourceId:", error);
      return [];
    }
  }
  async getThreadsByResourceIdPaginated(args) {
    const { resourceId, page = 0, perPage = 100 } = args;
    try {
      const allThreads = await this.getThreadsByResourceId({ resourceId });
      const total = allThreads.length;
      const start = page * perPage;
      const end = start + perPage;
      const paginatedThreads = allThreads.slice(start, end);
      const hasMore = end < total;
      return {
        threads: paginatedThreads,
        total,
        page,
        perPage,
        hasMore
      };
    } catch (error) {
      console.error("Error in getThreadsByResourceIdPaginated:", error);
      return {
        threads: [],
        total: 0,
        page,
        perPage,
        hasMore: false
      };
    }
  }
  async saveThread({ thread }) {
    await this.insert({
      tableName: TABLE_THREADS,
      record: thread
    });
    return thread;
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    const thread = await this.getThreadById({ threadId: id });
    if (!thread) {
      throw new Error(`Thread ${id} not found`);
    }
    const updatedThread = {
      ...thread,
      title,
      metadata: {
        ...thread.metadata,
        ...metadata
      }
    };
    await this.saveThread({ thread: updatedThread });
    return updatedThread;
  }
  async deleteThread({ threadId }) {
    const threadKey = this.getKey(TABLE_THREADS, { id: threadId });
    const threadMessagesKey = this.getThreadMessagesKey(threadId);
    const messageIds = await this.redis.zrange(threadMessagesKey, 0, -1);
    const pipeline = this.redis.pipeline();
    pipeline.del(threadKey);
    pipeline.del(threadMessagesKey);
    for (let i = 0; i < messageIds.length; i++) {
      const messageId = messageIds[i];
      const messageKey = this.getMessageKey(threadId, messageId);
      pipeline.del(messageKey);
    }
    await pipeline.exec();
    await this.scanAndDelete(this.getMessageKey(threadId, "*"));
  }
  async saveMessages(args) {
    const { messages, format = "v1" } = args;
    if (messages.length === 0) return [];
    const threadId = messages[0]?.threadId;
    if (!threadId) {
      throw new Error("Thread ID is required");
    }
    const thread = await this.getThreadById({ threadId });
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }
    const messagesWithIndex = messages.map((message, index) => ({
      ...message,
      _index: index
    }));
    const threadKey = this.getKey(TABLE_THREADS, { id: threadId });
    const existingThread = await this.redis.get(threadKey);
    const batchSize = 1e3;
    for (let i = 0; i < messagesWithIndex.length; i += batchSize) {
      const batch = messagesWithIndex.slice(i, i + batchSize);
      const pipeline = this.redis.pipeline();
      for (const message of batch) {
        const key = this.getMessageKey(message.threadId, message.id);
        const createdAtScore = new Date(message.createdAt).getTime();
        const score = message._index !== void 0 ? message._index : createdAtScore;
        pipeline.set(key, message);
        pipeline.zadd(this.getThreadMessagesKey(message.threadId), {
          score,
          member: message.id
        });
      }
      if (i === 0 && existingThread) {
        const updatedThread = {
          ...existingThread,
          updatedAt: /* @__PURE__ */ new Date()
        };
        pipeline.set(threadKey, this.processRecord(TABLE_THREADS, updatedThread).processedRecord);
      }
      await pipeline.exec();
    }
    const list = new MessageList().add(messages, "memory");
    if (format === `v2`) return list.get.all.v2();
    return list.get.all.v1();
  }
  async _getIncludedMessages(threadId, selectBy) {
    const messageIds = /* @__PURE__ */ new Set();
    const messageIdToThreadIds = {};
    if (selectBy?.include?.length) {
      for (const item of selectBy.include) {
        messageIds.add(item.id);
        const itemThreadId = item.threadId || threadId;
        messageIdToThreadIds[item.id] = itemThreadId;
        const itemThreadMessagesKey = this.getThreadMessagesKey(itemThreadId);
        const rank = await this.redis.zrank(itemThreadMessagesKey, item.id);
        if (rank === null) continue;
        if (item.withPreviousMessages) {
          const start = Math.max(0, rank - item.withPreviousMessages);
          const prevIds = rank === 0 ? [] : await this.redis.zrange(itemThreadMessagesKey, start, rank - 1);
          prevIds.forEach((id) => {
            messageIds.add(id);
            messageIdToThreadIds[id] = itemThreadId;
          });
        }
        if (item.withNextMessages) {
          const nextIds = await this.redis.zrange(itemThreadMessagesKey, rank + 1, rank + item.withNextMessages);
          nextIds.forEach((id) => {
            messageIds.add(id);
            messageIdToThreadIds[id] = itemThreadId;
          });
        }
      }
      const pipeline = this.redis.pipeline();
      Array.from(messageIds).forEach((id) => {
        const tId = messageIdToThreadIds[id] || threadId;
        pipeline.get(this.getMessageKey(tId, id));
      });
      const results = await pipeline.exec();
      return results.filter((result) => result !== null);
    }
    return [];
  }
  async getMessages({
    threadId,
    selectBy,
    format
  }) {
    const threadMessagesKey = this.getThreadMessagesKey(threadId);
    const allMessageIds = await this.redis.zrange(threadMessagesKey, 0, -1);
    let limit;
    if (typeof selectBy?.last === "number") {
      limit = Math.max(0, selectBy.last);
    } else if (selectBy?.last === false) {
      limit = 0;
    } else {
      limit = Number.MAX_SAFE_INTEGER;
    }
    const messageIds = /* @__PURE__ */ new Set();
    const messageIdToThreadIds = {};
    if (limit === 0 && !selectBy?.include) {
      return [];
    }
    if (limit === Number.MAX_SAFE_INTEGER) {
      const allIds = await this.redis.zrange(threadMessagesKey, 0, -1);
      allIds.forEach((id) => {
        messageIds.add(id);
        messageIdToThreadIds[id] = threadId;
      });
    } else if (limit > 0) {
      const latestIds = await this.redis.zrange(threadMessagesKey, -limit, -1);
      latestIds.forEach((id) => {
        messageIds.add(id);
        messageIdToThreadIds[id] = threadId;
      });
    }
    const includedMessages = await this._getIncludedMessages(threadId, selectBy);
    const messages = [
      ...includedMessages,
      ...(await Promise.all(
        Array.from(messageIds).map(async (id) => {
          const tId = messageIdToThreadIds[id] || threadId;
          const byThreadId = await this.redis.get(this.getMessageKey(tId, id));
          if (byThreadId) return byThreadId;
          return null;
        })
      )).filter((msg) => msg !== null)
    ];
    messages.sort((a, b) => allMessageIds.indexOf(a.id) - allMessageIds.indexOf(b.id));
    const seen = /* @__PURE__ */ new Set();
    const dedupedMessages = messages.filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
    const prepared = dedupedMessages.filter((message) => message !== null && message !== void 0).map((message) => {
      const { _index, ...messageWithoutIndex } = message;
      return messageWithoutIndex;
    });
    if (format === "v2") {
      return prepared.map((msg) => ({
        ...msg,
        content: msg.content || { format: 2, parts: [{ type: "text", text: "" }] }
      }));
    }
    return prepared;
  }
  async getMessagesPaginated(args) {
    const { threadId, selectBy, format } = args;
    const { page = 0, perPage = 40, dateRange } = selectBy?.pagination || {};
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const threadMessagesKey = this.getThreadMessagesKey(threadId);
    const messages = [];
    const includedMessages = await this._getIncludedMessages(threadId, selectBy);
    messages.push(...includedMessages);
    try {
      const allMessageIds = await this.redis.zrange(threadMessagesKey, 0, -1);
      if (allMessageIds.length === 0) {
        return {
          messages: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const pipeline = this.redis.pipeline();
      allMessageIds.forEach((id) => pipeline.get(this.getMessageKey(threadId, id)));
      const results = await pipeline.exec();
      let messagesData = results.filter((msg) => msg !== null);
      if (fromDate) {
        messagesData = messagesData.filter((msg) => msg && new Date(msg.createdAt).getTime() >= fromDate.getTime());
      }
      if (toDate) {
        messagesData = messagesData.filter((msg) => msg && new Date(msg.createdAt).getTime() <= toDate.getTime());
      }
      messagesData.sort((a, b) => allMessageIds.indexOf(a.id) - allMessageIds.indexOf(b.id));
      const total = messagesData.length;
      const start = page * perPage;
      const end = start + perPage;
      const hasMore = end < total;
      const paginatedMessages = messagesData.slice(start, end);
      messages.push(...paginatedMessages);
      const list = new MessageList().add(messages, "memory");
      const finalMessages = format === `v2` ? list.get.all.v2() : list.get.all.v1();
      return {
        messages: finalMessages,
        total,
        page,
        perPage,
        hasMore
      };
    } catch (error) {
      console.error("Failed to get paginated messages:", error);
      return {
        messages: [],
        total: 0,
        page,
        perPage,
        hasMore: false
      };
    }
  }
  async persistWorkflowSnapshot(params) {
    const { namespace = "workflows", workflowName, runId, snapshot } = params;
    await this.insert({
      tableName: TABLE_WORKFLOW_SNAPSHOT,
      record: {
        namespace,
        workflow_name: workflowName,
        run_id: runId,
        snapshot,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    });
  }
  async loadWorkflowSnapshot(params) {
    const { namespace = "workflows", workflowName, runId } = params;
    const key = this.getKey(TABLE_WORKFLOW_SNAPSHOT, {
      namespace,
      workflow_name: workflowName,
      run_id: runId
    });
    const data = await this.redis.get(key);
    if (!data) return null;
    return data.snapshot;
  }
  /**
   * Get all evaluations with pagination and total count
   * @param options Pagination and filtering options
   * @returns Object with evals array and total count
   */
  async getEvals(options) {
    try {
      const { agentName, type, page = 0, perPage = 100, dateRange } = options || {};
      const fromDate = dateRange?.start;
      const toDate = dateRange?.end;
      const pattern = `${TABLE_EVALS}:*`;
      const keys = await this.scanKeys(pattern);
      if (keys.length === 0) {
        return {
          evals: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();
      let filteredEvals = results.map((result) => result).filter((record) => record !== null && typeof record === "object");
      if (agentName) {
        filteredEvals = filteredEvals.filter((record) => record.agent_name === agentName);
      }
      if (type === "test") {
        filteredEvals = filteredEvals.filter((record) => {
          if (!record.test_info) return false;
          try {
            if (typeof record.test_info === "string") {
              const parsedTestInfo = JSON.parse(record.test_info);
              return parsedTestInfo && typeof parsedTestInfo === "object" && "testPath" in parsedTestInfo;
            }
            return typeof record.test_info === "object" && "testPath" in record.test_info;
          } catch {
            return false;
          }
        });
      } else if (type === "live") {
        filteredEvals = filteredEvals.filter((record) => {
          if (!record.test_info) return true;
          try {
            if (typeof record.test_info === "string") {
              const parsedTestInfo = JSON.parse(record.test_info);
              return !(parsedTestInfo && typeof parsedTestInfo === "object" && "testPath" in parsedTestInfo);
            }
            return !(typeof record.test_info === "object" && "testPath" in record.test_info);
          } catch {
            return true;
          }
        });
      }
      if (fromDate) {
        filteredEvals = filteredEvals.filter((record) => {
          const createdAt = new Date(record.created_at || record.createdAt || 0);
          return createdAt.getTime() >= fromDate.getTime();
        });
      }
      if (toDate) {
        filteredEvals = filteredEvals.filter((record) => {
          const createdAt = new Date(record.created_at || record.createdAt || 0);
          return createdAt.getTime() <= toDate.getTime();
        });
      }
      filteredEvals.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      const total = filteredEvals.length;
      const start = page * perPage;
      const end = start + perPage;
      const paginatedEvals = filteredEvals.slice(start, end);
      const hasMore = end < total;
      const evals = paginatedEvals.map((record) => this.transformEvalRecord(record));
      return {
        evals,
        total,
        page,
        perPage,
        hasMore
      };
    } catch (error) {
      const { page = 0, perPage = 100 } = options || {};
      console.error("Failed to get evals:", error);
      return {
        evals: [],
        total: 0,
        page,
        perPage,
        hasMore: false
      };
    }
  }
  async getWorkflowRuns({
    namespace,
    workflowName,
    fromDate,
    toDate,
    limit,
    offset,
    resourceId
  } = { namespace: "workflows" }) {
    try {
      let pattern = this.getKey(TABLE_WORKFLOW_SNAPSHOT, { namespace }) + ":*";
      if (workflowName && resourceId) {
        pattern = this.getKey(TABLE_WORKFLOW_SNAPSHOT, {
          namespace,
          workflow_name: workflowName,
          run_id: "*",
          resourceId
        });
      } else if (workflowName) {
        pattern = this.getKey(TABLE_WORKFLOW_SNAPSHOT, { namespace, workflow_name: workflowName }) + ":*";
      } else if (resourceId) {
        pattern = this.getKey(TABLE_WORKFLOW_SNAPSHOT, { namespace, workflow_name: "*", run_id: "*", resourceId });
      }
      const keys = await this.scanKeys(pattern);
      if (keys.length === 0) {
        return { runs: [], total: 0 };
      }
      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();
      let runs = results.map((result) => result).filter(
        (record) => record !== null && record !== void 0 && typeof record === "object" && "workflow_name" in record
      ).filter((record) => !workflowName || record.workflow_name === workflowName).map((w) => this.parseWorkflowRun(w)).filter((w) => {
        if (fromDate && w.createdAt < fromDate) return false;
        if (toDate && w.createdAt > toDate) return false;
        return true;
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const total = runs.length;
      if (limit !== void 0 && offset !== void 0) {
        runs = runs.slice(offset, offset + limit);
      }
      return { runs, total };
    } catch (error) {
      console.error("Error getting workflow runs:", error);
      throw error;
    }
  }
  async getWorkflowRunById({
    namespace = "workflows",
    runId,
    workflowName
  }) {
    try {
      const key = this.getKey(TABLE_WORKFLOW_SNAPSHOT, { namespace, workflow_name: workflowName, run_id: runId }) + "*";
      const keys = await this.scanKeys(key);
      const workflows = await Promise.all(
        keys.map(async (key2) => {
          const data2 = await this.redis.get(key2);
          return data2;
        })
      );
      const data = workflows.find((w) => w?.run_id === runId && w?.workflow_name === workflowName);
      if (!data) return null;
      return this.parseWorkflowRun(data);
    } catch (error) {
      console.error("Error getting workflow run by ID:", error);
      throw error;
    }
  }
  async close() {
  }
  async updateMessages(_args) {
    this.logger.error("updateMessages is not yet implemented in UpstashStore");
    throw new Error("Method not implemented");
  }
};
var UpstashFilterTranslator = class extends BaseFilterTranslator {
  getSupportedOperators() {
    return {
      ...BaseFilterTranslator.DEFAULT_OPERATORS,
      array: ["$in", "$nin", "$all"],
      regex: ["$regex"],
      custom: ["$contains"]
    };
  }
  translate(filter) {
    if (this.isEmpty(filter)) return void 0;
    this.validateFilter(filter);
    return this.translateNode(filter);
  }
  translateNode(node, path = "") {
    if (this.isRegex(node)) {
      throw new Error("Direct regex pattern format is not supported in Upstash");
    }
    if (node === null || node === void 0) {
      throw new Error("Filtering for null/undefined values is not supported by Upstash Vector");
    }
    if (this.isPrimitive(node)) {
      if (node === null || node === void 0) {
        throw new Error("Filtering for null/undefined values is not supported by Upstash Vector");
      }
      return this.formatComparison(path, "=", node);
    }
    if (Array.isArray(node)) {
      if (node.length === 0) {
        return "(HAS FIELD empty AND HAS NOT FIELD empty)";
      }
      return `${path} IN (${this.formatArray(node)})`;
    }
    const entries = Object.entries(node);
    const conditions = [];
    for (const [key, value] of entries) {
      const newPath = path ? `${path}.${key}` : key;
      if (this.isOperator(key)) {
        conditions.push(this.translateOperator(key, value, path));
      } else if (typeof value === "object" && value !== null) {
        conditions.push(this.translateNode(value, newPath));
      } else if (value === null || value === void 0) {
        throw new Error("Filtering for null/undefined values is not supported by Upstash Vector");
      } else {
        conditions.push(this.formatComparison(newPath, "=", value));
      }
    }
    return conditions.length > 1 ? `(${conditions.join(" AND ")})` : conditions[0] ?? "";
  }
  COMPARISON_OPS = {
    $eq: "=",
    $ne: "!=",
    $gt: ">",
    $gte: ">=",
    $lt: "<",
    $lte: "<="
  };
  translateOperator(operator, value, path) {
    if (this.isBasicOperator(operator) || this.isNumericOperator(operator)) {
      return this.formatComparison(path, this.COMPARISON_OPS[operator], value);
    }
    switch (operator) {
      case "$in":
        if (!Array.isArray(value) || value.length === 0) {
          return "(HAS FIELD empty AND HAS NOT FIELD empty)";
        }
        return `${path} IN (${this.formatArray(value)})`;
      case "$nin":
        return `${path} NOT IN (${this.formatArray(value)})`;
      case "$contains":
        return `${path} CONTAINS ${this.formatValue(value)}`;
      case "$regex":
        return `${path} GLOB ${this.formatValue(value)}`;
      case "$exists":
        return value ? `HAS FIELD ${path}` : `HAS NOT FIELD ${path}`;
      case "$and":
        if (!Array.isArray(value) || value.length === 0) {
          return "(HAS FIELD empty OR HAS NOT FIELD empty)";
        }
        return this.joinConditions(value, "AND");
      case "$or":
        if (!Array.isArray(value) || value.length === 0) {
          return "(HAS FIELD empty AND HAS NOT FIELD empty)";
        }
        return this.joinConditions(value, "OR");
      case "$not":
        return this.formatNot(path, value);
      case "$nor":
        return this.formatNot("", { $or: value });
      case "$all":
        return this.translateOperator(
          "$and",
          value.map((item) => ({ [path]: { $contains: item } })),
          ""
        );
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
  NEGATED_OPERATORS = {
    $eq: "$ne",
    $ne: "$eq",
    $gt: "$lte",
    $gte: "$lt",
    $lt: "$gte",
    $lte: "$gt",
    $in: "$nin",
    $nin: "$in",
    $exists: "$exists"
    // Special case - we'll flip the value
  };
  formatNot(path, value) {
    if (typeof value !== "object") {
      return `${path} != ${this.formatValue(value)}`;
    }
    if (!Object.keys(value).some((k) => k.startsWith("$"))) {
      const [fieldName, fieldValue] = Object.entries(value)[0] ?? [];
      if (typeof fieldValue === "object" && fieldValue !== null && Object.keys(fieldValue)[0]?.startsWith("$")) {
        const [op2, val2] = Object.entries(fieldValue)[0] ?? [];
        const negatedOp = this.NEGATED_OPERATORS[op2];
        if (!negatedOp) throw new Error(`Unsupported operator in NOT: ${op2}`);
        if (op2 === "$exists") {
          return this.translateOperator(op2, !val2, fieldName ?? "");
        }
        return this.translateOperator(negatedOp, val2, fieldName ?? "");
      }
      return `${fieldName} != ${this.formatValue(fieldValue)}`;
    }
    const [op, val] = Object.entries(value)[0] ?? [];
    if (op === "$lt") return `${path} >= ${this.formatValue(val)}`;
    if (op === "$lte") return `${path} > ${this.formatValue(val)}`;
    if (op === "$gt") return `${path} <= ${this.formatValue(val)}`;
    if (op === "$gte") return `${path} < ${this.formatValue(val)}`;
    if (op === "$ne") return `${path} = ${this.formatValue(val)}`;
    if (op === "$eq") return `${path} != ${this.formatValue(val)}`;
    if (op === "$contains") return `${path} NOT CONTAINS ${this.formatValue(val)}`;
    if (op === "$regex") return `${path} NOT GLOB ${this.formatValue(val)}`;
    if (op === "$in") return `${path} NOT IN (${this.formatArray(val)})`;
    if (op === "$exists") return val ? `HAS NOT FIELD ${path}` : `HAS FIELD ${path}`;
    if (op === "$and" || op === "$or") {
      const newOp = op === "$and" ? "$or" : "$and";
      const conditions = val.map((condition) => {
        const [fieldName, fieldValue] = Object.entries(condition)[0] ?? [];
        return { [fieldName]: { $not: fieldValue } };
      });
      return this.translateOperator(newOp, conditions, "");
    }
    if (op === "$nor") {
      return this.translateOperator("$or", val, "");
    }
    return `${path} != ${this.formatValue(val)}`;
  }
  formatValue(value) {
    if (value === null || value === void 0) {
      throw new Error("Filtering for null/undefined values is not supported by Upstash Vector");
    }
    if (typeof value === "string") {
      const hasSingleQuote = /'/g.test(value);
      const hasDoubleQuote = /"/g.test(value);
      if (hasSingleQuote && hasDoubleQuote) {
        return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
      }
      if (hasSingleQuote) {
        return `"${value}"`;
      }
      return `'${value}'`;
    }
    if (typeof value === "number") {
      if (Math.abs(value) < 1e-6 || Math.abs(value) > 1e6) {
        return value.toFixed(20).replace(/\.?0+$/, "");
      }
      return value.toString();
    }
    return String(value);
  }
  formatArray(values) {
    return values.map((value) => {
      if (value === null || value === void 0) {
        throw new Error("Filtering for null/undefined values is not supported by Upstash Vector");
      }
      return this.formatValue(value);
    }).join(", ");
  }
  formatComparison(path, op, value) {
    return `${path} ${op} ${this.formatValue(value)}`;
  }
  joinConditions(conditions, operator) {
    const translated = Array.isArray(conditions) ? conditions.map((c) => this.translateNode(c)) : [this.translateNode(conditions)];
    return `(${translated.join(` ${operator} `)})`;
  }
};

// src/vector/index.ts
var UpstashVector = class extends MastraVector {
  client;
  /**
   * Creates a new UpstashVector instance.
   * @param {object} params - The parameters for the UpstashVector.
   * @param {string} params.url - The URL of the Upstash vector index.
   * @param {string} params.token - The token for the Upstash vector index.
   */
  constructor({ url, token }) {
    super();
    this.client = new Index({
      url,
      token
    });
  }
  /**
   * Upserts vectors into the index.
   * @param {UpsertVectorParams} params - The parameters for the upsert operation.
   * @returns {Promise<string[]>} A promise that resolves to the IDs of the upserted vectors.
   */
  async upsert({ indexName: namespace, vectors, metadata, ids }) {
    const generatedIds = ids || vectors.map(() => crypto.randomUUID());
    const points = vectors.map((vector, index) => ({
      id: generatedIds[index],
      vector,
      metadata: metadata?.[index]
    }));
    await this.client.upsert(points, {
      namespace
    });
    return generatedIds;
  }
  /**
   * Transforms a Mastra vector filter into an Upstash-compatible filter string.
   * @param {VectorFilter} [filter] - The filter to transform.
   * @returns {string | undefined} The transformed filter string, or undefined if no filter is provided.
   */
  transformFilter(filter) {
    const translator = new UpstashFilterTranslator();
    return translator.translate(filter);
  }
  /**
   * Creates a new index. For Upstash, this is a no-op as indexes (known as namespaces in Upstash) are created on-the-fly.
   * @param {CreateIndexParams} _params - The parameters for creating the index (ignored).
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async createIndex(_params) {
    this.logger.debug("No need to call createIndex for Upstash");
  }
  /**
   * Queries the vector index.
   * @param {QueryVectorParams} params - The parameters for the query operation. indexName is the namespace in Upstash.
   * @returns {Promise<QueryResult[]>} A promise that resolves to the query results.
   */
  async query({
    indexName: namespace,
    queryVector,
    topK = 10,
    filter,
    includeVector = false
  }) {
    const ns = this.client.namespace(namespace);
    const filterString = this.transformFilter(filter);
    const results = await ns.query({
      topK,
      vector: queryVector,
      includeVectors: includeVector,
      includeMetadata: true,
      ...filterString ? { filter: filterString } : {}
    });
    return (results || []).map((result) => ({
      id: `${result.id}`,
      score: result.score,
      metadata: result.metadata,
      ...includeVector && { vector: result.vector || [] }
    }));
  }
  /**
   * Lists all namespaces in the Upstash vector index, which correspond to indexes.
   * @returns {Promise<string[]>} A promise that resolves to a list of index names.
   */
  async listIndexes() {
    const indexes = await this.client.listNamespaces();
    return indexes.filter(Boolean);
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the namespace to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName: namespace }) {
    const info = await this.client.info();
    return {
      dimension: info.dimension,
      count: info.namespaces?.[namespace]?.vectorCount || 0,
      metric: info?.similarityFunction?.toLowerCase()
    };
  }
  /**
   * Deletes an index (namespace).
   * @param {DeleteIndexParams} params - The parameters for the delete operation.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteIndex({ indexName: namespace }) {
    try {
      await this.client.deleteNamespace(namespace);
    } catch (error) {
      this.logger.error("Failed to delete namespace:", error);
    }
  }
  /**
   * Updates a vector by its ID with the provided vector and/or metadata.
   * @param indexName - The name of the namespace containing the vector.
   * @param id - The ID of the vector to update.
   * @param update - An object containing the vector and/or metadata to update.
   * @param update.vector - An optional array of numbers representing the new vector.
   * @param update.metadata - An optional record containing the new metadata.
   * @returns A promise that resolves when the update is complete.
   * @throws Will throw an error if no updates are provided or if the update operation fails.
   */
  async updateVector({ indexName: namespace, id, update }) {
    try {
      if (!update.vector && !update.metadata) {
        throw new Error("No update data provided");
      }
      if (!update.vector && update.metadata) {
        throw new Error("Both vector and metadata must be provided for an update");
      }
      const updatePayload = { id };
      if (update.vector) {
        updatePayload.vector = update.vector;
      }
      if (update.metadata) {
        updatePayload.metadata = update.metadata;
      }
      const points = {
        id: updatePayload.id,
        vector: updatePayload.vector,
        metadata: updatePayload.metadata
      };
      await this.client.upsert(points, {
        namespace
      });
    } catch (error) {
      throw new Error(`Failed to update vector by id: ${id} for index name: ${namespace}: ${error.message}`);
    }
  }
  /**
   * Deletes a vector by its ID.
   * @param indexName - The name of the namespace containing the vector.
   * @param id - The ID of the vector to delete.
   * @returns A promise that resolves when the deletion is complete.
   * @throws Will throw an error if the deletion operation fails.
   */
  async deleteVector({ indexName: namespace, id }) {
    try {
      await this.client.delete(id, {
        namespace
      });
    } catch (error) {
      this.logger.error(`Failed to delete vector by id: ${id} for namespace: ${namespace}:`, error);
    }
  }
};

// src/vector/prompt.ts
var UPSTASH_PROMPT = `When querying Upstash Vector, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }

Logical Operators:
- $and: Logical AND (can be implicit or explicit)
  Implicit Example: { "price": { "$gt": 100 }, "category": "electronics" }
  Explicit Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }

Restrictions:
- Regex patterns are not supported
- Only $and and $or logical operators are supported at the top level
- Empty arrays in $in/$nin will return no results
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
- At least one key-value pair is required in filter object
- Empty objects and undefined values are treated as no filter
- Invalid types in comparison operators will throw errors
- All non-logical operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- Logical operators ($and, $or):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }

Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics", "computers"] } },
    { "price": { "$gte": 100, "$lte": 1000 } },
    { "rating": { "$exists": true, "$gt": 4 } },
    { "$or": [
      { "stock": { "$gt": 0 } },
      { "preorder": true }
    ]}
  ]
}`;

export { UPSTASH_PROMPT, UpstashStore, UpstashVector };
