import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import type { CreateIndexParams } from '@mastra/core/vector';
import type { DeleteIndexParams } from '@mastra/core/vector';
import type { DeleteVectorParams } from '@mastra/core/vector';
import type { DescribeIndexParams } from '@mastra/core/vector';
import type { EvalRow } from '@mastra/core/storage';
import type { IndexStats } from '@mastra/core/vector';
import type { ISSLConfig } from 'pg-promise/typescript/pg-subset';
import type { MastraMessageContentV2 } from '@mastra/core/agent';
import type { MastraMessageV1 } from '@mastra/core/memory';
import type { MastraMessageV2 } from '@mastra/core/agent';
import { MastraStorage } from '@mastra/core/storage';
import { MastraVector } from '@mastra/core/vector';
import type { OperatorSupport } from '@mastra/core/vector/filter';
import type { PaginationArgs } from '@mastra/core/storage';
import type { PaginationInfo } from '@mastra/core/storage';
import pg from 'pg';
import type { QueryResult } from '@mastra/core/vector';
import type { QueryVectorParams } from '@mastra/core/vector';
import type { StorageColumn } from '@mastra/core/storage';
import type { StorageGetMessagesArg } from '@mastra/core/storage';
import type { StorageThreadType } from '@mastra/core/memory';
import type { TABLE_NAMES } from '@mastra/core/storage';
import type { UpdateVectorParams } from '@mastra/core/vector';
import type { UpsertVectorParams } from '@mastra/core/vector';
import type { VectorFilter } from '@mastra/core/vector/filter';
import type { WorkflowRun } from '@mastra/core/storage';
import type { WorkflowRuns } from '@mastra/core/storage';
import type { WorkflowRunState } from '@mastra/core/workflows';

export declare const baseTestConfigs: {
    smokeTests: {
        dimension: number;
        size: number;
        k: number;
        queryCount: number;
    }[];
    '64': {
        dimension: number;
        size: number;
        k: number;
        queryCount: number;
    }[];
    '384': {
        dimension: number;
        size: number;
        k: number;
        queryCount: number;
    }[];
    '1024': {
        dimension: number;
        size: number;
        k: number;
        queryCount: number;
    }[];
    stressTests: {
        dimension: number;
        size: number;
        k: number;
        queryCount: number;
    }[];
};

export declare function buildFilterQuery(filter: VectorFilter, minScore: number, topK: number): FilterResult;

export declare const calculateRecall: (actual: number[], expected: number[], k: number) => number;

export declare const calculateTimeout: (dimension: number, size: number, k: number) => number;

export declare function cosineSimilarity(a: number[], b: number[]): number;

declare interface FilterResult {
    sql: string;
    values: any[];
}

export declare const findNearestBruteForce: (query: number[], vectors: number[][], k: number) => number[];

export declare const formatTable: (data: any[], columns: string[]) => string;

export declare const generateClusteredVectors: (count: number, dim: number, numClusters?: number) => number[][];

export declare const generateRandomVectors: (count: number, dim: number) => number[][];

export declare const generateSkewedVectors: (count: number, dim: number) => number[][];

export declare const getHNSWConfig: (indexConfig: IndexConfig) => {
    m: number;
    efConstruction: number;
};

export declare function getIndexDescription({ type, hnsw, }: {
    type: IndexType;
    hnsw: {
        m: number;
        efConstruction: number;
    };
}): string;

export declare const getListCount: (indexConfig: IndexConfig, size: number) => number | undefined;

export declare function getSearchEf(k: number, m: number): {
    default: number;
    lower: number;
    higher: number;
};

export declare const groupBy: <T, K extends keyof T>(array: T[], key: K | ((item: T) => string), reducer?: (group: T[]) => any) => Record<string, any>;

declare interface HNSWConfig {
    m?: number;
    efConstruction?: number;
}

export declare interface IndexConfig {
    type?: IndexType;
    ivf?: IVFConfig;
    hnsw?: HNSWConfig;
}

