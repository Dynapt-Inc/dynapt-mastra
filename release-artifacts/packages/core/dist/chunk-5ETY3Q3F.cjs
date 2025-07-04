'use strict';

var chunk7KWHHSK5_cjs = require('./chunk-7KWHHSK5.cjs');
var cohereAi = require('cohere-ai');

var CohereRelevanceScorer = class {
  client;
  model;
  constructor(model, apiKey) {
    this.client = new cohereAi.CohereClient({
      token: apiKey || process.env.COHERE_API_KEY || ""
    });
    this.model = model;
  }
  async getRelevanceScore(query, text) {
    const response = await this.client.rerank({
      query,
      documents: [text],
      model: this.model,
      topN: 1
    });
    return response.results[0].relevanceScore;
  }
};

// src/relevance/relevance-score-provider.ts
function createSimilarityPrompt(query, text) {
  return `Rate the semantic similarity between the following the query and the text on a scale from 0 to 1 (decimals allowed), where 1 means exactly the same meaning and 0 means completely different:

Query: ${query}

Text: ${text}

Relevance score (0-1):`;
}

// src/relevance/mastra-agent/index.ts
var MastraAgentRelevanceScorer = class {
  agent;
  constructor(name, model) {
    this.agent = new chunk7KWHHSK5_cjs.Agent({
      name: `Relevance Scorer ${name}`,
      instructions: `You are a specialized agent for evaluating the relevance of text to queries.
Your task is to rate how well a text passage answers a given query.
Output only a number between 0 and 1, where:
1.0 = Perfectly relevant, directly answers the query
0.0 = Completely irrelevant
Consider:
- Direct relevance to the question
- Completeness of information
- Quality and specificity
Always return just the number, no explanation.`,
      model
    });
  }
  async getRelevanceScore(query, text) {
    const prompt = createSimilarityPrompt(query, text);
    const response = await this.agent.generate(prompt);
    return parseFloat(response.text);
  }
};

exports.CohereRelevanceScorer = CohereRelevanceScorer;
exports.MastraAgentRelevanceScorer = MastraAgentRelevanceScorer;
exports.createSimilarityPrompt = createSimilarityPrompt;
