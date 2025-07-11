#! /usr/bin/env node
import { PosthogAnalytics } from './chunk-7OXWUU2Q.js';
export { PosthogAnalytics } from './chunk-7OXWUU2Q.js';
import { DepsService, create, checkPkgJson, checkAndInstallCoreDeps, interactivePrompt, init, logger, FileService } from './chunk-DKHFKQWY.js';
export { create } from './chunk-DKHFKQWY.js';
import { Command } from 'commander';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { getServerOptions, FileService as FileService$2, getWatcherInputOptions, writeTelemetryConfig, createWatcher } from '@mastra/deployer/build';
import { Bundler } from '@mastra/deployer/bundler';
import { getDeployer, FileService as FileService$1 } from '@mastra/deployer';
import { isWebContainer } from '@webcontainer/env';
import { execa } from 'execa';
import getPort from 'get-port';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import * as fsExtra from 'fs-extra';
import fs, { readFileSync } from 'fs';
import stripJsonComments from 'strip-json-comments';
import { spawn } from 'child_process';

var BuildBundler = class extends Bundler {
  customEnvFile;
  constructor(customEnvFile) {
    super("Build");
    this.customEnvFile = customEnvFile;
  }
  getEnvFiles() {
    const possibleFiles = [".env.production", ".env.local", ".env"];
    if (this.customEnvFile) {
      possibleFiles.unshift(this.customEnvFile);
    }
    try {
      const fileService = new FileService$2();
      const envFile = fileService.getFirstExistingFile(possibleFiles);
      return Promise.resolve([envFile]);
    } catch (err) {
    }
    return Promise.resolve([]);
  }
  async prepare(outputDirectory) {
    await super.prepare(outputDirectory);
  }
  async bundle(entryFile, outputDirectory, toolsPaths) {
    return this._bundle(this.getEntry(), entryFile, outputDirectory, toolsPaths);
  }
  getEntry() {
    return `
    // @ts-ignore
    import { evaluate } from '@mastra/core/eval';
    import { AvailableHooks, registerHook } from '@mastra/core/hooks';
    import { TABLE_EVALS } from '@mastra/core/storage';
    import { checkEvalStorageFields } from '@mastra/core/utils';
    import { mastra } from '#mastra';
    import { createNodeServer } from '#server';
    // @ts-ignore
    await createNodeServer(mastra);

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

    if (mastra.getStorage()) {
      // start storage init in the background
      mastra.getStorage().init();
    }

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
    `;
  }
  async lint(entryFile, outputDirectory, toolsPaths) {
    await super.lint(entryFile, outputDirectory, toolsPaths);
  }
};
async function build({
  dir: dir2,
  tools,
  root,
  env
}) {
  const rootDir = root || process.cwd();
  const mastraDir = dir2 ? dir2.startsWith("/") ? dir2 : join(rootDir, dir2) : join(rootDir, "src", "mastra");
  const outputDirectory = join(rootDir, ".mastra");
  const defaultToolsPath = join(mastraDir, "tools/**/*.{js,ts}");
  const discoveredTools = [defaultToolsPath, ...tools ?? []];
  try {
    const fs2 = new FileService();
    const mastraEntryFile = fs2.getFirstExistingFile([join(mastraDir, "index.ts"), join(mastraDir, "index.js")]);
    const platformDeployer = await getDeployer(mastraEntryFile, outputDirectory);
    if (!platformDeployer) {
      const deployer = new BuildBundler(env);
      deployer.__setLogger(logger);
      await deployer.prepare(outputDirectory);
      await deployer.bundle(mastraEntryFile, outputDirectory, discoveredTools);
      logger.info(`Build successful, you can now deploy the .mastra/output directory to your target platform.`);
      logger.info(
        `To start the server, run: node --import=./.mastra/output/instrumentation.mjs .mastra/output/index.mjs`
      );
      return;
    }
    logger.info("Deployer found, preparing deployer build...");
    platformDeployer.__setLogger(logger);
    await platformDeployer.prepare(outputDirectory);
    await platformDeployer.bundle(mastraEntryFile, outputDirectory, discoveredTools);
    logger.info("You can now deploy the .mastra/output directory to your target platform.");
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Mastra Build failed`, { error });
    }
    process.exit(1);
  }
}
async function deploy({ dir: dir2 }) {
  let mastraDir = dir2 || join(process.cwd(), "src/mastra");
  try {
    const outputDirectory = join(process.cwd(), ".mastra");
    const fs2 = new FileService();
    const mastraEntryFile = fs2.getFirstExistingFile([join(mastraDir, "index.ts"), join(mastraDir, "index.js")]);
    const deployer = await getDeployer(mastraEntryFile, outputDirectory);
    if (!deployer) {
      logger.warn("No deployer found.");
      return;
    }
    try {
      await deployer.prepare(outputDirectory);
      await deployer.bundle(mastraEntryFile, outputDirectory, []);
      try {
        await deployer.deploy(outputDirectory);
      } catch (error) {
        console.error("[Mastra Deploy] - Error deploying:", error);
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.debug(`error: ${err.message}`, { error: err });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.debug(`error: ${error.message}`, { error });
    }
    logger.warn("No deployer found.");
  }
}
var DevBundler = class extends Bundler {
  customEnvFile;
  constructor(customEnvFile) {
    super("Dev");
    this.customEnvFile = customEnvFile;
  }
  getEnvFiles() {
    const possibleFiles = [".env.development", ".env.local", ".env"];
    if (this.customEnvFile) {
      possibleFiles.unshift(this.customEnvFile);
    }
    try {
      const fileService = new FileService$1();
      const envFile = fileService.getFirstExistingFile(possibleFiles);
      return Promise.resolve([envFile]);
    } catch {
    }
    return Promise.resolve([]);
  }
  async prepare(outputDirectory) {
    await super.prepare(outputDirectory);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const playgroundServePath = join(outputDirectory, this.outputDir, "playground");
    await fsExtra.copy(join(dirname(__dirname), "src/playground/dist"), playgroundServePath, {
      overwrite: true
    });
  }
  async watch(entryFile, outputDirectory, toolsPaths) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const envFiles = await this.getEnvFiles();
    const inputOptions = await getWatcherInputOptions(entryFile, "node", {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
    });
    const toolsInputOptions = await this.getToolsInputOptions(toolsPaths);
    const outputDir = join(outputDirectory, this.outputDir);
    await writeTelemetryConfig(entryFile, outputDir);
    await this.writeInstrumentationFile(outputDir);
    await this.writePackageJson(outputDir, /* @__PURE__ */ new Map(), {});
    this.logger.info("Installing dependencies");
    await this.installDependencies(outputDirectory);
    this.logger.info("Done installing dependencies");
    const copyPublic = this.copyPublic.bind(this);
    const watcher = await createWatcher(
      {
        ...inputOptions,
        logLevel: inputOptions.logLevel === "silent" ? "warn" : inputOptions.logLevel,
        onwarn: (warning) => {
          if (warning.code === "CIRCULAR_DEPENDENCY") {
            if (warning.ids?.[0]?.includes("node_modules")) {
              return;
            }
            this.logger.warn(`Circular dependency found:
	${warning.message.replace("Circular dependency: ", "")}`);
          }
        },
        plugins: [
          // @ts-ignore - types are good
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          ...inputOptions.plugins,
          {
            name: "env-watcher",
            buildStart() {
              for (const envFile of envFiles) {
                this.addWatchFile(envFile);
              }
            }
          },
          {
            name: "public-dir-watcher",
            buildStart() {
              this.addWatchFile(join(dirname(entryFile), "public"));
            },
            buildEnd() {
              return copyPublic(dirname(entryFile), outputDirectory);
            }
          },
          {
            name: "tools-watcher",
            async buildEnd() {
              const toolsInputPaths = Array.from(Object.keys(toolsInputOptions || {})).filter((key) => key.startsWith("tools/")).map((key) => `./${key}.mjs`);
              await writeFile(join(outputDir, "tools.mjs"), `export const tools = ${JSON.stringify(toolsInputPaths)};`);
            }
          }
        ],
        input: {
          index: join(__dirname, "templates", "dev.entry.js"),
          ...toolsInputOptions
        }
      },
      {
        dir: outputDir,
        sourcemap: true
      }
    );
    this.logger.info("Starting watcher...");
    return new Promise((resolve, reject) => {
      const cb = (event) => {
        if (event.code === "BUNDLE_END") {
          this.logger.info("Bundling finished, starting server...");
          watcher.off("event", cb);
          resolve(watcher);
        }
        if (event.code === "ERROR") {
          console.log(event);
          this.logger.error("Bundling failed, stopping watcher...");
          watcher.off("event", cb);
          reject(event);
        }
      };
      watcher.on("event", cb);
    });
  }
  async bundle() {
  }
};

// src/commands/dev/dev.ts
var currentServerProcess;
var isRestarting = false;
var ON_ERROR_MAX_RESTARTS = 3;
var startServer = async (dotMastraPath, port, env, errorRestartCount = 0) => {
  let serverIsReady = false;
  try {
    logger.info("[Mastra Dev] - Starting server...");
    const commands = [];
    if (!isWebContainer()) {
      const instrumentation = import.meta.resolve("@opentelemetry/instrumentation/hook.mjs");
      commands.push("--import=./instrumentation.mjs", `--import=${instrumentation}`);
    }
    commands.push("index.mjs");
    currentServerProcess = execa("node", commands, {
      cwd: dotMastraPath,
      env: {
        NODE_ENV: "production",
        ...Object.fromEntries(env),
        MASTRA_DEV: "true",
        PORT: port.toString(),
        MASTRA_DEFAULT_STORAGE_URL: `file:${join(dotMastraPath, "..", "mastra.db")}`
      },
      stdio: ["inherit", "inherit", "inherit", "ipc"],
      reject: false
    });
    if (currentServerProcess?.exitCode && currentServerProcess?.exitCode !== 0) {
      if (!currentServerProcess) {
        throw new Error(`Server failed to start`);
      }
      throw new Error(
        `Server failed to start with error: ${currentServerProcess.stderr || currentServerProcess.stdout}`
      );
    }
    currentServerProcess.on("message", async (message) => {
      if (message?.type === "server-ready") {
        serverIsReady = true;
        try {
          await fetch(`http://localhost:${port}/__refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            }
          });
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          try {
            await fetch(`http://localhost:${port}/__refresh`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              }
            });
          } catch {
          }
        }
      }
    });
  } catch (err) {
    const execaError = err;
    if (execaError.stderr) logger.error("Server error output:", { stderr: execaError.stderr });
    if (execaError.stdout) logger.debug("Server output:", { stdout: execaError.stdout });
    if (!serverIsReady) {
      throw err;
    }
    setTimeout(() => {
      if (!isRestarting) {
        errorRestartCount++;
        if (errorRestartCount > ON_ERROR_MAX_RESTARTS) {
          logger.error(`Server failed to start after ${ON_ERROR_MAX_RESTARTS} error attempts. Giving up.`);
          process.exit(1);
        }
        logger.error(
          `Attempting to restart server after error... (Attempt ${errorRestartCount}/${ON_ERROR_MAX_RESTARTS})`
        );
        startServer(dotMastraPath, port, env, errorRestartCount);
      }
    }, 1e3);
  }
};
async function rebundleAndRestart(dotMastraPath, port, bundler) {
  if (isRestarting) {
    return;
  }
  isRestarting = true;
  try {
    if (currentServerProcess) {
      logger.debug("Stopping current server...");
      currentServerProcess.kill("SIGINT");
    }
    const env = await bundler.loadEnvVars();
    await startServer(join(dotMastraPath, "output"), port, env);
  } finally {
    isRestarting = false;
  }
}
async function dev({
  port,
  dir: dir2,
  root,
  tools,
  env
}) {
  const rootDir = root || process.cwd();
  const mastraDir = dir2 ? dir2.startsWith("/") ? dir2 : join(process.cwd(), dir2) : join(process.cwd(), "src", "mastra");
  const dotMastraPath = join(rootDir, ".mastra");
  const defaultToolsPath = join(mastraDir, "tools/**/*.{js,ts}");
  const discoveredTools = [defaultToolsPath, ...tools || []];
  const fileService = new FileService$1();
  const entryFile = fileService.getFirstExistingFile([join(mastraDir, "index.ts"), join(mastraDir, "index.js")]);
  const bundler = new DevBundler(env);
  bundler.__setLogger(logger);
  await bundler.prepare(dotMastraPath);
  const watcher = await bundler.watch(entryFile, dotMastraPath, discoveredTools);
  const loadedEnv = await bundler.loadEnvVars();
  const serverOptions = await getServerOptions(entryFile, join(dotMastraPath, "output"));
  let portToUse = port ?? serverOptions?.port ?? process.env.PORT;
  if (!portToUse || isNaN(Number(portToUse))) {
    const portList = Array.from({ length: 21 }, (_, i) => 4111 + i);
    portToUse = String(
      await getPort({
        port: portList
      })
    );
  }
  await startServer(join(dotMastraPath, "output"), Number(portToUse), loadedEnv);
  watcher.on("event", (event) => {
    if (event.code === "BUNDLE_END") {
      logger.info("[Mastra Dev] - Bundling finished, restarting server...");
      rebundleAndRestart(dotMastraPath, Number(portToUse), bundler);
    }
  });
  process.on("SIGINT", () => {
    logger.info("[Mastra Dev] - Stopping server...");
    if (currentServerProcess) {
      currentServerProcess.kill();
    }
    watcher.close().catch(() => {
    }).finally(() => {
      process.exit(0);
    });
  });
}

