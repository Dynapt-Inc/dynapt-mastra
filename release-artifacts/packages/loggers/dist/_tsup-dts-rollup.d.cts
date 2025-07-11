import type { BaseLogMessage } from '@mastra/core/logger';
import { LoggerTransport } from '@mastra/core/logger';
import { LogLevel } from '@mastra/core/logger';
import { MastraLogger } from '@mastra/core/logger';
import pino from 'pino';
import type { WriteStream } from 'fs';

export declare class FileTransport extends LoggerTransport {
    path: string;
    fileStream: WriteStream;
    constructor({ path }: {
        path: string;
    });
    _transform(chunk: any, _encoding: string, callback: (error: Error | null, chunk: any) => void): void;
    _flush(callback: Function): void;
    _write(chunk: any, encoding?: string, callback?: (error?: Error | null) => void): boolean;
    _destroy(error: Error, callback: Function): void;
    getLogs(params?: {
        fromDate?: Date;
        toDate?: Date;
        logLevel?: LogLevel;
        filters?: Record<string, any>;
        returnPaginationResults?: boolean;
        page?: number;
        perPage?: number;
    }): Promise<{
        logs: BaseLogMessage[];
        total: number;
        page: number;
        perPage: number;
        hasMore: boolean;
    }>;
    getLogsByRunId({ runId, fromDate, toDate, logLevel, filters, page: pageInput, perPage: perPageInput, }: {
        runId: string;
        fromDate?: Date;
        toDate?: Date;
        logLevel?: LogLevel;
        filters?: Record<string, any>;
        page?: number;
        perPage?: number;
    }): Promise<{
        logs: BaseLogMessage[];
        total: number;
        page: number;
        perPage: number;
        hasMore: boolean;
    }>;
}

export { LogLevel }
export { LogLevel as LogLevel_alias_1 }

declare class PinoLogger extends MastraLogger {
    protected logger: pino.Logger;
    constructor(options?: {
        name?: string;
        level?: LogLevel;
        transports?: TransportMap;
        overrideDefaultTransports?: boolean;
    });
    debug(message: string, args?: Record<string, any>): void;
    info(message: string, args?: Record<string, any>): void;
    warn(message: string, args?: Record<string, any>): void;
    error(message: string, args?: Record<string, any>): void;
}
export { PinoLogger }
export { PinoLogger as PinoLogger_alias_1 }

declare type TransportMap = Record<string, LoggerTransport>;

export declare class UpstashTransport extends LoggerTransport {
    upstashUrl: string;
    upstashToken: string;
    listName: string;
    maxListLength: number;
    batchSize: number;
    flushInterval: number;
    logBuffer: any[];
    lastFlush: number;
    flushIntervalId: NodeJS.Timeout;
    constructor(opts: {
        listName?: string;
        maxListLength?: number;
        batchSize?: number;
        upstashUrl: string;
        flushInterval?: number;
        upstashToken: string;
    });
    private executeUpstashCommand;
    _flush(): Promise<void>;
    _write(chunk: any, encoding?: string, callback?: (error?: Error | null) => void): boolean;
    _transform(chunk: string, _enc: string, cb: Function): void;
    _destroy(err: Error, cb: Function): void;
    getLogs(params?: {
        fromDate?: Date;
        toDate?: Date;
        logLevel?: LogLevel;
        filters?: Record<string, any>;
        returnPaginationResults?: boolean;
        page?: number;
        perPage?: number;
    }): Promise<{
        logs: BaseLogMessage[];
        total: number;
        page: number;
        perPage: number;
        hasMore: boolean;
    }>;
    getLogsByRunId({ runId, fromDate, toDate, logLevel, filters, page: pageInput, perPage: perPageInput, }: {
        runId: string;
        fromDate?: Date;
        toDate?: Date;
        logLevel?: LogLevel;
        filters?: Record<string, any>;
        page?: number;
        perPage?: number;
    }): Promise<{
        logs: BaseLogMessage[];
        total: number;
        page: number;
        perPage: number;
        hasMore: boolean;
    }>;
}

export { }
