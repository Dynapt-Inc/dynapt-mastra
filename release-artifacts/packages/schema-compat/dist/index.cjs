'use strict';

var zod = require('zod');
var ai = require('ai');
var zodFromJsonSchema = require('zod-from-json-schema');
var zodToJsonSchema = require('zod-to-json-schema');

// src/schema-compatibility.ts
function convertZodSchemaToAISDKSchema(zodSchema, target = "jsonSchema7") {
  return ai.jsonSchema(
    zodToJsonSchema.zodToJsonSchema(zodSchema, {
      $refStrategy: "none",
      target
    }),
    {
      validate: (value) => {
        const result = zodSchema.safeParse(value);
        return result.success ? { success: true, value: result.data } : { success: false, error: result.error };
      }
    }
  );
}
function isZodType(value) {
  return typeof value === "object" && value !== null && "_def" in value && "parse" in value && typeof value.parse === "function" && "safeParse" in value && typeof value.safeParse === "function";
}
function convertSchemaToZod(schema) {
  if (isZodType(schema)) {
    return schema;
  } else {
    const jsonSchemaToConvert = "jsonSchema" in schema ? schema.jsonSchema : schema;
    try {
      return zodFromJsonSchema.convertJsonSchemaToZod(jsonSchemaToConvert);
    } catch (e) {
      const errorMessage = `[Schema Builder] Failed to convert schema parameters to Zod. Original schema: ${JSON.stringify(jsonSchemaToConvert)}`;
      console.error(errorMessage, e);
      throw new Error(errorMessage + (e instanceof Error ? `
${e.stack}` : "\nUnknown error object"));
    }
  }
}
function applyCompatLayer({
  schema,
  compatLayers,
  mode
}) {
  let zodSchema;
  if (!isZodType(schema)) {
    zodSchema = convertSchemaToZod(schema);
  } else {
    zodSchema = schema;
  }
  for (const compat of compatLayers) {
    if (compat.shouldApply()) {
      return mode === "jsonSchema" ? compat.processToJSONSchema(zodSchema) : compat.processToAISDKSchema(zodSchema);
    }
  }
  if (mode === "jsonSchema") {
    return zodToJsonSchema.zodToJsonSchema(zodSchema, { $refStrategy: "none", target: "jsonSchema7" });
  } else {
    return convertZodSchemaToAISDKSchema(zodSchema);
  }
}

