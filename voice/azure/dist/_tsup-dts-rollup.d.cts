import { MastraVoice } from '@mastra/core/voice';

export declare const AZURE_VOICES: readonly ["af-ZA-AdriNeural", "af-ZA-WillemNeural", "am-ET-MekdesNeural", "am-ET-AmehaNeural", "ar-AE-FatimaNeural", "ar-AE-HamdanNeural", "ar-BH-LailaNeural", "ar-BH-AliNeural", "ar-DZ-AminaNeural", "ar-DZ-IsmaelNeural", "ar-EG-SalmaNeural", "ar-EG-ShakirNeural", "ar-IQ-RanaNeural", "ar-IQ-BasselNeural", "ar-JO-SanaNeural", "ar-JO-TaimNeural", "ar-KW-NouraNeural", "ar-KW-FahedNeural", "ar-LB-LaylaNeural", "ar-LB-RamiNeural", "ar-LY-ImanNeural", "ar-LY-OmarNeural", "ar-MA-MounaNeural", "ar-MA-JamalNeural", "ar-OM-AyshaNeural", "ar-OM-AbdullahNeural", "ar-QA-AmalNeural", "ar-QA-MoazNeural", "ar-SA-ZariyahNeural", "ar-SA-HamedNeural", "ar-SY-AmanyNeural", "ar-SY-LaithNeural", "ar-TN-ReemNeural", "ar-TN-HediNeural", "ar-YE-MaryamNeural", "ar-YE-SalehNeural", "as-IN-YashicaNeural", "as-IN-PriyomNeural", "az-AZ-BanuNeural", "az-AZ-BabekNeural", "bg-BG-KalinaNeural", "bg-BG-BorislavNeural", "bn-BD-NabanitaNeural", "bn-BD-PradeepNeural", "bn-IN-TanishaaNeural", "bn-IN-BashkarNeural", "bs-BA-VesnaNeural", "bs-BA-GoranNeural", "ca-ES-JoanaNeural", "ca-ES-EnricNeural", "ca-ES-AlbaNeural", "cs-CZ-VlastaNeural", "cs-CZ-AntoninNeural", "cy-GB-NiaNeural", "cy-GB-AledNeural", "da-DK-ChristelNeural", "da-DK-JeppeNeural", "de-AT-IngridNeural", "de-AT-JonasNeural", "de-CH-LeniNeural", "de-CH-JanNeural", "de-DE-KatjaNeural", "de-DE-ConradNeural", "de-DE-SeraphinaMultilingualNeural", "de-DE-FlorianMultilingualNeural", "de-DE-AmalaNeural", "de-DE-BerndNeural", "de-DE-ChristophNeural", "de-DE-ElkeNeural", "de-DE-GiselaNeural", "de-DE-KasperNeural", "de-DE-KillianNeural", "de-DE-KlarissaNeural", "de-DE-KlausNeural", "de-DE-LouisaNeural", "de-DE-MajaNeural", "de-DE-RalfNeural", "de-DE-TanjaNeural", "de-DE-Seraphina:DragonHDLatestNeural", "el-GR-AthinaNeural", "el-GR-NestorasNeural", "en-AU-NatashaNeural", "en-AU-WilliamNeural", "en-AU-AnnetteNeural", "en-AU-CarlyNeural", "en-AU-DarrenNeural", "en-AU-DuncanNeural", "en-AU-ElsieNeural", "en-AU-FreyaNeural", "en-AU-JoanneNeural", "en-AU-KenNeural", "en-AU-KimNeural", "en-AU-NeilNeural", "en-AU-TimNeural", "en-AU-TinaNeural", "en-CA-ClaraNeural", "en-CA-LiamNeural", "en-GB-SoniaNeural", "en-GB-RyanNeural", "en-GB-LibbyNeural", "en-GB-AdaMultilingualNeural", "en-GB-OllieMultilingualNeural", "en-GB-AbbiNeural", "en-GB-AlfieNeural", "en-GB-BellaNeural", "en-GB-ElliotNeural", "en-GB-EthanNeural", "en-GB-HollieNeural", "en-GB-MaisieNeural", "en-GB-NoahNeural", "en-GB-OliverNeural", "en-GB-OliviaNeural", "en-GB-ThomasNeural", "en-GB-MiaNeural", "en-HK-YanNeural", "en-HK-SamNeural", "en-IE-EmilyNeural", "en-IE-ConnorNeural", "en-IN-AaravNeural", "en-IN-AashiNeural", "en-IN-AnanyaNeural", "en-IN-KavyaNeural", "en-IN-KunalNeural", "en-IN-NeerjaNeural", "en-IN-PrabhatNeural", "en-IN-RehaanNeural", "en-IN-AartiNeural", "en-IN-ArjunNeural", "en-KE-AsiliaNeural", "en-KE-ChilembaNeural", "en-NG-EzinneNeural", "en-NG-AbeoNeural", "en-NZ-MollyNeural", "en-NZ-MitchellNeural", "en-PH-RosaNeural", "en-PH-JamesNeural", "en-SG-LunaNeural", "en-SG-WayneNeural", "en-TZ-ImaniNeural", "en-TZ-ElimuNeural", "en-US-AvaMultilingualNeural", "en-US-AndrewMultilingualNeural", "en-US-EmmaMultilingualNeural", "en-US-BrianMultilingualNeural", "en-US-AvaNeural", "en-US-AndrewNeural", "en-US-EmmaNeural", "en-US-BrianNeural", "en-US-JennyNeural", "en-US-GuyNeural", "en-US-AriaNeural", "en-US-DavisNeural", "en-US-JaneNeural", "en-US-JasonNeural", "en-US-KaiNeural", "en-US-LunaNeural", "en-US-SaraNeural", "en-US-TonyNeural", "en-US-NancyNeural", "en-US-CoraMultilingualNeural", "en-US-ChristopherMultilingualNeural", "en-US-BrandonMultilingualNeural", "en-US-AmberNeural", "en-US-AnaNeural", "en-US-AshleyNeural", "en-US-BrandonNeural", "en-US-ChristopherNeural", "en-US-CoraNeural", "en-US-ElizabethNeural", "en-US-EricNeural", "en-US-JacobNeural", "en-US-JennyMultilingualNeural", "en-US-MichelleNeural", "en-US-MonicaNeural", "en-US-RogerNeural", "en-US-RyanMultilingualNeural", "en-US-SteffanNeural", "en-US-AdamMultilingualNeural", "en-US-AIGenerate1Neural", "en-US-AIGenerate2Neural", "en-US-AlloyTurboMultilingualNeural", "en-US-AmandaMultilingualNeural", "en-US-BlueNeural", "en-US-DavisMultilingualNeural", "en-US-DerekMultilingualNeural", "en-US-DustinMultilingualNeural", "en-US-EchoTurboMultilingualNeural", "en-US-EvelynMultilingualNeural", "en-US-FableTurboMultilingualNeural", "en-US-LewisMultilingualNeural", "en-US-LolaMultilingualNeural", "en-US-NancyMultilingualNeural", "en-US-NovaTurboMultilingualNeural", "en-US-OnyxTurboMultilingualNeural", "en-US-PhoebeMultilingualNeural", "en-US-SamuelMultilingualNeural", "en-US-SerenaMultilingualNeural", "en-US-ShimmerTurboMultilingualNeural", "en-US-SteffanMultilingualNeural", "en-US-Andrew:DragonHDLatestNeural", "en-US-Andrew2:DragonHDLatestNeural", "en-US-Aria:DragonHDLatestNeural", "en-US-Ava:DragonHDLatestNeural", "en-US-Brian:DragonHDLatestNeural", "en-US-Davis:DragonHDLatestNeural", "en-US-Emma:DragonHDLatestNeural", "en-US-Emma2:DragonHDLatestNeural", "en-US-Jenny:DragonHDLatestNeural", "en-US-Steffan:DragonHDLatestNeural", "en-ZA-LeahNeural", "en-ZA-LukeNeural"];

