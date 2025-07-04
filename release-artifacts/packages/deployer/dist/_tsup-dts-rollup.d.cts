import { default as babel_2 } from '@babel/core';
import { BlankSchema } from 'hono/types';
import type { Config } from '@mastra/core';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Context } from 'hono';
import type { ContextWithMastra } from '@mastra/core/server';
import { Hono } from 'hono';
import type { IDeployer } from '@mastra/core/deployer';
import type { IMastraLogger } from '@mastra/core/logger';
import { InputOptions } from 'rollup';
import type { Mastra } from '@mastra/core';
import type { MastraAuthConfig } from '@mastra/core/server';
import { MastraBase } from '@mastra/core/base';
import { MastraBundler } from '@mastra/core/bundler';
import type { MastraDeployer } from '@mastra/core';
import type { MastraVector } from '@mastra/core/vector';
import type { Next } from 'hono';
import { OutputOptions } from 'rollup';
import type { Plugin } from 'rollup';
import { PluginContext } from 'rollup';
import { PluginObj } from '@babel/core';
import { PluginPass } from '@babel/core';
import type { RegisterOptions } from 'typescript-paths';
import { RenderedChunk } from 'rollup';
import type { ResolveHookContext } from 'node:module';
import { RollupBuild } from 'rollup';
import { RollupOutput } from 'rollup';
import { RollupWatcher } from 'rollup';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { ServerType } from '@hono/node-server';
import { Transform } from 'stream';
import { TypedResponse } from 'hono';

export declare function aliasHono(): Plugin;

/**
 * Main bundle analysis function that orchestrates the three-step process:
 * 1. Analyze dependencies
 * 2. Bundle dependencies modules
 * 3. Validate generated bundles
 *
 * This helps identify which dependencies need to be externalized vs bundled.
 */
declare function analyzeBundle(entries: string[], mastraEntry: string, outputDir: string, platform: 'node' | 'browser', logger: IMastraLogger): Promise<{
    invalidChunks: Set<string>;
    dependencies: Map<string, string>;
    externalDependencies: Set<string>;
}>;
export { analyzeBundle }
export { analyzeBundle as analyzeBundle_alias_1 }

declare interface ApiError extends Error {
    message: string;
    status?: number;
}
export { ApiError }
export { ApiError as ApiError_alias_1 }

declare interface ArchitectureOptions {
    os?: string[];
    cpu?: string[];
    libc?: string[];
}

export declare const authenticationMiddleware: (c: ContextWithMastra, next: Next) => Promise<void | (Response & TypedResponse<    {
error: string;
}, 401, "json">)>;

export declare const authorizationMiddleware: (c: ContextWithMastra, next: Next) => Promise<void | (Response & TypedResponse<    {
error: string;
}, 403, "json">) | (Response & TypedResponse<    {
error: string;
}, 500, "json">)>;

declare type Bindings = {};

export declare abstract class Bundler extends MastraBundler {
    protected analyzeOutputDir: string;
    protected outputDir: string;
    constructor(name: string, component?: 'BUNDLER' | 'DEPLOYER');
    prepare(outputDirectory: string): Promise<void>;
    writeInstrumentationFile(outputDirectory: string): Promise<void>;
    writePackageJson(outputDirectory: string, dependencies: Map<string, string>, resolutions?: Record<string, string>): Promise<void>;
    protected createBundler(inputOptions: InputOptions, outputOptions: Partial<OutputOptions> & {
        dir: string;
    }): Promise<{
        write: () => Promise<RollupOutput>;
        close: () => Promise<void>;
    }>;
    protected analyze(entry: string | string[], mastraFile: string, outputDirectory: string): Promise<{
        invalidChunks: Set<string>;
        dependencies: Map<string, string>;
        externalDependencies: Set<string>;
    }>;
    protected installDependencies(outputDirectory: string, rootDir?: string): Promise<void>;
    protected copyPublic(mastraDir: string, outputDirectory: string): Promise<void>;
    protected getBundlerOptions(serverFile: string, mastraEntryFile: string, analyzedBundleInfo: Awaited<ReturnType<typeof analyzeBundle>>, toolsPaths: string[]): Promise<InputOptions>;
    getToolsInputOptions(toolsPaths: string[]): Promise<Record<string, string>>;
    protected _bundle(serverFile: string, mastraEntryFile: string, outputDirectory: string, toolsPaths?: string[], bundleLocation?: string): Promise<void>;
    lint(_entryFile: string, _outputDirectory: string, toolsPaths: string[]): Promise<void>;
}

