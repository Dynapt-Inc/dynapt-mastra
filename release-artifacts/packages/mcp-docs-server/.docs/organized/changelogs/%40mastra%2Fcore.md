# @mastra/core

## 0.10.7-alpha.0

### Patch Changes

- d8f2d19: Add updateMessages API to storage classes (only support for PG and LibSQL for now) and to memory class. Additionally allow for metadata to be saved in the content field of a message.
- 9d52b17: Fix inngest workflows streaming and add step metadata
- 8ba1b51: Add custom routes by default to jsonapi

## 0.10.6

### Patch Changes

- 63f6b7d: dependencies updates:
  - Updated dependency [`@opentelemetry/exporter-trace-otlp-grpc@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/exporter-trace-otlp-http@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/otlp-exporter-base@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/otlp-exporter-base/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/otlp-transformer@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/otlp-transformer/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/sdk-node@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/sdk-node/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/semantic-conventions@^1.34.0` ↗︎](https://www.npmjs.com/package/@opentelemetry/semantic-conventions/v/1.34.0) (from `^1.33.0`, in `dependencies`)
  - Updated dependency [`ai@^4.3.16` ↗︎](https://www.npmjs.com/package/ai/v/4.3.16) (from `^4.2.2`, in `dependencies`)
  - Updated dependency [`cohere-ai@^7.17.1` ↗︎](https://www.npmjs.com/package/cohere-ai/v/7.17.1) (from `^7.16.0`, in `dependencies`)
  - Updated dependency [`hono@^4.7.11` ↗︎](https://www.npmjs.com/package/hono/v/4.7.11) (from `^4.5.1`, in `dependencies`)
  - Updated dependency [`hono-openapi@^0.4.8` ↗︎](https://www.npmjs.com/package/hono-openapi/v/0.4.8) (from `^0.4.6`, in `dependencies`)
  - Updated dependency [`json-schema-to-zod@^2.6.1` ↗︎](https://www.npmjs.com/package/json-schema-to-zod/v/2.6.1) (from `^2.6.0`, in `dependencies`)
  - Updated dependency [`pino@^9.7.0` ↗︎](https://www.npmjs.com/package/pino/v/9.7.0) (from `^9.6.0`, in `dependencies`)
  - Updated dependency [`xstate@^5.19.4` ↗︎](https://www.npmjs.com/package/xstate/v/5.19.4) (from `^5.19.2`, in `dependencies`)
- 12a95fc: Allow passing thread metadata to agent.generate and agent.stream. This will update or create the thread with the metadata passed in. Also simplifies the arguments for those two functions into a new memory property.
- 4b0f8a6: Allow passing a string, ui message, core message, or mastra message to agent.genTitle and agent.generateTitleFromUserMessage to restore previously changed public behaviour
- 51264a5: Fix fetchMemory return type and value
- 8e6f677: Dynamic default llm options
- d70c420: fix(core, memory): fix fetchMemory regression
- ee9af57: Add api for polling run execution result and get run by id
- 36f1c36: MCP Client and Server streamable http fixes
- 2a16996: Working Memory Schema and Template
- 10d352e: fix: bug in `workflow.parallel` return types causing type errors on c…
- 9589624: Throw Mastra Errors when building and bundling mastra application
- 53d3c37: Get workflows from an agent if not found from Mastra instance #5083
- 751c894: pass resourceId
- 577ce3a: deno support - use globalThis
- 9260b3a: changeset

## 0.10.6-alpha.5

### Patch Changes

- 12a95fc: Allow passing thread metadata to agent.generate and agent.stream. This will update or create the thread with the metadata passed in. Also simplifies the arguments for those two functions into a new memory property.
- 51264a5: Fix fetchMemory return type and value
- 8e6f677: Dynamic default llm options

## 0.10.6-alpha.4

### Patch Changes

- 9589624: Throw Mastra Errors when building and bundling mastra application

## 0.10.6-alpha.3

### Patch Changes

- d70c420: fix(core, memory): fix fetchMemory regression
- 2a16996: Working Memory Schema and Template

## 0.10.6-alpha.2

### Patch Changes

- 4b0f8a6: Allow passing a string, ui message, core message, or mastra message to agent.genTitle and agent.generateTitleFromUserMessage to restore previously changed public behaviour

## 0.10.6-alpha.1

### Patch Changes

- ee9af57: Add api for polling run execution result and get run by id
- 751c894: pass resourceId
- 577ce3a: deno support - use globalThis
- 9260b3a: changeset

## 0.10.6-alpha.0

### Patch Changes

- 63f6b7d: dependencies updates:
  - Updated dependency [`@opentelemetry/exporter-trace-otlp-grpc@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/exporter-trace-otlp-http@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/otlp-exporter-base@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/otlp-exporter-base/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/otlp-transformer@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/otlp-transformer/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/sdk-node@^0.201.1` ↗︎](https://www.npmjs.com/package/@opentelemetry/sdk-node/v/0.201.1) (from `^0.201.0`, in `dependencies`)
  - Updated dependency [`@opentelemetry/semantic-conventions@^1.34.0` ↗︎](https://www.npmjs.com/package/@opentelemetry/semantic-conventions/v/1.34.0) (from `^1.33.0`, in `dependencies`)
  - Updated dependency [`ai@^4.3.16` ↗︎](https://www.npmjs.com/package/ai/v/4.3.16) (from `^4.2.2`, in `dependencies`)
  - Updated dependency [`cohere-ai@^7.17.1` ↗︎](https://www.npmjs.com/package/cohere-ai/v/7.17.1) (from `^7.16.0`, in `dependencies`)
  - Updated dependency [`hono@^4.7.11` ↗︎](https://www.npmjs.com/package/hono/v/4.7.11) (from `^4.5.1`, in `dependencies`)
  - Updated dependency [`hono-openapi@^0.4.8` ↗︎](https://www.npmjs.com/package/hono-openapi/v/0.4.8) (from `^0.4.6`, in `dependencies`)
  - Updated dependency [`json-schema-to-zod@^2.6.1` ↗︎](https://www.npmjs.com/package/json-schema-to-zod/v/2.6.1) (from `^2.6.0`, in `dependencies`)
  - Updated dependency [`pino@^9.7.0` ↗︎](https://www.npmjs.com/package/pino/v/9.7.0) (from `^9.6.0`, in `dependencies`)
  - Updated dependency [`xstate@^5.19.4` ↗︎](https://www.npmjs.com/package/xstate/v/5.19.4) (from `^5.19.2`, in `dependencies`)
- 36f1c36: MCP Client and Server streamable http fixes
- 10d352e: fix: bug in `workflow.parallel` return types causing type errors on c…
- 53d3c37: Get workflows from an agent if not found from Mastra instance #5083

## 0.10.5

### Patch Changes

- 13c97f9: Save run status, result and error in storage snapshot

## 0.10.4

### Patch Changes

- d1ed912: dependencies updates:
  - Updated dependency [`dotenv@^16.5.0` ↗︎](https://www.npmjs.com/package/dotenv/v/16.5.0) (from `^16.4.7`, in `dependencies`)
- f6fd25f: Updates @mastra/schema-compat to allow all zod schemas. Uses @mastra/schema-compat to apply schema transformations to agent output schema.
- dffb67b: updated stores to add alter table and change tests
- f1f1f1b: Add basic filtering capabilities to logs
- 925ab94: added paginated functions to base class and added boilerplate and updated imports
- f9816ae: Create @mastra/schema-compat package to extract the schema compatibility layer to be used outside of mastra
- 82090c1: Add pagination to logs
- 1b443fd: - add trackException to loggers to allow mastra cloud to track exceptions at runtime
  - Added generic MastraBaseError<D, C> in packages/core/src/error/index.ts to improve type safety and flexibility of error handling
- ce97900: Add paginated APIs to cloudflare-d1 storage class
- f1309d3: Now that UIMessages are stored, we added a check to make sure large text files or source urls are not sent to the LLM for thread title generation.
- 14a2566: Add pagination to libsql storage APIs
- f7f8293: Added LanceDB implementations for MastraVector and MastraStorage
- 48eddb9: update filter logic in Memory class to support semantic recall search scope
- Updated dependencies [f6fd25f]
- Updated dependencies [f9816ae]
  - @mastra/schema-compat@0.10.2

## 0.10.4-alpha.3

### Patch Changes

- 925ab94: added paginated functions to base class and added boilerplate and updated imports

## 0.10.4-alpha.2

### Patch Changes

- 48eddb9: update filter logic in Memory class to support semantic recall search scope

## 0.10.4-alpha.1

### Patch Changes

- f6fd25f: Updates @mastra/schema-compat to allow all zod schemas. Uses @mastra/schema-compat to apply schema transformations to agent output schema.
- dffb67b: updated stores to add alter table and change tests
- f1309d3: Now that UIMessages are stored, we added a check to make sure large text files or source urls are not sent to the LLM for thread title generation.
- f7f8293: Added LanceDB implementations for MastraVector and MastraStorage
- Updated dependencies [f6fd25f]
  - @mastra/schema-compat@0.10.2-alpha.3

## 0.10.4-alpha.0

### Patch Changes

- d1ed912: dependencies updates:
  - Updated dependency [`dotenv@^16.5.0` ↗︎](https://www.npmjs.com/package/dotenv/v/16.5.0) (from `^16.4.7`, in `dependencies`)
- f1f1f1b: Add basic filtering capabilities to logs
- f9816ae: Create @mastra/schema-compat package to extract the schema compatibility layer to be used outside of mastra
- 82090c1: Add pagination to logs
- 1b443fd: - add trackException to loggers to allow mastra cloud to track exceptions at runtime
  - Added generic MastraBaseError<D, C> in packages/core/src/error/index.ts to improve type safety and flexibility of error handling
- ce97900: Add paginated APIs to cloudflare-d1 storage class
- 14a2566: Add pagination to libsql storage APIs
- Updated dependencies [f9816ae]
  - @mastra/schema-compat@0.10.2-alpha.2

## 0.10.3

### Patch Changes

- 2b0fc7e: Ensure context messages aren't saved to the storage db

## 0.10.3-alpha.0

### Patch Changes

- 2b0fc7e: Ensure context messages aren't saved to the storage db

## 0.10.2

### Patch Changes

- ee77e78: Type fixes for dynamodb and MessageList
- 592a2db: Added different icons for agents and workflows in mcp tools list
- e5dc18d: Added a backwards compatible layer to begin storing/retrieving UIMessages in storage instead of CoreMessages
- ab5adbe: Add support for runtimeContext to generateTitle
- 1e8bb40: Add runtimeContext to tools and agents in a workflow step.

  Also updated start/resume docs for runtime context.

- 1b5fc55: Fixed an issue where the playground wouldn't display images saved in memory. Fixed memory to always store images as strings. Removed duplicate storage of reasoning and file/image parts in storage dbs
- 195c428: Add runId to step execute fn
- f73e11b: fix telemetry disabled not working on playground
- 37643b8: Fix tool access
- 99fd6cf: Fix workflow stream chunk type
- c5bf1ce: Add backwards compat code for new MessageList in storage
- add596e: Mastra protected auth
- 8dc94d8: Enhance workflow DI runtimeContext get method type safety
- ecebbeb: Mastra core auth abstract definition
- 79d5145: Fixes passing telemetry configuration when Agent.stream is used with experimental_output
- 12b7002: Add serializedStepGraph to workflow run snapshot in storage
- 2901125: feat: set mastra server middleware after Mastra has been initialized

## 0.10.2-alpha.8

### Patch Changes

- 37643b8: Fix tool access
- 79d5145: Fixes passing telemetry configuration when Agent.stream is used with experimental_output

## 0.10.2-alpha.7

## 0.10.2-alpha.6

### Patch Changes

- 99fd6cf: Fix workflow stream chunk type
- 8dc94d8: Enhance workflow DI runtimeContext get method type safety

## 0.10.2-alpha.5

### Patch Changes

- 1b5fc55: Fixed an issue where the playground wouldn't display images saved in memory. Fixed memory to always store images as strings. Removed duplicate storage of reasoning and file/image parts in storage dbs
- add596e: Mastra protected auth
- ecebbeb: Mastra core auth abstract definition

## 0.10.2-alpha.4

### Patch Changes

- c5bf1ce: Add backwards compat code for new MessageList in storage
- 12b7002: Add serializedStepGraph to workflow run snapshot in storage

## 0.10.2-alpha.3

### Patch Changes

- ab5adbe: Add support for runtimeContext to generateTitle
- 195c428: Add runId to step execute fn
- f73e11b: fix telemetry disabled not working on playground

## 0.10.2-alpha.2

### Patch Changes

- 1e8bb40: Add runtimeContext to tools and agents in a workflow step.

  Also updated start/resume docs for runtime context.

## 0.10.2-alpha.1

### Patch Changes

- ee77e78: Type fixes for dynamodb and MessageList
- 2901125: feat: set mastra server middleware after Mastra has been initialized

## 0.10.2-alpha.0

### Patch Changes

- 592a2db: Added different icons for agents and workflows in mcp tools list
- e5dc18d: Added a backwards compatible layer to begin storing/retrieving UIMessages in storage instead of CoreMessages

## 0.10.1

### Patch Changes

- d70b807: Improve storage.init
- 6d16390: Support custom bundle externals on mastra Instance
- 1e4a421: Fix duplication of items in array results in workflow
- 200d0da: Return payload data, start time, end time, resume time and suspend time for each step in workflow state
  Return error stack for failed workflow runs
- bf5f17b: Adds ability to pass workflows into MCPServer to generate tools from the workflows. Each workflow will become a tool that can start the workflow run.
- 5343f93: Move emitter to symbol to make private
- 38aee50: Adds ability to pass an agents into an MCPServer instance to automatically generate tools from them.
- 5c41100: Added binding support for cloudflare deployers, added cloudflare kv namespace changes, and removed randomUUID from buildExecutionGraph
- d6a759b: Update workflows code in core readme'
- 6015bdf: Leverage defaultAgentStreamOption, defaultAgentGenerateOption in playground

## 0.10.1-alpha.3

### Patch Changes

- d70b807: Improve storage.init

## 0.10.1-alpha.2

### Patch Changes

- 6015bdf: Leverage defaultAgentStreamOption, defaultAgentGenerateOption in playground

## 0.10.1-alpha.1

### Patch Changes

- 200d0da: Return payload data, start time, end time, resume time and suspend time for each step in workflow state

... 1897 more lines hidden. See full changelog in package directory.