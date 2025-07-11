'use strict';

var chunkF4JNMQTU_cjs = require('./chunk-F4JNMQTU.cjs');
var chunkIMGVLBV7_cjs = require('./chunk-IMGVLBV7.cjs');
var chunk54KOF3NB_cjs = require('./chunk-54KOF3NB.cjs');
var rollup = require('rollup');
var path = require('path');
var resolveFrom = require('resolve-from');
var module$1 = require('module');
var babel = require('@babel/core');
var esbuild = require('rollup-plugin-esbuild');
var commonjs = require('@rollup/plugin-commonjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var resolveFrom__default = /*#__PURE__*/_interopDefault(resolveFrom);
var babel__namespace = /*#__PURE__*/_interopNamespace(babel);
var esbuild__default = /*#__PURE__*/_interopDefault(esbuild);
var commonjs__default = /*#__PURE__*/_interopDefault(commonjs);

function isBuiltinModule(specifier) {
  return module$1.builtinModules.includes(specifier) || specifier.startsWith("node:") || module$1.builtinModules.includes(specifier.replace(/^node:/, ""));
}
function safeResolve(id, importer) {
  try {
    return resolveFrom__default.default(importer, id);
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
      const foundExt = path.extname(id);
      if (foundExt) {
        return null;
      }
      try {
        const resolved = undefined(id);
        if (!path.extname(resolved)) {
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
            const newImportWithExtension = resolved.replace(path.dirname(pkgJsonPath), pkgName);
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
  const inputOptions = await chunkIMGVLBV7_cjs.getInputOptions(
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
    inputOptions.plugins.push(chunkF4JNMQTU_cjs.aliasHono());
    inputOptions.plugins.push(nodeModulesExtensionResolver());
  }
  return inputOptions;
}
async function createWatcher(inputOptions, outputOptions) {
  const watcher = await rollup.watch({
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
  return chunkF4JNMQTU_cjs.removeAllOptionsFromMastraExcept(result, "server");
}
function getServerOptionsBundler(entryFile, result) {
  return rollup.rollup({
    logLevel: "silent",
    input: {
      "server-config": entryFile
    },
    treeshake: "smallest",
    plugins: [
      chunk54KOF3NB_cjs.tsConfigPaths(),
      // transpile typescript to something we understand
      esbuild__default.default({
        target: "node20",
        platform: "node",
        minify: false
      }),
      commonjs__default.default({
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
            babel__namespace.transform(
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
      esbuild__default.default({
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
          return chunkF4JNMQTU_cjs.recursiveRemoveNonReferencedNodes(code);
        }
      },
      // let esbuild remove all unused imports
      esbuild__default.default({
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

exports.createWatcher = createWatcher;
exports.getInputOptions = getInputOptions2;
exports.getServerOptions = getServerOptions;
