import type { Collection } from 'couchbase';
import type { CreateIndexParams } from '@mastra/core/vector';
import type { DeleteIndexParams } from '@mastra/core/vector';
import type { DeleteVectorParams } from '@mastra/core/vector';
import type { DescribeIndexParams } from '@mastra/core/vector';
import type { IndexStats } from '@mastra/core/vector';
import { MastraVector } from '@mastra/core/vector';
import type { QueryResult } from '@mastra/core/vector';
import type { QueryVectorParams } from '@mastra/core/vector';
import type { UpdateVectorParams } from '@mastra/core/vector';
import type { UpsertVectorParams } from '@mastra/core/vector';

declare type CouchbaseMetric = 'cosine' | 'l2_norm' | 'dot_product';

declare class CouchbaseVector extends MastraVector {
    private clusterPromise;
    private cluster;
    private bucketName;
    private collectionName;
    private scopeName;
    private collection;
    private bucket;
    private scope;
    private vector_dimension;
    constructor({ connectionString, username, password, bucketName, scopeName, collectionName }: CouchbaseVectorParams);
    getCollection(): Promise<Collection>;
    createIndex({ indexName, dimension, metric }: CreateIndexParams): Promise<void>;
    upsert({ vectors, metadata, ids }: UpsertVectorParams): Promise<string[]>;
    query({ indexName, queryVector, topK, includeVector }: QueryVectorParams): Promise<QueryResult[]>;
    listIndexes(): Promise<string[]>;
    /**
     * Retrieves statistics about a vector index.
     *
     * @param {string} indexName - The name of the index to describe
     * @returns A promise that resolves to the index statistics including dimension, count and metric
     */
    describeIndex({ indexName }: DescribeIndexParams): Promise<IndexStats>;
    deleteIndex({ indexName }: DeleteIndexParams): Promise<void>;
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
    updateVector({ id, update }: UpdateVectorParams): Promise<void>;
    /**
     * Deletes a vector by its ID.
     * @param indexName - The name of the index containing the vector.
     * @param id - The ID of the vector to delete.
     * @returns A promise that resolves when the deletion is complete.
     * @throws Will throw an error if the deletion operation fails.
     */
    deleteVector({ id }: DeleteVectorParams): Promise<void>;
    disconnect(): Promise<void>;
}
export { CouchbaseVector }
export { CouchbaseVector as CouchbaseVector_alias_1 }

declare type CouchbaseVectorParams = {
    connectionString: string;
    username: string;
    password: string;
    bucketName: string;
    scopeName: string;
    collectionName: string;
};
export { CouchbaseVectorParams }
export { CouchbaseVectorParams as CouchbaseVectorParams_alias_1 }

declare const DISTANCE_MAPPING: Record<MastraMetric, CouchbaseMetric>;
export { DISTANCE_MAPPING }
export { DISTANCE_MAPPING as DISTANCE_MAPPING_alias_1 }

declare type MastraMetric = 'cosine' | 'euclidean' | 'dotproduct';

export { }
