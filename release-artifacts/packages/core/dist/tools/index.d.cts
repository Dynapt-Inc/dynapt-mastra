import { V as VercelTool, c as ToolAction } from '../base-CEuVqEGP.cjs';
export { C as CoreTool, aq as InternalCoreTool, ao as Tool, ar as ToolExecutionContext, ap as createTool } from '../base-CEuVqEGP.cjs';
import '../base-CZ7cNkfE.cjs';
import 'ai';
import 'zod';
import '../logger-CpL0z5v_.cjs';
import '../error/index.cjs';
import 'stream';
import 'json-schema';
import '../tts/index.cjs';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';
import '../vector/index.cjs';
import '../vector/filter/index.cjs';
import '../types-Bo1uigWx.cjs';
import 'sift';
import '../runtime-context/index.cjs';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import '../workflows/constants.cjs';
import 'ai/test';
import '../deployer/index.cjs';
import '../bundler/index.cjs';
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
