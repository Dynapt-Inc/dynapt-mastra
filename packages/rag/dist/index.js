import { randomUUID, createHash } from 'crypto';
import { z } from 'zod';
import { parse } from 'node-html-better-parser';
import { encodingForModel, getEncoding } from 'js-tiktoken';
import { CohereRelevanceScorer, MastraAgentRelevanceScorer } from '@mastra/core/relevance';
import { Big } from 'big.js';
import { createTool } from '@mastra/core/tools';
import { embed } from 'ai';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __knownSymbol = (name14, symbol15) => (symbol15 = Symbol[name14]) ? symbol15 : Symbol.for("Symbol." + name14);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));
var __decoratorStart = (base) => [, , , __create(null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name14, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name: name14, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name14, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = array.length + 1 , key = __decoratorStrings[k + 5];
  var initializers = (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc({ get [name14]() {
    return __privateGet(this, extra);
  }, set [name14](x) {
    return __privateSet(this, extra, x);
  } }, name14));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name14, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name14 in x };
      access.get = (x) => x[name14];
      access.set = (x, y) => x[name14] = y;
    }
    it = (0, decorators[i])({ get: desc.get, set: desc.set } , ctx), done._ = 1;
    if (it === void 0) __expectFn(it) && (desc[key] = it );
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return desc && __defProp(target, name14, desc), target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);

// ../../node_modules/.pnpm/secure-json-parse@2.7.0/node_modules/secure-json-parse/index.js
var require_secure_json_parse = __commonJS({
  "../../node_modules/.pnpm/secure-json-parse@2.7.0/node_modules/secure-json-parse/index.js"(exports, module) {
    var hasBuffer = typeof Buffer !== "undefined";
    var suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
    var suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
    function _parse(text, reviver, options) {
      if (options == null) {
        if (reviver !== null && typeof reviver === "object") {
          options = reviver;
          reviver = void 0;
        }
      }
      if (hasBuffer && Buffer.isBuffer(text)) {
        text = text.toString();
      }
      if (text && text.charCodeAt(0) === 65279) {
        text = text.slice(1);
      }
      const obj = JSON.parse(text, reviver);
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      const protoAction = options && options.protoAction || "error";
      const constructorAction = options && options.constructorAction || "error";
      if (protoAction === "ignore" && constructorAction === "ignore") {
        return obj;
      }
      if (protoAction !== "ignore" && constructorAction !== "ignore") {
        if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) {
          return obj;
        }
      } else if (protoAction !== "ignore" && constructorAction === "ignore") {
        if (suspectProtoRx.test(text) === false) {
          return obj;
        }
      } else {
        if (suspectConstructorRx.test(text) === false) {
          return obj;
        }
      }
      return filter(obj, { protoAction, constructorAction, safe: options && options.safe });
    }
    function filter(obj, { protoAction = "error", constructorAction = "error", safe } = {}) {
      let next = [obj];
      while (next.length) {
        const nodes = next;
        next = [];
        for (const node of nodes) {
          if (protoAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "__proto__")) {
            if (safe === true) {
              return null;
            } else if (protoAction === "error") {
              throw new SyntaxError("Object contains forbidden prototype property");
            }
            delete node.__proto__;
          }
          if (constructorAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "constructor") && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
            if (safe === true) {
              return null;
            } else if (constructorAction === "error") {
              throw new SyntaxError("Object contains forbidden prototype property");
            }
            delete node.constructor;
          }
          for (const key in node) {
            const value = node[key];
            if (value && typeof value === "object") {
              next.push(value);
            }
          }
        }
      }
      return obj;
    }
    function parse2(text, reviver, options) {
      const stackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = 0;
      try {
        return _parse(text, reviver, options);
      } finally {
        Error.stackTraceLimit = stackTraceLimit;
      }
    }
    function safeParse(text, reviver) {
      const stackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = 0;
      try {
        return _parse(text, reviver, { safe: true });
      } catch (_e) {
        return null;
      } finally {
        Error.stackTraceLimit = stackTraceLimit;
      }
    }
    module.exports = parse2;
    module.exports.default = parse2;
    module.exports.parse = parse2;
    module.exports.safeParse = safeParse;
    module.exports.scan = filter;
  }
});

// src/document/prompts/format.ts
function format(str, params) {
  return str.replace(/{(\w+)}/g, (_, k) => params[k] ?? "");
}

// src/document/prompts/base.ts
var BasePromptTemplate = class {
  templateVars = /* @__PURE__ */ new Set();
  options = {};
  constructor(options) {
    const { templateVars } = options;
    if (templateVars) {
      this.templateVars = new Set(templateVars);
    }
    if (options.options) {
      this.options = options.options;
    }
  }
};
var PromptTemplate = class _PromptTemplate extends BasePromptTemplate {
  #template;
  constructor(options) {
    const { template, ...rest } = options;
    super(rest);
    this.#template = template;
  }
  partialFormat(options) {
    const prompt = new _PromptTemplate({
      template: this.template,
      templateVars: [...this.templateVars],
      options: this.options
    });
    prompt.options = {
      ...prompt.options,
      ...options
    };
    return prompt;
  }
  format(options) {
    const allOptions = {
      ...this.options,
      ...options
    };
    return format(this.template, allOptions);
  }
  formatMessages(options) {
    const prompt = this.format(options);
    return [
      {
        role: "user",
        content: prompt
      }
    ];
  }
  get template() {
    return this.#template;
  }
};

// src/document/prompts/prompt.ts
var defaultSummaryPrompt = new PromptTemplate({
  templateVars: ["context"],
  template: `Write a summary of the following. Try to use only the information provided. Try to include as many key details as possible.


{context}


SUMMARY:"""
`
});
var defaultKeywordExtractPrompt = new PromptTemplate({
  templateVars: ["maxKeywords", "context"],
  template: `
Some text is provided below. Given the text, extract up to {maxKeywords} keywords from the text. Avoid stopwords.
---------------------
{context}
---------------------
Provide keywords in the following comma-separated format: 'KEYWORDS: <keywords>'
`
}).partialFormat({
  maxKeywords: "10"
});
var defaultQuestionExtractPrompt = new PromptTemplate({
  templateVars: ["numQuestions", "context"],
  template: `(
  "Given the contextual informations below, generate {numQuestions} questions this context can provides specific answers to which are unlikely to be found else where. Higher-level summaries of surrounding context may be provided as well. "
  "Try using these summaries to generate better questions that this context can answer."
  "---------------------"
  "{context}"
  "---------------------"
  "Provide questions in the following format: 'QUESTIONS: <questions>'"
)`
}).partialFormat({
  numQuestions: "5"
});
var defaultTitleExtractorPromptTemplate = new PromptTemplate({
  templateVars: ["context"],
  template: `{context}
Give a title that summarizes all of the unique entities, titles or themes found in the context. 
Title: `
});
var defaultTitleCombinePromptTemplate = new PromptTemplate({
  templateVars: ["context"],
  template: `{context} 
Based on the above candidate titles and contents, what is the comprehensive title for this document? 
Title: `
});
var _hash_dec, _init, _hash;
_hash_dec = [lazyInitHash];
var BaseNode = class {
  constructor(init) {
    __publicField(this, "id_");
    __publicField(this, "metadata");
    __publicField(this, "relationships");
    __privateAdd(this, _hash, __runInitializers(_init, 8, this, "")), __runInitializers(_init, 11, this);
    const { id_, metadata, relationships } = init || {};
    this.id_ = id_ ?? randomUUID();
    this.metadata = metadata ?? {};
    this.relationships = relationships ?? {};
  }
  get sourceNode() {
    const relationship = this.relationships["SOURCE" /* SOURCE */];
    if (Array.isArray(relationship)) {
      throw new Error("Source object must be a single RelatedNodeInfo object");
    }
    return relationship;
  }
  get prevNode() {
    const relationship = this.relationships["PREVIOUS" /* PREVIOUS */];
    if (Array.isArray(relationship)) {
      throw new Error("Previous object must be a single RelatedNodeInfo object");
    }
    return relationship;
  }
  get nextNode() {
    const relationship = this.relationships["NEXT" /* NEXT */];
    if (Array.isArray(relationship)) {
      throw new Error("Next object must be a single RelatedNodeInfo object");
    }
    return relationship;
  }
  get parentNode() {
    const relationship = this.relationships["PARENT" /* PARENT */];
    if (Array.isArray(relationship)) {
      throw new Error("Parent object must be a single RelatedNodeInfo object");
    }
    return relationship;
  }
  get childNodes() {
    const relationship = this.relationships["CHILD" /* CHILD */];
    if (!Array.isArray(relationship)) {
      throw new Error("Child object must be a an array of RelatedNodeInfo objects");
    }
    return relationship;
  }
};
_init = __decoratorStart();
_hash = new WeakMap();
__decorateElement(_init, 4, "hash", _hash_dec, BaseNode, _hash);
__decoratorMetadata(_init, BaseNode);
var TextNode = class extends BaseNode {
  text;
  startCharIdx;
  endCharIdx;
  metadataSeparator;
  constructor(init = {}) {
    super(init);
    const { text, startCharIdx, endCharIdx, metadataSeparator } = init;
    this.text = text ?? "";
    if (startCharIdx) {
      this.startCharIdx = startCharIdx;
    }
    if (endCharIdx) {
      this.endCharIdx = endCharIdx;
    }
    this.metadataSeparator = metadataSeparator ?? "\n";
  }
  /**
   * Generate a hash of the text node.
   * The ID is not part of the hash as it can change independent of content.
   * @returns
   */
  generateHash() {
    const hashFunction = createSHA256();
    hashFunction.update(`type=${this.type}`);
    hashFunction.update(`startCharIdx=${this.startCharIdx} endCharIdx=${this.endCharIdx}`);
    hashFunction.update(this.getContent());
    return hashFunction.digest();
  }
  get type() {
    return "TEXT" /* TEXT */;
  }
  getContent() {
    const metadataStr = this.getMetadataStr().trim();
    return `${metadataStr}

${this.text}`.trim();
  }
  getMetadataStr() {
    const usableMetadataKeys = new Set(Object.keys(this.metadata).sort());
    return [...usableMetadataKeys].map((key) => `${key}: ${this.metadata[key]}`).join(this.metadataSeparator);
  }
  getNodeInfo() {
    return { start: this.startCharIdx, end: this.endCharIdx };
  }
  getText() {
    return this.text;
  }
};
var Document = class extends TextNode {
  constructor(init) {
    super(init);
  }
  get type() {
    return "DOCUMENT" /* DOCUMENT */;
  }
};
function lazyInitHash(value, _context) {
  return {
    get() {
      const oldValue = value.get.call(this);
      if (oldValue === "") {
        const hash = this.generateHash();
        value.set.call(this, hash);
      }
      return value.get.call(this);
    },
    set(newValue) {
      value.set.call(this, newValue);
    },
    init(value2) {
      return value2;
    }
  };
}
function createSHA256() {
  const hash = createHash("sha256");
  return {
    update(data) {
      hash.update(data);
    },
    digest() {
      return hash.digest("base64");
    }
  };
}

// src/document/extractors/base.ts
var BaseExtractor = class {
  isTextNodeOnly = true;
  /**
   *
   * @param nodes Nodes to extract metadata from.
   * @returns Metadata extracted from the nodes.
   */
  async processNodes(nodes) {
    let newNodes = nodes;
    const curMetadataList = await this.extract(newNodes);
    for (const idx in newNodes) {
      newNodes[idx].metadata = {
        ...newNodes[idx].metadata,
        ...curMetadataList[idx]
      };
    }
    return newNodes;
  }
};

// ../../node_modules/.pnpm/@ai-sdk+provider@1.1.3/node_modules/@ai-sdk/provider/dist/index.mjs
var marker = "vercel.ai.error";
var symbol = Symbol.for(marker);
var _a;
var _AISDKError = class _AISDKError2 extends Error {
  /**
   * Creates an AI SDK Error.
   *
   * @param {Object} params - The parameters for creating the error.
   * @param {string} params.name - The name of the error.
   * @param {string} params.message - The error message.
   * @param {unknown} [params.cause] - The underlying cause of the error.
   */
  constructor({
    name: name14,
    message,
    cause
  }) {
    super(message);
    this[_a] = true;
    this.name = name14;
    this.cause = cause;
  }
  /**
   * Checks if the given error is an AI SDK Error.
   * @param {unknown} error - The error to check.
   * @returns {boolean} True if the error is an AI SDK Error, false otherwise.
   */
  static isInstance(error) {
    return _AISDKError2.hasMarker(error, marker);
  }
  static hasMarker(error, marker15) {
    const markerSymbol = Symbol.for(marker15);
    return error != null && typeof error === "object" && markerSymbol in error && typeof error[markerSymbol] === "boolean" && error[markerSymbol] === true;
  }
};
_a = symbol;
var AISDKError = _AISDKError;
var name = "AI_APICallError";
var marker2 = `vercel.ai.error.${name}`;
var symbol2 = Symbol.for(marker2);
var _a2;
var APICallError = class extends AISDKError {
  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    responseHeaders,
    responseBody,
    cause,
    isRetryable = statusCode != null && (statusCode === 408 || // request timeout
    statusCode === 409 || // conflict
    statusCode === 429 || // too many requests
    statusCode >= 500),
    // server error
    data
  }) {
    super({ name, message, cause });
    this[_a2] = true;
    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.responseHeaders = responseHeaders;
    this.responseBody = responseBody;
    this.isRetryable = isRetryable;
    this.data = data;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker2);
  }
};
_a2 = symbol2;
var name2 = "AI_EmptyResponseBodyError";
var marker3 = `vercel.ai.error.${name2}`;
var symbol3 = Symbol.for(marker3);
var _a3;
var EmptyResponseBodyError = class extends AISDKError {
  // used in isInstance
  constructor({ message = "Empty response body" } = {}) {
    super({ name: name2, message });
    this[_a3] = true;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker3);
  }
};
_a3 = symbol3;
function getErrorMessage(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}
var name3 = "AI_InvalidArgumentError";
var marker4 = `vercel.ai.error.${name3}`;
var symbol4 = Symbol.for(marker4);
var _a4;
var InvalidArgumentError = class extends AISDKError {
  constructor({
    message,
    cause,
    argument
  }) {
    super({ name: name3, message, cause });
    this[_a4] = true;
    this.argument = argument;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker4);
  }
};
_a4 = symbol4;
var name4 = "AI_InvalidPromptError";
var marker5 = `vercel.ai.error.${name4}`;
var symbol5 = Symbol.for(marker5);
var _a5;
var InvalidPromptError = class extends AISDKError {
  constructor({
    prompt,
    message,
    cause
  }) {
    super({ name: name4, message: `Invalid prompt: ${message}`, cause });
    this[_a5] = true;
    this.prompt = prompt;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker5);
  }
};
_a5 = symbol5;
var name5 = "AI_InvalidResponseDataError";
var marker6 = `vercel.ai.error.${name5}`;
var symbol6 = Symbol.for(marker6);
var _a6;
var InvalidResponseDataError = class extends AISDKError {
  constructor({
    data,
    message = `Invalid response data: ${JSON.stringify(data)}.`
  }) {
    super({ name: name5, message });
    this[_a6] = true;
    this.data = data;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker6);
  }
};
_a6 = symbol6;
var name6 = "AI_JSONParseError";
var marker7 = `vercel.ai.error.${name6}`;
var symbol7 = Symbol.for(marker7);
var _a7;
var JSONParseError = class extends AISDKError {
  constructor({ text, cause }) {
    super({
      name: name6,
      message: `JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage(cause)}`,
      cause
    });
    this[_a7] = true;
    this.text = text;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker7);
  }
};
_a7 = symbol7;
var name7 = "AI_LoadAPIKeyError";
var marker8 = `vercel.ai.error.${name7}`;
var symbol8 = Symbol.for(marker8);
var _a8;
var LoadAPIKeyError = class extends AISDKError {
  // used in isInstance
  constructor({ message }) {
    super({ name: name7, message });
    this[_a8] = true;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker8);
  }
};
_a8 = symbol8;
var name11 = "AI_TooManyEmbeddingValuesForCallError";
var marker12 = `vercel.ai.error.${name11}`;
var symbol12 = Symbol.for(marker12);
var _a12;
var TooManyEmbeddingValuesForCallError = class extends AISDKError {
  constructor(options) {
    super({
      name: name11,
      message: `Too many values for a single embedding call. The ${options.provider} model "${options.modelId}" can only embed up to ${options.maxEmbeddingsPerCall} values per call, but ${options.values.length} values were provided.`
    });
    this[_a12] = true;
    this.provider = options.provider;
    this.modelId = options.modelId;
    this.maxEmbeddingsPerCall = options.maxEmbeddingsPerCall;
    this.values = options.values;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker12);
  }
};
_a12 = symbol12;
var name12 = "AI_TypeValidationError";
var marker13 = `vercel.ai.error.${name12}`;
var symbol13 = Symbol.for(marker13);
var _a13;
var _TypeValidationError = class _TypeValidationError2 extends AISDKError {
  constructor({ value, cause }) {
    super({
      name: name12,
      message: `Type validation failed: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage(cause)}`,
      cause
    });
    this[_a13] = true;
    this.value = value;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker13);
  }
  /**
   * Wraps an error into a TypeValidationError.
   * If the cause is already a TypeValidationError with the same value, it returns the cause.
   * Otherwise, it creates a new TypeValidationError.
   *
   * @param {Object} params - The parameters for wrapping the error.
   * @param {unknown} params.value - The value that failed validation.
   * @param {unknown} params.cause - The original error or cause of the validation failure.
   * @returns {TypeValidationError} A TypeValidationError instance.
   */
  static wrap({
    value,
    cause
  }) {
    return _TypeValidationError2.isInstance(cause) && cause.value === value ? cause : new _TypeValidationError2({ value, cause });
  }
};
_a13 = symbol13;
var TypeValidationError = _TypeValidationError;
var name13 = "AI_UnsupportedFunctionalityError";
var marker14 = `vercel.ai.error.${name13}`;
var symbol14 = Symbol.for(marker14);
var _a14;
var UnsupportedFunctionalityError = class extends AISDKError {
  constructor({
    functionality,
    message = `'${functionality}' functionality not supported.`
  }) {
    super({ name: name13, message });
    this[_a14] = true;
    this.functionality = functionality;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker14);
  }
};
_a14 = symbol14;

// ../../node_modules/.pnpm/nanoid@3.3.11/node_modules/nanoid/non-secure/index.js
var customAlphabet = (alphabet, defaultSize = 21) => {
  return (size = defaultSize) => {
    let id = "";
    let i = size | 0;
    while (i--) {
      id += alphabet[Math.random() * alphabet.length | 0];
    }
    return id;
  };
};

