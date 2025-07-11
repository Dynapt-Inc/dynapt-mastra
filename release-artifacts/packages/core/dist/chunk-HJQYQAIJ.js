import { isVercelTool } from './chunk-C4LMN2IR.js';
import { MastraError } from './chunk-4MPQAHTP.js';
import { MastraBase } from './chunk-5IEKR756.js';
import { RuntimeContext } from './chunk-SGGPJWRQ.js';
import { createHash } from 'crypto';
import jsonSchemaToZod from 'json-schema-to-zod';
import { z } from 'zod';
import { convertZodSchemaToAISDKSchema, OpenAIReasoningSchemaCompatLayer, OpenAISchemaCompatLayer, GoogleSchemaCompatLayer, AnthropicSchemaCompatLayer, DeepSeekSchemaCompatLayer, MetaSchemaCompatLayer, applyCompatLayer } from '@mastra/schema-compat';

var CoreToolBuilder = class extends MastraBase {
  originalTool;
  options;
  logType;
  constructor(input) {
    super({ name: "CoreToolBuilder" });
    this.originalTool = input.originalTool;
    this.options = input.options;
    this.logType = input.logType;
  }
  // Helper to get parameters based on tool type
  getParameters = () => {
    if (isVercelTool(this.originalTool)) {
      return this.originalTool.parameters ?? z.object({});
    }
    return this.originalTool.inputSchema ?? z.object({});
  };
  // For provider-defined tools, we need to include all required properties
  buildProviderTool(tool) {
    if ("type" in tool && tool.type === "provider-defined" && "id" in tool && typeof tool.id === "string" && tool.id.includes(".")) {
      return {
        type: "provider-defined",
        id: tool.id,
        args: "args" in this.originalTool ? this.originalTool.args : {},
        description: tool.description,
        parameters: convertZodSchemaToAISDKSchema(this.getParameters()),
        execute: this.originalTool.execute ? this.createExecute(
          this.originalTool,
          { ...this.options, description: this.originalTool.description },
          this.logType
        ) : void 0
      };
    }
    return void 0;
  }
  createLogMessageOptions({ agentName, toolName, type }) {
    if (!agentName) {
      return {
        start: `Executing tool ${toolName}`,
        error: `Failed tool execution`
      };
    }
    const prefix = `[Agent:${agentName}]`;
    const toolType = type === "toolset" ? "toolset" : "tool";
    return {
      start: `${prefix} - Executing ${toolType} ${toolName}`,
      error: `${prefix} - Failed ${toolType} execution`
    };
  }
  createExecute(tool, options, logType) {
    const { logger, mastra: _mastra, memory: _memory, runtimeContext, ...rest } = options;
    const { start, error } = this.createLogMessageOptions({
      agentName: options.agentName,
      toolName: options.name,
      type: logType
    });
    const execFunction = async (args, execOptions) => {
      if (isVercelTool(tool)) {
        return tool?.execute?.(args, execOptions) ?? void 0;
      }
      return tool?.execute?.(
        {
          context: args,
          threadId: options.threadId,
          resourceId: options.resourceId,
          mastra: options.mastra,
          memory: options.memory,
          runId: options.runId,
          runtimeContext: options.runtimeContext ?? new RuntimeContext()
        },
        execOptions
      ) ?? void 0;
    };
    return async (args, execOptions) => {
      let logger2 = options.logger || this.logger;
      try {
        logger2.debug(start, { ...rest, args });
        return await execFunction(args, execOptions);
      } catch (err) {
        const mastraError = new MastraError(
          {
            id: "TOOL_EXECUTION_FAILED",
            domain: "TOOL" /* TOOL */,
            category: "USER" /* USER */,
            details: {
              error,
              args,
              model: rest.model?.modelId ?? ""
            }
          },
          err
        );
        logger2.trackException(mastraError);
        logger2.error(error, { ...rest, error: mastraError, args });
        throw mastraError;
      }
    };
  }
  build() {
    const providerTool = this.buildProviderTool(this.originalTool);
    if (providerTool) {
      return providerTool;
    }
    const definition = {
      type: "function",
      description: this.originalTool.description,
      parameters: this.getParameters(),
      execute: this.originalTool.execute ? this.createExecute(
        this.originalTool,
        { ...this.options, description: this.originalTool.description },
        this.logType
      ) : void 0
    };
    const model = this.options.model;
    const schemaCompatLayers = [];
    if (model) {
      schemaCompatLayers.push(
        new OpenAIReasoningSchemaCompatLayer(model),
        new OpenAISchemaCompatLayer(model),
        new GoogleSchemaCompatLayer(model),
        new AnthropicSchemaCompatLayer(model),
        new DeepSeekSchemaCompatLayer(model),
        new MetaSchemaCompatLayer(model)
      );
    }
    const processedSchema = applyCompatLayer({
      schema: this.getParameters(),
      compatLayers: schemaCompatLayers,
      mode: "aiSdkSchema"
    });
    return {
      ...definition,
      parameters: processedSchema
    };
  }
};