export declare type IndexType = 'ivfflat' | 'hnsw' | 'flat';

declare interface IVFConfig {
    lists?: number;
}

export declare function measureLatency<T>(fn: () => Promise<T>): Promise<[number, T]>;

declare interface PgCreateIndexParams extends CreateIndexParams {
    indexConfig?: IndexConfig;
    buildIndex?: boolean;
}

declare interface PgDefineIndexParams {
    indexName: string;
    metric: 'cosine' | 'euclidean' | 'dotproduct';
    indexConfig: IndexConfig;
}

/**
 * Translates MongoDB-style filters to PG compatible filters.
 *
 * Key differences from MongoDB:
 *
 * Logical Operators ($and, $or, $nor):
 * - Can be used at the top level or nested within fields
 * - Can take either a single condition or an array of conditions
 *
 */
export declare class PGFilterTranslator extends BaseFilterTranslator {
    protected getSupportedOperators(): OperatorSupport;
    translate(filter?: VectorFilter): VectorFilter;
    private translateNode;
    private translateRegexPattern;
}

declare interface PGIndexStats extends IndexStats {
    type: IndexType;
    config: {
        m?: number;
        efConstruction?: number;
        lists?: number;
        probes?: number;
    };
}
export { PGIndexStats }
export { PGIndexStats as PGIndexStats_alias_1 }

declare interface PgQueryVectorParams extends QueryVectorParams {
    minScore?: number;
    /**
     * HNSW search parameter. Controls the size of the dynamic candidate
     * list during search. Higher values improve accuracy at the cost of speed.
     */
    ef?: number;
    /**
     * IVFFlat probe parameter. Number of cells to visit during search.
     * Higher values improve accuracy at the cost of speed.
     */
    probes?: number;
}

declare class PgVector extends MastraVector {
    private pool;
    private describeIndexCache;
    private createdIndexes;
    private mutexesByName;
    private schema?;
    private setupSchemaPromise;
    private installVectorExtensionPromise;
    private vectorExtensionInstalled;
    private schemaSetupComplete;
    constructor({ connectionString, schemaName, pgPoolOptions, }: {
        connectionString: string;
        schemaName?: string;
        pgPoolOptions?: Omit<pg.PoolConfig, 'connectionString'>;
    });
    private getMutexByName;
    private getTableName;
    private getSchemaName;
    transformFilter(filter?: VectorFilter): VectorFilter;
    getIndexInfo({ indexName }: DescribeIndexParams): Promise<PGIndexStats>;
    query({ indexName, queryVector, topK, filter, includeVector, minScore, ef, probes, }: PgQueryVectorParams): Promise<QueryResult[]>;
    upsert({ indexName, vectors, metadata, ids }: UpsertVectorParams): Promise<string[]>;
    private hasher;
    private getIndexCacheKey;
    private cachedIndexExists;
    private setupSchema;
    createIndex({ indexName, dimension, metric, indexConfig, buildIndex, }: PgCreateIndexParams): Promise<void>;
    buildIndex({ indexName, metric, indexConfig }: PgDefineIndexParams): Promise<void>;
    private setupIndex;
    private installVectorExtension;
    listIndexes(): Promise<string[]>;
    /**
     * Retrieves statistics about a vector index.
     *
     * @param {string} indexName - The name of the index to describe
     * @returns A promise that resolves to the index statistics including dimension, count and metric
     */
    describeIndex({ indexName }: DescribeIndexParams): Promise<PGIndexStats>;
    deleteIndex({ indexName }: DeleteIndexParams): Promise<void>;
    truncateIndex({ indexName }: DeleteIndexParams): Promise<void>;
    disconnect(): Promise<void>;
    /**
     * Updates a vector by its ID with the provided vector and/or metadata.
     * @param indexName - The name of the index containing the vector.
     * @param id - The ID of the vector to update.
     * @param update - An object containing the vector and/or metadata to update.
     * @param update.vector - An optional array of numbers representing the new vector.
     * @param update.metadata - An optional record containing the new metadata.
     * @returns A promise that resolves when the update is complete.
     * @throws Will throw an error if no updates are provided or if the update operation fails.
     */
    updateVector({ indexName, id, update }: UpdateVectorParams): Promise<void>;
    /**
     * Deletes a vector by its ID.
     * @param indexName - The name of the index containing the vector.
     * @param id - The ID of the vector to delete.
     * @returns A promise that resolves when the deletion is complete.
     * @throws Will throw an error if the deletion operation fails.
     */
    deleteVector({ indexName, id }: DeleteVectorParams): Promise<void>;
}
export { PgVector }
export { PgVector as PgVector_alias_1 }

