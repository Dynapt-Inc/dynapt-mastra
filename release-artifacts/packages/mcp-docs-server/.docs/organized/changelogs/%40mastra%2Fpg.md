# @mastra/pg

## 0.11.1-alpha.0

### Patch Changes

- d8f2d19: Add updateMessages API to storage classes (only support for PG and LibSQL for now) and to memory class. Additionally allow for metadata to be saved in the content field of a message.
- Updated dependencies [d8f2d19]
- Updated dependencies [9d52b17]
- Updated dependencies [8ba1b51]
  - @mastra/core@0.10.7-alpha.0

## 0.11.0

### Minor Changes

- 704d1ca: Thread Timestamp Auto-Update Enhancement
  Added automatic thread updatedAt timestamp updates when messages are saved across all storage providers
  Enhanced user experience: Threads now accurately reflect their latest activity with automatic timestamp updates when new messages are added
  Universal implementation: Consistent behavior across all 7 storage backends (ClickHouse, Cloudflare D1, DynamoDB, MongoDB, PostgreSQL, Upstash, LibSQL)
  Performance optimized: Updates execute in parallel with message saving operations for minimal performance impact
  Backwards compatible: No breaking changes - existing code continues to work unchanged
  Improved conversation ordering: Chat interfaces can now properly sort threads by actual last activity
  This enhancement resolves the issue where active conversations appeared stale due to outdated thread timestamps, providing better conversation management and user experience in chat applications.

### Patch Changes

