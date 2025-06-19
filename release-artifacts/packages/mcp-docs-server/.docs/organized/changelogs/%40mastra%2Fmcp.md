# @mastra/mcp

## 0.10.4

### Patch Changes

- 63f6b7d: dependencies updates:
  - Updated dependency [`@modelcontextprotocol/sdk@^1.12.1` ↗︎](https://www.npmjs.com/package/@modelcontextprotocol/sdk/v/1.12.1) (from `^1.10.2`, in `dependencies`)
  - Updated dependency [`hono@^4.7.11` ↗︎](https://www.npmjs.com/package/hono/v/4.7.11) (from `^4.7.4`, in `dependencies`)
- 36f1c36: MCP Client and Server streamable http fixes
- bd1674f: Change how connection promise works for client connection
- 69f76f7: Fix Agents as tools when building mastra mcp server
- Updated dependencies [63f6b7d]
- Updated dependencies [12a95fc]
- Updated dependencies [4b0f8a6]
- Updated dependencies [51264a5]
- Updated dependencies [8e6f677]
- Updated dependencies [d70c420]
- Updated dependencies [ee9af57]
- Updated dependencies [36f1c36]
- Updated dependencies [2a16996]
- Updated dependencies [10d352e]
- Updated dependencies [9589624]
- Updated dependencies [53d3c37]
- Updated dependencies [751c894]
- Updated dependencies [577ce3a]
- Updated dependencies [9260b3a]
  - @mastra/core@0.10.6

## 0.10.4-alpha.1

### Patch Changes

- bd1674f: Change how connection promise works for client connection
- 69f76f7: Fix Agents as tools when building mastra mcp server

## 0.10.4-alpha.0

### Patch Changes

- 63f6b7d: dependencies updates:
  - Updated dependency [`@modelcontextprotocol/sdk@^1.12.1` ↗︎](https://www.npmjs.com/package/@modelcontextprotocol/sdk/v/1.12.1) (from `^1.10.2`, in `dependencies`)
  - Updated dependency [`hono@^4.7.11` ↗︎](https://www.npmjs.com/package/hono/v/4.7.11) (from `^4.7.4`, in `dependencies`)
- 36f1c36: MCP Client and Server streamable http fixes
- Updated dependencies [63f6b7d]
- Updated dependencies [36f1c36]
- Updated dependencies [10d352e]
- Updated dependencies [53d3c37]
  - @mastra/core@0.10.6-alpha.0

## 0.10.3

### Patch Changes

- fc579cd: [MASTRA-3554] Support MCP prompts for MCPServer and MCPClient
- Updated dependencies [d1ed912]
- Updated dependencies [f6fd25f]
- Updated dependencies [dffb67b]
- Updated dependencies [f1f1f1b]
- Updated dependencies [925ab94]
- Updated dependencies [f9816ae]
- Updated dependencies [82090c1]
- Updated dependencies [1b443fd]
- Updated dependencies [ce97900]
- Updated dependencies [f1309d3]
- Updated dependencies [14a2566]
- Updated dependencies [f7f8293]
- Updated dependencies [48eddb9]
  - @mastra/core@0.10.4

## 0.10.3-alpha.0

### Patch Changes

- fc579cd: [MASTRA-3554] Support MCP prompts for MCPServer and MCPClient
- Updated dependencies [f6fd25f]
- Updated dependencies [dffb67b]
- Updated dependencies [f1309d3]
- Updated dependencies [f7f8293]
  - @mastra/core@0.10.4-alpha.1

## 0.10.2

### Patch Changes

- 592a2db: Added different icons for agents and workflows in mcp tools list
- f0d559f: Fix peerdeps for alpha channel
- Updated dependencies [ee77e78]
- Updated dependencies [592a2db]
- Updated dependencies [e5dc18d]
- Updated dependencies [ab5adbe]
- Updated dependencies [1e8bb40]
- Updated dependencies [1b5fc55]
- Updated dependencies [195c428]
- Updated dependencies [f73e11b]
- Updated dependencies [37643b8]
- Updated dependencies [99fd6cf]
- Updated dependencies [c5bf1ce]
- Updated dependencies [add596e]
- Updated dependencies [8dc94d8]
- Updated dependencies [ecebbeb]
- Updated dependencies [79d5145]
- Updated dependencies [12b7002]
- Updated dependencies [2901125]
  - @mastra/core@0.10.2

## 0.10.2-alpha.1

### Patch Changes

- f0d559f: Fix peerdeps for alpha channel
- Updated dependencies [1e8bb40]
  - @mastra/core@0.10.2-alpha.2

## 0.10.2-alpha.0

### Patch Changes

- 592a2db: Added different icons for agents and workflows in mcp tools list
- Updated dependencies [592a2db]
- Updated dependencies [e5dc18d]
  - @mastra/core@0.10.2-alpha.0

## 0.10.1

### Patch Changes

- ab89d6a: Adds support for the full resources spec for MCP in the MCPClient and MCPServer classes. Includes resources/list, resources/read, resources/templates/list, resources/subscribe, resources/unsubscribe, notifications/resources/list_changed, and notifications/resources/updated APIs.
- bf5f17b: Adds ability to pass workflows into MCPServer to generate tools from the workflows. Each workflow will become a tool that can start the workflow run.
- 38aee50: Adds ability to pass an agents into an MCPServer instance to automatically generate tools from them.
- Updated dependencies [d70b807]
- Updated dependencies [6d16390]
- Updated dependencies [1e4a421]
- Updated dependencies [200d0da]
- Updated dependencies [bf5f17b]
- Updated dependencies [5343f93]
- Updated dependencies [38aee50]
- Updated dependencies [5c41100]
- Updated dependencies [d6a759b]
- Updated dependencies [6015bdf]
  - @mastra/core@0.10.1

## 0.10.1-alpha.0

### Patch Changes

- ab89d6a: Adds support for the full resources spec for MCP in the MCPClient and MCPServer classes. Includes resources/list, resources/read, resources/templates/list, resources/subscribe, resources/unsubscribe, notifications/resources/list_changed, and notifications/resources/updated APIs.
- bf5f17b: Adds ability to pass workflows into MCPServer to generate tools from the workflows. Each workflow will become a tool that can start the workflow run.
- 38aee50: Adds ability to pass an agents into an MCPServer instance to automatically generate tools from them.
- Updated dependencies [200d0da]
- Updated dependencies [bf5f17b]
- Updated dependencies [5343f93]
- Updated dependencies [38aee50]
- Updated dependencies [5c41100]
- Updated dependencies [d6a759b]
  - @mastra/core@0.10.1-alpha.1

## 0.10.0

### Minor Changes

- 83da932: Move @mastra/core to peerdeps

### Patch Changes

- 0a3ae6d: Fixed a bug where tool input schema properties that were optional became required
- 23f258c: Add new list and get routes for mcp servers. Changed route make-up for more consistency with existing API routes. Lastly, added in a lot of extra detail that can be optionally passed to the mcp server per the mcp spec.
- 2672a05: Add MCP servers and tool call execution to playground
- Updated dependencies [b3a3d63]
- Updated dependencies [344f453]
- Updated dependencies [0a3ae6d]
- Updated dependencies [95911be]
- Updated dependencies [f53a6ac]
- Updated dependencies [5eb5a99]
- Updated dependencies [7e632c5]
- Updated dependencies [1e9fbfa]
- Updated dependencies [eabdcd9]
- Updated dependencies [90be034]
- Updated dependencies [99f050a]
- Updated dependencies [d0ee3c6]
- Updated dependencies [b2ae5aa]
- Updated dependencies [23f258c]
- Updated dependencies [a7292b0]
- Updated dependencies [0dcb9f0]
- Updated dependencies [2672a05]
  - @mastra/core@0.10.0

## 0.6.0-alpha.1

### Minor Changes

- 83da932: Move @mastra/core to peerdeps

### Patch Changes

- 0a3ae6d: Fixed a bug where tool input schema properties that were optional became required
- Updated dependencies [b3a3d63]
- Updated dependencies [344f453]
- Updated dependencies [0a3ae6d]
- Updated dependencies [95911be]
- Updated dependencies [5eb5a99]
- Updated dependencies [7e632c5]
- Updated dependencies [1e9fbfa]
- Updated dependencies [b2ae5aa]
- Updated dependencies [a7292b0]
- Updated dependencies [0dcb9f0]
  - @mastra/core@0.10.0-alpha.1

## 0.5.1-alpha.0

### Patch Changes

- 23f258c: Add new list and get routes for mcp servers. Changed route make-up for more consistency with existing API routes. Lastly, added in a lot of extra detail that can be optionally passed to the mcp server per the mcp spec.
- 2672a05: Add MCP servers and tool call execution to playground
- Updated dependencies [f53a6ac]
- Updated dependencies [eabdcd9]
- Updated dependencies [90be034]
- Updated dependencies [99f050a]
- Updated dependencies [d0ee3c6]
- Updated dependencies [23f258c]
- Updated dependencies [2672a05]
  - @mastra/core@0.9.5-alpha.0

## 0.5.0

### Minor Changes

- e229660: MCPClient: expose connected client resources.

  Added a new `getResources()` method to the MCPClient class that allows clients to retrieve resources from connected MCP servers. Resources are data or content exposed by MCP servers that can be accessed by clients.

  The implementation includes:

  - Direct access to resources from all connected MCP servers, grouped by server name
  - Robust error handling that allows partial results when some servers fail
  - Comprehensive test coverage with real server implementation

  This feature enables applications to access data and content exposed by MCP servers through the resources capability, such as files, databases, or other content sources.

### Patch Changes

- 8baa6c8: passes runtimeContext to the logger function inside MCPClient tool calls
- 396be50: updated mcp server routes for MCP SSE for use with hono server
- da082f8: Switch from serializing json schema string as a function to a library that creates a zod object in memory from the json schema. This reduces the errors we were seeing from zod schema code that could not be serialized.
- bb1e2c8: Make sure mcp handlers can only be registered once
- edf1e88: allows ability to pass McpServer into the mastra class and creates an endpoint /api/servers/:serverId/mcp to POST messages to an MCP server
- Updated dependencies [396be50]
- Updated dependencies [ab80e7e]
- Updated dependencies [c3bd795]
- Updated dependencies [da082f8]
- Updated dependencies [a5810ce]
- Updated dependencies [3e9c131]
- Updated dependencies [3171b5b]
- Updated dependencies [973e5ac]
- Updated dependencies [daf942f]
- Updated dependencies [0b8b868]
- Updated dependencies [9e1eff5]
- Updated dependencies [6fa1ad1]
- Updated dependencies [c28d7a0]
- Updated dependencies [edf1e88]
  - @mastra/core@0.9.4

## 0.5.0-alpha.6

### Patch Changes

- Updated dependencies [3e9c131]
  - @mastra/core@0.9.4-alpha.4

## 0.5.0-alpha.5

### Patch Changes

- 8baa6c8: passes runtimeContext to the logger function inside MCPClient tool calls

## 0.5.0-alpha.4

### Patch Changes

- 396be50: updated mcp server routes for MCP SSE for use with hono server
- da082f8: Switch from serializing json schema string as a function to a library that creates a zod object in memory from the json schema. This reduces the errors we were seeing from zod schema code that could not be serialized.
- Updated dependencies [396be50]
- Updated dependencies [c3bd795]
- Updated dependencies [da082f8]
- Updated dependencies [a5810ce]
  - @mastra/core@0.9.4-alpha.3

## 0.5.0-alpha.3

### Patch Changes

- bb1e2c8: Make sure mcp handlers can only be registered once

## 0.5.0-alpha.2

### Patch Changes

- Updated dependencies [3171b5b]
- Updated dependencies [973e5ac]
- Updated dependencies [9e1eff5]

... 1750 more lines hidden. See full changelog in package directory.