import * as ai from 'ai';
import { Tool as Tool$1, Schema, ToolExecutionOptions, TextStreamPart, UserContent, AssistantContent, ToolContent, EmbeddingModel, CoreMessage as CoreMessage$1, UIMessage, Message, IDGenerator as IDGenerator$1, CoreSystemMessage as CoreSystemMessage$1, LanguageModel as LanguageModel$1, GenerateTextResult, GenerateObjectResult, StreamTextResult, StreamObjectResult, DeepPartial, generateText, generateObject, streamText, streamObject, TelemetrySettings, CoreAssistantMessage as CoreAssistantMessage$1, CoreUserMessage as CoreUserMessage$1, CoreToolMessage as CoreToolMessage$1, EmbedResult as EmbedResult$1, EmbedManyResult as EmbedManyResult$1, LanguageModelV1, GenerateTextOnStepFinishCallback, StreamTextOnFinishCallback, StreamObjectOnFinishCallback, StreamTextOnStepFinishCallback } from 'ai';
import { M as MastraBase, a as Telemetry, O as OtelConfig, T as Trace } from './base-DCIyondy.js';
import { z, ZodSchema, ZodObject } from 'zod';
import { B as BaseLogMessage, R as RegisteredLogger, I as IMastraLogger, a as LogLevel } from './logger-DtVDdb81.js';
import { JSONSchema7Type, JSONSchema7 } from 'json-schema';
import { MastraTTS } from './tts/index.js';
import { MastraVector } from './vector/index.js';
import { M as Metric, a as MetricResult, T as TestInfo } from './types-Bo1uigWx.js';
import { Query } from 'sift';
import { RuntimeContext } from './runtime-context/index.js';
import { Span } from '@opentelemetry/api';
import * as xstate from 'xstate';
import { Snapshot } from 'xstate';
import EventEmitter from 'node:events';
import * as http from 'node:http';
import { Context, HonoRequest, Handler, MiddlewareHandler } from 'hono';
import EventEmitter$1 from 'events';
import { EMITTER_SYMBOL } from './workflows/constants.js';
import { MockLanguageModelV1 } from 'ai/test';
import { MastraDeployer } from './deployer/index.js';
import { cors } from 'hono/cors';
import { DescribeRouteOptions } from 'hono-openapi';

type BundlerConfig = {
    externals?: string[];
};

type VercelTool = Tool$1;
type CoreTool = {
    id?: string;
    description?: string;
    parameters: ZodSchema | JSONSchema7Type | Schema;
    execute?: (params: any, options: ToolExecutionOptions) => Promise<any>;
} & ({
    type?: 'function' | undefined;
    id?: string;
} | {
    type: 'provider-defined';
    id: `${string}.${string}`;
    args: Record<string, unknown>;
});
type InternalCoreTool = {
    id?: string;
    description?: string;
    parameters: Schema;
    execute?: (params: any, options: ToolExecutionOptions) => Promise<any>;
} & ({
    type?: 'function' | undefined;
    id?: string;
} | {
    type: 'provider-defined';
    id: `${string}.${string}`;
    args: Record<string, unknown>;
});
interface ToolExecutionContext<TSchemaIn extends z.ZodSchema | undefined = undefined> extends IExecutionContext<TSchemaIn> {
    mastra?: MastraUnion;
    runtimeContext: RuntimeContext;
}
interface ToolAction<TSchemaIn extends z.ZodSchema | undefined = undefined, TSchemaOut extends z.ZodSchema | undefined = undefined, TContext extends ToolExecutionContext<TSchemaIn> = ToolExecutionContext<TSchemaIn>> extends IAction<string, TSchemaIn, TSchemaOut, TContext, ToolExecutionOptions> {
    description: string;
    execute?: (context: TContext, options?: ToolExecutionOptions) => Promise<TSchemaOut extends z.ZodSchema ? z.infer<TSchemaOut> : unknown>;
    mastra?: Mastra;
}

declare class Tool<TSchemaIn extends z.ZodSchema | undefined = undefined, TSchemaOut extends z.ZodSchema | undefined = undefined, TContext extends ToolExecutionContext<TSchemaIn> = ToolExecutionContext<TSchemaIn>> implements ToolAction<TSchemaIn, TSchemaOut, TContext> {
    id: string;
    description: string;
    inputSchema?: TSchemaIn;
    outputSchema?: TSchemaOut;
    execute?: ToolAction<TSchemaIn, TSchemaOut, TContext>['execute'];
    mastra?: Mastra;
    constructor(opts: ToolAction<TSchemaIn, TSchemaOut, TContext>);
}
declare function createTool<TSchemaIn extends z.ZodSchema | undefined = undefined, TSchemaOut extends z.ZodSchema | undefined = undefined, TContext extends ToolExecutionContext<TSchemaIn> = ToolExecutionContext<TSchemaIn>, TExecute extends ToolAction<TSchemaIn, TSchemaOut, TContext>['execute'] = ToolAction<TSchemaIn, TSchemaOut, TContext>['execute']>(opts: ToolAction<TSchemaIn, TSchemaOut, TContext> & {
    execute?: TExecute;
}): [TSchemaIn, TSchemaOut, TExecute] extends [z.ZodSchema, z.ZodSchema, Function] ? Tool<TSchemaIn, TSchemaOut, TContext> & {
    inputSchema: TSchemaIn;
    outputSchema: TSchemaOut;
    execute: (context: TContext) => Promise<any>;
} : Tool<TSchemaIn, TSchemaOut, TContext>;

type RunStatus = 'created' | 'running' | 'completed' | 'failed';
type Run$1 = {
    runId?: string;
    runStatus?: RunStatus;
};

interface WorkflowOptions<TWorkflowName extends string = string, TSteps extends LegacyStep<string, any, any, any>[] = LegacyStep<string, any, any, any>[], TTriggerSchema extends z.ZodObject<any> = any, TResultSchema extends z.ZodObject<any> = any> {
    steps?: TSteps;
    name: TWorkflowName;
    triggerSchema?: TTriggerSchema;
    result?: {
        schema: TResultSchema;
        mapping?: {
            [K in keyof z.infer<TResultSchema>]?: any;
        };
    };
    events?: Record<string, {
        schema: z.ZodObject<any>;
    }>;
    retryConfig?: RetryConfig;
    mastra?: Mastra;
}
interface StepExecutionContext<TSchemaIn extends z.ZodSchema | undefined = undefined, TContext extends WorkflowContext = WorkflowContext> extends IExecutionContext<TSchemaIn> {
    context: TSchemaIn extends z.ZodSchema ? {
        inputData: z.infer<TSchemaIn>;
    } & TContext : TContext;
    suspend: (payload?: unknown, softSuspend?: any) => Promise<void>;
    runId: string;
    emit: (event: string, data: any) => void;
    mastra?: MastraUnion;
    runtimeContext: RuntimeContext;
}
interface StepAction<TId extends string, TSchemaIn extends z.ZodSchema | undefined, TSchemaOut extends z.ZodSchema | undefined, TContext extends StepExecutionContext<TSchemaIn>> extends IAction<TId, TSchemaIn, TSchemaOut, TContext> {
    mastra?: Mastra;
    payload?: TSchemaIn extends z.ZodSchema ? Partial<z.infer<TSchemaIn>> : unknown;
    execute: (context: TContext) => Promise<TSchemaOut extends z.ZodSchema ? z.infer<TSchemaOut> : unknown>;
    retryConfig?: RetryConfig;
    workflow?: LegacyWorkflow;
    workflowId?: string;
}
interface SimpleConditionalType {
    [key: `${string}.${string}`]: string | Query<any>;
}
type StepVariableType<TId extends string, TSchemaIn extends z.ZodSchema | undefined, TSchemaOut extends z.ZodSchema | undefined, TContext extends StepExecutionContext<TSchemaIn>> = StepAction<TId, TSchemaIn, TSchemaOut, TContext> | 'trigger' | {
    id: string;
};
type StepNode = {
    id: string;
    step: StepAction<any, any, any, any>;
    config: StepDef<any, any, any, any>[any];
};
type StepGraph = {
    initial: StepNode[];
    [key: string]: StepNode[];
};
type RetryConfig = {
    attempts?: number;
    delay?: number;
};
type VariableReference$1<TStep extends StepVariableType<any, any, any, any>, TTriggerSchema extends z.ZodObject<any>> = TStep extends StepAction<any, any, any, any> ? {
    step: TStep;
    path: PathsToStringProps$1<ExtractSchemaType$1<ExtractSchemaFromStep$1<TStep, 'outputSchema'>>> | '' | '.';
} : TStep extends 'trigger' ? {
    step: 'trigger';
    path: PathsToStringProps$1<ExtractSchemaType$1<TTriggerSchema>> | '.' | '';
} : {
    step: {
        id: string;
    };
    path: string;
};
interface BaseCondition<TStep extends StepVariableType<any, any, any, any>, TTriggerSchema extends z.ZodObject<any>> {
    ref: TStep extends StepAction<any, any, any, any> ? {
        step: TStep;
        path: PathsToStringProps$1<ExtractSchemaType$1<ExtractSchemaFromStep$1<TStep, 'outputSchema'>>> | '' | '.' | 'status';
    } : TStep extends 'trigger' ? {
        step: 'trigger';
        path: PathsToStringProps$1<ExtractSchemaType$1<TTriggerSchema>> | '.' | '';
    } : {
        step: {
            id: string;
        };
        path: string;
    };
    query: Query<any>;
}
type ActionContext<TSchemaIn extends z.ZodType<any>> = StepExecutionContext<z.infer<TSchemaIn>, WorkflowContext>;
declare enum WhenConditionReturnValue {
    CONTINUE = "continue",
    CONTINUE_FAILED = "continue_failed",
    ABORT = "abort",
    LIMBO = "limbo"
}
type StepDef<TStepId extends TSteps[number]['id'], TSteps extends StepAction<any, any, any, any>[], TSchemaIn extends z.ZodType<any>, TSchemaOut extends z.ZodType<any>> = Record<TStepId, {
    id?: string;
    when?: Condition<any, any> | ((args: {
        context: WorkflowContext;
        mastra?: Mastra;
    }) => Promise<boolean | WhenConditionReturnValue>);
    serializedWhen?: Condition<any, any> | string;
    loopLabel?: string;
    loopType?: 'while' | 'until';
    data: TSchemaIn;
    handler: (args: ActionContext<TSchemaIn>) => Promise<z.infer<TSchemaOut>>;
}>;
type StepCondition<TStep extends StepVariableType<any, any, any, any>, TTriggerSchema extends z.ZodObject<any>> = BaseCondition<TStep, TTriggerSchema> | SimpleConditionalType | {
    and: StepCondition<TStep, TTriggerSchema>[];
} | {
    or: StepCondition<TStep, TTriggerSchema>[];
} | {
    not: StepCondition<TStep, TTriggerSchema>;
};
type Condition<TStep extends StepVariableType<any, any, any, any>, TTriggerSchema extends z.ZodObject<any>> = BaseCondition<TStep, TTriggerSchema> | SimpleConditionalType | {
    and: Condition<TStep, TTriggerSchema>[];
} | {
    or: Condition<TStep, TTriggerSchema>[];
} | {
    not: Condition<TStep, TTriggerSchema>;
};
interface StepConfig<TStep extends StepAction<any, any, any, any>, CondStep extends StepVariableType<any, any, any, any>, VarStep extends StepVariableType<any, any, any, any>, TTriggerSchema extends z.ZodObject<any>, TSteps extends LegacyStep<string, any, any, any>[] = LegacyStep<string, any, any, any>[]> {
    when?: Condition<CondStep, TTriggerSchema> | ((args: {
        context: WorkflowContext<TTriggerSchema, TSteps>;
        mastra?: Mastra;
    }) => Promise<boolean | WhenConditionReturnValue>);
    variables?: StepInputType<TStep, 'inputSchema'> extends never ? Record<string, VariableReference$1<VarStep, TTriggerSchema>> : {
        [K in keyof StepInputType<TStep, 'inputSchema'>]?: VariableReference$1<VarStep, TTriggerSchema>;
    };
    '#internal'?: {
        when?: Condition<CondStep, TTriggerSchema> | ((args: {
            context: WorkflowContext<TTriggerSchema, TSteps>;
            mastra?: Mastra;
        }) => Promise<boolean | WhenConditionReturnValue>);
        loopLabel?: string;
        loopType?: 'while' | 'until' | undefined;
    };
    id?: string;
}
type StepSuccess$1<T> = {
    status: 'success';
    output: T;
};
type StepSuspended$1<T> = {
    status: 'suspended';
    suspendPayload?: any;
    output?: T;
};
type StepWaiting$1 = {
    status: 'waiting';
};
type StepFailure$1 = {
    status: 'failed';
    error: string;
};
type StepSkipped = {
    status: 'skipped';
};
type StepResult$1<T> = StepSuccess$1<T> | StepFailure$1 | StepSuspended$1<T> | StepWaiting$1 | StepSkipped;
type StepsRecord$1<T extends readonly LegacyStep<any, any, z.ZodType<any> | undefined>[]> = {
    [K in T[number]['id']]: Extract<T[number], {
        id: K;
    }>;
};
interface LegacyWorkflowRunResult<T extends z.ZodObject<any>, TSteps extends LegacyStep<string, any, z.ZodType<any> | undefined>[], TResult extends z.ZodObject<any>> {
    triggerData?: z.infer<T>;
    result?: z.infer<TResult>;
    results: {
        [K in keyof StepsRecord$1<TSteps>]: StepsRecord$1<TSteps>[K]['outputSchema'] extends undefined ? StepResult$1<unknown> : StepResult$1<z.infer<NonNullable<StepsRecord$1<TSteps>[K]['outputSchema']>>>;
    };
    runId: string;
    timestamp: number;
    activePaths: Map<keyof StepsRecord$1<TSteps>, {
        status: string;
        suspendPayload?: any;
        stepPath: string[];
    }>;
}
interface WorkflowContext<TTrigger extends z.ZodObject<any> = any, TSteps extends LegacyStep<string, any, any, any>[] = LegacyStep<string, any, any, any>[], TInputData extends Record<string, any> = Record<string, any>> {
    isResume?: {
        runId: string;
        stepId: string;
    };
    mastra?: MastraUnion;
    steps: {
        [K in keyof StepsRecord$1<TSteps>]: StepsRecord$1<TSteps>[K]['outputSchema'] extends undefined ? StepResult$1<unknown> : StepResult$1<z.infer<NonNullable<StepsRecord$1<TSteps>[K]['outputSchema']>>>;
    };
    triggerData: z.infer<TTrigger>;
    inputData: TInputData;
    attempts: Record<string, number>;
    getStepResult(stepId: 'trigger'): z.infer<TTrigger>;
    getStepResult<T extends keyof StepsRecord$1<TSteps> | unknown>(stepId: T extends keyof StepsRecord$1<TSteps> ? T : string): T extends keyof StepsRecord$1<TSteps> ? StepsRecord$1<TSteps>[T]['outputSchema'] extends undefined ? unknown : z.infer<NonNullable<StepsRecord$1<TSteps>[T]['outputSchema']>> : T;
    getStepResult<T extends LegacyStep<any, any, any, any>>(stepId: T): T['outputSchema'] extends undefined ? unknown : z.infer<NonNullable<T['outputSchema']>>;
}
interface WorkflowLogMessage extends BaseLogMessage {
    type: typeof RegisteredLogger.WORKFLOW;
    workflowName: string;
    stepId?: StepId;
    data?: unknown;
    runId?: string;
}
type WorkflowEvent = {
    type: 'RESET_TO_PENDING';
    stepId: string;
} | {
    type: 'CONDITIONS_MET';
    stepId: string;
} | {
    type: 'CONDITION_FAILED';
    stepId: string;
    error: string;
} | {
    type: 'SUSPENDED';
    stepId: string;
    suspendPayload?: any;
    softSuspend?: any;
} | {
    type: 'WAITING';
    stepId: string;
} | {
    type: `xstate.error.actor.${string}`;
    error: Error;
} | {
    type: `xstate.done.actor.${string}`;
    output: ResolverFunctionOutput;
};
type ResolverFunctionInput = {
    stepNode: StepNode;
    context: WorkflowContext;
};
type ResolverFunctionOutput = {
    stepId: StepId;
    result: unknown;
};
type SubscriberFunctionOutput = {
    stepId: StepId;
    result: unknown;
};
type DependencyCheckOutput = {
    type: 'CONDITIONS_MET';
} | {
    type: 'CONDITIONS_SKIPPED';
} | {
    type: 'CONDITIONS_SKIP_TO_COMPLETED';
} | {
    type: 'CONDITION_FAILED';
    error: string;
} | {
    type: 'SUSPENDED';
} | {
    type: 'WAITING';
} | {
    type: 'CONDITIONS_LIMBO';
};
type StepResolverOutput = {
    type: 'STEP_SUCCESS';
    output: unknown;
} | {
    type: 'STEP_FAILED';
    error: string;
} | {
    type: 'STEP_WAITING';
};
type WorkflowActors = {
    resolverFunction: {
        input: ResolverFunctionInput;
        output: StepResolverOutput;
    };
    conditionCheck: {
        input: {
            context: WorkflowContext;
            stepId: string;
        };
        output: DependencyCheckOutput;
    };
    spawnSubscriberFunction: {
        input: {
            context: WorkflowContext;
            stepId: string;
        };
        output: SubscriberFunctionOutput;
    };
};
type WorkflowActionParams = {
    stepId: string;
};
type WorkflowActions = {
    type: 'updateStepResult' | 'setStepError' | 'notifyStepCompletion' | 'decrementAttemptCount';
    params: WorkflowActionParams;
};
type LegacyWorkflowState = {
    [key: string]: {
        initial: 'pending';
        states: {
            pending: {
                invoke: {
                    src: 'conditionCheck';
                    input: ({ context }: {
                        context: WorkflowContext;
                    }) => {
                        context: WorkflowContext;
                        stepId: string;
                    };
                    onDone: [
                        {
                            guard: (_: any, event: {
                                output: DependencyCheckOutput;
                            }) => boolean;
                            target: 'executing';
                        },
                        {
                            guard: (_: any, event: {
                                output: DependencyCheckOutput;
                            }) => boolean;
                            target: 'waiting';
                        }
                    ];
                };
            };
            waiting: {
                after: {
                    CHECK_INTERVAL: {
                        target: 'pending';
                    };
                };
            };
            executing: {
                invoke: {
                    src: 'resolverFunction';
                    input: ({ context }: {
                        context: WorkflowContext;
                    }) => ResolverFunctionInput;
                    onDone: {
                        target: 'completed';
                        actions: ['updateStepResult'];
                    };
                    onError: {
                        target: 'failed';
                        actions: ['setStepError'];
                    };
                };
            };
            completed: {
                type: 'final';
                entry: ['notifyStepCompletion'];
            };
            failed: {
                type: 'final';
                entry: ['notifyStepCompletion'];
            };
        };
    };
};
declare const StepIdBrand: unique symbol;
type StepId = string & {
    readonly [StepIdBrand]: typeof StepIdBrand;
};
type ExtractSchemaFromStep$1<TStep extends StepAction<any, any, any, any>, TKey extends 'inputSchema' | 'outputSchema'> = TStep[TKey];
type ExtractStepResult<T> = T extends (data: any) => Promise<infer R> ? R : never;
type StepInputType<TStep extends StepAction<any, any, any, any>, TKey extends 'inputSchema' | 'outputSchema'> = ExtractSchemaFromStep$1<TStep, TKey> extends infer Schema ? Schema extends z.ZodType<any> ? z.infer<Schema> : never : never;
type ExtractSchemaType$1<T extends z.ZodSchema> = T extends z.ZodSchema<infer V> ? V : never;
type PathsToStringProps$1<T> = T extends object ? {
    [K in keyof T]: T[K] extends object ? K extends string ? K | `${K}.${PathsToStringProps$1<T[K]>}` : never : K extends string ? K : never;
}[keyof T] : never;
interface LegacyWorkflowRunState {
    value: Record<string, string>;
    context: {
        steps: Record<string, {
            status: 'success' | 'failed' | 'suspended' | 'waiting' | 'skipped';
            payload?: any;
            error?: string;
        }>;
        triggerData: Record<string, any>;
        attempts: Record<string, number>;
    };
    activePaths: Array<{
        stepPath: string[];
        stepId: string;
        status: string;
    }>;
    suspendedPaths: Record<string, number[]>;
    runId: string;
    timestamp: number;
    childStates?: Record<string, LegacyWorkflowRunState>;
    suspendedSteps?: Record<string, string>;
}
type WorkflowResumeResult<TTriggerSchema extends z.ZodObject<any>> = {
    triggerData?: z.infer<TTriggerSchema>;
    results: Record<string, StepResult$1<any>>;
};