export declare const canAccessPublicly: (path: string, method: string, authConfig: MastraAuthConfig) => boolean;

export declare const checkRules: (rules: MastraAuthConfig["rules"], path: string, method: string, user: unknown) => Promise<boolean>;

/**
 * Collects all transitive workspace dependencies and their TGZ paths
 */
export declare const collectTransitiveWorkspaceDependencies: ({ workspaceMap, initialDependencies, logger, }: {
    workspaceMap: Map<string, WorkspacePackageInfo>;
    initialDependencies: Set<string>;
    logger: IMastraLogger;
}) => TransitiveDependencyResult;

declare function createBundler(inputOptions: InputOptions, outputOptions: Partial<OutputOptions> & {
    dir: string;
}): Promise<{
    write: () => Promise<RollupOutput>;
    close: () => Promise<void>;
}>;
export { createBundler }
export { createBundler as createBundler_alias_1 }

declare function createChildProcessLogger({ logger, root }: {
    logger: IMastraLogger;
    root: string;
}): ({ cmd, args, env }: {
    cmd: string;
    args: string[];
    env: Record<string, string>;
}) => Promise<unknown>;
export { createChildProcessLogger }
export { createChildProcessLogger as createChildProcessLogger_alias_1 }
export { createChildProcessLogger as createChildProcessLogger_alias_2 }

export declare function createHonoServer(mastra: Mastra, options?: ServerBundleOptions): Promise<Hono<{
    Bindings: Bindings;
    Variables: Variables;
}, BlankSchema, "/">>;

export declare function createIndex(c: Context): Promise<Response>;

export declare function createLegacyWorkflowRunHandler(c: Context): Promise<Response>;

export declare function createNodeServer(mastra: Mastra, options?: ServerBundleOptions): Promise<ServerType>;

declare const createPinoStream: (logger: IMastraLogger) => Transform;
export { createPinoStream }
export { createPinoStream as createPinoStream_alias_1 }
export { createPinoStream as createPinoStream_alias_2 }

export declare function createThreadHandler(c: Context): Promise<Response>;

declare function createWatcher(inputOptions: InputOptions, outputOptions: OutputOptions): Promise<RollupWatcher>;
export { createWatcher }
export { createWatcher as createWatcher_alias_1 }

export declare function createWorkflowRunHandler(c: Context): Promise<Response>;

/**
 * Creates a map of workspace packages with their metadata for dependency resolution
 * @returns Map of package names to their location, dependencies and version
 */
export declare const createWorkspacePackageMap: () => Promise<Map<string, {
    location: string;
    dependencies: Record<string, string> | undefined;
    version: string | undefined;
}>>;

export declare const defaultAuthConfig: MastraAuthConfig;

export declare function deleteIndex(c: Context): Promise<Response>;

export declare function deleteThreadHandler(c: Context): Promise<Response>;

declare abstract class Deployer extends Bundler implements IDeployer {
    deps: DepsService;
    constructor(args: {
        name: string;
    });
    getEnvFiles(): Promise<string[]>;
    abstract deploy(outputDirectory: string): Promise<void>;
}
export { Deployer }
export { Deployer as Deployer_alias_1 }
export { Deployer as Deployer_alias_2 }

declare class Deps extends MastraBase {
    private packageManager;
    private rootDir;
    constructor(rootDir?: string);
    private findLockFile;
    private getPackageManager;
    getWorkspaceDependencyPath({ pkgName, version }: {
        pkgName: string;
        version: string;
    }): string;
    pack({ dir, destination }: {
        dir: string;
        destination: string;
    }): Promise<unknown>;
    private writePnpmConfig;
    private writeYarnConfig;
    private getNpmArgs;
    install({ dir, architecture, }?: {
        dir?: string;
        architecture?: ArchitectureOptions;
    }): Promise<unknown>;
    installPackages(packages: string[]): Promise<unknown>;
    checkDependencies(dependencies: string[]): Promise<string>;
    getProjectName(): Promise<any>;
    getPackageVersion(): Promise<string | undefined>;
    addScriptsToPackageJson(scripts: Record<string, string>): Promise<void>;
}
export { Deps }
export { Deps as Deps_alias_1 }
export { Deps as Deps_alias_2 }

