import { Agent } from '../chunk-ATXD4775.js';
import { createTool } from '../chunk-C4LMN2IR.js';
import { MastraError } from '../chunk-4MPQAHTP.js';
import { MastraBase } from '../chunk-5IEKR756.js';
import { RegisteredLogger } from '../chunk-5YDTZN2X.js';
import { z } from 'zod';

var AgentNetwork = class extends MastraBase {
  #instructions;
  #agents;
  #model;
  #routingAgent;
  #agentHistory = {};
  constructor(config) {
    super({ component: RegisteredLogger.NETWORK, name: config.name || "AgentNetwork" });
    this.#instructions = config.instructions;
    this.#agents = config.agents;
    this.#model = config.model;
    this.#routingAgent = new Agent({
      name: config.name,
      instructions: this.getInstructions(),
      model: this.#model,
      tools: this.getTools()
    });
  }
  formatAgentId(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, "_");
  }
  getTools() {
    return {
      transmit: createTool({
        id: "transmit",
        description: "Call one or more specialized agents to handle specific tasks",
        inputSchema: z.object({
          actions: z.array(
            z.object({
              agent: z.string().describe("The name of the agent to call"),
              input: z.string().describe("The input to pass to the agent"),
              includeHistory: z.boolean().optional().describe("Whether to include previous agent outputs in the context")
            })
          )
        }),
        execute: async ({ context, runtimeContext }) => {
          try {
            const actions = context.actions;
            this.logger.debug(`Executing ${actions.length} specialized agents`);
            const results = await Promise.all(
              actions.map(
                (action) => this.executeAgent(
                  action.agent,
                  [{ role: "user", content: action.input }],
                  action.includeHistory,
                  runtimeContext
                )
              )
            );
            this.logger.debug("Results:", { results });
            actions.forEach((action, index) => {
              this.#addToAgentHistory(action.agent, {
                input: action.input,
                output: results[index] || ""
                // Ensure output is always a string
              });
            });
            return actions.map((action, index) => `[${action.agent}]: ${results[index]}`).join("\n\n");
          } catch (err) {
            const error = err;
            this.logger.error("Error in transmit tool:", { error });
            return `Error executing agents: ${error.message}`;
          }
        }
      })
    };
  }
  #addToAgentHistory(agentId, interaction) {
    if (!this.#agentHistory[agentId]) {
      this.#agentHistory[agentId] = [];
    }
    this.#agentHistory[agentId].push({
      ...interaction,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  getAgentHistory(agentId) {
    return this.#agentHistory[agentId] || [];
  }
  #clearNetworkHistoryBeforeRun() {
    this.#agentHistory = {};
  }
  /**
   * Get the history of all agent interactions that have occurred in this network
   * @returns A record of agent interactions, keyed by agent ID
   */
  getAgentInteractionHistory() {
    return { ...this.#agentHistory };
  }
  /**
   * Get a summary of agent interactions in a more readable format, displayed chronologically
   * @returns A formatted string with all agent interactions in chronological order
   */
  getAgentInteractionSummary() {
    const history = this.#agentHistory;
    const agentIds = Object.keys(history);
    if (agentIds.length === 0) {
      return "No agent interactions have occurred yet.";
    }
    const allInteractions = [];
    let globalSequence = 0;
    agentIds.forEach((agentId) => {
      const interactions = history[agentId] || [];
      interactions.forEach((interaction, index) => {
        allInteractions.push({
          agentId,
          interaction,
          index,
          // Assign a sequence number based on when it was added to the history
          sequence: globalSequence++
        });
      });
    });
    allInteractions.sort((a, b) => {
      if (a.interaction.timestamp && b.interaction.timestamp) {
        return new Date(a.interaction.timestamp).getTime() - new Date(b.interaction.timestamp).getTime();
      }
      return a.sequence - b.sequence;
    });
    if (allInteractions.length === 0) {
      return "No agent interactions have occurred yet.";
    }
    return "# Chronological Agent Interactions\n\n" + allInteractions.map(
      (item, i) => `## Step ${i + 1}: Agent ${item.agentId} at ${item.interaction.timestamp}
**Input:** ${item.interaction.input.substring(0, 100)}${item.interaction.input.length > 100 ? "..." : ""}

**Output:** ${item.interaction.output.substring(0, 100)}${item.interaction.output.length > 100 ? "..." : ""}`
    ).join("\n\n");
  }
  async executeAgent(agentId, input, includeHistory = false, runtimeContext) {
    try {
      const agent = this.#agents.find((agent2) => this.formatAgentId(agent2.name) === agentId);
      if (!agent) {
        const error = new MastraError({
          id: "AGENT_NETWORK_EXECUTE_UNKNOWN_AGENT",
          domain: "AGENT_NETWORK" /* AGENT_NETWORK */,
          category: "USER" /* USER */,
          text: `Agent "${agentId}" not found.`
        });
        this.logger.trackException?.(error);
        throw error;
      }
      let messagesWithContext = [...input];
      if (includeHistory) {
        const allHistory = Object.entries(this.#agentHistory);
        if (allHistory.length > 0) {
          const contextMessage = {
            role: "system",
            content: `Previous agent interactions:

${allHistory.map(([agentName, interactions]) => {
              return `## ${agentName}
${interactions.map(
                (interaction, i) => `Interaction ${i + 1} (${interaction.timestamp || "No timestamp"}):
- Input: ${interaction.input}
- Output: ${interaction.output}`
              ).join("\n\n")}`;
            }).join("\n\n")}`
          };
          messagesWithContext = [contextMessage, ...messagesWithContext];
        }
      }
      const result = await agent.generate(messagesWithContext, { runtimeContext });
      return result.text;
    } catch (err) {
      const error = err;
      this.logger.error(`Error executing agent "${agentId}":`, { error });
      return `Unable to execute agent "${agentId}": ${error.message}`;
    }
  }
  getInstructions() {
    const agentList = this.#agents.map((agent) => {
      const id = this.formatAgentId(agent.name);
      return ` - **${id}**: ${agent.name}`;
    }).join("\n");
    return `
            You are a router in a network of specialized AI agents. 
            Your job is to decide which agent should handle each step of a task.
            
            ## System Instructions
            ${this.#instructions}
            
            ## Available Specialized Agents
            You can call these agents using the "transmit" tool:
            ${agentList}
            
            ## How to Use the "transmit" Tool
            
            The "transmit" tool allows you to call one or more specialized agents.
            
            ### Single Agent Call
            To call a single agent, use this format:
            \`\`\`json
            {
              "actions": [
                {
                  "agent": "agent_name",
                  "input": "detailed instructions for the agent"
                }
              ]
            }
            \`\`\`
            
            ### Multiple Parallel Agent Calls
            To call multiple agents in parallel, use this format:
            \`\`\`json
            {
              "actions": [
                {
                  "agent": "first_agent_name",
                  "input": "detailed instructions for the first agent"
                },
                {
                  "agent": "second_agent_name",
                  "input": "detailed instructions for the second agent"
                }
              ]
            }
            \`\`\`
            
            ## Context Sharing
            
            When calling an agent, you can choose to include the output from previous agents in the context.
            This allows the agent to take into account the results from previous steps.
            
            To include context, add the "includeHistory" field to the action and set it to true:
            \`\`\`json
            {
              "actions": [
                {
                  "agent": "agent_name",
                  "input": "detailed instructions for the agent",
                  "includeHistory": true
                }
              ]
            }
            \`\`\`
            
            ## Best Practices
            1. Break down complex tasks into smaller steps
            2. Choose the most appropriate agent for each step
            3. Provide clear, detailed instructions to each agent
            4. Synthesize the results from multiple agents when needed
            5. Provide a final summary or answer to the user
            
            ## Workflow
            1. Analyze the user's request
            2. Identify which specialized agent(s) can help
            3. Call the appropriate agent(s) using the transmit tool
            4. Review the agent's response
            5. Either call more agents or provide a final answer
        `;
  }
  getRoutingAgent() {
    return this.#routingAgent;
  }
  getAgents() {
    return this.#agents;
  }
  async generate(messages, args) {
    this.#clearNetworkHistoryBeforeRun();
    this.logger.debug(`AgentNetwork: Starting generation with ${this.#agents.length} available agents`);
    const ops = {
      maxSteps: this.#agents?.length * 10,
      // Default to 10 steps per agent
      ...args
    };
    this.logger.debug(`AgentNetwork: Routing with max steps: ${ops.maxSteps}`);
    const result = await this.#routingAgent.generate(
      messages,
      ops
    );
    this.logger.debug(`AgentNetwork: Generation complete with ${result.steps?.length || 0} steps`);
    return result;
  }
  async stream(messages, args) {
    this.#clearNetworkHistoryBeforeRun();
    this.logger.debug(`AgentNetwork: Starting generation with ${this.#agents.length} available agents`);
    const ops = {
      maxSteps: this.#agents?.length * 10,
      // Default to 10 steps per agent
      ...args
    };
    this.logger.debug(`AgentNetwork: Routing with max steps: ${ops.maxSteps}`);
    const result = await this.#routingAgent.stream(
      messages,
      ops
    );
    return result;
  }
  __registerMastra(p) {
    this.__setLogger(p.getLogger());
    this.#routingAgent.__registerMastra(p);
    for (const agent of this.#agents) {
      if (typeof agent.__registerMastra === "function") {
        agent.__registerMastra(p);
      }
    }
  }
};

export { AgentNetwork };
