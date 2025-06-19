import type { ExportResult } from '@opentelemetry/core';
import type { IMastraLogger } from '@mastra/core/logger';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import type { SpanExporter } from '@opentelemetry/sdk-trace-base';

/**
 * Performs a fetch request with automatic retries using exponential backoff
 * @param url The URL to fetch from
 * @param options Standard fetch options
 * @param maxRetries Maximum number of retry attempts
 * @param validateResponse Optional function to validate the response beyond HTTP status
 * @returns The fetch Response if successful
 */
export declare function fetchWithRetry(url: string, options?: RequestInit, maxRetries?: number): Promise<Response>;

declare class MastraCloudExporter implements SpanExporter {
    private queue;
    private serializer;
    private activeFlush;
    private accessToken;
    private endpoint;
    private logger?;
    constructor({ accessToken, endpoint, logger }?: MastraCloudExporterOptions);
    export(internalRepresentation: ReadableSpan[], resultCallback: (result: ExportResult) => void): void;
    shutdown(): Promise<void>;
    private batchInsert;
    flush(): Promise<void>;
    forceFlush(): Promise<void>;
    __setLogger(logger: IMastraLogger): void;
}
export { MastraCloudExporter }
export { MastraCloudExporter as MastraCloudExporter_alias_1 }

declare type MastraCloudExporterOptions = {
    accessToken?: string;
    endpoint?: string;
    logger?: IMastraLogger;
};
export { MastraCloudExporterOptions }
export { MastraCloudExporterOptions as MastraCloudExporterOptions_alias_1 }

export { }
