import { randomUUID } from 'crypto';
import { subscribe } from '@inngest/realtime';
import { RuntimeContext } from '@mastra/core/di';
import { Tool } from '@mastra/core/tools';
import { Run, Workflow, DefaultExecutionEngine } from '@mastra/core/workflows';
import { EMITTER_SYMBOL } from '@mastra/core/workflows/_constants';
import { serve as serve$1 } from 'inngest/hono';
import { z } from 'zod';

// src/index.ts
function serve({ mastra, inngest }) {
  const wfs = mastra.getWorkflows();
  const functions = Object.values(wfs).flatMap((wf) => {
    if (wf instanceof InngestWorkflow) {
      wf.__registerMastra(mastra);
      return wf.getFunctions();
    }
    return [];
  });
  return serve$1({
    client: inngest,
    functions
  });
}
var InngestRun = class extends Run {
  inngest;
  serializedStepGraph;
  #mastra;
  constructor(params, inngest) {
    super(params);
    this.inngest = inngest;
    this.serializedStepGraph = params.serializedStepGraph;
    this.#mastra = params.mastra;
  }
  async getRuns(eventId) {
    const response = await fetch(`${this.inngest.apiBaseUrl ?? "https://api.inngest.com"}/v1/events/${eventId}/runs`, {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`
      }
    });
    const json = await response.json();
    return json.data;
  }
  async getRunOutput(eventId) {
    let runs = await this.getRuns(eventId);
    while (runs?.[0]?.status !== "Completed" || runs?.[0]?.event_id !== eventId) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      runs = await this.getRuns(eventId);
      if (runs?.[0]?.status === "Failed" || runs?.[0]?.status === "Cancelled") {
        throw new Error(`Function run ${runs?.[0]?.status}`);
      }
    }
    return runs?.[0];
  }
  async sendEvent(event, data) {
    await this.inngest.send({
      name: `user-event-${event}`,
      data
    });
  }
  async start({
    inputData
  }) {
    await this.#mastra.getStorage()?.persistWorkflowSnapshot({
      workflowName: this.workflowId,
      runId: this.runId,
      snapshot: {
        runId: this.runId,
        serializedStepGraph: this.serializedStepGraph,
        value: {},
        context: {},
        activePaths: [],
        suspendedPaths: {},
        timestamp: Date.now(),
        status: "running"
      }
    });
    const eventOutput = await this.inngest.send({
      name: `workflow.${this.workflowId}`,
      data: {
        inputData,
        runId: this.runId
      }
    });
    const eventId = eventOutput.ids[0];
    if (!eventId) {
      throw new Error("Event ID is not set");
    }
    const runOutput = await this.getRunOutput(eventId);
    const result = runOutput?.output?.result;
    if (result.status === "failed") {
      result.error = new Error(result.error);
    }
    this.cleanup?.();
    return result;
  }
  async resume(params) {
    const p = this._resume(params).then((result) => {
      if (result.status !== "suspended") {
        this.closeStreamAction?.().catch(() => {
        });
      }
      return result;
    });
    this.executionResults = p;
    return p;
  }
  async _resume(params) {
    const steps = (Array.isArray(params.step) ? params.step : [params.step]).map(
      (step) => typeof step === "string" ? step : step?.id
    );
    const snapshot = await this.#mastra?.storage?.loadWorkflowSnapshot({
      workflowName: this.workflowId,
      runId: this.runId
    });
    const eventOutput = await this.inngest.send({
      name: `workflow.${this.workflowId}`,
      data: {
        inputData: params.resumeData,
        runId: this.runId,
        stepResults: snapshot?.context,
        resume: {
          steps,
          stepResults: snapshot?.context,
          resumePayload: params.resumeData,
          // @ts-ignore
          resumePath: snapshot?.suspendedPaths?.[steps?.[0]]
        }
      }
    });
    const eventId = eventOutput.ids[0];
    if (!eventId) {
      throw new Error("Event ID is not set");
    }
    const runOutput = await this.getRunOutput(eventId);
    const result = runOutput?.output?.result;
    if (result.status === "failed") {
      result.error = new Error(result.error);
    }
    return result;
  }
  watch(cb, type = "watch") {
    let active = true;
    const streamPromise = subscribe(
      {
        channel: `workflow:${this.workflowId}:${this.runId}`,
        topics: [type],
        app: this.inngest
      },
      (message) => {
        if (active) {
          cb(message.data);
        }
      }
    );
    return () => {
      active = false;
      streamPromise.then(async (stream) => {
        return stream.cancel();
      }).catch((err) => {
        console.error(err);
      });
    };
  }
  stream({ inputData, runtimeContext } = {}) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const unwatch = this.watch(async (event) => {
      try {
        await writer.write(event);
      } catch {
      }
    }, "watch-v2");
    this.closeStreamAction = async () => {
      unwatch();
      try {
        await writer.close();
      } catch (err) {
        console.error("Error closing stream:", err);
      } finally {
        writer.releaseLock();
      }
    };
    this.executionResults = this.start({ inputData, runtimeContext }).then((result) => {
      if (result.status !== "suspended") {
        this.closeStreamAction?.().catch(() => {
        });
      }
      return result;
    });
    return {
      stream: readable,
      getWorkflowState: () => this.executionResults
    };
  }
};
var InngestWorkflow = class _InngestWorkflow extends Workflow {
  #mastra;
  inngest;
  function;
  constructor(params, inngest) {
    super(params);
    this.#mastra = params.mastra;
    this.inngest = inngest;
  }
  async getWorkflowRuns(args) {
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Cannot get workflow runs. Mastra engine is not initialized");
      return { runs: [], total: 0 };
    }
    return storage.getWorkflowRuns({ workflowName: this.id, ...args ?? {} });
  }
  async getWorkflowRunById(runId) {
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Cannot get workflow runs. Mastra engine is not initialized");
      return this.runs.get(runId) ? { ...this.runs.get(runId), workflowName: this.id } : null;
    }
    const run = await storage.getWorkflowRunById({ runId, workflowName: this.id });
    return run ?? (this.runs.get(runId) ? { ...this.runs.get(runId), workflowName: this.id } : null);
  }
  async getWorkflowRunExecutionResult(runId) {
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Cannot get workflow run execution result. Mastra storage is not initialized");
      return null;
    }
    const run = await storage.getWorkflowRunById({ runId, workflowName: this.id });
    if (!run?.snapshot) {
      return null;
    }
    if (typeof run.snapshot === "string") {
      return null;
    }
    return {
      status: run.snapshot.status,
      result: run.snapshot.result,
      error: run.snapshot.error,
      payload: run.snapshot.context?.input,
      steps: run.snapshot.context
    };
  }
  __registerMastra(mastra) {
    this.#mastra = mastra;
    this.executionEngine.__registerMastra(mastra);
    const updateNested = (step) => {
      if ((step.type === "step" || step.type === "loop" || step.type === "foreach") && step.step instanceof _InngestWorkflow) {
        step.step.__registerMastra(mastra);
      } else if (step.type === "parallel" || step.type === "conditional") {
        for (const subStep of step.steps) {
          updateNested(subStep);
        }
      }
    };
    if (this.executionGraph.steps.length) {
      for (const step of this.executionGraph.steps) {
        updateNested(step);
      }
    }
  }
  createRun(options) {
    const runIdToUse = options?.runId || randomUUID();
    const run = this.runs.get(runIdToUse) ?? new InngestRun(
      {
        workflowId: this.id,
        runId: runIdToUse,
        executionEngine: this.executionEngine,
        executionGraph: this.executionGraph,
        serializedStepGraph: this.serializedStepGraph,
        mastra: this.#mastra,
        retryConfig: this.retryConfig,
        cleanup: () => this.runs.delete(runIdToUse)
      },
      this.inngest
    );
    this.runs.set(runIdToUse, run);
    return run;
  }
  getFunction() {
    if (this.function) {
      return this.function;
    }
    this.function = this.inngest.createFunction(
      // @ts-ignore
      { id: `workflow.${this.id}`, retries: this.retryConfig?.attempts ?? 0 },
      { event: `workflow.${this.id}` },
      async ({ event, step, attempt, publish }) => {
        let { inputData, runId, resume } = event.data;
        if (!runId) {
          runId = await step.run(`workflow.${this.id}.runIdGen`, async () => {
            return randomUUID();
          });
        }
        const emitter = {
          emit: async (event2, data) => {
            if (!publish) {
              return;
            }
            try {
              await publish({
                channel: `workflow:${this.id}:${runId}`,
                topic: event2,
                data
              });
            } catch (err) {
              this.logger.error("Error emitting event: " + (err?.stack ?? err?.message ?? err));
            }
          },
          on: (_event, _callback) => {
          },
          off: (_event, _callback) => {
          },
          once: (_event, _callback) => {
          }
        };
        const engine = new InngestExecutionEngine(this.#mastra, step, attempt);
        const result = await engine.execute({
          workflowId: this.id,
          runId,
          graph: this.executionGraph,
          serializedStepGraph: this.serializedStepGraph,
          input: inputData,
          emitter,
          retryConfig: this.retryConfig,
          runtimeContext: new RuntimeContext(),
          // TODO
          resume
        });
        return { result, runId };
      }
    );
    return this.function;
  }
  getNestedFunctions(steps) {
    return steps.flatMap((step) => {
      if (step.type === "step" || step.type === "loop" || step.type === "foreach") {
        if (step.step instanceof _InngestWorkflow) {
          return [step.step.getFunction(), ...step.step.getNestedFunctions(step.step.executionGraph.steps)];
        }
        return [];
      } else if (step.type === "parallel" || step.type === "conditional") {
        return this.getNestedFunctions(step.steps);
      }
      return [];
    });
  }
  getFunctions() {
    return [this.getFunction(), ...this.getNestedFunctions(this.executionGraph.steps)];
  }
};
function isAgent(params) {
  return params?.component === "AGENT";
}
function isTool(params) {
  return params instanceof Tool;
}
function createStep(params) {
  if (isAgent(params)) {
    return {
      id: params.name,
      // @ts-ignore
      inputSchema: z.object({
        prompt: z.string()
        // resourceId: z.string().optional(),
        // threadId: z.string().optional(),
      }),
      // @ts-ignore
      outputSchema: z.object({
        text: z.string()
      }),
      execute: async ({ inputData, [EMITTER_SYMBOL]: emitter, runtimeContext }) => {
        let streamPromise = {};
        streamPromise.promise = new Promise((resolve, reject) => {
          streamPromise.resolve = resolve;
          streamPromise.reject = reject;
        });
        const toolData = {
          name: params.name,
          args: inputData
        };
        await emitter.emit("watch-v2", {
          type: "tool-call-streaming-start",
          ...toolData
        });
        const { fullStream } = await params.stream(inputData.prompt, {
          // resourceId: inputData.resourceId,
          // threadId: inputData.threadId,
          runtimeContext,
          onFinish: (result) => {
            streamPromise.resolve(result.text);
          }
        });
        for await (const chunk of fullStream) {
          switch (chunk.type) {
            case "text-delta":
              await emitter.emit("watch-v2", {
                type: "tool-call-delta",
                ...toolData,
                argsTextDelta: chunk.textDelta
              });
              break;
            case "step-start":
            case "step-finish":
            case "finish":
              break;
            case "tool-call":
            case "tool-result":
            case "tool-call-streaming-start":
            case "tool-call-delta":
            case "source":
            case "file":
            default:
              await emitter.emit("watch-v2", chunk);
              break;
          }
        }
        return {
          text: await streamPromise.promise
        };
      }
    };
  }
  if (isTool(params)) {
    if (!params.inputSchema || !params.outputSchema) {
      throw new Error("Tool must have input and output schemas defined");
    }
    return {
      // TODO: tool probably should have strong id type
      // @ts-ignore
      id: params.id,
      inputSchema: params.inputSchema,
      outputSchema: params.outputSchema,
      execute: async ({ inputData, mastra, runtimeContext }) => {
        return params.execute({
          context: inputData,
          mastra,
          runtimeContext
        });
      }
    };
  }
  return {
    id: params.id,
    description: params.description,
    inputSchema: params.inputSchema,
    outputSchema: params.outputSchema,
    resumeSchema: params.resumeSchema,
    suspendSchema: params.suspendSchema,
    execute: params.execute
  };
}
function init(inngest) {
  return {
    createWorkflow(params) {
      return new InngestWorkflow(params, inngest);
    },
    createStep,
    cloneStep(step, opts) {
      return {
        id: opts.id,
        description: step.description,
        inputSchema: step.inputSchema,
        outputSchema: step.outputSchema,
        execute: step.execute
      };
    },
    cloneWorkflow(workflow, opts) {
      const wf = new Workflow({
        id: opts.id,
        inputSchema: workflow.inputSchema,
        outputSchema: workflow.outputSchema,
        steps: workflow.stepDefs,
        mastra: workflow.mastra
      });
      wf.setStepFlow(workflow.stepGraph);
      wf.commit();
      return wf;
    }
  };
}
var InngestExecutionEngine = class extends DefaultExecutionEngine {
  inngestStep;
  inngestAttempts;
  constructor(mastra, inngestStep, inngestAttempts = 0) {
    super({ mastra });
    this.inngestStep = inngestStep;
    this.inngestAttempts = inngestAttempts;
  }
  async execute(params) {
    await params.emitter.emit("watch-v2", {
      type: "start",
      payload: { runId: params.runId }
    });
    const result = await super.execute(params);
    await params.emitter.emit("watch-v2", {
      type: "finish",
      payload: { runId: params.runId }
    });
    return result;
  }
  async fmtReturnValue(executionSpan, emitter, stepResults, lastOutput, error) {
    const base = {
      status: lastOutput.status,
      steps: stepResults
    };
    if (lastOutput.status === "success") {
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          workflowState: {
            status: lastOutput.status,
            steps: stepResults,
            result: lastOutput.output
          }
        },
        eventTimestamp: Date.now()
      });
      base.result = lastOutput.output;
    } else if (lastOutput.status === "failed") {
      base.error = error instanceof Error ? error?.stack ?? error.message : lastOutput?.error instanceof Error ? lastOutput.error.message : lastOutput.error ?? error ?? "Unknown error";
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          workflowState: {
            status: lastOutput.status,
            steps: stepResults,
            result: null,
            error: base.error
          }
        },
        eventTimestamp: Date.now()
      });
    } else if (lastOutput.status === "suspended") {
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          workflowState: {
            status: lastOutput.status,
            steps: stepResults,
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
      const suspendedStepIds = Object.entries(stepResults).flatMap(([stepId, stepResult]) => {
        if (stepResult?.status === "suspended") {
          const nestedPath = stepResult?.payload?.__workflow_meta?.path;
          return nestedPath ? [[stepId, ...nestedPath]] : [[stepId]];
        }
        return [];
      });
      base.suspended = suspendedStepIds;
    }
    executionSpan?.end();
    return base;
  }
  async superExecuteStep({
    workflowId,
    runId,
    step,
    stepResults,
    executionContext,
    resume,
    prevOutput,
    emitter,
    runtimeContext
  }) {
    return super.executeStep({
      workflowId,
      runId,
      step,
      stepResults,
      executionContext,
      resume,
      prevOutput,
      emitter,
      runtimeContext
    });
  }
  async executeSleep({ id, duration }) {
    await this.inngestStep.sleep(id, duration);
  }
  async executeWaitForEvent({ event, timeout }) {
    const eventData = await this.inngestStep.waitForEvent(`user-event-${event}`, {
      event: `user-event-${event}`,
      timeout: timeout ?? 5e3
    });
    if (eventData === null) {
      throw "Timeout waiting for event";
    }
    return eventData?.data;
  }
  async executeStep({
    step,
    stepResults,
    executionContext,
    resume,
    prevOutput,
    emitter,
    runtimeContext
  }) {
    const startedAt = await this.inngestStep.run(
      `workflow.${executionContext.workflowId}.run.${executionContext.runId}.step.${step.id}.running_ev`,
      async () => {
        const startedAt2 = Date.now();
        await emitter.emit("watch", {
          type: "watch",
          payload: {
            currentStep: {
              id: step.id,
              status: "running"
            },
            workflowState: {
              status: "running",
              steps: {
                ...stepResults,
                [step.id]: {
                  status: "running"
                }
              },
              result: null,
              error: null
            }
          },
          eventTimestamp: Date.now()
        });
        await emitter.emit("watch-v2", {
          type: "step-start",
          payload: {
            id: step.id
          }
        });
        return startedAt2;
      }
    );
    if (step instanceof InngestWorkflow) {
      const isResume = !!resume?.steps?.length;
      let result;
      let runId;
      if (isResume) {
        runId = stepResults[resume?.steps?.[0]]?.payload?.__workflow_meta?.runId ?? randomUUID();
        const snapshot = await this.mastra?.getStorage()?.loadWorkflowSnapshot({
          workflowName: step.id,
          runId
        });
        const invokeResp = await this.inngestStep.invoke(`workflow.${executionContext.workflowId}.step.${step.id}`, {
          function: step.getFunction(),
          data: {
            inputData: prevOutput,
            runId,
            resume: {
              runId,
              steps: resume.steps.slice(1),
              stepResults: snapshot?.context,
              resumePayload: resume.resumePayload,
              // @ts-ignore
              resumePath: snapshot?.suspendedPaths?.[resume.steps?.[1]]
            }
          }
        });
        result = invokeResp.result;
        runId = invokeResp.runId;
      } else {
        const invokeResp = await this.inngestStep.invoke(`workflow.${executionContext.workflowId}.step.${step.id}`, {
          function: step.getFunction(),
          data: {
            inputData: prevOutput
          }
        });
        result = invokeResp.result;
        runId = invokeResp.runId;
      }
      const res = await this.inngestStep.run(
        `workflow.${executionContext.workflowId}.step.${step.id}.nestedwf-results`,
        async () => {
          if (result.status === "failed") {
            await emitter.emit("watch", {
              type: "watch",
              payload: {
                currentStep: {
                  id: step.id,
                  status: "failed",
                  error: result?.error
                },
                workflowState: {
                  status: "running",
                  steps: stepResults,
                  result: null,
                  error: null
                }
              },
              eventTimestamp: Date.now()
            });
            await emitter.emit("watch-v2", {
              type: "step-result",
              payload: {
                id: step.id,
                status: "failed"
              }
            });
            return { executionContext, result: { status: "failed", error: result?.error } };
          } else if (result.status === "suspended") {
            const suspendedSteps = Object.entries(result.steps).filter(([_stepName, stepResult]) => {
              const stepRes2 = stepResult;
              return stepRes2?.status === "suspended";
            });
            for (const [stepName, stepResult] of suspendedSteps) {
              const suspendPath = [stepName, ...stepResult?.payload?.__workflow_meta?.path ?? []];
              executionContext.suspendedPaths[step.id] = executionContext.executionPath;
              await emitter.emit("watch", {
                type: "watch",
                payload: {
                  currentStep: {
                    id: step.id,
                    status: "suspended",
                    payload: { ...stepResult?.payload, __workflow_meta: { runId, path: suspendPath } }
                  },
                  workflowState: {
                    status: "running",
                    steps: stepResults,
                    result: null,
                    error: null
                  }
                },
                eventTimestamp: Date.now()
              });
              await emitter.emit("watch-v2", {
                type: "step-suspended",
                payload: {
                  id: step.id
                }
              });
              return {
                executionContext,
                result: {
                  status: "suspended",
                  payload: { ...stepResult?.payload, __workflow_meta: { runId, path: suspendPath } }
                }
              };
            }
            await emitter.emit("watch", {
              type: "watch",
              payload: {
                currentStep: {
                  id: step.id,
                  status: "suspended",
                  payload: {}
                },
                workflowState: {
                  status: "running",
                  steps: stepResults,
                  result: null,
                  error: null
                }
              },
              eventTimestamp: Date.now()
            });
            return {
              executionContext,
              result: {
                status: "suspended",
                payload: {}
              }
            };
          }
          await emitter.emit("watch", {
            type: "watch",
            payload: {
              currentStep: {
                id: step.id,
                status: "success",
                output: result?.result
              },
              workflowState: {
                status: "running",
                steps: stepResults,
                result: null,
                error: null
              }
            },
            eventTimestamp: Date.now()
          });
          await emitter.emit("watch-v2", {
            type: "step-finish",
            payload: {
              id: step.id,
              metadata: {}
            }
          });
          return { executionContext, result: { status: "success", output: result?.result } };
        }
      );
      Object.assign(executionContext, res.executionContext);
      return res.result;
    }
    const stepRes = await this.inngestStep.run(`workflow.${executionContext.workflowId}.step.${step.id}`, async () => {
      let execResults;
      let suspended;
      try {
        const result = await step.execute({
          runId: executionContext.runId,
          mastra: this.mastra,
          runtimeContext,
          inputData: prevOutput,
          resumeData: resume?.steps[0] === step.id ? resume?.resumePayload : void 0,
          getInitData: () => stepResults?.input,
          getStepResult: (step2) => {
            const result2 = stepResults[step2.id];
            if (result2?.status === "success") {
              return result2.output;
            }
            return null;
          },
          suspend: async (suspendPayload) => {
            executionContext.suspendedPaths[step.id] = executionContext.executionPath;
            suspended = { payload: suspendPayload };
          },
          resume: {
            steps: resume?.steps?.slice(1) || [],
            resumePayload: resume?.resumePayload,
            // @ts-ignore
            runId: stepResults[step.id]?.payload?.__workflow_meta?.runId
          },
          [EMITTER_SYMBOL]: emitter,
          engine: {
            step: this.inngestStep
          }
        });
        const endedAt = Date.now();
        execResults = {
          status: "success",
          output: result,
          startedAt,
          endedAt,
          payload: prevOutput,
          resumedAt: resume?.steps[0] === step.id ? startedAt : void 0,
          resumePayload: resume?.steps[0] === step.id ? resume?.resumePayload : void 0
        };
      } catch (e) {
        execResults = {
          status: "failed",
          payload: prevOutput,
          error: e instanceof Error ? e.message : String(e),
          endedAt: Date.now(),
          startedAt,
          resumedAt: resume?.steps[0] === step.id ? startedAt : void 0,
          resumePayload: resume?.steps[0] === step.id ? resume?.resumePayload : void 0
        };
      }
      if (suspended) {
        execResults = {
          status: "suspended",
          suspendedPayload: suspended.payload,
          payload: prevOutput,
          suspendedAt: Date.now(),
          startedAt,
          resumedAt: resume?.steps[0] === step.id ? startedAt : void 0,
          resumePayload: resume?.steps[0] === step.id ? resume?.resumePayload : void 0
        };
      }
      if (execResults.status === "failed") {
        if (executionContext.retryConfig.attempts > 0 && this.inngestAttempts < executionContext.retryConfig.attempts) {
          throw execResults.error;
        }
      }
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          currentStep: {
            id: step.id,
            ...execResults
          },
          workflowState: {
            status: "running",
            steps: { ...stepResults, [step.id]: execResults },
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
      if (execResults.status === "suspended") {
        await emitter.emit("watch-v2", {
          type: "step-suspended",
          payload: {
            id: step.id,
            status: execResults.status,
            output: execResults.status === "success" ? execResults?.output : void 0
          }
        });
      } else {
        await emitter.emit("watch-v2", {
          type: "step-result",
          payload: {
            id: step.id,
            status: execResults.status,
            output: execResults.status === "success" ? execResults?.output : void 0
          }
        });
        await emitter.emit("watch-v2", {
          type: "step-finish",
          payload: {
            id: step.id,
            metadata: {}
          }
        });
      }
      return { result: execResults, executionContext, stepResults };
    });
    Object.assign(executionContext.suspendedPaths, stepRes.executionContext.suspendedPaths);
    Object.assign(stepResults, stepRes.stepResults);
    return stepRes.result;
  }
  async persistStepUpdate({
    workflowId,
    runId,
    stepResults,
    executionContext,
    serializedStepGraph,
    workflowStatus,
    result,
    error
  }) {
    await this.inngestStep.run(
      `workflow.${workflowId}.run.${runId}.path.${JSON.stringify(executionContext.executionPath)}.stepUpdate`,
      async () => {
        await this.mastra?.getStorage()?.persistWorkflowSnapshot({
          workflowName: workflowId,
          runId,
          snapshot: {
            runId,
            value: {},
            context: stepResults,
            activePaths: [],
            suspendedPaths: executionContext.suspendedPaths,
            serializedStepGraph,
            status: workflowStatus,
            result,
            error,
            // @ts-ignore
            timestamp: Date.now()
          }
        });
      }
    );
  }
  async executeConditional({
    workflowId,
    runId,
    entry,
    prevOutput,
    prevStep,
    stepResults,
    serializedStepGraph,
    resume,
    executionContext,
    emitter,
    runtimeContext
  }) {
    let execResults;
    const truthyIndexes = (await Promise.all(
      entry.conditions.map(
        (cond, index) => this.inngestStep.run(`workflow.${workflowId}.conditional.${index}`, async () => {
          try {
            const result = await cond({
              runId,
              mastra: this.mastra,
              runtimeContext,
              inputData: prevOutput,
              getInitData: () => stepResults?.input,
              getStepResult: (step) => {
                if (!step?.id) {
                  return null;
                }
                const result2 = stepResults[step.id];
                if (result2?.status === "success") {
                  return result2.output;
                }
                return null;
              },
              // TODO: this function shouldn't have suspend probably?
              suspend: async (_suspendPayload) => {
              },
              [EMITTER_SYMBOL]: emitter,
              engine: {
                step: this.inngestStep
              }
            });
            return result ? index : null;
          } catch (e) {
            return null;
          }
        })
      )
    )).filter((index) => index !== null);
    const stepsToRun = entry.steps.filter((_, index) => truthyIndexes.includes(index));
    const results = await Promise.all(
      stepsToRun.map(
        (step, index) => this.executeEntry({
          workflowId,
          runId,
          entry: step,
          prevStep,
          stepResults,
          resume,
          serializedStepGraph,
          executionContext: {
            workflowId,
            runId,
            executionPath: [...executionContext.executionPath, index],
            suspendedPaths: executionContext.suspendedPaths,
            retryConfig: executionContext.retryConfig,
            executionSpan: executionContext.executionSpan
          },
          emitter,
          runtimeContext
        })
      )
    );
    const hasFailed = results.find((result) => result.result.status === "failed");
    const hasSuspended = results.find((result) => result.result.status === "suspended");
    if (hasFailed) {
      execResults = { status: "failed", error: hasFailed.result.error };
    } else if (hasSuspended) {
      execResults = { status: "suspended", payload: hasSuspended.result.suspendPayload };
    } else {
      execResults = {
        status: "success",
        output: results.reduce((acc, result, index) => {
          if (result.result.status === "success") {
            acc[stepsToRun[index].step.id] = result.output;
          }
          return acc;
        }, {})
      };
    }
    return execResults;
  }
};

export { InngestExecutionEngine, InngestRun, InngestWorkflow, createStep, init, serve };
