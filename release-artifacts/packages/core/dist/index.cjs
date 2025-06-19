'use strict';

var chunkQE4SMNY3_cjs = require('./chunk-QE4SMNY3.cjs');
var chunkPDK2ZFRX_cjs = require('./chunk-PDK2ZFRX.cjs');
var chunkGSMJGWQS_cjs = require('./chunk-GSMJGWQS.cjs');
var chunkHUZTNNHH_cjs = require('./chunk-HUZTNNHH.cjs');
var chunk5ETY3Q3F_cjs = require('./chunk-5ETY3Q3F.cjs');
var chunkKKCGZKNC_cjs = require('./chunk-KKCGZKNC.cjs');
var chunk3C6V2FEP_cjs = require('./chunk-3C6V2FEP.cjs');
var chunkMUNFCOMB_cjs = require('./chunk-MUNFCOMB.cjs');
var chunkB7SQOKEC_cjs = require('./chunk-B7SQOKEC.cjs');
var chunkKH6G3F2Z_cjs = require('./chunk-KH6G3F2Z.cjs');
var chunk7KWHHSK5_cjs = require('./chunk-7KWHHSK5.cjs');
var chunkST5RMVLG_cjs = require('./chunk-ST5RMVLG.cjs');
var chunkL5FURQXC_cjs = require('./chunk-L5FURQXC.cjs');
var chunkUOKJ7SQO_cjs = require('./chunk-UOKJ7SQO.cjs');
var chunk4Z3OU5RY_cjs = require('./chunk-4Z3OU5RY.cjs');
var chunkZZLBNB3U_cjs = require('./chunk-ZZLBNB3U.cjs');
var chunkP3Q73CAW_cjs = require('./chunk-P3Q73CAW.cjs');

// src/agent/index.warning.ts
var Agent2 = class extends chunk7KWHHSK5_cjs.Agent {
  constructor(config) {
    super(config);
    this.logger.warn('Please import "Agent from "@mastra/core/agent" instead of "@mastra/core"');
  }
};

// src/base.warning.ts
var MastraBase2 = class extends chunkP3Q73CAW_cjs.MastraBase {
  constructor(args) {
    super(args);
    this.logger.warn('Please import "MastraBase" from "@mastra/core/base" instead of "@mastra/core"');
  }
};

// src/deployer/index.warning.ts
var MastraDeployer2 = class extends chunkZZLBNB3U_cjs.MastraDeployer {
  constructor(args) {
    super(args);
    this.logger.warn('Please import "MastraDeployer" from "@mastra/core/deployer" instead of "@mastra/core"');
  }
};

// src/storage/base.warning.ts
var MastraStorage2 = class extends chunkKKCGZKNC_cjs.MastraStorage {
  constructor({ name }) {
    super({
      name
    });
    this.logger.warn('Please import "MastraStorage" from "@mastra/core/storage" instead of "@mastra/core"');
  }
};

// src/integration/integration.warning.ts
var Integration2 = class extends chunkB7SQOKEC_cjs.Integration {
  constructor() {
    super();
    console.warn('Please import "Integration" from "@mastra/core/integration" instead of "@mastra/core"');
  }
};

// src/integration/openapi-toolset.warning.ts
var OpenAPIToolset2 = class extends chunkB7SQOKEC_cjs.OpenAPIToolset {
  constructor() {
    super();
    console.warn('Please import "OpenAPIToolset" from "@mastra/core/integration" instead of "@mastra/core"');
  }
};

// src/memory/index.warning.ts
var MastraMemory2 = class extends chunkHUZTNNHH_cjs.MastraMemory {
  constructor(_arg) {
    super({ name: `Deprecated memory` });
    this.logger.warn('Please import "MastraMemory" from "@mastra/core/memory" instead of "@mastra/core"');
  }
};

// src/tools/index.warning.ts
var Tool2 = class extends chunk4Z3OU5RY_cjs.Tool {
  constructor(opts) {
    super(opts);
    console.warn('Please import "Tool" from "@mastra/core/tools" instead of "@mastra/core"');
  }
};

// src/tts/index.warning.ts
var MastraTTS2 = class extends chunkQE4SMNY3_cjs.MastraTTS {
  constructor(args) {
    super(args);
    this.logger.warn('Please import "MastraTTS" from "@mastra/core/tts" instead of "@mastra/core"');
  }
};

// src/vector/index.warning.ts
var MastraVector2 = class extends chunkPDK2ZFRX_cjs.MastraVector {
  constructor() {
    super();
    this.logger.warn('Please import "MastraVector" from "@mastra/core/vector" instead of "@mastra/core"');
  }
};

// src/workflows/workflow.warning.ts
var Workflow2 = class extends chunkGSMJGWQS_cjs.Workflow {
  constructor(args) {
    super(args);
    this.logger.warn('Please import "Workflow" from "@mastra/core/workflows" instead of "@mastra/core"');
  }
};

