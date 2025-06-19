'use strict';

var events = require('events');
var stream = require('stream');
var voice = require('@mastra/core/voice');
var ws = require('ws');
var zodToJsonSchema = require('zod-to-json-schema');

// src/index.ts
var transformTools = (tools) => {
  const openaiTools = [];
  for (const [name, tool] of Object.entries(tools || {})) {
    let parameters;
    if ("inputSchema" in tool && tool.inputSchema) {
      if (isZodObject(tool.inputSchema)) {
        parameters = zodToJsonSchema.zodToJsonSchema(tool.inputSchema);
        delete parameters.$schema;
      } else {
        parameters = tool.inputSchema;
      }
    } else if ("parameters" in tool) {
      if (isZodObject(tool.parameters)) {
        parameters = zodToJsonSchema.zodToJsonSchema(tool.parameters);
        delete parameters.$schema;
      } else {
        parameters = tool.parameters;
      }
    } else {
      console.warn(`Tool ${name} has neither inputSchema nor parameters, skipping`);
      continue;
    }
    const openaiTool = {
      type: "function",
      name,
      description: tool.description || `Tool: ${name}`,
      parameters
    };
    if (tool.execute) {
      const executeAdapter = async (args) => {
        try {
          if (!tool.execute) {
            throw new Error(`Tool ${name} has no execute function`);
          }
          if ("inputSchema" in tool) {
            return await tool.execute({ context: args });
          } else {
            const options = {
              toolCallId: "unknown",
              messages: []
            };
            return await tool.execute(args, options);
          }
        } catch (error) {
          console.error(`Error executing tool ${name}:`, error);
          throw error;
        }
      };
      openaiTools.push({ openaiTool, execute: executeAdapter });
    } else {
      console.warn(`Tool ${name} has no execute function, skipping`);
    }
  }
  return openaiTools;
};
var isReadableStream = (obj) => {
  return obj && obj instanceof stream.Readable && typeof obj.read === "function" && typeof obj.pipe === "function" && obj.readable === true;
};
function isZodObject(schema) {
  return !!schema && typeof schema === "object" && "_def" in schema && schema._def && typeof schema._def === "object" && "typeName" in schema._def && schema._def.typeName === "ZodObject";
}