declare class DepsService extends Deps {
}
export { DepsService }
export { DepsService as DepsService_alias_1 }

export declare function describeIndex(c: Context): Promise<Response>;

declare abstract class EnvService {
    abstract getEnvValue(key: string): Promise<string | null>;
    abstract setEnvValue(key: string, value: string): Promise<void>;
}
export { EnvService }
export { EnvService as EnvService_alias_1 }

export declare function errorHandler(err: Error, c: Context): Response;

export declare function executeAgentToolHandler(c: Context): Promise<Response>;

/**
 * Handler for POST /api/mcp/:serverId/tools/:toolId/execute - Execute a tool on an MCP Server
 */
export declare const executeMcpServerToolHandler: (c: Context) => Promise<Response>;

export declare function executeToolHandler(tools: Record<string, any>): (c: Context) => Promise<Response>;

export declare class FileEnvService extends EnvService {
    private filePath;
    constructor(filePath: string);
    private readFile;
    private writeFile;
    private updateEnvData;
    getEnvValue(key: string): Promise<string | null>;
    setEnvValue(key: string, value: string): Promise<void>;
}

declare class FileService {
    /**
     *
     * @param inputFile the file in the starter files directory to copy
     * @param outputFilePath the destination path
     * @param replaceIfExists flag to replace if it exists
     * @returns
     */
    copyStarterFile(inputFile: string, outputFilePath: string, replaceIfExists?: boolean): Promise<boolean>;
    setupEnvFile({ dbUrl }: {
        dbUrl: string;
    }): Promise<void>;
    getFirstExistingFile(files: string[]): string;
    replaceValuesInFile({ filePath, replacements, }: {
        filePath: string;
        replacements: {
            search: string;
            replace: string;
        }[];
    }): void;
}
export { FileService }
export { FileService as FileService_alias_1 }
export { FileService as FileService_alias_2 }
export { FileService as FileService_alias_3 }

export declare function generateHandler(c: Context): Promise<Response>;

export declare function generateHandler_alias_1(c: Context): Promise<Response>;

export declare function generateSystemPromptHandler(c: Context): Promise<Response>;

export declare function getAgentByIdHandler(c: Context): Promise<Response & TypedResponse<    {
name: any;
instructions: string;
tools: any;
workflows: {};
provider: string;
modelId: string;
defaultGenerateOptions: any;
defaultStreamOptions: any;
}, ContentfulStatusCode, "json">>;

export declare function getAgentCardByIdHandler(c: Context): Promise<Response & TypedResponse<    {
name: string;
description?: string | null | undefined;
url: string;
provider?: {
organization: string;
url?: string | null | undefined;
} | null | undefined;
version: string;
documentationUrl?: string | null | undefined;
capabilities: {
streaming?: boolean | undefined;
pushNotifications?: boolean | undefined;
stateTransitionHistory?: boolean | undefined;
};
authentication?: {
schemes: string[];
credentials?: string | null | undefined;
} | null | undefined;
defaultInputModes?: string[] | undefined;
defaultOutputModes?: string[] | undefined;
skills: {
id: string;
name: string;
description?: string | null | undefined;
tags?: string[] | null | undefined;
examples?: string[] | null | undefined;
inputModes?: string[] | null | undefined;
outputModes?: string[] | null | undefined;
}[];
}, ContentfulStatusCode, "json">>;

export declare function getAgentExecutionHandler(c: Context): Promise<Response>;

export declare function getAgentsHandler(c: Context): Promise<Response & TypedResponse<any, ContentfulStatusCode, "json">>;

declare function getBundlerOptions(entryFile: string, outputDir: string): Promise<Config['bundler'] | null>;
export { getBundlerOptions }
export { getBundlerOptions as getBundlerOptions_alias_1 }

export declare function getBundlerOptionsBundler(entryFile: string, result: {
    hasCustomConfig: false;
}): Promise<RollupBuild>;

