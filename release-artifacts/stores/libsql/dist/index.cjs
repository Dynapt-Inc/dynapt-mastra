'use strict';

var client = require('@libsql/client');
var utils = require('@mastra/core/utils');
var vector = require('@mastra/core/vector');
var filter = require('@mastra/core/vector/filter');
var agent = require('@mastra/core/agent');
var storage = require('@mastra/core/storage');

// src/vector/index.ts
var LibSQLFilterTranslator = class extends filter.BaseFilterTranslator {
  getSupportedOperators() {
    return {
      ...filter.BaseFilterTranslator.DEFAULT_OPERATORS,
      regex: [],
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
    if (this.isRegex(node)) {
      throw new Error("Direct regex pattern format is not supported in LibSQL");
    }
    const withPath = (result2) => currentPath ? { [currentPath]: result2 } : result2;
    if (this.isPrimitive(node)) {
      return withPath({ $eq: this.normalizeComparisonValue(node) });
    }
    if (Array.isArray(node)) {
      return withPath({ $in: this.normalizeArrayValues(node) });
    }
    const entries = Object.entries(node);
    const result = {};
    for (const [key, value] of entries) {
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
  // TODO: Look more into regex support for LibSQL
  // private translateRegexPattern(pattern: string, options: string = ''): any {
  //   if (!options) return { $regex: pattern };
  //   const flags = options
  //     .split('')
  //     .filter(f => 'imsux'.includes(f))
  //     .join('');
  //   return {
  //     $regex: pattern,
  //     $options: flags,
  //   };
  // }
};
var createBasicOperator = (symbol) => {
  return (key, value) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `CASE 
        WHEN ? IS NULL THEN json_extract(metadata, '$."${jsonPathKey}"') IS ${symbol === "=" ? "" : "NOT"} NULL
        ELSE json_extract(metadata, '$."${jsonPathKey}"') ${symbol} ?
      END`,
      needsValue: true,
      transformValue: () => {
        return [value, value];
      }
    };
  };
};
var createNumericOperator = (symbol) => {
  return (key) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `CAST(json_extract(metadata, '$."${jsonPathKey}"') AS NUMERIC) ${symbol} ?`,
      needsValue: true
    };
  };
};
var validateJsonArray = (key) => `json_valid(json_extract(metadata, '$."${key}"'))
   AND json_type(json_extract(metadata, '$."${key}"')) = 'array'`;
