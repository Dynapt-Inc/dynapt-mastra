import { tsConfigPaths, removeDeployer } from './chunk-Z544XXXK.js';
import commonjs2 from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import virtual from '@rollup/plugin-virtual';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import { builtinModules } from 'module';
import { join, dirname } from 'path';
import { spawn as spawn$1 } from 'child_process';
import { writeFile } from 'fs/promises';
import * as babel from '@babel/core';
import babel__default from '@babel/core';

function isNodeBuiltin(dep) {
  const [pkg] = dep.split("/");
  return dep.startsWith("node:") || builtinModules.includes(dep) || builtinModules.includes(pkg);
}
function aliasHono() {
  return {
    name: "hono-alias",
    resolveId(id) {
      if (!id.startsWith("@hono/") && !id.startsWith("hono/") && id !== "hono" && id !== "hono-openapi") {
        return;
      }
      const path = import.meta.resolve(id);
      return fileURLToPath(path);
    }
  };
}
function spawn(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn$1(command, args, {
      // stdio: 'inherit',
      ...options
    });
    childProcess.on("error", (error) => {
      reject(error);
    });
    let stderr = "";
    childProcess.stderr?.on("data", (message) => {
      stderr += message;
    });
    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr));
      }
    });
  });
}
function validate(file) {
  return spawn(
    "node",
    [
      "--import",
      import.meta.resolve("@mastra/deployer/loader"),
      "--input-type=module",
      "-e",
      `import('file://${file.replaceAll("\\", "/")}')`
    ],
    {
      cwd: dirname(file)
    }
  );
}
function removeAllOptionsFromMastraExcept(result, option) {
  const t = babel__default.types;
  return {
    name: "remove-all-except-" + option + "-config",
    visitor: {
      ExportNamedDeclaration: {
        // remove all exports
        exit(path) {
          path.remove();
        }
      },
      NewExpression(path, state) {
        const varDeclaratorPath = path.findParent((path2) => t.isVariableDeclarator(path2.node));
        if (!varDeclaratorPath) {
          return;
        }
        const parentNode = path.parentPath.node;
        if (!t.isVariableDeclarator(parentNode) || !t.isIdentifier(parentNode.id) || parentNode.id.name !== "mastra") {
          return;
        }
        let mastraArgs = t.objectExpression([]);
        if (t.isObjectExpression(path.node.arguments[0])) {
          mastraArgs = path.node.arguments[0];
        }
        let telemetry = mastraArgs.properties.find(
          // @ts-ignore
          (prop) => prop.key.name === option
        );
        let telemetryValue = t.objectExpression([]);
        const programPath = path.scope.getProgramParent().path;
        if (!programPath) {
          return;
        }
        if (telemetry && t.isObjectProperty(telemetry) && t.isExpression(telemetry.value)) {
          result.hasCustomConfig = true;
          telemetryValue = telemetry.value;
          if (t.isIdentifier(telemetry.value) && telemetry.value.name === option) {
            const telemetryBinding = state.file.scope.getBinding(option);
            if (telemetryBinding && t.isVariableDeclarator(telemetryBinding.path.node)) {
              const id = path.scope.generateUidIdentifier(option);
              telemetryBinding.path.replaceWith(t.variableDeclarator(id, telemetryBinding.path.node.init));
              telemetryValue = id;
            }
          }
        }
        const exportDeclaration = t.exportNamedDeclaration(
          t.variableDeclaration("const", [t.variableDeclarator(t.identifier(option), telemetryValue)]),
          []
        );
        programPath.node.body.push(exportDeclaration);
      }
    }
  };
}

