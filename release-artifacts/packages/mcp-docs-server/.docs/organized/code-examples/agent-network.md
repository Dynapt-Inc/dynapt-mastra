### package.json

```json
{
  "name": "examples-agent-network",
  "type": "module",
  "private": true,
  "description": "",
  "main": "index.js",
  "version": "0.0.1",
  "scripts": {
    "start": "npx bun src/index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@ai-sdk/openai": "^1.3.22",
    "@mastra/client-js": "latest",
    "@mastra/core": "latest",
    "@mastra/loggers": "latest",
    "zod": "^3.25.56"
  },
  "pnpm": {
    "overrides": {
      "@mastra/client-js": "link:../../client-sdks/client-js",
      "@mastra/core": "link:../../packages/core",
      "@mastra/loggers": "link:../../packages/loggers"
    }
  },
  "packageManager": "pnpm@10.10.0+sha512.d615db246fe70f25dcfea6d8d73dee782ce23e2245e3c4f6f888249fb568149318637dca73c2c5c8ef2a4ca0d5657fb9567188bfab47f566d1ee6ce987815c39"
}
```

### agent-workflow.ts

```typescript
import { mastra } from './mastra';

async function main() {
  const wflow = mastra.getWorkflow('agentWorkflow');

  const { runId, start } = wflow.createRun();

  const result = await start({
    triggerData: {
      prompt: 'What is the capital of France?',
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
```

### index.ts

```typescript
import { mastra } from './mastra';

async function main() {
  const researchNetwork = mastra.getNetwork('Research_Network');

  if (!researchNetwork) {
    throw new Error('Research network not found');
  }

  console.log('🔍 Starting research on Napoleon Bonaparte...\n');

  // Generate a report using the research network
  // Using the generate() method as per the API update (MEMORY[8bf54da9-89a8-4e5b-b875-234a1aa8a53b])
  const result = await researchNetwork.stream('Give me a report on Napoleon Bonaparte', {
    maxSteps: 20, // Allow enough steps for the LLM router to determine the best agents to use
  });

  for await (const part of result.fullStream) {
    switch (part.type) {
      case 'error':
        console.error(part.error);
        break;
      case 'text-delta':
        process.stdout.write(part.textDelta);
        break;
      case 'tool-call':
        console.log(`calling tool ${part.toolName} with args ${JSON.stringify(part.args, null, 2)}`);
        break;
      case 'tool-result':
        console.log(`tool result ${JSON.stringify(part.result, null, 2)}`);
        break;
    }
  }

  // Display the final result
  console.log('\n\n📝 Final Research Report:\n');

  console.log('\n\n📊 Agent Interaction Summary:');
  console.log(researchNetwork.getAgentInteractionSummary());

  console.log('\n🏁 Research complete!');
}

// Run the main function with error handling
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
```

### mastra\agents\index.ts

