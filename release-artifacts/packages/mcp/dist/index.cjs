'use strict';

var base = require('@mastra/core/base');
var tools = require('@mastra/core/tools');
var utils = require('@mastra/core/utils');
var index_js$1 = require('@modelcontextprotocol/sdk/client/index.js');
var sse_js$1 = require('@modelcontextprotocol/sdk/client/sse.js');
var stdio_js$1 = require('@modelcontextprotocol/sdk/client/stdio.js');
var streamableHttp_js$1 = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
var protocol_js = require('@modelcontextprotocol/sdk/shared/protocol.js');
var types_js = require('@modelcontextprotocol/sdk/types.js');
var exitHook = require('exit-hook');
var zod = require('zod');
var zodFromJsonSchema = require('zod-from-json-schema');
var equal = require('fast-deep-equal');
var uuid = require('uuid');
var crypto$1 = require('crypto');
var core = require('@mastra/core');
var mcp = require('@mastra/core/mcp');
var runtimeContext = require('@mastra/core/runtime-context');
var index_js = require('@modelcontextprotocol/sdk/server/index.js');
var sse_js = require('@modelcontextprotocol/sdk/server/sse.js');
var stdio_js = require('@modelcontextprotocol/sdk/server/stdio.js');
var streamableHttp_js = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
var streaming = require('hono/streaming');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var equal__default = /*#__PURE__*/_interopDefault(equal);

// src/client/client.ts
var PromptClientActions = class {
  client;
  logger;
  constructor({ client, logger }) {
    this.client = client;
    this.logger = logger;
  }
  /**
   * Get all prompts from the connected MCP server.
   * @returns A list of prompts with their versions.
   */
  async list() {
    try {
      const response = await this.client.listPrompts();
      if (response && response.prompts && Array.isArray(response.prompts)) {
        return response.prompts.map((prompt) => ({ ...prompt, version: prompt.version || "" }));
      } else {
        this.logger.warn(`Prompts response from server ${this.client.name} did not have expected structure.`, {
          response
        });
        return [];
      }
    } catch (e) {
      if (e.code === types_js.ErrorCode.MethodNotFound) {
        return [];
      }
      this.logger.error(`Error getting prompts from server ${this.client.name}`, {
        error: e instanceof Error ? e.message : String(e)
      });
      throw new Error(
        `Failed to fetch prompts from server ${this.client.name}: ${e instanceof Error ? e.stack || e.message : String(e)}`
      );
    }
  }
  /**
   * Get a specific prompt.
   * @param name The name of the prompt to get.
   * @param args Optional arguments for the prompt.
   * @param version Optional version of the prompt to get.
   * @returns The prompt content.
   */
  async get({ name, args, version }) {
    return this.client.getPrompt({ name, args, version });
  }
  /**
   * Set a notification handler for when the list of available prompts changes.
   * @param handler The callback function to handle the notification.
   */
  async onListChanged(handler) {
    this.client.setPromptListChangedNotificationHandler(handler);
  }
};
var ResourceClientActions = class {
  client;
  logger;
  constructor({ client, logger }) {
    this.client = client;
    this.logger = logger;
  }
  /**
   * Get all resources from the connected MCP server.
   * @returns A list of resources.
   */
  async list() {
    try {
      const response = await this.client.listResources();
      if (response && response.resources && Array.isArray(response.resources)) {
        return response.resources;
      } else {
        this.logger.warn(`Resources response from server ${this.client.name} did not have expected structure.`, {
          response
        });
        return [];
      }
    } catch (e) {
      if (e.code === types_js.ErrorCode.MethodNotFound) {
        return [];
      }
      this.logger.error(`Error getting resources from server ${this.client.name}`, {
        error: e instanceof Error ? e.message : String(e)
      });
      throw new Error(
        `Failed to fetch resources from server ${this.client.name}: ${e instanceof Error ? e.stack || e.message : String(e)}`
      );
    }
  }
  /**
   * Get all resource templates from the connected MCP server.
   * @returns A list of resource templates.
   */
  async templates() {
    try {
      const response = await this.client.listResourceTemplates();
      if (response && response.resourceTemplates && Array.isArray(response.resourceTemplates)) {
        return response.resourceTemplates;
      } else {
        this.logger.warn(
          `Resource templates response from server ${this.client.name} did not have expected structure.`,
          { response }
        );
        return [];
      }
    } catch (e) {
      if (e.code === types_js.ErrorCode.MethodNotFound) {
        return [];
      }
      this.logger.error(`Error getting resource templates from server ${this.client.name}`, {
        error: e instanceof Error ? e.message : String(e)
      });
      throw new Error(
        `Failed to fetch resource templates from server ${this.client.name}: ${e instanceof Error ? e.stack || e.message : String(e)}`
      );
    }
  }
  /**
   * Read a specific resource.
   * @param uri The URI of the resource to read.
   * @returns The resource content.
   */
  async read(uri) {
    return this.client.readResource(uri);
  }
  /**
   * Subscribe to a specific resource.
   * @param uri The URI of the resource to subscribe to.
   */
  async subscribe(uri) {
    return this.client.subscribeResource(uri);
  }
  /**
   * Unsubscribe from a specific resource.
   * @param uri The URI of the resource to unsubscribe from.
   */
  async unsubscribe(uri) {
    return this.client.unsubscribeResource(uri);
  }
  /**
   * Set a notification handler for when a specific resource is updated.
   * @param handler The callback function to handle the notification.
   */
  async onUpdated(handler) {
    this.client.setResourceUpdatedNotificationHandler(handler);
  }
  /**
   * Set a notification handler for when the list of available resources changes.
   * @param handler The callback function to handle the notification.
   */
  async onListChanged(handler) {
    this.client.setResourceListChangedNotificationHandler(handler);
  }
};

