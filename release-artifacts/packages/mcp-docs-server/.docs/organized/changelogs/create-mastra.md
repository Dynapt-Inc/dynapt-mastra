# create-mastra

## 0.10.6-alpha.0

### Patch Changes

- 9102d89: Fix final output not showing on playground for previously suspended steps

## 0.10.5

### Patch Changes

- 02560d4: lift evals fetching to the playground package instead
- 63f6b7d: dependencies updates:
  - Updated dependency [`execa@^9.6.0` ↗︎](https://www.npmjs.com/package/execa/v/9.6.0) (from `^9.5.2`, in `dependencies`)
  - Updated dependency [`pino@^9.7.0` ↗︎](https://www.npmjs.com/package/pino/v/9.7.0) (from `^9.6.0`, in `dependencies`)
  - Updated dependency [`posthog-node@^4.18.0` ↗︎](https://www.npmjs.com/package/posthog-node/v/4.18.0) (from `^4.10.1`, in `dependencies`)
- 5f2aa3e: Move workflow hooks to playground
- 44ba52d: Add proper error message when installation of mastra fails
- 311132e: move useWorkflow to playground instead of playground-ui
- 3270d9d: Fix runtime context being undefined
- 53d3c37: Get workflows from an agent if not found from Mastra instance #5083
- fc677d7: For final result for a workflow

## 0.10.5-alpha.2

### Patch Changes

- 5f2aa3e: Move workflow hooks to playground

## 0.10.5-alpha.1

### Patch Changes

- 44ba52d: Add proper error message when installation of mastra fails
- 3270d9d: Fix runtime context being undefined
- fc677d7: For final result for a workflow

## 0.10.5-alpha.0

### Patch Changes

- 02560d4: lift evals fetching to the playground package instead
- 63f6b7d: dependencies updates:
  - Updated dependency [`execa@^9.6.0` ↗︎](https://www.npmjs.com/package/execa/v/9.6.0) (from `^9.5.2`, in `dependencies`)
  - Updated dependency [`pino@^9.7.0` ↗︎](https://www.npmjs.com/package/pino/v/9.7.0) (from `^9.6.0`, in `dependencies`)
  - Updated dependency [`posthog-node@^4.18.0` ↗︎](https://www.npmjs.com/package/posthog-node/v/4.18.0) (from `^4.10.1`, in `dependencies`)
- 311132e: move useWorkflow to playground instead of playground-ui
- 53d3c37: Get workflows from an agent if not found from Mastra instance #5083

## 0.10.4

### Patch Changes

- 1ba421d: fix the tools not showing on workflows attached to agents
- 8725d02: Improve cli by reducing the amount of setups during interactive prompt
- 13c97f9: Save run status, result and error in storage snapshot

## 0.10.3

### Patch Changes

- e719504: don't start posthog when the browser is Brave
- 8f60de4: fix workflow output when the schema is a primitive

## 0.10.3-alpha.1

### Patch Changes

- e719504: don't start posthog when the browser is Brave

## 0.10.3-alpha.0

### Patch Changes

- 8f60de4: fix workflow output when the schema is a primitive

## 0.10.2

### Patch Changes

- 73fec0b: Mastra start cli command"
- 401bbae: Show workflow graph from stepGraph of previous runs when viewing a previous run
- f73e11b: fix telemetry disabled not working on playground
- 9666468: move the fetch traces call to the playground instead of playground-ui
- 90e96de: Fix: prevent default flag from triggering interactive prompt
- 89a69d0: add a way to go to the given trace of a workflow step
- 6fd77b5: add docs and txt support for multi modal
- 9faee5b: small fixes in the workflows graph
- 631683f: move workflow runs list in playground-ui instead of playground
- f6ddf55: fix traces not showing and reduce API surface from playground ui
- 9a31c09: Highlight steps in nested workflows on workflow graph

## 0.10.2-alpha.6

### Patch Changes

- 90e96de: Fix: prevent default flag from triggering interactive prompt

## 0.10.2-alpha.5

### Patch Changes

- 6fd77b5: add docs and txt support for multi modal
- 631683f: move workflow runs list in playground-ui instead of playground

## 0.10.2-alpha.4

### Patch Changes

- 9666468: move the fetch traces call to the playground instead of playground-ui

## 0.10.2-alpha.3

### Patch Changes

- 401bbae: Show workflow graph from stepGraph of previous runs when viewing a previous run

## 0.10.2-alpha.2

### Patch Changes

- f73e11b: fix telemetry disabled not working on playground

## 0.10.2-alpha.1

### Patch Changes

- 73fec0b: Mastra start cli command"
- f6ddf55: fix traces not showing and reduce API surface from playground ui

## 0.10.2-alpha.0

### Patch Changes

- 89a69d0: add a way to go to the given trace of a workflow step
- 9faee5b: small fixes in the workflows graph
- 9a31c09: Highlight steps in nested workflows on workflow graph

## 0.10.1

### Patch Changes

- b4365f6: add empty states for agents network and tools
- d0932ac: add multi modal input behind feature flag
- bed0916: Update default tools path in mastra dev,build
- 3c2dba5: add workflow run list
- 23d56b1: Handle dev server errors, restart, exit
- 267773e: Show map config on workflow graph
  Highlight borders for conditions too on workflow graph
  Fix watch stream
- 35bb6a3: Allow undefined temprature, topP model setting from playground
- 33f1c64: revamp the experience for workflows
- 6015bdf: Leverage defaultAgentStreamOption, defaultAgentGenerateOption in playground
- 7a32205: add empty states for workflows, agents and mcp servers

## 0.10.1-alpha.5

### Patch Changes

- 267773e: Show map config on workflow graph
  Highlight borders for conditions too on workflow graph
  Fix watch stream

## 0.10.1-alpha.4

### Patch Changes

- 3c2dba5: add workflow run list
- 33f1c64: revamp the experience for workflows

## 0.10.1-alpha.3

### Patch Changes

- 6015bdf: Leverage defaultAgentStreamOption, defaultAgentGenerateOption in playground

## 0.10.1-alpha.2

### Patch Changes

- b4365f6: add empty states for agents network and tools
- d0932ac: add multi modal input behind feature flag
- bed0916: Update default tools path in mastra dev,build
- 23d56b1: Handle dev server errors, restart, exit

## 0.10.1-alpha.1

### Patch Changes

- 7a32205: add empty states for workflows, agents and mcp servers

## 0.10.1-alpha.0

### Patch Changes

- 35bb6a3: Allow undefined temprature, topP model setting from playground

## 0.10.0

### Patch Changes

- bdb7934: fix tools not showing (discoverability)
- b3a3d63: BREAKING: Make vnext workflow the default worklow, and old workflow legacy_workflow
- ae122cc: show the entities ID close to the copy button
- 99552bc: revamp the UI of the tools page
- f2d3352: fix overflow scroll in runtime context
- 95911be: Fixed an issue where if @mastra/core was not released at the same time as create-mastra, create-mastra would match the alpha tag instead of latest tag when running npm create mastra@latest
- db4211d: improve the UI/UX of the runtime context with formatting, copying, docs and syntax highlighting
- 9b7294a: Revamp the UI for the right sidebar of the agents page
- e2c2cf1: Persist playground agent settings across refresh
- 47776b4: update the mcp pages
- fd69cc3: revamp UI of workflow "Run" pane
- 1270183: Add waterfull traces instead of stacked progressbar (UI improvement mostly)
- 392a14d: changing the empty state for threads in agent chat
- cbf153f: Handle broken images on the playground
- 0cae9b1: sidebar adjustments (storing status + showing the action of collapsing / expanding)
- d2b595a: a better tools playground page
- 1f6886f: bring back the memory not activated warning in agent chat
- 8a68886: revamp the UI of the workflow form input

## 0.3.4-alpha.2

### Patch Changes

- 47776b4: update the mcp pages

## 0.3.4-alpha.1

### Patch Changes

- bdb7934: fix tools not showing (discoverability)
- b3a3d63: BREAKING: Make vnext workflow the default worklow, and old workflow legacy_workflow
- ae122cc: show the entities ID close to the copy button
- f2d3352: fix overflow scroll in runtime context
- 95911be: Fixed an issue where if @mastra/core was not released at the same time as create-mastra, create-mastra would match the alpha tag instead of latest tag when running npm create mastra@latest
- fd69cc3: revamp UI of workflow "Run" pane
- cbf153f: Handle broken images on the playground
- 0cae9b1: sidebar adjustments (storing status + showing the action of collapsing / expanding)
- d2b595a: a better tools playground page
- 1f6886f: bring back the memory not activated warning in agent chat
- 8a68886: revamp the UI of the workflow form input

## 0.3.4-alpha.0

### Patch Changes

- 99552bc: revamp the UI of the tools page
- db4211d: improve the UI/UX of the runtime context with formatting, copying, docs and syntax highlighting
- 9b7294a: Revamp the UI for the right sidebar of the agents page
- e2c2cf1: Persist playground agent settings across refresh
- 1270183: Add waterfull traces instead of stacked progressbar (UI improvement mostly)
- 392a14d: changing the empty state for threads in agent chat

## 0.3.3

### Patch Changes

- a3435f8: Add node engine to create-mastra project package.json

## 0.3.3-alpha.0

### Patch Changes

- a3435f8: Add node engine to create-mastra project package.json

## 0.3.2

### Patch Changes

- 0db0992: - add new --mcp option to cli
  - add support for mcp in vscode
  - include examples with --default flag
- b5d2de0: In vNext workflow serializedStepGraph, return only serializedStepFlow for steps created from a workflow
  allow viewing inner nested workflows in a multi-layered nested vnext workflow on the playground
- 62c9e7d: Fix disappearing tool calls in streaming

## 0.3.2-alpha.1

### Patch Changes

- 62c9e7d: Fix disappearing tool calls in streaming

## 0.3.2-alpha.0

### Patch Changes

- b5d2de0: In vNext workflow serializedStepGraph, return only serializedStepFlow for steps created from a workflow
  allow viewing inner nested workflows in a multi-layered nested vnext workflow on the playground

## 0.3.1

### Patch Changes

- 144fa1b: lift up the traces fetching and allow to pass them down in the TracesTable. It allows passing down mastra client traces OR clickhouse traces
- 33b84fd: fix showing sig digits in trace / span duration
- 4155f47: Add parameters to filter workflow runs
  Add fromDate and toDate to telemetry parameters
- 8607972: Introduce Mastra lint cli command
- 0097d50: Add serializedStepGraph to vNext workflow

... 890 more lines hidden. See full changelog in package directory.