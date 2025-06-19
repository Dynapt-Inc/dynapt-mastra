'use strict';

var stream = require('stream');
var voice = require('@mastra/core/voice');
var Azure = require('microsoft-cognitiveservices-speech-sdk');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var Azure__namespace = /*#__PURE__*/_interopNamespace(Azure);

// src/index.ts

// src/voices.ts
var AZURE_VOICES = [
  "af-ZA-AdriNeural",
  "af-ZA-WillemNeural",
  "am-ET-MekdesNeural",
  "am-ET-AmehaNeural",
  "ar-AE-FatimaNeural",
  "ar-AE-HamdanNeural",
  "ar-BH-LailaNeural",
  "ar-BH-AliNeural",
  "ar-DZ-AminaNeural",
  "ar-DZ-IsmaelNeural",
  "ar-EG-SalmaNeural",
  "ar-EG-ShakirNeural",
  "ar-IQ-RanaNeural",
  "ar-IQ-BasselNeural",
  "ar-JO-SanaNeural",
  "ar-JO-TaimNeural",
  "ar-KW-NouraNeural",
  "ar-KW-FahedNeural",
  "ar-LB-LaylaNeural",
  "ar-LB-RamiNeural",
  "ar-LY-ImanNeural",
  "ar-LY-OmarNeural",
  "ar-MA-MounaNeural",
  "ar-MA-JamalNeural",
  "ar-OM-AyshaNeural",
  "ar-OM-AbdullahNeural",
  "ar-QA-AmalNeural",
  "ar-QA-MoazNeural",
  "ar-SA-ZariyahNeural",
  "ar-SA-HamedNeural",
  "ar-SY-AmanyNeural",
  "ar-SY-LaithNeural",
  "ar-TN-ReemNeural",
  "ar-TN-HediNeural",
  "ar-YE-MaryamNeural",
  "ar-YE-SalehNeural",
  "as-IN-YashicaNeural",
  "as-IN-PriyomNeural",
  "az-AZ-BanuNeural",
  "az-AZ-BabekNeural",
  "bg-BG-KalinaNeural",
  "bg-BG-BorislavNeural",
  "bn-BD-NabanitaNeural",
  "bn-BD-PradeepNeural",
  "bn-IN-TanishaaNeural",
  "bn-IN-BashkarNeural",
  "bs-BA-VesnaNeural",
  "bs-BA-GoranNeural",
  "ca-ES-JoanaNeural",
  "ca-ES-EnricNeural",
  "ca-ES-AlbaNeural",
  "cs-CZ-VlastaNeural",
  "cs-CZ-AntoninNeural",
  "cy-GB-NiaNeural",
  "cy-GB-AledNeural",
  "da-DK-ChristelNeural",
  "da-DK-JeppeNeural",
  "de-AT-IngridNeural",
  "de-AT-JonasNeural",
  "de-CH-LeniNeural",
  "de-CH-JanNeural",
  "de-DE-KatjaNeural",
  "de-DE-ConradNeural",
  "de-DE-SeraphinaMultilingualNeural",
  "de-DE-FlorianMultilingualNeural",
  "de-DE-AmalaNeural",
  "de-DE-BerndNeural",
  "de-DE-ChristophNeural",
  "de-DE-ElkeNeural",
  "de-DE-GiselaNeural",
  "de-DE-KasperNeural",
  "de-DE-KillianNeural",
  "de-DE-KlarissaNeural",
  "de-DE-KlausNeural",
  "de-DE-LouisaNeural",
  "de-DE-MajaNeural",
  "de-DE-RalfNeural",
  "de-DE-TanjaNeural",
  "de-DE-Seraphina:DragonHDLatestNeural",
  "el-GR-AthinaNeural",
  "el-GR-NestorasNeural",
  "en-AU-NatashaNeural",
  "en-AU-WilliamNeural",
  "en-AU-AnnetteNeural",
  "en-AU-CarlyNeural",
  "en-AU-DarrenNeural",
  "en-AU-DuncanNeural",
  "en-AU-ElsieNeural",
  "en-AU-FreyaNeural",
  "en-AU-JoanneNeural",
  "en-AU-KenNeural",
  "en-AU-KimNeural",
  "en-AU-NeilNeural",
  "en-AU-TimNeural",
  "en-AU-TinaNeural",
  "en-CA-ClaraNeural",
  "en-CA-LiamNeural",
  "en-GB-SoniaNeural",
  "en-GB-RyanNeural",
  "en-GB-LibbyNeural",
  "en-GB-AdaMultilingualNeural",
  "en-GB-OllieMultilingualNeural",
  "en-GB-AbbiNeural",
  "en-GB-AlfieNeural",
  "en-GB-BellaNeural",
  "en-GB-ElliotNeural",
  "en-GB-EthanNeural",
  "en-GB-HollieNeural",
  "en-GB-MaisieNeural",
  "en-GB-NoahNeural",
  "en-GB-OliverNeural",
  "en-GB-OliviaNeural",
  "en-GB-ThomasNeural",
  "en-GB-MiaNeural",
  "en-HK-YanNeural",
  "en-HK-SamNeural",
  "en-IE-EmilyNeural",
  "en-IE-ConnorNeural",
  "en-IN-AaravNeural",
  "en-IN-AashiNeural",
  "en-IN-AnanyaNeural",
  "en-IN-KavyaNeural",
  "en-IN-KunalNeural",
  "en-IN-NeerjaNeural",
  "en-IN-PrabhatNeural",
  "en-IN-RehaanNeural",
  "en-IN-AartiNeural",
  "en-IN-ArjunNeural",
  "en-KE-AsiliaNeural",
  "en-KE-ChilembaNeural",
  "en-NG-EzinneNeural",
  "en-NG-AbeoNeural",
  "en-NZ-MollyNeural",
  "en-NZ-MitchellNeural",
  "en-PH-RosaNeural",
  "en-PH-JamesNeural",
  "en-SG-LunaNeural",
  "en-SG-WayneNeural",
  "en-TZ-ImaniNeural",
  "en-TZ-ElimuNeural",
  "en-US-AvaMultilingualNeural",
  "en-US-AndrewMultilingualNeural",
  "en-US-EmmaMultilingualNeural",
  "en-US-BrianMultilingualNeural",
  "en-US-AvaNeural",
  "en-US-AndrewNeural",
  "en-US-EmmaNeural",
  "en-US-BrianNeural",
  "en-US-JennyNeural",
  "en-US-GuyNeural",
  "en-US-AriaNeural",
  "en-US-DavisNeural",
  "en-US-JaneNeural",
  "en-US-JasonNeural",
  "en-US-KaiNeural",
  "en-US-LunaNeural",
  "en-US-SaraNeural",
  "en-US-TonyNeural",
  "en-US-NancyNeural",
  "en-US-CoraMultilingualNeural",
  "en-US-ChristopherMultilingualNeural",
  "en-US-BrandonMultilingualNeural",
  "en-US-AmberNeural",
  "en-US-AnaNeural",
  "en-US-AshleyNeural",
  "en-US-BrandonNeural",
  "en-US-ChristopherNeural",
  "en-US-CoraNeural",
  "en-US-ElizabethNeural",
  "en-US-EricNeural",
  "en-US-JacobNeural",
  "en-US-JennyMultilingualNeural",
  "en-US-MichelleNeural",
  "en-US-MonicaNeural",
  "en-US-RogerNeural",
  "en-US-RyanMultilingualNeural",
  "en-US-SteffanNeural",
  "en-US-AdamMultilingualNeural",
  "en-US-AIGenerate1Neural",
  "en-US-AIGenerate2Neural",
  "en-US-AlloyTurboMultilingualNeural",
  "en-US-AmandaMultilingualNeural",
  "en-US-BlueNeural",
  "en-US-DavisMultilingualNeural",
  "en-US-DerekMultilingualNeural",
  "en-US-DustinMultilingualNeural",
  "en-US-EchoTurboMultilingualNeural",
  "en-US-EvelynMultilingualNeural",
  "en-US-FableTurboMultilingualNeural",
  "en-US-LewisMultilingualNeural",
  "en-US-LolaMultilingualNeural",
  "en-US-NancyMultilingualNeural",
  "en-US-NovaTurboMultilingualNeural",
  "en-US-OnyxTurboMultilingualNeural",
  "en-US-PhoebeMultilingualNeural",
  "en-US-SamuelMultilingualNeural",
  "en-US-SerenaMultilingualNeural",
  "en-US-ShimmerTurboMultilingualNeural",
  "en-US-SteffanMultilingualNeural",
  "en-US-Andrew:DragonHDLatestNeural",
  "en-US-Andrew2:DragonHDLatestNeural",
  "en-US-Aria:DragonHDLatestNeural",
  "en-US-Ava:DragonHDLatestNeural",
  "en-US-Brian:DragonHDLatestNeural",
  "en-US-Davis:DragonHDLatestNeural",
  "en-US-Emma:DragonHDLatestNeural",
  "en-US-Emma2:DragonHDLatestNeural",
  "en-US-Jenny:DragonHDLatestNeural",
  "en-US-Steffan:DragonHDLatestNeural",
  "en-ZA-LeahNeural",
  "en-ZA-LukeNeural"
];

