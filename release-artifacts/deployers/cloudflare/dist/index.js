import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Deployer } from '@mastra/deployer';
import virtual from '@rollup/plugin-virtual';
import { Cloudflare } from 'cloudflare';

// src/index.ts
var CloudflareDeployer = class extends Deployer {
  cloudflare;
  routes = [];
  workerNamespace;
  scope;
  env;
  projectName;
  d1Databases;
  kvNamespaces;
  constructor({
    scope,
    env,
    projectName = "mastra",
    routes,
    workerNamespace,
    auth,
    d1Databases,
    kvNamespaces
  }) {
    super({ name: "CLOUDFLARE" });
    this.scope = scope;
    this.projectName = projectName;
    this.routes = routes;
    this.workerNamespace = workerNamespace;
    if (env) {
      this.env = env;
    }
    if (d1Databases) this.d1Databases = d1Databases;
    if (kvNamespaces) this.kvNamespaces = kvNamespaces;
    this.cloudflare = new Cloudflare(auth);
  }
  async writeFiles(outputDirectory) {
    const env = await this.loadEnvVars();
    const envsAsObject = Object.assign({}, Object.fromEntries(env.entries()), this.env);
    const cfWorkerName = this.projectName;
    const wranglerConfig = {
      name: cfWorkerName,
      main: "./index.mjs",
      compatibility_date: "2025-04-01",
      compatibility_flags: ["nodejs_compat", "nodejs_compat_populate_process_env"],
      observability: {
        logs: {
          enabled: true
        }
      },
      vars: envsAsObject
    };
    if (!this.workerNamespace && this.routes) {
      wranglerConfig.routes = this.routes;
    }
    if (this.d1Databases?.length) {
      wranglerConfig.d1_databases = this.d1Databases;
    }
    if (this.kvNamespaces?.length) {
      wranglerConfig.kv_namespaces = this.kvNamespaces;
    }
    await writeFile(join(outputDirectory, this.outputDir, "wrangler.json"), JSON.stringify(wranglerConfig));
  }
  getEntry() {
    return `
    import '#polyfills';
    import { mastra } from '#mastra';
    import { createHonoServer } from '#server';
    import { evaluate } from '@mastra/core/eval';
    import { AvailableHooks, registerHook } from '@mastra/core/hooks';
    import { TABLE_EVALS } from '@mastra/core/storage';
    import { checkEvalStorageFields } from '@mastra/core/utils';

    registerHook(AvailableHooks.ON_GENERATION, ({ input, output, metric, runId, agentName, instructions }) => {
      evaluate({
        agentName,
        input,
        metric,
        output,
        runId,
        globalRunId: runId,
        instructions,
      });
    });

    registerHook(AvailableHooks.ON_EVALUATION, async traceObject => {
      const storage = mastra.getStorage();
      if (storage) {
        // Check for required fields
        const logger = mastra?.getLogger();
        const areFieldsValid = checkEvalStorageFields(traceObject, logger);
        if (!areFieldsValid) return;

        await storage.insert({
          tableName: TABLE_EVALS,
          record: {
            input: traceObject.input,
            output: traceObject.output,
            result: JSON.stringify(traceObject.result || {}),
            agent_name: traceObject.agentName,
            metric_name: traceObject.metricName,
            instructions: traceObject.instructions,
            test_info: null,
            global_run_id: traceObject.globalRunId,
            run_id: traceObject.runId,
            created_at: new Date().toISOString(),
          },
        });
      }
    });

    export default {
      fetch: async (request, env, context) => {
        const app = await createHonoServer(mastra)
        return app.fetch(request, env, context);
      }
    }
`;
  }
  async prepare(outputDirectory) {
    await super.prepare(outputDirectory);
    await this.writeFiles(outputDirectory);
  }
  async getBundlerOptions(serverFile, mastraEntryFile, analyzedBundleInfo, toolsPaths) {
    const inputOptions = await super.getBundlerOptions(serverFile, mastraEntryFile, analyzedBundleInfo, toolsPaths);
    if (Array.isArray(inputOptions.plugins)) {
      inputOptions.plugins = [
        virtual({
          "#polyfills": `
process.versions = process.versions || {};
process.versions.node = '${process.versions.node}';
      `
        }),
        ...inputOptions.plugins
      ];
    }
    return inputOptions;
  }
  async bundle(entryFile, outputDirectory, toolsPaths) {
    return this._bundle(this.getEntry(), entryFile, outputDirectory, toolsPaths);
  }
  async deploy() {
    this.logger?.info("Deploying to Cloudflare failed. Please use the Cloudflare dashboard to deploy.");
  }
  async tagWorker({
    workerName,
    namespace,
    tags,
    scope
  }) {
    if (!this.cloudflare) {
      throw new Error("Cloudflare Deployer not initialized");
    }
    await this.cloudflare.workersForPlatforms.dispatch.namespaces.scripts.tags.update(namespace, workerName, {
      account_id: scope,
      body: tags
    });
  }
  async lint(entryFile, outputDirectory, toolsPaths) {
    await super.lint(entryFile, outputDirectory, toolsPaths);
    const hasLibsql = await this.deps.checkDependencies(["@mastra/libsql"]) === `ok`;
    if (hasLibsql) {
      this.logger.error(
        "Cloudflare Deployer does not support @libsql/client(which may have been installed by @mastra/libsql) as a dependency. Please use Cloudflare D1 instead @mastra/cloudflare-d1"
      );
      process.exit(1);
    }
  }
};

export { CloudflareDeployer };
