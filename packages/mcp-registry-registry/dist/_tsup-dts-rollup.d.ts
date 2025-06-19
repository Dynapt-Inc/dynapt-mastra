import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';

export declare function createServerEntry(data: Record<string, unknown>): ServerEntry;

/**
 * Fetches servers from a registry's servers_url endpoint
 */
declare function fetchServersFromRegistry(registryId: string): Promise<ServerEntry[]>;
export { fetchServersFromRegistry }
export { fetchServersFromRegistry as fetchServersFromRegistry_alias_1 }

/**
 * Filters registry entries based on provided criteria
 */
declare function filterRegistries(registries: RegistryEntry[], filters: {
    id?: string;
    tag?: string;
    name?: string;
}): RegistryEntry[];
export { filterRegistries }
export { filterRegistries as filterRegistries_alias_1 }

/**
 * Filters server entries based on provided criteria
 */
declare function filterServers(servers: ServerEntry[], filters: {
    tag?: string;
    search?: string;
}): ServerEntry[];
export { filterServers }
export { filterServers as filterServers_alias_1 }

/**
 * Formats registry entries for API response
 */
declare function formatRegistryResponse(registries: RegistryEntry[], detailed?: boolean): any;
export { formatRegistryResponse }
export { formatRegistryResponse as formatRegistryResponse_alias_1 }

export declare function fromPackageRoot(relativePath: string): string;

/**
 * Main function to get registry listings with optional filtering
 */
declare function getRegistryListings(filters?: {
    id?: string;
    tag?: string;
    name?: string;
}, options?: {
    detailed?: boolean;
}): Promise<any>;
export { getRegistryListings }
export { getRegistryListings as getRegistryListings_alias_1 }

/**
 * Main function to get servers from a registry with optional filtering
 */
declare function getServersFromRegistry(registryId: string, filters?: {
    tag?: string;
    search?: string;
}): Promise<any>;
export { getServersFromRegistry }
export { getServersFromRegistry as getServersFromRegistry_alias_1 }

export declare const listInputSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    detailed: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    detailed: boolean;
    id?: string | undefined;
    name?: string | undefined;
    tag?: string | undefined;
}, {
    id?: string | undefined;
    name?: string | undefined;
    tag?: string | undefined;
    detailed?: boolean | undefined;
}>;

export declare const listTool: {
    name: string;
    description: string;
    execute(input: ListToolInput): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
};

export declare type ListToolInput = z.infer<typeof listInputSchema>;

/**
 * Returns the registry data from the registry.ts file
 */
declare function loadRegistryData(): Promise<RegistryFile>;
export { loadRegistryData }
export { loadRegistryData as loadRegistryData_alias_1 }

/**
 * Post-processor for Apify registry
 * Handles the specific format of Apify's store data
 */
export declare function processApifyServers(data: any): ServerEntry[];

/**
 * Post-processor for APITracker registry
 * Handles the specific format of APITracker's server data
 */
export declare function processApiTrackerServers(data: unknown): ServerEntry[];

/**
 * Default processor for registry server data
 * Handles common formats that might be encountered
 */
export declare function processDefaultServers(data: unknown): ServerEntry[];

/**
 * Post-processor for Docker MCP Hub registry
 * Transforms Docker Hub API response into standardized ServerEntry format
 */
export declare function processDockerServers(data: unknown): ServerEntry[];

/**
 * Post-processor for Fleur registry
 * Handles the specific format of Fleur's app data
 */
export declare function processFleurServers(data: unknown): ServerEntry[];

export declare function processMcpRunServers(data: any): ServerEntry[];

/**
 * Post-processor for Pulse MCP registry
 * Handles the specific format of Pulse MCP's server data
 */
export declare function processPulseMcpServers(data: any): ServerEntry[];

declare const registryData: RegistryFile;
export { registryData }
export { registryData as registryData_alias_1 }

export declare interface RegistryEntry {
    id: string;
    name: string;
    description: string;
    url: string;
    servers_url?: string;
    tags?: string[];
    count?: number | string;
    postProcessServers?: (data: unknown) => ServerEntry[];
}

export declare interface RegistryFile {
    registries: RegistryEntry[];
}

export declare function runServer(): Promise<void>;

export declare const server: Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>;

export declare type ServerEntry = z.infer<typeof ServerEntrySchema>;

export declare const ServerEntrySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}, {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}>;

export declare const serversInputSchema: z.ZodObject<{
    registryId: z.ZodString;
    tag: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    registryId: string;
    tag?: string | undefined;
    search?: string | undefined;
}, {
    registryId: string;
    tag?: string | undefined;
    search?: string | undefined;
}>;

export declare const serversTool: {
    name: string;
    description: string;
    execute(input: ServersToolInput): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
};

export declare type ServersToolInput = z.infer<typeof serversInputSchema>;

export { }