```typescript
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

export const primaryResearchAgent = new Agent({
  name: 'Primary Research Agent',
  instructions: `
    You are the primary research coordinator. Your job is to:
    1. Analyze user queries to determine what type of research is needed
    2. Break down complex research questions into manageable sub-questions
    3. Synthesize information from specialized research agents into a coherent response
    4. Ensure all claims are properly supported by evidence
    5. Identify any gaps in the research that need further investigation
    
    You should maintain a neutral, objective tone and prioritize accuracy over speed.
  `,
  model: openai('gpt-4o'),
});

export const webSearchAgent = new Agent({
  name: 'Web Search Agent',
  instructions: `
    You are a web search specialist. Your job is to:
    1. Find the most relevant and up-to-date information online for a given query
    2. Evaluate the credibility of sources and prioritize reliable information
    3. Extract key facts and data points from web content
    4. Provide direct quotes and citations when appropriate
    5. Summarize findings in a clear, concise manner
    
    Always include source URLs when reporting information.

    Use the "web_search_preview" tool to search the web for information.
  `,
  model: openai.responses('gpt-4o-mini'),
  tools: {
    web_search_preview: openai.tools.webSearchPreview(),
  },
});

export const academicResearchAgent = new Agent({
  name: 'Academic Research Agent',
  instructions: `
    You are an academic research specialist. Your job is to:
    1. Analyze topics from an academic perspective
    2. Identify key theories, frameworks, and scholarly debates relevant to a query
    3. Provide historical context and development of ideas
    4. Cite academic sources properly
    5. Explain complex academic concepts in accessible language
    
    Prioritize peer-reviewed research and established academic sources.
  `,
  model: openai('gpt-4o'),
});

export const factCheckingAgent = new Agent({
  name: 'Fact Checking Agent',
  instructions: `
    You are a fact-checking specialist. Your job is to:
    1. Verify claims made by other agents or in user queries
    2. Identify potential misinformation or unsubstantiated claims
    3. Cross-reference information across multiple reliable sources
    4. Provide corrections with supporting evidence
    5. Rate the confidence level of verified information
    
    Be thorough and skeptical, but fair in your assessments.
  `,
  model: openai('gpt-4o-mini'),
});

export const dataAnalysisAgent = new Agent({
  name: 'Data Analysis Agent',
  instructions: `
    You are a data analysis specialist. Your job is to:
    1. Interpret numerical data and statistics related to research queries
    2. Identify trends, patterns, and correlations in data
    3. Evaluate the methodology behind data collection and analysis
    4. Explain statistical concepts in accessible language
    5. Create clear summaries of data-driven findings
    
    Always consider sample sizes, statistical significance, and potential biases in data.
  `,
  model: openai('gpt-4o'),
});
```

### mastra\index.ts

```typescript
import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { researchNetwork } from './network';
import { webSearchAgent } from './agents';
import { agentWorkflow } from './workflows';

export const mastra = new Mastra({
  agents: {
    webSearchAgent,
  },
  networks: {
    researchNetwork,
  },
  workflows: {
    agentWorkflow,
  },
  logger: new PinoLogger({ name: 'Chef', level: 'info' }),
  serverMiddleware: [
    {
      handler: (c, next) => {
        console.log('Middleware called');
        return next();
      },
    },
  ],
});
```

### mastra\network\index.ts

```typescript
import { openai } from '@ai-sdk/openai';
import { AgentNetwork } from '@mastra/core/network';
import {
  primaryResearchAgent,
  webSearchAgent,
  academicResearchAgent,
  factCheckingAgent,
  dataAnalysisAgent,
} from '../agents';

export const researchNetwork = new AgentNetwork({
  name: 'Research Network',
  agents: [primaryResearchAgent, webSearchAgent, academicResearchAgent, factCheckingAgent, dataAnalysisAgent],
  model: openai('gpt-4o'), // Add the model property which is required
  instructions: `
      You are a research coordination system that routes queries to the appropriate specialized agents.
      
      Your available agents are:
      1. Primary Research Agent: Coordinates research efforts, breaks down complex questions, and synthesizes information
      2. Web Search Agent: Finds up-to-date information online with proper citations
      3. Academic Research Agent: Provides academic perspectives, theories, and scholarly context
      4. Fact Checking Agent: Verifies claims and identifies potential misinformation
      5. Data Analysis Agent: Interprets numerical data, statistics, and identifies patterns
      
      For each user query:
      1. Start with the Primary Research Agent to analyze the query and break it down
      2. Route sub-questions to the appropriate specialized agents based on their expertise
      3. Use the Fact Checking Agent to verify important claims when necessary
      4. Return to the Primary Research Agent to synthesize all findings into a comprehensive response
      
      Always maintain a chain of evidence and proper attribution between agents.
    `,
});
```

### mastra\workflows\index.ts

```typescript
import { Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { webSearchAgent } from '../agents';

export const agentWorkflow = new Workflow({
  name: 'Agent Workflow',
  steps: [webSearchAgent.toStep()],
  triggerSchema: z.object({
    prompt: z.string(),
  }),
});

agentWorkflow
  .step(webSearchAgent, {
    variables: {
      prompt: {
        step: 'trigger',
        path: 'prompt',
      },
    },
  })
  .commit();
```
