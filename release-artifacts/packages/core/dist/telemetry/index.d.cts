export { O as OtelConfig, S as SamplingStrategy, a as Telemetry, T as Trace } from '../base-CZ7cNkfE.cjs';
import { SpanKind, Context } from '@opentelemetry/api';
import { ExportResult } from '@opentelemetry/core';
import { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { I as IMastraLogger } from '../logger-CpL0z5v_.cjs';
import { o as MastraStorage } from '../base-CEuVqEGP.cjs';
import '../error/index.cjs';
import 'stream';
import 'ai';
import 'zod';
import 'json-schema';
import '../tts/index.cjs';
import '../vector/index.cjs';
import '../vector/filter/index.cjs';
import '../types-Bo1uigWx.cjs';
import 'sift';
import '../runtime-context/index.cjs';
import 'xstate';
import 'node:events';
import 'node:http';
import 'hono';
import 'events';
import '../workflows/constants.cjs';
import 'ai/test';
import '../deployer/index.cjs';
import '../bundler/index.cjs';
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