// ../../node_modules/.pnpm/@ai-sdk+provider-utils@2.2.8_zod@3.25.57/node_modules/@ai-sdk/provider-utils/dist/index.mjs
var import_secure_json_parse = __toESM(require_secure_json_parse());
function combineHeaders(...headers) {
  return headers.reduce(
    (combinedHeaders, currentHeaders) => ({
      ...combinedHeaders,
      ...currentHeaders != null ? currentHeaders : {}
    }),
    {}
  );
}
function createEventSourceParserStream() {
  let buffer = "";
  let event = void 0;
  let data = [];
  let lastEventId = void 0;
  let retry = void 0;
  function parseLine(line, controller) {
    if (line === "") {
      dispatchEvent(controller);
      return;
    }
    if (line.startsWith(":")) {
      return;
    }
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      handleField(line, "");
      return;
    }
    const field = line.slice(0, colonIndex);
    const valueStart = colonIndex + 1;
    const value = valueStart < line.length && line[valueStart] === " " ? line.slice(valueStart + 1) : line.slice(valueStart);
    handleField(field, value);
  }
  function dispatchEvent(controller) {
    if (data.length > 0) {
      controller.enqueue({
        event,
        data: data.join("\n"),
        id: lastEventId,
        retry
      });
      data = [];
      event = void 0;
      retry = void 0;
    }
  }
  function handleField(field, value) {
    switch (field) {
      case "event":
        event = value;
        break;
      case "data":
        data.push(value);
        break;
      case "id":
        lastEventId = value;
        break;
      case "retry":
        const parsedRetry = parseInt(value, 10);
        if (!isNaN(parsedRetry)) {
          retry = parsedRetry;
        }
        break;
    }
  }
  return new TransformStream({
    transform(chunk, controller) {
      const { lines, incompleteLine } = splitLines(buffer, chunk);
      buffer = incompleteLine;
      for (let i = 0; i < lines.length; i++) {
        parseLine(lines[i], controller);
      }
    },
    flush(controller) {
      parseLine(buffer, controller);
      dispatchEvent(controller);
    }
  });
}
function splitLines(buffer, chunk) {
  const lines = [];
  let currentLine = buffer;
  for (let i = 0; i < chunk.length; ) {
    const char = chunk[i++];
    if (char === "\n") {
      lines.push(currentLine);
      currentLine = "";
    } else if (char === "\r") {
      lines.push(currentLine);
      currentLine = "";
      if (chunk[i] === "\n") {
        i++;
      }
    } else {
      currentLine += char;
    }
  }
  return { lines, incompleteLine: currentLine };
}
function extractResponseHeaders(response) {
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}
var createIdGenerator = ({
  prefix,
  size: defaultSize = 16,
  alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  separator = "-"
} = {}) => {
  const generator = customAlphabet(alphabet, defaultSize);
  if (prefix == null) {
    return generator;
  }
  if (alphabet.includes(separator)) {
    throw new InvalidArgumentError({
      argument: "separator",
      message: `The separator "${separator}" must not be part of the alphabet "${alphabet}".`
    });
  }
  return (size) => `${prefix}${separator}${generator(size)}`;
};
var generateId = createIdGenerator();
function removeUndefinedEntries(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([_key, value]) => value != null)
  );
}
function isAbortError(error) {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}
function loadApiKey({
  apiKey,
  environmentVariableName,
  apiKeyParameterName = "apiKey",
  description
}) {
  if (typeof apiKey === "string") {
    return apiKey;
  }
  if (apiKey != null) {
    throw new LoadAPIKeyError({
      message: `${description} API key must be a string.`
    });
  }
  if (typeof process === "undefined") {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter. Environment variables is not supported in this environment.`
    });
  }
  apiKey = process.env[environmentVariableName];
  if (apiKey == null) {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter or the ${environmentVariableName} environment variable.`
    });
  }
  if (typeof apiKey !== "string") {
    throw new LoadAPIKeyError({
      message: `${description} API key must be a string. The value of the ${environmentVariableName} environment variable is not a string.`
    });
  }
  return apiKey;
}
var validatorSymbol = Symbol.for("vercel.ai.validator");
function validator(validate) {
  return { [validatorSymbol]: true, validate };
}
function isValidator(value) {
  return typeof value === "object" && value !== null && validatorSymbol in value && value[validatorSymbol] === true && "validate" in value;
}
function asValidator(value) {
  return isValidator(value) ? value : zodValidator(value);
}
function zodValidator(zodSchema) {
  return validator((value) => {
    const result = zodSchema.safeParse(value);
    return result.success ? { success: true, value: result.data } : { success: false, error: result.error };
  });
}
function validateTypes({
  value,
  schema: inputSchema
}) {
  const result = safeValidateTypes({ value, schema: inputSchema });
  if (!result.success) {
    throw TypeValidationError.wrap({ value, cause: result.error });
  }
  return result.value;
}
function safeValidateTypes({
  value,
  schema
}) {
  const validator2 = asValidator(schema);
  try {
    if (validator2.validate == null) {
      return { success: true, value };
    }
    const result = validator2.validate(value);
    if (result.success) {
      return result;
    }
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: result.error })
    };
  } catch (error) {
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: error })
    };
  }
}
function parseJSON({
  text,
  schema
}) {
  try {
    const value = import_secure_json_parse.default.parse(text);
    if (schema == null) {
      return value;
    }
    return validateTypes({ value, schema });
  } catch (error) {
    if (JSONParseError.isInstance(error) || TypeValidationError.isInstance(error)) {
      throw error;
    }
    throw new JSONParseError({ text, cause: error });
  }
}
function safeParseJSON({
  text,
  schema
}) {
  try {
    const value = import_secure_json_parse.default.parse(text);
    if (schema == null) {
      return { success: true, value, rawValue: value };
    }
    const validationResult = safeValidateTypes({ value, schema });
    return validationResult.success ? { ...validationResult, rawValue: value } : validationResult;
  } catch (error) {
    return {
      success: false,
      error: JSONParseError.isInstance(error) ? error : new JSONParseError({ text, cause: error })
    };
  }
}
function isParsableJson(input) {
  try {
    import_secure_json_parse.default.parse(input);
    return true;
  } catch (e) {
    return false;
  }
}
function parseProviderOptions({
  provider,
  providerOptions,
  schema
}) {
  if ((providerOptions == null ? void 0 : providerOptions[provider]) == null) {
    return void 0;
  }
  const parsedProviderOptions = safeValidateTypes({
    value: providerOptions[provider],
    schema
  });
  if (!parsedProviderOptions.success) {
    throw new InvalidArgumentError({
      argument: "providerOptions",
      message: `invalid ${provider} provider options`,
      cause: parsedProviderOptions.error
    });
  }
  return parsedProviderOptions.value;
}
var getOriginalFetch2 = () => globalThis.fetch;
var postJsonToApi = async ({
  url,
  headers,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
}) => postToApi({
  url,
  headers: {
    "Content-Type": "application/json",
    ...headers
  },
  body: {
    content: JSON.stringify(body),
    values: body
  },
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
});
var postFormDataToApi = async ({
  url,
  headers,
  formData,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
}) => postToApi({
  url,
  headers,
  body: {
    content: formData,
    values: Object.fromEntries(formData.entries())
  },
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
});
var postToApi = async ({
  url,
  headers = {},
  body,
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal,
  fetch = getOriginalFetch2()
}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: removeUndefinedEntries(headers),
      body: body.content,
      signal: abortSignal
    });
    const responseHeaders = extractResponseHeaders(response);
    if (!response.ok) {
      let errorInformation;
      try {
        errorInformation = await failedResponseHandler({
          response,
          url,
          requestBodyValues: body.values
        });
      } catch (error) {
        if (isAbortError(error) || APICallError.isInstance(error)) {
          throw error;
        }
        throw new APICallError({
          message: "Failed to process error response",
          cause: error,
          statusCode: response.status,
          url,
          responseHeaders,
          requestBodyValues: body.values
        });
      }
      throw errorInformation.value;
    }
    try {
      return await successfulResponseHandler({
        response,
        url,
        requestBodyValues: body.values
      });
    } catch (error) {
      if (error instanceof Error) {
        if (isAbortError(error) || APICallError.isInstance(error)) {
          throw error;
        }
      }
      throw new APICallError({
        message: "Failed to process successful response",
        cause: error,
        statusCode: response.status,
        url,
        responseHeaders,
        requestBodyValues: body.values
      });
    }
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    if (error instanceof TypeError && error.message === "fetch failed") {
      const cause = error.cause;
      if (cause != null) {
        throw new APICallError({
          message: `Cannot connect to API: ${cause.message}`,
          cause,
          url,
          requestBodyValues: body.values,
          isRetryable: true
          // retry when network error
        });
      }
    }
    throw error;
  }
};
var createJsonErrorResponseHandler = ({
  errorSchema,
  errorToMessage,
  isRetryable
}) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const responseHeaders = extractResponseHeaders(response);
  if (responseBody.trim() === "") {
    return {
      responseHeaders,
      value: new APICallError({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
  try {
    const parsedError = parseJSON({
      text: responseBody,
      schema: errorSchema
    });
    return {
      responseHeaders,
      value: new APICallError({
        message: errorToMessage(parsedError),
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        data: parsedError,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response, parsedError)
      })
    };
  } catch (parseError) {
    return {
      responseHeaders,
      value: new APICallError({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
};
var createEventSourceResponseHandler = (chunkSchema) => async ({ response }) => {
  const responseHeaders = extractResponseHeaders(response);
  if (response.body == null) {
    throw new EmptyResponseBodyError({});
  }
  return {
    responseHeaders,
    value: response.body.pipeThrough(new TextDecoderStream()).pipeThrough(createEventSourceParserStream()).pipeThrough(
      new TransformStream({
        transform({ data }, controller) {
          if (data === "[DONE]") {
            return;
          }
          controller.enqueue(
            safeParseJSON({
              text: data,
              schema: chunkSchema
            })
          );
        }
      })
    )
  };
};
var createJsonResponseHandler = (responseSchema) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedResult = safeParseJSON({
    text: responseBody,
    schema: responseSchema
  });
  const responseHeaders = extractResponseHeaders(response);
  if (!parsedResult.success) {
    throw new APICallError({
      message: "Invalid JSON response",
      cause: parsedResult.error,
      statusCode: response.status,
      responseHeaders,
      responseBody,
      url,
      requestBodyValues
    });
  }
  return {
    responseHeaders,
    value: parsedResult.value,
    rawValue: parsedResult.rawValue
  };
};
var createBinaryResponseHandler = () => async ({ response, url, requestBodyValues }) => {
  const responseHeaders = extractResponseHeaders(response);
  if (!response.body) {
    throw new APICallError({
      message: "Response body is empty",
      url,
      requestBodyValues,
      statusCode: response.status,
      responseHeaders,
      responseBody: void 0
    });
  }
  try {
    const buffer = await response.arrayBuffer();
    return {
      responseHeaders,
      value: new Uint8Array(buffer)
    };
  } catch (error) {
    throw new APICallError({
      message: "Failed to read response as array buffer",
      url,
      requestBodyValues,
      statusCode: response.status,
      responseHeaders,
      responseBody: void 0,
      cause: error
    });
  }
};
var { btoa, atob } = globalThis;
function convertBase64ToUint8Array(base64String) {
  const base64Url = base64String.replace(/-/g, "+").replace(/_/g, "/");
  const latin1string = atob(base64Url);
  return Uint8Array.from(latin1string, (byte) => byte.codePointAt(0));
}
function convertUint8ArrayToBase64(array) {
  let latin1string = "";
  for (let i = 0; i < array.length; i++) {
    latin1string += String.fromCodePoint(array[i]);
  }
  return btoa(latin1string);
}
function withoutTrailingSlash(url) {
  return url == null ? void 0 : url.replace(/\/$/, "");
}
function convertToOpenAIChatMessages({
  prompt,
  useLegacyFunctionCalling = false,
  systemMessageMode = "system"
}) {
  const messages = [];
  const warnings = [];
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        switch (systemMessageMode) {
          case "system": {
            messages.push({ role: "system", content });
            break;
          }
          case "developer": {
            messages.push({ role: "developer", content });
            break;
          }
          case "remove": {
            warnings.push({
              type: "other",
              message: "system messages are removed for this model"
            });
            break;
          }
          default: {
            const _exhaustiveCheck = systemMessageMode;
            throw new Error(
              `Unsupported system message mode: ${_exhaustiveCheck}`
            );
          }
        }
        break;
      }
      case "user": {
        if (content.length === 1 && content[0].type === "text") {
          messages.push({ role: "user", content: content[0].text });
          break;
        }
        messages.push({
          role: "user",
          content: content.map((part, index) => {
            var _a15, _b, _c, _d;
            switch (part.type) {
              case "text": {
                return { type: "text", text: part.text };
              }
              case "image": {
                return {
                  type: "image_url",
                  image_url: {
                    url: part.image instanceof URL ? part.image.toString() : `data:${(_a15 = part.mimeType) != null ? _a15 : "image/jpeg"};base64,${convertUint8ArrayToBase64(part.image)}`,
                    // OpenAI specific extension: image detail
                    detail: (_c = (_b = part.providerMetadata) == null ? void 0 : _b.openai) == null ? void 0 : _c.imageDetail
                  }
                };
              }
              case "file": {
                if (part.data instanceof URL) {
                  throw new UnsupportedFunctionalityError({
                    functionality: "'File content parts with URL data' functionality not supported."
                  });
                }
                switch (part.mimeType) {
                  case "audio/wav": {
                    return {
                      type: "input_audio",
                      input_audio: { data: part.data, format: "wav" }
                    };
                  }
                  case "audio/mp3":
                  case "audio/mpeg": {
                    return {
                      type: "input_audio",
                      input_audio: { data: part.data, format: "mp3" }
                    };
                  }
                  case "application/pdf": {
                    return {
                      type: "file",
                      file: {
                        filename: (_d = part.filename) != null ? _d : `part-${index}.pdf`,
                        file_data: `data:application/pdf;base64,${part.data}`
                      }
                    };
                  }
                  default: {
                    throw new UnsupportedFunctionalityError({
                      functionality: `File content part type ${part.mimeType} in user messages`
                    });
                  }
                }
              }
            }
          })
        });
        break;
      }
      case "assistant": {
        let text = "";
        const toolCalls = [];
        for (const part of content) {
          switch (part.type) {
            case "text": {
              text += part.text;
              break;
            }
            case "tool-call": {
              toolCalls.push({
                id: part.toolCallId,
                type: "function",
                function: {
                  name: part.toolName,
                  arguments: JSON.stringify(part.args)
                }
              });
              break;
            }
          }
        }
        if (useLegacyFunctionCalling) {
          if (toolCalls.length > 1) {
            throw new UnsupportedFunctionalityError({
              functionality: "useLegacyFunctionCalling with multiple tool calls in one message"
            });
          }
          messages.push({
            role: "assistant",
            content: text,
            function_call: toolCalls.length > 0 ? toolCalls[0].function : void 0
          });
        } else {
          messages.push({
            role: "assistant",
            content: text,
            tool_calls: toolCalls.length > 0 ? toolCalls : void 0
          });
        }
        break;
      }
      case "tool": {
        for (const toolResponse of content) {
          if (useLegacyFunctionCalling) {
            messages.push({
              role: "function",
              name: toolResponse.toolName,
              content: JSON.stringify(toolResponse.result)
            });
          } else {
            messages.push({
              role: "tool",
              tool_call_id: toolResponse.toolCallId,
              content: JSON.stringify(toolResponse.result)
            });
          }
        }
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return { messages, warnings };
}
function mapOpenAIChatLogProbsOutput(logprobs) {
  var _a15, _b;
  return (_b = (_a15 = logprobs == null ? void 0 : logprobs.content) == null ? void 0 : _a15.map(({ token, logprob, top_logprobs }) => ({
    token,
    logprob,
    topLogprobs: top_logprobs ? top_logprobs.map(({ token: token2, logprob: logprob2 }) => ({
      token: token2,
      logprob: logprob2
    })) : []
  }))) != null ? _b : void 0;
}
function mapOpenAIFinishReason(finishReason) {
  switch (finishReason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "unknown";
  }
}
var openaiErrorDataSchema = z.object({
  error: z.object({
    message: z.string(),
    // The additional information below is handled loosely to support
    // OpenAI-compatible providers that have slightly different error
    // responses:
    type: z.string().nullish(),
    param: z.any().nullish(),
    code: z.union([z.string(), z.number()]).nullish()
  })
});
var openaiFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: openaiErrorDataSchema,
  errorToMessage: (data) => data.error.message
});
function getResponseMetadata({
  id,
  model,
  created
}) {
  return {
    id: id != null ? id : void 0,
    modelId: model != null ? model : void 0,
    timestamp: created != null ? new Date(created * 1e3) : void 0
  };
}
function prepareTools({
  mode,
  useLegacyFunctionCalling = false,
  structuredOutputs
}) {
  var _a15;
  const tools = ((_a15 = mode.tools) == null ? void 0 : _a15.length) ? mode.tools : void 0;
  const toolWarnings = [];
  if (tools == null) {
    return { tools: void 0, tool_choice: void 0, toolWarnings };
  }
  const toolChoice = mode.toolChoice;
  if (useLegacyFunctionCalling) {
    const openaiFunctions = [];
    for (const tool of tools) {
      if (tool.type === "provider-defined") {
        toolWarnings.push({ type: "unsupported-tool", tool });
      } else {
        openaiFunctions.push({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        });
      }
    }
    if (toolChoice == null) {
      return {
        functions: openaiFunctions,
        function_call: void 0,
        toolWarnings
      };
    }
    const type2 = toolChoice.type;
    switch (type2) {
      case "auto":
      case "none":
      case void 0:
        return {
          functions: openaiFunctions,
          function_call: void 0,
          toolWarnings
        };
      case "required":
        throw new UnsupportedFunctionalityError({
          functionality: "useLegacyFunctionCalling and toolChoice: required"
        });
      default:
        return {
          functions: openaiFunctions,
          function_call: { name: toolChoice.toolName },
          toolWarnings
        };
    }
  }
  const openaiTools2 = [];
  for (const tool of tools) {
    if (tool.type === "provider-defined") {
      toolWarnings.push({ type: "unsupported-tool", tool });
    } else {
      openaiTools2.push({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
          strict: structuredOutputs ? true : void 0
        }
      });
    }
  }
  if (toolChoice == null) {
    return { tools: openaiTools2, tool_choice: void 0, toolWarnings };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
    case "none":
    case "required":
      return { tools: openaiTools2, tool_choice: type, toolWarnings };
    case "tool":
      return {
        tools: openaiTools2,
        tool_choice: {
          type: "function",
          function: {
            name: toolChoice.toolName
          }
        },
        toolWarnings
      };
    default: {
      const _exhaustiveCheck = type;
      throw new UnsupportedFunctionalityError({
        functionality: `Unsupported tool choice type: ${_exhaustiveCheck}`
      });
    }
  }
}
var OpenAIChatLanguageModel = class {
  constructor(modelId, settings, config) {
    this.specificationVersion = "v1";
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }
  get supportsStructuredOutputs() {
    var _a15;
    return (_a15 = this.settings.structuredOutputs) != null ? _a15 : isReasoningModel(this.modelId);
  }
  get defaultObjectGenerationMode() {
    if (isAudioModel(this.modelId)) {
      return "tool";
    }
    return this.supportsStructuredOutputs ? "json" : "tool";
  }
  get provider() {
    return this.config.provider;
  }
  get supportsImageUrls() {
    return !this.settings.downloadImages;
  }
  getArgs({
    mode,
    prompt,
    maxTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences,
    responseFormat,
    seed,
    providerMetadata
  }) {
    var _a15, _b, _c, _d, _e, _f, _g, _h;
    const type = mode.type;
    const warnings = [];
    if (topK != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "topK"
      });
    }
    if ((responseFormat == null ? void 0 : responseFormat.type) === "json" && responseFormat.schema != null && !this.supportsStructuredOutputs) {
      warnings.push({
        type: "unsupported-setting",
        setting: "responseFormat",
        details: "JSON response format schema is only supported with structuredOutputs"
      });
    }
    const useLegacyFunctionCalling = this.settings.useLegacyFunctionCalling;
    if (useLegacyFunctionCalling && this.settings.parallelToolCalls === true) {
      throw new UnsupportedFunctionalityError({
        functionality: "useLegacyFunctionCalling with parallelToolCalls"
      });
    }
    if (useLegacyFunctionCalling && this.supportsStructuredOutputs) {
      throw new UnsupportedFunctionalityError({
        functionality: "structuredOutputs with useLegacyFunctionCalling"
      });
    }
    const { messages, warnings: messageWarnings } = convertToOpenAIChatMessages(
      {
        prompt,
        useLegacyFunctionCalling,
        systemMessageMode: getSystemMessageMode(this.modelId)
      }
    );
    warnings.push(...messageWarnings);
    const baseArgs = {
      // model id:
      model: this.modelId,
      // model specific settings:
      logit_bias: this.settings.logitBias,
      logprobs: this.settings.logprobs === true || typeof this.settings.logprobs === "number" ? true : void 0,
      top_logprobs: typeof this.settings.logprobs === "number" ? this.settings.logprobs : typeof this.settings.logprobs === "boolean" ? this.settings.logprobs ? 0 : void 0 : void 0,
      user: this.settings.user,
      parallel_tool_calls: this.settings.parallelToolCalls,
      // standardized settings:
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      response_format: (responseFormat == null ? void 0 : responseFormat.type) === "json" ? this.supportsStructuredOutputs && responseFormat.schema != null ? {
        type: "json_schema",
        json_schema: {
          schema: responseFormat.schema,
          strict: true,
          name: (_a15 = responseFormat.name) != null ? _a15 : "response",
          description: responseFormat.description
        }
      } : { type: "json_object" } : void 0,
      stop: stopSequences,
      seed,
      // openai specific settings:
      // TODO remove in next major version; we auto-map maxTokens now
      max_completion_tokens: (_b = providerMetadata == null ? void 0 : providerMetadata.openai) == null ? void 0 : _b.maxCompletionTokens,
      store: (_c = providerMetadata == null ? void 0 : providerMetadata.openai) == null ? void 0 : _c.store,
      metadata: (_d = providerMetadata == null ? void 0 : providerMetadata.openai) == null ? void 0 : _d.metadata,
      prediction: (_e = providerMetadata == null ? void 0 : providerMetadata.openai) == null ? void 0 : _e.prediction,
      reasoning_effort: (_g = (_f = providerMetadata == null ? void 0 : providerMetadata.openai) == null ? void 0 : _f.reasoningEffort) != null ? _g : this.settings.reasoningEffort,
      // messages:
      messages
    };
    if (isReasoningModel(this.modelId)) {
      if (baseArgs.temperature != null) {
        baseArgs.temperature = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "temperature",
          details: "temperature is not supported for reasoning models"
        });
      }
      if (baseArgs.top_p != null) {
        baseArgs.top_p = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "topP",
          details: "topP is not supported for reasoning models"
        });
      }
      if (baseArgs.frequency_penalty != null) {
        baseArgs.frequency_penalty = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "frequencyPenalty",
          details: "frequencyPenalty is not supported for reasoning models"
        });
      }
      if (baseArgs.presence_penalty != null) {
        baseArgs.presence_penalty = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "presencePenalty",
          details: "presencePenalty is not supported for reasoning models"
        });
      }
      if (baseArgs.logit_bias != null) {
        baseArgs.logit_bias = void 0;
        warnings.push({
          type: "other",
          message: "logitBias is not supported for reasoning models"
        });
      }
      if (baseArgs.logprobs != null) {
        baseArgs.logprobs = void 0;
        warnings.push({
          type: "other",
          message: "logprobs is not supported for reasoning models"
        });
      }
      if (baseArgs.top_logprobs != null) {
        baseArgs.top_logprobs = void 0;
        warnings.push({
          type: "other",
          message: "topLogprobs is not supported for reasoning models"
        });
      }
      if (baseArgs.max_tokens != null) {
        if (baseArgs.max_completion_tokens == null) {
          baseArgs.max_completion_tokens = baseArgs.max_tokens;
        }
        baseArgs.max_tokens = void 0;
      }
    } else if (this.modelId.startsWith("gpt-4o-search-preview") || this.modelId.startsWith("gpt-4o-mini-search-preview")) {
      if (baseArgs.temperature != null) {
        baseArgs.temperature = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "temperature",
          details: "temperature is not supported for the search preview models and has been removed."
        });
      }
    }
    switch (type) {
      case "regular": {
        const { tools, tool_choice, functions, function_call, toolWarnings } = prepareTools({
          mode,
          useLegacyFunctionCalling,
          structuredOutputs: this.supportsStructuredOutputs
        });
        return {
          args: {
            ...baseArgs,
            tools,
            tool_choice,
            functions,
            function_call
          },
          warnings: [...warnings, ...toolWarnings]
        };
      }
      case "object-json": {
        return {
          args: {
            ...baseArgs,
            response_format: this.supportsStructuredOutputs && mode.schema != null ? {
              type: "json_schema",
              json_schema: {
                schema: mode.schema,
                strict: true,
                name: (_h = mode.name) != null ? _h : "response",
                description: mode.description
              }
            } : { type: "json_object" }
          },
          warnings
        };
      }
      case "object-tool": {
        return {
          args: useLegacyFunctionCalling ? {
            ...baseArgs,
            function_call: {
              name: mode.tool.name
            },
            functions: [
              {
                name: mode.tool.name,
                description: mode.tool.description,
                parameters: mode.tool.parameters
              }
            ]
          } : {
            ...baseArgs,
            tool_choice: {
              type: "function",
              function: { name: mode.tool.name }
            },
            tools: [
              {
                type: "function",
                function: {
                  name: mode.tool.name,
                  description: mode.tool.description,
                  parameters: mode.tool.parameters,
                  strict: this.supportsStructuredOutputs ? true : void 0
                }
              }
            ]
          },
          warnings
        };
      }
      default: {
        const _exhaustiveCheck = type;
        throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
      }
    }
  }
  async doGenerate(options) {
    var _a15, _b, _c, _d, _e, _f, _g, _h;
    const { args: body, warnings } = this.getArgs(options);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiChatResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const { messages: rawPrompt, ...rawSettings } = body;
    const choice = response.choices[0];
    const completionTokenDetails = (_a15 = response.usage) == null ? void 0 : _a15.completion_tokens_details;
    const promptTokenDetails = (_b = response.usage) == null ? void 0 : _b.prompt_tokens_details;
    const providerMetadata = { openai: {} };
    if ((completionTokenDetails == null ? void 0 : completionTokenDetails.reasoning_tokens) != null) {
      providerMetadata.openai.reasoningTokens = completionTokenDetails == null ? void 0 : completionTokenDetails.reasoning_tokens;
    }
    if ((completionTokenDetails == null ? void 0 : completionTokenDetails.accepted_prediction_tokens) != null) {
      providerMetadata.openai.acceptedPredictionTokens = completionTokenDetails == null ? void 0 : completionTokenDetails.accepted_prediction_tokens;
    }
    if ((completionTokenDetails == null ? void 0 : completionTokenDetails.rejected_prediction_tokens) != null) {
      providerMetadata.openai.rejectedPredictionTokens = completionTokenDetails == null ? void 0 : completionTokenDetails.rejected_prediction_tokens;
    }
    if ((promptTokenDetails == null ? void 0 : promptTokenDetails.cached_tokens) != null) {
      providerMetadata.openai.cachedPromptTokens = promptTokenDetails == null ? void 0 : promptTokenDetails.cached_tokens;
    }
    return {
      text: (_c = choice.message.content) != null ? _c : void 0,
      toolCalls: this.settings.useLegacyFunctionCalling && choice.message.function_call ? [
        {
          toolCallType: "function",
          toolCallId: generateId(),
          toolName: choice.message.function_call.name,
          args: choice.message.function_call.arguments
        }
      ] : (_d = choice.message.tool_calls) == null ? void 0 : _d.map((toolCall) => {
        var _a22;
        return {
          toolCallType: "function",
          toolCallId: (_a22 = toolCall.id) != null ? _a22 : generateId(),
          toolName: toolCall.function.name,
          args: toolCall.function.arguments
        };
      }),
      finishReason: mapOpenAIFinishReason(choice.finish_reason),
      usage: {
        promptTokens: (_f = (_e = response.usage) == null ? void 0 : _e.prompt_tokens) != null ? _f : NaN,
        completionTokens: (_h = (_g = response.usage) == null ? void 0 : _g.completion_tokens) != null ? _h : NaN
      },
      rawCall: { rawPrompt, rawSettings },
      rawResponse: { headers: responseHeaders, body: rawResponse },
      request: { body: JSON.stringify(body) },
      response: getResponseMetadata(response),
      warnings,
      logprobs: mapOpenAIChatLogProbsOutput(choice.logprobs),
      providerMetadata
    };
  }
  async doStream(options) {
    if (this.settings.simulateStreaming) {
      const result = await this.doGenerate(options);
      const simulatedStream = new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "response-metadata", ...result.response });
          if (result.text) {
            controller.enqueue({
              type: "text-delta",
              textDelta: result.text
            });
          }
          if (result.toolCalls) {
            for (const toolCall of result.toolCalls) {
              controller.enqueue({
                type: "tool-call-delta",
                toolCallType: "function",
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                argsTextDelta: toolCall.args
              });
              controller.enqueue({
                type: "tool-call",
                ...toolCall
              });
            }
          }
          controller.enqueue({
            type: "finish",
            finishReason: result.finishReason,
            usage: result.usage,
            logprobs: result.logprobs,
            providerMetadata: result.providerMetadata
          });
          controller.close();
        }
      });
      return {
        stream: simulatedStream,
        rawCall: result.rawCall,
        rawResponse: result.rawResponse,
        warnings: result.warnings
      };
    }
    const { args, warnings } = this.getArgs(options);
    const body = {
      ...args,
      stream: true,
      // only include stream_options when in strict compatibility mode:
      stream_options: this.config.compatibility === "strict" ? { include_usage: true } : void 0
    };
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        openaiChatChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const { messages: rawPrompt, ...rawSettings } = args;
    const toolCalls = [];
    let finishReason = "unknown";
    let usage = {
      promptTokens: void 0,
      completionTokens: void 0
    };
    let logprobs;
    let isFirstChunk = true;
    const { useLegacyFunctionCalling } = this.settings;
    const providerMetadata = { openai: {} };
    return {
      stream: response.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            var _a15, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (isFirstChunk) {
              isFirstChunk = false;
              controller.enqueue({
                type: "response-metadata",
                ...getResponseMetadata(value)
              });
            }
            if (value.usage != null) {
              const {
                prompt_tokens,
                completion_tokens,
                prompt_tokens_details,
                completion_tokens_details
              } = value.usage;
              usage = {
                promptTokens: prompt_tokens != null ? prompt_tokens : void 0,
                completionTokens: completion_tokens != null ? completion_tokens : void 0
              };
              if ((completion_tokens_details == null ? void 0 : completion_tokens_details.reasoning_tokens) != null) {
                providerMetadata.openai.reasoningTokens = completion_tokens_details == null ? void 0 : completion_tokens_details.reasoning_tokens;
              }
              if ((completion_tokens_details == null ? void 0 : completion_tokens_details.accepted_prediction_tokens) != null) {
                providerMetadata.openai.acceptedPredictionTokens = completion_tokens_details == null ? void 0 : completion_tokens_details.accepted_prediction_tokens;
              }
              if ((completion_tokens_details == null ? void 0 : completion_tokens_details.rejected_prediction_tokens) != null) {
                providerMetadata.openai.rejectedPredictionTokens = completion_tokens_details == null ? void 0 : completion_tokens_details.rejected_prediction_tokens;
              }
              if ((prompt_tokens_details == null ? void 0 : prompt_tokens_details.cached_tokens) != null) {
                providerMetadata.openai.cachedPromptTokens = prompt_tokens_details == null ? void 0 : prompt_tokens_details.cached_tokens;
              }
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapOpenAIFinishReason(choice.finish_reason);
            }
            if ((choice == null ? void 0 : choice.delta) == null) {
              return;
            }
            const delta = choice.delta;
            if (delta.content != null) {
              controller.enqueue({
                type: "text-delta",
                textDelta: delta.content
              });
            }
            const mappedLogprobs = mapOpenAIChatLogProbsOutput(
              choice == null ? void 0 : choice.logprobs
            );
            if (mappedLogprobs == null ? void 0 : mappedLogprobs.length) {
              if (logprobs === void 0) logprobs = [];
              logprobs.push(...mappedLogprobs);
            }
            const mappedToolCalls = useLegacyFunctionCalling && delta.function_call != null ? [
              {
                type: "function",
                id: generateId(),
                function: delta.function_call,
                index: 0
              }
            ] : delta.tool_calls;
            if (mappedToolCalls != null) {
              for (const toolCallDelta of mappedToolCalls) {
                const index = toolCallDelta.index;
                if (toolCalls[index] == null) {
                  if (toolCallDelta.type !== "function") {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function' type.`
                    });
                  }
                  if (toolCallDelta.id == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'id' to be a string.`
                    });
                  }
                  if (((_a15 = toolCallDelta.function) == null ? void 0 : _a15.name) == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function.name' to be a string.`
                    });
                  }
                  toolCalls[index] = {
                    id: toolCallDelta.id,
                    type: "function",
                    function: {
                      name: toolCallDelta.function.name,
                      arguments: (_b = toolCallDelta.function.arguments) != null ? _b : ""
                    },
                    hasFinished: false
                  };
                  const toolCall2 = toolCalls[index];
                  if (((_c = toolCall2.function) == null ? void 0 : _c.name) != null && ((_d = toolCall2.function) == null ? void 0 : _d.arguments) != null) {
                    if (toolCall2.function.arguments.length > 0) {
                      controller.enqueue({
                        type: "tool-call-delta",
                        toolCallType: "function",
                        toolCallId: toolCall2.id,
                        toolName: toolCall2.function.name,
                        argsTextDelta: toolCall2.function.arguments
                      });
                    }
                    if (isParsableJson(toolCall2.function.arguments)) {
                      controller.enqueue({
                        type: "tool-call",
                        toolCallType: "function",
                        toolCallId: (_e = toolCall2.id) != null ? _e : generateId(),
                        toolName: toolCall2.function.name,
                        args: toolCall2.function.arguments
                      });
                      toolCall2.hasFinished = true;
                    }
                  }
                  continue;
                }
                const toolCall = toolCalls[index];
                if (toolCall.hasFinished) {
                  continue;
                }
                if (((_f = toolCallDelta.function) == null ? void 0 : _f.arguments) != null) {
                  toolCall.function.arguments += (_h = (_g = toolCallDelta.function) == null ? void 0 : _g.arguments) != null ? _h : "";
                }
                controller.enqueue({
                  type: "tool-call-delta",
                  toolCallType: "function",
                  toolCallId: toolCall.id,
                  toolName: toolCall.function.name,
                  argsTextDelta: (_i = toolCallDelta.function.arguments) != null ? _i : ""
                });
                if (((_j = toolCall.function) == null ? void 0 : _j.name) != null && ((_k = toolCall.function) == null ? void 0 : _k.arguments) != null && isParsableJson(toolCall.function.arguments)) {
                  controller.enqueue({
                    type: "tool-call",
                    toolCallType: "function",
                    toolCallId: (_l = toolCall.id) != null ? _l : generateId(),
                    toolName: toolCall.function.name,
                    args: toolCall.function.arguments
                  });
                  toolCall.hasFinished = true;
                }
              }
            }
          },
          flush(controller) {
            var _a15, _b;
            controller.enqueue({
              type: "finish",
              finishReason,
              logprobs,
              usage: {
                promptTokens: (_a15 = usage.promptTokens) != null ? _a15 : NaN,
                completionTokens: (_b = usage.completionTokens) != null ? _b : NaN
              },
              ...providerMetadata != null ? { providerMetadata } : {}
            });
          }
        })
      ),
      rawCall: { rawPrompt, rawSettings },
      rawResponse: { headers: responseHeaders },
      request: { body: JSON.stringify(body) },
      warnings
    };
  }
};
var openaiTokenUsageSchema = z.object({
  prompt_tokens: z.number().nullish(),
  completion_tokens: z.number().nullish(),
  prompt_tokens_details: z.object({
    cached_tokens: z.number().nullish()
  }).nullish(),
  completion_tokens_details: z.object({
    reasoning_tokens: z.number().nullish(),
    accepted_prediction_tokens: z.number().nullish(),
    rejected_prediction_tokens: z.number().nullish()
  }).nullish()
}).nullish();
var openaiChatResponseSchema = z.object({
  id: z.string().nullish(),
  created: z.number().nullish(),
  model: z.string().nullish(),
  choices: z.array(
    z.object({
      message: z.object({
        role: z.literal("assistant").nullish(),
        content: z.string().nullish(),
        function_call: z.object({
          arguments: z.string(),
          name: z.string()
        }).nullish(),
        tool_calls: z.array(
          z.object({
            id: z.string().nullish(),
            type: z.literal("function"),
            function: z.object({
              name: z.string(),
              arguments: z.string()
            })
          })
        ).nullish()
      }),
      index: z.number(),
      logprobs: z.object({
        content: z.array(
          z.object({
            token: z.string(),
            logprob: z.number(),
            top_logprobs: z.array(
              z.object({
                token: z.string(),
                logprob: z.number()
              })
            )
          })
        ).nullable()
      }).nullish(),
      finish_reason: z.string().nullish()
    })
  ),
  usage: openaiTokenUsageSchema
});
var openaiChatChunkSchema = z.union([
  z.object({
    id: z.string().nullish(),
    created: z.number().nullish(),
    model: z.string().nullish(),
    choices: z.array(
      z.object({
        delta: z.object({
          role: z.enum(["assistant"]).nullish(),
          content: z.string().nullish(),
          function_call: z.object({
            name: z.string().optional(),
            arguments: z.string().optional()
          }).nullish(),
          tool_calls: z.array(
            z.object({
              index: z.number(),
              id: z.string().nullish(),
              type: z.literal("function").nullish(),
              function: z.object({
                name: z.string().nullish(),
                arguments: z.string().nullish()
              })
            })
          ).nullish()
        }).nullish(),
        logprobs: z.object({
          content: z.array(
            z.object({
              token: z.string(),
              logprob: z.number(),
              top_logprobs: z.array(
                z.object({
                  token: z.string(),
                  logprob: z.number()
                })
              )
            })
          ).nullable()
        }).nullish(),
        finish_reason: z.string().nullish(),
        index: z.number()
      })
    ),
    usage: openaiTokenUsageSchema
  }),
  openaiErrorDataSchema
]);
function isReasoningModel(modelId) {
  return modelId.startsWith("o");
}
function isAudioModel(modelId) {
  return modelId.startsWith("gpt-4o-audio-preview");
}
function getSystemMessageMode(modelId) {
  var _a15, _b;
  if (!isReasoningModel(modelId)) {
    return "system";
  }
  return (_b = (_a15 = reasoningModels[modelId]) == null ? void 0 : _a15.systemMessageMode) != null ? _b : "developer";
}
var reasoningModels = {
  "o1-mini": {
    systemMessageMode: "remove"
  },
  "o1-mini-2024-09-12": {
    systemMessageMode: "remove"
  },
  "o1-preview": {
    systemMessageMode: "remove"
  },
  "o1-preview-2024-09-12": {
    systemMessageMode: "remove"
  },
  o3: {
    systemMessageMode: "developer"
  },
  "o3-2025-04-16": {
    systemMessageMode: "developer"
  },
  "o3-mini": {
    systemMessageMode: "developer"
  },
  "o3-mini-2025-01-31": {
    systemMessageMode: "developer"
  },
  "o4-mini": {
    systemMessageMode: "developer"
  },
  "o4-mini-2025-04-16": {
    systemMessageMode: "developer"
  }
};
function convertToOpenAICompletionPrompt({
  prompt,
  inputFormat,
  user = "user",
  assistant = "assistant"
}) {
  if (inputFormat === "prompt" && prompt.length === 1 && prompt[0].role === "user" && prompt[0].content.length === 1 && prompt[0].content[0].type === "text") {
    return { prompt: prompt[0].content[0].text };
  }
  let text = "";
  if (prompt[0].role === "system") {
    text += `${prompt[0].content}

`;
    prompt = prompt.slice(1);
  }
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        throw new InvalidPromptError({
          message: "Unexpected system message in prompt: ${content}",
          prompt
        });
      }
      case "user": {
        const userMessage = content.map((part) => {
          switch (part.type) {
            case "text": {
              return part.text;
            }
            case "image": {
              throw new UnsupportedFunctionalityError({
                functionality: "images"
              });
            }
          }
        }).join("");
        text += `${user}:
${userMessage}

`;
        break;
      }
      case "assistant": {
        const assistantMessage = content.map((part) => {
          switch (part.type) {
            case "text": {
              return part.text;
            }
            case "tool-call": {
              throw new UnsupportedFunctionalityError({
                functionality: "tool-call messages"
              });
            }
          }
        }).join("");
        text += `${assistant}:
${assistantMessage}

`;
        break;
      }
      case "tool": {
        throw new UnsupportedFunctionalityError({
          functionality: "tool messages"
        });
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  text += `${assistant}:
`;
  return {
    prompt: text,
    stopSequences: [`
${user}:`]
  };
}
function mapOpenAICompletionLogProbs(logprobs) {
  return logprobs == null ? void 0 : logprobs.tokens.map((token, index) => ({
    token,
    logprob: logprobs.token_logprobs[index],
    topLogprobs: logprobs.top_logprobs ? Object.entries(logprobs.top_logprobs[index]).map(
      ([token2, logprob]) => ({
        token: token2,
        logprob
      })
    ) : []
  }));
}
var OpenAICompletionLanguageModel = class {
  constructor(modelId, settings, config) {
    this.specificationVersion = "v1";
    this.defaultObjectGenerationMode = void 0;
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  getArgs({
    mode,
    inputFormat,
    prompt,
    maxTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences: userStopSequences,
    responseFormat,
    seed
  }) {
    var _a15;
    const type = mode.type;
    const warnings = [];
    if (topK != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "topK"
      });
    }
    if (responseFormat != null && responseFormat.type !== "text") {
      warnings.push({
        type: "unsupported-setting",
        setting: "responseFormat",
        details: "JSON response format is not supported."
      });
    }
    const { prompt: completionPrompt, stopSequences } = convertToOpenAICompletionPrompt({ prompt, inputFormat });
    const stop = [...stopSequences != null ? stopSequences : [], ...userStopSequences != null ? userStopSequences : []];
    const baseArgs = {
      // model id:
      model: this.modelId,
      // model specific settings:
      echo: this.settings.echo,
      logit_bias: this.settings.logitBias,
      logprobs: typeof this.settings.logprobs === "number" ? this.settings.logprobs : typeof this.settings.logprobs === "boolean" ? this.settings.logprobs ? 0 : void 0 : void 0,
      suffix: this.settings.suffix,
      user: this.settings.user,
      // standardized settings:
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      seed,
      // prompt:
      prompt: completionPrompt,
      // stop sequences:
      stop: stop.length > 0 ? stop : void 0
    };
    switch (type) {
      case "regular": {
        if ((_a15 = mode.tools) == null ? void 0 : _a15.length) {
          throw new UnsupportedFunctionalityError({
            functionality: "tools"
          });
        }
        if (mode.toolChoice) {
          throw new UnsupportedFunctionalityError({
            functionality: "toolChoice"
          });
        }
        return { args: baseArgs, warnings };
      }
      case "object-json": {
        throw new UnsupportedFunctionalityError({
          functionality: "object-json mode"
        });
      }
      case "object-tool": {
        throw new UnsupportedFunctionalityError({
          functionality: "object-tool mode"
        });
      }
      default: {
        const _exhaustiveCheck = type;
        throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
      }
    }
  }
  async doGenerate(options) {
    const { args, warnings } = this.getArgs(options);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiCompletionResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const { prompt: rawPrompt, ...rawSettings } = args;
    const choice = response.choices[0];
    return {
      text: choice.text,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens
      },
      finishReason: mapOpenAIFinishReason(choice.finish_reason),
      logprobs: mapOpenAICompletionLogProbs(choice.logprobs),
      rawCall: { rawPrompt, rawSettings },
      rawResponse: { headers: responseHeaders, body: rawResponse },
      response: getResponseMetadata(response),
      warnings,
      request: { body: JSON.stringify(args) }
    };
  }
  async doStream(options) {
    const { args, warnings } = this.getArgs(options);
    const body = {
      ...args,
      stream: true,
      // only include stream_options when in strict compatibility mode:
      stream_options: this.config.compatibility === "strict" ? { include_usage: true } : void 0
    };
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        openaiCompletionChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const { prompt: rawPrompt, ...rawSettings } = args;
    let finishReason = "unknown";
    let usage = {
      promptTokens: Number.NaN,
      completionTokens: Number.NaN
    };
    let logprobs;
    let isFirstChunk = true;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (isFirstChunk) {
              isFirstChunk = false;
              controller.enqueue({
                type: "response-metadata",
                ...getResponseMetadata(value)
              });
            }
            if (value.usage != null) {
              usage = {
                promptTokens: value.usage.prompt_tokens,
                completionTokens: value.usage.completion_tokens
              };
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapOpenAIFinishReason(choice.finish_reason);
            }
            if ((choice == null ? void 0 : choice.text) != null) {
              controller.enqueue({
                type: "text-delta",
                textDelta: choice.text
              });
            }
            const mappedLogprobs = mapOpenAICompletionLogProbs(
              choice == null ? void 0 : choice.logprobs
            );
            if (mappedLogprobs == null ? void 0 : mappedLogprobs.length) {
              if (logprobs === void 0) logprobs = [];
              logprobs.push(...mappedLogprobs);
            }
          },
          flush(controller) {
            controller.enqueue({
              type: "finish",
              finishReason,
              logprobs,
              usage
            });
          }
        })
      ),
      rawCall: { rawPrompt, rawSettings },
      rawResponse: { headers: responseHeaders },
      warnings,
      request: { body: JSON.stringify(body) }
    };
  }
};
var openaiCompletionResponseSchema = z.object({
  id: z.string().nullish(),
  created: z.number().nullish(),
  model: z.string().nullish(),
  choices: z.array(
    z.object({
      text: z.string(),
      finish_reason: z.string(),
      logprobs: z.object({
        tokens: z.array(z.string()),
        token_logprobs: z.array(z.number()),
        top_logprobs: z.array(z.record(z.string(), z.number())).nullable()
      }).nullish()
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number()
  })
});
var openaiCompletionChunkSchema = z.union([
  z.object({
    id: z.string().nullish(),
    created: z.number().nullish(),
    model: z.string().nullish(),
    choices: z.array(
      z.object({
        text: z.string(),
        finish_reason: z.string().nullish(),
        index: z.number(),
        logprobs: z.object({
          tokens: z.array(z.string()),
          token_logprobs: z.array(z.number()),
          top_logprobs: z.array(z.record(z.string(), z.number())).nullable()
        }).nullish()
      })
    ),
    usage: z.object({
      prompt_tokens: z.number(),
      completion_tokens: z.number()
    }).nullish()
  }),
  openaiErrorDataSchema
]);
var OpenAIEmbeddingModel = class {
  constructor(modelId, settings, config) {
    this.specificationVersion = "v1";
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  get maxEmbeddingsPerCall() {
    var _a15;
    return (_a15 = this.settings.maxEmbeddingsPerCall) != null ? _a15 : 2048;
  }
  get supportsParallelCalls() {
    var _a15;
    return (_a15 = this.settings.supportsParallelCalls) != null ? _a15 : true;
  }
  async doEmbed({
    values,
    headers,
    abortSignal
  }) {
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new TooManyEmbeddingValuesForCallError({
        provider: this.provider,
        modelId: this.modelId,
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        values
      });
    }
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/embeddings",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), headers),
      body: {
        model: this.modelId,
        input: values,
        encoding_format: "float",
        dimensions: this.settings.dimensions,
        user: this.settings.user
      },
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiTextEmbeddingResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      embeddings: response.data.map((item) => item.embedding),
      usage: response.usage ? { tokens: response.usage.prompt_tokens } : void 0,
      rawResponse: { headers: responseHeaders }
    };
  }
};
var openaiTextEmbeddingResponseSchema = z.object({
  data: z.array(z.object({ embedding: z.array(z.number()) })),
  usage: z.object({ prompt_tokens: z.number() }).nullish()
});
var modelMaxImagesPerCall = {
  "dall-e-3": 1,
  "dall-e-2": 10,
  "gpt-image-1": 10
};
var hasDefaultResponseFormat = /* @__PURE__ */ new Set(["gpt-image-1"]);
var OpenAIImageModel = class {
  constructor(modelId, settings, config) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
    this.specificationVersion = "v1";
  }
  get maxImagesPerCall() {
    var _a15, _b;
    return (_b = (_a15 = this.settings.maxImagesPerCall) != null ? _a15 : modelMaxImagesPerCall[this.modelId]) != null ? _b : 1;
  }
  get provider() {
    return this.config.provider;
  }
  async doGenerate({
    prompt,
    n,
    size,
    aspectRatio,
    seed,
    providerOptions,
    headers,
    abortSignal
  }) {
    var _a15, _b, _c, _d;
    const warnings = [];
    if (aspectRatio != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "aspectRatio",
        details: "This model does not support aspect ratio. Use `size` instead."
      });
    }
    if (seed != null) {
      warnings.push({ type: "unsupported-setting", setting: "seed" });
    }
    const currentDate = (_c = (_b = (_a15 = this.config._internal) == null ? void 0 : _a15.currentDate) == null ? void 0 : _b.call(_a15)) != null ? _c : /* @__PURE__ */ new Date();
    const { value: response, responseHeaders } = await postJsonToApi({
      url: this.config.url({
        path: "/images/generations",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), headers),
      body: {
        model: this.modelId,
        prompt,
        n,
        size,
        ...(_d = providerOptions.openai) != null ? _d : {},
        ...!hasDefaultResponseFormat.has(this.modelId) ? { response_format: "b64_json" } : {}
      },
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiImageResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      images: response.data.map((item) => item.b64_json),
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders
      }
    };
  }
};
var openaiImageResponseSchema = z.object({
  data: z.array(z.object({ b64_json: z.string() }))
});
var openAIProviderOptionsSchema = z.object({
  include: z.array(z.string()).nullish(),
  language: z.string().nullish(),
  prompt: z.string().nullish(),
  temperature: z.number().min(0).max(1).nullish().default(0),
  timestampGranularities: z.array(z.enum(["word", "segment"])).nullish().default(["segment"])
});
var languageMap = {
  afrikaans: "af",
  arabic: "ar",
  armenian: "hy",
  azerbaijani: "az",
  belarusian: "be",
  bosnian: "bs",
  bulgarian: "bg",
  catalan: "ca",
  chinese: "zh",
  croatian: "hr",
  czech: "cs",
  danish: "da",
  dutch: "nl",
  english: "en",
  estonian: "et",
  finnish: "fi",
  french: "fr",
  galician: "gl",
  german: "de",
  greek: "el",
  hebrew: "he",
  hindi: "hi",
  hungarian: "hu",
  icelandic: "is",
  indonesian: "id",
  italian: "it",
  japanese: "ja",
  kannada: "kn",
  kazakh: "kk",
  korean: "ko",
  latvian: "lv",
  lithuanian: "lt",
  macedonian: "mk",
  malay: "ms",
  marathi: "mr",
  maori: "mi",
  nepali: "ne",
  norwegian: "no",
  persian: "fa",
  polish: "pl",
  portuguese: "pt",
  romanian: "ro",
  russian: "ru",
  serbian: "sr",
  slovak: "sk",
  slovenian: "sl",
  spanish: "es",
  swahili: "sw",
  swedish: "sv",
  tagalog: "tl",
  tamil: "ta",
  thai: "th",
  turkish: "tr",
  ukrainian: "uk",
  urdu: "ur",
  vietnamese: "vi",
  welsh: "cy"
};
var OpenAITranscriptionModel = class {
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v1";
  }
  get provider() {
    return this.config.provider;
  }
  getArgs({
    audio,
    mediaType,
    providerOptions
  }) {
    var _a15, _b, _c, _d, _e;
    const warnings = [];
    const openAIOptions = parseProviderOptions({
      provider: "openai",
      providerOptions,
      schema: openAIProviderOptionsSchema
    });
    const formData = new FormData();
    const blob = audio instanceof Uint8Array ? new Blob([audio]) : new Blob([convertBase64ToUint8Array(audio)]);
    formData.append("model", this.modelId);
    formData.append("file", new File([blob], "audio", { type: mediaType }));
    if (openAIOptions) {
      const transcriptionModelOptions = {
        include: (_a15 = openAIOptions.include) != null ? _a15 : void 0,
        language: (_b = openAIOptions.language) != null ? _b : void 0,
        prompt: (_c = openAIOptions.prompt) != null ? _c : void 0,
        temperature: (_d = openAIOptions.temperature) != null ? _d : void 0,
        timestamp_granularities: (_e = openAIOptions.timestampGranularities) != null ? _e : void 0
      };
      for (const key in transcriptionModelOptions) {
        const value = transcriptionModelOptions[key];
        if (value !== void 0) {
          formData.append(key, String(value));
        }
      }
    }
    return {
      formData,
      warnings
    };
  }
  async doGenerate(options) {
    var _a15, _b, _c, _d, _e, _f;
    const currentDate = (_c = (_b = (_a15 = this.config._internal) == null ? void 0 : _a15.currentDate) == null ? void 0 : _b.call(_a15)) != null ? _c : /* @__PURE__ */ new Date();
    const { formData, warnings } = this.getArgs(options);
    const {
      value: response,
      responseHeaders,
      rawValue: rawResponse
    } = await postFormDataToApi({
      url: this.config.url({
        path: "/audio/transcriptions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      formData,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiTranscriptionResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const language = response.language != null && response.language in languageMap ? languageMap[response.language] : void 0;
    return {
      text: response.text,
      segments: (_e = (_d = response.words) == null ? void 0 : _d.map((word) => ({
        text: word.word,
        startSecond: word.start,
        endSecond: word.end
      }))) != null ? _e : [],
      language,
      durationInSeconds: (_f = response.duration) != null ? _f : void 0,
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders,
        body: rawResponse
      }
    };
  }
};
var openaiTranscriptionResponseSchema = z.object({
  text: z.string(),
  language: z.string().nullish(),
  duration: z.number().nullish(),
  words: z.array(
    z.object({
      word: z.string(),
      start: z.number(),
      end: z.number()
    })
  ).nullish()
});
function convertToOpenAIResponsesMessages({
  prompt,
  systemMessageMode
}) {
  const messages = [];
  const warnings = [];
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        switch (systemMessageMode) {
          case "system": {
            messages.push({ role: "system", content });
            break;
          }
          case "developer": {
            messages.push({ role: "developer", content });
            break;
          }
          case "remove": {
            warnings.push({
              type: "other",
              message: "system messages are removed for this model"
            });
            break;
          }
          default: {
            const _exhaustiveCheck = systemMessageMode;
            throw new Error(
              `Unsupported system message mode: ${_exhaustiveCheck}`
            );
          }
        }
        break;
      }
      case "user": {
        messages.push({
          role: "user",
          content: content.map((part, index) => {
            var _a15, _b, _c, _d;
            switch (part.type) {
              case "text": {
                return { type: "input_text", text: part.text };
              }
              case "image": {
                return {
                  type: "input_image",
                  image_url: part.image instanceof URL ? part.image.toString() : `data:${(_a15 = part.mimeType) != null ? _a15 : "image/jpeg"};base64,${convertUint8ArrayToBase64(part.image)}`,
                  // OpenAI specific extension: image detail
                  detail: (_c = (_b = part.providerMetadata) == null ? void 0 : _b.openai) == null ? void 0 : _c.imageDetail
                };
              }
              case "file": {
                if (part.data instanceof URL) {
                  throw new UnsupportedFunctionalityError({
                    functionality: "File URLs in user messages"
                  });
                }
                switch (part.mimeType) {
                  case "application/pdf": {
                    return {
                      type: "input_file",
                      filename: (_d = part.filename) != null ? _d : `part-${index}.pdf`,
                      file_data: `data:application/pdf;base64,${part.data}`
                    };
                  }
                  default: {
                    throw new UnsupportedFunctionalityError({
                      functionality: "Only PDF files are supported in user messages"
                    });
                  }
                }
              }
            }
          })
        });
        break;
      }
      case "assistant": {
        for (const part of content) {
          switch (part.type) {
            case "text": {
              messages.push({
                role: "assistant",
                content: [{ type: "output_text", text: part.text }]
              });
              break;
            }
            case "tool-call": {
              messages.push({
                type: "function_call",
                call_id: part.toolCallId,
                name: part.toolName,
                arguments: JSON.stringify(part.args)
              });
              break;
            }
          }
        }
        break;
      }
      case "tool": {
        for (const part of content) {
          messages.push({
            type: "function_call_output",
            call_id: part.toolCallId,
            output: JSON.stringify(part.result)
          });
        }
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return { messages, warnings };
}
function mapOpenAIResponseFinishReason({
  finishReason,
  hasToolCalls
}) {
  switch (finishReason) {
    case void 0:
    case null:
      return hasToolCalls ? "tool-calls" : "stop";
    case "max_output_tokens":
      return "length";
    case "content_filter":
      return "content-filter";
    default:
      return hasToolCalls ? "tool-calls" : "unknown";
  }
}
function prepareResponsesTools({
  mode,
  strict
}) {
  var _a15;
  const tools = ((_a15 = mode.tools) == null ? void 0 : _a15.length) ? mode.tools : void 0;
  const toolWarnings = [];
  if (tools == null) {
    return { tools: void 0, tool_choice: void 0, toolWarnings };
  }
  const toolChoice = mode.toolChoice;
  const openaiTools2 = [];
  for (const tool of tools) {
    switch (tool.type) {
      case "function":
        openaiTools2.push({
          type: "function",
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
          strict: strict ? true : void 0
        });
        break;
      case "provider-defined":
        switch (tool.id) {
          case "openai.web_search_preview":
            openaiTools2.push({
              type: "web_search_preview",
              search_context_size: tool.args.searchContextSize,
              user_location: tool.args.userLocation
            });
            break;
          default:
            toolWarnings.push({ type: "unsupported-tool", tool });
            break;
        }
        break;
      default:
        toolWarnings.push({ type: "unsupported-tool", tool });
        break;
    }
  }
  if (toolChoice == null) {
    return { tools: openaiTools2, tool_choice: void 0, toolWarnings };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
    case "none":
    case "required":
      return { tools: openaiTools2, tool_choice: type, toolWarnings };
    case "tool": {
      if (toolChoice.toolName === "web_search_preview") {
        return {
          tools: openaiTools2,
          tool_choice: {
            type: "web_search_preview"
          },
          toolWarnings
        };
      }
      return {
        tools: openaiTools2,
        tool_choice: {
          type: "function",
          name: toolChoice.toolName
        },
        toolWarnings
      };
    }
    default: {
      const _exhaustiveCheck = type;
      throw new UnsupportedFunctionalityError({
        functionality: `Unsupported tool choice type: ${_exhaustiveCheck}`
      });
    }
  }
}
var OpenAIResponsesLanguageModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v1";
    this.defaultObjectGenerationMode = "json";
    this.supportsStructuredOutputs = true;
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  getArgs({
    mode,
    maxTokens,
    temperature,
    stopSequences,
    topP,
    topK,
    presencePenalty,
    frequencyPenalty,
    seed,
    prompt,
    providerMetadata,
    responseFormat
  }) {
    var _a15, _b, _c;
    const warnings = [];
    const modelConfig = getResponsesModelConfig(this.modelId);
    const type = mode.type;
    if (topK != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "topK"
      });
    }
    if (seed != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "seed"
      });
    }
    if (presencePenalty != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "presencePenalty"
      });
    }
    if (frequencyPenalty != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "frequencyPenalty"
      });
    }
    if (stopSequences != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "stopSequences"
      });
    }
    const { messages, warnings: messageWarnings } = convertToOpenAIResponsesMessages({
      prompt,
      systemMessageMode: modelConfig.systemMessageMode
    });
    warnings.push(...messageWarnings);
    const openaiOptions = parseProviderOptions({
      provider: "openai",
      providerOptions: providerMetadata,
      schema: openaiResponsesProviderOptionsSchema
    });
    const isStrict = (_a15 = openaiOptions == null ? void 0 : openaiOptions.strictSchemas) != null ? _a15 : true;
    const baseArgs = {
      model: this.modelId,
      input: messages,
      temperature,
      top_p: topP,
      max_output_tokens: maxTokens,
      ...(responseFormat == null ? void 0 : responseFormat.type) === "json" && {
        text: {
          format: responseFormat.schema != null ? {
            type: "json_schema",
            strict: isStrict,
            name: (_b = responseFormat.name) != null ? _b : "response",
            description: responseFormat.description,
            schema: responseFormat.schema
          } : { type: "json_object" }
        }
      },
      // provider options:
      metadata: openaiOptions == null ? void 0 : openaiOptions.metadata,
      parallel_tool_calls: openaiOptions == null ? void 0 : openaiOptions.parallelToolCalls,
      previous_response_id: openaiOptions == null ? void 0 : openaiOptions.previousResponseId,
      store: openaiOptions == null ? void 0 : openaiOptions.store,
      user: openaiOptions == null ? void 0 : openaiOptions.user,
      instructions: openaiOptions == null ? void 0 : openaiOptions.instructions,
      // model-specific settings:
      ...modelConfig.isReasoningModel && ((openaiOptions == null ? void 0 : openaiOptions.reasoningEffort) != null || (openaiOptions == null ? void 0 : openaiOptions.reasoningSummary) != null) && {
        reasoning: {
          ...(openaiOptions == null ? void 0 : openaiOptions.reasoningEffort) != null && {
            effort: openaiOptions.reasoningEffort
          },
          ...(openaiOptions == null ? void 0 : openaiOptions.reasoningSummary) != null && {
            summary: openaiOptions.reasoningSummary
          }
        }
      },
      ...modelConfig.requiredAutoTruncation && {
        truncation: "auto"
      }
    };
    if (modelConfig.isReasoningModel) {
      if (baseArgs.temperature != null) {
        baseArgs.temperature = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "temperature",
          details: "temperature is not supported for reasoning models"
        });
      }
      if (baseArgs.top_p != null) {
        baseArgs.top_p = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "topP",
          details: "topP is not supported for reasoning models"
        });
      }
    }
    switch (type) {
      case "regular": {
        const { tools, tool_choice, toolWarnings } = prepareResponsesTools({
          mode,
          strict: isStrict
          // TODO support provider options on tools
        });
        return {
          args: {
            ...baseArgs,
            tools,
            tool_choice
          },
          warnings: [...warnings, ...toolWarnings]
        };
      }
      case "object-json": {
        return {
          args: {
            ...baseArgs,
            text: {
              format: mode.schema != null ? {
                type: "json_schema",
                strict: isStrict,
                name: (_c = mode.name) != null ? _c : "response",
                description: mode.description,
                schema: mode.schema
              } : { type: "json_object" }
            }
          },
          warnings
        };
      }
      case "object-tool": {
        return {
          args: {
            ...baseArgs,
            tool_choice: { type: "function", name: mode.tool.name },
            tools: [
              {
                type: "function",
                name: mode.tool.name,
                description: mode.tool.description,
                parameters: mode.tool.parameters,
                strict: isStrict
              }
            ]
          },
          warnings
        };
      }
      default: {
        const _exhaustiveCheck = type;
        throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
      }
    }
  }
  async doGenerate(options) {
    var _a15, _b, _c, _d, _e, _f, _g;
    const { args: body, warnings } = this.getArgs(options);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi({
      url: this.config.url({
        path: "/responses",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        z.object({
          id: z.string(),
          created_at: z.number(),
          model: z.string(),
          output: z.array(
            z.discriminatedUnion("type", [
              z.object({
                type: z.literal("message"),
                role: z.literal("assistant"),
                content: z.array(
                  z.object({
                    type: z.literal("output_text"),
                    text: z.string(),
                    annotations: z.array(
                      z.object({
                        type: z.literal("url_citation"),
                        start_index: z.number(),
                        end_index: z.number(),
                        url: z.string(),
                        title: z.string()
                      })
                    )
                  })
                )
              }),
              z.object({
                type: z.literal("function_call"),
                call_id: z.string(),
                name: z.string(),
                arguments: z.string()
              }),
              z.object({
                type: z.literal("web_search_call")
              }),
              z.object({
                type: z.literal("computer_call")
              }),
              z.object({
                type: z.literal("reasoning"),
                summary: z.array(
                  z.object({
                    type: z.literal("summary_text"),
                    text: z.string()
                  })
                )
              })
            ])
          ),
          incomplete_details: z.object({ reason: z.string() }).nullable(),
          usage: usageSchema
        })
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const outputTextElements = response.output.filter((output) => output.type === "message").flatMap((output) => output.content).filter((content) => content.type === "output_text");
    const toolCalls = response.output.filter((output) => output.type === "function_call").map((output) => ({
      toolCallType: "function",
      toolCallId: output.call_id,
      toolName: output.name,
      args: output.arguments
    }));
    const reasoningSummary = (_b = (_a15 = response.output.find((item) => item.type === "reasoning")) == null ? void 0 : _a15.summary) != null ? _b : null;
    return {
      text: outputTextElements.map((content) => content.text).join("\n"),
      sources: outputTextElements.flatMap(
        (content) => content.annotations.map((annotation) => {
          var _a22, _b2, _c2;
          return {
            sourceType: "url",
            id: (_c2 = (_b2 = (_a22 = this.config).generateId) == null ? void 0 : _b2.call(_a22)) != null ? _c2 : generateId(),
            url: annotation.url,
            title: annotation.title
          };
        })
      ),
      finishReason: mapOpenAIResponseFinishReason({
        finishReason: (_c = response.incomplete_details) == null ? void 0 : _c.reason,
        hasToolCalls: toolCalls.length > 0
      }),
      toolCalls: toolCalls.length > 0 ? toolCalls : void 0,
      reasoning: reasoningSummary ? reasoningSummary.map((summary) => ({
        type: "text",
        text: summary.text
      })) : void 0,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      },
      rawCall: {
        rawPrompt: void 0,
        rawSettings: {}
      },
      rawResponse: {
        headers: responseHeaders,
        body: rawResponse
      },
      request: {
        body: JSON.stringify(body)
      },
      response: {
        id: response.id,
        timestamp: new Date(response.created_at * 1e3),
        modelId: response.model
      },
      providerMetadata: {
        openai: {
          responseId: response.id,
          cachedPromptTokens: (_e = (_d = response.usage.input_tokens_details) == null ? void 0 : _d.cached_tokens) != null ? _e : null,
          reasoningTokens: (_g = (_f = response.usage.output_tokens_details) == null ? void 0 : _f.reasoning_tokens) != null ? _g : null
        }
      },
      warnings
    };
  }
  async doStream(options) {
    const { args: body, warnings } = this.getArgs(options);
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/responses",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: {
        ...body,
        stream: true
      },
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        openaiResponsesChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const self = this;
    let finishReason = "unknown";
    let promptTokens = NaN;
    let completionTokens = NaN;
    let cachedPromptTokens = null;
    let reasoningTokens = null;
    let responseId = null;
    const ongoingToolCalls = {};
    let hasToolCalls = false;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            var _a15, _b, _c, _d, _e, _f, _g, _h;
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if (isResponseOutputItemAddedChunk(value)) {
              if (value.item.type === "function_call") {
                ongoingToolCalls[value.output_index] = {
                  toolName: value.item.name,
                  toolCallId: value.item.call_id
                };
                controller.enqueue({
                  type: "tool-call-delta",
                  toolCallType: "function",
                  toolCallId: value.item.call_id,
                  toolName: value.item.name,
                  argsTextDelta: value.item.arguments
                });
              }
            } else if (isResponseFunctionCallArgumentsDeltaChunk(value)) {
              const toolCall = ongoingToolCalls[value.output_index];
              if (toolCall != null) {
                controller.enqueue({
                  type: "tool-call-delta",
                  toolCallType: "function",
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  argsTextDelta: value.delta
                });
              }
            } else if (isResponseCreatedChunk(value)) {
              responseId = value.response.id;
              controller.enqueue({
                type: "response-metadata",
                id: value.response.id,
                timestamp: new Date(value.response.created_at * 1e3),
                modelId: value.response.model
              });
            } else if (isTextDeltaChunk(value)) {
              controller.enqueue({
                type: "text-delta",
                textDelta: value.delta
              });
            } else if (isResponseReasoningSummaryTextDeltaChunk(value)) {
              controller.enqueue({
                type: "reasoning",
                textDelta: value.delta
              });
            } else if (isResponseOutputItemDoneChunk(value) && value.item.type === "function_call") {
              ongoingToolCalls[value.output_index] = void 0;
              hasToolCalls = true;
              controller.enqueue({
                type: "tool-call",
                toolCallType: "function",
                toolCallId: value.item.call_id,
                toolName: value.item.name,
                args: value.item.arguments
              });
            } else if (isResponseFinishedChunk(value)) {
              finishReason = mapOpenAIResponseFinishReason({
                finishReason: (_a15 = value.response.incomplete_details) == null ? void 0 : _a15.reason,
                hasToolCalls
              });
              promptTokens = value.response.usage.input_tokens;
              completionTokens = value.response.usage.output_tokens;
              cachedPromptTokens = (_c = (_b = value.response.usage.input_tokens_details) == null ? void 0 : _b.cached_tokens) != null ? _c : cachedPromptTokens;
              reasoningTokens = (_e = (_d = value.response.usage.output_tokens_details) == null ? void 0 : _d.reasoning_tokens) != null ? _e : reasoningTokens;
            } else if (isResponseAnnotationAddedChunk(value)) {
              controller.enqueue({
                type: "source",
                source: {
                  sourceType: "url",
                  id: (_h = (_g = (_f = self.config).generateId) == null ? void 0 : _g.call(_f)) != null ? _h : generateId(),
                  url: value.annotation.url,
                  title: value.annotation.title
                }
              });
            }
          },
          flush(controller) {
            controller.enqueue({
              type: "finish",
              finishReason,
              usage: { promptTokens, completionTokens },
              ...(cachedPromptTokens != null || reasoningTokens != null) && {
                providerMetadata: {
                  openai: {
                    responseId,
                    cachedPromptTokens,
                    reasoningTokens
                  }
                }
              }
            });
          }
        })
      ),
      rawCall: {
        rawPrompt: void 0,
        rawSettings: {}
      },
      rawResponse: { headers: responseHeaders },
      request: { body: JSON.stringify(body) },
      warnings
    };
  }
};
var usageSchema = z.object({
  input_tokens: z.number(),
  input_tokens_details: z.object({ cached_tokens: z.number().nullish() }).nullish(),
  output_tokens: z.number(),
  output_tokens_details: z.object({ reasoning_tokens: z.number().nullish() }).nullish()
});
var textDeltaChunkSchema = z.object({
  type: z.literal("response.output_text.delta"),
  delta: z.string()
});
var responseFinishedChunkSchema = z.object({
  type: z.enum(["response.completed", "response.incomplete"]),
  response: z.object({
    incomplete_details: z.object({ reason: z.string() }).nullish(),
    usage: usageSchema
  })
});
var responseCreatedChunkSchema = z.object({
  type: z.literal("response.created"),
  response: z.object({
    id: z.string(),
    created_at: z.number(),
    model: z.string()
  })
});
var responseOutputItemDoneSchema = z.object({
  type: z.literal("response.output_item.done"),
  output_index: z.number(),
  item: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("message")
    }),
    z.object({
      type: z.literal("function_call"),
      id: z.string(),
      call_id: z.string(),
      name: z.string(),
      arguments: z.string(),
      status: z.literal("completed")
    })
  ])
});
var responseFunctionCallArgumentsDeltaSchema = z.object({
  type: z.literal("response.function_call_arguments.delta"),
  item_id: z.string(),
  output_index: z.number(),
  delta: z.string()
});
var responseOutputItemAddedSchema = z.object({
  type: z.literal("response.output_item.added"),
  output_index: z.number(),
  item: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("message")
    }),
    z.object({
      type: z.literal("function_call"),
      id: z.string(),
      call_id: z.string(),
      name: z.string(),
      arguments: z.string()
    })
  ])
});
var responseAnnotationAddedSchema = z.object({
  type: z.literal("response.output_text.annotation.added"),
  annotation: z.object({
    type: z.literal("url_citation"),
    url: z.string(),
    title: z.string()
  })
});
var responseReasoningSummaryTextDeltaSchema = z.object({
  type: z.literal("response.reasoning_summary_text.delta"),
  item_id: z.string(),
  output_index: z.number(),
  summary_index: z.number(),
  delta: z.string()
});
var openaiResponsesChunkSchema = z.union([
  textDeltaChunkSchema,
  responseFinishedChunkSchema,
  responseCreatedChunkSchema,
  responseOutputItemDoneSchema,
  responseFunctionCallArgumentsDeltaSchema,
  responseOutputItemAddedSchema,
  responseAnnotationAddedSchema,
  responseReasoningSummaryTextDeltaSchema,
  z.object({ type: z.string() }).passthrough()
  // fallback for unknown chunks
]);
function isTextDeltaChunk(chunk) {
  return chunk.type === "response.output_text.delta";
}
function isResponseOutputItemDoneChunk(chunk) {
  return chunk.type === "response.output_item.done";
}
function isResponseFinishedChunk(chunk) {
  return chunk.type === "response.completed" || chunk.type === "response.incomplete";
}
function isResponseCreatedChunk(chunk) {
  return chunk.type === "response.created";
}
function isResponseFunctionCallArgumentsDeltaChunk(chunk) {
  return chunk.type === "response.function_call_arguments.delta";
}
function isResponseOutputItemAddedChunk(chunk) {
  return chunk.type === "response.output_item.added";
}
function isResponseAnnotationAddedChunk(chunk) {
  return chunk.type === "response.output_text.annotation.added";
}
function isResponseReasoningSummaryTextDeltaChunk(chunk) {
  return chunk.type === "response.reasoning_summary_text.delta";
}
function getResponsesModelConfig(modelId) {
  if (modelId.startsWith("o")) {
    if (modelId.startsWith("o1-mini") || modelId.startsWith("o1-preview")) {
      return {
        isReasoningModel: true,
        systemMessageMode: "remove",
        requiredAutoTruncation: false
      };
    }
    return {
      isReasoningModel: true,
      systemMessageMode: "developer",
      requiredAutoTruncation: false
    };
  }
  return {
    isReasoningModel: false,
    systemMessageMode: "system",
    requiredAutoTruncation: false
  };
}
var openaiResponsesProviderOptionsSchema = z.object({
  metadata: z.any().nullish(),
  parallelToolCalls: z.boolean().nullish(),
  previousResponseId: z.string().nullish(),
  store: z.boolean().nullish(),
  user: z.string().nullish(),
  reasoningEffort: z.string().nullish(),
  strictSchemas: z.boolean().nullish(),
  instructions: z.string().nullish(),
  reasoningSummary: z.string().nullish()
});
var WebSearchPreviewParameters = z.object({});
function webSearchPreviewTool({
  searchContextSize,
  userLocation
} = {}) {
  return {
    type: "provider-defined",
    id: "openai.web_search_preview",
    args: {
      searchContextSize,
      userLocation
    },
    parameters: WebSearchPreviewParameters
  };
}
var openaiTools = {
  webSearchPreview: webSearchPreviewTool
};
var OpenAIProviderOptionsSchema = z.object({
  instructions: z.string().nullish(),
  speed: z.number().min(0.25).max(4).default(1).nullish()
});
var OpenAISpeechModel = class {
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v1";
  }
  get provider() {
    return this.config.provider;
  }
  getArgs({
    text,
    voice = "alloy",
    outputFormat = "mp3",
    speed,
    instructions,
    providerOptions
  }) {
    const warnings = [];
    const openAIOptions = parseProviderOptions({
      provider: "openai",
      providerOptions,
      schema: OpenAIProviderOptionsSchema
    });
    const requestBody = {
      model: this.modelId,
      input: text,
      voice,
      response_format: "mp3",
      speed,
      instructions
    };
    if (outputFormat) {
      if (["mp3", "opus", "aac", "flac", "wav", "pcm"].includes(outputFormat)) {
        requestBody.response_format = outputFormat;
      } else {
        warnings.push({
          type: "unsupported-setting",
          setting: "outputFormat",
          details: `Unsupported output format: ${outputFormat}. Using mp3 instead.`
        });
      }
    }
    if (openAIOptions) {
      const speechModelOptions = {};
      for (const key in speechModelOptions) {
        const value = speechModelOptions[key];
        if (value !== void 0) {
          requestBody[key] = value;
        }
      }
    }
    return {
      requestBody,
      warnings
    };
  }
  async doGenerate(options) {
    var _a15, _b, _c;
    const currentDate = (_c = (_b = (_a15 = this.config._internal) == null ? void 0 : _a15.currentDate) == null ? void 0 : _b.call(_a15)) != null ? _c : /* @__PURE__ */ new Date();
    const { requestBody, warnings } = this.getArgs(options);
    const {
      value: audio,
      responseHeaders,
      rawValue: rawResponse
    } = await postJsonToApi({
      url: this.config.url({
        path: "/audio/speech",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: requestBody,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createBinaryResponseHandler(),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    return {
      audio,
      warnings,
      request: {
        body: JSON.stringify(requestBody)
      },
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders,
        body: rawResponse
      }
    };
  }
};
function createOpenAI(options = {}) {
  var _a15, _b, _c;
  const baseURL = (_a15 = withoutTrailingSlash(options.baseURL)) != null ? _a15 : "https://api.openai.com/v1";
  const compatibility = (_b = options.compatibility) != null ? _b : "compatible";
  const providerName = (_c = options.name) != null ? _c : "openai";
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: "OPENAI_API_KEY",
      description: "OpenAI"
    })}`,
    "OpenAI-Organization": options.organization,
    "OpenAI-Project": options.project,
    ...options.headers
  });
  const createChatModel = (modelId, settings = {}) => new OpenAIChatLanguageModel(modelId, settings, {
    provider: `${providerName}.chat`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    compatibility,
    fetch: options.fetch
  });
  const createCompletionModel = (modelId, settings = {}) => new OpenAICompletionLanguageModel(modelId, settings, {
    provider: `${providerName}.completion`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    compatibility,
    fetch: options.fetch
  });
  const createEmbeddingModel = (modelId, settings = {}) => new OpenAIEmbeddingModel(modelId, settings, {
    provider: `${providerName}.embedding`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch
  });
  const createImageModel = (modelId, settings = {}) => new OpenAIImageModel(modelId, settings, {
    provider: `${providerName}.image`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch
  });
  const createTranscriptionModel = (modelId) => new OpenAITranscriptionModel(modelId, {
    provider: `${providerName}.transcription`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch
  });
  const createSpeechModel = (modelId) => new OpenAISpeechModel(modelId, {
    provider: `${providerName}.speech`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch
  });
  const createLanguageModel = (modelId, settings) => {
    if (new.target) {
      throw new Error(
        "The OpenAI model function cannot be called with the new keyword."
      );
    }
    if (modelId === "gpt-3.5-turbo-instruct") {
      return createCompletionModel(
        modelId,
        settings
      );
    }
    return createChatModel(modelId, settings);
  };
  const createResponsesModel = (modelId) => {
    return new OpenAIResponsesLanguageModel(modelId, {
      provider: `${providerName}.responses`,
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch
    });
  };
  const provider = function(modelId, settings) {
    return createLanguageModel(modelId, settings);
  };
  provider.languageModel = createLanguageModel;
  provider.chat = createChatModel;
  provider.completion = createCompletionModel;
  provider.responses = createResponsesModel;
  provider.embedding = createEmbeddingModel;
  provider.textEmbedding = createEmbeddingModel;
  provider.textEmbeddingModel = createEmbeddingModel;
  provider.image = createImageModel;
  provider.imageModel = createImageModel;
  provider.transcription = createTranscriptionModel;
  provider.transcriptionModel = createTranscriptionModel;
  provider.speech = createSpeechModel;
  provider.speechModel = createSpeechModel;
  provider.tools = openaiTools;
  return provider;
}
createOpenAI({
  compatibility: "strict"
  // strict for OpenAI API
});

// src/document/extractors/types.ts
var STRIP_REGEX = /(\r\n|\n|\r)/gm;
var openai2 = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
var baseLLM = openai2("gpt-4o");

// src/document/extractors/title.ts
var TitleExtractor = class extends BaseExtractor {
  llm;
  isTextNodeOnly = false;
  nodes = 5;
  nodeTemplate;
  combineTemplate;
  constructor(options) {
    super();
    this.llm = options?.llm ?? baseLLM;
    this.nodes = options?.nodes ?? 5;
    this.nodeTemplate = options?.nodeTemplate ? new PromptTemplate({
      templateVars: ["context"],
      template: options.nodeTemplate
    }) : defaultTitleExtractorPromptTemplate;
    this.combineTemplate = options?.combineTemplate ? new PromptTemplate({
      templateVars: ["context"],
      template: options.combineTemplate
    }) : defaultTitleCombinePromptTemplate;
  }
  /**
   * Extract titles from a list of nodes.
   * @param {BaseNode[]} nodes Nodes to extract titles from.
   * @returns {Promise<BaseNode<ExtractTitle>[]>} Titles extracted from the nodes.
   */
  async extract(nodes) {
    const results = new Array(nodes.length);
    const nodesToExtractTitle = [];
    const nodeIndexes = [];
    nodes.forEach((node, idx) => {
      const text = node.getContent();
      if (!text || text.trim() === "") {
        results[idx] = { documentTitle: "" };
      } else {
        nodesToExtractTitle.push(node);
        nodeIndexes.push(idx);
      }
    });
    if (nodesToExtractTitle.length) {
      const filteredNodes = this.filterNodes(nodesToExtractTitle);
      if (filteredNodes.length) {
        const nodesByDocument = this.separateNodesByDocument(filteredNodes);
        const titlesByDocument = await this.extractTitles(nodesByDocument);
        filteredNodes.forEach((node, i) => {
          const nodeIndex = nodeIndexes[i];
          const groupKey = node.sourceNode?.nodeId ?? node.id_;
          if (typeof nodeIndex === "number") {
            results[nodeIndex] = {
              documentTitle: titlesByDocument[groupKey] ?? ""
            };
          }
        });
      }
    }
    return results;
  }
  filterNodes(nodes) {
    return nodes.filter((node) => {
      if (this.isTextNodeOnly && !(node instanceof TextNode)) {
        return false;
      }
      return true;
    });
  }
  separateNodesByDocument(nodes) {
    const nodesByDocument = {};
    for (const node of nodes) {
      const groupKey = node.sourceNode?.nodeId ?? node.id_;
      nodesByDocument[groupKey] = nodesByDocument[groupKey] || [];
      nodesByDocument[groupKey].push(node);
    }
    return nodesByDocument;
  }
  async extractTitles(nodesByDocument) {
    const titlesByDocument = {};
    for (const [key, nodes] of Object.entries(nodesByDocument)) {
      const titleCandidates = await this.getTitlesCandidates(nodes);
      const combinedTitles = titleCandidates.join(", ");
      const completion = await this.llm.doGenerate({
        inputFormat: "messages",
        mode: { type: "regular" },
        prompt: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: this.combineTemplate.format({
                  context: combinedTitles
                })
              }
            ]
          }
        ]
      });
      let title = "";
      if (typeof completion.text === "string") {
        title = completion.text.trim();
      } else {
        console.warn("Title extraction LLM output was not a string:", completion.text);
      }
      titlesByDocument[key] = title;
    }
    return titlesByDocument;
  }
  async getTitlesCandidates(nodes) {
    const titleJobs = nodes.map(async (node) => {
      const completion = await this.llm.doGenerate({
        inputFormat: "messages",
        mode: { type: "regular" },
        prompt: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: this.nodeTemplate.format({
                  context: node.getContent()
                })
              }
            ]
          }
        ]
      });
      if (typeof completion.text === "string") {
        return completion.text.trim();
      } else {
        console.warn("Title candidate extraction LLM output was not a string:", completion.text);
        return "";
      }
    });
    return await Promise.all(titleJobs);
  }
};

// src/document/extractors/summary.ts
var SummaryExtractor = class extends BaseExtractor {
  llm;
  summaries;
  promptTemplate;
  selfSummary;
  prevSummary;
  nextSummary;
  constructor(options) {
    const summaries = options?.summaries ?? ["self"];
    if (summaries && !summaries.some((s) => ["self", "prev", "next"].includes(s)))
      throw new Error("Summaries must be one of 'self', 'prev', 'next'");
    super();
    this.llm = options?.llm ?? baseLLM;
    this.summaries = summaries;
    this.promptTemplate = options?.promptTemplate ? new PromptTemplate({
      templateVars: ["context"],
      template: options.promptTemplate
    }) : defaultSummaryPrompt;
    this.selfSummary = summaries?.includes("self") ?? false;
    this.prevSummary = summaries?.includes("prev") ?? false;
    this.nextSummary = summaries?.includes("next") ?? false;
  }
  /**
   * Extract summary from a node.
   * @param {BaseNode} node Node to extract summary from.
   * @returns {Promise<string>} Summary extracted from the node.
   */
  async generateNodeSummary(node) {
    const text = node.getContent();
    if (!text || text.trim() === "") {
      return "";
    }
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return "";
    }
    const context = node.getContent();
    const prompt = this.promptTemplate.format({
      context
    });
    const result = await this.llm.doGenerate({
      inputFormat: "messages",
      mode: { type: "regular" },
      prompt: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }]
        }
      ]
    });
    let summary = "";
    if (typeof result.text === "string") {
      summary = result.text.trim();
    } else {
      console.warn("Summary extraction LLM output was not a string:", result.text);
    }
    return summary.replace(STRIP_REGEX, "");
  }
  /**
   * Extract summaries from a list of nodes.
   * @param {BaseNode[]} nodes Nodes to extract summaries from.
   * @returns {Promise<ExtractSummary[]>} Summaries extracted from the nodes.
   */
  async extract(nodes) {
    if (!nodes.every((n) => n instanceof TextNode)) throw new Error("Only `TextNode` is allowed for `Summary` extractor");
    const nodeSummaries = await Promise.all(nodes.map((node) => this.generateNodeSummary(node)));
    const metadataList = nodes.map(() => ({}));
    for (let i = 0; i < nodes.length; i++) {
      if (i > 0 && this.prevSummary && nodeSummaries[i - 1]) {
        metadataList[i]["prevSectionSummary"] = nodeSummaries[i - 1];
      }
      if (i < nodes.length - 1 && this.nextSummary && nodeSummaries[i + 1]) {
        metadataList[i]["nextSectionSummary"] = nodeSummaries[i + 1];
      }
      if (this.selfSummary && nodeSummaries[i]) {
        metadataList[i]["sectionSummary"] = nodeSummaries[i];
      }
    }
    return metadataList;
  }
};

// src/document/extractors/questions.ts
var QuestionsAnsweredExtractor = class extends BaseExtractor {
  llm;
  questions = 5;
  promptTemplate;
  embeddingOnly = false;
  /**
   * Constructor for the QuestionsAnsweredExtractor class.
   * @param {MastraLanguageModel} llm MastraLanguageModel instance.
   * @param {number} questions Number of questions to generate.
   * @param {QuestionExtractPrompt['template']} promptTemplate Optional custom prompt template (should include {context}).
   * @param {boolean} embeddingOnly Whether to use metadata for embeddings only.
   */
  constructor(options) {
    if (options?.questions && options.questions < 1) throw new Error("Questions must be greater than 0");
    super();
    this.llm = options?.llm ?? baseLLM;
    this.questions = options?.questions ?? 5;
    this.promptTemplate = options?.promptTemplate ? new PromptTemplate({
      templateVars: ["numQuestions", "context"],
      template: options.promptTemplate
    }).partialFormat({
      numQuestions: "5"
    }) : defaultQuestionExtractPrompt;
    this.embeddingOnly = options?.embeddingOnly ?? false;
  }
  /**
   * Extract answered questions from a node.
   * @param {BaseNode} node Node to extract questions from.
   * @returns {Promise<Array<ExtractQuestion> | Array<{}>>} Questions extracted from the node.
   */
  async extractQuestionsFromNode(node) {
    const text = node.getContent();
    if (!text || text.trim() === "") {
      return { questionsThisExcerptCanAnswer: "" };
    }
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return { questionsThisExcerptCanAnswer: "" };
    }
    const contextStr = node.getContent();
    const prompt = this.promptTemplate.format({
      context: contextStr,
      numQuestions: this.questions.toString()
    });
    const questions = await this.llm.doGenerate({
      inputFormat: "messages",
      mode: { type: "regular" },
      prompt: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }]
        }
      ]
    });
    let result = "";
    try {
      if (typeof questions.text === "string") {
        result = questions.text.replace(STRIP_REGEX, "").trim();
      } else {
        console.warn("Question extraction LLM output was not a string:", questions.text);
      }
    } catch (err) {
      console.warn("Question extraction failed:", err);
    }
    return {
      questionsThisExcerptCanAnswer: result
    };
  }
  /**
   * Extract answered questions from a list of nodes.
   * @param {BaseNode[]} nodes Nodes to extract questions from.
   * @returns {Promise<Array<ExtractQuestion> | Array<{}>>} Questions extracted from the nodes.
   */
  async extract(nodes) {
    const results = await Promise.all(nodes.map((node) => this.extractQuestionsFromNode(node)));
    return results;
  }
};

// src/document/extractors/keywords.ts
var KeywordExtractor = class extends BaseExtractor {
  llm;
  keywords = 5;
  promptTemplate;
  /**
   * Constructor for the KeywordExtractor class.
   * @param {MastraLanguageModel} llm MastraLanguageModel instance.
   * @param {number} keywords Number of keywords to extract.
   * @param {string} [promptTemplate] Optional custom prompt template (must include {context})
   * @throws {Error} If keywords is less than 1.
   */
  constructor(options) {
    if (options?.keywords && options.keywords < 1) throw new Error("Keywords must be greater than 0");
    super();
    this.llm = options?.llm ?? baseLLM;
    this.keywords = options?.keywords ?? 5;
    this.promptTemplate = options?.promptTemplate ? new PromptTemplate({
      templateVars: ["context", "maxKeywords"],
      template: options.promptTemplate
    }) : defaultKeywordExtractPrompt;
  }
  /**
   *
   * @param node Node to extract keywords from.
   * @returns Keywords extracted from the node.
   */
  /**
   * Extract keywords from a node. Returns an object with a comma-separated string of keywords, or an empty string if extraction fails.
   * Adds error handling for malformed/empty LLM output.
   */
  async extractKeywordsFromNodes(node) {
    const text = node.getContent();
    if (!text || text.trim() === "") {
      return { excerptKeywords: "" };
    }
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return { excerptKeywords: "" };
    }
    let keywords = "";
    try {
      const completion = await this.llm.doGenerate({
        inputFormat: "messages",
        mode: { type: "regular" },
        prompt: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: this.promptTemplate.format({
                  context: node.getContent(),
                  maxKeywords: this.keywords.toString()
                })
              }
            ]
          }
        ]
      });
      if (typeof completion.text === "string") {
        keywords = completion.text.trim();
      } else {
        console.warn("Keyword extraction LLM output was not a string:", completion.text);
      }
    } catch (err) {
      console.warn("Keyword extraction failed:", err);
    }
    return { excerptKeywords: keywords };
  }
  /**
   *
   * @param nodes Nodes to extract keywords from.
   * @returns Keywords extracted from the nodes.
   */
  /**
   * Extract keywords from an array of nodes. Always returns an array (may be empty).
   * @param nodes Nodes to extract keywords from.
   * @returns Array of keyword extraction results.
   */
  async extract(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) return [];
    const results = await Promise.all(nodes.map((node) => this.extractKeywordsFromNodes(node)));
    return results;
  }
};

// src/document/types.ts
var Language = /* @__PURE__ */ ((Language2) => {
  Language2["CPP"] = "cpp";
  Language2["GO"] = "go";
  Language2["JAVA"] = "java";
  Language2["KOTLIN"] = "kotlin";
  Language2["JS"] = "js";
  Language2["TS"] = "ts";
  Language2["PHP"] = "php";
  Language2["PROTO"] = "proto";
  Language2["PYTHON"] = "python";
  Language2["RST"] = "rst";
  Language2["RUBY"] = "ruby";
  Language2["RUST"] = "rust";
  Language2["SCALA"] = "scala";
  Language2["SWIFT"] = "swift";
  Language2["MARKDOWN"] = "markdown";
  Language2["LATEX"] = "latex";
  Language2["HTML"] = "html";
  Language2["SOL"] = "sol";
  Language2["CSHARP"] = "csharp";
  Language2["COBOL"] = "cobol";
  Language2["C"] = "c";
  Language2["LUA"] = "lua";
  Language2["PERL"] = "perl";
  Language2["HASKELL"] = "haskell";
  Language2["ELIXIR"] = "elixir";
  Language2["POWERSHELL"] = "powershell";
  return Language2;
})(Language || {});

// src/document/transformers/text.ts
var TextTransformer = class {
  size;
  overlap;
  lengthFunction;
  keepSeparator;
  addStartIndex;
  stripWhitespace;
  constructor({
    size = 4e3,
    overlap = 200,
    lengthFunction = (text) => text.length,
    keepSeparator = false,
    addStartIndex = false,
    stripWhitespace = true
  }) {
    if (overlap > size) {
      throw new Error(`Got a larger chunk overlap (${overlap}) than chunk size (${size}), should be smaller.`);
    }
    this.size = size;
    this.overlap = overlap;
    this.lengthFunction = lengthFunction;
    this.keepSeparator = keepSeparator;
    this.addStartIndex = addStartIndex;
    this.stripWhitespace = stripWhitespace;
  }
  setAddStartIndex(value) {
    this.addStartIndex = value;
  }
  createDocuments(texts, metadatas) {
    const _metadatas = metadatas || Array(texts.length).fill({});
    const documents = [];
    texts.forEach((text, i) => {
      let index = 0;
      let previousChunkLen = 0;
      this.splitText({ text }).forEach((chunk) => {
        const metadata = { ..._metadatas[i] };
        if (this.addStartIndex) {
          const offset = index + previousChunkLen - this.overlap;
          index = text.indexOf(chunk, Math.max(0, offset));
          metadata.startIndex = index;
          previousChunkLen = chunk.length;
        }
        documents.push(
          new Document({
            text: chunk,
            metadata
          })
        );
      });
    });
    return documents;
  }
  splitDocuments(documents) {
    const texts = [];
    const metadatas = [];
    for (const doc of documents) {
      texts.push(doc.text);
      metadatas.push(doc.metadata);
    }
    return this.createDocuments(texts, metadatas);
  }
  transformDocuments(documents) {
    const texts = [];
    const metadatas = [];
    for (const doc of documents) {
      texts.push(doc.text);
      metadatas.push(doc.metadata);
    }
    return this.createDocuments(texts, metadatas);
  }
  joinDocs(docs, separator) {
    let text = docs.join(separator);
    if (this.stripWhitespace) {
      text = text.trim();
    }
    return text === "" ? null : text;
  }
  mergeSplits(splits, separator) {
    const docs = [];
    let currentDoc = [];
    let total = 0;
    for (const d of splits) {
      const len = this.lengthFunction(d);
      const separatorLen = separator ? this.lengthFunction(separator) : 0;
      if (total + len + (currentDoc.length > 0 ? separatorLen : 0) > this.size) {
        if (total > this.size) {
          console.warn(`Created a chunk of size ${total}, which is longer than the specified ${this.size}`);
        }
        if (currentDoc.length > 0) {
          const doc = this.joinDocs(currentDoc, separator);
          if (doc !== null) {
            docs.push(doc);
          }
          if (this.overlap > 0) {
            let overlapContent = [];
            let overlapSize = 0;
            for (let i = currentDoc.length - 1; i >= 0; i--) {
              const piece = currentDoc[i];
              const pieceLen = this.lengthFunction(piece);
              if (overlapSize + pieceLen > this.overlap) {
                break;
              }
              overlapContent.unshift(piece);
              overlapSize += pieceLen + (overlapContent.length > 1 ? separatorLen : 0);
            }
            currentDoc = overlapContent;
            total = overlapSize;
          } else {
            currentDoc = [];
            total = 0;
          }
        }
      }
      currentDoc.push(d);
      total += len + (currentDoc.length > 1 ? separatorLen : 0);
    }
    if (currentDoc.length > 0) {
      const doc = this.joinDocs(currentDoc, separator);
      if (doc !== null) {
        docs.push(doc);
      }
    }
    return docs;
  }
};

// src/document/transformers/character.ts
function splitTextWithRegex(text, separator, keepSeparator) {
  if (!separator) {
    return text.split("");
  }
  if (!keepSeparator) {
    return text.split(new RegExp(separator)).filter((s) => s !== "");
  }
  if (!text) {
    return [];
  }
  const splits = text.split(new RegExp(`(${separator})`));
  const result = [];
  if (keepSeparator === "end") {
    for (let i = 0; i < splits.length - 1; i += 2) {
      if (i + 1 < splits.length) {
        const chunk = splits[i] + (splits[i + 1] || "");
        if (chunk) result.push(chunk);
      }
    }
    if (splits.length % 2 === 1 && splits[splits.length - 1]) {
      result.push(splits?.[splits.length - 1]);
    }
  } else {
    if (splits[0]) result.push(splits[0]);
    for (let i = 1; i < splits.length - 1; i += 2) {
      const separator2 = splits[i];
      const text2 = splits[i + 1];
      if (separator2 && text2) {
        result.push(separator2 + text2);
      }
    }
  }
  return result.filter((s) => s !== "");
}
var CharacterTransformer = class extends TextTransformer {
  separator;
  isSeparatorRegex;
  constructor({
    separator = "\n\n",
    isSeparatorRegex = false,
    options = {}
  }) {
    super(options);
    this.separator = separator;
    this.isSeparatorRegex = isSeparatorRegex;
  }
  splitText({ text }) {
    const separator = this.isSeparatorRegex ? this.separator : this.separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const initialSplits = splitTextWithRegex(text, separator, this.keepSeparator);
    const chunks = [];
    for (const split of initialSplits) {
      if (this.lengthFunction(split) <= this.size) {
        chunks.push(split);
      } else {
        const subChunks = this.__splitChunk(split);
        chunks.push(...subChunks);
      }
    }
    return chunks;
  }
  __splitChunk(text) {
    const chunks = [];
    let currentPosition = 0;
    while (currentPosition < text.length) {
      let chunkEnd = currentPosition;
      while (chunkEnd < text.length && this.lengthFunction(text.slice(currentPosition, chunkEnd + 1)) <= this.size) {
        chunkEnd++;
      }
      const currentChunk = text.slice(currentPosition, chunkEnd);
      const chunkLength = this.lengthFunction(currentChunk);
      chunks.push(currentChunk);
      if (chunkEnd >= text.length) break;
      currentPosition += Math.max(1, chunkLength - this.overlap);
    }
    return chunks;
  }
};
var RecursiveCharacterTransformer = class _RecursiveCharacterTransformer extends TextTransformer {
  separators;
  isSeparatorRegex;
  constructor({
    separators,
    isSeparatorRegex = false,
    options = {}
  }) {
    super(options);
    this.separators = separators || ["\n\n", "\n", " ", ""];
    this.isSeparatorRegex = isSeparatorRegex;
  }
  _splitText(text, separators) {
    const finalChunks = [];
    let separator = separators?.[separators.length - 1];
    let newSeparators = [];
    for (let i = 0; i < separators.length; i++) {
      const s = separators[i];
      const _separator2 = this.isSeparatorRegex ? s : s?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (s === "") {
        separator = s;
        break;
      }
      if (new RegExp(_separator2).test(text)) {
        separator = s;
        newSeparators = separators.slice(i + 1);
        break;
      }
    }
    const _separator = this.isSeparatorRegex ? separator : separator?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const splits = splitTextWithRegex(text, _separator, this.keepSeparator);
    const goodSplits = [];
    const mergeSeparator = this.keepSeparator ? "" : separator;
    for (const s of splits) {
      if (this.lengthFunction(s) < this.size) {
        goodSplits.push(s);
      } else {
        if (goodSplits.length > 0) {
          const mergedText = this.mergeSplits(goodSplits, mergeSeparator);
          finalChunks.push(...mergedText);
          goodSplits.length = 0;
        }
        if (newSeparators.length === 0) {
          finalChunks.push(s);
        } else {
          const otherInfo = this._splitText(s, newSeparators);
          finalChunks.push(...otherInfo);
        }
      }
    }
    if (goodSplits.length > 0) {
      const mergedText = this.mergeSplits(goodSplits, mergeSeparator);
      finalChunks.push(...mergedText);
    }
    return finalChunks;
  }
  splitText({ text }) {
    return this._splitText(text, this.separators);
  }
  static fromLanguage(language, options = {}) {
    const separators = _RecursiveCharacterTransformer.getSeparatorsForLanguage(language);
    return new _RecursiveCharacterTransformer({ separators, isSeparatorRegex: true, options });
  }
  static getSeparatorsForLanguage(language) {
    switch (language) {
      case "markdown" /* MARKDOWN */:
        return [
          // First, try to split along Markdown headings (starting with level 2)
          "\n#{1,6} ",
          // End of code block
          "```\n",
          // Horizontal lines
          "\n\\*\\*\\*+\n",
          "\n---+\n",
          "\n___+\n",
          // Note that this splitter doesn't handle horizontal lines defined
          // by *three or more* of ***, ---, or ___, but this is not handled
          "\n\n",
          "\n",
          " ",
          ""
        ];
      case "cpp" /* CPP */:
      case "c" /* C */:
        return [
          "\nclass ",
          "\nvoid ",
          "\nint ",
          "\nfloat ",
          "\ndouble ",
          "\nif ",
          "\nfor ",
          "\nwhile ",
          "\nswitch ",
          "\ncase ",
          "\n\n",
          "\n",
          " ",
          ""
        ];
      case "ts" /* TS */:
        return [
          "\nenum ",
          "\ninterface ",
          "\nnamespace ",
          "\ntype ",
          "\nclass ",
          "\nfunction ",
          "\nconst ",
          "\nlet ",
          "\nvar ",
          "\nif ",
          "\nfor ",
          "\nwhile ",
          "\nswitch ",
          "\ncase ",
          "\ndefault ",
          "\n\n",
          "\n",
          " ",
          ""
        ];
      case "latex" /* LATEX */:
        return [
          "\\\\part\\*?\\{",
          "\\\\chapter\\*?\\{",
          "\\\\section\\*?\\{",
          "\\\\subsection\\*?\\{",
          "\\\\subsubsection\\*?\\{",
          "\\\\begin\\{.*?\\}",
          "\\\\end\\{.*?\\}",
          "\\\\[a-zA-Z]+\\{.*?\\}",
          "\n\n",
          "\n",
          " ",
          ""
        ];
      // ... (add other language cases following the same pattern)
      default:
        throw new Error(`Language ${language} is not supported! Please choose from ${Object.values(Language)}`);
    }
  }
};
var HTMLHeaderTransformer = class {
  headersToSplitOn;
  returnEachElement;
  constructor(headersToSplitOn, returnEachElement = false) {
    this.returnEachElement = returnEachElement;
    this.headersToSplitOn = [...headersToSplitOn].sort();
  }
  splitText({ text }) {
    const root = parse(text);
    const headerFilter = this.headersToSplitOn.map(([header]) => header);
    const headerMapping = Object.fromEntries(this.headersToSplitOn);
    const elements = [];
    const headers = root.querySelectorAll(headerFilter.join(","));
    headers.forEach((header) => {
      let content = "";
      const parentNode = header.parentNode;
      if (parentNode && parentNode.childNodes) {
        let foundHeader = false;
        for (const node of parentNode.childNodes) {
          if (node === header) {
            foundHeader = true;
            continue;
          }
          if (foundHeader && node.tagName && headerFilter.includes(node.tagName.toLowerCase())) {
            break;
          }
          if (foundHeader) {
            content += this.getTextContent(node) + " ";
          }
        }
      }
      elements.push({
        url: text,
        xpath: this.getXPath(header),
        content: content.trim(),
        metadata: {
          [headerMapping?.[header.tagName.toLowerCase()]]: header.text || ""
        }
      });
    });
    return this.returnEachElement ? elements.map(
      (el) => new Document({
        text: el.content,
        metadata: { ...el.metadata, xpath: el.xpath }
      })
    ) : this.aggregateElementsToChunks(elements);
  }
  getXPath(element) {
    if (!element) return "";
    const parts = [];
    let current = element;
    while (current && current.tagName) {
      let index = 1;
      const parent = current.parentNode;
      if (parent && parent.childNodes) {
        for (const sibling of parent.childNodes) {
          if (sibling === current) break;
          if (sibling.tagName === current.tagName) {
            index++;
          }
        }
      }
      parts.unshift(`${current.tagName.toLowerCase()}[${index}]`);
      current = current.parentNode;
    }
    return "/" + parts.join("/");
  }
  getTextContent(element) {
    if (!element) return "";
    if (!element.tagName) {
      return element.text || "";
    }
    let content = element.text || "";
    if (element.childNodes) {
      for (const child of element.childNodes) {
        const childText = this.getTextContent(child);
        if (childText) {
          content += " " + childText;
        }
      }
    }
    return content.trim();
  }
  aggregateElementsToChunks(elements) {
    const aggregatedChunks = [];
    for (const element of elements) {
      if (aggregatedChunks.length > 0 && JSON.stringify(aggregatedChunks[aggregatedChunks.length - 1].metadata) === JSON.stringify(element.metadata)) {
        aggregatedChunks[aggregatedChunks.length - 1].content += "  \n" + element.content;
      } else {
        aggregatedChunks.push({ ...element });
      }
    }
    return aggregatedChunks.map(
      (chunk) => new Document({
        text: chunk.content,
        metadata: { ...chunk.metadata, xpath: chunk.xpath }
      })
    );
  }
  createDocuments(texts, metadatas) {
    const _metadatas = metadatas || Array(texts.length).fill({});
    const documents = [];
    for (let i = 0; i < texts.length; i++) {
      const chunks = this.splitText({ text: texts[i] });
      for (const chunk of chunks) {
        const metadata = { ..._metadatas[i] || {} };
        const chunkMetadata = chunk.metadata;
        if (chunkMetadata) {
          for (const [key, value] of Object.entries(chunkMetadata || {})) {
            if (value === "#TITLE#") {
              chunkMetadata[key] = metadata["Title"];
            }
          }
        }
        documents.push(
          new Document({
            text: chunk.text,
            metadata: { ...metadata, ...chunkMetadata }
          })
        );
      }
    }
    return documents;
  }
  transformDocuments(documents) {
    const texts = [];
    const metadatas = [];
    for (const doc of documents) {
      texts.push(doc.text);
      metadatas.push(doc.metadata);
    }
    return this.createDocuments(texts, metadatas);
  }
};
var HTMLSectionTransformer = class {
  headersToSplitOn;
  options;
  constructor(headersToSplitOn, options = {}) {
    this.headersToSplitOn = Object.fromEntries(headersToSplitOn.map(([tag, name14]) => [tag.toLowerCase(), name14]));
    this.options = options;
  }
  splitText(text) {
    const sections = this.splitHtmlByHeaders(text);
    return sections.map(
      (section) => new Document({
        text: section.content,
        metadata: {
          [this.headersToSplitOn[section.tagName.toLowerCase()]]: section.header,
          xpath: section.xpath
        }
      })
    );
  }
  getXPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === 1) {
      let index = 1;
      let sibling = current.previousSibling;
      while (sibling) {
        if (sibling.nodeType === 1 && sibling.tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      if (current.tagName) {
        parts.unshift(`${current.tagName.toLowerCase()}[${index}]`);
      }
      current = current.parentNode;
    }
    return "/" + parts.join("/");
  }
  splitHtmlByHeaders(htmlDoc) {
    const sections = [];
    const root = parse(htmlDoc);
    const headers = Object.keys(this.headersToSplitOn);
    const headerElements = root.querySelectorAll(headers.join(","));
    headerElements.forEach((headerElement, index) => {
      const header = headerElement.text?.trim() || "";
      const tagName = headerElement.tagName;
      const xpath = this.getXPath(headerElement);
      let content = "";
      let currentElement = headerElement.nextElementSibling;
      const nextHeader = headerElements[index + 1];
      while (currentElement && (!nextHeader || currentElement !== nextHeader)) {
        if (currentElement.text) {
          content += currentElement.text.trim() + " ";
        }
        currentElement = currentElement.nextElementSibling;
      }
      content = content.trim();
      sections.push({
        header,
        content,
        tagName,
        xpath
      });
    });
    return sections;
  }
  async splitDocuments(documents) {
    const texts = [];
    const metadatas = [];
    for (const doc of documents) {
      texts.push(doc.text);
      metadatas.push(doc.metadata);
    }
    const results = await this.createDocuments(texts, metadatas);
    const textSplitter = new RecursiveCharacterTransformer({ options: this.options });
    return textSplitter.splitDocuments(results);
  }
  createDocuments(texts, metadatas) {
    const _metadatas = metadatas || Array(texts.length).fill({});
    const documents = [];
    for (let i = 0; i < texts.length; i++) {
      const chunks = this.splitText(texts[i]);
      for (const chunk of chunks) {
        const metadata = { ..._metadatas[i] || {} };
        const chunkMetadata = chunk.metadata;
        if (chunkMetadata) {
          for (const [key, value] of Object.entries(chunkMetadata || {})) {
            if (value === "#TITLE#") {
              chunkMetadata[key] = metadata["Title"];
            }
          }
        }
        documents.push(
          new Document({
            text: chunk.text,
            metadata: { ...metadata, ...chunkMetadata }
          })
        );
      }
    }
    return documents;
  }
  transformDocuments(documents) {
    const texts = [];
    const metadatas = [];
    for (const doc of documents) {
      texts.push(doc.text);
      metadatas.push(doc.metadata);
    }
    return this.createDocuments(texts, metadatas);
  }
};

