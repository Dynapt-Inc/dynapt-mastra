import { MastraVoice } from '@mastra/core/voice';

/**
 * List of available voices for Murf TTS
 */
export declare const MURF_VOICES: readonly ["en-UK-hazel", "en-US-cooper", "en-US-imani", "it-IT-giorgio", "en-US-wayne", "en-IN-shivani", "en-US-daniel", "bn-IN-anwesha", "es-MX-alejandro", "en-AU-joyce", "en-US-zion", "en-IN-isha", "en-US-riley", "ko-KR-hwan", "fr-FR-adélie", "en-US-carter", "en-UK-gabriel", "en-UK-juliet", "en-IN-arohi", "fr-FR-maxime", "de-DE-josephine", "en-UK-hugo", "en-US-samantha", "de-DE-erna", "zh-CN-baolin", "pt-BR-isadora", "it-IT-vincenzo", "en-US-terrell", "en-US-denzel", "en-UK-heidi", "en-US-miles", "en-US-abigail", "fr-FR-justine", "it-IT-greta", "en-AU-shane", "en-UK-peter", "nl-NL-famke", "en-AU-ivy", "nl-NL-dirk", "fr-FR-axel", "es-ES-carla", "en-US-claire", "ko-KR-jangmi", "ko-KR-sanghoon", "it-IT-vera", "hi-IN-rahul", "es-ES-elvira", "es-ES-enrique", "en-UK-aiden", "en-US-ronnie", "en-UK-amber", "hi-IN-shweta", "hi-IN-amit", "en-AU-jimm", "en-UK-pearl", "pt-BR-benício", "en-UK-freddie", "en-US-ryan", "pt-BR-eloa", "en-US-charlotte", "de-DE-lia", "en-US-natalie", "en-US-michelle", "en-US-phoebe", "es-ES-carmen", "en-US-caleb", "en-US-iris", "en-UK-harrison", "en-US-marcus", "en-US-josie", "en-US-daisy", "en-US-charles", "en-UK-reggie", "en-US-julia", "en-SCOTT-emily", "en-US-dylan", "es-MX-valeria", "en-IN-eashwar", "en-AU-evelyn", "de-DE-lara", "en-US-evander", "en-SCOTT-rory", "ta-IN-iniya", "en-AU-leyton", "fr-FR-louise", "zh-CN-wei", "ko-KR-gyeong", "de-DE-matthias", "en-IN-rohan", "en-US-delilah", "bn-IN-abhik", "en-US-angela", "en-US-naomi", "es-MX-carlos", "nl-NL-merel", "en-US-alicia", "en-IN-alia", "zh-CN-jiao", "en-US-june", "en-AU-ashton", "en-UK-finley", "pl-PL-blazej", "zh-CN-zhang", "en-AU-kylie", "en-US-jayden", "en-IN-aarav", "de-DE-björn", "bn-IN-ishani", "zh-CN-yuxan", "fr-FR-louis", "ko-KR-jong-su", "en-AU-harper", "en-UK-ruby", "en-US-ken", "ta-IN-mani", "de-DE-ralf", "en-UK-jaxon", "en-US-river", "en-IN-priya", "en-UK-theo", "en-UK-katie", "pl-PL-jacek", "it-IT-lorenzo", "hi-IN-shaan", "en-US-amara", "en-UK-mason", "en-IN-surya", "en-US-finn", "pt-BR-gustavo", "hi-IN-kabir", "es-ES-javier", "en-AU-mitch", "pt-BR-heitor", "en-US-edmund", "hi-IN-ayushi", "pl-PL-kasia", "es-MX-luisa", "zh-CN-tao", "en-US-molly"];

export declare type MurfConfig = {
    name: 'GEN1' | 'GEN2';
    apiKey?: string;
    properties?: Omit<SpeechCreateParams, 'modelVersion' | 'voiceId' | 'text'>;
};