declare class LegacyStep<TStepId extends string = any, TSchemaIn extends z.ZodSchema | undefined = undefined, TSchemaOut extends z.ZodSchema | undefined = undefined, TContext extends StepExecutionContext<TSchemaIn> = StepExecutionContext<TSchemaIn>> implements StepAction<TStepId, TSchemaIn, TSchemaOut, TContext> {
    id: TStepId;
    description?: string;
    inputSchema?: TSchemaIn;
    outputSchema?: TSchemaOut;
    payload?: TSchemaIn extends z.ZodSchema ? Partial<z.infer<TSchemaIn>> : unknown;
    execute: (context: TContext) => Promise<TSchemaOut extends z.ZodSchema ? z.infer<TSchemaOut> : unknown>;
    retryConfig?: RetryConfig;
    mastra?: Mastra;
    constructor({ id, description, execute, payload, outputSchema, inputSchema, retryConfig, }: StepAction<TStepId, TSchemaIn, TSchemaOut, TContext>);
}

declare class Machine<TSteps extends LegacyStep<any, any, any, any>[] = LegacyStep<any, any, any, any>[], TTriggerSchema extends z.ZodObject<any> = any, TResultSchema extends z.ZodObject<any> = any> extends EventEmitter {
    #private;
    logger: IMastraLogger;
    name: string;
    constructor({ logger, mastra, runtimeContext, workflowInstance, executionSpan, name, runId, steps, stepGraph, retryConfig, startStepId, }: {
        logger: IMastraLogger;
        mastra?: Mastra;
        runtimeContext: RuntimeContext;
        workflowInstance: WorkflowInstance;
        executionSpan?: Span;
        name: string;
        runId: string;
        steps: Record<string, StepNode>;
        stepGraph: StepGraph;
        retryConfig?: RetryConfig;
        startStepId: string;
    });
    get startStepId(): string;
    execute({ stepId, input, snapshot, resumeData, }?: {
        stepId?: string;
        input?: any;
        snapshot?: Snapshot<any>;
        resumeData?: any;
    }): Promise<Pick<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResultSchema>, 'results' | 'activePaths' | 'runId' | 'timestamp'>>;
    private initializeMachine;
    getSnapshot(): xstate.MachineSnapshot<Omit<WorkflowContext<any, LegacyStep<string, any, any, any>[], Record<string, any>>, "getStepResult">, {
        type: "RESET_TO_PENDING";
        stepId: string;
    } | {
        type: "CONDITIONS_MET";
        stepId: string;
    } | {
        type: "CONDITION_FAILED";
        stepId: string;
        error: string;
    } | {
        type: "SUSPENDED";
        stepId: string;
        suspendPayload?: any;
        softSuspend?: any;
    } | {
        type: "WAITING";
        stepId: string;
    } | {
        type: `xstate.error.actor.${string}`;
        error: Error;
    } | {
        type: `xstate.done.actor.${string}`;
        output: ResolverFunctionOutput;
    }, {
        [x: string]: xstate.ActorRefFromLogic<xstate.PromiseActorLogic<{
            type: "CONDITIONS_MET";
            error?: undefined;
        } | {
            type: "CONDITIONS_SKIP_TO_COMPLETED";
            error?: undefined;
        } | {
            type: "CONDITIONS_LIMBO";
            error?: undefined;
        } | {
            type: "CONDITIONS_SKIPPED";
            error?: undefined;
        } | {
            type: "CONDITION_FAILED";
            error: string;
        }, {
            context: WorkflowContext;
            stepNode: StepNode;
        }, xstate.EventObject>> | xstate.ActorRefFromLogic<xstate.PromiseActorLogic<{
            type: "STEP_FAILED";
            error: string;
            stepId: string;
            result?: undefined;
        } | {
            type: "STEP_WAITING";
            stepId: string;
            error?: undefined;
            result?: undefined;
        } | {
            type: "STEP_SUCCESS";
            result: any;
            stepId: string;
            error?: undefined;
        }, ResolverFunctionInput, xstate.EventObject>> | xstate.ActorRefFromLogic<xstate.PromiseActorLogic<{
            steps: {};
        }, {
            parentStepId: string;
            context: WorkflowContext;
        }, xstate.EventObject>> | undefined;
    }, {
        [x: string]: {} | {
            [x: string]: {} | /*elided*/ any | {
                [x: string]: {} | /*elided*/ any | /*elided*/ any;
            };
        } | {
            [x: string]: {} | {
                [x: string]: {} | /*elided*/ any | /*elided*/ any;
            } | /*elided*/ any;
        };
    }, string, xstate.NonReducibleUnknown, xstate.MetaObject, {
        readonly id: string;
        readonly type: "parallel";
        readonly context: ({ input }: {
            spawn: {
                <TSrc extends "conditionCheck" | "resolverFunction" | "spawnSubscriberFunction">(logic: TSrc, ...[options]: ({
                    src: "conditionCheck";
                    logic: xstate.PromiseActorLogic<{
                        type: "CONDITIONS_MET";
                        error?: undefined;
                    } | {
                        type: "CONDITIONS_SKIP_TO_COMPLETED";
                        error?: undefined;
                    } | {
                        type: "CONDITIONS_LIMBO";
                        error?: undefined;
                    } | {
                        type: "CONDITIONS_SKIPPED";
                        error?: undefined;
                    } | {
                        type: "CONDITION_FAILED";
                        error: string;
                    }, {
                        context: WorkflowContext;
                        stepNode: StepNode;
                    }, xstate.EventObject>;
                    id: string | undefined;
                } extends infer T ? T extends {
                    src: "conditionCheck";
                    logic: xstate.PromiseActorLogic<{
                        type: "CONDITIONS_MET";
                        error?: undefined;
                    } | {
                        type: "CONDITIONS_SKIP_TO_COMPLETED";
                        error?: undefined;
                    } | {
                        type: "CONDITIONS_LIMBO";
                        error?: undefined;
                    } | {
                        type: "CONDITIONS_SKIPPED";
                        error?: undefined;
                    } | {
                        type: "CONDITION_FAILED";
                        error: string;
                    }, {
                        context: WorkflowContext;
                        stepNode: StepNode;
                    }, xstate.EventObject>;
                    id: string | undefined;
                } ? T extends {
                    src: TSrc;
                } ? xstate.ConditionalRequired<[options?: ({
                    id?: T["id"] | undefined;
                    systemId?: string;
                    input?: xstate.InputFrom<T["logic"]> | undefined;
                    syncSnapshot?: boolean;
                } & { [K in xstate.RequiredActorOptions<T>]: unknown; }) | undefined], xstate.IsNotNever<xstate.RequiredActorOptions<T>>> : never : never : never) | ({
                    src: "resolverFunction";
                    logic: xstate.PromiseActorLogic<{
                        type: "STEP_FAILED";
                        error: string;
                        stepId: string;
                        result?: undefined;
                    } | {
                        type: "STEP_WAITING";
                        stepId: string;
                        error?: undefined;
                        result?: undefined;
                    } | {
                        type: "STEP_SUCCESS";
                        result: any;
                        stepId: string;
                        error?: undefined;
                    }, ResolverFunctionInput, xstate.EventObject>;
                    id: string | undefined;
                } extends infer T_1 ? T_1 extends {
                    src: "resolverFunction";
                    logic: xstate.PromiseActorLogic<{
                        type: "STEP_FAILED";
                        error: string;
                        stepId: string;
                        result?: undefined;
                    } | {
                        type: "STEP_WAITING";
                        stepId: string;
                        error?: undefined;
                        result?: undefined;
                    } | {
                        type: "STEP_SUCCESS";
                        result: any;
                        stepId: string;
                        error?: undefined;
                    }, ResolverFunctionInput, xstate.EventObject>;
                    id: string | undefined;
                } ? T_1 extends {
                    src: TSrc;
                } ? xstate.ConditionalRequired<[options?: ({
                    id?: T_1["id"] | undefined;
                    systemId?: string;
                    input?: xstate.InputFrom<T_1["logic"]> | undefined;
                    syncSnapshot?: boolean;
                } & { [K_1 in xstate.RequiredActorOptions<T_1>]: unknown; }) | undefined], xstate.IsNotNever<xstate.RequiredActorOptions<T_1>>> : never : never : never) | ({
                    src: "spawnSubscriberFunction";
                    logic: xstate.PromiseActorLogic<{
                        steps: {};
                    }, {
                        parentStepId: string;
                        context: WorkflowContext;
                    }, xstate.EventObject>;
                    id: string | undefined;
                } extends infer T_2 ? T_2 extends {
                    src: "spawnSubscriberFunction";
                    logic: xstate.PromiseActorLogic<{
                        steps: {};
                    }, {
                        parentStepId: string;
                        context: WorkflowContext;
                    }, xstate.EventObject>;
                    id: string | undefined;
                } ? T_2 extends {
                    src: TSrc;
                } ? xstate.ConditionalRequired<[options?: ({
                    id?: T_2["id"] | undefined;
                    systemId?: string;
                    input?: xstate.InputFrom<T_2["logic"]> | undefined;
                    syncSnapshot?: boolean;
                } & { [K_2 in xstate.RequiredActorOptions<T_2>]: unknown; }) | undefined], xstate.IsNotNever<xstate.RequiredActorOptions<T_2>>> : never : never : never)): xstate.ActorRefFromLogic<xstate.GetConcreteByKey<xstate.Values<{
                    conditionCheck: {
                        src: "conditionCheck";
                        logic: xstate.PromiseActorLogic<{
                            type: "CONDITIONS_MET";
                            error?: undefined;
                        } | {
                            type: "CONDITIONS_SKIP_TO_COMPLETED";
                            error?: undefined;
                        } | {
                            type: "CONDITIONS_LIMBO";
                            error?: undefined;
                        } | {
                            type: "CONDITIONS_SKIPPED";
                            error?: undefined;
                        } | {
                            type: "CONDITION_FAILED";
                            error: string;
                        }, {
                            context: WorkflowContext;
                            stepNode: StepNode;
                        }, xstate.EventObject>;
                        id: string | undefined;
                    };
                    resolverFunction: {
                        src: "resolverFunction";
                        logic: xstate.PromiseActorLogic<{
                            type: "STEP_FAILED";
                            error: string;
                            stepId: string;
                            result?: undefined;
                        } | {
                            type: "STEP_WAITING";
                            stepId: string;
                            error?: undefined;
                            result?: undefined;
                        } | {
                            type: "STEP_SUCCESS";
                            result: any;
                            stepId: string;
                            error?: undefined;
                        }, ResolverFunctionInput, xstate.EventObject>;
                        id: string | undefined;
                    };
                    spawnSubscriberFunction: {
                        src: "spawnSubscriberFunction";
                        logic: xstate.PromiseActorLogic<{
                            steps: {};
                        }, {
                            parentStepId: string;
                            context: WorkflowContext;
                        }, xstate.EventObject>;
                        id: string | undefined;
                    };
                }>, "src", TSrc>["logic"]>;
                <TLogic extends xstate.AnyActorLogic>(src: TLogic, ...[options]: xstate.ConditionalRequired<[options?: ({
                    id?: never;
                    systemId?: string;
                    input?: xstate.InputFrom<TLogic> | undefined;
                    syncSnapshot?: boolean;
                } & { [K in xstate.RequiredLogicInput<TLogic>]: unknown; }) | undefined], xstate.IsNotNever<xstate.RequiredLogicInput<TLogic>>>): xstate.ActorRefFromLogic<TLogic>;
            };
            input: Omit<WorkflowContext<any, LegacyStep<string, any, any, any>[], Record<string, any>>, "getStepResult">;
            self: xstate.ActorRef<xstate.MachineSnapshot<Omit<WorkflowContext<any, LegacyStep<string, any, any, any>[], Record<string, any>>, "getStepResult">, {
                type: "RESET_TO_PENDING";
                stepId: string;
            } | {
                type: "CONDITIONS_MET";
                stepId: string;
            } | {
                type: "CONDITION_FAILED";
                stepId: string;
                error: string;
            } | {
                type: "SUSPENDED";
                stepId: string;
                suspendPayload?: any;
                softSuspend?: any;
            } | {
                type: "WAITING";
                stepId: string;
            } | {
                type: `xstate.error.actor.${string}`;
                error: Error;
            } | {
                type: `xstate.done.actor.${string}`;
                output: ResolverFunctionOutput;
            }, Record<string, xstate.AnyActorRef | undefined>, xstate.StateValue, string, unknown, any, any>, {
                type: "RESET_TO_PENDING";
                stepId: string;
            } | {
                type: "CONDITIONS_MET";
                stepId: string;
            } | {
                type: "CONDITION_FAILED";
                stepId: string;
                error: string;
            } | {
                type: "SUSPENDED";
                stepId: string;
                suspendPayload?: any;
                softSuspend?: any;
            } | {
                type: "WAITING";
                stepId: string;
            } | {
                type: `xstate.error.actor.${string}`;
                error: Error;
            } | {
                type: `xstate.done.actor.${string}`;
                output: ResolverFunctionOutput;
            }, xstate.AnyEventObject>;
        }) => {
            mastra?: MastraUnion | undefined;
            steps: {
                [x: string]: {
                    status: "failed";
                    error: string;
                } | {
                    status: "waiting";
                } | {
                    status: "skipped";
                } | {
                    status: "success";
                    output: unknown;
                } | {
                    status: "suspended";
                    suspendPayload?: any;
                    output?: unknown;
                } | {
                    status: "success";
                    output: any;
                } | {
                    status: "suspended";
                    suspendPayload?: any;
                    output?: any;
                };
            };
            attempts: Record<string, number>;
            inputData: Record<string, any>;
            triggerData: any;
            isResume?: {
                runId: string;
                stepId: string;
            } | undefined;
        };
        readonly states: any;
    }> | undefined;
}

interface WorkflowResultReturn<TResult extends z.ZodObject<any>, T extends z.ZodObject<any>, TSteps extends LegacyStep<any, any, any>[]> {
    runId: string;
    start: (props?: {
        triggerData?: z.infer<T>;
        runtimeContext?: RuntimeContext;
    } | undefined) => Promise<LegacyWorkflowRunResult<T, TSteps, TResult>>;
    watch: (onTransition: (state: Pick<LegacyWorkflowRunResult<T, TSteps, TResult>, 'results' | 'activePaths' | 'runId' | 'timestamp'>) => void) => () => void;
    resume: (props: {
        stepId: string;
        context?: Record<string, any>;
        runtimeContext?: RuntimeContext;
    }) => Promise<Omit<LegacyWorkflowRunResult<T, TSteps, TResult>, 'runId'> | undefined>;
    resumeWithEvent: (eventName: string, data: any, runtimeContext?: RuntimeContext) => Promise<Omit<LegacyWorkflowRunResult<T, TSteps, TResult>, 'runId'> | undefined>;
}
declare class WorkflowInstance<TSteps extends LegacyStep<any, any, any, any>[] = LegacyStep<any, any, any, any>[], TTriggerSchema extends z.ZodObject<any> = any, TResult extends z.ZodObject<any> = any> implements WorkflowResultReturn<TResult, TTriggerSchema, TSteps> {
    #private;
    name: string;
    logger: IMastraLogger;
    events?: Record<string, {
        schema: z.ZodObject<any>;
    }>;
    constructor({ name, logger, steps, runId, retryConfig, mastra, stepGraph, stepSubscriberGraph, onFinish, onStepTransition, resultMapping, events, }: {
        name: string;
        logger: IMastraLogger;
        steps: Record<string, StepNode>;
        mastra?: Mastra;
        retryConfig?: RetryConfig;
        runId?: string;
        stepGraph: StepGraph;
        stepSubscriberGraph: Record<string, StepGraph>;
        onFinish?: () => void;
        onStepTransition?: Set<(state: Pick<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResult>, 'results' | 'activePaths' | 'runId' | 'timestamp'>) => void | Promise<void>>;
        resultMapping?: Record<string, {
            step: StepAction<any, any, any, any>;
            path: string;
        }>;
        events?: Record<string, {
            schema: z.ZodObject<any>;
        }>;
    });
    setState(state: any): void;
    get runId(): string;
    get executionSpan(): Span | undefined;
    watch(onTransition: (state: Pick<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResult>, 'results' | 'activePaths' | 'runId' | 'timestamp'>) => void): () => void;
    start({ triggerData, runtimeContext, }?: {
        triggerData?: z.infer<TTriggerSchema>;
        runtimeContext?: RuntimeContext;
    }): Promise<{
        runId: string;
        result?: z.TypeOf<TResult> | undefined;
        triggerData?: z.TypeOf<TTriggerSchema> | undefined;
        results: { [K in keyof StepsRecord$1<TSteps>]: StepsRecord$1<TSteps>[K]["outputSchema"] extends undefined ? StepResult$1<unknown> : StepResult$1<z.TypeOf<NonNullable<StepsRecord$1<TSteps>[K]["outputSchema"]>>>; };
        timestamp: number;
        activePaths: Map<TSteps[number]["id"], {
            status: string;
            suspendPayload?: any;
            stepPath: string[];
        }>;
    }>;
    private isCompoundDependencyMet;
    execute({ triggerData, snapshot, stepId, resumeData, runtimeContext, }?: {
        stepId?: string;
        triggerData?: z.infer<TTriggerSchema>;
        snapshot?: Snapshot<any>;
        resumeData?: any;
        runtimeContext: RuntimeContext;
    }): Promise<Omit<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResult>, 'runId'>>;
    hasSubscribers(stepId: string): boolean;
    runMachine(parentStepId: string, input: any, runtimeContext?: RuntimeContext): Promise<(Pick<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResult>, "runId" | "results" | "timestamp" | "activePaths"> | undefined)[]>;
    suspend(stepId: string, machine: Machine<TSteps, TTriggerSchema>): Promise<void>;
    /**
     * Persists the workflow state to the database
     */
    persistWorkflowSnapshot(): Promise<void>;
    getState(): Promise<LegacyWorkflowRunState | null>;
    resumeWithEvent(eventName: string, data: any, runtimeContext?: RuntimeContext): Promise<Omit<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResult>, "runId"> | undefined>;
    resume({ stepId, context: resumeContext, runtimeContext, }: {
        stepId: string;
        context?: Record<string, any>;
        runtimeContext?: RuntimeContext;
    }): Promise<Omit<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResult>, "runId"> | undefined>;
    _resume({ stepId, context: resumeContext, runtimeContext, }: {
        stepId: string;
        context?: Record<string, any>;
        runtimeContext: RuntimeContext;
    }): Promise<Omit<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResult>, "runId"> | undefined>;
}