// src/document/transformers/json.ts
var RecursiveJsonTransformer = class _RecursiveJsonTransformer {
  maxSize;
  minSize;
  constructor({ maxSize = 2e3, minSize }) {
    this.maxSize = maxSize;
    this.minSize = minSize ?? Math.max(maxSize - 200, 50);
  }
  static jsonSize(data) {
    const seen = /* @__PURE__ */ new WeakSet();
    function getStringifiableData(obj) {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      if (seen.has(obj)) {
        return "[Circular]";
      }
      seen.add(obj);
      if (Array.isArray(obj)) {
        const safeArray = [];
        for (const item of obj) {
          safeArray.push(getStringifiableData(item));
        }
        return safeArray;
      }
      const safeObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          safeObj[key] = getStringifiableData(obj[key]);
        }
      }
      return safeObj;
    }
    const stringifiable = getStringifiableData(data);
    const jsonString = JSON.stringify(stringifiable);
    return jsonString.length;
  }
  /**
   * Transform JSON data while handling circular references
   */
  transform(data) {
    const size = _RecursiveJsonTransformer.jsonSize(data);
    const seen = /* @__PURE__ */ new WeakSet();
    function createSafeCopy(obj) {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      if (seen.has(obj)) {
        return "[Circular]";
      }
      seen.add(obj);
      if (Array.isArray(obj)) {
        return obj.map((item) => createSafeCopy(item));
      }
      const copy = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          copy[key] = createSafeCopy(obj[key]);
        }
      }
      return copy;
    }
    return {
      size,
      data: createSafeCopy(data)
    };
  }
  /**
   * Set a value in a nested dictionary based on the given path
   */
  static setNestedDict(d, path, value) {
    let current = d;
    for (const key of path.slice(0, -1)) {
      current[key] = current[key] || {};
      current = current[key];
    }
    current[path[path.length - 1]] = value;
  }
  /**
   * Convert lists in the JSON structure to dictionaries with index-based keys
   */
  listToDictPreprocessing(data) {
    if (data && typeof data === "object") {
      if (Array.isArray(data)) {
        return Object.fromEntries(data.map((item, index) => [String(index), this.listToDictPreprocessing(item)]));
      }
      return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, this.listToDictPreprocessing(v)]));
    }
    return data;
  }
  /**
   * Handles primitive values (strings, numbers, etc) by either adding them to the current chunk
   * or creating new chunks if they don't fit
   */
  handlePrimitiveValue(value, key, currentChunk, chunks, fullPath) {
    const testValue = { [key]: value };
    if (_RecursiveJsonTransformer.jsonSize(testValue) <= this.maxSize) {
      if (_RecursiveJsonTransformer.jsonSize({ ...currentChunk, ...testValue }) <= this.maxSize) {
        return {
          currentChunk: { ...currentChunk, ...testValue },
          chunks
        };
      } else {
        return {
          currentChunk: testValue,
          chunks: [...chunks, currentChunk]
        };
      }
    } else if (typeof value === "string") {
      const stringChunks = this.splitLongString(value);
      const newChunks = stringChunks.map((chunk) => {
        return this.createChunk(chunk, fullPath);
      }).filter((chunk) => _RecursiveJsonTransformer.jsonSize(chunk) <= this.maxSize);
      return {
        currentChunk,
        chunks: [...chunks, ...newChunks]
      };
    }
    const newChunk = this.createChunk(value, fullPath);
    return {
      currentChunk,
      chunks: _RecursiveJsonTransformer.jsonSize(newChunk) <= this.maxSize ? [...chunks, newChunk] : chunks
    };
  }
  /**
   * Creates a nested dictionary chunk from a value and path
   * e.g., path ['a', 'b'], value 'c' becomes { a: { b: 'c' } }
   */
  createChunk(value, path) {
    const chunk = {};
    _RecursiveJsonTransformer.setNestedDict(chunk, path, value);
    return chunk.root ? chunk.root : chunk;
  }
  /**
   * Checks if value is within size limits
   */
  isWithinSizeLimit(value, currentSize = 0) {
    const size = _RecursiveJsonTransformer.jsonSize(value);
    return currentSize === 0 ? size <= this.maxSize : size + currentSize <= this.maxSize || currentSize < this.minSize;
  }
  /**
   * Splits arrays into chunks based on size limits
   * Handles nested objects by recursing into handleNestedObject
   */
  handleArray(value, key, currentPath, depth, maxDepth) {
    const path = currentPath.length ? [...currentPath, key] : ["root", key];
    const chunk = this.createChunk(value, path);
    if (this.isWithinSizeLimit(chunk)) {
      return [chunk];
    }
    const chunks = [];
    let currentGroup = [];
    const saveCurrentGroup = () => {
      if (currentGroup.length > 0) {
        const groupChunk = this.createChunk(currentGroup, path);
        if (_RecursiveJsonTransformer.jsonSize(groupChunk) >= this.minSize) {
          chunks.push(groupChunk);
          currentGroup = [];
        }
      }
    };
    for (const item of value) {
      const testGroup = [...currentGroup, item];
      const testChunk = this.createChunk(testGroup, path);
      if (this.isWithinSizeLimit(testChunk)) {
        currentGroup = testGroup;
        continue;
      }
      saveCurrentGroup();
      if (typeof item === "object" && item !== null) {
        const singleItemArray = [item];
        const singleItemChunk = this.createChunk(singleItemArray, path);
        if (this.isWithinSizeLimit(singleItemChunk)) {
          currentGroup = singleItemArray;
        } else {
          const itemPath = [...path, String(chunks.length)];
          const nestedChunks = this.handleNestedObject(item, itemPath, depth + 1, maxDepth);
          chunks.push(...nestedChunks);
        }
      } else {
        currentGroup = [item];
      }
    }
    saveCurrentGroup();
    return chunks;
  }
  /**
   * Splits objects into chunks based on size limits
   * Handles nested arrays and objects by recursing into handleArray and handleNestedObject
   */
  handleNestedObject(value, fullPath, depth, maxDepth) {
    const path = fullPath.length ? fullPath : ["root"];
    if (depth > maxDepth) {
      console.warn(`Maximum depth of ${maxDepth} exceeded, flattening remaining structure`);
      return [this.createChunk(value, path)];
    }
    const wholeChunk = this.createChunk(value, path);
    if (this.isWithinSizeLimit(wholeChunk)) {
      return [wholeChunk];
    }
    const chunks = [];
    let currentChunk = {};
    const saveCurrentChunk = () => {
      if (Object.keys(currentChunk).length > 0) {
        const objChunk = this.createChunk(currentChunk, path);
        if (_RecursiveJsonTransformer.jsonSize(objChunk) >= this.minSize) {
          chunks.push(objChunk);
          currentChunk = {};
        }
      }
    };
    for (const [key, val] of Object.entries(value)) {
      if (val === void 0) continue;
      if (Array.isArray(val)) {
        saveCurrentChunk();
        const arrayChunks = this.handleArray(val, key, path, depth, maxDepth);
        chunks.push(...arrayChunks);
        continue;
      }
      const testChunk = this.createChunk({ ...currentChunk, [key]: val }, path);
      if (this.isWithinSizeLimit(testChunk)) {
        currentChunk[key] = val;
        continue;
      }
      saveCurrentChunk();
      if (typeof val === "object" && val !== null) {
        const nestedChunks = this.handleNestedObject(val, [...path, key], depth + 1, maxDepth);
        chunks.push(...nestedChunks);
      } else {
        currentChunk = { [key]: val };
      }
    }
    saveCurrentChunk();
    return chunks;
  }
  /**
   * Splits long strings into smaller chunks at word boundaries
   * Ensures each chunk is within maxSize limit
   */
  splitLongString(value) {
    const chunks = [];
    let remaining = value;
    while (remaining.length > 0) {
      const overhead = 20;
      const chunkSize = Math.floor(this.maxSize - overhead);
      if (remaining.length <= chunkSize) {
        chunks.push(remaining);
        break;
      }
      const lastSpace = remaining.slice(0, chunkSize).lastIndexOf(" ");
      const splitAt = lastSpace > 0 ? lastSpace + 1 : chunkSize;
      chunks.push(remaining.slice(0, splitAt));
      remaining = remaining.slice(splitAt);
    }
    return chunks;
  }
  /**
   * Core chunking logic that processes JSON data recursively
   * Handles arrays, objects, and primitive values while maintaining structure
   */
  jsonSplit({
    data,
    currentPath = [],
    chunks = [{}],
    depth = 0,
    maxDepth = 100
  }) {
    if (!data || typeof data !== "object") {
      return chunks;
    }
    if (depth > maxDepth) {
      console.warn(`Maximum depth of ${maxDepth} exceeded, flattening remaining structure`);
      _RecursiveJsonTransformer.setNestedDict(chunks[chunks.length - 1] || {}, currentPath, data);
      return chunks;
    }
    let currentChunk = {};
    let accumulatedChunks = chunks;
    for (const [key, value] of Object.entries(data)) {
      const fullPath = [...currentPath, key];
      if (Array.isArray(value)) {
        const arrayChunks = this.handleArray(value, key, currentPath, depth, maxDepth);
        accumulatedChunks = [...accumulatedChunks, ...arrayChunks];
      } else if (typeof value === "object" && value !== null) {
        const objectChunks = this.handleNestedObject(value, fullPath, depth, maxDepth);
        accumulatedChunks = [...accumulatedChunks, ...objectChunks];
      } else {
        const { currentChunk: newCurrentChunk, chunks: newChunks } = this.handlePrimitiveValue(
          value,
          key,
          currentChunk,
          accumulatedChunks,
          fullPath
        );
        currentChunk = newCurrentChunk;
        accumulatedChunks = newChunks;
      }
    }
    if (Object.keys(currentChunk).length > 0) {
      accumulatedChunks = [...accumulatedChunks, currentChunk];
    }
    return accumulatedChunks.filter((chunk) => Object.keys(chunk).length > 0);
  }
  /**
   * Splits JSON into a list of JSON chunks
   */
  splitJson({
    jsonData,
    convertLists = false
  }) {
    const processedData = convertLists ? this.listToDictPreprocessing(jsonData) : jsonData;
    const chunks = this.jsonSplit({ data: processedData });
    if (Object.keys(chunks[chunks.length - 1] || {}).length === 0) {
      chunks.pop();
    }
    return chunks;
  }
  /**
   * Converts Unicode characters to their escaped ASCII representation
   * e.g., 'café' becomes 'caf\u00e9'
   */
  escapeNonAscii(obj) {
    if (typeof obj === "string") {
      return obj.replace(/[\u0080-\uffff]/g, (char) => {
        return `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
      });
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.escapeNonAscii(item));
    }
    if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, this.escapeNonAscii(value)]));
    }
    return obj;
  }
  /**
   * Splits JSON into a list of JSON formatted strings
   */
  splitText({
    jsonData,
    convertLists = false,
    ensureAscii = true
  }) {
    const chunks = this.splitJson({ jsonData, convertLists });
    if (ensureAscii) {
      const escapedChunks = chunks.map((chunk) => this.escapeNonAscii(chunk));
      return escapedChunks.map((chunk) => JSON.stringify(chunk));
    }
    return chunks.map(
      (chunk) => JSON.stringify(chunk, (key, value) => {
        if (typeof value === "string") {
          return value.replace(/\\u[\da-f]{4}/gi, (match) => String.fromCharCode(parseInt(match.slice(2), 16)));
        }
        return value;
      })
    );
  }
  /**
   * Create documents from a list of json objects
   */
  createDocuments({
    texts,
    convertLists = false,
    ensureAscii = true,
    metadatas
  }) {
    const _metadatas = metadatas || Array(texts.length).fill({});
    const documents = [];
    texts.forEach((text, i) => {
      const chunks = this.splitText({ jsonData: JSON.parse(text), convertLists, ensureAscii });
      chunks.forEach((chunk) => {
        const metadata = { ..._metadatas[i] || {} };
        documents.push(
          new Document({
            text: chunk,
            metadata
          })
        );
      });
    });
    return documents;
  }
  transformDocuments({
    ensureAscii,
    documents,
    convertLists
  }) {
    const texts = [];
    const metadatas = [];
    for (const doc of documents) {
      texts.push(doc.text);
      metadatas.push(doc.metadata);
    }
    return this.createDocuments({
      texts,
      metadatas,
      ensureAscii,
      convertLists
    });
  }
};

// src/document/transformers/latex.ts
var LatexTransformer = class extends RecursiveCharacterTransformer {
  constructor(options = {}) {
    const separators = RecursiveCharacterTransformer.getSeparatorsForLanguage("latex" /* LATEX */);
    super({ separators, isSeparatorRegex: true, options });
  }
};

// src/document/transformers/markdown.ts
var MarkdownTransformer = class extends RecursiveCharacterTransformer {
  constructor(options = {}) {
    const separators = RecursiveCharacterTransformer.getSeparatorsForLanguage("markdown" /* MARKDOWN */);
    super({ separators, isSeparatorRegex: true, options });
  }
};
var MarkdownHeaderTransformer = class {
  headersToSplitOn;
  returnEachLine;
  stripHeaders;
  constructor(headersToSplitOn, returnEachLine = false, stripHeaders = true) {
    this.headersToSplitOn = [...headersToSplitOn].sort((a, b) => b[0].length - a[0].length);
    this.returnEachLine = returnEachLine;
    this.stripHeaders = stripHeaders;
  }
  aggregateLinesToChunks(lines) {
    if (this.returnEachLine) {
      return lines.flatMap((line) => {
        const contentLines = line.content.split("\n");
        return contentLines.filter((l) => l.trim() !== "" || this.headersToSplitOn.some(([sep]) => l.trim().startsWith(sep))).map(
          (l) => new Document({
            text: l.trim(),
            metadata: line.metadata
          })
        );
      });
    }
    const aggregatedChunks = [];
    for (const line of lines) {
      const lastLine = aggregatedChunks[aggregatedChunks.length - 1]?.content?.split("\n")?.slice(-1)[0]?.trim();
      const lastChunkIsHeader = lastLine ? this.headersToSplitOn.some(([sep]) => lastLine.startsWith(sep)) : false;
      if (aggregatedChunks.length > 0 && JSON.stringify(aggregatedChunks?.[aggregatedChunks.length - 1].metadata) === JSON.stringify(line.metadata)) {
        const aggChunk = aggregatedChunks[aggregatedChunks.length - 1];
        aggChunk.content += "  \n" + line.content;
      } else if (aggregatedChunks.length > 0 && JSON.stringify(aggregatedChunks?.[aggregatedChunks.length - 1].metadata) !== JSON.stringify(line.metadata) && Object.keys(aggregatedChunks?.[aggregatedChunks.length - 1].metadata).length < Object.keys(line.metadata).length && lastChunkIsHeader) {
        if (aggregatedChunks && aggregatedChunks?.[aggregatedChunks.length - 1]) {
          const aggChunk = aggregatedChunks[aggregatedChunks.length - 1];
          if (aggChunk) {
            aggChunk.content += "  \n" + line.content;
            aggChunk.metadata = line.metadata;
          }
        }
      } else {
        aggregatedChunks.push(line);
      }
    }
    return aggregatedChunks.map(
      (chunk) => new Document({
        text: chunk.content,
        metadata: chunk.metadata
      })
    );
  }
  splitText({ text }) {
    const lines = text.split("\n");
    const linesWithMetadata = [];
    let currentContent = [];
    let currentMetadata = {};
    const headerStack = [];
    const initialMetadata = {};
    let inCodeBlock = false;
    let openingFence = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const strippedLine = line.trim();
      if (!inCodeBlock) {
        if (strippedLine.startsWith("```") && strippedLine.split("```").length === 2 || strippedLine.startsWith("~~~")) {
          inCodeBlock = true;
          openingFence = strippedLine.startsWith("```") ? "```" : "~~~";
        }
      } else {
        if (strippedLine.startsWith(openingFence)) {
          inCodeBlock = false;
          openingFence = "";
        }
      }
      if (inCodeBlock) {
        currentContent.push(line);
        continue;
      }
      let headerMatched = false;
      for (const [sep, name14] of this.headersToSplitOn) {
        if (strippedLine.startsWith(sep) && (strippedLine.length === sep.length || strippedLine[sep.length] === " ")) {
          headerMatched = true;
          if (currentContent.length > 0) {
            linesWithMetadata.push({
              content: currentContent.join("\n"),
              metadata: { ...currentMetadata }
            });
            currentContent = [];
          }
          if (name14 !== null) {
            const currentHeaderLevel = (sep.match(/#/g) || []).length;
            while (headerStack.length > 0 && headerStack?.[headerStack.length - 1].level >= currentHeaderLevel) {
              const poppedHeader = headerStack.pop();
              if (poppedHeader.name in initialMetadata) {
                delete initialMetadata[poppedHeader.name];
              }
            }
            const header = {
              level: currentHeaderLevel,
              name: name14,
              data: strippedLine.slice(sep.length).trim()
            };
            headerStack.push(header);
            initialMetadata[name14] = header.data;
          }
          if (!this.stripHeaders) {
            linesWithMetadata.push({
              content: line,
              metadata: { ...currentMetadata, ...initialMetadata }
            });
          }
          break;
        }
      }
      if (!headerMatched) {
        if (strippedLine || this.returnEachLine) {
          currentContent.push(line);
          if (this.returnEachLine) {
            linesWithMetadata.push({
              content: line,
              metadata: { ...currentMetadata }
            });
            currentContent = [];
          }
        } else if (currentContent.length > 0) {
          linesWithMetadata.push({
            content: currentContent.join("\n"),
            metadata: { ...currentMetadata }
          });
          currentContent = [];
        }
      }
      currentMetadata = { ...initialMetadata };
    }
    if (currentContent.length > 0) {
      linesWithMetadata.push({
        content: currentContent.join("\n"),
        metadata: currentMetadata
      });
    }
    return this.aggregateLinesToChunks(linesWithMetadata);
  }
  createDocuments(texts, metadatas) {
    const _metadatas = metadatas || Array(texts.length).fill({});
    const documents = [];
    texts.forEach((text, i) => {
      this.splitText({ text }).forEach((chunk) => {
        const metadata = { ..._metadatas[i], ...chunk.metadata };
        documents.push(
          new Document({
            text: chunk.text,
            metadata
          })
        );
      });
    });
    return documents;
  }
  transformDocuments(documents) {
    const texts = [];
    const metadatas = [];
    for (const doc of documents) {
      texts.push(doc.text);
      metadatas.push(doc.metadata);
    }
    return this.createDocuments(texts, metadatas);
  }
};
function splitTextOnTokens({ text, tokenizer }) {
  const splits = [];
  const inputIds = tokenizer.encode(text);
  let startIdx = 0;
  let curIdx = Math.min(startIdx + tokenizer.tokensPerChunk, inputIds.length);
  let chunkIds = inputIds.slice(startIdx, curIdx);
  while (startIdx < inputIds.length) {
    splits.push(tokenizer.decode(chunkIds));
    if (curIdx === inputIds.length) {
      break;
    }
    startIdx += tokenizer.tokensPerChunk - tokenizer.overlap;
    curIdx = Math.min(startIdx + tokenizer.tokensPerChunk, inputIds.length);
    chunkIds = inputIds.slice(startIdx, curIdx);
  }
  return splits;
}
var TokenTransformer = class _TokenTransformer extends TextTransformer {
  tokenizer;
  allowedSpecial;
  disallowedSpecial;
  constructor({
    encodingName = "cl100k_base",
    modelName,
    allowedSpecial = /* @__PURE__ */ new Set(),
    disallowedSpecial = "all",
    options = {}
  }) {
    super(options);
    try {
      this.tokenizer = modelName ? encodingForModel(modelName) : getEncoding(encodingName);
    } catch {
      throw new Error("Could not load tiktoken encoding. Please install it with `npm install js-tiktoken`.");
    }
    this.allowedSpecial = allowedSpecial;
    this.disallowedSpecial = disallowedSpecial;
  }
  splitText({ text }) {
    const encode = (text2) => {
      const allowed = this.allowedSpecial === "all" ? "all" : Array.from(this.allowedSpecial);
      const disallowed = this.disallowedSpecial === "all" ? "all" : Array.from(this.disallowedSpecial);
      const processedText = this.stripWhitespace ? text2.trim() : text2;
      return Array.from(this.tokenizer.encode(processedText, allowed, disallowed));
    };
    const decode = (tokens) => {
      const text2 = this.tokenizer.decode(tokens);
      return this.stripWhitespace ? text2.trim() : text2;
    };
    const tokenizer = {
      overlap: this.overlap,
      tokensPerChunk: this.size,
      decode,
      encode
    };
    return splitTextOnTokens({ text, tokenizer });
  }
  static fromTikToken({
    encodingName = "cl100k_base",
    modelName,
    options = {}
  }) {
    let tokenizer;
    try {
      if (modelName) {
        tokenizer = encodingForModel(modelName);
      } else {
        tokenizer = getEncoding(encodingName);
      }
    } catch {
      throw new Error("Could not load tiktoken encoding. Please install it with `npm install js-tiktoken`.");
    }
    const tikTokenEncoder = (text) => {
      const allowed = options.allowedSpecial === "all" ? "all" : options.allowedSpecial ? Array.from(options.allowedSpecial) : [];
      const disallowed = options.disallowedSpecial === "all" ? "all" : options.disallowedSpecial ? Array.from(options.disallowedSpecial) : [];
      return tokenizer.encode(text, allowed, disallowed).length;
    };
    return new _TokenTransformer({
      encodingName,
      modelName,
      allowedSpecial: options.allowedSpecial,
      disallowedSpecial: options.disallowedSpecial,
      options: {
        size: options.size,
        overlap: options.overlap,
        lengthFunction: tikTokenEncoder
      }
    });
  }
};

// src/document/document.ts
var MDocument = class _MDocument {
  chunks;
  type;
  // e.g., 'text', 'html', 'markdown', 'json'
  constructor({ docs, type }) {
    this.chunks = docs.map((d) => {
      return new Document({ text: d.text, metadata: d.metadata });
    });
    this.type = type;
  }
  async extractMetadata({ title, summary, questions, keywords }) {
    const transformations = [];
    if (typeof summary !== "undefined") {
      transformations.push(new SummaryExtractor(typeof summary === "boolean" ? {} : summary));
    }
    if (typeof questions !== "undefined") {
      transformations.push(new QuestionsAnsweredExtractor(typeof questions === "boolean" ? {} : questions));
    }
    if (typeof keywords !== "undefined") {
      transformations.push(new KeywordExtractor(typeof keywords === "boolean" ? {} : keywords));
    }
    if (typeof title !== "undefined") {
      transformations.push(new TitleExtractor(typeof title === "boolean" ? {} : title));
      this.chunks = this.chunks.map(
        (doc) => doc?.metadata?.docId ? new Document({
          ...doc,
          relationships: {
            ["SOURCE" /* SOURCE */]: {
              nodeId: doc.metadata.docId,
              nodeType: "DOCUMENT" /* DOCUMENT */,
              metadata: doc.metadata
            }
          }
        }) : doc
      );
    }
    let nodes = this.chunks;
    for (const extractor of transformations) {
      nodes = await extractor.processNodes(nodes);
    }
    this.chunks = this.chunks.map((doc, i) => {
      return new Document({
        text: doc.text,
        metadata: {
          ...doc.metadata,
          ...nodes?.[i]?.metadata || {}
        }
      });
    });
    return this;
  }
  static fromText(text, metadata) {
    return new _MDocument({
      docs: [
        {
          text,
          metadata
        }
      ],
      type: "text"
    });
  }
  static fromHTML(html, metadata) {
    return new _MDocument({
      docs: [
        {
          text: html,
          metadata
        }
      ],
      type: "html"
    });
  }
  static fromMarkdown(markdown, metadata) {
    return new _MDocument({
      docs: [
        {
          text: markdown,
          metadata
        }
      ],
      type: "markdown"
    });
  }
  static fromJSON(jsonString, metadata) {
    return new _MDocument({
      docs: [
        {
          text: jsonString,
          metadata
        }
      ],
      type: "json"
    });
  }
  defaultStrategy() {
    switch (this.type) {
      case "html":
        return "html";
      case "markdown":
        return "markdown";
      case "json":
        return "json";
      case "latex":
        return "latex";
      default:
        return "recursive";
    }
  }
  async chunkBy(strategy, options) {
    switch (strategy) {
      case "recursive":
        await this.chunkRecursive(options);
        break;
      case "character":
        await this.chunkCharacter(options);
        break;
      case "token":
        await this.chunkToken(options);
        break;
      case "markdown":
        await this.chunkMarkdown(options);
        break;
      case "html":
        await this.chunkHTML(options);
        break;
      case "json":
        await this.chunkJSON(options);
        break;
      case "latex":
        await this.chunkLatex(options);
        break;
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }
  async chunkRecursive(options) {
    if (options?.language) {
      const rt2 = RecursiveCharacterTransformer.fromLanguage(options.language, options);
      const textSplit2 = rt2.transformDocuments(this.chunks);
      this.chunks = textSplit2;
      return;
    }
    const rt = new RecursiveCharacterTransformer({
      separators: options?.separators,
      isSeparatorRegex: options?.isSeparatorRegex,
      options
    });
    const textSplit = rt.transformDocuments(this.chunks);
    this.chunks = textSplit;
  }
  async chunkCharacter(options) {
    const rt = new CharacterTransformer({
      separator: options?.separator,
      isSeparatorRegex: options?.isSeparatorRegex,
      options
    });
    const textSplit = rt.transformDocuments(this.chunks);
    this.chunks = textSplit;
  }
  async chunkHTML(options) {
    if (options?.headers?.length) {
      const rt = new HTMLHeaderTransformer(options.headers, options?.returnEachLine);
      const textSplit = rt.transformDocuments(this.chunks);
      this.chunks = textSplit;
      return;
    }
    if (options?.sections?.length) {
      const rt = new HTMLSectionTransformer(options.sections);
      const textSplit = rt.transformDocuments(this.chunks);
      this.chunks = textSplit;
      return;
    }
    throw new Error("HTML chunking requires either headers or sections to be specified");
  }
  async chunkJSON(options) {
    if (!options?.maxSize) {
      throw new Error("JSON chunking requires maxSize to be specified");
    }
    const rt = new RecursiveJsonTransformer({
      maxSize: options?.maxSize,
      minSize: options?.minSize
    });
    const textSplit = rt.transformDocuments({
      documents: this.chunks,
      ensureAscii: options?.ensureAscii,
      convertLists: options?.convertLists
    });
    this.chunks = textSplit;
  }
  async chunkLatex(options) {
    const rt = new LatexTransformer(options);
    const textSplit = rt.transformDocuments(this.chunks);
    this.chunks = textSplit;
  }
  async chunkToken(options) {
    const rt = TokenTransformer.fromTikToken({
      options,
      encodingName: options?.encodingName,
      modelName: options?.modelName
    });
    const textSplit = rt.transformDocuments(this.chunks);
    this.chunks = textSplit;
  }
  async chunkMarkdown(options) {
    if (options?.headers) {
      const rt2 = new MarkdownHeaderTransformer(options.headers, options?.returnEachLine, options?.stripHeaders);
      const textSplit2 = rt2.transformDocuments(this.chunks);
      this.chunks = textSplit2;
      return;
    }
    const rt = new MarkdownTransformer(options);
    const textSplit = rt.transformDocuments(this.chunks);
    this.chunks = textSplit;
  }
  async chunk(params) {
    const { strategy: passedStrategy, extract, ...chunkOptions } = params || {};
    const strategy = passedStrategy || this.defaultStrategy();
    await this.chunkBy(strategy, chunkOptions);
    if (extract) {
      await this.extractMetadata(extract);
    }
    return this.chunks;
  }
  getDocs() {
    return this.chunks;
  }
  getText() {
    return this.chunks.map((doc) => doc.text);
  }
  getMetadata() {
    return this.chunks.map((doc) => doc.metadata);
  }
};
var DEFAULT_WEIGHTS = {
  semantic: 0.4,
  vector: 0.4,
  position: 0.2
};
function calculatePositionScore(position, totalChunks) {
  return 1 - position / totalChunks;
}
function analyzeQueryEmbedding(embedding) {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  const dominantFeatures = embedding.map((value, index) => ({ value: Math.abs(value), index })).sort((a, b) => b.value - a.value).slice(0, 5).map((item) => item.index);
  return { magnitude, dominantFeatures };
}
function adjustScores(score, queryAnalysis) {
  const magnitudeAdjustment = queryAnalysis.magnitude > 10 ? 1.1 : 1;
  const featureStrengthAdjustment = queryAnalysis.magnitude > 5 ? 1.05 : 1;
  return score * magnitudeAdjustment * featureStrengthAdjustment;
}
async function rerank(results, query, model, options) {
  let semanticProvider;
  if (model.modelId === "rerank-v3.5") {
    semanticProvider = new CohereRelevanceScorer(model.modelId);
  } else {
    semanticProvider = new MastraAgentRelevanceScorer(model.provider, model);
  }
  const { queryEmbedding, topK = 3 } = options;
  const weights = {
    ...DEFAULT_WEIGHTS,
    ...options.weights
  };
  const sum = Object.values(weights).reduce((acc, w) => acc.plus(w.toString()), new Big(0));
  if (!sum.eq(1)) {
    throw new Error(`Weights must add up to 1. Got ${sum} from ${weights}`);
  }
  const resultLength = results.length;
  const queryAnalysis = queryEmbedding ? analyzeQueryEmbedding(queryEmbedding) : null;
  const scoredResults = await Promise.all(
    results.map(async (result, index) => {
      let semanticScore = 0;
      if (result?.metadata?.text) {
        semanticScore = await semanticProvider.getRelevanceScore(query, result?.metadata?.text);
      }
      const vectorScore = result.score;
      const positionScore = calculatePositionScore(index, resultLength);
      let finalScore = weights.semantic * semanticScore + weights.vector * vectorScore + weights.position * positionScore;
      if (queryAnalysis) {
        finalScore = adjustScores(finalScore, queryAnalysis);
      }
      return {
        result,
        score: finalScore,
        details: {
          semantic: semanticScore,
          vector: vectorScore,
          position: positionScore,
          ...queryAnalysis && {
            queryAnalysis: {
              magnitude: queryAnalysis.magnitude,
              dominantFeatures: queryAnalysis.dominantFeatures
            }
          }
        }
      };
    })
  );
  return scoredResults.sort((a, b) => b.score - a.score).slice(0, topK);
}

// src/graph-rag/index.ts
var GraphRAG = class {
  nodes;
  edges;
  dimension;
  threshold;
  constructor(dimension = 1536, threshold = 0.7) {
    this.nodes = /* @__PURE__ */ new Map();
    this.edges = [];
    this.dimension = dimension;
    this.threshold = threshold;
  }
  // Add a node to the graph
  addNode(node) {
    if (!node.embedding) {
      throw new Error("Node must have an embedding");
    }
    if (node.embedding.length !== this.dimension) {
      throw new Error(`Embedding dimension must be ${this.dimension}`);
    }
    this.nodes.set(node.id, node);
  }
  // Add an edge between two nodes
  addEdge(edge) {
    if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) {
      throw new Error("Both source and target nodes must exist");
    }
    this.edges.push(edge);
    this.edges.push({
      source: edge.target,
      target: edge.source,
      weight: edge.weight,
      type: edge.type
    });
  }
  // Helper method to get all nodes
  getNodes() {
    return Array.from(this.nodes.values());
  }
  // Helper method to get all edges
  getEdges() {
    return this.edges;
  }
  getEdgesByType(type) {
    return this.edges.filter((edge) => edge.type === type);
  }
  clear() {
    this.nodes.clear();
    this.edges = [];
  }
  updateNodeContent(id, newContent) {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Node ${id} not found`);
    }
    node.content = newContent;
  }
  // Get neighbors of a node
  getNeighbors(nodeId, edgeType) {
    return this.edges.filter((edge) => edge.source === nodeId && (!edgeType || edge.type === edgeType)).map((edge) => ({
      id: edge.target,
      weight: edge.weight
    })).filter((node) => node !== void 0);
  }
  // Calculate cosine similarity between two vectors
  cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2) {
      throw new Error("Vectors must not be null or undefined");
    }
    const vectorLength = vec1.length;
    if (vectorLength !== vec2.length) {
      throw new Error(`Vector dimensions must match: vec1(${vec1.length}) !== vec2(${vec2.length})`);
    }
    let dotProduct = 0;
    let normVec1 = 0;
    let normVec2 = 0;
    for (let i = 0; i < vectorLength; i++) {
      const a = vec1[i];
      const b = vec2[i];
      dotProduct += a * b;
      normVec1 += a * a;
      normVec2 += b * b;
    }
    const magnitudeProduct = Math.sqrt(normVec1 * normVec2);
    if (magnitudeProduct === 0) {
      return 0;
    }
    const similarity = dotProduct / magnitudeProduct;
    return Math.max(-1, Math.min(1, similarity));
  }
  createGraph(chunks, embeddings) {
    if (!chunks?.length || !embeddings?.length) {
      throw new Error("Chunks and embeddings arrays must not be empty");
    }
    if (chunks.length !== embeddings.length) {
      throw new Error("Chunks and embeddings must have the same length");
    }
    chunks.forEach((chunk, index) => {
      const node = {
        id: index.toString(),
        content: chunk.text,
        embedding: embeddings[index]?.vector,
        metadata: { ...chunk.metadata }
      };
      this.addNode(node);
      this.nodes.set(node.id, node);
    });
    for (let i = 0; i < chunks.length; i++) {
      const firstEmbedding = embeddings[i]?.vector;
      for (let j = i + 1; j < chunks.length; j++) {
        const secondEmbedding = embeddings[j]?.vector;
        const similarity = this.cosineSimilarity(firstEmbedding, secondEmbedding);
        if (similarity > this.threshold) {
          this.addEdge({
            source: i.toString(),
            target: j.toString(),
            weight: similarity,
            type: "semantic"
          });
        }
      }
    }
  }
  selectWeightedNeighbor(neighbors) {
    const totalWeight = neighbors.reduce((sum, n) => sum + n.weight, 0);
    let remainingWeight = Math.random() * totalWeight;
    for (const neighbor of neighbors) {
      remainingWeight -= neighbor.weight;
      if (remainingWeight <= 0) {
        return neighbor.id;
      }
    }
    return neighbors[neighbors.length - 1]?.id;
  }
  // Perform random walk with restart
  randomWalkWithRestart(startNodeId, steps, restartProb) {
    const visits = /* @__PURE__ */ new Map();
    let currentNodeId = startNodeId;
    for (let step = 0; step < steps; step++) {
      visits.set(currentNodeId, (visits.get(currentNodeId) || 0) + 1);
      if (Math.random() < restartProb) {
        currentNodeId = startNodeId;
        continue;
      }
      const neighbors = this.getNeighbors(currentNodeId);
      if (neighbors.length === 0) {
        currentNodeId = startNodeId;
        continue;
      }
      currentNodeId = this.selectWeightedNeighbor(neighbors);
    }
    const totalVisits = Array.from(visits.values()).reduce((a, b) => a + b, 0);
    const normalizedVisits = /* @__PURE__ */ new Map();
    for (const [nodeId, count] of visits) {
      normalizedVisits.set(nodeId, count / totalVisits);
    }
    return normalizedVisits;
  }
  // Retrieve relevant nodes using hybrid approach
  query({
    query,
    topK = 10,
    randomWalkSteps = 100,
    restartProb = 0.15
  }) {
    if (!query || query.length !== this.dimension) {
      throw new Error(`Query embedding must have dimension ${this.dimension}`);
    }
    if (topK < 1) {
      throw new Error("TopK must be greater than 0");
    }
    if (randomWalkSteps < 1) {
      throw new Error("Random walk steps must be greater than 0");
    }
    if (restartProb <= 0 || restartProb >= 1) {
      throw new Error("Restart probability must be between 0 and 1");
    }
    const similarities = Array.from(this.nodes.values()).map((node) => ({
      node,
      similarity: this.cosineSimilarity(query, node.embedding)
    }));
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topNodes = similarities.slice(0, topK);
    const rerankedNodes = /* @__PURE__ */ new Map();
    for (const { node, similarity } of topNodes) {
      const walkScores = this.randomWalkWithRestart(node.id, randomWalkSteps, restartProb);
      for (const [nodeId, walkScore] of walkScores) {
        const node2 = this.nodes.get(nodeId);
        const existingScore = rerankedNodes.get(nodeId)?.score || 0;
        rerankedNodes.set(nodeId, {
          node: node2,
          score: existingScore + similarity * walkScore
        });
      }
    }
    return Array.from(rerankedNodes.values()).sort((a, b) => b.score - a.score).slice(0, topK).map((item) => ({
      id: item.node.id,
      content: item.node.content,
      metadata: item.node.metadata,
      score: item.score
    }));
  }
};
var createDocumentChunkerTool = ({
  doc,
  params = {
    strategy: "recursive",
    size: 512,
    overlap: 50,
    separator: "\n"
  }
}) => {
  return createTool({
    id: `Document Chunker ${params.strategy} ${params.size}`,
    inputSchema: z.object({}),
    description: `Chunks document using ${params.strategy} strategy with size ${params.size} and ${params.overlap} overlap`,
    execute: async () => {
      const chunks = await doc.chunk(params);
      return {
        chunks
      };
    }
  });
};
var DatabaseType = /* @__PURE__ */ ((DatabaseType2) => {
  DatabaseType2["Pinecone"] = "pinecone";
  DatabaseType2["PgVector"] = "pgvector";
  DatabaseType2["Chroma"] = "chroma";
  return DatabaseType2;
})(DatabaseType || {});
var DATABASE_TYPE_MAP = Object.keys(DatabaseType);
var vectorQuerySearch = async ({
  indexName,
  vectorStore,
  queryText,
  model,
  queryFilter,
  topK,
  includeVectors = false,
  maxRetries = 2,
  databaseConfig = {}
}) => {
  const { embedding } = await embed({
    value: queryText,
    model,
    maxRetries
  });
  const queryParams = {
    indexName,
    queryVector: embedding,
    topK,
    filter: queryFilter,
    includeVector: includeVectors
  };
  const results = await vectorStore.query({ ...queryParams, ...databaseSpecificParams(databaseConfig) });
  return { results, queryEmbedding: embedding };
};
var databaseSpecificParams = (databaseConfig) => {
  const databaseSpecificParams2 = {};
  if (databaseConfig) {
    if (databaseConfig.pinecone) {
      if (databaseConfig.pinecone.namespace) {
        databaseSpecificParams2.namespace = databaseConfig.pinecone.namespace;
      }
      if (databaseConfig.pinecone.sparseVector) {
        databaseSpecificParams2.sparseVector = databaseConfig.pinecone.sparseVector;
      }
    }
    if (databaseConfig.pgvector) {
      if (databaseConfig.pgvector.minScore !== void 0) {
        databaseSpecificParams2.minScore = databaseConfig.pgvector.minScore;
      }
      if (databaseConfig.pgvector.ef !== void 0) {
        databaseSpecificParams2.ef = databaseConfig.pgvector.ef;
      }
      if (databaseConfig.pgvector.probes !== void 0) {
        databaseSpecificParams2.probes = databaseConfig.pgvector.probes;
      }
    }
    if (databaseConfig.chroma) {
      if (databaseConfig.chroma.where) {
        databaseSpecificParams2.where = databaseConfig.chroma.where;
      }
      if (databaseConfig.chroma.whereDocument) {
        databaseSpecificParams2.whereDocument = databaseConfig.chroma.whereDocument;
      }
    }
    Object.keys(databaseConfig).forEach((dbName) => {
      if (!DATABASE_TYPE_MAP.includes(dbName)) {
        const config = databaseConfig[dbName];
        if (config && typeof config === "object") {
          Object.assign(databaseSpecificParams2, config);
        }
      }
    });
  }
  return databaseSpecificParams2;
};

