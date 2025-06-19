import type { google } from '@google-cloud/text-to-speech/build/protos/protos';
import type { google as google_2 } from '@google-cloud/speech/build/protos/protos';
import { MastraVoice } from '@mastra/core/voice';

/**
 * Configuration for Google Cloud Voice models
 * @interface GoogleModelConfig
 * @property {string} [apiKey] - Optional Google Cloud API key. If not provided, will use GOOGLE_API_KEY environment variable
 */
export declare interface GoogleModelConfig {
    apiKey?: string;
}

/**
 * GoogleVoice class provides Text-to-Speech and Speech-to-Text capabilities using Google Cloud services
 * @class GoogleVoice
 * @extends MastraVoice
 */
export declare class GoogleVoice extends MastraVoice {
    private ttsClient;
    private speechClient;
    /**
     * Creates an instance of GoogleVoice
     * @param {Object} config - Configuration options
     * @param {GoogleModelConfig} [config.speechModel] - Configuration for speech synthesis
     * @param {GoogleModelConfig} [config.listeningModel] - Configuration for speech recognition
     * @param {string} [config.speaker] - Default voice ID to use for speech synthesis
     * @throws {Error} If no API key is provided via config or environment variable
     */
    constructor({ listeningModel, speechModel, speaker, }?: {
        listeningModel?: GoogleModelConfig;
        speechModel?: GoogleModelConfig;
        speaker?: string;
    });
    /**
     * Gets a list of available voices
     * @returns {Promise<Array<{voiceId: string, languageCodes: string[]}>>} List of available voices and their supported languages. Default language is en-US.
     */
    getSpeakers({ languageCode }?: {
        languageCode?: string;
    }): Promise<{
        voiceId: string;
        languageCodes: string[];
    }[]>;
    private streamToString;
    /**
     * Converts text to speech
     * @param {string | NodeJS.ReadableStream} input - Text or stream to convert to speech
     * @param {Object} [options] - Speech synthesis options
     * @param {string} [options.speaker] - Voice ID to use
     * @param {string} [options.languageCode] - Language code for the voice
     * @param {TextToSpeechTypes.cloud.texttospeech.v1.ISynthesizeSpeechRequest['audioConfig']} [options.audioConfig] - Audio configuration options
     * @returns {Promise<NodeJS.ReadableStream>} Stream of synthesized audio. Default encoding is LINEAR16.
     */
    speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: string;
        languageCode?: string;
        audioConfig?: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest['audioConfig'];
    }): Promise<NodeJS.ReadableStream>;
    /**
     * Checks if listening capabilities are enabled.
     *
     * @returns {Promise<{ enabled: boolean }>}
     */
    getListener(): Promise<{
        enabled: boolean;
    }>;
    /**
     * Converts speech to text
     * @param {NodeJS.ReadableStream} audioStream - Audio stream to transcribe. Default encoding is LINEAR16.
     * @param {Object} [options] - Recognition options
     * @param {SpeechTypes.cloud.speech.v1.IRecognitionConfig} [options.config] - Recognition configuration
     * @returns {Promise<string>} Transcribed text
     */
    listen(audioStream: NodeJS.ReadableStream, options?: {
        stream?: boolean;
        config?: google_2.cloud.speech.v1.IRecognitionConfig;
    }): Promise<string>;
}

export { }
