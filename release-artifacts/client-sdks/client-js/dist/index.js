import { AbstractAgent, EventType } from '@ag-ui/client';
import { Observable } from 'rxjs';
import { processDataStream } from '@ai-sdk/ui-utils';
import { ZodSchema } from 'zod';
import originalZodToJsonSchema from 'zod-to-json-schema';
import { isVercelTool } from '@mastra/core/tools';
import { RuntimeContext } from '@mastra/core/runtime-context';

// src/adapters/agui.ts
var AGUIAdapter = class extends AbstractAgent {
  agent;
  resourceId;
  constructor({ agent, agentId, resourceId, ...rest }) {
    super({
      agentId,
      ...rest
    });
    this.agent = agent;
    this.resourceId = resourceId;
  }
  run(input) {
    return new Observable((subscriber) => {
      const convertedMessages = convertMessagesToMastraMessages(input.messages);
      subscriber.next({
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId
      });
      this.agent.stream({
        threadId: input.threadId,
        resourceId: this.resourceId ?? "",
        runId: input.runId,
        messages: convertedMessages,
        clientTools: input.tools.reduce(
          (acc, tool) => {
            acc[tool.name] = {
              id: tool.name,
              description: tool.description,
              inputSchema: tool.parameters
            };
            return acc;
          },
          {}
        )
      }).then((response) => {
        let currentMessageId = void 0;
        let isInTextMessage = false;
        return response.processDataStream({
          onTextPart: (text) => {
            if (currentMessageId === void 0) {
              currentMessageId = generateUUID();
              const message2 = {
                type: EventType.TEXT_MESSAGE_START,
                messageId: currentMessageId,
                role: "assistant"
              };
              subscriber.next(message2);
              isInTextMessage = true;
            }
            const message = {
              type: EventType.TEXT_MESSAGE_CONTENT,
              messageId: currentMessageId,
              delta: text
            };
            subscriber.next(message);
          },
          onFinishMessagePart: () => {
            if (currentMessageId !== void 0) {
              const message = {
                type: EventType.TEXT_MESSAGE_END,
                messageId: currentMessageId
              };
              subscriber.next(message);
              isInTextMessage = false;
            }
            subscriber.next({
              type: EventType.RUN_FINISHED,
              threadId: input.threadId,
              runId: input.runId
            });
            subscriber.complete();
          },
          onToolCallPart(streamPart) {
            const parentMessageId = currentMessageId || generateUUID();
            if (isInTextMessage) {
              const message = {
                type: EventType.TEXT_MESSAGE_END,
                messageId: parentMessageId
              };
              subscriber.next(message);
              isInTextMessage = false;
            }
            subscriber.next({
              type: EventType.TOOL_CALL_START,
              toolCallId: streamPart.toolCallId,
              toolCallName: streamPart.toolName,
              parentMessageId
            });
            subscriber.next({
              type: EventType.TOOL_CALL_ARGS,
              toolCallId: streamPart.toolCallId,
              delta: JSON.stringify(streamPart.args),
              parentMessageId
            });
            subscriber.next({
              type: EventType.TOOL_CALL_END,
              toolCallId: streamPart.toolCallId,
              parentMessageId
            });
          }
        });
      }).catch((error) => {
        console.error("error", error);
        subscriber.error(error);
      });
      return () => {
      };
    });
  }
};
function generateUUID() {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      const buffer = new Uint8Array(16);
      crypto.getRandomValues(buffer);
      buffer[6] = buffer[6] & 15 | 64;
      buffer[8] = buffer[8] & 63 | 128;
      let hex = "";
      for (let i = 0; i < 16; i++) {
        hex += buffer[i].toString(16).padStart(2, "0");
        if (i === 3 || i === 5 || i === 7 || i === 9) hex += "-";
      }
      return hex;
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function convertMessagesToMastraMessages(messages) {
  const result = [];
  for (const message of messages) {
    if (message.role === "assistant") {
      const parts = message.content ? [{ type: "text", text: message.content }] : [];
      for (const toolCall of message.toolCalls ?? []) {
        parts.push({
          type: "tool-call",
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          args: JSON.parse(toolCall.function.arguments)
        });
      }
      result.push({
        role: "assistant",
        content: parts
      });
      if (message.toolCalls?.length) {
        result.push({
          role: "tool",
          content: message.toolCalls.map((toolCall) => ({
            type: "tool-result",
            toolCallId: toolCall.id,
            toolName: toolCall.function.name,
            result: JSON.parse(toolCall.function.arguments)
          }))
        });
      }
    } else if (message.role === "user") {
      result.push({
        role: "user",
        content: message.content || ""
      });
    } else if (message.role === "tool") {
      result.push({
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: message.toolCallId,
            toolName: "unknown",
            result: message.content
          }
        ]
      });
    }
  }
  return result;
}
function zodToJsonSchema(zodSchema) {
  if (!(zodSchema instanceof ZodSchema)) {
    return zodSchema;
  }
  return originalZodToJsonSchema(zodSchema, { $refStrategy: "none" });
}
function processClientTools(clientTools) {
  if (!clientTools) {
    return void 0;
  }
  return Object.fromEntries(
    Object.entries(clientTools).map(([key, value]) => {
      if (isVercelTool(value)) {
        return [
          key,
          {
            ...value,
            parameters: value.parameters ? zodToJsonSchema(value.parameters) : void 0
          }
        ];
      } else {
        return [
          key,
          {
            ...value,
            inputSchema: value.inputSchema ? zodToJsonSchema(value.inputSchema) : void 0,
            outputSchema: value.outputSchema ? zodToJsonSchema(value.outputSchema) : void 0
          }
        ];
      }
    })
  );
}

