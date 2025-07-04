import { DefaultVoice } from './chunk-YXVUGQNA.js';
import { MessageList } from './chunk-GTG6JWTV.js';
import { executeHook } from './chunk-BB4KXGBU.js';
import { MastraLLM } from './chunk-CYVJMK5L.js';
import { InstrumentClass } from './chunk-IFQGBW42.js';
import { ensureToolProperties, makeCoreTool, createMastraProxy } from './chunk-HJQYQAIJ.js';
import { MastraError } from './chunk-4MPQAHTP.js';
import { MastraBase } from './chunk-5IEKR756.js';
import { RegisteredLogger } from './chunk-5YDTZN2X.js';
import { RuntimeContext } from './chunk-SGGPJWRQ.js';
import { __commonJS, __toESM, __decoratorStart, __decorateElement, __runInitializers } from './chunk-WQNOATKB.js';
import { context, trace } from '@opentelemetry/api';
import { z } from 'zod';
import { get } from 'radash';
import { randomUUID } from 'crypto';
import EventEmitter from 'events';
import sift from 'sift';
import { createActor, assign, fromPromise, setup } from 'xstate';

// ../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js"(exports, module) {

    module.exports = function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0;) if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0;) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// src/workflows/legacy/step.ts
var LegacyStep = class {
  id;
  description;
  inputSchema;
  outputSchema;
  payload;
  execute;
  retryConfig;
  mastra;
  constructor({
    id,
    description,
    execute,
    payload,
    outputSchema,
    inputSchema,
    retryConfig
  }) {
    this.id = id;
    this.description = description ?? "";
    this.inputSchema = inputSchema;
    this.payload = payload;
    this.outputSchema = outputSchema;
    this.execute = execute;
    this.retryConfig = retryConfig;
  }
};

// src/workflows/legacy/types.ts
var WhenConditionReturnValue = /* @__PURE__ */(WhenConditionReturnValue2 => {
  WhenConditionReturnValue2["CONTINUE"] = "continue";
  WhenConditionReturnValue2["CONTINUE_FAILED"] = "continue_failed";
  WhenConditionReturnValue2["ABORT"] = "abort";
  WhenConditionReturnValue2["LIMBO"] = "limbo";
  return WhenConditionReturnValue2;
})(WhenConditionReturnValue || {});

