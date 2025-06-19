import { Integration } from '@mastra/core/integration';
import { MemoryOptions, Message, SearchOptions } from 'mem0ai';

interface Mem0ClientConfig {
    apiKey: string;
    host?: string;
    organizationName?: string;
    projectName?: string;
    organizationId?: string;
    projectId?: string;
}
type Mem0Config = Mem0ClientConfig & MemoryOptions & {
    [key: string]: any;
};

declare class Mem0AIClient {
    private client;
    private mem0Config;
    constructor(config: Mem0Config);
    createMemory(messages: Message[] | string, options?: MemoryOptions): Promise<string>;
    searchMemory(query: string, options?: SearchOptions): Promise<string>;
}

declare class Mem0Integration extends Integration<void, Mem0AIClient> {
    readonly name = "MEM0";
    readonly logoUrl = "";
    config: Mem0Config;
    client: Mem0AIClient;
    categories: string[];
    description: string;
    constructor({ config }: {
        config: Mem0Config;
    });
    createMemory(messages: Message[] | string, options?: MemoryOptions): Promise<string>;
    searchMemory(query: string, options?: SearchOptions): Promise<string>;
}

export { Mem0Integration };
