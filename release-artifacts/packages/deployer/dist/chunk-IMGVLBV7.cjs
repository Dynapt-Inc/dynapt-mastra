'use strict';

var chunk54KOF3NB_cjs = require('./chunk-54KOF3NB.cjs');
var alias = require('@rollup/plugin-alias');
var commonjs = require('@rollup/plugin-commonjs');
var json = require('@rollup/plugin-json');
var nodeResolve = require('@rollup/plugin-node-resolve');
var url = require('url');
var rollup = require('rollup');
var esbuild = require('rollup-plugin-esbuild');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var alias__default = /*#__PURE__*/_interopDefault(alias);
var commonjs__default = /*#__PURE__*/_interopDefault(commonjs);
var json__default = /*#__PURE__*/_interopDefault(json);
var nodeResolve__default = /*#__PURE__*/_interopDefault(nodeResolve);
var esbuild__default = /*#__PURE__*/_interopDefault(esbuild);

async function getInputOptions(entryFile, analyzedBundleInfo, platform, env = { "process.env.NODE_ENV": JSON.stringify("production") }) {
  let nodeResolvePlugin = platform === "node" ? nodeResolve__default.default({
    preferBuiltins: true,
    exportConditions: ["node", "import", "require"],
    mainFields: ["module", "main"]
  }) : nodeResolve__default.default({
    preferBuiltins: false,
    exportConditions: ["browser", "import", "require"],
    mainFields: ["module", "main"],
    browser: true
  });
  const externalsCopy = /* @__PURE__ */ new Set();
  for (const external of analyzedBundleInfo.externalDependencies) {
    if (external.startsWith("@")) {
      const [scope, name] = external.split("/", 3);
      externalsCopy.add(`${scope}/${name}`);
      externalsCopy.add(`${scope}/${name}/*`);
    } else {
      externalsCopy.add(external);
      externalsCopy.add(`${external}/*`);
    }
  }
  const externals = Array.from(externalsCopy);
  const normalizedEntryFile = entryFile.replaceAll("\\", "/");
  return {
    logLevel: process.env.MASTRA_BUNDLER_DEBUG === "true" ? "debug" : "silent",
    treeshake: "smallest",
    preserveSymlinks: true,
    external: externals,
    plugins: [
      chunk54KOF3NB_cjs.tsConfigPaths(),
      {
        name: "alias-optimized-deps",
        // @ts-ignore
        resolveId(id) {
          if (!analyzedBundleInfo.dependencies.has(id)) {
            return null;
          }
          const isInvalidChunk = analyzedBundleInfo.invalidChunks.has(analyzedBundleInfo.dependencies.get(id));
          if (isInvalidChunk) {
            return {
              id,
              external: true
            };
          }
          return {
            id: ".mastra/.build/" + analyzedBundleInfo.dependencies.get(id),
            external: false
          };
        }
      },
      alias__default.default({
        entries: [
          {
            find: /^\#server$/,
            replacement: url.fileURLToPath(undefined("@mastra/deployer/server")).replaceAll("\\", "/")
          },
          {
            find: /^\@mastra\/server\/(.*)/,
            replacement: `@mastra/server/$1`,
            customResolver: (id) => {
              if (id.startsWith("@mastra/server")) {
                return {
                  id: url.fileURLToPath(undefined(id))
                };
              }
            }
          },
          { find: /^\#mastra$/, replacement: normalizedEntryFile }
        ]
      }),
      esbuild__default.default({
        target: "node20",
        platform,
        minify: false,
        define: env
      }),
      commonjs__default.default({
        extensions: [".js", ".ts"],
        transformMixedEsModules: true,
        esmExternals(id) {
          return externals.includes(id);
        }
      }),
      nodeResolvePlugin,
      // for debugging
      // {
      //   name: 'logger',
      //   //@ts-ignore
      //   resolveId(id, ...args) {
      //     console.log({ id, args });
      //   },
      //   // @ts-ignore
      // transform(code, id) {
      //   if (code.includes('class Duplexify ')) {
      //     console.log({ duplex: id });
      //   }
      // },
      // },
      json__default.default(),
      chunk54KOF3NB_cjs.removeDeployer(entryFile),
      // treeshake unused imports
      esbuild__default.default({
        include: entryFile,
        target: "node20",
        platform,
        minify: false
      })
    ].filter(Boolean)
  };
}
async function createBundler(inputOptions, outputOptions) {
  const bundler = await rollup.rollup(inputOptions);
  return {
    write: () => {
      return bundler.write({
        ...outputOptions,
        format: "esm",
        entryFileNames: "[name].mjs",
        chunkFileNames: "[name].mjs"
      });
    },
    close: () => {
      return bundler.close();
    }
  };
}

exports.createBundler = createBundler;
exports.getInputOptions = getInputOptions;
