'use strict';

var chunkASKESBJW_cjs = require('./chunk-ASKESBJW.cjs');
var chunk64U3UDTH_cjs = require('./chunk-64U3UDTH.cjs');
var chunkOCWPVYNI_cjs = require('./chunk-OCWPVYNI.cjs');
var chunk75ZPJI57_cjs = require('./chunk-75ZPJI57.cjs');
var web = require('stream/web');
var di = require('@mastra/core/di');

// src/server/handlers/workflows.ts
var workflows_exports = {};
chunk75ZPJI57_cjs.__export(workflows_exports, {
  createWorkflowRunHandler: () => createWorkflowRunHandler,
  getWorkflowByIdHandler: () => getWorkflowByIdHandler,
  getWorkflowRunByIdHandler: () => getWorkflowRunByIdHandler,
  getWorkflowRunExecutionResultHandler: () => getWorkflowRunExecutionResultHandler,
  getWorkflowRunsHandler: () => getWorkflowRunsHandler,
  getWorkflowsHandler: () => getWorkflowsHandler,
  resumeAsyncWorkflowHandler: () => resumeAsyncWorkflowHandler,
  resumeWorkflowHandler: () => resumeWorkflowHandler,
  startAsyncWorkflowHandler: () => startAsyncWorkflowHandler,
  startWorkflowRunHandler: () => startWorkflowRunHandler,
  streamWorkflowHandler: () => streamWorkflowHandler,
  watchWorkflowHandler: () => watchWorkflowHandler
});
async function getWorkflowsHandler({ mastra }) {
  try {
    const workflows = mastra.getWorkflows({ serialized: false });
    const _workflows = Object.entries(workflows).reduce((acc, [key, workflow]) => {
      acc[key] = {
        name: workflow.name,
        description: workflow.description,
        steps: Object.entries(workflow.steps).reduce((acc2, [key2, step]) => {
          acc2[key2] = {
            id: step.id,
            description: step.description,
            inputSchema: step.inputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(step.inputSchema)) : void 0,
            outputSchema: step.outputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(step.outputSchema)) : void 0,
            resumeSchema: step.resumeSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(step.resumeSchema)) : void 0,
            suspendSchema: step.suspendSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(step.suspendSchema)) : void 0
          };
          return acc2;
        }, {}),
        stepGraph: workflow.serializedStepGraph,
        inputSchema: workflow.inputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(workflow.inputSchema)) : void 0,
        outputSchema: workflow.outputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(workflow.outputSchema)) : void 0
      };
      return acc;
    }, {});
    return _workflows;
  } catch (error) {
    throw new chunkOCWPVYNI_cjs.HTTPException(500, { message: error?.message || "Error getting workflows" });
  }
}
async function getWorkflowsFromSystem({ mastra, workflowId }) {
  const logger = mastra.getLogger();
  if (!workflowId) {
    throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
  }
  let workflow;
  try {
    workflow = mastra.getWorkflow(workflowId);
  } catch (error) {
    logger.debug("Error getting workflow, searching agents for workflow", error);
  }
  if (!workflow) {
    logger.debug("Workflow not found, searching agents for workflow", { workflowId });
    const agents = mastra.getAgents();
    if (Object.keys(agents || {}).length) {
      for (const [_, agent] of Object.entries(agents)) {
        try {
          const workflows = await agent.getWorkflows();
          if (workflows[workflowId]) {
            workflow = workflows[workflowId];
            break;
          }
          break;
        } catch (error) {
          logger.debug("Error getting workflow from agent", error);
        }
      }
    }
  }
  if (!workflow) {
    throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
  }
  return { workflow };
}
async function getWorkflowByIdHandler({ mastra, workflowId }) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    return {
      steps: Object.entries(workflow.steps).reduce((acc, [key, step]) => {
        acc[key] = {
          id: step.id,
          description: step.description,
          inputSchema: step.inputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(step.inputSchema)) : void 0,
          outputSchema: step.outputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(step.outputSchema)) : void 0,
          resumeSchema: step.resumeSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(step.resumeSchema)) : void 0,
          suspendSchema: step.suspendSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(step.suspendSchema)) : void 0
        };
        return acc;
      }, {}),
      name: workflow.name,
      description: workflow.description,
      stepGraph: workflow.serializedStepGraph,
      inputSchema: workflow.inputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(workflow.inputSchema)) : void 0,
      outputSchema: workflow.outputSchema ? chunkASKESBJW_cjs.stringify(chunkASKESBJW_cjs.esm_default(workflow.outputSchema)) : void 0
    };
  } catch (error) {
    throw new chunkOCWPVYNI_cjs.HTTPException(500, { message: error?.message || "Error getting workflow" });
  }
}
async function getWorkflowRunByIdHandler({
  mastra,
  workflowId,
  runId
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    if (!runId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Run ID is required" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    const run = await workflow.getWorkflowRunById(runId);
    if (!run) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow run not found" });
    }
    return run;
  } catch (error) {
    throw new chunkOCWPVYNI_cjs.HTTPException(500, { message: error?.message || "Error getting workflow run" });
  }
}
async function getWorkflowRunExecutionResultHandler({
  mastra,
  workflowId,
  runId
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    if (!runId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Run ID is required" });
    }
    const workflow = mastra.getWorkflow(workflowId);
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    const executionResult = await workflow.getWorkflowRunExecutionResult(runId);
    if (!executionResult) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow run execution result not found" });
    }
    return executionResult;
  } catch (error) {
    throw new chunkOCWPVYNI_cjs.HTTPException(500, {
      message: error?.message || "Error getting workflow run execution result"
    });
  }
}
async function createWorkflowRunHandler({
  mastra,
  workflowId,
  runId: prevRunId
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    const run = workflow.createRun({ runId: prevRunId });
    return { runId: run.runId };
  } catch (error) {
    throw new chunkOCWPVYNI_cjs.HTTPException(500, { message: error?.message || "Error creating workflow run" });
  }
}
async function startAsyncWorkflowHandler({
  mastra,
  runtimeContext: payloadRuntimeContext,
  workflowId,
  runId,
  inputData
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    let runtimeContext;
    if (payloadRuntimeContext) {
      runtimeContext = new di.RuntimeContext();
      Object.entries(payloadRuntimeContext || {}).forEach(([key, value]) => {
        runtimeContext.set(key, value);
      });
    }
    const _run = workflow.createRun({ runId });
    const result = await _run.start({
      inputData,
      runtimeContext
    });
    return result;
  } catch (error) {
    throw new chunkOCWPVYNI_cjs.HTTPException(500, { message: error?.message || "Error executing workflow" });
  }
}
async function startWorkflowRunHandler({
  mastra,
  runtimeContext: payloadRuntimeContext,
  workflowId,
  runId,
  inputData
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    if (!runId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "runId required to start run" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    const run = await workflow.getWorkflowRunById(runId);
    if (!run) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow run not found" });
    }
    let runtimeContext;
    if (payloadRuntimeContext) {
      runtimeContext = new di.RuntimeContext();
      Object.entries(payloadRuntimeContext || {}).forEach(([key, value]) => {
        runtimeContext.set(key, value);
      });
    }
    const _run = workflow.createRun({ runId });
    void _run.start({
      inputData,
      runtimeContext
    });
    return { message: "Workflow run started" };
  } catch (e) {
    return chunk64U3UDTH_cjs.handleError(e, "Error starting workflow run");
  }
}
async function watchWorkflowHandler({
  mastra,
  workflowId,
  runId
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    if (!runId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "runId required to watch workflow" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    const run = await workflow.getWorkflowRunById(runId);
    if (!run) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow run not found" });
    }
    const _run = workflow.createRun({ runId });
    let unwatch;
    let asyncRef = null;
    const stream = new web.ReadableStream({
      start(controller) {
        unwatch = _run.watch(({ type, payload, eventTimestamp }) => {
          controller.enqueue(JSON.stringify({ type, payload, eventTimestamp, runId }));
          if (asyncRef) {
            clearImmediate(asyncRef);
            asyncRef = null;
          }
          asyncRef = setImmediate(async () => {
            const runDone = payload.workflowState.status !== "running";
            if (runDone) {
              controller.close();
              unwatch?.();
            }
          });
        });
      },
      cancel() {
        unwatch?.();
      }
    });
    return stream;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error watching workflow");
  }
}
async function streamWorkflowHandler({
  mastra,
  runtimeContext: payloadRuntimeContext,
  workflowId,
  runId,
  inputData
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    if (!runId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "runId required to resume workflow" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    let runtimeContext;
    if (payloadRuntimeContext) {
      runtimeContext = new di.RuntimeContext();
      Object.entries(payloadRuntimeContext || {}).forEach(([key, value]) => {
        runtimeContext.set(key, value);
      });
    }
    const run = workflow.createRun({ runId });
    const result = run.stream({
      inputData,
      runtimeContext
    });
    return result;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error executing workflow");
  }
}
async function resumeAsyncWorkflowHandler({
  mastra,
  workflowId,
  runId,
  body,
  runtimeContext: payloadRuntimeContext
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    if (!runId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "runId required to resume workflow" });
    }
    if (!body.step) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "step required to resume workflow" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    const run = await workflow.getWorkflowRunById(runId);
    if (!run) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow run not found" });
    }
    let runtimeContext;
    if (payloadRuntimeContext) {
      runtimeContext = new di.RuntimeContext();
      Object.entries(payloadRuntimeContext || {}).forEach(([key, value]) => {
        runtimeContext.set(key, value);
      });
    }
    const _run = workflow.createRun({ runId });
    const result = await _run.resume({
      step: body.step,
      resumeData: body.resumeData,
      runtimeContext
    });
    return result;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error resuming workflow step");
  }
}
async function resumeWorkflowHandler({
  mastra,
  workflowId,
  runId,
  body,
  runtimeContext: payloadRuntimeContext
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    if (!runId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "runId required to resume workflow" });
    }
    if (!body.step) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "step required to resume workflow" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    const run = await workflow.getWorkflowRunById(runId);
    if (!run) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow run not found" });
    }
    let runtimeContext;
    if (payloadRuntimeContext) {
      runtimeContext = new di.RuntimeContext();
      Object.entries(payloadRuntimeContext || {}).forEach(([key, value]) => {
        runtimeContext.set(key, value);
      });
    }
    const _run = workflow.createRun({ runId });
    void _run.resume({
      step: body.step,
      resumeData: body.resumeData,
      runtimeContext
    });
    return { message: "Workflow run resumed" };
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error resuming workflow");
  }
}
async function getWorkflowRunsHandler({
  mastra,
  workflowId,
  fromDate,
  toDate,
  limit,
  offset,
  resourceId
}) {
  try {
    if (!workflowId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Workflow ID is required" });
    }
    const { workflow } = await getWorkflowsFromSystem({ mastra, workflowId });
    if (!workflow) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Workflow not found" });
    }
    const workflowRuns = await workflow.getWorkflowRuns({ fromDate, toDate, limit, offset, resourceId }) || {
      runs: [],
      total: 0
    };
    return workflowRuns;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error getting workflow runs");
  }
}

exports.createWorkflowRunHandler = createWorkflowRunHandler;
exports.getWorkflowByIdHandler = getWorkflowByIdHandler;
exports.getWorkflowRunByIdHandler = getWorkflowRunByIdHandler;
exports.getWorkflowRunExecutionResultHandler = getWorkflowRunExecutionResultHandler;
exports.getWorkflowRunsHandler = getWorkflowRunsHandler;
exports.getWorkflowsHandler = getWorkflowsHandler;
exports.resumeAsyncWorkflowHandler = resumeAsyncWorkflowHandler;
exports.resumeWorkflowHandler = resumeWorkflowHandler;
exports.startAsyncWorkflowHandler = startAsyncWorkflowHandler;
exports.startWorkflowRunHandler = startWorkflowRunHandler;
exports.streamWorkflowHandler = streamWorkflowHandler;
exports.watchWorkflowHandler = watchWorkflowHandler;
exports.workflows_exports = workflows_exports;
