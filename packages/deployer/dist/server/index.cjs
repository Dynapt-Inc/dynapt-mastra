'use strict';

var crypto = require('crypto');
var promises = require('fs/promises');
var posix = require('path/posix');
var http = require('http');
var http2 = require('http2');
var stream = require('stream');
var filepath = require('hono/utils/filepath');
var mime = require('hono/utils/mime');
var fs = require('fs');
var html = require('hono/html');
var core = require('@mastra/core');
var runtimeContext = require('@mastra/core/runtime-context');
var hono = require('hono');
var bodyLimit = require('hono/body-limit');
var cors = require('hono/cors');
var logger = require('hono/logger');
var timeout = require('hono/timeout');
var httpException = require('hono/http-exception');
var a2a = require('@mastra/server/handlers/a2a');
var streaming = require('hono/streaming');
var agents = require('@mastra/server/handlers/agents');
var legacyWorkflows = require('@mastra/server/handlers/legacyWorkflows');
var logs = require('@mastra/server/handlers/logs');
var util = require('util');
var buffer = require('buffer');
var memory = require('@mastra/server/handlers/memory');
var network = require('@mastra/server/handlers/network');
var agent = require('@mastra/core/agent');
var zod = require('zod');
var telemetry = require('@mastra/server/handlers/telemetry');
var tools = require('@mastra/server/handlers/tools');
var vector = require('@mastra/server/handlers/vector');
var voice = require('@mastra/server/handlers/voice');
var workflows = require('@mastra/server/handlers/workflows');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var crypto__default = /*#__PURE__*/_interopDefault(crypto);
var util__default = /*#__PURE__*/_interopDefault(util);

