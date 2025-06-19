### package.json
```json
{
  "name": "examples-workflow-with-separate-steps",
  "type": "module",
  "private": true,
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "mastra dev",
    "start:workflow": "npx tsx src/index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "description": "",
  "devDependencies": {
    "@types/node": "^20.17.57",
    "mastra": "latest",
    "tsx": "^4.19.3",
    "typescript": "^5.8.2",
    "zod": "^3.25.56"
  },
  "dependencies": {
    "@mastra/core": "latest"
  },
  "pnpm": {
    "overrides": {
      "@mastra/core": "link:../../packages/core",
      "mastra": "link:../../packages/mastra"
    }
  },
  "version": "0.0.1-alpha.2",
  "packageManager": "pnpm@10.10.0+sha512.d615db246fe70f25dcfea6d8d73dee782ce23e2245e3c4f6f888249fb568149318637dca73c2c5c8ef2a4ca0d5657fb9567188bfab47f566d1ee6ce987815c39"
}

```

### index.ts
```typescript
import { mastra } from './mastra';

async function main() {
  const myWorkflow = mastra.getWorkflow('myWorkflow');
  const { start } = myWorkflow.createRun();
  try {
    const res = await start({
      triggerData: {
        inputValue: 30,
      },
    });
    console.log(res.results);
  } catch (e) {
    console.log(e);
  }
}

main();

```

### mastra\index.ts
```typescript
import { Mastra } from '@mastra/core';

import { myWorkflow } from './workflows';

export const mastra = new Mastra({
  workflows: {
    myWorkflow,
  },
});

```

### mastra\workflows\index.ts
```typescript
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';

const stepOne = new Step({
  id: 'stepOne',
  execute: async ({ context }) => {
    const triggerData = context?.triggerData;
    const doubledValue = triggerData.inputValue * 2;
    return { doubledValue };
  },
});

const stepTwo = new Step({
  id: 'stepTwo',
  execute: async ({ context }) => {
    if (context?.steps.stepOne.status !== 'success') {
      throw new Error('stepOne failed');
    }
    const stepOneResult = context?.steps.stepOne?.output;
    const incrementedValue = stepOneResult.doubledValue + 1;
    return { incrementedValue };
  },
});

const stepThree = new Step({
  id: 'stepThree',
  execute: async ({ context }) => {
    const triggerData = context?.triggerData;
    const tripledValue = triggerData.inputValue * 3;
    return { tripledValue };
  },
});

const stepFour = new Step({
  id: 'stepFour',
  execute: async ({ context }) => {
    if (context?.steps.stepThree.status !== 'success') {
      throw new Error('stepThree failed');
    }
    const stepThreeResult = context?.steps.stepThree?.output;
    const isEven = stepThreeResult.tripledValue % 2 === 0;
    return { isEven };
  },
});

export const myWorkflow = new Workflow({
  name: 'my-workflow',
  triggerSchema: z.object({
    inputValue: z.number(),
  }),
});

myWorkflow.step(stepOne).then(stepTwo).step(stepThree).then(stepFour).commit();

const { start } = myWorkflow.createRun();

const result = await start({ triggerData: { inputValue: 3 } });

console.log(result);

```
