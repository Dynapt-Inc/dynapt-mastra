### package.json
```json
{
  "name": "examples-agent",
  "type": "module",
  "private": true,
  "description": "",
  "main": "index.js",
  "version": "0.0.1",
  "dependencies": {
    "@ai-sdk/openai": "latest",
    "@mastra/client-js": "latest",
    "@mastra/core": "latest",
    "@mastra/loggers": "latest",
    "@mastra/mcp": "latest",
    "@mastra/memory": "latest",
    "@mastra/voice-openai": "latest",
    "@mastra/libsql": "latest",
    "ai": "^4.3.16",
    "fetch-to-node": "^2.1.0",
    "mastra": "latest",
    "zod": "^3.25.56"
  },
  "pnpm": {
    "overrides": {
      "@mastra/core": "link:../../packages/core",
      "@mastra/loggers": "link:../../packages/loggers",
      "@mastra/voice-openai": "link:../../voice/openai",
      "@mastra/memory": "link:../../packages/memory",
      "@mastra/client-js": "link:../../client-sdks/client-js",
      "@mastra/mcp": "link:../../packages/mcp",
      "@mastra/libsql": "link:../../stores/libsql",
      "mastra": "link:../../packages/cli"
    }
  },
  "scripts": {
    "start-deployed": "npx bun src/with-deployed.ts",
    "start": "npx bun src/index.ts",
    "mastra:build": "mastra build",
    "mastra:dev": "mastra dev"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "packageManager": "pnpm@10.9.0+sha512.0486e394640d3c1fb3c9d43d49cf92879ff74f8516959c235308f5a8f62e2e19528a65cdc2a3058f587cde71eba3d5b56327c8c33a97e4c4051ca48a10ca2d5f"
}

```

### client.ts
```typescript
import { MCPClient } from '@mastra/mcp';

async function main() {
  const mcpClient = new MCPClient({
    servers: {
      myMcpServer: {
        url: new URL('http://localhost:4111/api/mcp/myMcpServer/mcp'),
      },
    },
  });

  const tools = await mcpClient.getTools();
  console.log('Tools:', tools);
}

main();

```

### index.ts
```typescript
import { z } from 'zod';
import { mastra } from './mastra';

const agent = mastra.getAgent('chefAgent');
const responsesAgent = mastra.getAgent('chefAgentResponses');

async function text() {
  // Query 1: Basic pantry ingredients
  const query1 =
    'In my kitchen I have: pasta, canned tomatoes, garlic, olive oil, and some dried herbs (basil and oregano). What can I make?';
  console.log(`Query 1: ${query1}`);

  const pastaResponse = await agent.generate(query1);
  console.log('\n👨‍🍳 Chef Michel:', pastaResponse.text);
  console.log('\n-------------------\n');
}

async function generateText() {
  // Query 1: Basic pantry ingredients

  const query1 =
    'In my kitchen I have: pasta, canned tomatoes, garlic, olive oil, and some dried herbs (basil and oregano). What can I make?';
  console.log(`Query 1: ${query1}`);

  const pastaResponse = await agent.generate(query1);

  console.log('\n👨‍🍳 Chef Michel:', pastaResponse.text);
  console.log('\n-------------------\n');
}

async function textStream() {
  // Query 2: More ingredients
  const query2 =
    "Now I'm over at my friend's house, and they have: chicken thighs, coconut milk, sweet potatoes, and some curry powder.";
  console.log(`Query 2: ${query2}`);

  const curryResponse = await agent.stream(query2);

  console.log('\n👨‍🍳 Chef Michel: ');

  // Handle the stream
  for await (const chunk of curryResponse.textStream) {
    // Write each chunk without a newline to create a continuous stream
    process.stdout.write(chunk);
  }

  console.log('\n\n✅ Recipe complete!');
}

async function generateStream() {
  // Query 2: More ingredients
  const query2 =
    "Now I'm over at my friend's house, and they have: chicken thighs, coconut milk, sweet potatoes, and some curry powder.";
  console.log(`Query 2: ${query2}`);

  const curryResponse = await agent.stream([query2]);

  console.log('\n👨‍🍳 Chef Michel: ');

  // Handle the stream
  for await (const chunk of curryResponse.textStream) {
    // Write each chunk without a newline to create a continuous stream
    process.stdout.write(chunk);
  }

  console.log('\n\n✅ Recipe complete!');
}

async function textObject() {
  // Query 3: Generate a lasagna recipe
  const query3 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 3: ${query3}`);

  const lasagnaResponse = await agent.generate(query3, {
    output: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });
  console.log('\n👨‍🍳 Chef Michel:', lasagnaResponse.object);
  console.log('\n-------------------\n');
}

