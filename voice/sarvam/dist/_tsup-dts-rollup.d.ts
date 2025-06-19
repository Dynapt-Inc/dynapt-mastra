import { MastraVoice } from '@mastra/core/voice';

export declare const SARVAM_STT_LANGUAGES: readonly ["hi-IN", "bn-IN", "kn-IN", "ml-IN", "mr-IN", "od-IN", "pa-IN", "ta-IN", "te-IN", "en-IN", "gu-IN", "unknown"];

export declare const SARVAM_STT_MODELS: readonly ["saarika:v1", "saarika:v2", "saarika:flash"];

export declare const SARVAM_TTS_LANGUAGES: readonly ["hi-IN", "bn-IN", "kn-IN", "ml-IN", "mr-IN", "od-IN", "pa-IN", "ta-IN", "te-IN", "en-IN", "gu-IN"];

export declare const SARVAM_TTS_MODELS: readonly ["bulbul:v1"];

export declare const SARVAM_VOICES: readonly ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya", "diya", "neel", "misha", "vian", "arjun", "maya"];

declare interface SarvamListenOptions {
    apiKey?: string;
    model?: SarvamSTTModel;
    languageCode?: SarvamSTTLanguage;
    filetype?: 'mp3' | 'wav';
}

export declare type SarvamSTTLanguage = (typeof SARVAM_STT_LANGUAGES)[number];

export declare type SarvamSTTModel = (typeof SARVAM_STT_MODELS)[number];

export declare type SarvamTTSLanguage = (typeof SARVAM_TTS_LANGUAGES)[number];

export declare type SarvamTTSModel = (typeof SARVAM_TTS_MODELS)[number];

export declare class SarvamVoice extends MastraVoice {
    private apiKey?;
    private model;
    private language;
    private properties;
    protected speaker: SarvamVoiceId;
    private baseUrl;
    constructor({ speechModel, speaker, listeningModel, }?: {
        speechModel?: SarvamVoiceConfig;
        speaker?: SarvamVoiceId;
        listeningModel?: SarvamListenOptions;
    });
    private makeRequest;
    private streamToString;
    speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: SarvamVoiceId;
    }): Promise<NodeJS.ReadableStream>;
    getSpeakers(): Promise<{
        voiceId: "meera" | "pavithra" | "maitreyi" | "arvind" | "amol" | "amartya" | "diya" | "neel" | "misha" | "vian" | "arjun" | "maya";
    }[]>;
    /**
     * Checks if listening capabilities are enabled.
     *
     * @returns {Promise<{ enabled: boolean }>}
     */
    getListener(): Promise<{
        enabled: boolean;
    }>;
    listen(input: NodeJS.ReadableStream, options?: SarvamListenOptions): Promise<string>;
}

declare interface SarvamVoiceConfig {
    apiKey?: string;
    model?: SarvamTTSModel;
    language?: SarvamTTSLanguage;
    properties?: {
        pitch?: number;
        pace?: number;
        loudness?: number;
        speech_sample_rate?: 8000 | 16000 | 22050;
        enable_preprocessing?: boolean;
        eng_interpolation_wt?: number;
    };
}

export declare type SarvamVoiceId = (typeof SARVAM_VOICES)[number];

export { }
