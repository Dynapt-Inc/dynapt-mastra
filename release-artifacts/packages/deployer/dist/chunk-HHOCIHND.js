import { tsConfigPaths, removeDeployer } from './chunk-Z544XXXK.js';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import { fileURLToPath } from 'url';
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';

async function getInputOptions(entryFile, analyzedBundleInfo, platform, env = { "process.env.NODE_ENV": JSON.stringify("production") }) {
  let nodeResolvePlugin = platform === "node" ? nodeResolve({
    preferBuiltins: true,
    exportConditions: ["node", "import", "require"],
    mainFields: ["module", "main"]
  }) : nodeResolve({
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
      tsConfigPaths(),
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
      alias({
        entries: [
          {
            find: /^\#server$/,
            replacement: fileURLToPath(import.meta.resolve("@mastra/deployer/server")).replaceAll("\\", "/")
          },
          {
            find: /^\@mastra\/server\/(.*)/,
            replacement: `@mastra/server/$1`,
            customResolver: (id) => {
              if (id.startsWith("@mastra/server")) {
                return {
                  id: fileURLToPath(import.meta.resolve(id))
                };
              }
            }
          },
          { find: /^\#mastra$/, replacement: normalizedEntryFile }
        ]
      }),
      esbuild({
        target: "node20",
        platform,
        minify: false,
        define: env
      }),
      commonjs({
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
      json(),
      removeDeployer(entryFile),
      // treeshake unused imports
      esbuild({
        include: entryFile,
        target: "node20",
        platform,
        minify: false
      })
    ].filter(Boolean)
  };
}
async function createBundler(inputOptions, outputOptions) {
  const bundler = await rollup(inputOptions);
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

export { createBundler, getInputOptions };