declare function getDeployer(entryFile: string, outputDir: string): Promise<MastraDeployer | undefined>;
export { getDeployer }
export { getDeployer as getDeployer_alias_1 }

export declare function getDeployerBundler(entryFile: string, result: {
    isDeployerRemoved: boolean;
}): Promise<RollupBuild>;

export declare function getEvalsByAgentIdHandler(c: Context): Promise<Response & TypedResponse<    {
id: string;
name: any;
instructions: string;
evals: {
input: string;
output: string;
result: {
score: number;
info?: {
[x: string]: any;
} | undefined;
};
agentName: string;
createdAt: string;
metricName: string;
instructions: string;
runId: string;
globalRunId: string;
testInfo?: {
testName?: string | undefined;
testPath?: string | undefined;
} | undefined;
}[];
}, ContentfulStatusCode, "json">>;

declare function getInputOptions(entryFile: string, analyzedBundleInfo: Awaited<ReturnType<typeof analyzeBundle>>, platform: 'node' | 'browser', env?: Record<string, string>): Promise<InputOptions>;
export { getInputOptions as getBundlerInputOptions }
export { getInputOptions }

declare function getInputOptions_2(entryFile: string, platform: 'node' | 'browser', env?: Record<string, string>): Promise<InputOptions>;
export { getInputOptions_2 as getInputOptions_alias_1 }
export { getInputOptions_2 as getWatcherInputOptions }

export declare function getLegacyWorkflowByIdHandler(c: Context): Promise<Response>;

export declare function getLegacyWorkflowRunsHandler(c: Context): Promise<Response>;

export declare function getLegacyWorkflowsHandler(c: Context): Promise<Response>;

/**
 * Get available speakers for an agent
 */
export declare function getListenerHandler(c: Context): Promise<Response>;

export declare function getLiveEvalsByAgentIdHandler(c: Context): Promise<Response & TypedResponse<    {
id: string;
name: any;
instructions: string;
evals: {
input: string;
output: string;
result: {
score: number;
info?: {
[x: string]: any;
} | undefined;
};
agentName: string;
createdAt: string;
metricName: string;
instructions: string;
runId: string;
globalRunId: string;
testInfo?: {
testName?: string | undefined;
testPath?: string | undefined;
} | undefined;
}[];
}, ContentfulStatusCode, "json">>;

export declare function getLogsByRunIdHandler(c: Context): Promise<Response>;

export declare function getLogsHandler(c: Context): Promise<Response>;

export declare function getLogTransports(c: Context): Promise<Response>;

/**
 * Handler for GET /api/mcp/v0/servers/:id - Get MCP Server Details (Registry Style)
 */
export declare const getMcpRegistryServerDetailHandler: (c: Context) => Promise<(Response & TypedResponse<    {
error: string;
}, 500, "json">) | (Response & TypedResponse<    {
error: string;
}, 404, "json">) | (Response & TypedResponse<    {
package_canonical?: string | undefined;
packages?: {
registry_name: "npm" | "docker" | "pypi" | "homebrew" | string;
name: string;
version: string;
command?: {
name: "npx" | "docker" | "pypi" | "uvx" | string;
subcommands?: {
name: string;
description: string;
is_required?: boolean | undefined;
subcommands?: /*elided*/ any[] | undefined;
positional_arguments?: {
position: number;
name: string;
description: string;
is_required: boolean;
is_repeatable?: boolean | undefined;
is_editable?: boolean | undefined;
choices?: string[] | undefined;
default_value?: string | number | boolean | undefined;
}[] | undefined;
named_arguments?: {
short_flag?: string | undefined;
long_flag?: string | undefined;
requires_value?: boolean | undefined;
name: string;
description: string;
is_required: boolean;
is_repeatable?: boolean | undefined;
is_editable?: boolean | undefined;
choices?: string[] | undefined;
default_value?: string | number | boolean | undefined;
}[] | undefined;
}[] | undefined;
positional_arguments?: {
position: number;
name: string;
description: string;
is_required: boolean;
is_repeatable?: boolean | undefined;
is_editable?: boolean | undefined;
choices?: string[] | undefined;
default_value?: string | number | boolean | undefined;
}[] | undefined;
named_arguments?: {
short_flag?: string | undefined;
long_flag?: string | undefined;
requires_value?: boolean | undefined;
name: string;
description: string;
is_required: boolean;
is_repeatable?: boolean | undefined;
is_editable?: boolean | undefined;
choices?: string[] | undefined;
default_value?: string | number | boolean | undefined;
}[] | undefined;
} | undefined;
environment_variables?: {
name: string;
description: string;
required?: boolean | undefined;
default_value?: string | undefined;
}[] | undefined;
}[] | undefined;
remotes?: {
transport_type: "streamable" | "sse" | string;
url: string;
}[] | undefined;
id: string;
name: string;
description?: string | undefined;
repository?: {
url: string;
source: "github" | "gitlab" | string;
id: string;
} | undefined;
version_detail: {
version: string;
release_date: string;
is_latest: boolean;
};
}, ContentfulStatusCode, "json">)>;

