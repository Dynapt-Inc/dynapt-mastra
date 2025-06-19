import { MastraBundler, IBundler } from '../bundler/index.js';
import '../base-DCIyondy.js';
import '../logger-DtVDdb81.js';
import '../error/index.js';
import 'stream';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';

interface IDeployer extends IBundler {
    deploy(outputDirectory: string): Promise<void>;
}
declare abstract class MastraDeployer extends MastraBundler implements IDeployer {
    constructor({ name }: {
        name: string;
    });
    abstract deploy(outputDirectory: string): Promise<void>;
}

export { type IDeployer, MastraDeployer };