async function experimentalTextObject() {
  // Query 3: Generate a lasagna recipe
  const query3 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 3: ${query3}`);

  const lasagnaResponse = await agent.generate(query3, {
    experimental_output: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });
  console.log('\n👨‍🍳 Chef Michel:', lasagnaResponse.object);
  console.log('\n-------------------\n');
}

async function textObjectJsonSchema() {
  // Query 3: Generate a lasagna recipe
  const query3 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 3: ${query3}`);

  const lasagnaResponse = await agent.generate(query3, {
    output: {
      type: 'object',
      additionalProperties: false,
      required: ['ingredients', 'steps'],
      properties: {
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              amount: { type: 'number' },
            },
            required: ['name', 'amount'],
          },
        },
        steps: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  });

  console.log('\n👨‍🍳 Chef Michel:', lasagnaResponse.object);
  console.log('\n-------------------\n');
}

async function generateObject() {
  // Query 3: Generate a lasagna recipe
  const query3 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 3: ${query3}`);

  const lasagnaResponse = await agent.generate([query3], {
    output: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });
  console.log('\n👨‍🍳 Chef Michel:', lasagnaResponse.object);
  console.log('\n-------------------\n');
}

async function streamObject() {
  // Query 8: Generate a lasagna recipe
  const query8 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 8: ${query8}`);

  const lasagnaStreamResponse = await agent.stream(query8, {
    output: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });

  console.log('\n👨‍🍳 Chef Michel: ');

  // Handle the stream
  for await (const chunk of lasagnaStreamResponse.textStream) {
    // Write each chunk without a newline to create a continuous stream
    process.stdout.write(chunk);
  }

  console.log('\n\n✅ Recipe complete!');
}

