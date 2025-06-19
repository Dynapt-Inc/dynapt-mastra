'use strict';

var chunkL5FURQXC_cjs = require('./chunk-L5FURQXC.cjs');
var chunkP3Q73CAW_cjs = require('./chunk-P3Q73CAW.cjs');

// src/storage/base.ts
var MastraStorage = class extends chunkP3Q73CAW_cjs.MastraBase {
  /** @deprecated import from { TABLE_WORKFLOW_SNAPSHOT } '@mastra/core/storage' instead */
  static TABLE_WORKFLOW_SNAPSHOT = chunkL5FURQXC_cjs.TABLE_WORKFLOW_SNAPSHOT;
  /** @deprecated import from { TABLE_EVALS } '@mastra/core/storage' instead */
  static TABLE_EVALS = chunkL5FURQXC_cjs.TABLE_EVALS;
  /** @deprecated import from { TABLE_MESSAGES } '@mastra/core/storage' instead */
  static TABLE_MESSAGES = chunkL5FURQXC_cjs.TABLE_MESSAGES;
  /** @deprecated import from { TABLE_THREADS } '@mastra/core/storage' instead */
  static TABLE_THREADS = chunkL5FURQXC_cjs.TABLE_THREADS;
  /** @deprecated import { TABLE_TRACES } from '@mastra/core/storage' instead */
  static TABLE_TRACES = chunkL5FURQXC_cjs.TABLE_TRACES;
  hasInitialized = null;
  shouldCacheInit = true;
  constructor({ name }) {
    super({
      component: "STORAGE",
      name
    });
  }
  get supports() {
    return {
      selectByIncludeResourceScope: false
    };
  }
  ensureDate(date) {
    if (!date) return void 0;
    return date instanceof Date ? date : new Date(date);
  }
  serializeDate(date) {
    if (!date) return void 0;
    const dateObj = this.ensureDate(date);
    return dateObj?.toISOString();
  }
  getSqlType(type) {
    switch (type) {
      case "text":
        return "TEXT";
      case "timestamp":
        return "TIMESTAMP";
      case "integer":
        return "INTEGER";
      case "bigint":
        return "BIGINT";
      case "jsonb":
        return "JSONB";
      default:
        return "TEXT";
    }
  }
  getDefaultValue(type) {
    switch (type) {
      case "text":
      case "uuid":
        return "DEFAULT ''";
      case "timestamp":
        return "DEFAULT '1970-01-01 00:00:00'";
      case "integer":
      case "bigint":
        return "DEFAULT 0";
      case "jsonb":
        return "DEFAULT '{}'";
      default:
        return "DEFAULT ''";
    }
  }
  batchTraceInsert({ records }) {
    return this.batchInsert({ tableName: chunkL5FURQXC_cjs.TABLE_TRACES, records });
  }
  async init() {
    if (this.shouldCacheInit && await this.hasInitialized) {
      return;
    }
    this.hasInitialized = Promise.all([
      this.createTable({
        tableName: chunkL5FURQXC_cjs.TABLE_WORKFLOW_SNAPSHOT,
        schema: chunkL5FURQXC_cjs.TABLE_SCHEMAS[chunkL5FURQXC_cjs.TABLE_WORKFLOW_SNAPSHOT]
      }),
      this.createTable({
        tableName: chunkL5FURQXC_cjs.TABLE_EVALS,
        schema: chunkL5FURQXC_cjs.TABLE_SCHEMAS[chunkL5FURQXC_cjs.TABLE_EVALS]
      }),
      this.createTable({
        tableName: chunkL5FURQXC_cjs.TABLE_THREADS,
        schema: chunkL5FURQXC_cjs.TABLE_SCHEMAS[chunkL5FURQXC_cjs.TABLE_THREADS]
      }),
      this.createTable({
        tableName: chunkL5FURQXC_cjs.TABLE_MESSAGES,
        schema: chunkL5FURQXC_cjs.TABLE_SCHEMAS[chunkL5FURQXC_cjs.TABLE_MESSAGES]
      }),
      this.createTable({
        tableName: chunkL5FURQXC_cjs.TABLE_TRACES,
        schema: chunkL5FURQXC_cjs.TABLE_SCHEMAS[chunkL5FURQXC_cjs.TABLE_TRACES]
      })
    ]).then(() => true);
    await this.hasInitialized;
    await this?.alterTable?.({
      tableName: chunkL5FURQXC_cjs.TABLE_MESSAGES,
      schema: chunkL5FURQXC_cjs.TABLE_SCHEMAS[chunkL5FURQXC_cjs.TABLE_MESSAGES],
      ifNotExists: ["resourceId"]
    });
  }
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    await this.init();
    const data = {
      workflow_name: workflowName,
      run_id: runId,
      snapshot,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.logger.debug("Persisting workflow snapshot", { workflowName, runId, data });
    await this.insert({
      tableName: chunkL5FURQXC_cjs.TABLE_WORKFLOW_SNAPSHOT,
      record: data
    });
  }
  async loadWorkflowSnapshot({
    workflowName,
    runId
  }) {
    if (!this.hasInitialized) {
      await this.init();
    }
    this.logger.debug("Loading workflow snapshot", { workflowName, runId });
    const d = await this.load({
      tableName: chunkL5FURQXC_cjs.TABLE_WORKFLOW_SNAPSHOT,
      keys: { workflow_name: workflowName, run_id: runId }
    });
    return d ? d.snapshot : null;
  }
};

exports.MastraStorage = MastraStorage;
