import { Deployer } from '@mastra/deployer';

export declare class VercelDeployer extends Deployer {
    constructor();
    prepare(outputDirectory: string): Promise<void>;
    private getEntry;
    private writeVercelJSON;
    bundle(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
    deploy(): Promise<void>;
    lint(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
}

export { }