/**
 * Handler for Streamable HTTP requests (POST, GET, DELETE) to /api/mcp/:serverId/mcp
 */
export declare const getMcpServerMessageHandler: (c: Context) => Promise<Response | undefined>;

/**
 * Handler for SSE related routes for an MCP server.
 * This function will be called for both establishing the SSE connection (GET)
 * and for posting messages to it (POST).
 */
export declare const getMcpServerSseHandler: (c: Context) => Promise<Response | undefined>;

/**
 * Handler for GET /api/mcp/:serverId/tools/:toolId - Get details for a specific tool on an MCP Server
 */
export declare const getMcpServerToolDetailHandler: (c: Context) => Promise<Response>;

export declare function getMemoryStatusHandler(c: Context): Promise<Response>;

export declare function getMessagesHandler(c: Context): Promise<Response>;

export declare function getNetworkByIdHandler(c: Context): Promise<Response>;

export declare function getNetworksHandler(c: Context): Promise<Response>;

declare function getServerOptions(entryFile: string, outputDir: string): Promise<Config['server'] | null>;
export { getServerOptions }
export { getServerOptions as getServerOptions_alias_1 }

export declare function getServerOptionsBundler(entryFile: string, result: {
    hasCustomConfig: false;
}): Promise<RollupBuild>;

/**
 * Get available speakers for an agent
 */
export declare function getSpeakersHandler(c: Context): Promise<Response>;

export declare function getTelemetryBundler(entryFile: string, result: {
    hasCustomConfig: false;
}): Promise<RollupBuild>;

export declare function getTelemetryHandler(c: Context): Promise<Response>;

export declare function getThreadByIdHandler(c: Context): Promise<Response>;

export declare function getThreadsHandler(c: Context): Promise<Response>;

export declare function getToolByIdHandler(c: Context): Promise<Response>;

export declare function getToolsHandler(c: Context): Promise<Response>;

export declare const getVector: (c: Context, vectorName: string) => MastraVector;

export declare function getWorkflowByIdHandler(c: Context): Promise<Response>;

export declare function getWorkflowRunByIdHandler(c: Context): Promise<Response>;

export declare function getWorkflowRunExecutionResultHandler(c: Context): Promise<Response>;

export declare function getWorkflowRunsHandler(c: Context): Promise<Response>;

export declare function getWorkflowsHandler(c: Context): Promise<Response>;

export declare function handleClientsRefresh(c: Context): Response;

export declare function handleError(error: unknown, defaultMessage: string): Promise<Response>;

export declare function handleTriggerClientsRefresh(c: Context): Response & TypedResponse<    {
success: true;
clients: number;
}, ContentfulStatusCode, "json">;