// src/client/client.ts
function convertLogLevelToLoggerMethod(level) {
  switch (level) {
    case "debug":
      return "debug";
    case "info":
    case "notice":
      return "info";
    case "warning":
      return "warn";
    case "error":
    case "critical":
    case "alert":
    case "emergency":
      return "error";
    default:
      return "info";
  }
}
var InternalMastraMCPClient = class extends base.MastraBase {
  name;
  client;
  timeout;
  logHandler;
  enableServerLogs;
  serverConfig;
  transport;
  currentOperationContext = null;
  resources;
  prompts;
  constructor({
    name,
    version = "1.0.0",
    server,
    capabilities = {},
    timeout = protocol_js.DEFAULT_REQUEST_TIMEOUT_MSEC
  }) {
    super({ name: "MastraMCPClient" });
    this.name = name;
    this.timeout = timeout;
    this.logHandler = server.logger;
    this.enableServerLogs = server.enableServerLogs ?? true;
    this.serverConfig = server;
    this.client = new index_js$1.Client(
      {
        name,
        version
      },
      {
        capabilities
      }
    );
    this.setupLogging();
    this.resources = new ResourceClientActions({ client: this, logger: this.logger });
    this.prompts = new PromptClientActions({ client: this, logger: this.logger });
  }
  /**
   * Log a message at the specified level
   * @param level Log level
   * @param message Log message
   * @param details Optional additional details
   */
  log(level, message, details) {
    const loggerMethod = convertLogLevelToLoggerMethod(level);
    const msg = `[${this.name}] ${message}`;
    this.logger[loggerMethod](msg, details);
    if (this.logHandler) {
      this.logHandler({
        level,
        message: msg,
        timestamp: /* @__PURE__ */ new Date(),
        serverName: this.name,
        details,
        runtimeContext: this.currentOperationContext
      });
    }
  }
  setupLogging() {
    if (this.enableServerLogs) {
      this.client.setNotificationHandler(
        zod.z.object({
          method: zod.z.literal("notifications/message"),
          params: zod.z.object({
            level: zod.z.string()
          }).passthrough()
        }),
        (notification) => {
          const { level, ...params } = notification.params;
          this.log(level, "[MCP SERVER LOG]", params);
        }
      );
    }
  }
  async connectStdio(command) {
    this.log("debug", `Using Stdio transport for command: ${command}`);
    try {
      this.transport = new stdio_js$1.StdioClientTransport({
        command,
        args: this.serverConfig.args,
        env: { ...stdio_js$1.getDefaultEnvironment(), ...this.serverConfig.env || {} }
      });
      await this.client.connect(this.transport, { timeout: this.serverConfig.timeout ?? this.timeout });
      this.log("debug", `Successfully connected to MCP server via Stdio`);
    } catch (e) {
      this.log("error", e instanceof Error ? e.stack || e.message : JSON.stringify(e));
      throw e;
    }
  }
  async connectHttp(url) {
    const { requestInit, eventSourceInit } = this.serverConfig;
    this.log("debug", `Attempting to connect to URL: ${url}`);
    let shouldTrySSE = url.pathname.endsWith(`/sse`);
    if (!shouldTrySSE) {
      try {
        this.log("debug", "Trying Streamable HTTP transport...");
        const streamableTransport = new streamableHttp_js$1.StreamableHTTPClientTransport(url, {
          requestInit,
          reconnectionOptions: this.serverConfig.reconnectionOptions
        });
        await this.client.connect(streamableTransport, {
          timeout: (
            // this is hardcoded to 3s because the long default timeout would be extremely slow for sse backwards compat (60s)
            3e3
          )
        });
        this.transport = streamableTransport;
        this.log("debug", "Successfully connected using Streamable HTTP transport.");
      } catch (error) {
        this.log("debug", `Streamable HTTP transport failed: ${error}`);
        shouldTrySSE = true;
      }
    }
    if (shouldTrySSE) {
      this.log("debug", "Falling back to deprecated HTTP+SSE transport...");
      try {
        const sseTransport = new sse_js$1.SSEClientTransport(url, { requestInit, eventSourceInit });
        await this.client.connect(sseTransport, { timeout: this.serverConfig.timeout ?? this.timeout });
        this.transport = sseTransport;
        this.log("debug", "Successfully connected using deprecated HTTP+SSE transport.");
      } catch (sseError) {
        this.log(
          "error",
          `Failed to connect with SSE transport after failing to connect to Streamable HTTP transport first. SSE error: ${sseError}`
        );
        throw new Error("Could not connect to server with any available HTTP transport");
      }
    }
  }
  isConnected = null;
  async connect() {
    if (await this.isConnected) {
      return true;
    }
    this.isConnected = new Promise(async (resolve, reject) => {
      try {
        const { command, url } = this.serverConfig;
        if (command) {
          await this.connectStdio(command);
        } else if (url) {
          await this.connectHttp(url);
        } else {
          throw new Error("Server configuration must include either a command or a url.");
        }
        resolve(true);
        const originalOnClose = this.client.onclose;
        this.client.onclose = () => {
          this.log("debug", `MCP server connection closed`);
          this.isConnected = null;
          if (typeof originalOnClose === "function") {
            originalOnClose();
          }
        };
      } catch (e) {
        this.isConnected = null;
        reject(e);
      }
    });
    exitHook.asyncExitHook(
      async () => {
        this.log("debug", `Disconnecting MCP server during exit`);
        await this.disconnect();
      },
      { wait: 5e3 }
    );
    process.on("SIGTERM", () => exitHook.gracefulExit());
    this.log("debug", `Successfully connected to MCP server`);
    return this.isConnected;
  }
  /**
   * Get the current session ID if using the Streamable HTTP transport.
   * Returns undefined if not connected or not using Streamable HTTP.
   */
  get sessionId() {
    if (this.transport instanceof streamableHttp_js$1.StreamableHTTPClientTransport) {
      return this.transport.sessionId;
    }
    return void 0;
  }
  async disconnect() {
    if (!this.transport) {
      this.log("debug", "Disconnect called but no transport was connected.");
      return;
    }
    this.log("debug", `Disconnecting from MCP server`);
    try {
      await this.transport.close();
      this.log("debug", "Successfully disconnected from MCP server");
    } catch (e) {
      this.log("error", "Error during MCP server disconnect", {
        error: e instanceof Error ? e.stack : JSON.stringify(e, null, 2)
      });
      throw e;
    } finally {
      this.transport = void 0;
      this.isConnected = Promise.resolve(false);
    }
  }
  async listResources() {
    this.log("debug", `Requesting resources from MCP server`);
    return await this.client.request({ method: "resources/list" }, types_js.ListResourcesResultSchema, {
      timeout: this.timeout
    });
  }
  async readResource(uri) {
    this.log("debug", `Reading resource from MCP server: ${uri}`);
    return await this.client.request({ method: "resources/read", params: { uri } }, types_js.ReadResourceResultSchema, {
      timeout: this.timeout
    });
  }
  async subscribeResource(uri) {
    this.log("debug", `Subscribing to resource on MCP server: ${uri}`);
    return await this.client.request({ method: "resources/subscribe", params: { uri } }, zod.z.object({}), {
      timeout: this.timeout
    });
  }
  async unsubscribeResource(uri) {
    this.log("debug", `Unsubscribing from resource on MCP server: ${uri}`);
    return await this.client.request({ method: "resources/unsubscribe", params: { uri } }, zod.z.object({}), {
      timeout: this.timeout
    });
  }
  async listResourceTemplates() {
    this.log("debug", `Requesting resource templates from MCP server`);
    return await this.client.request({ method: "resources/templates/list" }, types_js.ListResourceTemplatesResultSchema, {
      timeout: this.timeout
    });
  }
  /**
   * Fetch the list of available prompts from the MCP server.
   */
  async listPrompts() {
    this.log("debug", `Requesting prompts from MCP server`);
    return await this.client.request({ method: "prompts/list" }, types_js.ListPromptsResultSchema, {
      timeout: this.timeout
    });
  }
  /**
   * Get a prompt and its dynamic messages from the server.
   * @param name The prompt name
   * @param args Arguments for the prompt
   * @param version (optional) The prompt version to retrieve
   */
  async getPrompt({
    name,
    args,
    version
  }) {
    this.log("debug", `Requesting prompt from MCP server: ${name}`);
    return await this.client.request(
      { method: "prompts/get", params: { name, arguments: args, version } },
      types_js.GetPromptResultSchema,
      { timeout: this.timeout }
    );
  }
  /**
   * Register a handler to be called when the prompt list changes on the server.
   * Use this to refresh cached prompt lists in the client/UI if needed.
   */
  setPromptListChangedNotificationHandler(handler) {
    this.log("debug", "Setting prompt list changed notification handler");
    this.client.setNotificationHandler(types_js.PromptListChangedNotificationSchema, () => {
      handler();
    });
  }
  setResourceUpdatedNotificationHandler(handler) {
    this.log("debug", "Setting resource updated notification handler");
    this.client.setNotificationHandler(types_js.ResourceUpdatedNotificationSchema, (notification) => {
      handler(notification.params);
    });
  }
  setResourceListChangedNotificationHandler(handler) {
    this.log("debug", "Setting resource list changed notification handler");
    this.client.setNotificationHandler(types_js.ResourceListChangedNotificationSchema, () => {
      handler();
    });
  }
  convertInputSchema(inputSchema) {
    if (utils.isZodType(inputSchema)) {
      return inputSchema;
    }
    try {
      return zodFromJsonSchema.convertJsonSchemaToZod(inputSchema);
    } catch (error) {
      let errorDetails;
      if (error instanceof Error) {
        errorDetails = error.stack;
      } else {
        try {
          errorDetails = JSON.stringify(error);
        } catch {
          errorDetails = String(error);
        }
      }
      this.log("error", "Failed to convert JSON schema to Zod schema using zodFromJsonSchema", {
        error: errorDetails,
        originalJsonSchema: inputSchema
      });
      throw new Error(errorDetails);
    }
  }
  async tools() {
    this.log("debug", `Requesting tools from MCP server`);
    const { tools: tools$1 } = await this.client.listTools({ timeout: this.timeout });
    const toolsRes = {};
    tools$1.forEach((tool) => {
      this.log("debug", `Processing tool: ${tool.name}`);
      try {
        const mastraTool = tools.createTool({
          id: `${this.name}_${tool.name}`,
          description: tool.description || "",
          inputSchema: this.convertInputSchema(tool.inputSchema),
          execute: async ({ context, runtimeContext }) => {
            const previousContext = this.currentOperationContext;
            this.currentOperationContext = runtimeContext || null;
            try {
              this.log("debug", `Executing tool: ${tool.name}`, { toolArgs: context });
              const res = await this.client.callTool(
                {
                  name: tool.name,
                  arguments: context
                },
                types_js.CallToolResultSchema,
                {
                  timeout: this.timeout
                }
              );
              this.log("debug", `Tool executed successfully: ${tool.name}`);
              return res;
            } catch (e) {
              this.log("error", `Error calling tool: ${tool.name}`, {
                error: e instanceof Error ? e.stack : JSON.stringify(e, null, 2),
                toolArgs: context
              });
              throw e;
            } finally {
              this.currentOperationContext = previousContext;
            }
          }
        });
        if (tool.name) {
          toolsRes[tool.name] = mastraTool;
        }
      } catch (toolCreationError) {
        this.log("error", `Failed to create Mastra tool wrapper for MCP tool: ${tool.name}`, {
          error: toolCreationError instanceof Error ? toolCreationError.stack : String(toolCreationError),
          mcpToolDefinition: tool
        });
      }
    });
    return toolsRes;
  }
};
var MastraMCPClient = class extends InternalMastraMCPClient {
  constructor(args) {
    super(args);
    this.logger.warn(
      "[DEPRECATION] MastraMCPClient is deprecated and will be removed in a future release. Please use MCPClient instead."
    );
  }
};
var mcpClientInstances = /* @__PURE__ */ new Map();
var MCPClient = class extends base.MastraBase {
  serverConfigs = {};
  id;
  defaultTimeout;
  mcpClientsById = /* @__PURE__ */ new Map();
  disconnectPromise = null;
  constructor(args) {
    super({ name: "MCPClient" });
    this.defaultTimeout = args.timeout ?? protocol_js.DEFAULT_REQUEST_TIMEOUT_MSEC;
    this.serverConfigs = args.servers;
    this.id = args.id ?? this.makeId();
    if (args.id) {
      this.id = args.id;
      const cached = mcpClientInstances.get(this.id);
      if (cached && !equal__default.default(cached.serverConfigs, args.servers)) {
        const existingInstance2 = mcpClientInstances.get(this.id);
        if (existingInstance2) {
          void existingInstance2.disconnect();
          mcpClientInstances.delete(this.id);
        }
      }
    } else {
      this.id = this.makeId();
    }
    const existingInstance = mcpClientInstances.get(this.id);
    if (existingInstance) {
      if (!args.id) {
        throw new Error(`MCPClient was initialized multiple times with the same configuration options.

This error is intended to prevent memory leaks.

To fix this you have three different options:
1. If you need multiple MCPClient class instances with identical server configurations, set an id when configuring: new MCPClient({ id: "my-unique-id" })
2. Call "await client.disconnect()" after you're done using the client and before you recreate another instance with the same options. If the identical MCPClient instance is already closed at the time of re-creating it, you will not see this error.
3. If you only need one instance of MCPClient in your app, refactor your code so it's only created one time (ex. move it out of a loop into a higher scope code block)
`);
      }
      return existingInstance;
    }
    mcpClientInstances.set(this.id, this);
    this.addToInstanceCache();
    return this;
  }
  get resources() {
    this.addToInstanceCache();
    return {
      list: async () => {
        const allResources = {};
        for (const serverName of Object.keys(this.serverConfigs)) {
          try {
            const internalClient = await this.getConnectedClientForServer(serverName);
            allResources[serverName] = await internalClient.resources.list();
          } catch (error) {
            this.logger.error(`Failed to list resources from server ${serverName}`, { error });
          }
        }
        return allResources;
      },
      templates: async () => {
        const allTemplates = {};
        for (const serverName of Object.keys(this.serverConfigs)) {
          try {
            const internalClient = await this.getConnectedClientForServer(serverName);
            allTemplates[serverName] = await internalClient.resources.templates();
          } catch (error) {
            this.logger.error(`Failed to list resource templates from server ${serverName}`, { error });
          }
        }
        return allTemplates;
      },
      read: async (serverName, uri) => {
        const internalClient = await this.getConnectedClientForServer(serverName);
        return internalClient.resources.read(uri);
      },
      subscribe: async (serverName, uri) => {
        const internalClient = await this.getConnectedClientForServer(serverName);
        return internalClient.resources.subscribe(uri);
      },
      unsubscribe: async (serverName, uri) => {
        const internalClient = await this.getConnectedClientForServer(serverName);
        return internalClient.resources.unsubscribe(uri);
      },
      onUpdated: async (serverName, handler) => {
        const internalClient = await this.getConnectedClientForServer(serverName);
        return internalClient.resources.onUpdated(handler);
      },
      onListChanged: async (serverName, handler) => {
        const internalClient = await this.getConnectedClientForServer(serverName);
        return internalClient.resources.onListChanged(handler);
      }
    };
  }
  get prompts() {
    this.addToInstanceCache();
    return {
      list: async () => {
        const allPrompts = {};
        for (const serverName of Object.keys(this.serverConfigs)) {
          try {
            const internalClient = await this.getConnectedClientForServer(serverName);
            allPrompts[serverName] = await internalClient.prompts.list();
          } catch (error) {
            this.logger.error(`Failed to list prompts from server ${serverName}`, { error });
          }
        }
        return allPrompts;
      },
      get: async ({ serverName, name, args, version }) => {
        const internalClient = await this.getConnectedClientForServer(serverName);
        return internalClient.prompts.get({ name, args, version });
      },
      onListChanged: async (serverName, handler) => {
        const internalClient = await this.getConnectedClientForServer(serverName);
        return internalClient.prompts.onListChanged(handler);
      }
    };
  }
  addToInstanceCache() {
    if (!mcpClientInstances.has(this.id)) {
      mcpClientInstances.set(this.id, this);
    }
  }
  makeId() {
    const text = JSON.stringify(this.serverConfigs).normalize("NFKC");
    const idNamespace = uuid.v5(`MCPClient`, uuid.v5.DNS);
    return uuid.v5(text, idNamespace);
  }
  async disconnect() {
    if (this.disconnectPromise) {
      return this.disconnectPromise;
    }
    this.disconnectPromise = (async () => {
      try {
        mcpClientInstances.delete(this.id);
        await Promise.all(Array.from(this.mcpClientsById.values()).map((client) => client.disconnect()));
        this.mcpClientsById.clear();
      } finally {
        this.disconnectPromise = null;
      }
    })();
    return this.disconnectPromise;
  }
  async getTools() {
    this.addToInstanceCache();
    const connectedTools = {};
    await this.eachClientTools(async ({ serverName, tools }) => {
      for (const [toolName, toolConfig] of Object.entries(tools)) {
        connectedTools[`${serverName}_${toolName}`] = toolConfig;
      }
    });
    return connectedTools;
  }
  async getToolsets() {
    this.addToInstanceCache();
    const connectedToolsets = {};
    await this.eachClientTools(async ({ serverName, tools }) => {
      if (tools) {
        connectedToolsets[serverName] = tools;
      }
    });
    return connectedToolsets;
  }
  /**
   * @deprecated all resource actions have been moved to the this.resources object. Use this.resources.list() instead.
   */
  async getResources() {
    return this.resources.list();
  }
  /**
   * Get the current session IDs for all connected MCP clients using the Streamable HTTP transport.
   * Returns an object mapping server names to their session IDs.
   */
  get sessionIds() {
    const sessionIds = {};
    for (const [serverName, client] of this.mcpClientsById.entries()) {
      if (client.sessionId) {
        sessionIds[serverName] = client.sessionId;
      }
    }
    return sessionIds;
  }
  async getConnectedClient(name, config) {
    if (this.disconnectPromise) {
      await this.disconnectPromise;
    }
    const exists = this.mcpClientsById.has(name);
    const existingClient = this.mcpClientsById.get(name);
    this.logger.debug(`getConnectedClient ${name} exists: ${exists}`);
    if (exists) {
      if (!existingClient) {
        throw new Error(`Client ${name} exists but is undefined`);
      }
      await existingClient.connect();
      return existingClient;
    }
    this.logger.debug(`Connecting to ${name} MCP server`);
    const mcpClient = new InternalMastraMCPClient({
      name,
      server: config,
      timeout: config.timeout ?? this.defaultTimeout
    });
    mcpClient.__setLogger(this.logger);
    this.mcpClientsById.set(name, mcpClient);
    try {
      await mcpClient.connect();
    } catch (e) {
      this.mcpClientsById.delete(name);
      this.logger.error(`MCPClient errored connecting to MCP server ${name}`, {
        error: e instanceof Error ? e.message : String(e)
      });
      throw new Error(
        `Failed to connect to MCP server ${name}: ${e instanceof Error ? e.stack || e.message : String(e)}`
      );
    }
    this.logger.debug(`Connected to ${name} MCP server`);
    return mcpClient;
  }
  async getConnectedClientForServer(serverName) {
    const serverConfig = this.serverConfigs[serverName];
    if (!serverConfig) {
      throw new Error(`Server configuration not found for name: ${serverName}`);
    }
    return this.getConnectedClient(serverName, serverConfig);
  }
  async eachClientTools(cb) {
    await Promise.all(
      Object.entries(this.serverConfigs).map(async ([serverName, serverConfig]) => {
        const client = await this.getConnectedClient(serverName, serverConfig);
        const tools = await client.tools();
        await cb({ serverName, tools, client });
      })
    );
  }
};
var MCPConfiguration = class extends MCPClient {
  constructor(args) {
    super(args);
    this.logger.warn(
      `MCPConfiguration has been renamed to MCPClient and MCPConfiguration is deprecated. The API is identical but the MCPConfiguration export will be removed in the future. Update your imports now to prevent future errors.`
    );
  }
};
var MAXIMUM_MESSAGE_SIZE = 4 * 1024 * 1024;
var SSETransport = class {
  messageUrl;
  stream;
  _sessionId;
  onclose;
  onerror;
  onmessage;
  /**
   * Creates a new SSETransport, which will direct the MPC client to POST messages to messageUrl
   */
  constructor(messageUrl, stream) {
    this.messageUrl = messageUrl;
    this.stream = stream;
    this._sessionId = crypto.randomUUID();
    this.stream.onAbort(() => {
      void this.close();
    });
  }
  get sessionId() {
    return this._sessionId;
  }
  // start() is automatically called after MCP Server connects to the transport
  async start() {
    if (this.stream == null) {
      throw new Error("Stream not initialized");
    }
    if (this.stream.closed) {
      throw new Error("SSE transport already closed!");
    }
    await this.stream.writeSSE({
      event: "endpoint",
      data: `${this.messageUrl}?sessionId=${this.sessionId}`
    });
  }
  async handlePostMessage(context) {
    if (this.stream?.closed == null) {
      return context.text("SSE connection not established", 500);
    }
    try {
      const contentType = context.req.header("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Unsupported content-type: ${contentType}`);
      }
      const contentLength = Number.parseInt(context.req.header("content-length") || "0", 10);
      if (contentLength > MAXIMUM_MESSAGE_SIZE) {
        throw new Error(`Request body too large: ${contentLength} bytes`);
      }
      const body = await context.req.json();
      await this.handleMessage(body);
      return context.text("Accepted", 202);
    } catch (error) {
      this.onerror?.(error);
      return context.text("Error", 400);
    }
  }
  /**
   * Handle a client message, regardless of how it arrived. This can be used to inform the server of messages that arrive via a means different than HTTP POST.
   */
  async handleMessage(message) {
    let parsedMessage;
    try {
      parsedMessage = types_js.JSONRPCMessageSchema.parse(message);
    } catch (error) {
      this.onerror?.(error);
      throw error;
    }
    this.onmessage?.(parsedMessage);
  }
  async close() {
    if (this.stream?.closed) {
      this.stream.abort();
    }
  }
  async send(message) {
    if (this.stream?.closed) {
      throw new Error("Not connected");
    }
    await this.stream.writeSSE({
      event: "message",
      data: JSON.stringify(message)
    });
  }
};

