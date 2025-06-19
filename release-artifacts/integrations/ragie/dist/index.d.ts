import * as _mastra_core from '@mastra/core';
import { Integration } from '@mastra/core';
import * as _hey_api_client_fetch from '@hey-api/client-fetch';
import { Options } from '@hey-api/client-fetch';

type Connection = {
    id: string;
    created_at: string;
    updated_at: string;
    metadata: {
        [key: string]: unknown;
    };
    type: string;
    name: string;
    enabled: boolean;
    last_synced_at?: string | null;
    syncing?: boolean | null;
};
type ConnectionBase = {
    partition_strategy: 'hi_res' | 'fast';
    /**
     * Metadata for the document. Keys must be strings. Values may be strings, numbers, booleans, or lists of strings. Numbers may be integers or floating point and will be converted to 64 bit floating point. 1000 total values are allowed. Each item in an array counts towards the total. The following keys are reserved for internal use: `document_id`, `document_type`, `document_source`, `document_name`, `document_uploaded_at`.
     */
    metadata?: {
        [key: string]: string | number | boolean | Array<string>;
    };
};
type ConnectionList = {
    pagination: Pagination;
    connections: Array<Connection>;
};
type ConnectionStats = {
    document_count: number;
};
type CreateDocumentFromUrlParams = {
    /**
     * Metadata for the document. Keys must be strings. Values may be strings, numbers, booleans, or lists of strings. Numbers may be integers or floating point and will be converted to 64 bit floating point. 1000 total values are allowed. Each item in an array counts towards the total. The following keys are reserved for internal use: `document_id`, `document_type`, `document_source`, `document_name`, `document_uploaded_at`.
     */
    metadata?: {
        [key: string]: string | number | boolean | Array<string>;
    };
    /**
     * Partition strategy for the document. Options are `'hi_res'` or `'fast'`. Only applicable for rich documents such as word documents and PDFs. When set to `'hi_res'`, images and tables will be extracted from the document. `'fast'` will only extract text. `'fast'` may be up to 20x faster than `'hi_res'`.
     */
    mode?: 'hi_res' | 'fast';
    name?: string;
    external_id?: string;
    /**
     * Url of the file to download. Must be publicly accessible and HTTP or HTTPS scheme
     */
    url: string;
    /**
     * An optional partition identifier. Documents can be scoped to a partition. Partitions must be lowercase alphanumeric and may only include the special characters `_` and `-`.  A partition is created any time a document is created or moved to a new partition.
     */
    partition?: string;
};
type CreateDocumentParams = {
    /**
     * Partition strategy for the document. Options are `'hi_res'` or `'fast'`. Only applicable for rich documents such as word documents and PDFs. When set to `'hi_res'`, images and tables will be extracted from the document. `'fast'` will only extract text. `'fast'` may be up to 20x faster than `'hi_res'`.
     */
    mode?: 'hi_res' | 'fast';
    /**
     * Metadata for the document. Keys must be strings. Values may be strings, numbers, booleans, or lists of strings. Numbers may be integers or floating point and will be converted to 64 bit floating point. 1000 total values are allowed. Each item in an array counts towards the total. The following keys are reserved for internal use: `document_id`, `document_type`, `document_source`, `document_name`, `document_uploaded_at`.
     */
    metadata?: {
        [key: string]: string | number | boolean | Array<string>;
    };
    /**
     * The binary file to upload, extract, and index for retrieval. The following file types are supported: Plain Text: `.eml` `.html` `.json` `.md` `.msg` `.rst` `.rtf` `.txt` `.xml`
     * Images: `.png` `.webp` `.jpg` `.jpeg` `.tiff` `.bmp` `.heic`
     * Documents: `.csv` `.doc` `.docx` `.epub` `.epub+zip` `.odt` `.pdf` `.ppt` `.pptx` `.tsv` `.xlsx` `.xls`.
     */
    file: Blob | File;
    /**
     * An optional identifier for the document. A common value might be an id in an external system or the URL where the source file may be found.
     */
    external_id?: string;
    /**
     * An optional partition identifier. Documents can be scoped to a partition. Partitions must be lowercase alphanumeric and may only include the special characters `_` and `-`.  A partition is created any time a document is created or moved to a new partition.
     */
    partition?: string;
};
type CreateDocumentRawParams = {
    /**
     * Metadata for the document. Keys must be strings. Values may be strings, numbers, booleans, or lists of strings. Numbers may be integers or floating point and will be converted to 64 bit floating point. 1000 total values are allowed. Each item in an array counts towards the total. The following keys are reserved for internal use: `document_id`, `document_type`, `document_source`, `document_name`, `document_uploaded_at`.
     */
    metadata?: {
        [key: string]: string | number | boolean | Array<string>;
    };
    /**
     * An optional name for the document. If set, the document will have this name. Otherwise it will default to the current timestamp.
     */
    name?: string;
    /**
     * Document data in a text or JSON format.
     */
    data: string | {
        [key: string]: unknown;
    };
    /**
     * An optional partition identifier. Documents can be scoped to a partition. Partitions must be lowercase alphanumeric and may only include the special characters `_` and `-`.  A partition is created any time a document is created or moved to a new partition.
     */
    partition?: string;
};
type CreateInstructionParams = {
    /**
     * The name of the instruction. Must be unique.
     */
    name: string;
    /**
     * Whether the instruction is active. Active instructions are applied to documents when they're created or when their file is updated.
     */
    active?: boolean;
    /**
     * The scope of the instruction. Determines whether the instruction is applied to the entire document or to each chunk of the document. Options are `'document'` or `'chunk'`. Generally `'document'` should be used when analyzing the full document is desired, such as when generating a summary or determining sentiment, and `'chunk'` should be used when a fine grained search over a document is desired.
     */
    scope?: 'document' | 'chunk';
    /**
     * A natural language instruction which will be applied to documents as they are created and updated. The results of the `instruction_prompt` will be stored as an `entity` in the schema defined by the `entity_schema` parameter.
     */
    prompt: string;
    /**
     * The JSON schema definition of the entity generated by an instruction. The schema must define an `object` at its root. If the instruction is expected to generate multiple items, the root object should have a key which defines an array of the expected items. An instruction which generates multiple emails may be expressed as `{"type": "object", "properties": {"emails": { "type": "array", "items": { "type": "string"}}}}`. Simple values may be expressed as an object with a single key. For example, a summary instruction may generate a single string value. The schema might be `{"type": "object", "properties": { "summary": { "type": "string"}}}`.
     */
    entity_schema: EntitySchemaType;
    /**
     * An optional metadata filter that is matched against document metadata during update and creation. The instruction will only be applied to documents with metadata matching the filter.  The following filter operators are supported: $eq - Equal to (number, string, boolean), $ne - Not equal to (number, string, boolean), $gt - Greater than (number), $gte - Greater than or equal to (number), $lt - Less than (number), $lte - Less than or equal to (number), $in - In array (string or number), $nin - Not in array (string or number). The operators can be combined with AND and OR. Read [Metadata & Filters guide](https://docs.ragie.ai/docs/metadata-filters) for more details and examples.
     */
    filter?: {
        [key: string]: unknown;
    };
    /**
     * An optional partition identifier. Instructions can be scoped to a partition. An instruction that defines a partition will only be executed for documents in that partition.
     */
    partition?: string;
};
type DeleteConnectionPayload = {
    keep_files: boolean;
};
type Document = {
    id: string;
    created_at: string;
    updated_at: string;
    status: string;
    name: string;
    metadata: {
        [key: string]: string | number | boolean | Array<string>;
    };
    partition: string;
    chunk_count?: number | null;
    external_id?: string | null;
};
type DocumentDelete = {
    status: string;
};
type DocumentFileUpdate = {
    status: string;
};
type DocumentGet = {
    id: string;
    created_at: string;
    updated_at: string;
    status: string;
    name: string;
    metadata: {
        [key: string]: string | number | boolean | Array<string>;
    };
    partition: string;
    chunk_count?: number | null;
    external_id?: string | null;
    errors: Array<string>;
};
type DocumentList = {
    pagination: Pagination;
    documents: Array<Document>;
};
type DocumentMetadata = {
    [key: string]: unknown;
};
type DocumentMetadataUpdate = {
    /**
     * The full document metadata inclusive of the update.
     */
    metadata: {
        [key: string]: string | number | boolean | Array<string>;
    };
};
type DocumentRawUpdate = {
    status: string;
};
type DocumentSummary = {
    document_id: string;
    summary: string;
};
type Entity = {
    id: string;
    created_at: string;
    updated_at: string;
    /**
     * The ID of the instruction which generated the entity.
     */
    instruction_id: string;
    /**
     * The ID of the document which the entity was produced from.
     */
    document_id: string;
    /**
     * The entity data generated by the instruction.
     */
    data: EntityData;
};
type EntityData = {
    [key: string]: unknown;
};
type EntityList = {
    pagination: Pagination;
    entities: Array<Entity>;
};
type EntitySchemaType = {
    [key: string]: unknown;
};
type ErrorMessage = {
    detail: string;
};
type HTTPValidationError = {
    detail?: Array<ValidationError>;
};
type Instruction = {
    id: string;
    created_at: string;
    updated_at: string;
    /**
     * The name of the instruction. Must be unique.
     */
    name: string;
    /**
     * Whether the instruction is active. Active instructions are applied to documents when they're created or when their file is updated.
     */
    active?: boolean;
    /**
     * The scope of the instruction. Determines whether the instruction is applied to the entire document or to each chunk of the document. Options are `'document'` or `'chunk'`. Generally `'document'` should be used when analyzing the full document is desired, such as when generating a summary or determining sentiment, and `'chunk'` should be used when a fine grained search over a document is desired.
     */
    scope?: 'document' | 'chunk';
    /**
     * A natural language instruction which will be applied to documents as they are created and updated. The results of the `instruction_prompt` will be stored as an `entity` in the schema defined by the `entity_schema` parameter.
     */
    prompt: string;
    /**
     * The JSON schema definition of the entity generated by an instruction. The schema must define an `object` at its root. If the instruction is expected to generate multiple items, the root object should have a key which defines an array of the expected items. An instruction which generates multiple emails may be expressed as `{"type": "object", "properties": {"emails": { "type": "array", "items": { "type": "string"}}}}`. Simple values may be expressed as an object with a single key. For example, a summary instruction may generate a single string value. The schema might be `{"type": "object", "properties": { "summary": { "type": "string"}}}`.
     */
    entity_schema: EntitySchemaType;
    /**
     * An optional metadata filter that is matched against document metadata during update and creation. The instruction will only be applied to documents with metadata matching the filter.  The following filter operators are supported: $eq - Equal to (number, string, boolean), $ne - Not equal to (number, string, boolean), $gt - Greater than (number), $gte - Greater than or equal to (number), $lt - Less than (number), $lte - Less than or equal to (number), $in - In array (string or number), $nin - Not in array (string or number). The operators can be combined with AND and OR. Read [Metadata & Filters guide](https://docs.ragie.ai/docs/metadata-filters) for more details and examples.
     */
    filter?: {
        [key: string]: unknown;
    };
    /**
     * An optional partition identifier. Instructions can be scoped to a partition. An instruction that defines a partition will only be executed for documents in that partition.
     */
    partition?: string;
};
type MetadataFilter = {
    [key: string]: unknown;
};
type Pagination = {
    next_cursor?: string | null;
};
type PatchDocumentMetadataParams = {
    /**
     * The metadata to update on the document. Performs a partial update of the document's metadata. Keys must be strings. Values may be strings, numbers, booleans, or lists of strings. Numbers may be integers or floating point and will be converted to 64 bit floating point. Keys set to `null` are deleted. 1000 total values are allowed, inclusive of existing metadata. Each item in an array counts towards the total. The following keys are reserved for internal use: `document_id`, `document_type`, `document_source`, `document_name`, `document_uploaded_at`. If the document is managed by a connection, this operation will extend a metadata overlay which is applied to the document any time the connection syncs the document.
     */
    metadata: {
        [key: string]: string | number | boolean | Array<string> | null;
    };
};
type Retrieval = {
    scored_chunks: Array<ScoredChunk>;
};
type RetrieveParams = {
    /**
     * The query to search with when retrieving document chunks.
     */
    query: string;
    /**
     * The maximum number of chunks to return. Defaults to 8.
     */
    top_k?: number;
    /**
     * The metadata search filter on documents. Returns chunks only from documents which match the filter. The following filter operators are supported: $eq - Equal to (number, string, boolean), $ne - Not equal to (number, string, boolean), $gt - Greater than (number), $gte - Greater than or equal to (number), $lt - Less than (number), $lte - Less than or equal to (number), $in - In array (string or number), $nin - Not in array (string or number). The operators can be combined with AND and OR. Read [Metadata & Filters guide](https://docs.ragie.ai/docs/metadata-filters) for more details and examples.
     */
    filter?: MetadataFilter;
    /**
     * Reranks the chunks for semantic relevancy post cosine similarity. Will be slower but returns a subset of highly relevant chunks. Best for reducing hallucinations and improving accuracy for LLM generation.
     */
    rerank?: boolean;
    /**
     * Maximum number of chunks to retrieve per document. Use this to increase the number of documents the final chunks are retreived from. This feature is in beta and may change in the future.
     */
    max_chunks_per_document?: number;
    /**
     * The partition to scope a retrieval to. If omitted, the retrieval will be scoped to the default partition, which includes any documents that have not been created in or moved to a partition.
     */
    partition?: string;
};
type ScoredChunk = {
    text: string;
    score: number;
    document_id: string;
    document_name: string;
    document_metadata: DocumentMetadata;
};
type SetConnectionEnabledPayload = {
    enabled: boolean;
};
type UpdateDocumentFileParams = {
    /**
     * Partition strategy for the document. Options are `'hi_res'` or `'fast'`. Only applicable for rich documents such as word documents and PDFs. When set to `'hi_res'`, images and tables will be extracted from the document. `'fast'` will only extract text. `'fast'` may be up to 20x faster than `'hi_res'`.
     */
    mode?: 'hi_res' | 'fast';
    /**
     * The binary file to upload, extract, and index for retrieval. The following file types are supported: Plain Text: `.eml` `.html` `.json` `.md` `.msg` `.rst` `.rtf` `.txt` `.xml`
     * Images: `.png` `.webp` `.jpg` `.jpeg` `.tiff` `.bmp` `.heic`
     * Documents: `.csv` `.doc` `.docx` `.epub` `.epub+zip` `.odt` `.pdf` `.ppt` `.pptx` `.tsv` `.xlsx` `.xls`.
     */
    file: Blob | File;
};
type UpdateDocumentRawParams = {
    /**
     * Document data in a text or JSON format.
     */
    data: string | {
        [key: string]: unknown;
    };
};
type UpdateInstructionParams = {
    /**
     * Whether the instruction is active. Active instructions are applied to documents when they're created or when their file is updated.
     */
    active: boolean;
};
type ValidationError = {
    loc: Array<string | number>;
    msg: string;
    type: string;
};
type CreateDocumentData = {
    body: CreateDocumentParams;
};
type CreateDocumentError = ErrorMessage | HTTPValidationError;
type ListDocumentsData = {
    headers?: {
        partition?: string | null;
    };
    query?: {
        /**
         * An opaque cursor for pagination
         */
        cursor?: string | null;
        /**
         * The metadata search filter on documents. Returns only documents which match the filter. The following filter operators are supported: $eq - Equal to (number, string, boolean), $ne - Not equal to (number, string, boolean), $gt - Greater than (number), $gte - Greater than or equal to (number), $lt - Less than (number), $lte - Less than or equal to (number), $in - In array (string or number), $nin - Not in array (string or number). The operators can be combined with AND and OR. Read [Metadata & Filters guide](https://docs.ragie.ai/docs/metadata-filters) for more details and examples.
         */
        filter?: string | null;
        /**
         * The number of items per page (must be greater than 0 and less than or equal to 100)
         */
        page_size?: number;
    };
};
type ListDocumentsError = ErrorMessage | HTTPValidationError;
type CreateDocumentRawData = {
    body: CreateDocumentRawParams;
};
type CreateDocumentRawError = ErrorMessage | HTTPValidationError;
type CreateDocumentFromUrlData = {
    body: CreateDocumentFromUrlParams;
};
type CreateDocumentFromUrlError = ErrorMessage | HTTPValidationError;
type GetDocumentData = {
    path: {
        /**
         * The id of the document.
         */
        document_id: string;
    };
};
type GetDocumentError = ErrorMessage | HTTPValidationError;
type DeleteDocumentData = {
    path: {
        /**
         * The id of the document.
         */
        document_id: string;
    };
};
type DeleteDocumentError = ErrorMessage | HTTPValidationError;
type UpdateDocumentFileData = {
    body: UpdateDocumentFileParams;
    path: {
        /**
         * The id of the document.
         */
        document_id: string;
    };
};
type UpdateDocumentFileError = ErrorMessage | HTTPValidationError;
type UpdateDocumentRawData = {
    body: UpdateDocumentRawParams;
    path: {
        /**
         * The id of the document.
         */
        document_id: string;
    };
};
type UpdateDocumentRawError = ErrorMessage | HTTPValidationError;
type PatchDocumentMetadataData = {
    body: PatchDocumentMetadataParams;
    path: {
        /**
         * The id of the document.
         */
        document_id: string;
    };
};
type PatchDocumentMetadataError = ErrorMessage | HTTPValidationError;
type RetrieveData = {
    body: RetrieveParams;
};
type RetrieveError = ErrorMessage | HTTPValidationError;
type GetDocumentSummaryData = {
    path: {
        /**
         * The id of the document.
         */
        document_id: string;
    };
};
type GetDocumentSummaryError = ErrorMessage | HTTPValidationError;
type ListInstructionsResponse = Array<Instruction>;
type CreateInstructionData = {
    body: CreateInstructionParams;
};
type CreateInstructionError = ErrorMessage | HTTPValidationError;
type UpdateInstructionData = {
    body: UpdateInstructionParams;
    path: {
        /**
         * The ID of the instruction.
         */
        instruction_id: string;
    };
};
type UpdateInstructionError = ErrorMessage | HTTPValidationError;
type ListEntitiesByInstructionData = {
    path: {
        /**
         * The ID of the instruction.
         */
        instruction_id: string;
    };
    query?: {
        /**
         * An opaque cursor for pagination
         */
        cursor?: string | null;
        /**
         * The number of items per page (must be greater than 0 and less than or equal to 100)
         */
        page_size?: number;
    };
};
type ListEntitiesByInstructionError = ErrorMessage | HTTPValidationError;
type ListEntitiesByDocumentData = {
    path: {
        /**
         * The id of the document.
         */
        document_id: string;
    };
    query?: {
        /**
         * An opaque cursor for pagination
         */
        cursor?: string | null;
        /**
         * The number of items per page (must be greater than 0 and less than or equal to 100)
         */
        page_size?: number;
    };
};
type ListEntitiesByDocumentError = ErrorMessage | HTTPValidationError;
type ListConnectionsConnectionsGetData = {
    query?: {
        /**
         * An opaque cursor for pagination
         */
        cursor?: string | null;
        /**
         * The number of items per page (must be greater than 0 and less than or equal to 100)
         */
        page_size?: number;
    };
};
type ListConnectionsConnectionsGetError = ErrorMessage | HTTPValidationError;
type SetConnectionEnabledConnectionsConnectionIdEnabledPutData = {
    body: SetConnectionEnabledPayload;
    path: {
        connection_id: string;
    };
};
type SetConnectionEnabledConnectionsConnectionIdEnabledPutError = ErrorMessage | HTTPValidationError;
type UpdateConnectionConnectionsConnectionIdPutData = {
    body: ConnectionBase;
    path: {
        connection_id: string;
    };
};
type UpdateConnectionConnectionsConnectionIdPutError = ErrorMessage | HTTPValidationError;
type GetConnectionStatsConnectionsConnectionIdStatsGetData = {
    path: {
        connection_id: string;
    };
};
type GetConnectionStatsConnectionsConnectionIdStatsGetError = ErrorMessage | HTTPValidationError;
type DeleteConnectionConnectionsConnectionIdDeletePostData = {
    body: DeleteConnectionPayload;
    path: {
        connection_id: string;
    };
};
type DeleteConnectionConnectionsConnectionIdDeletePostResponse = {
    [key: string]: string;
};
type DeleteConnectionConnectionsConnectionIdDeletePostError = ErrorMessage | HTTPValidationError;

