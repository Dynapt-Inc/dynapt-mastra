'use strict';

var core = require('@mastra/core');
var clientFetch = require('@hey-api/client-fetch');
var zod = require('zod');

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/assets/ragie.png
var ragie_default = "./ragie-SD2LWOMK.png";

// src/client/services.gen.ts
var services_gen_exports = {};
__export(services_gen_exports, {
  client: () => client,
  createDocument: () => createDocument,
  createDocumentFromUrl: () => createDocumentFromUrl,
  createDocumentRaw: () => createDocumentRaw,
  createInstruction: () => createInstruction,
  deleteConnectionConnectionsConnectionIdDeletePost: () => deleteConnectionConnectionsConnectionIdDeletePost,
  deleteDocument: () => deleteDocument,
  getConnectionStatsConnectionsConnectionIdStatsGet: () => getConnectionStatsConnectionsConnectionIdStatsGet,
  getDocument: () => getDocument,
  getDocumentSummary: () => getDocumentSummary,
  listConnectionsConnectionsGet: () => listConnectionsConnectionsGet,
  listDocuments: () => listDocuments,
  listEntitiesByDocument: () => listEntitiesByDocument,
  listEntitiesByInstruction: () => listEntitiesByInstruction,
  listInstructions: () => listInstructions,
  patchDocumentMetadata: () => patchDocumentMetadata,
  retrieve: () => retrieve,
  setConnectionEnabledConnectionsConnectionIdEnabledPut: () => setConnectionEnabledConnectionsConnectionIdEnabledPut,
  updateConnectionConnectionsConnectionIdPut: () => updateConnectionConnectionsConnectionIdPut,
  updateDocumentFile: () => updateDocumentFile,
  updateDocumentRaw: () => updateDocumentRaw,
  updateInstruction: () => updateInstruction
});
var client = clientFetch.createClient(clientFetch.createConfig());
var createDocument = (options) => {
  return (options?.client ?? client).post({
    ...options,
    ...clientFetch.formDataBodySerializer,
    headers: {
      "Content-Type": null,
      ...options?.headers
    },
    url: "/documents"
  });
};
var listDocuments = (options) => {
  return (options?.client ?? client).get({
    ...options,
    url: "/documents"
  });
};
var createDocumentRaw = (options) => {
  return (options?.client ?? client).post({
    ...options,
    url: "/documents/raw"
  });
};
var createDocumentFromUrl = (options) => {
  return (options?.client ?? client).post({
    ...options,
    url: "/documents/url"
  });
};
var getDocument = (options) => {
  return (options?.client ?? client).get({
    ...options,
    url: "/documents/{document_id}"
  });
};
var deleteDocument = (options) => {
  return (options?.client ?? client).delete({
    ...options,
    url: "/documents/{document_id}"
  });
};
var updateDocumentFile = (options) => {
  return (options?.client ?? client).put({
    ...options,
    ...clientFetch.formDataBodySerializer,
    headers: {
      "Content-Type": null,
      ...options?.headers
    },
    url: "/documents/{document_id}/file"
  });
};
var updateDocumentRaw = (options) => {
  return (options?.client ?? client).put({
    ...options,
    url: "/documents/{document_id}/raw"
  });
};
var patchDocumentMetadata = (options) => {
  return (options?.client ?? client).patch({
    ...options,
    url: "/documents/{document_id}/metadata"
  });
};
var retrieve = (options) => {
  return (options?.client ?? client).post({
    ...options,
    url: "/retrievals"
  });
};
var getDocumentSummary = (options) => {
  return (options?.client ?? client).get({
    ...options,
    url: "/documents/{document_id}/summary"
  });
};
var listInstructions = (options) => {
  return (options?.client ?? client).get({
    ...options,
    url: "/instructions"
  });
};
var createInstruction = (options) => {
  return (options?.client ?? client).post({
    ...options,
    url: "/instructions"
  });
};
var updateInstruction = (options) => {
  return (options?.client ?? client).put({
    ...options,
    url: "/instructions/{instruction_id}"
  });
};
var listEntitiesByInstruction = (options) => {
  return (options?.client ?? client).get({
    ...options,
    url: "/instructions/{instruction_id}/entities"
  });
};
var listEntitiesByDocument = (options) => {
  return (options?.client ?? client).get({
    ...options,
    url: "/documents/{document_id}/entities"
  });
};
var listConnectionsConnectionsGet = (options) => {
  return (options?.client ?? client).get({
    ...options,
    url: "/connections"
  });
};
var setConnectionEnabledConnectionsConnectionIdEnabledPut = (options) => {
  return (options?.client ?? client).put({
    ...options,
    url: "/connections/{connection_id}/enabled"
  });
};
var updateConnectionConnectionsConnectionIdPut = (options) => {
  return (options?.client ?? client).put({
    ...options,
    url: "/connections/{connection_id}"
  });
};
var getConnectionStatsConnectionsConnectionIdStatsGet = (options) => {
  return (options?.client ?? client).get({
    ...options,
    url: "/connections/{connection_id}/stats"
  });
};
var deleteConnectionConnectionsConnectionIdDeletePost = (options) => {
  return (options?.client ?? client).post({
    ...options,
    url: "/connections/{connection_id}/delete"
  });
};

