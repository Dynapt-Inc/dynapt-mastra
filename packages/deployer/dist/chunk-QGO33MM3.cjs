'use strict';

var chunkIFU2DUSR_cjs = require('./chunk-IFU2DUSR.cjs');
var chunkF4JNMQTU_cjs = require('./chunk-F4JNMQTU.cjs');
var chunkIMGVLBV7_cjs = require('./chunk-IMGVLBV7.cjs');
var chunk7ICGDVC3_cjs = require('./chunk-7ICGDVC3.cjs');
var fs = require('fs');
var promises = require('fs/promises');
var path = require('path');
var url = require('url');
var bundler = require('@mastra/core/bundler');
var error = require('@mastra/core/error');
var virtual = require('@rollup/plugin-virtual');
var fsExtra = require('fs-extra/esm');
var globby = require('globby');
var resolveFrom = require('resolve-from');
var slugify = require('@sindresorhus/slugify');
var findWorkspaces = require('find-workspaces');
var fsExtra$1 = require('fs-extra');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var virtual__default = /*#__PURE__*/_interopDefault(virtual);
var fsExtra__default = /*#__PURE__*/_interopDefault(fsExtra);
var resolveFrom__default = /*#__PURE__*/_interopDefault(resolveFrom);
var slugify__default = /*#__PURE__*/_interopDefault(slugify);

var createWorkspacePackageMap = async () => {
  const workspaces = await findWorkspaces.findWorkspaces();
  const workspaceMap = new Map(
    workspaces?.map((workspace) => [
      workspace.package.name,
      {
        location: workspace.location,
        dependencies: workspace.package.dependencies,
        version: workspace.package.version
      }
    ]) ?? []
  );
  return workspaceMap;
};
var collectTransitiveWorkspaceDependencies = ({
  workspaceMap,
  initialDependencies,
  logger
}) => {
  const usedWorkspacePackages = /* @__PURE__ */ new Set();
  const queue = Array.from(initialDependencies);
  const resolutions = {};
  while (queue.length > 0) {
    const len = queue.length;
    for (let i = 0; i < len; i += 1) {
      const pkgName = queue.shift();
      if (!pkgName || usedWorkspacePackages.has(pkgName)) {
        continue;
      }
      const dep = workspaceMap.get(pkgName);
      if (!dep) continue;
      const root = findWorkspaces.findWorkspacesRoot();
      if (!root) {
        throw new Error("Could not find workspace root");
      }
      const depsService = new chunk7ICGDVC3_cjs.DepsService(root.location);
      depsService.__setLogger(logger);
      const sanitizedName = slugify__default.default(pkgName);
      const tgzPath = depsService.getWorkspaceDependencyPath({
        pkgName: sanitizedName,
        version: dep.version
      });
      resolutions[pkgName] = tgzPath;
      usedWorkspacePackages.add(pkgName);
      for (const [depName, _depVersion] of Object.entries(dep?.dependencies ?? {})) {
        if (!usedWorkspacePackages.has(depName) && workspaceMap.has(depName)) {
          queue.push(depName);
        }
      }
    }
  }
  return { resolutions, usedWorkspacePackages };
};
var packWorkspaceDependencies = async ({
  workspaceMap,
  usedWorkspacePackages,
  bundleOutputDir,
  logger
}) => {
  const root = findWorkspaces.findWorkspacesRoot();
  if (!root) {
    throw new Error("Could not find workspace root");
  }
  const depsService = new chunk7ICGDVC3_cjs.DepsService(root.location);
  depsService.__setLogger(logger);
  if (usedWorkspacePackages.size > 0) {
    const workspaceDirPath = path.join(bundleOutputDir, "workspace-module");
    await fsExtra$1.ensureDir(workspaceDirPath);
    logger.info(`Packaging ${usedWorkspacePackages.size} workspace dependencies...`);
    const batchSize = 5;
    const packages = Array.from(usedWorkspacePackages.values());
    for (let i = 0; i < packages.length; i += batchSize) {
      const batch = packages.slice(i, i + batchSize);
      logger.info(
        `Packaging batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(packages.length / batchSize)}: ${batch.join(", ")}`
      );
      await Promise.all(
        batch.map(async (pkgName) => {
          const dep = workspaceMap.get(pkgName);
          if (!dep) return;
          await depsService.pack({ dir: dep.location, destination: workspaceDirPath });
        })
      );
    }
    logger.info(`Successfully packaged ${usedWorkspacePackages.size} workspace dependencies`);
  }
};

