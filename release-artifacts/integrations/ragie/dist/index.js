import { Integration, OpenAPIToolset } from '@mastra/core';
import { createClient, createConfig, formDataBodySerializer } from '@hey-api/client-fetch';
import { z } from 'zod';

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/assets/ragie.png
var ragie_default = "./ragie-SD2LWOMK.png";

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
var client = createClient(createConfig());
var createDocument = (options) => {
  return (options?.client ?? client).post({
    ...options,
    ...formDataBodySerializer,
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
    ...formDataBodySerializer,
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
var modeSchema = z.union([z.literal("hi_res"), z.literal("fast")]);
var connectionSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  metadata: z.record(z.unknown()),
  type: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  last_synced_at: z.string().optional().nullable(),
  syncing: z.boolean().optional().nullable()
});
var connectionBaseSchema = z.object({
  partition_strategy: z.union([z.literal("hi_res"), z.literal("fast")]),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional()
});
var partitionStrategySchema = z.union([z.literal("hi_res"), z.literal("fast")]);
var paginationSchema = z.object({
  next_cursor: z.string().optional().nullable()
});
var connectionStatsSchema = z.object({
  document_count: z.number()
});
var connectionSyncFinishedWebhookPayloadSchema = z.object({
  connection_id: z.string(),
  sync_id: z.string(),
  partition: z.string(),
  connection_metadata: z.record(z.unknown())
});
var typeSchema = z.literal("connection_sync_finished");
var connectionSyncProgressWebhookPayloadSchema = z.object({
  connection_id: z.string(),
  sync_id: z.string(),
  partition: z.string(),
  connection_metadata: z.record(z.unknown()),
  create_count: z.number(),
  created_count: z.number(),
  update_content_count: z.number(),
  updated_content_count: z.number(),
  update_metadata_count: z.number(),
  updated_metadata_count: z.number(),
  delete_count: z.number(),
  deleted_count: z.number(),
  errored_count: z.number()
});
var type2Schema = z.literal("connection_sync_progress");
var connectionSyncStartedWebhookPayloadSchema = z.object({
  connection_id: z.string(),
  sync_id: z.string(),
  partition: z.string(),
  connection_metadata: z.record(z.unknown()),
  create_count: z.number(),
  update_content_count: z.number(),
  update_metadata_count: z.number(),
  delete_count: z.number()
});
var type3Schema = z.literal("connection_sync_started");
var createDocumentFromUrlParamsSchema = z.object({
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  mode: z.union([z.literal("hi_res"), z.literal("fast")]).optional(),
  name: z.string().optional(),
  external_id: z.string().optional(),
  url: z.string(),
  partition: z.string().optional()
});
var createDocumentRawParamsSchema = z.object({
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  name: z.string().optional(),
  data: z.union([z.string(), z.record(z.unknown())]),
  partition: z.string().optional()
});
var entitySchemaTypeSchema = z.record(z.unknown());
var scopeSchema = z.union([z.literal("document"), z.literal("chunk")]);
var deleteConnectionPayloadSchema = z.object({
  keep_files: z.boolean()
});
var documentSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.string(),
  name: z.string(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
  partition: z.string(),
  chunk_count: z.number().optional().nullable(),
  external_id: z.string().optional().nullable()
});
var documentDeleteSchema = z.object({
  status: z.string()
});
var documentDeleteWebhookPayloadSchema = z.object({
  document_id: z.string(),
  partition: z.string(),
  metadata: z.record(z.unknown()),
  external_id: z.string().nullable(),
  sync_id: z.string().nullable()
});
var type4Schema = z.literal("document_deleted");
var documentFileUpdateSchema = z.object({
  status: z.string()
});
var documentGetSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.string(),
  name: z.string(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
  partition: z.string(),
  chunk_count: z.number().optional().nullable(),
  external_id: z.string().optional().nullable(),
  errors: z.array(z.string())
});
var documentListSchema = z.object({
  pagination: paginationSchema,
  documents: z.array(documentSchema)
});
var documentMetadataSchema = z.record(z.unknown());
var documentMetadataUpdateSchema = z.object({
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]))
});
var documentRawUpdateSchema = z.object({
  status: z.string()
});
var documentSummarySchema = z.object({
  document_id: z.string(),
  summary: z.string()
});
var documentUpdateWebhookPayloadSchema = z.object({
  document_id: z.string(),
  status: z.union([z.literal("ready"), z.literal("failed")]),
  partition: z.string(),
  metadata: z.record(z.unknown()),
  external_id: z.string().nullable(),
  sync_id: z.string().nullable()
});
var type5Schema = z.literal("document_status_updated");
var entityDataSchema = z.record(z.unknown());
var entityExtractedWebhookPayloadSchema = z.object({
  entity_id: z.string(),
  document_id: z.string(),
  instruction_id: z.string(),
  document_metadata: z.record(z.unknown()),
  document_external_id: z.string().nullable(),
  partition: z.string(),
  sync_id: z.string().nullable(),
  data: z.record(z.unknown())
});
var type6Schema = z.literal("entity_extracted");
var entitySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  instruction_id: z.string(),
  document_id: z.string(),
  data: entityDataSchema
});
var errorMessageSchema = z.object({
  detail: z.string()
});
var validationErrorSchema = z.object({
  loc: z.array(z.union([z.string(), z.number()])),
  msg: z.string(),
  type: z.string()
});
var instructionSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  active: z.boolean().optional(),
  scope: z.union([z.literal("document"), z.literal("chunk")]).optional(),
  prompt: z.string(),
  entity_schema: entitySchemaTypeSchema,
  filter: z.record(z.unknown()).optional(),
  partition: z.string().optional()
});
var metadataFilterSchema = z.record(z.unknown());
var patchDocumentMetadataParamsSchema = z.object({
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable())
});
var scoredChunkSchema = z.object({
  text: z.string(),
  score: z.number(),
  document_id: z.string(),
  document_name: z.string(),
  document_metadata: documentMetadataSchema
});
var retrieveParamsSchema = z.object({
  query: z.string(),
  top_k: z.number().optional(),
  filter: metadataFilterSchema.optional(),
  rerank: z.boolean().optional(),
  max_chunks_per_document: z.number().optional(),
  partition: z.string().optional()
});
var setConnectionEnabledPayloadSchema = z.object({
  enabled: z.boolean()
});
var updateDocumentRawParamsSchema = z.object({
  data: z.union([z.string(), z.record(z.unknown())])
});
var updateInstructionParamsSchema = z.object({
  active: z.boolean()
});
var createDocumentResponseSchema = documentSchema;
var hTTPValidationErrorSchema = z.object({
  detail: z.array(validationErrorSchema).optional()
});
var listDocumentsDataSchema = z.object({
  headers: z.object({
    partition: z.string().optional().nullable()
  }).optional(),
  query: z.object({
    cursor: z.string().optional().nullable(),
    filter: z.string().optional().nullable(),
    page_size: z.number().optional()
  }).optional()
});
var listDocumentsResponseSchema = documentListSchema;
var listDocumentsErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var createDocumentRawDataSchema = z.object({
  body: createDocumentRawParamsSchema
});
var createDocumentRawResponseSchema = documentSchema;
var createDocumentRawErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var createDocumentFromUrlDataSchema = z.object({
  body: createDocumentFromUrlParamsSchema
});
var createDocumentFromUrlResponseSchema = documentSchema;
var createDocumentFromUrlErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var getDocumentDataSchema = z.object({
  path: z.object({
    document_id: z.string()
  })
});
var getDocumentResponseSchema = documentGetSchema;
var getDocumentErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var deleteDocumentDataSchema = z.object({
  path: z.object({
    document_id: z.string()
  })
});
var deleteDocumentResponseSchema = documentDeleteSchema;
var deleteDocumentErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var updateDocumentFileResponseSchema = documentFileUpdateSchema;
var updateDocumentFileErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var updateDocumentRawDataSchema = z.object({
  body: updateDocumentRawParamsSchema,
  path: z.object({
    document_id: z.string()
  })
});
var updateDocumentRawResponseSchema = documentRawUpdateSchema;
var updateDocumentRawErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var patchDocumentMetadataDataSchema = z.object({
  body: patchDocumentMetadataParamsSchema,
  path: z.object({
    document_id: z.string()
  })
});
var patchDocumentMetadataResponseSchema = documentMetadataUpdateSchema;
var patchDocumentMetadataErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var retrieveDataSchema = z.object({
  body: retrieveParamsSchema
});
var retrievalSchema = z.object({
  scored_chunks: z.array(scoredChunkSchema)
});
var retrieveErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var getDocumentSummaryDataSchema = z.object({
  path: z.object({
    document_id: z.string()
  })
});
var getDocumentSummaryResponseSchema = documentSummarySchema;
var getDocumentSummaryErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var listInstructionsResponseSchema = z.array(instructionSchema);
var listInstructionsErrorSchema = errorMessageSchema;
var createInstructionParamsSchema = z.object({
  name: z.string(),
  active: z.boolean().optional(),
  scope: z.union([z.literal("document"), z.literal("chunk")]).optional(),
  prompt: z.string(),
  entity_schema: entitySchemaTypeSchema,
  filter: z.record(z.unknown()).optional(),
  partition: z.string().optional()
});
var createInstructionResponseSchema = instructionSchema;
var createInstructionErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var updateInstructionDataSchema = z.object({
  body: updateInstructionParamsSchema,
  path: z.object({
    instruction_id: z.string()
  })
});
var updateInstructionResponseSchema = instructionSchema;
var updateInstructionErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var listEntitiesByInstructionDataSchema = z.object({
  path: z.object({
    instruction_id: z.string()
  }),
  query: z.object({
    cursor: z.string().optional().nullable(),
    page_size: z.number().optional()
  }).optional()
});
var entityListSchema = z.object({
  pagination: paginationSchema,
  entities: z.array(entitySchema)
});
var listEntitiesByInstructionErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var listEntitiesByDocumentDataSchema = z.object({
  path: z.object({
    document_id: z.string()
  }),
  query: z.object({
    cursor: z.string().optional().nullable(),
    page_size: z.number().optional()
  }).optional()
});
var listEntitiesByDocumentResponseSchema = entityListSchema;
var listEntitiesByDocumentErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var listConnectionsConnectionsGetDataSchema = z.object({
  query: z.object({
    cursor: z.string().optional().nullable(),
    page_size: z.number().optional()
  }).optional()
});
var connectionListSchema = z.object({
  pagination: paginationSchema,
  connections: z.array(connectionSchema)
});
var listConnectionsConnectionsGetErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var setConnectionEnabledConnectionsConnectionIdEnabledPutDataSchema = z.object({
  body: setConnectionEnabledPayloadSchema,
  path: z.object({
    connection_id: z.string()
  })
});
var setConnectionEnabledConnectionsConnectionIdEnabledPutResponseSchema = connectionSchema;
var setConnectionEnabledConnectionsConnectionIdEnabledPutErrorSchema = z.union([
  errorMessageSchema,
  hTTPValidationErrorSchema
]);
var updateConnectionConnectionsConnectionIdPutDataSchema = z.object({
  body: connectionBaseSchema,
  path: z.object({
    connection_id: z.string()
  })
});
var updateConnectionConnectionsConnectionIdPutResponseSchema = connectionSchema;
var updateConnectionConnectionsConnectionIdPutErrorSchema = z.union([
  errorMessageSchema,
  hTTPValidationErrorSchema
]);
var getConnectionStatsConnectionsConnectionIdStatsGetDataSchema = z.object({
  path: z.object({
    connection_id: z.string()
  })
});
var getConnectionStatsConnectionsConnectionIdStatsGetResponseSchema = connectionStatsSchema;
var getConnectionStatsConnectionsConnectionIdStatsGetErrorSchema = z.union([
  errorMessageSchema,
  hTTPValidationErrorSchema
]);
var deleteConnectionConnectionsConnectionIdDeletePostDataSchema = z.object({
  body: deleteConnectionPayloadSchema,
  path: z.object({
    connection_id: z.string()
  })
});
var deleteConnectionConnectionsConnectionIdDeletePostResponseSchema = z.record(z.string());
var deleteConnectionConnectionsConnectionIdDeletePostErrorSchema = z.union([
  errorMessageSchema,
  hTTPValidationErrorSchema
]);
var connectionSyncFinishedWebhookSchema = z.object({
  nonce: z.string(),
  type: z.literal("connection_sync_finished"),
  payload: connectionSyncFinishedWebhookPayloadSchema
});
var connectionSyncProgressWebhookSchema = z.object({
  nonce: z.string(),
  type: z.literal("connection_sync_progress"),
  payload: connectionSyncProgressWebhookPayloadSchema
});
var connectionSyncStartedWebhookSchema = z.object({
  nonce: z.string(),
  type: z.literal("connection_sync_started"),
  payload: connectionSyncStartedWebhookPayloadSchema
});
var documentDeleteWebhookSchema = z.object({
  nonce: z.string(),
  type: z.literal("document_deleted"),
  payload: documentDeleteWebhookPayloadSchema
});
var documentUpdateWebhookSchema = z.object({
  nonce: z.string(),
  type: z.literal("document_status_updated"),
  payload: documentUpdateWebhookPayloadSchema
});
var entityExtractedWebhookSchema = z.object({
  nonce: z.string(),
  type: z.literal("entity_extracted"),
  payload: entityExtractedWebhookPayloadSchema
});
var createDocumentErrorSchema = z.union([errorMessageSchema, hTTPValidationErrorSchema]);
var retrieveResponseSchema = retrievalSchema;
var createInstructionDataSchema = z.object({
  body: createInstructionParamsSchema
});
var listEntitiesByInstructionResponseSchema = entityListSchema;
var listConnectionsConnectionsGetResponseSchema = connectionListSchema;

// src/toolset.ts
var RagieToolset = class extends OpenAPIToolset {
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
var RagieIntegration = class extends Integration {
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

export { RagieIntegration };