// src/resources/base.ts
var BaseResource = class {
  options;
  constructor(options) {
    this.options = options;
  }
  /**
   * Makes an HTTP request to the API with retries and exponential backoff
   * @param path - The API endpoint path
   * @param options - Optional request configuration
   * @returns Promise containing the response data
   */
  async request(path, options = {}) {
    let lastError = null;
    const { baseUrl, retries = 3, backoffMs = 100, maxBackoffMs = 1e3, headers = {} } = this.options;
    let delay = backoffMs;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
          ...options,
          headers: {
            ...headers,
            ...options.headers
            // TODO: Bring this back once we figure out what we/users need to do to make this work with cross-origin requests
            // 'x-mastra-client-type': 'js',
          },
          body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : void 0
        });
        if (!response.ok) {
          const errorBody = await response.text();
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorJson = JSON.parse(errorBody);
            errorMessage += ` - ${JSON.stringify(errorJson)}`;
          } catch {
            if (errorBody) {
              errorMessage += ` - ${errorBody}`;
            }
          }
          throw new Error(errorMessage);
        }
        if (options.stream) {
          return response;
        }
        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error;
        if (attempt === retries) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, maxBackoffMs);
      }
    }
    throw lastError || new Error("Request failed");
  }
};
function parseClientRuntimeContext(runtimeContext) {
  if (runtimeContext) {
    if (runtimeContext instanceof RuntimeContext) {
      return Object.fromEntries(runtimeContext.entries());
    }
    return runtimeContext;
  }
  return void 0;
}

// src/resources/agent.ts
var AgentVoice = class extends BaseResource {
  constructor(options, agentId) {
    super(options);
    this.agentId = agentId;
    this.agentId = agentId;
  }
  /**
   * Convert text to speech using the agent's voice provider
   * @param text - Text to convert to speech
   * @param options - Optional provider-specific options for speech generation
   * @returns Promise containing the audio data
   */
  async speak(text, options) {
    return this.request(`/api/agents/${this.agentId}/voice/speak`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: { input: text, options },
      stream: true
    });
  }
  /**
   * Convert speech to text using the agent's voice provider
   * @param audio - Audio data to transcribe
   * @param options - Optional provider-specific options
   * @returns Promise containing the transcribed text
   */
  listen(audio, options) {
    const formData = new FormData();
    formData.append("audio", audio);
    if (options) {
      formData.append("options", JSON.stringify(options));
    }
    return this.request(`/api/agents/${this.agentId}/voice/listen`, {
      method: "POST",
      body: formData
    });
  }
  /**
   * Get available speakers for the agent's voice provider
   * @returns Promise containing list of available speakers
   */
  getSpeakers() {
    return this.request(`/api/agents/${this.agentId}/voice/speakers`);
  }
  /**
   * Get the listener configuration for the agent's voice provider
   * @returns Promise containing a check if the agent has listening capabilities
   */
  getListener() {
    return this.request(`/api/agents/${this.agentId}/voice/listener`);
  }
};
var Agent = class extends BaseResource {
  constructor(options, agentId) {
    super(options);
    this.agentId = agentId;
    this.voice = new AgentVoice(options, this.agentId);
  }
  voice;
  /**
   * Retrieves details about the agent
   * @returns Promise containing agent details including model and instructions
   */
  details() {
    return this.request(`/api/agents/${this.agentId}`);
  }
  generate(params) {
    const processedParams = {
      ...params,
      output: params.output ? zodToJsonSchema(params.output) : void 0,
      experimental_output: params.experimental_output ? zodToJsonSchema(params.experimental_output) : void 0,
      runtimeContext: parseClientRuntimeContext(params.runtimeContext),
      clientTools: processClientTools(params.clientTools)
    };
    return this.request(`/api/agents/${this.agentId}/generate`, {
      method: "POST",
      body: processedParams
    });
  }
  /**
   * Streams a response from the agent
   * @param params - Stream parameters including prompt
   * @returns Promise containing the enhanced Response object with processDataStream method
   */
  async stream(params) {
    const processedParams = {
      ...params,
      output: params.output ? zodToJsonSchema(params.output) : void 0,
      experimental_output: params.experimental_output ? zodToJsonSchema(params.experimental_output) : void 0,
      runtimeContext: parseClientRuntimeContext(params.runtimeContext),
      clientTools: processClientTools(params.clientTools)
    };
    const response = await this.request(`/api/agents/${this.agentId}/stream`, {
      method: "POST",
      body: processedParams,
      stream: true
    });
    if (!response.body) {
      throw new Error("No response body");
    }
    response.processDataStream = async (options = {}) => {
      await processDataStream({
        stream: response.body,
        ...options
      });
    };
    return response;
  }
  /**
   * Gets details about a specific tool available to the agent
   * @param toolId - ID of the tool to retrieve
   * @returns Promise containing tool details
   */
  getTool(toolId) {
    return this.request(`/api/agents/${this.agentId}/tools/${toolId}`);
  }
  /**
   * Executes a tool for the agent
   * @param toolId - ID of the tool to execute
   * @param params - Parameters required for tool execution
   * @returns Promise containing the tool execution results
   */
  executeTool(toolId, params) {
    const body = {
      data: params.data,
      runtimeContext: params.runtimeContext ? Object.fromEntries(params.runtimeContext.entries()) : void 0
    };
    return this.request(`/api/agents/${this.agentId}/tools/${toolId}/execute`, {
      method: "POST",
      body
    });
  }
  /**
   * Retrieves evaluation results for the agent
   * @returns Promise containing agent evaluations
   */
  evals() {
    return this.request(`/api/agents/${this.agentId}/evals/ci`);
  }
  /**
   * Retrieves live evaluation results for the agent
   * @returns Promise containing live agent evaluations
   */
  liveEvals() {
    return this.request(`/api/agents/${this.agentId}/evals/live`);
  }
};
var Network = class extends BaseResource {
  constructor(options, networkId) {
    super(options);
    this.networkId = networkId;
  }
  /**
   * Retrieves details about the network
   * @returns Promise containing network details
   */
  details() {
    return this.request(`/api/networks/${this.networkId}`);
  }
  /**
   * Generates a response from the agent
   * @param params - Generation parameters including prompt
   * @returns Promise containing the generated response
   */
  generate(params) {
    const processedParams = {
      ...params,
      output: zodToJsonSchema(params.output),
      experimental_output: zodToJsonSchema(params.experimental_output)
    };
    return this.request(`/api/networks/${this.networkId}/generate`, {
      method: "POST",
      body: processedParams
    });
  }
  /**
   * Streams a response from the agent
   * @param params - Stream parameters including prompt
   * @returns Promise containing the enhanced Response object with processDataStream method
   */
  async stream(params) {
    const processedParams = {
      ...params,
      output: zodToJsonSchema(params.output),
      experimental_output: zodToJsonSchema(params.experimental_output)
    };
    const response = await this.request(`/api/networks/${this.networkId}/stream`, {
      method: "POST",
      body: processedParams,
      stream: true
    });
    if (!response.body) {
      throw new Error("No response body");
    }
    response.processDataStream = async (options = {}) => {
      await processDataStream({
        stream: response.body,
        ...options
      });
    };
    return response;
  }
};

