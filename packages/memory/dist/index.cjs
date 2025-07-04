'use strict';

var core = require('@mastra/core');
var agent = require('@mastra/core/agent');
var memory = require('@mastra/core/memory');
var ai = require('ai');
var xxhash = require('xxhash-wasm');
var zodToJsonSchema = require('zod-to-json-schema');
var zod = require('zod');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var xxhash__default = /*#__PURE__*/_interopDefault(xxhash);
var zodToJsonSchema__default = /*#__PURE__*/_interopDefault(zodToJsonSchema);

// src/index.ts
var updateWorkingMemoryTool = ({ format }) => ({
  description: "Update the working memory with new information",
  parameters: zod.z.object({
    memory: zod.z.string().describe(`The ${format === "json" ? "JSON" : "Markdown"} formatted working memory content to store`)
  }),
  execute: async (params) => {
    const { context, threadId, memory, resourceId } = params;
    if (!threadId || !memory) {
      throw new Error("Thread ID and Memory instance are required for working memory updates");
    }
    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }
    if (thread.resourceId && thread.resourceId !== resourceId) {
      throw new Error(`Thread with id ${threadId} resourceId does not match the current resourceId ${resourceId}`);
    }
    const workingMemory = context.memory;
    await memory.saveThread({
      thread: {
        ...thread,
        metadata: {
          ...thread.metadata,
          workingMemory
        }
      }
    });
    return { success: true };
  }
});

