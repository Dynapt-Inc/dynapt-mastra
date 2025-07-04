import { MastraTTS } from './chunk-X5SQG5QX.js';
import { MastraVector } from './chunk-WWKY4EQ7.js';
import { Workflow } from './chunk-OYNUZURI.js';
export { DefaultExecutionEngine, ExecutionEngine, Run, cloneStep, cloneWorkflow, createStep, createWorkflow } from './chunk-OYNUZURI.js';
import { MastraMemory } from './chunk-DVZMAHQO.js';
export { MemoryProcessor, memoryDefaultOptions } from './chunk-DVZMAHQO.js';
export { CohereRelevanceScorer, MastraAgentRelevanceScorer, createSimilarityPrompt } from './chunk-42YZQOIR.js';
import { MastraStorage } from './chunk-7PJSQZ2G.js';
export { Metric, evaluate } from './chunk-PK5QRKSG.js';
export { createMockModel } from './chunk-HNEE7IF4.js';
import { Integration, OpenAPIToolset } from './chunk-4UWPFBC6.js';
export { Mastra } from './chunk-YAXZ7AL5.js';
import { Agent } from './chunk-ATXD4775.js';
export { AvailableHooks, executeHook, registerHook } from './chunk-BB4KXGBU.js';
export { InstrumentClass, OTLPTraceExporter as OTLPStorageExporter, Telemetry, getBaggageValues, hasActiveTelemetry, withSpan } from './chunk-IFQGBW42.js';
export { checkEvalStorageFields, createMastraProxy, deepMerge, delay, ensureToolProperties, isCoreMessage, isUiMessage, isZodType, makeCoreTool, maskStreamTags, parseFieldKey, parseSqlIdentifier, resolveSerializedZodOutput } from './chunk-HJQYQAIJ.js';
import { Tool } from './chunk-C4LMN2IR.js';
export { createTool } from './chunk-C4LMN2IR.js';
import { MastraDeployer } from './chunk-JNMQKJH4.js';
import { MastraBase } from './chunk-5IEKR756.js';

// src/agent/index.warning.ts
var Agent2 = class extends Agent {
  constructor(config) {
    super(config);
    this.logger.warn('Please import "Agent from "@mastra/core/agent" instead of "@mastra/core"');
  }
};

// src/base.warning.ts
var MastraBase2 = class extends MastraBase {
  constructor(args) {
    super(args);
    this.logger.warn('Please import "MastraBase" from "@mastra/core/base" instead of "@mastra/core"');
  }
};

// src/deployer/index.warning.ts
var MastraDeployer2 = class extends MastraDeployer {
  constructor(args) {
    super(args);
    this.logger.warn('Please import "MastraDeployer" from "@mastra/core/deployer" instead of "@mastra/core"');
  }
};

// src/storage/base.warning.ts
var MastraStorage2 = class extends MastraStorage {
  constructor({ name }) {
    super({
      name
    });
    this.logger.warn('Please import "MastraStorage" from "@mastra/core/storage" instead of "@mastra/core"');
  }
};

// src/integration/integration.warning.ts
var Integration2 = class extends Integration {
  constructor() {
    super();
    console.warn('Please import "Integration" from "@mastra/core/integration" instead of "@mastra/core"');
  }
};

// src/integration/openapi-toolset.warning.ts
var OpenAPIToolset2 = class extends OpenAPIToolset {
  constructor() {
    super();
    console.warn('Please import "OpenAPIToolset" from "@mastra/core/integration" instead of "@mastra/core"');
  }
};

// src/memory/index.warning.ts
var MastraMemory2 = class extends MastraMemory {
  constructor(_arg) {
    super({ name: `Deprecated memory` });
    this.logger.warn('Please import "MastraMemory" from "@mastra/core/memory" instead of "@mastra/core"');
  }
};

// src/tools/index.warning.ts
var Tool2 = class extends Tool {
  constructor(opts) {
    super(opts);
    console.warn('Please import "Tool" from "@mastra/core/tools" instead of "@mastra/core"');
  }
};

// src/tts/index.warning.ts
var MastraTTS2 = class extends MastraTTS {
  constructor(args) {
    super(args);
    this.logger.warn('Please import "MastraTTS" from "@mastra/core/tts" instead of "@mastra/core"');
  }
};

// src/vector/index.warning.ts
var MastraVector2 = class extends MastraVector {
  constructor() {
    super();
    this.logger.warn('Please import "MastraVector" from "@mastra/core/vector" instead of "@mastra/core"');
  }
};

// src/workflows/workflow.warning.ts
var Workflow2 = class extends Workflow {
  constructor(args) {
    super(args);
    this.logger.warn('Please import "Workflow" from "@mastra/core/workflows" instead of "@mastra/core"');
  }
};

export { Agent2 as Agent, Integration2 as Integration, MastraBase2 as MastraBase, MastraDeployer2 as MastraDeployer, MastraMemory2 as MastraMemory, MastraStorage2 as MastraStorage, MastraTTS2 as MastraTTS, MastraVector2 as MastraVector, OpenAPIToolset2 as OpenAPIToolset, Tool2 as Tool, Workflow2 as Workflow };