type WorkflowBuilder<T extends LegacyWorkflow<any, any>> = Pick<T, 'step' | 'then' | 'after' | 'while' | 'until' | 'if' | 'else' | 'afterEvent' | 'commit'>;
declare class LegacyWorkflow<TSteps extends LegacyStep<string, any, any>[] = LegacyStep<string, any, any>[], TStepId extends string = string, TTriggerSchema extends z.ZodObject<any> = any, TResultSchema extends z.ZodObject<any> = any> extends MastraBase {
    #private;
    name: TStepId;
    triggerSchema?: TTriggerSchema;
    resultSchema?: TResultSchema;
    resultMapping?: Record<string, {
        step: StepAction<string, any, any, any>;
        path: string;
    }>;
    events?: Record<string, {
        schema: z.ZodObject<any>;
    }>;
    isNested: boolean;
    /**
     * Creates a new LegacyWorkflow instance
     * @param name - Identifier for the workflow (not necessarily unique)
     * @param logger - Optional logger instance
     */
    constructor({ name, triggerSchema, result, retryConfig, mastra, events, }: WorkflowOptions<TStepId, TSteps, TTriggerSchema, TResultSchema>);
    step<TWorkflow extends LegacyWorkflow<any, any, any, any>, CondStep extends StepVariableType<any, any, any, any>, VarStep extends StepVariableType<any, any, any, any>, Steps extends StepAction<any, any, any, any>[] = TSteps>(next: TWorkflow, config?: StepConfig<ReturnType<TWorkflow['toStep']>, CondStep, VarStep, TTriggerSchema, Steps>): WorkflowBuilder<this>;
    step<TAgent extends Agent<any, any, any>, CondStep extends StepVariableType<any, any, any, any>, VarStep extends StepVariableType<any, any, any, any>, Steps extends StepAction<any, any, any, any>[] = TSteps>(next: TAgent, config?: StepConfig<ReturnType<TAgent['toStep']>, CondStep, VarStep, TTriggerSchema, Steps>): WorkflowBuilder<this>;
    step<TStep extends StepAction<any, any, any, any>, CondStep extends StepVariableType<any, any, any, any>, VarStep extends StepVariableType<any, any, any, any>, Steps extends StepAction<any, any, any, any>[] = TSteps>(step: TStep, config?: StepConfig<TStep, CondStep, VarStep, TTriggerSchema, Steps>): WorkflowBuilder<this>;
    then<TStep extends StepAction<string, any, any, any>, CondStep extends StepVariableType<any, any, any, any>, VarStep extends StepVariableType<any, any, any, any>>(next: TStep | TStep[], config?: StepConfig<TStep, CondStep, VarStep, TTriggerSchema>): this;
    then<TWorkflow extends LegacyWorkflow<any, any, any, any>, CondStep extends StepVariableType<any, any, any, any>, VarStep extends StepVariableType<any, any, any, any>>(next: TWorkflow | TWorkflow[], config?: StepConfig<StepAction<string, any, any, any>, CondStep, VarStep, TTriggerSchema>): this;
    then<TAgent extends Agent<any, any, any>, CondStep extends StepVariableType<any, any, any, any>, VarStep extends StepVariableType<any, any, any, any>>(next: TAgent | TAgent[], config?: StepConfig<StepAction<string, any, any, any>, CondStep, VarStep, TTriggerSchema>): this;
    private loop;
    while<FallbackStep extends StepAction<string, any, any, any>, CondStep extends StepVariableType<any, any, any, any>, VarStep extends StepVariableType<any, any, any, any>>(condition: StepConfig<FallbackStep, CondStep, VarStep, TTriggerSchema, TSteps>['when'], fallbackStep: FallbackStep, variables?: StepConfig<FallbackStep, CondStep, VarStep, TTriggerSchema, TSteps>['variables']): Pick<WorkflowBuilder<this>, "then" | "commit">;
    until<FallbackStep extends StepAction<string, any, any, any>, CondStep extends StepVariableType<any, any, any, any>, VarStep extends StepVariableType<any, any, any, any>>(condition: StepConfig<FallbackStep, CondStep, VarStep, TTriggerSchema, TSteps>['when'], fallbackStep: FallbackStep, variables?: StepConfig<FallbackStep, CondStep, VarStep, TTriggerSchema, TSteps>['variables']): Pick<WorkflowBuilder<this>, "then" | "commit">;
    if<TStep extends StepAction<string, any, any, any>>(condition: StepConfig<TStep, any, any, TTriggerSchema>['when'], ifStep?: TStep | LegacyWorkflow, elseStep?: TStep | LegacyWorkflow): this | WorkflowBuilder<this>;
    else(): WorkflowBuilder<this>;
    after<TStep extends StepAction<string, any, any, any>>(steps: string | TStep | TStep[] | (TStep | string)[]): Omit<WorkflowBuilder<this>, 'then' | 'after'>;
    after<TWorkflow extends LegacyWorkflow<any, any, any, any>>(steps: TWorkflow | TWorkflow[]): Omit<WorkflowBuilder<this>, 'then' | 'after'>;
    after<TAgent extends Agent<any, any, any>>(steps: TAgent | TAgent[]): Omit<WorkflowBuilder<this>, 'then' | 'after'>;
    afterEvent(eventName: string): WorkflowBuilder<this>;
    /**
     * Executes the workflow with the given trigger data
     * @param triggerData - Initial data to start the workflow with
     * @returns Promise resolving to workflow results or rejecting with error
     * @throws Error if trigger schema validation fails
     */
    createRun({ runId, events, }?: {
        runId?: string;
        events?: Record<string, {
            schema: z.ZodObject<any>;
        }>;
    }): WorkflowResultReturn<TResultSchema, TTriggerSchema, TSteps>;
    /**
     * Gets a workflow run instance by ID
     * @param runId - ID of the run to retrieve
     * @returns The workflow run instance if found, undefined otherwise
     */
    getRun(runId: string): Promise<WorkflowRun | WorkflowInstance<TSteps, TTriggerSchema, any> | null>;
    /**
     * Gets a workflow run instance by ID, from memory
     * @param runId - ID of the run to retrieve
     * @returns The workflow run instance if found, undefined otherwise
     */
    getMemoryRun(runId: string): WorkflowInstance<TSteps, TTriggerSchema, any> | undefined;
    /**
     * Rebuilds the machine with the current steps configuration and validates the workflow
     *
     * This is the last step of a workflow builder method chain
     * @throws Error if validation fails
     *
     * @returns this instance for method chaining
     */
    commit(): this;
    getWorkflowRuns(args?: {
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
        resourceId?: string;
    }): Promise<LegacyWorkflowRuns>;
    getExecutionSpan(runId: string): Span | undefined;
    getState(runId: string): Promise<LegacyWorkflowRunState | null>;
    resume({ runId, stepId, context: resumeContext, runtimeContext, }: {
        runId: string;
        stepId: string;
        context?: Record<string, any>;
        runtimeContext: RuntimeContext;
    }): Promise<Omit<LegacyWorkflowRunResult<TTriggerSchema, TSteps, any>, "runId"> | undefined>;
    watch(onTransition: (state: Pick<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResultSchema>, 'results' | 'activePaths' | 'runId' | 'timestamp'>) => void): () => void;
    resumeWithEvent(runId: string, eventName: string, data: any): Promise<Omit<LegacyWorkflowRunResult<TTriggerSchema, TSteps, any>, "runId"> | undefined>;
    __registerMastra(mastra: Mastra): void;
    __registerPrimitives(p: MastraPrimitives): void;
    get stepGraph(): StepGraph;
    get stepSubscriberGraph(): Record<string, StepGraph>;
    get serializedStepGraph(): StepGraph;
    get serializedStepSubscriberGraph(): Record<string, StepGraph>;
    get steps(): Record<string, StepAction<string, any, any, any>>;
    setNested(isNested: boolean): void;
    toStep(): LegacyStep<TStepId, TTriggerSchema, z.ZodType<LegacyWorkflowRunResult<TTriggerSchema, TSteps, TResultSchema>>, any>;
}

type ExecuteFunction<TStepInput, TStepOutput, TResumeSchema, TSuspendSchema, EngineType> = (params: {
    runId: string;
    mastra: Mastra;
    runtimeContext: RuntimeContext;
    inputData: TStepInput;
    resumeData?: TResumeSchema;
    getInitData<T extends z.ZodType<any>>(): z.infer<T>;
    getInitData<T extends Workflow<any, any, any, any, any>>(): T extends undefined ? unknown : z.infer<NonNullable<T['inputSchema']>>;
    getStepResult<T extends Step<any, any, any>>(stepId: T): T['outputSchema'] extends undefined ? unknown : z.infer<NonNullable<T['outputSchema']>>;
    suspend(suspendPayload: TSuspendSchema): Promise<void>;
    resume?: {
        steps: string[];
        resumePayload: any;
    };
    [EMITTER_SYMBOL]: Emitter;
    engine: EngineType;
}) => Promise<TStepOutput>;
interface Step<TStepId extends string = string, TSchemaIn extends z.ZodType<any> = z.ZodType<any>, TSchemaOut extends z.ZodType<any> = z.ZodType<any>, TResumeSchema extends z.ZodType<any> = z.ZodType<any>, TSuspendSchema extends z.ZodType<any> = z.ZodType<any>, TEngineType = any> {
    id: TStepId;
    description?: string;
    inputSchema: TSchemaIn;
    outputSchema: TSchemaOut;
    resumeSchema?: TResumeSchema;
    suspendSchema?: TSuspendSchema;
    execute: ExecuteFunction<z.infer<TSchemaIn>, z.infer<TSchemaOut>, z.infer<TResumeSchema>, z.infer<TSuspendSchema>, TEngineType>;
    retries?: number;
}

type Emitter = {
    emit: (event: string, data: any) => Promise<void>;
    on: (event: string, callback: (data: any) => void) => void;
    off: (event: string, callback: (data: any) => void) => void;
    once: (event: string, callback: (data: any) => void) => void;
};
type StepSuccess<P, R, S, T> = {
    status: 'success';
    output: T;
    payload: P;
    resumePayload?: R;
    suspendPayload?: S;
    startedAt: number;
    endedAt: number;
    suspendedAt?: number;
    resumedAt?: number;
};
type StepFailure<P, R, S> = {
    status: 'failed';
    error: string | Error;
    payload: P;
    resumePayload?: R;
    suspendPayload?: S;
    startedAt: number;
    endedAt: number;
    suspendedAt?: number;
    resumedAt?: number;
};
type StepSuspended<P, S> = {
    status: 'suspended';
    payload: P;
    suspendPayload?: S;
    startedAt: number;
    suspendedAt: number;
};
type StepRunning<P, R, S> = {
    status: 'running';
    payload: P;
    resumePayload?: R;
    suspendPayload?: S;
    startedAt: number;
    suspendedAt?: number;
    resumedAt?: number;
};
type StepWaiting<P, R, S> = {
    status: 'waiting';
    payload: P;
    suspendPayload?: S;
    resumePayload?: R;
    startedAt: number;
};
type StepResult<P, R, S, T> = StepSuccess<P, R, S, T> | StepFailure<P, R, S> | StepSuspended<P, S> | StepRunning<P, R, S> | StepWaiting<P, R, S>;
type StepsRecord<T extends readonly Step<any, any, any>[]> = {
    [K in T[number]['id']]: Extract<T[number], {
        id: K;
    }>;
};
type DynamicMapping<TPrevSchema extends z.ZodTypeAny, TSchemaOut extends z.ZodTypeAny> = {
    fn: ExecuteFunction<z.infer<TPrevSchema>, z.infer<TSchemaOut>, any, any, any>;
    schema: TSchemaOut;
};
type PathsToStringProps<T> = T extends object ? {
    [K in keyof T]: T[K] extends object ? K extends string ? K | `${K}.${PathsToStringProps<T[K]>}` : never : K extends string ? K : never;
}[keyof T] : never;
type ExtractSchemaType<T extends z.ZodType<any>> = T extends z.ZodObject<infer V> ? V : never;
type ExtractSchemaFromStep<TStep extends Step<any, any, any>, TKey extends 'inputSchema' | 'outputSchema'> = TStep[TKey];
type VariableReference<TStep extends Step<string, any, any> = Step<string, any, any>, TVarPath extends PathsToStringProps<ExtractSchemaType<ExtractSchemaFromStep<TStep, 'outputSchema'>>> | '' | '.' = PathsToStringProps<ExtractSchemaType<ExtractSchemaFromStep<TStep, 'outputSchema'>>> | '' | '.'> = {
    step: TStep;
    path: TVarPath;
} | {
    value: any;
    schema: z.ZodTypeAny;
};
type StreamEvent = TextStreamPart<any> | {
    type: 'step-suspended';
    payload: any;
    id: string;
} | {
    type: 'step-waiting';
    payload: any;
    id: string;
};
type WatchEvent = {
    type: 'watch';
    payload: {
        currentStep?: {
            id: string;
            status: 'running' | 'success' | 'failed' | 'suspended' | 'waiting';
            output?: Record<string, any>;
            resumePayload?: Record<string, any>;
            payload?: Record<string, any>;
            error?: string | Error;
        };
        workflowState: {
            status: 'running' | 'success' | 'failed' | 'suspended' | 'waiting';
            steps: Record<string, {
                status: 'running' | 'success' | 'failed' | 'suspended' | 'waiting';
                output?: Record<string, any>;
                payload?: Record<string, any>;
                resumePayload?: Record<string, any>;
                error?: string | Error;
                startedAt: number;
                endedAt: number;
                suspendedAt?: number;
                resumedAt?: number;
            }>;
            result?: Record<string, any>;
            payload?: Record<string, any>;
            error?: string | Error;
        };
    };
    eventTimestamp: Date;
};
type ZodPathType<T extends z.ZodTypeAny, P extends string> = T extends z.ZodObject<infer Shape> ? P extends `${infer Key}.${infer Rest}` ? Key extends keyof Shape ? Shape[Key] extends z.ZodTypeAny ? ZodPathType<Shape[Key], Rest> : never : never : P extends keyof Shape ? Shape[P] : never : never;
interface WorkflowRunState {
    runId: string;
    status: 'success' | 'failed' | 'suspended' | 'running' | 'waiting';
    result?: Record<string, any>;
    error?: string | Error;
    value: Record<string, string>;
    context: {
        input?: Record<string, any>;
    } & Record<string, StepResult<any, any, any, any>>;
    serializedStepGraph: SerializedStepFlowEntry[];
    activePaths: Array<unknown>;
    suspendedPaths: Record<string, number[]>;
    timestamp: number;
}

/**
 * Represents an execution graph for a workflow
 */
interface ExecutionGraph {
    id: string;
    steps: StepFlowEntry[];
}
/**
 * Execution engine abstract class for building and executing workflow graphs
 * Providers will implement this class to provide their own execution logic
 */
declare abstract class ExecutionEngine extends MastraBase {
    protected mastra?: Mastra;
    constructor({ mastra }: {
        mastra?: Mastra;
    });
    __registerMastra(mastra: Mastra): void;
    /**
     * Executes a workflow run with the provided execution graph and input
     * @param graph The execution graph to execute
     * @param input The input data for the workflow
     * @returns A promise that resolves to the workflow output
     */
    abstract execute<TInput, TOutput>(params: {
        workflowId: string;
        runId: string;
        graph: ExecutionGraph;
        serializedStepGraph: SerializedStepFlowEntry[];
        input?: TInput;
        resume?: {
            steps: string[];
            stepResults: Record<string, StepResult<any, any, any, any>>;
            resumePayload: any;
            resumePath: number[];
        };
        emitter: Emitter;
        runtimeContext: RuntimeContext;
        retryConfig?: {
            attempts?: number;
            delay?: number;
        };
    }): Promise<TOutput>;
}

type DefaultEngineType = {};
type StepFlowEntry<TEngineType = DefaultEngineType> = {
    type: 'step';
    step: Step;
} | {
    type: 'sleep';
    id: string;
    duration: number;
} | {
    type: 'sleepUntil';
    id: string;
    date: Date;
} | {
    type: 'waitForEvent';
    event: string;
    step: Step;
    timeout?: number;
} | {
    type: 'parallel';
    steps: StepFlowEntry[];
} | {
    type: 'conditional';
    steps: StepFlowEntry[];
    conditions: ExecuteFunction<any, any, any, any, TEngineType>[];
    serializedConditions: {
        id: string;
        fn: string;
    }[];
} | {
    type: 'loop';
    step: Step;
    condition: ExecuteFunction<any, any, any, any, TEngineType>;
    serializedCondition: {
        id: string;
        fn: string;
    };
    loopType: 'dowhile' | 'dountil';
} | {
    type: 'foreach';
    step: Step;
    opts: {
        concurrency: number;
    };
};
type SerializedStep<TEngineType = DefaultEngineType> = Pick<Step<any, any, any, any, any, TEngineType>, 'id' | 'description'> & {
    component?: string;
    serializedStepFlow?: SerializedStepFlowEntry[];
    mapConfig?: string;
};
type SerializedStepFlowEntry = {
    type: 'step';
    step: SerializedStep;
} | {
    type: 'sleep';
    id: string;
    duration: number;
} | {
    type: 'sleepUntil';
    id: string;
    date: Date;
} | {
    type: 'waitForEvent';
    event: string;
    step: SerializedStep;
    timeout?: number;
} | {
    type: 'parallel';
    steps: SerializedStepFlowEntry[];
} | {
    type: 'conditional';
    steps: SerializedStepFlowEntry[];
    serializedConditions: {
        id: string;
        fn: string;
    }[];
} | {
    type: 'loop';
    step: SerializedStep;
    serializedCondition: {
        id: string;
        fn: string;
    };
    loopType: 'dowhile' | 'dountil';
} | {
    type: 'foreach';
    step: SerializedStep;
    opts: {
        concurrency: number;
    };
};
/**
 * Creates a new workflow step
 * @param params Configuration parameters for the step
 * @param params.id Unique identifier for the step
 * @param params.description Optional description of what the step does
 * @param params.inputSchema Zod schema defining the input structure
 * @param params.outputSchema Zod schema defining the output structure
 * @param params.execute Function that performs the step's operations
 * @returns A Step object that can be added to the workflow
 */
