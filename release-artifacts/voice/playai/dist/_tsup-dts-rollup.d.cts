import { MastraVoice } from '@mastra/core/voice';

export declare const PLAYAI_VOICES: PlayAIVoiceInfo[];

declare interface PlayAIConfig {
    name?: 'PlayDialog' | 'Play3.0-mini';
    apiKey?: string;
    userId?: string;
}

export declare class PlayAIVoice extends MastraVoice {
    private baseUrl;
    private userId;
    constructor({ speechModel, speaker }?: {
        speechModel?: PlayAIConfig;
        speaker?: string;
    });
    private makeRequest;
    private streamToString;
    speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: string;
    }): Promise<NodeJS.ReadableStream>;
    /**
     * Checks if listening capabilities are enabled.
     *
     * @returns {Promise<{ enabled: boolean }>}
     */
    getListener(): Promise<{
        enabled: boolean;
    }>;
    listen(_input: NodeJS.ReadableStream, _options?: Record<string, unknown>): Promise<string | NodeJS.ReadableStream>;
    getSpeakers(): Promise<{
        voiceId: string;
        name: string;
        accent: string;
        gender: "M" | "F";
        age: "Young" | "Middle" | "Old";
        style: "Conversational" | "Narrative";
    }[]>;
}

declare interface PlayAIVoiceInfo {
    name: string;
    accent: string;
    gender: 'M' | 'F';
    age: 'Young' | 'Middle' | 'Old';
    style: 'Conversational' | 'Narrative';
    id: string;
}

export { }