Object.defineProperty(exports, "DefaultExecutionEngine", {
  enumerable: true,
  get: function () { return chunkGSMJGWQS_cjs.DefaultExecutionEngine; }
});
Object.defineProperty(exports, "ExecutionEngine", {
  enumerable: true,
  get: function () { return chunkGSMJGWQS_cjs.ExecutionEngine; }
});
Object.defineProperty(exports, "Run", {
  enumerable: true,
  get: function () { return chunkGSMJGWQS_cjs.Run; }
});
Object.defineProperty(exports, "cloneStep", {
  enumerable: true,
  get: function () { return chunkGSMJGWQS_cjs.cloneStep; }
});
Object.defineProperty(exports, "cloneWorkflow", {
  enumerable: true,
  get: function () { return chunkGSMJGWQS_cjs.cloneWorkflow; }
});
Object.defineProperty(exports, "createStep", {
  enumerable: true,
  get: function () { return chunkGSMJGWQS_cjs.createStep; }
});
Object.defineProperty(exports, "createWorkflow", {
  enumerable: true,
  get: function () { return chunkGSMJGWQS_cjs.createWorkflow; }
});
Object.defineProperty(exports, "MemoryProcessor", {
  enumerable: true,
  get: function () { return chunkHUZTNNHH_cjs.MemoryProcessor; }
});
Object.defineProperty(exports, "memoryDefaultOptions", {
  enumerable: true,
  get: function () { return chunkHUZTNNHH_cjs.memoryDefaultOptions; }
});
Object.defineProperty(exports, "CohereRelevanceScorer", {
  enumerable: true,
  get: function () { return chunk5ETY3Q3F_cjs.CohereRelevanceScorer; }
});
Object.defineProperty(exports, "MastraAgentRelevanceScorer", {
  enumerable: true,
  get: function () { return chunk5ETY3Q3F_cjs.MastraAgentRelevanceScorer; }
});
Object.defineProperty(exports, "createSimilarityPrompt", {
  enumerable: true,
  get: function () { return chunk5ETY3Q3F_cjs.createSimilarityPrompt; }
});
Object.defineProperty(exports, "Metric", {
  enumerable: true,
  get: function () { return chunk3C6V2FEP_cjs.Metric; }
});
Object.defineProperty(exports, "evaluate", {
  enumerable: true,
  get: function () { return chunk3C6V2FEP_cjs.evaluate; }
});
Object.defineProperty(exports, "createMockModel", {
  enumerable: true,
  get: function () { return chunkMUNFCOMB_cjs.createMockModel; }
});
Object.defineProperty(exports, "Mastra", {
  enumerable: true,
  get: function () { return chunkKH6G3F2Z_cjs.Mastra; }
});
Object.defineProperty(exports, "AvailableHooks", {
  enumerable: true,
  get: function () { return chunkST5RMVLG_cjs.AvailableHooks; }
});
Object.defineProperty(exports, "executeHook", {
  enumerable: true,
  get: function () { return chunkST5RMVLG_cjs.executeHook; }
});
Object.defineProperty(exports, "registerHook", {
  enumerable: true,
  get: function () { return chunkST5RMVLG_cjs.registerHook; }
});
Object.defineProperty(exports, "InstrumentClass", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.InstrumentClass; }
});
Object.defineProperty(exports, "OTLPStorageExporter", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.OTLPTraceExporter; }
});
Object.defineProperty(exports, "Telemetry", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.Telemetry; }
});
Object.defineProperty(exports, "getBaggageValues", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.getBaggageValues; }
});
Object.defineProperty(exports, "hasActiveTelemetry", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.hasActiveTelemetry; }
});
Object.defineProperty(exports, "withSpan", {
  enumerable: true,
  get: function () { return chunkL5FURQXC_cjs.withSpan; }
});
Object.defineProperty(exports, "checkEvalStorageFields", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.checkEvalStorageFields; }
});
Object.defineProperty(exports, "createMastraProxy", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.createMastraProxy; }
});
Object.defineProperty(exports, "deepMerge", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.deepMerge; }
});
Object.defineProperty(exports, "delay", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.delay; }
});
Object.defineProperty(exports, "ensureToolProperties", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.ensureToolProperties; }
});
Object.defineProperty(exports, "isCoreMessage", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.isCoreMessage; }
});
Object.defineProperty(exports, "isUiMessage", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.isUiMessage; }
});
Object.defineProperty(exports, "isZodType", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.isZodType; }
});
Object.defineProperty(exports, "makeCoreTool", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.makeCoreTool; }
});
Object.defineProperty(exports, "maskStreamTags", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.maskStreamTags; }
});
Object.defineProperty(exports, "parseFieldKey", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.parseFieldKey; }
});
Object.defineProperty(exports, "parseSqlIdentifier", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.parseSqlIdentifier; }
});
Object.defineProperty(exports, "resolveSerializedZodOutput", {
  enumerable: true,
  get: function () { return chunkUOKJ7SQO_cjs.resolveSerializedZodOutput; }
});
Object.defineProperty(exports, "createTool", {
  enumerable: true,
  get: function () { return chunk4Z3OU5RY_cjs.createTool; }
});
exports.Agent = Agent2;
exports.Integration = Integration2;
exports.MastraBase = MastraBase2;
exports.MastraDeployer = MastraDeployer2;
exports.MastraMemory = MastraMemory2;
exports.MastraStorage = MastraStorage2;
exports.MastraTTS = MastraTTS2;
exports.MastraVector = MastraVector2;
exports.OpenAPIToolset = OpenAPIToolset2;
exports.Tool = Tool2;
exports.Workflow = Workflow2;
