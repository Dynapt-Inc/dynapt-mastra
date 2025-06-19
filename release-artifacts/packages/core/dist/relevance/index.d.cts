import { bx as MastraLanguageModel } from '../base-CEuVqEGP.cjs';
import '../base-CZ7cNkfE.cjs';
import 'ai';
import 'zod';
import '../logger-CpL0z5v_.cjs';
import '../error/index.cjs';
import 'stream';
import 'json-schema';
import '../tts/index.cjs';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';
import '../vector/index.cjs';
import '../vector/filter/index.cjs';
import '../types-Bo1uigWx.cjs';
import 'sift';
import '../runtime-context/index.cjs';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import '../workflows/constants.cjs';
import 'ai/test';
import '../deployer/index.cjs';
import '../bundler/index.cjs';
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