export declare const html = "\n<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Welcome to Mastra</title>\n    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/inter-ui/3.19.3/inter.min.css\" />\n    <style>\n      body {\n        margin: 0;\n        padding: 0;\n        background-color: #0d0d0d;\n        color: #ffffff;\n        font-family:\n          'Inter',\n          -apple-system,\n          BlinkMacSystemFont,\n          system-ui,\n          sans-serif;\n        min-height: 100vh;\n        display: flex;\n        flex-direction: column;\n      }\n\n      main {\n        flex: 1;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        padding: 2rem;\n        text-align: center;\n      }\n\n      h1 {\n        font-size: 4rem;\n        font-weight: 600;\n        margin: 0 0 1rem 0;\n        background: linear-gradient(to right, #fff, #ccc);\n        -webkit-background-clip: text;\n        -webkit-text-fill-color: transparent;\n        line-height: 1.2;\n      }\n\n      .subtitle {\n        color: #9ca3af;\n        font-size: 1.25rem;\n        max-width: 600px;\n        margin: 0 auto 3rem auto;\n        line-height: 1.6;\n      }\n\n      .docs-link {\n        background-color: #1a1a1a;\n        padding: 1rem 2rem;\n        border-radius: 0.5rem;\n        display: flex;\n        align-items: center;\n        gap: 1rem;\n        font-family: monospace;\n        font-size: 1rem;\n        color: #ffffff;\n        text-decoration: none;\n        transition: background-color 0.2s;\n      }\n\n      .docs-link:hover {\n        background-color: #252525;\n      }\n\n      .arrow-icon {\n        transition: transform 0.2s;\n      }\n\n      .docs-link:hover .arrow-icon {\n        transform: translateX(4px);\n      }\n    </style>\n  </head>\n  <body>\n    <main>\n      <h1>Welcome to Mastra</h1>\n      <p class=\"subtitle\">\n        From the team that brought you Gatsby: prototype and productionize AI features with a modern JS/TS stack.\n      </p>\n\n      <a href=\"https://mastra.ai/docs\" class=\"docs-link\">\n        Browse the docs\n        <svg\n          class=\"arrow-icon\"\n          width=\"20\"\n          height=\"20\"\n          viewBox=\"0 0 24 24\"\n          fill=\"none\"\n          stroke=\"currentColor\"\n          strokeWidth=\"2\"\n        >\n          <path d=\"M5 12h14M12 5l7 7-7 7\" />\n        </svg>\n      </a>\n    </main>\n  </body>\n</html>\n";

export declare function isNodeBuiltin(dep: string): boolean;

export declare const isProtectedPath: (path: string, method: string, authConfig: MastraAuthConfig) => boolean;

/**
 * Convert speech to text using the agent's voice provider
 */
export declare function listenHandler(c: Context): Promise<Response>;

export declare function listIndexes(c: Context): Promise<Response>;

/**
 * Handler for GET /api/mcp/v0/servers - List MCP Servers (Registry Style)
 */
export declare const listMcpRegistryServersHandler: (c: Context) => Promise<(Response & TypedResponse<    {
error: string;
}, 500, "json">) | (Response & TypedResponse<    {
servers: {
id: string;
name: string;
description?: string | undefined;
repository?: {
url: string;
source: "github" | "gitlab" | string;
id: string;
} | undefined;
version_detail: {
version: string;
release_date: string;
is_latest: boolean;
};
}[];
next: string | null;
total_count: number;
}, ContentfulStatusCode, "json">)>;

/**
 * Handler for GET /api/mcp/:serverId/tools - List tools for a specific MCP Server
 */
export declare const listMcpServerToolsHandler: (c: Context) => Promise<Response>;

export declare const matchesOrIncludes: (values: string | string[], value: string) => boolean;

export declare function nodeModulesExtensionResolver(): Plugin;

/**
 * Creates TGZ packages for workspace dependencies in the workspace-module directory
 */
export declare const packWorkspaceDependencies: ({ workspaceMap, usedWorkspacePackages, bundleOutputDir, logger, }: {
    workspaceMap: Map<string, WorkspacePackageInfo>;
    bundleOutputDir: string;
    logger: IMastraLogger;
    usedWorkspacePackages: Set<string>;
}) => Promise<void>;

export declare const pathMatchesPattern: (path: string, pattern: string) => boolean;

export declare const pathMatchesRule: (path: string, rulePath: string | RegExp | string[] | undefined) => boolean;

export declare function pino(): {
    name: string;
    resolveId(this: PluginContext, id: string, importee: string | undefined): Promise<{
        id: string;
        external: true;
        moduleSideEffects: false;
    } | undefined>;
    renderChunk(this: PluginContext, code: string, chunk: RenderedChunk): {
        code: string;
        map: null;
    } | undefined;
};

export declare type PluginOptions = Omit<RegisterOptions, 'loggerID'>;

export declare function queryVectors(c: Context): Promise<Response>;

