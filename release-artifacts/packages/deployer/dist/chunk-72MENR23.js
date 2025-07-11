import { writeTelemetryConfig } from './chunk-KJINZD6K.js';
import { analyzeBundle } from './chunk-J2V6UIZO.js';
import { createBundler, getInputOptions } from './chunk-HHOCIHND.js';
import { DepsService, FileService } from './chunk-4VKGIENI.js';
import { existsSync } from 'fs';
import { writeFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MastraBundler } from '@mastra/core/bundler';
import { MastraError, ErrorCategory, ErrorDomain } from '@mastra/core/error';
import virtual from '@rollup/plugin-virtual';
import fsExtra, { emptyDir, ensureDir, copy, readJSON } from 'fs-extra/esm';
import { globby } from 'globby';
import resolveFrom from 'resolve-from';
import slugify from '@sindresorhus/slugify';
import { findWorkspaces, findWorkspacesRoot } from 'find-workspaces';
import { ensureDir as ensureDir$1 } from 'fs-extra';

var createWorkspacePackageMap = async () => {
  const workspaces = await findWorkspaces();
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
      const root = findWorkspacesRoot();
      if (!root) {
        throw new Error("Could not find workspace root");
      }
      const depsService = new DepsService(root.location);
      depsService.__setLogger(logger);
      const sanitizedName = slugify(pkgName);
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
  const root = findWorkspacesRoot();
  if (!root) {
    throw new Error("Could not find workspace root");
  }
  const depsService = new DepsService(root.location);
  depsService.__setLogger(logger);
  if (usedWorkspacePackages.size > 0) {
    const workspaceDirPath = join(bundleOutputDir, "workspace-module");
    await ensureDir$1(workspaceDirPath);
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
var Bundler = class extends MastraBundler {
  analyzeOutputDir = ".build";
  outputDir = "output";
  constructor(name, component = "BUNDLER") {
    super({ name, component });
  }
  async prepare(outputDirectory) {
    await emptyDir(outputDirectory);
    await ensureDir(join(outputDirectory, this.analyzeOutputDir));
    await ensureDir(join(outputDirectory, this.outputDir));
  }
  async writeInstrumentationFile(outputDirectory) {
    const instrumentationFile = join(outputDirectory, "instrumentation.mjs");
    const __dirname = dirname(fileURLToPath(import.meta.url));
    await copy(join(__dirname, "templates", "instrumentation-template.js"), instrumentationFile);
  }
  async writePackageJson(outputDirectory, dependencies, resolutions) {
    this.logger.debug(`Writing project's package.json`);
    await ensureDir(outputDirectory);
    const pkgPath = join(outputDirectory, "package.json");
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
    await writeFile(
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
    return createBundler(inputOptions, outputOptions);
  }
  async analyze(entry, mastraFile, outputDirectory) {
    return await analyzeBundle(
      [].concat(entry),
      mastraFile,
      join(outputDirectory, this.analyzeOutputDir),
      "node",
      this.logger
    );
  }
  async installDependencies(outputDirectory, rootDir = process.cwd()) {
    const deps = new DepsService(rootDir);
    deps.__setLogger(this.logger);
    await deps.install({ dir: join(outputDirectory, this.outputDir) });
  }
  async copyPublic(mastraDir, outputDirectory) {
    const publicDir = join(mastraDir, "public");
    try {
      await stat(publicDir);
    } catch {
      return;
    }
    await copy(publicDir, join(outputDirectory, this.outputDir));
  }
  async getBundlerOptions(serverFile, mastraEntryFile, analyzedBundleInfo, toolsPaths) {
    const inputOptions = await getInputOptions(mastraEntryFile, analyzedBundleInfo, "node", {
      "process.env.NODE_ENV": JSON.stringify("production")
    });
    const isVirtual = serverFile.includes("\n") || existsSync(serverFile);
    const toolsInputOptions = await this.getToolsInputOptions(toolsPaths);
    if (isVirtual) {
      inputOptions.input = { index: "#entry", ...toolsInputOptions };
      if (Array.isArray(inputOptions.plugins)) {
        inputOptions.plugins.unshift(virtual({ "#entry": serverFile }));
      } else {
        inputOptions.plugins = [virtual({ "#entry": serverFile })];
      }
    } else {
      inputOptions.input = { index: serverFile, ...toolsInputOptions };
    }
    return inputOptions;
  }
  async getToolsInputOptions(toolsPaths) {
    const inputs = {};
    for (const toolPath of toolsPaths) {
      const expandedPaths = await globby(toolPath, {});
      for (const path of expandedPaths) {
        if (await fsExtra.pathExists(path)) {
          const fileService = new FileService();
          const entryFile = fileService.getFirstExistingFile([
            join(path, "index.ts"),
            join(path, "index.js"),
            path
            // if path itself is a file
          ]);
          if (!entryFile || (await stat(entryFile)).isDirectory()) {
            this.logger.warn(`No entry file found in ${path}, skipping...`);
            continue;
          }
          const uniqueToolID = crypto.randomUUID();
          inputs[`tools/${uniqueToolID}`] = entryFile;
        } else {
          this.logger.warn(`Tool path ${path} does not exist, skipping...`);
        }
      }
    }
    return inputs;
  }
  async _bundle(serverFile, mastraEntryFile, outputDirectory, toolsPaths = [], bundleLocation = join(outputDirectory, this.outputDir)) {
    this.logger.info("Start bundling Mastra");
    let analyzedBundleInfo;
    try {
      const resolvedToolsPaths = await this.getToolsInputOptions(toolsPaths);
      analyzedBundleInfo = await analyzeBundle(
        [serverFile, ...Object.values(resolvedToolsPaths)],
        mastraEntryFile,
        join(outputDirectory, this.analyzeOutputDir),
        "node",
        this.logger
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new MastraError(
        {
          id: "DEPLOYER_BUNDLER_ANALYZE_FAILED",
          text: `Failed to analyze Mastra application: ${message}`,
          domain: ErrorDomain.DEPLOYER,
          category: ErrorCategory.SYSTEM
        },
        error
      );
    }
    let externalDependencies;
    try {
      const result = await writeTelemetryConfig(mastraEntryFile, join(outputDirectory, this.outputDir));
      externalDependencies = result.externalDependencies;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new MastraError(
        {
          id: "DEPLOYER_BUNDLER_TELEMETRY_FAILED",
          text: `Failed to write telemetry config: ${message}`,
          domain: ErrorDomain.DEPLOYER,
          category: ErrorCategory.SYSTEM
        },
        error
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
        const pkgPath = resolveFrom(mastraEntryFile, `${dep}/package.json`);
        const pkg = await readJSON(pkgPath);
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
          bundleOutputDir: join(outputDirectory, this.outputDir),
          logger: this.logger
        });
      } catch (error) {
        throw new MastraError(
          {
            id: "DEPLOYER_BUNDLER_WORKSPACE_DEPS_FAILED",
            text: `Failed to collect and pack workspace dependencies.`,
            domain: ErrorDomain.DEPLOYER,
            category: ErrorCategory.USER
          },
          error
        );
      }
    }
    try {
      await this.writePackageJson(join(outputDirectory, this.outputDir), dependenciesToInstall, resolutions);
      await this.writeInstrumentationFile(join(outputDirectory, this.outputDir));
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
      await writeFile(join(bundleLocation, "tools.mjs"), `export const tools = ${JSON.stringify(toolsInputOptions)};`);
      this.logger.info("Bundling Mastra done");
      this.logger.info("Copying public files");
      await this.copyPublic(dirname(mastraEntryFile), outputDirectory);
      this.logger.info("Done copying public files");
      this.logger.info("Installing dependencies");
      await this.installDependencies(outputDirectory);
      this.logger.info("Done installing dependencies");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new MastraError(
        {
          id: "DEPLOYER_BUNDLER_BUNDLE_STAGE_FAILED",
          text: `Failed during bundler bundle stage: ${message}`,
          domain: ErrorDomain.DEPLOYER,
          category: ErrorCategory.SYSTEM
        },
        error
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

export { Bundler };