// src/schema-compatibility.ts
var ALL_STRING_CHECKS = ["regex", "emoji", "email", "url", "uuid", "cuid", "min", "max"];
var ALL_NUMBER_CHECKS = [
  "min",
  // gte internally
  "max",
  // lte internally
  "multipleOf"
];
var ALL_ARRAY_CHECKS = ["min", "max", "length"];
var isOptional = (v) => v instanceof zod.ZodOptional;
var isObj = (v) => v instanceof zod.ZodObject;
var isArr = (v) => v instanceof zod.ZodArray;
var isUnion = (v) => v instanceof zod.ZodUnion;
var isString = (v) => v instanceof zod.ZodString;
var isNumber = (v) => v instanceof zod.ZodNumber;
var isDate = (v) => v instanceof zod.ZodDate;
var isDefault = (v) => v instanceof zod.ZodDefault;
var UNSUPPORTED_ZOD_TYPES = ["ZodIntersection", "ZodNever", "ZodNull", "ZodTuple", "ZodUndefined"];
var SUPPORTED_ZOD_TYPES = [
  "ZodObject",
  "ZodArray",
  "ZodUnion",
  "ZodString",
  "ZodNumber",
  "ZodDate",
  "ZodAny",
  "ZodDefault"
];
var ALL_ZOD_TYPES = [...SUPPORTED_ZOD_TYPES, ...UNSUPPORTED_ZOD_TYPES];
var SchemaCompatLayer = class {
  model;
  /**
   * Creates a new schema compatibility instance.
   *
   * @param model - The language model this compatibility layer applies to
   */
  constructor(model) {
    this.model = model;
  }
  /**
   * Gets the language model associated with this compatibility layer.
   *
   * @returns The language model instance
   */
  getModel() {
    return this.model;
  }
  /**
   * Default handler for Zod object types. Recursively processes all properties in the object.
   *
   * @param value - The Zod object to process
   * @returns The processed Zod object
   */
  defaultZodObjectHandler(value) {
    const processedShape = Object.entries(value.shape).reduce((acc, [key, propValue]) => {
      acc[key] = this.processZodType(propValue);
      return acc;
    }, {});
    let result = zod.z.object(processedShape);
    if (value._def.unknownKeys === "strict") {
      result = result.strict();
    }
    if (value._def.catchall && !(value._def.catchall instanceof zod.z.ZodNever)) {
      result = result.catchall(value._def.catchall);
    }
    if (value.description) {
      result = result.describe(value.description);
    }
    return result;
  }
  /**
   * Merges validation constraints into a parameter description.
   *
   * This helper method converts validation constraints that may not be supported
   * by a provider into human-readable descriptions.
   *
   * @param description - The existing parameter description
   * @param constraints - The validation constraints to merge
   * @returns The updated description with constraints, or undefined if no constraints
   */
  mergeParameterDescription(description, constraints) {
    if (Object.keys(constraints).length > 0) {
      return (description ? description + "\n" : "") + JSON.stringify(constraints);
    } else {
      return description;
    }
  }
  /**
   * Default handler for unsupported Zod types. Throws an error for specified unsupported types.
   *
   * @param value - The Zod type to check
   * @param throwOnTypes - Array of type names to throw errors for
   * @returns The original value if not in the throw list
   * @throws Error if the type is in the unsupported list
   */
  defaultUnsupportedZodTypeHandler(value, throwOnTypes = UNSUPPORTED_ZOD_TYPES) {
    if (throwOnTypes.includes(value._def.typeName)) {
      throw new Error(`${this.model.modelId} does not support zod type: ${value._def.typeName}`);
    }
    return value;
  }
  /**
   * Default handler for Zod array types. Processes array constraints according to provider support.
   *
   * @param value - The Zod array to process
   * @param handleChecks - Array constraints to convert to descriptions vs keep as validation
   * @returns The processed Zod array
   */
  defaultZodArrayHandler(value, handleChecks = ALL_ARRAY_CHECKS) {
    const zodArrayDef = value._def;
    const processedType = this.processZodType(zodArrayDef.type);
    let result = zod.z.array(processedType);
    const constraints = {};
    if (zodArrayDef.minLength?.value !== void 0) {
      if (handleChecks.includes("min")) {
        constraints.minLength = zodArrayDef.minLength.value;
      } else {
        result = result.min(zodArrayDef.minLength.value);
      }
    }
    if (zodArrayDef.maxLength?.value !== void 0) {
      if (handleChecks.includes("max")) {
        constraints.maxLength = zodArrayDef.maxLength.value;
      } else {
        result = result.max(zodArrayDef.maxLength.value);
      }
    }
    if (zodArrayDef.exactLength?.value !== void 0) {
      if (handleChecks.includes("length")) {
        constraints.exactLength = zodArrayDef.exactLength.value;
      } else {
        result = result.length(zodArrayDef.exactLength.value);
      }
    }
    const description = this.mergeParameterDescription(value.description, constraints);
    if (description) {
      result = result.describe(description);
    }
    return result;
  }
  /**
   * Default handler for Zod union types. Processes all union options.
   *
   * @param value - The Zod union to process
   * @returns The processed Zod union
   * @throws Error if union has fewer than 2 options
   */
  defaultZodUnionHandler(value) {
    const processedOptions = value._def.options.map((option) => this.processZodType(option));
    if (processedOptions.length < 2) throw new Error("Union must have at least 2 options");
    let result = zod.z.union(processedOptions);
    if (value.description) {
      result = result.describe(value.description);
    }
    return result;
  }
  /**
   * Default handler for Zod string types. Processes string validation constraints.
   *
   * @param value - The Zod string to process
   * @param handleChecks - String constraints to convert to descriptions vs keep as validation
   * @returns The processed Zod string
   */
  defaultZodStringHandler(value, handleChecks = ALL_STRING_CHECKS) {
    const constraints = {};
    const checks = value._def.checks || [];
    const newChecks = [];
    for (const check of checks) {
      if ("kind" in check) {
        if (handleChecks.includes(check.kind)) {
          switch (check.kind) {
            case "regex": {
              constraints.regex = {
                pattern: check.regex.source,
                flags: check.regex.flags
              };
              break;
            }
            case "emoji": {
              constraints.emoji = true;
              break;
            }
            case "email": {
              constraints.email = true;
              break;
            }
            case "url": {
              constraints.url = true;
              break;
            }
            case "uuid": {
              constraints.uuid = true;
              break;
            }
            case "cuid": {
              constraints.cuid = true;
              break;
            }
            case "min": {
              constraints.minLength = check.value;
              break;
            }
            case "max": {
              constraints.maxLength = check.value;
              break;
            }
          }
        } else {
          newChecks.push(check);
        }
      }
    }
    let result = zod.z.string();
    for (const check of newChecks) {
      result = result._addCheck(check);
    }
    const description = this.mergeParameterDescription(value.description, constraints);
    if (description) {
      result = result.describe(description);
    }
    return result;
  }
  /**
   * Default handler for Zod number types. Processes number validation constraints.
   *
   * @param value - The Zod number to process
   * @param handleChecks - Number constraints to convert to descriptions vs keep as validation
   * @returns The processed Zod number
   */
  defaultZodNumberHandler(value, handleChecks = ALL_NUMBER_CHECKS) {
    const constraints = {};
    const checks = value._def.checks || [];
    const newChecks = [];
    for (const check of checks) {
      if ("kind" in check) {
        if (handleChecks.includes(check.kind)) {
          switch (check.kind) {
            case "min":
              if (check.inclusive) {
                constraints.gte = check.value;
              } else {
                constraints.gt = check.value;
              }
              break;
            case "max":
              if (check.inclusive) {
                constraints.lte = check.value;
              } else {
                constraints.lt = check.value;
              }
              break;
            case "multipleOf": {
              constraints.multipleOf = check.value;
              break;
            }
          }
        } else {
          newChecks.push(check);
        }
      }
    }
    let result = zod.z.number();
    for (const check of newChecks) {
      switch (check.kind) {
        case "int":
          result = result.int();
          break;
        case "finite":
          result = result.finite();
          break;
        default:
          result = result._addCheck(check);
      }
    }
    const description = this.mergeParameterDescription(value.description, constraints);
    if (description) {
      result = result.describe(description);
    }
    return result;
  }
  /**
   * Default handler for Zod date types. Converts dates to ISO strings with constraint descriptions.
   *
   * @param value - The Zod date to process
   * @returns A Zod string schema representing the date in ISO format
   */
  defaultZodDateHandler(value) {
    const constraints = {};
    const checks = value._def.checks || [];
    for (const check of checks) {
      if ("kind" in check) {
        switch (check.kind) {
          case "min":
            const minDate = new Date(check.value);
            if (!isNaN(minDate.getTime())) {
              constraints.minDate = minDate.toISOString();
            }
            break;
          case "max":
            const maxDate = new Date(check.value);
            if (!isNaN(maxDate.getTime())) {
              constraints.maxDate = maxDate.toISOString();
            }
            break;
        }
      }
    }
    constraints.dateFormat = "date-time";
    let result = zod.z.string().describe("date-time");
    const description = this.mergeParameterDescription(value.description, constraints);
    if (description) {
      result = result.describe(description);
    }
    return result;
  }
  /**
   * Default handler for Zod optional types. Processes the inner type and maintains optionality.
   *
   * @param value - The Zod optional to process
   * @param handleTypes - Types that should be processed vs passed through
   * @returns The processed Zod optional
   */
  defaultZodOptionalHandler(value, handleTypes = SUPPORTED_ZOD_TYPES) {
    if (handleTypes.includes(value._def.innerType._def.typeName)) {
      return this.processZodType(value._def.innerType).optional();
    } else {
      return value;
    }
  }
  /**
   * Processes a Zod object schema and converts it to an AI SDK Schema.
   *
   * @param zodSchema - The Zod object schema to process
   * @returns An AI SDK Schema with provider-specific compatibility applied
   */
  processToAISDKSchema(zodSchema) {
    const processedSchema = this.processZodType(zodSchema);
    return convertZodSchemaToAISDKSchema(processedSchema, this.getSchemaTarget());
  }
  /**
   * Processes a Zod object schema and converts it to a JSON Schema.
   *
   * @param zodSchema - The Zod object schema to process
   * @returns A JSONSchema7 object with provider-specific compatibility applied
   */
  processToJSONSchema(zodSchema) {
    return this.processToAISDKSchema(zodSchema).jsonSchema;
  }
};

