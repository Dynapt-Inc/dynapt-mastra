### package.json

```json
{
  "name": "examples-client-side-tools",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ai-sdk/openai": "^1.3.22",
    "@mastra/client-js": "latest",
    "@mastra/core": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.25.56"
  },
  "pnpm": {
    "overrides": {
      "@mastra/client-js": "link:../../client-sdks/client-js",
      "@mastra/core": "link:../../packages/core"
    }
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.28.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.24.1",
    "vite": "^6.2.0"
  },
  "packageManager": "pnpm@10.10.0+sha512.d615db246fe70f25dcfea6d8d73dee782ce23e2245e3c4f6f888249fb568149318637dca73c2c5c8ef2a4ca0d5657fb9567188bfab47f566d1ee6ce987815c39"
}
```

### mastra\agents\index.ts

```typescript
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

export const agent = new Agent({
  name: 'Test Agent',
  instructions: 'You are a browser client agent. You execute tools in the browser.',
  model: openai('gpt-4o'),
});
```

### mastra\index.ts

```typescript
import { Mastra } from '@mastra/core/mastra';
import { agent } from './agents';

export const mastra = new Mastra({
  agents: {
    agent,
  },
});
```

### vite-env.d.ts

```typescript
/// <reference types="vite/client" />
```