export declare class MurfVoice extends MastraVoice {
    private client;
    private defaultVoice;
    private properties;
    constructor({ speechModel, speaker }?: {
        speechModel?: MurfConfig;
        speaker?: string;
    });
    private streamToString;
    speak(input: string | NodeJS.ReadableStream, options?: {
        speaker?: string;
        properties?: Omit<SpeechCreateParams, 'modelVersion' | 'voiceId' | 'text'>;
    }): Promise<NodeJS.ReadableStream>;
    /**
     * Checks if listening capabilities are enabled.
     *
     * @returns {Promise<{ enabled: boolean }>}
     */
    getListener(): Promise<{
        enabled: boolean;
    }>;
    listen(_input: NodeJS.ReadableStream, _options?: Record<string, unknown>): Promise<string | NodeJS.ReadableStream>;
    getSpeakers(): Promise<{
        voiceId: "en-UK-hazel" | "en-US-cooper" | "en-US-imani" | "it-IT-giorgio" | "en-US-wayne" | "en-IN-shivani" | "en-US-daniel" | "bn-IN-anwesha" | "es-MX-alejandro" | "en-AU-joyce" | "en-US-zion" | "en-IN-isha" | "en-US-riley" | "ko-KR-hwan" | "fr-FR-adélie" | "en-US-carter" | "en-UK-gabriel" | "en-UK-juliet" | "en-IN-arohi" | "fr-FR-maxime" | "de-DE-josephine" | "en-UK-hugo" | "en-US-samantha" | "de-DE-erna" | "zh-CN-baolin" | "pt-BR-isadora" | "it-IT-vincenzo" | "en-US-terrell" | "en-US-denzel" | "en-UK-heidi" | "en-US-miles" | "en-US-abigail" | "fr-FR-justine" | "it-IT-greta" | "en-AU-shane" | "en-UK-peter" | "nl-NL-famke" | "en-AU-ivy" | "nl-NL-dirk" | "fr-FR-axel" | "es-ES-carla" | "en-US-claire" | "ko-KR-jangmi" | "ko-KR-sanghoon" | "it-IT-vera" | "hi-IN-rahul" | "es-ES-elvira" | "es-ES-enrique" | "en-UK-aiden" | "en-US-ronnie" | "en-UK-amber" | "hi-IN-shweta" | "hi-IN-amit" | "en-AU-jimm" | "en-UK-pearl" | "pt-BR-benício" | "en-UK-freddie" | "en-US-ryan" | "pt-BR-eloa" | "en-US-charlotte" | "de-DE-lia" | "en-US-natalie" | "en-US-michelle" | "en-US-phoebe" | "es-ES-carmen" | "en-US-caleb" | "en-US-iris" | "en-UK-harrison" | "en-US-marcus" | "en-US-josie" | "en-US-daisy" | "en-US-charles" | "en-UK-reggie" | "en-US-julia" | "en-SCOTT-emily" | "en-US-dylan" | "es-MX-valeria" | "en-IN-eashwar" | "en-AU-evelyn" | "de-DE-lara" | "en-US-evander" | "en-SCOTT-rory" | "ta-IN-iniya" | "en-AU-leyton" | "fr-FR-louise" | "zh-CN-wei" | "ko-KR-gyeong" | "de-DE-matthias" | "en-IN-rohan" | "en-US-delilah" | "bn-IN-abhik" | "en-US-angela" | "en-US-naomi" | "es-MX-carlos" | "nl-NL-merel" | "en-US-alicia" | "en-IN-alia" | "zh-CN-jiao" | "en-US-june" | "en-AU-ashton" | "en-UK-finley" | "pl-PL-blazej" | "zh-CN-zhang" | "en-AU-kylie" | "en-US-jayden" | "en-IN-aarav" | "de-DE-björn" | "bn-IN-ishani" | "zh-CN-yuxan" | "fr-FR-louis" | "ko-KR-jong-su" | "en-AU-harper" | "en-UK-ruby" | "en-US-ken" | "ta-IN-mani" | "de-DE-ralf" | "en-UK-jaxon" | "en-US-river" | "en-IN-priya" | "en-UK-theo" | "en-UK-katie" | "pl-PL-jacek" | "it-IT-lorenzo" | "hi-IN-shaan" | "en-US-amara" | "en-UK-mason" | "en-IN-surya" | "en-US-finn" | "pt-BR-gustavo" | "hi-IN-kabir" | "es-ES-javier" | "en-AU-mitch" | "pt-BR-heitor" | "en-US-edmund" | "hi-IN-ayushi" | "pl-PL-kasia" | "es-MX-luisa" | "zh-CN-tao" | "en-US-molly";
        name: "en-UK-hazel" | "en-US-cooper" | "en-US-imani" | "it-IT-giorgio" | "en-US-wayne" | "en-IN-shivani" | "en-US-daniel" | "bn-IN-anwesha" | "es-MX-alejandro" | "en-AU-joyce" | "en-US-zion" | "en-IN-isha" | "en-US-riley" | "ko-KR-hwan" | "fr-FR-adélie" | "en-US-carter" | "en-UK-gabriel" | "en-UK-juliet" | "en-IN-arohi" | "fr-FR-maxime" | "de-DE-josephine" | "en-UK-hugo" | "en-US-samantha" | "de-DE-erna" | "zh-CN-baolin" | "pt-BR-isadora" | "it-IT-vincenzo" | "en-US-terrell" | "en-US-denzel" | "en-UK-heidi" | "en-US-miles" | "en-US-abigail" | "fr-FR-justine" | "it-IT-greta" | "en-AU-shane" | "en-UK-peter" | "nl-NL-famke" | "en-AU-ivy" | "nl-NL-dirk" | "fr-FR-axel" | "es-ES-carla" | "en-US-claire" | "ko-KR-jangmi" | "ko-KR-sanghoon" | "it-IT-vera" | "hi-IN-rahul" | "es-ES-elvira" | "es-ES-enrique" | "en-UK-aiden" | "en-US-ronnie" | "en-UK-amber" | "hi-IN-shweta" | "hi-IN-amit" | "en-AU-jimm" | "en-UK-pearl" | "pt-BR-benício" | "en-UK-freddie" | "en-US-ryan" | "pt-BR-eloa" | "en-US-charlotte" | "de-DE-lia" | "en-US-natalie" | "en-US-michelle" | "en-US-phoebe" | "es-ES-carmen" | "en-US-caleb" | "en-US-iris" | "en-UK-harrison" | "en-US-marcus" | "en-US-josie" | "en-US-daisy" | "en-US-charles" | "en-UK-reggie" | "en-US-julia" | "en-SCOTT-emily" | "en-US-dylan" | "es-MX-valeria" | "en-IN-eashwar" | "en-AU-evelyn" | "de-DE-lara" | "en-US-evander" | "en-SCOTT-rory" | "ta-IN-iniya" | "en-AU-leyton" | "fr-FR-louise" | "zh-CN-wei" | "ko-KR-gyeong" | "de-DE-matthias" | "en-IN-rohan" | "en-US-delilah" | "bn-IN-abhik" | "en-US-angela" | "en-US-naomi" | "es-MX-carlos" | "nl-NL-merel" | "en-US-alicia" | "en-IN-alia" | "zh-CN-jiao" | "en-US-june" | "en-AU-ashton" | "en-UK-finley" | "pl-PL-blazej" | "zh-CN-zhang" | "en-AU-kylie" | "en-US-jayden" | "en-IN-aarav" | "de-DE-björn" | "bn-IN-ishani" | "zh-CN-yuxan" | "fr-FR-louis" | "ko-KR-jong-su" | "en-AU-harper" | "en-UK-ruby" | "en-US-ken" | "ta-IN-mani" | "de-DE-ralf" | "en-UK-jaxon" | "en-US-river" | "en-IN-priya" | "en-UK-theo" | "en-UK-katie" | "pl-PL-jacek" | "it-IT-lorenzo" | "hi-IN-shaan" | "en-US-amara" | "en-UK-mason" | "en-IN-surya" | "en-US-finn" | "pt-BR-gustavo" | "hi-IN-kabir" | "es-ES-javier" | "en-AU-mitch" | "pt-BR-heitor" | "en-US-edmund" | "hi-IN-ayushi" | "pl-PL-kasia" | "es-MX-luisa" | "zh-CN-tao" | "en-US-molly";
        language: string | undefined;
        gender: string;
    }[]>;
}

declare type MurfVoiceId = (typeof MURF_VOICES)[number];
export { MurfVoiceId }
export { MurfVoiceId as MurfVoiceId_alias_1 }

declare type SpeechCreateParams = {
    voiceId: MurfVoiceId;
    text: string;
    modelVersion: 'GEN1' | 'GEN2';
    style?: string;
    rate?: number;
    pitch?: number;
    sampleRate?: 8000 | 24000 | 44100 | 48000;
    format?: 'MP3' | 'WAV' | 'FLAC' | 'ALAW' | 'ULAW';
    channelType?: 'STEREO' | 'MONO';
    pronunciationDictionary?: Record<string, string>;
    encodeAsBase64?: boolean;
    variation?: number;
    audioDuration?: number;
    multiNativeLocale?: string;
};

export { }
