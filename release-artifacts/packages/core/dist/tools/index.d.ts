import { V as VercelTool, c as ToolAction } from '../base-CWUtFPZY.js';
export { C as CoreTool, aq as InternalCoreTool, ao as Tool, ar as ToolExecutionContext, ap as createTool } from '../base-CWUtFPZY.js';
import '../base-DCIyondy.js';
import 'ai';
import 'zod';
import '../logger-DtVDdb81.js';
import '../error/index.js';
import 'stream';
import 'json-schema';
import '../tts/index.js';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';
import '../vector/index.js';
import '../vector/filter/index.js';
import '../types-Bo1uigWx.js';
import 'sift';
import '../runtime-context/index.js';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import '../workflows/constants.js';
import 'ai/test';
import '../deployer/index.js';
import '../bundler/index.js';
import 'hono/cors';
import 'hono-openapi';

type ToolToConvert = VercelTool | ToolAction<any, any, any>;

/**
 * Checks if a tool is a Vercel Tool
 * @param tool - The tool to check
 * @returns True if the tool is a Vercel Tool, false otherwise
 */
declare function isVercelTool(tool?: ToolToConvert): tool is VercelTool;

export { ToolAction, VercelTool, isVercelTool };
