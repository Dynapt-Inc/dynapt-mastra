import { M as Mastra, a as MastraPrimitives, b as MastraMemory, T as ToolsInput, V as VercelTool, c as ToolAction, C as CoreTool, A as Agent, L as LegacyWorkflow, d as LegacyStep, S as StepExecutionContext, W as WorkflowContext, e as Workflow, f as Step, g as AgentNetwork, h as MCPServerBase } from './base-CWUtFPZY.js';
import { LanguageModelV1, CoreMessage, Message } from 'ai';
import { MastraTTS } from './tts/index.js';
import { MastraVector } from './vector/index.js';
import { M as Metric } from './types-Bo1uigWx.js';
import { z } from 'zod';
import { I as IMastraLogger } from './logger-DtVDdb81.js';
import './base-DCIyondy.js';
import { RuntimeContext } from './runtime-context/index.js';
import 'json-schema';
import 'sift';
import '@opentelemetry/api';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import './workflows/constants.js';
import 'ai/test';
import './deployer/index.js';
import './bundler/index.js';
import 'hono/cors';
import 'hono-openapi';
import './vector/filter/index.js';
import './error/index.js';
import 'stream';
import '@opentelemetry/sdk-trace-base';

declare const delay: (ms: number) => Promise<unknown>;
/**
 * Deep merges two objects, recursively merging nested objects and arrays
 */
declare function deepMerge<T extends object = object>(target: T, source: Partial<T>): T;
interface TagMaskOptions {
    /** Called when masking begins */
    onStart?: () => void;
    /** Called when masking ends */
    onEnd?: () => void;
    /** Called for each chunk that is masked */
    onMask?: (chunk: string) => void;
}
/**
 * Transforms a stream by masking content between XML tags.
 * @param stream Input stream to transform
 * @param tag Tag name to mask between (e.g. for <foo>...</foo>, use 'foo')
 * @param options Optional configuration for masking behavior
 */
declare function maskStreamTags(stream: AsyncIterable<string>, tag: string, options?: TagMaskOptions): AsyncIterable<string>;
/**
 * Resolve serialized zod output - This function takes the string output ot the `jsonSchemaToZod` function
 * and instantiates the zod object correctly.
 *
 * @param schema - serialized zod object
 * @returns resolved zod object
 */
declare function resolveSerializedZodOutput(schema: string): z.ZodType;
interface ToolOptions {
    name: string;
    runId?: string;
    threadId?: string;
    resourceId?: string;
    logger?: IMastraLogger;
    description?: string;
    mastra?: (Mastra & MastraPrimitives) | MastraPrimitives;
    runtimeContext: RuntimeContext;
    memory?: MastraMemory;
    agentName?: string;
    model?: LanguageModelV1;
}
type ToolToConvert = VercelTool | ToolAction<any, any, any>;
/**
 * Checks if a value is a Zod type
 * @param value - The value to check
 * @returns True if the value is a Zod type, false otherwise
 */
declare function isZodType(value: unknown): value is z.ZodType;
/**
 * Ensures a tool has an ID and inputSchema by generating one if not present
 * @param tool - The tool to ensure has an ID and inputSchema
 * @returns The tool with an ID and inputSchema
 */
declare function ensureToolProperties(tools: ToolsInput): ToolsInput;
/**
 * Converts a Vercel Tool or Mastra Tool into a CoreTool format
 * @param originalTool - The tool to convert (either VercelTool or ToolAction)
 * @param options - Tool options including Mastra-specific settings
 * @param logType - Type of tool to log (tool or toolset)
 * @returns A CoreTool that can be used by the system
 */
declare function makeCoreTool(originalTool: ToolToConvert, options: ToolOptions, logType?: 'tool' | 'toolset' | 'client-tool'): CoreTool;
/**
 * Creates a proxy for a Mastra instance to handle deprecated properties
 * @param mastra - The Mastra instance to proxy
 * @param logger - The logger to use for warnings
 * @returns A proxy for the Mastra instance
 */
declare function createMastraProxy({ mastra, logger }: {
    mastra: Mastra;
    logger: IMastraLogger;
}): Mastra<Record<string, Agent<any, ToolsInput, Record<string, Metric>>>, Record<string, LegacyWorkflow<LegacyStep<string, any, any, StepExecutionContext<any, WorkflowContext<any, LegacyStep<string, any, any, any>[], Record<string, any>>>>[], string, any, any>>, Record<string, Workflow<any, Step<string, any, any, any, any, any>[], string, z.ZodType<any, z.ZodTypeDef, any>, z.ZodType<any, z.ZodTypeDef, any>, z.ZodType<any, z.ZodTypeDef, any>>>, Record<string, MastraVector>, Record<string, MastraTTS>, IMastraLogger, Record<string, AgentNetwork>, Record<string, MCPServerBase>>;
declare function checkEvalStorageFields(traceObject: any, logger?: IMastraLogger): boolean;
declare function isUiMessage(message: CoreMessage | Message): message is Message;
declare function isCoreMessage(message: CoreMessage | Message): message is CoreMessage;
/** Represents a validated SQL identifier (e.g., table or column name). */
type SqlIdentifier = string & {
    __brand: 'SqlIdentifier';
};
/** Represents a validated dot-separated SQL field key. */
type FieldKey = string & {
    __brand: 'FieldKey';
};
/**
 * Parses and returns a valid SQL identifier (such as a table or column name).
 * The identifier must:
 *   - Start with a letter (a-z, A-Z) or underscore (_)
 *   - Contain only letters, numbers, or underscores
 *   - Be at most 63 characters long
 *
 * @param name - The identifier string to parse.
 * @param kind - Optional label for error messages (e.g., 'table name').
 * @returns The validated identifier as a branded type.
 * @throws {Error} If the identifier does not conform to SQL naming rules.
 *
 * @example
 * const id = parseSqlIdentifier('my_table'); // Ok
 * parseSqlIdentifier('123table'); // Throws error
 */
declare function parseSqlIdentifier(name: string, kind?: string): SqlIdentifier;
/**
 * Parses and returns a valid dot-separated SQL field key (e.g., 'user.profile.name').
 * Each segment must:
 *   - Start with a letter (a-z, A-Z) or underscore (_)
 *   - Contain only letters, numbers, or underscores
 *   - Be at most 63 characters long
 *
 * @param key - The dot-separated field key string to parse.
 * @returns The validated field key as a branded type.
 * @throws {Error} If any segment of the key is invalid.
 *
 * @example
 * const key = parseFieldKey('user_profile.name'); // Ok
 * parseFieldKey('user..name'); // Throws error
 * parseFieldKey('user.123name'); // Throws error
 */
declare function parseFieldKey(key: string): FieldKey;

export { type TagMaskOptions, type ToolOptions, checkEvalStorageFields, createMastraProxy, deepMerge, delay, ensureToolProperties, isCoreMessage, isUiMessage, isZodType, makeCoreTool, maskStreamTags, parseFieldKey, parseSqlIdentifier, resolveSerializedZodOutput };
