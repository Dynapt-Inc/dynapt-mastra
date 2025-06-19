'use strict';

var chunkUOKJ7SQO_cjs = require('./chunk-UOKJ7SQO.cjs');
var chunkU3XRKJNN_cjs = require('./chunk-U3XRKJNN.cjs');
var chunkP3Q73CAW_cjs = require('./chunk-P3Q73CAW.cjs');
var chunkZIZ3CVHN_cjs = require('./chunk-ZIZ3CVHN.cjs');
var schemaCompat = require('@mastra/schema-compat');
var ai = require('ai');
var zod = require('zod');

// src/llm/model/base.ts
var MastraLLMBase = class extends chunkP3Q73CAW_cjs.MastraBase {
  // @ts-ignore
  #mastra;
  #model;
  constructor({ name, model }) {
    super({
      component: chunkZIZ3CVHN_cjs.RegisteredLogger.LLM,
      name
    });
    this.#model = model;
  }
  getProvider() {
    return this.#model.provider;
  }
  getModelId() {
    return this.#model.modelId;
  }
  getModel() {
    return this.#model;
  }
  convertToMessages(messages) {
    if (Array.isArray(messages)) {
      return messages.map((m) => {
        if (typeof m === "string") {
          return {
            role: "user",
            content: m
          };
        }
        return m;
      });
    }
    return [
      {
        role: "user",
        content: messages
      }
    ];
  }
  __registerPrimitives(p) {
    if (p.telemetry) {
      this.__setTelemetry(p.telemetry);
    }
    if (p.logger) {
      this.__setLogger(p.logger);
    }
  }
  __registerMastra(p) {
    this.#mastra = p;
  }
  async __text(input) {
    this.logger.debug(`[LLMs:${this.name}] Generating text.`, { input });
    throw new Error("Method not implemented.");
  }
  async __textObject(input) {
    this.logger.debug(`[LLMs:${this.name}] Generating object.`, { input });
    throw new Error("Method not implemented.");
  }
  async generate(messages, options) {
    this.logger.debug(`[LLMs:${this.name}] Generating text.`, { messages, options });
    throw new Error("Method not implemented.");
  }
  async __stream(input) {
    this.logger.debug(`[LLMs:${this.name}] Streaming text.`, { input });
    throw new Error("Method not implemented.");
  }
  async __streamObject(input) {
    this.logger.debug(`[LLMs:${this.name}] Streaming object.`, { input });
    throw new Error("Method not implemented.");
  }
  async stream(messages, options) {
    this.logger.debug(`[LLMs:${this.name}] Streaming text.`, { messages, options });
    throw new Error("Method not implemented.");
  }
};