// src/resources/memory-thread.ts
var MemoryThread = class extends BaseResource {
  constructor(options, threadId, agentId) {
    super(options);
    this.threadId = threadId;
    this.agentId = agentId;
  }
  /**
   * Retrieves the memory thread details
   * @returns Promise containing thread details including title and metadata
   */
  get() {
    return this.request(`/api/memory/threads/${this.threadId}?agentId=${this.agentId}`);
  }
  /**
   * Updates the memory thread properties
   * @param params - Update parameters including title and metadata
   * @returns Promise containing updated thread details
   */
  update(params) {
    return this.request(`/api/memory/threads/${this.threadId}?agentId=${this.agentId}`, {
      method: "PATCH",
      body: params
    });
  }
  /**
   * Deletes the memory thread
   * @returns Promise containing deletion result
   */
  delete() {
    return this.request(`/api/memory/threads/${this.threadId}?agentId=${this.agentId}`, {
      method: "DELETE"
    });
  }
  /**
   * Retrieves messages associated with the thread
   * @param params - Optional parameters including limit for number of messages to retrieve
   * @returns Promise containing thread messages and UI messages
   */
  getMessages(params) {
    const query = new URLSearchParams({
      agentId: this.agentId,
      ...params?.limit ? { limit: params.limit.toString() } : {}
    });
    return this.request(`/api/memory/threads/${this.threadId}/messages?${query.toString()}`);
  }
};

// src/resources/vector.ts
var Vector = class extends BaseResource {
  constructor(options, vectorName) {
    super(options);
    this.vectorName = vectorName;
  }
  /**
   * Retrieves details about a specific vector index
   * @param indexName - Name of the index to get details for
   * @returns Promise containing vector index details
   */
  details(indexName) {
    return this.request(`/api/vector/${this.vectorName}/indexes/${indexName}`);
  }
  /**
   * Deletes a vector index
   * @param indexName - Name of the index to delete
   * @returns Promise indicating deletion success
   */
  delete(indexName) {
    return this.request(`/api/vector/${this.vectorName}/indexes/${indexName}`, {
      method: "DELETE"
    });
  }
  /**
   * Retrieves a list of all available indexes
   * @returns Promise containing array of index names
   */
  getIndexes() {
    return this.request(`/api/vector/${this.vectorName}/indexes`);
  }
  /**
   * Creates a new vector index
   * @param params - Parameters for index creation including dimension and metric
   * @returns Promise indicating creation success
   */
  createIndex(params) {
    return this.request(`/api/vector/${this.vectorName}/create-index`, {
      method: "POST",
      body: params
    });
  }
  /**
   * Upserts vectors into an index
   * @param params - Parameters containing vectors, metadata, and optional IDs
   * @returns Promise containing array of vector IDs
   */
  upsert(params) {
    return this.request(`/api/vector/${this.vectorName}/upsert`, {
      method: "POST",
      body: params
    });
  }
  /**
   * Queries vectors in an index
   * @param params - Query parameters including query vector and search options
   * @returns Promise containing query results
   */
  query(params) {
    return this.request(`/api/vector/${this.vectorName}/query`, {
      method: "POST",
      body: params
    });
  }
};

