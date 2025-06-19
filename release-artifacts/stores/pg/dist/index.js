import { parseSqlIdentifier, parseFieldKey } from '@mastra/core/utils';
import { MastraVector } from '@mastra/core/vector';
import { Mutex } from 'async-mutex';
import pg from 'pg';
import xxhash from 'xxhash-wasm';
import { BaseFilterTranslator } from '@mastra/core/vector/filter';
import { MessageList } from '@mastra/core/agent';
import { MastraStorage, TABLE_EVALS, TABLE_TRACES, TABLE_WORKFLOW_SNAPSHOT, TABLE_THREADS, TABLE_MESSAGES } from '@mastra/core/storage';
import pgPromise from 'pg-promise';

// src/vector/index.ts
var PGFilterTranslator = class extends BaseFilterTranslator {
  getSupportedOperators() {
    return {
      ...BaseFilterTranslator.DEFAULT_OPERATORS,
      custom: ["$contains", "$size"]
    };
  }
  translate(filter) {
    if (this.isEmpty(filter)) {
      return filter;
    }
    this.validateFilter(filter);
    return this.translateNode(filter);
  }
  translateNode(node, currentPath = "") {
    const withPath = (result2) => currentPath ? { [currentPath]: result2 } : result2;
    if (this.isPrimitive(node)) {
      return withPath({ $eq: this.normalizeComparisonValue(node) });
    }
    if (Array.isArray(node)) {
      return withPath({ $in: this.normalizeArrayValues(node) });
    }
    if (node instanceof RegExp) {
      return withPath(this.translateRegexPattern(node.source, node.flags));
    }
    const entries = Object.entries(node);
    const result = {};
    if ("$options" in node && !("$regex" in node)) {
      throw new Error("$options is not valid without $regex");
    }
    if ("$regex" in node) {
      const options = node.$options || "";
      return withPath(this.translateRegexPattern(node.$regex, options));
    }
    for (const [key, value] of entries) {
      if (key === "$options") continue;
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      if (this.isLogicalOperator(key)) {
        result[key] = Array.isArray(value) ? value.map((filter) => this.translateNode(filter)) : this.translateNode(value);
      } else if (this.isOperator(key)) {
        if (this.isArrayOperator(key) && !Array.isArray(value) && key !== "$elemMatch") {
          result[key] = [value];
        } else if (this.isBasicOperator(key) && Array.isArray(value)) {
          result[key] = JSON.stringify(value);
        } else {
          result[key] = value;
        }
      } else if (typeof value === "object" && value !== null) {
        const hasOperators = Object.keys(value).some((k) => this.isOperator(k));
        if (hasOperators) {
          result[newPath] = this.translateNode(value);
        } else {
          Object.assign(result, this.translateNode(value, newPath));
        }
      } else {
        result[newPath] = this.translateNode(value);
      }
    }
    return result;
  }
  translateRegexPattern(pattern, options = "") {
    if (!options) return { $regex: pattern };
    const flags = options.split("").filter((f) => "imsux".includes(f)).join("");
    return { $regex: flags ? `(?${flags})${pattern}` : pattern };
  }
};
var createBasicOperator = (symbol) => {
  return (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `CASE 
        WHEN $${paramIndex}::text IS NULL THEN metadata#>>'{${jsonPathKey}}' IS ${symbol === "=" ? "" : "NOT"} NULL
        ELSE metadata#>>'{${jsonPathKey}}' ${symbol} $${paramIndex}::text
      END`,
      needsValue: true
    };
  };
};
var createNumericOperator = (symbol) => {
  return (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(metadata#>>'{${jsonPathKey}}')::numeric ${symbol} $${paramIndex}`,
      needsValue: true
    };
  };
};
function buildElemMatchConditions(value, paramIndex) {
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("$elemMatch requires an object with conditions");
  }
  const conditions = [];
  const values = [];
  Object.entries(value).forEach(([field, val]) => {
    const nextParamIndex = paramIndex + values.length;
    let paramOperator;
    let paramKey;
    let paramValue;
    if (field.startsWith("$")) {
      paramOperator = field;
      paramKey = "";
      paramValue = val;
    } else if (typeof val === "object" && !Array.isArray(val)) {
      const [op, opValue] = Object.entries(val || {})[0] || [];
      paramOperator = op;
      paramKey = field;
      paramValue = opValue;
    } else {
      paramOperator = "$eq";
      paramKey = field;
      paramValue = val;
    }
    const operatorFn = FILTER_OPERATORS[paramOperator];
    if (!operatorFn) {
      throw new Error(`Invalid operator: ${paramOperator}`);
    }
    const result = operatorFn(paramKey, nextParamIndex, paramValue);
    const sql = result.sql.replaceAll("metadata#>>", "elem#>>");
    conditions.push(sql);
    if (result.needsValue) {
      values.push(paramValue);
    }
  });
  return {
    sql: conditions.join(" AND "),
    values
  };
}
var FILTER_OPERATORS = {
  $eq: createBasicOperator("="),
  $ne: createBasicOperator("!="),
  $gt: createNumericOperator(">"),
  $gte: createNumericOperator(">="),
  $lt: createNumericOperator("<"),
  $lte: createNumericOperator("<="),
  // Array Operators
  $in: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(
        CASE
          WHEN jsonb_typeof(metadata->'${jsonPathKey}') = 'array' THEN
            EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(metadata->'${jsonPathKey}') as elem
              WHERE elem = ANY($${paramIndex}::text[])
            )
          ELSE metadata#>>'{${jsonPathKey}}' = ANY($${paramIndex}::text[])
        END
      )`,
      needsValue: true
    };
  },
  $nin: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(
        CASE
          WHEN jsonb_typeof(metadata->'${jsonPathKey}') = 'array' THEN
            NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(metadata->'${jsonPathKey}') as elem
              WHERE elem = ANY($${paramIndex}::text[])
            )
          ELSE metadata#>>'{${jsonPathKey}}' != ALL($${paramIndex}::text[])
        END
      )`,
      needsValue: true
    };
  },
  $all: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `CASE WHEN array_length($${paramIndex}::text[], 1) IS NULL THEN false 
            ELSE (metadata#>'{${jsonPathKey}}')::jsonb ?& $${paramIndex}::text[] END`,
      needsValue: true
    };
  },
  $elemMatch: (key, paramIndex, value) => {
    const { sql, values } = buildElemMatchConditions(value, paramIndex);
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(
        CASE
          WHEN jsonb_typeof(metadata->'${jsonPathKey}') = 'array' THEN
            EXISTS (
              SELECT 1 
              FROM jsonb_array_elements(metadata->'${jsonPathKey}') as elem
              WHERE ${sql}
            )
          ELSE FALSE
        END
      )`,
      needsValue: true,
      transformValue: () => values
    };
  },
  // Element Operators
  $exists: (key) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `metadata ? '${jsonPathKey}'`,
      needsValue: false
    };
  },
  // Logical Operators
  $and: (key) => ({ sql: `(${key})`, needsValue: false }),
  $or: (key) => ({ sql: `(${key})`, needsValue: false }),
  $not: (key) => ({ sql: `NOT (${key})`, needsValue: false }),
  $nor: (key) => ({ sql: `NOT (${key})`, needsValue: false }),
  // Regex Operators
  $regex: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `metadata#>>'{${jsonPathKey}}' ~ $${paramIndex}`,
      needsValue: true
    };
  },
  $contains: (key, paramIndex, value) => {
    const jsonPathKey = parseJsonPathKey(key);
    let sql;
    if (Array.isArray(value)) {
      sql = `(metadata->'${jsonPathKey}') ?& $${paramIndex}`;
    } else if (typeof value === "string") {
      sql = `metadata->>'${jsonPathKey}' ILIKE '%' || $${paramIndex} || '%' ESCAPE '\\'`;
    } else {
      sql = `metadata->>'${jsonPathKey}' = $${paramIndex}`;
    }
    return {
      sql,
      needsValue: true,
      transformValue: () => Array.isArray(value) ? value.map(String) : typeof value === "string" ? escapeLikePattern(value) : value
    };
  },
  /**
   * $objectContains: Postgres-only operator for true JSONB object containment.
   * Usage: { field: { $objectContains: { ...subobject } } }
   */
  // $objectContains: (key, paramIndex) => ({
  //   sql: `metadata @> $${paramIndex}::jsonb`,
  //   needsValue: true,
  //   transformValue: value => {
  //     const parts = key.split('.');
  //     return JSON.stringify(parts.reduceRight((value, key) => ({ [key]: value }), value));
  //   },
  // }),
  $size: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(
      CASE
        WHEN jsonb_typeof(metadata#>'{${jsonPathKey}}') = 'array' THEN 
          jsonb_array_length(metadata#>'{${jsonPathKey}}') = $${paramIndex}
        ELSE FALSE
      END
    )`,
      needsValue: true
    };
  }
};
var parseJsonPathKey = (key) => {
  const parsedKey = key !== "" ? parseFieldKey(key) : "";
  return parsedKey.replace(/\./g, ",");
};
function escapeLikePattern(str) {
  return str.replace(/([%_\\])/g, "\\$1");
}
function buildFilterQuery(filter, minScore, topK) {
  const values = [minScore, topK];
  function buildCondition(key, value, parentPath) {
    if (["$and", "$or", "$not", "$nor"].includes(key)) {
      return handleLogicalOperator(key, value);
    }
    if (!value || typeof value !== "object") {
      values.push(value);
      return `metadata#>>'{${parseJsonPathKey(key)}}' = $${values.length}`;
    }
    const [[operator, operatorValue] = []] = Object.entries(value);
    if (operator === "$not") {
      const entries = Object.entries(operatorValue);
      const conditions2 = entries.map(([nestedOp, nestedValue]) => {
        if (!FILTER_OPERATORS[nestedOp]) {
          throw new Error(`Invalid operator in $not condition: ${nestedOp}`);
        }
        const operatorFn2 = FILTER_OPERATORS[nestedOp];
        const operatorResult2 = operatorFn2(key, values.length + 1, nestedValue);
        if (operatorResult2.needsValue) {
          values.push(nestedValue);
        }
        return operatorResult2.sql;
      }).join(" AND ");
      return `NOT (${conditions2})`;
    }
    const operatorFn = FILTER_OPERATORS[operator];
    const operatorResult = operatorFn(key, values.length + 1, operatorValue);
    if (operatorResult.needsValue) {
      const transformedValue = operatorResult.transformValue ? operatorResult.transformValue() : operatorValue;
      if (Array.isArray(transformedValue) && operator === "$elemMatch") {
        values.push(...transformedValue);
      } else {
        values.push(transformedValue);
      }
    }
    return operatorResult.sql;
  }
  function handleLogicalOperator(key, value, parentPath) {
    if (key === "$not") {
      const entries = Object.entries(value);
      const conditions3 = entries.map(([fieldKey, fieldValue]) => buildCondition(fieldKey, fieldValue)).join(" AND ");
      return `NOT (${conditions3})`;
    }
    if (!value || value.length === 0) {
      switch (key) {
        case "$and":
        case "$nor":
          return "true";
        // Empty $and/$nor match everything
        case "$or":
          return "false";
        // Empty $or matches nothing
        default:
          return "true";
      }
    }
    const joinOperator = key === "$or" || key === "$nor" ? "OR" : "AND";
    const conditions2 = value.map((f) => {
      const entries = Object.entries(f || {});
      if (entries.length === 0) return "";
      const [firstKey, firstValue] = entries[0] || [];
      if (["$and", "$or", "$not", "$nor"].includes(firstKey)) {
        return buildCondition(firstKey, firstValue);
      }
      return entries.map(([k, v]) => buildCondition(k, v)).join(` ${joinOperator} `);
    });
    const joined = conditions2.join(` ${joinOperator} `);
    const operatorFn = FILTER_OPERATORS[key];
    return operatorFn(joined, 0, value).sql;
  }
  if (!filter) {
    return { sql: "", values };
  }
  const conditions = Object.entries(filter).map(([key, value]) => buildCondition(key, value)).filter(Boolean).join(" AND ");
  return { sql: conditions ? `WHERE ${conditions}` : "", values };
}

