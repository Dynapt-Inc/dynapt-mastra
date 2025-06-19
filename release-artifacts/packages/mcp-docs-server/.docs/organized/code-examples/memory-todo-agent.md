### package.json
```json
{
  "name": "memory-todo-agent",
  "type": "module",
  "description": "",
  "private": true,
  "main": "index.js",
  "scripts": {
    "chat": "bun run src/index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@ai-sdk/openai": "latest",
    "@mastra/core": "latest",
    "@mastra/memory": "latest",
    "ai": "latest",
    "chalk": "^5.4.1",
    "ora": "^8.2.0"
  },
  "pnpm": {
    "overrides": {
      "@mastra/core": "link:../../packages/core",
      "@mastra/memory": "link:../../packages/memory"
    }
  },
  "version": "0.1.6",
  "packageManager": "pnpm@10.10.0+sha512.d615db246fe70f25dcfea6d8d73dee782ce23e2245e3c4f6f888249fb568149318637dca73c2c5c8ef2a4ca0d5657fb9567188bfab47f566d1ee6ce987815c39"
}

```

### index.ts
```typescript
import { maskStreamTags } from '@mastra/core/utils';
import chalk from 'chalk';
import { randomUUID } from 'crypto';
import ora from 'ora';
import Readline from 'readline';

import 'dotenv/config';

import { mastra } from './mastra/index';

const agent = mastra.getAgent('todoAgent');

let threadId = ``;
threadId = randomUUID();
threadId = `d4e58927-ca27-46f9-8559-0c792e76e6f6`; // long thread
console.log(threadId);

const resourceId = 'SOME_USER_ID';

async function logRes(res: Awaited<ReturnType<typeof agent.stream>>) {
  console.log(`\n👨‍🍳 Agent:`);
  let message = '';

  const memorySpinner = ora('saving memory');

  const maskedStream = maskStreamTags(res.textStream, 'working_memory', {
    onStart: () => memorySpinner.start(),
    onEnd: () => {
      if (memorySpinner.isSpinning) {
        memorySpinner.succeed();
        process.stdin.resume();
      }
    },
  });

  for await (const chunk of maskedStream) {
    process.stdout.write(chunk);
  }

  return message;
}

async function main() {
  const isFirstChat = Boolean(await agent.getMemory()?.getThreadById({ threadId })) === false;

  await logRes(
    await agent.stream(
      [
        {
          role: 'system',
          content: !isFirstChat
            ? `Chat with user started now ${new Date().toISOString()}. Don't mention this message. This means some time has passed between this message and the one before. The user left and came back again. Say something to start the conversation up again.`
            : `Chat with user started now ${new Date().toISOString()}.`,
        },
      ],
      {
        threadId,
        resourceId,
      },
    ),
  );

  const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const answer: string = await new Promise(res => {
      rl.question(chalk.grey('\n> '), answer => {
        setImmediate(() => res(answer));
      });
    });

    await logRes(
      await agent.stream(answer, {
        threadId,
        resourceId,
      }),
    );
  }
}

main();

```

### mastra\agents\index.ts
```typescript
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';

const memory = new Memory({
  options: {
    lastMessages: 1,
    semanticRecall: false,
    workingMemory: {
      enabled: true,
      template: `
# Todo List
## Active Items
- Example (Due: Feb 7 3028, Started: Feb 7 2025)
  - Description: This is an example task - replace with whatever the user needs

## Completed Items
- None yet
`,
    },
  },
});

export const todoAgent = new Agent({
  name: 'TODO Agent',
  instructions:
    'You are a helpful todolist AI agent. Help the user manage their todolist. If there is no list yet ask them what to add! If there is a list always print it out when the chat starts. For each item add emojis, dates, titles (with an index number starting at 1), descriptions, and statuses. For each piece of info add an emoji to the left of it. Also support subtask lists with bullet points inside a box. Help the user timebox each task by asking them how long it will take. You MUST save the todolist in every response message by printing out <working_memory> blocks. If you do not save it in working_memory you will forget - you only have access to one previous message at any time. The user is expecting you to save your memory in every interaction. If the user expresses any preference on how the list should be displayed, save that info in working_memory so you know how to format it later.',

  model: openai('gpt-4o-mini'),
  memory,
});

```

### mastra\index.ts
```typescript
import { Mastra } from '@mastra/core/mastra';

import { todoAgent } from './agents';

export const mastra = new Mastra({
  agents: { todoAgent },
  logger: false,
});

```