declare function createStep<TStepId extends string, TStepInput extends z.ZodType<any>, TStepOutput extends z.ZodType<any>, TResumeSchema extends z.ZodType<any>, TSuspendSchema extends z.ZodType<any>>(params: {
    id: TStepId;
    description?: string;
    inputSchema: TStepInput;
    outputSchema: TStepOutput;
    resumeSchema?: TResumeSchema;
    suspendSchema?: TSuspendSchema;
    execute: ExecuteFunction<z.infer<TStepInput>, z.infer<TStepOutput>, z.infer<TResumeSchema>, z.infer<TSuspendSchema>, DefaultEngineType>;
}): Step<TStepId, TStepInput, TStepOutput, TResumeSchema, TSuspendSchema, DefaultEngineType>;
declare function createStep<TStepId extends string, TStepInput extends z.ZodObject<{
    prompt: z.ZodString;
}>, TStepOutput extends z.ZodObject<{
    text: z.ZodString;
}>, TResumeSchema extends z.ZodType<any>, TSuspendSchema extends z.ZodType<any>>(agent: Agent<TStepId, any, any>): Step<TStepId, TStepInput, TStepOutput, TResumeSchema, TSuspendSchema, DefaultEngineType>;
declare function createStep<TSchemaIn extends z.ZodType<any>, TSchemaOut extends z.ZodType<any>, TContext extends ToolExecutionContext<TSchemaIn>>(tool: Tool<TSchemaIn, TSchemaOut, TContext> & {
    inputSchema: TSchemaIn;
    outputSchema: TSchemaOut;
    execute: (context: TContext) => Promise<any>;
}): Step<string, TSchemaIn, TSchemaOut, z.ZodType<any>, z.ZodType<any>, DefaultEngineType>;
declare function cloneStep<TStepId extends string>(step: Step<string, any, any, any, any, DefaultEngineType>, opts: {
    id: TStepId;
}): Step<TStepId, any, any, any, any, DefaultEngineType>;
declare function createWorkflow<TWorkflowId extends string = string, TInput extends z.ZodType<any> = z.ZodType<any>, TOutput extends z.ZodType<any> = z.ZodType<any>, TSteps extends Step<string, any, any, any, any, DefaultEngineType>[] = Step<string, any, any, any, any, DefaultEngineType>[]>(params: WorkflowConfig<TWorkflowId, TInput, TOutput, TSteps>): Workflow<DefaultEngineType, TSteps, TWorkflowId, TInput, TOutput, TInput>;
declare function cloneWorkflow<TWorkflowId extends string = string, TInput extends z.ZodType<any> = z.ZodType<any>, TOutput extends z.ZodType<any> = z.ZodType<any>, TSteps extends Step<string, any, any, any, any, DefaultEngineType>[] = Step<string, any, any, any, any, DefaultEngineType>[]>(workflow: Workflow<DefaultEngineType, TSteps, string, TInput, TOutput, TInput>, opts: {
    id: TWorkflowId;
}): Workflow<DefaultEngineType, TSteps, TWorkflowId, TInput, TOutput, TInput>;
type WorkflowResult<TOutput extends z.ZodType<any>, TSteps extends Step<string, any, any>[]> = {
    status: 'success';
    result: z.infer<TOutput>;
    steps: {
        [K in keyof StepsRecord<TSteps>]: StepsRecord<TSteps>[K]['outputSchema'] extends undefined ? StepResult<unknown, unknown, unknown, unknown> : StepResult<z.infer<NonNullable<StepsRecord<TSteps>[K]['inputSchema']>>, z.infer<NonNullable<StepsRecord<TSteps>[K]['resumeSchema']>>, z.infer<NonNullable<StepsRecord<TSteps>[K]['suspendSchema']>>, z.infer<NonNullable<StepsRecord<TSteps>[K]['outputSchema']>>>;
    };
} | {
    status: 'failed';
    steps: {
        [K in keyof StepsRecord<TSteps>]: StepsRecord<TSteps>[K]['outputSchema'] extends undefined ? StepResult<unknown, unknown, unknown, unknown> : StepResult<z.infer<NonNullable<StepsRecord<TSteps>[K]['inputSchema']>>, z.infer<NonNullable<StepsRecord<TSteps>[K]['resumeSchema']>>, z.infer<NonNullable<StepsRecord<TSteps>[K]['suspendSchema']>>, z.infer<NonNullable<StepsRecord<TSteps>[K]['outputSchema']>>>;
    };
    error: Error;
} | {
    status: 'suspended';
    steps: {
        [K in keyof StepsRecord<TSteps>]: StepsRecord<TSteps>[K]['outputSchema'] extends undefined ? StepResult<unknown, unknown, unknown, unknown> : StepResult<z.infer<NonNullable<StepsRecord<TSteps>[K]['inputSchema']>>, z.infer<NonNullable<StepsRecord<TSteps>[K]['resumeSchema']>>, z.infer<NonNullable<StepsRecord<TSteps>[K]['suspendSchema']>>, z.infer<NonNullable<StepsRecord<TSteps>[K]['outputSchema']>>>;
    };
    suspended: [string[], ...string[][]];
};
type WorkflowConfig<TWorkflowId extends string = string, TInput extends z.ZodType<any> = z.ZodType<any>, TOutput extends z.ZodType<any> = z.ZodType<any>, TSteps extends Step<string, any, any, any, any, any>[] = Step<string, any, any, any, any, any>[]> = {
    mastra?: Mastra;
    id: TWorkflowId;
    description?: string | undefined;
    inputSchema: TInput;
    outputSchema: TOutput;
    executionEngine?: ExecutionEngine;
    steps?: TSteps;
    retryConfig?: {
        attempts?: number;
        delay?: number;
    };
};
declare class Workflow<TEngineType = any, TSteps extends Step<string, any, any, any, any, TEngineType>[] = Step<string, any, any, any, any, TEngineType>[], TWorkflowId extends string = string, TInput extends z.ZodType<any> = z.ZodType<any>, TOutput extends z.ZodType<any> = z.ZodType<any>, TPrevSchema extends z.ZodType<any> = TInput> extends MastraBase implements Step<TWorkflowId, TInput, TOutput, any, any, DefaultEngineType> {
    #private;
    id: TWorkflowId;
    description?: string | undefined;
    inputSchema: TInput;
    outputSchema: TOutput;
    steps: Record<string, Step<string, any, any, any, any>>;
    stepDefs?: TSteps;
    protected stepFlow: StepFlowEntry[];
    protected serializedStepFlow: SerializedStepFlowEntry[];
    protected executionEngine: ExecutionEngine;
    protected executionGraph: ExecutionGraph;
    protected retryConfig: {
        attempts?: number;
        delay?: number;
    };
    constructor({ mastra, id, inputSchema, outputSchema, description, executionEngine, retryConfig, steps, }: WorkflowConfig<TWorkflowId, TInput, TOutput, TSteps>);
    get runs(): Map<string, Run<TEngineType, TSteps, TInput, TOutput>>;
    get mastra(): Mastra<Record<string, Agent<any, ToolsInput, Record<string, Metric>>>, Record<string, LegacyWorkflow<LegacyStep<string, any, any, StepExecutionContext<any, WorkflowContext<any, LegacyStep<string, any, any, any>[], Record<string, any>>>>[], string, any, any>>, Record<string, Workflow<any, Step<string, any, any, any, any, any>[], string, z.ZodType<any, z.ZodTypeDef, any>, z.ZodType<any, z.ZodTypeDef, any>, z.ZodType<any, z.ZodTypeDef, any>>>, Record<string, MastraVector>, Record<string, MastraTTS>, IMastraLogger, Record<string, AgentNetwork>, Record<string, MCPServerBase>> | undefined;
    __registerMastra(mastra: Mastra): void;
    __registerPrimitives(p: MastraPrimitives): void;
    setStepFlow(stepFlow: StepFlowEntry[]): void;
    /**
     * Adds a step to the workflow
     * @param step The step to add to the workflow
     * @returns The workflow instance for chaining
     */
    then<TStepInputSchema extends TPrevSchema, TStepId extends string, TSchemaOut extends z.ZodType<any>>(step: Step<TStepId, TStepInputSchema, TSchemaOut, any, any, TEngineType>): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, TSchemaOut>;
    /**
     * Adds a sleep step to the workflow
     * @param duration The duration to sleep for
     * @returns The workflow instance for chaining
     */
    sleep(duration: number): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, TPrevSchema>;
    /**
     * Adds a sleep until step to the workflow
     * @param date The date to sleep until
     * @returns The workflow instance for chaining
     */
    sleepUntil(date: Date): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, TPrevSchema>;
    waitForEvent<TStepInputSchema extends TPrevSchema, TStepId extends string, TSchemaOut extends z.ZodType<any>>(event: string, step: Step<TStepId, TStepInputSchema, TSchemaOut, any, any, TEngineType>, opts?: {
        timeout?: number;
    }): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, TSchemaOut>;
    map<TSteps extends Step<string, any, any, any, any, TEngineType>[], TMapping extends {
        [K in keyof TMapping]: {
            step: TSteps[number] | TSteps[number][];
            path: PathsToStringProps<ExtractSchemaType<ExtractSchemaFromStep<TSteps[number], 'outputSchema'>>> | '.';
        } | {
            value: any;
            schema: z.ZodTypeAny;
        } | {
            initData: TSteps[number];
            path: PathsToStringProps<ExtractSchemaType<ExtractSchemaFromStep<TSteps[number], 'inputSchema'>>> | '.';
        } | {
            runtimeContextPath: string;
            schema: z.ZodTypeAny;
        } | DynamicMapping<TPrevSchema, z.ZodTypeAny>;
    }>(mappingConfig: TMapping | ExecuteFunction<z.infer<TPrevSchema>, any, any, any, TEngineType>): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, any>;
    parallel<TParallelSteps extends Step<string, TPrevSchema, any, any, any, TEngineType>[]>(steps: TParallelSteps): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, z.ZodObject<{ [K in keyof StepsRecord<TParallelSteps>]: StepsRecord<TParallelSteps>[K]["outputSchema"]; }, any, z.ZodTypeAny>>;
    branch<TBranchSteps extends Array<[
        ExecuteFunction<z.infer<TPrevSchema>, any, any, any, TEngineType>,
        Step<string, TPrevSchema, any, any, any, TEngineType>
    ]>>(steps: TBranchSteps): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, z.ZodObject<{ [K in keyof StepsRecord<{ [K_1 in keyof TBranchSteps]: TBranchSteps[K_1][1]; }[number][]>]: StepsRecord<{ [K_1 in keyof TBranchSteps]: TBranchSteps[K_1][1]; }[number][]>[K]["outputSchema"]; }, any, z.ZodTypeAny>>;
    dowhile<TStepInputSchema extends TPrevSchema, TStepId extends string, TSchemaOut extends z.ZodType<any>>(step: Step<TStepId, TStepInputSchema, TSchemaOut, any, any, TEngineType>, condition: ExecuteFunction<z.infer<TSchemaOut>, any, any, any, TEngineType>): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, TSchemaOut>;
    dountil<TStepInputSchema extends TPrevSchema, TStepId extends string, TSchemaOut extends z.ZodType<any>>(step: Step<TStepId, TStepInputSchema, TSchemaOut, any, any, TEngineType>, condition: ExecuteFunction<z.infer<TSchemaOut>, any, any, any, TEngineType>): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, TSchemaOut>;
    foreach<TPrevIsArray extends TPrevSchema extends z.ZodArray<any> ? true : false, TStepInputSchema extends TPrevSchema extends z.ZodArray<infer TElement> ? TElement : never, TStepId extends string, TSchemaOut extends z.ZodType<any>>(step: TPrevIsArray extends true ? Step<TStepId, TStepInputSchema, TSchemaOut, any, any, TEngineType> : 'Previous step must return an array type', opts?: {
        concurrency: number;
    }): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, z.ZodArray<TSchemaOut>>;
    /**
     * Builds the execution graph for this workflow
     * @returns The execution graph that can be used to execute the workflow
     */
    buildExecutionGraph(): ExecutionGraph;
    /**
     * Finalizes the workflow definition and prepares it for execution
     * This method should be called after all steps have been added to the workflow
     * @returns A built workflow instance ready for execution
     */
    commit(): Workflow<TEngineType, TSteps, TWorkflowId, TInput, TOutput, TOutput>;
    get stepGraph(): StepFlowEntry<DefaultEngineType>[];
    get serializedStepGraph(): SerializedStepFlowEntry[];
    /**
     * Creates a new workflow run instance
     * @param options Optional configuration for the run
     * @returns A Run instance that can be used to execute the workflow
     */
    createRun(options?: {
        runId?: string;
    }): Run<TEngineType, TSteps, TInput, TOutput>;
    execute({ inputData, resumeData, suspend, resume, [EMITTER_SYMBOL]: emitter, mastra, runtimeContext, }: {
        inputData: z.infer<TInput>;
        resumeData?: any;
        getStepResult<T extends Step<any, any, any, any, any, TEngineType>>(stepId: T): T['outputSchema'] extends undefined ? unknown : z.infer<NonNullable<T['outputSchema']>>;
        suspend: (suspendPayload: any) => Promise<void>;
        resume?: {
            steps: string[];
            resumePayload: any;
            runId?: string;
        };
        [EMITTER_SYMBOL]: {
            emit: (event: string, data: any) => void;
        };
        mastra: Mastra;
        runtimeContext?: RuntimeContext;
        engine: DefaultEngineType;
    }): Promise<z.infer<TOutput>>;
    getWorkflowRuns(args?: {
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
        resourceId?: string;
    }): Promise<WorkflowRuns>;
    getWorkflowRunById(runId: string): Promise<WorkflowRun | null>;
    getWorkflowRunExecutionResult(runId: string): Promise<WatchEvent['payload']['workflowState'] | null>;
}
/**
 * Represents a workflow run that can be executed
 */
declare class Run<TEngineType = any, TSteps extends Step<string, any, any, any, any, TEngineType>[] = Step<string, any, any, any, any, TEngineType>[], TInput extends z.ZodType<any> = z.ZodType<any>, TOutput extends z.ZodType<any> = z.ZodType<any>> {
    #private;
    protected emitter: EventEmitter$1;
    /**
     * Unique identifier for this workflow
     */
    readonly workflowId: string;
    /**
     * Unique identifier for this run
     */
    readonly runId: string;
    /**
     * Internal state of the workflow run
     */
    protected state: Record<string, any>;
    /**
     * The execution engine for this run
     */
    executionEngine: ExecutionEngine;
    /**
     * The execution graph for this run
     */
    executionGraph: ExecutionGraph;
    /**
     * The serialized step graph for this run
     */
    serializedStepGraph: SerializedStepFlowEntry[];
    protected closeStreamAction?: () => Promise<void>;
    protected executionResults?: Promise<WorkflowResult<TOutput, TSteps>>;
    protected cleanup?: () => void;
    protected retryConfig?: {
        attempts?: number;
        delay?: number;
    };
    constructor(params: {
        workflowId: string;
        runId: string;
        executionEngine: ExecutionEngine;
        executionGraph: ExecutionGraph;
        mastra?: Mastra;
        retryConfig?: {
            attempts?: number;
            delay?: number;
        };
        cleanup?: () => void;
        serializedStepGraph: SerializedStepFlowEntry[];
    });
    sendEvent(event: string, data: any): void;
    /**
     * Starts the workflow execution with the provided input
     * @param input The input data for the workflow
     * @returns A promise that resolves to the workflow output
     */
    start({ inputData, runtimeContext, }: {
        inputData?: z.infer<TInput>;
        runtimeContext?: RuntimeContext;
    }): Promise<WorkflowResult<TOutput, TSteps>>;
    /**
     * Starts the workflow execution with the provided input as a stream
     * @param input The input data for the workflow
     * @returns A promise that resolves to the workflow output
     */
    stream({ inputData, runtimeContext }?: {
        inputData?: z.infer<TInput>;
        runtimeContext?: RuntimeContext;
    }): {
        stream: ReadableStream<StreamEvent>;
        getWorkflowState: () => Promise<WorkflowResult<TOutput, TSteps>>;
    };
    watch(cb: (event: WatchEvent) => void, type?: 'watch' | 'watch-v2'): () => void;
    resume<TResumeSchema extends z.ZodType<any>>(params: {
        resumeData?: z.infer<TResumeSchema>;
        step: Step<string, any, any, TResumeSchema, any, TEngineType> | [...Step<string, any, any, any, any, TEngineType>[], Step<string, any, any, TResumeSchema, any, TEngineType>] | string | string[];
        runtimeContext?: RuntimeContext;
    }): Promise<WorkflowResult<TOutput, TSteps>>;
    /**
     * Returns the current state of the workflow run
     * @returns The current state of the workflow run
     */
    getState(): Record<string, any>;
    updateState(state: Record<string, any>): void;
}

interface StorageColumn {
    type: 'text' | 'timestamp' | 'uuid' | 'jsonb' | 'integer' | 'bigint';
    primaryKey?: boolean;
    nullable?: boolean;
    references?: {
        table: string;
        column: string;
    };
}
interface LegacyWorkflowRuns {
    runs: LegacyWorkflowRun[];
    total: number;
}
interface LegacyWorkflowRun {
    workflowName: string;
    runId: string;
    snapshot: LegacyWorkflowRunState | string;
    createdAt: Date;
    updatedAt: Date;
    resourceId?: string;
}
interface WorkflowRuns {
    runs: WorkflowRun[];
    total: number;
}
interface WorkflowRun {
    workflowName: string;
    runId: string;
    snapshot: WorkflowRunState | string;
    createdAt: Date;
    updatedAt: Date;
    resourceId?: string;
}
type PaginationArgs = {
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    page?: number;
    perPage?: number;
};
type PaginationInfo = {
    total: number;
    page: number;
    perPage: number;
    hasMore: boolean;
};
type StorageGetMessagesArg = {
    threadId: string;
    resourceId?: string;
    selectBy?: {
        vectorSearchString?: string;
        last?: number | false;
        include?: {
            id: string;
            threadId?: string;
            withPreviousMessages?: number;
            withNextMessages?: number;
        }[];
        pagination?: PaginationArgs;
    };
    threadConfig?: MemoryConfig;
    format?: 'v1' | 'v2';
};
type EvalRow = {
    input: string;
    output: string;
    result: MetricResult;
    agentName: string;
    createdAt: string;
    metricName: string;
    instructions: string;
    runId: string;
    globalRunId: string;
    testInfo?: TestInfo;
};
type StorageGetTracesArg = {
    name?: string;
    scope?: string;
    page: number;
    perPage: number;
    attributes?: Record<string, string>;
    filters?: Record<string, any>;
    fromDate?: Date;
    toDate?: Date;
};

declare const TABLE_WORKFLOW_SNAPSHOT = "mastra_workflow_snapshot";
declare const TABLE_EVALS = "mastra_evals";
declare const TABLE_MESSAGES = "mastra_messages";
declare const TABLE_THREADS = "mastra_threads";
declare const TABLE_TRACES = "mastra_traces";
type TABLE_NAMES = typeof TABLE_WORKFLOW_SNAPSHOT | typeof TABLE_EVALS | typeof TABLE_MESSAGES | typeof TABLE_THREADS | typeof TABLE_TRACES;
declare const TABLE_SCHEMAS: Record<TABLE_NAMES, Record<string, StorageColumn>>;

type MastraMessageV1 = {
    id: string;
    content: string | UserContent | AssistantContent | ToolContent;
    role: 'system' | 'user' | 'assistant' | 'tool';
    createdAt: Date;
    threadId?: string;
    resourceId?: string;
    toolCallIds?: string[];
    toolCallArgs?: Record<string, unknown>[];
    toolNames?: string[];
    type: 'text' | 'tool-call' | 'tool-result';
};
/**
 * @deprecated use MastraMessageV1 or MastraMessageV2
 */
type MessageType = MastraMessageV1;
type StorageThreadType = {
    id: string;
    title?: string;
    resourceId: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, unknown>;
};
type MessageResponse<T extends 'raw' | 'core_message'> = {
    raw: MastraMessageV1[];
    core_message: CoreMessage$1[];
}[T];
type BaseWorkingMemory = {
    enabled: boolean;
    /** @deprecated The `use` option has been removed. Working memory always uses tool-call mode. */
    use?: never;
};
type TemplateWorkingMemory = BaseWorkingMemory & {
    template: string;
    schema?: never;
};
type SchemaWorkingMemory = BaseWorkingMemory & {
    schema: ZodObject<any>;
    template?: never;
};
type WorkingMemoryNone = BaseWorkingMemory & {
    template?: never;
    schema?: never;
};
type WorkingMemory = TemplateWorkingMemory | SchemaWorkingMemory | WorkingMemoryNone;
type MemoryConfig = {
    lastMessages?: number | false;
    semanticRecall?: boolean | {
        topK: number;
        messageRange: number | {
            before: number;
            after: number;
        };
        scope?: 'thread' | 'resource';
    };
    workingMemory?: WorkingMemory;
    threads?: {
        generateTitle?: boolean;
    };
};
type SharedMemoryConfig = {
    storage?: MastraStorage;
    options?: MemoryConfig;
    vector?: MastraVector | false;
    embedder?: EmbeddingModel<string>;
    processors?: MemoryProcessor[];
};
type TraceType = {
    id: string;
    parentSpanId: string | null;
    name: string;
    traceId: string;
    scope: string;
    kind: number;
    attributes: Record<string, unknown> | null;
    status: Record<string, unknown> | null;
    events: Record<string, unknown> | null;
    links: Record<string, unknown> | null;
    other: Record<string, unknown> | null;
    startTime: number;
    endTime: number;
    createdAt: Date;
};
type WorkingMemoryFormat = 'json' | 'markdown';
type WorkingMemoryTemplate = {
    format: WorkingMemoryFormat;
    content: string;
};