// src/index.ts
var CHARS_PER_TOKEN = 4;
var DEFAULT_MESSAGE_RANGE = { before: 2, after: 2 };
var DEFAULT_TOP_K = 2;
var Memory = class extends memory.MastraMemory {
  constructor(config = {}) {
    super({ name: "Memory", ...config });
    const mergedConfig = this.getMergedThreadConfig({
      workingMemory: config.options?.workingMemory || {
        // these defaults are now set inside @mastra/core/memory in getMergedThreadConfig.
        // In a future release we can remove it from this block - for now if we remove it
        // and someone bumps @mastra/memory without bumping @mastra/core the defaults wouldn't exist yet
        enabled: false,
        template: this.defaultWorkingMemoryTemplate
      }
    });
    this.threadConfig = mergedConfig;
    this.checkStorageFeatureSupport(mergedConfig);
  }
  async validateThreadIsOwnedByResource(threadId, resourceId) {
    const thread = await this.storage.getThreadById({ threadId });
    if (!thread) {
      throw new Error(`No thread found with id ${threadId}`);
    }
    if (thread.resourceId !== resourceId) {
      throw new Error(
        `Thread with id ${threadId} is for resource with id ${thread.resourceId} but resource ${resourceId} was queried.`
      );
    }
  }
  checkStorageFeatureSupport(config) {
    if (typeof config.semanticRecall === `object` && config.semanticRecall.scope === `resource` && !this.storage.supports.selectByIncludeResourceScope) {
      throw new Error(
        `Memory error: Attached storage adapter "${this.storage.name || "unknown"}" doesn't support semanticRecall: { scope: "resource" } yet and currently only supports per-thread semantic recall.`
      );
    }
  }
  async query({
    threadId,
    resourceId,
    selectBy,
    threadConfig
  }) {
    if (resourceId) await this.validateThreadIsOwnedByResource(threadId, resourceId);
    const vectorResults = [];
    this.logger.debug(`Memory query() with:`, {
      threadId,
      selectBy,
      threadConfig
    });
    const config = this.getMergedThreadConfig(threadConfig || {});
    this.checkStorageFeatureSupport(config);
    const defaultRange = DEFAULT_MESSAGE_RANGE;
    const defaultTopK = DEFAULT_TOP_K;
    const vectorConfig = typeof config?.semanticRecall === `boolean` ? {
      topK: defaultTopK,
      messageRange: defaultRange
    } : {
      topK: config?.semanticRecall?.topK ?? defaultTopK,
      messageRange: config?.semanticRecall?.messageRange ?? defaultRange
    };
    const resourceScope = typeof config?.semanticRecall === "object" && config?.semanticRecall?.scope === `resource`;
    if (config?.semanticRecall && selectBy?.vectorSearchString && this.vector) {
      const { embeddings, dimension } = await this.embedMessageContent(selectBy.vectorSearchString);
      const { indexName } = await this.createEmbeddingIndex(dimension);
      await Promise.all(
        embeddings.map(async (embedding) => {
          if (typeof this.vector === `undefined`) {
            throw new Error(
              `Tried to query vector index ${indexName} but this Memory instance doesn't have an attached vector db.`
            );
          }
          vectorResults.push(
            ...await this.vector.query({
              indexName,
              queryVector: embedding,
              topK: vectorConfig.topK,
              filter: resourceScope ? {
                resource_id: resourceId
              } : {
                thread_id: threadId
              }
            })
          );
        })
      );
    }
    const rawMessages = await this.storage.getMessages({
      threadId,
      resourceId,
      format: "v2",
      selectBy: {
        ...selectBy,
        ...vectorResults?.length ? {
          include: vectorResults.map((r) => ({
            id: r.metadata?.message_id,
            threadId: r.metadata?.thread_id,
            withNextMessages: typeof vectorConfig.messageRange === "number" ? vectorConfig.messageRange : vectorConfig.messageRange.after,
            withPreviousMessages: typeof vectorConfig.messageRange === "number" ? vectorConfig.messageRange : vectorConfig.messageRange.before
          }))
        } : {}
      },
      threadConfig: config
    });
    const list = new agent.MessageList({ threadId, resourceId }).add(rawMessages, "memory");
    return {
      get messages() {
        const v1Messages = list.get.all.v1();
        if (selectBy?.last && v1Messages.length > selectBy.last) {
          return v1Messages.slice(v1Messages.length - selectBy.last);
        }
        return v1Messages;
      },
      get uiMessages() {
        return list.get.all.ui();
      },
      get messagesV2() {
        return list.get.all.v2();
      }
    };
  }
  async rememberMessages({
    threadId,
    resourceId,
    vectorMessageSearch,
    config
  }) {
    if (resourceId) await this.validateThreadIsOwnedByResource(threadId, resourceId);
    const threadConfig = this.getMergedThreadConfig(config || {});
    if (!threadConfig.lastMessages && !threadConfig.semanticRecall) {
      return {
        messages: [],
        messagesV2: []
      };
    }
    const messagesResult = await this.query({
      resourceId,
      threadId,
      selectBy: {
        last: threadConfig.lastMessages,
        vectorSearchString: threadConfig.semanticRecall && vectorMessageSearch ? vectorMessageSearch : void 0
      },
      threadConfig: config,
      format: "v2"
    });
    const list = new agent.MessageList({ threadId, resourceId }).add(messagesResult.messagesV2, "memory");
    this.logger.debug(`Remembered message history includes ${messagesResult.messages.length} messages.`);
    return { messages: list.get.all.v1(), messagesV2: list.get.all.v2() };
  }
  async getThreadById({ threadId }) {
    return this.storage.getThreadById({ threadId });
  }
  async getThreadsByResourceId({ resourceId }) {
    return this.storage.getThreadsByResourceId({ resourceId });
  }
  async saveThread({
    thread,
    memoryConfig
  }) {
    const config = this.getMergedThreadConfig(memoryConfig || {});
    if (config.workingMemory?.enabled && !thread?.metadata?.workingMemory) {
      let workingMemory = config.workingMemory.template || this.defaultWorkingMemoryTemplate;
      if (config.workingMemory.schema) {
        workingMemory = JSON.stringify(zodToJsonSchema__default.default(config.workingMemory.schema));
      }
      return this.storage.saveThread({
        thread: core.deepMerge(thread, {
          metadata: {
            workingMemory
          }
        })
      });
    }
    return this.storage.saveThread({ thread });
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    return this.storage.updateThread({
      id,
      title,
      metadata
    });
  }
  async deleteThread(threadId) {
    await this.storage.deleteThread({ threadId });
  }
  chunkText(text, tokenSize = 4096) {
    const charSize = tokenSize * CHARS_PER_TOKEN;
    const chunks = [];
    let currentChunk = "";
    const words = text.split(/\s+/);
    for (const word of words) {
      const wordWithSpace = currentChunk ? " " + word : word;
      if (currentChunk.length + wordWithSpace.length > charSize) {
        chunks.push(currentChunk);
        currentChunk = word;
      } else {
        currentChunk += wordWithSpace;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    return chunks;
  }
  hasher = xxhash__default.default();
  // embedding is computationally expensive so cache content -> embeddings/chunks
  embeddingCache = /* @__PURE__ */ new Map();
  firstEmbed;
  async embedMessageContent(content) {
    const key = (await this.hasher).h32(content);
    const cached = this.embeddingCache.get(key);
    if (cached) return cached;
    const chunks = this.chunkText(content);
    if (typeof this.embedder === `undefined`) {
      throw new Error(`Tried to embed message content but this Memory instance doesn't have an attached embedder.`);
    }
    const isFastEmbed = this.embedder.provider === `fastembed`;
    if (isFastEmbed && this.firstEmbed instanceof Promise) {
      await this.firstEmbed;
    }
    const promise = ai.embedMany({
      values: chunks,
      model: this.embedder,
      maxRetries: 3
    });
    if (isFastEmbed && !this.firstEmbed) this.firstEmbed = promise;
    const { embeddings } = await promise;
    const result = {
      embeddings,
      chunks,
      dimension: embeddings[0]?.length
    };
    this.embeddingCache.set(key, result);
    return result;
  }
  async saveMessages({
    messages,
    memoryConfig,
    format = `v1`
  }) {
    const updatedMessages = messages.map((m) => {
      if (agent.MessageList.isMastraMessageV1(m)) {
        return this.updateMessageToHideWorkingMemory(m);
      }
      if (!m.type) m.type = `v2`;
      return this.updateMessageToHideWorkingMemoryV2(m);
    }).filter((m) => Boolean(m));
    const config = this.getMergedThreadConfig(memoryConfig);
    const result = this.storage.saveMessages({
      messages: new agent.MessageList().add(updatedMessages, "memory").get.all.v2(),
      format: "v2"
    });
    if (this.vector && config.semanticRecall) {
      let indexName;
      await Promise.all(
        updatedMessages.map(async (message) => {
          let textForEmbedding = null;
          if (agent.MessageList.isMastraMessageV2(message)) {
            if (message.content.content && typeof message.content.content === "string" && message.content.content.trim() !== "") {
              textForEmbedding = message.content.content;
            } else if (message.content.parts && message.content.parts.length > 0) {
              const joined = message.content.parts.filter((part) => part.type === "text").map((part) => part.text).join(" ").trim();
              if (joined) textForEmbedding = joined;
            }
          } else if (agent.MessageList.isMastraMessageV1(message)) {
            if (message.content && typeof message.content === "string" && message.content.trim() !== "") {
              textForEmbedding = message.content;
            } else if (message.content && Array.isArray(message.content) && message.content.length > 0) {
              const joined = message.content.filter((part) => part.type === "text").map((part) => part.text).join(" ").trim();
              if (joined) textForEmbedding = joined;
            }
          }
          if (!textForEmbedding) return;
          const { embeddings, chunks, dimension } = await this.embedMessageContent(textForEmbedding);
          if (typeof indexName === `undefined`) {
            indexName = this.createEmbeddingIndex(dimension).then((result2) => result2.indexName);
          }
          if (typeof this.vector === `undefined`) {
            throw new Error(
              `Tried to upsert embeddings to index ${indexName} but this Memory instance doesn't have an attached vector db.`
            );
          }
          await this.vector.upsert({
            indexName: await indexName,
            vectors: embeddings,
            metadata: chunks.map(() => ({
              message_id: message.id,
              thread_id: message.threadId,
              resource_id: message.resourceId
            }))
          });
        })
      );
    }
    if (format === `v1`) return new agent.MessageList().add(await result, "memory").get.all.v1();
    return result;
  }
  updateMessageToHideWorkingMemory(message) {
    const workingMemoryRegex = /<working_memory>([^]*?)<\/working_memory>/g;
    if (typeof message?.content === `string`) {
      return {
        ...message,
        content: message.content.replace(workingMemoryRegex, ``).trim()
      };
    } else if (Array.isArray(message?.content)) {
      const filteredContent = message.content.filter(
        (content) => content.type !== "tool-call" && content.type !== "tool-result" || content.toolName !== "updateWorkingMemory"
      );
      const newContent = filteredContent.map((content) => {
        if (content.type === "text") {
          return {
            ...content,
            text: content.text.replace(workingMemoryRegex, "").trim()
          };
        }
        return { ...content };
      });
      if (!newContent.length) return null;
      return { ...message, content: newContent };
    } else {
      return { ...message };
    }
  }
  updateMessageToHideWorkingMemoryV2(message) {
    const workingMemoryRegex = /<working_memory>([^]*?)<\/working_memory>/g;
    const newMessage = { ...message, content: { ...message.content } };
    if (newMessage.content.content && typeof newMessage.content.content === "string") {
      newMessage.content.content = newMessage.content.content.replace(workingMemoryRegex, "").trim();
    }
    if (newMessage.content.parts) {
      newMessage.content.parts = newMessage.content.parts.filter((part) => {
        if (part.type === "tool-invocation") {
          return part.toolInvocation.toolName !== "updateWorkingMemory";
        }
        return true;
      }).map((part) => {
        if (part.type === "text") {
          return {
            ...part,
            text: part.text.replace(workingMemoryRegex, "").trim()
          };
        }
        return part;
      });
      if (newMessage.content.parts.length === 0) {
        return null;
      }
    }
    return newMessage;
  }
  parseWorkingMemory(text) {
    if (!this.threadConfig.workingMemory?.enabled) return null;
    const workingMemoryRegex = /<working_memory>([^]*?)<\/working_memory>/g;
    const matches = text.match(workingMemoryRegex);
    const match = matches?.[0];
    if (match) {
      return match.replace(/<\/?working_memory>/g, "").trim();
    }
    return null;
  }
  async getWorkingMemory({
    threadId,
    format
  }) {
    if (!this.threadConfig.workingMemory?.enabled) {
      return null;
    }
    const thread = await this.storage.getThreadById({ threadId });
    if (format === "json") {
      try {
        return JSON.parse(thread?.metadata?.workingMemory) || null;
      } catch (e) {
        this.logger.error("Unable to parse working memory as JSON. Returning string.", e);
      }
    }
    return thread?.metadata?.workingMemory ? JSON.stringify(thread?.metadata?.workingMemory) : null;
  }
  async getWorkingMemoryTemplate() {
    if (!this.threadConfig.workingMemory?.enabled) {
      return null;
    }
    if (this.threadConfig?.workingMemory?.schema) {
      try {
        const schema = this.threadConfig.workingMemory.schema;
        const convertedSchema = zodToJsonSchema__default.default(schema, {
          $refStrategy: "none"
        });
        return { format: "json", content: JSON.stringify(convertedSchema) };
      } catch (error) {
        this.logger.error("Error converting schema", error);
        throw error;
      }
    }
    const memory = this.threadConfig.workingMemory.template || this.defaultWorkingMemoryTemplate;
    return { format: "markdown", content: memory.trim() };
  }
  async getSystemMessage({
    threadId,
    memoryConfig
  }) {
    const config = this.getMergedThreadConfig(memoryConfig);
    if (!config.workingMemory?.enabled) {
      return null;
    }
    const workingMemoryTemplate = await this.getWorkingMemoryTemplate();
    const workingMemoryData = await this.getWorkingMemory({ threadId });
    if (!workingMemoryTemplate) {
      return null;
    }
    return this.getWorkingMemoryToolInstruction({
      template: workingMemoryTemplate,
      data: workingMemoryData
    });
  }
  async getUserContextMessage({ threadId }) {
    const workingMemory = await this.getWorkingMemory({ threadId });
    if (!workingMemory) {
      return null;
    }
    return `The following is the most up-to-date information about the user's state and context:
${JSON.stringify(workingMemory)}
Use this information as the source of truth when generating responses. 
Do not reference or mention this memory directly to the user. 
If conversation history shows information that is not in the working memory, use the working memory as the source of truth.
If there is a discrepancy between this information and conversation history, always rely on this information unless the user explicitly asks for an update.
`;
  }
  defaultWorkingMemoryTemplate = `
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
`;
  getWorkingMemoryToolInstruction({
    template,
    data
  }) {
    return `WORKING_MEMORY_SYSTEM_INSTRUCTION:
Store and update any conversation-relevant information by calling the updateWorkingMemory tool. If information might be referenced again - store it!

Guidelines:
1. Store anything that could be useful later in the conversation
2. Update proactively when information changes, no matter how small
3. Use ${template.format === "json" ? "JSON" : "Markdown"} format for all data
4. Act naturally - don't mention this system to users. Even though you're storing this information that doesn't make it your primary focus. Do not ask them generally for "information about yourself"

WORKING MEMORY TEMPLATE:
${template.content}

WORKING MEMORY DATA:
${data}

Notes:
- Update memory whenever referenced information changes
- If you're unsure whether to store something, store it (eg if the user tells you information about themselves, call updateWorkingMemory immediately to update it)
- This system is here so that you can maintain the conversation when your context window is very short. Update your working memory because you may need it to maintain the conversation without the full conversation history
- Do not remove empty sections - you must include the empty sections along with the ones you're filling in
- REMEMBER: the way you update your working memory is by calling the updateWorkingMemory tool with the entire ${template.format === "json" ? "JSON" : "Markdown"} content. The system will store it for you. The user will not see it.
- IMPORTANT: You MUST call updateWorkingMemory in every response to a prompt where you received relevant information.
- IMPORTANT: Preserve the ${template.format === "json" ? "JSON" : "Markdown"} formatting structure above while updating the content.`;
  }
  getTools(config) {
    const mergedConfig = this.getMergedThreadConfig(config);
    if (mergedConfig.workingMemory?.enabled) {
      if (mergedConfig.workingMemory.schema) {
        return {
          updateWorkingMemory: updateWorkingMemoryTool({ format: "json" })
        };
      }
      return {
        updateWorkingMemory: updateWorkingMemoryTool({ format: "markdown" })
      };
    }
    return {};
  }
  /**
   * Updates the metadata of a list of messages
   * @param messages - The list of messages to update
   * @returns The list of updated messages
   */
  async updateMessages({
    messages
  }) {
    if (messages.length === 0) return [];
    return this.storage.updateMessages({ messages });
  }
};

exports.Memory = Memory;