// src/agent/index.ts
var import_fast_deep_equal = __toESM(require_fast_deep_equal(), 1);
function resolveMaybePromise(value, cb) {
  if (value instanceof Promise) {
    return value.then(cb);
  }
  return cb(value);
}
function resolveThreadIdFromArgs(args) {
  if (args?.memory?.thread) {
    if (typeof args.memory.thread === "string") return {
      id: args.memory.thread
    };
    if (typeof args.memory.thread === "object" && args.memory.thread.id) return args.memory.thread;
  }
  if (args?.threadId) return {
    id: args.threadId
  };
  return void 0;
}
var _Agent_decorators, _init, _a;
_Agent_decorators = [InstrumentClass({
  prefix: "agent",
  excludeMethods: ["hasOwnMemory", "getMemory", "__primitive", "__registerMastra", "__registerPrimitives", "__setTools", "__setLogger", "__setTelemetry", "log", "getModel", "getInstructions", "getTools", "getLLM", "getWorkflows", "getDefaultGenerateOptions", "getDefaultStreamOptions", "getDescription"]
})];
var Agent = class extends (_a = MastraBase) {
  id;
  name;
  #instructions;
  #description;
  model;
  #mastra;
  #memory;
  #workflows;
  #defaultGenerateOptions;
  #defaultStreamOptions;
  #tools;
  /** @deprecated This property is deprecated. Use evals instead. */
  metrics;
  evals;
  #voice;
  constructor(config) {
    super({
      component: RegisteredLogger.AGENT
    });
    this.name = config.name;
    this.id = config.name;
    this.#instructions = config.instructions;
    this.#description = config.description;
    if (!config.model) {
      const mastraError = new MastraError({
        id: "AGENT_CONSTRUCTOR_MODEL_REQUIRED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: config.name
        },
        text: `LanguageModel is required to create an Agent. Please provide the 'model'.`
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    this.model = config.model;
    if (config.workflows) {
      this.#workflows = config.workflows;
    }
    this.#defaultGenerateOptions = config.defaultGenerateOptions || {};
    this.#defaultStreamOptions = config.defaultStreamOptions || {};
    this.#tools = config.tools || {};
    this.metrics = {};
    this.evals = {};
    if (config.mastra) {
      this.__registerMastra(config.mastra);
      this.__registerPrimitives({
        telemetry: config.mastra.getTelemetry(),
        logger: config.mastra.getLogger()
      });
    }
    if (config.metrics) {
      this.logger.warn("The metrics property is deprecated. Please use evals instead to add evaluation metrics.");
      this.metrics = config.metrics;
      this.evals = config.metrics;
    }
    if (config.evals) {
      this.evals = config.evals;
    }
    if (config.memory) {
      this.#memory = config.memory;
    }
    if (config.voice) {
      this.#voice = config.voice;
      if (typeof config.tools !== "function") {
        this.#voice?.addTools(this.tools);
      }
      if (typeof config.instructions === "string") {
        this.#voice?.addInstructions(config.instructions);
      }
    } else {
      this.#voice = new DefaultVoice();
    }
  }
  hasOwnMemory() {
    return Boolean(this.#memory);
  }
  getMemory() {
    const memory = this.#memory;
    if (memory && !memory.hasOwnStorage && this.#mastra) {
      const storage = this.#mastra.getStorage();
      if (storage) {
        memory.setStorage(storage);
      }
    }
    return memory;
  }
  get voice() {
    if (typeof this.#instructions === "function") {
      const mastraError = new MastraError({
        id: "AGENT_VOICE_INCOMPATIBLE_WITH_FUNCTION_INSTRUCTIONS",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "Voice is not compatible when instructions are a function. Please use getVoice() instead."
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    return this.#voice;
  }
  async getWorkflows({
    runtimeContext = new RuntimeContext()
  } = {}) {
    let workflowRecord;
    if (typeof this.#workflows === "function") {
      workflowRecord = await Promise.resolve(this.#workflows({
        runtimeContext
      }));
    } else {
      workflowRecord = this.#workflows ?? {};
    }
    Object.entries(workflowRecord || {}).forEach(([_workflowName, workflow]) => {
      if (this.#mastra) {
        workflow.__registerMastra(this.#mastra);
      }
    });
    return workflowRecord;
  }
  async getVoice({
    runtimeContext
  } = {}) {
    if (this.#voice) {
      const voice = this.#voice;
      voice?.addTools(await this.getTools({
        runtimeContext
      }));
      voice?.addInstructions(await this.getInstructions({
        runtimeContext
      }));
      return voice;
    } else {
      return new DefaultVoice();
    }
  }
  get instructions() {
    this.logger.warn("The instructions property is deprecated. Please use getInstructions() instead.");
    if (typeof this.#instructions === "function") {
      const mastraError = new MastraError({
        id: "AGENT_INSTRUCTIONS_INCOMPATIBLE_WITH_FUNCTION_INSTRUCTIONS",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "Instructions are not compatible when instructions are a function. Please use getInstructions() instead."
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    return this.#instructions;
  }
  getInstructions({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#instructions === "string") {
      return this.#instructions;
    }
    const result = this.#instructions({
      runtimeContext
    });
    return resolveMaybePromise(result, instructions => {
      if (!instructions) {
        const mastraError = new MastraError({
          id: "AGENT_GET_INSTRUCTIONS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: "Instructions are required to use an Agent. The function-based instructions returned an empty value."
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return instructions;
    });
  }
  getDescription() {
    return this.#description ?? "";
  }
  getDefaultGenerateOptions({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#defaultGenerateOptions !== "function") {
      return this.#defaultGenerateOptions;
    }
    const result = this.#defaultGenerateOptions({
      runtimeContext
    });
    return resolveMaybePromise(result, options => {
      if (!options) {
        const mastraError = new MastraError({
          id: "AGENT_GET_DEFAULT_GENERATE_OPTIONS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based default generate options returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return options;
    });
  }
  getDefaultStreamOptions({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#defaultStreamOptions !== "function") {
      return this.#defaultStreamOptions;
    }
    const result = this.#defaultStreamOptions({
      runtimeContext
    });
    return resolveMaybePromise(result, options => {
      if (!options) {
        const mastraError = new MastraError({
          id: "AGENT_GET_DEFAULT_STREAM_OPTIONS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based default stream options returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return options;
    });
  }
  get tools() {
    this.logger.warn("The tools property is deprecated. Please use getTools() instead.");
    if (typeof this.#tools === "function") {
      const mastraError = new MastraError({
        id: "AGENT_GET_TOOLS_FUNCTION_INCOMPATIBLE_WITH_TOOL_FUNCTION_TYPE",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "Tools are not compatible when tools are a function. Please use getTools() instead."
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    return ensureToolProperties(this.#tools);
  }
  getTools({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#tools !== "function") {
      return ensureToolProperties(this.#tools);
    }
    const result = this.#tools({
      runtimeContext
    });
    return resolveMaybePromise(result, tools => {
      if (!tools) {
        const mastraError = new MastraError({
          id: "AGENT_GET_TOOLS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based tools returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return ensureToolProperties(tools);
    });
  }
  get llm() {
    this.logger.warn("The llm property is deprecated. Please use getLLM() instead.");
    if (typeof this.model === "function") {
      const mastraError = new MastraError({
        id: "AGENT_LLM_GETTER_INCOMPATIBLE_WITH_FUNCTION_MODEL",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "LLM is not compatible when model is a function. Please use getLLM() instead."
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    return this.getLLM();
  }
  /**
   * Gets or creates an LLM instance based on the current model
   * @param options Options for getting the LLM
   * @returns A promise that resolves to the LLM instance
   */
  getLLM({
    runtimeContext = new RuntimeContext()
  } = {}) {
    const model = this.getModel({
      runtimeContext
    });
    return resolveMaybePromise(model, model2 => {
      const llm = new MastraLLM({
        model: model2,
        mastra: this.#mastra
      });
      if (this.#primitives) {
        llm.__registerPrimitives(this.#primitives);
      }
      if (this.#mastra) {
        llm.__registerMastra(this.#mastra);
      }
      return llm;
    });
  }
  /**
   * Gets the model, resolving it if it's a function
   * @param options Options for getting the model
   * @returns A promise that resolves to the model
   */
  getModel({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.model !== "function") {
      if (!this.model) {
        const mastraError = new MastraError({
          id: "AGENT_GET_MODEL_MISSING_MODEL_INSTANCE",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - No model provided`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return this.model;
    }
    const result = this.model({
      runtimeContext
    });
    return resolveMaybePromise(result, model => {
      if (!model) {
        const mastraError = new MastraError({
          id: "AGENT_GET_MODEL_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based model returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return model;
    });
  }
  __updateInstructions(newInstructions) {
    this.#instructions = newInstructions;
    this.logger.debug(`[Agents:${this.name}] Instructions updated.`, {
      model: this.model,
      name: this.name
    });
  }
  #primitives;
  __registerPrimitives(p) {
    if (p.telemetry) {
      this.__setTelemetry(p.telemetry);
    }
    if (p.logger) {
      this.__setLogger(p.logger);
    }
    this.#primitives = p;
    this.logger.debug(`[Agents:${this.name}] initialized.`, {
      model: this.model,
      name: this.name
    });
  }
  __registerMastra(mastra) {
    this.#mastra = mastra;
  }
  /**
   * Set the concrete tools for the agent
   * @param tools
   */
  __setTools(tools) {
    this.#tools = tools;
    this.logger.debug(`[Agents:${this.name}] Tools set for agent ${this.name}`, {
      model: this.model,
      name: this.name
    });
  }
  async generateTitleFromUserMessage({
    message,
    runtimeContext = new RuntimeContext()
  }) {
    const llm = await this.getLLM({
      runtimeContext
    });
    const normMessage = new MessageList().add(message, "user").get.all.ui().at(-1);
    if (!normMessage) {
      throw new Error(`Could not generate title from input ${JSON.stringify(message)}`);
    }
    const partsToGen = [];
    for (const part of normMessage.parts) {
      if (part.type === `text`) {
        partsToGen.push(part);
      } else if (part.type === `source`) {
        partsToGen.push({
          type: "text",
          text: `User added URL: ${part.source.url.substring(0, 100)}`
        });
      } else if (part.type === `file`) {
        partsToGen.push({
          type: "text",
          text: `User added ${part.mimeType} file: ${part.data.substring(0, 100)}`
        });
      }
    }
    const {
      text
    } = await llm.__text({
      runtimeContext,
      messages: [{
        role: "system",
        content: `

    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons
    - the entire text you return will be used as the title`
      }, {
        role: "user",
        content: JSON.stringify(partsToGen)
      }]
    });
    const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return cleanedText;
  }
  getMostRecentUserMessage(messages) {
    const userMessages = messages.filter(message => message.role === "user");
    return userMessages.at(-1);
  }
  async genTitle(userMessage, runtimeContext) {
    let title = `New Thread ${(/* @__PURE__ */new Date()).toISOString()}`;
    try {
      if (userMessage) {
        const normMessage = new MessageList().add(userMessage, "user").get.all.ui().at(-1);
        if (normMessage) {
          title = await this.generateTitleFromUserMessage({
            message: normMessage,
            runtimeContext
          });
        }
      }
    } catch (e) {
      this.logger.error("Error generating title:", e);
    }
    return title;
  }
  /* @deprecated use agent.getMemory() and query memory directly */
  async fetchMemory({
    threadId,
    thread: passedThread,
    memoryConfig,
    resourceId,
    runId,
    userMessages,
    systemMessage,
    messageList = new MessageList({
      threadId,
      resourceId
    })
  }) {
    const memory = this.getMemory();
    if (memory) {
      const thread = passedThread ?? (await memory.getThreadById({
        threadId
      }));
      if (!thread) {
        return {
          threadId: threadId || "",
          messages: userMessages || []
        };
      }
      if (userMessages && userMessages.length > 0) {
        messageList.add(userMessages, "memory");
      }
      if (systemMessage?.role === "system") {
        messageList.addSystem(systemMessage, "memory");
      }
      const [memoryMessages, memorySystemMessage] = threadId && memory ? await Promise.all([memory.rememberMessages({
        threadId,
        resourceId,
        config: memoryConfig,
        vectorMessageSearch: messageList.getLatestUserContent() || ""
      }).then(r => r.messagesV2), memory.getSystemMessage({
        threadId,
        memoryConfig
      })]) : [[], null];
      this.logger.debug("Fetched messages from memory", {
        threadId,
        runId,
        fetchedCount: memoryMessages.length
      });
      if (memorySystemMessage) {
        messageList.addSystem(memorySystemMessage, "memory");
      }
      messageList.add(memoryMessages, "memory");
      const systemMessages = messageList.getSystemMessages()?.map(m => m.content)?.join(`
`) ?? void 0;
      const newMessages = messageList.get.input.v1();
      const processedMemoryMessages = memory.processMessages({
        // these will be processed
        messages: messageList.get.remembered.v1(),
        // these are here for inspecting but shouldn't be returned by the processor
        // - ex TokenLimiter needs to measure all tokens even though it's only processing remembered messages
        newMessages,
        systemMessage: systemMessages,
        memorySystemMessage: memorySystemMessage || void 0
      });
      const returnList = new MessageList().addSystem(systemMessages).add(processedMemoryMessages, "memory").add(newMessages, "user");
      return {
        threadId: thread.id,
        messages: returnList.get.all.prompt()
      };
    }
    return {
      threadId: threadId || "",
      messages: userMessages || []
    };
  }
  async getMemoryTools({
    runId,
    resourceId,
    threadId,
    runtimeContext,
    mastraProxy
  }) {
    let convertedMemoryTools = {};
    const memory = this.getMemory();
    const memoryTools = memory?.getTools?.();
    if (memoryTools) {
      const memoryToolEntries = await Promise.all(Object.entries(memoryTools).map(async ([k, tool]) => {
        return [k, {
          description: tool.description,
          parameters: tool.parameters,
          execute: typeof tool?.execute === "function" ? async (args, options) => {
            try {
              this.logger.debug(`[Agent:${this.name}] - Executing memory tool ${k}`, {
                name: k,
                description: tool.description,
                args,
                runId,
                threadId,
                resourceId
              });
              return tool?.execute?.({
                context: args,
                mastra: mastraProxy,
                memory,
                runId,
                threadId,
                resourceId,
                logger: this.logger,
                agentName: this.name,
                runtimeContext
              }, options) ?? void 0;
            } catch (err) {
              const mastraError = new MastraError({
                id: "AGENT_MEMORY_TOOL_EXECUTION_FAILED",
                domain: "AGENT" /* AGENT */,
                category: "USER" /* USER */,
                details: {
                  agentName: this.name,
                  runId: runId || "",
                  threadId: threadId || "",
                  resourceId: resourceId || ""
                },
                text: `[Agent:${this.name}] - Failed memory tool execution`
              }, err);
              this.logger.trackException(mastraError);
              this.logger.error(mastraError.toString());
              throw mastraError;
            }
          } : void 0
        }];
      }));
      convertedMemoryTools = Object.fromEntries(memoryToolEntries.filter(entry => Boolean(entry)));
    }
    return convertedMemoryTools;
  }
  async getAssignedTools({
    runtimeContext,
    runId,
    resourceId,
    threadId,
    mastraProxy
  }) {
    let toolsForRequest = {};
    this.logger.debug(`[Agents:${this.name}] - Assembling assigned tools`, {
      runId,
      threadId,
      resourceId
    });
    const memory = this.getMemory();
    const assignedTools = await this.getTools({
      runtimeContext
    });
    const assignedToolEntries = Object.entries(assignedTools || {});
    const assignedCoreToolEntries = await Promise.all(assignedToolEntries.map(async ([k, tool]) => {
      if (!tool) {
        return;
      }
      const options = {
        name: k,
        runId,
        threadId,
        resourceId,
        logger: this.logger,
        mastra: mastraProxy,
        memory,
        agentName: this.name,
        runtimeContext,
        model: typeof this.model === "function" ? await this.getModel({
          runtimeContext
        }) : this.model
      };
      return [k, makeCoreTool(tool, options)];
    }));
    const assignedToolEntriesConverted = Object.fromEntries(assignedCoreToolEntries.filter(entry => Boolean(entry)));
    toolsForRequest = {
      ...assignedToolEntriesConverted
    };
    return toolsForRequest;
  }
  async getToolsets({
    runId,
    threadId,
    resourceId,
    toolsets,
    runtimeContext,
    mastraProxy
  }) {
    let toolsForRequest = {};
    const memory = this.getMemory();
    const toolsFromToolsets = Object.values(toolsets || {});
    if (toolsFromToolsets.length > 0) {
      this.logger.debug(`[Agent:${this.name}] - Adding tools from toolsets ${Object.keys(toolsets || {}).join(", ")}`, {
        runId
      });
      for (const toolset of toolsFromToolsets) {
        for (const [toolName, tool] of Object.entries(toolset)) {
          const toolObj = tool;
          const options = {
            name: toolName,
            runId,
            threadId,
            resourceId,
            logger: this.logger,
            mastra: mastraProxy,
            memory,
            agentName: this.name,
            runtimeContext,
            model: typeof this.model === "function" ? await this.getModel({
              runtimeContext
            }) : this.model
          };
          const convertedToCoreTool = makeCoreTool(toolObj, options, "toolset");
          toolsForRequest[toolName] = convertedToCoreTool;
        }
      }
    }
    return toolsForRequest;
  }
  async getClientTools({
    runId,
    threadId,
    resourceId,
    runtimeContext,
    mastraProxy,
    clientTools
  }) {
    let toolsForRequest = {};
    const memory = this.getMemory();
    const clientToolsForInput = Object.entries(clientTools || {});
    if (clientToolsForInput.length > 0) {
      this.logger.debug(`[Agent:${this.name}] - Adding client tools ${Object.keys(clientTools || {}).join(", ")}`, {
        runId
      });
      for (const [toolName, tool] of clientToolsForInput) {
        const {
          execute,
          ...rest
        } = tool;
        const options = {
          name: toolName,
          runId,
          threadId,
          resourceId,
          logger: this.logger,
          mastra: mastraProxy,
          memory,
          agentName: this.name,
          runtimeContext,
          model: typeof this.model === "function" ? await this.getModel({
            runtimeContext
          }) : this.model
        };
        const convertedToCoreTool = makeCoreTool(rest, options, "client-tool");
        toolsForRequest[toolName] = convertedToCoreTool;
      }
    }
    return toolsForRequest;
  }
  async getWorkflowTools({
    runId,
    threadId,
    resourceId,
    runtimeContext
  }) {
    let convertedWorkflowTools = {};
    const workflows = await this.getWorkflows({
      runtimeContext
    });
    if (Object.keys(workflows).length > 0) {
      convertedWorkflowTools = Object.entries(workflows).reduce((memo, [workflowName, workflow]) => {
        memo[workflowName] = {
          description: workflow.description || `Workflow: ${workflowName}`,
          parameters: workflow.inputSchema || {
            type: "object",
            properties: {}
          },
          execute: async args => {
            try {
              this.logger.debug(`[Agent:${this.name}] - Executing workflow as tool ${workflowName}`, {
                name: workflowName,
                description: workflow.description,
                args,
                runId,
                threadId,
                resourceId
              });
              const run = workflow.createRun();
              const result = await run.start({
                inputData: args,
                runtimeContext
              });
              return result;
            } catch (err) {
              const mastraError = new MastraError({
                id: "AGENT_WORKFLOW_TOOL_EXECUTION_FAILED",
                domain: "AGENT" /* AGENT */,
                category: "USER" /* USER */,
                details: {
                  agentName: this.name,
                  runId: runId || "",
                  threadId: threadId || "",
                  resourceId: resourceId || ""
                },
                text: `[Agent:${this.name}] - Failed workflow tool execution`
              }, err);
              this.logger.trackException(mastraError);
              this.logger.error(mastraError.toString());
              throw mastraError;
            }
          }
        };
        return memo;
      }, {});
    }
    return convertedWorkflowTools;
  }
  async convertTools({
    toolsets,
    clientTools,
    threadId,
    resourceId,
    runId,
    runtimeContext
  }) {
    let mastraProxy = void 0;
    const logger = this.logger;
    if (this.#mastra) {
      mastraProxy = createMastraProxy({
        mastra: this.#mastra,
        logger
      });
    }
    const assignedTools = await this.getAssignedTools({
      runId,
      resourceId,
      threadId,
      runtimeContext,
      mastraProxy
    });
    const memoryTools = await this.getMemoryTools({
      runId,
      resourceId,
      threadId,
      runtimeContext,
      mastraProxy
    });
    const toolsetTools = await this.getToolsets({
      runId,
      resourceId,
      threadId,
      runtimeContext,
      mastraProxy,
      toolsets
    });
    const clientsideTools = await this.getClientTools({
      runId,
      resourceId,
      threadId,
      runtimeContext,
      mastraProxy,
      clientTools
    });
    const workflowTools = await this.getWorkflowTools({
      runId,
      resourceId,
      threadId,
      runtimeContext
    });
    return {
      ...assignedTools,
      ...memoryTools,
      ...toolsetTools,
      ...clientsideTools,
      ...workflowTools
    };
  }
  __primitive({
    instructions,
    messages,
    context,
    thread,
    memoryConfig,
    resourceId,
    runId,
    toolsets,
    clientTools,
    runtimeContext,
    generateMessageId
  }) {
    return {
      before: async () => {
        if (process.env.NODE_ENV !== "test") {
          this.logger.debug(`[Agents:${this.name}] - Starting generation`, {
            runId
          });
        }
        const memory = this.getMemory();
        const toolEnhancements = [
        // toolsets
        toolsets && Object.keys(toolsets || {}).length > 0 ? `toolsets present (${Object.keys(toolsets || {}).length} tools)` : void 0,
        // memory tools
        memory && resourceId ? "memory and resourceId available" : void 0].filter(Boolean).join(", ");
        this.logger.debug(`[Agent:${this.name}] - Enhancing tools: ${toolEnhancements}`, {
          runId,
          toolsets: toolsets ? Object.keys(toolsets) : void 0,
          clientTools: clientTools ? Object.keys(clientTools) : void 0,
          hasMemory: !!this.getMemory(),
          hasResourceId: !!resourceId
        });
        const threadId = thread?.id;
        const convertedTools = await this.convertTools({
          toolsets,
          clientTools,
          threadId,
          resourceId,
          runId,
          runtimeContext
        });
        const messageList = new MessageList({
          threadId,
          resourceId,
          generateMessageId
        }).addSystem({
          role: "system",
          content: instructions || `${this.instructions}.`
        }).add(context || [], "context");
        if (!memory || !threadId && !resourceId) {
          messageList.add(messages, "user");
          return {
            messageObjects: messageList.get.all.prompt(),
            convertedTools,
            messageList
          };
        }
        if (!threadId || !resourceId) {
          const mastraError = new MastraError({
            id: "AGENT_MEMORY_MISSING_RESOURCE_ID",
            domain: "AGENT" /* AGENT */,
            category: "USER" /* USER */,
            details: {
              agentName: this.name,
              threadId: threadId || "",
              resourceId: resourceId || ""
            },
            text: `A resourceId must be provided when passing a threadId and using Memory. Saw threadId ${threadId} but resourceId is ${resourceId}`
          });
          this.logger.trackException(mastraError);
          this.logger.error(mastraError.toString());
          throw mastraError;
        }
        const store = memory.constructor.name;
        this.logger.debug(`[Agent:${this.name}] - Memory persistence enabled: store=${store}, resourceId=${resourceId}`, {
          runId,
          resourceId,
          threadId,
          memoryStore: store
        });
        let threadObject = void 0;
        const existingThread = await memory.getThreadById({
          threadId
        });
        if (existingThread) {
          if (!existingThread.metadata && thread.metadata || thread.metadata && !(0, import_fast_deep_equal.default)(existingThread.metadata, thread.metadata)) {
            threadObject = await memory.saveThread({
              thread: {
                ...existingThread,
                metadata: thread.metadata
              },
              memoryConfig
            });
          } else {
            threadObject = existingThread;
          }
        } else {
          threadObject = await memory.createThread({
            threadId,
            metadata: thread.metadata,
            title: thread.title,
            memoryConfig,
            resourceId
          });
        }
        let [memoryMessages, memorySystemMessage, userContextMessage] = thread.id && memory ? await Promise.all([memory.rememberMessages({
          threadId: threadObject.id,
          resourceId,
          config: memoryConfig,
          // The new user messages aren't in the list yet cause we add memory messages first to try to make sure ordering is correct (memory comes before new user messages)
          vectorMessageSearch: new MessageList().add(messages, `user`).getLatestUserContent() || ""
        }).then(r => r.messagesV2), memory.getSystemMessage({
          threadId: threadObject.id,
          memoryConfig
        }), memory.getUserContextMessage({
          threadId: threadObject.id
        })]) : [[], null, null];
        this.logger.debug("Fetched messages from memory", {
          threadId: threadObject.id,
          runId,
          fetchedCount: memoryMessages.length
        });
        const resultsFromOtherThreads = memoryMessages.filter(m => m.threadId !== threadObject.id);
        if (resultsFromOtherThreads.length && !memorySystemMessage) {
          memorySystemMessage = ``;
        }
        if (resultsFromOtherThreads.length) {
          memorySystemMessage += `
The following messages were remembered from a different conversation:
<remembered_from_other_conversation>
${JSON.stringify(
          // get v1 since they're closer to CoreMessages (which get sent to the LLM) but also include timestamps
          new MessageList().add(resultsFromOtherThreads, "memory").get.all.v1())}
<end_remembered_from_other_conversation>`;
        }
        if (memorySystemMessage) {
          messageList.addSystem(memorySystemMessage, "memory");
        }
        if (userContextMessage) {
          messageList.add(userContextMessage, "context");
        }
        messageList.add(memoryMessages.filter(m => m.threadId === threadObject.id),
        // filter out messages from other threads. those are added to system message above
        "memory").add(messages, "user");
        const systemMessage = messageList.getSystemMessages()?.map(m => m.content)?.join(`
`) ?? void 0;
        const processedMemoryMessages = memory.processMessages({
          // these will be processed
          messages: messageList.get.remembered.v1(),
          // these are here for inspecting but shouldn't be returned by the processor
          // - ex TokenLimiter needs to measure all tokens even though it's only processing remembered messages
          newMessages: messageList.get.input.v1(),
          systemMessage,
          memorySystemMessage: memorySystemMessage || void 0
        });
        const processedList = new MessageList({
          threadId: threadObject.id,
          resourceId
        }).addSystem(instructions || `${this.instructions}.`).addSystem(memorySystemMessage).add(context || [], "context").add(userContextMessage || [], "context").add(processedMemoryMessages, "memory").add(messageList.get.input.v2(), "user").get.all.prompt();
        return {
          convertedTools,
          thread: threadObject,
          messageList,
          // add old processed messages + new input messages
          messageObjects: processedList
        };
      },
      after: async ({
        result,
        thread: threadAfter,
        threadId,
        memoryConfig: memoryConfig2,
        outputText,
        runId: runId2,
        messageList
      }) => {
        const resToLog = {
          text: result?.text,
          object: result?.object,
          toolResults: result?.toolResults,
          toolCalls: result?.toolCalls,
          usage: result?.usage,
          steps: result?.steps?.map(s => {
            return {
              stepType: s?.stepType,
              text: result?.text,
              object: result?.object,
              toolResults: result?.toolResults,
              toolCalls: result?.toolCalls,
              usage: result?.usage
            };
          })
        };
        this.logger.debug(`[Agent:${this.name}] - Post processing LLM response`, {
          runId: runId2,
          result: resToLog,
          threadId
        });
        const memory = this.getMemory();
        const thread2 = threadAfter || (threadId ? await memory?.getThreadById({
          threadId
        }) : void 0);
        if (memory && resourceId && thread2) {
          try {
            let responseMessages = result.response.messages;
            if (!responseMessages && result.object) {
              responseMessages = [{
                role: "assistant",
                content: [{
                  type: "text",
                  text: outputText
                  // outputText contains the stringified object
                }]
              }];
            }
            if (responseMessages) {
              messageList.add(responseMessages, "response");
            }
            void (async () => {
              if (!thread2.title?.startsWith("New Thread")) {
                return;
              }
              const config = memory.getMergedThreadConfig(memoryConfig2);
              const userMessage = this.getMostRecentUserMessage(messageList.get.all.ui());
              const title = config?.threads?.generateTitle && userMessage ? await this.genTitle(userMessage, runtimeContext) : void 0;
              if (!title) {
                return;
              }
              return memory.createThread({
                threadId: thread2.id,
                resourceId,
                memoryConfig: memoryConfig2,
                title,
                metadata: thread2.metadata
              });
            })();
            await memory.saveMessages({
              messages: messageList.drainUnsavedMessages(),
              memoryConfig: memoryConfig2
            });
          } catch (e) {
            if (e instanceof MastraError) {
              throw e;
            }
            const mastraError = new MastraError({
              id: "AGENT_MEMORY_PERSIST_RESPONSE_MESSAGES_FAILED",
              domain: "AGENT" /* AGENT */,
              category: "SYSTEM" /* SYSTEM */,
              details: {
                agentName: this.name,
                runId: runId2 || "",
                threadId: threadId || "",
                result: JSON.stringify(resToLog)
              }
            }, e);
            this.logger.trackException(mastraError);
            this.logger.error(mastraError.toString());
            throw mastraError;
          }
        }
        if (Object.keys(this.evals || {}).length > 0) {
          const userInputMessages = messageList.get.all.ui().filter(m => m.role === "user");
          const input = userInputMessages.map(message => typeof message.content === "string" ? message.content : "").join("\n");
          const runIdToUse = runId2 || crypto.randomUUID();
          for (const metric of Object.values(this.evals || {})) {
            executeHook("onGeneration" /* ON_GENERATION */, {
              input,
              output: outputText,
              runId: runIdToUse,
              metric,
              agentName: this.name,
              instructions: instructions || this.instructions
            });
          }
        }
      }
    };
  }
  async generate(messages, generateOptions = {}) {
    const defaultGenerateOptions = await this.getDefaultGenerateOptions({
      runtimeContext: generateOptions.runtimeContext
    });
    const {
      context,
      memoryOptions: memoryConfigFromArgs,
      resourceId: resourceIdFromArgs,
      maxSteps,
      onStepFinish,
      output,
      toolsets,
      clientTools,
      temperature,
      toolChoice = "auto",
      experimental_output,
      telemetry,
      runtimeContext = new RuntimeContext(),
      ...args
    } = Object.assign({}, defaultGenerateOptions, generateOptions);
    const generateMessageId = `experimental_generateMessageId` in args && typeof args.experimental_generateMessageId === `function` ? args.experimental_generateMessageId : void 0;
    const threadFromArgs = resolveThreadIdFromArgs({
      ...args,
      ...generateOptions
    });
    const resourceId = args.memory?.resource || resourceIdFromArgs;
    const memoryConfig = args.memory?.options || memoryConfigFromArgs;
    const runId = args.runId || randomUUID();
    const instructions = args.instructions || (await this.getInstructions({
      runtimeContext
    }));
    const llm = await this.getLLM({
      runtimeContext
    });
    const {
      before,
      after
    } = this.__primitive({
      messages,
      instructions,
      context,
      thread: threadFromArgs,
      memoryConfig,
      resourceId,
      runId,
      toolsets,
      clientTools,
      runtimeContext,
      generateMessageId
    });
    const {
      thread,
      messageObjects,
      convertedTools,
      messageList
    } = await before();
    const threadId = thread?.id;
    if (!output && experimental_output) {
      const result2 = await llm.__text({
        messages: messageObjects,
        tools: convertedTools,
        onStepFinish: result3 => {
          return onStepFinish?.(result3);
        },
        maxSteps,
        runId,
        temperature,
        toolChoice: toolChoice || "auto",
        experimental_output,
        threadId,
        resourceId,
        memory: this.getMemory(),
        runtimeContext,
        telemetry,
        ...args
      });
      const outputText2 = result2.text;
      await after({
        result: result2,
        threadId,
        thread,
        memoryConfig,
        outputText: outputText2,
        runId,
        messageList
      });
      const newResult = result2;
      newResult.object = result2.experimental_output;
      return newResult;
    }
    if (!output) {
      const result2 = await llm.__text({
        messages: messageObjects,
        tools: convertedTools,
        onStepFinish: result3 => {
          return onStepFinish?.(result3);
        },
        maxSteps,
        runId,
        temperature,
        toolChoice,
        telemetry,
        threadId,
        resourceId,
        memory: this.getMemory(),
        runtimeContext,
        ...args
      });
      const outputText2 = result2.text;
      await after({
        result: result2,
        thread,
        threadId,
        memoryConfig,
        outputText: outputText2,
        runId,
        messageList
      });
      return result2;
    }
    const result = await llm.__textObject({
      messages: messageObjects,
      tools: convertedTools,
      structuredOutput: output,
      onStepFinish: result2 => {
        return onStepFinish?.(result2);
      },
      maxSteps,
      runId,
      temperature,
      toolChoice,
      telemetry,
      memory: this.getMemory(),
      runtimeContext,
      ...args
    });
    const outputText = JSON.stringify(result.object);
    await after({
      result,
      thread,
      threadId,
      memoryConfig,
      outputText,
      runId,
      messageList
    });
    return result;
  }
  async stream(messages, streamOptions = {}) {
    const defaultStreamOptions = await this.getDefaultStreamOptions({
      runtimeContext: streamOptions.runtimeContext
    });
    const {
      context,
      memoryOptions: memoryConfigFromArgs,
      resourceId: resourceIdFromArgs,
      maxSteps,
      onFinish,
      onStepFinish,
      toolsets,
      clientTools,
      output,
      temperature,
      toolChoice = "auto",
      experimental_output,
      telemetry,
      runtimeContext = new RuntimeContext(),
      ...args
    } = Object.assign({}, defaultStreamOptions, streamOptions);
    const generateMessageId = `experimental_generateMessageId` in args && typeof args.experimental_generateMessageId === `function` ? args.experimental_generateMessageId : void 0;
    const threadFromArgs = resolveThreadIdFromArgs({
      ...args,
      ...streamOptions
    });
    const resourceId = args.memory?.resource || resourceIdFromArgs;
    const memoryConfig = args.memory?.options || memoryConfigFromArgs;
    const runId = args.runId || randomUUID();
    const instructions = args.instructions || (await this.getInstructions({
      runtimeContext
    }));
    const llm = await this.getLLM({
      runtimeContext
    });
    const {
      before,
      after
    } = this.__primitive({
      instructions,
      messages,
      context,
      thread: threadFromArgs,
      memoryConfig,
      resourceId,
      runId,
      toolsets,
      clientTools,
      runtimeContext,
      generateMessageId
    });
    const {
      thread,
      messageObjects,
      convertedTools,
      messageList
    } = await before();
    const threadId = thread?.id;
    if (!output && experimental_output) {
      this.logger.debug(`Starting agent ${this.name} llm stream call`, {
        runId
      });
      const streamResult = await llm.__stream({
        messages: messageObjects,
        temperature,
        tools: convertedTools,
        onStepFinish: result => {
          return onStepFinish?.(result);
        },
        onFinish: async result => {
          try {
            const outputText = result.text;
            await after({
              result,
              thread,
              threadId,
              memoryConfig,
              outputText,
              runId,
              messageList
            });
          } catch (e) {
            this.logger.error("Error saving memory on finish", {
              error: e,
              runId
            });
          }
          await onFinish?.(result);
        },
        maxSteps,
        runId,
        toolChoice,
        experimental_output,
        telemetry,
        memory: this.getMemory(),
        runtimeContext,
        threadId: thread?.id,
        resourceId,
        ...args
      });
      const newStreamResult = streamResult;
      newStreamResult.partialObjectStream = streamResult.experimental_partialOutputStream;
      return newStreamResult;
    } else if (!output) {
      this.logger.debug(`Starting agent ${this.name} llm stream call`, {
        runId
      });
      return llm.__stream({
        messages: messageObjects,
        temperature,
        tools: convertedTools,
        onStepFinish: result => {
          return onStepFinish?.(result);
        },
        onFinish: async result => {
          try {
            const outputText = result.text;
            await after({
              result,
              thread,
              threadId,
              memoryConfig,
              outputText,
              runId,
              messageList
            });
          } catch (e) {
            this.logger.error("Error saving memory on finish", {
              error: e,
              runId
            });
          }
          await onFinish?.(result);
        },
        maxSteps,
        runId,
        toolChoice,
        telemetry,
        memory: this.getMemory(),
        runtimeContext,
        threadId: thread?.id,
        resourceId,
        ...args
      });
    }
    this.logger.debug(`Starting agent ${this.name} llm streamObject call`, {
      runId
    });
    return llm.__streamObject({
      messages: messageObjects,
      tools: convertedTools,
      temperature,
      structuredOutput: output,
      onStepFinish: result => {
        return onStepFinish?.(result);
      },
      onFinish: async result => {
        try {
          const outputText = JSON.stringify(result.object);
          await after({
            result,
            thread,
            threadId,
            memoryConfig,
            outputText,
            runId,
            messageList
          });
        } catch (e) {
          this.logger.error("Error saving memory on finish", {
            error: e,
            runId
          });
        }
        await onFinish?.(result);
      },
      runId,
      toolChoice,
      telemetry,
      memory: this.getMemory(),
      runtimeContext,
      threadId: thread?.id,
      resourceId,
      ...args
    });
  }
  /**
   * Convert text to speech using the configured voice provider
   * @param input Text or text stream to convert to speech
   * @param options Speech options including speaker and provider-specific options
   * @returns Audio stream
   * @deprecated Use agent.voice.speak() instead
   */
  async speak(input, options) {
    if (!this.voice) {
      const mastraError = new MastraError({
        id: "AGENT_SPEAK_METHOD_VOICE_NOT_CONFIGURED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "No voice provider configured"
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    this.logger.warn("Warning: agent.speak() is deprecated. Please use agent.voice.speak() instead.");
    try {
      return this.voice.speak(input, options);
    } catch (e) {
      let err;
      if (e instanceof MastraError) {
        err = e;
      } else {
        err = new MastraError({
          id: "AGENT_SPEAK_METHOD_ERROR",
          domain: "AGENT" /* AGENT */,
          category: "UNKNOWN" /* UNKNOWN */,
          details: {
            agentName: this.name
          },
          text: "Error during agent speak"
        }, e);
      }
      this.logger.trackException(err);
      this.logger.error(err.toString());
      throw err;
    }
  }
  /**
   * Convert speech to text using the configured voice provider
   * @param audioStream Audio stream to transcribe
   * @param options Provider-specific transcription options
   * @returns Text or text stream
   * @deprecated Use agent.voice.listen() instead
   */
  async listen(audioStream, options) {
    if (!this.voice) {
      const mastraError = new MastraError({
        id: "AGENT_LISTEN_METHOD_VOICE_NOT_CONFIGURED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "No voice provider configured"
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    this.logger.warn("Warning: agent.listen() is deprecated. Please use agent.voice.listen() instead");
    try {
      return this.voice.listen(audioStream, options);
    } catch (e) {
      let err;
      if (e instanceof MastraError) {
        err = e;
      } else {
        err = new MastraError({
          id: "AGENT_LISTEN_METHOD_ERROR",
          domain: "AGENT" /* AGENT */,
          category: "UNKNOWN" /* UNKNOWN */,
          details: {
            agentName: this.name
          },
          text: "Error during agent listen"
        }, e);
      }
      this.logger.trackException(err);
      this.logger.error(err.toString());
      throw err;
    }
  }
  /**
   * Get a list of available speakers from the configured voice provider
   * @throws {Error} If no voice provider is configured
   * @returns {Promise<Array<{voiceId: string}>>} List of available speakers
   * @deprecated Use agent.voice.getSpeakers() instead
   */
  async getSpeakers() {
    if (!this.voice) {
      const mastraError = new MastraError({
        id: "AGENT_SPEAKERS_METHOD_VOICE_NOT_CONFIGURED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "No voice provider configured"
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    this.logger.warn("Warning: agent.getSpeakers() is deprecated. Please use agent.voice.getSpeakers() instead.");
    try {
      return await this.voice.getSpeakers();
    } catch (e) {
      let err;
      if (e instanceof MastraError) {
        err = e;
      } else {
        err = new MastraError({
          id: "AGENT_GET_SPEAKERS_METHOD_ERROR",
          domain: "AGENT" /* AGENT */,
          category: "UNKNOWN" /* UNKNOWN */,
          details: {
            agentName: this.name
          },
          text: "Error during agent getSpeakers"
        }, e);
      }
      this.logger.trackException(err);
      this.logger.error(err.toString());
      throw err;
    }
  }
  toStep() {
    const x = agentToStep(this);
    return new LegacyStep(x);
  }
};
Agent = /*@__PURE__*/(_ => {
  _init = __decoratorStart(_a);
  Agent = __decorateElement(_init, 0, "Agent", _Agent_decorators, Agent);
  __runInitializers(_init, 1, Agent);

  // src/workflows/legacy/utils.ts
  return Agent;
})();
// src/workflows/legacy/utils.ts
function isErrorEvent(stateEvent) {
  return stateEvent.type.startsWith("xstate.error.actor.");
}
function isTransitionEvent(stateEvent) {
  return stateEvent.type.startsWith("xstate.done.actor.");
}
function isVariableReference(value) {
  return typeof value === "object" && "step" in value && "path" in value;
}
function getStepResult(result) {
  if (result?.status === "success") return result.output;
  return void 0;
}
function getSuspendedPaths({
  value,
  path,
  suspendedPaths
}) {
  if (typeof value === "string") {
    if (value === "suspended") {
      suspendedPaths.add(path);
    }
  } else {
    Object.keys(value).forEach(key => getSuspendedPaths({
      value: value[key],
      path: path ? `${path}.${key}` : key,
      suspendedPaths
    }));
  }
}
function isFinalState(status) {
  return ["completed", "failed"].includes(status);
}
function isLimboState(status) {
  return status === "limbo";
}
function recursivelyCheckForFinalState({
  value,
  suspendedPaths,
  path
}) {
  if (typeof value === "string") {
    return isFinalState(value) || isLimboState(value) || suspendedPaths.has(path);
  }
  return Object.keys(value).every(key => recursivelyCheckForFinalState({
    value: value[key],
    suspendedPaths,
    path: path ? `${path}.${key}` : key
  }));
}
function getActivePathsAndStatus(value) {
  const paths = [];
  const traverse = (current, path = []) => {
    for (const [key, value2] of Object.entries(current)) {
      const currentPath = [...path, key];
      if (typeof value2 === "string") {
        paths.push({
          stepPath: currentPath,
          stepId: key,
          status: value2
        });
      } else if (typeof value2 === "object" && value2 !== null) {
        traverse(value2, currentPath);
      }
    }
  };
  traverse(value);
  return paths;
}
function mergeChildValue(startStepId, parent, child) {
  const traverse = current => {
    const obj = {};
    for (const [key, value] of Object.entries(current)) {
      if (key === startStepId) {
        obj[key] = {
          ...child
        };
      } else if (typeof value === "string") {
        obj[key] = value;
      } else if (typeof value === "object" && value !== null) {
        obj[key] = traverse(value);
      }
    }
    return obj;
  };
  return traverse(parent);
}
var updateStepInHierarchy = (value, targetStepId) => {
  const result = {};
  for (const key of Object.keys(value)) {
    const currentValue = value[key];
    if (key === targetStepId) {
      result[key] = "pending";
    } else if (typeof currentValue === "object" && currentValue !== null) {
      result[key] = updateStepInHierarchy(currentValue, targetStepId);
    } else {
      result[key] = currentValue;
    }
  }
  return result;
};
function getResultActivePaths(state) {
  const activePaths = getActivePathsAndStatus(state.value);
  const activePathsAndStatus = activePaths.reduce((acc, curr) => {
    const entry = {
      status: curr.status,
      stepPath: curr.stepPath
    };
    if (curr.status === "suspended") {
      entry.suspendPayload = state.context.steps[curr.stepId].suspendPayload;
      entry.stepPath = curr.stepPath;
    }
    acc.set(curr.stepId, entry);
    return acc;
  }, /* @__PURE__ */new Map());
  return activePathsAndStatus;
}
function isWorkflow(step) {
  return step instanceof LegacyWorkflow;
}
function isAgent(step) {
  return step instanceof Agent;
}
function resolveVariables({
  runId,
  logger,
  variables,
  context
}) {
  const resolvedData = {};
  for (const [key, variable] of Object.entries(variables)) {
    const sourceData = variable.step === "trigger" ? context.triggerData : getStepResult(context.steps[variable.step.id ?? variable.step.name]);
    logger.debug(`Got source data for ${key} variable from ${variable.step === "trigger" ? "trigger" : variable.step.id ?? variable.step.name}`, {
      sourceData,
      path: variable.path,
      runId
    });
    if (!sourceData && variable.step !== "trigger") {
      resolvedData[key] = void 0;
      continue;
    }
    const value = variable.path === "" || variable.path === "." ? sourceData : get(sourceData, variable.path);
    logger.debug(`Resolved variable ${key}`, {
      value,
      runId
    });
    resolvedData[key] = value;
  }
  return resolvedData;
}
function agentToStep(agent, {
  mastra
} = {}) {
  return {
    id: agent.name,
    inputSchema: z.object({
      prompt: z.string(),
      resourceId: z.string().optional(),
      threadId: z.string().optional()
    }),
    outputSchema: z.object({
      text: z.string()
    }),
    execute: async ({
      context,
      runId,
      mastra: mastraFromExecute
    }) => {
      const realMastra = mastraFromExecute ?? mastra;
      if (!realMastra) {
        throw new Error("Mastra instance not found");
      }
      agent.__registerMastra(realMastra);
      agent.__registerPrimitives({
        logger: realMastra.getLogger(),
        telemetry: realMastra.getTelemetry()
      });
      const result = await agent.generate(context.inputData.prompt, {
        runId,
        resourceId: context.inputData.resourceId,
        threadId: context.inputData.threadId
      });
      return {
        text: result.text
      };
    }
  };
}
function workflowToStep(workflow, {
  mastra
}) {
  workflow.setNested(true);
  return {
    id: workflow.name,
    workflow,
    workflowId: toCamelCaseWithRandomSuffix(workflow.name),
    execute: async ({
      context,
      suspend,
      emit,
      mastra: mastraFromExecute,
      runtimeContext
    }) => {
      const realMastra = mastraFromExecute ?? mastra;
      if (realMastra) {
        workflow.__registerMastra(realMastra);
        workflow.__registerPrimitives({
          logger: realMastra.getLogger(),
          telemetry: realMastra.getTelemetry()
        });
      }
      const run = context.isResume ? workflow.createRun({
        runId: context.isResume.runId
      }) : workflow.createRun();
      const unwatch = run.watch(state => {
        emit("state-update", workflow.name, state.results, {
          ...context,
          ...{
            [workflow.name]: state.results
          }
        });
      });
      const awaitedResult = context.isResume && context.isResume.stepId.includes(".") ? await run.resume({
        stepId: context.isResume.stepId.split(".").slice(1).join("."),
        context: context.inputData,
        runtimeContext
      }) : await run.start({
        triggerData: context.inputData,
        runtimeContext
      });
      unwatch();
      if (!awaitedResult) {
        throw new Error("LegacyWorkflow run failed");
      }
      if (awaitedResult.activePaths?.size > 0) {
        const suspendedStep = [...awaitedResult.activePaths.entries()].find(([, {
          status
        }]) => {
          return status === "suspended";
        });
        if (suspendedStep) {
          await suspend(suspendedStep[1].suspendPayload, {
            ...awaitedResult,
            runId: run.runId
          });
        }
      }
      return {
        ...awaitedResult,
        runId: run.runId
      };
    }
  };
}
function toCamelCaseWithRandomSuffix(str) {
  if (!str) return "";
  const normalizedStr = str.replace(/[-_]/g, " ");
  const words = normalizedStr.split(" ").filter(word => word.length > 0);
  const camelCase = words.map((word, index) => {
    word = word.replace(/[^a-zA-Z0-9]/g, "");
    if (index === 0) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join("");
  const randomString = generateRandomLetters(3);
  return camelCase + randomString;
}
function generateRandomLetters(length) {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}
function isConditionalKey(key) {
  return key.startsWith("__") && (key.includes("_if") || key.includes("_else"));
}
var Machine = class extends EventEmitter {
  logger;
  #mastra;
  #runtimeContext;
  #workflowInstance;
  #executionSpan;
  #stepGraph;
  #machine;
  #runId;
  #startStepId;
  name;
  #actor = null;
  #steps = {};
  #retryConfig;
  constructor({
    logger,
    mastra,
    runtimeContext,
    workflowInstance,
    executionSpan,
    name,
    runId,
    steps,
    stepGraph,
    retryConfig,
    startStepId
  }) {
    super();
    this.#mastra = mastra;
    this.#workflowInstance = workflowInstance;
    this.#runtimeContext = runtimeContext;
    this.#executionSpan = executionSpan;
    this.logger = logger;
    this.#runId = runId;
    this.#startStepId = startStepId;
    this.name = name;
    this.#stepGraph = stepGraph;
    this.#steps = steps;
    this.#retryConfig = retryConfig;
    this.initializeMachine();
  }
  get startStepId() {
    return this.#startStepId;
  }
  async execute({
    stepId,
    input,
    snapshot,
    resumeData
  } = {}) {
    if (snapshot) {
      this.logger.debug(`Workflow snapshot received`, {
        runId: this.#runId,
        snapshot
      });
    }
    const origSteps = input.steps;
    const isResumedInitialStep = this.#stepGraph?.initial[0]?.step?.id === stepId;
    if (isResumedInitialStep) {
      snapshot = void 0;
      input.steps = {};
    }
    this.logger.debug(`Machine input prepared`, {
      runId: this.#runId,
      input
    });
    const actorSnapshot = snapshot ? {
      ...snapshot,
      context: {
        ...input,
        inputData: {
          ...(snapshot?.context?.inputData || {}),
          ...resumeData
        },
        // ts-ignore is needed here because our snapshot types don't really match xstate snapshot types right now. We should fix this in general.
        // @ts-ignore
        isResume: {
          runId: snapshot?.context?.steps[stepId.split(".")?.[0]]?.output?.runId || this.#runId,
          stepId
        }
      }
    } : void 0;
    this.logger.debug(`Creating actor with configuration`, {
      input,
      actorSnapshot,
      runId: this.#runId,
      machineStates: this.#machine.config.states
    });
    this.#actor = createActor(this.#machine, {
      inspect: inspectionEvent => {
        this.logger.debug("XState inspection event", {
          type: inspectionEvent.type,
          event: inspectionEvent.event,
          runId: this.#runId
        });
      },
      input: {
        ...input,
        inputData: {
          ...(snapshot?.context?.inputData || {}),
          ...resumeData
        }
      },
      snapshot: actorSnapshot
    });
    this.#actor.start();
    if (stepId) {
      this.#actor.send({
        type: "RESET_TO_PENDING",
        stepId
      });
    }
    this.logger.debug("Actor started", {
      runId: this.#runId
    });
    return new Promise((resolve, reject) => {
      if (!this.#actor) {
        this.logger.error("Actor not initialized", {
          runId: this.#runId
        });
        const e = new Error("Actor not initialized");
        this.#executionSpan?.recordException(e);
        this.#executionSpan?.end();
        reject(e);
        return;
      }
      const suspendedPaths = /* @__PURE__ */new Set();
      this.#actor.subscribe(async state => {
        this.emit("state-update", this.#startStepId, state);
        getSuspendedPaths({
          value: state.value,
          path: "",
          suspendedPaths
        });
        const allStatesValue = state.value;
        const allStatesComplete = recursivelyCheckForFinalState({
          value: allStatesValue,
          suspendedPaths,
          path: ""
        });
        this.logger.debug("State completion check", {
          allStatesComplete,
          suspendedPaths: Array.from(suspendedPaths),
          runId: this.#runId
        });
        if (!allStatesComplete) {
          this.logger.debug("Not all states complete", {
            allStatesComplete,
            suspendedPaths: Array.from(suspendedPaths),
            runId: this.#runId
          });
          return;
        }
        try {
          this.logger.debug("All states complete", {
            runId: this.#runId
          });
          await this.#workflowInstance.persistWorkflowSnapshot();
          this.#cleanup();
          this.#executionSpan?.end();
          resolve({
            runId: this.#runId,
            results: isResumedInitialStep ? {
              ...origSteps,
              ...state.context.steps
            } : state.context.steps,
            activePaths: getResultActivePaths(state),
            timestamp: Date.now()
          });
        } catch (error) {
          this.logger.debug("Failed to persist final snapshot", {
            error
          });
          this.#cleanup();
          this.#executionSpan?.end();
          resolve({
            runId: this.#runId,
            results: isResumedInitialStep ? {
              ...origSteps,
              ...state.context.steps
            } : state.context.steps,
            activePaths: getResultActivePaths(state),
            timestamp: Date.now()
          });
        }
      });
    });
  }
  #cleanup() {
    if (this.#actor) {
      this.#actor.stop();
      this.#actor = null;
    }
    this.removeAllListeners();
  }
  #makeDelayMap() {
    const delayMap = {};
    Object.keys(this.#steps).forEach(stepId => {
      delayMap[stepId] = this.#steps[stepId]?.step?.retryConfig?.delay || this.#retryConfig?.delay || 1e3;
    });
    return delayMap;
  }
  #getDefaultActions() {
    return {
      updateStepResult: assign({
        steps: ({
          context,
          event
        }) => {
          if (!isTransitionEvent(event)) return context.steps;
          const {
            stepId,
            result
          } = event.output;
          return {
            ...context.steps,
            [stepId]: {
              status: "success",
              output: result
            }
          };
        }
      }),
      setStepError: assign({
        steps: ({
          context,
          event
        }, params) => {
          if (!isErrorEvent(event)) return context.steps;
          const {
            stepId
          } = params;
          if (!stepId) return context.steps;
          return {
            ...context.steps,
            [stepId]: {
              status: "failed",
              error: event.error.message
            }
          };
        }
      }),
      notifyStepCompletion: async (_, params) => {
        const {
          stepId
        } = params;
        this.logger.debug(`Step ${stepId} completed`);
      },
      snapshotStep: assign({
        _snapshot: ({}, params) => {
          const {
            stepId
          } = params;
          return {
            stepId
          };
        }
      }),
      persistSnapshot: async ({
        context
      }) => {
        if (context._snapshot) {
          await this.#workflowInstance.persistWorkflowSnapshot();
        }
        return;
      },
      decrementAttemptCount: assign({
        attempts: ({
          context,
          event
        }, params) => {
          if (!isTransitionEvent(event)) return context.attempts;
          const {
            stepId
          } = params;
          const attemptCount = context.attempts[stepId];
          if (attemptCount === void 0) return context.attempts;
          return {
            ...context.attempts,
            [stepId]: attemptCount - 1
          };
        }
      })
    };
  }
  #getDefaultActors() {
    return {
      resolverFunction: fromPromise(async ({
        input
      }) => {
        const {
          stepNode,
          context
        } = input;
        const attemptCount = context.attempts[stepNode.id];
        const resolvedData = this.#resolveVariables({
          stepConfig: stepNode.config,
          context,
          stepId: stepNode.id
        });
        this.logger.debug(`Resolved variables for ${stepNode.id}`, {
          resolvedData,
          runId: this.#runId
        });
        const logger = this.logger;
        let mastraProxy = void 0;
        if (this.#mastra) {
          mastraProxy = createMastraProxy({
            mastra: this.#mastra,
            logger
          });
        }
        let result = void 0;
        try {
          result = await stepNode.config.handler({
            context: {
              ...context,
              inputData: {
                ...(context?.inputData || {}),
                ...resolvedData
              },
              getStepResult: stepId => {
                const resolvedStepId = typeof stepId === "string" ? stepId : stepId.id;
                if (resolvedStepId === "trigger") {
                  return context.triggerData;
                }
                const result2 = context.steps[resolvedStepId];
                if (result2 && result2.status === "success") {
                  return result2.output;
                }
                return void 0;
              }
            },
            emit: (event, ...args) => {
              this.emit(event, ...args);
            },
            suspend: async (payload, softSuspend) => {
              await this.#workflowInstance.suspend(stepNode.id, this);
              if (this.#actor) {
                context.steps[stepNode.id] = {
                  status: "suspended",
                  suspendPayload: payload,
                  output: softSuspend
                };
                this.logger.debug(`Sending SUSPENDED event for step ${stepNode.id}`);
                this.#actor?.send({
                  type: "SUSPENDED",
                  suspendPayload: payload,
                  stepId: stepNode.id,
                  softSuspend
                });
              } else {
                this.logger.debug(`Actor not available for step ${stepNode.id}`);
              }
            },
            runId: this.#runId,
            mastra: mastraProxy,
            runtimeContext: this.#runtimeContext
          });
        } catch (error) {
          this.logger.debug(`Step ${stepNode.id} failed`, {
            stepId: stepNode.id,
            error,
            runId: this.#runId
          });
          this.logger.debug(`Attempt count for step ${stepNode.id}`, {
            attemptCount,
            attempts: context.attempts,
            runId: this.#runId,
            stepId: stepNode.id
          });
          if (!attemptCount || attemptCount < 0) {
            return {
              type: "STEP_FAILED",
              error: error instanceof Error ? error.message : `Step:${stepNode.id} failed with error: ${error}`,
              stepId: stepNode.id
            };
          }
          return {
            type: "STEP_WAITING",
            stepId: stepNode.id
          };
        }
        this.logger.debug(`Step ${stepNode.id} result`, {
          stepId: stepNode.id,
          result,
          runId: this.#runId
        });
        return {
          type: "STEP_SUCCESS",
          result,
          stepId: stepNode.id
        };
      }),
      conditionCheck: fromPromise(async ({
        input
      }) => {
        const {
          context,
          stepNode
        } = input;
        const stepConfig = stepNode.config;
        this.logger.debug(`Checking conditions for step ${stepNode.id}`, {
          stepId: stepNode.id,
          runId: this.#runId
        });
        if (!stepConfig?.when) {
          return {
            type: "CONDITIONS_MET"
          };
        }
        this.logger.debug(`Checking conditions for step ${stepNode.id}`, {
          stepId: stepNode.id,
          runId: this.#runId
        });
        if (typeof stepConfig?.when === "function") {
          let conditionMet = await stepConfig.when({
            context: {
              ...context,
              getStepResult: stepId => {
                const resolvedStepId = typeof stepId === "string" ? stepId : stepId.id;
                if (resolvedStepId === "trigger") {
                  return context.triggerData;
                }
                const result = context.steps[resolvedStepId];
                if (result && result.status === "success") {
                  return result.output;
                }
                return void 0;
              }
            },
            mastra: this.#mastra
          });
          if (conditionMet === "abort" /* ABORT */) {
            conditionMet = false;
          } else if (conditionMet === "continue_failed" /* CONTINUE_FAILED */) {
            return {
              type: "CONDITIONS_SKIP_TO_COMPLETED"
            };
          } else if (conditionMet === "limbo" /* LIMBO */) {
            return {
              type: "CONDITIONS_LIMBO"
            };
          } else if (conditionMet) {
            this.logger.debug(`Condition met for step ${stepNode.id}`, {
              stepId: stepNode.id,
              runId: this.#runId
            });
            return {
              type: "CONDITIONS_MET"
            };
          }
          if (isConditionalKey(stepNode.id)) {
            return {
              type: "CONDITIONS_LIMBO"
            };
          }
          return this.#workflowInstance.hasSubscribers(stepNode.id) ? {
            type: "CONDITIONS_SKIPPED"
          } : {
            type: "CONDITIONS_LIMBO"
          };
        } else {
          const conditionMet = this.#evaluateCondition(stepConfig.when, context);
          if (!conditionMet) {
            return {
              type: "CONDITION_FAILED",
              error: `Step:${stepNode.id} condition check failed`
            };
          }
        }
        return {
          type: "CONDITIONS_MET"
        };
      }),
      spawnSubscriberFunction: fromPromise(async ({
        input
      }) => {
        const {
          parentStepId,
          context
        } = input;
        const result = await this.#workflowInstance.runMachine(parentStepId, context, this.#runtimeContext);
        return Promise.resolve({
          steps: result.reduce((acc, r) => {
            return {
              ...acc,
              ...r?.results
            };
          }, {})
        });
      })
    };
  }
  #resolveVariables({
    stepConfig,
    context,
    stepId
  }) {
    this.logger.debug(`Resolving variables for step ${stepId}`, {
      stepId,
      runId: this.#runId
    });
    const resolvedData = {};
    for (const [key, variable] of Object.entries(stepConfig.data)) {
      const sourceData = variable.step === "trigger" ? context.triggerData : getStepResult(context.steps[variable.step.id]);
      this.logger.debug(`Got source data for ${key} variable from ${variable.step === "trigger" ? "trigger" : variable.step.id}`, {
        sourceData,
        path: variable.path,
        runId: this.#runId
      });
      if (!sourceData && variable.step !== "trigger") {
        resolvedData[key] = void 0;
        continue;
      }
      const value = variable.path === "" || variable.path === "." ? sourceData : get(sourceData, variable.path);
      this.logger.debug(`Resolved variable ${key}`, {
        value,
        runId: this.#runId
      });
      resolvedData[key] = value;
    }
    return resolvedData;
  }
  initializeMachine() {
    const machine = setup({
      types: {},
      delays: this.#makeDelayMap(),
      actions: this.#getDefaultActions(),
      actors: this.#getDefaultActors()
    }).createMachine({
      id: this.name,
      type: "parallel",
      context: ({
        input
      }) => ({
        ...input
      }),
      states: this.#buildStateHierarchy(this.#stepGraph)
    });
    this.#machine = machine;
    return machine;
  }
  #buildStateHierarchy(stepGraph) {
    const states = {};
    stepGraph.initial.forEach(stepNode => {
      const nextSteps = [...(stepGraph[stepNode.id] || [])];
      states[stepNode.id] = {
        ...this.#buildBaseState(stepNode, nextSteps)
      };
    });
    return states;
  }
  #buildBaseState(stepNode, nextSteps = []) {
    const nextStep = nextSteps.shift();
    return {
      initial: "pending",
      on: {
        RESET_TO_PENDING: {
          target: ".pending"
          // Note the dot to target child state
        }
      },
      states: {
        pending: {
          entry: () => {
            this.logger.debug(`Step ${stepNode.id} pending`, {
              stepId: stepNode.id,
              runId: this.#runId
            });
          },
          exit: () => {
            this.logger.debug(`Step ${stepNode.id} finished pending`, {
              stepId: stepNode.id,
              runId: this.#runId
            });
          },
          invoke: {
            src: "conditionCheck",
            input: ({
              context
            }) => {
              return {
                context,
                stepNode
              };
            },
            onDone: [{
              guard: ({
                event
              }) => {
                return event.output.type === "SUSPENDED";
              },
              target: "suspended",
              actions: [assign({
                steps: ({
                  context,
                  event
                }) => {
                  if (event.output.type !== "SUSPENDED") return context.steps;
                  if (event.output.softSuspend) {
                    return {
                      ...context.steps,
                      [stepNode.id]: {
                        status: "suspended",
                        ...(context.steps?.[stepNode.id] || {}),
                        output: event.output.softSuspend
                      }
                    };
                  }
                  return {
                    ...context.steps,
                    [stepNode.id]: {
                      status: "suspended",
                      ...(context.steps?.[stepNode.id] || {})
                    }
                  };
                },
                attempts: ({
                  context,
                  event
                }) => {
                  if (event.output.type !== "SUSPENDED") return context.attempts;
                  return {
                    ...context.attempts,
                    [stepNode.id]: stepNode.step.retryConfig?.attempts || 0
                  };
                }
              })]
            }, {
              guard: ({
                event
              }) => {
                return event.output.type === "WAITING";
              },
              target: "waiting",
              actions: [{
                type: "decrementAttemptCount",
                params: {
                  stepId: stepNode.id
                }
              }, assign({
                steps: ({
                  context,
                  event
                }) => {
                  if (event.output.type !== "WAITING") return context.steps;
                  return {
                    ...context.steps,
                    [stepNode.id]: {
                      status: "waiting"
                    }
                  };
                }
              })]
            }, {
              guard: ({
                event
              }) => {
                return event.output.type === "CONDITIONS_MET";
              },
              target: "executing"
            }, {
              guard: ({
                event
              }) => {
                return event.output.type === "CONDITIONS_SKIP_TO_COMPLETED";
              },
              target: "completed"
            }, {
              guard: ({
                event
              }) => {
                return event.output.type === "CONDITIONS_SKIPPED";
              },
              actions: assign({
                steps: ({
                  context
                }) => {
                  const newStep = {
                    ...context.steps,
                    [stepNode.id]: {
                      status: "skipped"
                    }
                  };
                  this.logger.debug(`Step ${stepNode.id} skipped`, {
                    stepId: stepNode.id,
                    runId: this.#runId
                  });
                  return newStep;
                }
              }),
              target: "runningSubscribers"
            }, {
              guard: ({
                event
              }) => {
                return event.output.type === "CONDITIONS_LIMBO";
              },
              target: "limbo",
              actions: assign({
                steps: ({
                  context
                }) => {
                  const newStep = {
                    ...context.steps,
                    [stepNode.id]: {
                      status: "skipped"
                    }
                  };
                  this.logger.debug(`Step ${stepNode.id} skipped`, {
                    stepId: stepNode.id,
                    runId: this.#runId
                  });
                  return newStep;
                }
              })
            }, {
              guard: ({
                event
              }) => {
                return event.output.type === "CONDITION_FAILED";
              },
              target: "failed",
              actions: assign({
                steps: ({
                  context,
                  event
                }) => {
                  if (event.output.type !== "CONDITION_FAILED") return context.steps;
                  this.logger.debug(`Workflow condition check failed`, {
                    error: event.output.error,
                    stepId: stepNode.id
                  });
                  return {
                    ...context.steps,
                    [stepNode.id]: {
                      status: "failed",
                      error: event.output.error
                    }
                  };
                }
              })
            }]
          }
        },
        waiting: {
          entry: () => {
            this.logger.debug(`Step ${stepNode.id} waiting`, {
              stepId: stepNode.id,
              timestamp: (/* @__PURE__ */new Date()).toISOString(),
              runId: this.#runId
            });
          },
          exit: () => {
            this.logger.debug(`Step ${stepNode.id} finished waiting`, {
              stepId: stepNode.id,
              timestamp: (/* @__PURE__ */new Date()).toISOString(),
              runId: this.#runId
            });
          },
          after: {
            [stepNode.id]: {
              target: "pending"
            }
          }
        },
        limbo: {
          // no target, will stay in limbo indefinitely
          entry: () => {
            this.logger.debug(`Step ${stepNode.id} limbo`, {
              stepId: stepNode.id,
              timestamp: (/* @__PURE__ */new Date()).toISOString(),
              runId: this.#runId
            });
          },
          exit: () => {
            this.logger.debug(`Step ${stepNode.id} finished limbo`, {
              stepId: stepNode.id,
              timestamp: (/* @__PURE__ */new Date()).toISOString(),
              runId: this.#runId
            });
          }
        },
        suspended: {
          type: "final",
          entry: [() => {
            this.logger.debug(`Step ${stepNode.id} suspended`, {
              stepId: stepNode.id,
              runId: this.#runId
            });
          }, assign({
            steps: ({
              context,
              event
            }) => {
              return {
                ...context.steps,
                [stepNode.id]: {
                  ...(context?.steps?.[stepNode.id] || {}),
                  status: "suspended",
                  suspendPayload: event.type === "SUSPENDED" ? event.suspendPayload : void 0,
                  output: event.type === "SUSPENDED" ? event.softSuspend : void 0
                }
              };
            }
          })]
        },
        executing: {
          entry: () => {
            this.logger.debug(`Step ${stepNode.id} executing`, {
              stepId: stepNode.id,
              runId: this.#runId
            });
          },
          on: {
            SUSPENDED: {
              target: "suspended",
              actions: [assign({
                steps: ({
                  context,
                  event
                }) => {
                  return {
                    ...context.steps,
                    [stepNode.id]: {
                      status: "suspended",
                      suspendPayload: event.type === "SUSPENDED" ? event.suspendPayload : void 0,
                      output: event.type === "SUSPENDED" ? event.softSuspend : void 0
                    }
                  };
                }
              })]
            }
          },
          invoke: {
            src: "resolverFunction",
            input: ({
              context
            }) => ({
              context,
              stepNode
            }),
            onDone: [{
              guard: ({
                event
              }) => {
                return event.output.type === "STEP_FAILED";
              },
              target: "failed",
              actions: assign({
                steps: ({
                  context,
                  event
                }) => {
                  if (event.output.type !== "STEP_FAILED") return context.steps;
                  const newStep = {
                    ...context.steps,
                    [stepNode.id]: {
                      status: "failed",
                      error: event.output.error
                    }
                  };
                  this.logger.debug(`Step ${stepNode.id} failed`, {
                    error: event.output.error,
                    stepId: stepNode.id
                  });
                  return newStep;
                }
              })
            }, {
              guard: ({
                event
              }) => {
                return event.output.type === "STEP_SUCCESS";
              },
              actions: [({
                event
              }) => {
                this.logger.debug(`Step ${stepNode.id} finished executing`, {
                  stepId: stepNode.id,
                  output: event.output,
                  runId: this.#runId
                });
              }, {
                type: "updateStepResult",
                params: {
                  stepId: stepNode.id
                }
              }, {
                type: "spawnSubscribers",
                params: {
                  stepId: stepNode.id
                }
              }],
              target: "runningSubscribers"
            }, {
              guard: ({
                event
              }) => {
                return event.output.type === "STEP_WAITING";
              },
              target: "waiting",
              actions: [{
                type: "decrementAttemptCount",
                params: {
                  stepId: stepNode.id
                }
              }, assign({
                steps: ({
                  context,
                  event
                }) => {
                  if (event.output.type !== "STEP_WAITING") return context.steps;
                  return {
                    ...context.steps,
                    [stepNode.id]: {
                      status: "waiting"
                    }
                  };
                }
              })]
            }],
            onError: {
              target: "failed",
              actions: [{
                type: "setStepError",
                params: {
                  stepId: stepNode.id
                }
              }]
            }
          }
        },
        runningSubscribers: {
          entry: () => {
            this.logger.debug(`Step ${stepNode.id} running subscribers`, {
              stepId: stepNode.id,
              runId: this.#runId
            });
          },
          exit: () => {
            this.logger.debug(`Step ${stepNode.id} finished running subscribers`, {
              stepId: stepNode.id,
              runId: this.#runId
            });
          },
          invoke: {
            src: "spawnSubscriberFunction",
            input: ({
              context
            }) => ({
              parentStepId: stepNode.id,
              context
            }),
            onDone: {
              target: nextStep ? nextStep.id : "completed",
              actions: [assign({
                steps: ({
                  context,
                  event
                }) => ({
                  ...context.steps,
                  ...event.output.steps
                })
              }), () => this.logger.debug(`Subscriber execution completed`, {
                stepId: stepNode.id
              })]
            },
            onError: {
              target: nextStep ? nextStep.id : "completed",
              actions: ({
                event
              }) => {
                this.logger.debug(`Subscriber execution failed`, {
                  error: event.error,
                  stepId: stepNode.id
                });
              }
            }
          }
        },
        completed: {
          type: "final",
          entry: [{
            type: "notifyStepCompletion",
            params: {
              stepId: stepNode.id
            }
          }, {
            type: "snapshotStep",
            params: {
              stepId: stepNode.id
            }
          }, {
            type: "persistSnapshot"
          }]
        },
        failed: {
          type: "final",
          entry: [{
            type: "notifyStepCompletion",
            params: {
              stepId: stepNode.id
            }
          }, {
            type: "snapshotStep",
            params: {
              stepId: stepNode.id
            }
          }, {
            type: "persistSnapshot"
          }]
        },
        // build chain of next steps recursively
        ...(nextStep ? {
          [nextStep.id]: {
            ...this.#buildBaseState(nextStep, nextSteps)
          }
        } : {})
      }
    };
  }
  #evaluateCondition(condition, context) {
    let andBranchResult = true;
    let baseResult = true;
    let orBranchResult = true;
    const simpleCondition = Object.entries(condition).find(([key]) => key.includes("."));
    if (simpleCondition) {
      const [key, queryValue] = simpleCondition;
      const [stepId, ...pathParts] = key.split(".");
      const path = pathParts.join(".");
      const sourceData = stepId === "trigger" ? context.triggerData : getStepResult(context.steps[stepId]);
      this.logger.debug(`Got condition data from step ${stepId}`, {
        stepId,
        sourceData,
        runId: this.#runId
      });
      if (!sourceData) {
        return false;
      }
      let value = get(sourceData, path);
      if (stepId !== "trigger" && path === "status" && !value) {
        value = "success";
      }
      if (typeof queryValue === "object" && queryValue !== null) {
        baseResult = sift(queryValue)(value);
      } else {
        baseResult = value === queryValue;
      }
    }
    if ("ref" in condition) {
      const {
        ref,
        query
      } = condition;
      const sourceData = ref.step === "trigger" ? context.triggerData : getStepResult(context.steps[ref.step.id]);
      this.logger.debug(`Got condition data from ${ref.step === "trigger" ? "trigger" : ref.step.id}`, {
        sourceData,
        runId: this.#runId
      });
      if (!sourceData) {
        return false;
      }
      let value = get(sourceData, ref.path);
      if (ref.step !== "trigger" && ref.path === "status" && !value) {
        value = "success";
      }
      baseResult = sift(query)(value);
    }
    if ("and" in condition) {
      andBranchResult = condition.and.every(cond => this.#evaluateCondition(cond, context));
      this.logger.debug(`Evaluated AND condition`, {
        andBranchResult,
        runId: this.#runId
      });
    }
    if ("or" in condition) {
      orBranchResult = condition.or.some(cond => this.#evaluateCondition(cond, context));
      this.logger.debug(`Evaluated OR condition`, {
        orBranchResult,
        runId: this.#runId
      });
    }
    if ("not" in condition) {
      baseResult = !this.#evaluateCondition(condition.not, context);
      this.logger.debug(`Evaluated NOT condition`, {
        baseResult,
        runId: this.#runId
      });
    }
    const finalResult = baseResult && andBranchResult && orBranchResult;
    this.logger.debug(`Evaluated condition`, {
      finalResult,
      runId: this.#runId
    });
    return finalResult;
  }
  getSnapshot() {
    const snapshot = this.#actor?.getSnapshot();
    return snapshot;
  }
};

// src/workflows/legacy/workflow-instance.ts
var WorkflowInstance = class {
  name;
  #mastra;
  #machines = {};
  logger;
  #steps = {};
  #stepGraph;
  #stepSubscriberGraph = {};
  #retryConfig;
  events;
  #runId;
  #state = null;
  #executionSpan;
  #onStepTransition = /* @__PURE__ */new Set();
  #onFinish;
  #resultMapping;
  // indexed by stepId
  #suspendedMachines = {};
  // {step1&&step2: {step1: true, step2: true}}
  #compoundDependencies = {};
  constructor({
    name,
    logger,
    steps,
    runId,
    retryConfig,
    mastra,
    stepGraph,
    stepSubscriberGraph,
    onFinish,
    onStepTransition,
    resultMapping,
    events
  }) {
    this.name = name;
    this.logger = logger;
    this.#steps = steps;
    this.#stepGraph = stepGraph;
    this.#stepSubscriberGraph = stepSubscriberGraph;
    this.#retryConfig = retryConfig;
    this.#mastra = mastra;
    this.#runId = runId ?? crypto.randomUUID();
    this.#onFinish = onFinish;
    this.#resultMapping = resultMapping;
    this.events = events;
    onStepTransition?.forEach(handler => this.#onStepTransition.add(handler));
    this.#initializeCompoundDependencies();
  }
  setState(state) {
    this.#state = state;
  }
  get runId() {
    return this.#runId;
  }
  get executionSpan() {
    return this.#executionSpan;
  }
  watch(onTransition) {
    this.#onStepTransition.add(onTransition);
    return () => {
      this.#onStepTransition.delete(onTransition);
    };
  }
  async start({
    triggerData,
    runtimeContext
  } = {}) {
    const results = await this.execute({
      triggerData,
      runtimeContext: runtimeContext ?? new RuntimeContext()
    });
    if (this.#onFinish) {
      const activePathsObj = Object.fromEntries(results.activePaths);
      const hasSuspendedActivePaths = Object.values(activePathsObj).some(value => value.status === "suspended");
      if (!hasSuspendedActivePaths) {
        this.#onFinish();
      }
    }
    return {
      ...results,
      runId: this.runId
    };
  }
  isCompoundDependencyMet(stepKey) {
    if (!this.#isCompoundKey(stepKey)) return true;
    const dependencies = this.#compoundDependencies[stepKey];
    return dependencies ? Object.values(dependencies).every(status => status === true) : true;
  }
  async execute({
    triggerData,
    snapshot,
    stepId,
    resumeData,
    runtimeContext
  } = {
    runtimeContext: new RuntimeContext()
  }) {
    this.#executionSpan = this.#mastra?.getTelemetry()?.tracer.startSpan(`workflow.${this.name}.execute`, {
      attributes: {
        componentName: this.name,
        runId: this.runId
      }
    });
    let machineInput = {
      // Maintain the original step results and their output
      steps: {},
      triggerData: triggerData || {},
      attempts: Object.keys(this.#steps).reduce((acc, stepKey) => {
        acc[stepKey] = this.#steps[stepKey]?.step?.retryConfig?.attempts || this.#retryConfig?.attempts || 0;
        return acc;
      }, {})
    };
    let stepGraph = this.#stepGraph;
    let startStepId = "trigger";
    if (snapshot) {
      const runState = snapshot;
      if (stepId && runState?.suspendedSteps?.[stepId]) {
        startStepId = runState.suspendedSteps[stepId];
        stepGraph = this.#stepSubscriberGraph[startStepId] ?? this.#stepGraph;
        machineInput = runState.context;
      }
    }
    const defaultMachine = new Machine({
      logger: this.logger,
      mastra: this.#mastra,
      runtimeContext,
      workflowInstance: this,
      name: this.name,
      runId: this.runId,
      steps: this.#steps,
      stepGraph,
      executionSpan: this.#executionSpan,
      startStepId,
      retryConfig: this.#retryConfig
    });
    this.#machines[startStepId] = defaultMachine;
    const stateUpdateHandler = (startStepId2, state, ctx) => {
      let fullState = {
        value: {},
        context: {}
      };
      if (ctx) {
        fullState["value"] = state;
        fullState["context"] = ctx;
      } else {
        fullState = state;
      }
      if (startStepId2 === "trigger") {
        this.#state = fullState.value;
      } else {
        this.#state = mergeChildValue(startStepId2, this.#state, fullState.value);
      }
      const now = Date.now();
      if (this.#onStepTransition) {
        this.#onStepTransition.forEach(onTransition => {
          void onTransition({
            runId: this.#runId,
            results: fullState.context.steps,
            activePaths: getResultActivePaths(fullState),
            timestamp: now
          });
        });
      }
    };
    defaultMachine.on("state-update", stateUpdateHandler);
    const {
      results,
      activePaths
    } = await defaultMachine.execute({
      snapshot,
      stepId,
      input: machineInput,
      resumeData
    });
    await this.persistWorkflowSnapshot();
    const result = {
      results,
      activePaths,
      timestamp: Date.now()
    };
    if (this.#resultMapping) {
      result.result = resolveVariables({
        runId: this.#runId,
        logger: this.logger,
        variables: this.#resultMapping,
        context: {
          steps: results,
          triggerData}
      });
    }
    return result;
  }
  hasSubscribers(stepId) {
    return Object.keys(this.#stepSubscriberGraph).some(key => key.split("&&").includes(stepId));
  }
  async runMachine(parentStepId, input, runtimeContext = new RuntimeContext()) {
    const stepStatus = input.steps[parentStepId]?.status;
    const subscriberKeys = Object.keys(this.#stepSubscriberGraph).filter(key => key.split("&&").includes(parentStepId));
    subscriberKeys.forEach(key => {
      if (["success", "failure", "skipped"].includes(stepStatus) && this.#isCompoundKey(key)) {
        this.#compoundDependencies[key][parentStepId] = true;
      }
    });
    const stateUpdateHandler = (startStepId, state, ctx) => {
      let fullState = {
        value: {},
        context: {}
      };
      if (ctx) {
        fullState["value"] = state;
        fullState["context"] = ctx;
      } else {
        fullState = state;
      }
      if (startStepId === "trigger") {
        this.#state = fullState.value;
      } else {
        this.#state = mergeChildValue(startStepId, this.#state, fullState.value);
      }
      const now = Date.now();
      if (this.#onStepTransition) {
        this.#onStepTransition.forEach(onTransition => {
          void onTransition({
            runId: this.#runId,
            results: fullState.context.steps,
            activePaths: getResultActivePaths(fullState),
            timestamp: now
          });
        });
      }
    };
    const results = await Promise.all(subscriberKeys.map(async key => {
      if (!this.#stepSubscriberGraph[key] || !this.isCompoundDependencyMet(key)) {
        return;
      }
      this.#resetCompoundDependency(key);
      const machine = new Machine({
        logger: this.logger,
        mastra: this.#mastra,
        runtimeContext,
        workflowInstance: this,
        name: parentStepId === "trigger" ? this.name : `${this.name}-${parentStepId}`,
        runId: this.runId,
        steps: this.#steps,
        stepGraph: this.#stepSubscriberGraph[key],
        executionSpan: this.#executionSpan,
        startStepId: parentStepId
      });
      machine.on("state-update", stateUpdateHandler);
      this.#machines[parentStepId] = machine;
      return machine.execute({
        input
      });
    }));
    return results;
  }
  async suspend(stepId, machine) {
    this.#suspendedMachines[stepId] = machine;
  }
  /**
   * Persists the workflow state to the database
   */
  async persistWorkflowSnapshot() {
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Snapshot cannot be persisted. Mastra engine is not initialized", {
        runId: this.#runId
      });
      return;
    }
    const existingSnapshot = await storage.loadWorkflowSnapshot({
      workflowName: this.name,
      runId: this.#runId
    });
    const machineSnapshots = {};
    for (const [stepId, machine] of Object.entries(this.#machines)) {
      const machineSnapshot = machine?.getSnapshot();
      if (machineSnapshot) {
        machineSnapshots[stepId] = {
          ...machineSnapshot
        };
      }
    }
    let snapshot = machineSnapshots["trigger"];
    delete machineSnapshots["trigger"];
    const suspendedSteps = Object.entries(this.#suspendedMachines).reduce((acc, [stepId, machine]) => {
      acc[stepId] = machine.startStepId;
      return acc;
    }, {});
    if (!snapshot && existingSnapshot) {
      existingSnapshot.childStates = {
        ...existingSnapshot.childStates,
        ...machineSnapshots
      };
      existingSnapshot.suspendedSteps = {
        ...existingSnapshot.suspendedSteps,
        ...suspendedSteps
      };
      await storage.persistWorkflowSnapshot({
        workflowName: this.name,
        runId: this.#runId,
        snapshot: existingSnapshot
      });
      return;
    } else if (snapshot && !existingSnapshot) {
      snapshot.suspendedSteps = suspendedSteps;
      snapshot.childStates = {
        ...machineSnapshots
      };
      await storage.persistWorkflowSnapshot({
        workflowName: this.name,
        runId: this.#runId,
        snapshot
      });
      return;
    } else if (!snapshot) {
      this.logger.debug("Snapshot cannot be persisted. No snapshot received.", {
        runId: this.#runId
      });
      return;
    }
    snapshot.suspendedSteps = {
      ...existingSnapshot.suspendedSteps,
      ...suspendedSteps
    };
    if (!existingSnapshot || snapshot === existingSnapshot) {
      await storage.persistWorkflowSnapshot({
        workflowName: this.name,
        runId: this.#runId,
        snapshot
      });
      return;
    }
    if (existingSnapshot?.childStates) {
      snapshot.childStates = {
        ...existingSnapshot.childStates,
        ...machineSnapshots
      };
    } else {
      snapshot.childStates = machineSnapshots;
    }
    await storage.persistWorkflowSnapshot({
      workflowName: this.name,
      runId: this.#runId,
      snapshot
    });
  }
  async getState() {
    const storedSnapshot = await this.#mastra?.storage?.loadWorkflowSnapshot({
      workflowName: this.name,
      runId: this.runId
    });
    const prevSnapshot = storedSnapshot ? {
      trigger: storedSnapshot,
      ...Object.entries(storedSnapshot?.childStates ?? {}).reduce((acc, [stepId, snapshot2]) => ({
        ...acc,
        [stepId]: snapshot2
      }), {})
    } : {};
    const currentSnapshot = Object.entries(this.#machines).reduce((acc, [stepId, machine]) => {
      const snapshot2 = machine.getSnapshot();
      if (!snapshot2) {
        return acc;
      }
      return {
        ...acc,
        [stepId]: snapshot2
      };
    }, {});
    Object.assign(prevSnapshot, currentSnapshot);
    const trigger = prevSnapshot.trigger;
    delete prevSnapshot.trigger;
    const snapshot = {
      ...trigger};
    const m = getActivePathsAndStatus(prevSnapshot.value);
    return {
      runId: this.runId,
      value: snapshot.value,
      context: snapshot.context,
      activePaths: m,
      timestamp: Date.now()
    };
  }
  async resumeWithEvent(eventName, data, runtimeContext = new RuntimeContext()) {
    const event = this.events?.[eventName];
    if (!event) {
      throw new Error(`Event ${eventName} not found`);
    }
    const results = await this.resume({
      stepId: `__${eventName}_event`,
      context: {
        resumedEvent: data
      },
      runtimeContext
    });
    return results;
  }
  async resume({
    stepId,
    context: resumeContext,
    runtimeContext = new RuntimeContext()
  }) {
    await new Promise(resolve => setTimeout(resolve, 0));
    return this._resume({
      stepId,
      context: resumeContext,
      runtimeContext
    });
  }
  async #loadWorkflowSnapshot(runId) {
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Snapshot cannot be loaded. Mastra engine is not initialized", {
        runId
      });
      return;
    }
    await this.persistWorkflowSnapshot();
    return storage.loadWorkflowSnapshot({
      runId,
      workflowName: this.name
    });
  }
  async _resume({
    stepId,
    context: resumeContext,
    runtimeContext
  }) {
    const snapshot = await this.#loadWorkflowSnapshot(this.runId);
    if (!snapshot) {
      throw new Error(`No snapshot found for workflow run ${this.runId}`);
    }
    const stepParts = stepId.split(".");
    const stepPath = stepParts.join(".");
    if (stepParts.length > 1) {
      stepId = stepParts[0] ?? stepId;
    }
    let parsedSnapshot;
    try {
      parsedSnapshot = typeof snapshot === "string" ? JSON.parse(snapshot) : snapshot;
    } catch (error) {
      this.logger.debug("Failed to parse workflow snapshot for resume", {
        error,
        runId: this.runId
      });
      throw new Error("Failed to parse workflow snapshot");
    }
    const startStepId = parsedSnapshot.suspendedSteps?.[stepId];
    if (!startStepId) {
      return;
    }
    parsedSnapshot = startStepId === "trigger" ? parsedSnapshot : {
      ...parsedSnapshot?.childStates?.[startStepId],
      ...{
        suspendedSteps: parsedSnapshot.suspendedSteps
      }
    };
    if (!parsedSnapshot) {
      throw new Error(`No snapshot found for step: ${stepId} starting at ${startStepId}`);
    }
    if (resumeContext) {
      parsedSnapshot.context.steps[stepId] = {
        status: "success",
        output: {
          ...(parsedSnapshot?.context?.steps?.[stepId]?.output || {}),
          ...resumeContext
        }
      };
    }
    if (parsedSnapshot.children) {
      Object.entries(parsedSnapshot.children).forEach(([, child]) => {
        if (child.snapshot?.input?.stepNode) {
          const stepDef = this.#makeStepDef(child.snapshot.input.stepNode.step.id);
          child.snapshot.input.stepNode.config = {
            ...child.snapshot.input.stepNode.config,
            ...stepDef
          };
          child.snapshot.input.context = parsedSnapshot.context;
        }
      });
    }
    parsedSnapshot.value = updateStepInHierarchy(parsedSnapshot.value, stepId);
    if (parsedSnapshot.context?.attempts) {
      parsedSnapshot.context.attempts[stepId] = this.#steps[stepId]?.step?.retryConfig?.attempts || this.#retryConfig?.attempts || 0;
    }
    this.logger.debug("Resuming workflow with updated snapshot", {
      updatedSnapshot: parsedSnapshot,
      runId: this.runId,
      stepId
    });
    return this.execute({
      snapshot: parsedSnapshot,
      stepId: stepPath,
      resumeData: resumeContext,
      runtimeContext
    });
  }
  #initializeCompoundDependencies() {
    Object.keys(this.#stepSubscriberGraph).forEach(stepKey => {
      if (this.#isCompoundKey(stepKey)) {
        const requiredSteps = stepKey.split("&&");
        this.#compoundDependencies[stepKey] = requiredSteps.reduce((acc, step) => {
          acc[step] = false;
          return acc;
        }, {});
      }
    });
  }
  #resetCompoundDependency(key) {
    if (this.#isCompoundKey(key)) {
      const requiredSteps = key.split("&&");
      this.#compoundDependencies[key] = requiredSteps.reduce((acc, step) => {
        acc[step] = false;
        return acc;
      }, {});
    }
  }
  #makeStepDef(stepId) {
    const executeStep = (handler2, spanName, attributes) => {
      return async data => {
        return await context.with(trace.setSpan(context.active(), this.#executionSpan), async () => {
          if (this.#mastra?.getTelemetry()) {
            return this.#mastra.getTelemetry()?.traceMethod(handler2, {
              spanName,
              attributes
            })(data);
          } else {
            return handler2(data);
          }
        });
      };
    };
    const handler = async ({
      context,
      ...rest
    }) => {
      const targetStep = this.#steps[stepId];
      if (!targetStep) throw new Error(`Step not found`);
      const {
        payload = {},
        execute = async () => {}
      } = targetStep.step;
      const mergedData = {
        ...payload,
        ...context
      };
      const finalAction = this.#mastra?.getTelemetry() ? executeStep(execute, `workflow.${this.name}.action.${stepId}`, {
        componentName: this.name,
        runId: rest.runId
      }) : execute;
      return finalAction ? await finalAction({
        context: mergedData,
        ...rest
      }) : {};
    };
    const finalHandler = ({
      context,
      ...rest
    }) => {
      if (this.#executionSpan) {
        return executeStep(handler, `workflow.${this.name}.step.${stepId}`, {
          componentName: this.name,
          runId: rest?.runId
        })({
          context,
          ...rest
        });
      }
      return handler({
        context,
        ...rest
      });
    };
    return {
      handler: finalHandler,
      data: {}
    };
  }
  #isCompoundKey(key) {
    return key.includes("&&");
  }
};

// src/workflows/legacy/workflow.ts
var LegacyWorkflow = class extends MastraBase {
  name;
  triggerSchema;
  resultSchema;
  resultMapping;
  events;
  #retryConfig;
  #mastra;
  #runs = /* @__PURE__ */new Map();
  isNested = false;
  #onStepTransition = /* @__PURE__ */new Set();
  // registers stepIds on `after` calls
  #afterStepStack = [];
  #lastStepStack = [];
  #lastBuilderType = null;
  #ifStack = [];
  #stepGraph = {
    initial: []
  };
  #serializedStepGraph = {
    initial: []
  };
  #stepSubscriberGraph = {};
  #serializedStepSubscriberGraph = {};
  #steps = {};
  #ifCount = 0;
  /**
   * Creates a new LegacyWorkflow instance
   * @param name - Identifier for the workflow (not necessarily unique)
   * @param logger - Optional logger instance
   */
  constructor({
    name,
    triggerSchema,
    result,
    retryConfig,
    mastra,
    events
  }) {
    super({
      component: "WORKFLOW",
      name
    });
    this.name = name;
    this.#retryConfig = retryConfig;
    this.triggerSchema = triggerSchema;
    this.resultSchema = result?.schema;
    this.resultMapping = result?.mapping;
    this.events = events;
    if (mastra) {
      this.__registerPrimitives({
        telemetry: mastra.getTelemetry(),
        logger: mastra.getLogger()
      });
      this.#mastra = mastra;
    }
  }
  step(next, config) {
    const that = this;
    if (Array.isArray(next)) {
      const nextSteps = next.map(step2 => {
        if (isWorkflow(step2)) {
          const asStep = step2.toStep();
          return asStep;
        } else if (isAgent(step2)) {
          return agentToStep(step2);
        } else {
          return step2;
        }
      });
      nextSteps.forEach(step2 => this.step(step2, config));
      this.after(nextSteps);
      this.step(new LegacyStep({
        id: `__after_${next.map(step2 => config?.id ?? step2?.id ?? step2?.name).join("_")}`,
        execute: async () => {
          return {
            success: true
          };
        }
      }));
      return this;
    }
    const {
      variables = {}
    } = config || {};
    const requiredData = {};
    for (const [key, variable] of Object.entries(variables)) {
      if (variable && isVariableReference(variable)) {
        requiredData[key] = variable;
      }
    }
    const step = isWorkflow(next) ?
    // @ts-ignore
    workflowToStep(next, {
      mastra: this.#mastra
    }) : isAgent(next) ?
    // @ts-ignore
    agentToStep(next, {
      mastra: this.#mastra
    }) : next;
    const stepKey = this.#makeStepKey(step, config);
    const when = config?.["#internal"]?.when || config?.when;
    const graphEntry = {
      step,
      config: {
        ...this.#makeStepDef(stepKey),
        ...config,
        loopLabel: config?.["#internal"]?.loopLabel,
        loopType: config?.["#internal"]?.loopType,
        serializedWhen: typeof when === "function" ? when.toString() : when,
        data: requiredData
      },
      get id() {
        return that.#makeStepKey(this.step, this.config);
      }
    };
    this.#steps[stepKey] = graphEntry;
    const parentStepKey = this.#getParentStepKey({
      loop_check: true
    });
    const stepGraph = this.#stepSubscriberGraph[parentStepKey || ""];
    const serializedStepGraph = this.#serializedStepSubscriberGraph[parentStepKey || ""];
    if (parentStepKey && stepGraph) {
      if (!stepGraph.initial.some(step2 => step2.config.id === stepKey || step2.step.id === stepKey)) {
        stepGraph.initial.push(graphEntry);
        if (serializedStepGraph) serializedStepGraph.initial.push(graphEntry);
      }
      stepGraph[stepKey] = [];
      if (serializedStepGraph) serializedStepGraph[stepKey] = [];
    } else {
      if (!this.#stepGraph[stepKey]) this.#stepGraph[stepKey] = [];
      this.#stepGraph.initial.push(graphEntry);
      this.#serializedStepGraph.initial.push(graphEntry);
    }
    this.#lastStepStack.push(stepKey);
    this.#lastBuilderType = "step";
    return this;
  }
  #__internalStep(next, config, internalUse) {
    const that = this;
    if (Array.isArray(next)) {
      const nextSteps = next.map(step2 => {
        if (isWorkflow(step2)) {
          const asStep = step2.toStep();
          return asStep;
        } else {
          return step2;
        }
      });
      nextSteps.forEach(step2 => this.#__internalStep(step2, config, internalUse));
      this.after(nextSteps);
      this.#__internalStep(new LegacyStep({
        id: `__after_${next.map(step2 => step2?.id ?? step2?.name).join("_")}`,
        execute: async () => {
          return {
            success: true
          };
        }
      }), void 0, internalUse);
      return this;
    }
    const {
      variables = {}
    } = config || {};
    const requiredData = {};
    for (const [key, variable] of Object.entries(variables)) {
      if (variable && isVariableReference(variable)) {
        requiredData[key] = variable;
      }
    }
    const step = isWorkflow(next) ?
    // @ts-ignore
    workflowToStep(next, {
      mastra: this.#mastra
    }) : next;
    const stepKey = this.#makeStepKey(step, config);
    const when = config?.["#internal"]?.when || config?.when;
    const graphEntry = {
      step,
      config: {
        ...this.#makeStepDef(stepKey),
        ...config,
        loopLabel: config?.["#internal"]?.loopLabel,
        loopType: config?.["#internal"]?.loopType,
        serializedWhen: typeof when === "function" ? when.toString() : when,
        data: requiredData
      },
      get id() {
        return that.#makeStepKey(this.step, this.config);
      }
    };
    this.#steps[stepKey] = graphEntry;
    const parentStepKey = this.#getParentStepKey();
    const stepGraph = this.#stepSubscriberGraph[parentStepKey || ""];
    const serializedStepGraph = this.#serializedStepSubscriberGraph[parentStepKey || ""];
    if (parentStepKey && stepGraph) {
      if (!stepGraph.initial.some(step2 => step2.step.id === stepKey)) {
        stepGraph.initial.push(graphEntry);
        if (serializedStepGraph) serializedStepGraph.initial.push(graphEntry);
      }
      stepGraph[stepKey] = [];
      if (serializedStepGraph) serializedStepGraph[stepKey] = [];
    } else {
      if (!this.#stepGraph[stepKey]) this.#stepGraph[stepKey] = [];
      this.#stepGraph.initial.push(graphEntry);
      this.#serializedStepGraph.initial.push(graphEntry);
    }
    this.#lastStepStack.push(stepKey);
    this.#lastBuilderType = "step";
    return this;
  }
  #makeStepKey(step, config) {
    if (typeof step === "string") return step;
    return `${config?.id ?? step.id ?? step.name}`;
  }
  then(next, config) {
    const that = this;
    if (Array.isArray(next)) {
      const lastStep = this.#steps[this.#lastStepStack[this.#lastStepStack.length - 1] ?? ""];
      if (!lastStep) {
        throw new Error("Condition requires a step to be executed after");
      }
      this.after(lastStep.step);
      const nextSteps = next.map(step2 => {
        if (isWorkflow(step2)) {
          return workflowToStep(step2, {
            mastra: this.#mastra
          });
        }
        if (isAgent(step2)) {
          return agentToStep(step2);
        }
        return step2;
      });
      nextSteps.forEach(step2 => this.step(step2, config));
      this.step(new LegacyStep({
        // @ts-ignore
        id: `__after_${next.map(step2 => step2?.id ?? step2?.name).join("_")}`,
        execute: async () => {
          return {
            success: true
          };
        }
      }));
      return this;
    }
    const {
      variables = {}
    } = config || {};
    const requiredData = {};
    for (const [key, variable] of Object.entries(variables)) {
      if (variable && isVariableReference(variable)) {
        requiredData[key] = variable;
      }
    }
    const lastStepKey = this.#lastStepStack[this.#lastStepStack.length - 1];
    const step = isWorkflow(next) ? workflowToStep(next, {
      mastra: this.#mastra
    }) : isAgent(next) ? agentToStep(next) : next;
    const stepKey = this.#makeStepKey(step, config);
    const when = config?.["#internal"]?.when || config?.when;
    const graphEntry = {
      step,
      config: {
        ...this.#makeStepDef(stepKey),
        ...config,
        loopLabel: config?.["#internal"]?.loopLabel,
        loopType: config?.["#internal"]?.loopType,
        serializedWhen: typeof when === "function" ? when.toString() : when,
        data: requiredData
      },
      get id() {
        return that.#makeStepKey(this.step, this.config);
      }
    };
    this.#steps[stepKey] = graphEntry;
    if (!lastStepKey) return this;
    const parentStepKey = this.#getParentStepKey();
    const stepGraph = this.#stepSubscriberGraph[parentStepKey || ""];
    const serializedStepGraph = this.#serializedStepSubscriberGraph[parentStepKey || ""];
    if (parentStepKey && this.#lastBuilderType === "after") {
      return this.step(step, config);
    }
    if (parentStepKey && stepGraph && stepGraph[lastStepKey]) {
      stepGraph[lastStepKey].push(graphEntry);
      if (serializedStepGraph && serializedStepGraph[lastStepKey]) serializedStepGraph[lastStepKey].push(graphEntry);
    } else {
      if (!this.#stepGraph[lastStepKey]) this.#stepGraph[lastStepKey] = [];
      if (!this.#serializedStepGraph[lastStepKey]) this.#serializedStepGraph[lastStepKey] = [];
      this.#stepGraph[lastStepKey].push(graphEntry);
      this.#serializedStepGraph[lastStepKey].push(graphEntry);
    }
    this.#lastBuilderType = "then";
    return this;
  }
  loop(applyOperator, condition, fallbackStep, loopType, variables) {
    const lastStepKey = this.#lastStepStack[this.#lastStepStack.length - 1];
    if (!lastStepKey) return this;
    const fallbackStepKey = this.#makeStepKey(fallbackStep);
    const fallbackStepNode = {
      step: fallbackStep,
      config: {
        ...this.#makeStepDef(fallbackStepKey)
      },
      get id() {
        return fallbackStepKey;
      }
    };
    this.#steps[fallbackStepKey] = fallbackStepNode;
    const checkStepKey = `__${fallbackStepKey}_${loopType}_loop_check`;
    const checkStep = {
      id: checkStepKey,
      execute: async ({
        context
      }) => {
        if (typeof condition === "function") {
          const result = await condition({
            context
          });
          switch (loopType) {
            case "while":
              return {
                status: result ? "continue" : "complete"
              };
            case "until":
              return {
                status: result ? "complete" : "continue"
              };
            default:
              throw new Error(`Invalid loop type: ${loopType}`);
          }
        }
        if (condition && "ref" in condition) {
          const {
            ref,
            query
          } = condition;
          const stepId = typeof ref.step === "string" ? ref.step : "id" in ref.step ? ref.step.id : null;
          if (!stepId) {
            return {
              status: "continue"
            };
          }
          const stepOutput = context.steps?.[stepId]?.output;
          if (!stepOutput) {
            return {
              status: "continue"
            };
          }
          const value = ref.path.split(".").reduce((obj, key) => obj?.[key], stepOutput);
          const operator = Object.keys(query)[0];
          const target = query[operator];
          return applyOperator(operator, value, target);
        }
        return {
          status: "continue"
        };
      },
      outputSchema: z.object({
        status: z.enum(["continue", "complete"])
      })
    };
    const checkStepNode = {
      step: checkStep,
      config: {
        ...this.#makeStepDef(checkStepKey)
      },
      get id() {
        return checkStepKey;
      }
    };
    this.#steps[checkStepKey] = checkStepNode;
    const loopFinishedStepKey = `__${fallbackStepKey}_${loopType}_loop_finished`;
    const loopFinishedStep = {
      id: loopFinishedStepKey,
      execute: async () => {
        return {
          success: true
        };
      }
    };
    const loopFinishedStepNode = {
      step: loopFinishedStep,
      config: {
        ...this.#makeStepDef(loopFinishedStepKey)
      },
      get id() {
        return loopFinishedStepKey;
      }
    };
    this.#steps[loopFinishedStepKey] = loopFinishedStepNode;
    this.then(checkStep, {
      id: checkStepKey,
      "#internal": {
        loopLabel: `${fallbackStepKey} ${loopType} loop check`
      }
    });
    this.after(checkStep);
    this.#__internalStep(fallbackStep, {
      when: async ({
        context
      }) => {
        const checkStepResult = context.steps?.[checkStepKey];
        if (checkStepResult?.status !== "success") {
          return "abort" /* ABORT */;
        }
        const status = checkStepResult?.output?.status;
        return status === "continue" ? "continue" /* CONTINUE */ : "continue_failed" /* CONTINUE_FAILED */;
      },
      variables,
      "#internal": {
        // @ts-ignore
        when: condition,
        loopType
      }
    }).then(checkStep, {
      id: checkStepKey,
      "#internal": {
        loopLabel: `${fallbackStepKey} ${loopType} loop check`
      }
    });
    this.#__internalStep(loopFinishedStep, {
      id: loopFinishedStepKey,
      when: async ({
        context
      }) => {
        const checkStepResult = context.steps?.[checkStepKey];
        if (checkStepResult?.status !== "success") {
          return "continue_failed" /* CONTINUE_FAILED */;
        }
        const status = checkStepResult?.output?.status;
        return status === "complete" ? "continue" /* CONTINUE */ : "continue_failed" /* CONTINUE_FAILED */;
      },
      "#internal": {
        loopLabel: `${fallbackStepKey} ${loopType} loop finished`,
        //@ts-ignore
        loopType
      }
    });
    return this;
  }
  while(condition, fallbackStep, variables) {
    const applyOperator = (operator, value, target) => {
      switch (operator) {
        case "$eq":
          return {
            status: value !== target ? "complete" : "continue"
          };
        case "$ne":
          return {
            status: value === target ? "complete" : "continue"
          };
        case "$gt":
          return {
            status: value <= target ? "complete" : "continue"
          };
        case "$gte":
          return {
            status: value < target ? "complete" : "continue"
          };
        case "$lt":
          return {
            status: value >= target ? "complete" : "continue"
          };
        case "$lte":
          return {
            status: value > target ? "complete" : "continue"
          };
        default:
          return {
            status: "continue"
          };
      }
    };
    const res = this.loop(applyOperator, condition, fallbackStep, "while", variables);
    this.#lastBuilderType = "while";
    return res;
  }
  until(condition, fallbackStep, variables) {
    const applyOperator = (operator, value, target) => {
      switch (operator) {
        case "$eq":
          return {
            status: value === target ? "complete" : "continue"
          };
        case "$ne":
          return {
            status: value !== target ? "complete" : "continue"
          };
        case "$gt":
          return {
            status: value > target ? "complete" : "continue"
          };
        case "$gte":
          return {
            status: value >= target ? "complete" : "continue"
          };
        case "$lt":
          return {
            status: value < target ? "complete" : "continue"
          };
        case "$lte":
          return {
            status: value <= target ? "complete" : "continue"
          };
        default:
          return {
            status: "continue"
          };
      }
    };
    const res = this.loop(applyOperator, condition, fallbackStep, "until", variables);
    this.#lastBuilderType = "until";
    return res;
  }
  if(condition, ifStep, elseStep) {
    this.#ifCount++;
    const lastStep = this.#getLastStep({
      if_else_check: this.#lastBuilderType !== "else"
    });
    if (!lastStep) {
      throw new Error("Condition requires a step to be executed after");
    }
    this.after(lastStep.step);
    if (ifStep) {
      const _ifStep = isWorkflow(ifStep) ? workflowToStep(ifStep, {
        mastra: this.#mastra
      }) : ifStep;
      this.step(_ifStep, {
        id: _ifStep.id,
        when: condition
      });
      if (elseStep) {
        const _elseStep = isWorkflow(elseStep) ? workflowToStep(elseStep, {
          mastra: this.#mastra
        }) : elseStep;
        this.step(_elseStep, {
          id: _elseStep.id,
          when: typeof condition === "function" ? async payload => {
            const result = await condition(payload);
            return !result;
          } : {
            not: condition
          }
        });
        this.after([_ifStep, _elseStep]);
      } else {
        this.after(_ifStep);
      }
      this.step(new LegacyStep({
        id: `${lastStep.id}_if_else`,
        execute: async () => {
          return {
            executed: true
          };
        }
      }));
      return this;
    }
    const ifStepKey = `__${lastStep.id}_if_${this.#ifCount}`;
    this.step({
      id: ifStepKey,
      execute: async () => {
        return {
          executed: true
        };
      }
    }, {
      id: ifStepKey,
      when: condition
    });
    const elseStepKey = `__${lastStep.id}_else_${this.#ifCount}`;
    this.#ifStack.push({
      condition,
      elseStepKey,
      condStep: lastStep.step
    });
    this.#lastBuilderType = "if";
    return this;
  }
  else() {
    const activeCondition = this.#ifStack.pop();
    if (!activeCondition) {
      throw new Error("No active condition found");
    }
    this.after(activeCondition.condStep).step({
      id: activeCondition.elseStepKey,
      execute: async () => {
        return {
          executed: true
        };
      }
    }, {
      id: activeCondition.elseStepKey,
      when: typeof activeCondition.condition === "function" ? async payload => {
        const result = await activeCondition.condition(payload);
        return !result;
      } : {
        not: activeCondition.condition
      }
    });
    this.#lastBuilderType = "else";
    return this;
  }
  after(steps) {
    const stepsArray = Array.isArray(steps) ? steps : [steps];
    const stepKeys = stepsArray.map(step => this.#makeStepKey(step));
    const compoundKey = stepKeys.join("&&");
    this.#afterStepStack.push(compoundKey);
    if (!this.#stepSubscriberGraph[compoundKey]) {
      this.#stepSubscriberGraph[compoundKey] = {
        initial: []
      };
      this.#serializedStepSubscriberGraph[compoundKey] = {
        initial: []
      };
    }
    this.#lastBuilderType = "after";
    return this;
  }
  afterEvent(eventName) {
    const event = this.events?.[eventName];
    if (!event) {
      throw new Error(`Event ${eventName} not found`);
    }
    const lastStep = this.#steps[this.#lastStepStack[this.#lastStepStack.length - 1] ?? ""];
    if (!lastStep) {
      throw new Error("Condition requires a step to be executed after");
    }
    const eventStepKey = `__${eventName}_event`;
    const eventStep = new LegacyStep({
      id: eventStepKey,
      execute: async ({
        context,
        suspend
      }) => {
        if (context.inputData?.resumedEvent) {
          return {
            executed: true,
            resumedEvent: context.inputData?.resumedEvent
          };
        }
        await suspend();
        return {
          executed: false
        };
      }
    });
    this.after(lastStep.step).step(eventStep).after(eventStep);
    this.#lastBuilderType = "afterEvent";
    return this;
  }
  /**
   * Executes the workflow with the given trigger data
   * @param triggerData - Initial data to start the workflow with
   * @returns Promise resolving to workflow results or rejecting with error
   * @throws Error if trigger schema validation fails
   */
  createRun({
    runId,
    events
  } = {}) {
    const run = new WorkflowInstance({
      logger: this.logger,
      name: this.name,
      mastra: this.#mastra,
      retryConfig: this.#retryConfig,
      steps: this.#steps,
      runId,
      stepGraph: this.#stepGraph,
      stepSubscriberGraph: this.#stepSubscriberGraph,
      onStepTransition: this.#onStepTransition,
      resultMapping: this.resultMapping,
      onFinish: () => {
        this.#runs.delete(run.runId);
      },
      events
    });
    this.#runs.set(run.runId, run);
    return {
      start: run.start.bind(run),
      runId: run.runId,
      watch: run.watch.bind(run),
      resume: run.resume.bind(run),
      resumeWithEvent: run.resumeWithEvent.bind(run)
    };
  }
  /**
   * Gets a workflow run instance by ID
   * @param runId - ID of the run to retrieve
   * @returns The workflow run instance if found, undefined otherwise
   */
  async getRun(runId) {
    const inMemoryRun = this.#runs.get(runId);
    if (inMemoryRun) {
      return inMemoryRun;
    }
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Cannot get workflow run. Mastra engine is not initialized");
      return null;
    }
    return await storage.getWorkflowRunById({
      runId,
      workflowName: this.name
    });
  }
  /**
   * Gets a workflow run instance by ID, from memory
   * @param runId - ID of the run to retrieve
   * @returns The workflow run instance if found, undefined otherwise
   */
  getMemoryRun(runId) {
    return this.#runs.get(runId);
  }
  /**
   * Rebuilds the machine with the current steps configuration and validates the workflow
   *
   * This is the last step of a workflow builder method chain
   * @throws Error if validation fails
   *
   * @returns this instance for method chaining
   */
  commit() {
    return this;
  }
  // record all object paths that leads to a suspended state
  #getSuspendedPaths({
    value,
    path,
    suspendedPaths
  }) {
    if (typeof value === "string") {
      if (value === "suspended") {
        suspendedPaths.add(path);
      }
    } else {
      Object.keys(value).forEach(key => this.#getSuspendedPaths({
        value: value[key],
        path: path ? `${path}.${key}` : key,
        suspendedPaths
      }));
    }
  }
  async getWorkflowRuns(args) {
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Cannot get workflow runs. Mastra engine is not initialized");
      return {
        runs: [],
        total: 0
      };
    }
    return storage.getWorkflowRuns({
      workflowName: this.name,
      ...(args ?? {})
    });
  }
  getExecutionSpan(runId) {
    return this.#runs.get(runId)?.executionSpan;
  }
  #getParentStepKey({
    loop_check = false,
    if_else_check = false
  } = {}) {
    for (let i = this.#afterStepStack.length - 1; i >= 0; i--) {
      const stepKey = this.#afterStepStack[i];
      if (!stepKey) continue;
      const isValidStep = this.#stepSubscriberGraph[stepKey] && (!loop_check || !stepKey.includes("loop_check")) && (!if_else_check || !isConditionalKey(stepKey));
      if (isValidStep) {
        return stepKey;
      }
    }
    return void 0;
  }
  #getLastStep({
    if_else_check
  }) {
    for (let i = this.#lastStepStack.length - 1; i >= 0; i--) {
      const stepKey = this.#lastStepStack[i];
      if (!stepKey) continue;
      const step = this.#steps[stepKey];
      const isInvalidStep = !step || if_else_check && isConditionalKey(stepKey);
      if (isInvalidStep) continue;
      return step;
    }
    return void 0;
  }
  #makeStepDef(stepId) {
    const executeStep = (handler2, spanName, attributes) => {
      return async data => {
        return await context.with(trace.setSpan(context.active(), this.getExecutionSpan(attributes?.runId ?? data?.runId)), async () => {
          if (this?.telemetry) {
            return this.telemetry.traceMethod(handler2, {
              spanName,
              attributes
            })(data);
          } else {
            return handler2(data);
          }
        });
      };
    };
    const handler = async ({
      context,
      ...rest
    }) => {
      const targetStep = this.#steps[stepId];
      if (!targetStep) throw new Error(`Step not found`);
      const {
        payload = {},
        execute = async () => {}
      } = targetStep.step;
      const finalAction = this.telemetry ? executeStep(execute, `workflow.${this.name}.action.${stepId}`, {
        componentName: this.name,
        runId: rest.runId
      }) : execute;
      return finalAction ? await finalAction({
        context: {
          ...context,
          inputData: {
            ...(context?.inputData || {}),
            ...payload
          }
        },
        ...rest
      }) : {};
    };
    const finalHandler = ({
      context,
      ...rest
    }) => {
      if (this.getExecutionSpan(rest?.runId)) {
        return executeStep(handler, `workflow.${this.name}.step.${stepId}`, {
          componentName: this.name,
          runId: rest?.runId
        })({
          context,
          ...rest
        });
      }
      return handler({
        context,
        ...rest
      });
    };
    return {
      handler: finalHandler,
      data: {}
    };
  }
  #getActivePathsAndStatus(value) {
    const paths = [];
    const traverse = (current, path = []) => {
      for (const [key, value2] of Object.entries(current)) {
        const currentPath = [...path, key];
        if (typeof value2 === "string") {
          paths.push({
            stepPath: currentPath,
            stepId: key,
            status: value2
          });
        } else if (typeof value2 === "object" && value2 !== null) {
          traverse(value2, currentPath);
        }
      }
    };
    traverse(value);
    return paths;
  }
  async getState(runId) {
    const run = this.#runs.get(runId);
    if (run) {
      return run.getState();
    }
    const storage = this.#mastra?.getStorage();
    const storedSnapshot = await storage?.loadWorkflowSnapshot({
      runId,
      workflowName: this.name
    });
    if (storedSnapshot) {
      const parsed = storedSnapshot;
      const m = this.#getActivePathsAndStatus(parsed.value);
      return {
        runId,
        value: parsed.value,
        context: parsed.context,
        activePaths: m,
        timestamp: Date.now()
      };
    }
    return null;
  }
  async resume({
    runId,
    stepId,
    context: resumeContext,
    runtimeContext = new RuntimeContext()
  }) {
    this.logger.warn(`Please use 'resume' on the 'createRun' call instead, resume is deprecated`);
    const activeRun = this.#runs.get(runId);
    if (activeRun) {
      return activeRun.resume({
        stepId,
        context: resumeContext,
        runtimeContext
      });
    }
    const run = this.createRun({
      runId
    });
    return run.resume({
      stepId,
      context: resumeContext,
      runtimeContext
    });
  }
  watch(onTransition) {
    this.logger.warn(`Please use 'watch' on the 'createRun' call instead, watch is deprecated`);
    this.#onStepTransition.add(onTransition);
    return () => {
      this.#onStepTransition.delete(onTransition);
    };
  }
  async resumeWithEvent(runId, eventName, data) {
    this.logger.warn(`Please use 'resumeWithEvent' on the 'createRun' call instead, resumeWithEvent is deprecated`);
    const event = this.events?.[eventName];
    if (!event) {
      throw new Error(`Event ${eventName} not found`);
    }
    const results = await this.resume({
      runId,
      stepId: `__${eventName}_event`,
      context: {
        resumedEvent: data
      },
      runtimeContext: new RuntimeContext()
    });
    return results;
  }
  __registerMastra(mastra) {
    this.#mastra = mastra;
  }
  __registerPrimitives(p) {
    if (p.telemetry) {
      this.__setTelemetry(p.telemetry);
    }
    if (p.logger) {
      this.__setLogger(p.logger);
    }
  }
  get stepGraph() {
    return this.#stepGraph;
  }
  get stepSubscriberGraph() {
    return this.#stepSubscriberGraph;
  }
  get serializedStepGraph() {
    return this.#serializedStepGraph;
  }
  get serializedStepSubscriberGraph() {
    return this.#serializedStepSubscriberGraph;
  }
  get steps() {
    return Object.entries(this.#steps).reduce((acc, [key, step]) => {
      acc[key] = step.step;
      return acc;
    }, {});
  }
  setNested(isNested) {
    this.isNested = isNested;
  }
  toStep() {
    const x = workflowToStep(this, {
      mastra: this.#mastra
    });
    return new LegacyStep(x);
  }
};

export { Agent, LegacyStep, LegacyWorkflow, WhenConditionReturnValue, agentToStep, getActivePathsAndStatus, getResultActivePaths, getStepResult, getSuspendedPaths, isAgent, isConditionalKey, isErrorEvent, isFinalState, isLimboState, isTransitionEvent, isVariableReference, isWorkflow, mergeChildValue, recursivelyCheckForFinalState, resolveVariables, updateStepInHierarchy, workflowToStep };