type MastraMessageContentV2 = {
    format: 2;
    parts: UIMessage['parts'];
    experimental_attachments?: UIMessage['experimental_attachments'];
    content?: UIMessage['content'];
    toolInvocations?: UIMessage['toolInvocations'];
    reasoning?: UIMessage['reasoning'];
    annotations?: UIMessage['annotations'];
    metadata?: Record<string, unknown>;
};
type MastraMessageV2 = {
    id: string;
    content: MastraMessageContentV2;
    role: 'user' | 'assistant';
    createdAt: Date;
    threadId?: string;
    resourceId?: string;
    type?: string;
};
type MessageInput = UIMessage | Message | MastraMessageV1 | CoreMessage$1 | MastraMessageV2;
type MessageSource = 'memory' | 'response' | 'user' | 'system' | 'context';
declare class MessageList {
    private messages;
    private systemMessages;
    private taggedSystemMessages;
    private memoryInfo;
    private memoryMessages;
    private newUserMessages;
    private newResponseMessages;
    private userContextMessages;
    private generateMessageId?;
    constructor({ threadId, resourceId, generateMessageId, }?: {
        threadId?: string;
        resourceId?: string;
        generateMessageId?: IDGenerator$1;
    });
    add(messages: string | string[] | MessageInput | MessageInput[], messageSource: MessageSource): this;
    getLatestUserContent(): string | null;
    get get(): {
        all: {
            v2: () => MastraMessageV2[];
            v1: () => MastraMessageV1[];
            ui: () => UIMessage[];
            core: () => CoreMessage$1[];
            prompt: () => CoreMessage$1[];
        };
        remembered: {
            v2: () => MastraMessageV2[];
            v1: () => MastraMessageV1[];
            ui: () => UIMessage[];
            core: () => CoreMessage$1[];
        };
        input: {
            v2: () => MastraMessageV2[];
            v1: () => MastraMessageV1[];
            ui: () => UIMessage[];
            core: () => CoreMessage$1[];
        };
        response: {
            v2: () => MastraMessageV2[];
        };
    };
    private all;
    private remembered;
    private input;
    private response;
    drainUnsavedMessages(): MastraMessageV2[];
    getSystemMessages(tag?: string): CoreMessage$1[];
    addSystem(messages: CoreSystemMessage$1 | CoreSystemMessage$1[] | string | string[] | null, tag?: string): this;
    private convertToCoreMessages;
    private sanitizeUIMessages;
    private addOneSystem;
    private isDuplicateSystem;
    private static toUIMessage;
    private getMessageById;
    private shouldReplaceMessage;
    private addOne;
    private inputToMastraMessageV2;
    private lastCreatedAt?;
    private generateCreatedAt;
    private newMessageId;
    private mastraMessageV1ToMastraMessageV2;
    private hydrateMastraMessageV2Fields;
    private vercelUIMessageToMastraMessageV2;
    private vercelCoreMessageToMastraMessageV2;
    static isVercelUIMessage(msg: MessageInput): msg is UIMessage;
    static isVercelCoreMessage(msg: MessageInput): msg is CoreMessage$1;
    static isMastraMessage(msg: MessageInput): msg is MastraMessageV2 | MastraMessageV1;
    static isMastraMessageV1(msg: MessageInput): msg is MastraMessageV1;
    static isMastraMessageV2(msg: MessageInput): msg is MastraMessageV2;
    private static getRole;
    private static cacheKeyFromParts;
    private static coreContentToString;
    private static cacheKeyFromContent;
    private static messagesAreEqual;
}

type MemoryProcessorOpts = {
    systemMessage?: string;
    memorySystemMessage?: string;
    newMessages?: CoreMessage$1[];
};
/**
 * Interface for message processors that can filter or transform messages
 * before they're sent to the LLM.
 */
declare abstract class MemoryProcessor extends MastraBase {
    /**
     * Process a list of messages and return a filtered or transformed list.
     * @param messages The messages to process
     * @returns The processed messages
     */
    process(messages: CoreMessage$1[], _opts: MemoryProcessorOpts): CoreMessage$1[];
}
declare const memoryDefaultOptions: {
    lastMessages: number;
    semanticRecall: false;
    threads: {
        generateTitle: false;
    };
    workingMemory: {
        enabled: false;
        template: string;
    };
};
/**
 * Abstract Memory class that defines the interface for storing and retrieving
 * conversation threads and messages.
 */
declare abstract class MastraMemory extends MastraBase {
    MAX_CONTEXT_TOKENS?: number;
    protected _storage?: MastraStorage;
    vector?: MastraVector;
    embedder?: EmbeddingModel<string>;
    private processors;
    protected threadConfig: MemoryConfig;
    constructor(config: {
        name: string;
    } & SharedMemoryConfig);
    protected _hasOwnStorage: boolean;
    get hasOwnStorage(): boolean;
    get storage(): MastraStorage;
    setStorage(storage: MastraStorage): void;
    setVector(vector: MastraVector): void;
    setEmbedder(embedder: EmbeddingModel<string>): void;
    /**
     * Get a system message to inject into the conversation.
     * This will be called before each conversation turn.
     * Implementations can override this to inject custom system messages.
     */
    getSystemMessage(_input: {
        threadId: string;
        memoryConfig?: MemoryConfig;
    }): Promise<string | null>;
    /**
     * Get a user context message to inject into the conversation.
     * This will be called before each conversation turn.
     * Implementations can override this to inject custom system messages.
     */
    getUserContextMessage(_input: {
        threadId: string;
    }): Promise<string | null>;
    /**
     * Get tools that should be available to the agent.
     * This will be called when converting tools for the agent.
     * Implementations can override this to provide additional tools.
     */
    getTools(_config?: MemoryConfig): Record<string, CoreTool>;
    protected createEmbeddingIndex(dimensions?: number): Promise<{
        indexName: string;
    }>;
    getMergedThreadConfig(config?: MemoryConfig): MemoryConfig;
    /**
     * Apply all configured message processors to a list of messages.
     * @param messages The messages to process
     * @returns The processed messages
     */
    private applyProcessors;
    processMessages({ messages, processors, ...opts }: {
        messages: CoreMessage$1[];
        processors?: MemoryProcessor[];
    } & MemoryProcessorOpts): CoreMessage$1[];
    abstract rememberMessages({ threadId, resourceId, vectorMessageSearch, config, }: {
        threadId: string;
        resourceId?: string;
        vectorMessageSearch?: string;
        config?: MemoryConfig;
    }): Promise<{
        messages: MastraMessageV1[];
        messagesV2: MastraMessageV2[];
    }>;
    estimateTokens(text: string): number;
    /**
     * Retrieves a specific thread by its ID
     * @param threadId - The unique identifier of the thread
     * @returns Promise resolving to the thread or null if not found
     */
    abstract getThreadById({ threadId }: {
        threadId: string;
    }): Promise<StorageThreadType | null>;
    abstract getThreadsByResourceId({ resourceId }: {
        resourceId: string;
    }): Promise<StorageThreadType[]>;
    /**
     * Saves or updates a thread
     * @param thread - The thread data to save
     * @returns Promise resolving to the saved thread
     */
    abstract saveThread({ thread, memoryConfig, }: {
        thread: StorageThreadType;
        memoryConfig?: MemoryConfig;
    }): Promise<StorageThreadType>;
    /**
     * Saves messages to a thread
     * @param messages - Array of messages to save
     * @returns Promise resolving to the saved messages
     */
    abstract saveMessages(args: {
        messages: (MastraMessageV1 | MastraMessageV2)[] | MastraMessageV1[] | MastraMessageV2[];
        memoryConfig?: MemoryConfig | undefined;
        format?: 'v1';
    }): Promise<MastraMessageV1[]>;
    abstract saveMessages(args: {
        messages: (MastraMessageV1 | MastraMessageV2)[] | MastraMessageV1[] | MastraMessageV2[];
        memoryConfig?: MemoryConfig | undefined;
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    abstract saveMessages(args: {
        messages: (MastraMessageV1 | MastraMessageV2)[] | MastraMessageV1[] | MastraMessageV2[];
        memoryConfig?: MemoryConfig | undefined;
        format?: 'v1' | 'v2';
    }): Promise<MastraMessageV2[] | MastraMessageV1[]>;
    /**
     * Retrieves all messages for a specific thread
     * @param threadId - The unique identifier of the thread
     * @returns Promise resolving to array of messages and uiMessages
     */
    abstract query({ threadId, resourceId, selectBy, }: StorageGetMessagesArg): Promise<{
        messages: CoreMessage$1[];
        uiMessages: UIMessage[];
    }>;
    /**
     * Helper method to create a new thread
     * @param title - Optional title for the thread
     * @param metadata - Optional metadata for the thread
     * @returns Promise resolving to the created thread
     */
    createThread({ threadId, resourceId, title, metadata, memoryConfig, }: {
        resourceId: string;
        threadId?: string;
        title?: string;
        metadata?: Record<string, unknown>;
        memoryConfig?: MemoryConfig;
    }): Promise<StorageThreadType>;
    /**
     * Helper method to delete a thread
     * @param threadId - the id of the thread to delete
     */
    abstract deleteThread(threadId: string): Promise<void>;
    /**
     * Helper method to add a single message to a thread
     * @param threadId - The thread to add the message to
     * @param content - The message content
     * @param role - The role of the message sender
     * @param type - The type of the message
     * @param toolNames - Optional array of tool names that were called
     * @param toolCallArgs - Optional array of tool call arguments
     * @param toolCallIds - Optional array of tool call ids
     * @returns Promise resolving to the saved message
     * @deprecated use saveMessages instead
     */
    addMessage({ threadId, resourceId, config, content, role, type, toolNames, toolCallArgs, toolCallIds, }: {
        threadId: string;
        resourceId: string;
        config?: MemoryConfig;
        content: UserContent | AssistantContent;
        role: 'user' | 'assistant';
        type: 'text' | 'tool-call' | 'tool-result';
        toolNames?: string[];
        toolCallArgs?: Record<string, unknown>[];
        toolCallIds?: string[];
    }): Promise<MastraMessageV1>;
    /**
     * Generates a unique identifier
     * @returns A unique string ID
     */
    generateId(): string;
    /**
     * Retrieves working memory for a specific thread
     * @param threadId - The unique identifier of the thread
     * @param format - Optional format for the returned data ('json' or 'markdown')
     * @returns Promise resolving to working memory data or null if not found
     */
    abstract getWorkingMemory({ threadId, }: {
        threadId: string;
        format?: 'json' | 'markdown';
    }): Promise<Record<string, any> | string | null>;
    /**
     * Retrieves working memory template for a specific thread
     * @param threadId - The unique identifier of the thread
     * @returns Promise resolving to working memory template or null if not found
     */
    abstract getWorkingMemoryTemplate(): Promise<WorkingMemoryTemplate | null>;
}

declare class MastraLLMBase extends MastraBase {
    #private;
    constructor({ name, model }: {
        name: string;
        model: LanguageModel$1;
    });
    getProvider(): string;
    getModelId(): string;
    getModel(): ai.LanguageModelV1;
    convertToMessages(messages: string | string[] | CoreMessage$1[]): CoreMessage$1[];
    __registerPrimitives(p: MastraPrimitives): void;
    __registerMastra(p: Mastra): void;
    __text<Z extends ZodSchema | JSONSchema7 | undefined>(input: LLMTextOptions<Z>): Promise<GenerateTextResult<any, any>>;
    __textObject<T extends ZodSchema | JSONSchema7 | undefined>(input: LLMTextObjectOptions<T>): Promise<GenerateObjectResult<T>>;
    generate<Z extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[], options: LLMStreamOptions<Z>): Promise<GenerateReturn<Z>>;
    __stream<Z extends ZodSchema | JSONSchema7 | undefined = undefined>(input: LLMInnerStreamOptions<Z>): Promise<StreamTextResult<any, any>>;
    __streamObject<T extends ZodSchema | JSONSchema7 | undefined>(input: LLMStreamObjectOptions<T>): Promise<StreamObjectResult<DeepPartial<T>, T, never>>;
    stream<Z extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[], options: LLMStreamOptions<Z>): Promise<StreamReturn<Z>>;
}

declare function createMockModel({ objectGenerationMode, mockText, spyGenerate, spyStream, }: {
    objectGenerationMode?: 'json';
    mockText: string | Record<string, any>;
    spyGenerate?: (props: any) => void;
    spyStream?: (props: any) => void;
}): MockLanguageModelV1;

type LanguageModel = MastraLanguageModel;
type CoreMessage = CoreMessage$1;
type CoreSystemMessage = CoreSystemMessage$1;
type CoreAssistantMessage = CoreAssistantMessage$1;
type CoreUserMessage = CoreUserMessage$1;
type CoreToolMessage = CoreToolMessage$1;
type EmbedResult<T> = EmbedResult$1<T>;
type EmbedManyResult<T> = EmbedManyResult$1<T>;
type BaseStructuredOutputType = 'string' | 'number' | 'boolean' | 'date';
type StructuredOutputType = 'array' | 'string' | 'number' | 'object' | 'boolean' | 'date';
type StructuredOutputArrayItem = {
    type: BaseStructuredOutputType;
} | {
    type: 'object';
    items: StructuredOutput;
};
type StructuredOutput = {
    [key: string]: {
        type: BaseStructuredOutputType;
    } | {
        type: 'object';
        items: StructuredOutput;
    } | {
        type: 'array';
        items: StructuredOutputArrayItem;
    };
};
type GenerateReturn<Z extends ZodSchema | JSONSchema7 | undefined = undefined> = Z extends undefined ? GenerateTextResult<any, Z extends ZodSchema ? z.infer<Z> : unknown> : GenerateObjectResult<Z extends ZodSchema ? z.infer<Z> : unknown>;
type StreamReturn<Z extends ZodSchema | JSONSchema7 | undefined = undefined> = Z extends undefined ? StreamTextResult<any, Z extends ZodSchema ? z.infer<Z> : unknown> : StreamObjectResult<any, Z extends ZodSchema ? z.infer<Z> : unknown, any>;
type OutputType = StructuredOutput | ZodSchema | JSONSchema7 | undefined;
type GenerateTextOptions = Parameters<typeof generateText>[0];
type StreamTextOptions = Parameters<typeof streamText>[0];
type GenerateObjectOptions = Parameters<typeof generateObject>[0];
type StreamObjectOptions = Parameters<typeof streamObject>[0];
type MastraCustomLLMOptionsKeys = 'messages' | 'tools' | 'model' | 'onStepFinish' | 'experimental_output' | 'experimental_telemetry' | 'messages' | 'onFinish' | 'output';
type DefaultLLMTextOptions = Omit<GenerateTextOptions, MastraCustomLLMOptionsKeys>;
type DefaultLLMTextObjectOptions = Omit<GenerateObjectOptions, MastraCustomLLMOptionsKeys>;
type DefaultLLMStreamOptions = Omit<StreamTextOptions, MastraCustomLLMOptionsKeys>;
type DefaultLLMStreamObjectOptions = Omit<StreamObjectOptions, MastraCustomLLMOptionsKeys>;
type MastraCustomLLMOptions<Z extends ZodSchema | JSONSchema7 | undefined = undefined> = {
    tools?: Record<string, CoreTool>;
    onStepFinish?: (step: unknown) => Promise<void> | void;
    experimental_output?: Z;
    telemetry?: TelemetrySettings;
    threadId?: string;
    resourceId?: string;
    runtimeContext: RuntimeContext;
} & Run$1;
type LLMTextOptions<Z extends ZodSchema | JSONSchema7 | undefined = undefined> = {
    messages: UIMessage[] | CoreMessage[];
} & MastraCustomLLMOptions<Z> & DefaultLLMTextOptions;
type LLMTextObjectOptions<T extends ZodSchema | JSONSchema7 | undefined = undefined> = LLMTextOptions<T> & DefaultLLMTextObjectOptions & {
    structuredOutput: JSONSchema7 | z.ZodType<T> | StructuredOutput;
};
type LLMStreamOptions<Z extends ZodSchema | JSONSchema7 | undefined = undefined> = {
    output?: OutputType | Z;
    onFinish?: (result: string) => Promise<void> | void;
} & MastraCustomLLMOptions<Z> & DefaultLLMStreamOptions;
type LLMInnerStreamOptions<Z extends ZodSchema | JSONSchema7 | undefined = undefined> = {
    messages: UIMessage[] | CoreMessage[];
    onFinish?: (result: string) => Promise<void> | void;
} & MastraCustomLLMOptions<Z> & DefaultLLMStreamOptions;
type LLMStreamObjectOptions<T extends ZodSchema | JSONSchema7 | undefined = undefined> = {
    structuredOutput: JSONSchema7 | z.ZodType<T> | StructuredOutput;
} & LLMInnerStreamOptions<T> & DefaultLLMStreamObjectOptions;