// src/commands/lint/rules/mastraCoreRule.ts
var mastraCoreRule = {
  name: "mastra-core",
  description: "Checks if @mastra/core is installed",
  async run(context) {
    const hasCore = context.mastraPackages.some((pkg) => pkg.name === "@mastra/core");
    if (!hasCore) {
      logger.error("@mastra/core is not installed. This package is required for Mastra to work properly.");
      return false;
    }
    return true;
  }
};
function readNextConfig(dir) {
  const nextConfigPath = join(dir, "next.config.js");
  try {
    const nextConfigContent = readFileSync(nextConfigPath, "utf-8");
    const configMatch = nextConfigContent.match(/const nextConfig = ({[\s\S]*?});/);
    if (!configMatch?.[1]) {
      return null;
    }
    const configStr = configMatch[1].replace(/\n/g, "").replace(/\s+/g, " ");
    return eval(`(${configStr})`);
  } catch {
    return null;
  }
}
function isNextJsProject(dir2) {
  const nextConfigPath2 = join(dir2, "next.config.js");
  try {
    readFileSync(nextConfigPath2, "utf-8");
    return true;
  } catch {
    return false;
  }
}
var nextConfigRule = {
  name: "next-config",
  description: "Checks if Next.js config is properly configured for Mastra packages",
  async run(context) {
    if (!isNextJsProject(context.rootDir)) {
      return true;
    }
    const nextConfig = readNextConfig(context.rootDir);
    if (!nextConfig) {
      return false;
    }
    const serverExternals = nextConfig.serverExternalPackages || [];
    const hasMastraExternals = serverExternals.some(
      (pkg) => pkg === "@mastra/*" || pkg === "@mastra/core" || pkg.startsWith("@mastra/")
    );
    if (!hasMastraExternals) {
      logger.error("next.config.js is missing Mastra packages in serverExternalPackages");
      logger.error("Please add the following to your next.config.js:");
      logger.error('  serverExternalPackages: ["@mastra/*"],');
      return false;
    }
    logger.info("Next.js config is properly configured for Mastra packages");
    return true;
  }
};
function readTsConfig(dir2) {
  const tsConfigPath = join(dir2, "tsconfig.json");
  try {
    const tsConfigContent = readFileSync(tsConfigPath, "utf-8");
    const cleanTsConfigContent = stripJsonComments(tsConfigContent);
    return JSON.parse(cleanTsConfigContent);
  } catch {
    return null;
  }
}
var tsConfigRule = {
  name: "ts-config",
  description: "Checks if TypeScript config is properly configured for Mastra packages",
  async run(context) {
    const tsConfig = readTsConfig(context.rootDir);
    if (!tsConfig) {
      logger.warn("No tsconfig.json found. This might cause issues with Mastra packages.");
      return true;
    }
    const { module, moduleResolution } = tsConfig.compilerOptions || {};
    const isValidConfig = moduleResolution === "bundler" || module === "CommonJS";
    if (!isValidConfig) {
      logger.error("tsconfig.json has invalid configuration");
      logger.error("Please set either:");
      logger.error('  "compilerOptions": {');
      logger.error('    "moduleResolution": "bundler"');
      logger.error("  }");
      logger.error("or");
      logger.error('  "compilerOptions": {');
      logger.error('    "module": "CommonJS"');
      logger.error("  }");
      logger.error("For the recommended TypeScript configuration, see:");
      logger.error("https://mastra.ai/en/docs/getting-started/installation#initialize-typescript");
      return false;
    }
    logger.info("TypeScript config is properly configured for Mastra packages");
    return true;
  }
};