// src/client/service-comments.ts
var comments = {
  createDocument: {
    comment: "Create Document",
    doc: "Create Document\n  On ingest, the document goes through a series of steps before it is ready for retrieval. Each step is reflected in the status of the document which can be one of [`pending`, `partitioning`, `partitioned`, `refined`, `chunked`, `indexed`, `summary_indexed`, `ready`, `failed`]. The document is available for retrieval once it is in ready state. The summary index step can take a few seconds. You can optionally use the document for retrieval once it is in `indexed` state. However the summary will only be available once the state has changed to `summary_indexed` or `ready`."
  },
  listDocuments: {
    comment: "List Documents",
    doc: "List Documents\n  List all documents sorted by created_at in descending order. Results are paginated with a max limit of 100. When more documents are available, a `cursor` will be provided. Use the `cursor` parameter to retrieve the subsequent page."
  },
  createDocumentRaw: {
    comment: "Create Document Raw",
    doc: "Create Document Raw\n  Ingest a document as raw text. On ingest, the document goes through a series of steps before it is ready for retrieval. Each step is reflected in the status of the document which can be one of [`pending`, `partitioning`, `partitioned`, `refined`, `chunked`, `indexed`, `summary_indexed`, `ready`, `failed`]. The document is available for retrieval once it is in ready state. The summary index step can take a few seconds. You can optionally use the document for retrieval once it is in `indexed` state. However the summary will only be available once the state has changed to `summary_indexed` or `ready`."
  },
  createDocumentFromUrl: {
    comment: "Create Document From Url",
    doc: "Create Document From Url"
  },
  getDocument: {
    comment: "Get Document",
    doc: "Get Document"
  },
  deleteDocument: {
    comment: "Delete Document",
    doc: "Delete Document"
  },
  updateDocumentFile: {
    comment: "Update Document File",
    doc: "Update Document File"
  },
  updateDocumentRaw: {
    comment: "Update Document Raw",
    doc: "Update Document Raw"
  },
  patchDocumentMetadata: {
    comment: "Patch Document Metadata",
    doc: "Patch Document Metadata"
  },
  retrieve: {
    comment: "Retrieve",
    doc: "Retrieve"
  },
  getDocumentSummary: {
    comment: "Get Document Summary",
    doc: "Get Document Summary\n  Get a LLM generated summary of the document. The summary is created when the document is first created or updated. Documents of types ['xls', 'xlsx', 'csv', 'json'] are not supported for summarization. Documents greater than 1M in token length are not supported. This feature is in beta and may change in the future."
  },
  listInstructions: {
    comment: "List Instructions",
    doc: "List Instructions\n  List all instructions."
  },
  createInstruction: {
    comment: "Create Instruction",
    doc: "Create Instruction\n  Create a new instruction. Instructions are applied to documents as they are created or updated. The results of the instruction are stored as structured data in the schema defined by the `entity_schema` parameter. The `prompt` parameter is a natural language instruction which will be applied to documents. This feature is in beta and may change in the future."
  },
  updateInstruction: {
    comment: "Update Instruction",
    doc: "Update Instruction"
  },
  listEntitiesByInstruction: {
    comment: "Get Instruction Extracted Entities",
    doc: "Get Instruction Extracted Entities"
  },
  listEntitiesByDocument: {
    comment: "Get Document Extracted Entities",
    doc: "Get Document Extracted Entities"
  },
  listConnectionsConnectionsGet: {
    comment: "List Connections",
    doc: "List Connections\n  List all connections sorted by created_at in descending order. Results are paginated with a max limit of 100. When more documents are available, a `cursor` will be provided. Use the `cursor` parameter to retrieve the subsequent page."
  },
  setConnectionEnabledConnectionsConnectionIdEnabledPut: {
    comment: "Set Connection Enabled",
    doc: "Set Connection Enabled\n  Enable or disable the connection. A disabled connection won't sync."
  },
  updateConnectionConnectionsConnectionIdPut: {
    comment: "Update Connection",
    doc: "Update Connection\n  Updates a connections metadata or mode. These changes will be seen after the next sync."
  },
  getConnectionStatsConnectionsConnectionIdStatsGet: {
    comment: "Get Connection Stats",
    doc: "Get Connection Stats\n  Lists connection stats: total documents synced."
  },
  deleteConnectionConnectionsConnectionIdDeletePost: {
    comment: "Delete Connection",
    doc: "Delete Connection\n  Schedules a connection to be deleted. You can choose to keep the files from the connection or delete them all. If you keep the files, they will no longer be associated to the connection. Deleting can take some time, so you will still see files for a bit after this is called."
  }
};

