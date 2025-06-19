'use strict';

var integration = require('@mastra/core/integration');
var Mem0Client = require('mem0ai');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Mem0Client__default = /*#__PURE__*/_interopDefault(Mem0Client);

// src/index.ts

// src/client/utils.ts
var Mem0Utils = class _Mem0Utils {
  static MEM0_CLIENT_CONFIG_OPTIONS = [
    "apiKey",
    "host",
    "organizationName",
    "projectName",
    "organizationId",
    "projectId"
  ];
  static convertCamelCaseToSnakeCase = (str) => {
    if (_Mem0Utils.MEM0_CLIENT_CONFIG_OPTIONS.includes(str)) {
      return str;
    }
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
  };
  static convertStringToMessages = (str) => {
    return str.split("\n").map((line) => {
      return {
        role: "user",
        content: line
      };
    });
  };
  static getMemoryString = (memory) => {
    const MEMORY_STRING_PREFIX = "These are the memories I have stored. Give more weightage to the question by users and try to answer that first. You have to modify your answer based on the memories I have provided. If the memories are irrelevant you can ignore them. Also don't reply to this section of the prompt, or the memories, they are only for your reference. The MEMORIES of the USER are: \n\n";
    const memoryString = memory.map((memory2) => `${memory2.memory}`).join("\n") ?? "";
    if (memoryString.length > 0) {
      return `${MEMORY_STRING_PREFIX}${memoryString}`;
    }
    return "";
  };
};

// src/client/sdk.ts
var Mem0AIClient = class {
  client;
  mem0Config;
  constructor(config) {
    const snakeCaseConfig = Object.fromEntries(
      Object.entries(config).map(([key, value]) => [Mem0Utils.convertCamelCaseToSnakeCase(key), value])
    );
    this.mem0Config = snakeCaseConfig;
    this.client = new Mem0Client__default.default(snakeCaseConfig);
  }
  async createMemory(messages, options) {
    const messagesToAdd = typeof messages === "string" ? Mem0Utils.convertStringToMessages(messages) : messages;
    const memory = await this.client.add(messagesToAdd, {
      ...this.mem0Config,
      ...options
    });
    const memoryString = Mem0Utils.getMemoryString(memory);
    return memoryString;
  }
  async searchMemory(query, options) {
    const memory = await this.client.search(query, {
      ...this.mem0Config,
      ...options
    });
    const memoryString = Mem0Utils.getMemoryString(memory);
    return memoryString;
  }
};

// src/index.ts
var Mem0Integration = class extends integration.Integration {
  name = "MEM0";
  logoUrl = "";
  config;
  client;
  categories = ["ai", "memory"];
  description = "Mem0 is a memory-based AI platform that allows you to store, search, and analyze your data based on the user's query.";
  constructor({ config }) {
    super();
    this.config = config;
    this.client = new Mem0AIClient(config);
  }
  async createMemory(messages, options) {
    const memory = await this.client.createMemory(messages, options);
    return memory;
  }
  async searchMemory(query, options) {
    const memory = await this.client.searchMemory(query, options);
    return memory;
  }
};

exports.Mem0Integration = Mem0Integration;
