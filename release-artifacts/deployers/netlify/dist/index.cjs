'use strict';

var fs = require('fs');
var path = require('path');
var deployer = require('@mastra/deployer');
var services = require('@mastra/deployer/services');

// src/index.ts
var NetlifyDeployer = class extends deployer.Deployer {
  scope;
  projectName;
  token;
  constructor({ scope, projectName, token }) {
    super({ name: "NETLIFY" });
    this.scope = scope;
    this.projectName = projectName;
    this.token = token;
  }
  writeFiles({ dir }) {
    if (!fs.existsSync(path.join(dir, "netlify/functions/api"))) {
      fs.mkdirSync(path.join(dir, "netlify/functions/api"), { recursive: true });
    }
    fs.writeFileSync(
      path.join(dir, "netlify.toml"),
      `[functions]
node_bundler = "esbuild"            
directory = "netlify/functions"

[[redirects]]
force = true
from = "/*"
status = 200
to = "/.netlify/functions/api/:splat"
`
    );
  }
  async installDependencies(outputDirectory, rootDir = process.cwd()) {
    const deps = new services.DepsService(rootDir);
    deps.__setLogger(this.logger);
    await deps.install({
      dir: path.join(outputDirectory, this.outputDir),
      architecture: {
        os: ["linux"],
        cpu: ["x64"],
        libc: ["gnu"]
      }
    });
  }
  async deploy() {
    this.logger?.info("Deploying to Netlify failed. Please use the Netlify dashboard to deploy.");
  }
  async prepare(outputDirectory) {
    await super.prepare(outputDirectory);
    this.writeFiles({ dir: path.join(outputDirectory, this.outputDir) });
  }
  async bundle(entryFile, outputDirectory, toolsPaths) {
    return this._bundle(
      this.getEntry(),
      entryFile,
      outputDirectory,
      toolsPaths,
      path.join(outputDirectory, this.outputDir, "netlify", "functions", "api")
    );
  }
  getEntry() {
    return `
    import { handle } from 'hono/netlify'
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
        const logger = mastra.getLogger();
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

    const app = await createHonoServer(mastra);

    export default handle(app)
`;
  }
  async lint(entryFile, outputDirectory, toolsPaths) {
    await super.lint(entryFile, outputDirectory, toolsPaths);
  }
};

exports.NetlifyDeployer = NetlifyDeployer;
