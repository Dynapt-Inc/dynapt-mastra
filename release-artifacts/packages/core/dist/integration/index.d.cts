import '../base-CZ7cNkfE.cjs';
import { e as Workflow, c as ToolAction } from '../base-CEuVqEGP.cjs';
import '../logger-CpL0z5v_.cjs';
import '../error/index.cjs';
import 'stream';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';
import 'ai';
import 'zod';
import 'json-schema';
import '../tts/index.cjs';
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
