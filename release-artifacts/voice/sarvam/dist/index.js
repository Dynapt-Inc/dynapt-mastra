import { PassThrough } from 'stream';
import { MastraVoice } from '@mastra/core/voice';

// src/index.ts

// src/voices.ts
var SARVAM_VOICES = [
  "meera",
  "pavithra",
  "maitreyi",
  "arvind",
  "amol",
  "amartya",
  "diya",
  "neel",
  "misha",
  "vian",
  "arjun",
  "maya"
];

// src/index.ts
var defaultSpeechModel = {
  model: "bulbul:v1",
  apiKey: process.env.SARVAM_API_KEY,
  language: "en-IN"
};
var defaultListeningModel = {
  model: "saarika:v2",
  apiKey: process.env.SARVAM_API_KEY};
var SarvamVoice = class extends MastraVoice {
  apiKey;
  model = "bulbul:v1";
  language = "en-IN";
  properties = {};
  speaker = "meera";
  baseUrl = "https://api.sarvam.ai";
  constructor({
    speechModel,
    speaker,
    listeningModel
  } = {}) {
    super({
      speechModel: {
        name: speechModel?.model ?? defaultSpeechModel.model,
        apiKey: speechModel?.apiKey ?? defaultSpeechModel.apiKey
      },
      listeningModel: {
        name: listeningModel?.model ?? defaultListeningModel.model,
        apiKey: listeningModel?.model ?? defaultListeningModel.apiKey
      },
      speaker
    });
    this.apiKey = speechModel?.apiKey || defaultSpeechModel.apiKey;
    if (!this.apiKey) {
      throw new Error("SARVAM_API_KEY must be set");
    }
    this.model = speechModel?.model || defaultSpeechModel.model;
    this.language = speechModel?.language || defaultSpeechModel.language;
    this.properties = speechModel?.properties || {};
    this.speaker = speaker || "meera";
  }
  async makeRequest(endpoint, payload) {
    const headers = new Headers({
      "api-subscription-key": this.apiKey,
      "Content-Type": "application/json"
    });
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      let errorMessage;
      try {
        const error = await response.json();
        errorMessage = error.message || response.statusText;
      } catch {
        errorMessage = response.statusText;
      }
      throw new Error(`Sarvam AI API Error: ${errorMessage}`);
    }
    return response;
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
  async speak(input, options) {
    const text = typeof input === "string" ? input : await this.streamToString(input);
    return this.traced(async () => {
      const payload = {
        inputs: [text],
        target_language_code: this.language,
        speaker: options?.speaker || this.speaker,
        model: this.model,
        ...this.properties
      };
      const response = await this.makeRequest("/text-to-speech", payload);
      const { audios } = await response.json();
      if (!audios || !audios.length) {
        throw new Error("No audio received from Sarvam AI");
      }
      const audioBuffer = Buffer.from(audios[0], "base64");
      const stream = new PassThrough();
      stream.write(audioBuffer);
      stream.end();
      return stream;
    }, "voice.sarvam.speak")();
  }
  async getSpeakers() {
    return this.traced(async () => {
      return SARVAM_VOICES.map((voice) => ({
        voiceId: voice
      }));
    }, "voice.deepgram.getSpeakers")();
  }
  /**
   * Checks if listening capabilities are enabled.
   *
   * @returns {Promise<{ enabled: boolean }>}
   */
  async getListener() {
    return { enabled: true };
  }
  async listen(input, options) {
    return this.traced(async () => {
      const chunks = [];
      for await (const chunk of input) {
        if (typeof chunk === "string") {
          chunks.push(Buffer.from(chunk));
        } else {
          chunks.push(chunk);
        }
      }
      const audioBuffer = Buffer.concat(chunks);
      const form = new FormData();
      const mimeType = options?.filetype === "mp3" ? "audio/mpeg" : "audio/wav";
      const blob = new Blob([audioBuffer], { type: mimeType });
      form.append("file", blob);
      form.append("model", options?.model || "saarika:v2");
      form.append("language_code", options?.languageCode || "unknown");
      const requestOptions = {
        method: "POST",
        headers: {
          "api-subscription-key": this.apiKey
        },
        body: form
      };
      try {
        const response = await fetch(`${this.baseUrl}/speech-to-text`, requestOptions);
        const result = await response.json();
        return result.transcript;
      } catch (error) {
        console.error("Error during speech-to-text request:", error);
        throw error;
      }
    }, "voice.sarvam.listen")();
  }
};

export { SarvamVoice };
