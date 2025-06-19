import { Deployer } from '@mastra/deployer';

export declare class NetlifyDeployer extends Deployer {
    protected scope: string;
    protected projectName: string;
    protected token: string;
    constructor({ scope, projectName, token }: {
        scope: string;
        projectName: string;
        token: string;
    });
    writeFiles({ dir }: {
        dir: string;
    }): void;
    protected installDependencies(outputDirectory: string, rootDir?: string): Promise<void>;
    deploy(): Promise<void>;
    prepare(outputDirectory: string): Promise<void>;
    bundle(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
    private getEntry;
    lint(entryFile: string, outputDirectory: string, toolsPaths: string[]): Promise<void>;
}

export { }