type VoiceEventType = 'speaking' | 'writing' | 'error' | string;
interface VoiceEventMap {
    speaker: NodeJS.ReadableStream;
    speaking: {
        audio?: string;
    };
    writing: {
        text: string;
        role: 'assistant' | 'user';
    };
    error: {
        message: string;
        code?: string;
        details?: unknown;
    };
    [key: string]: unknown;
}
interface BuiltInModelConfig {
    name: string;
    apiKey?: string;
}
interface VoiceConfig<T = unknown> {
    listeningModel?: BuiltInModelConfig;
    speechModel?: BuiltInModelConfig;
    speaker?: string;
    name?: string;
    realtimeConfig?: {
        model?: string;
        apiKey?: string;
        options?: T;
    };
}
declare abstract class MastraVoice<TOptions = unknown, TSpeakOptions = unknown, TListenOptions = unknown, TTools extends ToolsInput = ToolsInput, TEventArgs extends VoiceEventMap = VoiceEventMap, TSpeakerMetadata = unknown> extends MastraBase {
    protected listeningModel?: BuiltInModelConfig;
    protected speechModel?: BuiltInModelConfig;
    protected speaker?: string;
    protected realtimeConfig?: {
        model?: string;
        apiKey?: string;
        options?: TOptions;
    };
    constructor({ listeningModel, speechModel, speaker, realtimeConfig, name }?: VoiceConfig<TOptions>);
    traced<T extends Function>(method: T, methodName: string): T;
    /**
     * Convert text to speech
     * @param input Text or text stream to convert to speech
     * @param options Speech options including speaker and provider-specific options
     * @returns Audio stream
     */
    /**
     * Convert text to speech
     * @param input Text or text stream to convert to speech
     * @param options Speech options including speaker and provider-specific options
     * @returns Audio stream or void if in chat mode
     */
    abstract speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: string;
    } & TSpeakOptions): Promise<NodeJS.ReadableStream | void>;
    /**
     * Convert speech to text
     * @param audioStream Audio stream to transcribe
     * @param options Provider-specific transcription options
     * @returns Text or text stream
     */
    /**
     * Convert speech to text
     * @param audioStream Audio stream to transcribe
     * @param options Provider-specific transcription options
     * @returns Text, text stream, or void if in chat mode
     */
    abstract listen(audioStream: NodeJS.ReadableStream | unknown, // Allow other audio input types for OpenAI realtime API
    options?: TListenOptions): Promise<string | NodeJS.ReadableStream | void>;
    updateConfig(_options: Record<string, unknown>): void;
    /**
     * Initializes a WebSocket or WebRTC connection for real-time communication
     * @returns Promise that resolves when the connection is established
     */
    connect(_options?: Record<string, unknown>): Promise<void>;
    /**
     * Relay audio data to the voice provider for real-time processing
     * @param audioData Audio data to relay
     */
    send(_audioData: NodeJS.ReadableStream | Int16Array): Promise<void>;
    /**
     * Trigger voice providers to respond
     */
    answer(_options?: Record<string, unknown>): Promise<void>;
    /**
     * Equip the voice provider with instructions
     * @param instructions Instructions to add
     */
    addInstructions(_instructions?: string): void;
    /**
     * Equip the voice provider with tools
     * @param tools Array of tools to add
     */
    addTools(_tools: TTools): void;
    /**
     * Disconnect from the WebSocket or WebRTC connection
     */
    close(): void;
    /**
     * Register an event listener
     * @param event Event name (e.g., 'speaking', 'writing', 'error')
     * @param callback Callback function that receives event data
     */
    on<E extends VoiceEventType>(_event: E, _callback: (data: E extends keyof TEventArgs ? TEventArgs[E] : unknown) => void): void;
    /**
     * Remove an event listener
     * @param event Event name (e.g., 'speaking', 'writing', 'error')
     * @param callback Callback function to remove
     */
    off<E extends VoiceEventType>(_event: E, _callback: (data: E extends keyof TEventArgs ? TEventArgs[E] : unknown) => void): void;
    /**
     * Get available speakers/voices
     * @returns Array of available voice IDs and their metadata
     */
    getSpeakers(): Promise<Array<{
        voiceId: string;
    } & TSpeakerMetadata>>;
    /**
     * Get available speakers/voices
     * @returns Array of available voice IDs and their metadata
     */
    getListener(): Promise<{
        enabled: boolean;
    }>;
}

declare class CompositeVoice extends MastraVoice<unknown, unknown, unknown, ToolsInput, VoiceEventMap> {
    protected speakProvider?: MastraVoice;
    protected listenProvider?: MastraVoice;
    protected realtimeProvider?: MastraVoice;
    constructor({ input, output, realtime, speakProvider, listenProvider, realtimeProvider, }: {
        /** @deprecated use output instead */
        speakProvider?: MastraVoice;
        /** @deprecated use input instead */
        listenProvider?: MastraVoice;
        /** @deprecated use realtime instead */
        realtimeProvider?: MastraVoice;
        input?: MastraVoice;
        output?: MastraVoice;
        realtime?: MastraVoice;
    });
    /**
     * Convert text to speech using the configured provider
     * @param input Text or text stream to convert to speech
     * @param options Speech options including speaker and provider-specific options
     * @returns Audio stream or void if in realtime mode
     */
    speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: string;
    } & any): Promise<NodeJS.ReadableStream | void>;
    listen(audioStream: NodeJS.ReadableStream, options?: any): Promise<string | void | NodeJS.ReadableStream>;
    getSpeakers(): Promise<{
        voiceId: string;
    }[]>;
    getListener(): Promise<{
        enabled: boolean;
    }>;
    updateConfig(options: Record<string, unknown>): void;
    /**
     * Initializes a WebSocket or WebRTC connection for real-time communication
     * @returns Promise that resolves when the connection is established
     */
    connect(options?: Record<string, unknown>): Promise<void>;
    /**
     * Relay audio data to the voice provider for real-time processing
     * @param audioData Audio data to send
     */
    send(audioData: NodeJS.ReadableStream | Int16Array): Promise<void>;
    /**
     * Trigger voice providers to respond
     */
    answer(options?: Record<string, unknown>): Promise<void>;
    /**
     * Equip the voice provider with instructions
     * @param instructions Instructions to add
     */
    addInstructions(instructions: string): void;
    /**
     * Equip the voice provider with tools
     * @param tools Array of tools to add
     */
    addTools(tools: ToolsInput): void;
    /**
     * Disconnect from the WebSocket or WebRTC connection
     */
    close(): void;
    /**
     * Register an event listener
     * @param event Event name (e.g., 'speaking', 'writing', 'error')
     * @param callback Callback function that receives event data
     */
    on<E extends VoiceEventType>(event: E, callback: (data: E extends keyof VoiceEventMap ? VoiceEventMap[E] : unknown) => void): void;
    /**
     * Remove an event listener
     * @param event Event name (e.g., 'speaking', 'writing', 'error')
     * @param callback Callback function to remove
     */
    off<E extends VoiceEventType>(event: E, callback: (data: E extends keyof VoiceEventMap ? VoiceEventMap[E] : unknown) => void): void;
}

declare class DefaultVoice extends MastraVoice {
    constructor();
    speak(_input: string | NodeJS.ReadableStream): Promise<NodeJS.ReadableStream>;
    listen(_input: string | NodeJS.ReadableStream): Promise<string>;
    getSpeakers(): Promise<{
        voiceId: string;
    }[]>;
    getListener(): Promise<{
        enabled: boolean;
    }>;
}

type ToolsInput = Record<string, ToolAction<any, any, any> | VercelTool>;
type ToolsetsInput = Record<string, ToolsInput>;
type MastraLanguageModel = LanguageModelV1;
type DynamicArgument<T> = T | (({ runtimeContext }: {
    runtimeContext: RuntimeContext;
}) => Promise<T> | T);
interface AgentConfig<TAgentId extends string = string, TTools extends ToolsInput = ToolsInput, TMetrics extends Record<string, Metric> = Record<string, Metric>> {
    name: TAgentId;
    description?: string;
    instructions: DynamicArgument<string>;
    model: DynamicArgument<MastraLanguageModel>;
    tools?: DynamicArgument<TTools>;
    workflows?: DynamicArgument<Record<string, Workflow>>;
    defaultGenerateOptions?: DynamicArgument<AgentGenerateOptions>;
    defaultStreamOptions?: DynamicArgument<AgentStreamOptions>;
    mastra?: Mastra;
    evals?: TMetrics;
    memory?: MastraMemory;
    voice?: CompositeVoice;
    /** @deprecated This property is deprecated. Use evals instead to add evaluation metrics. */
    metrics?: TMetrics;
}
type AgentMemoryOption = {
    thread: string | (Partial<StorageThreadType> & {
        id: string;
    });
    resource: string;
    options?: MemoryConfig;
};
/**
 * Options for generating responses with an agent
 * @template OUTPUT - The schema type for structured output (Zod schema or JSON schema)
 * @template EXPERIMENTAL_OUTPUT - The schema type for structured output generation alongside tool calls (Zod schema or JSON schema)
 */
type AgentGenerateOptions<OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined, EXPERIMENTAL_OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined> = {
    /** Optional instructions to override the agent's default instructions */
    instructions?: string;
    /** Additional tool sets that can be used for this generation */
    toolsets?: ToolsetsInput;
    clientTools?: ToolsInput;
    /** Additional context messages to include */
    context?: CoreMessage[];
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    memoryOptions?: MemoryConfig;
    /** New memory options (preferred) */
    memory?: AgentMemoryOption;
    /** Unique ID for this generation run */
    runId?: string;
    /** Callback fired after each generation step completes */
    onStepFinish?: OUTPUT extends undefined ? EXPERIMENTAL_OUTPUT extends undefined ? GenerateTextOnStepFinishCallback<any> : GenerateTextOnStepFinishCallback<any> : never;
    /** Maximum number of steps allowed for generation */
    maxSteps?: number;
    /** Schema for structured output, does not work with tools, use experimental_output instead */
    output?: OutputType | OUTPUT;
    /** Schema for structured output generation alongside tool calls. */
    experimental_output?: EXPERIMENTAL_OUTPUT;
    /** Controls how tools are selected during generation */
    toolChoice?: 'auto' | 'none' | 'required' | {
        type: 'tool';
        toolName: string;
    };
    /** Telemetry settings */
    telemetry?: TelemetrySettings;
    /** RuntimeContext for dependency injection */
    runtimeContext?: RuntimeContext;
} & ({
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    resourceId?: undefined;
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    threadId?: undefined;
} | {
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    resourceId: string;
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    threadId: string;
}) & (OUTPUT extends undefined ? DefaultLLMTextOptions : DefaultLLMTextObjectOptions);
/**
 * Options for streaming responses with an agent
 * @template OUTPUT - The schema type for structured output (Zod schema or JSON schema)
 * @template EXPERIMENTAL_OUTPUT - The schema type for structured output generation alongside tool calls (Zod schema or JSON schema)
 */
type AgentStreamOptions<OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined, EXPERIMENTAL_OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined> = {
    /** Optional instructions to override the agent's default instructions */
    instructions?: string;
    /** Additional tool sets that can be used for this generation */
    toolsets?: ToolsetsInput;
    clientTools?: ToolsInput;
    /** Additional context messages to include */
    context?: CoreMessage[];
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    memoryOptions?: MemoryConfig;
    /** New memory options (preferred) */
    memory?: AgentMemoryOption;
    /** Unique ID for this generation run */
    runId?: string;
    /** Callback fired when streaming completes */
    onFinish?: OUTPUT extends undefined ? StreamTextOnFinishCallback<any> : OUTPUT extends ZodSchema ? StreamObjectOnFinishCallback<z.infer<OUTPUT>> : StreamObjectOnFinishCallback<any>;
    /** Callback fired after each generation step completes */
    onStepFinish?: OUTPUT extends undefined ? EXPERIMENTAL_OUTPUT extends undefined ? StreamTextOnStepFinishCallback<any> : StreamTextOnStepFinishCallback<any> : never;
    /** Maximum number of steps allowed for generation */
    maxSteps?: number;
    /** Schema for structured output */
    output?: OutputType | OUTPUT;
    /** Temperature parameter for controlling randomness */
    temperature?: number;
    /** Controls how tools are selected during generation */
    toolChoice?: 'auto' | 'none' | 'required' | {
        type: 'tool';
        toolName: string;
    };
    /** Experimental schema for structured output */
    experimental_output?: EXPERIMENTAL_OUTPUT;
    /** Telemetry settings */
    telemetry?: TelemetrySettings;
    /** RuntimeContext for dependency injection */
    runtimeContext?: RuntimeContext;
} & ({
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    resourceId?: undefined;
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    threadId?: undefined;
} | {
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    resourceId: string;
    /**
     * @deprecated Use the `memory` property instead for all memory-related options.
     */
    threadId: string;
}) & (OUTPUT extends undefined ? DefaultLLMStreamOptions : DefaultLLMStreamObjectOptions);

type AgentNetworkConfig = {
    name: string;
    agents: Agent[];
    model: LanguageModelV1;
    instructions: string;
};

declare class AgentNetwork extends MastraBase {
    #private;
    constructor(config: AgentNetworkConfig);
    formatAgentId(name: string): string;
    getTools(): {
        readonly transmit: Tool<z.ZodObject<{
            actions: z.ZodArray<z.ZodObject<{
                agent: z.ZodString;
                input: z.ZodString;
                includeHistory: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                input: string;
                agent: string;
                includeHistory?: boolean | undefined;
            }, {
                input: string;
                agent: string;
                includeHistory?: boolean | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            actions: {
                input: string;
                agent: string;
                includeHistory?: boolean | undefined;
            }[];
        }, {
            actions: {
                input: string;
                agent: string;
                includeHistory?: boolean | undefined;
            }[];
        }>, undefined, ToolExecutionContext<z.ZodObject<{
            actions: z.ZodArray<z.ZodObject<{
                agent: z.ZodString;
                input: z.ZodString;
                includeHistory: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                input: string;
                agent: string;
                includeHistory?: boolean | undefined;
            }, {
                input: string;
                agent: string;
                includeHistory?: boolean | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            actions: {
                input: string;
                agent: string;
                includeHistory?: boolean | undefined;
            }[];
        }, {
            actions: {
                input: string;
                agent: string;
                includeHistory?: boolean | undefined;
            }[];
        }>>>;
    };
    getAgentHistory(agentId: string): {
        input: string;
        output: string;
        timestamp: string;
    }[];
    /**
     * Get the history of all agent interactions that have occurred in this network
     * @returns A record of agent interactions, keyed by agent ID
     */
    getAgentInteractionHistory(): {
        [x: string]: {
            input: string;
            output: string;
            timestamp: string;
        }[];
    };
    /**
     * Get a summary of agent interactions in a more readable format, displayed chronologically
     * @returns A formatted string with all agent interactions in chronological order
     */
    getAgentInteractionSummary(): string;
    executeAgent(agentId: string, input: CoreMessage$1[], includeHistory?: boolean, runtimeContext?: RuntimeContext): Promise<string>;
    getInstructions(): string;
    getRoutingAgent(): Agent<string, ToolsInput, Record<string, Metric>>;
    getAgents(): Agent<string, ToolsInput, Record<string, Metric>>[];
    generate<Z extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[], args?: AgentGenerateOptions<Z> & {
        output?: never;
        experimental_output?: never;
    }): Promise<GenerateTextResult<any, Z extends ZodSchema ? z.infer<Z> : unknown>>;
    generate<Z extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[], args?: AgentGenerateOptions<Z> & ({
        output: Z;
        experimental_output?: never;
    } | {
        experimental_output: Z;
        output?: never;
    })): Promise<GenerateObjectResult<Z extends ZodSchema ? z.infer<Z> : unknown>>;
    stream<Z extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[], args?: AgentStreamOptions<Z> & {
        output?: never;
        experimental_output?: never;
    }): Promise<StreamTextResult<any, Z extends ZodSchema ? z.infer<Z> : unknown>>;
    stream<Z extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[], args?: AgentStreamOptions<Z> & ({
        output: Z;
        experimental_output?: never;
    } | {
        experimental_output: Z;
        output?: never;
    })): Promise<StreamObjectResult<any, Z extends ZodSchema ? z.infer<Z> : unknown, any>>;
    __registerMastra(p: Mastra): void;
}

type ConvertedTool = {
    name: string;
    description?: string;
    parameters: InternalCoreTool['parameters'];
    execute: InternalCoreTool['execute'];
    toolType?: MCPToolType;
};
interface MCPServerSSEOptionsBase {
    /**
     * Parsed URL of the incoming request
     */
    url: URL;
    /**
     * Path for establishing the SSE connection (e.g. '/sse')
     */
    ssePath: string;
    /**
     * Path for POSTing client messages (e.g. '/message')
     */
    messagePath: string;
}
/**
 * Options for starting an MCP server with SSE transport
 */
interface MCPServerSSEOptions extends MCPServerSSEOptionsBase {
    /**
     * Incoming HTTP request
     */
    req: http.IncomingMessage;
    /**
     * HTTP response (must support .write/.end)
     */
    res: http.ServerResponse<http.IncomingMessage>;
}
/**
 * Options for starting an MCP server with Hono SSE transport
 */
interface MCPServerHonoSSEOptions extends MCPServerSSEOptionsBase {
    /**
     * Incoming Hono context
     */
    context: Context;
}
interface MCPServerHTTPOptions {
    /**
     * Parsed URL of the incoming request
     */
    url: URL;
    /**
     * Path for establishing the HTTP connection (e.g. '/mcp')
     */
    httpPath: string;
    /**
     * Incoming HTTP request
     */
    req: http.IncomingMessage;
    /**
     * HTTP response (must support .write/.end)
     */
    res: http.ServerResponse<http.IncomingMessage>;
    /**
     * Optional options to pass to the transport (e.g. sessionIdGenerator)
     */
    options?: any;
}
/** Describes a source code repository. */
interface Repository {
    /** The URL of the repository (e.g., a GitHub URL). */
    url: string;
    /** The source control platform (e.g., 'github', 'gitlab'). */
    source: 'github' | 'gitlab' | string;
    /** A unique identifier for the repository at the source. */
    id: string;
}
/** Provides details about a specific version of an MCP server. */
interface VersionDetail {
    /** The semantic version string (e.g., "1.0.2"). */
    version: string;
    /** The ISO 8601 date-time string when this version was released or registered. */
    release_date: string;
    /** Indicates if this version is the latest available. */
    is_latest: boolean;
}
/** Base interface for command-line arguments. */
interface ArgumentInfo {
    /** The name of the argument. */
    name: string;
    /** A description of what the argument is for. */
    description: string;
    /** Whether the argument is required. */
    is_required: boolean;
    /** Whether the argument can be specified multiple times. */
    is_repeatable?: boolean;
    /** Whether the argument's value can be edited by the user (e.g., in a UI). */
    is_editable?: boolean;
    /** A list of predefined choices for the argument's value. */
    choices?: string[];
    /** The default value for the argument if not specified. */
    default_value?: string | number | boolean;
}
/** Describes a positional argument for a command. */
interface PositionalArgumentInfo extends ArgumentInfo {
    /** The 0-indexed position of the argument. */
    position: number;
}
/** Describes a named argument (flag) for a command. */
interface NamedArgumentInfo extends ArgumentInfo {
    /** The short flag for the argument (e.g., "-y"). */
    short_flag?: string;
    /** The long flag for the argument (e.g., "--yes"). */
    long_flag?: string;
    /** Whether the flag requires a value (e.g., `--config <value>`) or is a boolean flag. */
    requires_value?: boolean;
}
/** Describes a subcommand for a command-line tool. */
interface SubcommandInfo {
    /** The name of the subcommand (e.g., "run", "list"). */
    name: string;
    /** A description of what the subcommand does. */
    description: string;
    /** Whether this subcommand is required if its parent command is used. */
    is_required?: boolean;
    /** Nested subcommands. */
    subcommands?: SubcommandInfo[];
    /** Positional arguments for this subcommand. */
    positional_arguments?: PositionalArgumentInfo[];
    /** Named arguments (flags) for this subcommand. */
    named_arguments?: NamedArgumentInfo[];
}
/** Describes a command to run an MCP server package. */
interface CommandInfo {
    /** The primary command executable (e.g., "npx", "docker"). */
    name: 'npx' | 'docker' | 'pypi' | 'uvx' | string;
    /** Subcommands to append to the primary command. */
    subcommands?: SubcommandInfo[];
    /** Positional arguments for the command. */
    positional_arguments?: PositionalArgumentInfo[];
    /** Named arguments (flags) for the command. */
    named_arguments?: NamedArgumentInfo[];
}
/** Describes an environment variable required or used by an MCP server package. */
interface EnvironmentVariableInfo {
    /** The name of the environment variable (e.g., "API_KEY"). */
    name: string;
    /** A description of what the environment variable is for. */
    description: string;
    /** Whether the environment variable is required. */
    required?: boolean;
    /** The default value for the environment variable if not set. */
    default_value?: string;
}
/** Describes an installable package for an MCP server. */
interface PackageInfo {
    /** The name of the package registry (e.g., "npm", "docker"). */
    registry_name: 'npm' | 'docker' | 'pypi' | 'homebrew' | string;
    /** The name of the package. */
    name: string;
    /** The version of the package. */
    version: string;
    /** The command structure to run this package as an MCP server. */
    command?: CommandInfo;
    /** Environment variables relevant to this package. */
    environment_variables?: EnvironmentVariableInfo[];
}
/** Describes a remote endpoint for accessing an MCP server. */
interface RemoteInfo {
    /** The transport type for the remote connection (e.g., "sse", "streamable"). */
    transport_type: 'streamable' | 'sse' | string;
    /** The URL of the remote endpoint. */
    url: string;
}
/** Configuration options for creating an MCPServer instance. */
interface MCPServerConfig {
    /** The display name of the MCP server. */
    name: string;
    /** The semantic version of the MCP server. */
    version: string;
    /** The tools that this MCP server will expose. */
    tools: ToolsInput;
    /**
     * Optional Agent instances to be exposed as tools.
     * Each agent will be converted into a tool named 'ask_<agentName>'.
     */
    agents?: Record<string, Agent>;
    /**
     * Optional Workflow instances to be exposed as tools.
     * Each workflow will be converted into a tool named 'run_<workflowKey>'.
     */
    workflows?: Record<string, Workflow>;
    /**
     * Optional unique identifier for the server.
     * If not provided, a UUID will be generated.
     * If provided, this ID is considered final and cannot be changed by Mastra.
     */
    id?: string;
    /** Optional description of the MCP server. */
    description?: string;
    /** Optional repository information for the server's source code. */
    repository?: Repository;
    /**
     * Optional release date of this server version (ISO 8601 string).
     * Defaults to the time of instantiation if not provided.
     */
    releaseDate?: string;
    /**
     * Optional flag indicating if this is the latest version.
     * Defaults to true if not provided.
     */
    isLatest?: boolean;
    /**
     * Optional canonical packaging format if the server is distributed as a package
     * (e.g., "npm", "docker").
     */
    packageCanonical?: 'npm' | 'docker' | 'pypi' | 'crates' | string;
    /** Optional list of installable packages for this server. */
    packages?: PackageInfo[];
    /** Optional list of remote access points for this server. */
    remotes?: RemoteInfo[];
}
/** Basic information about an MCP server, conforming to the MCP Registry 'Server' schema. */
interface ServerInfo {
    /** The unique ID of the server. */
    id: string;
    /** The name of the server. */
    name: string;
    /** A description of the server. */
    description?: string;
    /** Repository information for the server. */
    repository?: Repository;
    /** Detailed version information. */
    version_detail: VersionDetail;
}
/** Detailed information about an MCP server, conforming to the MCP Registry 'ServerDetail' schema. */
interface ServerDetailInfo extends ServerInfo {
    /** The canonical packaging format, if applicable. */
    package_canonical?: MCPServerConfig['packageCanonical'];
    /** Information about installable packages for this server. */
    packages?: PackageInfo[];
    /** Information about remote access points for this server. */
    remotes?: RemoteInfo[];
}
/**
 * The type of tool registered with the MCP server.
 * This is used to categorize tools in the MCP Server playground.
 * If not specified, it defaults to a regular tool.
 */