// src/index.ts
var DEFAULT_VOICE = "alloy";
var DEFAULT_TRANSCRIBER = "whisper-1";
var DEFAULT_URL = "wss://api.openai.com/v1/realtime";
var DEFAULT_MODEL = "gpt-4o-mini-realtime-preview-2024-12-17";
var VOICES = ["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"];
var OpenAIRealtimeVoice = class extends voice.MastraVoice {
  /**
   * Creates a new instance of OpenAIRealtimeVoice.
   *
   * @param options - Configuration options for the voice instance
   * @param options.url - The base URL for the OpenAI Realtime API
   * @param options.model - The model ID to use (defaults to GPT-4 Mini Realtime)
   * @param options.apiKey - OpenAI API key. Falls back to process.env.OPENAI_API_KEY
   * @param options.speaker - Voice ID to use (defaults to 'alloy')
   * @param options.debug - Enable debug mode
   *
   * @example
   * ```typescript
   * const voice = new OpenAIRealtimeVoice({
   *   apiKey: 'your-api-key',
   *   model: 'gpt-4o-mini-realtime',
   *   speaker: 'alloy'
   * });
   * ```
   */
  constructor(options = {}) {
    super();
    this.options = options;
    this.client = new events.EventEmitter();
    this.state = "close";
    this.events = {};
    this.speaker = options.speaker || DEFAULT_VOICE;
    this.transcriber = options.transcriber || DEFAULT_TRANSCRIBER;
    this.debug = options.debug || false;
  }
  ws;
  state;
  client;
  events;
  instructions;
  tools;
  debug;
  queue = [];
  transcriber;
  runtimeContext;
  /**
   * Returns a list of available voice speakers.
   *
   * @returns Promise resolving to an array of voice objects, each containing at least a voiceId
   *
   * @example
   * ```typescript
   * const speakers = await voice.getSpeakers();
   * // speakers = [{ voiceId: 'alloy' }, { voiceId: 'echo' }, ...]
   * ```
   */
  getSpeakers() {
    return Promise.resolve(VOICES.map((v) => ({ voiceId: v })));
  }
  /**
   * Disconnects from the OpenAI realtime session and cleans up resources.
   * Should be called when you're done with the voice instance.
   *
   * @example
   * ```typescript
   * voice.close(); // Disconnects and cleans up
   * ```
   */
  close() {
    if (!this.ws) return;
    this.ws.close();
    this.state = "close";
  }
  /**
   * Equips the voice instance with a set of instructions.
   * Instructions allow the model to perform additional actions during conversations.
   *
   * @param instructions - Optional instructions to addInstructions
   * @returns Transformed instructions ready for use with the model
   *
   * @example
   * ```typescript
   * voice.addInstructions('You are a helpful assistant.');
   * ```
   */
  addInstructions(instructions) {
    this.instructions = instructions;
  }
  /**
   * Equips the voice instance with a set of tools.
   * Tools allow the model to perform additional actions during conversations.
   *
   * @param tools - Optional tools configuration to addTools
   * @returns Transformed tools configuration ready for use with the model
   *
   * @example
   * ```typescript
   * const tools = {
   *   search: async (query: string) => { ... },
   *   calculate: (expression: string) => { ... }
   * };
   * voice.addTools(tools);
   * ```
   */
  addTools(tools) {
    this.tools = tools || {};
  }
  /**
   * Emits a speaking event using the configured voice model.
   * Can accept either a string or a readable stream as input.
   *
   * @param input - The text to convert to speech, or a readable stream containing the text
   * @param options - Optional configuration for this specific speech request
   * @param options.speaker - Override the voice to use for this specific request
   *
   * @throws {Error} If the input text is empty
   *
   * @example
   * ```typescript
   * // Simple text to speech
   * await voice.speak('Hello world');
   *
   * // With custom voice
   * await voice.speak('Hello world', { speaker: 'echo' });
   *
   * // Using a stream
   * const stream = fs.createReadStream('text.txt');
   * await voice.speak(stream);
   * ```
   */
  async speak(input, options) {
    if (typeof input !== "string") {
      const chunks = [];
      for await (const chunk of input) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      input = Buffer.concat(chunks).toString("utf-8");
    }
    if (input.trim().length === 0) {
      throw new Error("Input text is empty");
    }
    this.sendEvent("response.create", {
      response: {
        instructions: `Repeat the following text: ${input}`,
        voice: options?.speaker ? options.speaker : void 0
      }
    });
  }
  /**
   * Updates the session configuration for the voice instance.
   * This can be used to modify voice settings, turn detection, and other parameters.
   *
   * @param sessionConfig - New session configuration to apply
   *
   * @example
   * ```typescript
   * voice.updateConfig({
   *   voice: 'echo',
   *   turn_detection: {
   *     type: 'server_vad',
   *     threshold: 0.5,
   *     silence_duration_ms: 1000
   *   }
   * });
   * ```
   */
  updateConfig(sessionConfig) {
    this.sendEvent("session.update", { session: sessionConfig });
  }
  /**
   * Checks if listening capabilities are enabled.
   *
   * @returns {Promise<{ enabled: boolean }>}
   */
  async getListener() {
    return { enabled: true };
  }
  /**
   * Processes audio input for speech recognition.
   * Takes a readable stream of audio data and emits a writing event.
   * The output of the writing event is int16 audio data.
   *
   * @param audioData - Readable stream containing the audio data to process
   * @param options - Optional configuration for audio processing
   *
   * @throws {Error} If the audio data format is not supported
   *
   * @example
   * ```typescript
   * // Process audio from a file
   * const audioStream = fs.createReadStream('audio.raw');
   * await voice.listen(audioStream);
   *
   * // Process audio with options
   * await voice.listen(microphoneStream, {
   *   format: 'int16',
   *   sampleRate: 24000
   * });
   * ```
   */
  async listen(audioData) {
    if (isReadableStream(audioData)) {
      const chunks = [];
      for await (const chunk of audioData) {
        const buffer2 = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        chunks.push(buffer2);
      }
      const buffer = Buffer.concat(chunks);
      const int16Array = new Int16Array(buffer.buffer, buffer.byteOffset ?? 0, (buffer.byteLength ?? 0) / 2);
      const base64Audio = this.int16ArrayToBase64(int16Array);
      this.sendEvent("conversation.item.create", {
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_audio", audio: base64Audio }]
        }
      });
      this.sendEvent("response.create", {
        response: {
          modalities: ["text"],
          instructions: `ONLY repeat the input and DO NOT say anything else`
        }
      });
    } else {
      this.emit("error", new Error("Unsupported audio data format"));
    }
  }
  waitForOpen() {
    return new Promise((resolve) => {
      this.ws?.on("open", resolve);
    });
  }
  waitForSessionCreated() {
    return new Promise((resolve) => {
      this.client.on("session.created", resolve);
    });
  }
  /**
   * Establishes a connection to the OpenAI realtime service.
   * Must be called before using speak, listen, or relay functions.
   *
   * @throws {Error} If connection fails or session creation times out
   *
   * @example
   * ```typescript
   * await voice.open();
   * // Now ready for voice interactions
   * ```
   */
  async connect({ runtimeContext } = {}) {
    const url = `${this.options.url || DEFAULT_URL}?model=${this.options.model || DEFAULT_MODEL}`;
    const apiKey = this.options.apiKey || process.env.OPENAI_API_KEY;
    this.runtimeContext = runtimeContext;
    this.ws = new ws.WebSocket(url, void 0, {
      headers: {
        Authorization: "Bearer " + apiKey,
        "OpenAI-Beta": "realtime=v1"
      }
    });
    this.setupEventListeners();
    await Promise.all([this.waitForOpen(), this.waitForSessionCreated()]);
    const openaiTools = transformTools(this.tools);
    this.updateConfig({
      instructions: this.instructions,
      tools: openaiTools.map((t) => t.openaiTool),
      input_audio_transcription: {
        model: this.transcriber
      },
      voice: this.speaker
    });
    this.state = "open";
  }
  disconnect() {
    this.state = "close";
    this.ws?.close();
  }
  /**
   * Streams audio data in real-time to the OpenAI service.
   * Useful for continuous audio streaming scenarios like live microphone input.
   * Must be in 'open' state before calling this method.
   *
   * @param audioData - Readable stream of audio data to relay
   * @throws {Error} If audio format is not supported
   *
   * @example
   * ```typescript
   * // First connect
   * await voice.open();
   *
   * // Then relay audio
   * const micStream = getMicrophoneStream();
   * await voice.relay(micStream);
   * ```
   */
  async send(audioData, eventId) {
    if (!this.state || this.state !== "open") {
      console.warn("Cannot relay audio when not open. Call open() first.");
      return;
    }
    if (isReadableStream(audioData)) {
      const stream = audioData;
      stream.on("data", (chunk) => {
        try {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          this.sendEvent("input_audio_buffer.append", { audio: buffer.toString("base64"), event_id: eventId });
        } catch (err) {
          this.emit("error", err);
        }
      });
    } else if (audioData instanceof Int16Array) {
      try {
        this.sendEvent("input_audio_buffer.append", { audio: audioData, event_id: eventId });
      } catch (err) {
        this.emit("error", err);
      }
    } else {
      this.emit("error", new Error("Unsupported audio data format"));
    }
  }
  /**
   * Sends a response to the OpenAI Realtime API.
   *
   * Trigger a response to the real-time session.
   *
   * @param {Object} params - The parameters object
   * @param {Realtime.ResponseConfig} params.options - Configuration options for the response
   * @returns {Promise<void>} A promise that resolves when the response has been sent
   *
   * @example
   * // Send a simple text response
   * await realtimeVoice.answer({
   *   options: {
   *     content: "Hello, how can I help you today?",
   *     voice: "alloy"
   *   }
   * });
   */
  async answer({ options }) {
    this.sendEvent("response.create", { response: options ?? {} });
  }
  /**
   * Registers an event listener for voice events.
   * Available events: 'speaking', 'writing, 'error'
   * Can listen to OpenAI Realtime events by prefixing with 'openAIRealtime:'
   * Such as 'openAIRealtime:conversation.item.completed', 'openAIRealtime:conversation.updated', etc.
   *
   * @param event - Name of the event to listen for
   * @param callback - Function to call when the event occurs
   *
   * @example
   * ```typescript
   * // Listen for speech events
   * voice.on('speaking', (audioData: Int16Array) => {
   *   // Handle audio data
   * });
   *
   * // Handle errors
   * voice.on('error', (error: Error) => {
   *   console.error('Voice error:', error);
   * });
   * ```
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  /**
   * Removes a previously registered event listener.
   *
   * @param event - Name of the event to stop listening to
   * @param callback - The specific callback function to remove
   *
   * @example
   * ```typescript
   * // Create event handler
   * const handleSpeech = (audioData: Int16Array) => {
   *   // Handle audio data
   * };
   *
   * // Add listener
   * voice.on('speaking', handleSpeech);
   *
   * // Later, remove the listener
   * voice.off('speaking', handleSpeech);
   * ```
   */
  off(event, callback) {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(callback);
    if (index !== -1) {
      this.events[event].splice(index, 1);
    }
  }
  /**
   * Emit an event with arguments
   * @param event Event name
   * @param args Arguments to pass to the callbacks
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    for (const callback of this.events[event]) {
      callback(...args);
    }
  }
  setupEventListeners() {
    const speakerStreams = /* @__PURE__ */ new Map();
    if (!this.ws) {
      throw new Error("WebSocket not initialized");
    }
    this.ws.on("message", (message) => {
      const data = JSON.parse(message.toString());
      this.client.emit(data.type, data);
      if (this.debug) {
        const { delta, ...fields } = data;
        console.log(data.type, fields, delta?.length < 100 ? delta : "");
      }
    });
    this.client.on("session.created", (ev) => {
      this.emit("session.created", ev);
      const queue = this.queue.splice(0, this.queue.length);
      for (const ev2 of queue) {
        this.ws?.send(JSON.stringify(ev2));
      }
    });
    this.client.on("session.updated", (ev) => {
      this.emit("session.updated", ev);
    });
    this.client.on("response.created", (ev) => {
      this.emit("response.created", ev);
      const speakerStream = new stream.PassThrough();
      speakerStream.id = ev.response.id;
      speakerStreams.set(ev.response.id, speakerStream);
      this.emit("speaker", speakerStream);
    });
    this.client.on("conversation.item.input_audio_transcription.delta", (ev) => {
      this.emit("writing", { text: ev.delta, response_id: ev.response_id, role: "user" });
    });
    this.client.on("conversation.item.input_audio_transcription.done", (ev) => {
      this.emit("writing", { text: "\n", response_id: ev.response_id, role: "user" });
    });
    this.client.on("response.audio.delta", (ev) => {
      const audio = Buffer.from(ev.delta, "base64");
      this.emit("speaking", { audio, response_id: ev.response_id });
      const stream = speakerStreams.get(ev.response_id);
      stream?.write(audio);
    });
    this.client.on("response.audio.done", (ev) => {
      this.emit("speaking.done", { response_id: ev.response_id });
      const stream = speakerStreams.get(ev.response_id);
      stream?.end();
    });
    this.client.on("response.audio_transcript.delta", (ev) => {
      this.emit("writing", { text: ev.delta, response_id: ev.response_id, role: "assistant" });
    });
    this.client.on("response.audio_transcript.done", (ev) => {
      this.emit("writing", { text: "\n", response_id: ev.response_id, role: "assistant" });
    });
    this.client.on("response.text.delta", (ev) => {
      this.emit("writing", { text: ev.delta, response_id: ev.response_id, role: "assistant" });
    });
    this.client.on("response.text.done", (ev) => {
      this.emit("writing", { text: "\n", response_id: ev.response_id, role: "assistant" });
    });
    this.client.on("response.done", async (ev) => {
      await this.handleFunctionCalls(ev);
      this.emit("response.done", ev);
      speakerStreams.delete(ev.response.id);
    });
  }
  async handleFunctionCalls(ev) {
    for (const output of ev.response?.output ?? []) {
      if (output.type === "function_call") {
        await this.handleFunctionCall(output);
      }
    }
  }
  async handleFunctionCall(output) {
    try {
      const context = JSON.parse(output.arguments);
      const tool = this.tools?.[output.name];
      if (!tool) {
        console.warn(`Tool "${output.name}" not found`);
        return;
      }
      if (tool?.execute) {
        this.emit("tool-call-start", {
          toolCallId: output.call_id,
          toolName: output.name,
          toolDescription: tool.description,
          args: context
        });
      }
      const result = await tool?.execute?.(
        { context, runtimeContext: this.runtimeContext },
        {
          toolCallId: output.call_id,
          messages: []
        }
      );
      this.emit("tool-call-result", {
        toolCallId: output.call_id,
        toolName: output.name,
        toolDescription: tool.description,
        args: context,
        result
      });
      this.sendEvent("conversation.item.create", {
        item: {
          type: "function_call_output",
          call_id: output.call_id,
          output: JSON.stringify(result)
        }
      });
    } catch (e) {
      const err = e;
      console.warn(`Error calling tool "${output.name}":`, err.message);
      this.sendEvent("conversation.item.create", {
        item: {
          type: "function_call_output",
          call_id: output.call_id,
          output: JSON.stringify({ error: err.message })
        }
      });
    } finally {
      this.sendEvent("response.create", {});
    }
  }
  int16ArrayToBase64(int16Array) {
    const buffer = new ArrayBuffer(int16Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < int16Array.length; i++) {
      view.setInt16(i * 2, int16Array[i], true);
    }
    const uint8Array = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }
  sendEvent(type, data) {
    if (!this.ws || this.ws.readyState !== this.ws.OPEN) {
      this.queue.push({ type, ...data });
    } else {
      this.ws?.send(
        JSON.stringify({
          type,
          ...data
        })
      );
    }
  }
};

exports.OpenAIRealtimeVoice = OpenAIRealtimeVoice;