// src/build/babel/remove-all-options-bundler.ts
function removeAllOptionsExceptBundler(result) {
  return removeAllOptionsFromMastraExcept(result, "bundler");
}
function removeNonReferencedNodes() {
  const t = babel__default.types;
  return {
    name: "remove-non-referenced-nodes",
    visitor: {
      Program(path) {
        const scope = path.scope;
        const currentBody = path.get("body");
        const filteredBody = currentBody.filter((childPath) => {
          if (childPath.isExportDeclaration()) {
            return true;
          }
          if (childPath.isVariableDeclaration()) {
            return childPath.node.declarations.some((decl) => {
              if (!t.isIdentifier(decl.id)) {
                return false;
              }
              const name = decl.id.name;
              const binding = scope.getBinding(name);
              return binding && (binding.referenced || binding.referencePaths.length > 0);
            });
          }
          if (childPath.isFunctionDeclaration() || childPath.isClassDeclaration()) {
            if (!t.isIdentifier(childPath.node.id)) {
              return false;
            }
            const name = childPath.node.id.name;
            const binding = scope.getBinding(name);
            return binding && (binding.referenced || binding.referencePaths.length > 0);
          }
          if (childPath.isImportDeclaration()) {
            return childPath.node.specifiers.some((specifier) => {
              const importedName = specifier.local.name;
              const binding = scope.getBinding(importedName);
              return binding && (binding.referenced || binding.referencePaths.length > 0);
            });
          }
          return false;
        });
        path.set(
          "body",
          filteredBody.map((p) => p.node)
        );
      }
    }
  };
}

// src/build/plugins/remove-unused-references.ts
function recursiveRemoveNonReferencedNodes(code) {
  return new Promise(async (resolve, reject) => {
    babel.transform(
      code,
      {
        babelrc: false,
        configFile: false,
        plugins: [removeNonReferencedNodes()]
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result && result.code !== code) {
          return recursiveRemoveNonReferencedNodes(result.code).then(resolve, reject);
        }
        resolve({
          code: result.code,
          map: result.map
        });
      }
    );
  });
}

// src/build/bundlerOptions.ts
function getBundlerOptionsBundler(entryFile, result) {
  return rollup({
    logLevel: "silent",
    input: {
      "bundler-config": entryFile
    },
    treeshake: "smallest",
    plugins: [
      tsConfigPaths(),
      // transpile typescript to something we understand
      esbuild({
        target: "node20",
        platform: "node",
        minify: false
      }),
      commonjs2({
        extensions: [".js", ".ts"],
        strictRequires: "strict",
        transformMixedEsModules: true,
        ignoreTryCatch: false
      }),
      {
        name: "get-bundler-config",
        transform(code, id) {
          if (id !== entryFile) {
            return;
          }
          return new Promise((resolve, reject) => {
            babel.transform(
              code,
              {
                babelrc: false,
                configFile: false,
                filename: id,
                plugins: [removeAllOptionsExceptBundler(result)]
              },
              (err, result2) => {
                if (err) {
                  return reject(err);
                }
                resolve({
                  code: result2.code,
                  map: result2.map
                });
              }
            );
          });
        }
      },
      // let esbuild remove all unused imports
      esbuild({
        target: "node20",
        platform: "node",
        minify: false
      }),
      {
        name: "cleanup",
        transform(code, id) {
          if (id !== entryFile) {
            return;
          }
          return recursiveRemoveNonReferencedNodes(code);
        }
      },
      // let esbuild remove all unused imports
      esbuild({
        target: "node20",
        platform: "node",
        minify: false
      })
    ]
  });
}
async function getBundlerOptions(entryFile, outputDir) {
  const result = {
    hasCustomConfig: false
  };
  const bundle = await getBundlerOptionsBundler(entryFile, result);
  await bundle.write({
    dir: outputDir,
    format: "es",
    entryFileNames: "[name].mjs"
  });
  if (result.hasCustomConfig) {
    return (await import(`file:${outputDir}/bundler-config.mjs`)).bundler;
  }
  return null;
}