// src/utils/default-settings.ts
var defaultVectorQueryDescription = () => `Access the knowledge base to find information needed to answer user questions.`;
var defaultGraphRagDescription = () => `Access and analyze relationships between information in the knowledge base to answer complex questions about connections and patterns.`;
var queryTextDescription = `The text query to search for in the vector database.
- ALWAYS provide a non-empty query string
- Must contain the user's question or search terms
- Example: "market data" or "financial reports"
- If the user's query is about a specific topic, use that topic as the queryText
- Cannot be an empty string
- Do not include quotes, just the text itself
- Required for all searches`;
var topKDescription = `Controls how many matching documents to return.
- ALWAYS provide a value
- If no value is provided, use the default (10)
- Must be a valid and positive number
- Cannot be NaN
- Uses provided value if specified
- Default: 10 results (use this if unsure)
- Higher values (like 20) provide more context
- Lower values (like 3) focus on best matches
- Based on query requirements`;
var filterDescription = `JSON-formatted criteria to refine search results.
- ALWAYS provide a filter value
- If no filter is provided, use the default ("{}")
- MUST be a valid, complete JSON object with proper quotes and brackets
- Uses provided filter if specified
- Default: "{}" (no filtering)
- Example for no filtering: "filter": "{}"
- Example: '{"category": "health"}'
- Based on query intent
- Do NOT use single quotes or unquoted properties
- IMPORTANT: Always ensure JSON is properly closed with matching brackets
- Multiple filters can be combined`;
var baseSchema = {
  queryText: z.string().describe(queryTextDescription),
  topK: z.coerce.number().describe(topKDescription)
};
var outputSchema = z.object({
  // Array of metadata or content for compatibility with prior usage
  relevantContext: z.any(),
  // Array of full retrieval result objects
  sources: z.array(
    z.object({
      id: z.string(),
      // Unique chunk/document identifier
      metadata: z.any(),
      // All metadata fields (document ID, etc.)
      vector: z.array(z.number()),
      // Embedding vector (if available)
      score: z.number(),
      // Similarity score for this retrieval
      document: z.string()
      // Full chunk/document text (if available)
    })
  )
});
var filterSchema = z.object({
  ...baseSchema,
  filter: z.coerce.string().describe(filterDescription)
});