declare const client: _hey_api_client_fetch.Client<Request, Response, _hey_api_client_fetch.RequestOptionsBase<false> & _hey_api_client_fetch.Config<false> & {
    headers: Headers;
}>;
/**
 * Create Document
 * On ingest, the document goes through a series of steps before it is ready for retrieval. Each step is reflected in the status of the document which can be one of [`pending`, `partitioning`, `partitioned`, `refined`, `chunked`, `indexed`, `summary_indexed`, `ready`, `failed`]. The document is available for retrieval once it is in ready state. The summary index step can take a few seconds. You can optionally use the document for retrieval once it is in `indexed` state. However the summary will only be available once the state has changed to `summary_indexed` or `ready`.
 */
declare const createDocument: <ThrowOnError extends boolean = false>(options: Options<CreateDocumentData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<Document, CreateDocumentError, ThrowOnError>;
/**
 * List Documents
 * List all documents sorted by created_at in descending order. Results are paginated with a max limit of 100. When more documents are available, a `cursor` will be provided. Use the `cursor` parameter to retrieve the subsequent page.
 */
declare const listDocuments: <ThrowOnError extends boolean = false>(options?: Options<ListDocumentsData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<DocumentList, ListDocumentsError, ThrowOnError>;
/**
 * Create Document Raw
 * Ingest a document as raw text. On ingest, the document goes through a series of steps before it is ready for retrieval. Each step is reflected in the status of the document which can be one of [`pending`, `partitioning`, `partitioned`, `refined`, `chunked`, `indexed`, `summary_indexed`, `ready`, `failed`]. The document is available for retrieval once it is in ready state. The summary index step can take a few seconds. You can optionally use the document for retrieval once it is in `indexed` state. However the summary will only be available once the state has changed to `summary_indexed` or `ready`.
 */
declare const createDocumentRaw: <ThrowOnError extends boolean = false>(options: Options<CreateDocumentRawData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<Document, CreateDocumentRawError, ThrowOnError>;
/**
 * Create Document From Url
 */
declare const createDocumentFromUrl: <ThrowOnError extends boolean = false>(options: Options<CreateDocumentFromUrlData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<Document, CreateDocumentFromUrlError, ThrowOnError>;
/**
 * Get Document
 */
declare const getDocument: <ThrowOnError extends boolean = false>(options: Options<GetDocumentData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<DocumentGet, GetDocumentError, ThrowOnError>;
/**
 * Delete Document
 */
declare const deleteDocument: <ThrowOnError extends boolean = false>(options: Options<DeleteDocumentData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<DocumentDelete, DeleteDocumentError, ThrowOnError>;
/**
 * Update Document File
 */
declare const updateDocumentFile: <ThrowOnError extends boolean = false>(options: Options<UpdateDocumentFileData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<DocumentFileUpdate, UpdateDocumentFileError, ThrowOnError>;
/**
 * Update Document Raw
 */
declare const updateDocumentRaw: <ThrowOnError extends boolean = false>(options: Options<UpdateDocumentRawData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<DocumentRawUpdate, UpdateDocumentRawError, ThrowOnError>;
/**
 * Patch Document Metadata
 */
declare const patchDocumentMetadata: <ThrowOnError extends boolean = false>(options: Options<PatchDocumentMetadataData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<DocumentMetadataUpdate, PatchDocumentMetadataError, ThrowOnError>;
/**
 * Retrieve
 */
declare const retrieve: <ThrowOnError extends boolean = false>(options: Options<RetrieveData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<Retrieval, RetrieveError, ThrowOnError>;
/**
 * Get Document Summary
 * Get a LLM generated summary of the document. The summary is created when the document is first created or updated. Documents of types ['xls', 'xlsx', 'csv', 'json'] are not supported for summarization. Documents greater than 1M in token length are not supported. This feature is in beta and may change in the future.
 */
declare const getDocumentSummary: <ThrowOnError extends boolean = false>(options: Options<GetDocumentSummaryData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<DocumentSummary, GetDocumentSummaryError, ThrowOnError>;
/**
 * List Instructions
 * List all instructions.
 */
declare const listInstructions: <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => _hey_api_client_fetch.RequestResult<ListInstructionsResponse, ErrorMessage, ThrowOnError>;
/**
 * Create Instruction
 * Create a new instruction. Instructions are applied to documents as they are created or updated. The results of the instruction are stored as structured data in the schema defined by the `entity_schema` parameter. The `prompt` parameter is a natural language instruction which will be applied to documents. This feature is in beta and may change in the future.
 */
declare const createInstruction: <ThrowOnError extends boolean = false>(options: Options<CreateInstructionData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<Instruction, CreateInstructionError, ThrowOnError>;
/**
 * Update Instruction
 */
declare const updateInstruction: <ThrowOnError extends boolean = false>(options: Options<UpdateInstructionData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<Instruction, UpdateInstructionError, ThrowOnError>;
/**
 * Get Instruction Extracted Entities
 */
declare const listEntitiesByInstruction: <ThrowOnError extends boolean = false>(options: Options<ListEntitiesByInstructionData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<EntityList, ListEntitiesByInstructionError, ThrowOnError>;
/**
 * Get Document Extracted Entities
 */
declare const listEntitiesByDocument: <ThrowOnError extends boolean = false>(options: Options<ListEntitiesByDocumentData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<EntityList, ListEntitiesByDocumentError, ThrowOnError>;
/**
 * List Connections
 * List all connections sorted by created_at in descending order. Results are paginated with a max limit of 100. When more documents are available, a `cursor` will be provided. Use the `cursor` parameter to retrieve the subsequent page.
 */
declare const listConnectionsConnectionsGet: <ThrowOnError extends boolean = false>(options?: Options<ListConnectionsConnectionsGetData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<ConnectionList, ListConnectionsConnectionsGetError, ThrowOnError>;
/**
 * Set Connection Enabled
 * Enable or disable the connection. A disabled connection won't sync.
 */
declare const setConnectionEnabledConnectionsConnectionIdEnabledPut: <ThrowOnError extends boolean = false>(options: Options<SetConnectionEnabledConnectionsConnectionIdEnabledPutData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<Connection, SetConnectionEnabledConnectionsConnectionIdEnabledPutError, ThrowOnError>;
/**
 * Update Connection
 * Updates a connections metadata or mode. These changes will be seen after the next sync.
 */
declare const updateConnectionConnectionsConnectionIdPut: <ThrowOnError extends boolean = false>(options: Options<UpdateConnectionConnectionsConnectionIdPutData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<Connection, UpdateConnectionConnectionsConnectionIdPutError, ThrowOnError>;
/**
 * Get Connection Stats
 * Lists connection stats: total documents synced.
 */
declare const getConnectionStatsConnectionsConnectionIdStatsGet: <ThrowOnError extends boolean = false>(options: Options<GetConnectionStatsConnectionsConnectionIdStatsGetData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<ConnectionStats, GetConnectionStatsConnectionsConnectionIdStatsGetError, ThrowOnError>;
/**
 * Delete Connection
 * Schedules a connection to be deleted. You can choose to keep the files from the connection or delete them all. If you keep the files, they will no longer be associated to the connection. Deleting can take some time, so you will still see files for a bit after this is called.
 */
declare const deleteConnectionConnectionsConnectionIdDeletePost: <ThrowOnError extends boolean = false>(options: Options<DeleteConnectionConnectionsConnectionIdDeletePostData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<DeleteConnectionConnectionsConnectionIdDeletePostResponse, DeleteConnectionConnectionsConnectionIdDeletePostError, ThrowOnError>;

declare const integrationClient_client: typeof client;
declare const integrationClient_createDocument: typeof createDocument;
declare const integrationClient_createDocumentFromUrl: typeof createDocumentFromUrl;
declare const integrationClient_createDocumentRaw: typeof createDocumentRaw;
declare const integrationClient_createInstruction: typeof createInstruction;
declare const integrationClient_deleteConnectionConnectionsConnectionIdDeletePost: typeof deleteConnectionConnectionsConnectionIdDeletePost;
declare const integrationClient_deleteDocument: typeof deleteDocument;
declare const integrationClient_getConnectionStatsConnectionsConnectionIdStatsGet: typeof getConnectionStatsConnectionsConnectionIdStatsGet;
declare const integrationClient_getDocument: typeof getDocument;
declare const integrationClient_getDocumentSummary: typeof getDocumentSummary;
declare const integrationClient_listConnectionsConnectionsGet: typeof listConnectionsConnectionsGet;
declare const integrationClient_listDocuments: typeof listDocuments;
declare const integrationClient_listEntitiesByDocument: typeof listEntitiesByDocument;
declare const integrationClient_listEntitiesByInstruction: typeof listEntitiesByInstruction;
declare const integrationClient_listInstructions: typeof listInstructions;
declare const integrationClient_patchDocumentMetadata: typeof patchDocumentMetadata;
declare const integrationClient_retrieve: typeof retrieve;
declare const integrationClient_setConnectionEnabledConnectionsConnectionIdEnabledPut: typeof setConnectionEnabledConnectionsConnectionIdEnabledPut;
declare const integrationClient_updateConnectionConnectionsConnectionIdPut: typeof updateConnectionConnectionsConnectionIdPut;
declare const integrationClient_updateDocumentFile: typeof updateDocumentFile;
declare const integrationClient_updateDocumentRaw: typeof updateDocumentRaw;
declare const integrationClient_updateInstruction: typeof updateInstruction;
declare namespace integrationClient {
  export { integrationClient_client as client, integrationClient_createDocument as createDocument, integrationClient_createDocumentFromUrl as createDocumentFromUrl, integrationClient_createDocumentRaw as createDocumentRaw, integrationClient_createInstruction as createInstruction, integrationClient_deleteConnectionConnectionsConnectionIdDeletePost as deleteConnectionConnectionsConnectionIdDeletePost, integrationClient_deleteDocument as deleteDocument, integrationClient_getConnectionStatsConnectionsConnectionIdStatsGet as getConnectionStatsConnectionsConnectionIdStatsGet, integrationClient_getDocument as getDocument, integrationClient_getDocumentSummary as getDocumentSummary, integrationClient_listConnectionsConnectionsGet as listConnectionsConnectionsGet, integrationClient_listDocuments as listDocuments, integrationClient_listEntitiesByDocument as listEntitiesByDocument, integrationClient_listEntitiesByInstruction as listEntitiesByInstruction, integrationClient_listInstructions as listInstructions, integrationClient_patchDocumentMetadata as patchDocumentMetadata, integrationClient_retrieve as retrieve, integrationClient_setConnectionEnabledConnectionsConnectionIdEnabledPut as setConnectionEnabledConnectionsConnectionIdEnabledPut, integrationClient_updateConnectionConnectionsConnectionIdPut as updateConnectionConnectionsConnectionIdPut, integrationClient_updateDocumentFile as updateDocumentFile, integrationClient_updateDocumentRaw as updateDocumentRaw, integrationClient_updateInstruction as updateInstruction };
}

type RagieConfig = {
    API_KEY: string;
    [key: string]: any;
};

declare class RagieIntegration extends Integration<void, typeof integrationClient> {
    readonly name = "RAGIE";
    readonly logoUrl: any;
    config: RagieConfig;
    categories: string[];
    description: string;
    constructor({ config }: {
        config: RagieConfig;
    });
    getStaticTools(): Record<"createDocument" | "listDocuments" | "createDocumentRaw" | "createDocumentFromUrl" | "getDocument" | "deleteDocument" | "updateDocumentFile" | "updateDocumentRaw" | "patchDocumentMetadata" | "retrieve" | "getDocumentSummary" | "listInstructions" | "createInstruction" | "updateInstruction" | "listEntitiesByInstruction" | "listEntitiesByDocument" | "listConnectionsConnectionsGet" | "setConnectionEnabledConnectionsConnectionIdEnabledPut" | "updateConnectionConnectionsConnectionIdPut" | "getConnectionStatsConnectionsConnectionIdStatsGet" | "deleteConnectionConnectionsConnectionIdDeletePost", _mastra_core.ToolAction<any, any, any>>;
}

export { RagieIntegration };
