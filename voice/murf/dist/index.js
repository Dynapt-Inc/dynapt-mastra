import { PassThrough } from 'stream';
import { MastraVoice } from '@mastra/core/voice';
import ky from 'ky';

// src/index.ts

// src/voices.ts
var MURF_VOICES = [
  "en-UK-hazel",
  "en-US-cooper",
  "en-US-imani",
  "it-IT-giorgio",
  "en-US-wayne",
  "en-IN-shivani",
  "en-US-daniel",
  "bn-IN-anwesha",
  "es-MX-alejandro",
  "en-AU-joyce",
  "en-US-zion",
  "en-IN-isha",
  "en-US-riley",
  "ko-KR-hwan",
  "fr-FR-ad\xE9lie",
  "en-US-carter",
  "en-UK-gabriel",
  "en-UK-juliet",
  "en-IN-arohi",
  "fr-FR-maxime",
  "de-DE-josephine",
  "en-UK-hugo",
  "en-US-samantha",
  "de-DE-erna",
  "zh-CN-baolin",
  "pt-BR-isadora",
  "it-IT-vincenzo",
  "en-US-terrell",
  "en-US-denzel",
  "en-UK-heidi",
  "en-US-miles",
  "en-US-abigail",
  "fr-FR-justine",
  "it-IT-greta",
  "en-AU-shane",
  "en-UK-peter",
  "nl-NL-famke",
  "en-AU-ivy",
  "nl-NL-dirk",
  "fr-FR-axel",
  "es-ES-carla",
  "en-US-claire",
  "ko-KR-jangmi",
  "ko-KR-sanghoon",
  "it-IT-vera",
  "hi-IN-rahul",
  "es-ES-elvira",
  "es-ES-enrique",
  "en-UK-aiden",
  "en-US-ronnie",
  "en-UK-amber",
  "hi-IN-shweta",
  "hi-IN-amit",
  "en-AU-jimm",
  "en-UK-pearl",
  "pt-BR-ben\xEDcio",
  "en-UK-freddie",
  "en-US-ryan",
  "pt-BR-eloa",
  "en-US-charlotte",
  "de-DE-lia",
  "en-US-natalie",
  "en-US-michelle",
  "en-US-phoebe",
  "es-ES-carmen",
  "en-US-caleb",
  "en-US-iris",
  "en-UK-harrison",
  "en-US-marcus",
  "en-US-josie",
  "en-US-daisy",
  "en-US-charles",
  "en-UK-reggie",
  "en-US-julia",
  "en-SCOTT-emily",
  "en-US-dylan",
  "es-MX-valeria",
  "en-IN-eashwar",
  "en-AU-evelyn",
  "de-DE-lara",
  "en-US-evander",
  "en-SCOTT-rory",
  "ta-IN-iniya",
  "en-AU-leyton",
  "fr-FR-louise",
  "zh-CN-wei",
  "ko-KR-gyeong",
  "de-DE-matthias",
  "en-IN-rohan",
  "en-US-delilah",
  "bn-IN-abhik",
  "en-US-angela",
  "en-US-naomi",
  "es-MX-carlos",
  "nl-NL-merel",
  "en-US-alicia",
  "en-IN-alia",
  "zh-CN-jiao",
  "en-US-june",
  "en-AU-ashton",
  "en-UK-finley",
  "pl-PL-blazej",
  "zh-CN-zhang",
  "en-AU-kylie",
  "en-US-jayden",
  "en-IN-aarav",
  "de-DE-bj\xF6rn",
  "bn-IN-ishani",
  "zh-CN-yuxan",
  "fr-FR-louis",
  "ko-KR-jong-su",
  "en-AU-harper",
  "en-UK-ruby",
  "en-US-ken",
  "ta-IN-mani",
  "de-DE-ralf",
  "en-UK-jaxon",
  "en-US-river",
  "en-IN-priya",
  "en-UK-theo",
  "en-UK-katie",
  "pl-PL-jacek",
  "it-IT-lorenzo",
  "hi-IN-shaan",
  "en-US-amara",
  "en-UK-mason",
  "en-IN-surya",
  "en-US-finn",
  "pt-BR-gustavo",
  "hi-IN-kabir",
  "es-ES-javier",
  "en-AU-mitch",
  "pt-BR-heitor",
  "en-US-edmund",
  "hi-IN-ayushi",
  "pl-PL-kasia",
  "es-MX-luisa",
  "zh-CN-tao",
  "en-US-molly"
];

// src/index.ts
var MurfVoice = class extends MastraVoice {
  client;
  defaultVoice;
  properties;
  constructor({ speechModel, speaker } = {}) {
    super({
      speechModel: {
        name: speechModel?.name ?? "GEN2",
        apiKey: speechModel?.apiKey ?? process.env.MURF_API_KEY
      },
      speaker: speaker ?? MURF_VOICES[0]
    });
    const apiKey = this.speechModel?.apiKey;
    if (!apiKey) {
      throw new Error("MURF_API_KEY is not set");
    }
    this.properties = {
      ...speechModel?.properties
    };
    this.client = ky.create({
      prefixUrl: "https://api.murf.ai",
      headers: {
        "api-key": apiKey
      }
    });
    this.defaultVoice = speaker ?? MURF_VOICES[0];
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
      const response = await this.client.post("v1/speech/generate", {
        json: {
          voiceId: options?.speaker || this.defaultVoice,
          text,
          modelVersion: this.speechModel?.name,
          ...this.properties,
          ...options?.properties
        }
      }).json();
      const stream = new PassThrough();
      const audioResponse = await fetch(response.audioFile);
      if (!audioResponse.body) {
        throw new Error("No response body received");
      }
      const reader = audioResponse.body.getReader();
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              stream.end();
              break;
            }
            stream.write(value);
          }
        } catch (error) {
          stream.destroy(error);
        }
      })().catch((error) => {
        stream.destroy(error);
      });
      return stream;
    }, "voice.murf.speak")();
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
    throw new Error("Murf does not support speech recognition");
  }
  async getSpeakers() {
    return this.traced(async () => {
      return MURF_VOICES.map((voice) => ({
        voiceId: voice,
        name: voice,
        language: voice.split("-")[0],
        gender: "neutral"
      }));
    }, "voice.murf.getSpeakers")();
  }
};

export { MurfVoice };