export declare function recursiveRemoveNonReferencedNodes(code: string): Promise<{
    code: string;
    map: any;
}>;

export declare function removeAllExceptDeployer(): babel_2.PluginObj;

export declare function removeAllOptionsExceptBundler(result: {
    hasCustomConfig: boolean;
}): PluginObj<PluginPass>;

export declare function removeAllOptionsExceptServer(result: {
    hasCustomConfig: boolean;
}): PluginObj<PluginPass>;

export declare function removeAllOptionsExceptTelemetry(result: {
    hasCustomConfig: boolean;
}): PluginObj<PluginPass>;

export declare function removeAllOptionsFromMastraExcept(result: {
    hasCustomConfig: boolean;
}, option: 'telemetry' | 'server' | 'bundler'): babel_2.PluginObj;

export declare function removeDeployer(): babel_2.PluginObj;

export declare function removeDeployer_alias_1(mastraEntry: string): Plugin;

export declare function removeNonReferencedNodes(): babel_2.PluginObj;

export declare function resolve(specifier: string, context: ResolveHookContext, nextResolve: (specifier: string, context: ResolveHookContext) => Promise<{
    url: string;
}>): Promise<{
    url: string;
}>;

export declare function resumeAsyncLegacyWorkflowHandler(c: Context): Promise<Response>;

export declare function resumeAsyncWorkflowHandler(c: Context): Promise<Response>;

export declare function resumeLegacyWorkflowHandler(c: Context): Promise<Response>;

export declare function resumeWorkflowHandler(c: Context): Promise<Response>;

export declare function rootHandler(c: Context): Promise<Response & TypedResponse<"Hello to the Mastra API!", ContentfulStatusCode, "text">>;

export declare function saveMessagesHandler(c: Context): Promise<Response>;

declare type ServerBundleOptions = {
    playground?: boolean;
    isDev?: boolean;
};
export { ServerBundleOptions }
export { ServerBundleOptions as ServerBundleOptions_alias_1 }

export declare function setAgentInstructionsHandler(c: Context): Promise<Response>;

/**
 * Convert text to speech using the agent's voice provider
 */
export declare function speakHandler(c: Context): Promise<Response>;

export declare function startAsyncLegacyWorkflowHandler(c: Context): Promise<Response>;

export declare function startAsyncWorkflowHandler(c: Context): Promise<Response>;

export declare function startLegacyWorkflowRunHandler(c: Context): Promise<Response>;

export declare function startWorkflowRunHandler(c: Context): Promise<Response>;

export declare function storeTelemetryHandler(c: Context): Promise<Response>;

export declare function streamGenerateHandler(c: Context): Promise<Response | undefined>;

export declare function streamGenerateHandler_alias_1(c: Context): Promise<Response | undefined>;

export declare function streamWorkflowHandler(c: Context): Promise<Response>;

declare type TransitiveDependencyResult = {
    resolutions: Record<string, string>;
    usedWorkspacePackages: Set<string>;
};

export declare function tsConfigPaths({ tsConfigPath, respectCoreModule }?: PluginOptions): Plugin;

export declare function updateThreadHandler(c: Context): Promise<Response>;

export declare function upsertMastraDir({ dir }: {
    dir?: string;
}): void;

export declare function upsertVectors(c: Context): Promise<Response>;

export declare function validate(file: string): Promise<void>;

export declare function validateBody(body: Record<string, unknown>): void;

declare type Variables = {
    mastra: Mastra;
    runtimeContext: RuntimeContext;
    clients: Set<{
        controller: ReadableStreamDefaultController;
    }>;
    tools: Record<string, any>;
    playground: boolean;
    isDev: boolean;
};

export declare function watchLegacyWorkflowHandler(c: Context): Response | Promise<Response>;

export declare function watchWorkflowHandler(c: Context): Response | Promise<Response>;

declare type WorkspacePackageInfo = {
    location: string;
    dependencies: Record<string, string> | undefined;
    version: string | undefined;
};

declare function writeTelemetryConfig(entryFile: string, outputDir: string): Promise<{
    hasCustomConfig: boolean;
    externalDependencies: string[];
}>;
export { writeTelemetryConfig }
export { writeTelemetryConfig as writeTelemetryConfig_alias_1 }

export { }
