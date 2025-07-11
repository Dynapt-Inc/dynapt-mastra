'use strict';

var stream = require('stream');
var sdk = require('@deepgram/sdk');
var voice = require('@mastra/core/voice');

// src/index.ts

// src/voices.ts
var DEEPGRAM_VOICES = [
  "asteria-en",
  "luna-en",
  "stella-en",
  "athena-en",
  "hera-en",
  "orion-en",
  "arcas-en",
  "perseus-en",
  "angus-en",
  "orpheus-en",
  "helios-en",
  "zeus-en"
];

// src/index.ts
var DeepgramVoice = class extends voice.MastraVoice {
  speechClient;
  listeningClient;
  constructor({
    speechModel,
    listeningModel,
    speaker
  } = {}) {
    const defaultApiKey = process.env.DEEPGRAM_API_KEY;
    const defaultSpeechModel = {
      name: "aura",
      apiKey: defaultApiKey
    };
    const defaultListeningModel = {
      name: "nova",
      apiKey: defaultApiKey
    };
    super({
      speechModel: {
        name: speechModel?.name ?? defaultSpeechModel.name,
        apiKey: speechModel?.apiKey ?? defaultSpeechModel.apiKey
      },
      listeningModel: {
        name: listeningModel?.name ?? defaultListeningModel.name,
        apiKey: listeningModel?.apiKey ?? defaultListeningModel.apiKey
      },
      speaker
    });
    const speechApiKey = speechModel?.apiKey || defaultApiKey;
    const listeningApiKey = listeningModel?.apiKey || defaultApiKey;
    if (!speechApiKey && !listeningApiKey) {
      throw new Error("At least one of DEEPGRAM_API_KEY, speechModel.apiKey, or listeningModel.apiKey must be set");
    }
    if (speechApiKey) {
      this.speechClient = sdk.createClient(speechApiKey);
    }
    if (listeningApiKey) {
      this.listeningClient = sdk.createClient(listeningApiKey);
    }
    this.speaker = speaker || "asteria-en";
  }
  async getSpeakers() {
    return this.traced(async () => {
      return DEEPGRAM_VOICES.map((voice) => ({
        voiceId: voice
      }));
    }, "voice.deepgram.getSpeakers")();
  }
  async speak(input, options) {
    if (!this.speechClient) {
      throw new Error("Deepgram speech client not configured");
    }
    let text;
    if (typeof input !== "string") {
      const chunks = [];
      for await (const chunk of input) {
        if (typeof chunk === "string") {
          chunks.push(Buffer.from(chunk));
        } else {
          chunks.push(chunk);
        }
      }
      text = Buffer.concat(chunks).toString("utf-8");
    } else {
      text = input;
    }
    if (text.trim().length === 0) {
      throw new Error("Input text is empty");
    }
    return this.traced(async () => {
      if (!this.speechClient) {
        throw new Error("No speech client configured");
      }
      let model;
      if (options?.speaker) {
        model = this.speechModel?.name + "-" + options.speaker;
      } else if (this.speaker) {
        model = this.speechModel?.name + "-" + this.speaker;
      }
      const speakClient = this.speechClient.speak;
      const response = await speakClient.request(
        { text },
        {
          model,
          ...options
        }
      );
      const webStream = await response.getStream();
      if (!webStream) {
        throw new Error("No stream returned from Deepgram");
      }
      const reader = webStream.getReader();
      const nodeStream = new stream.PassThrough();
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              nodeStream.end();
              break;
            }
            nodeStream.write(value);
          }
        } catch (error) {
          nodeStream.destroy(error);
        }
      })().catch((error) => {
        nodeStream.destroy(error);
      });
      return nodeStream;
    }, "voice.deepgram.speak")();
  }
  /**
   * Checks if listening capabilities are enabled.
   *
   * @returns {Promise<{ enabled: boolean }>}
   */
  async getListener() {
    return { enabled: true };
  }
  async listen(audioStream, options) {
    if (!this.listeningClient) {
      throw new Error("Deepgram listening client not configured");
    }
    const chunks = [];
    for await (const chunk of audioStream) {
      if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
      } else {
        chunks.push(chunk);
      }
    }
    const buffer = Buffer.concat(chunks);
    return this.traced(async () => {
      if (!this.listeningClient) {
        throw new Error("No listening client configured");
      }
      const { result, error } = await this.listeningClient.listen.prerecorded.transcribeFile(buffer, {
        model: this.listeningModel?.name,
        ...options
      });
      if (error) {
        throw error;
      }
      const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript;
      if (!transcript) {
        throw new Error("No transcript found in Deepgram response");
      }
      return transcript;
    }, "voice.deepgram.listen")();
  }
};

exports.DeepgramVoice = DeepgramVoice;