export declare class AzureVoice extends MastraVoice {
    private speechConfig?;
    private listeningConfig?;
    private speechSynthesizer?;
    private speechRecognizer?;
    /**
     * Creates a new instance of AzureVoice for text-to-speech and speech-to-text services.
     *
     * @param {Object} config - Configuration options
     * @param {AzureVoiceConfig} [config.speechModel] - Configuration for text-to-speech
     * @param {AzureVoiceConfig} [config.listeningModel] - Configuration for speech-to-text
     * @param {VoiceId} [config.speaker] - Default voice ID for speech synthesis
     */
    constructor({ speechModel, listeningModel, speaker, }?: {
        speechModel?: AzureVoiceConfig;
        listeningModel?: AzureVoiceConfig;
        speaker?: VoiceId;
    });
    /**
     * Gets a list of available voices for speech synthesis.
     *
     * @returns {Promise<Array<{ voiceId: string; language: string; region: string; }>>} List of available voices
     */
    getSpeakers(): Promise<{
        voiceId: "af-ZA-AdriNeural" | "af-ZA-WillemNeural" | "am-ET-MekdesNeural" | "am-ET-AmehaNeural" | "ar-AE-FatimaNeural" | "ar-AE-HamdanNeural" | "ar-BH-LailaNeural" | "ar-BH-AliNeural" | "ar-DZ-AminaNeural" | "ar-DZ-IsmaelNeural" | "ar-EG-SalmaNeural" | "ar-EG-ShakirNeural" | "ar-IQ-RanaNeural" | "ar-IQ-BasselNeural" | "ar-JO-SanaNeural" | "ar-JO-TaimNeural" | "ar-KW-NouraNeural" | "ar-KW-FahedNeural" | "ar-LB-LaylaNeural" | "ar-LB-RamiNeural" | "ar-LY-ImanNeural" | "ar-LY-OmarNeural" | "ar-MA-MounaNeural" | "ar-MA-JamalNeural" | "ar-OM-AyshaNeural" | "ar-OM-AbdullahNeural" | "ar-QA-AmalNeural" | "ar-QA-MoazNeural" | "ar-SA-ZariyahNeural" | "ar-SA-HamedNeural" | "ar-SY-AmanyNeural" | "ar-SY-LaithNeural" | "ar-TN-ReemNeural" | "ar-TN-HediNeural" | "ar-YE-MaryamNeural" | "ar-YE-SalehNeural" | "as-IN-YashicaNeural" | "as-IN-PriyomNeural" | "az-AZ-BanuNeural" | "az-AZ-BabekNeural" | "bg-BG-KalinaNeural" | "bg-BG-BorislavNeural" | "bn-BD-NabanitaNeural" | "bn-BD-PradeepNeural" | "bn-IN-TanishaaNeural" | "bn-IN-BashkarNeural" | "bs-BA-VesnaNeural" | "bs-BA-GoranNeural" | "ca-ES-JoanaNeural" | "ca-ES-EnricNeural" | "ca-ES-AlbaNeural" | "cs-CZ-VlastaNeural" | "cs-CZ-AntoninNeural" | "cy-GB-NiaNeural" | "cy-GB-AledNeural" | "da-DK-ChristelNeural" | "da-DK-JeppeNeural" | "de-AT-IngridNeural" | "de-AT-JonasNeural" | "de-CH-LeniNeural" | "de-CH-JanNeural" | "de-DE-KatjaNeural" | "de-DE-ConradNeural" | "de-DE-SeraphinaMultilingualNeural" | "de-DE-FlorianMultilingualNeural" | "de-DE-AmalaNeural" | "de-DE-BerndNeural" | "de-DE-ChristophNeural" | "de-DE-ElkeNeural" | "de-DE-GiselaNeural" | "de-DE-KasperNeural" | "de-DE-KillianNeural" | "de-DE-KlarissaNeural" | "de-DE-KlausNeural" | "de-DE-LouisaNeural" | "de-DE-MajaNeural" | "de-DE-RalfNeural" | "de-DE-TanjaNeural" | "de-DE-Seraphina:DragonHDLatestNeural" | "el-GR-AthinaNeural" | "el-GR-NestorasNeural" | "en-AU-NatashaNeural" | "en-AU-WilliamNeural" | "en-AU-AnnetteNeural" | "en-AU-CarlyNeural" | "en-AU-DarrenNeural" | "en-AU-DuncanNeural" | "en-AU-ElsieNeural" | "en-AU-FreyaNeural" | "en-AU-JoanneNeural" | "en-AU-KenNeural" | "en-AU-KimNeural" | "en-AU-NeilNeural" | "en-AU-TimNeural" | "en-AU-TinaNeural" | "en-CA-ClaraNeural" | "en-CA-LiamNeural" | "en-GB-SoniaNeural" | "en-GB-RyanNeural" | "en-GB-LibbyNeural" | "en-GB-AdaMultilingualNeural" | "en-GB-OllieMultilingualNeural" | "en-GB-AbbiNeural" | "en-GB-AlfieNeural" | "en-GB-BellaNeural" | "en-GB-ElliotNeural" | "en-GB-EthanNeural" | "en-GB-HollieNeural" | "en-GB-MaisieNeural" | "en-GB-NoahNeural" | "en-GB-OliverNeural" | "en-GB-OliviaNeural" | "en-GB-ThomasNeural" | "en-GB-MiaNeural" | "en-HK-YanNeural" | "en-HK-SamNeural" | "en-IE-EmilyNeural" | "en-IE-ConnorNeural" | "en-IN-AaravNeural" | "en-IN-AashiNeural" | "en-IN-AnanyaNeural" | "en-IN-KavyaNeural" | "en-IN-KunalNeural" | "en-IN-NeerjaNeural" | "en-IN-PrabhatNeural" | "en-IN-RehaanNeural" | "en-IN-AartiNeural" | "en-IN-ArjunNeural" | "en-KE-AsiliaNeural" | "en-KE-ChilembaNeural" | "en-NG-EzinneNeural" | "en-NG-AbeoNeural" | "en-NZ-MollyNeural" | "en-NZ-MitchellNeural" | "en-PH-RosaNeural" | "en-PH-JamesNeural" | "en-SG-LunaNeural" | "en-SG-WayneNeural" | "en-TZ-ImaniNeural" | "en-TZ-ElimuNeural" | "en-US-AvaMultilingualNeural" | "en-US-AndrewMultilingualNeural" | "en-US-EmmaMultilingualNeural" | "en-US-BrianMultilingualNeural" | "en-US-AvaNeural" | "en-US-AndrewNeural" | "en-US-EmmaNeural" | "en-US-BrianNeural" | "en-US-JennyNeural" | "en-US-GuyNeural" | "en-US-AriaNeural" | "en-US-DavisNeural" | "en-US-JaneNeural" | "en-US-JasonNeural" | "en-US-KaiNeural" | "en-US-LunaNeural" | "en-US-SaraNeural" | "en-US-TonyNeural" | "en-US-NancyNeural" | "en-US-CoraMultilingualNeural" | "en-US-ChristopherMultilingualNeural" | "en-US-BrandonMultilingualNeural" | "en-US-AmberNeural" | "en-US-AnaNeural" | "en-US-AshleyNeural" | "en-US-BrandonNeural" | "en-US-ChristopherNeural" | "en-US-CoraNeural" | "en-US-ElizabethNeural" | "en-US-EricNeural" | "en-US-JacobNeural" | "en-US-JennyMultilingualNeural" | "en-US-MichelleNeural" | "en-US-MonicaNeural" | "en-US-RogerNeural" | "en-US-RyanMultilingualNeural" | "en-US-SteffanNeural" | "en-US-AdamMultilingualNeural" | "en-US-AIGenerate1Neural" | "en-US-AIGenerate2Neural" | "en-US-AlloyTurboMultilingualNeural" | "en-US-AmandaMultilingualNeural" | "en-US-BlueNeural" | "en-US-DavisMultilingualNeural" | "en-US-DerekMultilingualNeural" | "en-US-DustinMultilingualNeural" | "en-US-EchoTurboMultilingualNeural" | "en-US-EvelynMultilingualNeural" | "en-US-FableTurboMultilingualNeural" | "en-US-LewisMultilingualNeural" | "en-US-LolaMultilingualNeural" | "en-US-NancyMultilingualNeural" | "en-US-NovaTurboMultilingualNeural" | "en-US-OnyxTurboMultilingualNeural" | "en-US-PhoebeMultilingualNeural" | "en-US-SamuelMultilingualNeural" | "en-US-SerenaMultilingualNeural" | "en-US-ShimmerTurboMultilingualNeural" | "en-US-SteffanMultilingualNeural" | "en-US-Andrew:DragonHDLatestNeural" | "en-US-Andrew2:DragonHDLatestNeural" | "en-US-Aria:DragonHDLatestNeural" | "en-US-Ava:DragonHDLatestNeural" | "en-US-Brian:DragonHDLatestNeural" | "en-US-Davis:DragonHDLatestNeural" | "en-US-Emma:DragonHDLatestNeural" | "en-US-Emma2:DragonHDLatestNeural" | "en-US-Jenny:DragonHDLatestNeural" | "en-US-Steffan:DragonHDLatestNeural" | "en-ZA-LeahNeural" | "en-ZA-LukeNeural";
        language: string | undefined;
        region: string | undefined;
    }[]>;
    /**
     * Converts text to speech using Azure's Text-to-Speech service.
     *
     * @param {string | NodeJS.ReadableStream} input - Text to convert to speech
     * @param {Object} [options] - Optional parameters
     * @param {string} [options.speaker] - Voice ID to use for synthesis
     * @returns {Promise<NodeJS.ReadableStream>} Stream containing the synthesized audio
     * @throws {Error} If speech model is not configured or synthesis fails
     */
    speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: string;
        [key: string]: any;
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
     * Transcribes audio (STT) from a Node.js stream using Azure.
     *
     * @param {NodeJS.ReadableStream} audioStream - The audio to be transcribed, must be in .wav format.
     * @returns {Promise<string>} - The recognized text.
     */
    listen(audioStream: NodeJS.ReadableStream): Promise<string>;
}

declare interface AzureVoiceConfig {
    apiKey?: string;
    region?: string;
    voiceName?: string;
    language?: string;
}

export declare type VoiceId = (typeof AZURE_VOICES)[number];

export { }
