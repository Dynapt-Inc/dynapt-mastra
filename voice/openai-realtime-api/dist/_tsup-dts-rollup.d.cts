import { MastraVoice } from '@mastra/core/voice';
import type { Realtime } from 'openai-realtime-api';
import type { RuntimeContext } from '@mastra/core/runtime-context';
import type { ToolsInput } from '@mastra/core/agent';

/**
 * Event callback function type
 */
declare type EventCallback = (...args: any[]) => void;

export declare const isReadableStream: (obj: unknown) => unknown;

export declare type OpenAIExecuteFunction = (args: any) => Promise<any>;

/**
 * OpenAIRealtimeVoice provides real-time voice interaction capabilities using OpenAI's
 * WebSocket-based API. It supports:
 * - Real-time text-to-speech
 * - Speech-to-text (transcription)
 * - Voice activity detection
 * - Multiple voice options
 * - Event-based audio streaming
 *
 * The class manages WebSocket connections, audio streaming, and event handling
 * for seamless voice interactions.
 *
 * @extends MastraVoice
 *
 * @example
 * ```typescript
 * const voice = new OpenAIRealtimeVoice({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   model: 'gpt-4o-mini-realtime'
 * });
 *
 * await voice.open();
 * voice.on('speaking', (audioData) => {
 *   // Handle audio data
 * });
 *
 * await voice.speak('Hello, how can I help you today?');
 * ```
 */
export declare class OpenAIRealtimeVoice extends MastraVoice {
    private options;
    private ws?;
    private state;
    private client;
    private events;
    private instructions?;
    private tools?;
    private debug;
    private queue;
    private transcriber;
    private runtimeContext?;
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
    constructor(options?: {
        model?: string;
        url?: string;
        apiKey?: string;
        speaker?: Realtime.Voice;
        transcriber?: Realtime.AudioTranscriptionModel;
        debug?: boolean;
    });
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
    getSpeakers(): Promise<Array<{
        voiceId: string;
        [key: string]: any;
    }>>;
    /**
     * Disconnects from the OpenAI realtime session and cleans up resources.
     * Should be called when you're done with the voice instance.
     *
     * @example
     * ```typescript
     * voice.close(); // Disconnects and cleans up
     * ```
     */
    close(): void;
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
    addInstructions(instructions?: string): void;
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
    addTools(tools?: TTools): void;
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
    speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: Realtime.Voice;
    }): Promise<void>;
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
    updateConfig(sessionConfig: unknown): void;
    /**
     * Checks if listening capabilities are enabled.
     *
     * @returns {Promise<{ enabled: boolean }>}
     */
    getListener(): Promise<{
        enabled: boolean;
    }>;
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
    listen(audioData: NodeJS.ReadableStream): Promise<void>;
    waitForOpen(): Promise<unknown>;
    waitForSessionCreated(): Promise<unknown>;
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
    connect({ runtimeContext }?: {
        runtimeContext?: RuntimeContext;
    }): Promise<void>;
    disconnect(): void;
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
    send(audioData: NodeJS.ReadableStream | Int16Array, eventId?: string): Promise<void>;
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
    answer({ options }: {
        options?: Realtime.ResponseConfig;
    }): Promise<void>;
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
    on(event: string, callback: EventCallback): void;
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
    off(event: string, callback: EventCallback): void;
    /**
     * Emit an event with arguments
     * @param event Event name
     * @param args Arguments to pass to the callbacks
     */
    private emit;
    private setupEventListeners;
    private handleFunctionCalls;
    private handleFunctionCall;
    private int16ArrayToBase64;
    private sendEvent;
}

declare type ToolDefinition = {
    type: 'function';
    name: string;
    description: string;
    parameters: {
        [key: string]: any;
    };
};

export declare const transformTools: (tools?: TTools_2) => {
    openaiTool: ToolDefinition;
    execute: OpenAIExecuteFunction;
}[];

declare type TTools = ToolsInput;

declare type TTools_2 = ToolsInput;

export { }
