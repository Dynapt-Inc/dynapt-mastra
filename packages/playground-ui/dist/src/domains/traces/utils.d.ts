/**
 *
 * @param duration duration of the span
 * @param fixedPoint how many fixed point
 * @returns duration in milliseconds in fixed points
 */
export declare function formatDuration(duration: number, fixedPoint?: number): string;
export declare function formatOtelTimestamp(otelTimestamp: number): string;
export declare function formatOtelTimestamp2(otelTimestamp: number): string;
export declare function transformKey(key: string): string;
export declare function cleanString(string: string): string;
export declare const allowedAiSpanAttributes: string[];
