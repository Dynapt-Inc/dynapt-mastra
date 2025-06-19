# @mastra/cloudflare

## 0.10.5-alpha.0

### Patch Changes

- d8f2d19: Add updateMessages API to storage classes (only support for PG and LibSQL for now) and to memory class. Additionally allow for metadata to be saved in the content field of a message.
- Updated dependencies [d8f2d19]
- Updated dependencies [9d52b17]
- Updated dependencies [8ba1b51]
  - @mastra/core@0.10.7-alpha.0

## 0.10.4

### Patch Changes

- 13c97f9: Save run status, result and error in storage snapshot
- Updated dependencies [13c97f9]
  - @mastra/core@0.10.5

## 0.10.3

### Patch Changes

- a77827c: dependencies updates:
  - Updated dependency [`cloudflare@^4.3.0` ↗︎](https://www.npmjs.com/package/cloudflare/v/4.3.0) (from `^4.1.0`, in `dependencies`)
- dffb67b: updated stores to add alter table and change tests
- 925ab94: added paginated functions to base class and added boilerplate and updated imports
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

## 0.10.3-alpha.3

### Patch Changes

- 66f4424: Update peerdeps

## 0.10.3-alpha.2

### Patch Changes

- 925ab94: added paginated functions to base class and added boilerplate and updated imports
- Updated dependencies [925ab94]
  - @mastra/core@0.10.4-alpha.3

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

- a77827c: dependencies updates:
  - Updated dependency [`cloudflare@^4.3.0` ↗︎](https://www.npmjs.com/package/cloudflare/v/4.3.0) (from `^4.1.0`, in `dependencies`)
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
- e9d2ca8: Add pagination to cloudflare kv listing namespaces.
- c5bf1ce: Add backwards compat code for new MessageList in storage
- 12b7002: Add serializedStepGraph to workflow run snapshot in storage
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

## 0.10.2-alpha.3

### Patch Changes

- c5bf1ce: Add backwards compat code for new MessageList in storage
- 12b7002: Add serializedStepGraph to workflow run snapshot in storage
- Updated dependencies [c5bf1ce]
- Updated dependencies [12b7002]
  - @mastra/core@0.10.2-alpha.4

## 0.10.2-alpha.2

### Patch Changes

- f0d559f: Fix peerdeps for alpha channel
- Updated dependencies [1e8bb40]
  - @mastra/core@0.10.2-alpha.2

## 0.10.2-alpha.1

### Patch Changes

- e9d2ca8: Add pagination to cloudflare kv listing namespaces.
- Updated dependencies [ee77e78]
- Updated dependencies [2901125]
  - @mastra/core@0.10.2-alpha.1

## 0.10.2-alpha.0

### Patch Changes

- e5dc18d: Added a backwards compatible layer to begin storing/retrieving UIMessages in storage instead of CoreMessages
- Updated dependencies [592a2db]
- Updated dependencies [e5dc18d]
  - @mastra/core@0.10.2-alpha.0

## 0.10.1

### Patch Changes

- 5c41100: Added binding support for cloudflare deployers, added cloudflare kv namespace changes, and removed randomUUID from buildExecutionGraph
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

- 5c41100: Added binding support for cloudflare deployers, added cloudflare kv namespace changes, and removed randomUUID from buildExecutionGraph
- Updated dependencies [200d0da]
- Updated dependencies [bf5f17b]
- Updated dependencies [5343f93]
- Updated dependencies [38aee50]
- Updated dependencies [5c41100]
- Updated dependencies [d6a759b]
  - @mastra/core@0.10.1-alpha.1

## 0.10.0

### Minor Changes

- 83da932: Move @mastra/core to peerdeps

### Patch Changes

- b3a3d63: BREAKING: Make vnext workflow the default worklow, and old workflow legacy_workflow
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

## 0.2.0-alpha.1

### Minor Changes

- 83da932: Move @mastra/core to peerdeps

### Patch Changes

- b3a3d63: BREAKING: Make vnext workflow the default worklow, and old workflow legacy_workflow
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

## 0.1.5-alpha.0

### Patch Changes

- Updated dependencies [f53a6ac]
- Updated dependencies [eabdcd9]
- Updated dependencies [90be034]
- Updated dependencies [99f050a]
- Updated dependencies [d0ee3c6]
- Updated dependencies [23f258c]
- Updated dependencies [2672a05]
  - @mastra/core@0.9.5-alpha.0

## 0.1.4

### Patch Changes

- Updated dependencies [396be50]
- Updated dependencies [ab80e7e]
- Updated dependencies [c3bd795]
- Updated dependencies [da082f8]
- Updated dependencies [a5810ce]
- Updated dependencies [3e9c131]
- Updated dependencies [3171b5b]
- Updated dependencies [973e5ac]
- Updated dependencies [daf942f]
- Updated dependencies [0b8b868]
- Updated dependencies [9e1eff5]
- Updated dependencies [6fa1ad1]
- Updated dependencies [c28d7a0]
- Updated dependencies [edf1e88]
  - @mastra/core@0.9.4

## 0.1.4-alpha.4

### Patch Changes

- Updated dependencies [3e9c131]
  - @mastra/core@0.9.4-alpha.4

## 0.1.4-alpha.3

### Patch Changes

- Updated dependencies [396be50]
- Updated dependencies [c3bd795]
- Updated dependencies [da082f8]
- Updated dependencies [a5810ce]
  - @mastra/core@0.9.4-alpha.3

## 0.1.4-alpha.2

### Patch Changes

- Updated dependencies [3171b5b]
- Updated dependencies [973e5ac]
- Updated dependencies [9e1eff5]
  - @mastra/core@0.9.4-alpha.2

## 0.1.4-alpha.1

### Patch Changes

- Updated dependencies [ab80e7e]
- Updated dependencies [6fa1ad1]
- Updated dependencies [c28d7a0]
- Updated dependencies [edf1e88]
  - @mastra/core@0.9.4-alpha.1

## 0.1.4-alpha.0

### Patch Changes


... 475 more lines hidden. See full changelog in package directory.