// src/utils/convert-sources.ts
var convertToSources = (results) => {
  return results.map((result) => {
    if ("content" in result) {
      return {
        id: result.id,
        vector: result.embedding || [],
        score: result.score,
        metadata: result.metadata,
        document: result.content || ""
      };
    }
    if ("result" in result) {
      return {
        id: result.result.id,
        vector: result.result.vector || [],
        score: result.score,
        metadata: result.result.metadata,
        document: result.result.document || ""
      };
    }
    return {
      id: result.id,
      vector: result.vector || [],
      score: result.score,
      metadata: result.metadata,
      document: result.document || ""
    };
  });
};

// src/tools/types.ts
var defaultGraphOptions = {
  dimension: 1536,
  randomWalkSteps: 100,
  restartProb: 0.15,
  threshold: 0.7
};

// src/tools/graph-rag.ts
var createGraphRAGTool = (options) => {
  const { model, id, description } = options;
  const toolId = id || `GraphRAG ${options.vectorStoreName} ${options.indexName} Tool`;
  const toolDescription = description || defaultGraphRagDescription();
  const graphOptions = {
    ...defaultGraphOptions,
    ...options.graphOptions || {}
  };
  const graphRag = new GraphRAG(graphOptions.dimension, graphOptions.threshold);
  let isInitialized = false;
  const inputSchema = options.enableFilter ? filterSchema : z.object(baseSchema).passthrough();
  return createTool({
    id: toolId,
    inputSchema,
    outputSchema,
    description: toolDescription,
    execute: async ({ context, mastra, runtimeContext }) => {
      const indexName = runtimeContext.get("indexName") ?? options.indexName;
      const vectorStoreName = runtimeContext.get("vectorStoreName") ?? options.vectorStoreName;
      if (!indexName) throw new Error(`indexName is required, got: ${indexName}`);
      if (!vectorStoreName) throw new Error(`vectorStoreName is required, got: ${vectorStoreName}`);
      const includeSources = runtimeContext.get("includeSources") ?? options.includeSources ?? true;
      const randomWalkSteps = runtimeContext.get("randomWalkSteps") ?? graphOptions.randomWalkSteps;
      const restartProb = runtimeContext.get("restartProb") ?? graphOptions.restartProb;
      const topK = runtimeContext.get("topK") ?? context.topK ?? 10;
      const filter = runtimeContext.get("filter") ?? context.filter;
      const queryText = context.queryText;
      const enableFilter = !!runtimeContext.get("filter") || (options.enableFilter ?? false);
      const logger = mastra?.getLogger();
      if (!logger) {
        console.warn(
          "[GraphRAGTool] Logger not initialized: no debug or error logs will be recorded for this tool execution."
        );
      }
      if (logger) {
        logger.debug("[GraphRAGTool] execute called with:", { queryText, topK, filter });
      }
      try {
        const topKValue = typeof topK === "number" && !isNaN(topK) ? topK : typeof topK === "string" && !isNaN(Number(topK)) ? Number(topK) : 10;
        const vectorStore = mastra?.getVector(vectorStoreName);
        if (!vectorStore) {
          if (logger) {
            logger.error("Vector store not found", { vectorStoreName });
          }
          return { relevantContext: [], sources: [] };
        }
        let queryFilter = {};
        if (enableFilter) {
          queryFilter = (() => {
            try {
              return typeof filter === "string" ? JSON.parse(filter) : filter;
            } catch (error) {
              if (logger) {
                logger.warn("Failed to parse filter as JSON, using empty filter", { filter, error });
              }
              return {};
            }
          })();
        }
        if (logger) {
          logger.debug("Prepared vector query parameters:", { queryFilter, topK: topKValue });
        }
        const { results, queryEmbedding } = await vectorQuerySearch({
          indexName,
          vectorStore,
          queryText,
          model,
          queryFilter: Object.keys(queryFilter || {}).length > 0 ? queryFilter : void 0,
          topK: topKValue,
          includeVectors: true
        });
        if (logger) {
          logger.debug("vectorQuerySearch returned results", { count: results.length });
        }
        if (!isInitialized) {
          const chunks = results.map((result) => ({
            text: result?.metadata?.text,
            metadata: result.metadata ?? {}
          }));
          const embeddings = results.map((result) => ({
            vector: result.vector || []
          }));
          if (logger) {
            logger.debug("Initializing graph", { chunkCount: chunks.length, embeddingCount: embeddings.length });
          }
          graphRag.createGraph(chunks, embeddings);
          isInitialized = true;
        } else if (logger) {
          logger.debug("Graph already initialized, skipping graph construction");
        }
        const rerankedResults = graphRag.query({
          query: queryEmbedding,
          topK: topKValue,
          randomWalkSteps,
          restartProb
        });
        if (logger) {
          logger.debug("GraphRAG query returned results", { count: rerankedResults.length });
        }
        const relevantChunks = rerankedResults.map((result) => result.content);
        if (logger) {
          logger.debug("Returning relevant context chunks", { count: relevantChunks.length });
        }
        const sources = includeSources ? convertToSources(rerankedResults) : [];
        return {
          relevantContext: relevantChunks,
          sources
        };
      } catch (err) {
        if (logger) {
          logger.error("Unexpected error in VectorQueryTool execute", {
            error: err,
            errorMessage: err instanceof Error ? err.message : String(err),
            errorStack: err instanceof Error ? err.stack : void 0
          });
        }
        return { relevantContext: [], sources: [] };
      }
    }
    // Use any for output schema as the structure of the output causes type inference issues
  });
};
var createVectorQueryTool = (options) => {
  const { model, id, description } = options;
  const toolId = id || `VectorQuery ${options.vectorStoreName} ${options.indexName} Tool`;
  const toolDescription = description || defaultVectorQueryDescription();
  const inputSchema = options.enableFilter ? filterSchema : z.object(baseSchema).passthrough();
  return createTool({
    id: toolId,
    description: toolDescription,
    inputSchema,
    outputSchema,
    execute: async ({ context, mastra, runtimeContext }) => {
      const indexName = runtimeContext.get("indexName") ?? options.indexName;
      const vectorStoreName = runtimeContext.get("vectorStoreName") ?? options.vectorStoreName;
      const includeVectors = runtimeContext.get("includeVectors") ?? options.includeVectors ?? false;
      const includeSources = runtimeContext.get("includeSources") ?? options.includeSources ?? true;
      const reranker = runtimeContext.get("reranker") ?? options.reranker;
      const databaseConfig = runtimeContext.get("databaseConfig") ?? options.databaseConfig;
      if (!indexName) throw new Error(`indexName is required, got: ${indexName}`);
      if (!vectorStoreName) throw new Error(`vectorStoreName is required, got: ${vectorStoreName}`);
      const topK = runtimeContext.get("topK") ?? context.topK ?? 10;
      const filter = runtimeContext.get("filter") ?? context.filter;
      const queryText = context.queryText;
      const enableFilter = !!runtimeContext.get("filter") || (options.enableFilter ?? false);
      const logger = mastra?.getLogger();
      if (!logger) {
        console.warn(
          "[VectorQueryTool] Logger not initialized: no debug or error logs will be recorded for this tool execution."
        );
      }
      if (logger) {
        logger.debug("[VectorQueryTool] execute called with:", { queryText, topK, filter, databaseConfig });
      }
      try {
        const topKValue = typeof topK === "number" && !isNaN(topK) ? topK : typeof topK === "string" && !isNaN(Number(topK)) ? Number(topK) : 10;
        const vectorStore = mastra?.getVector(vectorStoreName);
        if (!vectorStore) {
          if (logger) {
            logger.error("Vector store not found", { vectorStoreName });
          }
          return { relevantContext: [], sources: [] };
        }
        let queryFilter = {};
        if (enableFilter && filter) {
          queryFilter = (() => {
            try {
              return typeof filter === "string" ? JSON.parse(filter) : filter;
            } catch (error) {
              if (logger) {
                logger.warn("Failed to parse filter as JSON, using empty filter", { filter, error });
              }
              return {};
            }
          })();
        }
        if (logger) {
          logger.debug("Prepared vector query parameters", { queryText, topK: topKValue, queryFilter, databaseConfig });
        }
        const { results } = await vectorQuerySearch({
          indexName,
          vectorStore,
          queryText,
          model,
          queryFilter: Object.keys(queryFilter || {}).length > 0 ? queryFilter : void 0,
          topK: topKValue,
          includeVectors,
          databaseConfig
        });
        if (logger) {
          logger.debug("vectorQuerySearch returned results", { count: results.length });
        }
        if (reranker) {
          if (logger) {
            logger.debug("Reranking results", { rerankerModel: reranker.model, rerankerOptions: reranker.options });
          }
          const rerankedResults = await rerank(results, queryText, reranker.model, {
            ...reranker.options,
            topK: reranker.options?.topK || topKValue
          });
          if (logger) {
            logger.debug("Reranking complete", { rerankedCount: rerankedResults.length });
          }
          const relevantChunks2 = rerankedResults.map(({ result }) => result?.metadata);
          if (logger) {
            logger.debug("Returning reranked relevant context chunks", { count: relevantChunks2.length });
          }
          const sources2 = includeSources ? convertToSources(rerankedResults) : [];
          return { relevantContext: relevantChunks2, sources: sources2 };
        }
        const relevantChunks = results.map((result) => result?.metadata);
        if (logger) {
          logger.debug("Returning relevant context chunks", { count: relevantChunks.length });
        }
        const sources = includeSources ? convertToSources(results) : [];
        return {
          relevantContext: relevantChunks,
          sources
        };
      } catch (err) {
        if (logger) {
          logger.error("Unexpected error in VectorQueryTool execute", {
            error: err,
            errorMessage: err instanceof Error ? err.message : String(err),
            errorStack: err instanceof Error ? err.stack : void 0
          });
        }
        return { relevantContext: [], sources: [] };
      }
    }
    // Use any for output schema as the structure of the output causes type inference issues
  });
};

