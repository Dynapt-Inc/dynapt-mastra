# @mastra/upstash

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

- 2fda031: Clarify upstash argument concepts.
- e8fdbdd: Fix dynamic require of crypto using upstash.
  caused by a bad import was used in the monorepo

  Fixes #4801

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

## 0.11.0-alpha.2

### Patch Changes

- e8fdbdd: Fix dynamic require of crypto using upstash.
  caused by a bad import was used in the monorepo

  Fixes #4801

- Updated dependencies [9589624]
  - @mastra/core@0.10.6-alpha.4

## 0.11.0-alpha.1

### Patch Changes

- 2fda031: Clarify upstash argument concepts.
- Updated dependencies [ee9af57]
- Updated dependencies [751c894]
- Updated dependencies [577ce3a]
- Updated dependencies [9260b3a]
  - @mastra/core@0.10.6-alpha.1

## 0.11.0-alpha.0

### Minor Changes

- 704d1ca: Thread Timestamp Auto-Update Enhancement
  Added automatic thread updatedAt timestamp updates when messages are saved across all storage providers
  Enhanced user experience: Threads now accurately reflect their latest activity with automatic timestamp updates when new messages are added
  Universal implementation: Consistent behavior across all 7 storage backends (ClickHouse, Cloudflare D1, DynamoDB, MongoDB, PostgreSQL, Upstash, LibSQL)
  Performance optimized: Updates execute in parallel with message saving operations for minimal performance impact
  Backwards compatible: No breaking changes - existing code continues to work unchanged
  Improved conversation ordering: Chat interfaces can now properly sort threads by actual last activity
  This enhancement resolves the issue where active conversations appeared stale due to outdated thread timestamps, providing better conversation management and user experience in chat applications.

## 0.10.3

### Patch Changes

- 1a35518: dependencies updates:
  - Updated dependency [`@upstash/redis@^1.35.0` ↗︎](https://www.npmjs.com/package/@upstash/redis/v/1.35.0) (from `^1.34.5`, in `dependencies`)
- dffb67b: updated stores to add alter table and change tests
- 925ab94: added paginated functions to base class and added boilerplate and updated imports
- 48eddb9: update filter logic in Memory class to support semantic recall search scope
- 66f4424: Update peerdeps
- a914da2: Fix upstash paginated APIs
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

## 0.10.3-alpha.4

### Patch Changes

- 66f4424: Update peerdeps

## 0.10.3-alpha.3

### Patch Changes

- 925ab94: added paginated functions to base class and added boilerplate and updated imports
- a914da2: Fix upstash paginated APIs
- Updated dependencies [925ab94]
  - @mastra/core@0.10.4-alpha.3

## 0.10.3-alpha.2

### Patch Changes

- 48eddb9: update filter logic in Memory class to support semantic recall search scope
- Updated dependencies [48eddb9]
  - @mastra/core@0.10.4-alpha.2

## 0.10.3-alpha.1

### Patch Changes

- dffb67b: updated stores to add alter table and change tests
- Updated dependencies [f6fd25f]
- Updated dependencies [dffb67b]
- Updated dependencies [f1309d3]
- Updated dependencies [f7f8293]
  - @mastra/core@0.10.4-alpha.1

## 0.10.3-alpha.0

### Patch Changes

- 1a35518: dependencies updates:
  - Updated dependency [`@upstash/redis@^1.35.0` ↗︎](https://www.npmjs.com/package/@upstash/redis/v/1.35.0) (from `^1.34.5`, in `dependencies`)
- Updated dependencies [d1ed912]
- Updated dependencies [f1f1f1b]
- Updated dependencies [f9816ae]
- Updated dependencies [82090c1]
- Updated dependencies [1b443fd]
- Updated dependencies [ce97900]
- Updated dependencies [14a2566]
  - @mastra/core@0.10.4-alpha.0

## 0.10.2

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

## 0.10.2-alpha.2

### Patch Changes

- c5bf1ce: Add backwards compat code for new MessageList in storage
- Updated dependencies [c5bf1ce]
- Updated dependencies [12b7002]
  - @mastra/core@0.10.2-alpha.4

## 0.10.2-alpha.1

### Patch Changes

- f0d559f: Fix peerdeps for alpha channel
- Updated dependencies [1e8bb40]
  - @mastra/core@0.10.2-alpha.2

## 0.10.2-alpha.0

### Patch Changes

- e5dc18d: Added a backwards compatible layer to begin storing/retrieving UIMessages in storage instead of CoreMessages
- Updated dependencies [592a2db]
- Updated dependencies [e5dc18d]
  - @mastra/core@0.10.2-alpha.0

## 0.10.1

### Patch Changes

- e60402a: Use scan instead of keys for upstash redis and implement batchInsert
- Updated dependencies [d70b807]
- Updated dependencies [6d16390]
- Updated dependencies [1e4a421]
- Updated dependencies [200d0da]
- Updated dependencies [bf5f17b]
- Updated dependencies [5343f93]
- Updated dependencies [38aee50]
- Updated dependencies [5c41100]
- Updated dependencies [d6a759b]
- Updated dependencies [6015bdf]
  - @mastra/core@0.10.1

## 0.10.1-alpha.0

### Patch Changes

- e60402a: Use scan instead of keys for upstash redis and implement batchInsert
- Updated dependencies [6d16390]
- Updated dependencies [1e4a421]
  - @mastra/core@0.10.1-alpha.0

## 0.10.0

### Minor Changes

- 83da932: Move @mastra/core to peerdeps

### Patch Changes

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

- d0ee3c6: Change all public functions and constructors in vector stores to use named args and prepare to phase out positional args
- Updated dependencies [f53a6ac]
- Updated dependencies [eabdcd9]
- Updated dependencies [90be034]
- Updated dependencies [99f050a]
- Updated dependencies [d0ee3c6]
- Updated dependencies [23f258c]

... 1521 more lines hidden. See full changelog in package directory.