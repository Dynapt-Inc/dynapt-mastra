import { recursiveRemoveNonReferencedNodes, removeAllOptionsFromMastraExcept } from './chunk-J2V6UIZO.js';
import * as babel from '@babel/core';
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';

// src/build/babel/remove-all-options-telemetry.ts
function removeAllOptionsExceptTelemetry(result) {
  return removeAllOptionsFromMastraExcept(result, "telemetry");
}

// src/build/telemetry.ts
function getTelemetryBundler(entryFile, result) {
  return rollup({
    logLevel: "silent",
    input: {
      "telemetry-config": entryFile
    },
    treeshake: "smallest",
    plugins: [
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
        name: "get-telemetry-config",
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

export { writeTelemetryConfig };
