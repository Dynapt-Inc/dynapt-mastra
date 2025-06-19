import { MastraVoice } from '@mastra/core/voice';
import Cloudflare from 'cloudflare';

// src/index.ts
var defaultListeningModel = {
  model: "@cf/openai/whisper-large-v3-turbo",
  apiKey: process.env.CLOUDFLARE_AI_API_KEY,
  account_id: process.env.CLOUDFLARE_ACCOUNT_ID
};
var CloudflareVoice = class extends MastraVoice {
  apiToken;
  client = null;
  binding;
  constructor({
    listeningModel,
    binding
  } = {}) {
    super({
      listeningModel: {
        name: listeningModel?.model ?? defaultListeningModel.model,
        apiKey: listeningModel?.apiKey ?? defaultListeningModel.apiKey
      }
    });
    this.binding = binding;
    if (!binding) {
      this.apiToken = listeningModel?.apiKey || defaultListeningModel.apiKey;
      if (!this.apiToken) {
        throw new Error("CLOUDFLARE_AI_API_KEY must be set when not using bindings");
      }
      this.client = new Cloudflare({ apiToken: this.apiToken });
    }
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
    return this.traced(async () => {
      const chunks = [];
      for await (const chunk of audioStream) {
        if (typeof chunk === "string") {
          chunks.push(Buffer.from(chunk));
        } else {
          chunks.push(chunk);
        }
      }
      const audioBuffer = Buffer.concat(chunks);
      const base64Audio = audioBuffer.toString("base64");
      const model = options?.model || defaultListeningModel.model;
      if (this.binding) {
        const response = await this.binding.run(model, {
          audio: base64Audio
        });
        return response.text;
      } else if (this.client) {
        const payload = { audio: base64Audio, account_id: options?.account_id || defaultListeningModel.account_id };
        const response = await this.client.ai.run(model, payload);
        return response.text;
      } else {
        throw new Error("Neither binding nor REST client is configured");
      }
    }, "voice.cloudflare.listen")();
  }
  async speak() {
    throw new Error("This feature is not yet implemented.");
  }
  async getSpeakers() {
    throw new Error("This feature is not yet implemented.");
  }
};

export { CloudflareVoice };