// src/index.ts
var AzureVoice = class extends voice.MastraVoice {
  speechConfig;
  listeningConfig;
  speechSynthesizer;
  speechRecognizer;
  /**
   * Creates a new instance of AzureVoice for text-to-speech and speech-to-text services.
   *
   * @param {Object} config - Configuration options
   * @param {AzureVoiceConfig} [config.speechModel] - Configuration for text-to-speech
   * @param {AzureVoiceConfig} [config.listeningModel] - Configuration for speech-to-text
   * @param {VoiceId} [config.speaker] - Default voice ID for speech synthesis
   */
  constructor({
    speechModel,
    listeningModel,
    speaker
  } = {}) {
    super({
      speechModel: {
        name: "",
        apiKey: speechModel?.apiKey ?? process.env.AZURE_API_KEY
      },
      listeningModel: {
        name: "",
        apiKey: listeningModel?.apiKey ?? process.env.AZURE_API_KEY
      },
      speaker
    });
    const envApiKey = process.env.AZURE_API_KEY;
    const envRegion = process.env.AZURE_REGION;
    if (speechModel) {
      const apiKey = speechModel.apiKey ?? envApiKey;
      const region = speechModel.region ?? envRegion;
      if (!apiKey) throw new Error("No Azure API key provided for speech model");
      if (!region) throw new Error("No region provided for speech model");
      this.speechConfig = Azure__namespace.SpeechConfig.fromSubscription(apiKey, region);
      this.speechConfig.speechSynthesisVoiceName = speechModel.voiceName || speaker || "en-US-AriaNeural";
      this.speechSynthesizer = new Azure__namespace.SpeechSynthesizer(this.speechConfig);
    }
    if (listeningModel) {
      const apiKey = listeningModel.apiKey ?? envApiKey;
      const region = listeningModel.region ?? envRegion;
      if (!apiKey) throw new Error("No Azure API key provided for listening model");
      if (!region) throw new Error("No region provided for listening model");
      this.listeningConfig = Azure__namespace.SpeechConfig.fromSubscription(apiKey, region);
      if (listeningModel.language) {
        this.listeningConfig.speechRecognitionLanguage = listeningModel.language;
      }
      this.speechRecognizer = new Azure__namespace.SpeechRecognizer(this.listeningConfig);
    }
  }
  /**
   * Gets a list of available voices for speech synthesis.
   *
   * @returns {Promise<Array<{ voiceId: string; language: string; region: string; }>>} List of available voices
   */
  async getSpeakers() {
    return this.traced(async () => {
      return AZURE_VOICES.map((voice) => ({
        voiceId: voice,
        language: voice.split("-")[0],
        region: voice.split("-")[1]
      }));
    }, "voice.azure.voices")();
  }
  /**
   * Converts text to speech using Azure's Text-to-Speech service.
   *
   * @param {string | NodeJS.ReadableStream} input - Text to convert to speech
   * @param {Object} [options] - Optional parameters
   * @param {string} [options.speaker] - Voice ID to use for synthesis
   * @returns {Promise<NodeJS.ReadableStream>} Stream containing the synthesized audio
   * @throws {Error} If speech model is not configured or synthesis fails
   */
  async speak(input, options) {
    if (!this.speechConfig) {
      throw new Error("Speech model (Azure) not configured");
    }
    if (typeof input !== "string") {
      const chunks = [];
      try {
        for await (const chunk of input) {
          chunks.push(chunk);
        }
        input = Buffer.concat(chunks).toString("utf-8");
      } catch (error) {
        throw new Error(`Failed to read input stream: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (!input?.trim()) {
      throw new Error("Input text is empty");
    }
    if (options?.speaker) {
      this.speechConfig.speechSynthesisVoiceName = options.speaker;
    }
    const synthesizer = new Azure__namespace.SpeechSynthesizer(this.speechConfig);
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Speech synthesis timed out")), 5e3);
      });
      const synthesisPromise = this.traced(
        () => new Promise((resolve, reject) => {
          synthesizer.speakTextAsync(
            input,
            (result2) => result2.errorDetails ? reject(new Error(`Speech synthesis failed: ${result2.errorDetails}`)) : resolve(result2),
            (error) => reject(new Error(`Speech synthesis error: ${String(error)}`))
          );
        }),
        "voice.azure.speak"
      )();
      const result = await Promise.race([synthesisPromise, timeoutPromise]);
      synthesizer.close();
      if (result.reason !== Azure__namespace.ResultReason.SynthesizingAudioCompleted) {
        throw new Error(`Speech synthesis failed: ${result.errorDetails || result.reason}`);
      }
      return stream.Readable.from([Buffer.from(result.audioData)]);
    } catch (error) {
      synthesizer.close();
      throw error instanceof Error ? error : new Error(String(error));
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
  /**
   * Transcribes audio (STT) from a Node.js stream using Azure.
   *
   * @param {NodeJS.ReadableStream} audioStream - The audio to be transcribed, must be in .wav format.
   * @returns {Promise<string>} - The recognized text.
   */
  async listen(audioStream) {
    if (!this.listeningConfig || !this.speechRecognizer) {
      throw new Error("Listening model (Azure) not configured");
    }
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioData = Buffer.concat(chunks);
    const pushStream = Azure__namespace.AudioInputStream.createPushStream();
    const audioConfig = Azure__namespace.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new Azure__namespace.SpeechRecognizer(this.listeningConfig, audioConfig);
    try {
      const recognitionPromise = new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          (result) => {
            if (result.reason === Azure__namespace.ResultReason.RecognizedSpeech) {
              resolve(result.text);
            } else {
              const reason = Azure__namespace.ResultReason[result.reason] || result.reason;
              reject(new Error(`Speech recognition failed: ${reason} - ${result.errorDetails || ""}`));
            }
          },
          (error) => reject(new Error(`Speech recognition error: ${String(error)}`))
        );
      });
      const chunkSize = 4096;
      for (let i = 0; i < audioData.length; i += chunkSize) {
        const chunk = audioData.slice(i, i + chunkSize);
        pushStream.write(chunk);
      }
      pushStream.close();
      const text = await this.traced(() => recognitionPromise, "voice.azure.listen")();
      return text;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    } finally {
      recognizer.close();
    }
  }
};

exports.AzureVoice = AzureVoice;