/**
 * Vector store specific prompt that details supported operators and examples.
 * This prompt helps users construct valid filters for PG Vector.
 */
declare const PGVECTOR_PROMPT = "When querying PG Vector, you can ONLY use the operators listed below. Any other operators will be rejected.\nImportant: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.\nIf a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.\n\nBasic Comparison Operators:\n- $eq: Exact match (default when using field: value)\n  Example: { \"category\": \"electronics\" }\n- $ne: Not equal\n  Example: { \"category\": { \"$ne\": \"electronics\" } }\n- $gt: Greater than\n  Example: { \"price\": { \"$gt\": 100 } }\n- $gte: Greater than or equal\n  Example: { \"price\": { \"$gte\": 100 } }\n- $lt: Less than\n  Example: { \"price\": { \"$lt\": 100 } }\n- $lte: Less than or equal\n  Example: { \"price\": { \"$lte\": 100 } }\n\nArray Operators:\n- $in: Match any value in array\n  Example: { \"category\": { \"$in\": [\"electronics\", \"books\"] } }\n- $nin: Does not match any value in array\n  Example: { \"category\": { \"$nin\": [\"electronics\", \"books\"] } }\n- $all: Match all values in array\n  Example: { \"tags\": { \"$all\": [\"premium\", \"sale\"] } }\n- $elemMatch: Match array elements that meet all specified conditions\n  Example: { \"items\": { \"$elemMatch\": { \"price\": { \"$gt\": 100 } } } }\n- $contains: Check if array contains value\n  Example: { \"tags\": { \"$contains\": \"premium\" } }\n\nLogical Operators:\n- $and: Logical AND (implicit when using multiple conditions)\n  Example: { \"$and\": [{ \"price\": { \"$gt\": 100 } }, { \"category\": \"electronics\" }] }\n- $or: Logical OR\n  Example: { \"$or\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n- $not: Logical NOT\n  Example: { \"$not\": { \"category\": \"electronics\" } }\n- $nor: Logical NOR\n  Example: { \"$nor\": [{ \"price\": { \"$lt\": 50 } }, { \"category\": \"books\" }] }\n\nElement Operators:\n- $exists: Check if field exists\n  Example: { \"rating\": { \"$exists\": true } }\n\nSpecial Operators:\n- $size: Array length check\n  Example: { \"tags\": { \"$size\": 2 } }\n\nRestrictions:\n- Regex patterns are not supported\n- Direct RegExp patterns will throw an error\n- Nested fields are supported using dot notation\n- Multiple conditions on the same field are supported with both implicit and explicit $and\n- Array operations work on array fields only\n- Basic operators handle array values as JSON strings\n- Empty arrays in conditions are handled gracefully\n- Only logical operators ($and, $or, $not, $nor) can be used at the top level\n- All other operators must be used within a field condition\n  Valid: { \"field\": { \"$gt\": 100 } }\n  Valid: { \"$and\": [...] }\n  Invalid: { \"$gt\": 100 }\n  Invalid: { \"$contains\": \"value\" }\n- Logical operators must contain field conditions, not direct operators\n  Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  Invalid: { \"$and\": [{ \"$gt\": 100 }] }\n- $not operator:\n  - Must be an object\n  - Cannot be empty\n  - Can be used at field level or top level\n  - Valid: { \"$not\": { \"field\": \"value\" } }\n  - Valid: { \"field\": { \"$not\": { \"$eq\": \"value\" } } }\n- Other logical operators ($and, $or, $nor):\n  - Can only be used at top level or nested within other logical operators\n  - Can not be used on a field level, or be nested inside a field\n  - Can not be used inside an operator\n  - Valid: { \"$and\": [{ \"field\": { \"$gt\": 100 } }] }\n  - Valid: { \"$or\": [{ \"$and\": [{ \"field\": { \"$gt\": 100 } }] }] }\n  - Invalid: { \"field\": { \"$and\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$or\": [{ \"$gt\": 100 }] } }\n  - Invalid: { \"field\": { \"$gt\": { \"$and\": [{...}] } } }\n- $elemMatch requires an object with conditions\n  Valid: { \"array\": { \"$elemMatch\": { \"field\": \"value\" } } }\n  Invalid: { \"array\": { \"$elemMatch\": \"value\" } }\n\nExample Complex Query:\n{\n  \"$and\": [\n    { \"category\": { \"$in\": [\"electronics\", \"computers\"] } },\n    { \"price\": { \"$gte\": 100, \"$lte\": 1000 } },\n    { \"tags\": { \"$all\": [\"premium\"] } },\n    { \"rating\": { \"$exists\": true, \"$gt\": 4 } },\n    { \"$or\": [\n      { \"stock\": { \"$gt\": 0 } },\n      { \"preorder\": true }\n    ]}\n  ]\n}";
export { PGVECTOR_PROMPT }
export { PGVECTOR_PROMPT as PGVECTOR_PROMPT_alias_1 }

