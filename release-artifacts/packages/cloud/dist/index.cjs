'use strict';

var core = require('@opentelemetry/core');
var otlpTransformer = require('@opentelemetry/otlp-transformer');

// src/telemetry/index.ts

// src/utils/fetchWithRetry.ts
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let retryCount = 0;
  let lastError = null;
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status} ${response.statusText}`);
      }
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retryCount++;
      if (retryCount >= maxRetries) {
        break;
      }
      const delay = Math.min(1e3 * Math.pow(2, retryCount) * 1e3, 1e4);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError || new Error("Request failed after multiple retry attempts");
}

// src/telemetry/index.ts
var MastraCloudExporter = class {
  queue = [];
  serializer;
  activeFlush = void 0;
  accessToken;
  endpoint;
  logger;
  constructor({ accessToken, endpoint, logger } = {}) {
    if (!accessToken && !process.env.MASTRA_CLOUD_ACCESS_TOKEN) {
      throw new Error("Mastra Cloud Access Token is required");
    }
    if (!endpoint && !process.env.MASTRA_CLOUD_ENDPOINT) {
      throw new Error("Mastra Cloud Endpoint is required");
    }
    this.accessToken = accessToken ?? process.env.MASTRA_CLOUD_ACCESS_TOKEN;
    this.endpoint = endpoint ?? process.env.MASTRA_CLOUD_ENDPOINT;
    this.serializer = otlpTransformer.JsonTraceSerializer;
    if (logger) {
      this.logger = logger;
    }
  }
  export(internalRepresentation, resultCallback) {
    const serializedRequest = this.serializer.serializeRequest(internalRepresentation);
    const payload = JSON.parse(Buffer.from(serializedRequest.buffer, "utf8"));
    const items = payload?.resourceSpans?.[0]?.scopeSpans;
    this.logger?.debug(`Exporting telemetry: ${items.length} scope spans to be processed [trace batch]`);
    this.queue.push({ data: items, resultCallback });
    if (!this.activeFlush) {
      this.activeFlush = this.flush();
    }
  }
  shutdown() {
    return this.forceFlush();
  }
  async batchInsert({ records }) {
    const url = this.endpoint;
    if (!url) {
      this.logger?.error("Mastra Cloud telemetry endpoint is not defined");
      return;
    }
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json"
    };
    const options = {
      method: "POST",
      headers,
      body: JSON.stringify({ records })
    };
    fetchWithRetry(url, options, 3).catch((error) => {
      this.logger?.error(`Telemetry batch upload failed: ${error.message}`);
    });
  }
  flush() {
    const items = this.queue.shift();
    if (!items) return Promise.resolve();
    return this.batchInsert({
      records: items.data
    }).then(() => {
      items.resultCallback({
        code: core.ExportResultCode.SUCCESS
      });
    }).catch((e) => {
      this.logger?.error("span err:" + e?.message);
      items.resultCallback({
        code: core.ExportResultCode.FAILED,
        error: e
      });
    }).finally(() => {
      this.activeFlush = void 0;
    });
  }
  async forceFlush() {
    if (!this.queue.length) {
      return;
    }
    await this.activeFlush;
    while (this.queue.length) {
      await this.flush();
    }
  }
  __setLogger(logger) {
    this.logger = logger;
  }
};

exports.MastraCloudExporter = MastraCloudExporter;
