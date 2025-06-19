'use strict';

var voice = require('@mastra/core/voice');

// src/index.ts
var GladiaVoice = class extends voice.MastraVoice {
  apiKey;
  baseUrl = "https://api.gladia.io/v2";
  constructor({ listeningModel } = {}) {
    const defaultApiKey = process.env.GLADIA_API_KEY;
    super({
      listeningModel: {
        name: "gladia",
        apiKey: listeningModel?.apiKey ?? defaultApiKey
      }
    });
    this.apiKey = this.listeningModel?.apiKey;
    if (!this.apiKey) throw new Error("GLADIA_API_KEY is not set.");
  }
  async speak(_input, _options) {
    throw new Error("Gladia does not support text-to-speech.");
  }
  async listen(input, { mimeType, fileName, options }) {
    return this.traced(async () => {
      if (!fileName) {
        throw new Error("fileName is required for audio processing");
      }
      if (!mimeType) {
        throw new Error("mimeType is required for audio processing");
      }
      const chunks = [];
      for await (const chunk of input) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      const form = new FormData();
      form.append("audio", new Blob([audioBuffer], { type: mimeType }), fileName);
      const uploadRes = await fetch(`${this.baseUrl}/upload/`, {
        method: "POST",
        headers: { "x-gladia-key": this.apiKey },
        body: form
      });
      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
      }
      const { audio_url } = await uploadRes.json();
      const opts = {
        diarization: true,
        // <-- default
        ...options
      };
      const transcribeRes = await fetch(`${this.baseUrl}/pre-recorded/`, {
        method: "POST",
        headers: {
          "x-gladia-key": this.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ audio_url, ...opts })
      });
      const { id } = await transcribeRes.json();
      while (true) {
        const pollRes = await fetch(`${this.baseUrl}/pre-recorded/${id}`, {
          method: "GET",
          headers: {
            "x-gladia-key": this.apiKey,
            "Content-Type": "application/json"
          }
        });
        if (!pollRes.ok) {
          throw new Error(`Polling failed: ${pollRes.status} ${await pollRes.text()}`);
        }
        const pollJson = await pollRes.json();
        if (pollJson.status === "done") {
          const transcript = pollJson.result?.transcription?.full_transcript;
          if (!transcript) throw new Error("No transcript found");
          return transcript;
        }
        if (pollJson.status === "error") {
          throw new Error(`Gladia error: ${pollJson.error || "Unknown"}`);
        }
        await new Promise((res) => setTimeout(res, 1e3));
      }
    }, "voice.gladia.listen")();
  }
};

exports.GladiaVoice = GladiaVoice;