// src/resources/legacy-workflow.ts
var RECORD_SEPARATOR = "";
var LegacyWorkflow = class extends BaseResource {
  constructor(options, workflowId) {
    super(options);
    this.workflowId = workflowId;
  }
  /**
   * Retrieves details about the legacy workflow
   * @returns Promise containing legacy workflow details including steps and graphs
   */
  details() {
    return this.request(`/api/workflows/legacy/${this.workflowId}`);
  }
  /**
   * Retrieves all runs for a legacy workflow
   * @param params - Parameters for filtering runs
   * @returns Promise containing legacy workflow runs array
   */
  runs(params) {
    const searchParams = new URLSearchParams();
    if (params?.fromDate) {
      searchParams.set("fromDate", params.fromDate.toISOString());
    }
    if (params?.toDate) {
      searchParams.set("toDate", params.toDate.toISOString());
    }
    if (params?.limit) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.offset) {
      searchParams.set("offset", String(params.offset));
    }
    if (params?.resourceId) {
      searchParams.set("resourceId", params.resourceId);
    }
    if (searchParams.size) {
      return this.request(`/api/workflows/legacy/${this.workflowId}/runs?${searchParams}`);
    } else {
      return this.request(`/api/workflows/legacy/${this.workflowId}/runs`);
    }
  }
  /**
   * Creates a new legacy workflow run
   * @returns Promise containing the generated run ID
   */
  createRun(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    return this.request(`/api/workflows/legacy/${this.workflowId}/create-run?${searchParams.toString()}`, {
      method: "POST"
    });
  }
  /**
   * Starts a legacy workflow run synchronously without waiting for the workflow to complete
   * @param params - Object containing the runId and triggerData
   * @returns Promise containing success message
   */
  start(params) {
    return this.request(`/api/workflows/legacy/${this.workflowId}/start?runId=${params.runId}`, {
      method: "POST",
      body: params?.triggerData
    });
  }
  /**
   * Resumes a suspended legacy workflow step synchronously without waiting for the workflow to complete
   * @param stepId - ID of the step to resume
   * @param runId - ID of the legacy workflow run
   * @param context - Context to resume the legacy workflow with
   * @returns Promise containing the legacy workflow resume results
   */
  resume({
    stepId,
    runId,
    context
  }) {
    return this.request(`/api/workflows/legacy/${this.workflowId}/resume?runId=${runId}`, {
      method: "POST",
      body: {
        stepId,
        context
      }
    });
  }
  /**
   * Starts a workflow run asynchronously and returns a promise that resolves when the workflow is complete
   * @param params - Object containing the optional runId and triggerData
   * @returns Promise containing the workflow execution results
   */
  startAsync(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    return this.request(`/api/workflows/legacy/${this.workflowId}/start-async?${searchParams.toString()}`, {
      method: "POST",
      body: params?.triggerData
    });
  }
  /**
   * Resumes a suspended legacy workflow step asynchronously and returns a promise that resolves when the workflow is complete
   * @param params - Object containing the runId, stepId, and context
   * @returns Promise containing the workflow resume results
   */
  resumeAsync(params) {
    return this.request(`/api/workflows/legacy/${this.workflowId}/resume-async?runId=${params.runId}`, {
      method: "POST",
      body: {
        stepId: params.stepId,
        context: params.context
      }
    });
  }
  /**
   * Creates an async generator that processes a readable stream and yields records
   * separated by the Record Separator character (\x1E)
   *
   * @param stream - The readable stream to process
   * @returns An async generator that yields parsed records
   */
  async *streamProcessor(stream) {
    const reader = stream.getReader();
    let doneReading = false;
    let buffer = "";
    try {
      while (!doneReading) {
        const { done, value } = await reader.read();
        doneReading = done;
        if (done && !value) continue;
        try {
          const decoded = value ? new TextDecoder().decode(value) : "";
          const chunks = (buffer + decoded).split(RECORD_SEPARATOR);
          buffer = chunks.pop() || "";
          for (const chunk of chunks) {
            if (chunk) {
              if (typeof chunk === "string") {
                try {
                  const parsedChunk = JSON.parse(chunk);
                  yield parsedChunk;
                } catch {
                }
              }
            }
          }
        } catch {
        }
      }
      if (buffer) {
        try {
          yield JSON.parse(buffer);
        } catch {
        }
      }
    } finally {
      reader.cancel().catch(() => {
      });
    }
  }
  /**
   * Watches legacy workflow transitions in real-time
   * @param runId - Optional run ID to filter the watch stream
   * @returns AsyncGenerator that yields parsed records from the legacy workflow watch stream
   */
  async watch({ runId }, onRecord) {
    const response = await this.request(`/api/workflows/legacy/${this.workflowId}/watch?runId=${runId}`, {
      stream: true
    });
    if (!response.ok) {
      throw new Error(`Failed to watch legacy workflow: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }
    for await (const record of this.streamProcessor(response.body)) {
      onRecord(record);
    }
  }
};

// src/resources/tool.ts
var Tool = class extends BaseResource {
  constructor(options, toolId) {
    super(options);
    this.toolId = toolId;
  }
  /**
   * Retrieves details about the tool
   * @returns Promise containing tool details including description and schemas
   */
  details() {
    return this.request(`/api/tools/${this.toolId}`);
  }
  /**
   * Executes the tool with the provided parameters
   * @param params - Parameters required for tool execution
   * @returns Promise containing the tool execution results
   */
  execute(params) {
    const url = new URLSearchParams();
    if (params.runId) {
      url.set("runId", params.runId);
    }
    const body = {
      data: params.data,
      runtimeContext: parseClientRuntimeContext(params.runtimeContext)
    };
    return this.request(`/api/tools/${this.toolId}/execute?${url.toString()}`, {
      method: "POST",
      body
    });
  }
};

// src/resources/workflow.ts
var RECORD_SEPARATOR2 = "";
var Workflow = class extends BaseResource {
  constructor(options, workflowId) {
    super(options);
    this.workflowId = workflowId;
  }
  /**
   * Creates an async generator that processes a readable stream and yields workflow records
   * separated by the Record Separator character (\x1E)
   *
   * @param stream - The readable stream to process
   * @returns An async generator that yields parsed records
   */
  async *streamProcessor(stream) {
    const reader = stream.getReader();
    let doneReading = false;
    let buffer = "";
    try {
      while (!doneReading) {
        const { done, value } = await reader.read();
        doneReading = done;
        if (done && !value) continue;
        try {
          const decoded = value ? new TextDecoder().decode(value) : "";
          const chunks = (buffer + decoded).split(RECORD_SEPARATOR2);
          buffer = chunks.pop() || "";
          for (const chunk of chunks) {
            if (chunk) {
              if (typeof chunk === "string") {
                try {
                  const parsedChunk = JSON.parse(chunk);
                  yield parsedChunk;
                } catch {
                }
              }
            }
          }
        } catch {
        }
      }
      if (buffer) {
        try {
          yield JSON.parse(buffer);
        } catch {
        }
      }
    } finally {
      reader.cancel().catch(() => {
      });
    }
  }
  /**
   * Retrieves details about the workflow
   * @returns Promise containing workflow details including steps and graphs
   */
  details() {
    return this.request(`/api/workflows/${this.workflowId}`);
  }
  /**
   * Retrieves all runs for a workflow
   * @param params - Parameters for filtering runs
   * @returns Promise containing workflow runs array
   */
  runs(params) {
    const searchParams = new URLSearchParams();
    if (params?.fromDate) {
      searchParams.set("fromDate", params.fromDate.toISOString());
    }
    if (params?.toDate) {
      searchParams.set("toDate", params.toDate.toISOString());
    }
    if (params?.limit) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.offset) {
      searchParams.set("offset", String(params.offset));
    }
    if (params?.resourceId) {
      searchParams.set("resourceId", params.resourceId);
    }
    if (searchParams.size) {
      return this.request(`/api/workflows/${this.workflowId}/runs?${searchParams}`);
    } else {
      return this.request(`/api/workflows/${this.workflowId}/runs`);
    }
  }
  /**
   * Retrieves a specific workflow run by its ID
   * @param runId - The ID of the workflow run to retrieve
   * @returns Promise containing the workflow run details
   */
  runById(runId) {
    return this.request(`/api/workflows/${this.workflowId}/runs/${runId}`);
  }
  /**
   * Retrieves the execution result for a specific workflow run by its ID
   * @param runId - The ID of the workflow run to retrieve the execution result for
   * @returns Promise containing the workflow run execution result
   */
  runExecutionResult(runId) {
    return this.request(`/api/workflows/${this.workflowId}/runs/${runId}/execution-result`);
  }
  /**
   * Creates a new workflow run
   * @param params - Optional object containing the optional runId
   * @returns Promise containing the runId of the created run
   */
  createRun(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    return this.request(`/api/workflows/${this.workflowId}/create-run?${searchParams.toString()}`, {
      method: "POST"
    });
  }
  /**
   * Starts a workflow run synchronously without waiting for the workflow to complete
   * @param params - Object containing the runId, inputData and runtimeContext
   * @returns Promise containing success message
   */
  start(params) {
    const runtimeContext = parseClientRuntimeContext(params.runtimeContext);
    return this.request(`/api/workflows/${this.workflowId}/start?runId=${params.runId}`, {
      method: "POST",
      body: { inputData: params?.inputData, runtimeContext }
    });
  }
  /**
   * Resumes a suspended workflow step synchronously without waiting for the workflow to complete
   * @param params - Object containing the runId, step, resumeData and runtimeContext
   * @returns Promise containing success message
   */
  resume({
    step,
    runId,
    resumeData,
    ...rest
  }) {
    const runtimeContext = parseClientRuntimeContext(rest.runtimeContext);
    return this.request(`/api/workflows/${this.workflowId}/resume?runId=${runId}`, {
      method: "POST",
      stream: true,
      body: {
        step,
        resumeData,
        runtimeContext
      }
    });
  }
  /**
   * Starts a workflow run asynchronously and returns a promise that resolves when the workflow is complete
   * @param params - Object containing the optional runId, inputData and runtimeContext
   * @returns Promise containing the workflow execution results
   */
  startAsync(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    const runtimeContext = parseClientRuntimeContext(params.runtimeContext);
    return this.request(`/api/workflows/${this.workflowId}/start-async?${searchParams.toString()}`, {
      method: "POST",
      body: { inputData: params.inputData, runtimeContext }
    });
  }
  /**
   * Starts a vNext workflow run and returns a stream
   * @param params - Object containing the optional runId, inputData and runtimeContext
   * @returns Promise containing the vNext workflow execution results
   */
  async stream(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    const runtimeContext = parseClientRuntimeContext(params.runtimeContext);
    const response = await this.request(
      `/api/workflows/${this.workflowId}/stream?${searchParams.toString()}`,
      {
        method: "POST",
        body: { inputData: params.inputData, runtimeContext },
        stream: true
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to stream vNext workflow: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }
    const transformStream = new TransformStream({
      start() {
      },
      async transform(chunk, controller) {
        try {
          const decoded = new TextDecoder().decode(chunk);
          const chunks = decoded.split(RECORD_SEPARATOR2);
          for (const chunk2 of chunks) {
            if (chunk2) {
              try {
                const parsedChunk = JSON.parse(chunk2);
                controller.enqueue(parsedChunk);
              } catch {
              }
            }
          }
        } catch {
        }
      }
    });
    return response.body.pipeThrough(transformStream);
  }
  /**
   * Resumes a suspended workflow step asynchronously and returns a promise that resolves when the workflow is complete
   * @param params - Object containing the runId, step, resumeData and runtimeContext
   * @returns Promise containing the workflow resume results
   */
  resumeAsync(params) {
    const runtimeContext = parseClientRuntimeContext(params.runtimeContext);
    return this.request(`/api/workflows/${this.workflowId}/resume-async?runId=${params.runId}`, {
      method: "POST",
      body: {
        step: params.step,
        resumeData: params.resumeData,
        runtimeContext
      }
    });
  }
  /**
   * Watches workflow transitions in real-time
   * @param runId - Optional run ID to filter the watch stream
   * @returns AsyncGenerator that yields parsed records from the workflow watch stream
   */
  async watch({ runId }, onRecord) {
    const response = await this.request(`/api/workflows/${this.workflowId}/watch?runId=${runId}`, {
      stream: true
    });
    if (!response.ok) {
      throw new Error(`Failed to watch workflow: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }
    for await (const record of this.streamProcessor(response.body)) {
      if (typeof record === "string") {
        onRecord(JSON.parse(record));
      } else {
        onRecord(record);
      }
    }
  }
  /**
   * Creates a new ReadableStream from an iterable or async iterable of objects,
   * serializing each as JSON and separating them with the record separator (\x1E).
   *
   * @param records - An iterable or async iterable of objects to stream
   * @returns A ReadableStream emitting the records as JSON strings separated by the record separator
   */
  static createRecordStream(records) {
    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const record of records) {
            const json = JSON.stringify(record) + RECORD_SEPARATOR2;
            controller.enqueue(encoder.encode(json));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });
  }
};