type MCPToolType = 'agent' | 'workflow';

/**
 * Abstract base class for MCP server implementations.
 * This provides a common interface and shared functionality for all MCP servers
 * that can be registered with Mastra, including handling of server metadata.
 */
declare abstract class MCPServerBase extends MastraBase {
    /** Tracks if the server ID has been definitively set. */
    private idWasSet;
    /** The display name of the MCP server. */
    readonly name: string;
    /** The semantic version of the MCP server. */
    readonly version: string;
    /** Internal storage for the server's unique ID. */
    private _id;
    /** A description of what the MCP server does. */
    readonly description?: string;
    /** Repository information for the server's source code. */
    readonly repository?: Repository;
    /** The release date of this server version (ISO 8601 string). */
    readonly releaseDate: string;
    /** Indicates if this version is the latest available. */
    readonly isLatest: boolean;
    /** The canonical packaging format (e.g., "npm", "docker"), if applicable. */
    readonly packageCanonical?: MCPServerConfig['packageCanonical'];
    /** Information about installable packages for this server. */
    readonly packages?: PackageInfo[];
    /** Information about remote access points for this server. */
    readonly remotes?: RemoteInfo[];
    /** The tools registered with and converted by this MCP server. */
    readonly convertedTools: Record<string, ConvertedTool>;
    /** Reference to the Mastra instance if this server is registered with one. */
    mastra: Mastra | undefined;
    /** Agents to be exposed as tools. */
    protected readonly agents?: MCPServerConfig['agents'];
    /** Workflows to be exposed as tools. */
    protected readonly workflows?: MCPServerConfig['workflows'];
    /**
     * Public getter for the server's unique ID.
     * The ID is set at construction or by Mastra and is read-only afterwards.
     */
    get id(): string;
    /**
     * Gets a read-only view of the registered tools.
     * @returns A readonly record of converted tools.
     */
    tools(): Readonly<Record<string, ConvertedTool>>;
    /**
     * Sets the server's unique ID. This method is typically called by Mastra when
     * registering the server, using the key provided in the Mastra configuration.
     * It ensures the ID is set only once.
     * If an ID was already provided in the MCPServerConfig, this method will be a no-op.
     * @param id The unique ID to assign to the server.
     */
    setId(id: string): void;
    /**
     * Abstract method to convert and validate tool definitions provided to the server.
     * This method will also handle agents passed in the config.
     * @param tools Tool definitions to convert.
     * @param agents Agent definitions to convert to tools.
     * @param workflows Workflow definitions to convert to tools.
     * @returns A record of converted and validated tools.
     */
    abstract convertTools(tools: ToolsInput, agents?: MCPServerConfig['agents'], workflows?: MCPServerConfig['workflows']): Record<string, ConvertedTool>;
    /**
     * Internal method used by Mastra to register itself with the server.
     * @param mastra The Mastra instance.
     * @internal
     */
    __registerMastra(mastra: Mastra): void;
    /**
     * Constructor for the MCPServerBase.
     * @param config Configuration options for the MCP server, including metadata.
     */
    constructor(config: MCPServerConfig);
    /**
     * Start the MCP server using stdio transport
     * This is typically used for Windsurf integration
     */
    abstract startStdio(): Promise<void>;
    /**
     * Start the MCP server using SSE transport
     * This is typically used for web integration
     * @param options Options for the SSE transport
     */
    abstract startSSE(options: MCPServerSSEOptions): Promise<void>;
    /**
     * Start the MCP server using Hono SSE transport
     * Used for Hono servers
     * @param options Options for the SSE transport
     */
    abstract startHonoSSE(options: MCPServerHonoSSEOptions): Promise<Response | undefined>;
    /**
     * Start the MCP server using HTTP transport
     * @param options Options for the HTTP transport
     */
    abstract startHTTP(options: MCPServerHTTPOptions): Promise<void>;
    /**
     * Close the MCP server and all its connections
     */
    abstract close(): Promise<void>;
    /**
     * Gets the basic information about the server, conforming to the MCP Registry 'Server' schema.
     * This information is suitable for listing multiple servers.
     * @returns ServerInfo object containing basic server metadata.
     */
    abstract getServerInfo(): ServerInfo;
    /**
     * Gets detailed information about the server, conforming to the MCP Registry 'ServerDetail' schema.
     * This includes all information from `getServerInfo` plus package and remote details.
     * @returns ServerDetailInfo object containing comprehensive server metadata.
     */
    abstract getServerDetail(): ServerDetailInfo;
    /**
     * Gets a list of tools provided by this MCP server, including their schemas.
     * @returns An object containing an array of tool information.
     */
    abstract getToolListInfo(): {
        tools: Array<{
            name: string;
            description?: string;
            inputSchema: string;
        }>;
    };
    /**
     * Gets information for a specific tool provided by this MCP server.
     * @param toolId The ID/name of the tool to retrieve.
     * @returns Tool information (name, description, inputSchema) or undefined if not found.
     */
    abstract getToolInfo(toolId: string): {
        name: string;
        description?: string;
        inputSchema: string;
    } | undefined;
    /**
     * Executes a specific tool provided by this MCP server.
     * @param toolId The ID/name of the tool to execute.
     * @param args The arguments to pass to the tool's execute function.
     * @param executionContext Optional context for the tool execution (e.g., messages, toolCallId).
     * @returns A promise that resolves to the result of the tool execution.
     * @throws Error if the tool is not found, or if execution fails.
     */
    abstract executeTool(toolId: string, args: any, executionContext?: {
        messages?: any[];
        toolCallId?: string;
    }): Promise<any>;
}

interface MastraAuthProviderOptions<TUser = unknown> {
    name?: string;
    authorizeUser?: (user: TUser, request: HonoRequest) => Promise<boolean> | boolean;
}
declare abstract class MastraAuthProvider<TUser = unknown> extends MastraBase {
    constructor(options?: MastraAuthProviderOptions<TUser>);
    /**
     * Authenticate a token and return the payload
     * @param token - The token to authenticate
     * @param request - The request
     * @returns The payload
     */
    abstract authenticateToken(token: string, request: HonoRequest): Promise<TUser | null>;
    /**
     * Authorize a user for a path and method
     * @param user - The user to authorize
     * @param request - The request
     * @returns The authorization result
     */
    abstract authorizeUser(user: TUser, request: HonoRequest): Promise<boolean> | boolean;
    protected registerOptions(opts?: MastraAuthProviderOptions<TUser>): void;
}

type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
type ApiRoute = {
    path: string;
    method: Methods;
    handler: Handler;
    middleware?: MiddlewareHandler | MiddlewareHandler[];
    openapi?: DescribeRouteOptions;
} | {
    path: string;
    method: Methods;
    createHandler: ({ mastra }: {
        mastra: Mastra;
    }) => Promise<Handler>;
    middleware?: MiddlewareHandler | MiddlewareHandler[];
    openapi?: DescribeRouteOptions;
};
type Middleware = MiddlewareHandler | {
    path: string;
    handler: MiddlewareHandler;
};
type ContextWithMastra = Context<{
    Variables: {
        mastra: Mastra;
        runtimeContext: RuntimeContext;
    };
}>;
type MastraAuthConfig<TUser = unknown> = {
    /**
     * Protected paths for the server
     */
    protected?: (RegExp | string | [string, Methods | Methods[]])[];
    /**
     * Public paths for the server
     */
    public?: (RegExp | string | [string, Methods | Methods[]])[];
    /**
     * Public paths for the server
     */
    authenticateToken?: (token: string, request: HonoRequest) => Promise<TUser>;
    /**
     * Authorization function for the server
     */
    authorize?: (path: string, method: string, user: TUser, context: ContextWithMastra) => Promise<boolean>;
    /**
     * Rules for the server
     */
    rules?: {
        /**
         * Path for the rule
         */
        path?: RegExp | string | string[];
        /**
         * Method for the rule
         */
        methods?: Methods | Methods[];
        /**
         * Condition for the rule
         */
        condition?: (user: TUser) => Promise<boolean> | boolean;
        /**
         * Allow the rule
         */
        allow?: boolean;
    }[];
};
type ServerConfig = {
    /**
     * Port for the server
     * @default 4111
     */
    port?: number;
    /**
     * Host for the server
     * @default 'localhost'
     */
    host?: string;
    /**
     * Timeout for the server
     */
    timeout?: number;
    /**
     * Custom API routes for the server
     */
    apiRoutes?: ApiRoute[];
    /**
     * Middleware for the server
     */
    middleware?: Middleware | Middleware[];
    /**
     * CORS configuration for the server
     * @default { origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization', 'x-mastra-client-type'], exposeHeaders: ['Content-Length', 'X-Requested-With'], credentials: false }
     */
    cors?: Parameters<typeof cors>[0] | false;
    /**
     * Build configuration for the server
     */
    build?: {
        /**
         * Enable Swagger UI
         * @default false
         */
        swaggerUI?: boolean;
        /**
         * Enable API request logging
         * @default false
         */
        apiReqLogs?: boolean;
        /**
         * Enable OpenAPI documentation
         * @default false
         */
        openAPIDocs?: boolean;
    };
    /**
     * Body size limit for the server
     * @default 4.5mb
     */
    bodySizeLimit?: number;
    /**
     * Authentication configuration for the server
     */
    experimental_auth?: MastraAuthConfig<any> | MastraAuthProvider<any>;
};

interface Config<TAgents extends Record<string, Agent<any>> = Record<string, Agent<any>>, TLegacyWorkflows extends Record<string, LegacyWorkflow> = Record<string, LegacyWorkflow>, TWorkflows extends Record<string, Workflow> = Record<string, Workflow>, TVectors extends Record<string, MastraVector> = Record<string, MastraVector>, TTTS extends Record<string, MastraTTS> = Record<string, MastraTTS>, TLogger extends IMastraLogger = IMastraLogger, TNetworks extends Record<string, AgentNetwork> = Record<string, AgentNetwork>, TMCPServers extends Record<string, MCPServerBase> = Record<string, MCPServerBase>> {
    agents?: TAgents;
    networks?: TNetworks;
    storage?: MastraStorage;
    vectors?: TVectors;
    logger?: TLogger | false;
    legacy_workflows?: TLegacyWorkflows;
    workflows?: TWorkflows;
    tts?: TTTS;
    telemetry?: OtelConfig;
    deployer?: MastraDeployer;
    server?: ServerConfig;
    mcpServers?: TMCPServers;
    bundler?: BundlerConfig;
    /**
     * Server middleware functions to be applied to API routes
     * Each middleware can specify a path pattern (defaults to '/api/*')
     * @deprecated use server.middleware instead
     */
    serverMiddleware?: Array<{
        handler: (c: any, next: () => Promise<void>) => Promise<Response | void>;
        path?: string;
    }>;
    memory?: never;
}
declare class Mastra<TAgents extends Record<string, Agent<any>> = Record<string, Agent<any>>, TLegacyWorkflows extends Record<string, LegacyWorkflow> = Record<string, LegacyWorkflow>, TWorkflows extends Record<string, Workflow> = Record<string, Workflow>, TVectors extends Record<string, MastraVector> = Record<string, MastraVector>, TTTS extends Record<string, MastraTTS> = Record<string, MastraTTS>, TLogger extends IMastraLogger = IMastraLogger, TNetworks extends Record<string, AgentNetwork> = Record<string, AgentNetwork>, TMCPServers extends Record<string, MCPServerBase> = Record<string, MCPServerBase>> {
    #private;
    /**
     * @deprecated use getTelemetry() instead
     */
    get telemetry(): Telemetry | undefined;
    /**
     * @deprecated use getStorage() instead
     */
    get storage(): MastraStorage | undefined;
    /**
     * @deprecated use getMemory() instead
     */
    get memory(): MastraMemory | undefined;
    constructor(config?: Config<TAgents, TLegacyWorkflows, TWorkflows, TVectors, TTTS, TLogger, TNetworks, TMCPServers>);
    getAgent<TAgentName extends keyof TAgents>(name: TAgentName): TAgents[TAgentName];
    getAgents(): TAgents;
    getVector<TVectorName extends keyof TVectors>(name: TVectorName): TVectors[TVectorName];
    getVectors(): TVectors | undefined;
    getDeployer(): MastraDeployer | undefined;
    legacy_getWorkflow<TWorkflowId extends keyof TLegacyWorkflows>(id: TWorkflowId, { serialized }?: {
        serialized?: boolean;
    }): TLegacyWorkflows[TWorkflowId];
    getWorkflow<TWorkflowId extends keyof TWorkflows>(id: TWorkflowId, { serialized }?: {
        serialized?: boolean;
    }): TWorkflows[TWorkflowId];
    legacy_getWorkflows(props?: {
        serialized?: boolean;
    }): Record<string, LegacyWorkflow>;
    getWorkflows(props?: {
        serialized?: boolean;
    }): Record<string, Workflow>;
    setStorage(storage: MastraStorage): void;
    setLogger({ logger }: {
        logger: TLogger;
    }): void;
    setTelemetry(telemetry: OtelConfig): void;
    getTTS(): TTTS | undefined;
    getLogger(): TLogger;
    getTelemetry(): Telemetry | undefined;
    getMemory(): MastraMemory | undefined;
    getStorage(): MastraStorage | undefined;
    getServerMiddleware(): {
        handler: (c: any, next: () => Promise<void>) => Promise<Response | void>;
        path: string;
    }[];
    setServerMiddleware(serverMiddleware: Middleware | Middleware[]): void;
    getNetworks(): AgentNetwork[];
    getServer(): ServerConfig | undefined;
    getBundlerConfig(): BundlerConfig | undefined;
    /**
     * Get a specific network by ID
     * @param networkId - The ID of the network to retrieve
     * @returns The network with the specified ID, or undefined if not found
     */
    getNetwork(networkId: string): AgentNetwork | undefined;
    getLogsByRunId({ runId, transportId, fromDate, toDate, logLevel, filters, page, perPage, }: {
        runId: string;
        transportId: string;
        fromDate?: Date;
        toDate?: Date;
        logLevel?: LogLevel;
        filters?: Record<string, any>;
        page?: number;
        perPage?: number;
    }): Promise<{
        logs: BaseLogMessage[];
        total: number;
        page: number;
        perPage: number;
        hasMore: boolean;
    }>;
    getLogs(transportId: string, params?: {
        fromDate?: Date;
        toDate?: Date;
        logLevel?: LogLevel;
        filters?: Record<string, any>;
        page?: number;
        perPage?: number;
    }): Promise<{
        logs: BaseLogMessage[];
        total: number;
        page: number;
        perPage: number;
        hasMore: boolean;
    }>;
    /**
     * Get all registered MCP server instances.
     * @returns A record of MCP server ID to MCPServerBase instance, or undefined if none are registered.
     */
    getMCPServers(): Record<string, MCPServerBase> | undefined;
    /**
     * Get a specific MCP server instance.
     * If a version is provided, it attempts to find the server with that exact logical ID and version.
     * If no version is provided, it returns the server with the specified logical ID that has the most recent releaseDate.
     * The logical ID should match the `id` property of the MCPServer instance (typically set via MCPServerConfig.id).
     * @param serverId - The logical ID of the MCP server to retrieve.
     * @param version - Optional specific version of the MCP server to retrieve.
     * @returns The MCP server instance, or undefined if not found or if the specific version is not found.
     */
    getMCPServer(serverId: string, version?: string): MCPServerBase | undefined;
}

type MastraPrimitives = {
    logger?: IMastraLogger;
    telemetry?: Telemetry;
    storage?: MastraStorage;
    agents?: Record<string, Agent>;
    tts?: Record<string, MastraTTS>;
    vectors?: Record<string, MastraVector>;
    memory?: MastraMemory;
};
type MastraUnion = {
    [K in keyof Mastra]: Mastra[K];
} & MastraPrimitives;
interface IExecutionContext<TSchemaIn extends z.ZodSchema | undefined = undefined> {
    context: TSchemaIn extends z.ZodSchema ? z.infer<TSchemaIn> : {};
    runId?: string;
    threadId?: string;
    resourceId?: string;
}
interface IAction<TId extends string, TSchemaIn extends z.ZodSchema | undefined, TSchemaOut extends z.ZodSchema | undefined, TContext extends IExecutionContext<TSchemaIn>, TOptions extends unknown = unknown> {
    id: TId;
    description?: string;
    inputSchema?: TSchemaIn;
    outputSchema?: TSchemaOut;
    execute?: (context: TContext, options?: TOptions) => Promise<TSchemaOut extends z.ZodSchema ? z.infer<TSchemaOut> : unknown>;
}

