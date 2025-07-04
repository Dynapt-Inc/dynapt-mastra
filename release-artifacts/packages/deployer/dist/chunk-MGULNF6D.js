import { aliasHono, recursiveRemoveNonReferencedNodes, removeAllOptionsFromMastraExcept } from './chunk-J2V6UIZO.js';
import { getInputOptions } from './chunk-HHOCIHND.js';
import { tsConfigPaths } from './chunk-Z544XXXK.js';
import { watch, rollup } from 'rollup';
import { extname, dirname } from 'path';
import resolveFrom from 'resolve-from';
import { builtinModules } from 'module';
import * as babel from '@babel/core';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';

function isBuiltinModule(specifier) {
  return builtinModules.includes(specifier) || specifier.startsWith("node:") || builtinModules.includes(specifier.replace(/^node:/, ""));
}
function safeResolve(id, importer) {
  try {
    return resolveFrom(importer, id);
  } catch {
    return null;
  }
}
function getPackageName(id) {
  const parts = id.split("/");
  if (id.startsWith("@")) {
    return parts.slice(0, 2).join("/");
  }
  return parts[0];
}
function nodeModulesExtensionResolver() {
  return {
    name: "node-modules-extension-resolver",
    resolveId(id, importer) {
      if (id.startsWith(".") || id.startsWith("/") || !importer) {
        return null;
      }
      if (isBuiltinModule(id)) {
        return null;
      }
      if (id.startsWith("@") && id.split("/").length === 2) {
        return null;
      }
      if (!id.startsWith("@") && id.split("/").length === 1) {
        return null;
      }
      const foundExt = extname(id);
      if (foundExt) {
        return null;
      }
      try {
        const resolved = import.meta.resolve(id);
        if (!extname(resolved)) {
          throw new Error(`Cannot resolve ${id} from ${importer}`);
        }
        return null;
      } catch (e) {
        for (const ext of [".mjs", ".js", ".cjs"]) {
          const resolved = safeResolve(id + ext, importer);
          if (resolved) {
            const pkgName = getPackageName(id);
            if (!pkgName) {
              return null;
            }
            const pkgJsonPath = safeResolve(`${pkgName}/package.json`, importer);
            if (!pkgJsonPath) {
              return null;
            }
            const newImportWithExtension = resolved.replace(dirname(pkgJsonPath), pkgName);
            return {
              id: newImportWithExtension,
              external: true
            };
          }
        }
      }
      return null;
    }
  };
}

// src/build/watcher.ts
async function getInputOptions2(entryFile, platform, env) {
  const inputOptions = await getInputOptions(
    entryFile,
    {
      dependencies: /* @__PURE__ */ new Map(),
      externalDependencies: /* @__PURE__ */ new Set(),
      invalidChunks: /* @__PURE__ */ new Set()
    },
    platform,
    env
  );
  if (Array.isArray(inputOptions.plugins)) {
    inputOptions.plugins = inputOptions.plugins.filter(
      // @ts-ignore
      (plugin) => !plugin || !plugin?.name || plugin.name !== "node-resolve"
    );
    inputOptions.plugins.push(aliasHono());
    inputOptions.plugins.push(nodeModulesExtensionResolver());
  }
  return inputOptions;
}
async function createWatcher(inputOptions, outputOptions) {
  const watcher = await watch({
    ...inputOptions,
    output: {
      ...outputOptions,
      format: "esm",
      entryFileNames: "[name].mjs",
      chunkFileNames: "[name].mjs"
    }
  });
  return watcher;
}

// src/build/babel/remove-all-options-server.ts
function removeAllOptionsExceptServer(result) {
  return removeAllOptionsFromMastraExcept(result, "server");
}
function getServerOptionsBundler(entryFile, result) {
  return rollup({
    logLevel: "silent",
    input: {
      "server-config": entryFile
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
      commonjs({
        extensions: [".js", ".ts"],
        strictRequires: "strict",
        transformMixedEsModules: true,
        ignoreTryCatch: false
      }),
      {
        name: "get-server-config",
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
                plugins: [removeAllOptionsExceptServer(result)]
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
async function getServerOptions(entryFile, outputDir) {
  const result = {
    hasCustomConfig: false
  };
  const bundle = await getServerOptionsBundler(entryFile, result);
  await bundle.write({
    dir: outputDir,
    format: "es",
    entryFileNames: "[name].mjs",
    sourcemap: true
  });
  if (result.hasCustomConfig) {
    return (await import(`file:${outputDir}/server-config.mjs`)).server;
  }
  return null;
}

export { createWatcher, getInputOptions2 as getInputOptions, getServerOptions };
