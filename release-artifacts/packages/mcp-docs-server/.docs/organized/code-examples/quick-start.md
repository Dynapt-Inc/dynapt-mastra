### package.json
```json
{
  "name": "examples-quick-start",
  "type": "module",
  "private": true,
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.17.57",
    "tsx": "^4.19.3",
    "typescript": "^5.8.2",
    "zod": "^3.25.56"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^1.2.12",
    "@ai-sdk/groq": "latest",
    "@ai-sdk/openai": "latest",
    "@mastra/core": "latest",
    "@mastra/loggers": "latest",
    "@mastra/memory": "latest",
    "ai": "latest"
  },
  "pnpm": {
    "overrides": {
      "@mastra/core": "link:../../packages/core",
      "@mastra/loggers": "link:../../packages/loggers",
      "@mastra/memory": "link:../../packages/memory"
    }
  },
  "version": "0.0.1",
  "packageManager": "pnpm@10.10.0+sha512.d615db246fe70f25dcfea6d8d73dee782ce23e2245e3c4f6f888249fb568149318637dca73c2c5c8ef2a4ca0d5657fb9567188bfab47f566d1ee6ce987815c39"
}

```

### index.ts
```typescript
import { z } from 'zod';

import { mastra } from './mastra';

const specieSchema = z.object({
  species: z.string(),
});

const main = async () => {
  const agentCat = mastra.getAgent('catOne');

  try {
    const result = await agentCat.generate('What is the most popular cat species?', {
      output: specieSchema,
    });

    const res = specieSchema.parse(result?.object);

    console.log(res.species);

    const { start } = mastra.getWorkflow('logCatWorkflow').createRun();

    await start({ triggerData: { name: res.species } });
  } catch (err) {
    console.error(err);
  }
};

main();

```

### mastra\agents\agent.ts
```typescript
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core';

export const catOne = new Agent({
  name: 'cat-one',
  instructions:
    'You are a feline expert with comprehensive knowledge of all cat species, from domestic breeds to wild big cats. As a lifelong cat specialist, you understand their behavior, biology, social structures, and evolutionary history in great depth. If you are asked for a specie name, do not return a paragraph, a succint two or three letter name of the species will suffice.',
  model: openai('gpt-4o'),
});

```

### mastra\index.ts
```typescript
import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { catOne } from './agents/agent';
import { logCatWorkflow as legacy_catWorkflow } from './legacy-workflows';
import { logCatWorkflow } from './workflows';

export const mastra = new Mastra({
  agents: { catOne },
  legacy_workflows: {
    legacy_catWorkflow,
  },
  workflows: {
    logCatWorkflow,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'debug',
  }),
});

```

### mastra\legacy-workflows\index.ts
```typescript
import { LegacyWorkflow as Workflow, LegacyStep as Step } from '@mastra/core/workflows/legacy';
import { z } from 'zod';

const logCatName = new Step({
  id: 'logCatName',
  outputSchema: z.object({
    rawText: z.string(),
  }),
  execute: async ({ context }) => {
    const name = context?.getStepResult<{ name: string }>('trigger')?.name;
    console.log(`Hello, ${name} 🐈`);
    return { rawText: `Hello ${name}` };
  },
});

export const logCatWorkflow = new Workflow({
  name: 'log-cat-workflow',
  triggerSchema: z.object({
    name: z.string(),
  }),
});

logCatWorkflow.step(logCatName).commit();

```

### mastra\workflows\index.ts
```typescript
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const logCatName = createStep({
  id: 'logCatName',
  inputSchema: z.object({
    name: z.string(),
  }),
  outputSchema: z.object({
    rawText: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log(`Hello, ${inputData.name} 🐈`);
    return { rawText: `Hello ${inputData.name}` };
  },
});

export const logCatWorkflow = createWorkflow({
  id: 'log-cat-workflow',
  inputSchema: z.object({
    name: z.string(),
  }),
  outputSchema: z.object({
    rawText: z.string(),
  }),
  steps: [logCatName],
})
  .then(logCatName)
  .commit();

```