// src/client/zodSchema.ts
var zodSchema_exports = {};
__export(zodSchema_exports, {
  connectionBaseSchema: () => connectionBaseSchema,
  connectionListSchema: () => connectionListSchema,
  connectionSchema: () => connectionSchema,
  connectionStatsSchema: () => connectionStatsSchema,
  connectionSyncFinishedWebhookPayloadSchema: () => connectionSyncFinishedWebhookPayloadSchema,
  connectionSyncFinishedWebhookSchema: () => connectionSyncFinishedWebhookSchema,
  connectionSyncProgressWebhookPayloadSchema: () => connectionSyncProgressWebhookPayloadSchema,
  connectionSyncProgressWebhookSchema: () => connectionSyncProgressWebhookSchema,
  connectionSyncStartedWebhookPayloadSchema: () => connectionSyncStartedWebhookPayloadSchema,
  connectionSyncStartedWebhookSchema: () => connectionSyncStartedWebhookSchema,
  createDocumentErrorSchema: () => createDocumentErrorSchema,
  createDocumentFromUrlDataSchema: () => createDocumentFromUrlDataSchema,
  createDocumentFromUrlErrorSchema: () => createDocumentFromUrlErrorSchema,
  createDocumentFromUrlParamsSchema: () => createDocumentFromUrlParamsSchema,
  createDocumentFromUrlResponseSchema: () => createDocumentFromUrlResponseSchema,
  createDocumentRawDataSchema: () => createDocumentRawDataSchema,
  createDocumentRawErrorSchema: () => createDocumentRawErrorSchema,
  createDocumentRawParamsSchema: () => createDocumentRawParamsSchema,
  createDocumentRawResponseSchema: () => createDocumentRawResponseSchema,
  createDocumentResponseSchema: () => createDocumentResponseSchema,
  createInstructionDataSchema: () => createInstructionDataSchema,
  createInstructionErrorSchema: () => createInstructionErrorSchema,
  createInstructionParamsSchema: () => createInstructionParamsSchema,
  createInstructionResponseSchema: () => createInstructionResponseSchema,
  deleteConnectionConnectionsConnectionIdDeletePostDataSchema: () => deleteConnectionConnectionsConnectionIdDeletePostDataSchema,
  deleteConnectionConnectionsConnectionIdDeletePostErrorSchema: () => deleteConnectionConnectionsConnectionIdDeletePostErrorSchema,
  deleteConnectionConnectionsConnectionIdDeletePostResponseSchema: () => deleteConnectionConnectionsConnectionIdDeletePostResponseSchema,
  deleteConnectionPayloadSchema: () => deleteConnectionPayloadSchema,
  deleteDocumentDataSchema: () => deleteDocumentDataSchema,
  deleteDocumentErrorSchema: () => deleteDocumentErrorSchema,
  deleteDocumentResponseSchema: () => deleteDocumentResponseSchema,
  documentDeleteSchema: () => documentDeleteSchema,
  documentDeleteWebhookPayloadSchema: () => documentDeleteWebhookPayloadSchema,
  documentDeleteWebhookSchema: () => documentDeleteWebhookSchema,
  documentFileUpdateSchema: () => documentFileUpdateSchema,
  documentGetSchema: () => documentGetSchema,
  documentListSchema: () => documentListSchema,
  documentMetadataSchema: () => documentMetadataSchema,
  documentMetadataUpdateSchema: () => documentMetadataUpdateSchema,
  documentRawUpdateSchema: () => documentRawUpdateSchema,
  documentSchema: () => documentSchema,
  documentSummarySchema: () => documentSummarySchema,
  documentUpdateWebhookPayloadSchema: () => documentUpdateWebhookPayloadSchema,
  documentUpdateWebhookSchema: () => documentUpdateWebhookSchema,
  entityDataSchema: () => entityDataSchema,
  entityExtractedWebhookPayloadSchema: () => entityExtractedWebhookPayloadSchema,
  entityExtractedWebhookSchema: () => entityExtractedWebhookSchema,
  entityListSchema: () => entityListSchema,
  entitySchema: () => entitySchema,
  entitySchemaTypeSchema: () => entitySchemaTypeSchema,
  errorMessageSchema: () => errorMessageSchema,
  getConnectionStatsConnectionsConnectionIdStatsGetDataSchema: () => getConnectionStatsConnectionsConnectionIdStatsGetDataSchema,
  getConnectionStatsConnectionsConnectionIdStatsGetErrorSchema: () => getConnectionStatsConnectionsConnectionIdStatsGetErrorSchema,
  getConnectionStatsConnectionsConnectionIdStatsGetResponseSchema: () => getConnectionStatsConnectionsConnectionIdStatsGetResponseSchema,
  getDocumentDataSchema: () => getDocumentDataSchema,
  getDocumentErrorSchema: () => getDocumentErrorSchema,
  getDocumentResponseSchema: () => getDocumentResponseSchema,
  getDocumentSummaryDataSchema: () => getDocumentSummaryDataSchema,
  getDocumentSummaryErrorSchema: () => getDocumentSummaryErrorSchema,
  getDocumentSummaryResponseSchema: () => getDocumentSummaryResponseSchema,
  hTTPValidationErrorSchema: () => hTTPValidationErrorSchema,
  instructionSchema: () => instructionSchema,
  listConnectionsConnectionsGetDataSchema: () => listConnectionsConnectionsGetDataSchema,
  listConnectionsConnectionsGetErrorSchema: () => listConnectionsConnectionsGetErrorSchema,
  listConnectionsConnectionsGetResponseSchema: () => listConnectionsConnectionsGetResponseSchema,
  listDocumentsDataSchema: () => listDocumentsDataSchema,
  listDocumentsErrorSchema: () => listDocumentsErrorSchema,
  listDocumentsResponseSchema: () => listDocumentsResponseSchema,
  listEntitiesByDocumentDataSchema: () => listEntitiesByDocumentDataSchema,
  listEntitiesByDocumentErrorSchema: () => listEntitiesByDocumentErrorSchema,
  listEntitiesByDocumentResponseSchema: () => listEntitiesByDocumentResponseSchema,
  listEntitiesByInstructionDataSchema: () => listEntitiesByInstructionDataSchema,
  listEntitiesByInstructionErrorSchema: () => listEntitiesByInstructionErrorSchema,
  listEntitiesByInstructionResponseSchema: () => listEntitiesByInstructionResponseSchema,
  listInstructionsErrorSchema: () => listInstructionsErrorSchema,
  listInstructionsResponseSchema: () => listInstructionsResponseSchema,
  metadataFilterSchema: () => metadataFilterSchema,
  modeSchema: () => modeSchema,
  paginationSchema: () => paginationSchema,
  partitionStrategySchema: () => partitionStrategySchema,
  patchDocumentMetadataDataSchema: () => patchDocumentMetadataDataSchema,
  patchDocumentMetadataErrorSchema: () => patchDocumentMetadataErrorSchema,
  patchDocumentMetadataParamsSchema: () => patchDocumentMetadataParamsSchema,
  patchDocumentMetadataResponseSchema: () => patchDocumentMetadataResponseSchema,
  retrievalSchema: () => retrievalSchema,
  retrieveDataSchema: () => retrieveDataSchema,
  retrieveErrorSchema: () => retrieveErrorSchema,
  retrieveParamsSchema: () => retrieveParamsSchema,
  retrieveResponseSchema: () => retrieveResponseSchema,
  scopeSchema: () => scopeSchema,
  scoredChunkSchema: () => scoredChunkSchema,
  setConnectionEnabledConnectionsConnectionIdEnabledPutDataSchema: () => setConnectionEnabledConnectionsConnectionIdEnabledPutDataSchema,
  setConnectionEnabledConnectionsConnectionIdEnabledPutErrorSchema: () => setConnectionEnabledConnectionsConnectionIdEnabledPutErrorSchema,
  setConnectionEnabledConnectionsConnectionIdEnabledPutResponseSchema: () => setConnectionEnabledConnectionsConnectionIdEnabledPutResponseSchema,
  setConnectionEnabledPayloadSchema: () => setConnectionEnabledPayloadSchema,
  type2Schema: () => type2Schema,
  type3Schema: () => type3Schema,
  type4Schema: () => type4Schema,
  type5Schema: () => type5Schema,
  type6Schema: () => type6Schema,
  typeSchema: () => typeSchema,
  updateConnectionConnectionsConnectionIdPutDataSchema: () => updateConnectionConnectionsConnectionIdPutDataSchema,
  updateConnectionConnectionsConnectionIdPutErrorSchema: () => updateConnectionConnectionsConnectionIdPutErrorSchema,
  updateConnectionConnectionsConnectionIdPutResponseSchema: () => updateConnectionConnectionsConnectionIdPutResponseSchema,
  updateDocumentFileErrorSchema: () => updateDocumentFileErrorSchema,
  updateDocumentFileResponseSchema: () => updateDocumentFileResponseSchema,
  updateDocumentRawDataSchema: () => updateDocumentRawDataSchema,
  updateDocumentRawErrorSchema: () => updateDocumentRawErrorSchema,
  updateDocumentRawParamsSchema: () => updateDocumentRawParamsSchema,
  updateDocumentRawResponseSchema: () => updateDocumentRawResponseSchema,
  updateInstructionDataSchema: () => updateInstructionDataSchema,
  updateInstructionErrorSchema: () => updateInstructionErrorSchema,
  updateInstructionParamsSchema: () => updateInstructionParamsSchema,
  updateInstructionResponseSchema: () => updateInstructionResponseSchema,
  validationErrorSchema: () => validationErrorSchema
});
var modeSchema = zod.z.union([zod.z.literal("hi_res"), zod.z.literal("fast")]);
var connectionSchema = zod.z.object({
  id: zod.z.string(),
  created_at: zod.z.string(),
  updated_at: zod.z.string(),
  metadata: zod.z.record(zod.z.unknown()),
  type: zod.z.string(),
  name: zod.z.string(),
  enabled: zod.z.boolean(),
  last_synced_at: zod.z.string().optional().nullable(),
  syncing: zod.z.boolean().optional().nullable()
});
var connectionBaseSchema = zod.z.object({
  partition_strategy: zod.z.union([zod.z.literal("hi_res"), zod.z.literal("fast")]),
  metadata: zod.z.record(zod.z.union([zod.z.string(), zod.z.number(), zod.z.boolean(), zod.z.array(zod.z.string())])).optional()
});
var partitionStrategySchema = zod.z.union([zod.z.literal("hi_res"), zod.z.literal("fast")]);
var paginationSchema = zod.z.object({
  next_cursor: zod.z.string().optional().nullable()
});
var connectionStatsSchema = zod.z.object({
  document_count: zod.z.number()
});
var connectionSyncFinishedWebhookPayloadSchema = zod.z.object({
  connection_id: zod.z.string(),
  sync_id: zod.z.string(),
  partition: zod.z.string(),
  connection_metadata: zod.z.record(zod.z.unknown())
});
var typeSchema = zod.z.literal("connection_sync_finished");
var connectionSyncProgressWebhookPayloadSchema = zod.z.object({
  connection_id: zod.z.string(),
  sync_id: zod.z.string(),
  partition: zod.z.string(),
  connection_metadata: zod.z.record(zod.z.unknown()),
  create_count: zod.z.number(),
  created_count: zod.z.number(),
  update_content_count: zod.z.number(),
  updated_content_count: zod.z.number(),
  update_metadata_count: zod.z.number(),
  updated_metadata_count: zod.z.number(),
  delete_count: zod.z.number(),
  deleted_count: zod.z.number(),
  errored_count: zod.z.number()
});
var type2Schema = zod.z.literal("connection_sync_progress");
var connectionSyncStartedWebhookPayloadSchema = zod.z.object({
  connection_id: zod.z.string(),
  sync_id: zod.z.string(),
  partition: zod.z.string(),
  connection_metadata: zod.z.record(zod.z.unknown()),
  create_count: zod.z.number(),
  update_content_count: zod.z.number(),
  update_metadata_count: zod.z.number(),
  delete_count: zod.z.number()
});
var type3Schema = zod.z.literal("connection_sync_started");
var createDocumentFromUrlParamsSchema = zod.z.object({
  metadata: zod.z.record(zod.z.union([zod.z.string(), zod.z.number(), zod.z.boolean(), zod.z.array(zod.z.string())])).optional(),
  mode: zod.z.union([zod.z.literal("hi_res"), zod.z.literal("fast")]).optional(),
  name: zod.z.string().optional(),
  external_id: zod.z.string().optional(),
  url: zod.z.string(),
  partition: zod.z.string().optional()
});
var createDocumentRawParamsSchema = zod.z.object({
  metadata: zod.z.record(zod.z.union([zod.z.string(), zod.z.number(), zod.z.boolean(), zod.z.array(zod.z.string())])).optional(),
  name: zod.z.string().optional(),
  data: zod.z.union([zod.z.string(), zod.z.record(zod.z.unknown())]),
  partition: zod.z.string().optional()
});
var entitySchemaTypeSchema = zod.z.record(zod.z.unknown());
var scopeSchema = zod.z.union([zod.z.literal("document"), zod.z.literal("chunk")]);
var deleteConnectionPayloadSchema = zod.z.object({
  keep_files: zod.z.boolean()
});
var documentSchema = zod.z.object({
  id: zod.z.string(),
  created_at: zod.z.string(),
  updated_at: zod.z.string(),
  status: zod.z.string(),
  name: zod.z.string(),
  metadata: zod.z.record(zod.z.union([zod.z.string(), zod.z.number(), zod.z.boolean(), zod.z.array(zod.z.string())])),
  partition: zod.z.string(),
  chunk_count: zod.z.number().optional().nullable(),
  external_id: zod.z.string().optional().nullable()
});
var documentDeleteSchema = zod.z.object({
  status: zod.z.string()
});
var documentDeleteWebhookPayloadSchema = zod.z.object({
  document_id: zod.z.string(),
  partition: zod.z.string(),
  metadata: zod.z.record(zod.z.unknown()),
  external_id: zod.z.string().nullable(),
  sync_id: zod.z.string().nullable()
});
var type4Schema = zod.z.literal("document_deleted");
var documentFileUpdateSchema = zod.z.object({
  status: zod.z.string()
});
var documentGetSchema = zod.z.object({
  id: zod.z.string(),
  created_at: zod.z.string(),
  updated_at: zod.z.string(),
  status: zod.z.string(),
  name: zod.z.string(),
  metadata: zod.z.record(zod.z.union([zod.z.string(), zod.z.number(), zod.z.boolean(), zod.z.array(zod.z.string())])),
  partition: zod.z.string(),
  chunk_count: zod.z.number().optional().nullable(),
  external_id: zod.z.string().optional().nullable(),
  errors: zod.z.array(zod.z.string())
});
var documentListSchema = zod.z.object({
  pagination: paginationSchema,
  documents: zod.z.array(documentSchema)
});
var documentMetadataSchema = zod.z.record(zod.z.unknown());
var documentMetadataUpdateSchema = zod.z.object({
  metadata: zod.z.record(zod.z.union([zod.z.string(), zod.z.number(), zod.z.boolean(), zod.z.array(zod.z.string())]))
});
var documentRawUpdateSchema = zod.z.object({
  status: zod.z.string()
});
var documentSummarySchema = zod.z.object({
  document_id: zod.z.string(),
  summary: zod.z.string()
});
var documentUpdateWebhookPayloadSchema = zod.z.object({
  document_id: zod.z.string(),
  status: zod.z.union([zod.z.literal("ready"), zod.z.literal("failed")]),
  partition: zod.z.string(),
  metadata: zod.z.record(zod.z.unknown()),
  external_id: zod.z.string().nullable(),
  sync_id: zod.z.string().nullable()
});
var type5Schema = zod.z.literal("document_status_updated");
var entityDataSchema = zod.z.record(zod.z.unknown());
var entityExtractedWebhookPayloadSchema = zod.z.object({
  entity_id: zod.z.string(),
  document_id: zod.z.string(),
  instruction_id: zod.z.string(),
  document_metadata: zod.z.record(zod.z.unknown()),
  document_external_id: zod.z.string().nullable(),
  partition: zod.z.string(),
  sync_id: zod.z.string().nullable(),
  data: zod.z.record(zod.z.unknown())
});
var type6Schema = zod.z.literal("entity_extracted");
var entitySchema = zod.z.object({
  id: zod.z.string(),
  created_at: zod.z.string(),
  updated_at: zod.z.string(),
  instruction_id: zod.z.string(),
  document_id: zod.z.string(),
  data: entityDataSchema
});
var errorMessageSchema = zod.z.object({
  detail: zod.z.string()
});
var validationErrorSchema = zod.z.object({
  loc: zod.z.array(zod.z.union([zod.z.string(), zod.z.number()])),
  msg: zod.z.string(),
  type: zod.z.string()
});
var instructionSchema = zod.z.object({
  id: zod.z.string(),
  created_at: zod.z.string(),
  updated_at: zod.z.string(),
  name: zod.z.string(),
  active: zod.z.boolean().optional(),
  scope: zod.z.union([zod.z.literal("document"), zod.z.literal("chunk")]).optional(),
  prompt: zod.z.string(),
  entity_schema: entitySchemaTypeSchema,
  filter: zod.z.record(zod.z.unknown()).optional(),
  partition: zod.z.string().optional()
});
var metadataFilterSchema = zod.z.record(zod.z.unknown());
var patchDocumentMetadataParamsSchema = zod.z.object({
  metadata: zod.z.record(zod.z.union([zod.z.string(), zod.z.number(), zod.z.boolean(), zod.z.array(zod.z.string())]).nullable())
});
var scoredChunkSchema = zod.z.object({
  text: zod.z.string(),
  score: zod.z.number(),
  document_id: zod.z.string(),
  document_name: zod.z.string(),
  document_metadata: documentMetadataSchema
});
var retrieveParamsSchema = zod.z.object({
  query: zod.z.string(),
  top_k: zod.z.number().optional(),
  filter: metadataFilterSchema.optional(),
  rerank: zod.z.boolean().optional(),
  max_chunks_per_document: zod.z.number().optional(),
  partition: zod.z.string().optional()
});
var setConnectionEnabledPayloadSchema = zod.z.object({
  enabled: zod.z.boolean()
});
var updateDocumentRawParamsSchema = zod.z.object({
  data: zod.z.union([zod.z.string(), zod.z.record(zod.z.unknown())])
});
var updateInstructionParamsSchema = zod.z.object({
  active: zod.z.boolean()
});
var createDocumentResponseSchema = documentSchema;
var hTTPValidationErrorSchema = zod.z.object({
  detail: zod.z.array(validationErrorSchema).optional()
});
var listDocumentsDataSchema = zod.z.object({
  headers: zod.z.object({
    partition: zod.z.string().optional().nullable()
  }).optional(),
  query: zod.z.object({
    cursor: zod.z.string().optional().nullable(),
    filter: zod.z.string().optional().nullable(),
    page_size: zod.z.number().optional()
  }).optional()
});
var listDocumentsResponseSchema = documentListSchema;
var listDocumentsErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var createDocumentRawDataSchema = zod.z.object({
  body: createDocumentRawParamsSchema
});
var createDocumentRawResponseSchema = documentSchema;
var createDocumentRawErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var createDocumentFromUrlDataSchema = zod.z.object({
  body: createDocumentFromUrlParamsSchema
});
var createDocumentFromUrlResponseSchema = documentSchema;
var createDocumentFromUrlErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var getDocumentDataSchema = zod.z.object({
  path: zod.z.object({
    document_id: zod.z.string()
  })
});
var getDocumentResponseSchema = documentGetSchema;
var getDocumentErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var deleteDocumentDataSchema = zod.z.object({
  path: zod.z.object({
    document_id: zod.z.string()
  })
});
var deleteDocumentResponseSchema = documentDeleteSchema;
var deleteDocumentErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var updateDocumentFileResponseSchema = documentFileUpdateSchema;
var updateDocumentFileErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var updateDocumentRawDataSchema = zod.z.object({
  body: updateDocumentRawParamsSchema,
  path: zod.z.object({
    document_id: zod.z.string()
  })
});
var updateDocumentRawResponseSchema = documentRawUpdateSchema;
var updateDocumentRawErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var patchDocumentMetadataDataSchema = zod.z.object({
  body: patchDocumentMetadataParamsSchema,
  path: zod.z.object({
    document_id: zod.z.string()
  })
});
var patchDocumentMetadataResponseSchema = documentMetadataUpdateSchema;
var patchDocumentMetadataErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var retrieveDataSchema = zod.z.object({
  body: retrieveParamsSchema
});
var retrievalSchema = zod.z.object({
  scored_chunks: zod.z.array(scoredChunkSchema)
});
var retrieveErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var getDocumentSummaryDataSchema = zod.z.object({
  path: zod.z.object({
    document_id: zod.z.string()
  })
});
var getDocumentSummaryResponseSchema = documentSummarySchema;
var getDocumentSummaryErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var listInstructionsResponseSchema = zod.z.array(instructionSchema);
var listInstructionsErrorSchema = errorMessageSchema;
var createInstructionParamsSchema = zod.z.object({
  name: zod.z.string(),
  active: zod.z.boolean().optional(),
  scope: zod.z.union([zod.z.literal("document"), zod.z.literal("chunk")]).optional(),
  prompt: zod.z.string(),
  entity_schema: entitySchemaTypeSchema,
  filter: zod.z.record(zod.z.unknown()).optional(),
  partition: zod.z.string().optional()
});
var createInstructionResponseSchema = instructionSchema;
var createInstructionErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var updateInstructionDataSchema = zod.z.object({
  body: updateInstructionParamsSchema,
  path: zod.z.object({
    instruction_id: zod.z.string()
  })
});
var updateInstructionResponseSchema = instructionSchema;
var updateInstructionErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var listEntitiesByInstructionDataSchema = zod.z.object({
  path: zod.z.object({
    instruction_id: zod.z.string()
  }),
  query: zod.z.object({
    cursor: zod.z.string().optional().nullable(),
    page_size: zod.z.number().optional()
  }).optional()
});
var entityListSchema = zod.z.object({
  pagination: paginationSchema,
  entities: zod.z.array(entitySchema)
});
var listEntitiesByInstructionErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var listEntitiesByDocumentDataSchema = zod.z.object({
  path: zod.z.object({
    document_id: zod.z.string()
  }),
  query: zod.z.object({
    cursor: zod.z.string().optional().nullable(),
    page_size: zod.z.number().optional()
  }).optional()
});
var listEntitiesByDocumentResponseSchema = entityListSchema;
var listEntitiesByDocumentErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var listConnectionsConnectionsGetDataSchema = zod.z.object({
  query: zod.z.object({
    cursor: zod.z.string().optional().nullable(),
    page_size: zod.z.number().optional()
  }).optional()
});
var connectionListSchema = zod.z.object({
  pagination: paginationSchema,
  connections: zod.z.array(connectionSchema)
});
var listConnectionsConnectionsGetErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var setConnectionEnabledConnectionsConnectionIdEnabledPutDataSchema = zod.z.object({
  body: setConnectionEnabledPayloadSchema,
  path: zod.z.object({
    connection_id: zod.z.string()
  })
});
var setConnectionEnabledConnectionsConnectionIdEnabledPutResponseSchema = connectionSchema;
var setConnectionEnabledConnectionsConnectionIdEnabledPutErrorSchema = zod.z.union([
  errorMessageSchema,
  hTTPValidationErrorSchema
]);
var updateConnectionConnectionsConnectionIdPutDataSchema = zod.z.object({
  body: connectionBaseSchema,
  path: zod.z.object({
    connection_id: zod.z.string()
  })
});
var updateConnectionConnectionsConnectionIdPutResponseSchema = connectionSchema;
var updateConnectionConnectionsConnectionIdPutErrorSchema = zod.z.union([
  errorMessageSchema,
  hTTPValidationErrorSchema
]);
var getConnectionStatsConnectionsConnectionIdStatsGetDataSchema = zod.z.object({
  path: zod.z.object({
    connection_id: zod.z.string()
  })
});
var getConnectionStatsConnectionsConnectionIdStatsGetResponseSchema = connectionStatsSchema;
var getConnectionStatsConnectionsConnectionIdStatsGetErrorSchema = zod.z.union([
  errorMessageSchema,
  hTTPValidationErrorSchema
]);
var deleteConnectionConnectionsConnectionIdDeletePostDataSchema = zod.z.object({
  body: deleteConnectionPayloadSchema,
  path: zod.z.object({
    connection_id: zod.z.string()
  })
});
var deleteConnectionConnectionsConnectionIdDeletePostResponseSchema = zod.z.record(zod.z.string());
var deleteConnectionConnectionsConnectionIdDeletePostErrorSchema = zod.z.union([
  errorMessageSchema,
  hTTPValidationErrorSchema
]);
var connectionSyncFinishedWebhookSchema = zod.z.object({
  nonce: zod.z.string(),
  type: zod.z.literal("connection_sync_finished"),
  payload: connectionSyncFinishedWebhookPayloadSchema
});
var connectionSyncProgressWebhookSchema = zod.z.object({
  nonce: zod.z.string(),
  type: zod.z.literal("connection_sync_progress"),
  payload: connectionSyncProgressWebhookPayloadSchema
});
var connectionSyncStartedWebhookSchema = zod.z.object({
  nonce: zod.z.string(),
  type: zod.z.literal("connection_sync_started"),
  payload: connectionSyncStartedWebhookPayloadSchema
});
var documentDeleteWebhookSchema = zod.z.object({
  nonce: zod.z.string(),
  type: zod.z.literal("document_deleted"),
  payload: documentDeleteWebhookPayloadSchema
});
var documentUpdateWebhookSchema = zod.z.object({
  nonce: zod.z.string(),
  type: zod.z.literal("document_status_updated"),
  payload: documentUpdateWebhookPayloadSchema
});
var entityExtractedWebhookSchema = zod.z.object({
  nonce: zod.z.string(),
  type: zod.z.literal("entity_extracted"),
  payload: entityExtractedWebhookPayloadSchema
});
var createDocumentErrorSchema = zod.z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var retrieveResponseSchema = retrievalSchema;
var createInstructionDataSchema = zod.z.object({
  body: createInstructionParamsSchema
});
var listEntitiesByInstructionResponseSchema = entityListSchema;
var listConnectionsConnectionsGetResponseSchema = connectionListSchema;

// src/toolset.ts
var RagieToolset = class extends core.OpenAPIToolset {
  name = "RAGIE";
  logoUrl = ragie_default;
  config;
  tools;
  categories = ["ai"];
  description = "Ragie is an AI assistant that helps you find information and answer questions.";
  constructor({ config }) {
    super();
    this.config = config;
    this.tools = this._generateIntegrationTools();
  }
  get toolSchemas() {
    return zodSchema_exports;
  }
  get toolDocumentations() {
    return comments;
  }
  get baseClient() {
    client.setConfig({
      baseUrl: `https://api.ragie.ai`
    });
    return services_gen_exports;
  }
  getApiClient = async () => {
    return services_gen_exports;
  };
};

// src/index.ts
var RagieIntegration = class extends core.Integration {
  name = "RAGIE";
  logoUrl = ragie_default;
  config;
  categories = ["ai"];
  description = "Ragie is an AI assistant that helps you find information and answer questions.";
  constructor({ config }) {
    super();
    this.config = config;
  }
  getStaticTools() {
    const openapi = new RagieToolset({
      config: this.config
    });
    return openapi.tools;
  }
};

exports.RagieIntegration = RagieIntegration;