// src/vector/index.ts
var PgVector = class extends MastraVector {
  pool;
  describeIndexCache = /* @__PURE__ */ new Map();
  createdIndexes = /* @__PURE__ */ new Map();
  mutexesByName = /* @__PURE__ */ new Map();
  schema;
  setupSchemaPromise = null;
  installVectorExtensionPromise = null;
  vectorExtensionInstalled = void 0;
  schemaSetupComplete = void 0;
  constructor({
    connectionString,
    schemaName,
    pgPoolOptions
  }) {
    if (!connectionString || connectionString.trim() === "") {
      throw new Error(
        "PgVector: connectionString must be provided and cannot be empty. Passing an empty string may cause fallback to local Postgres defaults."
      );
    }
    super();
    this.schema = schemaName;
    const basePool = new pg.Pool({
      connectionString,
      max: 20,
      // Maximum number of clients in the pool
      idleTimeoutMillis: 3e4,
      // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2e3,
      // Fail fast if can't connect
      ...pgPoolOptions
    });
    const telemetry = this.__getTelemetry();
    this.pool = telemetry?.traceClass(basePool, {
      spanNamePrefix: "pg-vector",
      attributes: {
        "vector.type": "postgres"
      }
    }) ?? basePool;
    void (async () => {
      const existingIndexes = await this.listIndexes();
      void existingIndexes.map(async (indexName) => {
        const info = await this.getIndexInfo({ indexName });
        const key = await this.getIndexCacheKey({
          indexName,
          metric: info.metric,
          dimension: info.dimension,
          type: info.type
        });
        this.createdIndexes.set(indexName, key);
      });
    })();
  }
  getMutexByName(indexName) {
    if (!this.mutexesByName.has(indexName)) this.mutexesByName.set(indexName, new Mutex());
    return this.mutexesByName.get(indexName);
  }
  getTableName(indexName) {
    const parsedIndexName = parseSqlIdentifier(indexName, "index name");
    const quotedIndexName = `"${parsedIndexName}"`;
    const quotedSchemaName = this.getSchemaName();
    const quotedVectorName = `"${parsedIndexName}_vector_idx"`;
    return {
      tableName: quotedSchemaName ? `${quotedSchemaName}.${quotedIndexName}` : quotedIndexName,
      vectorIndexName: quotedVectorName
    };
  }
  getSchemaName() {
    return this.schema ? `"${parseSqlIdentifier(this.schema, "schema name")}"` : void 0;
  }
  transformFilter(filter) {
    const translator = new PGFilterTranslator();
    return translator.translate(filter);
  }
  async getIndexInfo({ indexName }) {
    if (!this.describeIndexCache.has(indexName)) {
      this.describeIndexCache.set(indexName, await this.describeIndex({ indexName }));
    }
    return this.describeIndexCache.get(indexName);
  }
  async query({
    indexName,
    queryVector,
    topK = 10,
    filter,
    includeVector = false,
    minScore = 0,
    ef,
    probes
  }) {
    if (!Number.isInteger(topK) || topK <= 0) {
      throw new Error("topK must be a positive integer");
    }
    if (!Array.isArray(queryVector) || !queryVector.every((x) => typeof x === "number" && Number.isFinite(x))) {
      throw new Error("queryVector must be an array of finite numbers");
    }
    const client = await this.pool.connect();
    try {
      const vectorStr = `[${queryVector.join(",")}]`;
      const translatedFilter = this.transformFilter(filter);
      const { sql: filterQuery, values: filterValues } = buildFilterQuery(translatedFilter, minScore, topK);
      const indexInfo = await this.getIndexInfo({ indexName });
      if (indexInfo.type === "hnsw") {
        const calculatedEf = ef ?? Math.max(topK, (indexInfo?.config?.m ?? 16) * topK);
        const searchEf = Math.min(1e3, Math.max(1, calculatedEf));
        await client.query(`SET LOCAL hnsw.ef_search = ${searchEf}`);
      }
      if (indexInfo.type === "ivfflat" && probes) {
        await client.query(`SET LOCAL ivfflat.probes = ${probes}`);
      }
      const { tableName } = this.getTableName(indexName);
      const query = `
        WITH vector_scores AS (
          SELECT
            vector_id as id,
            1 - (embedding <=> '${vectorStr}'::vector) as score,
            metadata
            ${includeVector ? ", embedding" : ""}
          FROM ${tableName}
          ${filterQuery}
        )
        SELECT *
        FROM vector_scores
        WHERE score > $1
        ORDER BY score DESC
        LIMIT $2`;
      const result = await client.query(query, filterValues);
      return result.rows.map(({ id, score, metadata, embedding }) => ({
        id,
        score,
        metadata,
        ...includeVector && embedding && { vector: JSON.parse(embedding) }
      }));
    } finally {
      client.release();
    }
  }
  async upsert({ indexName, vectors, metadata, ids }) {
    const { tableName } = this.getTableName(indexName);
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const vectorIds = ids || vectors.map(() => crypto.randomUUID());
      for (let i = 0; i < vectors.length; i++) {
        const query = `
          INSERT INTO ${tableName} (vector_id, embedding, metadata)
          VALUES ($1, $2::vector, $3::jsonb)
          ON CONFLICT (vector_id)
          DO UPDATE SET
            embedding = $2::vector,
            metadata = $3::jsonb
          RETURNING embedding::text
        `;
        await client.query(query, [vectorIds[i], `[${vectors[i]?.join(",")}]`, JSON.stringify(metadata?.[i] || {})]);
      }
      await client.query("COMMIT");
      return vectorIds;
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof Error && error.message?.includes("expected") && error.message?.includes("dimensions")) {
        const match = error.message.match(/expected (\d+) dimensions, not (\d+)/);
        if (match) {
          const [, expected, actual] = match;
          throw new Error(
            `Vector dimension mismatch: Index "${indexName}" expects ${expected} dimensions but got ${actual} dimensions. Either use a matching embedding model or delete and recreate the index with the new dimension.`
          );
        }
      }
      throw error;
    } finally {
      client.release();
    }
  }
  hasher = xxhash();
  async getIndexCacheKey({
    indexName,
    dimension,
    metric,
    type
  }) {
    const input = indexName + dimension + metric + (type || "ivfflat");
    return (await this.hasher).h32(input);
  }
  cachedIndexExists(indexName, newKey) {
    const existingIndexCacheKey = this.createdIndexes.get(indexName);
    return existingIndexCacheKey && existingIndexCacheKey === newKey;
  }
  async setupSchema(client) {
    if (!this.schema || this.schemaSetupComplete) {
      return;
    }
    if (!this.setupSchemaPromise) {
      this.setupSchemaPromise = (async () => {
        try {
          const schemaCheck = await client.query(
            `
            SELECT EXISTS (
              SELECT 1 FROM information_schema.schemata 
              WHERE schema_name = $1
            )
          `,
            [this.schema]
          );
          const schemaExists = schemaCheck.rows[0].exists;
          if (!schemaExists) {
            try {
              await client.query(`CREATE SCHEMA IF NOT EXISTS ${this.getSchemaName()}`);
              this.logger.info(`Schema "${this.schema}" created successfully`);
            } catch (error) {
              this.logger.error(`Failed to create schema "${this.schema}"`, { error });
              throw new Error(
                `Unable to create schema "${this.schema}". This requires CREATE privilege on the database. Either create the schema manually or grant CREATE privilege to the user.`
              );
            }
          }
          this.schemaSetupComplete = true;
          this.logger.debug(`Schema "${this.schema}" is ready for use`);
        } catch (error) {
          this.schemaSetupComplete = void 0;
          this.setupSchemaPromise = null;
          throw error;
        } finally {
          this.setupSchemaPromise = null;
        }
      })();
    }
    await this.setupSchemaPromise;
  }
  async createIndex({
    indexName,
    dimension,
    metric = "cosine",
    indexConfig = {},
    buildIndex = true
  }) {
    const { tableName } = this.getTableName(indexName);
    if (!indexName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      throw new Error("Invalid index name format");
    }
    if (!Number.isInteger(dimension) || dimension <= 0) {
      throw new Error("Dimension must be a positive integer");
    }
    const indexCacheKey = await this.getIndexCacheKey({ indexName, dimension, type: indexConfig.type, metric });
    if (this.cachedIndexExists(indexName, indexCacheKey)) {
      return;
    }
    const mutex = this.getMutexByName(`create-${indexName}`);
    await mutex.runExclusive(async () => {
      if (this.cachedIndexExists(indexName, indexCacheKey)) {
        return;
      }
      const client = await this.pool.connect();
      try {
        await this.setupSchema(client);
        await this.installVectorExtension(client);
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            vector_id TEXT UNIQUE NOT NULL,
            embedding vector(${dimension}),
            metadata JSONB DEFAULT '{}'::jsonb
          );
        `);
        this.createdIndexes.set(indexName, indexCacheKey);
        if (buildIndex) {
          await this.setupIndex({ indexName, metric, indexConfig }, client);
        }
      } catch (error) {
        this.createdIndexes.delete(indexName);
        throw error;
      } finally {
        client.release();
      }
    });
  }
  async buildIndex({ indexName, metric = "cosine", indexConfig }) {
    const client = await this.pool.connect();
    try {
      await this.setupIndex({ indexName, metric, indexConfig }, client);
    } finally {
      client.release();
    }
  }
  async setupIndex({ indexName, metric, indexConfig }, client) {
    const mutex = this.getMutexByName(`build-${indexName}`);
    await mutex.runExclusive(async () => {
      const { tableName, vectorIndexName } = this.getTableName(indexName);
      if (this.createdIndexes.has(indexName)) {
        await client.query(`DROP INDEX IF EXISTS ${vectorIndexName}`);
      }
      if (indexConfig.type === "flat") {
        this.describeIndexCache.delete(indexName);
        return;
      }
      const metricOp = metric === "cosine" ? "vector_cosine_ops" : metric === "euclidean" ? "vector_l2_ops" : "vector_ip_ops";
      let indexSQL;
      if (indexConfig.type === "hnsw") {
        const m = indexConfig.hnsw?.m ?? 8;
        const efConstruction = indexConfig.hnsw?.efConstruction ?? 32;
        indexSQL = `
          CREATE INDEX IF NOT EXISTS ${vectorIndexName} 
          ON ${tableName} 
          USING hnsw (embedding ${metricOp})
          WITH (
            m = ${m},
            ef_construction = ${efConstruction}
          )
        `;
      } else {
        let lists;
        if (indexConfig.ivf?.lists) {
          lists = indexConfig.ivf.lists;
        } else {
          const size = (await client.query(`SELECT COUNT(*) FROM ${tableName}`)).rows[0].count;
          lists = Math.max(100, Math.min(4e3, Math.floor(Math.sqrt(size) * 2)));
        }
        indexSQL = `
          CREATE INDEX IF NOT EXISTS ${vectorIndexName}
          ON ${tableName}
          USING ivfflat (embedding ${metricOp})
          WITH (lists = ${lists});
        `;
      }
      await client.query(indexSQL);
    });
  }
  async installVectorExtension(client) {
    if (this.vectorExtensionInstalled) {
      return;
    }
    if (!this.installVectorExtensionPromise) {
      this.installVectorExtensionPromise = (async () => {
        try {
          const extensionCheck = await client.query(`
            SELECT EXISTS (
              SELECT 1 FROM pg_extension WHERE extname = 'vector'
            );
          `);
          this.vectorExtensionInstalled = extensionCheck.rows[0].exists;
          if (!this.vectorExtensionInstalled) {
            try {
              await client.query("CREATE EXTENSION IF NOT EXISTS vector");
              this.vectorExtensionInstalled = true;
              this.logger.info("Vector extension installed successfully");
            } catch {
              this.logger.warn(
                "Could not install vector extension. This requires superuser privileges. If the extension is already installed globally, you can ignore this warning."
              );
            }
          } else {
            this.logger.debug("Vector extension already installed, skipping installation");
          }
        } catch (error) {
          this.logger.error("Error checking vector extension status", { error });
          this.vectorExtensionInstalled = void 0;
          this.installVectorExtensionPromise = null;
          throw error;
        } finally {
          this.installVectorExtensionPromise = null;
        }
      })();
    }
    await this.installVectorExtensionPromise;
  }
  async listIndexes() {
    const client = await this.pool.connect();
    try {
      const vectorTablesQuery = `
            SELECT DISTINCT table_name
            FROM information_schema.columns
            WHERE table_schema = $1
            AND udt_name = 'vector';
        `;
      const vectorTables = await client.query(vectorTablesQuery, [this.schema || "public"]);
      return vectorTables.rows.map((row) => row.table_name);
    } finally {
      client.release();
    }
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the index to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName }) {
    const client = await this.pool.connect();
    try {
      const { tableName } = this.getTableName(indexName);
      const tableExistsQuery = `
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = $2
          AND udt_name = 'vector'
        LIMIT 1;
      `;
      const tableExists = await client.query(tableExistsQuery, [this.schema || "public", indexName]);
      if (tableExists.rows.length === 0) {
        throw new Error(`Vector table ${tableName} does not exist`);
      }
      const dimensionQuery = `
                SELECT atttypmod as dimension
                FROM pg_attribute
                WHERE attrelid = $1::regclass
                AND attname = 'embedding';
            `;
      const countQuery = `
                SELECT COUNT(*) as count
                FROM ${tableName};
            `;
      const indexQuery = `
            SELECT
                am.amname as index_method,
                pg_get_indexdef(i.indexrelid) as index_def,
                opclass.opcname as operator_class
            FROM pg_index i
            JOIN pg_class c ON i.indexrelid = c.oid
            JOIN pg_am am ON c.relam = am.oid
            JOIN pg_opclass opclass ON i.indclass[0] = opclass.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relname = $1
            AND n.nspname = $2;
            `;
      const [dimResult, countResult, indexResult] = await Promise.all([
        client.query(dimensionQuery, [tableName]),
        client.query(countQuery),
        client.query(indexQuery, [`${indexName}_vector_idx`, this.schema || "public"])
      ]);
      const { index_method, index_def, operator_class } = indexResult.rows[0] || {
        index_method: "flat",
        index_def: "",
        operator_class: "cosine"
      };
      const metric = operator_class.includes("l2") ? "euclidean" : operator_class.includes("ip") ? "dotproduct" : "cosine";
      const config = {};
      if (index_method === "hnsw") {
        const m = index_def.match(/m\s*=\s*'?(\d+)'?/)?.[1];
        const efConstruction = index_def.match(/ef_construction\s*=\s*'?(\d+)'?/)?.[1];
        if (m) config.m = parseInt(m);
        if (efConstruction) config.efConstruction = parseInt(efConstruction);
      } else if (index_method === "ivfflat") {
        const lists = index_def.match(/lists\s*=\s*'?(\d+)'?/)?.[1];
        if (lists) config.lists = parseInt(lists);
      }
      return {
        dimension: dimResult.rows[0].dimension,
        count: parseInt(countResult.rows[0].count),
        metric,
        type: index_method,
        config
      };
    } catch (e) {
      await client.query("ROLLBACK");
      throw new Error(`Failed to describe vector table: ${e.message}`);
    } finally {
      client.release();
    }
  }
  async deleteIndex({ indexName }) {
    const client = await this.pool.connect();
    try {
      const { tableName } = this.getTableName(indexName);
      await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
      this.createdIndexes.delete(indexName);
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`Failed to delete vector table: ${error.message}`);
    } finally {
      client.release();
    }
  }
  async truncateIndex({ indexName }) {
    const client = await this.pool.connect();
    try {
      const { tableName } = this.getTableName(indexName);
      await client.query(`TRUNCATE ${tableName}`);
    } catch (e) {
      await client.query("ROLLBACK");
      throw new Error(`Failed to truncate vector table: ${e.message}`);
    } finally {
      client.release();
    }
  }
  async disconnect() {
    await this.pool.end();
  }
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
  async updateVector({ indexName, id, update }) {
    if (!update.vector && !update.metadata) {
      throw new Error("No updates provided");
    }
    const client = await this.pool.connect();
    try {
      let updateParts = [];
      let values = [id];
      let valueIndex = 2;
      if (update.vector) {
        updateParts.push(`embedding = $${valueIndex}::vector`);
        values.push(`[${update.vector.join(",")}]`);
        valueIndex++;
      }
      if (update.metadata) {
        updateParts.push(`metadata = $${valueIndex}::jsonb`);
        values.push(JSON.stringify(update.metadata));
      }
      if (updateParts.length === 0) {
        return;
      }
      const { tableName } = this.getTableName(indexName);
      const query = `
        UPDATE ${tableName}
        SET ${updateParts.join(", ")}
        WHERE vector_id = $1
      `;
      await client.query(query, values);
    } catch (error) {
      throw new Error(`Failed to update vector by id: ${id} for index: ${indexName}: ${error.message}`);
    } finally {
      client.release();
    }
  }
  /**
   * Deletes a vector by its ID.
   * @param indexName - The name of the index containing the vector.
   * @param id - The ID of the vector to delete.
   * @returns A promise that resolves when the deletion is complete.
   * @throws Will throw an error if the deletion operation fails.
   */
  async deleteVector({ indexName, id }) {
    const client = await this.pool.connect();
    try {
      const { tableName } = this.getTableName(indexName);
      const query = `
        DELETE FROM ${tableName}
        WHERE vector_id = $1
      `;
      await client.query(query, [id]);
    } catch (error) {
      throw new Error(`Failed to delete vector by id: ${id} for index: ${indexName}: ${error.message}`);
    } finally {
      client.release();
    }
  }
};
var PostgresStore = class extends MastraStorage {
  db;
  pgp;
  schema;
  setupSchemaPromise = null;
  schemaSetupComplete = void 0;
  constructor(config) {
    if ("connectionString" in config) {
      if (!config.connectionString || typeof config.connectionString !== "string" || config.connectionString.trim() === "") {
        throw new Error(
          "PostgresStore: connectionString must be provided and cannot be empty. Passing an empty string may cause fallback to local Postgres defaults."
        );
      }
    } else {
      const required = ["host", "database", "user", "password"];
      for (const key of required) {
        if (!(key in config) || typeof config[key] !== "string" || config[key].trim() === "") {
          throw new Error(
            `PostgresStore: ${key} must be provided and cannot be empty. Passing an empty string may cause fallback to local Postgres defaults.`
          );
        }
      }
    }
    super({ name: "PostgresStore" });
    this.pgp = pgPromise();
    this.schema = config.schemaName;
    this.db = this.pgp(
      `connectionString` in config ? { connectionString: config.connectionString } : {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: config.ssl
      }
    );
  }
  get supports() {
    return {
      selectByIncludeResourceScope: true
    };
  }
  getTableName(indexName) {
    const parsedIndexName = parseSqlIdentifier(indexName, "index name");
    const quotedIndexName = `"${parsedIndexName}"`;
    const quotedSchemaName = this.getSchemaName();
    return quotedSchemaName ? `${quotedSchemaName}.${quotedIndexName}` : quotedIndexName;
  }
  getSchemaName() {
    return this.schema ? `"${parseSqlIdentifier(this.schema, "schema name")}"` : void 0;
  }
  /** @deprecated use getEvals instead */
  async getEvalsByAgentName(agentName, type) {
    try {
      const baseQuery = `SELECT * FROM ${this.getTableName(TABLE_EVALS)} WHERE agent_name = $1`;
      const typeCondition = type === "test" ? " AND test_info IS NOT NULL AND test_info->>'testPath' IS NOT NULL" : type === "live" ? " AND (test_info IS NULL OR test_info->>'testPath' IS NULL)" : "";
      const query = `${baseQuery}${typeCondition} ORDER BY created_at DESC`;
      const rows = await this.db.manyOrNone(query, [agentName]);
      return rows?.map((row) => this.transformEvalRow(row)) ?? [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist")) {
        return [];
      }
      console.error("Failed to get evals for the specified agent: " + error?.message);
      throw error;
    }
  }
  transformEvalRow(row) {
    let testInfoValue = null;
    if (row.test_info) {
      try {
        testInfoValue = typeof row.test_info === "string" ? JSON.parse(row.test_info) : row.test_info;
      } catch (e) {
        console.warn("Failed to parse test_info:", e);
      }
    }
    return {
      agentName: row.agent_name,
      input: row.input,
      output: row.output,
      result: row.result,
      metricName: row.metric_name,
      instructions: row.instructions,
      testInfo: testInfoValue,
      globalRunId: row.global_run_id,
      runId: row.run_id,
      createdAt: row.created_at
    };
  }
  async batchInsert({ tableName, records }) {
    try {
      await this.db.query("BEGIN");
      for (const record of records) {
        await this.insert({ tableName, record });
      }
      await this.db.query("COMMIT");
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      await this.db.query("ROLLBACK");
      throw error;
    }
  }
  /**
   * @deprecated use getTracesPaginated instead
   */
  async getTraces(args) {
    if (args.fromDate || args.toDate) {
      args.dateRange = {
        start: args.fromDate,
        end: args.toDate
      };
    }
    const result = await this.getTracesPaginated(args);
    return result.traces;
  }
  async getTracesPaginated(args) {
    const { name, scope, page = 0, perPage: perPageInput, attributes, filters, dateRange } = args;
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const perPage = perPageInput !== void 0 ? perPageInput : 100;
    const currentOffset = page * perPage;
    const queryParams = [];
    const conditions = [];
    let paramIndex = 1;
    if (name) {
      conditions.push(`name LIKE $${paramIndex++}`);
      queryParams.push(`${name}%`);
    }
    if (scope) {
      conditions.push(`scope = $${paramIndex++}`);
      queryParams.push(scope);
    }
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        const parsedKey = parseFieldKey(key);
        conditions.push(`attributes->>'${parsedKey}' = $${paramIndex++}`);
        queryParams.push(value);
      });
    }
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        const parsedKey = parseFieldKey(key);
        conditions.push(`"${parsedKey}" = $${paramIndex++}`);
        queryParams.push(value);
      });
    }
    if (fromDate) {
      conditions.push(`"createdAt" >= $${paramIndex++}`);
      queryParams.push(fromDate);
    }
    if (toDate) {
      conditions.push(`"createdAt" <= $${paramIndex++}`);
      queryParams.push(toDate);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countQuery = `SELECT COUNT(*) FROM ${this.getTableName(TABLE_TRACES)} ${whereClause}`;
    const countResult = await this.db.one(countQuery, queryParams);
    const total = parseInt(countResult.count, 10);
    if (total === 0) {
      return {
        traces: [],
        total: 0,
        page,
        perPage,
        hasMore: false
      };
    }
    const dataQuery = `SELECT * FROM ${this.getTableName(
      TABLE_TRACES
    )} ${whereClause} ORDER BY "createdAt" DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const finalQueryParams = [...queryParams, perPage, currentOffset];
    const rows = await this.db.manyOrNone(dataQuery, finalQueryParams);
    const traces = rows.map((row) => ({
      id: row.id,
      parentSpanId: row.parentSpanId,
      traceId: row.traceId,
      name: row.name,
      scope: row.scope,
      kind: row.kind,
      status: row.status,
      events: row.events,
      links: row.links,
      attributes: row.attributes,
      startTime: row.startTime,
      endTime: row.endTime,
      other: row.other,
      createdAt: row.createdAt
    }));
    return {
      traces,
      total,
      page,
      perPage,
      hasMore: currentOffset + traces.length < total
    };
  }
  async setupSchema() {
    if (!this.schema || this.schemaSetupComplete) {
      return;
    }
    if (!this.setupSchemaPromise) {
      this.setupSchemaPromise = (async () => {
        try {
          const schemaExists = await this.db.oneOrNone(
            `
            SELECT EXISTS (
              SELECT 1 FROM information_schema.schemata 
              WHERE schema_name = $1
            )
          `,
            [this.schema]
          );
          if (!schemaExists?.exists) {
            try {
              await this.db.none(`CREATE SCHEMA IF NOT EXISTS ${this.getSchemaName()}`);
              this.logger.info(`Schema "${this.schema}" created successfully`);
            } catch (error) {
              this.logger.error(`Failed to create schema "${this.schema}"`, { error });
              throw new Error(
                `Unable to create schema "${this.schema}". This requires CREATE privilege on the database. Either create the schema manually or grant CREATE privilege to the user.`
              );
            }
          }
          this.schemaSetupComplete = true;
          this.logger.debug(`Schema "${this.schema}" is ready for use`);
        } catch (error) {
          this.schemaSetupComplete = void 0;
          this.setupSchemaPromise = null;
          throw error;
        } finally {
          this.setupSchemaPromise = null;
        }
      })();
    }
    await this.setupSchemaPromise;
  }
  async createTable({
    tableName,
    schema
  }) {
    try {
      const columns = Object.entries(schema).map(([name, def]) => {
        const parsedName = parseSqlIdentifier(name, "column name");
        const constraints = [];
        if (def.primaryKey) constraints.push("PRIMARY KEY");
        if (!def.nullable) constraints.push("NOT NULL");
        return `"${parsedName}" ${def.type.toUpperCase()} ${constraints.join(" ")}`;
      }).join(",\n");
      if (this.schema) {
        await this.setupSchema();
      }
      const sql = `
        CREATE TABLE IF NOT EXISTS ${this.getTableName(tableName)} (
          ${columns}
        );
        ${tableName === TABLE_WORKFLOW_SNAPSHOT ? `
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'mastra_workflow_snapshot_workflow_name_run_id_key'
          ) THEN
            ALTER TABLE ${this.getTableName(tableName)}
            ADD CONSTRAINT mastra_workflow_snapshot_workflow_name_run_id_key
            UNIQUE (workflow_name, run_id);
          END IF;
        END $$;
        ` : ""}
      `;
      await this.db.none(sql);
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
      throw error;
    }
  }
  getDefaultValue(type) {
    switch (type) {
      case "timestamp":
        return "DEFAULT NOW()";
      case "jsonb":
        return "DEFAULT '{}'::jsonb";
      default:
        return super.getDefaultValue(type);
    }
  }
  /**
   * Alters table schema to add columns if they don't exist
   * @param tableName Name of the table
   * @param schema Schema of the table
   * @param ifNotExists Array of column names to add if they don't exist
   */
  async alterTable({
    tableName,
    schema,
    ifNotExists
  }) {
    const fullTableName = this.getTableName(tableName);
    try {
      for (const columnName of ifNotExists) {
        if (schema[columnName]) {
          const columnDef = schema[columnName];
          const sqlType = this.getSqlType(columnDef.type);
          const nullable = columnDef.nullable === false ? "NOT NULL" : "";
          const defaultValue = columnDef.nullable === false ? this.getDefaultValue(columnDef.type) : "";
          const parsedColumnName = parseSqlIdentifier(columnName, "column name");
          const alterSql = `ALTER TABLE ${fullTableName} ADD COLUMN IF NOT EXISTS "${parsedColumnName}" ${sqlType} ${nullable} ${defaultValue}`.trim();
          await this.db.none(alterSql);
          this.logger?.debug?.(`Ensured column ${parsedColumnName} exists in table ${fullTableName}`);
        }
      }
    } catch (error) {
      this.logger?.error?.(
        `Error altering table ${tableName}: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new Error(`Failed to alter table ${tableName}: ${error}`);
    }
  }
  async clearTable({ tableName }) {
    try {
      await this.db.none(`TRUNCATE TABLE ${this.getTableName(tableName)} CASCADE`);
    } catch (error) {
      console.error(`Error clearing table ${tableName}:`, error);
      throw error;
    }
  }
  async insert({ tableName, record }) {
    try {
      const columns = Object.keys(record).map((col) => parseSqlIdentifier(col, "column name"));
      const values = Object.values(record);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
      await this.db.none(
        `INSERT INTO ${this.getTableName(tableName)} (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`,
        values
      );
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      throw error;
    }
  }
  async load({ tableName, keys }) {
    try {
      const keyEntries = Object.entries(keys).map(([key, value]) => [parseSqlIdentifier(key, "column name"), value]);
      const conditions = keyEntries.map(([key], index) => `"${key}" = $${index + 1}`).join(" AND ");
      const values = keyEntries.map(([_, value]) => value);
      const result = await this.db.oneOrNone(
        `SELECT * FROM ${this.getTableName(tableName)} WHERE ${conditions}`,
        values
      );
      if (!result) {
        return null;
      }
      if (tableName === TABLE_WORKFLOW_SNAPSHOT) {
        const snapshot = result;
        if (typeof snapshot.snapshot === "string") {
          snapshot.snapshot = JSON.parse(snapshot.snapshot);
        }
        return snapshot;
      }
      return result;
    } catch (error) {
      console.error(`Error loading from ${tableName}:`, error);
      throw error;
    }
  }
  async getThreadById({ threadId }) {
    try {
      const thread = await this.db.oneOrNone(
        `SELECT 
          id,
          "resourceId",
          title,
          metadata,
          "createdAt",
          "updatedAt"
        FROM ${this.getTableName(TABLE_THREADS)}
        WHERE id = $1`,
        [threadId]
      );
      if (!thread) {
        return null;
      }
      return {
        ...thread,
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt
      };
    } catch (error) {
      console.error(`Error getting thread ${threadId}:`, error);
      throw error;
    }
  }
  /**
   * @deprecated use getThreadsByResourceIdPaginated instead
   */
  async getThreadsByResourceId(args) {
    const { resourceId } = args;
    try {
      const baseQuery = `FROM ${this.getTableName(TABLE_THREADS)} WHERE "resourceId" = $1`;
      const queryParams = [resourceId];
      const dataQuery = `SELECT id, "resourceId", title, metadata, "createdAt", "updatedAt" ${baseQuery} ORDER BY "createdAt" DESC`;
      const rows = await this.db.manyOrNone(dataQuery, queryParams);
      return (rows || []).map((thread) => ({
        ...thread,
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt
      }));
    } catch (error) {
      this.logger.error(`Error getting threads for resource ${resourceId}:`, error);
      return [];
    }
  }
  async getThreadsByResourceIdPaginated(args) {
    const { resourceId, page = 0, perPage: perPageInput } = args;
    try {
      const baseQuery = `FROM ${this.getTableName(TABLE_THREADS)} WHERE "resourceId" = $1`;
      const queryParams = [resourceId];
      const perPage = perPageInput !== void 0 ? perPageInput : 100;
      const currentOffset = page * perPage;
      const countQuery = `SELECT COUNT(*) ${baseQuery}`;
      const countResult = await this.db.one(countQuery, queryParams);
      const total = parseInt(countResult.count, 10);
      if (total === 0) {
        return {
          threads: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const dataQuery = `SELECT id, "resourceId", title, metadata, "createdAt", "updatedAt" ${baseQuery} ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`;
      const rows = await this.db.manyOrNone(dataQuery, [...queryParams, perPage, currentOffset]);
      const threads = (rows || []).map((thread) => ({
        ...thread,
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
        createdAt: thread.createdAt,
        // Assuming already Date objects or ISO strings
        updatedAt: thread.updatedAt
      }));
      return {
        threads,
        total,
        page,
        perPage,
        hasMore: currentOffset + threads.length < total
      };
    } catch (error) {
      this.logger.error(`Error getting threads for resource ${resourceId}:`, error);
      return { threads: [], total: 0, page, perPage: perPageInput || 100, hasMore: false };
    }
  }
  async saveThread({ thread }) {
    try {
      await this.db.none(
        `INSERT INTO ${this.getTableName(TABLE_THREADS)} (
          id,
          "resourceId",
          title,
          metadata,
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          "resourceId" = EXCLUDED."resourceId",
          title = EXCLUDED.title,
          metadata = EXCLUDED.metadata,
          "createdAt" = EXCLUDED."createdAt",
          "updatedAt" = EXCLUDED."updatedAt"`,
        [
          thread.id,
          thread.resourceId,
          thread.title,
          thread.metadata ? JSON.stringify(thread.metadata) : null,
          thread.createdAt,
          thread.updatedAt
        ]
      );
      return thread;
    } catch (error) {
      console.error("Error saving thread:", error);
      throw error;
    }
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    try {
      const existingThread = await this.getThreadById({ threadId: id });
      if (!existingThread) {
        throw new Error(`Thread ${id} not found`);
      }
      const mergedMetadata = {
        ...existingThread.metadata,
        ...metadata
      };
      const thread = await this.db.one(
        `UPDATE ${this.getTableName(TABLE_THREADS)}
        SET title = $1,
            metadata = $2,
            "updatedAt" = $3
        WHERE id = $4
        RETURNING *`,
        [title, mergedMetadata, (/* @__PURE__ */ new Date()).toISOString(), id]
      );
      return {
        ...thread,
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt
      };
    } catch (error) {
      console.error("Error updating thread:", error);
      throw error;
    }
  }
  async deleteThread({ threadId }) {
    try {
      await this.db.tx(async (t) => {
        await t.none(`DELETE FROM ${this.getTableName(TABLE_MESSAGES)} WHERE thread_id = $1`, [threadId]);
        await t.none(`DELETE FROM ${this.getTableName(TABLE_THREADS)} WHERE id = $1`, [threadId]);
      });
    } catch (error) {
      console.error("Error deleting thread:", error);
      throw error;
    }
  }
  async getMessages(args) {
    const { threadId, format, selectBy } = args;
    const selectStatement = `SELECT id, content, role, type, "createdAt", thread_id AS "threadId"`;
    const orderByStatement = `ORDER BY "createdAt" DESC`;
    try {
      let rows = [];
      const include = selectBy?.include || [];
      if (include.length) {
        const unionQueries = [];
        const params = [];
        let paramIdx = 1;
        for (const inc of include) {
          const { id, withPreviousMessages = 0, withNextMessages = 0 } = inc;
          const searchId = inc.threadId || threadId;
          unionQueries.push(
            `
            SELECT * FROM (
              WITH ordered_messages AS (
                SELECT 
                  *,
                  ROW_NUMBER() OVER (${orderByStatement}) as row_num
                FROM ${this.getTableName(TABLE_MESSAGES)}
                WHERE thread_id = $${paramIdx}
              )
              SELECT
                m.id, 
                m.content, 
                m.role, 
                m.type,
                m."createdAt", 
                m.thread_id AS "threadId",
                m."resourceId"
              FROM ordered_messages m
              WHERE m.id = $${paramIdx + 1}
              OR EXISTS (
                SELECT 1 FROM ordered_messages target
                WHERE target.id = $${paramIdx + 1}
                AND (
                  -- Get previous messages based on the max withPreviousMessages
                  (m.row_num <= target.row_num + $${paramIdx + 2} AND m.row_num > target.row_num)
                  OR
                  -- Get next messages based on the max withNextMessages
                  (m.row_num >= target.row_num - $${paramIdx + 3} AND m.row_num < target.row_num)
                )
              )
            ) AS query_${paramIdx}
            `
            // Keep ASC for final sorting after fetching context
          );
          params.push(searchId, id, withPreviousMessages, withNextMessages);
          paramIdx += 4;
        }
        const finalQuery = unionQueries.join(" UNION ALL ") + ' ORDER BY "createdAt" ASC';
        const includedRows = await this.db.manyOrNone(finalQuery, params);
        const seen = /* @__PURE__ */ new Set();
        const dedupedRows = includedRows.filter((row) => {
          if (seen.has(row.id)) return false;
          seen.add(row.id);
          return true;
        });
        rows = dedupedRows;
      } else {
        const limit = typeof selectBy?.last === `number` ? selectBy.last : 40;
        if (limit === 0 && selectBy?.last !== false) ; else {
          let query = `${selectStatement} FROM ${this.getTableName(
            TABLE_MESSAGES
          )} WHERE thread_id = $1 ${orderByStatement}`;
          const queryParams = [threadId];
          if (limit !== void 0 && selectBy?.last !== false) {
            query += ` LIMIT $2`;
            queryParams.push(limit);
          }
          rows = await this.db.manyOrNone(query, queryParams);
        }
      }
      const fetchedMessages = (rows || []).map((message) => {
        if (typeof message.content === "string") {
          try {
            message.content = JSON.parse(message.content);
          } catch {
          }
        }
        if (message.type === "v2") delete message.type;
        return message;
      });
      const sortedMessages = fetchedMessages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return format === "v2" ? sortedMessages.map(
        (m) => ({ ...m, content: m.content || { format: 2, parts: [{ type: "text", text: "" }] } })
      ) : sortedMessages;
    } catch (error) {
      this.logger.error("Error getting messages:", error);
      return [];
    }
  }
  async getMessagesPaginated(args) {
    const { threadId, format, selectBy } = args;
    const { page = 0, perPage: perPageInput, dateRange } = selectBy?.pagination || {};
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const selectStatement = `SELECT id, content, role, type, "createdAt", thread_id AS "threadId"`;
    const orderByStatement = `ORDER BY "createdAt" DESC`;
    try {
      const perPage = perPageInput !== void 0 ? perPageInput : 40;
      const currentOffset = page * perPage;
      const conditions = [`thread_id = $1`];
      const queryParams = [threadId];
      let paramIndex = 2;
      if (fromDate) {
        conditions.push(`"createdAt" >= $${paramIndex++}`);
        queryParams.push(fromDate);
      }
      if (toDate) {
        conditions.push(`"createdAt" <= $${paramIndex++}`);
        queryParams.push(toDate);
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const countQuery = `SELECT COUNT(*) FROM ${this.getTableName(TABLE_MESSAGES)} ${whereClause}`;
      const countResult = await this.db.one(countQuery, queryParams);
      const total = parseInt(countResult.count, 10);
      if (total === 0) {
        return {
          messages: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const dataQuery = `${selectStatement} FROM ${this.getTableName(
        TABLE_MESSAGES
      )} ${whereClause} ${orderByStatement} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      const rows = await this.db.manyOrNone(dataQuery, [...queryParams, perPage, currentOffset]);
      const list = new MessageList().add(rows || [], "memory");
      const messagesToReturn = format === `v2` ? list.get.all.v2() : list.get.all.v1();
      return {
        messages: messagesToReturn,
        total,
        page,
        perPage,
        hasMore: currentOffset + rows.length < total
      };
    } catch (error) {
      this.logger.error("Error getting messages:", error);
      return { messages: [], total: 0, page, perPage: perPageInput || 40, hasMore: false };
    }
  }
  async saveMessages({
    messages,
    format
  }) {
    if (messages.length === 0) return messages;
    try {
      const threadId = messages[0]?.threadId;
      if (!threadId) {
        throw new Error("Thread ID is required");
      }
      const thread = await this.getThreadById({ threadId });
      if (!thread) {
        throw new Error(`Thread ${threadId} not found`);
      }
      await this.db.tx(async (t) => {
        const messageInserts = messages.map((message) => {
          if (!message.threadId) {
            throw new Error(
              `Expected to find a threadId for message, but couldn't find one. An unexpected error has occurred.`
            );
          }
          if (!message.resourceId) {
            throw new Error(
              `Expected to find a resourceId for message, but couldn't find one. An unexpected error has occurred.`
            );
          }
          return t.none(
            `INSERT INTO ${this.getTableName(TABLE_MESSAGES)} (id, thread_id, content, "createdAt", role, type, "resourceId") 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              message.id,
              message.threadId,
              typeof message.content === "string" ? message.content : JSON.stringify(message.content),
              message.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
              message.role,
              message.type || "v2",
              message.resourceId
            ]
          );
        });
        const threadUpdate = t.none(
          `UPDATE ${this.getTableName(TABLE_THREADS)} 
           SET "updatedAt" = $1 
           WHERE id = $2`,
          [(/* @__PURE__ */ new Date()).toISOString(), threadId]
        );
        await Promise.all([...messageInserts, threadUpdate]);
      });
      const list = new MessageList().add(messages, "memory");
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      console.error("Error saving messages:", error);
      throw error;
    }
  }
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    try {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await this.db.none(
        `INSERT INTO ${this.getTableName(TABLE_WORKFLOW_SNAPSHOT)} (
          workflow_name,
          run_id,
          snapshot,
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (workflow_name, run_id) DO UPDATE
        SET snapshot = EXCLUDED.snapshot,
            "updatedAt" = EXCLUDED."updatedAt"`,
        [workflowName, runId, JSON.stringify(snapshot), now, now]
      );
    } catch (error) {
      console.error("Error persisting workflow snapshot:", error);
      throw error;
    }
  }
  async loadWorkflowSnapshot({
    workflowName,
    runId
  }) {
    try {
      const result = await this.load({
        tableName: TABLE_WORKFLOW_SNAPSHOT,
        keys: {
          workflow_name: workflowName,
          run_id: runId
        }
      });
      if (!result) {
        return null;
      }
      return result.snapshot;
    } catch (error) {
      console.error("Error loading workflow snapshot:", error);
      throw error;
    }
  }
  async hasColumn(table, column) {
    const schema = this.schema || "public";
    const result = await this.db.oneOrNone(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND (column_name = $3 OR column_name = $4)`,
      [schema, table, column, column.toLowerCase()]
    );
    return !!result;
  }
  parseWorkflowRun(row) {
    let parsedSnapshot = row.snapshot;
    if (typeof parsedSnapshot === "string") {
      try {
        parsedSnapshot = JSON.parse(row.snapshot);
      } catch (e) {
        console.warn(`Failed to parse snapshot for workflow ${row.workflow_name}: ${e}`);
      }
    }
    return {
      workflowName: row.workflow_name,
      runId: row.run_id,
      snapshot: parsedSnapshot,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      resourceId: row.resourceId
    };
  }
  async getWorkflowRuns({
    workflowName,
    fromDate,
    toDate,
    limit,
    offset,
    resourceId
  } = {}) {
    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;
      if (workflowName) {
        conditions.push(`workflow_name = $${paramIndex}`);
        values.push(workflowName);
        paramIndex++;
      }
      if (resourceId) {
        const hasResourceId = await this.hasColumn(TABLE_WORKFLOW_SNAPSHOT, "resourceId");
        if (hasResourceId) {
          conditions.push(`"resourceId" = $${paramIndex}`);
          values.push(resourceId);
          paramIndex++;
        } else {
          console.warn(`[${TABLE_WORKFLOW_SNAPSHOT}] resourceId column not found. Skipping resourceId filter.`);
        }
      }
      if (fromDate) {
        conditions.push(`"createdAt" >= $${paramIndex}`);
        values.push(fromDate);
        paramIndex++;
      }
      if (toDate) {
        conditions.push(`"createdAt" <= $${paramIndex}`);
        values.push(toDate);
        paramIndex++;
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      let total = 0;
      if (limit !== void 0 && offset !== void 0) {
        const countResult = await this.db.one(
          `SELECT COUNT(*) as count FROM ${this.getTableName(TABLE_WORKFLOW_SNAPSHOT)} ${whereClause}`,
          values
        );
        total = Number(countResult.count);
      }
      const query = `
      SELECT * FROM ${this.getTableName(TABLE_WORKFLOW_SNAPSHOT)} 
      ${whereClause} 
      ORDER BY "createdAt" DESC
      ${limit !== void 0 && offset !== void 0 ? ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}` : ""}
    `;
      const queryValues = limit !== void 0 && offset !== void 0 ? [...values, limit, offset] : values;
      const result = await this.db.manyOrNone(query, queryValues);
      const runs = (result || []).map((row) => {
        return this.parseWorkflowRun(row);
      });
      return { runs, total: total || runs.length };
    } catch (error) {
      console.error("Error getting workflow runs:", error);
      throw error;
    }
  }
  async getWorkflowRunById({
    runId,
    workflowName
  }) {
    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;
      if (runId) {
        conditions.push(`run_id = $${paramIndex}`);
        values.push(runId);
        paramIndex++;
      }
      if (workflowName) {
        conditions.push(`workflow_name = $${paramIndex}`);
        values.push(workflowName);
        paramIndex++;
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const query = `
      SELECT * FROM ${this.getTableName(TABLE_WORKFLOW_SNAPSHOT)} 
      ${whereClause} 
    `;
      const queryValues = values;
      const result = await this.db.oneOrNone(query, queryValues);
      if (!result) {
        return null;
      }
      return this.parseWorkflowRun(result);
    } catch (error) {
      console.error("Error getting workflow run by ID:", error);
      throw error;
    }
  }
  async close() {
    this.pgp.end();
  }
  async getEvals(options = {}) {
    const { agentName, type, page = 0, perPage = 100, dateRange } = options;
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const conditions = [];
    const queryParams = [];
    let paramIndex = 1;
    if (agentName) {
      conditions.push(`agent_name = $${paramIndex++}`);
      queryParams.push(agentName);
    }
    if (type === "test") {
      conditions.push(`(test_info IS NOT NULL AND test_info->>'testPath' IS NOT NULL)`);
    } else if (type === "live") {
      conditions.push(`(test_info IS NULL OR test_info->>'testPath' IS NULL)`);
    }
    if (fromDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      queryParams.push(fromDate);
    }
    if (toDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      queryParams.push(toDate);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countQuery = `SELECT COUNT(*) FROM ${this.getTableName(TABLE_EVALS)} ${whereClause}`;
    const countResult = await this.db.one(countQuery, queryParams);
    const total = parseInt(countResult.count, 10);
    const currentOffset = page * perPage;
    if (total === 0) {
      return {
        evals: [],
        total: 0,
        page,
        perPage,
        hasMore: false
      };
    }
    const dataQuery = `SELECT * FROM ${this.getTableName(
      TABLE_EVALS
    )} ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const rows = await this.db.manyOrNone(dataQuery, [...queryParams, perPage, currentOffset]);
    return {
      evals: rows?.map((row) => this.transformEvalRow(row)) ?? [],
      total,
      page,
      perPage,
      hasMore: currentOffset + (rows?.length ?? 0) < total
    };
  }
  async updateMessages({
    messages
  }) {
    if (messages.length === 0) {
      return [];
    }
    const messageIds = messages.map((m) => m.id);
    const selectQuery = `SELECT id, content, role, type, "createdAt", thread_id AS "threadId", "resourceId" FROM ${this.getTableName(
      TABLE_MESSAGES
    )} WHERE id IN ($1:list)`;
    const existingMessagesDb = await this.db.manyOrNone(selectQuery, [messageIds]);
    if (existingMessagesDb.length === 0) {
      return [];
    }
    const existingMessages = existingMessagesDb.map((msg) => {
      if (typeof msg.content === "string") {
        try {
          msg.content = JSON.parse(msg.content);
        } catch {
        }
      }
      return msg;
    });
    const threadIdsToUpdate = /* @__PURE__ */ new Set();
    await this.db.tx(async (t) => {
      const queries = [];
      const columnMapping = {
        threadId: "thread_id"
      };
      for (const existingMessage of existingMessages) {
        const updatePayload = messages.find((m) => m.id === existingMessage.id);
        if (!updatePayload) continue;
        const { id, ...fieldsToUpdate } = updatePayload;
        if (Object.keys(fieldsToUpdate).length === 0) continue;
        threadIdsToUpdate.add(existingMessage.threadId);
        if (updatePayload.threadId && updatePayload.threadId !== existingMessage.threadId) {
          threadIdsToUpdate.add(updatePayload.threadId);
        }
        const setClauses = [];
        const values = [];
        let paramIndex = 1;
        const updatableFields = { ...fieldsToUpdate };
        if (updatableFields.content) {
          const newContent = {
            ...existingMessage.content,
            ...updatableFields.content,
            // Deep merge metadata if it exists on both
            ...existingMessage.content?.metadata && updatableFields.content.metadata ? {
              metadata: {
                ...existingMessage.content.metadata,
                ...updatableFields.content.metadata
              }
            } : {}
          };
          setClauses.push(`content = $${paramIndex++}`);
          values.push(newContent);
          delete updatableFields.content;
        }
        for (const key in updatableFields) {
          if (Object.prototype.hasOwnProperty.call(updatableFields, key)) {
            const dbColumn = columnMapping[key] || key;
            setClauses.push(`"${dbColumn}" = $${paramIndex++}`);
            values.push(updatableFields[key]);
          }
        }
        if (setClauses.length > 0) {
          values.push(id);
          const sql = `UPDATE ${this.getTableName(
            TABLE_MESSAGES
          )} SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`;
          queries.push(t.none(sql, values));
        }
      }
      if (threadIdsToUpdate.size > 0) {
        queries.push(
          t.none(`UPDATE ${this.getTableName(TABLE_THREADS)} SET "updatedAt" = NOW() WHERE id IN ($1:list)`, [
            Array.from(threadIdsToUpdate)
          ])
        );
      }
      if (queries.length > 0) {
        await t.batch(queries);
      }
    });
    const updatedMessages = await this.db.manyOrNone(selectQuery, [messageIds]);
    return (updatedMessages || []).map((message) => {
      if (typeof message.content === "string") {
        try {
          message.content = JSON.parse(message.content);
        } catch {
        }
      }
      return message;
    });
  }
};

// src/vector/prompt.ts
var PGVECTOR_PROMPT = `When querying PG Vector, you can ONLY use the operators listed below. Any other operators will be rejected.
Important: Don't explain how to construct the filter - use the specified operators and fields to search the content and return relevant results.
If a user tries to give an explicit operator that is not supported, reject the filter entirely and let them know that the operator is not supported.

Basic Comparison Operators:
- $eq: Exact match (default when using field: value)
  Example: { "category": "electronics" }
- $ne: Not equal
  Example: { "category": { "$ne": "electronics" } }
- $gt: Greater than
  Example: { "price": { "$gt": 100 } }
- $gte: Greater than or equal
  Example: { "price": { "$gte": 100 } }
- $lt: Less than
  Example: { "price": { "$lt": 100 } }
- $lte: Less than or equal
  Example: { "price": { "$lte": 100 } }

Array Operators:
- $in: Match any value in array
  Example: { "category": { "$in": ["electronics", "books"] } }
- $nin: Does not match any value in array
  Example: { "category": { "$nin": ["electronics", "books"] } }
- $all: Match all values in array
  Example: { "tags": { "$all": ["premium", "sale"] } }
- $elemMatch: Match array elements that meet all specified conditions
  Example: { "items": { "$elemMatch": { "price": { "$gt": 100 } } } }
- $contains: Check if array contains value
  Example: { "tags": { "$contains": "premium" } }

Logical Operators:
- $and: Logical AND (implicit when using multiple conditions)
  Example: { "$and": [{ "price": { "$gt": 100 } }, { "category": "electronics" }] }
- $or: Logical OR
  Example: { "$or": [{ "price": { "$lt": 50 } }, { "category": "books" }] }
- $not: Logical NOT
  Example: { "$not": { "category": "electronics" } }
- $nor: Logical NOR
  Example: { "$nor": [{ "price": { "$lt": 50 } }, { "category": "books" }] }

Element Operators:
- $exists: Check if field exists
  Example: { "rating": { "$exists": true } }

Special Operators:
- $size: Array length check
  Example: { "tags": { "$size": 2 } }

Restrictions:
- Regex patterns are not supported
- Direct RegExp patterns will throw an error
- Nested fields are supported using dot notation
- Multiple conditions on the same field are supported with both implicit and explicit $and
- Array operations work on array fields only
- Basic operators handle array values as JSON strings
- Empty arrays in conditions are handled gracefully
- Only logical operators ($and, $or, $not, $nor) can be used at the top level
- All other operators must be used within a field condition
  Valid: { "field": { "$gt": 100 } }
  Valid: { "$and": [...] }
  Invalid: { "$gt": 100 }
  Invalid: { "$contains": "value" }
- Logical operators must contain field conditions, not direct operators
  Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  Invalid: { "$and": [{ "$gt": 100 }] }
- $not operator:
  - Must be an object
  - Cannot be empty
  - Can be used at field level or top level
  - Valid: { "$not": { "field": "value" } }
  - Valid: { "field": { "$not": { "$eq": "value" } } }
- Other logical operators ($and, $or, $nor):
  - Can only be used at top level or nested within other logical operators
  - Can not be used on a field level, or be nested inside a field
  - Can not be used inside an operator
  - Valid: { "$and": [{ "field": { "$gt": 100 } }] }
  - Valid: { "$or": [{ "$and": [{ "field": { "$gt": 100 } }] }] }
  - Invalid: { "field": { "$and": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$or": [{ "$gt": 100 }] } }
  - Invalid: { "field": { "$gt": { "$and": [{...}] } } }
- $elemMatch requires an object with conditions
  Valid: { "array": { "$elemMatch": { "field": "value" } } }
  Invalid: { "array": { "$elemMatch": "value" } }

Example Complex Query:
{
  "$and": [
    { "category": { "$in": ["electronics", "computers"] } },
    { "price": { "$gte": 100, "$lte": 1000 } },
    { "tags": { "$all": ["premium"] } },
    { "rating": { "$exists": true, "$gt": 4 } },
    { "$or": [
      { "stock": { "$gt": 0 } },
      { "preorder": true }
    ]}
  ]
}`;

export { PGVECTOR_PROMPT, PgVector, PostgresStore };
