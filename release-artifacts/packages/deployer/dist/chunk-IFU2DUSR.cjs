'use strict';

var chunkF4JNMQTU_cjs = require('./chunk-F4JNMQTU.cjs');
var babel = require('@babel/core');
var rollup = require('rollup');
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

var babel__namespace = /*#__PURE__*/_interopNamespace(babel);
var esbuild__default = /*#__PURE__*/_interopDefault(esbuild);
var commonjs__default = /*#__PURE__*/_interopDefault(commonjs);

// src/build/babel/remove-all-options-telemetry.ts
function removeAllOptionsExceptTelemetry(result) {
  return chunkF4JNMQTU_cjs.removeAllOptionsFromMastraExcept(result, "telemetry");
}

// src/build/telemetry.ts
function getTelemetryBundler(entryFile, result) {
  return rollup.rollup({
    logLevel: "silent",
    input: {
      "telemetry-config": entryFile
    },
    treeshake: "smallest",
    plugins: [
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
        name: "get-telemetry-config",
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
                plugins: [removeAllOptionsExceptTelemetry(result)]
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
async function writeTelemetryConfig(entryFile, outputDir) {
  const result = {
    hasCustomConfig: false
  };
  const bundle = await getTelemetryBundler(entryFile, result);
  const { output } = await bundle.write({
    dir: outputDir,
    format: "es",
    entryFileNames: "[name].mjs"
  });
  const externals = output[0].imports.filter((x) => !x.startsWith("./"));
  return { ...result, externalDependencies: externals };
}

exports.writeTelemetryConfig = writeTelemetryConfig;