// src/provider-compats/anthropic.ts
var AnthropicSchemaCompatLayer = class extends SchemaCompatLayer {
  constructor(model) {
    super(model);
  }
  getSchemaTarget() {
    return "jsonSchema7";
  }
  shouldApply() {
    return this.getModel().modelId.includes("claude");
  }
  processZodType(value) {
    if (isOptional(value)) {
      const handleTypes = ["ZodObject", "ZodArray", "ZodUnion", "ZodNever", "ZodUndefined"];
      if (this.getModel().modelId.includes("claude-3.5-haiku")) handleTypes.push("ZodString");
      if (this.getModel().modelId.includes("claude-3.7")) handleTypes.push("ZodTuple");
      return this.defaultZodOptionalHandler(value, handleTypes);
    } else if (isObj(value)) {
      return this.defaultZodObjectHandler(value);
    } else if (isArr(value)) {
      return this.defaultZodArrayHandler(value, []);
    } else if (isUnion(value)) {
      return this.defaultZodUnionHandler(value);
    } else if (isString(value)) {
      if (this.getModel().modelId.includes("claude-3.5-haiku")) {
        return this.defaultZodStringHandler(value, ["max", "min"]);
      } else {
        return value;
      }
    }
    if (this.getModel().modelId.includes("claude-3.7")) {
      return this.defaultUnsupportedZodTypeHandler(value, ["ZodNever", "ZodTuple", "ZodUndefined"]);
    } else {
      return this.defaultUnsupportedZodTypeHandler(value, ["ZodNever", "ZodUndefined"]);
    }
  }
};

