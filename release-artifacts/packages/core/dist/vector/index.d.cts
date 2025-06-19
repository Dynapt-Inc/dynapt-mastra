import { M as MastraBase } from '../base-CZ7cNkfE.cjs';
import { VectorFilter } from './filter/index.cjs';
import '../logger-CpL0z5v_.cjs';
import '../error/index.cjs';
import 'stream';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';

interface QueryResult {
    id: string;
    score: number;
    metadata?: Record<string, any>;
    vector?: number[];
    /**
     * The document content, if available.
     * Note: Currently only supported by Chroma vector store.
     * For other vector stores, documents should be stored in metadata.
     */
    document?: string;
}
interface IndexStats {
    dimension: number;
    count: number;
    metric?: 'cosine' | 'euclidean' | 'dotproduct';
}
interface UpsertVectorParams {
    indexName: string;
    vectors: number[][];
    metadata?: Record<string, any>[];
    ids?: string[];
}
interface CreateIndexParams {
    indexName: string;
    dimension: number;
    metric?: 'cosine' | 'euclidean' | 'dotproduct';
}
interface QueryVectorParams {
    indexName: string;
    queryVector: number[];
    topK?: number;
    filter?: VectorFilter;
    includeVector?: boolean;
}
interface DescribeIndexParams {
    indexName: string;
}
interface DeleteIndexParams {
    indexName: string;
}
interface UpdateVectorParams {
    indexName: string;
    id: string;
    update: {
        vector?: number[];
        metadata?: Record<string, any>;
    };
}
interface DeleteVectorParams {
    indexName: string;
    id: string;
}

declare abstract class MastraVector extends MastraBase {
    constructor();
    get indexSeparator(): string;
    abstract query(params: QueryVectorParams): Promise<QueryResult[]>;
    abstract upsert(params: UpsertVectorParams): Promise<string[]>;
    abstract createIndex(params: CreateIndexParams): Promise<void>;
    abstract listIndexes(): Promise<string[]>;
    abstract describeIndex(params: DescribeIndexParams): Promise<IndexStats>;
    abstract deleteIndex(params: DeleteIndexParams): Promise<void>;
    abstract updateVector(params: UpdateVectorParams): Promise<void>;
    abstract deleteVector(params: DeleteVectorParams): Promise<void>;
    protected validateExistingIndex(indexName: string, dimension: number, metric: string): Promise<void>;
}

export { type CreateIndexParams, type DeleteIndexParams, type DeleteVectorParams, type DescribeIndexParams, type IndexStats, MastraVector, type QueryResult, type QueryVectorParams, type UpdateVectorParams, type UpsertVectorParams };
