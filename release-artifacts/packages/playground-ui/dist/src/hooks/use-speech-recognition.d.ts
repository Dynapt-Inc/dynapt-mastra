export interface SpeechRecognitionState {
    isListening: boolean;
    transcript: string;
    error: string | null;
}
export interface UseSpeechRecognitionArgs {
    language?: string;
}
export declare const useSpeechRecognition: ({ language }?: UseSpeechRecognitionArgs) => {
    start: () => void;
    stop: () => void;
    isListening: boolean;
    transcript: string;
    error: string | null;
};