var pattern = /json_extract\(metadata, '\$\."[^"]*"(\."[^"]*")*'\)/g;
function buildElemMatchConditions(value) {
  const conditions = Object.entries(value).map(([field, fieldValue]) => {
    if (field.startsWith("$")) {
      const { sql, values } = buildCondition("elem.value", { [field]: fieldValue });
      const elemSql = sql.replace(pattern, "elem.value");
      return { sql: elemSql, values };
    } else if (typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
      const { sql, values } = buildCondition(field, fieldValue);
      const elemSql = sql.replace(pattern, `json_extract(elem.value, '$."${field}"')`);
      return { sql: elemSql, values };
    } else {
      const parsedFieldKey = utils.parseFieldKey(field);
      return {
        sql: `json_extract(elem.value, '$."${parsedFieldKey}"') = ?`,
        values: [fieldValue]
      };
    }
  });
  return conditions;
}
var FILTER_OPERATORS = {
  $eq: createBasicOperator("="),
  $ne: createBasicOperator("!="),
  $gt: createNumericOperator(">"),
  $gte: createNumericOperator(">="),
  $lt: createNumericOperator("<"),
  $lte: createNumericOperator("<="),
  // Array Operators
  $in: (key, value) => {
    const jsonPathKey = parseJsonPathKey(key);
    const arr = Array.isArray(value) ? value : [value];
    if (arr.length === 0) {
      return { sql: "1 = 0", needsValue: true, transformValue: () => [] };
    }
    const paramPlaceholders = arr.map(() => "?").join(",");
    return {
      sql: `(
      CASE
        WHEN ${validateJsonArray(jsonPathKey)} THEN
          EXISTS (
            SELECT 1 FROM json_each(json_extract(metadata, '$."${jsonPathKey}"')) as elem
            WHERE elem.value IN (SELECT value FROM json_each(?))
          )
        ELSE json_extract(metadata, '$."${jsonPathKey}"') IN (${paramPlaceholders})
      END
    )`,
      needsValue: true,
      transformValue: () => [JSON.stringify(arr), ...arr]
    };
  },
  $nin: (key, value) => {
    const jsonPathKey = parseJsonPathKey(key);
    const arr = Array.isArray(value) ? value : [value];
    if (arr.length === 0) {
      return { sql: "1 = 1", needsValue: true, transformValue: () => [] };
    }
    const paramPlaceholders = arr.map(() => "?").join(",");
    return {
      sql: `(
      CASE
        WHEN ${validateJsonArray(jsonPathKey)} THEN
          NOT EXISTS (
            SELECT 1 FROM json_each(json_extract(metadata, '$."${jsonPathKey}"')) as elem
            WHERE elem.value IN (SELECT value FROM json_each(?))
          )
        ELSE json_extract(metadata, '$."${jsonPathKey}"') NOT IN (${paramPlaceholders})
      END
    )`,
      needsValue: true,
      transformValue: () => [JSON.stringify(arr), ...arr]
    };
  },
  $all: (key, value) => {
    const jsonPathKey = parseJsonPathKey(key);
    let sql;
    const arrayValue = Array.isArray(value) ? value : [value];
    if (arrayValue.length === 0) {
      sql = "1 = 0";
    } else {
      sql = `(
      CASE
        WHEN ${validateJsonArray(jsonPathKey)} THEN
          NOT EXISTS (
            SELECT value
            FROM json_each(?)
            WHERE value NOT IN (
              SELECT value
              FROM json_each(json_extract(metadata, '$."${jsonPathKey}"'))
            )
          )
        ELSE FALSE
      END
    )`;
    }
    return {
      sql,
      needsValue: true,
      transformValue: () => {
        if (arrayValue.length === 0) {
          return [];
        }
        return [JSON.stringify(arrayValue)];
      }
    };
  },
  $elemMatch: (key, value) => {
    const jsonPathKey = parseJsonPathKey(key);
    if (typeof value !== "object" || Array.isArray(value)) {
      throw new Error("$elemMatch requires an object with conditions");
    }
    const conditions = buildElemMatchConditions(value);
    return {
      sql: `(
        CASE
          WHEN ${validateJsonArray(jsonPathKey)} THEN
            EXISTS (
              SELECT 1
              FROM json_each(json_extract(metadata, '$."${jsonPathKey}"')) as elem
              WHERE ${conditions.map((c) => c.sql).join(" AND ")}
            )
          ELSE FALSE
        END
      )`,
      needsValue: true,
      transformValue: () => conditions.flatMap((c) => c.values)
    };
  },
  // Element Operators
  $exists: (key) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `json_extract(metadata, '$."${jsonPathKey}"') IS NOT NULL`,
      needsValue: false
    };
  },
  // Logical Operators
  $and: (key) => ({
    sql: `(${key})`,
    needsValue: false
  }),
  $or: (key) => ({
    sql: `(${key})`,
    needsValue: false
  }),
  $not: (key) => ({ sql: `NOT (${key})`, needsValue: false }),
  $nor: (key) => ({
    sql: `NOT (${key})`,
    needsValue: false
  }),
  $size: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(
    CASE
      WHEN json_type(json_extract(metadata, '$."${jsonPathKey}"')) = 'array' THEN 
        json_array_length(json_extract(metadata, '$."${jsonPathKey}"')) = $${paramIndex}
      ELSE FALSE
    END
  )`,
      needsValue: true
    };
  },
  //   /**
  //    * Regex Operators
  //    * Supports case insensitive and multiline
  //    */
  //   $regex: (key: string): FilterOperator => ({
  //     sql: `json_extract(metadata, '$."${toJsonPathKey(key)}"') = ?`,
  //     needsValue: true,
  //     transformValue: (value: any) => {
  //       const pattern = typeof value === 'object' ? value.$regex : value;
  //       const options = typeof value === 'object' ? value.$options || '' : '';
  //       let sql = `json_extract(metadata, '$."${toJsonPathKey(key)}"')`;
  //       // Handle multiline
  //       //   if (options.includes('m')) {
  //       //     sql = `REPLACE(${sql}, CHAR(10), '\n')`;
  //       //   }
  //       //       let finalPattern = pattern;
  //       // if (options) {
  //       //   finalPattern = `(\\?${options})${pattern}`;
  //       // }
  //       //   // Handle case insensitivity
  //       //   if (options.includes('i')) {
  //       //     sql = `LOWER(${sql}) REGEXP LOWER(?)`;
  //       //   } else {
  //       //     sql = `${sql} REGEXP ?`;
  //       //   }
  //       if (options.includes('m')) {
  //         sql = `EXISTS (
  //         SELECT 1
  //         FROM json_each(
  //           json_array(
  //             ${sql},
  //             REPLACE(${sql}, CHAR(10), CHAR(13))
  //           )
  //         ) as lines
  //         WHERE lines.value REGEXP ?
  //       )`;
  //       } else {
  //         sql = `${sql} REGEXP ?`;
  //       }
  //       // Handle case insensitivity
  //       if (options.includes('i')) {
  //         sql = sql.replace('REGEXP ?', 'REGEXP LOWER(?)');
  //         sql = sql.replace('value REGEXP', 'LOWER(value) REGEXP');
  //       }
  //       // Handle extended - allows whitespace and comments in pattern
  //       if (options.includes('x')) {
  //         // Remove whitespace and comments from pattern
  //         const cleanPattern = pattern.replace(/\s+|#.*$/gm, '');
  //         return {
  //           sql,
  //           values: [cleanPattern],
  //         };
  //       }
  //       return {
  //         sql,
  //         values: [pattern],
  //       };
  //     },
  //   }),
  $contains: (key, value) => {
    const jsonPathKey = parseJsonPathKey(key);
    let sql;
    if (Array.isArray(value)) {
      sql = `(
        SELECT ${validateJsonArray(jsonPathKey)}
        AND EXISTS (
          SELECT 1
          FROM json_each(json_extract(metadata, '$."${jsonPathKey}"')) as m
          WHERE m.value IN (SELECT value FROM json_each(?))
        )
      )`;
    } else if (typeof value === "string") {
      sql = `lower(json_extract(metadata, '$."${jsonPathKey}"')) LIKE '%' || lower(?) || '%' ESCAPE '\\'`;
    } else {
      sql = `json_extract(metadata, '$."${jsonPathKey}"') = ?`;
    }
    return {
      sql,
      needsValue: true,
      transformValue: () => {
        if (Array.isArray(value)) {
          return [JSON.stringify(value)];
        }
        if (typeof value === "object" && value !== null) {
          return [JSON.stringify(value)];
        }
        if (typeof value === "string") {
          return [escapeLikePattern(value)];
        }
        return [value];
      }
    };
  }
  /**
   * $objectContains: True JSON containment for advanced use (deep sub-object match).
   * Usage: { field: { $objectContains: { ...subobject } } }
   */
  // $objectContains: (key: string) => ({
  //   sql: '', // Will be overridden by transformValue
  //   needsValue: true,
  //   transformValue: (value: any) => ({
  //     sql: `json_type(json_extract(metadata, '$."${toJsonPathKey(key)}"')) = 'object'
  //         AND json_patch(json_extract(metadata, '$."${toJsonPathKey(key)}"'), ?) = json_extract(metadata, '$."${toJsonPathKey(key)}"')`,
  //     values: [JSON.stringify(value)],
  //   }),
  // }),
};
function isFilterResult(obj) {
  return obj && typeof obj === "object" && typeof obj.sql === "string" && Array.isArray(obj.values);
}
var parseJsonPathKey = (key) => {
  const parsedKey = utils.parseFieldKey(key);
  return parsedKey.replace(/\./g, '"."');
};
function escapeLikePattern(str) {
  return str.replace(/([%_\\])/g, "\\$1");
}
function buildFilterQuery(filter) {
  if (!filter) {
    return { sql: "", values: [] };
  }
  const values = [];
  const conditions = Object.entries(filter).map(([key, value]) => {
    const condition = buildCondition(key, value);
    values.push(...condition.values);
    return condition.sql;
  }).join(" AND ");
  return {
    sql: conditions ? `WHERE ${conditions}` : "",
    values
  };
}
function buildCondition(key, value, parentPath) {
  if (["$and", "$or", "$not", "$nor"].includes(key)) {
    return handleLogicalOperator(key, value);
  }
  if (!value || typeof value !== "object") {
    return {
      sql: `json_extract(metadata, '$."${key.replace(/\./g, '"."')}"') = ?`,
      values: [value]
    };
  }
  return handleOperator(key, value);
}
function handleLogicalOperator(key, value, parentPath) {
  if (!value || value.length === 0) {
    switch (key) {
      case "$and":
      case "$nor":
        return { sql: "true", values: [] };
      case "$or":
        return { sql: "false", values: [] };
      case "$not":
        throw new Error("$not operator cannot be empty");
      default:
        return { sql: "true", values: [] };
    }
  }
  if (key === "$not") {
    const entries = Object.entries(value);
    const conditions2 = entries.map(([fieldKey, fieldValue]) => buildCondition(fieldKey, fieldValue));
    return {
      sql: `NOT (${conditions2.map((c) => c.sql).join(" AND ")})`,
      values: conditions2.flatMap((c) => c.values)
    };
  }
  const values = [];
  const joinOperator = key === "$or" || key === "$nor" ? "OR" : "AND";
  const conditions = Array.isArray(value) ? value.map((f) => {
    const entries = Object.entries(f);
    return entries.map(([k, v]) => buildCondition(k, v));
  }) : [buildCondition(key, value)];
  const joined = conditions.flat().map((c) => {
    values.push(...c.values);
    return c.sql;
  }).join(` ${joinOperator} `);
  return {
    sql: key === "$nor" ? `NOT (${joined})` : `(${joined})`,
    values
  };
}
function handleOperator(key, value) {
  if (typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value);
    const results = entries.map(
      ([operator2, operatorValue2]) => operator2 === "$not" ? {
        sql: `NOT (${Object.entries(operatorValue2).map(([op, val]) => processOperator(key, op, val).sql).join(" AND ")})`,
        values: Object.entries(operatorValue2).flatMap(
          ([op, val]) => processOperator(key, op, val).values
        )
      } : processOperator(key, operator2, operatorValue2)
    );
    return {
      sql: `(${results.map((r) => r.sql).join(" AND ")})`,
      values: results.flatMap((r) => r.values)
    };
  }
  const [[operator, operatorValue] = []] = Object.entries(value);
  return processOperator(key, operator, operatorValue);
}
var processOperator = (key, operator, operatorValue) => {
  if (!operator.startsWith("$") || !FILTER_OPERATORS[operator]) {
    throw new Error(`Invalid operator: ${operator}`);
  }
  const operatorFn = FILTER_OPERATORS[operator];
  const operatorResult = operatorFn(key, operatorValue);
  if (!operatorResult.needsValue) {
    return { sql: operatorResult.sql, values: [] };
  }
  const transformed = operatorResult.transformValue ? operatorResult.transformValue() : operatorValue;
  if (isFilterResult(transformed)) {
    return transformed;
  }
  return {
    sql: operatorResult.sql,
    values: Array.isArray(transformed) ? transformed : [transformed]
  };
};

