'use strict';

var stream = require('stream');
var speech = require('@google-cloud/speech');
var textToSpeech = require('@google-cloud/text-to-speech');
var voice = require('@mastra/core/voice');

// src/index.ts
var DEFAULT_VOICE = "en-US-Casual-K";
var GoogleVoice = class extends voice.MastraVoice {
  ttsClient;
  speechClient;
  /**
   * Creates an instance of GoogleVoice
   * @param {Object} config - Configuration options
   * @param {GoogleModelConfig} [config.speechModel] - Configuration for speech synthesis
   * @param {GoogleModelConfig} [config.listeningModel] - Configuration for speech recognition
   * @param {string} [config.speaker] - Default voice ID to use for speech synthesis
   * @throws {Error} If no API key is provided via config or environment variable
   */
  constructor({
    listeningModel,
    speechModel,
    speaker
  } = {}) {
    const defaultApiKey = process.env.GOOGLE_API_KEY;
    const defaultSpeaker = DEFAULT_VOICE;
    super({
      speechModel: {
        name: "",
        apiKey: speechModel?.apiKey ?? defaultApiKey
      },
      listeningModel: {
        name: "",
        apiKey: listeningModel?.apiKey ?? defaultApiKey
      },
      speaker: speaker ?? defaultSpeaker
    });
    const apiKey = defaultApiKey || speechModel?.apiKey || listeningModel?.apiKey;
    if (!apiKey) {
      throw new Error(
        "Google API key is not set, set GOOGLE_API_KEY environment variable or pass apiKey to constructor"
      );
    }
    this.ttsClient = new textToSpeech.TextToSpeechClient({
      apiKey: this.speechModel?.apiKey || defaultApiKey
    });
    this.speechClient = new speech.SpeechClient({
      apiKey: this.listeningModel?.apiKey || defaultApiKey
    });
  }
  /**
   * Gets a list of available voices
   * @returns {Promise<Array<{voiceId: string, languageCodes: string[]}>>} List of available voices and their supported languages. Default language is en-US.
   */
  async getSpeakers({ languageCode = "en-US" } = {}) {
    return this.traced(async () => {
      const [response] = await this.ttsClient.listVoices({ languageCode });
      return (response?.voices || []).filter((voice) => voice.name && voice.languageCodes).map((voice) => ({
        voiceId: voice.name,
        languageCodes: voice.languageCodes
      }));
    }, "voice.google.getSpeakers")();
  }
  async streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
      } else {
        chunks.push(chunk);
      }
    }
    return Buffer.concat(chunks).toString("utf-8");
  }
  /**
   * Converts text to speech
   * @param {string | NodeJS.ReadableStream} input - Text or stream to convert to speech
   * @param {Object} [options] - Speech synthesis options
   * @param {string} [options.speaker] - Voice ID to use
   * @param {string} [options.languageCode] - Language code for the voice
   * @param {TextToSpeechTypes.cloud.texttospeech.v1.ISynthesizeSpeechRequest['audioConfig']} [options.audioConfig] - Audio configuration options
   * @returns {Promise<NodeJS.ReadableStream>} Stream of synthesized audio. Default encoding is LINEAR16.
   */
  async speak(input, options) {
    return this.traced(async () => {
      const text = typeof input === "string" ? input : await this.streamToString(input);
      const request = {
        input: { text },
        voice: {
          name: options?.speaker || this.speaker,
          languageCode: options?.languageCode || options?.speaker?.split("-").slice(0, 2).join("-") || "en-US"
        },
        audioConfig: options?.audioConfig || { audioEncoding: "LINEAR16" }
      };
      const [response] = await this.ttsClient.synthesizeSpeech(request);
      if (!response.audioContent) {
        throw new Error("No audio content returned.");
      }
      if (typeof response.audioContent === "string") {
        throw new Error("Audio content is a string.");
      }
      const stream$1 = new stream.PassThrough();
      stream$1.end(Buffer.from(response.audioContent));
      return stream$1;
    }, "voice.google.speak")();
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
   * Converts speech to text
   * @param {NodeJS.ReadableStream} audioStream - Audio stream to transcribe. Default encoding is LINEAR16.
   * @param {Object} [options] - Recognition options
   * @param {SpeechTypes.cloud.speech.v1.IRecognitionConfig} [options.config] - Recognition configuration
   * @returns {Promise<string>} Transcribed text
   */
  async listen(audioStream, options) {
    return this.traced(async () => {
      const chunks = [];
      for await (const chunk of audioStream) {
        if (typeof chunk === "string") {
          chunks.push(Buffer.from(chunk));
        } else {
          chunks.push(chunk);
        }
      }
      const buffer = Buffer.concat(chunks);
      let request = {
        config: {
          encoding: "LINEAR16",
          languageCode: "en-US",
          ...options?.config
        },
        audio: {
          content: buffer.toString("base64")
        }
      };
      console.log(`BEFORE REQUEST`);
      const [response] = await this.speechClient.recognize(request);
      console.log(`AFTER REQUEST`);
      if (!response.results || response.results.length === 0) {
        throw new Error("No transcription results returned");
      }
      const transcription = response.results.map((result) => {
        if (!result.alternatives || result.alternatives.length === 0) {
          return "";
        }
        return result.alternatives[0].transcript || "";
      }).filter((text) => text.length > 0).join(" ");
      if (!transcription) {
        throw new Error("No valid transcription found in results");
      }
      return transcription;
    }, "voice.google.listen")();
  }
};

exports.GoogleVoice = GoogleVoice;