// src/bundler/index.ts
var Bundler = class extends bundler.MastraBundler {
  analyzeOutputDir = ".build";
  outputDir = "output";
  constructor(name, component = "BUNDLER") {
    super({ name, component });
  }
  async prepare(outputDirectory) {
    await fsExtra.emptyDir(outputDirectory);
    await fsExtra.ensureDir(path.join(outputDirectory, this.analyzeOutputDir));
    await fsExtra.ensureDir(path.join(outputDirectory, this.outputDir));
  }
  async writeInstrumentationFile(outputDirectory) {
    const instrumentationFile = path.join(outputDirectory, "instrumentation.mjs");
    const __dirname = path.dirname(url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('chunk-QGO33MM3.cjs', document.baseURI).href))));
    await fsExtra.copy(path.join(__dirname, "templates", "instrumentation-template.js"), instrumentationFile);
  }
  async writePackageJson(outputDirectory, dependencies, resolutions) {
    this.logger.debug(`Writing project's package.json`);
    await fsExtra.ensureDir(outputDirectory);
    const pkgPath = path.join(outputDirectory, "package.json");
    const dependenciesMap = /* @__PURE__ */ new Map();
    for (const [key, value] of dependencies.entries()) {
      if (key.startsWith("@")) {
        const pkgChunks = key.split("/");
        dependenciesMap.set(`${pkgChunks[0]}/${pkgChunks[1]}`, value);
      } else {
        const pkgName = key.split("/")[0] || key;
        dependenciesMap.set(pkgName, value);
      }
    }
    dependenciesMap.set("@opentelemetry/core", "^2.0.1");
    dependenciesMap.set("@opentelemetry/auto-instrumentations-node", "^0.59.0");
    dependenciesMap.set("@opentelemetry/exporter-trace-otlp-grpc", "^0.201.0");
    dependenciesMap.set("@opentelemetry/exporter-trace-otlp-http", "^0.201.0");
    dependenciesMap.set("@opentelemetry/resources", "^2.0.1");
    dependenciesMap.set("@opentelemetry/sdk-node", "^0.201.0");
    dependenciesMap.set("@opentelemetry/sdk-trace-base", "^2.0.1");
    dependenciesMap.set("@opentelemetry/semantic-conventions", "^1.33.0");
    dependenciesMap.set("@opentelemetry/instrumentation", "^0.202.0");
    await promises.writeFile(
      pkgPath,
      JSON.stringify(
        {
          name: "server",
          version: "1.0.0",
          description: "",
          type: "module",
          main: "index.mjs",
          scripts: {
            start: "node --import=./instrumentation.mjs --import=@opentelemetry/instrumentation/hook.mjs ./index.mjs"
          },
          author: "Mastra",
          license: "ISC",
          dependencies: Object.fromEntries(dependenciesMap.entries()),
          ...Object.keys(resolutions ?? {}).length > 0 && { resolutions },
          pnpm: {
            neverBuiltDependencies: []
          }
        },
        null,
        2
      )
    );
  }
  createBundler(inputOptions, outputOptions) {
    return chunkIMGVLBV7_cjs.createBundler(inputOptions, outputOptions);
  }
  async analyze(entry, mastraFile, outputDirectory) {
    return await chunkF4JNMQTU_cjs.analyzeBundle(
      [].concat(entry),
      mastraFile,
      path.join(outputDirectory, this.analyzeOutputDir),
      "node",
      this.logger
    );
  }
  async installDependencies(outputDirectory, rootDir = process.cwd()) {
    const deps = new chunk7ICGDVC3_cjs.DepsService(rootDir);
    deps.__setLogger(this.logger);
    await deps.install({ dir: path.join(outputDirectory, this.outputDir) });
  }
  async copyPublic(mastraDir, outputDirectory) {
    const publicDir = path.join(mastraDir, "public");
    try {
      await promises.stat(publicDir);
    } catch {
      return;
    }
    await fsExtra.copy(publicDir, path.join(outputDirectory, this.outputDir));
  }
  async getBundlerOptions(serverFile, mastraEntryFile, analyzedBundleInfo, toolsPaths) {
    const inputOptions = await chunkIMGVLBV7_cjs.getInputOptions(mastraEntryFile, analyzedBundleInfo, "node", {
      "process.env.NODE_ENV": JSON.stringify("production")
    });
    const isVirtual = serverFile.includes("\n") || fs.existsSync(serverFile);
    const toolsInputOptions = await this.getToolsInputOptions(toolsPaths);
    if (isVirtual) {
      inputOptions.input = { index: "#entry", ...toolsInputOptions };
      if (Array.isArray(inputOptions.plugins)) {
        inputOptions.plugins.unshift(virtual__default.default({ "#entry": serverFile }));
      } else {
        inputOptions.plugins = [virtual__default.default({ "#entry": serverFile })];
      }
    } else {
      inputOptions.input = { index: serverFile, ...toolsInputOptions };
    }
    return inputOptions;
  }
  async getToolsInputOptions(toolsPaths) {
    const inputs = {};
    for (const toolPath of toolsPaths) {
      const expandedPaths = await globby.globby(toolPath, {});
      for (const path$1 of expandedPaths) {
        if (await fsExtra__default.default.pathExists(path$1)) {
          const fileService = new chunk7ICGDVC3_cjs.FileService();
          const entryFile = fileService.getFirstExistingFile([
            path.join(path$1, "index.ts"),
            path.join(path$1, "index.js"),
            path$1
            // if path itself is a file
          ]);
          if (!entryFile || (await promises.stat(entryFile)).isDirectory()) {
            this.logger.warn(`No entry file found in ${path$1}, skipping...`);
            continue;
          }
          const uniqueToolID = crypto.randomUUID();
          inputs[`tools/${uniqueToolID}`] = entryFile;
        } else {
          this.logger.warn(`Tool path ${path$1} does not exist, skipping...`);
        }
      }
    }
    return inputs;
  }
  async _bundle(serverFile, mastraEntryFile, outputDirectory, toolsPaths = [], bundleLocation = path.join(outputDirectory, this.outputDir)) {
    this.logger.info("Start bundling Mastra");
    let analyzedBundleInfo;
    try {
      const resolvedToolsPaths = await this.getToolsInputOptions(toolsPaths);
      analyzedBundleInfo = await chunkF4JNMQTU_cjs.analyzeBundle(
        [serverFile, ...Object.values(resolvedToolsPaths)],
        mastraEntryFile,
        path.join(outputDirectory, this.analyzeOutputDir),
        "node",
        this.logger
      );
    } catch (error$1) {
      const message = error$1 instanceof Error ? error$1.message : String(error$1);
      throw new error.MastraError(
        {
          id: "DEPLOYER_BUNDLER_ANALYZE_FAILED",
          text: `Failed to analyze Mastra application: ${message}`,
          domain: error.ErrorDomain.DEPLOYER,
          category: error.ErrorCategory.SYSTEM
        },
        error$1
      );
    }
    let externalDependencies;
    try {
      const result = await chunkIFU2DUSR_cjs.writeTelemetryConfig(mastraEntryFile, path.join(outputDirectory, this.outputDir));
      externalDependencies = result.externalDependencies;
    } catch (error$1) {
      const message = error$1 instanceof Error ? error$1.message : String(error$1);
      throw new error.MastraError(
        {
          id: "DEPLOYER_BUNDLER_TELEMETRY_FAILED",
          text: `Failed to write telemetry config: ${message}`,
          domain: error.ErrorDomain.DEPLOYER,
          category: error.ErrorCategory.SYSTEM
        },
        error$1
      );
    }
    const dependenciesToInstall = /* @__PURE__ */ new Map();
    for (const external of externalDependencies) {
      dependenciesToInstall.set(external, "latest");
    }
    const workspaceMap = await createWorkspacePackageMap();
    const workspaceDependencies = /* @__PURE__ */ new Set();
    for (const dep of analyzedBundleInfo.externalDependencies) {
      try {
        const pkgPath = resolveFrom__default.default(mastraEntryFile, `${dep}/package.json`);
        const pkg = await fsExtra.readJSON(pkgPath);
        if (workspaceMap.has(pkg.name)) {
          workspaceDependencies.add(pkg.name);
          continue;
        }
        dependenciesToInstall.set(dep, pkg.version);
      } catch {
        dependenciesToInstall.set(dep, "latest");
      }
    }
    let resolutions = {};
    if (workspaceDependencies.size > 0) {
      try {
        const result = collectTransitiveWorkspaceDependencies({
          workspaceMap,
          initialDependencies: workspaceDependencies,
          logger: this.logger
        });
        resolutions = result.resolutions;
        Object.entries(resolutions).forEach(([pkgName, tgzPath]) => {
          dependenciesToInstall.set(pkgName, tgzPath);
        });
        await packWorkspaceDependencies({
          workspaceMap,
          usedWorkspacePackages: result.usedWorkspacePackages,
          bundleOutputDir: path.join(outputDirectory, this.outputDir),
          logger: this.logger
        });
      } catch (error$1) {
        throw new error.MastraError(
          {
            id: "DEPLOYER_BUNDLER_WORKSPACE_DEPS_FAILED",
            text: `Failed to collect and pack workspace dependencies.`,
            domain: error.ErrorDomain.DEPLOYER,
            category: error.ErrorCategory.USER
          },
          error$1
        );
      }
    }
    try {
      await this.writePackageJson(path.join(outputDirectory, this.outputDir), dependenciesToInstall, resolutions);
      await this.writeInstrumentationFile(path.join(outputDirectory, this.outputDir));
      this.logger.info("Bundling Mastra application");
      const inputOptions = await this.getBundlerOptions(
        serverFile,
        mastraEntryFile,
        analyzedBundleInfo,
        toolsPaths
      );
      const bundler = await this.createBundler(
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
          }
        },
        {
          dir: bundleLocation,
          manualChunks: {
            mastra: ["#mastra"]
          }
        }
      );
      await bundler.write();
      const toolsInputOptions = Array.from(Object.keys(inputOptions.input || {})).filter((key) => key.startsWith("tools/")).map((key) => `./${key}.mjs`);
      await promises.writeFile(path.join(bundleLocation, "tools.mjs"), `export const tools = ${JSON.stringify(toolsInputOptions)};`);
      this.logger.info("Bundling Mastra done");
      this.logger.info("Copying public files");
      await this.copyPublic(path.dirname(mastraEntryFile), outputDirectory);
      this.logger.info("Done copying public files");
      this.logger.info("Installing dependencies");
      await this.installDependencies(outputDirectory);
      this.logger.info("Done installing dependencies");
    } catch (error$1) {
      const message = error$1 instanceof Error ? error$1.message : String(error$1);
      throw new error.MastraError(
        {
          id: "DEPLOYER_BUNDLER_BUNDLE_STAGE_FAILED",
          text: `Failed during bundler bundle stage: ${message}`,
          domain: error.ErrorDomain.DEPLOYER,
          category: error.ErrorCategory.SYSTEM
        },
        error$1
      );
    }
  }
  async lint(_entryFile, _outputDirectory, toolsPaths) {
    const toolsInputOptions = await this.getToolsInputOptions(toolsPaths);
    const toolsLength = Object.keys(toolsInputOptions).length;
    if (toolsLength > 0) {
      this.logger.info(`Found ${toolsLength} ${toolsLength === 1 ? "tool" : "tools"}`);
    }
  }
};

exports.Bundler = Bundler;
