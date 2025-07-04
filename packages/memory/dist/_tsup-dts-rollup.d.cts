import type { CoreMessage } from 'ai';
import type { CoreMessage as CoreMessage_2 } from '@mastra/core';
import type { CoreTool } from '@mastra/core';
import { MastraMemory } from '@mastra/core/memory';
import type { MastraMessageV1 } from '@mastra/core';
import type { MastraMessageV2 } from '@mastra/core/agent';
import type { MemoryConfig } from '@mastra/core/memory';
import { MemoryProcessor } from '@mastra/core/memory';
import { MemoryProcessor as MemoryProcessor_2 } from '@mastra/core';
import type { MemoryProcessorOpts } from '@mastra/core';
import type { SharedMemoryConfig } from '@mastra/core/memory';
import type { StorageGetMessagesArg } from '@mastra/core/storage';
import type { StorageThreadType } from '@mastra/core/memory';
import type { TiktokenBPE } from 'js-tiktoken/lite';
import type { UIMessage } from 'ai';
import type { WorkingMemoryFormat } from '@mastra/core/memory';
import type { WorkingMemoryTemplate } from '@mastra/core/memory';

/**
 * Concrete implementation of MastraMemory that adds support for thread configuration
 * and message injection.
 */
export declare class Memory extends MastraMemory {
    constructor(config?: SharedMemoryConfig);
    private validateThreadIsOwnedByResource;
    private checkStorageFeatureSupport;
    query({ threadId, resourceId, selectBy, threadConfig, }: StorageGetMessagesArg & {
        threadConfig?: MemoryConfig;
    }): Promise<{
        messages: CoreMessage[];
        uiMessages: UIMessage[];
        messagesV2: MastraMessageV2[];
    }>;
    rememberMessages({ threadId, resourceId, vectorMessageSearch, config, }: {
        threadId: string;
        resourceId?: string;
        vectorMessageSearch?: string;
        config?: MemoryConfig;
    }): Promise<{
        messages: MastraMessageV1[];
        messagesV2: MastraMessageV2[];
    }>;
    getThreadById({ threadId }: {
        threadId: string;
    }): Promise<StorageThreadType | null>;
    getThreadsByResourceId({ resourceId }: {
        resourceId: string;
    }): Promise<StorageThreadType[]>;
    saveThread({ thread, memoryConfig, }: {
        thread: StorageThreadType;
        memoryConfig?: MemoryConfig;
    }): Promise<StorageThreadType>;
    updateThread({ id, title, metadata, }: {
        id: string;
        title: string;
        metadata: Record<string, unknown>;
    }): Promise<StorageThreadType>;
    deleteThread(threadId: string): Promise<void>;
    private chunkText;
    private hasher;
    private embeddingCache;
    private firstEmbed;
    private embedMessageContent;
    saveMessages(args: {
        messages: (MastraMessageV1 | MastraMessageV2)[] | MastraMessageV1[] | MastraMessageV2[];
        memoryConfig?: MemoryConfig | undefined;
        format?: 'v1';
    }): Promise<MastraMessageV1[]>;
    saveMessages(args: {
        messages: (MastraMessageV1 | MastraMessageV2)[] | MastraMessageV1[] | MastraMessageV2[];
        memoryConfig?: MemoryConfig | undefined;
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    protected updateMessageToHideWorkingMemory(message: MastraMessageV1): MastraMessageV1 | null;
    protected updateMessageToHideWorkingMemoryV2(message: MastraMessageV2): MastraMessageV2 | null;
    protected parseWorkingMemory(text: string): string | null;
    getWorkingMemory({ threadId, format, }: {
        threadId: string;
        format?: WorkingMemoryFormat;
    }): Promise<string | null>;
    getWorkingMemoryTemplate(): Promise<WorkingMemoryTemplate | null>;
    getSystemMessage({ threadId, memoryConfig, }: {
        threadId: string;
        memoryConfig?: MemoryConfig;
    }): Promise<string | null>;
    getUserContextMessage({ threadId }: {
        threadId: string;
    }): Promise<string | null>;
    defaultWorkingMemoryTemplate: string;
    private getWorkingMemoryToolInstruction;
    getTools(config?: MemoryConfig): Record<string, CoreTool>;
    /**
     * Updates the metadata of a list of messages
     * @param messages - The list of messages to update
     * @returns The list of updated messages
     */
    updateMessages({ messages, }: {
        messages: Partial<MastraMessageV2> & {
            id: string;
        }[];
    }): Promise<MastraMessageV2[]>;
}

/**
 * Limits the total number of tokens in the messages.
 * Uses js-tiktoken with o200k_base encoding by default for accurate token counting with modern models.
 */
declare class TokenLimiter extends MemoryProcessor {
    private encoder;
    private maxTokens;
    TOKENS_PER_MESSAGE: number;
    TOKENS_PER_CONVERSATION: number;
    /**
     * Create a token limiter for messages.
     * @param options Either a number (token limit) or a configuration object
     */
    constructor(options: number | TokenLimiterOptions);
    process(messages: CoreMessage_2[], { systemMessage, memorySystemMessage, newMessages }?: MemoryProcessorOpts): CoreMessage_2[];
    countTokens(message: string | CoreMessage_2): number;
}
export { TokenLimiter }
export { TokenLimiter as TokenLimiter_alias_1 }

/**
 * Configuration options for TokenLimiter
 */
declare interface TokenLimiterOptions {
    /** Maximum number of tokens to allow */
    limit: number;
    /** Optional encoding to use (defaults to o200k_base which is used by gpt-4o) */
    encoding?: TiktokenBPE;
}

/**
 * Filters out tool calls and results from messages.
 * By default (with no arguments), excludes all tool calls and their results.
 * Can be configured to exclude only specific tools by name.
 */
declare class ToolCallFilter extends MemoryProcessor_2 {
    private exclude;
    /**
     * Create a filter for tool calls and results.
     * @param options Configuration options
     * @param options.exclude List of specific tool names to exclude. If not provided, all tool calls are excluded.
     */
    constructor(options?: {
        exclude?: string[];
    });
    process(messages: CoreMessage_2[]): CoreMessage_2[];
}
export { ToolCallFilter }
export { ToolCallFilter as ToolCallFilter_alias_1 }

export declare const updateWorkingMemoryTool: ({ format }: {
    format: WorkingMemoryFormat;
}) => CoreTool;

export { }