// src/build/analyze.ts
var globalExternals = [
  "pino",
  "pino-pretty",
  "@libsql/client",
  "pg",
  "libsql",
  "jsdom",
  "sqlite3",
  "fastembed",
  "nodemailer"
];
function findExternalImporter(module, external, allOutputs) {
  const capturedFiles = /* @__PURE__ */ new Set();
  for (const id of module.imports) {
    if (id === external) {
      return module;
    } else {
      if (id.endsWith(".mjs")) {
        capturedFiles.add(id);
      }
    }
  }
  for (const file of capturedFiles) {
    const nextModule = allOutputs.find((o) => o.fileName === file);
    if (nextModule) {
      const importer = findExternalImporter(nextModule, external, allOutputs);
      if (importer) {
        return importer;
      }
    }
  }
  return null;
}
async function analyze(entry, mastraEntry, isVirtualFile, platform, logger) {
  logger.info("Analyzing dependencies...");
  let virtualPlugin = null;
  if (isVirtualFile) {
    virtualPlugin = virtual({
      "#entry": entry
    });
    entry = "#entry";
  }
  const normalizedMastraEntry = mastraEntry.replaceAll("\\", "/");
  const optimizerBundler = await rollup({
    logLevel: process.env.MASTRA_BUNDLER_DEBUG === "true" ? "debug" : "silent",
    input: isVirtualFile ? "#entry" : entry,
    treeshake: "smallest",
    preserveSymlinks: true,
    plugins: [
      virtualPlugin,
      tsConfigPaths(),
      {
        name: "custom-alias-resolver",
        resolveId(id) {
          if (id === "#server") {
            return fileURLToPath(import.meta.resolve("@mastra/deployer/server")).replaceAll("\\", "/");
          }
          if (id === "#mastra") {
            return normalizedMastraEntry;
          }
          if (id.startsWith("@mastra/server")) {
            return fileURLToPath(import.meta.resolve(id));
          }
        }
      },
      json(),
      esbuild({
        target: "node20",
        platform,
        minify: false
      }),
      commonjs2({
        strictRequires: "debug",
        ignoreTryCatch: false,
        transformMixedEsModules: true,
        extensions: [".js", ".ts"]
      }),
      removeDeployer(normalizedMastraEntry),
      esbuild({
        target: "node20",
        platform,
        minify: false
      })
    ].filter(Boolean)
  });
  const { output } = await optimizerBundler.generate({
    format: "esm",
    inlineDynamicImports: true
  });
  await optimizerBundler.close();
  const depsToOptimize = new Map(Object.entries(output[0].importedBindings));
  for (const dep of depsToOptimize.keys()) {
    if (isNodeBuiltin(dep)) {
      depsToOptimize.delete(dep);
    }
  }
  for (const o of output) {
    if (o.type !== "chunk" || o.dynamicImports.length === 0) {
      continue;
    }
    for (const dynamicImport of o.dynamicImports) {
      if (!depsToOptimize.has(dynamicImport) && !isNodeBuiltin(dynamicImport)) {
        depsToOptimize.set(dynamicImport, ["*"]);
      }
    }
  }
  return depsToOptimize;
}
async function bundleExternals(depsToOptimize, outputDir, logger, customExternals) {
  logger.info("Optimizing dependencies...");
  logger.debug(
    `${Array.from(depsToOptimize.keys()).map((key) => `- ${key}`).join("\n")}`
  );
  const allExternals = [...globalExternals, ...customExternals || []];
  const reverseVirtualReferenceMap = /* @__PURE__ */ new Map();
  const virtualDependencies = /* @__PURE__ */ new Map();
  for (const [dep, exports] of depsToOptimize.entries()) {
    const name = dep.replaceAll("/", "-");
    reverseVirtualReferenceMap.set(name, dep);
    const virtualFile = [];
    let exportStringBuilder = [];
    for (const local of exports) {
      if (local === "*") {
        virtualFile.push(`export * from '${dep}';`);
      } else if (local === "default") {
        virtualFile.push(`export { default } from '${dep}';`);
      } else {
        exportStringBuilder.push(local);
      }
    }
    if (exportStringBuilder.length > 0) {
      virtualFile.push(`export { ${exportStringBuilder.join(", ")} } from '${dep}';`);
    }
    virtualDependencies.set(dep, {
      name,
      virtual: virtualFile.join("\n")
    });
  }
  const bundler = await rollup({
    logLevel: process.env.MASTRA_BUNDLER_DEBUG === "true" ? "debug" : "silent",
    input: Array.from(virtualDependencies.entries()).reduce(
      (acc, [dep, virtualDep]) => {
        acc[virtualDep.name] = `#virtual-${dep}`;
        return acc;
      },
      {}
    ),
    // this dependency breaks the build, so we need to exclude it
    // TODO actually fix this so we don't need to exclude it
    external: allExternals,
    treeshake: "smallest",
    plugins: [
      virtual(
        Array.from(virtualDependencies.entries()).reduce(
          (acc, [dep, virtualDep]) => {
            acc[`#virtual-${dep}`] = virtualDep.virtual;
            return acc;
          },
          {}
        )
      ),
      commonjs2({
        strictRequires: "strict",
        transformMixedEsModules: true,
        ignoreTryCatch: false
      }),
      nodeResolve({
        preferBuiltins: true,
        exportConditions: ["node", "import", "require"],
        mainFields: ["module", "main"]
      }),
      // hono is imported from deployer, so we need to resolve from here instead of the project root
      aliasHono(),
      json()
    ].filter(Boolean)
  });
  const { output } = await bundler.write({
    format: "esm",
    dir: outputDir,
    entryFileNames: "[name].mjs",
    chunkFileNames: "[name].mjs",
    hoistTransitiveImports: false
  });
  const moduleResolveMap = {};
  const filteredChunks = output.filter((o) => o.type === "chunk");
  for (const o of filteredChunks.filter((o2) => o2.isEntry || o2.isDynamicEntry)) {
    for (const external of allExternals) {
      const importer = findExternalImporter(o, external, filteredChunks);
      if (importer) {
        const fullPath = join(outputDir, importer.fileName);
        moduleResolveMap[fullPath] = moduleResolveMap[fullPath] || {};
        if (importer.moduleIds.length) {
          moduleResolveMap[fullPath][external] = importer.moduleIds[importer.moduleIds.length - 1]?.startsWith(
            "\0virtual:#virtual"
          ) ? importer.moduleIds[importer.moduleIds.length - 2] : importer.moduleIds[importer.moduleIds.length - 1];
        }
      }
    }
  }
  await writeFile(join(outputDir, "module-resolve-map.json"), JSON.stringify(moduleResolveMap, null, 2));
  await bundler.close();
  return { output, reverseVirtualReferenceMap, usedExternals: moduleResolveMap };
}
async function validateOutput({
  output,
  reverseVirtualReferenceMap,
  usedExternals,
  outputDir
}, logger) {
  const result = {
    invalidChunks: /* @__PURE__ */ new Set(),
    dependencies: /* @__PURE__ */ new Map(),
    externalDependencies: /* @__PURE__ */ new Set()
  };
  for (const deps of Object.values(usedExternals)) {
    for (const dep of Object.keys(deps)) {
      result.externalDependencies.add(dep);
    }
  }
  for (const file of output) {
    if (file.type === "asset") {
      continue;
    }
    try {
      logger.debug(`Validating if ${file.fileName} is a valid module.`);
      if (file.isEntry && reverseVirtualReferenceMap.has(file.name)) {
        result.dependencies.set(reverseVirtualReferenceMap.get(file.name), file.fileName);
      }
      if (!file.isDynamicEntry && file.isEntry) {
        await validate(join(outputDir, file.fileName));
      }
    } catch (err) {
      result.invalidChunks.add(file.fileName);
      if (file.isEntry && reverseVirtualReferenceMap.has(file.name)) {
        const reference = reverseVirtualReferenceMap.get(file.name);
        const dep = reference.startsWith("@") ? reference.split("/").slice(0, 2).join("/") : reference.split("/")[0];
        result.externalDependencies.add(dep);
      }
    }
  }
  return result;
}
async function analyzeBundle(entries, mastraEntry, outputDir, platform, logger) {
  const depsToOptimize = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const isVirtualFile = entry.includes("\n") || !existsSync(entry);
    const analyzeResult = await analyze(entry, mastraEntry, isVirtualFile, platform, logger);
    for (const [dep, exports] of analyzeResult.entries()) {
      if (depsToOptimize.has(dep)) {
        const existingExports = depsToOptimize.get(dep);
        depsToOptimize.set(dep, [.../* @__PURE__ */ new Set([...existingExports, ...exports])]);
      } else {
        depsToOptimize.set(dep, exports);
      }
    }
  }
  const customExternals = (await getBundlerOptions(mastraEntry, outputDir))?.externals;
  const { output, reverseVirtualReferenceMap, usedExternals } = await bundleExternals(
    depsToOptimize,
    outputDir,
    logger,
    customExternals
  );
  const result = await validateOutput({ output, reverseVirtualReferenceMap, usedExternals, outputDir }, logger);
  return result;
}

export { aliasHono, analyzeBundle, getBundlerOptions, recursiveRemoveNonReferencedNodes, removeAllOptionsFromMastraExcept };
