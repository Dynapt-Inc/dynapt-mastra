'use strict';

var chunkQGO33MM3_cjs = require('./chunk-QGO33MM3.cjs');
var chunkF4JNMQTU_cjs = require('./chunk-F4JNMQTU.cjs');
var chunk7ICGDVC3_cjs = require('./chunk-7ICGDVC3.cjs');
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

// src/deploy/base.ts
var Deployer = class extends chunkQGO33MM3_cjs.Bundler {
  deps = new chunk7ICGDVC3_cjs.DepsService();
  constructor(args) {
    super(args.name, "DEPLOYER");
    this.deps.__setLogger(this.logger);
  }
  getEnvFiles() {
    const possibleFiles = [".env.production", ".env.local", ".env"];
    try {
      const fileService = new chunk7ICGDVC3_cjs.FileService();
      const envFile = fileService.getFirstExistingFile(possibleFiles);
      return Promise.resolve([envFile]);
    } catch {
    }
    return Promise.resolve([]);
  }
};
function removeAllExceptDeployer() {
  const t = babel__namespace.default.types;
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
  return rollup.rollup({
    logLevel: "silent",
    input: {
      deployer: entryFile
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
        name: "get-deployer",
        transform(code, id) {
          if (id !== entryFile) {
            return;
          }
          result.isDeployerRemoved = true;
          return new Promise((resolve, reject) => {
            babel__namespace.transform(
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
      esbuild__default.default({
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

Object.defineProperty(exports, "Deps", {
  enumerable: true,
  get: function () { return chunk7ICGDVC3_cjs.Deps; }
});
Object.defineProperty(exports, "FileService", {
  enumerable: true,
  get: function () { return chunk7ICGDVC3_cjs.FileService; }
});
Object.defineProperty(exports, "createChildProcessLogger", {
  enumerable: true,
  get: function () { return chunk7ICGDVC3_cjs.createChildProcessLogger; }
});
Object.defineProperty(exports, "createPinoStream", {
  enumerable: true,
  get: function () { return chunk7ICGDVC3_cjs.createPinoStream; }
});
exports.Deployer = Deployer;
exports.getDeployer = getDeployer;
