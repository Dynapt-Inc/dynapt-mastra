### package.json

```json
{
  "name": "workflow-with-inline-steps",
  "main": "index.js",
  "private": true,
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "mastra dev"
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
      "mastra": "link:../../packages/cli"
    }
  },
  "version": "0.0.1-alpha.2",
  "packageManager": "pnpm@10.10.0+sha512.d615db246fe70f25dcfea6d8d73dee782ce23e2245e3c4f6f888249fb568149318637dca73c2c5c8ef2a4ca0d5657fb9567188bfab47f566d1ee6ce987815c39"
}
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

const myWorkflow = new Workflow({
  name: 'my-workflow',
  triggerSchema: z.object({
    inputValue: z.number(),
  }),
});

myWorkflow
  .step(
    new Step({
      id: 'stepOne',
      inputSchema: z.object({
        value: z.number(),
      }),
      outputSchema: z.object({
        doubledValue: z.number(),
      }),
      execute: async ({ context }) => {
        const doubledValue = context?.triggerData.inputValue * 2;
        return { doubledValue };
      },
    }),
  )
  .then(
    new Step({
      id: 'stepTwo',
      inputSchema: z.object({
        valueToIncrement: z.number(),
      }),
      outputSchema: z.object({
        incrementedValue: z.number(),
      }),
      execute: async ({ context }) => {
        if (context?.steps.stepOne.status === 'success') {
          const incrementedValue = context?.steps.stepOne.output.doubledValue + 1;
          return { incrementedValue };
        }
        return { incrementedValue: 0 };
      },
    }),
  )
  .then(
    new Step({
      id: 'stepThree',
      execute: async ({ context, suspend }) => {
        if (context?.resumeData?.confirm !== 'true') {
          return suspend({
            message: 'Do you accept?',
          });
        }

        return {
          message: 'Thank you for accepting',
        };
      },
    }),
  );

myWorkflow.commit();

export { myWorkflow };
```