// src/provider-compats/deepseek.ts
var DeepSeekSchemaCompatLayer = class extends SchemaCompatLayer {
  constructor(model) {
    super(model);
  }
  getSchemaTarget() {
    return "jsonSchema7";
  }
  shouldApply() {
    return this.getModel().modelId.includes("deepseek") && !this.getModel().modelId.includes("r1");
  }
  processZodType(value) {
    if (isOptional(value)) {
      return this.defaultZodOptionalHandler(value, ["ZodObject", "ZodArray", "ZodUnion", "ZodString", "ZodNumber"]);
    } else if (isObj(value)) {
      return this.defaultZodObjectHandler(value);
    } else if (isArr(value)) {
      return this.defaultZodArrayHandler(value, ["min", "max"]);
    } else if (isUnion(value)) {
      return this.defaultZodUnionHandler(value);
    } else if (isString(value)) {
      return this.defaultZodStringHandler(value);
    }
    return value;
  }
};

// src/provider-compats/google.ts
var GoogleSchemaCompatLayer = class extends SchemaCompatLayer {
  constructor(model) {
    super(model);
  }
  getSchemaTarget() {
    return "jsonSchema7";
  }
  shouldApply() {
    return this.getModel().provider.includes("google") || this.getModel().modelId.includes("google");
  }
  processZodType(value) {
    if (isOptional(value)) {
      return this.defaultZodOptionalHandler(value, [
        "ZodObject",
        "ZodArray",
        "ZodUnion",
        "ZodString",
        "ZodNumber",
        ...UNSUPPORTED_ZOD_TYPES
      ]);
    } else if (isObj(value)) {
      return this.defaultZodObjectHandler(value);
    } else if (isArr(value)) {
      return this.defaultZodArrayHandler(value, []);
    } else if (isUnion(value)) {
      return this.defaultZodUnionHandler(value);
    } else if (isString(value)) {
      return this.defaultZodStringHandler(value);
    } else if (isNumber(value)) {
      return this.defaultZodNumberHandler(value);
    }
    return this.defaultUnsupportedZodTypeHandler(value);
  }
};

// src/provider-compats/meta.ts
var MetaSchemaCompatLayer = class extends SchemaCompatLayer {
  constructor(model) {
    super(model);
  }
  getSchemaTarget() {
    return "jsonSchema7";
  }
  shouldApply() {
    return this.getModel().modelId.includes("meta");
  }
  processZodType(value) {
    if (isOptional(value)) {
      return this.defaultZodOptionalHandler(value, ["ZodObject", "ZodArray", "ZodUnion", "ZodString", "ZodNumber"]);
    } else if (isObj(value)) {
      return this.defaultZodObjectHandler(value);
    } else if (isArr(value)) {
      return this.defaultZodArrayHandler(value, ["min", "max"]);
    } else if (isUnion(value)) {
      return this.defaultZodUnionHandler(value);
    } else if (isNumber(value)) {
      return this.defaultZodNumberHandler(value);
    } else if (isString(value)) {
      return this.defaultZodStringHandler(value);
    }
    return value;
  }
};

