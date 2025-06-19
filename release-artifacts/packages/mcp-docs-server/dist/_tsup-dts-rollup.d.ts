import { MCPClient } from '@mastra/mcp';
import { MCPServer } from '@mastra/mcp';
import { ServerType } from '@hono/node-server/.';
import { z } from 'zod';

export declare type BlogInput = z.infer<typeof blogInputSchema>;

export declare const blogInputSchema: z.ZodObject<{
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
}, {
    url: string;
}>;

export declare const blogTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>;
    execute: (args: BlogInput) => Promise<string>;
};

export declare function callTool(tool: any, args: any): Promise<string>;

export declare type ChangesInput = z.infer<typeof changesInputSchema>;

export declare const changesInputSchema: z.ZodObject<{
    package: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    package?: string | undefined;
}, {
    package?: string | undefined;
}>;

export declare const changesTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        package: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        package?: string | undefined;
    }, {
        package?: string | undefined;
    }>;
    execute: (args: ChangesInput) => Promise<string>;
};

export declare const clearMastraCourseHistory: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        confirm: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        confirm?: boolean | undefined;
    }, {
        confirm?: boolean | undefined;
    }>;
    execute: (args: z.infer<typeof _confirmationSchema>) => Promise<string>;
};

declare const _confirmationSchema: z.ZodObject<{
    confirm: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    confirm?: boolean | undefined;
}, {
    confirm?: boolean | undefined;
}>;

export declare function copyRaw(): Promise<void>;

declare const _courseLessonSchema: z.ZodObject<{
    lessonName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    lessonName: string;
}, {
    lessonName: string;
}>;

declare type CourseState = {
    currentLesson: string;
    lessons: Array<{
        name: string;
        status: number;
        steps: Array<{
            name: string;
            status: number;
        }>;
    }>;
};

export declare function createLogger(server?: MCPServer): Logger;

export declare type DocsInput = z.infer<typeof docsInputSchema>;

export declare const docsInputSchema: z.ZodObject<{
    paths: z.ZodArray<z.ZodString, "many">;
    queryKeywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    paths: string[];
    queryKeywords?: string[] | undefined;
}, {
    paths: string[];
    queryKeywords?: string[] | undefined;
}>;

export declare const docsTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        paths: z.ZodArray<z.ZodString, "many">;
        queryKeywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        paths: string[];
        queryKeywords?: string[] | undefined;
    }, {
        paths: string[];
        queryKeywords?: string[] | undefined;
    }>;
    execute: (args: DocsInput) => Promise<string>;
};

export declare type ExamplesInput = z.infer<typeof examplesInputSchema>;

export declare const examplesInputSchema: z.ZodObject<{
    example: z.ZodOptional<z.ZodString>;
    queryKeywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    queryKeywords?: string[] | undefined;
    example?: string | undefined;
}, {
    queryKeywords?: string[] | undefined;
    example?: string | undefined;
}>;

export declare const examplesTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        example: z.ZodOptional<z.ZodString>;
        queryKeywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        queryKeywords?: string[] | undefined;
        example?: string | undefined;
    }, {
        queryKeywords?: string[] | undefined;
        example?: string | undefined;
    }>;
    execute: (args: ExamplesInput) => Promise<string>;
};

export declare function fromPackageRoot(relative: string): string;

export declare function fromRepoRoot(relative: string): string;

export declare const getMastraCourseStatus: {
    name: string;
    description: string;
    parameters: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    execute: (_args: Record<string, never>) => Promise<string>;
};

export declare function getMatchingPaths(path: string, queryKeywords: string[], baseDir: string): Promise<string>;

export declare const log: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};

export declare interface Logger {
    info: (message: string, data?: any) => Promise<void>;
    warning: (message: string, data?: any) => Promise<void>;
    error: (message: string, error?: any) => Promise<void>;
    debug: (message: string, data?: any) => Promise<void>;
}

export declare const logger: Logger;

export declare const mcp: MCPClient;

export declare const nextMastraCourseStep: {
    name: string;
    description: string;
    parameters: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    execute: (_args: Record<string, never>) => Promise<string>;
};

export declare function prepare(): Promise<void>;

/**
 * Scans example directories and creates flattened code example files
 */
export declare function prepareCodeExamples(): Promise<void>;

/**
 * Scans package directories and creates organized changelog files
 */
export declare function preparePackageChanges(): Promise<void>;

export declare function registerUserLocally(email: string): Promise<{
    success: boolean;
    id: string;
    key: string;
    message: string;
}>;

export declare function runServer(): Promise<void>;

export declare let server: MCPServer;

export declare const server_alias_1: ServerType;

export declare const startMastraCourse: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
    }, {
        email?: string | undefined;
    }>;
    execute: (args: {
        email?: string;
    }) => Promise<string>;
};

export declare const startMastraCourseLesson: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        lessonName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        lessonName: string;
    }, {
        lessonName: string;
    }>;
    execute: (args: z.infer<typeof _courseLessonSchema>) => Promise<string>;
};

export declare function updateCourseStateOnServerLocally(deviceId: string, state: CourseState): Promise<void>;

export declare const writeErrorLog: (message: string, data?: any) => void;

export { }
