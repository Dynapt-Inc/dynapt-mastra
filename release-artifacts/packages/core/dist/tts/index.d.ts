import { M as MastraBase } from '../base-DCIyondy.js';
import '../logger-DtVDdb81.js';
import '../error/index.js';
import 'stream';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';

interface BuiltInModelConfig {
    provider: string;
    name: string;
    apiKey?: string;
}
interface TTSConfig {
    model: BuiltInModelConfig;
}
declare abstract class MastraTTS extends MastraBase {
    model: BuiltInModelConfig;
    constructor({ model }: TTSConfig);
    traced<T extends Function>(method: T, methodName: string): T;
    abstract generate({ text }: {
        text: string;
    }): Promise<any>;
    abstract stream({ text }: {
        text: string;
    }): Promise<any>;
}

export { MastraTTS, type TTSConfig };
