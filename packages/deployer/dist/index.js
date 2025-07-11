import { Bundler } from './chunk-72MENR23.js';
import { recursiveRemoveNonReferencedNodes } from './chunk-J2V6UIZO.js';
import { DepsService, FileService } from './chunk-4VKGIENI.js';
export { Deps, FileService, createChildProcessLogger, createPinoStream } from './chunk-4VKGIENI.js';
import * as babel from '@babel/core';
import babel__default from '@babel/core';
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';

// src/deploy/base.ts
var Deployer = class extends Bundler {
  deps = new DepsService();
  constructor(args) {
    super(args.name, "DEPLOYER");
    this.deps.__setLogger(this.logger);
  }
  getEnvFiles() {
    const possibleFiles = [".env.production", ".env.local", ".env"];
    try {
      const fileService = new FileService();
      const envFile = fileService.getFirstExistingFile(possibleFiles);
      return Promise.resolve([envFile]);
    } catch {
    }
    return Promise.resolve([]);
  }
};
function removeAllExceptDeployer() {
  const t = babel__default.types;
  return {
    name: "remove-all-except-deployer",
    visitor: {
      ExportNamedDeclaration: {
        // remove all exports
        exit(path) {
          path.remove();
        }
      },
      NewExpression(path) {
        const varDeclaratorPath = path.findParent((path2) => t.isVariableDeclarator(path2.node));
        if (!varDeclaratorPath) {
          return;
        }
        const parentNode = path.parentPath.node;
        if (!t.isVariableDeclarator(parentNode) || !t.isIdentifier(parentNode.id) || parentNode.id.name !== "mastra") {
          return;
        }
        const deployer = path.node.arguments[0]?.properties?.find(
          // @ts-ignore
          (prop) => prop.key.name === "deployer"
        );
        const programPath = path.scope.getProgramParent().path;
        if (!deployer || !programPath) {
          return;
        }
        const exportDeclaration = t.exportNamedDeclaration(
          t.variableDeclaration("const", [t.variableDeclarator(t.identifier("deployer"), deployer.value)]),
          []
        );
        programPath.node.body.push(exportDeclaration);
      }
    }
  };
}
function getDeployerBundler(entryFile, result) {
  return rollup({
    logLevel: "silent",
    input: {
      deployer: entryFile
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
        name: "get-deployer",
        transform(code, id) {
          if (id !== entryFile) {
            return;
          }
          result.isDeployerRemoved = true;
          return new Promise((resolve, reject) => {
            babel.transform(
              code,
              {
                babelrc: false,
                configFile: false,
                filename: id,
                plugins: [removeAllExceptDeployer]
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
        name: "cleanup-nodes",
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
async function getDeployer(entryFile, outputDir) {
  const result = { isDeployerRemoved: false };
  const bundle = await getDeployerBundler(entryFile, result);
  await bundle.write({
    dir: outputDir,
    format: "es",
    entryFileNames: "[name].mjs"
  });
  if (!result.isDeployerRemoved) {
    return;
  }
  return (await import(`file:${outputDir}/deployer.mjs`)).deployer;
}

export { Deployer, getDeployer };