declare type PostgresConfig = {
    schemaName?: string;
} & ({
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean | ISSLConfig;
} | {
    connectionString: string;
});
export { PostgresConfig }
export { PostgresConfig as PostgresConfig_alias_1 }

declare class PostgresStore extends MastraStorage {
    private db;
    private pgp;
    private schema?;
    private setupSchemaPromise;
    private schemaSetupComplete;
    constructor(config: PostgresConfig);
    get supports(): {
        selectByIncludeResourceScope: boolean;
    };
    private getTableName;
    private getSchemaName;
    /** @deprecated use getEvals instead */
    getEvalsByAgentName(agentName: string, type?: 'test' | 'live'): Promise<EvalRow[]>;
    private transformEvalRow;
    batchInsert({ tableName, records }: {
        tableName: TABLE_NAMES;
        records: Record<string, any>[];
    }): Promise<void>;
    /**
     * @deprecated use getTracesPaginated instead
     */
    getTraces(args: {
        name?: string;
        scope?: string;
        attributes?: Record<string, string>;
        filters?: Record<string, any>;
        page: number;
        perPage?: number;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<any[]>;
    getTracesPaginated(args: {
        name?: string;
        scope?: string;
        attributes?: Record<string, string>;
        filters?: Record<string, any>;
    } & PaginationArgs): Promise<PaginationInfo & {
        traces: any[];
    }>;
    private setupSchema;
    createTable({ tableName, schema, }: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
    }): Promise<void>;
    protected getDefaultValue(type: StorageColumn['type']): string;
    /**
     * Alters table schema to add columns if they don't exist
     * @param tableName Name of the table
     * @param schema Schema of the table
     * @param ifNotExists Array of column names to add if they don't exist
     */
    alterTable({ tableName, schema, ifNotExists, }: {
        tableName: TABLE_NAMES;
        schema: Record<string, StorageColumn>;
        ifNotExists: string[];
    }): Promise<void>;
    clearTable({ tableName }: {
        tableName: TABLE_NAMES;
    }): Promise<void>;
    insert({ tableName, record }: {
        tableName: TABLE_NAMES;
        record: Record<string, any>;
    }): Promise<void>;
    load<R>({ tableName, keys }: {
        tableName: TABLE_NAMES;
        keys: Record<string, string>;
    }): Promise<R | null>;
    getThreadById({ threadId }: {
        threadId: string;
    }): Promise<StorageThreadType | null>;
    /**
     * @deprecated use getThreadsByResourceIdPaginated instead
     */
    getThreadsByResourceId(args: {
        resourceId: string;
    }): Promise<StorageThreadType[]>;
    getThreadsByResourceIdPaginated(args: {
        resourceId: string;
    } & PaginationArgs): Promise<PaginationInfo & {
        threads: StorageThreadType[];
    }>;
    saveThread({ thread }: {
        thread: StorageThreadType;
    }): Promise<StorageThreadType>;
    updateThread({ id, title, metadata, }: {
        id: string;
        title: string;
        metadata: Record<string, unknown>;
    }): Promise<StorageThreadType>;
    deleteThread({ threadId }: {
        threadId: string;
    }): Promise<void>;
    /**
     * @deprecated use getMessagesPaginated instead
     */
    getMessages(args: StorageGetMessagesArg & {
        format?: 'v1';
    }): Promise<MastraMessageV1[]>;
    getMessages(args: StorageGetMessagesArg & {
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    getMessagesPaginated(args: StorageGetMessagesArg & {
        format?: 'v1' | 'v2';
    }): Promise<PaginationInfo & {
        messages: MastraMessageV1[] | MastraMessageV2[];
    }>;
    saveMessages(args: {
        messages: MastraMessageV1[];
        format?: undefined | 'v1';
    }): Promise<MastraMessageV1[]>;
    saveMessages(args: {
        messages: MastraMessageV2[];
        format: 'v2';
    }): Promise<MastraMessageV2[]>;
    persistWorkflowSnapshot({ workflowName, runId, snapshot, }: {
        workflowName: string;
        runId: string;
        snapshot: WorkflowRunState;
    }): Promise<void>;
    loadWorkflowSnapshot({ workflowName, runId, }: {
        workflowName: string;
        runId: string;
    }): Promise<WorkflowRunState | null>;
    private hasColumn;
    private parseWorkflowRun;
    getWorkflowRuns({ workflowName, fromDate, toDate, limit, offset, resourceId, }?: {
        workflowName?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
        resourceId?: string;
    }): Promise<WorkflowRuns>;
    getWorkflowRunById({ runId, workflowName, }: {
        runId: string;
        workflowName?: string;
    }): Promise<WorkflowRun | null>;
    close(): Promise<void>;
    getEvals(options?: {
        agentName?: string;
        type?: 'test' | 'live';
    } & PaginationArgs): Promise<PaginationInfo & {
        evals: EvalRow[];
    }>;
    updateMessages({ messages, }: {
        messages: (Partial<Omit<MastraMessageV2, 'createdAt'>> & {
            id: string;
            content?: {
                metadata?: MastraMessageContentV2['metadata'];
                content?: MastraMessageContentV2['content'];
            };
        })[];
    }): Promise<MastraMessageV2[]>;
}
export { PostgresStore }
export { PostgresStore as PostgresStore_alias_1 }

export declare interface TestConfig {
    dimension: number;
    size: number;
    k: number;
    queryCount: number;
}

export declare interface TestResult {
    distribution: string;
    dimension: number;
    type: IndexType;
    size: number;
    k?: number;
    metrics: {
        recall?: number;
        minRecall?: number;
        maxRecall?: number;
        latency?: {
            p50: number;
            p95: number;
            lists?: number;
            vectorsPerList?: number;
            m?: number;
            ef?: number;
        };
        clustering?: {
            numLists?: number;
            avgVectorsPerList?: number;
            recommendedLists?: number;
            distribution?: string;
        };
    };
}

export declare function warmupQuery(vectorDB: PgVector, indexName: string, dimension: number, k: number): Promise<void>;

export { }
