'use strict';

var core = require('@mastra/core');
var hooks = require('@mastra/core/hooks');
var storage = require('@mastra/core/storage');
var utils = require('@mastra/core/utils');

// src/constants.ts
var GLOBAL_RUN_ID_ENV_KEY = "_MASTRA_GLOBAL_RUN_ID_";

// src/evaluation.ts
async function evaluate(agent, input, metric) {
  const testInfo = await getCurrentTestInfo();
  let globalRunId = process.env[GLOBAL_RUN_ID_ENV_KEY];
  const runId = crypto.randomUUID();
  const agentOutput = await agent.generate(input, {
    runId
  });
  if (!globalRunId) {
    globalRunId = process.env[GLOBAL_RUN_ID_ENV_KEY] = crypto.randomUUID();
    console.warn('Global run id not set, you should run "globalSetup" from "@mastra/evals" before evaluating.');
  }
  const metricResult = await core.evaluate({
    agentName: agent.name,
    input,
    metric,
    output: agentOutput.text,
    globalRunId,
    runId,
    testInfo,
    instructions: agent.instructions
  });
  return metricResult;
}
var getCurrentTestInfo = async () => {
  if (typeof expect !== "undefined" && expect.getState) {
    const state = expect.getState();
    return {
      testName: state.currentTestName,
      testPath: state.testPath
    };
  }
  try {
    const vitest = await import('./dist-4KUUED6R.cjs');
    if (typeof vitest !== "undefined" && vitest.expect?.getState) {
      const state = vitest.expect.getState();
      return {
        testName: state.currentTestName,
        testPath: state.testPath
      };
    }
  } catch {
  }
  return void 0;
};
async function attachListeners(mastra) {
  hooks.registerHook(hooks.AvailableHooks.ON_EVALUATION, async (traceObject) => {
    const storage$1 = mastra?.getStorage();
    if (storage$1) {
      const logger = mastra?.getLogger();
      const areFieldsValid = utils.checkEvalStorageFields(traceObject, logger);
      if (!areFieldsValid) return;
      await storage$1.insert({
        tableName: storage.TABLE_EVALS,
        record: {
          input: traceObject.input,
          output: traceObject.output,
          result: JSON.stringify(traceObject.result || {}),
          agent_name: traceObject.agentName,
          metric_name: traceObject.metricName,
          instructions: traceObject.instructions,
          test_info: traceObject.testInfo ? JSON.stringify(traceObject.testInfo) : null,
          global_run_id: traceObject.globalRunId,
          run_id: traceObject.runId,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    }
  });
}
async function globalSetup() {
  if (process.env[GLOBAL_RUN_ID_ENV_KEY]) {
    throw new Error('Global run id already set, you should only run "GlobalSetup" once');
  }
  const globalRunId = crypto.randomUUID();
  process.env[GLOBAL_RUN_ID_ENV_KEY] = globalRunId;
}

exports.attachListeners = attachListeners;
exports.evaluate = evaluate;
exports.globalSetup = globalSetup;
