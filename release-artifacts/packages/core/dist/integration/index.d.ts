import '../base-DCIyondy.js';
import { e as Workflow, c as ToolAction } from '../base-CWUtFPZY.js';
import '../logger-DtVDdb81.js';
import '../error/index.js';
import 'stream';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';
import 'ai';
import 'zod';
import 'json-schema';
import '../tts/index.js';
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

declare class Integration<ToolsParams = void, ApiClient = void> {
    name: string;
    private workflows;
    constructor();
    /**
     * Workflows
     */
    registerWorkflow(name: string, fn: Workflow): void;
    getWorkflows({ serialized }: {
        serialized?: boolean;
    }): Record<string, Workflow>;
    /**
     * TOOLS
     */
    getStaticTools(_params?: ToolsParams): Record<string, ToolAction<any, any, any>>;
    getTools(_params?: ToolsParams): Promise<Record<string, ToolAction<any, any, any>>>;
    getApiClient(): Promise<ApiClient>;
}

declare abstract class OpenAPIToolset {
    abstract readonly name: string;
    abstract readonly tools: Record<string, ToolAction<any, any, any>>;
    authType: string;
    constructor();
    protected get toolSchemas(): any;
    protected get toolDocumentations(): Record<string, {
        comment: string;
        doc?: string;
    }>;
    protected get baseClient(): any;
    getApiClient(): Promise<any>;
    protected _generateIntegrationTools<T>(): T;
}

export { Integration, OpenAPIToolset };
