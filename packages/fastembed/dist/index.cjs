'use strict';

var fsp = require('fs/promises');
var os = require('os');
var path = require('path');
var ai = require('ai');
var fastembed$1 = require('fastembed');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var fsp__default = /*#__PURE__*/_interopDefault(fsp);
var os__default = /*#__PURE__*/_interopDefault(os);
var path__default = /*#__PURE__*/_interopDefault(path);

// src/index.ts
async function getModelCachePath() {
  const cachePath = path__default.default.join(os__default.default.homedir(), ".cache", "mastra", "fastembed-models");
  await fsp__default.default.mkdir(cachePath, { recursive: true });
  return cachePath;
}
async function generateEmbeddings(values, modelType) {
  const model = await fastembed$1.FlagEmbedding.init({
    model: fastembed$1.EmbeddingModel[modelType],
    cacheDir: await getModelCachePath()
  });
  const embeddings = model.embed(values);
  const allResults = [];
  for await (const result of embeddings) {
    allResults.push(...result.map((embedding) => Array.from(embedding)));
  }
  if (allResults.length === 0) throw new Error("No embeddings generated");
  return {
    embeddings: allResults
  };
}
var fastEmbedProvider = ai.experimental_customProvider({
  textEmbeddingModels: {
    "bge-small-en-v1.5": {
      specificationVersion: "v1",
      provider: "fastembed",
      modelId: "bge-small-en-v1.5",
      maxEmbeddingsPerCall: 256,
      supportsParallelCalls: true,
      async doEmbed({ values }) {
        return generateEmbeddings(values, "BGESmallENV15");
      }
    },
    "bge-base-en-v1.5": {
      specificationVersion: "v1",
      provider: "fastembed",
      modelId: "bge-base-en-v1.5",
      maxEmbeddingsPerCall: 256,
      supportsParallelCalls: true,
      async doEmbed({ values }) {
        return generateEmbeddings(values, "BGEBaseENV15");
      }
    }
  }
});
var fastembed = Object.assign(fastEmbedProvider.textEmbeddingModel(`bge-small-en-v1.5`), {
  small: fastEmbedProvider.textEmbeddingModel(`bge-small-en-v1.5`),
  base: fastEmbedProvider.textEmbeddingModel(`bge-base-en-v1.5`)
});

exports.fastembed = fastembed;
