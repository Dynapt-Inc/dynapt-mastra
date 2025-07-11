import { M as MastraBase } from '../base-CZ7cNkfE.cjs';
import '../logger-CpL0z5v_.cjs';
import '../error/index.cjs';
import 'stream';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';

interface IBundler {
    loadEnvVars(): Promise<Map<string, string>>;
    getEnvFiles(): Promise<string[]>;
    bundle(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
    prepare(outputDirectory: string): Promise<void>;
    writePackageJson(outputDirectory: string, dependencies: Map<string, string>): Promise<void>;
    lint(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
}
declare abstract class MastraBundler extends MastraBase implements IBundler {
    constructor({ name, component }: {
        name: string;
        component?: 'BUNDLER' | 'DEPLOYER';
    });
    loadEnvVars(): Promise<Map<string, string>>;
    abstract prepare(outputDirectory: string): Promise<void>;
    abstract writePackageJson(outputDirectory: string, dependencies: Map<string, string>): Promise<void>;
    abstract writeInstrumentationFile(outputDirectory: string): Promise<void>;
    abstract getEnvFiles(): Promise<string[]>;
    abstract bundle(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
    abstract lint(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
}

export { type IBundler, MastraBundler };