// src/utils.ts
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function deepMerge(target, source) {
  const output = { ...target };
  if (!source) return output;
  Object.keys(source).forEach((key) => {
    const targetValue = output[key];
    const sourceValue = source[key];
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      output[key] = sourceValue;
    } else if (sourceValue instanceof Object && targetValue instanceof Object && !Array.isArray(sourceValue) && !Array.isArray(targetValue)) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else if (sourceValue !== void 0) {
      output[key] = sourceValue;
    }
  });
  return output;
}
async function* maskStreamTags(stream, tag, options = {}) {
  const { onStart, onEnd, onMask } = options;
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;
  let buffer = "";
  let fullContent = "";
  let isMasking = false;
  let isBuffering = false;
  const trimOutsideDelimiter = (text, delimiter, trim) => {
    if (!text.includes(delimiter)) {
      return text;
    }
    const parts = text.split(delimiter);
    if (trim === `before-start`) {
      return `${delimiter}${parts[1]}`;
    }
    return `${parts[0]}${delimiter}`;
  };
  const startsWith = (text, pattern) => {
    if (pattern.includes(openTag.substring(0, 3))) {
      pattern = trimOutsideDelimiter(pattern, `<`, `before-start`);
    }
    return text.trim().startsWith(pattern.trim());
  };
  for await (const chunk of stream) {
    fullContent += chunk;
    if (isBuffering) buffer += chunk;
    const chunkHasTag = startsWith(chunk, openTag);
    const bufferHasTag = !chunkHasTag && isBuffering && startsWith(openTag, buffer);
    let toYieldBeforeMaskedStartTag = ``;
    if (!isMasking && (chunkHasTag || bufferHasTag)) {
      isMasking = true;
      isBuffering = false;
      const taggedTextToMask = trimOutsideDelimiter(buffer, `<`, `before-start`);
      if (taggedTextToMask !== buffer.trim()) {
        toYieldBeforeMaskedStartTag = buffer.replace(taggedTextToMask, ``);
      }
      buffer = "";
      onStart?.();
    }
    if (!isMasking && !isBuffering && startsWith(openTag, chunk) && chunk.trim() !== "") {
      isBuffering = true;
      buffer += chunk;
      continue;
    }
    if (isBuffering && buffer && !startsWith(openTag, buffer)) {
      yield buffer;
      buffer = "";
      isBuffering = false;
      continue;
    }
    if (isMasking && fullContent.includes(closeTag)) {
      onMask?.(chunk);
      onEnd?.();
      isMasking = false;
      const lastFullContent = fullContent;
      fullContent = ``;
      const textUntilEndTag = trimOutsideDelimiter(lastFullContent, closeTag, "after-end");
      if (textUntilEndTag !== lastFullContent) {
        yield lastFullContent.replace(textUntilEndTag, ``);
      }
      continue;
    }
    if (isMasking) {
      onMask?.(chunk);
      if (toYieldBeforeMaskedStartTag) {
        yield toYieldBeforeMaskedStartTag;
      }
      continue;
    }
    yield chunk;
  }
}
function resolveSerializedZodOutput(schema) {
  return Function("z", `"use strict";return (${schema});`)(z);
}
function isZodType(value) {
  return typeof value === "object" && value !== null && "_def" in value && "parse" in value && typeof value.parse === "function" && "safeParse" in value && typeof value.safeParse === "function";
}
function createDeterministicId(input) {
  return createHash("sha256").update(input).digest("hex").slice(0, 8);
}
function setVercelToolProperties(tool) {
  const inputSchema = convertVercelToolParameters(tool);
  const toolId = !("id" in tool) ? tool.description ? `tool-${createDeterministicId(tool.description)}` : `tool-${Math.random().toString(36).substring(2, 9)}` : tool.id;
  return {
    ...tool,
    id: toolId,
    inputSchema
  };
}
function ensureToolProperties(tools) {
  const toolsWithProperties = Object.keys(tools).reduce((acc, key) => {
    const tool = tools?.[key];
    if (tool) {
      if (isVercelTool(tool)) {
        acc[key] = setVercelToolProperties(tool);
      } else {
        acc[key] = tool;
      }
    }
    return acc;
  }, {});
  return toolsWithProperties;
}
function convertVercelToolParameters(tool) {
  const schema = tool.parameters ?? z.object({});
  return isZodType(schema) ? schema : resolveSerializedZodOutput(jsonSchemaToZod(schema));
}
function makeCoreTool(originalTool, options, logType) {
  return new CoreToolBuilder({ originalTool, options, logType }).build();
}
function createMastraProxy({ mastra, logger }) {
  return new Proxy(mastra, {
    get(target, prop) {
      const hasProp = Reflect.has(target, prop);
      if (hasProp) {
        const value = Reflect.get(target, prop);
        const isFunction = typeof value === "function";
        if (isFunction) {
          return value.bind(target);
        }
        return value;
      }
      if (prop === "logger") {
        logger.warn(`Please use 'getLogger' instead, logger is deprecated`);
        return Reflect.apply(target.getLogger, target, []);
      }
      if (prop === "telemetry") {
        logger.warn(`Please use 'getTelemetry' instead, telemetry is deprecated`);
        return Reflect.apply(target.getTelemetry, target, []);
      }
      if (prop === "storage") {
        logger.warn(`Please use 'getStorage' instead, storage is deprecated`);
        return Reflect.get(target, "storage");
      }
      if (prop === "agents") {
        logger.warn(`Please use 'getAgents' instead, agents is deprecated`);
        return Reflect.apply(target.getAgents, target, []);
      }
      if (prop === "tts") {
        logger.warn(`Please use 'getTTS' instead, tts is deprecated`);
        return Reflect.apply(target.getTTS, target, []);
      }
      if (prop === "vectors") {
        logger.warn(`Please use 'getVectors' instead, vectors is deprecated`);
        return Reflect.apply(target.getVectors, target, []);
      }
      if (prop === "memory") {
        logger.warn(`Please use 'getMemory' instead, memory is deprecated`);
        return Reflect.get(target, "memory");
      }
      return Reflect.get(target, prop);
    }
  });
}
function checkEvalStorageFields(traceObject, logger) {
  const missingFields = [];
  if (!traceObject.input) missingFields.push("input");
  if (!traceObject.output) missingFields.push("output");
  if (!traceObject.agentName) missingFields.push("agent_name");
  if (!traceObject.metricName) missingFields.push("metric_name");
  if (!traceObject.instructions) missingFields.push("instructions");
  if (!traceObject.globalRunId) missingFields.push("global_run_id");
  if (!traceObject.runId) missingFields.push("run_id");
  if (missingFields.length > 0) {
    if (logger) {
      logger.warn("Skipping evaluation storage due to missing required fields", {
        missingFields,
        runId: traceObject.runId,
        agentName: traceObject.agentName
      });
    } else {
      console.warn("Skipping evaluation storage due to missing required fields", {
        missingFields,
        runId: traceObject.runId,
        agentName: traceObject.agentName
      });
    }
    return false;
  }
  return true;
}
function detectSingleMessageCharacteristics(message) {
  if (typeof message === "object" && message !== null && (message.role === "function" || // UI-only role
  message.role === "data" || // UI-only role
  "toolInvocations" in message || // UI-specific field
  "parts" in message || // UI-specific field
  "experimental_attachments" in message)) {
    return "has-ui-specific-parts";
  } else if (typeof message === "object" && message !== null && "content" in message && (Array.isArray(message.content) || // Core messages can have array content
  "experimental_providerMetadata" in message || "providerOptions" in message)) {
    return "has-core-specific-parts";
  } else if (typeof message === "object" && message !== null && "role" in message && "content" in message && typeof message.content === "string" && ["system", "user", "assistant", "tool"].includes(message.role)) {
    return "message";
  } else {
    return "other";
  }
}
function isUiMessage(message) {
  return detectSingleMessageCharacteristics(message) === `has-ui-specific-parts`;
}
function isCoreMessage(message) {
  return [`has-core-specific-parts`, `message`].includes(detectSingleMessageCharacteristics(message));
}
var SQL_IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
function parseSqlIdentifier(name, kind = "identifier") {
  if (!SQL_IDENTIFIER_PATTERN.test(name) || name.length > 63) {
    throw new Error(
      `Invalid ${kind}: ${name}. Must start with a letter or underscore, contain only letters, numbers, or underscores, and be at most 63 characters long.`
    );
  }
  return name;
}
function parseFieldKey(key) {
  if (!key) throw new Error("Field key cannot be empty");
  const segments = key.split(".");
  for (const segment of segments) {
    if (!SQL_IDENTIFIER_PATTERN.test(segment) || segment.length > 63) {
      throw new Error(`Invalid field key segment: ${segment} in ${key}`);
    }
  }
  return key;
}

export { checkEvalStorageFields, createMastraProxy, deepMerge, delay, ensureToolProperties, isCoreMessage, isUiMessage, isZodType, makeCoreTool, maskStreamTags, parseFieldKey, parseSqlIdentifier, resolveSerializedZodOutput };
