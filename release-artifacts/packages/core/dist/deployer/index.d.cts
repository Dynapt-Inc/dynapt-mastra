import { MastraBundler, IBundler } from '../bundler/index.cjs';
import '../base-CZ7cNkfE.cjs';
import '../logger-CpL0z5v_.cjs';
import '../error/index.cjs';
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
