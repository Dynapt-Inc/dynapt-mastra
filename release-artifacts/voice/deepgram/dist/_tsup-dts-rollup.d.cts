import { MastraVoice } from '@mastra/core/voice';

/**
 * List of available Deepgram models for text-to-speech and speech-to-text
 */
export declare const DEEPGRAM_MODELS: readonly ["aura", "whisper", "base", "enhanced", "nova", "nova-2", "nova-3"];

/**
 * List of available Deepgram voice models for text-to-speech
 * Each voice is designed for specific use cases and languages
 * Format: {name}-{language} (e.g. asteria-en)
 */
export declare const DEEPGRAM_VOICES: readonly ["asteria-en", "luna-en", "stella-en", "athena-en", "hera-en", "orion-en", "arcas-en", "perseus-en", "angus-en", "orpheus-en", "helios-en", "zeus-en"];

declare type DeepgramModel = (typeof DEEPGRAM_MODELS)[number];
export { DeepgramModel }
export { DeepgramModel as DeepgramModel_alias_1 }

export declare class DeepgramVoice extends MastraVoice {
    private speechClient?;
    private listeningClient?;
    constructor({ speechModel, listeningModel, speaker, }?: {
        speechModel?: DeepgramVoiceConfig;
        listeningModel?: DeepgramVoiceConfig;
        speaker?: DeepgramVoiceId;
    });
    getSpeakers(): Promise<{
        voiceId: "asteria-en" | "luna-en" | "stella-en" | "athena-en" | "hera-en" | "orion-en" | "arcas-en" | "perseus-en" | "angus-en" | "orpheus-en" | "helios-en" | "zeus-en";
    }[]>;
    speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: string;
        [key: string]: any;
    }): Promise<NodeJS.ReadableStream>;
    /**
     * Checks if listening capabilities are enabled.
     *
     * @returns {Promise<{ enabled: boolean }>}
     */
    getListener(): Promise<{
        enabled: boolean;
    }>;
    listen(audioStream: NodeJS.ReadableStream, options?: {
        [key: string]: any;
    }): Promise<string>;
}

export declare interface DeepgramVoiceConfig {
    name?: DeepgramModel;
    apiKey?: string;
    properties?: Record<string, any>;
    language?: string;
}

declare type DeepgramVoiceId = (typeof DEEPGRAM_VOICES)[number];
export { DeepgramVoiceId }
export { DeepgramVoiceId as DeepgramVoiceId_alias_1 }

export { }
