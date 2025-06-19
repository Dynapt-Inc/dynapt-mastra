import fsp from 'fs/promises';
import os from 'os';
import path from 'path';
import { experimental_customProvider } from 'ai';
import { FlagEmbedding, EmbeddingModel } from 'fastembed';

// src/index.ts
async function getModelCachePath() {
  const cachePath = path.join(os.homedir(), ".cache", "mastra", "fastembed-models");
  await fsp.mkdir(cachePath, { recursive: true });
  return cachePath;
}
async function generateEmbeddings(values, modelType) {
  const model = await FlagEmbedding.init({
    model: EmbeddingModel[modelType],
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
var fastEmbedProvider = experimental_customProvider({
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

export { fastembed };
