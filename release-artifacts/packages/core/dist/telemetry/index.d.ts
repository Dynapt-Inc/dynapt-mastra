export { O as OtelConfig, S as SamplingStrategy, a as Telemetry, T as Trace } from '../base-DCIyondy.js';
import { SpanKind, Context } from '@opentelemetry/api';
import { ExportResult } from '@opentelemetry/core';
import { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { I as IMastraLogger } from '../logger-DtVDdb81.js';
import { o as MastraStorage } from '../base-CWUtFPZY.js';
import '../error/index.js';
import 'stream';
import 'ai';
import 'zod';
import 'json-schema';
import '../tts/index.js';
import '../vector/index.js';
import '../vector/filter/index.js';
import '../types-Bo1uigWx.js';
import 'sift';
import '../runtime-context/index.js';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import '../workflows/constants.js';
import 'ai/test';
import '../deployer/index.js';
import '../bundler/index.js';
import 'hono/cors';
import 'hono-openapi';

declare function withSpan(options: {
    spanName?: string;
    skipIfNoTelemetry?: boolean;
    spanKind?: SpanKind;
    tracerName?: string;
}): any;
declare function InstrumentClass(options?: {
    prefix?: string;
    spanKind?: SpanKind;
    excludeMethods?: string[];
    methodFilter?: (methodName: string) => boolean;
    tracerName?: string;
}): (target: any) => any;

declare function hasActiveTelemetry(tracerName?: string): boolean;
/**
 * Get baggage values from context
 * @param ctx The context to get baggage values from
 * @returns
 */
declare function getBaggageValues(ctx: Context): {
    requestId: string | undefined;
    componentName: string | undefined;
    runId: string | undefined;
};

declare class OTLPTraceExporter implements SpanExporter {
    private storage;
    private queue;
    private serializer;
    private logger;
    private activeFlush;
    constructor({ logger, storage }: {
        logger: IMastraLogger;
        storage: MastraStorage;
    });
    export(internalRepresentation: ReadableSpan[], resultCallback: (result: ExportResult) => void): void;
    shutdown(): Promise<void>;
    flush(): Promise<void>;
    forceFlush(): Promise<void>;
    __setLogger(logger: IMastraLogger): void;
}

export { InstrumentClass, OTLPTraceExporter as OTLPStorageExporter, getBaggageValues, hasActiveTelemetry, withSpan };
