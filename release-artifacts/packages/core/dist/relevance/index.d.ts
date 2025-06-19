import { bx as MastraLanguageModel } from '../base-CWUtFPZY.js';
import '../base-DCIyondy.js';
import 'ai';
import 'zod';
import '../logger-DtVDdb81.js';
import '../error/index.js';
import 'stream';
import 'json-schema';
import '../tts/index.js';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';
import '../vector/index.js';
import '../vector/filter/index.js';
import '../types-Bo1uigWx.js';
import 'sift';
import '../runtime-context/index.js';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import '../workflows/constants.js';
import 'ai/test';
import '../deployer/index.js';
import '../bundler/index.js';
import 'hono/cors';
import 'hono-openapi';

interface RelevanceScoreProvider {
    getRelevanceScore(text1: string, text2: string): Promise<number>;
}
declare function createSimilarityPrompt(query: string, text: string): string;

declare class CohereRelevanceScorer implements RelevanceScoreProvider {
    private client;
    private model;
    constructor(model: string, apiKey?: string);
    getRelevanceScore(query: string, text: string): Promise<number>;
}

declare class MastraAgentRelevanceScorer implements RelevanceScoreProvider {
    private agent;
    constructor(name: string, model: MastraLanguageModel);
    getRelevanceScore(query: string, text: string): Promise<number>;
}

export { CohereRelevanceScorer, MastraAgentRelevanceScorer, type RelevanceScoreProvider, createSimilarityPrompt };
