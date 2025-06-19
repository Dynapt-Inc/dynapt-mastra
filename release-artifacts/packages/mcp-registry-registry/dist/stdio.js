#!/usr/bin/env node
import { registryData } from './chunk-YU6LNU6R.js';
import fs from 'fs/promises';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import path from 'path';
import { fileURLToPath } from 'url';

var RegistryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  servers_url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  count: z.union([z.number(), z.string()]).optional()
});
var RegistryFileSchema = z.object({
  registries: z.array(RegistryEntrySchema)
});
async function loadRegistryData() {
  try {
    return RegistryFileSchema.parse(registryData);
  } catch (error) {
    console.error("Error loading registry data:", error);
    return { registries: [] };
  }
}
function filterRegistries(registries, filters) {
  let filteredRegistries = [...registries];
  if (filters.id) {
    filteredRegistries = filteredRegistries.filter((registry) => registry.id === filters.id);
  }
  if (filters.tag) {
    filteredRegistries = filteredRegistries.filter((registry) => registry.tags?.includes(filters.tag));
  }
  if (filters.name) {
    const searchTerm = filters.name.toLowerCase();
    filteredRegistries = filteredRegistries.filter((registry) => registry.name.toLowerCase().includes(searchTerm));
  }
  return filteredRegistries;
}
function formatRegistryResponse(registries, detailed = false) {
  if (registries.length === 0) {
    return {
      count: 0,
      registries: []
    };
  }
  if (detailed) {
    return {
      count: registries.length,
      registries: registries.map((registry) => ({
        id: registry.id,
        name: registry.name,
        description: registry.description,
        url: registry.url,
        servers_url: registry.servers_url,
        tags: registry.tags || [],
        count: registry.count
      }))
    };
  }
  return {
    count: registries.length,
    registries: registries.map((registry) => ({
      id: registry.id,
      name: registry.name,
      description: registry.description
    }))
  };
}
async function getRegistryListings(filters = {}, options = {}) {
  try {
    const registryData2 = await loadRegistryData();
    const filteredRegistries = filterRegistries(registryData2.registries, filters);
    return formatRegistryResponse(filteredRegistries, options.detailed);
  } catch (error) {
    console.error("Error getting registry listings:", error);
    throw error;
  }
}

// src/tools/list.ts
var listInputSchema = z.object({
  id: z.string().optional(),
  tag: z.string().optional(),
  name: z.string().optional(),
  detailed: z.boolean().optional().default(false)
});
var listTool = {
  name: "registryList",
  description: "List available MCP registries. Can filter by ID, tag, or name and provide detailed or summary views.",
  async execute(input) {
    try {
      const result = await getRegistryListings(
        {
          id: input.id,
          tag: input.tag,
          name: input.name
        },
        {
          detailed: input.detailed
        }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing registries: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
};

// src/registry/fetch-servers.ts
async function fetchServersFromRegistry(registryId) {
  try {
    const registry = registryData.registries.find((r) => r.id === registryId);
    if (!registry) {
      throw new Error(`Registry with ID "${registryId}" not found.`);
    }
    if (!registry.servers_url) {
      throw new Error(`Registry "${registry.name}" does not have a servers endpoint.`);
    }
    console.log(`Fetching servers from ${registry.name} at ${registry.servers_url}`);
    const response = await fetch(registry.servers_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch servers from ${registry.servers_url}: ${response.statusText}`);
    }
    const data = await response.json();
    if (registry.postProcessServers) {
      console.log(`Using custom post-processor for ${registry.name}`);
      return registry.postProcessServers(data);
    }
    throw new Error(`No post-processor found for registry ${registry.name}`);
  } catch (error) {
    console.error("Error fetching servers:", error);
    throw error;
  }
}
function filterServers(servers, filters) {
  let filteredServers = [...servers];
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredServers = filteredServers.filter(
      (server2) => server2.name.toLowerCase().includes(searchTerm) || server2.description.toLowerCase().includes(searchTerm)
    );
  }
  return filteredServers;
}
async function getServersFromRegistry(registryId, filters = {}) {
  try {
    const servers = await fetchServersFromRegistry(registryId);
    return filterServers(servers, filters);
  } catch (error) {
    console.error("Error getting servers from registry:", error);
    throw error;
  }
}

// src/tools/servers.ts
var serversInputSchema = z.object({
  registryId: z.string(),
  tag: z.string().optional(),
  search: z.string().optional()
});
var serversTool = {
  name: "registryServers",
  description: "Get servers from a specific MCP registry. Can filter by tag or search term.",
  async execute(input) {
    try {
      const result = await getServersFromRegistry(input.registryId, {
        search: input.search
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching servers: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
};
var __dirname = path.dirname(fileURLToPath(import.meta.url));
function fromPackageRoot(relativePath) {
  return path.resolve(__dirname, "..", relativePath);
}

// src/server.ts
var server = new Server(
  {
    name: "Registry Registry Server",
    version: JSON.parse(await fs.readFile(fromPackageRoot(`package.json`), "utf8")).version
  },
  {
    capabilities: {
      tools: {}
    }
  }
);
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "registryList",
      description: listTool.description,
      inputSchema: zodToJsonSchema(listInputSchema)
    },
    {
      name: "registryServers",
      description: serversTool.description,
      inputSchema: zodToJsonSchema(serversInputSchema)
    }
  ]
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "registryList": {
        const args = listInputSchema.parse(request.params.arguments);
        return await listTool.execute(args);
      }
      case "registryServers": {
        const args = serversInputSchema.parse(request.params.arguments);
        return await serversTool.execute(args);
      }
      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${request.params.name}`
            }
          ],
          isError: true
        };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: "text",
            text: `Invalid arguments: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
          }
        ],
        isError: true
      };
    }
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Registry Registry MCP Server running on stdio");
}

// src/stdio.ts
runServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
