### package.json
```json
{
  "name": "examples-agui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "mastra:dev": "mastra dev",
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@ai-sdk/openai": "^1.3.22",
    "@copilotkit/react-core": "^1.8.10",
    "@copilotkit/react-ui": "^1.8.10",
    "@copilotkit/runtime": "^1.8.10",
    "@mastra/agui": "latest",
    "@mastra/core": "latest",
    "@mastra/libsql": "latest",
    "@mastra/loggers": "latest",
    "@mastra/memory": "latest",
    "mastra": "latest",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^3.25.57"
  },
  "pnpm": {
    "overrides": {
      "@mastra/core": "link:../../packages/core",
      "@mastra/agui": "link:../../packages/agui",
      "@mastra/libsql": "link:../../stores/libsql",
      "@mastra/loggers": "link:../../packages/loggers",
      "@mastra/memory": "link:../../packages/memory",
      "mastra": "link:../../packages/cli"
    }
  },
  "devDependencies": {
    "@eslint/js": "^9.25.0",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@typescript-eslint/eslint-plugin": "^8.32.0",
    "@typescript-eslint/parser": "^8.32.0",
    "@vitejs/plugin-react": "^4.4.1",
    "eslint": "^9.28.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.0.0",
    "typescript": "^5.8.3",
    "vite": "^6.3.5"
  }
}

```

### mastra\agents\index.ts
```typescript
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn’t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative
`,
  model: openai('gpt-4o'),

  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
});

```

### mastra\index.ts
```typescript
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { registerCopilotKit } from '@mastra/agui';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { weatherAgent } from './agents';
import { myNetwork } from './network';

type WeatherRuntimeContext = {
  'user-id': string;
  'temperature-scale': 'celsius' | 'fahrenheit';
  location: string;
};

export const mastra = new Mastra({
  agents: { weatherAgent },
  networks: {
    myNetwork,
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ':memory:',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  server: {
    cors: {
      origin: '*',
      allowMethods: ['*'],
      allowHeaders: ['*'],
    },
    apiRoutes: [
      registerCopilotKit<WeatherRuntimeContext>({
        path: '/copilotkit',
        resourceId: 'weatherAgent',
        setContext: (c, runtimeContext) => {
          runtimeContext.set('user-id', c.req.header('X-User-ID') || 'anonymous');
          runtimeContext.set('temperature-scale', 'celsius');
          runtimeContext.set('location', c.req.header('X-User-Location') || 'unknown');
        },
      }),
    ],
  },
});

```

### mastra\network\index.ts
```typescript
import { AgentNetwork } from '@mastra/core/network';
import { weatherAgent } from '../agents';
import { openai } from '@ai-sdk/openai';

export const myNetwork = new AgentNetwork({
  name: 'myNetwork',
  agents: [weatherAgent],
  model: openai('gpt-4o'),
  instructions: `
        You are a helpful supervisor agent that can help users with a variety of tasks.
    `,
});

```

### vite-env.d.ts
```typescript
/// <reference types="vite/client" />

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

```
