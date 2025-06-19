import { Agent } from '@mastra/core/agent';

// src/metrics/judge/index.ts
var MastraAgentJudge = class {
  agent;
  constructor(name, instructions, model) {
    this.agent = new Agent({
      name: `Mastra Eval Judge ${name}`,
      instructions,
      model
    });
  }
};

export { MastraAgentJudge };
