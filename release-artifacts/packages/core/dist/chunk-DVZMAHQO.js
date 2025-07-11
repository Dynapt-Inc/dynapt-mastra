import { augmentWithInit } from './chunk-YOQP5T77.js';
import { MessageList } from './chunk-GTG6JWTV.js';
import { deepMerge } from './chunk-HJQYQAIJ.js';
import { MastraBase } from './chunk-5IEKR756.js';

// src/memory/memory.ts
var MemoryProcessor = class extends MastraBase {
  /**
   * Process a list of messages and return a filtered or transformed list.
   * @param messages The messages to process
   * @returns The processed messages
   */
  process(messages, _opts) {
    return messages;
  }
};
var memoryDefaultOptions = {
  lastMessages: 10,
  semanticRecall: false,
  threads: {
    generateTitle: false
  },
  workingMemory: {
    enabled: false,
    template: `
# User Information
- **First Name**: 
- **Last Name**: 
- **Location**: 
- **Occupation**: 
- **Interests**: 
- **Goals**: 
- **Events**: 
- **Facts**: 
- **Projects**: 
`
  }
};
var MastraMemory = class extends MastraBase {
  MAX_CONTEXT_TOKENS;
  _storage;
  vector;
  embedder;
  processors = [];
  threadConfig = { ...memoryDefaultOptions };
  constructor(config) {
    super({ component: "MEMORY", name: config.name });
    if (config.options) this.threadConfig = this.getMergedThreadConfig(config.options);
    if (config.processors) this.processors = config.processors;
    if (config.storage) {
      this._storage = augmentWithInit(config.storage);
      this._hasOwnStorage = true;
    }
    if (this.threadConfig.semanticRecall) {
      if (!config.vector) {
        throw new Error(
          `Semantic recall requires a vector store to be configured.

https://mastra.ai/en/docs/memory/semantic-recall`
        );
      }
      this.vector = config.vector;
      if (!config.embedder) {
        throw new Error(
          `Semantic recall requires an embedder to be configured.

https://mastra.ai/en/docs/memory/semantic-recall`
        );
      }
      this.embedder = config.embedder;
    }
  }
  _hasOwnStorage = false;
  get hasOwnStorage() {
    return this._hasOwnStorage;
  }
  get storage() {
    if (!this._storage) {
      throw new Error(
        `Memory requires a storage provider to function. Add a storage configuration to Memory or to your Mastra instance.

https://mastra.ai/en/docs/memory/overview`
      );
    }
    return this._storage;
  }
  setStorage(storage) {
    this._storage = augmentWithInit(storage);
  }
  setVector(vector) {
    this.vector = vector;
  }
  setEmbedder(embedder) {
    this.embedder = embedder;
  }
  /**
   * Get a system message to inject into the conversation.
   * This will be called before each conversation turn.
   * Implementations can override this to inject custom system messages.
   */
  async getSystemMessage(_input) {
    return null;
  }
  /**
   * Get a user context message to inject into the conversation.
   * This will be called before each conversation turn.
   * Implementations can override this to inject custom system messages.
   */
  async getUserContextMessage(_input) {
    return null;
  }
  /**
   * Get tools that should be available to the agent.
   * This will be called when converting tools for the agent.
   * Implementations can override this to provide additional tools.
   */
  getTools(_config) {
    return {};
  }
  async createEmbeddingIndex(dimensions) {
    const defaultDimensions = 1536;
    const isDefault = dimensions === defaultDimensions;
    const usedDimensions = dimensions ?? defaultDimensions;
    const separator = this.vector?.indexSeparator ?? "_";
    const indexName = isDefault ? `memory${separator}messages` : `memory${separator}messages${separator}${usedDimensions}`;
    if (typeof this.vector === `undefined`) {
      throw new Error(`Tried to create embedding index but no vector db is attached to this Memory instance.`);
    }
    await this.vector.createIndex({
      indexName,
      dimension: usedDimensions
    });
    return { indexName };
  }
  getMergedThreadConfig(config) {
    if (config?.workingMemory && "use" in config.workingMemory) {
      throw new Error("The workingMemory.use option has been removed. Working memory always uses tool-call mode.");
    }
    const mergedConfig = deepMerge(this.threadConfig, config || {});
    if (config?.workingMemory?.schema) {
      if (mergedConfig.workingMemory) {
        mergedConfig.workingMemory.schema = config.workingMemory.schema;
      }
    }
    return mergedConfig;
  }
  /**
   * Apply all configured message processors to a list of messages.
   * @param messages The messages to process
   * @returns The processed messages
   */
  applyProcessors(messages, opts) {
    const processors = opts.processors || this.processors;
    if (!processors || processors.length === 0) {
      return messages;
    }
    let processedMessages = [...messages];
    for (const processor of processors) {
      processedMessages = processor.process(processedMessages, {
        systemMessage: opts.systemMessage,
        newMessages: opts.newMessages,
        memorySystemMessage: opts.memorySystemMessage
      });
    }
    return processedMessages;
  }
  processMessages({
    messages,
    processors,
    ...opts
  }) {
    return this.applyProcessors(messages, { processors: processors || this.processors, ...opts });
  }
  estimateTokens(text) {
    return Math.ceil(text.split(" ").length * 1.3);
  }
  /**
   * Helper method to create a new thread
   * @param title - Optional title for the thread
   * @param metadata - Optional metadata for the thread
   * @returns Promise resolving to the created thread
   */
  async createThread({
    threadId,
    resourceId,
    title,
    metadata,
    memoryConfig
  }) {
    const thread = {
      id: threadId || this.generateId(),
      title: title || `New Thread ${(/* @__PURE__ */ new Date()).toISOString()}`,
      resourceId,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      metadata
    };
    return this.saveThread({ thread, memoryConfig });
  }
  /**
   * Helper method to add a single message to a thread
   * @param threadId - The thread to add the message to
   * @param content - The message content
   * @param role - The role of the message sender
   * @param type - The type of the message
   * @param toolNames - Optional array of tool names that were called
   * @param toolCallArgs - Optional array of tool call arguments
   * @param toolCallIds - Optional array of tool call ids
   * @returns Promise resolving to the saved message
   * @deprecated use saveMessages instead
   */
  async addMessage({
    threadId,
    resourceId,
    config,
    content,
    role,
    type,
    toolNames,
    toolCallArgs,
    toolCallIds
  }) {
    const message = {
      id: this.generateId(),
      content,
      role,
      createdAt: /* @__PURE__ */ new Date(),
      threadId,
      resourceId,
      type,
      toolNames,
      toolCallArgs,
      toolCallIds
    };
    const savedMessages = await this.saveMessages({ messages: [message], memoryConfig: config });
    const list = new MessageList({ threadId, resourceId }).add(savedMessages[0], "memory");
    return list.get.all.v1()[0];
  }
  /**
   * Generates a unique identifier
   * @returns A unique string ID
   */
  generateId() {
    return crypto.randomUUID();
  }
};

export { MastraMemory, MemoryProcessor, memoryDefaultOptions };