// src/provider-compats/openai.ts
var OpenAISchemaCompatLayer = class extends SchemaCompatLayer {
  constructor(model) {
    super(model);
  }
  getSchemaTarget() {
    return `jsonSchema7`;
  }
  shouldApply() {
    if (!this.getModel().supportsStructuredOutputs && (this.getModel().provider.includes(`openai`) || this.getModel().modelId.includes(`openai`))) {
      return true;
    }
    return false;
  }
  processZodType(value) {
    if (isOptional(value)) {
      return this.defaultZodOptionalHandler(value, [
        "ZodObject",
        "ZodArray",
        "ZodUnion",
        "ZodString",
        "ZodNever",
        "ZodUndefined",
        "ZodTuple"
      ]);
    } else if (isObj(value)) {
      return this.defaultZodObjectHandler(value);
    } else if (isUnion(value)) {
      return this.defaultZodUnionHandler(value);
    } else if (isArr(value)) {
      return this.defaultZodArrayHandler(value);
    } else if (isString(value)) {
      const model = this.getModel();
      const checks = ["emoji"];
      if (model.modelId.includes("gpt-4o-mini")) {
        checks.push("regex");
      }
      return this.defaultZodStringHandler(value, checks);
    }
    return this.defaultUnsupportedZodTypeHandler(value, ["ZodNever", "ZodUndefined", "ZodTuple"]);
  }
};
var OpenAIReasoningSchemaCompatLayer = class extends SchemaCompatLayer {
  constructor(model) {
    super(model);
  }
  getSchemaTarget() {
    return `openApi3`;
  }
  isReasoningModel() {
    return this.getModel().modelId.includes(`o3`) || this.getModel().modelId.includes(`o4`);
  }
  shouldApply() {
    if ((this.getModel().supportsStructuredOutputs || this.isReasoningModel()) && (this.getModel().provider.includes(`openai`) || this.getModel().modelId.includes(`openai`))) {
      return true;
    }
    return false;
  }
  processZodType(value) {
    if (isOptional(value)) {
      const innerZodType = this.processZodType(value._def.innerType);
      return innerZodType.nullable();
    } else if (isObj(value)) {
      return this.defaultZodObjectHandler(value);
    } else if (isArr(value)) {
      return this.defaultZodArrayHandler(value);
    } else if (isUnion(value)) {
      return this.defaultZodUnionHandler(value);
    } else if (isDefault(value)) {
      const defaultDef = value._def;
      const innerType = defaultDef.innerType;
      const defaultValue = defaultDef.defaultValue();
      const constraints = {};
      if (defaultValue !== void 0) {
        constraints.defaultValue = defaultValue;
      }
      const description = this.mergeParameterDescription(value.description, constraints);
      let result = this.processZodType(innerType);
      if (description) {
        result = result.describe(description);
      }
      return result;
    } else if (isNumber(value)) {
      return this.defaultZodNumberHandler(value);
    } else if (isString(value)) {
      return this.defaultZodStringHandler(value);
    } else if (isDate(value)) {
      return this.defaultZodDateHandler(value);
    } else if (value._def.typeName === "ZodAny") {
      return zod.z.string().describe(
        (value.description ?? "") + `
Argument was an "any" type, but you (the LLM) do not support "any", so it was cast to a "string" type`
      );
    }
    return this.defaultUnsupportedZodTypeHandler(value);
  }
};

exports.ALL_ARRAY_CHECKS = ALL_ARRAY_CHECKS;
exports.ALL_NUMBER_CHECKS = ALL_NUMBER_CHECKS;
exports.ALL_STRING_CHECKS = ALL_STRING_CHECKS;
exports.ALL_ZOD_TYPES = ALL_ZOD_TYPES;
exports.AnthropicSchemaCompatLayer = AnthropicSchemaCompatLayer;
exports.DeepSeekSchemaCompatLayer = DeepSeekSchemaCompatLayer;
exports.GoogleSchemaCompatLayer = GoogleSchemaCompatLayer;
exports.MetaSchemaCompatLayer = MetaSchemaCompatLayer;
exports.OpenAIReasoningSchemaCompatLayer = OpenAIReasoningSchemaCompatLayer;
exports.OpenAISchemaCompatLayer = OpenAISchemaCompatLayer;
exports.SUPPORTED_ZOD_TYPES = SUPPORTED_ZOD_TYPES;
exports.SchemaCompatLayer = SchemaCompatLayer;
exports.UNSUPPORTED_ZOD_TYPES = UNSUPPORTED_ZOD_TYPES;
exports.applyCompatLayer = applyCompatLayer;
exports.convertSchemaToZod = convertSchemaToZod;
exports.convertZodSchemaToAISDKSchema = convertZodSchemaToAISDKSchema;
exports.isArr = isArr;
exports.isNumber = isNumber;
exports.isObj = isObj;
exports.isOptional = isOptional;
exports.isString = isString;
exports.isUnion = isUnion;
