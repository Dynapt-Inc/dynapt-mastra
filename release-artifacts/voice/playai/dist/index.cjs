'use strict';

var stream = require('stream');
var voice = require('@mastra/core/voice');

// src/index.ts
var PLAYAI_VOICES = [
  {
    name: "Angelo",
    accent: "US",
    gender: "M",
    age: "Young",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json"
  },
  {
    name: "Arsenio",
    accent: "US African American",
    gender: "M",
    age: "Middle",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/65977f5e-a22a-4b36-861b-ecede19bdd65/original/manifest.json"
  },
  {
    name: "Cillian",
    accent: "Irish",
    gender: "M",
    age: "Middle",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/1591b954-8760-41a9-bc58-9176a68c5726/original/manifest.json"
  },
  {
    name: "Timo",
    accent: "US",
    gender: "M",
    age: "Middle",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/677a4ae3-252f-476e-85ce-eeed68e85951/original/manifest.json"
  },
  {
    name: "Dexter",
    accent: "US",
    gender: "M",
    age: "Middle",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/b27bc13e-996f-4841-b584-4d35801aea98/original/manifest.json"
  },
  {
    name: "Miles",
    accent: "US African American",
    gender: "M",
    age: "Young",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/29dd9a52-bd32-4a6e-bff1-bbb98dcc286a/original/manifest.json"
  },
  {
    name: "Briggs",
    accent: "US Southern (Oklahoma)",
    gender: "M",
    age: "Old",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/71cdb799-1e03-41c6-8a05-f7cd55134b0b/original/manifest.json"
  },
  {
    name: "Deedee",
    accent: "US African American",
    gender: "F",
    age: "Middle",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json"
  },
  {
    name: "Nia",
    accent: "US",
    gender: "F",
    age: "Young",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/831bd330-85c6-4333-b2b4-10c476ea3491/original/manifest.json"
  },
  {
    name: "Inara",
    accent: "US African American",
    gender: "F",
    age: "Middle",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/adb83b67-8d75-48ff-ad4d-a0840d231ef1/original/manifest.json"
  },
  {
    name: "Constanza",
    accent: "US Latin American",
    gender: "F",
    age: "Young",
    style: "Conversational",
    id: "s3://voice-cloning-zero-shot/b0aca4d7-1738-4848-a80b-307ac44a7298/original/manifest.json"
  },
  {
    name: "Gideon",
    accent: "British",
    gender: "M",
    age: "Old",
    style: "Narrative",
    id: "s3://voice-cloning-zero-shot/5a3a1168-7793-4b2c-8f90-aff2b5232131/original/manifest.json"
  },
  {
    name: "Casper",
    accent: "US",
    gender: "M",
    age: "Middle",
    style: "Narrative",
    id: "s3://voice-cloning-zero-shot/1bbc6986-fadf-4bd8-98aa-b86fed0476e9/original/manifest.json"
  },
  {
    name: "Mitch",
    accent: "Australian",
    gender: "M",
    age: "Middle",
    style: "Narrative",
    id: "s3://voice-cloning-zero-shot/c14e50f2-c5e3-47d1-8c45-fa4b67803d19/original/manifest.json"
  },
  {
    name: "Ava",
    accent: "Australian",
    gender: "F",
    age: "Middle",
    style: "Narrative",
    id: "s3://voice-cloning-zero-shot/50381567-ff7b-46d2-bfdc-a9584a85e08d/original/manifest.json"
  }
];
var PlayAIVoice = class extends voice.MastraVoice {
  baseUrl = "https://api.play.ai/api/v1";
  userId;
  constructor({ speechModel, speaker } = {}) {
    super({
      speechModel: {
        name: speechModel?.name ?? "PlayDialog",
        apiKey: speechModel?.apiKey ?? process.env.PLAYAI_API_KEY
      },
      speaker: speaker ?? PLAYAI_VOICES[0]?.id
    });
    const userId = speechModel?.userId ?? process.env.PLAYAI_USER_ID;
    if (!userId) {
      throw new Error("userId is required");
    }
    this.userId = userId;
  }
  async makeRequest(endpoint, payload, method = "POST") {
    const headers = new Headers({
      Authorization: `Bearer ${this.speechModel?.apiKey}`,
      "Content-Type": "application/json",
      "X-USER-ID": this.userId
    });
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : void 0
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PlayAI API Error: ${error.message || response.statusText}`);
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
        text,
        voice: options?.speaker || this.speaker,
        model: this.speechModel?.name
      };
      const response = await this.makeRequest("/tts/stream", payload);
      if (!response.body) {
        throw new Error("No response body received");
      }
      const stream$1 = new stream.PassThrough();
      const reader = response.body.getReader();
      void (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              stream$1.end();
              break;
            }
            stream$1.write(value);
          }
        } catch (error) {
          stream$1.destroy(error);
        }
      })();
      return stream$1;
    }, "voice.playai.speak")();
  }
  /**
   * Checks if listening capabilities are enabled.
   *
   * @returns {Promise<{ enabled: boolean }>}
   */
  async getListener() {
    return { enabled: false };
  }
  async listen(_input, _options) {
    throw new Error("PlayAI does not support speech recognition");
  }
  async getSpeakers() {
    return this.traced(
      () => Promise.resolve(
        PLAYAI_VOICES.map((voice) => ({
          voiceId: voice.id,
          name: voice.name,
          accent: voice.accent,
          gender: voice.gender,
          age: voice.age,
          style: voice.style
        }))
      ),
      "voice.playai.voices"
    )();
  }
};

exports.PLAYAI_VOICES = PLAYAI_VOICES;
exports.PlayAIVoice = PlayAIVoice;