// src/resources/a2a.ts
var A2A = class extends BaseResource {
  constructor(options, agentId) {
    super(options);
    this.agentId = agentId;
  }
  /**
   * Get the agent card with metadata about the agent
   * @returns Promise containing the agent card information
   */
  async getCard() {
    return this.request(`/.well-known/${this.agentId}/agent.json`);
  }
  /**
   * Send a message to the agent and get a response
   * @param params - Parameters for the task
   * @returns Promise containing the task response
   */
  async sendMessage(params) {
    const response = await this.request(`/a2a/${this.agentId}`, {
      method: "POST",
      body: {
        method: "tasks/send",
        params
      }
    });
    return { task: response.result };
  }
  /**
   * Get the status and result of a task
   * @param params - Parameters for querying the task
   * @returns Promise containing the task response
   */
  async getTask(params) {
    const response = await this.request(`/a2a/${this.agentId}`, {
      method: "POST",
      body: {
        method: "tasks/get",
        params
      }
    });
    return response.result;
  }
  /**
   * Cancel a running task
   * @param params - Parameters identifying the task to cancel
   * @returns Promise containing the task response
   */
  async cancelTask(params) {
    return this.request(`/a2a/${this.agentId}`, {
      method: "POST",
      body: {
        method: "tasks/cancel",
        params
      }
    });
  }
  /**
   * Send a message and subscribe to streaming updates (not fully implemented)
   * @param params - Parameters for the task
   * @returns Promise containing the task response
   */
  async sendAndSubscribe(params) {
    return this.request(`/a2a/${this.agentId}`, {
      method: "POST",
      body: {
        method: "tasks/sendSubscribe",
        params
      },
      stream: true
    });
  }
};

