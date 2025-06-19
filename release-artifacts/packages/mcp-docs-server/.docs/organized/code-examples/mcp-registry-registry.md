### package.json

```json
{
  "name": "examples-mcp-registry-registry",
  "type": "module",
  "private": true,
  "description": "",
  "main": "index.js",
  "version": "0.0.1",
  "scripts": {
    "start-deployed": "npx bun src/with-deployed.ts",
    "start": "npx bun src/index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@ai-sdk/openai": "^1.3.22",
    "@mastra/core": "latest",
    "@mastra/mcp": "latest",
    "@mastra/mcp-registry-registry": "latest",
    "zod": "^3.25.56"
  },
  "pnpm": {
    "overrides": {
      "@mastra/mcp": "link:../../packages/mcp",
      "@mastra/mcp-registry-registry": "link:../../packages/mcp-registry-registry",
      "@mastra/core": "link:../../packages/core"
    }
  },
  "packageManager": "pnpm@10.10.0+sha512.d615db246fe70f25dcfea6d8d73dee782ce23e2245e3c4f6f888249fb568149318637dca73c2c5c8ef2a4ca0d5657fb9567188bfab47f566d1ee6ce987815c39"
}
```

### mastra\agents\index.ts

```typescript
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { MCPClient } from '@mastra/mcp';

const mcp = new MCPClient({
  servers: {
    registry: {
      command: 'node',
      args: ['../../packages/mcp-registry-registry/dist/stdio.js'],
    },
  },
});

export const mcpRegistryAgent = new Agent({
  name: 'MCP Registry Agent',
  instructions: `You are a helpful assistant that provides information about MCP registries. You can search for registries by ID, tag, or name.`,
  model: openai('gpt-4o'),
  tools: await mcp.getTools(),
});
```

### mastra\index.ts

```typescript
import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { mcpRegistryAgent } from './agents/index';

export const mastra = new Mastra({
  agents: { mcpRegistryAgent },
  logger: new PinoLogger({ name: 'MCP Registry', level: 'info' }),
});
```