// src/commands/lint/rules/index.ts
var rules = [nextConfigRule, tsConfigRule, mastraCoreRule];

// src/commands/lint/index.ts
function readPackageJson(dir2) {
  const packageJsonPath = join(dir2, "package.json");
  try {
    const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
    return JSON.parse(packageJsonContent);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to read package.json: ${error.message}`);
    }
    throw error;
  }
}
function getMastraPackages(packageJson) {
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  const mastraPackages = Object.entries(allDependencies).filter(
    ([name]) => name.startsWith("@mastra/") || name === "mastra"
  );
  return mastraPackages.map(([name, version2]) => ({
    name,
    version: version2,
    isAlpha: version2.includes("alpha")
  }));
}
async function lint({ dir: dir2, root, tools }) {
  try {
    const rootDir = root || process.cwd();
    const mastraDir = dir2 ? dir2.startsWith("/") ? dir2 : join(process.cwd(), dir2) : join(process.cwd(), "src", "mastra");
    const outputDirectory = join(rootDir, ".mastra");
    const defaultToolsPath = join(mastraDir, "tools");
    const discoveredTools = [defaultToolsPath, ...tools ?? []];
    const packageJson = readPackageJson(rootDir);
    const mastraPackages = getMastraPackages(packageJson);
    const context = {
      rootDir,
      mastraDir,
      outputDirectory,
      discoveredTools,
      packageJson,
      mastraPackages
    };
    const results = await Promise.all(rules.map((rule) => rule.run(context)));
    const allRulesPassed = results.every((result) => result);
    if (allRulesPassed) {
      const fileService = new FileService();
      const mastraEntryFile = fileService.getFirstExistingFile([
        join(mastraDir, "index.ts"),
        join(mastraDir, "index.js")
      ]);
      const platformDeployer = await getDeployer(mastraEntryFile, outputDirectory);
      if (!platformDeployer) {
        const deployer = new BuildBundler();
        await deployer.lint(mastraEntryFile, outputDirectory, discoveredTools);
      } else {
        await platformDeployer.lint(mastraEntryFile, outputDirectory, discoveredTools);
      }
    }
    return allRulesPassed;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Lint check failed: ${error.message}`);
    }
    return false;
  }
}
async function start(options = {}) {
  const outputDir = options.dir || ".mastra/output";
  const telemetry = options.telemetry ?? true;
  try {
    const outputPath = join(process.cwd(), outputDir);
    if (!fs.existsSync(outputPath)) {
      throw new Error(`Output directory ${outputPath} does not exist`);
    }
    const commands = [];
    if (telemetry && !isWebContainer()) {
      const instrumentation = "@opentelemetry/instrumentation/hook.mjs";
      commands.push("--import=./instrumentation.mjs", `--import=${instrumentation}`);
    }
    commands.push("index.mjs");
    const server = spawn("node", commands, {
      cwd: outputPath,
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "production"
      }
    });
    server.on("error", (err) => {
      logger.error(`Failed to start server: ${err.message}`);
      process.exit(1);
    });
    process.on("SIGINT", () => {
      server.kill("SIGINT");
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      server.kill("SIGTERM");
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Failed to start Mastra server: ${error.message}`);
    process.exit(1);
  }
}

// src/index.ts
var depsService = new DepsService();
var version = await depsService.getPackageVersion();
var analytics = new PosthogAnalytics({
  apiKey: "phc_SBLpZVAB6jmHOct9CABq3PF0Yn5FU3G2FgT4xUr2XrT",
  host: "https://us.posthog.com",
  version
});
var program = new Command();
var origin = process.env.MASTRA_ANALYTICS_ORIGIN;
program.version(`${version}`, "-v, --version").description(`Mastra CLI ${version}`).action(() => {
  try {
    analytics.trackCommand({
      command: "version",
      origin
    });
    console.log(`Mastra CLI: ${version}`);
  } catch {
  }
});
program.command("create [project-name]").description("Create a new Mastra project").option("--default", "Quick start with defaults(src, OpenAI, examples)").option("-c, --components <components>", "Comma-separated list of components (agents, tools, workflows)").option("-l, --llm <model-provider>", "Default model provider (openai, anthropic, groq, google, or cerebras))").option("-k, --llm-api-key <api-key>", "API key for the model provider").option("-e, --example", "Include example code").option("-n, --no-example", "Do not include example code").option("-t, --timeout [timeout]", "Configurable timeout for package installation, defaults to 60000 ms").option("-d, --dir <directory>", "Target directory for Mastra source code (default: src/)").option(
  "-p, --project-name <string>",
  "Project name that will be used in package.json and as the project directory name."
).option("-m, --mcp <editor>", "MCP Server for code editor (cursor, cursor-global, windsurf, vscode)").action(async (projectNameArg, args) => {
  const projectName = projectNameArg || args.projectName;
  await analytics.trackCommandExecution({
    command: "create",
    args: { ...args, projectName },
    execution: async () => {
      const timeout = args?.timeout ? args?.timeout === true ? 6e4 : parseInt(args?.timeout, 10) : void 0;
      if (args.default) {
        await create({
          components: ["agents", "tools", "workflows"],
          llmProvider: "openai",
          addExample: true,
          timeout,
          mcpServer: args.mcp
        });
        return;
      }
      await create({
        components: args.components ? args.components.split(",") : [],
        llmProvider: args.llm,
        addExample: args.example,
        llmApiKey: args["llm-api-key"],
        timeout,
        projectName,
        directory: args.dir,
        mcpServer: args.mcp
      });
    },
    origin
  });
});
program.command("init").description("Initialize Mastra in your project").option("--default", "Quick start with defaults(src, OpenAI, examples)").option("-d, --dir <directory>", "Directory for Mastra files to (defaults to src/)").option("-c, --components <components>", "Comma-separated list of components (agents, tools, workflows)").option("-l, --llm <model-provider>", "Default model provider (openai, anthropic, groq, google or cerebras))").option("-k, --llm-api-key <api-key>", "API key for the model provider").option("-e, --example", "Include example code").option("-n, --no-example", "Do not include example code").option("-m, --mcp <editor>", "MCP Server for code editor (cursor, cursor-global, windsurf, vscode)").action(async (args) => {
  await analytics.trackCommandExecution({
    command: "init",
    args,
    execution: async () => {
      await checkPkgJson();
      await checkAndInstallCoreDeps(args?.example || args?.default);
      if (!Object.keys(args).length) {
        const result = await interactivePrompt();
        await init({
          ...result,
          llmApiKey: result?.llmApiKey,
          components: ["agents", "tools", "workflows"],
          addExample: true
        });
        return;
      }
      if (args?.default) {
        await init({
          directory: "src/",
          components: ["agents", "tools", "workflows"],
          llmProvider: "openai",
          addExample: true,
          configureEditorWithDocsMCP: args.mcp
        });
        return;
      }
      const componentsArr = args.components ? args.components.split(",") : [];
      await init({
        directory: args.dir,
        components: componentsArr,
        llmProvider: args.llm,
        addExample: args.example,
        llmApiKey: args["llm-api-key"],
        configureEditorWithDocsMCP: args.mcp
      });
      return;
    },
    origin
  });
});
program.command("lint").description("Lint your Mastra project").option("-d, --dir <path>", "Path to your Mastra folder").option("-r, --root <path>", "Path to your root folder").option("-t, --tools <toolsDirs>", "Comma-separated list of paths to tool files to include").action(async (args) => {
  await analytics.trackCommandExecution({
    command: "lint",
    args,
    execution: async () => {
      await lint({ dir: args.dir, root: args.root, tools: args.tools ? args.tools.split(",") : [] });
    },
    origin
  });
});
program.command("dev").description("Start mastra server").option("-d, --dir <dir>", "Path to your mastra folder").option("-r, --root <root>", "Path to your root folder").option("-t, --tools <toolsDirs>", "Comma-separated list of paths to tool files to include").option("-p, --port <port>", "deprecated: Port number for the development server (defaults to 4111)").option("-e, --env <env>", "Custom env file to include in the dev server").action((args) => {
  analytics.trackCommand({
    command: "dev",
    origin
  });
  if (args?.port) {
    logger.warn("The --port option is deprecated. Use the server key in the Mastra instance instead.");
  }
  dev({
    port: args?.port ? parseInt(args.port) : null,
    dir: args?.dir,
    root: args?.root,
    tools: args?.tools ? args.tools.split(",") : [],
    env: args?.env
  }).catch((err) => {
    logger.error(err.message);
  });
});
program.command("build").description("Build your Mastra project").option("-d, --dir <path>", "Path to your Mastra Folder").option("-r, --root <path>", "Path to your root folder").option("-t, --tools <toolsDirs>", "Comma-separated list of paths to tool files to include").option("-e, --env <env>", "Custom env file to include in the build").action(async (args) => {
  await analytics.trackCommandExecution({
    command: "mastra build",
    args,
    execution: async () => {
      await build({
        dir: args?.dir,
        root: args?.root,
        tools: args?.tools ? args.tools.split(",") : [],
        env: args?.env
      });
    },
    origin
  });
});
program.command("deploy").description("Deploy your Mastra project").option("-d, --dir <path>", "Path to directory").action(async (args) => {
  config({ path: [".env", ".env.production"] });
  await analytics.trackCommandExecution({
    command: "mastra deploy",
    args,
    execution: async () => {
      logger.warn(`DEPRECATED: The deploy command is deprecated.
          Please use the mastra build command instead.
          Then deploy .mastra/output to your target platform.
          `);
      await deploy({ dir: args.dir });
    },
    origin
  });
});
program.command("start").description("Start your built Mastra application").option("-d, --dir <path>", "Path to your built Mastra output directory (default: .mastra/output)").option("-nt, --no-telemetry", "Disable telemetry on start").action(async (args) => {
  await analytics.trackCommandExecution({
    command: "start",
    args,
    execution: async () => {
      await start({
        dir: args.dir,
        telemetry: !args.noTelemetry
      });
    },
    origin
  });
});
program.parse(process.argv);
