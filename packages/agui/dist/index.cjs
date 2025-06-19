'use strict';

var client = require('@ag-ui/client');
var runtime = require('@copilotkit/runtime');
var uiUtils = require('@ai-sdk/ui-utils');
var server = require('@mastra/core/server');
var runtimeContext = require('@mastra/core/runtime-context');
var crypto = require('crypto');
var rxjs = require('rxjs');

// src/index.ts
var AGUIAdapter = class extends client.AbstractAgent {
  constructor({ agent, agentId, resourceId, runtimeContext, ...rest }) {
    super({
      agentId,
      ...rest
    });
    this.agent = agent;
    this.resourceId = resourceId;
    this.runtimeContext = runtimeContext;
  }
  run(input) {
    const finalMessages = [...input.messages];
    return new rxjs.Observable((subscriber) => {
      const convertedMessages = convertMessagesToMastraMessages(input.messages);
      subscriber.next({
        type: client.EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId
      });
      this.agent.stream(convertedMessages, {
        threadId: input.threadId,
        resourceId: this.resourceId ?? "",
        runId: input.runId,
        clientTools: input.tools.reduce(
          (acc, tool) => {
            acc[tool.name] = {
              id: tool.name,
              description: tool.description,
              inputSchema: tool.parameters
            };
            return acc;
          },
          {}
        ),
        runtimeContext: this.runtimeContext
      }).then((response) => {
        let messageId = crypto.randomUUID();
        let assistantMessage = {
          id: messageId,
          role: "assistant",
          content: "",
          toolCalls: []
        };
        finalMessages.push(assistantMessage);
        return uiUtils.processDataStream({
          stream: response.toDataStreamResponse().body,
          onTextPart: (text) => {
            assistantMessage.content += text;
            const event = {
              type: client.EventType.TEXT_MESSAGE_CHUNK,
              role: "assistant",
              messageId,
              delta: text
            };
            subscriber.next(event);
          },
          onFinishMessagePart: () => {
            const event = {
              type: client.EventType.MESSAGES_SNAPSHOT,
              messages: finalMessages
            };
            subscriber.next(event);
            subscriber.next({
              type: client.EventType.RUN_FINISHED,
              threadId: input.threadId,
              runId: input.runId
            });
            subscriber.complete();
          },
          onToolCallPart(streamPart) {
            let toolCall = {
              id: streamPart.toolCallId,
              type: "function",
              function: {
                name: streamPart.toolName,
                arguments: JSON.stringify(streamPart.args)
              }
            };
            assistantMessage.toolCalls.push(toolCall);
            const startEvent = {
              type: client.EventType.TOOL_CALL_START,
              parentMessageId: messageId,
              toolCallId: streamPart.toolCallId,
              toolCallName: streamPart.toolName
            };
            subscriber.next(startEvent);
            const argsEvent = {
              type: client.EventType.TOOL_CALL_ARGS,
              toolCallId: streamPart.toolCallId,
              delta: JSON.stringify(streamPart.args)
            };
            subscriber.next(argsEvent);
            const endEvent = {
              type: client.EventType.TOOL_CALL_END,
              toolCallId: streamPart.toolCallId
            };
            subscriber.next(endEvent);
          },
          onToolResultPart(streamPart) {
            const toolMessage = {
              role: "tool",
              id: crypto.randomUUID(),
              toolCallId: streamPart.toolCallId,
              content: JSON.stringify(streamPart.result)
            };
            finalMessages.push(toolMessage);
          }
        });
      }).catch((error) => {
        console.error("error", error);
        subscriber.error(error);
      });
      return () => {
      };
    });
  }
};
function convertMessagesToMastraMessages(messages) {
  const result = [];
  for (const message of messages) {
    if (message.role === "assistant") {
      const parts = message.content ? [{ type: "text", text: message.content }] : [];
      for (const toolCall of message.toolCalls ?? []) {
        parts.push({
          type: "tool-call",
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          args: JSON.parse(toolCall.function.arguments)
        });
      }
      result.push({
        role: "assistant",
        content: parts
      });
    } else if (message.role === "user") {
      result.push({
        role: "user",
        content: message.content || ""
      });
    } else if (message.role === "tool") {
      let toolName = "unknown";
      for (const msg of messages) {
        if (msg.role === "assistant") {
          for (const toolCall of msg.toolCalls ?? []) {
            if (toolCall.id === message.toolCallId) {
              toolName = toolCall.function.name;
              break;
            }
          }
        }
      }
      result.push({
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: message.toolCallId,
            toolName,
            result: message.content
          }
        ]
      });
    }
  }
  return result;
}
function getAGUI({
  mastra,
  resourceId,
  runtimeContext
}) {
  const agents = mastra.getAgents() || {};
  const networks = mastra.getNetworks() || [];
  const networkAGUI = networks.reduce(
    (acc, network) => {
      acc[network.name] = new AGUIAdapter({
        agentId: network.name,
        agent: network,
        resourceId,
        runtimeContext
      });
      return acc;
    },
    {}
  );
  const agentAGUI = Object.entries(agents).reduce(
    (acc, [agentId, agent]) => {
      acc[agentId] = new AGUIAdapter({
        agentId,
        agent,
        resourceId,
        runtimeContext
      });
      return acc;
    },
    {}
  );
  return {
    ...agentAGUI,
    ...networkAGUI
  };
}
function getAGUIAgent({
  mastra,
  agentId,
  resourceId,
  runtimeContext
}) {
  const agent = mastra.getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }
  return new AGUIAdapter({
    agentId,
    agent,
    resourceId,
    runtimeContext
  });
}
function getAGUINetwork({
  mastra,
  networkId,
  resourceId,
  runtimeContext
}) {
  const network = mastra.getNetwork(networkId);
  if (!network) {
    throw new Error(`Network ${networkId} not found`);
  }
  return new AGUIAdapter({
    agentId: network.name,
    agent: network,
    resourceId,
    runtimeContext
  });
}
function registerCopilotKit({
  path,
  resourceId,
  serviceAdapter = new runtime.ExperimentalEmptyAdapter(),
  agents,
  setContext
}) {
  return server.registerApiRoute(path, {
    method: `ALL`,
    handler: async (c) => {
      const mastra = c.get("mastra");
      const runtimeContext$1 = new runtimeContext.RuntimeContext();
      if (setContext) {
        await setContext(c, runtimeContext$1);
      }
      const aguiAgents = agents || getAGUI({
        resourceId,
        mastra,
        runtimeContext: runtimeContext$1
      });
      const runtime$1 = new runtime.CopilotRuntime({
        agents: aguiAgents
      });
      const handler = runtime.copilotRuntimeNodeHttpEndpoint({
        endpoint: path,
        runtime: runtime$1,
        serviceAdapter
      });
      return handler.handle(c.req.raw, {});
    }
  });
}

exports.AGUIAdapter = AGUIAdapter;
exports.convertMessagesToMastraMessages = convertMessagesToMastraMessages;
exports.getAGUI = getAGUI;
exports.getAGUIAgent = getAGUIAgent;
exports.getAGUINetwork = getAGUINetwork;
exports.registerCopilotKit = registerCopilotKit;