async function generateStreamObject() {
  // Query 9: Generate a lasagna recipe
  const query9 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 9: ${query9}`);

  const lasagnaStreamResponse = await agent.stream([query9], {
    output: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });

  console.log('\n👨‍🍳 Chef Michel: ');

  // Handle the stream
  for await (const chunk of lasagnaStreamResponse.textStream) {
    // Write each chunk without a newline to create a continuous stream
    process.stdout.write(chunk);
  }

  console.log('\n\n✅ Recipe complete!');
}

async function generateExperimentalStreamObject() {
  // Query 9: Generate a lasagna recipe
  const query9 = 'I want to make lasagna, can you generate a lasagna recipe for me?';
  console.log(`Query 9: ${query9}`);

  const lasagnaStreamResponse = await agent.stream([query9], {
    experimental_output: z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });

  console.log('\n👨‍🍳 Chef Michel: ');

  // Handle the stream
  for await (const chunk of lasagnaStreamResponse.textStream) {
    // Write each chunk without a newline to create a continuous stream
    process.stdout.write(chunk);
  }

  console.log('\n\n✅ Recipe complete!');
}

async function main() {
  // await text();

  // await experimentalTextObject();

  // await generateExperimentalStreamObject();

  // await generateText();

  // await textStream();

  // await generateStream();

  // await textObject();

  // await textObjectJsonSchema();

  // await generateObject();

  // await streamObject();

  // await generateStreamObject();

  const query1 = 'What happened in San Francisco last week?';

  const pastaResponse = await responsesAgent.generate(query1, {
    instructions: 'You take every recipe you get an exaggerate it and use weird ingredients.',
  });

  console.log(pastaResponse.text);
}

main();

```

### mastra\agents\index.ts
```typescript
import { openai } from '@ai-sdk/openai';
import { jsonSchema, tool } from 'ai';
import { OpenAIVoice } from '@mastra/voice-openai';
import { Memory } from '@mastra/memory';
import { Agent } from '@mastra/core/agent';
import { cookingTool } from '../tools/index.js';
import { myWorkflow } from '../workflows/index.js';

const memory = new Memory();

// Define schema directly compatible with OpenAI's requirements
const mySchema = jsonSchema({
  type: 'object',
  properties: {
    city: {
      type: 'string',
      description: 'The city to get weather information for',
    },
  },
  required: ['city'],
});

export const weatherInfo = tool({
  description: 'Fetches the current weather information for a given city',
  parameters: mySchema,
  execute: async ({ city }) => {
    return {
      city,
      weather: 'sunny',
      temperature_celsius: 19,
      temperature_fahrenheit: 66,
      humidity: 50,
      wind: '10 mph',
    };
  },
});

export const chefAgent = new Agent({
  name: 'Chef Agent',
  description: 'A chef agent that can help you cook great meals with whatever ingredients you have available.',
  instructions: `
    YOU MUST USE THE TOOL cooking-tool
    You are Michel, a practical and experienced home chef who helps people cook great meals with whatever 
    ingredients they have available. Your first priority is understanding what ingredients and equipment the user has access to, then suggesting achievable recipes. 
    You explain cooking steps clearly and offer substitutions when needed, maintaining a friendly and encouraging tone throughout.
    `,
  model: openai('gpt-4o-mini'),
  tools: {
    cookingTool,
    weatherInfo,
  },
  workflows: {
    myWorkflow,
  },
  memory,
  voice: new OpenAIVoice(),
});

export const dynamicAgent = new Agent({
  name: 'Dynamic Agent',
  instructions: ({ runtimeContext }) => {
    if (runtimeContext.get('foo')) {
      return 'You are a dynamic agent';
    }
    return 'You are a static agent';
  },
  model: ({ runtimeContext }) => {
    if (runtimeContext.get('foo')) {
      return openai('gpt-4o');
    }
    return openai('gpt-4o-mini');
  },
  tools: ({ runtimeContext }) => {
    const tools = {
      cookingTool,
    };

    if (runtimeContext.get('foo')) {
      tools['web_search_preview'] = openai.tools.webSearchPreview();
    }

    return tools;
  },
});

export const chefAgentResponses = new Agent({
  name: 'Chef Agent Responses',
  instructions: `
    You are Michel, a practical and experienced home chef who helps people cook great meals with whatever 
    ingredients they have available. Your first priority is understanding what ingredients and equipment the user has access to, then suggesting achievable recipes. 
    You explain cooking steps clearly and offer substitutions when needed, maintaining a friendly and encouraging tone throughout.
    `,
  model: openai.responses('gpt-4o'),
  tools: {
    web_search_preview: openai.tools.webSearchPreview(),
  },
  workflows: {
    myWorkflow,
  },
});

```

### mastra\index.ts
```typescript
import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

import { chefAgent, chefAgentResponses, dynamicAgent } from './agents/index';
import { myMcpServer, myMcpServerTwo } from './mcp/server';
import { myWorkflow } from './workflows';

const storage = new LibSQLStore({
  url: 'file:./mastra.db',
});

export const mastra = new Mastra({
  agents: { chefAgent, chefAgentResponses, dynamicAgent },
  logger: new PinoLogger({ name: 'Chef', level: 'debug' }),
  storage,
  mcpServers: {
    myMcpServer,
    myMcpServerTwo,
  },
  workflows: { myWorkflow },
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

### mastra\mcp\server.ts
```typescript
import { createTool } from '@mastra/core/tools';
import { MCPServer, MCPServerResources } from '@mastra/mcp';
import { z } from 'zod';
import { chefAgent } from '../agents';
import { myWorkflow } from '../workflows';

// Resources implementation
const weatherResources: MCPServerResources = {
  listResources: async () => {
    return [
      {
        uri: 'weather://current',
        name: 'Current Weather Data',
        description: 'Real-time weather data for the current location',
        mimeType: 'application/json',
      },
      {
        uri: 'weather://forecast',
        name: 'Weather Forecast',
        description: '5-day weather forecast',
        mimeType: 'application/json',
      },
      {
        uri: 'weather://historical',
        name: 'Historical Weather Data',
        description: 'Weather data from the past 30 days',
        mimeType: 'application/json',
      },
    ];
  },
  getResourceContent: async ({ uri }) => {
    if (uri === 'weather://current') {
      return [
        {
          text: JSON.stringify({
            location: 'San Francisco',
            temperature: 18,
            conditions: 'Partly Cloudy',
            humidity: 65,
            windSpeed: 12,
            updated: new Date().toISOString(),
          }),
        },
      ];
    } else if (uri === 'weather://forecast') {
      return [
        {
          text: JSON.stringify([
            { day: 1, high: 19, low: 12, conditions: 'Sunny' },
            { day: 2, high: 22, low: 14, conditions: 'Clear' },
            { day: 3, high: 20, low: 13, conditions: 'Partly Cloudy' },
            { day: 4, high: 18, low: 11, conditions: 'Rain' },
            { day: 5, high: 17, low: 10, conditions: 'Showers' },
          ]),
        },
      ];
    } else if (uri === 'weather://historical') {
      return [
        {
          text: JSON.stringify({
            averageHigh: 20,
            averageLow: 12,
            rainDays: 8,
            sunnyDays: 18,
            recordHigh: 28,
            recordLow: 7,
          }),
        },
      ];
    }

    throw new Error(`Resource not found: ${uri}`);
  },
  resourceTemplates: async () => {
    return [
      {
        uriTemplate: 'weather://custom/{city}/{days}',
        name: 'Custom Weather Forecast',
        description: 'Generates a custom weather forecast for a city and number of days.',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'weather://alerts?region={region}&level={level}',
        name: 'Weather Alerts',
        description: 'Get weather alerts for a specific region and severity level.',
        mimeType: 'application/json',
      },
    ];
  },
};

export const myMcpServer = new MCPServer({
  name: 'My Calculation & Data MCP Server',
  version: '1.0.0',
  tools: {
    calculator: createTool({
      id: 'calculator',
      description: 'Performs basic arithmetic operations (add, subtract).',
      inputSchema: z.object({
        num1: z.number().describe('The first number.'),
        num2: z.number().describe('The second number.'),
        operation: z.enum(['add', 'subtract']).describe('The operation to perform.'),
      }),
      execute: async ({ context }) => {
        const { num1, num2, operation } = context;
        if (operation === 'add') {
          return num1 + num2;
        }
        if (operation === 'subtract') {
          return num1 - num2;
        }
        throw new Error('Invalid operation');
      },
    }),
    fetchWeather: createTool({
      id: 'fetchWeather',
      description: 'Fetches a (simulated) weather forecast for a given city.',
      inputSchema: z.object({
        city: z.string().describe('The city to get weather for, e.g., London, Paris.'),
      }),
      execute: async ({ context }) => {
        const { city } = context;
        const temperatures = {
          london: '15°C',
          paris: '18°C',
          tokyo: '22°C',
        };
        const temp = temperatures[city.toLowerCase() as keyof typeof temperatures] || '20°C';
        return `The weather in ${city} is ${temp} and sunny.`;
      },
    }),
  },
});

export const myMcpServerTwo = new MCPServer({
  name: 'My Utility MCP Server',
  version: '1.0.0',
  agents: { chefAgent },
  workflows: { myWorkflow },
  resources: weatherResources,
  tools: {
    stringUtils: createTool({
      id: 'stringUtils',
      description: 'Performs utility operations on strings (uppercase, reverse).',
      inputSchema: z.object({
        text: z.string().describe('The input string.'),
        action: z.enum(['uppercase', 'reverse']).describe('The string action to perform.'),
      }),
      execute: async ({ context }) => {
        const { text, action } = context;
        if (action === 'uppercase') {
          return text.toUpperCase();
        }
        if (action === 'reverse') {
          return text.split('').reverse().join('');
        }
        throw new Error('Invalid string action');
      },
    }),
    greetUser: createTool({
      id: 'greetUser',
      description: 'Generates a personalized greeting.',
      inputSchema: z.object({
        name: z.string().describe('The name of the person to greet.'),
      }),
      execute: async ({ context }) => {
        return `Hello, ${context.name}! Welcome to the MCP server.`;
      },
    }),
  },
});

/**
 * Simulates an update to the content of 'weather://current'.
 * In a real application, this would be called when the underlying data for that resource changes.
 */
export const simulateCurrentWeatherUpdate = async () => {
  console.log('[Example] Simulating update for weather://current');
  // If you have access to the server instance that uses these resources (e.g., myMcpServerTwo)
  // you would call its notification method.
  await myMcpServerTwo.resources.notifyUpdated({ uri: 'weather://current' });
  console.log('[Example] Notification sent for weather://current update.');
};

/**
 * Simulates a change in the list of available weather resources (e.g., a new forecast type becomes available).
 * In a real application, this would be called when the overall list of resources changes.
 */
export const simulateResourceListChange = async () => {
  console.log('[Example] Simulating a change in the list of available weather resources.');
  // This would typically involve updating the actual list returned by `listResources`
  // and then notifying the server.
  // For this example, we'll just show the notification part.
  await myMcpServerTwo.resources.notifyListChanged();
  console.log('[Example] Notification sent for resource list change.');
};

```

### mastra\tools\index.ts
```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const cookingTool = createTool({
  id: 'cooking-tool',
  description: 'My tool description',
  inputSchema: z.object({
    ingredient: z.string(),
  }),
  execute: async ({ context }, options) => {
    console.log('My tool is running!', context.ingredient);
    if (options?.toolCallId) {
      console.log('Tool call ID:', options.toolCallId);
    }
    return 'My tool result';
  },
});

```

### mastra\workflows\index.ts
```typescript
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

export const myWorkflow = createWorkflow({
  id: 'my-workflow',
  description: 'My workflow description',
  inputSchema: z.object({
    ingredient: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
});

const step = createStep({
  id: 'my-step',
  description: 'My step description',
  inputSchema: z.object({
    ingredient: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData }) => {
    return {
      result: inputData.ingredient,
    };
  },
});

const step2 = createStep({
  id: 'my-step-2',
  description: 'My step description',
  inputSchema: z.object({
    result: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('chefAgentResponses');
    const response = await agent.generate(inputData.result);
    return {
      result: 'suh',
    };
  },
});

myWorkflow.then(step).then(step2).commit();

```