// src/llm/model/model.ts
var MastraLLM = class extends MastraLLMBase {
  #model;
  #mastra;
  constructor({ model, mastra }) {
    super({ name: "aisdk", model });
    this.#model = model;
    if (mastra) {
      this.#mastra = mastra;
      if (mastra.getLogger()) {
        this.__setLogger(this.#mastra.getLogger());
      }
    }
  }
  __registerPrimitives(p) {
    if (p.telemetry) {
      this.__setTelemetry(p.telemetry);
    }
    if (p.logger) {
      this.__setLogger(p.logger);
    }
  }
  __registerMastra(p) {
    this.#mastra = p;
  }
  getProvider() {
    return this.#model.provider;
  }
  getModelId() {
    return this.#model.modelId;
  }
  getModel() {
    return this.#model;
  }
  _applySchemaCompat(schema) {
    const model = this.#model;
    const schemaCompatLayers = [];
    if (model) {
      schemaCompatLayers.push(
        new schemaCompat.OpenAIReasoningSchemaCompatLayer(model),
        new schemaCompat.OpenAISchemaCompatLayer(model),
        new schemaCompat.GoogleSchemaCompatLayer(model),
        new schemaCompat.AnthropicSchemaCompatLayer(model),
        new schemaCompat.DeepSeekSchemaCompatLayer(model),
        new schemaCompat.MetaSchemaCompatLayer(model)
      );
    }
    return schemaCompat.applyCompatLayer({
      schema,
      compatLayers: schemaCompatLayers,
      mode: "aiSdkSchema"
    });
  }
  async __text({
    runId,
    messages,
    maxSteps = 5,
    tools = {},
    temperature,
    toolChoice = "auto",
    onStepFinish,
    experimental_output,
    telemetry,
    threadId,
    resourceId,
    memory,
    runtimeContext,
    ...rest
  }) {
    const model = this.#model;
    this.logger.debug(`[LLM] - Generating text`, {
      runId,
      messages,
      maxSteps,
      threadId,
      resourceId,
      tools: Object.keys(tools)
    });
    const argsForExecute = {
      model,
      temperature,
      tools: {
        ...tools
      },
      toolChoice,
      maxSteps,
      onStepFinish: async (props) => {
        try {
          await onStepFinish?.(props);
        } catch (e) {
          const mastraError = new chunkU3XRKJNN_cjs.MastraError(
            {
              id: "LLM_TEXT_ON_STEP_FINISH_CALLBACK_EXECUTION_FAILED",
              domain: "LLM" /* LLM */,
              category: "USER" /* USER */,
              details: {
                modelId: model.modelId,
                modelProvider: model.provider,
                runId: runId ?? "unknown",
                threadId: threadId ?? "unknown",
                resourceId: resourceId ?? "unknown",
                finishReason: props?.finishReason,
                toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                usage: props?.usage ? JSON.stringify(props.usage) : ""
              }
            },
            e
          );
          this.logger.trackException(mastraError);
          throw mastraError;
        }
        this.logger.debug("[LLM] - Step Change:", {
          text: props?.text,
          toolCalls: props?.toolCalls,
          toolResults: props?.toolResults,
          finishReason: props?.finishReason,
          usage: props?.usage,
          runId
        });
        if (props?.response?.headers?.["x-ratelimit-remaining-tokens"] && parseInt(props?.response?.headers?.["x-ratelimit-remaining-tokens"], 10) < 2e3) {
          this.logger.warn("Rate limit approaching, waiting 10 seconds", { runId });
          await chunkUOKJ7SQO_cjs.delay(10 * 1e3);
        }
      },
      ...rest
    };
    let schema;
    if (experimental_output) {
      this.logger.debug("[LLM] - Using experimental output", {
        runId
      });
      if (typeof experimental_output.parse === "function") {
        schema = experimental_output;
        if (schema instanceof zod.z.ZodArray) {
          schema = schema._def.type;
        }
      } else {
        schema = ai.jsonSchema(experimental_output);
      }
    }
    try {
      return await ai.generateText({
        messages,
        ...argsForExecute,
        experimental_telemetry: {
          ...this.experimental_telemetry,
          ...telemetry
        },
        experimental_output: schema ? ai.Output.object({
          schema
        }) : void 0
      });
    } catch (e) {
      const mastraError = new chunkU3XRKJNN_cjs.MastraError(
        {
          id: "LLM_GENERATE_TEXT_AI_SDK_EXECUTION_FAILED",
          domain: "LLM" /* LLM */,
          category: "THIRD_PARTY" /* THIRD_PARTY */,
          details: {
            modelId: model.modelId,
            modelProvider: model.provider,
            runId: runId ?? "unknown",
            threadId: threadId ?? "unknown",
            resourceId: resourceId ?? "unknown"
          }
        },
        e
      );
      this.logger.trackException(mastraError);
      throw mastraError;
    }
  }
  async __textObject({
    messages,
    onStepFinish,
    maxSteps = 5,
    tools = {},
    structuredOutput,
    runId,
    temperature,
    toolChoice = "auto",
    telemetry,
    threadId,
    resourceId,
    memory,
    runtimeContext,
    ...rest
  }) {
    const model = this.#model;
    this.logger.debug(`[LLM] - Generating a text object`, { runId });
    const argsForExecute = {
      model,
      temperature,
      tools: {
        ...tools
      },
      maxSteps,
      toolChoice,
      onStepFinish: async (props) => {
        try {
          await onStepFinish?.(props);
        } catch (e) {
          const mastraError = new chunkU3XRKJNN_cjs.MastraError(
            {
              id: "LLM_TEXT_OBJECT_ON_STEP_FINISH_CALLBACK_EXECUTION_FAILED",
              domain: "LLM" /* LLM */,
              category: "USER" /* USER */,
              details: {
                runId: runId ?? "unknown",
                threadId: threadId ?? "unknown",
                resourceId: resourceId ?? "unknown",
                finishReason: props?.finishReason,
                toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                usage: props?.usage ? JSON.stringify(props.usage) : ""
              }
            },
            e
          );
          this.logger.trackException(mastraError);
          throw mastraError;
        }
        this.logger.debug("[LLM] - Step Change:", {
          text: props?.text,
          toolCalls: props?.toolCalls,
          toolResults: props?.toolResults,
          finishReason: props?.finishReason,
          usage: props?.usage,
          runId
        });
        if (props?.response?.headers?.["x-ratelimit-remaining-tokens"] && parseInt(props?.response?.headers?.["x-ratelimit-remaining-tokens"], 10) < 2e3) {
          this.logger.warn("Rate limit approaching, waiting 10 seconds", { runId });
          await chunkUOKJ7SQO_cjs.delay(10 * 1e3);
        }
      },
      ...rest
    };
    let output = "object";
    if (structuredOutput instanceof zod.z.ZodArray) {
      output = "array";
      structuredOutput = structuredOutput._def.type;
    }
    try {
      const processedSchema = this._applySchemaCompat(structuredOutput);
      return await ai.generateObject({
        messages,
        ...argsForExecute,
        output,
        schema: processedSchema,
        experimental_telemetry: {
          ...this.experimental_telemetry,
          ...telemetry
        }
      });
    } catch (e) {
      const mastraError = new chunkU3XRKJNN_cjs.MastraError(
        {
          id: "LLM_GENERATE_OBJECT_AI_SDK_EXECUTION_FAILED",
          domain: "LLM" /* LLM */,
          category: "THIRD_PARTY" /* THIRD_PARTY */,
          details: {
            modelId: model.modelId,
            modelProvider: model.provider,
            runId: runId ?? "unknown",
            threadId: threadId ?? "unknown",
            resourceId: resourceId ?? "unknown"
          }
        },
        e
      );
      this.logger.trackException(mastraError);
      throw mastraError;
    }
  }
  async __stream({
    messages,
    onStepFinish,
    onFinish,
    maxSteps = 5,
    tools = {},
    runId,
    temperature,
    toolChoice = "auto",
    experimental_output,
    telemetry,
    threadId,
    resourceId,
    memory,
    runtimeContext,
    ...rest
  }) {
    const model = this.#model;
    this.logger.debug(`[LLM] - Streaming text`, {
      runId,
      threadId,
      resourceId,
      messages,
      maxSteps,
      tools: Object.keys(tools || {})
    });
    const argsForExecute = {
      model,
      temperature,
      tools: {
        ...tools
      },
      maxSteps,
      toolChoice,
      onStepFinish: async (props) => {
        try {
          await onStepFinish?.(props);
        } catch (e) {
          const mastraError = new chunkU3XRKJNN_cjs.MastraError(
            {
              id: "LLM_STREAM_ON_STEP_FINISH_CALLBACK_EXECUTION_FAILED",
              domain: "LLM" /* LLM */,
              category: "USER" /* USER */,
              details: {
                modelId: model.modelId,
                modelProvider: model.provider,
                runId: runId ?? "unknown",
                threadId: threadId ?? "unknown",
                resourceId: resourceId ?? "unknown",
                finishReason: props?.finishReason,
                toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                usage: props?.usage ? JSON.stringify(props.usage) : ""
              }
            },
            e
          );
          this.logger.trackException(mastraError);
          throw mastraError;
        }
        this.logger.debug("[LLM] - Stream Step Change:", {
          text: props?.text,
          toolCalls: props?.toolCalls,
          toolResults: props?.toolResults,
          finishReason: props?.finishReason,
          usage: props?.usage,
          runId
        });
        if (props?.response?.headers?.["x-ratelimit-remaining-tokens"] && parseInt(props?.response?.headers?.["x-ratelimit-remaining-tokens"], 10) < 2e3) {
          this.logger.warn("Rate limit approaching, waiting 10 seconds", { runId });
          await chunkUOKJ7SQO_cjs.delay(10 * 1e3);
        }
      },
      onFinish: async (props) => {
        try {
          await onFinish?.(props);
        } catch (e) {
          const mastraError = new chunkU3XRKJNN_cjs.MastraError(
            {
              id: "LLM_STREAM_ON_FINISH_CALLBACK_EXECUTION_FAILED",
              domain: "LLM" /* LLM */,
              category: "USER" /* USER */,
              details: {
                modelId: model.modelId,
                modelProvider: model.provider,
                runId: runId ?? "unknown",
                threadId: threadId ?? "unknown",
                resourceId: resourceId ?? "unknown",
                finishReason: props?.finishReason,
                toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                usage: props?.usage ? JSON.stringify(props.usage) : ""
              }
            },
            e
          );
          this.logger.trackException(mastraError);
          throw mastraError;
        }
        this.logger.debug("[LLM] - Stream Finished:", {
          text: props?.text,
          toolCalls: props?.toolCalls,
          toolResults: props?.toolResults,
          finishReason: props?.finishReason,
          usage: props?.usage,
          runId,
          threadId,
          resourceId
        });
      },
      ...rest
    };
    let schema;
    if (experimental_output) {
      this.logger.debug("[LLM] - Using experimental output", {
        runId
      });
      if (typeof experimental_output.parse === "function") {
        schema = experimental_output;
        if (schema instanceof zod.z.ZodArray) {
          schema = schema._def.type;
        }
      } else {
        schema = ai.jsonSchema(experimental_output);
      }
    }
    try {
      return await ai.streamText({
        messages,
        ...argsForExecute,
        experimental_telemetry: {
          ...this.experimental_telemetry,
          ...telemetry
        },
        experimental_output: schema ? ai.Output.object({
          schema
        }) : void 0
      });
    } catch (e) {
      const mastraError = new chunkU3XRKJNN_cjs.MastraError(
        {
          id: "LLM_STREAM_TEXT_AI_SDK_EXECUTION_FAILED",
          domain: "LLM" /* LLM */,
          category: "THIRD_PARTY" /* THIRD_PARTY */,
          details: {
            modelId: model.modelId,
            modelProvider: model.provider,
            runId: runId ?? "unknown",
            threadId: threadId ?? "unknown",
            resourceId: resourceId ?? "unknown"
          }
        },
        e
      );
      this.logger.trackException(mastraError);
      throw mastraError;
    }
  }
  async __streamObject({
    messages,
    runId,
    tools = {},
    maxSteps = 5,
    toolChoice = "auto",
    runtimeContext,
    threadId,
    resourceId,
    memory,
    temperature,
    onStepFinish,
    onFinish,
    structuredOutput,
    telemetry,
    ...rest
  }) {
    const model = this.#model;
    this.logger.debug(`[LLM] - Streaming structured output`, {
      runId,
      messages,
      maxSteps,
      tools: Object.keys(tools || {})
    });
    const finalTools = tools;
    const argsForExecute = {
      model,
      temperature,
      tools: {
        ...finalTools
      },
      maxSteps,
      toolChoice,
      onStepFinish: async (props) => {
        try {
          await onStepFinish?.(props);
        } catch (e) {
          const mastraError = new chunkU3XRKJNN_cjs.MastraError(
            {
              id: "LLM_STREAM_OBJECT_ON_STEP_FINISH_CALLBACK_EXECUTION_FAILED",
              domain: "LLM" /* LLM */,
              category: "USER" /* USER */,
              details: {
                modelId: model.modelId,
                modelProvider: model.provider,
                runId: runId ?? "unknown",
                threadId: threadId ?? "unknown",
                resourceId: resourceId ?? "unknown",
                usage: props?.usage ? JSON.stringify(props.usage) : "",
                toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                finishReason: props?.finishReason
              }
            },
            e
          );
          this.logger.trackException(mastraError);
          throw mastraError;
        }
        this.logger.debug("[LLM] - Stream Step Change:", {
          text: props?.text,
          toolCalls: props?.toolCalls,
          toolResults: props?.toolResults,
          finishReason: props?.finishReason,
          usage: props?.usage,
          runId,
          threadId,
          resourceId
        });
        if (props?.response?.headers?.["x-ratelimit-remaining-tokens"] && parseInt(props?.response?.headers?.["x-ratelimit-remaining-tokens"], 10) < 2e3) {
          this.logger.warn("Rate limit approaching, waiting 10 seconds", { runId });
          await chunkUOKJ7SQO_cjs.delay(10 * 1e3);
        }
      },
      onFinish: async (props) => {
        try {
          await onFinish?.(props);
        } catch (e) {
          const mastraError = new chunkU3XRKJNN_cjs.MastraError(
            {
              id: "LLM_STREAM_OBJECT_ON_FINISH_CALLBACK_EXECUTION_FAILED",
              domain: "LLM" /* LLM */,
              category: "USER" /* USER */,
              details: {
                modelId: model.modelId,
                modelProvider: model.provider,
                runId: runId ?? "unknown",
                threadId: threadId ?? "unknown",
                resourceId: resourceId ?? "unknown",
                toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                finishReason: props?.finishReason,
                usage: props?.usage ? JSON.stringify(props.usage) : ""
              }
            },
            e
          );
          this.logger.trackException(mastraError);
          throw mastraError;
        }
        this.logger.debug("[LLM] - Stream Finished:", {
          text: props?.text,
          toolCalls: props?.toolCalls,
          toolResults: props?.toolResults,
          finishReason: props?.finishReason,
          usage: props?.usage,
          runId,
          threadId,
          resourceId
        });
      },
      ...rest
    };
    let output = "object";
    if (structuredOutput instanceof zod.z.ZodArray) {
      output = "array";
      structuredOutput = structuredOutput._def.type;
    }
    try {
      const processedSchema = this._applySchemaCompat(structuredOutput);
      return ai.streamObject({
        messages,
        ...argsForExecute,
        output,
        schema: processedSchema,
        experimental_telemetry: {
          ...this.experimental_telemetry,
          ...telemetry
        }
      });
    } catch (e) {
      const mastraError = new chunkU3XRKJNN_cjs.MastraError(
        {
          id: "LLM_STREAM_OBJECT_AI_SDK_EXECUTION_FAILED",
          domain: "LLM" /* LLM */,
          category: "THIRD_PARTY" /* THIRD_PARTY */,
          details: {
            modelId: model.modelId,
            modelProvider: model.provider,
            runId: runId ?? "unknown",
            threadId: threadId ?? "unknown",
            resourceId: resourceId ?? "unknown"
          }
        },
        e
      );
      this.logger.trackException(mastraError);
      throw mastraError;
    }
  }
  async generate(messages, { maxSteps = 5, output, ...rest }) {
    const msgs = this.convertToMessages(messages);
    if (!output) {
      return await this.__text({
        messages: msgs,
        maxSteps,
        ...rest
      });
    }
    return await this.__textObject({
      messages: msgs,
      structuredOutput: output,
      maxSteps,
      ...rest
    });
  }
  async stream(messages, { maxSteps = 5, output, ...rest }) {
    const msgs = this.convertToMessages(messages);
    if (!output) {
      return await this.__stream({
        messages: msgs,
        maxSteps,
        ...rest
      });
    }
    return await this.__streamObject({
      messages: msgs,
      structuredOutput: output,
      maxSteps,
      ...rest
    });
  }
};

exports.MastraLLM = MastraLLM;