type IDGenerator = () => string;
declare class Agent<TAgentId extends string = string, TTools extends ToolsInput = ToolsInput, TMetrics extends Record<string, Metric> = Record<string, Metric>> extends MastraBase {
    #private;
    id: TAgentId;
    name: TAgentId;
    readonly model?: DynamicArgument<MastraLanguageModel>;
    /** @deprecated This property is deprecated. Use evals instead. */
    metrics: TMetrics;
    evals: TMetrics;
    constructor(config: AgentConfig<TAgentId, TTools, TMetrics>);
    hasOwnMemory(): boolean;
    getMemory(): MastraMemory | undefined;
    get voice(): CompositeVoice;
    getWorkflows({ runtimeContext, }?: {
        runtimeContext?: RuntimeContext;
    }): Promise<Record<string, Workflow>>;
    getVoice({ runtimeContext }?: {
        runtimeContext?: RuntimeContext;
    }): Promise<CompositeVoice | DefaultVoice>;
    get instructions(): string;
    getInstructions({ runtimeContext }?: {
        runtimeContext?: RuntimeContext;
    }): string | Promise<string>;
    getDescription(): string;
    getDefaultGenerateOptions({ runtimeContext, }?: {
        runtimeContext?: RuntimeContext;
    }): AgentGenerateOptions | Promise<AgentGenerateOptions>;
    getDefaultStreamOptions({ runtimeContext }?: {
        runtimeContext?: RuntimeContext;
    }): AgentStreamOptions | Promise<AgentStreamOptions>;
    get tools(): TTools;
    getTools({ runtimeContext }?: {
        runtimeContext?: RuntimeContext;
    }): TTools | Promise<TTools>;
    get llm(): MastraLLMBase | Promise<MastraLLMBase>;
    /**
     * Gets or creates an LLM instance based on the current model
     * @param options Options for getting the LLM
     * @returns A promise that resolves to the LLM instance
     */
    getLLM({ runtimeContext }?: {
        runtimeContext?: RuntimeContext;
    }): MastraLLMBase | Promise<MastraLLMBase>;
    /**
     * Gets the model, resolving it if it's a function
     * @param options Options for getting the model
     * @returns A promise that resolves to the model
     */
    getModel({ runtimeContext }?: {
        runtimeContext?: RuntimeContext;
    }): MastraLanguageModel | Promise<MastraLanguageModel>;
    __updateInstructions(newInstructions: string): void;
    __registerPrimitives(p: MastraPrimitives): void;
    __registerMastra(mastra: Mastra): void;
    /**
     * Set the concrete tools for the agent
     * @param tools
     */
    __setTools(tools: TTools): void;
    generateTitleFromUserMessage({ message, runtimeContext, }: {
        message: string | MessageInput;
        runtimeContext?: RuntimeContext;
    }): Promise<string>;
    getMostRecentUserMessage(messages: Array<UIMessage>): UIMessage | undefined;
    genTitle(userMessage: string | MessageInput | undefined, runtimeContext: RuntimeContext): Promise<string>;
    fetchMemory({ threadId, thread: passedThread, memoryConfig, resourceId, runId, userMessages, systemMessage, messageList, }: {
        resourceId: string;
        threadId: string;
        thread?: StorageThreadType;
        memoryConfig?: MemoryConfig;
        userMessages?: CoreMessage$1[];
        systemMessage?: CoreMessage$1;
        runId?: string;
        messageList?: MessageList;
    }): Promise<{
        threadId: string;
        messages: CoreMessage$1[];
    }>;
    private getMemoryTools;
    private getAssignedTools;
    private getToolsets;
    private getClientTools;
    private getWorkflowTools;
    private convertTools;
    __primitive({ instructions, messages, context, thread, memoryConfig, resourceId, runId, toolsets, clientTools, runtimeContext, generateMessageId, }: {
        instructions?: string;
        toolsets?: ToolsetsInput;
        clientTools?: ToolsInput;
        resourceId?: string;
        thread?: (Partial<StorageThreadType> & {
            id: string;
        }) | undefined;
        memoryConfig?: MemoryConfig;
        context?: CoreMessage$1[];
        runId?: string;
        messages: string | string[] | CoreMessage$1[] | Message[];
        runtimeContext: RuntimeContext;
        generateMessageId: undefined | IDGenerator;
    }): {
        before: () => Promise<{
            messageObjects: CoreMessage$1[];
            convertedTools: Record<string, CoreTool>;
            messageList: MessageList;
            thread?: undefined;
        } | {
            convertedTools: Record<string, CoreTool>;
            thread: StorageThreadType;
            messageList: MessageList;
            messageObjects: CoreMessage$1[];
        }>;
        after: ({ result, thread: threadAfter, threadId, memoryConfig, outputText, runId, messageList, }: {
            runId: string;
            result: Record<string, any>;
            thread: StorageThreadType | null | undefined;
            threadId?: string;
            memoryConfig: MemoryConfig | undefined;
            outputText: string;
            messageList: MessageList;
        }) => Promise<void>;
    };
    generate<OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined, EXPERIMENTAL_OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[] | Message[], args?: AgentGenerateOptions<OUTPUT, EXPERIMENTAL_OUTPUT> & {
        output?: never;
        experimental_output?: never;
    }): Promise<GenerateTextResult<any, OUTPUT extends ZodSchema ? z.infer<OUTPUT> : unknown>>;
    generate<OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined, EXPERIMENTAL_OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[] | Message[], args?: AgentGenerateOptions<OUTPUT, EXPERIMENTAL_OUTPUT> & {
        output?: OUTPUT;
        experimental_output?: never;
    }): Promise<GenerateObjectResult<OUTPUT extends ZodSchema ? z.infer<OUTPUT> : unknown>>;
    generate<OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined, EXPERIMENTAL_OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[] | Message[], args?: AgentGenerateOptions<OUTPUT, EXPERIMENTAL_OUTPUT> & {
        output?: never;
        experimental_output?: EXPERIMENTAL_OUTPUT;
    }): Promise<GenerateTextResult<any, OUTPUT extends ZodSchema ? z.infer<OUTPUT> : unknown> & {
        object: OUTPUT extends ZodSchema ? z.infer<OUTPUT> : EXPERIMENTAL_OUTPUT extends ZodSchema ? z.infer<EXPERIMENTAL_OUTPUT> : unknown;
    }>;
    stream<OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined, EXPERIMENTAL_OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[] | Message[], args?: AgentStreamOptions<OUTPUT, EXPERIMENTAL_OUTPUT> & {
        output?: never;
        experimental_output?: never;
    }): Promise<StreamTextResult<any, OUTPUT extends ZodSchema ? z.infer<OUTPUT> : unknown>>;
    stream<OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined, EXPERIMENTAL_OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[] | Message[], args?: AgentStreamOptions<OUTPUT, EXPERIMENTAL_OUTPUT> & {
        output?: OUTPUT;
        experimental_output?: never;
    }): Promise<StreamObjectResult<any, OUTPUT extends ZodSchema ? z.infer<OUTPUT> : unknown, any>>;
    stream<OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined, EXPERIMENTAL_OUTPUT extends ZodSchema | JSONSchema7 | undefined = undefined>(messages: string | string[] | CoreMessage$1[] | Message[], args?: AgentStreamOptions<OUTPUT, EXPERIMENTAL_OUTPUT> & {
        output?: never;
        experimental_output?: EXPERIMENTAL_OUTPUT;
    }): Promise<StreamTextResult<any, OUTPUT extends ZodSchema ? z.infer<OUTPUT> : unknown> & {
        partialObjectStream: StreamTextResult<any, OUTPUT extends ZodSchema ? z.infer<OUTPUT> : EXPERIMENTAL_OUTPUT extends ZodSchema ? z.infer<EXPERIMENTAL_OUTPUT> : unknown>['experimental_partialOutputStream'];
    }>;
    /**
     * Convert text to speech using the configured voice provider
     * @param input Text or text stream to convert to speech
     * @param options Speech options including speaker and provider-specific options
     * @returns Audio stream
     * @deprecated Use agent.voice.speak() instead
     */
    speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: string;
        [key: string]: any;
    }): Promise<NodeJS.ReadableStream | void>;
    /**
     * Convert speech to text using the configured voice provider
     * @param audioStream Audio stream to transcribe
     * @param options Provider-specific transcription options
     * @returns Text or text stream
     * @deprecated Use agent.voice.listen() instead
     */
    listen(audioStream: NodeJS.ReadableStream, options?: {
        [key: string]: any;
    }): Promise<string | NodeJS.ReadableStream | void>;
    /**
     * Get a list of available speakers from the configured voice provider
     * @throws {Error} If no voice provider is configured
     * @returns {Promise<Array<{voiceId: string}>>} List of available speakers
     * @deprecated Use agent.voice.getSpeakers() instead
     */
    getSpeakers(): Promise<{
        voiceId: string;
    }[]>;
    toStep(): LegacyStep<TAgentId, z.ZodObject<{
        prompt: z.ZodString;
    }>, z.ZodObject<{
        text: z.ZodString;
    }>, any>;
}

declare abstract class MastraStorage extends MastraBase {
    /** @deprecated import from { TABLE_WORKFLOW_SNAPSHOT } '@mastra/core/storage' instead */
    static readonly TABLE_WORKFLOW_SNAPSHOT = "mastra_workflow_snapshot";
    /** @deprecated import from { TABLE_EVALS } '@mastra/core/storage' instead */
    static readonly TABLE_EVALS = "mastra_evals";
    /** @deprecated import from { TABLE_MESSAGES } '@mastra/core/storage' instead */
    static readonly TABLE_MESSAGES = "mastra_messages";
    /** @deprecated import from { TABLE_THREADS } '@mastra/core/storage' instead */
    static readonly TABLE_THREADS = "mastra_threads";
    /** @deprecated import { TABLE_TRACES } from '@mastra/core/storage' instead */
    static readonly TABLE_TRACES = "mastra_traces";
    protected hasInitialized: null | Promise<boolean>;
    protected shouldCacheInit: boolean;
    constructor({ name }: {
        name: string;
    });
    get supports(): {
        selectByIncludeResourceScope: boolean;
    };
    protected ensureDate(date: Date | string | undefined): Date | undefined;
    protected serializeDate(date: Date | string | undefined): string | undefined;
    protected getSqlType(type: StorageColumn['type']): string;
    protected getDefaultValue(type: StorageColumn['type']): string;
    abstract createTable({ tableName }: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
    }): Promise<void>;
    abstract clearTable({ tableName }: {
        tableName: TABLE_NAMES;
    }): Promise<void>;
    abstract alterTable(args: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
        ifNotExists: string[];
    }): Promise<void>;
    abstract insert({ tableName, record }: {
        tableName: TABLE_NAMES;
        record: Record<string, any>;
    }): Promise<void>;
    abstract batchInsert({ tableName, records, }: {
        tableName: TABLE_NAMES;
        records: Record<string, any>[];
    }): Promise<void>;
    batchTraceInsert({ records }: {
        records: Record<string, any>[];
    }): Promise<void>;
    abstract load<R>({ tableName, keys }: {
        tableName: TABLE_NAMES;
        keys: Record<string, string>;
    }): Promise<R | null>;
    abstract getThreadById({ threadId }: {
        threadId: string;
    }): Promise<StorageThreadType | null>;
    abstract getThreadsByResourceId({ resourceId }: {
        resourceId: string;
    }): Promise<StorageThreadType[]>;
    abstract saveThread({ thread }: {
        thread: StorageThreadType;
    }): Promise<StorageThreadType>;
    abstract updateThread({ id, title, metadata, }: {
        id: string;
        title: string;
        metadata: Record<string, unknown>;
    }): Promise<StorageThreadType>;
    abstract deleteThread({ threadId }: {
        threadId: string;
    }): Promise<void>;
    abstract getMessages(args: StorageGetMessagesArg & {
        format?: 'v1';
    }): Promise<MastraMessageV1[]>;
    abstract getMessages(args: StorageGetMessagesArg & {
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    abstract getMessages({ threadId, resourceId, selectBy, format, }: StorageGetMessagesArg & {
        format?: 'v1' | 'v2';
    }): Promise<MastraMessageV1[] | MastraMessageV2[]>;
    abstract saveMessages(args: {
        messages: MastraMessageV1[];
        format?: undefined | 'v1';
    }): Promise<MastraMessageV1[]>;
    abstract saveMessages(args: {
        messages: MastraMessageV2[];
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    abstract saveMessages(args: {
        messages: MastraMessageV1[];
        format?: undefined | 'v1';
    } | {
        messages: MastraMessageV2[];
        format: 'v2';
    }): Promise<MastraMessageV2[] | MastraMessageV1[]>;
    abstract updateMessages(args: {
        messages: Partial<Omit<MastraMessageV2, 'createdAt'>> & {
            id: string;
            content?: {
                metadata?: MastraMessageContentV2['metadata'];
                content?: MastraMessageContentV2['content'];
            };
        }[];
    }): Promise<MastraMessageV2[]>;
    abstract getTraces(args: StorageGetTracesArg): Promise<any[]>;
    init(): Promise<void>;
    persistWorkflowSnapshot({ workflowName, runId, snapshot, }: {
        workflowName: string;
        runId: string;
        snapshot: WorkflowRunState;
    }): Promise<void>;
    loadWorkflowSnapshot({ workflowName, runId, }: {
        workflowName: string;
        runId: string;
    }): Promise<WorkflowRunState | null>;
    abstract getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
    abstract getWorkflowRuns(args?: {
        workflowName?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
        resourceId?: string;
    }): Promise<WorkflowRuns>;
    abstract getWorkflowRunById(args: {
        runId: string;
        workflowName?: string;
    }): Promise<WorkflowRun | null>;
    abstract getTracesPaginated(args: StorageGetTracesArg): Promise<PaginationInfo & {
        traces: Trace[];
    }>;
    abstract getThreadsByResourceIdPaginated(args: {
        resourceId: string;
        page: number;
        perPage: number;
    }): Promise<PaginationInfo & {
        threads: StorageThreadType[];
    }>;
    abstract getMessagesPaginated(args: StorageGetMessagesArg & {
        format?: 'v1' | 'v2';
    }): Promise<PaginationInfo & {
        messages: MastraMessageV1[] | MastraMessageV2[];
    }>;
}

export { type ActionContext as $, Agent as A, type StorageGetTracesArg as B, type CoreTool as C, TABLE_WORKFLOW_SNAPSHOT as D, type EvalRow as E, TABLE_EVALS as F, TABLE_MESSAGES as G, TABLE_THREADS as H, TABLE_TRACES as I, TABLE_SCHEMAS as J, type VariableReference$1 as K, LegacyWorkflow as L, Mastra as M, type StepResult$1 as N, type StepAction as O, type PaginationInfo as P, type LegacyWorkflowRunResult as Q, type WorkflowOptions as R, type StepExecutionContext as S, type ToolsInput as T, type StepVariableType as U, type VercelTool as V, type WorkflowContext as W, type StepNode as X, type StepGraph as Y, type RetryConfig as Z, type BaseCondition as _, type MastraPrimitives as a, type WorkingMemoryFormat as a$, WhenConditionReturnValue as a0, type StepDef as a1, type StepCondition as a2, type StepConfig as a3, type StepsRecord$1 as a4, type WorkflowLogMessage as a5, type WorkflowEvent as a6, type ResolverFunctionInput as a7, type ResolverFunctionOutput as a8, type SubscriberFunctionOutput as a9, type CoreToolMessage as aA, type EmbedResult as aB, type EmbedManyResult as aC, type BaseStructuredOutputType as aD, type StructuredOutputType as aE, type StructuredOutputArrayItem as aF, type StructuredOutput as aG, type GenerateReturn as aH, type StreamReturn as aI, type OutputType as aJ, type DefaultLLMTextOptions as aK, type DefaultLLMTextObjectOptions as aL, type DefaultLLMStreamOptions as aM, type DefaultLLMStreamObjectOptions as aN, type LLMTextOptions as aO, type LLMTextObjectOptions as aP, type LLMStreamOptions as aQ, type LLMInnerStreamOptions as aR, type LLMStreamObjectOptions as aS, createMockModel as aT, type Config as aU, type MessageType as aV, type MessageResponse as aW, type WorkingMemory as aX, type MemoryConfig as aY, type SharedMemoryConfig as aZ, type TraceType as a_, type DependencyCheckOutput as aa, type StepResolverOutput as ab, type WorkflowActors as ac, type WorkflowActionParams as ad, type WorkflowActions as ae, type LegacyWorkflowState as af, type StepId as ag, type ExtractSchemaFromStep$1 as ah, type ExtractStepResult as ai, type StepInputType as aj, type ExtractSchemaType$1 as ak, type PathsToStringProps$1 as al, type LegacyWorkflowRunState as am, type WorkflowResumeResult as an, Tool as ao, createTool as ap, type InternalCoreTool as aq, type ToolExecutionContext as ar, type AgentConfig as as, type DefaultEngineType as at, type WorkflowConfig as au, type LanguageModel as av, type CoreMessage as aw, type CoreSystemMessage as ax, type CoreAssistantMessage as ay, type CoreUserMessage as az, MastraMemory as b, type AgentGenerateOptions as b$, type WorkingMemoryTemplate as b0, type MemoryProcessorOpts as b1, MemoryProcessor as b2, memoryDefaultOptions as b3, type StepFlowEntry as b4, type SerializedStep as b5, type SerializedStepFlowEntry as b6, createStep as b7, cloneStep as b8, createWorkflow as b9, type VoiceConfig as bA, MastraVoice as bB, CompositeVoice as bC, DefaultVoice as bD, type AgentNetworkConfig as bE, type ConvertedTool as bF, type MCPServerSSEOptions as bG, type MCPServerHonoSSEOptions as bH, type MCPServerHTTPOptions as bI, type Repository as bJ, type VersionDetail as bK, type ArgumentInfo as bL, type PositionalArgumentInfo as bM, type NamedArgumentInfo as bN, type SubcommandInfo as bO, type CommandInfo as bP, type EnvironmentVariableInfo as bQ, type PackageInfo as bR, type RemoteInfo as bS, type MCPServerConfig as bT, type ServerInfo as bU, type ServerDetailInfo as bV, type MCPToolType as bW, MessageList as bX, type ToolsetsInput as bY, type DynamicArgument as bZ, type AgentMemoryOption as b_, cloneWorkflow as ba, type WorkflowResult as bb, Run as bc, type ExecutionGraph as bd, ExecutionEngine as be, type ExecuteFunction as bf, type Emitter as bg, type StepSuccess as bh, type StepFailure as bi, type StepSuspended as bj, type StepRunning as bk, type StepWaiting as bl, type StepResult as bm, type StepsRecord as bn, type DynamicMapping as bo, type PathsToStringProps as bp, type ExtractSchemaType as bq, type ExtractSchemaFromStep as br, type VariableReference as bs, type StreamEvent as bt, type WatchEvent as bu, type ZodPathType as bv, type WorkflowRunState as bw, type MastraLanguageModel as bx, type VoiceEventType as by, type VoiceEventMap as bz, type ToolAction as c, type AgentStreamOptions as c0, type MastraMessageContentV2 as c1, LegacyStep as d, Workflow as e, type Step as f, AgentNetwork as g, MCPServerBase as h, type Methods as i, type ApiRoute as j, type MastraAuthConfig as k, type ContextWithMastra as l, MastraAuthProvider as m, type MastraAuthProviderOptions as n, MastraStorage as o, type TABLE_NAMES as p, type StorageColumn as q, type StorageThreadType as r, type MastraMessageV2 as s, type StorageGetMessagesArg as t, type MastraMessageV1 as u, type WorkflowRuns as v, type WorkflowRun as w, type LegacyWorkflowRuns as x, type LegacyWorkflowRun as y, type PaginationArgs as z };
