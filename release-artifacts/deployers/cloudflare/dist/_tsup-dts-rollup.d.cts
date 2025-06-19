import type { analyzeBundle } from '@mastra/deployer/analyze';
import { Deployer } from '@mastra/deployer';
import { InputOptions } from 'rollup';

declare interface CFRoute {
    pattern: string;
    zone_name: string;
    custom_domain?: boolean;
}

export declare class CloudflareDeployer extends Deployer {
    private cloudflare;
    routes?: CFRoute[];
    workerNamespace?: string;
    scope: string;
    env?: Record<string, any>;
    projectName?: string;
    d1Databases?: D1DatabaseBinding[];
    kvNamespaces?: KVNamespaceBinding[];
    constructor({ scope, env, projectName, routes, workerNamespace, auth, d1Databases, kvNamespaces, }: {
        env?: Record<string, any>;
        scope: string;
        projectName?: string;
        routes?: CFRoute[];
        workerNamespace?: string;
        auth: {
            apiToken: string;
            apiEmail?: string;
        };
        d1Databases?: D1DatabaseBinding[];
        kvNamespaces?: KVNamespaceBinding[];
    });
    writeFiles(outputDirectory: string): Promise<void>;
    private getEntry;
    prepare(outputDirectory: string): Promise<void>;
    getBundlerOptions(serverFile: string, mastraEntryFile: string, analyzedBundleInfo: Awaited<ReturnType<typeof analyzeBundle>>, toolsPaths: string[]): Promise<InputOptions>;
    bundle(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
    deploy(): Promise<void>;
    tagWorker({ workerName, namespace, tags, scope, }: {
        scope: string;
        workerName: string;
        namespace: string;
        tags: string[];
    }): Promise<void>;
    lint(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
}

export declare class CloudflareSecretsManager {
    accountId: string;
    apiToken: string;
    baseUrl: string;
    constructor({ accountId, apiToken }: {
        accountId: string;
        apiToken: string;
    });
    createSecret({ workerId, secretName, secretValue, }: {
        workerId: string;
        secretName: string;
        secretValue: string;
    }): Promise<any>;
    createProjectSecrets({ workerId, customerId, envVars, }: {
        workerId: string;
        customerId: string;
        envVars: Record<string, string>;
    }): Promise<any>;
    deleteSecret({ workerId, secretName }: {
        workerId: string;
        secretName: string;
    }): Promise<any>;
    listSecrets(workerId: string): Promise<any>;
}

declare interface D1DatabaseBinding {
    binding: string;
    database_name: string;
    database_id: string;
    preview_database_id?: string;
}

declare interface KVNamespaceBinding {
    binding: string;
    id: string;
}

export { }