// src/server/promptActions.ts
var ServerPromptActions = class {
  getLogger;
  getSdkServer;
  clearDefinedPrompts;
  constructor(dependencies) {
    this.getLogger = dependencies.getLogger;
    this.getSdkServer = dependencies.getSdkServer;
    this.clearDefinedPrompts = dependencies.clearDefinedPrompts;
  }
  /**
   * Notifies the server that the overall list of available prompts has changed.
   * This will clear the internal cache of defined prompts and send a list_changed notification to clients.
   */
  async notifyListChanged() {
    this.getLogger().info("Prompt list change externally notified. Clearing definedPrompts and sending notification.");
    this.clearDefinedPrompts();
    try {
      await this.getSdkServer().sendPromptListChanged();
    } catch (error) {
      this.getLogger().error("Failed to send prompt list changed notification:", {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
};

// src/server/resourceActions.ts
var ServerResourceActions = class {
  getSubscriptions;
  getLogger;
  getSdkServer;
  clearDefinedResources;
  clearDefinedResourceTemplates;
  constructor(dependencies) {
    this.getSubscriptions = dependencies.getSubscriptions;
    this.getLogger = dependencies.getLogger;
    this.getSdkServer = dependencies.getSdkServer;
    this.clearDefinedResources = dependencies.clearDefinedResources;
    this.clearDefinedResourceTemplates = dependencies.clearDefinedResourceTemplates;
  }
  /**
   * Checks if any resources have been updated.
   * If the resource is subscribed to by clients, an update notification will be sent.
   */
  async notifyUpdated({ uri }) {
    if (this.getSubscriptions().has(uri)) {
      this.getLogger().info(`Sending notifications/resources/updated for externally notified resource: ${uri}`);
      try {
        await this.getSdkServer().sendResourceUpdated({ uri });
      } catch (error) {
        this.getLogger().error("Failed to send resource updated notification:", { error });
        throw error;
      }
    } else {
      this.getLogger().debug(`Resource ${uri} was updated, but no active subscriptions for it.`);
    }
  }
  /**
   * Notifies the server that the overall list of available resources has changed.
   * This will clear the internal cache of defined resources and send a list_changed notification to clients.
   */
  async notifyListChanged() {
    this.getLogger().info(
      "Resource list change externally notified. Clearing definedResources and sending notification."
    );
    this.clearDefinedResources();
    this.clearDefinedResourceTemplates();
    try {
      await this.getSdkServer().sendResourceListChanged();
    } catch (error) {
      this.getLogger().error("Failed to send resource list changed notification:", { error });
      throw error;
    }
  }
};

// src/server/server.ts
var MCPServer = class extends mcp.MCPServerBase {
  server;
  stdioTransport;
  sseTransport;
  sseHonoTransports;
  streamableHTTPTransports = /* @__PURE__ */ new Map();
  listToolsHandlerIsRegistered = false;
  callToolHandlerIsRegistered = false;
  listResourcesHandlerIsRegistered = false;
  readResourceHandlerIsRegistered = false;
  listResourceTemplatesHandlerIsRegistered = false;
  subscribeResourceHandlerIsRegistered = false;
  unsubscribeResourceHandlerIsRegistered = false;
  listPromptsHandlerIsRegistered = false;
  getPromptHandlerIsRegistered = false;
  definedResources;
  definedResourceTemplates;
  resourceOptions;
  definedPrompts;
  promptOptions;
  subscriptions = /* @__PURE__ */ new Set();
  resources;
  prompts;
  /**
   * Get the current stdio transport.
   */
  getStdioTransport() {
    return this.stdioTransport;
  }
  /**
   * Get the current SSE transport.
   */
  getSseTransport() {
    return this.sseTransport;
  }
  /**
   * Get the current SSE Hono transport.
   */
  getSseHonoTransport(sessionId) {
    return this.sseHonoTransports.get(sessionId);
  }
  /**
   * Get the current server instance.
   */
  getServer() {
    return this.server;
  }
  /**
   * Construct a new MCPServer instance.
   * @param opts - Configuration options for the server, including registry metadata.
   */
  constructor(opts) {
    super(opts);
    this.resourceOptions = opts.resources;
    this.promptOptions = opts.prompts;
    const capabilities = {
      tools: {},
      logging: { enabled: true }
    };
    if (opts.resources) {
      capabilities.resources = { subscribe: true, listChanged: true };
    }
    if (opts.prompts) {
      capabilities.prompts = { listChanged: true };
    }
    this.server = new index_js.Server({ name: this.name, version: this.version }, { capabilities });
    this.logger.info(
      `Initialized MCPServer '${this.name}' v${this.version} (ID: ${this.id}) with tools: ${Object.keys(this.convertedTools).join(", ")} and resources. Capabilities: ${JSON.stringify(capabilities)}`
    );
    this.sseHonoTransports = /* @__PURE__ */ new Map();
    this.registerListToolsHandler();
    this.registerCallToolHandler();
    if (opts.resources) {
      this.registerListResourcesHandler();
      this.registerReadResourceHandler({ getResourcesCallback: opts.resources.getResourceContent });
      this.registerSubscribeResourceHandler();
      this.registerUnsubscribeResourceHandler();
      if (opts.resources.resourceTemplates) {
        this.registerListResourceTemplatesHandler();
      }
    }
    if (opts.prompts) {
      this.registerListPromptsHandler();
      this.registerGetPromptHandler({
        getPromptMessagesCallback: opts.prompts.getPromptMessages
      });
    }
    this.resources = new ServerResourceActions({
      getSubscriptions: () => this.subscriptions,
      getLogger: () => this.logger,
      getSdkServer: () => this.server,
      clearDefinedResources: () => {
        this.definedResources = void 0;
      },
      clearDefinedResourceTemplates: () => {
        this.definedResourceTemplates = void 0;
      }
    });
    this.prompts = new ServerPromptActions({
      getLogger: () => this.logger,
      getSdkServer: () => this.server,
      clearDefinedPrompts: () => {
        this.definedPrompts = void 0;
      }
    });
  }
  convertAgentsToTools(agentsConfig, definedConvertedTools) {
    const agentTools = {};
    if (!agentsConfig) {
      return agentTools;
    }
    for (const agentKey in agentsConfig) {
      const agent = agentsConfig[agentKey];
      if (!agent || !("generate" in agent)) {
        this.logger.warn(`Agent instance for '${agentKey}' is invalid or missing a generate function. Skipping.`);
        continue;
      }
      const agentDescription = agent.getDescription();
      if (!agentDescription) {
        throw new Error(
          `Agent '${agent.name}' (key: '${agentKey}') must have a non-empty description to be used in an MCPServer.`
        );
      }
      const agentToolName = `ask_${agentKey}`;
      if (definedConvertedTools?.[agentToolName] || agentTools[agentToolName]) {
        this.logger.warn(
          `Tool with name '${agentToolName}' already exists. Agent '${agentKey}' will not be added as a duplicate tool.`
        );
        continue;
      }
      const agentToolDefinition = core.createTool({
        id: agentToolName,
        description: `Ask agent '${agent.name}' a question. Agent description: ${agentDescription}`,
        inputSchema: zod.z.object({
          message: zod.z.string().describe("The question or input for the agent.")
        }),
        execute: async ({ context, runtimeContext }) => {
          this.logger.debug(
            `Executing agent tool '${agentToolName}' for agent '${agent.name}' with message: "${context.message}"`
          );
          try {
            const response = await agent.generate(context.message, { runtimeContext });
            return response;
          } catch (error) {
            this.logger.error(`Error executing agent tool '${agentToolName}' for agent '${agent.name}':`, error);
            throw error;
          }
        }
      });
      const options = {
        name: agentToolName,
        logger: this.logger,
        mastra: this.mastra,
        runtimeContext: new runtimeContext.RuntimeContext(),
        description: agentToolDefinition.description
      };
      const coreTool = core.makeCoreTool(agentToolDefinition, options);
      agentTools[agentToolName] = {
        name: agentToolName,
        description: coreTool.description,
        parameters: coreTool.parameters,
        execute: coreTool.execute,
        toolType: "agent"
      };
      this.logger.info(`Registered agent '${agent.name}' (key: '${agentKey}') as tool: '${agentToolName}'`);
    }
    return agentTools;
  }
  convertWorkflowsToTools(workflowsConfig, definedConvertedTools) {
    const workflowTools = {};
    if (!workflowsConfig) {
      return workflowTools;
    }
    for (const workflowKey in workflowsConfig) {
      const workflow = workflowsConfig[workflowKey];
      if (!workflow || typeof workflow.createRun !== "function") {
        this.logger.warn(
          `Workflow instance for '${workflowKey}' is invalid or missing a createRun function. Skipping.`
        );
        continue;
      }
      const workflowDescription = workflow.description;
      if (!workflowDescription) {
        throw new Error(
          `Workflow '${workflow.id}' (key: '${workflowKey}') must have a non-empty description to be used in an MCPServer.`
        );
      }
      const workflowToolName = `run_${workflowKey}`;
      if (definedConvertedTools?.[workflowToolName] || workflowTools[workflowToolName]) {
        this.logger.warn(
          `Tool with name '${workflowToolName}' already exists. Workflow '${workflowKey}' will not be added as a duplicate tool.`
        );
        continue;
      }
      const workflowToolDefinition = core.createTool({
        id: workflowToolName,
        description: `Run workflow '${workflowKey}'. Workflow description: ${workflowDescription}`,
        inputSchema: workflow.inputSchema,
        execute: async ({ context, runtimeContext }) => {
          this.logger.debug(
            `Executing workflow tool '${workflowToolName}' for workflow '${workflow.id}' with input:`,
            context
          );
          try {
            const run = workflow.createRun({ runId: runtimeContext?.get("runId") });
            const response = await run.start({ inputData: context, runtimeContext });
            return response;
          } catch (error) {
            this.logger.error(
              `Error executing workflow tool '${workflowToolName}' for workflow '${workflow.id}':`,
              error
            );
            throw error;
          }
        }
      });
      const options = {
        name: workflowToolName,
        logger: this.logger,
        mastra: this.mastra,
        runtimeContext: new runtimeContext.RuntimeContext(),
        description: workflowToolDefinition.description
      };
      const coreTool = core.makeCoreTool(workflowToolDefinition, options);
      workflowTools[workflowToolName] = {
        name: workflowToolName,
        description: coreTool.description,
        parameters: coreTool.parameters,
        execute: coreTool.execute,
        toolType: "workflow"
      };
      this.logger.info(`Registered workflow '${workflow.id}' (key: '${workflowKey}') as tool: '${workflowToolName}'`);
    }
    return workflowTools;
  }
  /**
   * Convert and validate all provided tools, logging registration status.
   * Also converts agents and workflows into tools.
   * @param tools Tool definitions
   * @param agentsConfig Agent definitions to be converted to tools, expected from MCPServerConfig
   * @param workflowsConfig Workflow definitions to be converted to tools, expected from MCPServerConfig
   * @returns Converted tools registry
   */
  convertTools(tools, agentsConfig, workflowsConfig) {
    const definedConvertedTools = {};
    for (const toolName of Object.keys(tools)) {
      const toolInstance = tools[toolName];
      if (!toolInstance) {
        this.logger.warn(`Tool instance for '${toolName}' is undefined. Skipping.`);
        continue;
      }
      if (typeof toolInstance.execute !== "function") {
        this.logger.warn(`Tool '${toolName}' does not have a valid execute function. Skipping.`);
        continue;
      }
      const options = {
        name: toolName,
        runtimeContext: new runtimeContext.RuntimeContext(),
        mastra: this.mastra,
        logger: this.logger,
        description: toolInstance?.description
      };
      const coreTool = core.makeCoreTool(toolInstance, options);
      definedConvertedTools[toolName] = {
        name: toolName,
        description: coreTool.description,
        parameters: coreTool.parameters,
        execute: coreTool.execute
      };
      this.logger.info(`Registered explicit tool: '${toolName}'`);
    }
    this.logger.info(`Total defined tools registered: ${Object.keys(definedConvertedTools).length}`);
    const agentDerivedTools = this.convertAgentsToTools(agentsConfig, definedConvertedTools);
    const workflowDerivedTools = this.convertWorkflowsToTools(workflowsConfig, definedConvertedTools);
    const allConvertedTools = { ...definedConvertedTools, ...agentDerivedTools, ...workflowDerivedTools };
    const finalToolCount = Object.keys(allConvertedTools).length;
    const definedCount = Object.keys(definedConvertedTools).length;
    const fromAgentsCount = Object.keys(agentDerivedTools).length;
    const fromWorkflowsCount = Object.keys(workflowDerivedTools).length;
    this.logger.info(
      `${finalToolCount} total tools registered (${definedCount} defined + ${fromAgentsCount} agents + ${fromWorkflowsCount} workflows)`
    );
    return allConvertedTools;
  }
  /**
   * Register the ListTools handler for listing all available tools.
   */
  registerListToolsHandler() {
    if (this.listToolsHandlerIsRegistered) {
      return;
    }
    this.listToolsHandlerIsRegistered = true;
    this.server.setRequestHandler(types_js.ListToolsRequestSchema, async () => {
      this.logger.debug("Handling ListTools request");
      return {
        tools: Object.values(this.convertedTools).map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.parameters.jsonSchema
        }))
      };
    });
  }
  /**
   * Register the CallTool handler for executing a tool by name.
   */
  registerCallToolHandler() {
    if (this.callToolHandlerIsRegistered) {
      return;
    }
    this.callToolHandlerIsRegistered = true;
    this.server.setRequestHandler(types_js.CallToolRequestSchema, async (request) => {
      const startTime = Date.now();
      try {
        const tool = this.convertedTools[request.params.name];
        if (!tool) {
          this.logger.warn(`CallTool: Unknown tool '${request.params.name}' requested.`);
          return {
            content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
            isError: true
          };
        }
        this.logger.debug(`CallTool: Invoking '${request.params.name}' with arguments:`, request.params.arguments);
        const validation = tool.parameters.validate?.(request.params.arguments ?? {});
        if (validation && !validation.success) {
          this.logger.warn(`CallTool: Invalid tool arguments for '${request.params.name}'`, {
            errors: validation.error
          });
          return {
            content: [{ type: "text", text: `Invalid tool arguments: ${JSON.stringify(validation.error)}` }],
            isError: true
          };
        }
        if (!tool.execute) {
          this.logger.warn(`CallTool: Tool '${request.params.name}' does not have an execute function.`);
          return {
            content: [{ type: "text", text: `Tool '${request.params.name}' does not have an execute function.` }],
            isError: true
          };
        }
        const result = await tool.execute(validation?.value, { messages: [], toolCallId: "" });
        const duration = Date.now() - startTime;
        this.logger.info(`Tool '${request.params.name}' executed successfully in ${duration}ms.`);
        return {
          content: [
            {
              type: "text",
              text: typeof result === "string" ? result : JSON.stringify(result)
            }
          ],
          isError: false
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        if (error instanceof zod.z.ZodError) {
          this.logger.warn("Invalid tool arguments", {
            tool: request.params.name,
            errors: error.errors,
            duration: `${duration}ms`
          });
          return {
            content: [
              {
                type: "text",
                text: `Invalid arguments: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
              }
            ],
            isError: true
          };
        }
        this.logger.error(`Tool execution failed: ${request.params.name}`, { error });
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true
        };
      }
    });
  }
  /**
   * Register the ListResources handler for listing all available resources.
   */
  registerListResourcesHandler() {
    if (this.listResourcesHandlerIsRegistered) {
      return;
    }
    this.listResourcesHandlerIsRegistered = true;
    const capturedResourceOptions = this.resourceOptions;
    if (!capturedResourceOptions?.listResources) {
      this.logger.warn("ListResources capability not supported by server configuration.");
      return;
    }
    this.server.setRequestHandler(types_js.ListResourcesRequestSchema, async () => {
      this.logger.debug("Handling ListResources request");
      if (this.definedResources) {
        return { resources: this.definedResources };
      } else {
        try {
          const resources = await capturedResourceOptions.listResources();
          this.definedResources = resources;
          this.logger.debug(`Fetched and cached ${this.definedResources.length} resources.`);
          return { resources: this.definedResources };
        } catch (error) {
          this.logger.error("Error fetching resources via listResources():", { error });
          throw error;
        }
      }
    });
  }
  /**
   * Register the ReadResource handler for reading a resource by URI.
   */
  registerReadResourceHandler({
    getResourcesCallback
  }) {
    if (this.readResourceHandlerIsRegistered) {
      return;
    }
    this.readResourceHandlerIsRegistered = true;
    this.server.setRequestHandler(types_js.ReadResourceRequestSchema, async (request) => {
      const startTime = Date.now();
      const uri = request.params.uri;
      this.logger.debug(`Handling ReadResource request for URI: ${uri}`);
      if (!this.definedResources) {
        const resources = await this.resourceOptions?.listResources?.();
        if (!resources) throw new Error("Failed to load resources");
        this.definedResources = resources;
      }
      const resource = this.definedResources?.find((r) => r.uri === uri);
      if (!resource) {
        this.logger.warn(`ReadResource: Unknown resource URI '${uri}' requested.`);
        throw new Error(`Resource not found: ${uri}`);
      }
      try {
        const resourcesOrResourceContent = await getResourcesCallback({ uri });
        const resourcesContent = Array.isArray(resourcesOrResourceContent) ? resourcesOrResourceContent : [resourcesOrResourceContent];
        const contents = resourcesContent.map((resourceContent) => {
          const contentItem = {
            uri: resource.uri,
            mimeType: resource.mimeType
          };
          if ("text" in resourceContent) {
            contentItem.text = resourceContent.text;
          }
          if ("blob" in resourceContent) {
            contentItem.blob = resourceContent.blob;
          }
          return contentItem;
        });
        const duration = Date.now() - startTime;
        this.logger.info(`Resource '${uri}' read successfully in ${duration}ms.`);
        return {
          contents
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        this.logger.error(`Failed to get content for resource URI '${uri}' in ${duration}ms`, { error });
        throw error;
      }
    });
  }
  /**
   * Register the ListResourceTemplates handler.
   */
  registerListResourceTemplatesHandler() {
    if (this.listResourceTemplatesHandlerIsRegistered) {
      return;
    }
    if (!this.resourceOptions || typeof this.resourceOptions.resourceTemplates !== "function") {
      this.logger.warn(
        "ListResourceTemplates handler called, but resourceTemplates function is not available on resourceOptions or not a function."
      );
      this.server.setRequestHandler(types_js.ListResourceTemplatesRequestSchema, async () => {
        this.logger.debug("Handling ListResourceTemplates request (no templates configured or resourceOptions issue)");
        return { resourceTemplates: [] };
      });
      this.listResourceTemplatesHandlerIsRegistered = true;
      return;
    }
    const resourceTemplatesFn = this.resourceOptions.resourceTemplates;
    this.listResourceTemplatesHandlerIsRegistered = true;
    this.server.setRequestHandler(types_js.ListResourceTemplatesRequestSchema, async () => {
      this.logger.debug("Handling ListResourceTemplates request");
      if (this.definedResourceTemplates) {
        return { resourceTemplates: this.definedResourceTemplates };
      } else {
        try {
          const templates = await resourceTemplatesFn();
          this.definedResourceTemplates = templates;
          this.logger.debug(`Fetched and cached ${this.definedResourceTemplates.length} resource templates.`);
          return { resourceTemplates: this.definedResourceTemplates };
        } catch (error) {
          this.logger.error("Error fetching resource templates via resourceTemplates():", { error });
          throw error;
        }
      }
    });
  }
  /**
   * Register the SubscribeResource handler.
   */
  registerSubscribeResourceHandler() {
    if (this.subscribeResourceHandlerIsRegistered) {
      return;
    }
    if (!types_js.SubscribeRequestSchema) {
      this.logger.warn("SubscribeRequestSchema not available, cannot register SubscribeResource handler.");
      return;
    }
    this.subscribeResourceHandlerIsRegistered = true;
    this.server.setRequestHandler(types_js.SubscribeRequestSchema, async (request) => {
      const uri = request.params.uri;
      this.logger.info(`Received resources/subscribe request for URI: ${uri}`);
      this.subscriptions.add(uri);
      return {};
    });
  }
  /**
   * Register the UnsubscribeResource handler.
   */
  registerUnsubscribeResourceHandler() {
    if (this.unsubscribeResourceHandlerIsRegistered) {
      return;
    }
    this.unsubscribeResourceHandlerIsRegistered = true;
    this.server.setRequestHandler(types_js.UnsubscribeRequestSchema, async (request) => {
      const uri = request.params.uri;
      this.logger.info(`Received resources/unsubscribe request for URI: ${uri}`);
      this.subscriptions.delete(uri);
      return {};
    });
  }
  /**
   * Register the ListPrompts handler.
   */
  registerListPromptsHandler() {
    if (this.listPromptsHandlerIsRegistered) {
      return;
    }
    this.listPromptsHandlerIsRegistered = true;
    const capturedPromptOptions = this.promptOptions;
    if (!capturedPromptOptions?.listPrompts) {
      this.logger.warn("ListPrompts capability not supported by server configuration.");
      return;
    }
    this.server.setRequestHandler(types_js.ListPromptsRequestSchema, async () => {
      this.logger.debug("Handling ListPrompts request");
      if (this.definedPrompts) {
        return {
          prompts: this.definedPrompts?.map((p) => ({ ...p, version: p.version ?? void 0 }))
        };
      } else {
        try {
          const prompts = await capturedPromptOptions.listPrompts();
          for (const prompt of prompts) {
            types_js.PromptSchema.parse(prompt);
          }
          this.definedPrompts = prompts;
          this.logger.debug(`Fetched and cached ${this.definedPrompts.length} prompts.`);
          return {
            prompts: this.definedPrompts?.map((p) => ({ ...p, version: p.version ?? void 0 }))
          };
        } catch (error) {
          this.logger.error("Error fetching prompts via listPrompts():", {
            error: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      }
    });
  }
  /**
   * Register the GetPrompt handler.
   */
  registerGetPromptHandler({
    getPromptMessagesCallback
  }) {
    if (this.getPromptHandlerIsRegistered) return;
    this.getPromptHandlerIsRegistered = true;
    this.server.setRequestHandler(
      types_js.GetPromptRequestSchema,
      async (request) => {
        const startTime = Date.now();
        const { name, version, arguments: args } = request.params;
        if (!this.definedPrompts) {
          const prompts = await this.promptOptions?.listPrompts?.();
          if (!prompts) throw new Error("Failed to load prompts");
          this.definedPrompts = prompts;
        }
        let prompt;
        if (version) {
          prompt = this.definedPrompts?.find((p) => p.name === name && p.version === version);
        } else {
          prompt = this.definedPrompts?.find((p) => p.name === name);
        }
        if (!prompt) throw new Error(`Prompt "${name}"${version ? ` (version ${version})` : ""} not found`);
        if (prompt.arguments) {
          for (const arg of prompt.arguments) {
            if (arg.required && (args?.[arg.name] === void 0 || args?.[arg.name] === null)) {
              throw new Error(`Missing required argument: ${arg.name}`);
            }
          }
        }
        try {
          let messages = [];
          if (getPromptMessagesCallback) {
            messages = await getPromptMessagesCallback({ name, version, args });
          }
          const duration = Date.now() - startTime;
          this.logger.info(
            `Prompt '${name}'${version ? ` (version ${version})` : ""} retrieved successfully in ${duration}ms.`
          );
          return { prompt, messages };
        } catch (error) {
          const duration = Date.now() - startTime;
          this.logger.error(`Failed to get content for prompt '${name}' in ${duration}ms`, { error });
          throw error;
        }
      }
    );
  }
  /**
   * Start the MCP server using stdio transport (for Windsurf integration).
   */
  async startStdio() {
    this.stdioTransport = new stdio_js.StdioServerTransport();
    await this.server.connect(this.stdioTransport);
    this.logger.info("Started MCP Server (stdio)");
  }
  /**
   * Handles MCP-over-SSE protocol for user-provided HTTP servers.
   * Call this from your HTTP server for both the SSE and message endpoints.
   *
   * @param url Parsed URL of the incoming request
   * @param ssePath Path for establishing the SSE connection (e.g. '/sse')
   * @param messagePath Path for POSTing client messages (e.g. '/message')
   * @param req Incoming HTTP request
   * @param res HTTP response (must support .write/.end)
   */
  async startSSE({ url, ssePath, messagePath, req, res }) {
    if (url.pathname === ssePath) {
      await this.connectSSE({
        messagePath,
        res
      });
    } else if (url.pathname === messagePath) {
      this.logger.debug("Received message");
      if (!this.sseTransport) {
        res.writeHead(503);
        res.end("SSE connection not established");
        return;
      }
      await this.sseTransport.handlePostMessage(req, res);
    } else {
      this.logger.debug("Unknown path:", { path: url.pathname });
      res.writeHead(404);
      res.end();
    }
  }
  /**
   * Handles MCP-over-SSE protocol for user-provided HTTP servers.
   * Call this from your HTTP server for both the SSE and message endpoints.
   *
   * @param url Parsed URL of the incoming request
   * @param ssePath Path for establishing the SSE connection (e.g. '/sse')
   * @param messagePath Path for POSTing client messages (e.g. '/message')
   * @param context Incoming Hono context
   */
  async startHonoSSE({ url, ssePath, messagePath, context }) {
    if (url.pathname === ssePath) {
      return streaming.streamSSE(context, async (stream) => {
        await this.connectHonoSSE({
          messagePath,
          stream
        });
      });
    } else if (url.pathname === messagePath) {
      this.logger.debug("Received message");
      const sessionId = context.req.query("sessionId");
      this.logger.debug("Received message for sessionId", { sessionId });
      if (!sessionId) {
        return context.text("No sessionId provided", 400);
      }
      if (!this.sseHonoTransports.has(sessionId)) {
        return context.text(`No transport found for sessionId ${sessionId}`, 400);
      }
      const message = await this.sseHonoTransports.get(sessionId)?.handlePostMessage(context);
      if (!message) {
        return context.text("Transport not found", 400);
      }
      return message;
    } else {
      this.logger.debug("Unknown path:", { path: url.pathname });
      return context.text("Unknown path", 404);
    }
  }
  /**
   * Handles MCP-over-StreamableHTTP protocol for user-provided HTTP servers.
   * Call this from your HTTP server for the streamable HTTP endpoint.
   *
   * @param url Parsed URL of the incoming request
   * @param httpPath Path for establishing the streamable HTTP connection (e.g. '/mcp')
   * @param req Incoming HTTP request
   * @param res HTTP response (must support .write/.end)
   * @param options Optional options to pass to the transport (e.g. sessionIdGenerator)
   */
  async startHTTP({
    url,
    httpPath,
    req,
    res,
    options = { sessionIdGenerator: () => crypto$1.randomUUID() }
  }) {
    this.logger.debug(`startHTTP: Received ${req.method} request to ${url.pathname}`);
    if (url.pathname !== httpPath) {
      this.logger.debug(`startHTTP: Pathname ${url.pathname} does not match httpPath ${httpPath}. Returning 404.`);
      res.writeHead(404);
      res.end();
      return;
    }
    const sessionId = req.headers["mcp-session-id"];
    let transport;
    this.logger.debug(
      `startHTTP: Session ID from headers: ${sessionId}. Active transports: ${Array.from(this.streamableHTTPTransports.keys()).join(", ")}`
    );
    try {
      if (sessionId && this.streamableHTTPTransports.has(sessionId)) {
        transport = this.streamableHTTPTransports.get(sessionId);
        this.logger.debug(`startHTTP: Using existing Streamable HTTP transport for session ID: ${sessionId}`);
        if (req.method === "GET") {
          this.logger.debug(
            `startHTTP: Handling GET request for existing session ${sessionId}. Calling transport.handleRequest.`
          );
        }
        const body = req.method === "POST" ? await new Promise((resolve, reject) => {
          let data = "";
          req.on("data", (chunk) => data += chunk);
          req.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
          req.on("error", reject);
        }) : void 0;
        await transport.handleRequest(req, res, body);
      } else {
        this.logger.debug(`startHTTP: No existing Streamable HTTP session ID found. ${req.method}`);
        if (req.method === "POST") {
          const body = await new Promise((resolve, reject) => {
            let data = "";
            req.on("data", (chunk) => data += chunk);
            req.on("end", () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            });
            req.on("error", reject);
          });
          const { isInitializeRequest } = await import('@modelcontextprotocol/sdk/types.js');
          if (isInitializeRequest(body)) {
            this.logger.debug("startHTTP: Received Streamable HTTP initialize request, creating new transport.");
            transport = new streamableHttp_js.StreamableHTTPServerTransport({
              ...options,
              sessionIdGenerator: () => crypto$1.randomUUID(),
              onsessioninitialized: (id) => {
                this.streamableHTTPTransports.set(id, transport);
              }
            });
            transport.onclose = () => {
              const closedSessionId = transport?.sessionId;
              if (closedSessionId && this.streamableHTTPTransports.has(closedSessionId)) {
                this.logger.debug(
                  `startHTTP: Streamable HTTP transport closed for session ${closedSessionId}, removing from map.`
                );
                this.streamableHTTPTransports.delete(closedSessionId);
              }
            };
            await this.server.connect(transport);
            if (transport.sessionId) {
              this.streamableHTTPTransports.set(transport.sessionId, transport);
              this.logger.debug(
                `startHTTP: Streamable HTTP session initialized and stored with ID: ${transport.sessionId}`
              );
            } else {
              this.logger.warn("startHTTP: Streamable HTTP transport initialized without a session ID.");
            }
            return await transport.handleRequest(req, res, body);
          } else {
            this.logger.warn("startHTTP: Received non-initialize POST request without a session ID.");
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                jsonrpc: "2.0",
                error: {
                  code: -32e3,
                  message: "Bad Request: No valid session ID provided for non-initialize request"
                },
                id: body?.id ?? null
                // Include original request ID if available
              })
            );
          }
        } else {
          this.logger.warn(`startHTTP: Received ${req.method} request without a session ID.`);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message: `Bad Request: ${req.method} request requires a valid session ID`
              },
              id: null
            })
          );
        }
      }
    } catch (error) {
      this.logger.error("startHTTP: Error handling Streamable HTTP request:", { error });
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error"
            },
            id: null
            // Cannot determine original request ID in catch
          })
        );
      } else {
        this.logger.error("startHTTP: Error after headers sent:", error);
      }
    }
  }
  async connectSSE({
    messagePath,
    res
  }) {
    this.logger.debug("Received SSE connection");
    this.sseTransport = new sse_js.SSEServerTransport(messagePath, res);
    await this.server.connect(this.sseTransport);
    this.server.onclose = async () => {
      this.sseTransport = void 0;
      await this.server.close();
    };
    res.on("close", () => {
      this.sseTransport = void 0;
    });
  }
  async connectHonoSSE({ messagePath, stream }) {
    this.logger.debug("Received SSE connection");
    const sseTransport = new SSETransport(messagePath, stream);
    const sessionId = sseTransport.sessionId;
    this.logger.debug("SSE Transport created with sessionId:", { sessionId });
    this.sseHonoTransports.set(sessionId, sseTransport);
    stream.onAbort(() => {
      this.logger.debug("SSE Transport aborted with sessionId:", { sessionId });
      this.sseHonoTransports.delete(sessionId);
    });
    await this.server.connect(sseTransport);
    this.server.onclose = async () => {
      this.logger.debug("SSE Transport closed with sessionId:", { sessionId });
      this.sseHonoTransports.delete(sessionId);
      await this.server.close();
    };
    while (true) {
      const sessionIds = Array.from(this.sseHonoTransports.keys() || []);
      this.logger.debug("Active Hono SSE sessions:", { sessionIds });
      await stream.write(":keep-alive\n\n");
      await stream.sleep(6e4);
    }
  }
  /**
   * Close the MCP server and all its connections
   */
  async close() {
    this.callToolHandlerIsRegistered = false;
    this.listToolsHandlerIsRegistered = false;
    this.listResourcesHandlerIsRegistered = false;
    this.readResourceHandlerIsRegistered = false;
    this.listResourceTemplatesHandlerIsRegistered = false;
    this.subscribeResourceHandlerIsRegistered = false;
    this.unsubscribeResourceHandlerIsRegistered = false;
    try {
      if (this.stdioTransport) {
        await this.stdioTransport.close?.();
        this.stdioTransport = void 0;
      }
      if (this.sseTransport) {
        await this.sseTransport.close?.();
        this.sseTransport = void 0;
      }
      if (this.sseHonoTransports) {
        for (const transport of this.sseHonoTransports.values()) {
          await transport.close?.();
        }
        this.sseHonoTransports.clear();
      }
      if (this.streamableHTTPTransports) {
        for (const transport of this.streamableHTTPTransports.values()) {
          await transport.close?.();
        }
        this.streamableHTTPTransports.clear();
      }
      await this.server.close();
      this.logger.info("MCP server closed.");
    } catch (error) {
      this.logger.error("Error closing MCP server:", { error });
    }
  }
  /**
   * Gets the basic information about the server, conforming to the Server schema.
   * @returns ServerInfo object.
   */
  getServerInfo() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      repository: this.repository,
      version_detail: {
        version: this.version,
        release_date: this.releaseDate,
        is_latest: this.isLatest
      }
    };
  }
  /**
   * Gets detailed information about the server, conforming to the ServerDetail schema.
   * @returns ServerDetailInfo object.
   */
  getServerDetail() {
    return {
      ...this.getServerInfo(),
      package_canonical: this.packageCanonical,
      packages: this.packages,
      remotes: this.remotes
    };
  }
  /**
   * Gets a list of tools provided by this MCP server, including their schemas.
   * This leverages the same tool information used by the internal ListTools MCP request.
   * @returns An object containing an array of tool information.
   */
  getToolListInfo() {
    this.logger.debug(`Getting tool list information for MCPServer '${this.name}'`);
    return {
      tools: Object.entries(this.convertedTools).map(([toolId, tool]) => ({
        id: toolId,
        name: tool.name,
        description: tool.description,
        inputSchema: tool.parameters?.jsonSchema || tool.parameters,
        toolType: tool.toolType
      }))
    };
  }
  /**
   * Gets information for a specific tool provided by this MCP server.
   * @param toolId The ID/name of the tool to retrieve.
   * @returns Tool information (name, description, inputSchema) or undefined if not found.
   */
  getToolInfo(toolId) {
    const tool = this.convertedTools[toolId];
    if (!tool) {
      this.logger.debug(`Tool '${toolId}' not found on MCPServer '${this.name}'`);
      return void 0;
    }
    this.logger.debug(`Getting info for tool '${toolId}' on MCPServer '${this.name}'`);
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.parameters?.jsonSchema || tool.parameters,
      toolType: tool.toolType
    };
  }
  /**
   * Executes a specific tool provided by this MCP server.
   * @param toolId The ID/name of the tool to execute.
   * @param args The arguments to pass to the tool's execute function.
   * @param executionContext Optional context for the tool execution.
   * @returns A promise that resolves to the result of the tool execution.
   * @throws Error if the tool is not found, validation fails, or execution fails.
   */
  async executeTool(toolId, args, executionContext) {
    const tool = this.convertedTools[toolId];
    if (!tool) {
      this.logger.warn(`ExecuteTool: Unknown tool '${toolId}' requested on MCPServer '${this.name}'.`);
      throw new Error(`Unknown tool: ${toolId}`);
    }
    this.logger.debug(`ExecuteTool: Invoking '${toolId}' with arguments:`, args);
    let validatedArgs = args;
    if (tool.parameters instanceof zod.z.ZodType && typeof tool.parameters.safeParse === "function") {
      const validation = tool.parameters.safeParse(args ?? {});
      if (!validation.success) {
        const errorMessages = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        this.logger.warn(`ExecuteTool: Invalid tool arguments for '${toolId}': ${errorMessages}`, {
          errors: validation.error.format()
        });
        throw new zod.z.ZodError(validation.error.issues);
      }
      validatedArgs = validation.data;
    } else {
      this.logger.debug(
        `ExecuteTool: Tool '${toolId}' parameters is not a Zod schema with safeParse or is undefined. Skipping validation.`
      );
    }
    if (!tool.execute) {
      this.logger.error(`ExecuteTool: Tool '${toolId}' does not have an execute function.`);
      throw new Error(`Tool '${toolId}' cannot be executed.`);
    }
    try {
      const finalExecutionContext = {
        messages: executionContext?.messages || [],
        toolCallId: executionContext?.toolCallId || crypto$1.randomUUID()
      };
      const result = await tool.execute(validatedArgs, finalExecutionContext);
      this.logger.info(`ExecuteTool: Tool '${toolId}' executed successfully.`);
      return result;
    } catch (error) {
      this.logger.error(`ExecuteTool: Tool execution failed for '${toolId}':`, { error });
      throw error instanceof Error ? error : new Error(`Execution of tool '${toolId}' failed: ${String(error)}`);
    }
  }
};

exports.MCPClient = MCPClient;
exports.MCPConfiguration = MCPConfiguration;
exports.MCPServer = MCPServer;
exports.MastraMCPClient = MastraMCPClient;