- 63f6b7d: dependencies updates:
  - Updated dependency [`pg-promise@^11.14.0` ↗︎](https://www.npmjs.com/package/pg-promise/v/11.14.0) (from `^11.13.0`, in `dependencies`)
- eed55d7: quotes table and schema names for vector and storage to allow for camelcase
- 6c23252: [MASTRA-3982] Fix Memory Retrieval for PG when scope is resource
- Updated dependencies [63f6b7d]
- Updated dependencies [12a95fc]
- Updated dependencies [4b0f8a6]
- Updated dependencies [51264a5]
- Updated dependencies [8e6f677]
- Updated dependencies [d70c420]
- Updated dependencies [ee9af57]
- Updated dependencies [36f1c36]
- Updated dependencies [2a16996]
- Updated dependencies [10d352e]
- Updated dependencies [9589624]
- Updated dependencies [53d3c37]
- Updated dependencies [751c894]
- Updated dependencies [577ce3a]
- Updated dependencies [9260b3a]
  - @mastra/core@0.10.6

## 0.11.0-alpha.3

### Patch Changes

- 6c23252: [MASTRA-3982] Fix Memory Retrieval for PG when scope is resource
- Updated dependencies [9589624]
  - @mastra/core@0.10.6-alpha.4

## 0.11.0-alpha.2

### Patch Changes

- eed55d7: quotes table and schema names for vector and storage to allow for camelcase
- Updated dependencies [d70c420]
- Updated dependencies [2a16996]
  - @mastra/core@0.10.6-alpha.3

## 0.11.0-alpha.1

### Minor Changes

- 704d1ca: Thread Timestamp Auto-Update Enhancement
  Added automatic thread updatedAt timestamp updates when messages are saved across all storage providers
  Enhanced user experience: Threads now accurately reflect their latest activity with automatic timestamp updates when new messages are added
  Universal implementation: Consistent behavior across all 7 storage backends (ClickHouse, Cloudflare D1, DynamoDB, MongoDB, PostgreSQL, Upstash, LibSQL)
  Performance optimized: Updates execute in parallel with message saving operations for minimal performance impact
  Backwards compatible: No breaking changes - existing code continues to work unchanged
  Improved conversation ordering: Chat interfaces can now properly sort threads by actual last activity
  This enhancement resolves the issue where active conversations appeared stale due to outdated thread timestamps, providing better conversation management and user experience in chat applications.

## 0.10.4-alpha.0

### Patch Changes

- 63f6b7d: dependencies updates:
  - Updated dependency [`pg-promise@^11.14.0` ↗︎](https://www.npmjs.com/package/pg-promise/v/11.14.0) (from `^11.13.0`, in `dependencies`)
- Updated dependencies [63f6b7d]
- Updated dependencies [36f1c36]
- Updated dependencies [10d352e]
- Updated dependencies [53d3c37]
  - @mastra/core@0.10.6-alpha.0

## 0.10.3

### Patch Changes

- 3c77c0a: fix(pg): allow dotted attribute keys in `getTraces` by using `parseFieldKey` instead of `parseSqlIdentifier`
- Updated dependencies [13c97f9]
  - @mastra/core@0.10.5

## 0.10.2

### Patch Changes

- e95cb69: dependencies updates:
  - Updated dependency [`pg@^8.16.0` ↗︎](https://www.npmjs.com/package/pg/v/8.16.0) (from `^8.13.3`, in `dependencies`)
  - Updated dependency [`pg-promise@^11.13.0` ↗︎](https://www.npmjs.com/package/pg-promise/v/11.13.0) (from `^11.11.0`, in `dependencies`)
- 0db1e1e: Fix PostgresStore paginated APIs
- dffb67b: updated stores to add alter table and change tests
- e0f9201: change how dedupe works for libsql and pg
- 48eddb9: update filter logic in Memory class to support semantic recall search scope
- 66f4424: Update peerdeps
- Updated dependencies [d1ed912]
- Updated dependencies [f6fd25f]
- Updated dependencies [dffb67b]
- Updated dependencies [f1f1f1b]
- Updated dependencies [925ab94]
- Updated dependencies [f9816ae]
- Updated dependencies [82090c1]
- Updated dependencies [1b443fd]
- Updated dependencies [ce97900]
- Updated dependencies [f1309d3]
- Updated dependencies [14a2566]
- Updated dependencies [f7f8293]
- Updated dependencies [48eddb9]
  - @mastra/core@0.10.4

## 0.10.2-alpha.4

### Patch Changes

- 66f4424: Update peerdeps

## 0.10.2-alpha.3

### Patch Changes

- e0f9201: change how dedupe works for libsql and pg
- Updated dependencies [925ab94]
  - @mastra/core@0.10.4-alpha.3

## 0.10.2-alpha.2

### Patch Changes

- 48eddb9: update filter logic in Memory class to support semantic recall search scope
- Updated dependencies [48eddb9]
  - @mastra/core@0.10.4-alpha.2

## 0.10.2-alpha.1

### Patch Changes

- 0db1e1e: Fix PostgresStore paginated APIs
- dffb67b: updated stores to add alter table and change tests
- Updated dependencies [f6fd25f]
- Updated dependencies [dffb67b]
- Updated dependencies [f1309d3]
- Updated dependencies [f7f8293]
  - @mastra/core@0.10.4-alpha.1

## 0.10.2-alpha.0

### Patch Changes

- e95cb69: dependencies updates:
  - Updated dependency [`pg@^8.16.0` ↗︎](https://www.npmjs.com/package/pg/v/8.16.0) (from `^8.13.3`, in `dependencies`)
  - Updated dependency [`pg-promise@^11.13.0` ↗︎](https://www.npmjs.com/package/pg-promise/v/11.13.0) (from `^11.11.0`, in `dependencies`)
- Updated dependencies [d1ed912]
- Updated dependencies [f1f1f1b]
- Updated dependencies [f9816ae]
- Updated dependencies [82090c1]
- Updated dependencies [1b443fd]
- Updated dependencies [ce97900]
- Updated dependencies [14a2566]
  - @mastra/core@0.10.4-alpha.0

## 0.10.1

### Patch Changes

- e5dc18d: Added a backwards compatible layer to begin storing/retrieving UIMessages in storage instead of CoreMessages
- c5bf1ce: Add backwards compat code for new MessageList in storage
- f0d559f: Fix peerdeps for alpha channel
- Updated dependencies [ee77e78]
- Updated dependencies [592a2db]
- Updated dependencies [e5dc18d]
- Updated dependencies [ab5adbe]
- Updated dependencies [1e8bb40]
- Updated dependencies [1b5fc55]
- Updated dependencies [195c428]
- Updated dependencies [f73e11b]
- Updated dependencies [37643b8]
- Updated dependencies [99fd6cf]
- Updated dependencies [c5bf1ce]
- Updated dependencies [add596e]
- Updated dependencies [8dc94d8]
- Updated dependencies [ecebbeb]
- Updated dependencies [79d5145]
- Updated dependencies [12b7002]
- Updated dependencies [2901125]
  - @mastra/core@0.10.2

## 0.10.1-alpha.2

### Patch Changes

- c5bf1ce: Add backwards compat code for new MessageList in storage
- Updated dependencies [c5bf1ce]
- Updated dependencies [12b7002]
  - @mastra/core@0.10.2-alpha.4

## 0.10.1-alpha.1

### Patch Changes

- f0d559f: Fix peerdeps for alpha channel
- Updated dependencies [1e8bb40]
  - @mastra/core@0.10.2-alpha.2

## 0.10.1-alpha.0

### Patch Changes

- e5dc18d: Added a backwards compatible layer to begin storing/retrieving UIMessages in storage instead of CoreMessages
- Updated dependencies [592a2db]
- Updated dependencies [e5dc18d]
  - @mastra/core@0.10.2-alpha.0

## 0.10.0

### Minor Changes

- 83da932: Move @mastra/core to peerdeps

### Patch Changes

- b3a3d63: BREAKING: Make vnext workflow the default worklow, and old workflow legacy_workflow
- eabdcd9: [MASTRA-3451] SQL Injection Protection
- d0ee3c6: Change all public functions and constructors in vector stores to use named args and prepare to phase out positional args
- a7292b0: BREAKING(@mastra/core, all vector stores): Vector store breaking changes (remove deprecated functions and positional arguments)
- Updated dependencies [b3a3d63]
- Updated dependencies [344f453]
- Updated dependencies [0a3ae6d]
- Updated dependencies [95911be]
- Updated dependencies [f53a6ac]
- Updated dependencies [5eb5a99]
- Updated dependencies [7e632c5]
- Updated dependencies [1e9fbfa]
- Updated dependencies [eabdcd9]
- Updated dependencies [90be034]
- Updated dependencies [99f050a]
- Updated dependencies [d0ee3c6]
- Updated dependencies [b2ae5aa]
- Updated dependencies [23f258c]
- Updated dependencies [a7292b0]
- Updated dependencies [0dcb9f0]
- Updated dependencies [2672a05]
  - @mastra/core@0.10.0

## 0.4.0-alpha.1

### Minor Changes

- 83da932: Move @mastra/core to peerdeps

### Patch Changes

- b3a3d63: BREAKING: Make vnext workflow the default worklow, and old workflow legacy_workflow
- a7292b0: BREAKING(@mastra/core, all vector stores): Vector store breaking changes (remove deprecated functions and positional arguments)
- Updated dependencies [b3a3d63]
- Updated dependencies [344f453]
- Updated dependencies [0a3ae6d]
- Updated dependencies [95911be]
- Updated dependencies [5eb5a99]
- Updated dependencies [7e632c5]
- Updated dependencies [1e9fbfa]
- Updated dependencies [b2ae5aa]
- Updated dependencies [a7292b0]
- Updated dependencies [0dcb9f0]
  - @mastra/core@0.10.0-alpha.1

## 0.3.5-alpha.0

### Patch Changes

- eabdcd9: [MASTRA-3451] SQL Injection Protection
- d0ee3c6: Change all public functions and constructors in vector stores to use named args and prepare to phase out positional args
- Updated dependencies [f53a6ac]
- Updated dependencies [eabdcd9]
- Updated dependencies [90be034]
- Updated dependencies [99f050a]
- Updated dependencies [d0ee3c6]
- Updated dependencies [23f258c]
- Updated dependencies [2672a05]
  - @mastra/core@0.9.5-alpha.0

## 0.3.4

### Patch Changes

- c3bd795: [MASTRA-3358] Deprecate updateIndexById and deleteIndexById

... 1578 more lines hidden. See full changelog in package directory.