// src/server/index.ts
var RequestError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "RequestError";
  }
};
var toRequestError = (e2) => {
  if (e2 instanceof RequestError) {
    return e2;
  }
  return new RequestError(e2.message, { cause: e2 });
};
var GlobalRequest = global.Request;
var Request = class extends GlobalRequest {
  constructor(input, options) {
    if (typeof input === "object" && getRequestCache in input) {
      input = input[getRequestCache]();
    }
    if (typeof options?.body?.getReader !== "undefined") {
      options.duplex ??= "half";
    }
    super(input, options);
  }
};
var newRequestFromIncoming = (method, url, incoming, abortController) => {
  const headerRecord = [];
  const rawHeaders = incoming.rawHeaders;
  for (let i2 = 0; i2 < rawHeaders.length; i2 += 2) {
    const { [i2]: key, [i2 + 1]: value } = rawHeaders;
    if (key.charCodeAt(0) !== /*:*/
    58) {
      headerRecord.push([key, value]);
    }
  }
  const init = {
    method,
    headers: headerRecord,
    signal: abortController.signal
  };
  if (method === "TRACE") {
    init.method = "GET";
    const req = new Request(url, init);
    Object.defineProperty(req, "method", {
      get() {
        return "TRACE";
      }
    });
    return req;
  }
  if (!(method === "GET" || method === "HEAD")) {
    if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) {
      init.body = new ReadableStream({
        start(controller) {
          controller.enqueue(incoming.rawBody);
          controller.close();
        }
      });
    } else {
      init.body = stream.Readable.toWeb(incoming);
    }
  }
  return new Request(url, init);
};
var getRequestCache = Symbol("getRequestCache");
var requestCache = Symbol("requestCache");
var incomingKey = Symbol("incomingKey");
var urlKey = Symbol("urlKey");
var abortControllerKey = Symbol("abortControllerKey");
var getAbortController = Symbol("getAbortController");
var requestPrototype = {
  get method() {
    return this[incomingKey].method || "GET";
  },
  get url() {
    return this[urlKey];
  },
  [getAbortController]() {
    this[getRequestCache]();
    return this[abortControllerKey];
  },
  [getRequestCache]() {
    this[abortControllerKey] ||= new AbortController();
    return this[requestCache] ||= newRequestFromIncoming(
      this.method,
      this[urlKey],
      this[incomingKey],
      this[abortControllerKey]
    );
  }
};
[
  "body",
  "bodyUsed",
  "cache",
  "credentials",
  "destination",
  "headers",
  "integrity",
  "mode",
  "redirect",
  "referrer",
  "referrerPolicy",
  "signal",
  "keepalive"
].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    get() {
      return this[getRequestCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    value: function() {
      return this[getRequestCache]()[k]();
    }
  });
});
Object.setPrototypeOf(requestPrototype, Request.prototype);
var newRequest = (incoming, defaultHostname) => {
  const req = Object.create(requestPrototype);
  req[incomingKey] = incoming;
  const incomingUrl = incoming.url || "";
  if (incomingUrl[0] !== "/" && // short-circuit for performance. most requests are relative URL.
  (incomingUrl.startsWith("http://") || incomingUrl.startsWith("https://"))) {
    if (incoming instanceof http2.Http2ServerRequest) {
      throw new RequestError("Absolute URL for :path is not allowed in HTTP/2");
    }
    try {
      const url2 = new URL(incomingUrl);
      req[urlKey] = url2.href;
    } catch (e2) {
      throw new RequestError("Invalid absolute URL", { cause: e2 });
    }
    return req;
  }
  const host = (incoming instanceof http2.Http2ServerRequest ? incoming.authority : incoming.headers.host) || defaultHostname;
  if (!host) {
    throw new RequestError("Missing host header");
  }
  let scheme;
  if (incoming instanceof http2.Http2ServerRequest) {
    scheme = incoming.scheme;
    if (!(scheme === "http" || scheme === "https")) {
      throw new RequestError("Unsupported scheme");
    }
  } else {
    scheme = incoming.socket && incoming.socket.encrypted ? "https" : "http";
  }
  const url = new URL(`${scheme}://${host}${incomingUrl}`);
  if (url.hostname.length !== host.length && url.hostname !== host.replace(/:\d+$/, "")) {
    throw new RequestError("Invalid host header");
  }
  req[urlKey] = url.href;
  return req;
};
var responseCache = Symbol("responseCache");
var getResponseCache = Symbol("getResponseCache");
var cacheKey = Symbol("cache");
var GlobalResponse = global.Response;
var Response2 = class _Response {
  #body;
  #init;
  [getResponseCache]() {
    delete this[cacheKey];
    return this[responseCache] ||= new GlobalResponse(this.#body, this.#init);
  }
  constructor(body, init) {
    let headers;
    this.#body = body;
    if (init instanceof _Response) {
      const cachedGlobalResponse = init[responseCache];
      if (cachedGlobalResponse) {
        this.#init = cachedGlobalResponse;
        this[getResponseCache]();
        return;
      } else {
        this.#init = init.#init;
        headers = new Headers(init.#init.headers);
      }
    } else {
      this.#init = init;
    }
    if (typeof body === "string" || typeof body?.getReader !== "undefined" || body instanceof Blob || body instanceof Uint8Array) {
      headers ||= init?.headers || { "content-type": "text/plain; charset=UTF-8" };
      this[cacheKey] = [init?.status || 200, body, headers];
    }
  }
  get headers() {
    const cache = this[cacheKey];
    if (cache) {
      if (!(cache[2] instanceof Headers)) {
        cache[2] = new Headers(cache[2]);
      }
      return cache[2];
    }
    return this[getResponseCache]().headers;
  }
  get status() {
    return this[cacheKey]?.[0] ?? this[getResponseCache]().status;
  }
  get ok() {
    const status = this.status;
    return status >= 200 && status < 300;
  }
};
["body", "bodyUsed", "redirected", "statusText", "trailers", "type", "url"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    get() {
      return this[getResponseCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    value: function() {
      return this[getResponseCache]()[k]();
    }
  });
});
Object.setPrototypeOf(Response2, GlobalResponse);
Object.setPrototypeOf(Response2.prototype, GlobalResponse.prototype);
function writeFromReadableStream(stream4, writable) {
  if (stream4.locked) {
    throw new TypeError("ReadableStream is locked.");
  } else if (writable.destroyed) {
    stream4.cancel();
    return;
  }
  const reader = stream4.getReader();
  writable.on("close", cancel);
  writable.on("error", cancel);
  reader.read().then(flow, cancel);
  return reader.closed.finally(() => {
    writable.off("close", cancel);
    writable.off("error", cancel);
  });
  function cancel(error) {
    reader.cancel(error).catch(() => {
    });
    if (error) {
      writable.destroy(error);
    }
  }
  function onDrain() {
    reader.read().then(flow, cancel);
  }
  function flow({ done, value }) {
    try {
      if (done) {
        writable.end();
      } else if (!writable.write(value)) {
        writable.once("drain", onDrain);
      } else {
        return reader.read().then(flow, cancel);
      }
    } catch (e2) {
      cancel(e2);
    }
  }
}
var buildOutgoingHttpHeaders = (headers) => {
  const res = {};
  if (!(headers instanceof Headers)) {
    headers = new Headers(headers ?? void 0);
  }
  const cookies = [];
  for (const [k, v] of headers) {
    if (k === "set-cookie") {
      cookies.push(v);
    } else {
      res[k] = v;
    }
  }
  if (cookies.length > 0) {
    res["set-cookie"] = cookies;
  }
  res["content-type"] ??= "text/plain; charset=UTF-8";
  return res;
};
var X_ALREADY_SENT = "x-hono-already-sent";
var webFetch = global.fetch;
if (typeof global.crypto === "undefined") {
  global.crypto = crypto__default.default;
}
global.fetch = (info, init) => {
  init = {
    // Disable compression handling so people can return the result of a fetch
    // directly in the loader without messing with the Content-Encoding header.
    compress: false,
    ...init
  };
  return webFetch(info, init);
};
var regBuffer = /^no$/i;
var regContentType = /^(application\/json\b|text\/(?!event-stream\b))/i;
var handleRequestError = () => new Response(null, {
  status: 400
});
var handleFetchError = (e2) => new Response(null, {
  status: e2 instanceof Error && (e2.name === "TimeoutError" || e2.constructor.name === "TimeoutError") ? 504 : 500
});
var handleResponseError = (e2, outgoing) => {
  const err = e2 instanceof Error ? e2 : new Error("unknown error", { cause: e2 });
  if (err.code === "ERR_STREAM_PREMATURE_CLOSE") {
    console.info("The user aborted a request.");
  } else {
    console.error(e2);
    if (!outgoing.headersSent) {
      outgoing.writeHead(500, { "Content-Type": "text/plain" });
    }
    outgoing.end(`Error: ${err.message}`);
    outgoing.destroy(err);
  }
};
var flushHeaders = (outgoing) => {
  if ("flushHeaders" in outgoing && outgoing.writable) {
    outgoing.flushHeaders();
  }
};
var responseViaCache = async (res, outgoing) => {
  let [status, body, header] = res[cacheKey];
  if (header instanceof Headers) {
    header = buildOutgoingHttpHeaders(header);
  }
  if (typeof body === "string") {
    header["Content-Length"] = Buffer.byteLength(body);
  } else if (body instanceof Uint8Array) {
    header["Content-Length"] = body.byteLength;
  } else if (body instanceof Blob) {
    header["Content-Length"] = body.size;
  }
  outgoing.writeHead(status, header);
  if (typeof body === "string" || body instanceof Uint8Array) {
    outgoing.end(body);
  } else if (body instanceof Blob) {
    outgoing.end(new Uint8Array(await body.arrayBuffer()));
  } else {
    flushHeaders(outgoing);
    return writeFromReadableStream(body, outgoing)?.catch(
      (e2) => handleResponseError(e2, outgoing)
    );
  }
};
var responseViaResponseObject = async (res, outgoing, options = {}) => {
  if (res instanceof Promise) {
    if (options.errorHandler) {
      try {
        res = await res;
      } catch (err) {
        const errRes = await options.errorHandler(err);
        if (!errRes) {
          return;
        }
        res = errRes;
      }
    } else {
      res = await res.catch(handleFetchError);
    }
  }
  if (cacheKey in res) {
    return responseViaCache(res, outgoing);
  }
  const resHeaderRecord = buildOutgoingHttpHeaders(res.headers);
  if (res.body) {
    const {
      "transfer-encoding": transferEncoding,
      "content-encoding": contentEncoding,
      "content-length": contentLength,
      "x-accel-buffering": accelBuffering,
      "content-type": contentType
    } = resHeaderRecord;
    if (transferEncoding || contentEncoding || contentLength || // nginx buffering variant
    accelBuffering && regBuffer.test(accelBuffering) || !regContentType.test(contentType)) {
      outgoing.writeHead(res.status, resHeaderRecord);
      flushHeaders(outgoing);
      await writeFromReadableStream(res.body, outgoing);
    } else {
      const buffer = await res.arrayBuffer();
      resHeaderRecord["content-length"] = buffer.byteLength;
      outgoing.writeHead(res.status, resHeaderRecord);
      outgoing.end(new Uint8Array(buffer));
    }
  } else if (resHeaderRecord[X_ALREADY_SENT]) ; else {
    outgoing.writeHead(res.status, resHeaderRecord);
    outgoing.end();
  }
};
var getRequestListener = (fetchCallback, options = {}) => {
  if (options.overrideGlobalObjects !== false && global.Request !== Request) {
    Object.defineProperty(global, "Request", {
      value: Request
    });
    Object.defineProperty(global, "Response", {
      value: Response2
    });
  }
  return async (incoming, outgoing) => {
    let res, req;
    try {
      req = newRequest(incoming, options.hostname);
      outgoing.on("close", () => {
        const abortController = req[abortControllerKey];
        if (!abortController) {
          return;
        }
        if (incoming.errored) {
          req[abortControllerKey].abort(incoming.errored.toString());
        } else if (!outgoing.writableFinished) {
          req[abortControllerKey].abort("Client connection prematurely closed.");
        }
      });
      res = fetchCallback(req, { incoming, outgoing });
      if (cacheKey in res) {
        return responseViaCache(res, outgoing);
      }
    } catch (e2) {
      if (!res) {
        if (options.errorHandler) {
          res = await options.errorHandler(req ? e2 : toRequestError(e2));
          if (!res) {
            return;
          }
        } else if (!req) {
          res = handleRequestError();
        } else {
          res = handleFetchError(e2);
        }
      } else {
        return handleResponseError(e2, outgoing);
      }
    }
    try {
      return await responseViaResponseObject(res, outgoing, options);
    } catch (e2) {
      return handleResponseError(e2, outgoing);
    }
  };
};
var createAdaptorServer = (options) => {
  const fetchCallback = options.fetch;
  const requestListener = getRequestListener(fetchCallback, {
    hostname: options.hostname,
    overrideGlobalObjects: options.overrideGlobalObjects
  });
  const createServer = options.createServer || http.createServer;
  const server = createServer(options.serverOptions || {}, requestListener);
  return server;
};
var serve = (options, listeningListener) => {
  const server = createAdaptorServer(options);
  server.listen(options?.port ?? 3e3, options.hostname, () => {
    const serverInfo = server.address();
    listeningListener && listeningListener(serverInfo);
  });
  return server;
};
var COMPRESSIBLE_CONTENT_TYPE_REGEX = /^\s*(?:text\/[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;
var ENCODINGS = {
  br: ".br",
  zstd: ".zst",
  gzip: ".gz"
};
var ENCODINGS_ORDERED_KEYS = Object.keys(ENCODINGS);
var createStreamBody = (stream4) => {
  const body = new ReadableStream({
    start(controller) {
      stream4.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      stream4.on("end", () => {
        controller.close();
      });
    },
    cancel() {
      stream4.destroy();
    }
  });
  return body;
};
var addCurrentDirPrefix = (path) => {
  return `./${path}`;
};
var getStats = (path) => {
  let stats;
  try {
    stats = fs.lstatSync(path);
  } catch {
  }
  return stats;
};
var serveStatic = (options = { root: "" }) => {
  return async (c2, next) => {
    if (c2.finalized) {
      return next();
    }
    let filename;
    try {
      filename = options.path ?? decodeURIComponent(c2.req.path);
    } catch {
      await options.onNotFound?.(c2.req.path, c2);
      return next();
    }
    let path = filepath.getFilePathWithoutDefaultDocument({
      filename: options.rewriteRequestPath ? options.rewriteRequestPath(filename) : filename,
      root: options.root
    });
    if (path) {
      path = addCurrentDirPrefix(path);
    } else {
      return next();
    }
    let stats = getStats(path);
    if (stats && stats.isDirectory()) {
      path = filepath.getFilePath({
        filename: options.rewriteRequestPath ? options.rewriteRequestPath(filename) : filename,
        root: options.root,
        defaultDocument: options.index ?? "index.html"
      });
      if (path) {
        path = addCurrentDirPrefix(path);
      } else {
        return next();
      }
      stats = getStats(path);
    }
    if (!stats) {
      await options.onNotFound?.(path, c2);
      return next();
    }
    await options.onFound?.(path, c2);
    const mimeType = mime.getMimeType(path);
    c2.header("Content-Type", mimeType || "application/octet-stream");
    if (options.precompressed && (!mimeType || COMPRESSIBLE_CONTENT_TYPE_REGEX.test(mimeType))) {
      const acceptEncodingSet = new Set(
        c2.req.header("Accept-Encoding")?.split(",").map((encoding) => encoding.trim())
      );
      for (const encoding of ENCODINGS_ORDERED_KEYS) {
        if (!acceptEncodingSet.has(encoding)) {
          continue;
        }
        const precompressedStats = getStats(path + ENCODINGS[encoding]);
        if (precompressedStats) {
          c2.header("Content-Encoding", encoding);
          c2.header("Vary", "Accept-Encoding", { append: true });
          stats = precompressedStats;
          path = path + ENCODINGS[encoding];
          break;
        }
      }
    }
    const size = stats.size;
    if (c2.req.method == "HEAD" || c2.req.method == "OPTIONS") {
      c2.header("Content-Length", size.toString());
      c2.status(200);
      return c2.body(null);
    }
    const range = c2.req.header("range") || "";
    if (!range) {
      c2.header("Content-Length", size.toString());
      return c2.body(createStreamBody(fs.createReadStream(path)), 200);
    }
    c2.header("Accept-Ranges", "bytes");
    c2.header("Date", stats.birthtime.toUTCString());
    const parts = range.replace(/bytes=/, "").split("-", 2);
    const start = parts[0] ? parseInt(parts[0], 10) : 0;
    let end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
    if (size < end - start + 1) {
      end = size - 1;
    }
    const chunksize = end - start + 1;
    const stream4 = fs.createReadStream(path, { start, end });
    c2.header("Content-Length", chunksize.toString());
    c2.header("Content-Range", `bytes ${start}-${end}/${stats.size}`);
    return c2.body(createStreamBody(stream4), 206);
  };
};
var RENDER_TYPE = {
  STRING_ARRAY: "string_array",
  STRING: "string",
  JSON_STRING: "json_string",
  RAW: "raw"
};
var RENDER_TYPE_MAP = {
  configUrl: RENDER_TYPE.STRING,
  deepLinking: RENDER_TYPE.RAW,
  presets: RENDER_TYPE.STRING_ARRAY,
  plugins: RENDER_TYPE.STRING_ARRAY,
  spec: RENDER_TYPE.JSON_STRING,
  url: RENDER_TYPE.STRING,
  urls: RENDER_TYPE.JSON_STRING,
  layout: RENDER_TYPE.STRING,
  docExpansion: RENDER_TYPE.STRING,
  maxDisplayedTags: RENDER_TYPE.RAW,
  operationsSorter: RENDER_TYPE.RAW,
  requestInterceptor: RENDER_TYPE.RAW,
  responseInterceptor: RENDER_TYPE.RAW,
  persistAuthorization: RENDER_TYPE.RAW,
  defaultModelsExpandDepth: RENDER_TYPE.RAW,
  defaultModelExpandDepth: RENDER_TYPE.RAW,
  defaultModelRendering: RENDER_TYPE.STRING,
  displayRequestDuration: RENDER_TYPE.RAW,
  filter: RENDER_TYPE.RAW,
  showExtensions: RENDER_TYPE.RAW,
  showCommonExtensions: RENDER_TYPE.RAW,
  queryConfigEnabled: RENDER_TYPE.RAW,
  displayOperationId: RENDER_TYPE.RAW,
  tagsSorter: RENDER_TYPE.RAW,
  onComplete: RENDER_TYPE.RAW,
  syntaxHighlight: RENDER_TYPE.JSON_STRING,
  tryItOutEnabled: RENDER_TYPE.RAW,
  requestSnippetsEnabled: RENDER_TYPE.RAW,
  requestSnippets: RENDER_TYPE.JSON_STRING,
  oauth2RedirectUrl: RENDER_TYPE.STRING,
  showMutabledRequest: RENDER_TYPE.RAW,
  request: RENDER_TYPE.JSON_STRING,
  supportedSubmitMethods: RENDER_TYPE.JSON_STRING,
  validatorUrl: RENDER_TYPE.STRING,
  withCredentials: RENDER_TYPE.RAW,
  modelPropertyMacro: RENDER_TYPE.RAW,
  parameterMacro: RENDER_TYPE.RAW
};
var renderSwaggerUIOptions = (options) => {
  const optionsStrings = Object.entries(options).map(([k, v]) => {
    const key = k;
    if (!RENDER_TYPE_MAP[key] || v === void 0) {
      return "";
    }
    switch (RENDER_TYPE_MAP[key]) {
      case RENDER_TYPE.STRING:
        return `${key}: '${v}'`;
      case RENDER_TYPE.STRING_ARRAY:
        if (!Array.isArray(v)) {
          return "";
        }
        return `${key}: [${v.map((ve) => `${ve}`).join(",")}]`;
      case RENDER_TYPE.JSON_STRING:
        return `${key}: ${JSON.stringify(v)}`;
      case RENDER_TYPE.RAW:
        return `${key}: ${v}`;
      default:
        return "";
    }
  }).filter((item) => item !== "").join(",");
  return optionsStrings;
};
var remoteAssets = ({ version }) => {
  const url = `https://cdn.jsdelivr.net/npm/swagger-ui-dist${version !== void 0 ? `@${version}` : ""}`;
  return {
    css: [`${url}/swagger-ui.css`],
    js: [`${url}/swagger-ui-bundle.js`]
  };
};
var SwaggerUI = (options) => {
  const asset = remoteAssets({ version: options?.version });
  delete options.version;
  if (options.manuallySwaggerUIHtml) {
    return options.manuallySwaggerUIHtml(asset);
  }
  const optionsStrings = renderSwaggerUIOptions(options);
  return `
    <div>
      <div id="swagger-ui"></div>
      ${asset.css.map((url) => html.html`<link rel="stylesheet" href="${url}" />`)}
      ${asset.js.map((url) => html.html`<script src="${url}" crossorigin="anonymous"></script>`)}
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            dom_id: '#swagger-ui',${optionsStrings},
          })
        }
      </script>
    </div>
  `;
};
var middleware = (options) => async (c2) => {
  const title = options?.title ?? "SwaggerUI";
  return c2.html(
    /* html */
    `
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="SwaggerUI" />
          <title>${title}</title>
        </head>
        <body>
          ${SwaggerUI(options)}
        </body>
      </html>
    `
  );
};

// ../../node_modules/.pnpm/hono-openapi@0.4.8_hono@4.7_85bb56b85eb26e58449b94ea5124c07c/node_modules/hono-openapi/utils.js
var e = Symbol("openapi");
var n = ["GET", "PUT", "POST", "DELETE", "OPTIONS", "HEAD", "PATCH", "TRACE"];
var s2 = (e2) => e2.charAt(0).toUpperCase() + e2.slice(1);
var o = /* @__PURE__ */ new Map();
var a = (e2, t2) => {
  const n2 = `${e2}:${t2}`;
  if (o.has(n2)) return o.get(n2);
  let a2 = e2;
  if ("/" === t2) return `${a2}Index`;
  for (const e3 of t2.split("/")) 123 === e3.charCodeAt(0) ? a2 += `By${s2(e3.slice(1, -1))}` : a2 += s2(e3);
  return o.set(n2, a2), a2;
};
var r = /* @__PURE__ */ new Map();
function c(e2, t2, n2) {
  return e2 && t2 in e2 ? e2[t2] ?? n2 : n2;
}
function i(...e2) {
  return e2.reduce((e3, t2) => {
    if (!t2) return e3;
    let n2;
    return ("tags" in e3 && e3.tags || "tags" in t2 && t2.tags) && (n2 = Array.from(/* @__PURE__ */ new Set([...c(e3, "tags", []), ...c(t2, "tags", [])]))), { ...e3, ...t2, tags: n2, responses: { ...c(e3, "responses", {}), ...c(t2, "responses", {}) }, parameters: m(e3.parameters, t2.parameters) };
  }, {});
}
function p({ path: e2, method: t2, data: n2, schema: s3 }) {
  e2 = ((e3) => e3.split("/").map((e4) => {
    let t3 = e4;
    if (t3.startsWith(":")) {
      const e5 = t3.match(/^:([^{?]+)(?:{(.+)})?(\?)?$/);
      e5 ? t3 = `{${e5[1]}}` : (t3 = t3.slice(1, t3.length), t3.endsWith("?") && (t3 = t3.slice(0, -1)), t3 = `{${t3}}`);
    }
    return t3;
  }).join("/"))(e2);
  const o2 = t2.toLowerCase();
  if ("all" === o2) {
    if (!n2) return;
    if (r.has(e2)) {
      const t3 = r.get(e2) ?? {};
      r.set(e2, { ...t3, ...n2, parameters: m(t3.parameters, n2.parameters) });
    } else r.set(e2, n2);
  } else {
    const t3 = function(e3) {
      const t4 = Array.from(r.keys());
      let n3 = {};
      for (const s4 of t4) e3.match(s4) && (n3 = i(n3, r.get(s4) ?? {}));
      return n3;
    }(e2);
    s3[e2] = { ...s3[e2] ? s3[e2] : {}, [o2]: { responses: {}, operationId: a(o2, e2), ...i(t3, s3[e2]?.[o2], n2) } };
  }
}
var f = (e2) => "$ref" in e2 ? e2.$ref : `${e2.in} ${e2.name}`;
function m(...e2) {
  const t2 = e2.flatMap((e3) => e3 ?? []).reduce((e3, t3) => (e3.set(f(t3), t3), e3), /* @__PURE__ */ new Map());
  return Array.from(t2.values());
}
function l(e2, { excludeStaticFile: t2 = true, exclude: n2 = [] }) {
  const s3 = {}, o2 = Array.isArray(n2) ? n2 : [n2];
  for (const [n3, a2] of Object.entries(e2)) if (!o2.some((e3) => "string" == typeof e3 ? n3 === e3 : e3.test(n3)) && (!n3.includes("*") || n3.includes("{")) && (!t2 || (!n3.includes(".") || n3.includes("{")))) {
    for (const e3 of Object.keys(a2)) {
      const t3 = a2[e3];
      if (n3.includes("{")) {
        t3.parameters || (t3.parameters = []);
        const e4 = n3.split("/").filter((e5) => e5.startsWith("{") && !t3.parameters.find((t4) => "path" === t4.in && t4.name === e5.slice(1, e5.length - 1)));
        for (const n4 of e4) {
          const e5 = n4.slice(1, n4.length - 1), s4 = t3.parameters.findIndex((t4) => "param" === t4.in && t4.name === e5);
          -1 !== s4 ? t3.parameters[s4].in = "path" : t3.parameters.push({ schema: { type: "string" }, in: "path", name: e5, required: true });
        }
      }
      t3.responses || (t3.responses = { 200: {} });
    }
    s3[n3] = a2;
  }
  return s3;
}
var u = { documentation: {}, excludeStaticFile: true, exclude: [], excludeMethods: ["OPTIONS"], excludeTags: [] };
var d = { version: "3.1.0", components: {} };
function h(e2, t2) {
  const n2 = { version: "3.1.0", components: {} };
  let s3;
  return async (o2) => (s3 || (s3 = await y(e2, t2, n2, o2)), o2.json(s3));
}
async function y(t2, s3 = u, o2 = d, a2) {
  const r2 = { ...u, ...s3 }, c2 = { ...d, ...o2 }, i2 = r2.documentation ?? {}, f2 = await async function(t3, s4, o3) {
    const a3 = {};
    for (const r3 of t3.routes) {
      if (!(e in r3.handler)) {
        s4.includeEmptyPaths && p({ method: r3.method, path: r3.path, schema: a3 });
        continue;
      }
      if (s4.excludeMethods.includes(r3.method)) continue;
      if (false === n.includes(r3.method) && "ALL" !== r3.method) continue;
      const { resolver: t4, metadata: c3 = {} } = r3.handler[e], i3 = s4.defaultOptions?.[r3.method], { docs: f3, components: m2 } = await t4({ ...o3, ...c3 }, i3);
      o3.components = { ...o3.components, ...m2 ?? {} }, p({ method: r3.method, path: r3.path, data: f3, schema: a3 });
    }
    return a3;
  }(t2, r2, c2);
  for (const e2 in f2) for (const t3 in f2[e2]) {
    const n2 = f2[e2][t3]?.hide;
    if (n2) {
      let s4 = false;
      "boolean" == typeof n2 ? s4 = n2 : "function" == typeof n2 && (a2 ? s4 = n2(a2) : console.warn(`'c' is not defined, cannot evaluate hide function for ${t3} ${e2}`)), s4 && delete f2[e2][t3];
    }
  }
  return { openapi: c2.version, ...{ ...i2, tags: i2.tags?.filter((e2) => !r2.excludeTags?.includes(e2?.name)), info: { title: "Hono Documentation", description: "Development documentation", version: "0.0.0", ...i2.info }, paths: { ...l(f2, r2), ...i2.paths }, components: { ...i2.components, schemas: { ...c2.components, ...i2.components?.schemas } } } };
}
function w(n2) {
  const { validateResponse: s3, ...o2 } = n2;
  return Object.assign(async (e2, o3) => {
    if (await o3(), s3 && n2.responses) {
      const o4 = e2.res.status, a2 = e2.res.headers.get("content-type");
      if (o4 && a2) {
        const r2 = n2.responses[o4];
        if (r2 && "content" in r2 && r2.content) {
          const n3 = a2.split(";")[0], o5 = r2.content[n3];
          if (o5?.schema && "validator" in o5.schema) try {
            let t2;
            const s4 = e2.res.clone();
            if ("application/json" === n3 ? t2 = await s4.json() : "text/plain" === n3 && (t2 = await s4.text()), !t2) throw new Error("No data to validate!");
            await o5.schema.validator(t2);
          } catch (e3) {
            let n4 = { status: 500, message: "Response validation failed!" };
            throw "object" == typeof s3 && (n4 = { ...n4, ...s3 }), new httpException.HTTPException(n4.status, { message: n4.message, cause: e3 });
          }
        }
      }
    }
  }, { [e]: { resolver: (e2, t2) => x(e2, o2, t2) } });
}
async function x(e2, t2, n2 = {}) {
  let s3 = {};
  const o2 = { ...n2, ...t2, responses: { ...n2?.responses, ...t2.responses } };
  if (o2.responses) for (const t3 of Object.keys(o2.responses)) {
    const n3 = o2.responses[t3];
    if (n3 && "content" in n3) for (const t4 of Object.keys(n3.content ?? {})) {
      const o3 = n3.content?.[t4];
      if (o3 && (o3.schema && "builder" in o3.schema)) {
        const t5 = await o3.schema.builder(e2);
        o3.schema = t5.schema, t5.components && (s3 = { ...s3, ...t5.components });
      }
    }
  }
  return { docs: o2, components: s3 };
}
async function getAgentCardByIdHandler(c2) {
  const mastra = c2.get("mastra");
  const agentId = c2.req.param("agentId");
  const runtimeContext = c2.get("runtimeContext");
  const result = await a2a.getAgentCardByIdHandler({
    mastra,
    agentId,
    runtimeContext
  });
  return c2.json(result);
}
async function getAgentExecutionHandler(c2) {
  const mastra = c2.get("mastra");
  const agentId = c2.req.param("agentId");
  const runtimeContext = c2.get("runtimeContext");
  const logger2 = mastra.getLogger();
  const body = await c2.req.json();
  if (!["tasks/send", "tasks/sendSubscribe", "tasks/get", "tasks/cancel"].includes(body.method)) {
    return c2.json({ error: { message: `Unsupported method: ${body.method}`, code: "invalid_method" } }, 400);
  }
  const result = await a2a.getAgentExecutionHandler({
    mastra,
    agentId,
    runtimeContext,
    requestId: crypto.randomUUID(),
    method: body.method,
    params: body.params,
    logger: logger2
  });
  if (body.method === "tasks/sendSubscribe") {
    return streaming.stream(
      c2,
      async (stream4) => {
        try {
          stream4.onAbort(() => {
            if (!result.locked) {
              return result.cancel();
            }
          });
          for await (const chunk of result) {
            await stream4.write(JSON.stringify(chunk) + "");
          }
        } catch (err) {
          logger2.error("Error in tasks/sendSubscribe stream: " + err?.message);
        }
      },
      async (err) => {
        logger2.error("Error in tasks/sendSubscribe stream: " + err?.message);
      }
    );
  }
  return c2.json(result);
}
function handleError(error, defaultMessage) {
  const apiError = error;
  throw new httpException.HTTPException(apiError.status || 500, {
    message: apiError.message || defaultMessage
  });
}
function errorHandler(err, c2) {
  if (err instanceof httpException.HTTPException) {
    return c2.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c2.json({ error: "Internal Server Error" }, 500);
}

// src/server/handlers/agents.ts
async function getAgentsHandler(c2) {
  const serializedAgents = await agents.getAgentsHandler({
    mastra: c2.get("mastra"),
    runtimeContext: c2.get("runtimeContext")
  });
  return c2.json(serializedAgents);
}
async function getAgentByIdHandler(c2) {
  const mastra = c2.get("mastra");
  const agentId = c2.req.param("agentId");
  const runtimeContext = c2.get("runtimeContext");
  const isPlayground = c2.req.header("x-mastra-dev-playground") === "true";
  const result = await agents.getAgentByIdHandler({
    mastra,
    agentId,
    runtimeContext,
    isPlayground
  });
  return c2.json(result);
}
async function getEvalsByAgentIdHandler(c2) {
  const mastra = c2.get("mastra");
  const agentId = c2.req.param("agentId");
  const runtimeContext = c2.get("runtimeContext");
  const result = await agents.getEvalsByAgentIdHandler({
    mastra,
    agentId,
    runtimeContext
  });
  return c2.json(result);
}
async function getLiveEvalsByAgentIdHandler(c2) {
  const mastra = c2.get("mastra");
  const agentId = c2.req.param("agentId");
  const runtimeContext = c2.get("runtimeContext");
  const result = await agents.getLiveEvalsByAgentIdHandler({
    mastra,
    agentId,
    runtimeContext
  });
  return c2.json(result);
}
async function generateHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.param("agentId");
    const runtimeContext = c2.get("runtimeContext");
    const body = await c2.req.json();
    const result = await agents.generateHandler({
      mastra,
      agentId,
      runtimeContext,
      body
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error generating from agent");
  }
}
async function streamGenerateHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.param("agentId");
    const runtimeContext = c2.get("runtimeContext");
    const body = await c2.req.json();
    const streamResponse = await agents.streamGenerateHandler({
      mastra,
      agentId,
      runtimeContext,
      body
    });
    return streamResponse;
  } catch (error) {
    return handleError(error, "Error streaming from agent");
  }
}
async function setAgentInstructionsHandler(c2) {
  try {
    const isPlayground = c2.get("playground") === true;
    if (!isPlayground) {
      return c2.json({ error: "This API is only available in the playground environment" }, 403);
    }
    const agentId = c2.req.param("agentId");
    const { instructions } = await c2.req.json();
    if (!agentId || !instructions) {
      return c2.json({ error: "Missing required fields" }, 400);
    }
    const mastra = c2.get("mastra");
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      return c2.json({ error: "Agent not found" }, 404);
    }
    agent.__updateInstructions(instructions);
    return c2.json(
      {
        instructions
      },
      200
    );
  } catch (error) {
    return handleError(error, "Error setting agent instructions");
  }
}

// src/server/handlers/auth/defaults.ts
var defaultAuthConfig = {
  protected: ["/api/*"],
  // Simple rule system
  rules: [
    // Admin users can do anything
    {
      condition: (user) => {
        if (typeof user === "object" && user !== null) {
          if ("isAdmin" in user) {
            return !!user.isAdmin;
          }
          if ("role" in user) {
            return user.role === "admin";
          }
        }
        return false;
      },
      allow: true
    }
  ]
};

// src/server/handlers/auth/helpers.ts
var isProtectedPath = (path, method, authConfig) => {
  const protectedAccess = [...defaultAuthConfig.protected || [], ...authConfig.protected || []];
  return isAnyMatch(path, method, protectedAccess);
};
var canAccessPublicly = (path, method, authConfig) => {
  const publicAccess = [...defaultAuthConfig.public || [], ...authConfig.public || []];
  return isAnyMatch(path, method, publicAccess);
};
var isAnyMatch = (path, method, patterns) => {
  if (!patterns) {
    return false;
  }
  for (const patternPathOrMethod of patterns) {
    if (patternPathOrMethod instanceof RegExp) {
      if (patternPathOrMethod.test(path)) {
        return true;
      }
    }
    if (typeof patternPathOrMethod === "string" && pathMatchesPattern(path, patternPathOrMethod)) {
      return true;
    }
    if (Array.isArray(patternPathOrMethod) && patternPathOrMethod.length === 2) {
      const [pattern, methodOrMethods] = patternPathOrMethod;
      if (pathMatchesPattern(path, pattern) && matchesOrIncludes(methodOrMethods, method)) {
        return true;
      }
    }
  }
  return false;
};
var pathMatchesPattern = (path, pattern) => {
  if (pattern.endsWith("*")) {
    const prefix = pattern.slice(0, -1);
    return path.startsWith(prefix);
  }
  return path === pattern;
};
var pathMatchesRule = (path, rulePath) => {
  if (!rulePath) return true;
  if (typeof rulePath === "string") {
    return pathMatchesPattern(path, rulePath);
  }
  if (rulePath instanceof RegExp) {
    console.log("rulePath", rulePath, path, rulePath.test(path));
    return rulePath.test(path);
  }
  if (Array.isArray(rulePath)) {
    return rulePath.some((p2) => pathMatchesPattern(path, p2));
  }
  return false;
};
var matchesOrIncludes = (values, value) => {
  if (typeof values === "string") {
    return values === value;
  }
  if (Array.isArray(values)) {
    return values.includes(value);
  }
  return false;
};
var checkRules = async (rules, path, method, user) => {
  for (const i2 in rules || []) {
    const rule = rules?.[i2];
    if (!pathMatchesRule(path, rule.path)) {
      continue;
    }
    if (rule.methods && !matchesOrIncludes(rule.methods, method)) {
      continue;
    }
    const condition = rule.condition;
    if (typeof condition === "function") {
      const allowed = await Promise.resolve().then(() => condition(user)).catch(() => false);
      if (allowed) {
        return true;
      }
    } else if (rule.allow) {
      return true;
    }
  }
  return false;
};

// src/server/handlers/auth/index.ts
var authenticationMiddleware = async (c2, next) => {
  const mastra = c2.get("mastra");
  const authConfig = mastra.getServer()?.experimental_auth;
  if (!authConfig) {
    return next();
  }
  if (!isProtectedPath(c2.req.path, c2.req.method, authConfig)) {
    return next();
  }
  if (canAccessPublicly(c2.req.path, c2.req.method, authConfig)) {
    return next();
  }
  const authHeader = c2.req.header("Authorization");
  let token = authHeader ? authHeader.replace("Bearer ", "") : null;
  if (!token && c2.req.query("apiKey")) {
    token = c2.req.query("apiKey") || null;
  }
  if (!token) {
    return c2.json({ error: "Authentication required" }, 401);
  }
  try {
    let user;
    if (typeof authConfig.authenticateToken === "function") {
      user = await authConfig.authenticateToken(token, c2.req);
    } else {
      throw new Error("No token verification method configured");
    }
    if (!user) {
      return c2.json({ error: "Invalid or expired token" }, 401);
    }
    c2.get("runtimeContext").set("user", user);
    return next();
  } catch (err) {
    console.error(err);
    return c2.json({ error: "Invalid or expired token" }, 401);
  }
};
var authorizationMiddleware = async (c2, next) => {
  const mastra = c2.get("mastra");
  const authConfig = mastra.getServer()?.experimental_auth;
  if (!authConfig) {
    return next();
  }
  const path = c2.req.path;
  const method = c2.req.method;
  if (canAccessPublicly(path, method, authConfig)) {
    return next();
  }
  const user = c2.get("runtimeContext").get("user");
  if ("authorizeUser" in authConfig && typeof authConfig.authorizeUser === "function") {
    try {
      const isAuthorized = await authConfig.authorizeUser(user, c2.req);
      if (isAuthorized) {
        return next();
      }
      return c2.json({ error: "Access denied" }, 403);
    } catch (err) {
      console.error(err);
      return c2.json({ error: "Authorization error" }, 500);
    }
  }
  if ("authorize" in authConfig && typeof authConfig.authorize === "function") {
    try {
      const isAuthorized = await authConfig.authorize(path, method, user, c2);
      if (isAuthorized) {
        return next();
      }
      return c2.json({ error: "Access denied" }, 403);
    } catch (err) {
      console.error(err);
      return c2.json({ error: "Authorization error" }, 500);
    }
  }
  if ("rules" in authConfig && authConfig.rules && authConfig.rules.length > 0) {
    const isAuthorized = await checkRules(authConfig.rules, path, method, user);
    if (isAuthorized) {
      return next();
    }
    return c2.json({ error: "Access denied" }, 403);
  }
  if (defaultAuthConfig.rules && defaultAuthConfig.rules.length > 0) {
    const isAuthorized = await checkRules(defaultAuthConfig.rules, path, method, user);
    if (isAuthorized) {
      return next();
    }
  }
  return c2.json({ error: "Access denied" }, 403);
};

// src/server/handlers/client.ts
var clients = /* @__PURE__ */ new Set();
function handleClientsRefresh(c2) {
  const stream4 = new ReadableStream({
    start(controller) {
      clients.add(controller);
      controller.enqueue("data: connected\n\n");
      c2.req.raw.signal.addEventListener("abort", () => {
        clients.delete(controller);
      });
    }
  });
  return new Response(stream4, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
function handleTriggerClientsRefresh(c2) {
  clients.forEach((controller) => {
    try {
      controller.enqueue("data: refresh\n\n");
    } catch {
      clients.delete(controller);
    }
  });
  return c2.json({ success: true, clients: clients.size });
}
async function getLegacyWorkflowsHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflows = await legacyWorkflows.getLegacyWorkflowsHandler({
      mastra
    });
    return c2.json(workflows);
  } catch (error) {
    return handleError(error, "Error getting workflows");
  }
}
async function getLegacyWorkflowByIdHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const workflow = await legacyWorkflows.getLegacyWorkflowByIdHandler({
      mastra,
      workflowId
    });
    return c2.json(workflow);
  } catch (error) {
    return handleError(error, "Error getting workflow");
  }
}
async function startAsyncLegacyWorkflowHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const runtimeContext = c2.get("runtimeContext");
    const workflowId = c2.req.param("workflowId");
    const triggerData = await c2.req.json();
    const runId = c2.req.query("runId");
    const result = await legacyWorkflows.startAsyncLegacyWorkflowHandler({
      mastra,
      runtimeContext,
      workflowId,
      runId,
      triggerData
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error executing workflow");
  }
}
async function createLegacyWorkflowRunHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const prevRunId = c2.req.query("runId");
    const result = await legacyWorkflows.createLegacyWorkflowRunHandler({
      mastra,
      workflowId,
      runId: prevRunId
    });
    return c2.json(result);
  } catch (e2) {
    return handleError(e2, "Error creating run");
  }
}
async function startLegacyWorkflowRunHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const runtimeContext = c2.get("runtimeContext");
    const workflowId = c2.req.param("workflowId");
    const triggerData = await c2.req.json();
    const runId = c2.req.query("runId");
    await legacyWorkflows.startLegacyWorkflowRunHandler({
      mastra,
      runtimeContext,
      workflowId,
      runId,
      triggerData
    });
    return c2.json({ message: "Workflow run started" });
  } catch (e2) {
    return handleError(e2, "Error starting workflow run");
  }
}
function watchLegacyWorkflowHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const logger2 = mastra.getLogger();
    const workflowId = c2.req.param("workflowId");
    const runId = c2.req.query("runId");
    if (!runId) {
      throw new httpException.HTTPException(400, { message: "runId required to watch workflow" });
    }
    return streaming.stream(
      c2,
      async (stream4) => {
        try {
          const result = await legacyWorkflows.watchLegacyWorkflowHandler({
            mastra,
            workflowId,
            runId
          });
          stream4.onAbort(() => {
            if (!result.locked) {
              return result.cancel();
            }
          });
          for await (const chunk of result) {
            await stream4.write(chunk.toString() + "");
          }
        } catch (err) {
          console.log(err);
        }
      },
      async (err) => {
        logger2.error("Error in watch stream: " + err?.message);
      }
    );
  } catch (error) {
    return handleError(error, "Error watching workflow");
  }
}
async function resumeAsyncLegacyWorkflowHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const runtimeContext = c2.get("runtimeContext");
    const workflowId = c2.req.param("workflowId");
    const runId = c2.req.query("runId");
    const { stepId, context } = await c2.req.json();
    if (!runId) {
      throw new httpException.HTTPException(400, { message: "runId required to resume workflow" });
    }
    const result = await legacyWorkflows.resumeAsyncLegacyWorkflowHandler({
      mastra,
      runtimeContext,
      workflowId,
      runId,
      body: { stepId, context }
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error resuming workflow step");
  }
}
async function resumeLegacyWorkflowHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const runtimeContext = c2.get("runtimeContext");
    const workflowId = c2.req.param("workflowId");
    const runId = c2.req.query("runId");
    const { stepId, context } = await c2.req.json();
    if (!runId) {
      throw new httpException.HTTPException(400, { message: "runId required to resume workflow" });
    }
    await legacyWorkflows.resumeLegacyWorkflowHandler({
      mastra,
      runtimeContext,
      workflowId,
      runId,
      body: { stepId, context }
    });
    return c2.json({ message: "Workflow run resumed" });
  } catch (error) {
    return handleError(error, "Error resuming workflow");
  }
}
async function getLegacyWorkflowRunsHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const { fromDate, toDate, limit, offset, resourceId } = c2.req.query();
    const workflowRuns = await legacyWorkflows.getLegacyWorkflowRunsHandler({
      mastra,
      workflowId,
      fromDate: fromDate ? new Date(fromDate) : void 0,
      toDate: toDate ? new Date(toDate) : void 0,
      limit: limit ? Number(limit) : void 0,
      offset: offset ? Number(offset) : void 0,
      resourceId
    });
    return c2.json(workflowRuns);
  } catch (error) {
    return handleError(error, "Error getting workflow runs");
  }
}
async function getLogsHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const { transportId, fromDate, toDate, logLevel, page, perPage } = c2.req.query();
    const filters = c2.req.queries("filters");
    const logs$1 = await logs.getLogsHandler({
      mastra,
      transportId,
      params: {
        fromDate: fromDate ? new Date(fromDate) : void 0,
        toDate: toDate ? new Date(toDate) : void 0,
        logLevel: logLevel ? logLevel : void 0,
        filters,
        page: page ? Number(page) : void 0,
        perPage: perPage ? Number(perPage) : void 0
      }
    });
    return c2.json(logs$1);
  } catch (error) {
    return handleError(error, "Error getting logs");
  }
}
async function getLogsByRunIdHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const runId = c2.req.param("runId");
    const { transportId, fromDate, toDate, logLevel, page, perPage } = c2.req.query();
    const filters = c2.req.queries("filters");
    const logs$1 = await logs.getLogsByRunIdHandler({
      mastra,
      runId,
      transportId,
      params: {
        fromDate: fromDate ? new Date(fromDate) : void 0,
        toDate: toDate ? new Date(toDate) : void 0,
        logLevel: logLevel ? logLevel : void 0,
        filters,
        page: page ? Number(page) : void 0,
        perPage: perPage ? Number(perPage) : void 0
      }
    });
    return c2.json(logs$1);
  } catch (error) {
    return handleError(error, "Error getting logs by run ID");
  }
}
async function getLogTransports(c2) {
  try {
    const mastra = c2.get("mastra");
    const result = await logs.getLogTransports({
      mastra
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error getting log Transports");
  }
}
var classRegExp = /^([A-Z][a-z0-9]*)+$/;
var kTypes = [
  "string",
  "function",
  "number",
  "object",
  // Accept 'Function' and 'Object' as alternative to the lower cased version.
  "Function",
  "Object",
  "boolean",
  "bigint",
  "symbol"
];
function determineSpecificType(value) {
  if (value == null) {
    return "" + value;
  }
  if (typeof value === "function" && value.name) {
    return `function ${value.name}`;
  }
  if (typeof value === "object") {
    if (value.constructor?.name) {
      return `an instance of ${value.constructor.name}`;
    }
    return `${util__default.default.inspect(value, { depth: -1 })}`;
  }
  let inspected = util__default.default.inspect(value, { colors: false });
  if (inspected.length > 28) {
    inspected = `${inspected.slice(0, 25)}...`;
  }
  return `type ${typeof value} (${inspected})`;
}
var ERR_HTTP_BODY_NOT_ALLOWED = class extends Error {
  constructor() {
    super("Adding content for this request method or response status is not allowed.");
  }
};
var ERR_HTTP_CONTENT_LENGTH_MISMATCH = class extends Error {
  constructor(actual, expected) {
    super(`Response body's content-length of ${actual} byte(s) does not match the content-length of ${expected} byte(s) set in header`);
  }
};
var ERR_HTTP_HEADERS_SENT = class extends Error {
  constructor(arg) {
    super(`Cannot ${arg} headers after they are sent to the client`);
  }
};
var ERR_INVALID_ARG_VALUE = class extends TypeError {
  constructor(name, value, reason = "is invalid") {
    let inspected = util__default.default.inspect(value);
    if (inspected.length > 128) {
      inspected = `${inspected.slice(0, 128)}...`;
    }
    const type = name.includes(".") ? "property" : "argument";
    super(`The ${type} '${name}' ${reason}. Received ${inspected}`);
  }
};
var ERR_INVALID_CHAR = class extends TypeError {
  constructor(name, field) {
    let msg = `Invalid character in ${name}`;
    if (field !== void 0) {
      msg += ` ["${field}"]`;
    }
    super(msg);
  }
};
var ERR_HTTP_INVALID_HEADER_VALUE = class extends TypeError {
  constructor(value, name) {
    super(`Invalid value "${value}" for header "${name}"`);
  }
};
var ERR_HTTP_INVALID_STATUS_CODE = class extends RangeError {
  originalStatusCode;
  constructor(originalStatusCode) {
    super(`Invalid status code: ${originalStatusCode}`);
    this.originalStatusCode = originalStatusCode;
  }
};
var ERR_HTTP_TRAILER_INVALID = class extends Error {
  constructor() {
    super(`Trailers are invalid with this transfer encoding`);
  }
};
var ERR_INVALID_ARG_TYPE = class extends TypeError {
  constructor(name, expected, actual) {
    if (!Array.isArray(expected)) {
      expected = [expected];
    }
    let msg = "The ";
    if (name.endsWith(" argument")) {
      msg += `${name} `;
    } else {
      const type = name.includes(".") ? "property" : "argument";
      msg += `"${name}" ${type} `;
    }
    msg += "must be ";
    const types = [];
    const instances = [];
    const other = [];
    for (const value of expected) {
      if (kTypes.includes(value)) {
        types.push(value.toLowerCase());
      } else if (classRegExp.exec(value) !== null) {
        instances.push(value);
      } else {
        other.push(value);
      }
    }
    if (instances.length > 0) {
      const pos = types.indexOf("object");
      if (pos !== -1) {
        types.splice(pos, 1);
        instances.push("Object");
      }
    }
    if (types.length > 0) {
      if (types.length > 2) {
        const last = types.pop();
        msg += `one of type ${types.join(", ")}, or ${last}`;
      } else if (types.length === 2) {
        msg += `one of type ${types[0]} or ${types[1]}`;
      } else {
        msg += `of type ${types[0]}`;
      }
      if (instances.length > 0 || other.length > 0)
        msg += " or ";
    }
    if (instances.length > 0) {
      if (instances.length > 2) {
        const last = instances.pop();
        msg += `an instance of ${instances.join(", ")}, or ${last}`;
      } else {
        msg += `an instance of ${instances[0]}`;
        if (instances.length === 2) {
          msg += ` or ${instances[1]}`;
        }
      }
      if (other.length > 0)
        msg += " or ";
    }
    if (other.length > 0) {
      if (other.length > 2) {
        const last = other.pop();
        msg += `one of ${other.join(", ")}, or ${last}`;
      } else if (other.length === 2) {
        msg += `one of ${other[0]} or ${other[1]}`;
      } else {
        if (other[0].toLowerCase() !== other[0])
          msg += "an ";
        msg += `${other[0]}`;
      }
    }
    msg += `. Received ${determineSpecificType(actual)}`;
    super(msg);
  }
};
var ERR_INVALID_HTTP_TOKEN = class extends TypeError {
  constructor(name, field) {
    super(`${name} must be a valid HTTP token ["${field}"]`);
  }
};
var ERR_METHOD_NOT_IMPLEMENTED = class extends Error {
  constructor(methodName) {
    super(`The ${methodName} method is not implemented`);
  }
};
var ERR_STREAM_ALREADY_FINISHED = class extends Error {
  constructor(methodName) {
    super(`Cannot call ${methodName} after a stream was finished`);
  }
};
var ERR_STREAM_CANNOT_PIPE = class extends Error {
  constructor() {
    super(`Cannot pipe, not readable`);
  }
};
var ERR_STREAM_DESTROYED = class extends Error {
  constructor(methodName) {
    super(`Cannot call ${methodName} after a stream was destroyed`);
  }
};
var ERR_STREAM_NULL_VALUES = class extends TypeError {
  constructor() {
    super(`May not write null values to stream`);
  }
};
var ERR_STREAM_WRITE_AFTER_END = class extends Error {
  constructor() {
    super(`write after end`);
  }
};

// ../../node_modules/.pnpm/fetch-to-node@2.1.0/node_modules/fetch-to-node/dist/fetch-to-node/http-incoming.js
var kHeaders = Symbol("kHeaders");
var kHeadersDistinct = Symbol("kHeadersDistinct");
var kHeadersCount = Symbol("kHeadersCount");
var kTrailers = Symbol("kTrailers");
var kTrailersDistinct = Symbol("kTrailersDistinct");
var kTrailersCount = Symbol("kTrailersCount");
var FetchIncomingMessage = class extends stream.Readable {
  get socket() {
    return null;
  }
  set socket(_val) {
    throw new ERR_METHOD_NOT_IMPLEMENTED("socket");
  }
  httpVersionMajor;
  httpVersionMinor;
  httpVersion;
  complete = false;
  [kHeaders] = null;
  [kHeadersDistinct] = null;
  [kHeadersCount] = 0;
  rawHeaders = [];
  [kTrailers] = null;
  [kTrailersDistinct] = null;
  [kTrailersCount] = 0;
  rawTrailers = [];
  joinDuplicateHeaders = false;
  aborted = false;
  upgrade = false;
  // request (server) only
  url = "";
  method;
  // TODO: Support ClientRequest
  // statusCode = null;
  // statusMessage = null;
  // client = socket;
  _consuming;
  _dumped;
  // The underlying ReadableStream
  _stream = null;
  constructor() {
    const streamOptions = {};
    super(streamOptions);
    this._readableState.readingMore = true;
    this._consuming = false;
    this._dumped = false;
  }
  get connection() {
    return null;
  }
  set connection(_socket) {
    console.error("No support for IncomingMessage.connection");
  }
  get headers() {
    if (!this[kHeaders]) {
      this[kHeaders] = {};
      const src = this.rawHeaders;
      const dst = this[kHeaders];
      for (let n2 = 0; n2 < this[kHeadersCount]; n2 += 2) {
        this._addHeaderLine(src[n2], src[n2 + 1], dst);
      }
    }
    return this[kHeaders];
  }
  set headers(val) {
    this[kHeaders] = val;
  }
  get headersDistinct() {
    if (!this[kHeadersDistinct]) {
      this[kHeadersDistinct] = {};
      const src = this.rawHeaders;
      const dst = this[kHeadersDistinct];
      for (let n2 = 0; n2 < this[kHeadersCount]; n2 += 2) {
        this._addHeaderLineDistinct(src[n2], src[n2 + 1], dst);
      }
    }
    return this[kHeadersDistinct];
  }
  set headersDistinct(val) {
    this[kHeadersDistinct] = val;
  }
  get trailers() {
    if (!this[kTrailers]) {
      this[kTrailers] = {};
      const src = this.rawTrailers;
      const dst = this[kTrailers];
      for (let n2 = 0; n2 < this[kTrailersCount]; n2 += 2) {
        this._addHeaderLine(src[n2], src[n2 + 1], dst);
      }
    }
    return this[kTrailers];
  }
  set trailers(val) {
    this[kTrailers] = val;
  }
  get trailersDistinct() {
    if (!this[kTrailersDistinct]) {
      this[kTrailersDistinct] = {};
      const src = this.rawTrailers;
      const dst = this[kTrailersDistinct];
      for (let n2 = 0; n2 < this[kTrailersCount]; n2 += 2) {
        this._addHeaderLineDistinct(src[n2], src[n2 + 1], dst);
      }
    }
    return this[kTrailersDistinct];
  }
  set trailersDistinct(val) {
    this[kTrailersDistinct] = val;
  }
  setTimeout(msecs, callback) {
    return this;
  }
  async _read(n2) {
    if (!this._consuming) {
      this._readableState.readingMore = false;
      this._consuming = true;
    }
    if (this._stream == null) {
      this.complete = true;
      this.push(null);
      return;
    }
    const reader = this._stream.getReader();
    try {
      const data = await reader.read();
      if (data.done) {
        this.complete = true;
        this.push(null);
      } else {
        this.push(data.value);
      }
    } catch (e2) {
      this.destroy(e2);
    } finally {
      reader.releaseLock();
    }
  }
  _destroy(err, cb) {
    if (!this.readableEnded || !this.complete) {
      this.aborted = true;
      this.emit("aborted");
    }
    setTimeout(onError, 0, this, err, cb);
  }
  _addHeaderLines(headers, n2) {
    if (headers?.length) {
      let dest;
      if (this.complete) {
        this.rawTrailers = headers;
        this[kTrailersCount] = n2;
        dest = this[kTrailers];
      } else {
        this.rawHeaders = headers;
        this[kHeadersCount] = n2;
        dest = this[kHeaders];
      }
      if (dest) {
        for (let i2 = 0; i2 < n2; i2 += 2) {
          this._addHeaderLine(headers[i2], headers[i2 + 1], dest);
        }
      }
    }
  }
  // Add the given (field, value) pair to the message
  //
  // Per RFC2616, section 4.2 it is acceptable to join multiple instances of the
  // same header with a ', ' if the header in question supports specification of
  // multiple values this way. The one exception to this is the Cookie header,
  // which has multiple values joined with a '; ' instead. If a header's values
  // cannot be joined in either of these ways, we declare the first instance the
  // winner and drop the second. Extended header fields (those beginning with
  // 'x-') are always joined.
  _addHeaderLine(field, value, dest) {
    field = matchKnownFields(field);
    const flag = field.charCodeAt(0);
    if (flag === 0 || flag === 2) {
      field = field.slice(1);
      if (typeof dest[field] === "string") {
        dest[field] += (flag === 0 ? ", " : "; ") + value;
      } else {
        dest[field] = value;
      }
    } else if (flag === 1) {
      if (dest["set-cookie"] !== void 0) {
        dest["set-cookie"].push(value);
      } else {
        dest["set-cookie"] = [value];
      }
    } else if (this.joinDuplicateHeaders) {
      if (dest[field] === void 0) {
        dest[field] = value;
      } else {
        dest[field] += ", " + value;
      }
    } else if (dest[field] === void 0) {
      dest[field] = value;
    }
  }
  _addHeaderLineDistinct(field, value, dest) {
    field = field.toLowerCase();
    if (!dest[field]) {
      dest[field] = [value];
    } else {
      dest[field].push(value);
    }
  }
  // Call this instead of resume() if we want to just
  // dump all the data to /dev/null
  _dump() {
    if (!this._dumped) {
      this._dumped = true;
      this.removeAllListeners("data");
      this.resume();
    }
  }
};
function matchKnownFields(field, lowercased = false) {
  switch (field.length) {
    case 3:
      if (field === "Age" || field === "age")
        return "age";
      break;
    case 4:
      if (field === "Host" || field === "host")
        return "host";
      if (field === "From" || field === "from")
        return "from";
      if (field === "ETag" || field === "etag")
        return "etag";
      if (field === "Date" || field === "date")
        return "\0date";
      if (field === "Vary" || field === "vary")
        return "\0vary";
      break;
    case 6:
      if (field === "Server" || field === "server")
        return "server";
      if (field === "Cookie" || field === "cookie")
        return "cookie";
      if (field === "Origin" || field === "origin")
        return "\0origin";
      if (field === "Expect" || field === "expect")
        return "\0expect";
      if (field === "Accept" || field === "accept")
        return "\0accept";
      break;
    case 7:
      if (field === "Referer" || field === "referer")
        return "referer";
      if (field === "Expires" || field === "expires")
        return "expires";
      if (field === "Upgrade" || field === "upgrade")
        return "\0upgrade";
      break;
    case 8:
      if (field === "Location" || field === "location")
        return "location";
      if (field === "If-Match" || field === "if-match")
        return "\0if-match";
      break;
    case 10:
      if (field === "User-Agent" || field === "user-agent")
        return "user-agent";
      if (field === "Set-Cookie" || field === "set-cookie")
        return "";
      if (field === "Connection" || field === "connection")
        return "\0connection";
      break;
    case 11:
      if (field === "Retry-After" || field === "retry-after")
        return "retry-after";
      break;
    case 12:
      if (field === "Content-Type" || field === "content-type")
        return "content-type";
      if (field === "Max-Forwards" || field === "max-forwards")
        return "max-forwards";
      break;
    case 13:
      if (field === "Authorization" || field === "authorization")
        return "authorization";
      if (field === "Last-Modified" || field === "last-modified")
        return "last-modified";
      if (field === "Cache-Control" || field === "cache-control")
        return "\0cache-control";
      if (field === "If-None-Match" || field === "if-none-match")
        return "\0if-none-match";
      break;
    case 14:
      if (field === "Content-Length" || field === "content-length")
        return "content-length";
      break;
    case 15:
      if (field === "Accept-Encoding" || field === "accept-encoding")
        return "\0accept-encoding";
      if (field === "Accept-Language" || field === "accept-language")
        return "\0accept-language";
      if (field === "X-Forwarded-For" || field === "x-forwarded-for")
        return "\0x-forwarded-for";
      break;
    case 16:
      if (field === "Content-Encoding" || field === "content-encoding")
        return "\0content-encoding";
      if (field === "X-Forwarded-Host" || field === "x-forwarded-host")
        return "\0x-forwarded-host";
      break;
    case 17:
      if (field === "If-Modified-Since" || field === "if-modified-since")
        return "if-modified-since";
      if (field === "Transfer-Encoding" || field === "transfer-encoding")
        return "\0transfer-encoding";
      if (field === "X-Forwarded-Proto" || field === "x-forwarded-proto")
        return "\0x-forwarded-proto";
      break;
    case 19:
      if (field === "Proxy-Authorization" || field === "proxy-authorization")
        return "proxy-authorization";
      if (field === "If-Unmodified-Since" || field === "if-unmodified-since")
        return "if-unmodified-since";
      break;
  }
  if (lowercased) {
    return "\0" + field;
  }
  return matchKnownFields(field.toLowerCase(), true);
}
function onError(self, error, cb) {
  if (self.listenerCount("error") === 0) {
    cb();
  } else {
    cb(error);
  }
}

// ../../node_modules/.pnpm/fetch-to-node@2.1.0/node_modules/fetch-to-node/dist/utils/types.js
function validateString(value, name) {
  if (typeof value !== "string")
    throw new ERR_INVALID_ARG_TYPE(name, "string", value);
}
var linkValueRegExp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
function validateLinkHeaderFormat(value, name) {
  if (typeof value === "undefined" || !linkValueRegExp.exec(value)) {
    throw new ERR_INVALID_ARG_VALUE(name, value, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
}
function validateLinkHeaderValue(hints) {
  if (typeof hints === "string") {
    validateLinkHeaderFormat(hints, "hints");
    return hints;
  } else if (Array.isArray(hints)) {
    const hintsLength = hints.length;
    let result = "";
    if (hintsLength === 0) {
      return result;
    }
    for (let i2 = 0; i2 < hintsLength; i2++) {
      const link = hints[i2];
      validateLinkHeaderFormat(link, "hints");
      result += link;
      if (i2 !== hintsLength - 1) {
        result += ", ";
      }
    }
    return result;
  }
  throw new ERR_INVALID_ARG_VALUE("hints", hints, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
}
function isUint8Array(value) {
  return value != null && value[Symbol.toStringTag] === "Uint8Array";
}

// ../../node_modules/.pnpm/fetch-to-node@2.1.0/node_modules/fetch-to-node/dist/fetch-to-node/internal-http.js
var kNeedDrain = Symbol("kNeedDrain");
var kOutHeaders = Symbol("kOutHeaders");
function utcDate() {
  return (/* @__PURE__ */ new Date()).toUTCString();
}

// ../../node_modules/.pnpm/fetch-to-node@2.1.0/node_modules/fetch-to-node/dist/fetch-to-node/internal-streams-state.js
function getDefaultHighWaterMark(objectMode) {
  return objectMode ? 16 : 64 * 1024;
}

// ../../node_modules/.pnpm/fetch-to-node@2.1.0/node_modules/fetch-to-node/dist/fetch-to-node/http-common.js
var tokenRegExp = /^[\^_`a-zA-Z\-0-9!#$%&'*+.|~]+$/;
function checkIsHttpToken(val) {
  return tokenRegExp.test(val);
}
var headerCharRegex = /[^\t\x20-\x7e\x80-\xff]/;
function checkInvalidHeaderChar(val) {
  return headerCharRegex.test(val);
}
var chunkExpression = /(?:^|\W)chunked(?:$|\W)/i;
var kCorked = Symbol("corked");
var kChunkedBuffer = Symbol("kChunkedBuffer");
var kChunkedLength = Symbol("kChunkedLength");
var kUniqueHeaders = Symbol("kUniqueHeaders");
var kBytesWritten = Symbol("kBytesWritten");
var kErrored = Symbol("errored");
var kHighWaterMark = Symbol("kHighWaterMark");
var kRejectNonStandardBodyWrites = Symbol("kRejectNonStandardBodyWrites");
var nop = () => {
};
var RE_CONN_CLOSE = /(?:^|\W)close(?:$|\W)/i;
function isCookieField(s3) {
  return s3.length === 6 && s3.toLowerCase() === "cookie";
}
function isContentDispositionField(s3) {
  return s3.length === 19 && s3.toLowerCase() === "content-disposition";
}
var WrittenDataBuffer = class {
  [kCorked] = 0;
  [kHighWaterMark] = getDefaultHighWaterMark();
  entries = [];
  onWrite;
  constructor(params = {}) {
    this.onWrite = params.onWrite;
  }
  write(data, encoding, callback) {
    this.entries.push({
      data,
      length: data.length,
      encoding,
      callback,
      written: false
    });
    this._flush();
    return true;
  }
  cork() {
    this[kCorked]++;
  }
  uncork() {
    this[kCorked]--;
    this._flush();
  }
  _flush() {
    if (this[kCorked] <= 0) {
      for (const [index, entry] of this.entries.entries()) {
        if (!entry.written) {
          entry.written = true;
          if (this.onWrite != null) {
            this.onWrite(index, entry);
          }
          if (entry.callback != null) {
            entry.callback.call(void 0);
          }
        }
      }
    }
  }
  get writableLength() {
    return this.entries.reduce((acc, entry) => {
      return acc + (entry.written && entry.length ? entry.length : 0);
    }, 0);
  }
  get writableHighWaterMark() {
    return this[kHighWaterMark];
  }
  get writableCorked() {
    return this[kCorked];
  }
};
var FetchOutgoingMessage = class extends stream.Writable {
  req;
  outputData;
  outputSize;
  // Difference from Node.js -
  // `writtenHeaderBytes` is the number of bytes the header has taken.
  // Since Node.js writes both the headers and body into the same outgoing
  // stream, it helps to keep track of this so that we can skip that many bytes
  // from the beginning of the stream when providing the outgoing stream.
  writtenHeaderBytes = 0;
  _last;
  chunkedEncoding;
  shouldKeepAlive;
  maxRequestsOnConnectionReached;
  _defaultKeepAlive;
  useChunkedEncodingByDefault;
  sendDate;
  _removedConnection;
  _removedContLen;
  _removedTE;
  strictContentLength;
  [kBytesWritten];
  _contentLength;
  _hasBody;
  _trailer;
  [kNeedDrain];
  finished;
  _headerSent;
  [kCorked];
  [kChunkedBuffer];
  [kChunkedLength];
  _closed;
  // Difference from Node.js -
  // In Node.js, this is a socket object.
  // [kSocket]: null;
  _header;
  [kOutHeaders];
  _keepAliveTimeout;
  _maxRequestsPerSocket;
  _onPendingData;
  [kUniqueHeaders];
  [kErrored];
  [kHighWaterMark];
  [kRejectNonStandardBodyWrites];
  _writtenDataBuffer = new WrittenDataBuffer({
    onWrite: this._onDataWritten.bind(this)
  });
  constructor(req, options) {
    super();
    this.req = req;
    this.outputData = [];
    this.outputSize = 0;
    this.destroyed = false;
    this._last = false;
    this.chunkedEncoding = false;
    this.shouldKeepAlive = true;
    this.maxRequestsOnConnectionReached = false;
    this._defaultKeepAlive = true;
    this.useChunkedEncodingByDefault = true;
    this.sendDate = false;
    this._removedConnection = false;
    this._removedContLen = false;
    this._removedTE = false;
    this.strictContentLength = false;
    this[kBytesWritten] = 0;
    this._contentLength = null;
    this._hasBody = true;
    this._trailer = "";
    this[kNeedDrain] = false;
    this.finished = false;
    this._headerSent = false;
    this[kCorked] = 0;
    this[kChunkedBuffer] = [];
    this[kChunkedLength] = 0;
    this._closed = false;
    this._header = null;
    this[kOutHeaders] = null;
    this._keepAliveTimeout = 0;
    this._onPendingData = nop;
    this[kErrored] = null;
    this[kHighWaterMark] = options?.highWaterMark ?? getDefaultHighWaterMark();
    this[kRejectNonStandardBodyWrites] = options?.rejectNonStandardBodyWrites ?? false;
    this[kUniqueHeaders] = null;
  }
  _renderHeaders() {
    if (this._header) {
      throw new ERR_HTTP_HEADERS_SENT("render");
    }
    const headersMap = this[kOutHeaders];
    const headers = {};
    if (headersMap !== null) {
      const keys = Object.keys(headersMap);
      for (let i2 = 0, l2 = keys.length; i2 < l2; i2++) {
        const key = keys[i2];
        headers[headersMap[key][0]] = headersMap[key][1];
      }
    }
    return headers;
  }
  cork() {
    this[kCorked]++;
    if (this._writtenDataBuffer != null) {
      this._writtenDataBuffer.cork();
    }
  }
  uncork() {
    this[kCorked]--;
    if (this._writtenDataBuffer != null) {
      this._writtenDataBuffer.uncork();
    }
    if (this[kCorked] || this[kChunkedBuffer].length === 0) {
      return;
    }
    const buf = this[kChunkedBuffer];
    for (const { data, encoding, callback } of buf) {
      this._send(data ?? "", encoding, callback);
    }
    this[kChunkedBuffer].length = 0;
    this[kChunkedLength] = 0;
  }
  setTimeout(msecs, callback) {
    return this;
  }
  destroy(error) {
    if (this.destroyed) {
      return this;
    }
    this.destroyed = true;
    this[kErrored] = error;
    return this;
  }
  _send(data, encoding, callback, byteLength) {
    if (!this._headerSent) {
      const header = this._header;
      if (typeof data === "string" && (encoding === "utf8" || encoding === "latin1" || !encoding)) {
        data = header + data;
      } else {
        this.outputData.unshift({
          data: header,
          encoding: "latin1",
          callback: void 0
        });
        this.outputSize += header.length;
        this._onPendingData(header.length);
      }
      this._headerSent = true;
      this.writtenHeaderBytes = header.length;
      const [statusLine, ...headerLines] = this._header.split("\r\n");
      const STATUS_LINE_REGEXP = /^HTTP\/1\.1 (?<statusCode>\d+) (?<statusMessage>.*)$/;
      const statusLineResult = STATUS_LINE_REGEXP.exec(statusLine);
      if (statusLineResult == null) {
        throw new Error("Unexpected! Status line was " + statusLine);
      }
      const { statusCode: statusCodeText, statusMessage } = statusLineResult.groups ?? {};
      const statusCode = parseInt(statusCodeText, 10);
      const headers = [];
      for (const headerLine of headerLines) {
        if (headerLine !== "") {
          const pos = headerLine.indexOf(": ");
          const k = headerLine.slice(0, pos);
          const v = headerLine.slice(pos + 2);
          headers.push([k, v]);
        }
      }
      const event = {
        statusCode,
        statusMessage,
        headers
      };
      this.emit("_headersSent", event);
    }
    return this._writeRaw(data, encoding, callback, byteLength);
  }
  _writeRaw(data, encoding, callback, size) {
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = null;
    }
    if (this._writtenDataBuffer != null) {
      if (this.outputData.length) {
        this._flushOutput(this._writtenDataBuffer);
      }
      return this._writtenDataBuffer.write(data, encoding, callback);
    }
    this.outputData.push({ data, encoding, callback });
    this.outputSize += data.length;
    this._onPendingData(data.length);
    return this.outputSize < this[kHighWaterMark];
  }
  _onDataWritten(index, entry) {
    const event = { index, entry };
    this.emit("_dataWritten", event);
  }
  _storeHeader(firstLine, headers) {
    const state = {
      connection: false,
      contLen: false,
      te: false,
      date: false,
      expect: false,
      trailer: false,
      header: firstLine
    };
    if (headers) {
      if (headers === this[kOutHeaders]) {
        for (const key in headers) {
          const entry = headers[key];
          processHeader(this, state, entry[0], entry[1], false);
        }
      } else if (Array.isArray(headers)) {
        if (headers.length && Array.isArray(headers[0])) {
          for (let i2 = 0; i2 < headers.length; i2++) {
            const entry = headers[i2];
            processHeader(this, state, entry[0], entry[1], true);
          }
        } else {
          if (headers.length % 2 !== 0) {
            throw new ERR_INVALID_ARG_VALUE("headers", headers);
          }
          for (let n2 = 0; n2 < headers.length; n2 += 2) {
            processHeader(this, state, headers[n2], headers[n2 + 1], true);
          }
        }
      } else {
        for (const key in headers) {
          if (headers.hasOwnProperty(key)) {
            const _headers = headers;
            processHeader(this, state, key, _headers[key], true);
          }
        }
      }
    }
    let { header } = state;
    if (this.sendDate && !state.date) {
      header += "Date: " + utcDate() + "\r\n";
    }
    if (this.chunkedEncoding && (this.statusCode === 204 || this.statusCode === 304)) {
      this.chunkedEncoding = false;
      this.shouldKeepAlive = false;
    }
    if (this._removedConnection) {
      this._last = !this.shouldKeepAlive;
    } else if (!state.connection) {
      const shouldSendKeepAlive = this.shouldKeepAlive && (state.contLen || this.useChunkedEncodingByDefault);
      if (shouldSendKeepAlive && this.maxRequestsOnConnectionReached) {
        header += "Connection: close\r\n";
      } else if (shouldSendKeepAlive) {
        header += "Connection: keep-alive\r\n";
        if (this._keepAliveTimeout && this._defaultKeepAlive) {
          const timeoutSeconds = Math.floor(this._keepAliveTimeout / 1e3);
          let max = "";
          if (this._maxRequestsPerSocket && ~~this._maxRequestsPerSocket > 0) {
            max = `, max=${this._maxRequestsPerSocket}`;
          }
          header += `Keep-Alive: timeout=${timeoutSeconds}${max}\r
`;
        }
      } else {
        this._last = true;
        header += "Connection: close\r\n";
      }
    }
    if (!state.contLen && !state.te) {
      if (!this._hasBody) {
        this.chunkedEncoding = false;
      } else if (!this.useChunkedEncodingByDefault) {
        this._last = true;
      } else if (!state.trailer && !this._removedContLen && typeof this._contentLength === "number") {
        header += "Content-Length: " + this._contentLength + "\r\n";
      } else if (!this._removedTE) {
        header += "Transfer-Encoding: chunked\r\n";
        this.chunkedEncoding = true;
      } else {
        this._last = true;
      }
    }
    if (this.chunkedEncoding !== true && state.trailer) {
      throw new ERR_HTTP_TRAILER_INVALID();
    }
    this._header = header + "\r\n";
    this._headerSent = false;
    if (state.expect) {
      this._send("");
    }
  }
  get _headers() {
    console.warn("DEP0066: OutgoingMessage.prototype._headers is deprecated");
    return this.getHeaders();
  }
  set _headers(val) {
    console.warn("DEP0066: OutgoingMessage.prototype._headers is deprecated");
    if (val == null) {
      this[kOutHeaders] = null;
    } else if (typeof val === "object") {
      const headers = this[kOutHeaders] = /* @__PURE__ */ Object.create(null);
      const keys = Object.keys(val);
      for (let i2 = 0; i2 < keys.length; ++i2) {
        const name = keys[i2];
        headers[name.toLowerCase()] = [name, val[name]];
      }
    }
  }
  get connection() {
    return null;
  }
  set connection(_socket) {
    console.error("No support for OutgoingMessage.connection");
  }
  get socket() {
    return null;
  }
  set socket(_socket) {
    console.error("No support for OutgoingMessage.socket");
  }
  get _headerNames() {
    console.warn("DEP0066: OutgoingMessage.prototype._headerNames is deprecated");
    const headers = this[kOutHeaders];
    if (headers !== null) {
      const out = /* @__PURE__ */ Object.create(null);
      const keys = Object.keys(headers);
      for (let i2 = 0; i2 < keys.length; ++i2) {
        const key = keys[i2];
        const val = headers[key][0];
        out[key] = val;
      }
      return out;
    }
    return null;
  }
  set _headerNames(val) {
    console.warn("DEP0066: OutgoingMessage.prototype._headerNames is deprecated");
    if (typeof val === "object" && val !== null) {
      const headers = this[kOutHeaders];
      if (!headers)
        return;
      const keys = Object.keys(val);
      for (let i2 = 0; i2 < keys.length; ++i2) {
        const header = headers[keys[i2]];
        if (header)
          header[0] = val[keys[i2]];
      }
    }
  }
  setHeader(name, value) {
    if (this._header) {
      throw new ERR_HTTP_HEADERS_SENT("set");
    }
    validateHeaderName(name);
    validateHeaderValue(name, value);
    let headers = this[kOutHeaders];
    if (headers === null) {
      this[kOutHeaders] = headers = { __proto__: null };
    }
    headers[name.toLowerCase()] = [name, value];
    return this;
  }
  setHeaders(headers) {
    if (this._header) {
      throw new ERR_HTTP_HEADERS_SENT("set");
    }
    if (!headers || Array.isArray(headers) || typeof headers.keys !== "function" || typeof headers.get !== "function") {
      throw new ERR_INVALID_ARG_TYPE("headers", ["Headers", "Map"], headers);
    }
    const cookies = [];
    for (const { 0: key, 1: value } of headers) {
      if (key === "set-cookie") {
        if (Array.isArray(value)) {
          cookies.push(...value);
        } else {
          cookies.push(value);
        }
        continue;
      }
      this.setHeader(key, value);
    }
    if (cookies.length) {
      this.setHeader("set-cookie", cookies);
    }
    return this;
  }
  appendHeader(name, value) {
    if (this._header) {
      throw new ERR_HTTP_HEADERS_SENT("append");
    }
    validateHeaderName(name);
    validateHeaderValue(name, value);
    const field = name.toLowerCase();
    const headers = this[kOutHeaders];
    if (headers === null || !headers[field]) {
      return this.setHeader(name, value);
    }
    if (!Array.isArray(headers[field][1])) {
      headers[field][1] = [headers[field][1]];
    }
    const existingValues = headers[field][1];
    if (Array.isArray(value)) {
      for (let i2 = 0, length = value.length; i2 < length; i2++) {
        existingValues.push(value[i2]);
      }
    } else {
      existingValues.push(value);
    }
    return this;
  }
  getHeader(name) {
    validateString(name, "name");
    const headers = this[kOutHeaders];
    if (headers === null) {
      return;
    }
    const entry = headers[name.toLowerCase()];
    return entry?.[1];
  }
  getHeaderNames() {
    return this[kOutHeaders] !== null ? Object.keys(this[kOutHeaders]) : [];
  }
  getRawHeaderNames() {
    const headersMap = this[kOutHeaders];
    if (headersMap === null)
      return [];
    const values = Object.values(headersMap);
    const headers = Array(values.length);
    for (let i2 = 0, l2 = values.length; i2 < l2; i2++) {
      headers[i2] = values[i2][0];
    }
    return headers;
  }
  getHeaders() {
    const headers = this[kOutHeaders];
    const ret = { __proto__: null };
    if (headers) {
      const keys = Object.keys(headers);
      for (let i2 = 0; i2 < keys.length; ++i2) {
        const key = keys[i2];
        const val = headers[key][1];
        ret[key] = val;
      }
    }
    return ret;
  }
  hasHeader(name) {
    validateString(name, "name");
    return this[kOutHeaders] !== null && !!this[kOutHeaders][name.toLowerCase()];
  }
  removeHeader(name) {
    validateString(name, "name");
    if (this._header) {
      throw new ERR_HTTP_HEADERS_SENT("remove");
    }
    const key = name.toLowerCase();
    switch (key) {
      case "connection":
        this._removedConnection = true;
        break;
      case "content-length":
        this._removedContLen = true;
        break;
      case "transfer-encoding":
        this._removedTE = true;
        break;
      case "date":
        this.sendDate = false;
        break;
    }
    if (this[kOutHeaders] !== null) {
      delete this[kOutHeaders][key];
    }
  }
  _implicitHeader() {
    throw new ERR_METHOD_NOT_IMPLEMENTED("_implicitHeader()");
  }
  get headersSent() {
    return !!this._header;
  }
  write(chunk, encoding, callback) {
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = null;
    }
    const ret = write_(this, chunk, encoding, callback, false);
    if (!ret) {
      this[kNeedDrain] = true;
    }
    return ret;
  }
  addTrailers(headers) {
    this._trailer = "";
    const isArray = Array.isArray(headers);
    const keys = isArray ? [...headers.keys()] : Object.keys(headers);
    for (let i2 = 0, l2 = keys.length; i2 < l2; i2++) {
      let field, value;
      if (isArray) {
        const _headers = headers;
        const key = keys[i2];
        field = _headers[key][0];
        value = _headers[key][1];
      } else {
        const _headers = headers;
        const key = keys[i2];
        field = key;
        value = _headers[key];
      }
      validateHeaderName(field, "Trailer name");
      if (Array.isArray(value) && value.length > 1 && (!this[kUniqueHeaders] || !this[kUniqueHeaders].has(field.toLowerCase()))) {
        for (let j = 0, l3 = value.length; j < l3; j++) {
          if (checkInvalidHeaderChar(value[j])) {
            throw new ERR_INVALID_CHAR("trailer content", field);
          }
          this._trailer += field + ": " + value[j] + "\r\n";
        }
      } else {
        if (Array.isArray(value)) {
          value = value.join("; ");
        }
        if (checkInvalidHeaderChar(String(value))) {
          throw new ERR_INVALID_CHAR("trailer content", field);
        }
        this._trailer += field + ": " + value + "\r\n";
      }
    }
  }
  end(chunk, encoding, callback) {
    if (typeof chunk === "function") {
      callback = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      callback = encoding;
      encoding = null;
    }
    if (chunk) {
      if (this.finished) {
        onError2(this, new ERR_STREAM_WRITE_AFTER_END(), typeof callback !== "function" ? nop : callback);
        return this;
      }
      if (this._writtenDataBuffer != null) {
        this._writtenDataBuffer.cork();
      }
      write_(this, chunk, encoding, null, true);
    } else if (this.finished) {
      if (typeof callback === "function") {
        if (!this.writableFinished) {
          this.on("finish", callback);
        } else {
          callback(new ERR_STREAM_ALREADY_FINISHED("end"));
        }
      }
      return this;
    } else if (!this._header) {
      if (this._writtenDataBuffer != null) {
        this._writtenDataBuffer.cork();
      }
      this._contentLength = 0;
      this._implicitHeader();
    }
    if (typeof callback === "function")
      this.once("finish", callback);
    if (strictContentLength(this) && this[kBytesWritten] !== this._contentLength) {
      throw new ERR_HTTP_CONTENT_LENGTH_MISMATCH(this[kBytesWritten], this._contentLength);
    }
    const finish = onFinish.bind(void 0, this);
    if (this._hasBody && this.chunkedEncoding) {
      this._send("", "latin1", finish);
    } else if (!this._headerSent || this.writableLength || chunk) {
      this._send("", "latin1", finish);
    } else {
      setTimeout(finish, 0);
    }
    if (this._writtenDataBuffer != null) {
      this._writtenDataBuffer.uncork();
    }
    this[kCorked] = 1;
    this.uncork();
    this.finished = true;
    if (this.outputData.length === 0 && this._writtenDataBuffer != null) {
      this._finish();
    }
    return this;
  }
  _finish() {
    this.emit("prefinish");
  }
  // No _flush() implementation?
  _flush() {
    if (this._writtenDataBuffer != null) {
      const ret = this._flushOutput(this._writtenDataBuffer);
      if (this.finished) {
        this._finish();
      } else if (ret && this[kNeedDrain]) {
        this[kNeedDrain] = false;
        this.emit("drain");
      }
    }
  }
  _flushOutput(dataBuffer) {
    while (this[kCorked]) {
      this[kCorked]--;
      dataBuffer.cork();
    }
    const outputLength = this.outputData.length;
    if (outputLength <= 0) {
      return void 0;
    }
    const outputData = this.outputData;
    dataBuffer.cork();
    let ret;
    for (let i2 = 0; i2 < outputLength; i2++) {
      const { data, encoding, callback } = outputData[i2];
      outputData[i2].data = null;
      ret = dataBuffer.write(data ?? "", encoding, callback);
    }
    dataBuffer.uncork();
    this.outputData = [];
    this._onPendingData(-this.outputSize);
    this.outputSize = 0;
    return ret;
  }
  flushHeaders() {
    if (!this._header) {
      this._implicitHeader();
    }
    this._send("");
  }
  pipe(destination) {
    this.emit("error", new ERR_STREAM_CANNOT_PIPE());
    return destination;
  }
};
function processHeader(self, state, key, value, validate) {
  if (validate) {
    validateHeaderName(key);
  }
  if (isContentDispositionField(key) && self._contentLength) {
    if (Array.isArray(value)) {
      for (let i2 = 0; i2 < value.length; i2++) {
        value[i2] = String(buffer.Buffer.from(String(value[i2]), "latin1"));
      }
    } else {
      value = String(buffer.Buffer.from(String(value), "latin1"));
    }
  }
  if (Array.isArray(value)) {
    if ((value.length < 2 || !isCookieField(key)) && (!self[kUniqueHeaders] || !self[kUniqueHeaders].has(key.toLowerCase()))) {
      for (let i2 = 0; i2 < value.length; i2++) {
        storeHeader(self, state, key, value[i2], validate);
      }
      return;
    }
    value = value.join("; ");
  }
  storeHeader(self, state, key, String(value), validate);
}
function storeHeader(self, state, key, value, validate) {
  if (validate) {
    validateHeaderValue(key, value);
  }
  state.header += key + ": " + value + "\r\n";
  matchHeader(self, state, key, value);
}
function validateHeaderName(name, label) {
  if (typeof name !== "string" || !name || !checkIsHttpToken(name)) {
    throw new ERR_INVALID_HTTP_TOKEN(label || "Header name", name);
  }
}
function validateHeaderValue(name, value) {
  if (value === void 0) {
    throw new ERR_HTTP_INVALID_HEADER_VALUE(String(value), name);
  }
  if (checkInvalidHeaderChar(String(value))) {
    throw new ERR_INVALID_CHAR("header content", name);
  }
}
function matchHeader(self, state, field, value) {
  if (field.length < 4 || field.length > 17)
    return;
  field = field.toLowerCase();
  switch (field) {
    case "connection":
      state.connection = true;
      self._removedConnection = false;
      if (RE_CONN_CLOSE.exec(value) !== null)
        self._last = true;
      else
        self.shouldKeepAlive = true;
      break;
    case "transfer-encoding":
      state.te = true;
      self._removedTE = false;
      if (chunkExpression.exec(value) !== null)
        self.chunkedEncoding = true;
      break;
    case "content-length":
      state.contLen = true;
      self._contentLength = +value;
      self._removedContLen = false;
      break;
    case "date":
    case "expect":
    case "trailer":
      state[field] = true;
      break;
    case "keep-alive":
      self._defaultKeepAlive = false;
      break;
  }
}
function onError2(msg, err, callback) {
  if (msg.destroyed) {
    return;
  }
  setTimeout(emitErrorNt, 0, msg, err, callback);
}
function emitErrorNt(msg, err, callback) {
  callback(err);
  if (typeof msg.emit === "function" && !msg.destroyed) {
    msg.emit("error", err);
  }
}
function strictContentLength(msg) {
  return msg.strictContentLength && msg._contentLength != null && msg._hasBody && !msg._removedContLen && !msg.chunkedEncoding && !msg.hasHeader("transfer-encoding");
}
function write_(msg, chunk, encoding, callback, fromEnd) {
  if (typeof callback !== "function") {
    callback = nop;
  }
  if (chunk === null) {
    throw new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== "string" && !isUint8Array(chunk)) {
    throw new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
  }
  let err = void 0;
  if (msg.finished) {
    err = new ERR_STREAM_WRITE_AFTER_END();
  } else if (msg.destroyed) {
    err = new ERR_STREAM_DESTROYED("write");
  }
  if (err) {
    if (!msg.destroyed) {
      onError2(msg, err, callback);
    } else {
      setTimeout(callback, 0, err);
    }
    return false;
  }
  let len = void 0;
  if (msg.strictContentLength) {
    len ??= typeof chunk === "string" ? buffer.Buffer.byteLength(chunk, encoding ?? void 0) : chunk.byteLength;
    if (strictContentLength(msg) && (fromEnd ? msg[kBytesWritten] + len !== msg._contentLength : msg[kBytesWritten] + len > (msg._contentLength ?? 0))) {
      throw new ERR_HTTP_CONTENT_LENGTH_MISMATCH(len + msg[kBytesWritten], msg._contentLength);
    }
    msg[kBytesWritten] += len;
  }
  if (!msg._header) {
    if (fromEnd) {
      len ??= typeof chunk === "string" ? buffer.Buffer.byteLength(chunk, encoding ?? void 0) : chunk.byteLength;
      msg._contentLength = len;
    }
    msg._implicitHeader();
  }
  if (!msg._hasBody) {
    if (msg[kRejectNonStandardBodyWrites]) {
      throw new ERR_HTTP_BODY_NOT_ALLOWED();
    } else {
      setTimeout(callback, 0);
      return true;
    }
  }
  if (!fromEnd && msg._writtenDataBuffer != null && !msg._writtenDataBuffer.writableCorked) {
    msg._writtenDataBuffer.cork();
    setTimeout(connectionCorkNT, 0, msg._writtenDataBuffer);
  }
  let ret;
  if (msg.chunkedEncoding && chunk.length !== 0) {
    len ??= typeof chunk === "string" ? buffer.Buffer.byteLength(chunk, encoding ?? void 0) : chunk.byteLength;
    if (msg[kCorked] && msg._headerSent) {
      msg[kChunkedBuffer].push({ data: chunk, encoding, callback });
      msg[kChunkedLength] += len;
      ret = msg[kChunkedLength] < msg[kHighWaterMark];
    } else {
      ret = msg._send(chunk, encoding, callback, len);
    }
  } else {
    ret = msg._send(chunk, encoding, callback, len);
  }
  return ret;
}
function connectionCorkNT(dataBuffer) {
  dataBuffer.uncork();
}
function onFinish(outmsg) {
  outmsg.emit("finish");
}
Object.defineProperties(FetchOutgoingMessage.prototype, {
  errored: {
    get() {
      return this[kErrored];
    }
  },
  closed: {
    get() {
      return this._closed;
    }
  },
  writableFinished: {
    get() {
      return this.finished && this.outputSize === 0 && (this._writtenDataBuffer == null || this._writtenDataBuffer.writableLength === 0);
    }
  },
  writableObjectMode: {
    get() {
      return false;
    }
  },
  writableLength: {
    get() {
      return this.outputSize + this[kChunkedLength] + (this._writtenDataBuffer != null ? this._writtenDataBuffer.writableLength : 0);
    }
  },
  writableHighWaterMark: {
    get() {
      return this._writtenDataBuffer != null ? this._writtenDataBuffer.writableHighWaterMark : this[kHighWaterMark];
    }
  },
  writableCorked: {
    get() {
      return this[kCorked];
    }
  },
  writableEnded: {
    get() {
      return this.finished;
    }
  },
  writableNeedDrain: {
    get() {
      return !this.destroyed && !this.finished && this[kNeedDrain];
    }
  }
});
var headerCharRegex2 = /[^\t\x20-\x7e\x80-\xff]/;
function checkInvalidHeaderChar2(val) {
  return headerCharRegex2.test(val);
}
var STATUS_CODES = {
  100: "Continue",
  // RFC 7231 6.2.1
  101: "Switching Protocols",
  // RFC 7231 6.2.2
  102: "Processing",
  // RFC 2518 10.1 (obsoleted by RFC 4918)
  103: "Early Hints",
  // RFC 8297 2
  200: "OK",
  // RFC 7231 6.3.1
  201: "Created",
  // RFC 7231 6.3.2
  202: "Accepted",
  // RFC 7231 6.3.3
  203: "Non-Authoritative Information",
  // RFC 7231 6.3.4
  204: "No Content",
  // RFC 7231 6.3.5
  205: "Reset Content",
  // RFC 7231 6.3.6
  206: "Partial Content",
  // RFC 7233 4.1
  207: "Multi-Status",
  // RFC 4918 11.1
  208: "Already Reported",
  // RFC 5842 7.1
  226: "IM Used",
  // RFC 3229 10.4.1
  300: "Multiple Choices",
  // RFC 7231 6.4.1
  301: "Moved Permanently",
  // RFC 7231 6.4.2
  302: "Found",
  // RFC 7231 6.4.3
  303: "See Other",
  // RFC 7231 6.4.4
  304: "Not Modified",
  // RFC 7232 4.1
  305: "Use Proxy",
  // RFC 7231 6.4.5
  307: "Temporary Redirect",
  // RFC 7231 6.4.7
  308: "Permanent Redirect",
  // RFC 7238 3
  400: "Bad Request",
  // RFC 7231 6.5.1
  401: "Unauthorized",
  // RFC 7235 3.1
  402: "Payment Required",
  // RFC 7231 6.5.2
  403: "Forbidden",
  // RFC 7231 6.5.3
  404: "Not Found",
  // RFC 7231 6.5.4
  405: "Method Not Allowed",
  // RFC 7231 6.5.5
  406: "Not Acceptable",
  // RFC 7231 6.5.6
  407: "Proxy Authentication Required",
  // RFC 7235 3.2
  408: "Request Timeout",
  // RFC 7231 6.5.7
  409: "Conflict",
  // RFC 7231 6.5.8
  410: "Gone",
  // RFC 7231 6.5.9
  411: "Length Required",
  // RFC 7231 6.5.10
  412: "Precondition Failed",
  // RFC 7232 4.2
  413: "Payload Too Large",
  // RFC 7231 6.5.11
  414: "URI Too Long",
  // RFC 7231 6.5.12
  415: "Unsupported Media Type",
  // RFC 7231 6.5.13
  416: "Range Not Satisfiable",
  // RFC 7233 4.4
  417: "Expectation Failed",
  // RFC 7231 6.5.14
  418: "I'm a Teapot",
  // RFC 7168 2.3.3
  421: "Misdirected Request",
  // RFC 7540 9.1.2
  422: "Unprocessable Entity",
  // RFC 4918 11.2
  423: "Locked",
  // RFC 4918 11.3
  424: "Failed Dependency",
  // RFC 4918 11.4
  425: "Too Early",
  // RFC 8470 5.2
  426: "Upgrade Required",
  // RFC 2817 and RFC 7231 6.5.15
  428: "Precondition Required",
  // RFC 6585 3
  429: "Too Many Requests",
  // RFC 6585 4
  431: "Request Header Fields Too Large",
  // RFC 6585 5
  451: "Unavailable For Legal Reasons",
  // RFC 7725 3
  500: "Internal Server Error",
  // RFC 7231 6.6.1
  501: "Not Implemented",
  // RFC 7231 6.6.2
  502: "Bad Gateway",
  // RFC 7231 6.6.3
  503: "Service Unavailable",
  // RFC 7231 6.6.4
  504: "Gateway Timeout",
  // RFC 7231 6.6.5
  505: "HTTP Version Not Supported",
  // RFC 7231 6.6.6
  506: "Variant Also Negotiates",
  // RFC 2295 8.1
  507: "Insufficient Storage",
  // RFC 4918 11.5
  508: "Loop Detected",
  // RFC 5842 7.2
  509: "Bandwidth Limit Exceeded",
  510: "Not Extended",
  // RFC 2774 7
  511: "Network Authentication Required"
  // RFC 6585 6
};
var FetchServerResponse = class _FetchServerResponse extends FetchOutgoingMessage {
  static encoder = new TextEncoder();
  statusCode = 200;
  statusMessage;
  _sent100;
  _expect_continue;
  [kOutHeaders] = null;
  constructor(req, options) {
    super(req, options);
    if (req.method === "HEAD") {
      this._hasBody = false;
    }
    this.sendDate = true;
    this._sent100 = false;
    this._expect_continue = false;
    if (req.httpVersionMajor < 1 || req.httpVersionMinor < 1) {
      this.useChunkedEncodingByDefault = chunkExpression.exec(String(req.headers.te)) !== null;
      this.shouldKeepAlive = false;
    }
    this.fetchResponse = new Promise((resolve) => {
      let finished = false;
      this.on("finish", () => {
        finished = true;
      });
      const initialDataChunks = [];
      const initialDataWrittenHandler = (e2) => {
        if (finished) {
          return;
        }
        initialDataChunks[e2.index] = this.dataFromDataWrittenEvent(e2);
      };
      this.on("_dataWritten", initialDataWrittenHandler);
      this.on("_headersSent", (e2) => {
        this.off("_dataWritten", initialDataWrittenHandler);
        const { statusCode, statusMessage, headers } = e2;
        resolve(this._toFetchResponse(statusCode, statusMessage, headers, initialDataChunks, finished));
      });
    });
  }
  dataFromDataWrittenEvent(e2) {
    const { index, entry } = e2;
    let { data, encoding } = entry;
    if (index === 0) {
      if (typeof data !== "string") {
        console.error("First chunk should be string, not sure what happened.");
        throw new ERR_INVALID_ARG_TYPE("packet.data", ["string", "Buffer", "Uint8Array"], data);
      }
      data = data.slice(this.writtenHeaderBytes);
    }
    if (typeof data === "string") {
      if (encoding === void 0 || encoding === "utf8" || encoding === "utf-8") {
        data = _FetchServerResponse.encoder.encode(data);
      } else {
        data = buffer.Buffer.from(data, encoding ?? void 0);
      }
    }
    return data ?? buffer.Buffer.from([]);
  }
  _finish() {
    super._finish();
  }
  assignSocket(socket) {
    throw new ERR_METHOD_NOT_IMPLEMENTED("assignSocket");
  }
  detachSocket(socket) {
    throw new ERR_METHOD_NOT_IMPLEMENTED("detachSocket");
  }
  writeContinue(callback) {
    this._writeRaw("HTTP/1.1 100 Continue\r\n\r\n", "ascii", callback);
    this._sent100 = true;
  }
  writeProcessing(callback) {
    this._writeRaw("HTTP/1.1 102 Processing\r\n\r\n", "ascii", callback);
  }
  writeEarlyHints(hints, callback) {
    let head = "HTTP/1.1 103 Early Hints\r\n";
    if (hints.link === null || hints.link === void 0) {
      return;
    }
    const link = validateLinkHeaderValue(hints.link);
    if (link.length === 0) {
      return;
    }
    head += "Link: " + link + "\r\n";
    for (const key of Object.keys(hints)) {
      if (key !== "link") {
        head += key + ": " + hints[key] + "\r\n";
      }
    }
    head += "\r\n";
    this._writeRaw(head, "ascii", callback);
  }
  _implicitHeader() {
    this.writeHead(this.statusCode);
  }
  writeHead(statusCode, reason, obj) {
    if (this._header) {
      throw new ERR_HTTP_HEADERS_SENT("write");
    }
    const originalStatusCode = statusCode;
    statusCode |= 0;
    if (statusCode < 100 || statusCode > 999) {
      throw new ERR_HTTP_INVALID_STATUS_CODE(originalStatusCode);
    }
    if (typeof reason === "string") {
      this.statusMessage = reason;
    } else {
      this.statusMessage ||= STATUS_CODES[statusCode] || "unknown";
      obj ??= reason;
    }
    this.statusCode = statusCode;
    let headers;
    if (this[kOutHeaders]) {
      let k;
      if (Array.isArray(obj)) {
        if (obj.length % 2 !== 0) {
          throw new ERR_INVALID_ARG_VALUE("headers", obj);
        }
        for (let n2 = 0; n2 < obj.length; n2 += 2) {
          k = obj[n2 + 0];
          this.removeHeader(String(k));
        }
        for (let n2 = 0; n2 < obj.length; n2 += 2) {
          k = obj[n2];
          if (k) {
            this.appendHeader(String(k), obj[n2 + 1]);
          }
        }
      } else if (obj) {
        const keys = Object.keys(obj);
        for (let i2 = 0; i2 < keys.length; i2++) {
          k = keys[i2];
          if (k) {
            this.setHeader(k, obj[k]);
          }
        }
      }
      headers = this[kOutHeaders];
    } else {
      headers = obj;
    }
    if (checkInvalidHeaderChar2(this.statusMessage)) {
      throw new ERR_INVALID_CHAR("statusMessage");
    }
    const statusLine = `HTTP/1.1 ${statusCode} ${this.statusMessage}\r
`;
    if (statusCode === 204 || statusCode === 304 || statusCode >= 100 && statusCode <= 199) {
      this._hasBody = false;
    }
    if (this._expect_continue && !this._sent100) {
      this.shouldKeepAlive = false;
    }
    const convertedHeaders = headers && !Array.isArray(headers) ? headers : headers;
    this._storeHeader(statusLine, convertedHeaders ?? null);
    return this;
  }
  // Docs-only deprecated: DEP0063
  writeHeader = this.writeHead;
  fetchResponse;
  _toFetchResponse(status, statusText, sentHeaders, initialDataChunks, finished) {
    const headers = new Headers();
    for (const [header, value] of sentHeaders) {
      headers.append(header, value);
    }
    const _this = this;
    let body = this._hasBody ? new ReadableStream({
      start(controller) {
        for (const dataChunk of initialDataChunks) {
          controller.enqueue(dataChunk);
        }
        if (finished) {
          controller.close();
        } else {
          _this.on("finish", () => {
            finished = true;
            controller.close();
          });
          _this.on("_dataWritten", (e2) => {
            if (finished) {
              return;
            }
            const data = _this.dataFromDataWrittenEvent(e2);
            controller.enqueue(data);
          });
        }
      }
    }) : null;
    if (body != null && typeof FixedLengthStream !== "undefined") {
      const contentLength = parseInt(headers.get("content-length") ?? "", 10);
      if (contentLength >= 0) {
        body = body.pipeThrough(new FixedLengthStream(contentLength));
      }
    }
    return new Response(body, {
      status,
      statusText,
      headers
    });
  }
};
function toReqRes(req, options) {
  const { createIncomingMessage = () => new FetchIncomingMessage(), createServerResponse = (incoming2) => new FetchServerResponse(incoming2), ctx } = {};
  const incoming = createIncomingMessage(ctx);
  const serverResponse = createServerResponse(incoming, ctx);
  const reqUrl = new URL(req.url);
  const versionMajor = 1;
  const versionMinor = 1;
  incoming.httpVersionMajor = versionMajor;
  incoming.httpVersionMinor = versionMinor;
  incoming.httpVersion = `${versionMajor}.${versionMinor}`;
  incoming.url = reqUrl.pathname + reqUrl.search;
  incoming.upgrade = false;
  const headers = [];
  for (const [headerName, headerValue] of req.headers) {
    headers.push(headerName);
    headers.push(headerValue);
  }
  incoming._addHeaderLines(headers, headers.length);
  incoming.method = req.method;
  incoming._stream = req.body;
  return {
    req: incoming,
    res: serverResponse
  };
}
function toFetchResponse(res) {
  if (!(res instanceof FetchServerResponse)) {
    throw new Error("toFetchResponse must be called on a ServerResponse generated by toReqRes");
  }
  return res.fetchResponse;
}

// src/server/handlers/mcp.ts
var getMastra = (c2) => c2.get("mastra");
var getMcpServerMessageHandler = async (c2) => {
  const mastra = getMastra(c2);
  const serverId = c2.req.param("serverId");
  const { req, res } = toReqRes(c2.req.raw);
  const server = mastra.getMCPServer(serverId);
  if (!server) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `MCP server '${serverId}' not found` }));
    return;
  }
  try {
    await server.startHTTP({
      url: new URL(c2.req.url),
      httpPath: `/api/mcp/${serverId}/mcp`,
      req,
      res
    });
    return await toFetchResponse(res);
  } catch (error) {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error"
          },
          id: null
          // Cannot determine original request ID in catch
        })
      );
    } else {
      c2.get("logger")?.error("Error after headers sent:", error);
    }
  }
};
var getMcpServerSseHandler = async (c2) => {
  const mastra = getMastra(c2);
  const serverId = c2.req.param("serverId");
  const server = mastra.getMCPServer(serverId);
  if (!server) {
    return c2.json({ error: `MCP server '${serverId}' not found` }, 404);
  }
  const requestUrl = new URL(c2.req.url);
  const sseConnectionPath = `/api/mcp/${serverId}/sse`;
  const sseMessagePath = `/api/mcp/${serverId}/messages`;
  try {
    return await server.startHonoSSE({
      url: requestUrl,
      ssePath: sseConnectionPath,
      messagePath: sseMessagePath,
      context: c2
    });
  } catch (error) {
    c2.get("logger")?.error({ err: error, serverId, path: requestUrl.pathname }, "Error in MCP SSE route handler");
    return handleError(error, "Error handling MCP SSE request");
  }
};
var listMcpRegistryServersHandler = async (c2) => {
  const mastra = getMastra(c2);
  if (!mastra || typeof mastra.getMCPServers !== "function") {
    c2.get("logger")?.error("Mastra instance or getMCPServers method not available in listMcpRegistryServersHandler");
    return c2.json({ error: "Mastra instance or getMCPServers method not available" }, 500);
  }
  const mcpServersMap = mastra.getMCPServers();
  if (!mcpServersMap) {
    c2.get("logger")?.warn("getMCPServers returned undefined or null in listMcpRegistryServersHandler");
    return c2.json({ servers: [], next: null, total_count: 0 });
  }
  const allServersArray = Array.from(
    mcpServersMap instanceof Map ? mcpServersMap.values() : Object.values(mcpServersMap)
  );
  const limit = parseInt(c2.req.query("limit") || "50", 10);
  const offset = parseInt(c2.req.query("offset") || "0", 10);
  const paginatedServers = allServersArray.slice(offset, offset + limit);
  const serverInfos = paginatedServers.map((server) => server.getServerInfo());
  const total_count = allServersArray.length;
  let next = null;
  if (offset + limit < total_count) {
    const nextOffset = offset + limit;
    const currentUrl = new URL(c2.req.url);
    currentUrl.searchParams.set("offset", nextOffset.toString());
    currentUrl.searchParams.set("limit", limit.toString());
    next = currentUrl.toString();
  }
  return c2.json({
    servers: serverInfos,
    next,
    total_count
  });
};
var getMcpRegistryServerDetailHandler = async (c2) => {
  const mastra = getMastra(c2);
  const serverId = c2.req.param("id");
  const requestedVersion = c2.req.query("version");
  if (!mastra || typeof mastra.getMCPServer !== "function") {
    c2.get("logger")?.error("Mastra instance or getMCPServer method not available in getMcpRegistryServerDetailHandler");
    return c2.json({ error: "Mastra instance or getMCPServer method not available" }, 500);
  }
  const server = mastra.getMCPServer(serverId);
  if (!server) {
    return c2.json({ error: `MCP server with ID '${serverId}' not found` }, 404);
  }
  const serverDetailInfo = server.getServerDetail();
  if (requestedVersion && serverDetailInfo.version_detail.version !== requestedVersion) {
    c2.get("logger")?.info(
      `MCP server with ID '${serverId}' found, but version '${serverDetailInfo.version_detail.version}' does not match requested version '${requestedVersion}'.`
    );
    return c2.json(
      {
        error: `MCP server with ID '${serverId}' found, but not version '${requestedVersion}'. Available version is '${serverDetailInfo.version_detail.version}'.`
      },
      404
      // Return 404 as the specific version is not found
    );
  }
  return c2.json(serverDetailInfo);
};
var listMcpServerToolsHandler = async (c2) => {
  const mastra = getMastra(c2);
  const serverId = c2.req.param("serverId");
  if (!mastra || typeof mastra.getMCPServer !== "function") {
    c2.get("logger")?.error("Mastra instance or getMCPServer method not available in listMcpServerToolsHandler");
    return c2.json({ error: "Mastra instance or getMCPServer method not available" }, 500);
  }
  const server = mastra.getMCPServer(serverId);
  if (!server) {
    return c2.json({ error: `MCP server with ID '${serverId}' not found` }, 404);
  }
  if (typeof server.getToolListInfo !== "function") {
    c2.get("logger")?.error(`MCPServer with ID '${serverId}' does not support getToolListInfo.`);
    return c2.json({ error: `Server '${serverId}' cannot list tools in this way.` }, 501);
  }
  try {
    const toolListInfo = server.getToolListInfo();
    return c2.json(toolListInfo);
  } catch (error) {
    c2.get("logger")?.error(`Error in listMcpServerToolsHandler for serverId '${serverId}':`, { error: error.message });
    return handleError(error, `Error listing tools for MCP server '${serverId}'`);
  }
};
var getMcpServerToolDetailHandler = async (c2) => {
  const mastra = getMastra(c2);
  const serverId = c2.req.param("serverId");
  const toolId = c2.req.param("toolId");
  if (!mastra || typeof mastra.getMCPServer !== "function") {
    c2.get("logger")?.error("Mastra instance or getMCPServer method not available in getMcpServerToolDetailHandler");
    return c2.json({ error: "Mastra instance or getMCPServer method not available" }, 500);
  }
  const server = mastra.getMCPServer(serverId);
  if (!server) {
    return c2.json({ error: `MCP server with ID '${serverId}' not found` }, 404);
  }
  if (typeof server.getToolInfo !== "function") {
    c2.get("logger")?.error(`MCPServer with ID '${serverId}' does not support getToolInfo.`);
    return c2.json({ error: `Server '${serverId}' cannot provide tool details in this way.` }, 501);
  }
  try {
    const toolInfo = server.getToolInfo(toolId);
    if (!toolInfo) {
      return c2.json({ error: `Tool with ID '${toolId}' not found on MCP server '${serverId}'` }, 404);
    }
    return c2.json(toolInfo);
  } catch (error) {
    c2.get("logger")?.error(`Error in getMcpServerToolDetailHandler for serverId '${serverId}', toolId '${toolId}':`, {
      error: error.message
    });
    return handleError(error, `Error getting tool '${toolId}' details for MCP server '${serverId}'`);
  }
};
var executeMcpServerToolHandler = async (c2) => {
  const mastra = getMastra(c2);
  const serverId = c2.req.param("serverId");
  const toolId = c2.req.param("toolId");
  if (!mastra || typeof mastra.getMCPServer !== "function") {
    c2.get("logger")?.error("Mastra instance or getMCPServer method not available in executeMcpServerToolHandler");
    return c2.json({ error: "Mastra instance or getMCPServer method not available" }, 500);
  }
  const server = mastra.getMCPServer(serverId);
  if (!server) {
    return c2.json({ error: `MCP server with ID '${serverId}' not found` }, 404);
  }
  if (typeof server.executeTool !== "function") {
    c2.get("logger")?.error(`MCPServer with ID '${serverId}' does not support executeTool.`);
    return c2.json({ error: `Server '${serverId}' cannot execute tools in this way.` }, 501);
  }
  try {
    const body = await c2.req.json();
    const args = body?.data;
    const runtimeContext = body?.runtimeContext;
    const result = await server.executeTool(toolId, args, runtimeContext);
    return c2.json({ result });
  } catch (error) {
    c2.get("logger")?.error(`Error executing tool '${toolId}' on server '${serverId}':`, { error: error.message });
    if (error.name === "ZodError") {
      return c2.json({ error: "Invalid tool arguments", details: error.errors }, 400);
    }
    return handleError(error, `Error executing tool '${toolId}' on MCP server '${serverId}'`);
  }
};
async function getMemoryStatusHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.query("agentId");
    const result = await memory.getMemoryStatusHandler({
      mastra,
      agentId
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error getting memory status");
  }
}
async function getThreadsHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.query("agentId");
    const resourceId = c2.req.query("resourceid");
    const result = await memory.getThreadsHandler({
      mastra,
      agentId,
      resourceId
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error getting threads");
  }
}
async function getThreadByIdHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.query("agentId");
    const threadId = c2.req.param("threadId");
    const result = await memory.getThreadByIdHandler({
      mastra,
      agentId,
      threadId
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error getting thread");
  }
}
async function saveMessagesHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.query("agentId");
    const body = await c2.req.json();
    const result = await memory.saveMessagesHandler({
      mastra,
      agentId,
      body
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error saving messages");
  }
}
async function createThreadHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.query("agentId");
    const body = await c2.req.json();
    const result = await memory.createThreadHandler({
      mastra,
      agentId,
      body
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error saving thread to memory");
  }
}
async function updateThreadHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.query("agentId");
    const threadId = c2.req.param("threadId");
    const body = await c2.req.json();
    const result = await memory.updateThreadHandler({
      mastra,
      agentId,
      threadId,
      body
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error updating thread");
  }
}
async function deleteThreadHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.query("agentId");
    const threadId = c2.req.param("threadId");
    const result = await memory.deleteThreadHandler({
      mastra,
      agentId,
      threadId
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error deleting thread");
  }
}
async function getMessagesHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.query("agentId");
    const threadId = c2.req.param("threadId");
    const rawLimit = c2.req.query("limit");
    let limit = void 0;
    if (rawLimit !== void 0) {
      const n2 = Number(rawLimit);
      if (Number.isFinite(n2) && Number.isInteger(n2) && n2 > 0) {
        limit = n2;
      }
    }
    const result = await memory.getMessagesHandler({
      mastra,
      agentId,
      threadId,
      limit
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error getting messages");
  }
}
async function getNetworksHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const runtimeContext = c2.get("runtimeContext");
    const networks = await network.getNetworksHandler({
      mastra,
      runtimeContext
    });
    return c2.json(networks);
  } catch (error) {
    return handleError(error, "Error getting networks");
  }
}
async function getNetworkByIdHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const networkId = c2.req.param("networkId");
    const runtimeContext = c2.get("runtimeContext");
    const network$1 = await network.getNetworkByIdHandler({
      mastra,
      networkId,
      runtimeContext
    });
    return c2.json(network$1);
  } catch (error) {
    return handleError(error, "Error getting network by ID");
  }
}
async function generateHandler2(c2) {
  try {
    const mastra = c2.get("mastra");
    const runtimeContext = c2.get("runtimeContext");
    const networkId = c2.req.param("networkId");
    const body = await c2.req.json();
    const result = await network.generateHandler({
      mastra,
      runtimeContext,
      networkId,
      body
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error generating from network");
  }
}
async function streamGenerateHandler2(c2) {
  try {
    const mastra = c2.get("mastra");
    const runtimeContext = c2.get("runtimeContext");
    const networkId = c2.req.param("networkId");
    const body = await c2.req.json();
    const streamResponse = await network.streamGenerateHandler({
      mastra,
      runtimeContext,
      networkId,
      body
    });
    return streamResponse;
  } catch (error) {
    return handleError(error, "Error streaming from network");
  }
}
async function generateSystemPromptHandler(c2) {
  try {
    const agentId = c2.req.param("agentId");
    const isPlayground = c2.get("playground") === true;
    if (!isPlayground) {
      return c2.json({ error: "This API is only available in the playground environment" }, 403);
    }
    const { instructions, comment } = await c2.req.json();
    if (!instructions) {
      return c2.json({ error: "Missing instructions in request body" }, 400);
    }
    const mastra = c2.get("mastra");
    const agent$1 = mastra.getAgent(agentId);
    if (!agent$1) {
      return c2.json({ error: "Agent not found" }, 404);
    }
    let evalSummary = "";
    try {
      const testEvals = await mastra.getStorage()?.getEvalsByAgentName?.(agent$1.name, "test") || [];
      const liveEvals = await mastra.getStorage()?.getEvalsByAgentName?.(agent$1.name, "live") || [];
      const evalsMapped = [...testEvals, ...liveEvals].filter(
        ({ instructions: evalInstructions }) => evalInstructions === instructions
      );
      evalSummary = evalsMapped.map(
        ({ input, output, result: result2 }) => `
          Input: ${input}

          Output: ${output}

          Result: ${JSON.stringify(result2)}

        `
      ).join("");
    } catch (error) {
      mastra.getLogger().error(`Error fetching evals`, { error });
    }
    const ENHANCE_SYSTEM_PROMPT_INSTRUCTIONS = `
            You are an expert system prompt engineer, specialized in analyzing and enhancing instructions to create clear, effective, and comprehensive system prompts. Your goal is to help users transform their basic instructions into well-structured system prompts that will guide AI behavior effectively.
            Follow these steps to analyze and enhance the instructions:
            1. ANALYSIS PHASE
            - Identify the core purpose and goals
            - Extract key constraints and requirements
            - Recognize domain-specific terminology and concepts
            - Note any implicit assumptions that should be made explicit
            2. PROMPT STRUCTURE
            Create a system prompt with these components:
            a) ROLE DEFINITION
                - Clear statement of the AI's role and purpose
                - Key responsibilities and scope
                - Primary stakeholders and users
            b) CORE CAPABILITIES
                - Main functions and abilities
                - Specific domain knowledge required
                - Tools and resources available
            c) BEHAVIORAL GUIDELINES
                - Communication style and tone
                - Decision-making framework
                - Error handling approach
                - Ethical considerations
            d) CONSTRAINTS & BOUNDARIES
                - Explicit limitations
                - Out-of-scope activities
                - Security and privacy considerations
            e) SUCCESS CRITERIA
                - Quality standards
                - Expected outcomes
                - Performance metrics
            3. QUALITY CHECKS
            Ensure the prompt is:
            - Clear and unambiguous
            - Comprehensive yet concise
            - Properly scoped
            - Technically accurate
            - Ethically sound
            4. OUTPUT FORMAT
            Return a structured response with:
            - Enhanced system prompt
            - Analysis of key components
            - Identified goals and constraints
            - Core domain concepts
            Remember: A good system prompt should be specific enough to guide behavior but flexible enough to handle edge cases. 
            Focus on creating prompts that are clear, actionable, and aligned with the intended use case.
        `;
    const systemPromptAgent = new agent.Agent({
      name: "system-prompt-enhancer",
      instructions: ENHANCE_SYSTEM_PROMPT_INSTRUCTIONS,
      model: agent$1.llm?.getModel()
    });
    const result = await systemPromptAgent.generate(
      `
            We need to improve the system prompt. 
            Current: ${instructions}
            ${comment ? `User feedback: ${comment}` : ""}
            ${evalSummary ? `
Evaluation Results:
${evalSummary}` : ""}
        `,
      {
        output: zod.z.object({
          new_prompt: zod.z.string(),
          explanation: zod.z.string()
        })
      }
    );
    return c2.json(result?.object || {});
  } catch (error) {
    return handleError(error, "Error generating system prompt");
  }
}

// src/server/handlers/root.ts
async function rootHandler(c2) {
  return c2.text("Hello to the Mastra API!");
}
async function getTelemetryHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const { name, scope, page, perPage, fromDate, toDate } = c2.req.query();
    const attribute = c2.req.queries("attribute");
    const traces = await telemetry.getTelemetryHandler({
      mastra,
      body: {
        name,
        scope,
        page: Number(page ?? 0),
        perPage: Number(perPage ?? 100),
        attribute,
        fromDate: fromDate ? new Date(fromDate) : void 0,
        toDate: toDate ? new Date(toDate) : void 0
      }
    });
    return c2.json({ traces });
  } catch (error) {
    return handleError(error, "Error getting telemetry traces");
  }
}
async function storeTelemetryHandler(c2) {
  try {
    const body = await c2.req.json();
    const mastra = c2.get("mastra");
    const result = await telemetry.storeTelemetryHandler({ mastra, body });
    if (result.status === "error") {
      return c2.json(result, 500);
    }
    return c2.json(result, 200);
  } catch (error) {
    return handleError(error, "Error storing telemetry traces");
  }
}
async function getToolsHandler(c2) {
  try {
    const tools$1 = c2.get("tools");
    const result = await tools.getToolsHandler({
      tools: tools$1
    });
    return c2.json(result || {});
  } catch (error) {
    return handleError(error, "Error getting tools");
  }
}
async function getToolByIdHandler(c2) {
  try {
    const tools$1 = c2.get("tools");
    const toolId = c2.req.param("toolId");
    const result = await tools.getToolByIdHandler({
      tools: tools$1,
      toolId
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error getting tool");
  }
}
function executeToolHandler(tools$1) {
  return async (c2) => {
    try {
      const mastra = c2.get("mastra");
      const runtimeContext = c2.get("runtimeContext");
      const toolId = decodeURIComponent(c2.req.param("toolId"));
      const runId = c2.req.query("runId");
      const { data } = await c2.req.json();
      const result = await tools.executeToolHandler(tools$1)({
        mastra,
        toolId,
        data,
        runtimeContext,
        runId
      });
      return c2.json(result);
    } catch (error) {
      return handleError(error, "Error executing tool");
    }
  };
}
async function executeAgentToolHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const runtimeContext = c2.get("runtimeContext");
    const agentId = c2.req.param("agentId");
    const toolId = c2.req.param("toolId");
    const { data } = await c2.req.json();
    const result = await tools.executeAgentToolHandler({
      mastra,
      agentId,
      toolId,
      data,
      runtimeContext
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error executing tool");
  }
}
async function upsertVectors(c2) {
  try {
    const mastra = c2.get("mastra");
    const vectorName = c2.req.param("vectorName");
    const body = await c2.req.json();
    const result = await vector.upsertVectors({
      mastra,
      vectorName,
      index: body
    });
    return c2.json({ ids: result });
  } catch (error) {
    return handleError(error, "Error upserting vectors");
  }
}
async function createIndex(c2) {
  try {
    const mastra = c2.get("mastra");
    const vectorName = c2.req.param("vectorName");
    const body = await c2.req.json();
    await vector.createIndex({
      mastra,
      vectorName,
      index: body
    });
    return c2.json({ success: true });
  } catch (error) {
    return handleError(error, "Error creating index");
  }
}
async function queryVectors(c2) {
  try {
    const mastra = c2.get("mastra");
    const vectorName = c2.req.param("vectorName");
    const { indexName, queryVector, topK = 10, filter, includeVector = false } = await c2.req.json();
    const results = await vector.queryVectors({
      mastra,
      vectorName,
      query: { indexName, queryVector, topK, filter, includeVector }
    });
    return c2.json({ results });
  } catch (error) {
    return handleError(error, "Error querying vectors");
  }
}
async function listIndexes(c2) {
  try {
    const mastra = c2.get("mastra");
    const vectorName = c2.req.param("vectorName");
    const indexes = await vector.listIndexes({
      mastra,
      vectorName
    });
    return c2.json({ indexes });
  } catch (error) {
    return handleError(error, "Error listing indexes");
  }
}
async function describeIndex(c2) {
  try {
    const mastra = c2.get("mastra");
    const vectorName = c2.req.param("vectorName");
    const indexName = c2.req.param("indexName");
    if (!indexName) {
      throw new httpException.HTTPException(400, { message: "Index name is required" });
    }
    const stats = await vector.describeIndex({
      mastra,
      vectorName,
      indexName
    });
    return c2.json({
      dimension: stats.dimension,
      count: stats.count,
      metric: stats.metric?.toLowerCase()
    });
  } catch (error) {
    return handleError(error, "Error describing index");
  }
}
async function deleteIndex(c2) {
  try {
    const mastra = c2.get("mastra");
    const vectorName = c2.req.param("vectorName");
    const indexName = c2.req.param("indexName");
    if (!indexName) {
      throw new httpException.HTTPException(400, { message: "Index name is required" });
    }
    await vector.deleteIndex({
      mastra,
      vectorName,
      indexName
    });
    return c2.json({ success: true });
  } catch (error) {
    return handleError(error, "Error deleting index");
  }
}
async function getSpeakersHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.param("agentId");
    const speakers = await voice.getSpeakersHandler({
      mastra,
      agentId
    });
    return c2.json(speakers);
  } catch (error) {
    return handleError(error, "Error getting speakers");
  }
}
async function speakHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.param("agentId");
    const { input, options } = await c2.req.json();
    const audioStream = await voice.generateSpeechHandler({
      mastra,
      agentId,
      body: { text: input, speakerId: options?.speakerId }
    });
    c2.header("Content-Type", `audio/${options?.filetype ?? "mp3"}`);
    c2.header("Transfer-Encoding", "chunked");
    return c2.body(audioStream);
  } catch (error) {
    return handleError(error, "Error generating speech");
  }
}
async function getListenerHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.param("agentId");
    const listeners = await voice.getListenerHandler({
      mastra,
      agentId
    });
    return c2.json(listeners);
  } catch (error) {
    return handleError(error, "Error getting listener");
  }
}
async function listenHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const agentId = c2.req.param("agentId");
    const formData = await c2.req.formData();
    const audioFile = formData.get("audio");
    const options = formData.get("options");
    if (!audioFile || !(audioFile instanceof File)) {
      throw new httpException.HTTPException(400, { message: "Audio file is required" });
    }
    const audioData = await audioFile.arrayBuffer();
    let parsedOptions = {};
    try {
      parsedOptions = options ? JSON.parse(options) : {};
    } catch {
    }
    const transcription = await voice.transcribeSpeechHandler({
      mastra,
      agentId,
      body: {
        audioData: Buffer.from(audioData),
        options: parsedOptions
      }
    });
    return c2.json({ text: transcription?.text });
  } catch (error) {
    return handleError(error, "Error transcribing speech");
  }
}
async function getWorkflowsHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflows$1 = await workflows.getWorkflowsHandler({
      mastra
    });
    return c2.json(workflows$1);
  } catch (error) {
    return handleError(error, "Error getting workflows");
  }
}
async function getWorkflowByIdHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const workflow = await workflows.getWorkflowByIdHandler({
      mastra,
      workflowId
    });
    return c2.json(workflow);
  } catch (error) {
    return handleError(error, "Error getting workflow");
  }
}
async function createWorkflowRunHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const prevRunId = c2.req.query("runId");
    const result = await workflows.createWorkflowRunHandler({
      mastra,
      workflowId,
      runId: prevRunId
    });
    return c2.json(result);
  } catch (e2) {
    return handleError(e2, "Error creating run");
  }
}
async function startAsyncWorkflowHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const { inputData, runtimeContext } = await c2.req.json();
    const runId = c2.req.query("runId");
    const result = await workflows.startAsyncWorkflowHandler({
      mastra,
      runtimeContext,
      workflowId,
      runId,
      inputData
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error executing workflow");
  }
}
async function startWorkflowRunHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const { inputData, runtimeContext } = await c2.req.json();
    const runId = c2.req.query("runId");
    await workflows.startWorkflowRunHandler({
      mastra,
      runtimeContext,
      workflowId,
      runId,
      inputData
    });
    return c2.json({ message: "Workflow run started" });
  } catch (e2) {
    return handleError(e2, "Error starting workflow run");
  }
}
function watchWorkflowHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const logger2 = mastra.getLogger();
    const workflowId = c2.req.param("workflowId");
    const runId = c2.req.query("runId");
    if (!runId) {
      throw new httpException.HTTPException(400, { message: "runId required to watch workflow" });
    }
    return streaming.stream(
      c2,
      async (stream4) => {
        try {
          const result = await workflows.watchWorkflowHandler({
            mastra,
            workflowId,
            runId
          });
          const reader = result.getReader();
          stream4.onAbort(() => {
            void reader.cancel("request aborted");
          });
          let chunkResult;
          while ((chunkResult = await reader.read()) && !chunkResult.done) {
            await stream4.write(JSON.stringify(chunkResult.value) + "");
          }
        } catch (err) {
          mastra.getLogger().error("Error in watch stream: " + (err?.message ?? "Unknown error"));
        }
      },
      async (err) => {
        logger2.error("Error in watch stream: " + err?.message);
      }
    );
  } catch (error) {
    return handleError(error, "Error watching workflow");
  }
}
async function streamWorkflowHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const logger2 = mastra.getLogger();
    const workflowId = c2.req.param("workflowId");
    const { inputData, runtimeContext } = await c2.req.json();
    const runId = c2.req.query("runId");
    return streaming.stream(
      c2,
      async (stream4) => {
        try {
          const result = await workflows.streamWorkflowHandler({
            mastra,
            workflowId,
            runId,
            inputData,
            runtimeContext
          });
          const reader = result.stream.getReader();
          stream4.onAbort(() => {
            void reader.cancel("request aborted");
          });
          let chunkResult;
          while ((chunkResult = await reader.read()) && !chunkResult.done) {
            await stream4.write(JSON.stringify(chunkResult.value) + "");
          }
        } catch (err) {
          console.log(err);
        }
      },
      async (err) => {
        logger2.error("Error in workflow stream: " + err?.message);
      }
    );
  } catch (error) {
    return handleError(error, "Error streaming workflow");
  }
}
async function resumeAsyncWorkflowHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const runId = c2.req.query("runId");
    const { step, resumeData, runtimeContext } = await c2.req.json();
    if (!runId) {
      throw new httpException.HTTPException(400, { message: "runId required to resume workflow" });
    }
    const result = await workflows.resumeAsyncWorkflowHandler({
      mastra,
      runtimeContext,
      workflowId,
      runId,
      body: { step, resumeData }
    });
    return c2.json(result);
  } catch (error) {
    return handleError(error, "Error resuming workflow step");
  }
}
async function resumeWorkflowHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const runId = c2.req.query("runId");
    const { step, resumeData, runtimeContext } = await c2.req.json();
    if (!runId) {
      throw new httpException.HTTPException(400, { message: "runId required to resume workflow" });
    }
    await workflows.resumeWorkflowHandler({
      mastra,
      runtimeContext,
      workflowId,
      runId,
      body: { step, resumeData }
    });
    return c2.json({ message: "Workflow run resumed" });
  } catch (error) {
    return handleError(error, "Error resuming workflow");
  }
}
async function getWorkflowRunsHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const { fromDate, toDate, limit, offset, resourceId } = c2.req.query();
    const workflowRuns = await workflows.getWorkflowRunsHandler({
      mastra,
      workflowId,
      fromDate: fromDate ? new Date(fromDate) : void 0,
      toDate: toDate ? new Date(toDate) : void 0,
      limit: limit ? Number(limit) : void 0,
      offset: offset ? Number(offset) : void 0,
      resourceId
    });
    return c2.json(workflowRuns);
  } catch (error) {
    return handleError(error, "Error getting workflow runs");
  }
}
async function getWorkflowRunByIdHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const runId = c2.req.param("runId");
    const workflowRun = await workflows.getWorkflowRunByIdHandler({
      mastra,
      workflowId,
      runId
    });
    return c2.json(workflowRun);
  } catch (error) {
    return handleError(error, "Error getting workflow run");
  }
}
async function getWorkflowRunExecutionResultHandler(c2) {
  try {
    const mastra = c2.get("mastra");
    const workflowId = c2.req.param("workflowId");
    const runId = c2.req.param("runId");
    const workflowRunExecutionResult = await workflows.getWorkflowRunExecutionResultHandler({
      mastra,
      workflowId,
      runId
    });
    return c2.json(workflowRunExecutionResult);
  } catch (error) {
    return handleError(error, "Error getting workflow run execution result");
  }
}

// src/server/welcome.ts
var html2 = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Mastra</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/inter-ui/3.19.3/inter.min.css" />
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #0d0d0d;
        color: #ffffff;
        font-family:
          'Inter',
          -apple-system,
          BlinkMacSystemFont,
          system-ui,
          sans-serif;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
      }

      h1 {
        font-size: 4rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        background: linear-gradient(to right, #fff, #ccc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1.2;
      }

      .subtitle {
        color: #9ca3af;
        font-size: 1.25rem;
        max-width: 600px;
        margin: 0 auto 3rem auto;
        line-height: 1.6;
      }

      .docs-link {
        background-color: #1a1a1a;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        font-family: monospace;
        font-size: 1rem;
        color: #ffffff;
        text-decoration: none;
        transition: background-color 0.2s;
      }

      .docs-link:hover {
        background-color: #252525;
      }

      .arrow-icon {
        transition: transform 0.2s;
      }

      .docs-link:hover .arrow-icon {
        transform: translateX(4px);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Welcome to Mastra</h1>
      <p class="subtitle">
        From the team that brought you Gatsby: prototype and productionize AI features with a modern JS/TS stack.
      </p>

      <a href="https://mastra.ai/docs" class="docs-link">
        Browse the docs
        <svg
          class="arrow-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </main>
  </body>
</html>
`;

// src/server/index.ts
async function createHonoServer(mastra, options = {}) {
  const app = new hono.Hono();
  const server = mastra.getServer();
  let tools = {};
  try {
    const toolsPath = "./tools.mjs";
    const mastraToolsPaths = (await import(toolsPath)).tools;
    const toolImports = mastraToolsPaths ? await Promise.all(
      // @ts-ignore
      mastraToolsPaths.map(async (toolPath) => {
        return import(toolPath);
      })
    ) : [];
    tools = toolImports.reduce((acc, toolModule) => {
      Object.entries(toolModule).forEach(([key, tool]) => {
        acc[key] = tool;
      });
      return acc;
    }, {});
  } catch (err) {
    console.error(
      `Failed to import tools
reason: ${err.message}
${err.stack.split("\n").slice(1).join("\n")}
    `,
      err
    );
  }
  app.use("*", async function setTelemetryInfo(c2, next) {
    const requestId = c2.req.header("x-request-id") ?? crypto.randomUUID();
    const span = core.Telemetry.getActiveSpan();
    if (span) {
      span.setAttribute("http.request_id", requestId);
      span.updateName(`${c2.req.method} ${c2.req.path}`);
      const newCtx = core.Telemetry.setBaggage({
        "http.request_id": { value: requestId }
      });
      await new Promise((resolve) => {
        core.Telemetry.withContext(newCtx, async () => {
          await next();
          resolve(true);
        });
      });
    } else {
      await next();
    }
  });
  app.onError(errorHandler);
  app.use("*", async function setContext(c2, next) {
    let runtimeContext$1 = new runtimeContext.RuntimeContext();
    if (c2.req.method === "POST" || c2.req.method === "PUT") {
      const contentType = c2.req.header("content-type");
      if (contentType?.includes("application/json")) {
        try {
          const clonedReq = c2.req.raw.clone();
          const body = await clonedReq.json();
          if (body.runtimeContext) {
            runtimeContext$1 = new runtimeContext.RuntimeContext(Object.entries(body.runtimeContext));
          }
        } catch {
        }
      }
    }
    c2.set("runtimeContext", runtimeContext$1);
    c2.set("mastra", mastra);
    c2.set("tools", tools);
    c2.set("playground", options.playground === true);
    c2.set("isDev", options.isDev === true);
    return next();
  });
  const serverMiddleware = mastra.getServerMiddleware?.();
  if (serverMiddleware && serverMiddleware.length > 0) {
    for (const m2 of serverMiddleware) {
      app.use(m2.path, m2.handler);
    }
  }
  if (server?.cors === false) {
    app.use("*", timeout.timeout(server?.timeout ?? 3 * 60 * 1e3));
  } else {
    const corsConfig = {
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: false,
      maxAge: 3600,
      ...server?.cors,
      allowHeaders: ["Content-Type", "Authorization", "x-mastra-client-type", ...server?.cors?.allowHeaders ?? []],
      exposeHeaders: ["Content-Length", "X-Requested-With", ...server?.cors?.exposeHeaders ?? []]
    };
    app.use("*", timeout.timeout(server?.timeout ?? 3 * 60 * 1e3), cors.cors(corsConfig));
  }
  app.use("*", authenticationMiddleware);
  app.use("*", authorizationMiddleware);
  const bodyLimitOptions = {
    maxSize: server?.bodySizeLimit ?? 4.5 * 1024 * 1024,
    // 4.5 MB,
    onError: (c2) => c2.json({ error: "Request body too large" }, 413)
  };
  const routes = server?.apiRoutes;
  if (server?.middleware) {
    const normalizedMiddlewares = Array.isArray(server.middleware) ? server.middleware : [server.middleware];
    const middlewares = normalizedMiddlewares.map((middleware2) => {
      if (typeof middleware2 === "function") {
        return {
          path: "*",
          handler: middleware2
        };
      }
      return middleware2;
    });
    for (const middleware2 of middlewares) {
      app.use(middleware2.path, middleware2.handler);
    }
  }
  if (routes) {
    for (const route of routes) {
      const middlewares = [];
      if (route.middleware) {
        middlewares.push(...Array.isArray(route.middleware) ? route.middleware : [route.middleware]);
      }
      if (route.openapi) {
        middlewares.push(w(route.openapi));
      }
      const handler = "handler" in route ? route.handler : await route.createHandler({ mastra });
      if (route.method === "GET") {
        app.get(route.path, ...middlewares, handler);
      } else if (route.method === "POST") {
        app.post(route.path, ...middlewares, handler);
      } else if (route.method === "PUT") {
        app.put(route.path, ...middlewares, handler);
      } else if (route.method === "DELETE") {
        app.delete(route.path, ...middlewares, handler);
      } else if (route.method === "ALL") {
        app.all(route.path, ...middlewares, handler);
      }
    }
  }
  if (server?.build?.apiReqLogs) {
    app.use(logger.logger());
  }
  app.get(
    "/.well-known/:agentId/agent.json",
    w({
      description: "Get agent configuration",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Agent configuration"
        }
      }
    }),
    getAgentCardByIdHandler
  );
  app.post(
    "/a2a/:agentId",
    w({
      description: "Execute agent via A2A protocol",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                method: {
                  type: "string",
                  enum: ["tasks/send", "tasks/sendSubscribe", "tasks/get", "tasks/cancel"],
                  description: "The A2A protocol method to execute"
                },
                params: {
                  type: "object",
                  oneOf: [
                    {
                      // TaskSendParams
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "Unique identifier for the task being initiated or continued"
                        },
                        sessionId: {
                          type: "string",
                          description: "Optional identifier for the session this task belongs to"
                        },
                        message: {
                          type: "object",
                          description: "The message content to send to the agent for processing"
                        },
                        pushNotification: {
                          type: "object",
                          nullable: true,
                          description: "Optional pushNotification information for receiving notifications about this task"
                        },
                        historyLength: {
                          type: "integer",
                          nullable: true,
                          description: "Optional parameter to specify how much message history to include in the response"
                        },
                        metadata: {
                          type: "object",
                          nullable: true,
                          description: "Optional metadata associated with sending this message"
                        }
                      },
                      required: ["id", "message"]
                    },
                    {
                      // TaskQueryParams
                      type: "object",
                      properties: {
                        id: { type: "string", description: "The unique identifier of the task" },
                        historyLength: {
                          type: "integer",
                          nullable: true,
                          description: "Optional history length to retrieve for the task"
                        },
                        metadata: {
                          type: "object",
                          nullable: true,
                          description: "Optional metadata to include with the operation"
                        }
                      },
                      required: ["id"]
                    },
                    {
                      // TaskIdParams
                      type: "object",
                      properties: {
                        id: { type: "string", description: "The unique identifier of the task" },
                        metadata: {
                          type: "object",
                          nullable: true,
                          description: "Optional metadata to include with the operation"
                        }
                      },
                      required: ["id"]
                    }
                  ]
                }
              },
              required: ["method", "params"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "A2A response"
        },
        400: {
          description: "Missing or invalid request parameters"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    getAgentExecutionHandler
  );
  app.get(
    "/api",
    w({
      description: "Get API status",
      tags: ["system"],
      responses: {
        200: {
          description: "Success"
        }
      }
    }),
    rootHandler
  );
  app.get(
    "/api/agents",
    w({
      description: "Get all available agents",
      tags: ["agents"],
      responses: {
        200: {
          description: "List of all agents"
        }
      }
    }),
    getAgentsHandler
  );
  app.get(
    "/api/networks",
    w({
      description: "Get all available networks",
      tags: ["networks"],
      responses: {
        200: {
          description: "List of all networks"
        }
      }
    }),
    getNetworksHandler
  );
  app.get(
    "/api/networks/:networkId",
    w({
      description: "Get network by ID",
      tags: ["networks"],
      parameters: [
        {
          name: "networkId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Network details"
        },
        404: {
          description: "Network not found"
        }
      }
    }),
    getNetworkByIdHandler
  );
  app.post(
    "/api/networks/:networkId/generate",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Generate a response from a network",
      tags: ["networks"],
      parameters: [
        {
          name: "networkId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                input: {
                  oneOf: [
                    { type: "string" },
                    {
                      type: "array",
                      items: { type: "object" }
                    }
                  ],
                  description: "Input for the network, can be a string or an array of CoreMessage objects"
                }
              },
              required: ["input"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Generated response"
        },
        404: {
          description: "Network not found"
        }
      }
    }),
    generateHandler2
  );
  app.post(
    "/api/networks/:networkId/stream",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Generate a response from a network",
      tags: ["networks"],
      parameters: [
        {
          name: "networkId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                input: {
                  oneOf: [
                    { type: "string" },
                    {
                      type: "array",
                      items: { type: "object" }
                    }
                  ],
                  description: "Input for the network, can be a string or an array of CoreMessage objects"
                }
              },
              required: ["input"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Generated response"
        },
        404: {
          description: "Network not found"
        }
      }
    }),
    streamGenerateHandler2
  );
  app.get(
    "/api/agents/:agentId",
    w({
      description: "Get agent by ID",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Agent details"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    getAgentByIdHandler
  );
  app.get(
    "/api/agents/:agentId/evals/ci",
    w({
      description: "Get CI evals by agent ID",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "List of evals"
        }
      }
    }),
    getEvalsByAgentIdHandler
  );
  app.get(
    "/api/agents/:agentId/evals/live",
    w({
      description: "Get live evals by agent ID",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "List of evals"
        }
      }
    }),
    getLiveEvalsByAgentIdHandler
  );
  app.post(
    "/api/agents/:agentId/generate",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Generate a response from an agent",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                messages: {
                  type: "array",
                  items: { type: "object" }
                },
                threadId: { type: "string" },
                resourceId: { type: "string", description: "The resource ID for the conversation" },
                resourceid: {
                  type: "string",
                  description: "The resource ID for the conversation (deprecated, use resourceId instead)",
                  deprecated: true
                },
                runId: { type: "string" },
                output: { type: "object" }
              },
              required: ["messages"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Generated response"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    generateHandler
  );
  app.post(
    "/api/agents/:agentId/stream",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Stream a response from an agent",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                messages: {
                  type: "array",
                  items: { type: "object" }
                },
                threadId: { type: "string" },
                resourceId: { type: "string", description: "The resource ID for the conversation" },
                resourceid: {
                  type: "string",
                  description: "The resource ID for the conversation (deprecated, use resourceId instead)",
                  deprecated: true
                },
                runId: { type: "string" },
                output: { type: "object" }
              },
              required: ["messages"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Streamed response"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    streamGenerateHandler
  );
  if (options.isDev) {
    app.post(
      "/api/agents/:agentId/instructions",
      bodyLimit.bodyLimit(bodyLimitOptions),
      w({
        description: "Update an agent's instructions",
        tags: ["agents"],
        parameters: [
          {
            name: "agentId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  instructions: {
                    type: "string",
                    description: "New instructions for the agent"
                  }
                },
                required: ["instructions"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Instructions updated successfully"
          },
          403: {
            description: "Not allowed in non-playground environment"
          },
          404: {
            description: "Agent not found"
          }
        }
      }),
      setAgentInstructionsHandler
    );
    app.post(
      "/api/agents/:agentId/instructions/enhance",
      bodyLimit.bodyLimit(bodyLimitOptions),
      w({
        description: "Generate an improved system prompt from instructions",
        tags: ["agents"],
        parameters: [
          {
            name: "agentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the agent whose model will be used for prompt generation"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  instructions: {
                    type: "string",
                    description: "Instructions to generate a system prompt from"
                  },
                  comment: {
                    type: "string",
                    description: "Optional comment for the enhanced prompt"
                  }
                },
                required: ["instructions"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Generated system prompt and analysis",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    explanation: {
                      type: "string",
                      description: "Detailed analysis of the instructions"
                    },
                    new_prompt: {
                      type: "string",
                      description: "The enhanced system prompt"
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Missing or invalid request parameters"
          },
          404: {
            description: "Agent not found"
          },
          500: {
            description: "Internal server error or model response parsing error"
          }
        }
      }),
      generateSystemPromptHandler
    );
  }
  app.get(
    "/api/agents/:agentId/speakers",
    async (c2, next) => {
      c2.header("Deprecation", "true");
      c2.header("Warning", '299 - "This endpoint is deprecated, use /api/agents/:agentId/voice/speakers instead"');
      c2.header("Link", '</api/agents/:agentId/voice/speakers>; rel="successor-version"');
      return next();
    },
    w({
      description: "[DEPRECATED] Use /api/agents/:agentId/voice/speakers instead. Get available speakers for an agent",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "List of available speakers",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  description: "Speaker information depending on the voice provider",
                  properties: {
                    voiceId: { type: "string" }
                  },
                  additionalProperties: true
                }
              }
            }
          }
        },
        400: {
          description: "Agent does not have voice capabilities"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    getSpeakersHandler
  );
  app.get(
    "/api/agents/:agentId/voice/speakers",
    w({
      description: "Get available speakers for an agent",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "List of available speakers",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  description: "Speaker information depending on the voice provider",
                  properties: {
                    voiceId: { type: "string" }
                  },
                  additionalProperties: true
                }
              }
            }
          }
        },
        400: {
          description: "Agent does not have voice capabilities"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    getSpeakersHandler
  );
  app.post(
    "/api/agents/:agentId/speak",
    bodyLimit.bodyLimit(bodyLimitOptions),
    async (c2, next) => {
      c2.header("Deprecation", "true");
      c2.header("Warning", '299 - "This endpoint is deprecated, use /api/agents/:agentId/voice/speak instead"');
      c2.header("Link", '</api/agents/:agentId/voice/speak>; rel="successor-version"');
      return next();
    },
    w({
      description: "[DEPRECATED] Use /api/agents/:agentId/voice/speak instead. Convert text to speech using the agent's voice provider",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                text: {
                  type: "string",
                  description: "Text to convert to speech"
                },
                options: {
                  type: "object",
                  description: "Provider-specific options for speech generation",
                  properties: {
                    speaker: {
                      type: "string",
                      description: "Speaker ID to use for speech generation"
                    }
                  },
                  additionalProperties: true
                }
              },
              required: ["text"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Audio stream",
          content: {
            "audio/mpeg": {
              schema: {
                format: "binary",
                description: "Audio stream containing the generated speech"
              }
            },
            "audio/*": {
              schema: {
                format: "binary",
                description: "Audio stream depending on the provider"
              }
            }
          }
        },
        400: {
          description: "Agent does not have voice capabilities or invalid request"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    speakHandler
  );
  app.post(
    "/api/agents/:agentId/voice/speak",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Convert text to speech using the agent's voice provider",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                input: {
                  type: "string",
                  description: "Text to convert to speech"
                },
                options: {
                  type: "object",
                  description: "Provider-specific options for speech generation",
                  properties: {
                    speaker: {
                      type: "string",
                      description: "Speaker ID to use for speech generation"
                    },
                    options: {
                      type: "object",
                      description: "Provider-specific options for speech generation",
                      additionalProperties: true
                    }
                  },
                  additionalProperties: true
                }
              },
              required: ["text"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Audio stream",
          content: {
            "audio/mpeg": {
              schema: {
                format: "binary",
                description: "Audio stream containing the generated speech"
              }
            },
            "audio/*": {
              schema: {
                format: "binary",
                description: "Audio stream depending on the provider"
              }
            }
          }
        },
        400: {
          description: "Agent does not have voice capabilities or invalid request"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    speakHandler
  );
  app.get(
    "/api/agents/:agentId/voice/listener",
    w({
      description: "Get available listener for an agent",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Checks if listener is available for the agent",
          content: {
            "application/json": {
              schema: {
                type: "object",
                description: "Listener information depending on the voice provider",
                properties: {
                  enabled: { type: "boolean" }
                },
                additionalProperties: true
              }
            }
          }
        },
        400: {
          description: "Agent does not have voice capabilities"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    getListenerHandler
  );
  app.post(
    "/api/agents/:agentId/listen",
    bodyLimit.bodyLimit({
      ...bodyLimitOptions,
      maxSize: 10 * 1024 * 1024
      // 10 MB for audio files
    }),
    async (c2, next) => {
      c2.header("Deprecation", "true");
      c2.header("Warning", '299 - "This endpoint is deprecated, use /api/agents/:agentId/voice/listen instead"');
      c2.header("Link", '</api/agents/:agentId/voice/listen>; rel="successor-version"');
      return next();
    },
    w({
      description: "[DEPRECATED] Use /api/agents/:agentId/voice/listen instead. Convert speech to text using the agent's voice provider. Additional provider-specific options can be passed as query parameters.",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "audio/mpeg": {
            schema: {
              format: "binary",
              description: "Audio data stream to transcribe (supports various formats depending on provider like mp3, wav, webm, flac)"
            }
          }
        }
      },
      responses: {
        200: {
          description: "Transcription result",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                    description: "Transcribed text"
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Agent does not have voice capabilities or invalid request"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    listenHandler
  );
  app.post(
    "/api/agents/:agentId/voice/listen",
    bodyLimit.bodyLimit({
      ...bodyLimitOptions,
      maxSize: 10 * 1024 * 1024
      // 10 MB for audio files
    }),
    w({
      description: "Convert speech to text using the agent's voice provider. Additional provider-specific options can be passed as query parameters.",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["audio"],
              properties: {
                audio: {
                  type: "string",
                  format: "binary",
                  description: "Audio data stream to transcribe (supports various formats depending on provider like mp3, wav, webm, flac)"
                },
                options: {
                  type: "object",
                  description: "Provider-specific options for speech-to-text",
                  additionalProperties: true
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Transcription result",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                    description: "Transcribed text"
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Agent does not have voice capabilities or invalid request"
        },
        404: {
          description: "Agent not found"
        }
      }
    }),
    listenHandler
  );
  app.post(
    "/api/agents/:agentId/tools/:toolId/execute",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Execute a tool through an agent",
      tags: ["agents"],
      parameters: [
        {
          name: "agentId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "toolId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: { type: "object" },
                runtimeContext: { type: "object" }
              },
              required: ["data"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Tool execution result"
        },
        404: {
          description: "Tool or agent not found"
        }
      }
    }),
    executeAgentToolHandler
  );
  app.post(
    "/api/mcp/:serverId/mcp",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Send a message to an MCP server using Streamable HTTP",
      tags: ["mcp"],
      parameters: [
        {
          name: "serverId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        content: { "application/json": { schema: { type: "object" } } }
      },
      responses: {
        200: {
          description: "Streamable HTTP connection processed"
        },
        404: {
          description: "MCP server not found"
        }
      }
    }),
    getMcpServerMessageHandler
  );
  app.get(
    "/api/mcp/:serverId/mcp",
    w({
      description: "Send a message to an MCP server using Streamable HTTP",
      tags: ["mcp"],
      parameters: [
        {
          name: "serverId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Streamable HTTP connection processed"
        },
        404: {
          description: "MCP server not found"
        }
      }
    }),
    getMcpServerMessageHandler
  );
  const mcpSseBasePath = "/api/mcp/:serverId/sse";
  const mcpSseMessagePath = "/api/mcp/:serverId/messages";
  app.get(
    mcpSseBasePath,
    w({
      description: "Establish an MCP Server-Sent Events (SSE) connection with a server instance.",
      tags: ["mcp"],
      parameters: [
        {
          name: "serverId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the MCP server instance."
        }
      ],
      responses: {
        200: {
          description: "SSE connection established. The client will receive events over this connection. (Content-Type: text/event-stream)"
        },
        404: { description: "MCP server instance not found." },
        500: { description: "Internal server error establishing SSE connection." }
      }
    }),
    getMcpServerSseHandler
  );
  app.post(
    mcpSseMessagePath,
    bodyLimit.bodyLimit(bodyLimitOptions),
    // Apply body limit for messages
    w({
      description: "Send a message to an MCP server over an established SSE connection.",
      tags: ["mcp"],
      parameters: [
        {
          name: "serverId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the MCP server instance."
        }
      ],
      requestBody: {
        description: "JSON-RPC message to send to the MCP server.",
        required: true,
        content: { "application/json": { schema: { type: "object" } } }
        // MCP messages are typically JSON
      },
      responses: {
        200: {
          description: "Message received and is being processed by the MCP server. The actual result or error will be sent as an SSE event over the established connection."
        },
        400: { description: "Bad request (e.g., invalid JSON payload or missing body)." },
        404: { description: "MCP server instance not found or SSE connection path incorrect." },
        503: { description: "SSE connection not established with this server, or server unable to process message." }
      }
    }),
    getMcpServerSseHandler
  );
  app.get(
    "/api/mcp/v0/servers",
    w({
      description: "List all available MCP server instances with basic information.",
      tags: ["mcp"],
      parameters: [
        {
          name: "limit",
          in: "query",
          description: "Number of results per page.",
          required: false,
          schema: { type: "integer", default: 50, minimum: 1, maximum: 5e3 }
        },
        {
          name: "offset",
          in: "query",
          description: "Number of results to skip for pagination.",
          required: false,
          schema: { type: "integer", default: 0, minimum: 0 }
        }
      ],
      responses: {
        200: {
          description: "A list of MCP server instances.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  servers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        repository: {
                          type: "object",
                          properties: {
                            url: { type: "string", description: "The URL of the repository (e.g., a GitHub URL)" },
                            source: {
                              type: "string",
                              description: "The source control platform (e.g., 'github', 'gitlab')",
                              enum: ["github", "gitlab"]
                            },
                            id: { type: "string", description: "A unique identifier for the repository at the source" }
                          }
                        },
                        version_detail: {
                          type: "object",
                          properties: {
                            version: { type: "string", description: 'The semantic version string (e.g., "1.0.2")' },
                            release_date: {
                              type: "string",
                              description: "The ISO 8601 date-time string when this version was released or registered"
                            },
                            is_latest: {
                              type: "boolean",
                              description: "Indicates if this version is the latest available"
                            }
                          }
                        }
                      }
                    }
                  },
                  next: { type: "string", format: "uri", nullable: true },
                  total_count: { type: "integer" }
                }
              }
            }
          }
        }
      }
    }),
    listMcpRegistryServersHandler
  );
  app.get(
    "/api/mcp/v0/servers/:id",
    w({
      description: "Get detailed information about a specific MCP server instance.",
      tags: ["mcp"],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Unique ID of the MCP server instance.",
          schema: { type: "string" }
        },
        {
          name: "version",
          in: "query",
          required: false,
          description: "Desired MCP server version (currently informational, server returns its actual version).",
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Detailed information about the MCP server instance.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  description: { type: "string" },
                  repository: {
                    type: "object",
                    properties: {
                      url: { type: "string" },
                      source: { type: "string" },
                      id: { type: "string" }
                    }
                  },
                  version_detail: {
                    type: "object",
                    properties: {
                      version: { type: "string" },
                      release_date: { type: "string" },
                      is_latest: { type: "boolean" }
                    }
                  },
                  package_canonical: { type: "string" },
                  packages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        registry_name: { type: "string" },
                        name: { type: "string" },
                        version: { type: "string" },
                        command: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            subcommands: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  description: { type: "string" },
                                  is_required: { type: "boolean" },
                                  subcommands: {
                                    type: "array",
                                    items: { type: "object" }
                                  },
                                  positional_arguments: {
                                    type: "array",
                                    items: { type: "object" }
                                  },
                                  named_arguments: {
                                    type: "array",
                                    items: { type: "object" }
                                  }
                                }
                              }
                            },
                            positional_arguments: {
                              type: "array",
                              items: { type: "object" }
                            },
                            named_arguments: {
                              type: "array",
                              items: { type: "object" }
                            }
                          }
                        },
                        environment_variables: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              description: { type: "string" },
                              required: { type: "boolean" },
                              default_value: { type: "string" }
                            }
                          }
                        }
                      }
                    }
                  },
                  remotes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        transport_type: { type: "string" },
                        url: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: "MCP server instance not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" }
                }
              }
            }
          }
        }
      }
    }),
    getMcpRegistryServerDetailHandler
  );
  app.get(
    "/api/mcp/:serverId/tools",
    w({
      description: "List all tools available on a specific MCP server instance.",
      tags: ["mcp"],
      parameters: [
        {
          name: "serverId",
          in: "path",
          required: true,
          description: "Unique ID of the MCP server instance.",
          schema: { type: "string" }
        }
      ],
      responses: {
        200: { description: "A list of tools for the MCP server." },
        // Define schema if you have one for McpServerToolListResponse
        404: { description: "MCP server instance not found." },
        501: { description: "Server does not support listing tools." }
      }
    }),
    listMcpServerToolsHandler
  );
  app.get(
    "/api/mcp/:serverId/tools/:toolId",
    w({
      description: "Get details for a specific tool on an MCP server.",
      tags: ["mcp"],
      parameters: [
        { name: "serverId", in: "path", required: true, schema: { type: "string" } },
        { name: "toolId", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: { description: "Details of the specified tool." },
        // Define schema for McpToolInfo
        404: { description: "MCP server or tool not found." },
        501: { description: "Server does not support getting tool details." }
      }
    }),
    getMcpServerToolDetailHandler
  );
  app.post(
    "/api/mcp/:serverId/tools/:toolId/execute",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Execute a specific tool on an MCP server.",
      tags: ["mcp"],
      parameters: [
        { name: "serverId", in: "path", required: true, schema: { type: "string" } },
        { name: "toolId", in: "path", required: true, schema: { type: "string" } }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: { type: "object" },
                runtimeContext: { type: "object" }
              }
            }
          }
        }
        // Simplified schema
      },
      responses: {
        200: { description: "Result of the tool execution." },
        400: { description: "Invalid tool arguments." },
        404: { description: "MCP server or tool not found." },
        501: { description: "Server does not support tool execution." }
      }
    }),
    executeMcpServerToolHandler
  );
  app.get(
    "/api/memory/status",
    w({
      description: "Get memory status",
      tags: ["memory"],
      parameters: [
        {
          name: "agentId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Memory status"
        }
      }
    }),
    getMemoryStatusHandler
  );
  app.get(
    "/api/memory/threads",
    w({
      description: "Get all threads",
      tags: ["memory"],
      parameters: [
        {
          name: "resourceid",
          in: "query",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "agentId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "List of all threads"
        }
      }
    }),
    getThreadsHandler
  );
  app.get(
    "/api/memory/threads/:threadId",
    w({
      description: "Get thread by ID",
      tags: ["memory"],
      parameters: [
        {
          name: "threadId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "agentId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Thread details"
        },
        404: {
          description: "Thread not found"
        }
      }
    }),
    getThreadByIdHandler
  );
  app.get(
    "/api/memory/threads/:threadId/messages",
    w({
      description: "Get messages for a thread",
      tags: ["memory"],
      parameters: [
        {
          name: "threadId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "agentId",
          in: "query",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "number" },
          description: "Limit the number of messages to retrieve (default: 40)"
        }
      ],
      responses: {
        200: {
          description: "List of messages"
        }
      }
    }),
    getMessagesHandler
  );
  app.post(
    "/api/memory/threads",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Create a new thread",
      tags: ["memory"],
      parameters: [
        {
          name: "agentId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                metadata: { type: "object" },
                resourceId: { type: "string" },
                threadId: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Created thread"
        }
      }
    }),
    createThreadHandler
  );
  app.patch(
    "/api/memory/threads/:threadId",
    w({
      description: "Update a thread",
      tags: ["memory"],
      parameters: [
        {
          name: "threadId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "agentId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object" }
          }
        }
      },
      responses: {
        200: {
          description: "Updated thread"
        },
        404: {
          description: "Thread not found"
        }
      }
    }),
    updateThreadHandler
  );
  app.delete(
    "/api/memory/threads/:threadId",
    w({
      description: "Delete a thread",
      tags: ["memory"],
      parameters: [
        {
          name: "threadId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "agentId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Thread deleted"
        },
        404: {
          description: "Thread not found"
        }
      }
    }),
    deleteThreadHandler
  );
  app.post(
    "/api/memory/save-messages",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Save messages",
      tags: ["memory"],
      parameters: [
        {
          name: "agentId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                messages: {
                  type: "array",
                  items: { type: "object" }
                }
              },
              required: ["messages"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Messages saved"
        }
      }
    }),
    saveMessagesHandler
  );
  app.get(
    "/api/telemetry",
    w({
      description: "Get all traces",
      tags: ["telemetry"],
      responses: {
        200: {
          description: "List of all traces (paged)"
        }
      }
    }),
    getTelemetryHandler
  );
  app.post(
    "/api/telemetry",
    w({
      description: "Store telemetry",
      tags: ["telemetry"],
      responses: {
        200: {
          description: "Traces stored"
        }
      }
    }),
    storeTelemetryHandler
  );
  app.get(
    "/api/workflows/legacy",
    w({
      description: "Get all legacy workflows",
      tags: ["legacyWorkflows"],
      responses: {
        200: {
          description: "List of all legacy workflows"
        }
      }
    }),
    getLegacyWorkflowsHandler
  );
  app.get(
    "/api/workflows/legacy/:workflowId",
    w({
      description: "Get legacy workflow by ID",
      tags: ["legacyWorkflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Legacy Workflow details"
        },
        404: {
          description: "Legacy Workflow not found"
        }
      }
    }),
    getLegacyWorkflowByIdHandler
  );
  app.get(
    "/api/workflows/legacy/:workflowId/runs",
    w({
      description: "Get all runs for a legacy workflow",
      tags: ["legacyWorkflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        { name: "fromDate", in: "query", required: false, schema: { type: "string", format: "date-time" } },
        { name: "toDate", in: "query", required: false, schema: { type: "string", format: "date-time" } },
        { name: "limit", in: "query", required: false, schema: { type: "number" } },
        { name: "offset", in: "query", required: false, schema: { type: "number" } },
        { name: "resourceId", in: "query", required: false, schema: { type: "string" } }
      ],
      responses: {
        200: {
          description: "List of legacy workflow runs from storage"
        }
      }
    }),
    getLegacyWorkflowRunsHandler
  );
  app.post(
    "/api/workflows/legacy/:workflowId/resume",
    w({
      description: "Resume a suspended legacy workflow step",
      tags: ["legacyWorkflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                stepId: { type: "string" },
                context: { type: "object" }
              }
            }
          }
        }
      }
    }),
    resumeLegacyWorkflowHandler
  );
  app.post(
    "/api/workflows/legacy/:workflowId/resume-async",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Resume a suspended legacy workflow step",
      tags: ["legacyWorkflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                stepId: { type: "string" },
                context: { type: "object" }
              }
            }
          }
        }
      }
    }),
    resumeAsyncLegacyWorkflowHandler
  );
  app.post(
    "/api/workflows/legacy/:workflowId/create-run",
    w({
      description: "Create a new legacy workflow run",
      tags: ["legacyWorkflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: false,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "New legacy workflow run created"
        }
      }
    }),
    createLegacyWorkflowRunHandler
  );
  app.post(
    "/api/workflows/legacy/:workflowId/start-async",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Execute/Start a legacy workflow",
      tags: ["legacyWorkflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: false,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                input: { type: "object" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Legacy Workflow execution result"
        },
        404: {
          description: "Legacy Workflow not found"
        }
      }
    }),
    startAsyncLegacyWorkflowHandler
  );
  app.post(
    "/api/workflows/legacy/:workflowId/start",
    w({
      description: "Create and start a new legacy workflow run",
      tags: ["legacyWorkflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                input: { type: "object" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Legacy Workflow run started"
        },
        404: {
          description: "Legacy Workflow not found"
        }
      }
    }),
    startLegacyWorkflowRunHandler
  );
  app.get(
    "/api/workflows/legacy/:workflowId/watch",
    w({
      description: "Watch legacy workflow transitions in real-time",
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: false,
          schema: { type: "string" }
        }
      ],
      tags: ["legacyWorkflows"],
      responses: {
        200: {
          description: "Legacy Workflow transitions in real-time"
        }
      }
    }),
    watchLegacyWorkflowHandler
  );
  app.get(
    "/api/workflows",
    w({
      description: "Get all workflows",
      tags: ["workflows"],
      responses: {
        200: {
          description: "List of all workflows"
        }
      }
    }),
    getWorkflowsHandler
  );
  app.get(
    "/api/workflows/:workflowId",
    w({
      description: "Get workflow by ID",
      tags: ["workflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Workflow details"
        },
        404: {
          description: "Workflow not found"
        }
      }
    }),
    getWorkflowByIdHandler
  );
  app.get(
    "/api/workflows/:workflowId/runs",
    w({
      description: "Get all runs for a workflow",
      tags: ["workflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        { name: "fromDate", in: "query", required: false, schema: { type: "string", format: "date-time" } },
        { name: "toDate", in: "query", required: false, schema: { type: "string", format: "date-time" } },
        { name: "limit", in: "query", required: false, schema: { type: "number" } },
        { name: "offset", in: "query", required: false, schema: { type: "number" } },
        { name: "resourceId", in: "query", required: false, schema: { type: "string" } }
      ],
      responses: {
        200: {
          description: "List of workflow runs from storage"
        }
      }
    }),
    getWorkflowRunsHandler
  );
  app.get(
    "/api/workflows/:workflowId/runs/:runId/execution-result",
    w({
      description: "Get execution result for a workflow run",
      tags: ["workflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Workflow run execution result"
        },
        404: {
          description: "Workflow run execution result not found"
        }
      }
    }),
    getWorkflowRunExecutionResultHandler
  );
  app.get(
    "/api/workflows/:workflowId/runs/:runId",
    w({
      description: "Get workflow run by ID",
      tags: ["workflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Workflow run by ID"
        },
        404: {
          description: "Workflow run not found"
        }
      }
    }),
    getWorkflowRunByIdHandler
  );
  app.post(
    "/api/workflows/:workflowId/resume",
    w({
      description: "Resume a suspended workflow step",
      tags: ["workflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                step: {
                  oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }]
                },
                resumeData: { type: "object" },
                runtimeContext: {
                  type: "object",
                  description: "Runtime context for the workflow execution"
                }
              },
              required: ["step"]
            }
          }
        }
      }
    }),
    resumeWorkflowHandler
  );
  app.post(
    "/api/workflows/:workflowId/resume-async",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Resume a suspended workflow step",
      tags: ["workflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                step: {
                  oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }]
                },
                resumeData: { type: "object" },
                runtimeContext: {
                  type: "object",
                  description: "Runtime context for the workflow execution"
                }
              },
              required: ["step"]
            }
          }
        }
      }
    }),
    resumeAsyncWorkflowHandler
  );
  app.post(
    "/api/workflows/:workflowId/stream",
    w({
      description: "Stream workflow in real-time",
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: false,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                inputData: { type: "object" },
                runtimeContext: {
                  type: "object",
                  description: "Runtime context for the workflow execution"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "workflow run started"
        },
        404: {
          description: "workflow not found"
        }
      },
      tags: ["workflows"]
    }),
    streamWorkflowHandler
  );
  app.post(
    "/api/workflows/:workflowId/create-run",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Create a new workflow run",
      tags: ["workflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: false,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "New workflow run created"
        }
      }
    }),
    createWorkflowRunHandler
  );
  app.post(
    "/api/workflows/:workflowId/start-async",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Execute/Start a workflow",
      tags: ["workflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: false,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                inputData: { type: "object" },
                runtimeContext: {
                  type: "object",
                  description: "Runtime context for the workflow execution"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "workflow execution result"
        },
        404: {
          description: "workflow not found"
        }
      }
    }),
    startAsyncWorkflowHandler
  );
  app.post(
    "/api/workflows/:workflowId/start",
    w({
      description: "Create and start a new workflow run",
      tags: ["workflows"],
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                inputData: { type: "object" },
                runtimeContext: {
                  type: "object",
                  description: "Runtime context for the workflow execution"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "workflow run started"
        },
        404: {
          description: "workflow not found"
        }
      }
    }),
    startWorkflowRunHandler
  );
  app.get(
    "/api/workflows/:workflowId/watch",
    w({
      description: "Watch workflow transitions in real-time",
      parameters: [
        {
          name: "workflowId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: false,
          schema: { type: "string" }
        }
      ],
      tags: ["workflows"],
      responses: {
        200: {
          description: "workflow transitions in real-time"
        }
      }
    }),
    watchWorkflowHandler
  );
  app.get(
    "/api/logs",
    w({
      description: "Get all logs",
      tags: ["logs"],
      parameters: [
        {
          name: "transportId",
          in: "query",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "fromDate",
          in: "query",
          required: false,
          schema: { type: "string" }
        },
        {
          name: "toDate",
          in: "query",
          required: false,
          schema: { type: "string" }
        },
        {
          name: "logLevel",
          in: "query",
          required: false,
          schema: { type: "string" }
        },
        {
          name: "filters",
          in: "query",
          required: false,
          schema: { type: "string" }
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: { type: "number" }
        },
        {
          name: "perPage",
          in: "query",
          required: false,
          schema: { type: "number" }
        }
      ],
      responses: {
        200: {
          description: "Paginated list of all logs"
        }
      }
    }),
    getLogsHandler
  );
  app.get(
    "/api/logs/transports",
    w({
      description: "List of all log transports",
      tags: ["logs"],
      responses: {
        200: {
          description: "List of all log transports"
        }
      }
    }),
    getLogTransports
  );
  app.get(
    "/api/logs/:runId",
    w({
      description: "Get logs by run ID",
      tags: ["logs"],
      parameters: [
        {
          name: "runId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "transportId",
          in: "query",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "fromDate",
          in: "query",
          required: false,
          schema: { type: "string" }
        },
        {
          name: "toDate",
          in: "query",
          required: false,
          schema: { type: "string" }
        },
        {
          name: "logLevel",
          in: "query",
          required: false,
          schema: { type: "string" }
        },
        {
          name: "filters",
          in: "query",
          required: false,
          schema: { type: "string" }
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: { type: "number" }
        },
        {
          name: "perPage",
          in: "query",
          required: false,
          schema: { type: "number" }
        }
      ],
      responses: {
        200: {
          description: "Paginated list of logs for run ID"
        }
      }
    }),
    getLogsByRunIdHandler
  );
  app.get(
    "/api/tools",
    w({
      description: "Get all tools",
      tags: ["tools"],
      responses: {
        200: {
          description: "List of all tools"
        }
      }
    }),
    getToolsHandler
  );
  app.get(
    "/api/tools/:toolId",
    w({
      description: "Get tool by ID",
      tags: ["tools"],
      parameters: [
        {
          name: "toolId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Tool details"
        },
        404: {
          description: "Tool not found"
        }
      }
    }),
    getToolByIdHandler
  );
  app.post(
    "/api/tools/:toolId/execute",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Execute a tool",
      tags: ["tools"],
      parameters: [
        {
          name: "toolId",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "runId",
          in: "query",
          required: false,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: { type: "object" },
                runtimeContext: { type: "object" }
              },
              required: ["data"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Tool execution result"
        },
        404: {
          description: "Tool not found"
        }
      }
    }),
    executeToolHandler(tools)
  );
  app.post(
    "/api/vector/:vectorName/upsert",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Upsert vectors into an index",
      tags: ["vector"],
      parameters: [
        {
          name: "vectorName",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                indexName: { type: "string" },
                vectors: {
                  type: "array",
                  items: {
                    type: "array",
                    items: { type: "number" }
                  }
                },
                metadata: {
                  type: "array",
                  items: { type: "object" }
                },
                ids: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["indexName", "vectors"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Vectors upserted successfully"
        }
      }
    }),
    upsertVectors
  );
  app.post(
    "/api/vector/:vectorName/create-index",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Create a new vector index",
      tags: ["vector"],
      parameters: [
        {
          name: "vectorName",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                indexName: { type: "string" },
                dimension: { type: "number" },
                metric: {
                  type: "string",
                  enum: ["cosine", "euclidean", "dotproduct"]
                }
              },
              required: ["indexName", "dimension"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Index created successfully"
        }
      }
    }),
    createIndex
  );
  app.post(
    "/api/vector/:vectorName/query",
    bodyLimit.bodyLimit(bodyLimitOptions),
    w({
      description: "Query vectors from an index",
      tags: ["vector"],
      parameters: [
        {
          name: "vectorName",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                indexName: { type: "string" },
                queryVector: {
                  type: "array",
                  items: { type: "number" }
                },
                topK: { type: "number" },
                filter: { type: "object" },
                includeVector: { type: "boolean" }
              },
              required: ["indexName", "queryVector"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "Query results"
        }
      }
    }),
    queryVectors
  );
  app.get(
    "/api/vector/:vectorName/indexes",
    w({
      description: "List all indexes for a vector store",
      tags: ["vector"],
      parameters: [
        {
          name: "vectorName",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "List of indexes"
        }
      }
    }),
    listIndexes
  );
  app.get(
    "/api/vector/:vectorName/indexes/:indexName",
    w({
      description: "Get details about a specific index",
      tags: ["vector"],
      parameters: [
        {
          name: "vectorName",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "indexName",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Index details"
        }
      }
    }),
    describeIndex
  );
  app.delete(
    "/api/vector/:vectorName/indexes/:indexName",
    w({
      description: "Delete a specific index",
      tags: ["vector"],
      parameters: [
        {
          name: "vectorName",
          in: "path",
          required: true,
          schema: { type: "string" }
        },
        {
          name: "indexName",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Index deleted successfully"
        }
      }
    }),
    deleteIndex
  );
  if (options?.isDev || server?.build?.openAPIDocs || server?.build?.swaggerUI) {
    app.get(
      "/openapi.json",
      h(app, {
        includeEmptyPaths: true,
        documentation: {
          info: { title: "Mastra API", version: "1.0.0", description: "Mastra API" }
        }
      })
    );
  }
  if (options?.isDev || server?.build?.swaggerUI) {
    app.get(
      "/swagger-ui",
      w({
        hide: true
      }),
      middleware({ url: "/openapi.json" })
    );
  }
  if (options?.playground) {
    app.get(
      "/refresh-events",
      w({
        hide: true
      }),
      handleClientsRefresh
    );
    app.post(
      "/__refresh",
      w({
        hide: true
      }),
      handleTriggerClientsRefresh
    );
    app.use("/assets/*", async (c2, next) => {
      const path = c2.req.path;
      if (path.endsWith(".js")) {
        c2.header("Content-Type", "application/javascript");
      } else if (path.endsWith(".css")) {
        c2.header("Content-Type", "text/css");
      }
      await next();
    });
    app.use(
      "/assets/*",
      serveStatic({
        root: "./playground/assets"
      })
    );
    app.use(
      "*",
      serveStatic({
        root: "./playground"
      })
    );
  }
  app.get("*", async (c2, next) => {
    if (c2.req.path.startsWith("/api/") || c2.req.path.startsWith("/swagger-ui") || c2.req.path.startsWith("/openapi.json")) {
      return await next();
    }
    if (options?.playground) {
      let indexHtml = await promises.readFile(posix.join(process.cwd(), "./playground/index.html"), "utf-8");
      indexHtml = indexHtml.replace(
        `'%%MASTRA_TELEMETRY_DISABLED%%'`,
        `${Boolean(process.env.MASTRA_TELEMETRY_DISABLED)}`
      );
      return c2.newResponse(indexHtml, 200, { "Content-Type": "text/html" });
    }
    return c2.newResponse(html2, 200, { "Content-Type": "text/html" });
  });
  return app;
}
async function createNodeServer(mastra, options = {}) {
  const app = await createHonoServer(mastra, options);
  const serverOptions = mastra.getServer();
  const port = serverOptions?.port ?? (Number(process.env.PORT) || 4111);
  const server = serve(
    {
      fetch: app.fetch,
      port,
      hostname: serverOptions?.host
    },
    () => {
      const logger2 = mastra.getLogger();
      const host = serverOptions?.host ?? "localhost";
      logger2.info(` Mastra API running on port http://${host}:${port}/api`);
      if (options?.playground) {
        const playgroundUrl = `http://${host}:${port}`;
        logger2.info(`\u{1F468}\u200D\u{1F4BB} Playground available at ${playgroundUrl}`);
      }
      if (process.send) {
        process.send({
          type: "server-ready",
          port,
          host
        });
      }
    }
  );
  return server;
}

exports.createHonoServer = createHonoServer;
exports.createNodeServer = createNodeServer;
