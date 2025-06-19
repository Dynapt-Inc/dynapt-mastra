### package.json
```json
{
  "name": "examples-a2a",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "description": "Example of using Mastra's A2A protocol with the client SDK",
  "main": "dist/index.js",
  "scripts": {
    "start": "tsx src/index.ts",
    "mastra:dev": "mastra dev",
    "build": "tsc",
    "dev": "tsx watch src/index.ts"
  },
  "keywords": [
    "mastra",
    "a2a",
    "agent-to-agent",
    "example"
  ],
  "author": "Mastra Team",
  "license": "MIT",
  "dependencies": {
    "@ai-sdk/openai": "^1.3.22",
    "@mastra/client-js": "latest",
    "@mastra/core": "latest",
    "@mastra/loggers": "link:../../packages/loggers",
    "dotenv": "^16.3.1",
    "zod": "^3.25.56"
  },
  "devDependencies": {
    "mastra": "latest",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  },
  "pnpm": {
    "overrides": {
      "@mastra/core": "link:../../packages/core",
      "mastra": "link:../../packages/cli",
      "@mastra/client-js": "link:../../client-sdks/client-js",
      "@mastra/loggers": "link:../../packages/loggers"
    }
  },
  "packageManager": "pnpm@10.9.0+sha512.0486e394640d3c1fb3c9d43d49cf92879ff74f8516959c235308f5a8f62e2e19528a65cdc2a3058f587cde71eba3d5b56327c8c33a97e4c4051ca48a10ca2d5f"
}

```

### index.ts
```typescript
import { MastraClient } from '@mastra/client-js';

// Initialize the Mastra client
const client = new MastraClient({
  baseUrl: process.env.MASTRA_BASE_URL || 'http://localhost:4111',
});

/**
 * Example of using the A2A protocol to interact with agents
 */
async function main() {
  try {
    // Get the agent ID - this would be the ID of an agent you've created
    const agentId = 'myAgent';

    console.log(`🤖 Connecting to agent: ${agentId} via A2A protocol\n`);

    // Get the A2A client for the agent
    const a2aClient = client.getA2A(agentId);

    // Step 1: Get the agent card to see its capabilities
    console.log('📋 Fetching agent card...');
    const agentCard = await a2aClient.getCard();

    console.log(`\nAgent Name: ${agentCard.name}`);
    console.log(`Description: ${agentCard.description}`);
    console.log(`Capabilities: ${JSON.stringify(agentCard.capabilities)}`);
    console.log(`API Version: ${agentCard.version}`);
    console.log('\n-------------------\n');

    // Step 2: Send a message to the agent
    const taskId = `task-${Date.now()}`;
    console.log(`📤 Sending message to agent (Task ID: ${taskId})...`);

    const query = 'What are the latest developments in AI agent networks?';
    console.log(`Query: ${query}`);

    const response = await a2aClient.sendMessage({
      id: taskId,
      message: {
        role: 'user',
        parts: [{ type: 'text', text: query }],
      },
    });

    console.log(response);

    console.log(`\nTask Status: ${response.task.status}`);
    console.log('\n🤖 Agent Response:');
    console.log(
      response.task.status.message?.parts[0]?.type === 'text'
        ? response.task.status.message.parts[0].text
        : 'No response content',
    );

    console.log('\n-------------------\n');

    // Step 3: Get task status
    console.log(`📥 Checking task status (Task ID: ${taskId})...`);

    const taskStatus = await a2aClient.getTask({
      id: taskId,
    });

    console.log(`Task Status: ${taskStatus.status}`);
    console.log('\n-------------------\n');

    // Step 4: Demonstrate agent-to-agent communication
    console.log('🔄 Demonstrating agent-to-agent communication...');

    // Get another agent for A2A communication
    const secondAgentId = process.env.SECOND_AGENT_ID || 'contentCreatorAgent';
    console.log(`Connecting to second agent: ${secondAgentId}`);

    const secondA2aClient = client.getA2A(secondAgentId);

    // First agent gathers information
    const researchTaskId = `research-${Date.now()}`;
    console.log(`\nStep 1: First agent (${agentId}) researches the topic...`);

    const researchQuery = 'Provide a brief summary of agent networks in AI';
    const researchResponse = await a2aClient.sendMessage({
      id: researchTaskId,
      message: {
        role: 'user',
        parts: [{ type: 'text', text: researchQuery }],
      },
    });

    const researchResult =
      researchResponse.task.status.message?.parts[0]?.type === 'text'
        ? researchResponse.task.status.message.parts[0].text
        : '';
    console.log('\nResearch Results:');
    console.log(researchResult.substring(0, 150) + '...');

    // Second agent transforms the research into content
    const contentTaskId = `content-${Date.now()}`;
    console.log(`\nStep 2: Second agent (${secondAgentId}) transforms research into content...`);

    const contentPrompt = `Transform this research into an engaging blog post introduction:\n\n${researchResult}`;
    const contentResponse = await secondA2aClient.sendMessage({
      id: contentTaskId,
      message: {
        role: 'user',
        parts: [{ type: 'text', text: contentPrompt }],
      },
    });

    console.log('\nFinal Content:');
    console.log(
      contentResponse.task.status.message?.parts[0]?.type === 'text'
        ? contentResponse.task.status.message.parts[0].text
        : 'No content generated',
    );

    console.log('\n-------------------\n');
    console.log('✅ A2A example completed successfully!');
  } catch (error) {
    console.error('❌ Error in A2A example:', error);
  }
}

// Run the example
main();

```

### mastra\agents\index.ts
```typescript
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';

export const myAgent = new Agent({
  name: 'myAgent',
  instructions: 'My Agent Instructions',
  model: openai('gpt-4o'),
});

```

### mastra\index.ts
```typescript
import { Mastra } from '@mastra/core/mastra';
import { myAgent } from './agents';

export const mastra = new Mastra({
  agents: {
    myAgent,
  },
});

```