// src/utils/vector-prompts.ts
var ASTRA_PROMPT = `When querying Astra, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }
- $all: Match all values in array
  Example: { "tags": { "$all": ["premium", "sale"] } }

Logical Operators:
- $and: Logical AND (can be implicit or explicit)
  Implicit Example: { "price": { "$gt": 100 }, "category": "electronics" }
  Explicit Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }
- $not: Logical NOT
  Example: { "$not": { "category": "electronics" } }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }

Special Operators:
- $size: Array length check
  Example: { "tags": { "$size": 2 } }

Restrictions:
- Regex patterns are not supported
- Only $and, $or, and $not logical operators are supported
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
- Empty arrays in $in/$nin will return no results
- A non-empty array is required for $all operator
- Only logical operators ($and, $or, $not) can be used at the top level
- All other operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- $not operator:
  - Must be an object
  - Cannot be empty
  - Can be used at field level or top level
  - Valid: { "$not": { "field": "value" } }
  - Valid: { "field": { "$not": { "$eq": "value" } } }
- Other logical operators ($and, $or):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }

Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics", "computers"] } },
    { "price": { "$gte": 100, "$lte": 1000 } },
    { "tags": { "$all": ["premium"] } },
    { "rating": { "$exists": true, "$gt": 4 } },
    { "$or": [
      { "stock": { "$gt": 0 } },
      { "preorder": true }
    ]}
  ]
}`;
var CHROMA_PROMPT = `When querying Chroma, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }

Logical Operators:
- $and: Logical AND
  Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Restrictions:
- Regex patterns are not supported
- Element operators are not supported
- Only $and and $or logical operators are supported
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
- Empty arrays in $in/$nin will return no results
- If multiple top-level fields exist, they're wrapped in $and
- Only logical operators ($and, $or) can be used at the top level
- All other operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
  Invalid: { "$in": [...] }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- Logical operators ($and, $or):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }
Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics", "computers"] } },
    { "price": { "$gte": 100, "$lte": 1000 } },
    { "$or": [
      { "inStock": true },
      { "preorder": true }
    ]}
  ]
}`;
var LIBSQL_PROMPT = `When querying LibSQL Vector, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }
- $all: Match all values in array
  Example: { "tags": { "$all": ["premium", "sale"] } }
- $elemMatch: Match array elements that meet all specified conditions
  Example: { "items": { "$elemMatch": { "price": { "$gt": 100 } } } }
- $contains: Check if array contains value
  Example: { "tags": { "$contains": "premium" } }

Logical Operators:
- $and: Logical AND (implicit when using multiple conditions)
  Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }
- $not: Logical NOT
  Example: { "$not": { "category": "electronics" } }
- $nor: Logical NOR
  Example: { "$nor": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }

Special Operators:
- $size: Array length check
  Example: { "tags": { "$size": 2 } }

Restrictions:
- Regex patterns are not supported
- Direct RegExp patterns will throw an error
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
- Array operations work on array fields only
- Basic operators handle array values as JSON strings
- Empty arrays in conditions are handled gracefully
- Only logical operators ($and, $or, $not, $nor) can be used at the top level
- All other operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
  Invalid: { "$contains": "value" }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- $not operator:
  - Must be an object
  - Cannot be empty
  - Can be used at field level or top level
  - Valid: { "$not": { "field": "value" } }
  - Valid: { "field": { "$not": { "$eq": "value" } } }
- Other logical operators ($and, $or, $nor):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }
- $elemMatch requires an object with conditions
  Valid: { "array": { "$elemMatch": { "field": "value" } } }
  Invalid: { "array": { "$elemMatch": "value" } }

Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics", "computers"] } },
    { "price": { "$gte": 100, "$lte": 1000 } },
    { "tags": { "$all": ["premium", "sale"] } },
    { "items": { "$elemMatch": { "price": { "$gt": 50 }, "inStock": true } } },
    { "$or": [
      { "stock": { "$gt": 0 } },
      { "preorder": true }
    ]}
  ]
}`;
var PGVECTOR_PROMPT = `When querying PG Vector, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }
- $all: Match all values in array
  Example: { "tags": { "$all": ["premium", "sale"] } }
- $elemMatch: Match array elements that meet all specified conditions
  Example: { "items": { "$elemMatch": { "price": { "$gt": 100 } } } }
- $contains: Check if array contains value
  Example: { "tags": { "$contains": "premium" } }

Logical Operators:
- $and: Logical AND
  Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }
- $not: Logical NOT
  Example: { "$not": { "category": "electronics" } }
- $nor: Logical NOR
  Example: { "$nor": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }

Special Operators:
- $size: Array length check
  Example: { "tags": { "$size": 2 } }
- $regex: Pattern matching (PostgreSQL regex syntax)
  Example: { "name": { "$regex": "^iphone" } }
- $options: Regex options (used with $regex)
  Example: { "name": { "$regex": "iphone", "$options": "i" } }

Restrictions:
- Direct RegExp patterns are supported
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
- Array operations work on array fields only
- Regex patterns must follow PostgreSQL syntax
- Empty arrays in conditions are handled gracefully
- Only logical operators ($and, $or, $not, $nor) can be used at the top level
- All other operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
  Invalid: { "$regex": "pattern" }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- $not operator:
  - Must be an object
  - Cannot be empty
  - Can be used at field level or top level
  - Valid: { "$not": { "field": "value" } }
  - Valid: { "field": { "$not": { "$eq": "value" } } }
- Other logical operators ($and, $or, $nor):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }
- $elemMatch requires an object with conditions
  Valid: { "array": { "$elemMatch": { "field": "value" } } }
  Invalid: { "array": { "$elemMatch": "value" } }

Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics", "computers"] } },
    { "price": { "$gte": 100, "$lte": 1000 } },
    { "tags": { "$all": ["premium", "sale"] } },
    { "items": { "$elemMatch": { "price": { "$gt": 50 }, "inStock": true } } },
    { "$or": [
      { "name": { "$regex": "^iphone", "$options": "i" } },
      { "description": { "$regex": ".*apple.*" } }
    ]}
  ]
}`;
var PINECONE_PROMPT = `When querying Pinecone, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }
- $all: Match all values in array
  Example: { "tags": { "$all": ["premium", "sale"] } }

Logical Operators:
- $and: Logical AND (can be implicit or explicit)
  Implicit Example: { "price": { "$gt": 100 }, "category": "electronics" }
  Explicit Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }

Restrictions:
- Regex patterns are not supported
- Only $and and $or logical operators are supported at the top level
- Empty arrays in $in/$nin will return no results
- A non-empty array is required for $all operator
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
- At least one key-value pair is required in filter object
- Empty objects and undefined values are treated as no filter
- Invalid types in comparison operators will throw errors
- All non-logical operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- Logical operators ($and, $or):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }
Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics", "computers"] } },
    { "price": { "$gte": 100, "$lte": 1000 } },
    { "tags": { "$all": ["premium", "sale"] } },
    { "rating": { "$exists": true, "$gt": 4 } },
    { "$or": [
      { "stock": { "$gt": 0 } },
      { "preorder": true }
    ]}
  ]
}`;
var QDRANT_PROMPT = `When querying Qdrant, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }

Logical Operators:
- $and: Logical AND (implicit when using multiple conditions)
  Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }
- $not: Logical NOT
  Example: { "$not": { "category": "electronics" } }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }

Special Operators:
- $regex: Pattern matching
  Example: { "name": { "$regex": "iphone.*" } }
- $count: Array length/value count
  Example: { "tags": { "$count": { "$gt": 2 } } }
- $geo: Geographical filters (supports radius, box, polygon)
  Example: {
    "location": {
      "$geo": {
        "type": "radius",
        "center": { "lat": 52.5, "lon": 13.4 },
        "radius": 10000
      }
    }
  }
- $hasId: Match specific document IDs
  Example: { "$hasId": ["doc1", "doc2"] }
- $hasVector: Check vector existence
  Example: { "$hasVector": "" }
- $datetime: RFC 3339 datetime range
  Example: {
    "created_at": {
      "$datetime": {
        "range": {
          "gt": "2024-01-01T00:00:00Z",
          "lt": "2024-12-31T23:59:59Z"
        }
      }
    }
  }
- $null: Check for null values
  Example: { "field": { "$null": true } }
- $empty: Check for empty values
  Example: { "array": { "$empty": true } }
- $nested: Nested object filters
  Example: {
    "items[]": {
      "$nested": {
        "price": { "$gt": 100 },
        "stock": { "$gt": 0 }
      }
    }
  }

Restrictions:
- Only logical operators ($and, $or, $not) and collection operators ($hasId, $hasVector) can be used at the top level
- All other operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Valid: { "$hasId": [...] }
  Invalid: { "$gt": 100 }
- Nested fields are supported using dot notation
- Array fields with nested objects use [] suffix: "items[]"
- Geo filtering requires specific format for radius, box, or polygon
- Datetime values must be in RFC 3339 format
- Empty arrays in conditions are handled as empty values
- Null values are handled with $null operator
- Empty values are handled with $empty operator
- $regex uses standard regex syntax
- $count can only be used with numeric comparison operators
- $nested requires an object with conditions
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- $not operator:
  - Must be an object
  - Cannot be empty
  - Can be used at field level or top level
  - Valid: { "$not": { "field": "value" } }
  - Valid: { "field": { "$not": { "$eq": "value" } } }
- Other logical operators ($and, $or):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }
Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics"] } },
    { "price": { "$gt": 100 } },
    { "location": {
      "$geo": {
        "type": "radius",
        "center": { "lat": 52.5, "lon": 13.4 },
        "radius": 5000
      }
    }},
    { "items[]": {
      "$nested": {
        "price": { "$gt": 50 },
        "stock": { "$gt": 0 }
      }
    }},
    { "created_at": {
      "$datetime": {
        "range": {
          "gt": "2024-01-01T00:00:00Z"
        }
      }
    }},
    { "$or": [
      { "status": { "$ne": "discontinued" } },
      { "clearance": true }
    ]}
  ]
}`;
var UPSTASH_PROMPT = `When querying Upstash Vector, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" } or { "category": { "$eq": "electronics" } }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }
- $all: Matches all values in array
  Example: { "tags": { "$all": ["premium", "new"] } }

Logical Operators:
- $and: Logical AND (implicit when using multiple conditions)
  Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }
- $not: Logical NOT
  Example: { "$not": { "category": "electronics" } }
- $nor: Logical NOR
  Example: { "$nor": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }

Special Operators:
- $regex: Pattern matching using glob syntax (only as operator, not direct RegExp)
  Example: { "name": { "$regex": "iphone*" } }
- $contains: Check if array/string contains value
  Example: { "tags": { "$contains": "premium" } }

Restrictions:
- Null/undefined values are not supported in any operator
- Empty arrays are only supported in $in/$nin operators
- Direct RegExp patterns are not supported, use $regex with glob syntax
- Nested fields are supported using dot notation
- Multiple conditions on same field are combined with AND
- String values with quotes are automatically escaped
- Only logical operators ($and, $or, $not, $nor) can be used at the top level
- All other operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
- $regex uses glob syntax (*, ?) not standard regex patterns
- $contains works on both arrays and string fields
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- $not operator:
  - Must be an object
  - Cannot be empty
  - Can be used at field level or top level
  - Valid: { "$not": { "field": "value" } }
  - Valid: { "field": { "$not": { "$eq": "value" } } }
- Other logical operators ($and, $or, $nor):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }
Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics", "computers"] } },
    { "price": { "$gt": 100, "$lt": 1000 } },
    { "tags": { "$all": ["premium", "new"] } },
    { "name": { "$regex": "iphone*" } },
    { "description": { "$contains": "latest" } },
    { "$or": [
      { "brand": "Apple" },
      { "rating": { "$gte": 4.5 } }
    ]}
  ]
}`;
var VECTORIZE_PROMPT = `When querying Vectorize, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }

Restrictions:
- Regex patterns are not supported
- Logical operators are not supported
- Element operators are not supported
- Fields must have a flat structure, as nested fields are not supported
- Multiple conditions on the same field are supported
- Empty arrays in $in/$nin will return no results
- Filter keys cannot be longer than 512 characters
- Filter keys cannot contain invalid characters ($, ", empty)
- Filter size is limited to prevent oversized queries
- Invalid types in operators return no results instead of throwing errors
- Empty objects are accepted in filters
- Metadata must use flat structure with dot notation (no nested objects)
- Must explicitly create metadata indexes for filterable fields (limit 10 per index)
- Can only effectively filter on indexed metadata fields
- Metadata values can be strings, numbers, booleans, or homogeneous arrays
- No operators can be used at the top level (no logical operators supported)
- All operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Invalid: { "$gt": 100 }
  Invalid: { "$in": [...] }

Example Complex Query:
{
  "category": { "$in": ["electronics", "computers"] },
  "price": { "$gte": 100, "$lte": 1000 },
  "inStock": true
}`;
var MONGODB_PROMPT = `When querying MongoDB, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }
- $all: Match all values in array
  Example: { "tags": { "$all": ["premium", "sale"] } }
- $elemMatch: Match array elements by criteria
  Example: { "scores": { "$elemMatch": { "$gt": 80 } } }

Logical Operators:
- $and: Logical AND (can be implicit or explicit)
  Implicit Example: { "price": { "$gt": 100 }, "category": "electronics" }
  Explicit Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }
- $not: Logical NOT
  Example: { "field": { "$not": { "$eq": "value" } } }
- $nor: Logical NOR
  Example: { "$nor": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }

Special Operators:
- $regex: Regular expression match
  Example: { "title": { "$regex": "^laptop", "$options": "i" } }
- $size: Array length check
  Example: { "tags": { "$size": 2 } }

Usage Notes:
- You can use both 'filter' (for metadata fields) and 'documentFilter' (for document content fields).
- Nested fields are supported using dot notation (e.g., "metadata.author.name").
- Multiple conditions on the same field are supported with both implicit and explicit $and.
- Empty arrays in $in/$nin will return no results.
- All logical operators ($and, $or, $not, $nor) can be used at the top level or nested.
- All other operators must be used within a field condition.
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
- $not operator:
  - Must be an object
  - Cannot be empty
  - Can be used at field level or top level
  - Valid: { "$not": { "field": "value" } }
  - Valid: { "field": { "$not": { "$eq": "value" } } }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- Regex uses standard MongoDB regex syntax (with optional $options).
- Metadata values can be strings, numbers, booleans, or arrays.
- Metadata and document fields can be filtered in the same query.

Example Complex Query:
{
  "category": { "$in": ["electronics", "computers"] },
  "price": { "$gte": 100, "$lte": 1000 },
  "inStock": true,
  "title": { "$regex": "laptop", "$options": "i" },
  "$or": [
    { "brand": "Apple" },
    { "rating": { "$gte": 4.5 } }
  ]
}
`;

export { ASTRA_PROMPT, CHROMA_PROMPT, GraphRAG, LIBSQL_PROMPT, MDocument, MONGODB_PROMPT, PGVECTOR_PROMPT, PINECONE_PROMPT, QDRANT_PROMPT, UPSTASH_PROMPT, VECTORIZE_PROMPT, createDocumentChunkerTool, createGraphRAGTool, createVectorQueryTool, defaultGraphRagDescription, defaultVectorQueryDescription, filterDescription, queryTextDescription, rerank, topKDescription };