// src/resources/mcp-tool.ts
var MCPTool = class extends BaseResource {
  serverId;
  toolId;
  constructor(options, serverId, toolId) {
    super(options);
    this.serverId = serverId;
    this.toolId = toolId;
  }
  /**
   * Retrieves details about this specific tool from the MCP server.
   * @returns Promise containing the tool's information (name, description, schema).
   */
  details() {
    return this.request(`/api/mcp/${this.serverId}/tools/${this.toolId}`);
  }
  /**
   * Executes this specific tool on the MCP server.
   * @param params - Parameters for tool execution, including data/args and optional runtimeContext.
   * @returns Promise containing the result of the tool execution.
   */
  execute(params) {
    const body = {};
    if (params.data !== void 0) body.data = params.data;
    if (params.runtimeContext !== void 0) {
      body.runtimeContext = params.runtimeContext;
    }
    return this.request(`/api/mcp/${this.serverId}/tools/${this.toolId}/execute`, {
      method: "POST",
      body: Object.keys(body).length > 0 ? body : void 0
    });
  }
};

// src/client.ts
var MastraClient = class extends BaseResource {
  constructor(options) {
    super(options);
  }
  /**
   * Retrieves all available agents
   * @returns Promise containing map of agent IDs to agent details
   */
  getAgents() {
    return this.request("/api/agents");
  }
  async getAGUI({ resourceId }) {
    const agents = await this.getAgents();
    return Object.entries(agents).reduce(
      (acc, [agentId]) => {
        const agent = this.getAgent(agentId);
        acc[agentId] = new AGUIAdapter({
          agentId,
          agent,
          resourceId
        });
        return acc;
      },
      {}
    );
  }
  /**
   * Gets an agent instance by ID
   * @param agentId - ID of the agent to retrieve
   * @returns Agent instance
   */
  getAgent(agentId) {
    return new Agent(this.options, agentId);
  }
  /**
   * Retrieves memory threads for a resource
   * @param params - Parameters containing the resource ID
   * @returns Promise containing array of memory threads
   */
  getMemoryThreads(params) {
    return this.request(`/api/memory/threads?resourceid=${params.resourceId}&agentId=${params.agentId}`);
  }
  /**
   * Creates a new memory thread
   * @param params - Parameters for creating the memory thread
   * @returns Promise containing the created memory thread
   */
  createMemoryThread(params) {
    return this.request(`/api/memory/threads?agentId=${params.agentId}`, { method: "POST", body: params });
  }
  /**
   * Gets a memory thread instance by ID
   * @param threadId - ID of the memory thread to retrieve
   * @returns MemoryThread instance
   */
  getMemoryThread(threadId, agentId) {
    return new MemoryThread(this.options, threadId, agentId);
  }
  /**
   * Saves messages to memory
   * @param params - Parameters containing messages to save
   * @returns Promise containing the saved messages
   */
  saveMessageToMemory(params) {
    return this.request(`/api/memory/save-messages?agentId=${params.agentId}`, {
      method: "POST",
      body: params
    });
  }
  /**
   * Gets the status of the memory system
   * @returns Promise containing memory system status
   */
  getMemoryStatus(agentId) {
    return this.request(`/api/memory/status?agentId=${agentId}`);
  }
  /**
   * Retrieves all available tools
   * @returns Promise containing map of tool IDs to tool details
   */
  getTools() {
    return this.request("/api/tools");
  }
  /**
   * Gets a tool instance by ID
   * @param toolId - ID of the tool to retrieve
   * @returns Tool instance
   */
  getTool(toolId) {
    return new Tool(this.options, toolId);
  }
  /**
   * Retrieves all available legacy workflows
   * @returns Promise containing map of legacy workflow IDs to legacy workflow details
   */
  getLegacyWorkflows() {
    return this.request("/api/workflows/legacy");
  }
  /**
   * Gets a legacy workflow instance by ID
   * @param workflowId - ID of the legacy workflow to retrieve
   * @returns Legacy Workflow instance
   */
  getLegacyWorkflow(workflowId) {
    return new LegacyWorkflow(this.options, workflowId);
  }
  /**
   * Retrieves all available workflows
   * @returns Promise containing map of workflow IDs to workflow details
   */
  getWorkflows() {
    return this.request("/api/workflows");
  }
  /**
   * Gets a workflow instance by ID
   * @param workflowId - ID of the workflow to retrieve
   * @returns Workflow instance
   */
  getWorkflow(workflowId) {
    return new Workflow(this.options, workflowId);
  }
  /**
   * Gets a vector instance by name
   * @param vectorName - Name of the vector to retrieve
   * @returns Vector instance
   */
  getVector(vectorName) {
    return new Vector(this.options, vectorName);
  }
  /**
   * Retrieves logs
   * @param params - Parameters for filtering logs
   * @returns Promise containing array of log messages
   */
  getLogs(params) {
    const { transportId, fromDate, toDate, logLevel, filters, page, perPage } = params;
    const _filters = filters ? Object.entries(filters).map(([key, value]) => `${key}:${value}`) : [];
    const searchParams = new URLSearchParams();
    if (transportId) {
      searchParams.set("transportId", transportId);
    }
    if (fromDate) {
      searchParams.set("fromDate", fromDate.toISOString());
    }
    if (toDate) {
      searchParams.set("toDate", toDate.toISOString());
    }
    if (logLevel) {
      searchParams.set("logLevel", logLevel);
    }
    if (page) {
      searchParams.set("page", String(page));
    }
    if (perPage) {
      searchParams.set("perPage", String(perPage));
    }
    if (_filters) {
      if (Array.isArray(_filters)) {
        for (const filter of _filters) {
          searchParams.append("filters", filter);
        }
      } else {
        searchParams.set("filters", _filters);
      }
    }
    if (searchParams.size) {
      return this.request(`/api/logs?${searchParams}`);
    } else {
      return this.request(`/api/logs`);
    }
  }
  /**
   * Gets logs for a specific run
   * @param params - Parameters containing run ID to retrieve
   * @returns Promise containing array of log messages
   */
  getLogForRun(params) {
    const { runId, transportId, fromDate, toDate, logLevel, filters, page, perPage } = params;
    const _filters = filters ? Object.entries(filters).map(([key, value]) => `${key}:${value}`) : [];
    const searchParams = new URLSearchParams();
    if (runId) {
      searchParams.set("runId", runId);
    }
    if (transportId) {
      searchParams.set("transportId", transportId);
    }
    if (fromDate) {
      searchParams.set("fromDate", fromDate.toISOString());
    }
    if (toDate) {
      searchParams.set("toDate", toDate.toISOString());
    }
    if (logLevel) {
      searchParams.set("logLevel", logLevel);
    }
    if (page) {
      searchParams.set("page", String(page));
    }
    if (perPage) {
      searchParams.set("perPage", String(perPage));
    }
    if (_filters) {
      if (Array.isArray(_filters)) {
        for (const filter of _filters) {
          searchParams.append("filters", filter);
        }
      } else {
        searchParams.set("filters", _filters);
      }
    }
    if (searchParams.size) {
      return this.request(`/api/logs/${runId}?${searchParams}`);
    } else {
      return this.request(`/api/logs/${runId}`);
    }
  }
  /**
   * List of all log transports
   * @returns Promise containing list of log transports
   */
  getLogTransports() {
    return this.request("/api/logs/transports");
  }
  /**
   * List of all traces (paged)
   * @param params - Parameters for filtering traces
   * @returns Promise containing telemetry data
   */
  getTelemetry(params) {
    const { name, scope, page, perPage, attribute, fromDate, toDate } = params || {};
    const _attribute = attribute ? Object.entries(attribute).map(([key, value]) => `${key}:${value}`) : [];
    const searchParams = new URLSearchParams();
    if (name) {
      searchParams.set("name", name);
    }
    if (scope) {
      searchParams.set("scope", scope);
    }
    if (page) {
      searchParams.set("page", String(page));
    }
    if (perPage) {
      searchParams.set("perPage", String(perPage));
    }
    if (_attribute) {
      if (Array.isArray(_attribute)) {
        for (const attr of _attribute) {
          searchParams.append("attribute", attr);
        }
      } else {
        searchParams.set("attribute", _attribute);
      }
    }
    if (fromDate) {
      searchParams.set("fromDate", fromDate.toISOString());
    }
    if (toDate) {
      searchParams.set("toDate", toDate.toISOString());
    }
    if (searchParams.size) {
      return this.request(`/api/telemetry?${searchParams}`);
    } else {
      return this.request(`/api/telemetry`);
    }
  }
  /**
   * Retrieves all available networks
   * @returns Promise containing map of network IDs to network details
   */
  getNetworks() {
    return this.request("/api/networks");
  }
  /**
   * Gets a network instance by ID
   * @param networkId - ID of the network to retrieve
   * @returns Network instance
   */
  getNetwork(networkId) {
    return new Network(this.options, networkId);
  }
  /**
   * Retrieves a list of available MCP servers.
   * @param params - Optional parameters for pagination (limit, offset).
   * @returns Promise containing the list of MCP servers and pagination info.
   */
  getMcpServers(params) {
    const searchParams = new URLSearchParams();
    if (params?.limit !== void 0) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.offset !== void 0) {
      searchParams.set("offset", String(params.offset));
    }
    const queryString = searchParams.toString();
    return this.request(`/api/mcp/v0/servers${queryString ? `?${queryString}` : ""}`);
  }
  /**
   * Retrieves detailed information for a specific MCP server.
   * @param serverId - The ID of the MCP server to retrieve.
   * @param params - Optional parameters, e.g., specific version.
   * @returns Promise containing the detailed MCP server information.
   */
  getMcpServerDetails(serverId, params) {
    const searchParams = new URLSearchParams();
    if (params?.version) {
      searchParams.set("version", params.version);
    }
    const queryString = searchParams.toString();
    return this.request(`/api/mcp/v0/servers/${serverId}${queryString ? `?${queryString}` : ""}`);
  }
  /**
   * Retrieves a list of tools for a specific MCP server.
   * @param serverId - The ID of the MCP server.
   * @returns Promise containing the list of tools.
   */
  getMcpServerTools(serverId) {
    return this.request(`/api/mcp/${serverId}/tools`);
  }
  /**
   * Gets an MCPTool resource instance for a specific tool on an MCP server.
   * This instance can then be used to fetch details or execute the tool.
   * @param serverId - The ID of the MCP server.
   * @param toolId - The ID of the tool.
   * @returns MCPTool instance.
   */
  getMcpServerTool(serverId, toolId) {
    return new MCPTool(this.options, serverId, toolId);
  }
  /**
   * Gets an A2A client for interacting with an agent via the A2A protocol
   * @param agentId - ID of the agent to interact with
   * @returns A2A client instance
   */
  getA2A(agentId) {
    return new A2A(this.options, agentId);
  }
};

export { MastraClient };