// src/vector/index.ts
var LibSQLVector = class extends vector.MastraVector {
  turso;
  maxRetries;
  initialBackoffMs;
  constructor({
    connectionUrl,
    authToken,
    syncUrl,
    syncInterval,
    maxRetries = 5,
    initialBackoffMs = 100
  }) {
    super();
    this.turso = client.createClient({
      url: connectionUrl,
      syncUrl,
      authToken,
      syncInterval
    });
    this.maxRetries = maxRetries;
    this.initialBackoffMs = initialBackoffMs;
    if (connectionUrl.includes(`file:`) || connectionUrl.includes(`:memory:`)) {
      this.turso.execute("PRAGMA journal_mode=WAL;").then(() => this.logger.debug("LibSQLStore: PRAGMA journal_mode=WAL set.")).catch((err) => this.logger.warn("LibSQLStore: Failed to set PRAGMA journal_mode=WAL.", err));
      this.turso.execute("PRAGMA busy_timeout = 5000;").then(() => this.logger.debug("LibSQLStore: PRAGMA busy_timeout=5000 set.")).catch((err) => this.logger.warn("LibSQLStore: Failed to set PRAGMA busy_timeout=5000.", err));
    }
  }
  async executeWriteOperationWithRetry(operation, isTransaction = false) {
    let attempts = 0;
    let backoff = this.initialBackoffMs;
    while (attempts < this.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        if (error.code === "SQLITE_BUSY" || error.message && error.message.toLowerCase().includes("database is locked")) {
          attempts++;
          if (attempts >= this.maxRetries) {
            this.logger.error(
              `LibSQLVector: Operation failed after ${this.maxRetries} attempts due to: ${error.message}`,
              error
            );
            throw error;
          }
          this.logger.warn(
            `LibSQLVector: Attempt ${attempts} failed due to ${isTransaction ? "transaction " : ""}database lock. Retrying in ${backoff}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoff));
          backoff *= 2;
        } else {
          throw error;
        }
      }
    }
    throw new Error("LibSQLVector: Max retries reached, but no error was re-thrown from the loop.");
  }
  transformFilter(filter) {
    const translator = new LibSQLFilterTranslator();
    return translator.translate(filter);
  }
  async query({
    indexName,
    queryVector,
    topK = 10,
    filter,
    includeVector = false,
    minScore = 0
  }) {
    try {
      if (!Number.isInteger(topK) || topK <= 0) {
        throw new Error("topK must be a positive integer");
      }
      if (!Array.isArray(queryVector) || !queryVector.every((x) => typeof x === "number" && Number.isFinite(x))) {
        throw new Error("queryVector must be an array of finite numbers");
      }
      const parsedIndexName = utils.parseSqlIdentifier(indexName, "index name");
      const vectorStr = `[${queryVector.join(",")}]`;
      const translatedFilter = this.transformFilter(filter);
      const { sql: filterQuery, values: filterValues } = buildFilterQuery(translatedFilter);
      filterValues.push(minScore);
      filterValues.push(topK);
      const query = `
      WITH vector_scores AS (
        SELECT
          vector_id as id,
          (1-vector_distance_cos(embedding, '${vectorStr}')) as score,
          metadata
          ${includeVector ? ", vector_extract(embedding) as embedding" : ""}
        FROM ${parsedIndexName}
        ${filterQuery}
      )
      SELECT *
      FROM vector_scores
      WHERE score > ?
      ORDER BY score DESC
      LIMIT ?`;
      const result = await this.turso.execute({
        sql: query,
        args: filterValues
      });
      return result.rows.map(({ id, score, metadata, embedding }) => ({
        id,
        score,
        metadata: JSON.parse(metadata ?? "{}"),
        ...includeVector && embedding && { vector: JSON.parse(embedding) }
      }));
    } finally {
    }
  }
  upsert(args) {
    return this.executeWriteOperationWithRetry(() => this.doUpsert(args), true);
  }
  async doUpsert({ indexName, vectors, metadata, ids }) {
    const tx = await this.turso.transaction("write");
    try {
      const parsedIndexName = utils.parseSqlIdentifier(indexName, "index name");
      const vectorIds = ids || vectors.map(() => crypto.randomUUID());
      for (let i = 0; i < vectors.length; i++) {
        const query = `
            INSERT INTO ${parsedIndexName} (vector_id, embedding, metadata)
            VALUES (?, vector32(?), ?)
            ON CONFLICT(vector_id) DO UPDATE SET
              embedding = vector32(?),
              metadata = ?
          `;
        await tx.execute({
          sql: query,
          args: [
            vectorIds[i],
            JSON.stringify(vectors[i]),
            JSON.stringify(metadata?.[i] || {}),
            JSON.stringify(vectors[i]),
            JSON.stringify(metadata?.[i] || {})
          ]
        });
      }
      await tx.commit();
      return vectorIds;
    } catch (error) {
      await tx.rollback();
      if (error instanceof Error && error.message?.includes("dimensions are different")) {
        const match = error.message.match(/dimensions are different: (\d+) != (\d+)/);
        if (match) {
          const [, actual, expected] = match;
          throw new Error(
            `Vector dimension mismatch: Index "${indexName}" expects ${expected} dimensions but got ${actual} dimensions. Either use a matching embedding model or delete and recreate the index with the new dimension.`
          );
        }
      }
      throw error;
    }
  }
  createIndex(args) {
    return this.executeWriteOperationWithRetry(() => this.doCreateIndex(args));
  }
  async doCreateIndex({ indexName, dimension }) {
    if (!Number.isInteger(dimension) || dimension <= 0) {
      throw new Error("Dimension must be a positive integer");
    }
    const parsedIndexName = utils.parseSqlIdentifier(indexName, "index name");
    await this.turso.execute({
      sql: `
          CREATE TABLE IF NOT EXISTS ${parsedIndexName} (
            id SERIAL PRIMARY KEY,
            vector_id TEXT UNIQUE NOT NULL,
            embedding F32_BLOB(${dimension}),
            metadata TEXT DEFAULT '{}'
          );
        `,
      args: []
    });
    await this.turso.execute({
      sql: `
          CREATE INDEX IF NOT EXISTS ${parsedIndexName}_vector_idx
          ON ${parsedIndexName} (libsql_vector_idx(embedding))
        `,
      args: []
    });
  }
  deleteIndex(args) {
    return this.executeWriteOperationWithRetry(() => this.doDeleteIndex(args));
  }
  async doDeleteIndex({ indexName }) {
    const parsedIndexName = utils.parseSqlIdentifier(indexName, "index name");
    await this.turso.execute({
      sql: `DROP TABLE IF EXISTS ${parsedIndexName}`,
      args: []
    });
  }
  async listIndexes() {
    try {
      const vectorTablesQuery = `
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND sql LIKE '%F32_BLOB%';
      `;
      const result = await this.turso.execute({
        sql: vectorTablesQuery,
        args: []
      });
      return result.rows.map((row) => row.name);
    } catch (error) {
      throw new Error(`Failed to list vector tables: ${error.message}`);
    }
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the index to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName }) {
    try {
      const parsedIndexName = utils.parseSqlIdentifier(indexName, "index name");
      const tableInfoQuery = `
        SELECT sql 
        FROM sqlite_master 
        WHERE type='table' 
        AND name = ?;
      `;
      const tableInfo = await this.turso.execute({
        sql: tableInfoQuery,
        args: [parsedIndexName]
      });
      if (!tableInfo.rows[0]?.sql) {
        throw new Error(`Table ${parsedIndexName} not found`);
      }
      const dimension = parseInt(tableInfo.rows[0].sql.match(/F32_BLOB\((\d+)\)/)?.[1] || "0");
      const countQuery = `
        SELECT COUNT(*) as count
        FROM ${parsedIndexName};
      `;
      const countResult = await this.turso.execute({
        sql: countQuery,
        args: []
      });
      const metric = "cosine";
      return {
        dimension,
        count: countResult?.rows?.[0]?.count ?? 0,
        metric
      };
    } catch (e) {
      throw new Error(`Failed to describe vector table: ${e.message}`);
    }
  }
  /**
   * Updates a vector by its ID with the provided vector and/or metadata.
   *
   * @param indexName - The name of the index containing the vector.
   * @param id - The ID of the vector to update.
   * @param update - An object containing the vector and/or metadata to update.
   * @param update.vector - An optional array of numbers representing the new vector.
   * @param update.metadata - An optional record containing the new metadata.
   * @returns A promise that resolves when the update is complete.
   * @throws Will throw an error if no updates are provided or if the update operation fails.
   */
  updateVector(args) {
    return this.executeWriteOperationWithRetry(() => this.doUpdateVector(args));
  }
  async doUpdateVector({ indexName, id, update }) {
    const parsedIndexName = utils.parseSqlIdentifier(indexName, "index name");
    const updates = [];
    const args = [];
    if (update.vector) {
      updates.push("embedding = vector32(?)");
      args.push(JSON.stringify(update.vector));
    }
    if (update.metadata) {
      updates.push("metadata = ?");
      args.push(JSON.stringify(update.metadata));
    }
    if (updates.length === 0) {
      throw new Error("No updates provided");
    }
    args.push(id);
    const query = `
        UPDATE ${parsedIndexName}
        SET ${updates.join(", ")}
        WHERE vector_id = ?;
      `;
    await this.turso.execute({
      sql: query,
      args
    });
  }
  /**
   * Deletes a vector by its ID.
   * @param indexName - The name of the index containing the vector.
   * @param id - The ID of the vector to delete.
   * @returns A promise that resolves when the deletion is complete.
   * @throws Will throw an error if the deletion operation fails.
   */
  deleteVector(args) {
    return this.executeWriteOperationWithRetry(() => this.doDeleteVector(args));
  }
  async doDeleteVector({ indexName, id }) {
    const parsedIndexName = utils.parseSqlIdentifier(indexName, "index name");
    await this.turso.execute({
      sql: `DELETE FROM ${parsedIndexName} WHERE vector_id = ?`,
      args: [id]
    });
  }
  truncateIndex(args) {
    return this.executeWriteOperationWithRetry(() => this._doTruncateIndex(args));
  }
  async _doTruncateIndex({ indexName }) {
    await this.turso.execute({
      sql: `DELETE FROM ${utils.parseSqlIdentifier(indexName, "index name")}`,
      args: []
    });
  }
};
function safelyParseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
}
var LibSQLStore = class extends storage.MastraStorage {
  client;
  maxRetries;
  initialBackoffMs;
  constructor(config) {
    super({ name: `LibSQLStore` });
    this.maxRetries = config.maxRetries ?? 5;
    this.initialBackoffMs = config.initialBackoffMs ?? 100;
    if (config.url.endsWith(":memory:")) {
      this.shouldCacheInit = false;
    }
    this.client = client.createClient(config);
    if (config.url.startsWith("file:") || config.url.includes(":memory:")) {
      this.client.execute("PRAGMA journal_mode=WAL;").then(() => this.logger.debug("LibSQLStore: PRAGMA journal_mode=WAL set.")).catch((err) => this.logger.warn("LibSQLStore: Failed to set PRAGMA journal_mode=WAL.", err));
      this.client.execute("PRAGMA busy_timeout = 5000;").then(() => this.logger.debug("LibSQLStore: PRAGMA busy_timeout=5000 set.")).catch((err) => this.logger.warn("LibSQLStore: Failed to set PRAGMA busy_timeout.", err));
    }
  }
  get supports() {
    return {
      selectByIncludeResourceScope: true
    };
  }
  getCreateTableSQL(tableName, schema) {
    const parsedTableName = utils.parseSqlIdentifier(tableName, "table name");
    const columns = Object.entries(schema).map(([name, col]) => {
      const parsedColumnName = utils.parseSqlIdentifier(name, "column name");
      let type = col.type.toUpperCase();
      if (type === "TEXT") type = "TEXT";
      if (type === "TIMESTAMP") type = "TEXT";
      const nullable = col.nullable ? "" : "NOT NULL";
      const primaryKey = col.primaryKey ? "PRIMARY KEY" : "";
      return `${parsedColumnName} ${type} ${nullable} ${primaryKey}`.trim();
    });
    if (tableName === storage.TABLE_WORKFLOW_SNAPSHOT) {
      const stmnt = `CREATE TABLE IF NOT EXISTS ${parsedTableName} (
                ${columns.join(",\n")},
                PRIMARY KEY (workflow_name, run_id)
            )`;
      return stmnt;
    }
    return `CREATE TABLE IF NOT EXISTS ${parsedTableName} (${columns.join(", ")})`;
  }
  async createTable({
    tableName,
    schema
  }) {
    try {
      this.logger.debug(`Creating database table`, { tableName, operation: "schema init" });
      const sql = this.getCreateTableSQL(tableName, schema);
      await this.client.execute(sql);
    } catch (error) {
      this.logger.error(`Error creating table ${tableName}: ${error}`);
      throw error;
    }
  }
  getSqlType(type) {
    switch (type) {
      case "bigint":
        return "INTEGER";
      // SQLite uses INTEGER for all integer sizes
      case "jsonb":
        return "TEXT";
      // Store JSON as TEXT in SQLite
      default:
        return super.getSqlType(type);
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
    const parsedTableName = utils.parseSqlIdentifier(tableName, "table name");
    try {
      const pragmaQuery = `PRAGMA table_info(${parsedTableName})`;
      const result = await this.client.execute(pragmaQuery);
      const existingColumnNames = new Set(result.rows.map((row) => row.name.toLowerCase()));
      for (const columnName of ifNotExists) {
        if (!existingColumnNames.has(columnName.toLowerCase()) && schema[columnName]) {
          const columnDef = schema[columnName];
          const sqlType = this.getSqlType(columnDef.type);
          const nullable = columnDef.nullable === false ? "NOT NULL" : "";
          const defaultValue = columnDef.nullable === false ? this.getDefaultValue(columnDef.type) : "";
          const alterSql = `ALTER TABLE ${parsedTableName} ADD COLUMN "${columnName}" ${sqlType} ${nullable} ${defaultValue}`.trim();
          await this.client.execute(alterSql);
          this.logger?.debug?.(`Added column ${columnName} to table ${parsedTableName}`);
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
    const parsedTableName = utils.parseSqlIdentifier(tableName, "table name");
    try {
      await this.client.execute(`DELETE FROM ${parsedTableName}`);
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
    }
  }
  prepareStatement({ tableName, record }) {
    const parsedTableName = utils.parseSqlIdentifier(tableName, "table name");
    const columns = Object.keys(record).map((col) => utils.parseSqlIdentifier(col, "column name"));
    const values = Object.values(record).map((v) => {
      if (typeof v === `undefined`) {
        return null;
      }
      if (v instanceof Date) {
        return v.toISOString();
      }
      return typeof v === "object" ? JSON.stringify(v) : v;
    });
    const placeholders = values.map(() => "?").join(", ");
    return {
      sql: `INSERT OR REPLACE INTO ${parsedTableName} (${columns.join(", ")}) VALUES (${placeholders})`,
      args: values
    };
  }
  async executeWriteOperationWithRetry(operationFn, operationDescription) {
    let retries = 0;
    while (true) {
      try {
        return await operationFn();
      } catch (error) {
        if (error.message && (error.message.includes("SQLITE_BUSY") || error.message.includes("database is locked")) && retries < this.maxRetries) {
          retries++;
          const backoffTime = this.initialBackoffMs * Math.pow(2, retries - 1);
          this.logger.warn(
            `LibSQLStore: Encountered SQLITE_BUSY during ${operationDescription}. Retrying (${retries}/${this.maxRetries}) in ${backoffTime}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        } else {
          this.logger.error(`LibSQLStore: Error during ${operationDescription} after ${retries} retries: ${error}`);
          throw error;
        }
      }
    }
  }
  insert(args) {
    return this.executeWriteOperationWithRetry(() => this.doInsert(args), `insert into table ${args.tableName}`);
  }
  async doInsert({
    tableName,
    record
  }) {
    await this.client.execute(
      this.prepareStatement({
        tableName,
        record
      })
    );
  }
  batchInsert(args) {
    return this.executeWriteOperationWithRetry(
      () => this.doBatchInsert(args),
      `batch insert into table ${args.tableName}`
    );
  }
  async doBatchInsert({
    tableName,
    records
  }) {
    if (records.length === 0) return;
    const batchStatements = records.map((r) => this.prepareStatement({ tableName, record: r }));
    await this.client.batch(batchStatements, "write");
  }
  async load({ tableName, keys }) {
    const parsedTableName = utils.parseSqlIdentifier(tableName, "table name");
    const parsedKeys = Object.keys(keys).map((key) => utils.parseSqlIdentifier(key, "column name"));
    const conditions = parsedKeys.map((key) => `${key} = ?`).join(" AND ");
    const values = Object.values(keys);
    const result = await this.client.execute({
      sql: `SELECT * FROM ${parsedTableName} WHERE ${conditions} ORDER BY createdAt DESC LIMIT 1`,
      args: values
    });
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    const parsed = Object.fromEntries(
      Object.entries(row || {}).map(([k, v]) => {
        try {
          return [k, typeof v === "string" ? v.startsWith("{") || v.startsWith("[") ? JSON.parse(v) : v : v];
        } catch {
          return [k, v];
        }
      })
    );
    return parsed;
  }
  async getThreadById({ threadId }) {
    const result = await this.load({
      tableName: storage.TABLE_THREADS,
      keys: { id: threadId }
    });
    if (!result) {
      return null;
    }
    return {
      ...result,
      metadata: typeof result.metadata === "string" ? JSON.parse(result.metadata) : result.metadata
    };
  }
  /**
   * @deprecated use getThreadsByResourceIdPaginated instead for paginated results.
   */
  async getThreadsByResourceId(args) {
    const { resourceId } = args;
    try {
      const baseQuery = `FROM ${storage.TABLE_THREADS} WHERE resourceId = ?`;
      const queryParams = [resourceId];
      const mapRowToStorageThreadType = (row) => ({
        id: row.id,
        resourceId: row.resourceId,
        title: row.title,
        createdAt: new Date(row.createdAt),
        // Convert string to Date
        updatedAt: new Date(row.updatedAt),
        // Convert string to Date
        metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata
      });
      const result = await this.client.execute({
        sql: `SELECT * ${baseQuery} ORDER BY createdAt DESC`,
        args: queryParams
      });
      if (!result.rows) {
        return [];
      }
      return result.rows.map(mapRowToStorageThreadType);
    } catch (error) {
      this.logger.error(`Error getting threads for resource ${resourceId}:`, error);
      return [];
    }
  }
  async getThreadsByResourceIdPaginated(args) {
    const { resourceId, page = 0, perPage = 100 } = args;
    try {
      const baseQuery = `FROM ${storage.TABLE_THREADS} WHERE resourceId = ?`;
      const queryParams = [resourceId];
      const mapRowToStorageThreadType = (row) => ({
        id: row.id,
        resourceId: row.resourceId,
        title: row.title,
        createdAt: new Date(row.createdAt),
        // Convert string to Date
        updatedAt: new Date(row.updatedAt),
        // Convert string to Date
        metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata
      });
      const currentOffset = page * perPage;
      const countResult = await this.client.execute({
        sql: `SELECT COUNT(*) as count ${baseQuery}`,
        args: queryParams
      });
      const total = Number(countResult.rows?.[0]?.count ?? 0);
      if (total === 0) {
        return {
          threads: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const dataResult = await this.client.execute({
        sql: `SELECT * ${baseQuery} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        args: [...queryParams, perPage, currentOffset]
      });
      const threads = (dataResult.rows || []).map(mapRowToStorageThreadType);
      return {
        threads,
        total,
        page,
        perPage,
        hasMore: currentOffset + threads.length < total
      };
    } catch (error) {
      this.logger.error(`Error getting threads for resource ${resourceId}:`, error);
      return { threads: [], total: 0, page, perPage, hasMore: false };
    }
  }
  async saveThread({ thread }) {
    await this.insert({
      tableName: storage.TABLE_THREADS,
      record: {
        ...thread,
        metadata: JSON.stringify(thread.metadata)
      }
    });
    return thread;
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    const thread = await this.getThreadById({ threadId: id });
    if (!thread) {
      throw new Error(`Thread ${id} not found`);
    }
    const updatedThread = {
      ...thread,
      title,
      metadata: {
        ...thread.metadata,
        ...metadata
      }
    };
    await this.client.execute({
      sql: `UPDATE ${storage.TABLE_THREADS} SET title = ?, metadata = ? WHERE id = ?`,
      args: [title, JSON.stringify(updatedThread.metadata), id]
    });
    return updatedThread;
  }
  async deleteThread({ threadId }) {
    await this.client.execute({
      sql: `DELETE FROM ${storage.TABLE_MESSAGES} WHERE thread_id = ?`,
      args: [threadId]
    });
    await this.client.execute({
      sql: `DELETE FROM ${storage.TABLE_THREADS} WHERE id = ?`,
      args: [threadId]
    });
  }
  parseRow(row) {
    let content = row.content;
    try {
      content = JSON.parse(row.content);
    } catch {
    }
    const result = {
      id: row.id,
      content,
      role: row.role,
      createdAt: new Date(row.createdAt),
      threadId: row.thread_id,
      resourceId: row.resourceId
    };
    if (row.type && row.type !== `v2`) result.type = row.type;
    return result;
  }
  async _getIncludedMessages({
    threadId,
    selectBy
  }) {
    const include = selectBy?.include;
    if (!include) return null;
    const unionQueries = [];
    const params = [];
    for (const inc of include) {
      const { id, withPreviousMessages = 0, withNextMessages = 0 } = inc;
      const searchId = inc.threadId || threadId;
      unionQueries.push(
        `
            SELECT * FROM (
              WITH numbered_messages AS (
                SELECT
                  id, content, role, type, "createdAt", thread_id, "resourceId",
                  ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as row_num
                FROM "${storage.TABLE_MESSAGES}"
                WHERE thread_id = ?
              ),
              target_positions AS (
                SELECT row_num as target_pos
                FROM numbered_messages
                WHERE id = ?
              )
              SELECT DISTINCT m.*
              FROM numbered_messages m
              CROSS JOIN target_positions t
              WHERE m.row_num BETWEEN (t.target_pos - ?) AND (t.target_pos + ?)
            ) 
            `
        // Keep ASC for final sorting after fetching context
      );
      params.push(searchId, id, withPreviousMessages, withNextMessages);
    }
    const finalQuery = unionQueries.join(" UNION ALL ") + ' ORDER BY "createdAt" ASC';
    const includedResult = await this.client.execute({ sql: finalQuery, args: params });
    const includedRows = includedResult.rows?.map((row) => this.parseRow(row));
    const seen = /* @__PURE__ */ new Set();
    const dedupedRows = includedRows.filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
    return dedupedRows;
  }
  async getMessages({
    threadId,
    selectBy,
    format
  }) {
    try {
      const messages = [];
      const limit = typeof selectBy?.last === `number` ? selectBy.last : 40;
      if (selectBy?.include?.length) {
        const includeMessages = await this._getIncludedMessages({ threadId, selectBy });
        if (includeMessages) {
          messages.push(...includeMessages);
        }
      }
      const excludeIds = messages.map((m) => m.id);
      const remainingSql = `
        SELECT 
          id, 
          content, 
          role, 
          type,
          "createdAt", 
          thread_id,
          "resourceId"
        FROM "${storage.TABLE_MESSAGES}"
        WHERE thread_id = ?
        ${excludeIds.length ? `AND id NOT IN (${excludeIds.map(() => "?").join(", ")})` : ""}
        ORDER BY "createdAt" DESC
        LIMIT ?
      `;
      const remainingArgs = [threadId, ...excludeIds.length ? excludeIds : [], limit];
      const remainingResult = await this.client.execute({ sql: remainingSql, args: remainingArgs });
      if (remainingResult.rows) {
        messages.push(...remainingResult.rows.map((row) => this.parseRow(row)));
      }
      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const list = new agent.MessageList().add(messages, "memory");
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      this.logger.error("Error getting messages:", error);
      throw error;
    }
  }
  async getMessagesPaginated(args) {
    const { threadId, format, selectBy } = args;
    const { page = 0, perPage = 40, dateRange } = selectBy?.pagination || {};
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const messages = [];
    if (selectBy?.include?.length) {
      const includeMessages = await this._getIncludedMessages({ threadId, selectBy });
      if (includeMessages) {
        messages.push(...includeMessages);
      }
    }
    try {
      const currentOffset = page * perPage;
      const conditions = [`thread_id = ?`];
      const queryParams = [threadId];
      if (fromDate) {
        conditions.push(`"createdAt" >= ?`);
        queryParams.push(fromDate.toISOString());
      }
      if (toDate) {
        conditions.push(`"createdAt" <= ?`);
        queryParams.push(toDate.toISOString());
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const countResult = await this.client.execute({
        sql: `SELECT COUNT(*) as count FROM ${storage.TABLE_MESSAGES} ${whereClause}`,
        args: queryParams
      });
      const total = Number(countResult.rows?.[0]?.count ?? 0);
      if (total === 0) {
        return {
          messages: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const dataResult = await this.client.execute({
        sql: `SELECT id, content, role, type, "createdAt", thread_id FROM ${storage.TABLE_MESSAGES} ${whereClause} ORDER BY "createdAt" DESC LIMIT ? OFFSET ?`,
        args: [...queryParams, perPage, currentOffset]
      });
      messages.push(...(dataResult.rows || []).map((row) => this.parseRow(row)));
      const messagesToReturn = format === "v1" ? new agent.MessageList().add(messages, "memory").get.all.v1() : new agent.MessageList().add(messages, "memory").get.all.v2();
      return {
        messages: messagesToReturn,
        total,
        page,
        perPage,
        hasMore: currentOffset + messages.length < total
      };
    } catch (error) {
      this.logger.error("Error getting paginated messages:", error);
      return { messages: [], total: 0, page, perPage, hasMore: false };
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
      const batchStatements = messages.map((message) => {
        const time = message.createdAt || /* @__PURE__ */ new Date();
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
        return {
          sql: `INSERT INTO ${storage.TABLE_MESSAGES} (id, thread_id, content, role, type, createdAt, resourceId) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            message.id,
            message.threadId,
            typeof message.content === "object" ? JSON.stringify(message.content) : message.content,
            message.role,
            message.type || "v2",
            time instanceof Date ? time.toISOString() : time,
            message.resourceId
          ]
        };
      });
      const now = (/* @__PURE__ */ new Date()).toISOString();
      batchStatements.push({
        sql: `UPDATE ${storage.TABLE_THREADS} SET updatedAt = ? WHERE id = ?`,
        args: [now, threadId]
      });
      await this.client.batch(batchStatements, "write");
      const list = new agent.MessageList().add(messages, "memory");
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      this.logger.error("Failed to save messages in database: " + error?.message);
      throw error;
    }
  }
  async updateMessages({
    messages
  }) {
    if (messages.length === 0) {
      return [];
    }
    const messageIds = messages.map((m) => m.id);
    const placeholders = messageIds.map(() => "?").join(",");
    const selectSql = `SELECT * FROM ${storage.TABLE_MESSAGES} WHERE id IN (${placeholders})`;
    const existingResult = await this.client.execute({ sql: selectSql, args: messageIds });
    const existingMessages = existingResult.rows.map((row) => this.parseRow(row));
    if (existingMessages.length === 0) {
      return [];
    }
    const batchStatements = [];
    const threadIdsToUpdate = /* @__PURE__ */ new Set();
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
      const args = [];
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
        setClauses.push(`${utils.parseSqlIdentifier("content", "column name")} = ?`);
        args.push(JSON.stringify(newContent));
        delete updatableFields.content;
      }
      for (const key in updatableFields) {
        if (Object.prototype.hasOwnProperty.call(updatableFields, key)) {
          const dbKey = columnMapping[key] || key;
          setClauses.push(`${utils.parseSqlIdentifier(dbKey, "column name")} = ?`);
          let value = updatableFields[key];
          if (typeof value === "object" && value !== null) {
            value = JSON.stringify(value);
          }
          args.push(value);
        }
      }
      if (setClauses.length === 0) continue;
      args.push(id);
      const sql = `UPDATE ${storage.TABLE_MESSAGES} SET ${setClauses.join(", ")} WHERE id = ?`;
      batchStatements.push({ sql, args });
    }
    if (batchStatements.length === 0) {
      return existingMessages;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const threadId of threadIdsToUpdate) {
      if (threadId) {
        batchStatements.push({
          sql: `UPDATE ${storage.TABLE_THREADS} SET updatedAt = ? WHERE id = ?`,
          args: [now, threadId]
        });
      }
    }
    await this.client.batch(batchStatements, "write");
    const updatedResult = await this.client.execute({ sql: selectSql, args: messageIds });
    return updatedResult.rows.map((row) => this.parseRow(row));
  }
  transformEvalRow(row) {
    const resultValue = JSON.parse(row.result);
    const testInfoValue = row.test_info ? JSON.parse(row.test_info) : void 0;
    if (!resultValue || typeof resultValue !== "object" || !("score" in resultValue)) {
      throw new Error(`Invalid MetricResult format: ${JSON.stringify(resultValue)}`);
    }
    return {
      input: row.input,
      output: row.output,
      result: resultValue,
      agentName: row.agent_name,
      metricName: row.metric_name,
      instructions: row.instructions,
      testInfo: testInfoValue,
      globalRunId: row.global_run_id,
      runId: row.run_id,
      createdAt: row.created_at
    };
  }
  /** @deprecated use getEvals instead */
  async getEvalsByAgentName(agentName, type) {
    try {
      const baseQuery = `SELECT * FROM ${storage.TABLE_EVALS} WHERE agent_name = ?`;
      const typeCondition = type === "test" ? " AND test_info IS NOT NULL AND test_info->>'testPath' IS NOT NULL" : type === "live" ? " AND (test_info IS NULL OR test_info->>'testPath' IS NULL)" : "";
      const result = await this.client.execute({
        sql: `${baseQuery}${typeCondition} ORDER BY created_at DESC`,
        args: [agentName]
      });
      return result.rows?.map((row) => this.transformEvalRow(row)) ?? [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("no such table")) {
        return [];
      }
      this.logger.error("Failed to get evals for the specified agent: " + error?.message);
      throw error;
    }
  }
  async getEvals(options = {}) {
    const { agentName, type, page = 0, perPage = 100, dateRange } = options;
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const conditions = [];
    const queryParams = [];
    if (agentName) {
      conditions.push(`agent_name = ?`);
      queryParams.push(agentName);
    }
    if (type === "test") {
      conditions.push(`(test_info IS NOT NULL AND json_extract(test_info, '$.testPath') IS NOT NULL)`);
    } else if (type === "live") {
      conditions.push(`(test_info IS NULL OR json_extract(test_info, '$.testPath') IS NULL)`);
    }
    if (fromDate) {
      conditions.push(`created_at >= ?`);
      queryParams.push(fromDate.toISOString());
    }
    if (toDate) {
      conditions.push(`created_at <= ?`);
      queryParams.push(toDate.toISOString());
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await this.client.execute({
      sql: `SELECT COUNT(*) as count FROM ${storage.TABLE_EVALS} ${whereClause}`,
      args: queryParams
    });
    const total = Number(countResult.rows?.[0]?.count ?? 0);
    const currentOffset = page * perPage;
    const hasMore = currentOffset + perPage < total;
    if (total === 0) {
      return {
        evals: [],
        total: 0,
        page,
        perPage,
        hasMore: false
      };
    }
    const dataResult = await this.client.execute({
      sql: `SELECT * FROM ${storage.TABLE_EVALS} ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...queryParams, perPage, currentOffset]
    });
    return {
      evals: dataResult.rows?.map((row) => this.transformEvalRow(row)) ?? [],
      total,
      page,
      perPage,
      hasMore
    };
  }
  /**
   * @deprecated use getTracesPaginated instead.
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
    const { name, scope, page = 0, perPage = 100, attributes, filters, dateRange } = args;
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const currentOffset = page * perPage;
    const queryArgs = [];
    const conditions = [];
    if (name) {
      conditions.push("name LIKE ?");
      queryArgs.push(`${name}%`);
    }
    if (scope) {
      conditions.push("scope = ?");
      queryArgs.push(scope);
    }
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        conditions.push(`json_extract(attributes, '$.${key}') = ?`);
        queryArgs.push(value);
      });
    }
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        conditions.push(`${utils.parseSqlIdentifier(key, "filter key")} = ?`);
        queryArgs.push(value);
      });
    }
    if (fromDate) {
      conditions.push("createdAt >= ?");
      queryArgs.push(fromDate.toISOString());
    }
    if (toDate) {
      conditions.push("createdAt <= ?");
      queryArgs.push(toDate.toISOString());
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await this.client.execute({
      sql: `SELECT COUNT(*) as count FROM ${storage.TABLE_TRACES} ${whereClause}`,
      args: queryArgs
    });
    const total = Number(countResult.rows?.[0]?.count ?? 0);
    if (total === 0) {
      return {
        traces: [],
        total: 0,
        page,
        perPage,
        hasMore: false
      };
    }
    const dataResult = await this.client.execute({
      sql: `SELECT * FROM ${storage.TABLE_TRACES} ${whereClause} ORDER BY "startTime" DESC LIMIT ? OFFSET ?`,
      args: [...queryArgs, perPage, currentOffset]
    });
    const traces = dataResult.rows?.map(
      (row) => ({
        id: row.id,
        parentSpanId: row.parentSpanId,
        traceId: row.traceId,
        name: row.name,
        scope: row.scope,
        kind: row.kind,
        status: safelyParseJSON(row.status),
        events: safelyParseJSON(row.events),
        links: safelyParseJSON(row.links),
        attributes: safelyParseJSON(row.attributes),
        startTime: row.startTime,
        endTime: row.endTime,
        other: safelyParseJSON(row.other),
        createdAt: row.createdAt
      })
    ) ?? [];
    return {
      traces,
      total,
      page,
      perPage,
      hasMore: currentOffset + traces.length < total
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
      const args = [];
      if (workflowName) {
        conditions.push("workflow_name = ?");
        args.push(workflowName);
      }
      if (fromDate) {
        conditions.push("createdAt >= ?");
        args.push(fromDate.toISOString());
      }
      if (toDate) {
        conditions.push("createdAt <= ?");
        args.push(toDate.toISOString());
      }
      if (resourceId) {
        const hasResourceId = await this.hasColumn(storage.TABLE_WORKFLOW_SNAPSHOT, "resourceId");
        if (hasResourceId) {
          conditions.push("resourceId = ?");
          args.push(resourceId);
        } else {
          console.warn(`[${storage.TABLE_WORKFLOW_SNAPSHOT}] resourceId column not found. Skipping resourceId filter.`);
        }
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      let total = 0;
      if (limit !== void 0 && offset !== void 0) {
        const countResult = await this.client.execute({
          sql: `SELECT COUNT(*) as count FROM ${storage.TABLE_WORKFLOW_SNAPSHOT} ${whereClause}`,
          args
        });
        total = Number(countResult.rows?.[0]?.count ?? 0);
      }
      const result = await this.client.execute({
        sql: `SELECT * FROM ${storage.TABLE_WORKFLOW_SNAPSHOT} ${whereClause} ORDER BY createdAt DESC${limit !== void 0 && offset !== void 0 ? ` LIMIT ? OFFSET ?` : ""}`,
        args: limit !== void 0 && offset !== void 0 ? [...args, limit, offset] : args
      });
      const runs = (result.rows || []).map((row) => this.parseWorkflowRun(row));
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
    const conditions = [];
    const args = [];
    if (runId) {
      conditions.push("run_id = ?");
      args.push(runId);
    }
    if (workflowName) {
      conditions.push("workflow_name = ?");
      args.push(workflowName);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await this.client.execute({
      sql: `SELECT * FROM ${storage.TABLE_WORKFLOW_SNAPSHOT} ${whereClause}`,
      args
    });
    if (!result.rows?.[0]) {
      return null;
    }
    return this.parseWorkflowRun(result.rows[0]);
  }
  async hasColumn(table, column) {
    const result = await this.client.execute({
      sql: `PRAGMA table_info(${table})`
    });
    return (await result.rows)?.some((row) => row.name === column);
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
      resourceId: row.resourceId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
};

// src/vector/prompt.ts
var LIBSQL_PROMPT = `When querying LibSQL Vector, you can ONLY use the operators listed below. Any other operators will be rejected.
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
    { "tags": { "$all": ["premium", "sale"] } },
    { "items": { "$elemMatch": { "price": { "$gt": 50 }, "inStock": true } } },
    { "$or": [
      { "stock": { "$gt": 0 } },
      { "preorder": true }
    ]}
  ]
}`;

exports.DefaultStorage = LibSQLStore;
exports.LIBSQL_PROMPT = LIBSQL_PROMPT;
exports.LibSQLStore = LibSQLStore;
exports.LibSQLVector = LibSQLVector;
