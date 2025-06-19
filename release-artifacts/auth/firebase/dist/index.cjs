'use strict';

var admin = require('firebase-admin');
var firestore = require('firebase-admin/firestore');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var admin__default = /*#__PURE__*/_interopDefault(admin);

var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/platform/node/globalThis.js
var _globalThis;
var init_globalThis = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/platform/node/globalThis.js"() {
    _globalThis = typeof globalThis === "object" ? globalThis : global;
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/platform/node/index.js
var init_node = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/platform/node/index.js"() {
    init_globalThis();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/platform/index.js
var init_platform = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/platform/index.js"() {
    init_node();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/version.js
var VERSION;
var init_version = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/version.js"() {
    VERSION = "1.9.0";
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/internal/semver.js
function _makeCompatibilityCheck(ownVersion) {
  var acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
  var rejectedVersions = /* @__PURE__ */ new Set();
  var myVersionMatch = ownVersion.match(re);
  if (!myVersionMatch) {
    return function() {
      return false;
    };
  }
  var ownVersionParsed = {
    major: +myVersionMatch[1],
    minor: +myVersionMatch[2],
    patch: +myVersionMatch[3],
    prerelease: myVersionMatch[4]
  };
  if (ownVersionParsed.prerelease != null) {
    return function isExactmatch(globalVersion) {
      return globalVersion === ownVersion;
    };
  }
  function _reject(v) {
    rejectedVersions.add(v);
    return false;
  }
  function _accept(v) {
    acceptedVersions.add(v);
    return true;
  }
  return function isCompatible2(globalVersion) {
    if (acceptedVersions.has(globalVersion)) {
      return true;
    }
    if (rejectedVersions.has(globalVersion)) {
      return false;
    }
    var globalVersionMatch = globalVersion.match(re);
    if (!globalVersionMatch) {
      return _reject(globalVersion);
    }
    var globalVersionParsed = {
      major: +globalVersionMatch[1],
      minor: +globalVersionMatch[2],
      patch: +globalVersionMatch[3],
      prerelease: globalVersionMatch[4]
    };
    if (globalVersionParsed.prerelease != null) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major !== globalVersionParsed.major) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major === 0) {
      if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    }
    if (ownVersionParsed.minor <= globalVersionParsed.minor) {
      return _accept(globalVersion);
    }
    return _reject(globalVersion);
  };
}
var re, isCompatible;
var init_semver = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/internal/semver.js"() {
    init_version();
    re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
    isCompatible = _makeCompatibilityCheck(VERSION);
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/internal/global-utils.js
function registerGlobal(type, instance, diag2, allowOverride) {
  var _a2;
  if (allowOverride === void 0) {
    allowOverride = false;
  }
  var api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a2 = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a2 !== void 0 ? _a2 : {
    version: VERSION
  };
  if (!allowOverride && api[type]) {
    var err = new Error("@opentelemetry/api: Attempted duplicate registration of API: " + type);
    diag2.error(err.stack || err.message);
    return false;
  }
  if (api.version !== VERSION) {
    var err = new Error("@opentelemetry/api: Registration of version v" + api.version + " for " + type + " does not match previously registered API v" + VERSION);
    diag2.error(err.stack || err.message);
    return false;
  }
  api[type] = instance;
  diag2.debug("@opentelemetry/api: Registered a global for " + type + " v" + VERSION + ".");
  return true;
}
function getGlobal(type) {
  var _a2, _b;
  var globalVersion = (_a2 = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a2 === void 0 ? void 0 : _a2.version;
  if (!globalVersion || !isCompatible(globalVersion)) {
    return;
  }
  return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
function unregisterGlobal(type, diag2) {
  diag2.debug("@opentelemetry/api: Unregistering a global for " + type + " v" + VERSION + ".");
  var api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api) {
    delete api[type];
  }
}
var major, GLOBAL_OPENTELEMETRY_API_KEY, _global;
var init_global_utils = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/internal/global-utils.js"() {
    init_platform();
    init_version();
    init_semver();
    major = VERSION.split(".")[0];
    GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for("opentelemetry.js.api." + major);
    _global = _globalThis;
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js
function logProxy(funcName, namespace, args) {
  var logger = getGlobal("diag");
  if (!logger) {
    return;
  }
  args.unshift(namespace);
  return logger[funcName].apply(logger, __spreadArray([], __read(args), false));
}
var __read, __spreadArray, DiagComponentLogger;
var init_ComponentLogger = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js"() {
    init_global_utils();
    __read = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    __spreadArray = function(to, from, pack) {
      if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    DiagComponentLogger = /** @class */
    function() {
      function DiagComponentLogger2(props) {
        this._namespace = props.namespace || "DiagComponentLogger";
      }
      DiagComponentLogger2.prototype.debug = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return logProxy("debug", this._namespace, args);
      };
      DiagComponentLogger2.prototype.error = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return logProxy("error", this._namespace, args);
      };
      DiagComponentLogger2.prototype.info = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return logProxy("info", this._namespace, args);
      };
      DiagComponentLogger2.prototype.warn = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return logProxy("warn", this._namespace, args);
      };
      DiagComponentLogger2.prototype.verbose = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return logProxy("verbose", this._namespace, args);
      };
      return DiagComponentLogger2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/diag/types.js
var DiagLogLevel;
var init_types = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/diag/types.js"() {
    (function(DiagLogLevel2) {
      DiagLogLevel2[DiagLogLevel2["NONE"] = 0] = "NONE";
      DiagLogLevel2[DiagLogLevel2["ERROR"] = 30] = "ERROR";
      DiagLogLevel2[DiagLogLevel2["WARN"] = 50] = "WARN";
      DiagLogLevel2[DiagLogLevel2["INFO"] = 60] = "INFO";
      DiagLogLevel2[DiagLogLevel2["DEBUG"] = 70] = "DEBUG";
      DiagLogLevel2[DiagLogLevel2["VERBOSE"] = 80] = "VERBOSE";
      DiagLogLevel2[DiagLogLevel2["ALL"] = 9999] = "ALL";
    })(DiagLogLevel || (DiagLogLevel = {}));
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js
function createLogLevelDiagLogger(maxLevel, logger) {
  if (maxLevel < DiagLogLevel.NONE) {
    maxLevel = DiagLogLevel.NONE;
  } else if (maxLevel > DiagLogLevel.ALL) {
    maxLevel = DiagLogLevel.ALL;
  }
  logger = logger || {};
  function _filterFunc(funcName, theLevel) {
    var theFunc = logger[funcName];
    if (typeof theFunc === "function" && maxLevel >= theLevel) {
      return theFunc.bind(logger);
    }
    return function() {
    };
  }
  return {
    error: _filterFunc("error", DiagLogLevel.ERROR),
    warn: _filterFunc("warn", DiagLogLevel.WARN),
    info: _filterFunc("info", DiagLogLevel.INFO),
    debug: _filterFunc("debug", DiagLogLevel.DEBUG),
    verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
  };
}
var init_logLevelLogger = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js"() {
    init_types();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/api/diag.js
var __read2, __spreadArray2, API_NAME, DiagAPI;
var init_diag = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/api/diag.js"() {
    init_ComponentLogger();
    init_logLevelLogger();
    init_types();
    init_global_utils();
    __read2 = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    __spreadArray2 = function(to, from, pack) {
      if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    API_NAME = "diag";
    DiagAPI = /** @class */
    function() {
      function DiagAPI2() {
        function _logProxy(funcName) {
          return function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }
            var logger = getGlobal("diag");
            if (!logger)
              return;
            return logger[funcName].apply(logger, __spreadArray2([], __read2(args), false));
          };
        }
        var self = this;
        var setLogger = function(logger, optionsOrLogLevel) {
          var _a2, _b, _c;
          if (optionsOrLogLevel === void 0) {
            optionsOrLogLevel = { logLevel: DiagLogLevel.INFO };
          }
          if (logger === self) {
            var err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
            self.error((_a2 = err.stack) !== null && _a2 !== void 0 ? _a2 : err.message);
            return false;
          }
          if (typeof optionsOrLogLevel === "number") {
            optionsOrLogLevel = {
              logLevel: optionsOrLogLevel
            };
          }
          var oldLogger = getGlobal("diag");
          var newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger);
          if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
            var stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
            oldLogger.warn("Current logger will be overwritten from " + stack);
            newLogger.warn("Current logger will overwrite one already registered from " + stack);
          }
          return registerGlobal("diag", newLogger, self, true);
        };
        self.setLogger = setLogger;
        self.disable = function() {
          unregisterGlobal(API_NAME, self);
        };
        self.createComponentLogger = function(options) {
          return new DiagComponentLogger(options);
        };
        self.verbose = _logProxy("verbose");
        self.debug = _logProxy("debug");
        self.info = _logProxy("info");
        self.warn = _logProxy("warn");
        self.error = _logProxy("error");
      }
      DiagAPI2.instance = function() {
        if (!this._instance) {
          this._instance = new DiagAPI2();
        }
        return this._instance;
      };
      return DiagAPI2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/baggage/internal/baggage-impl.js
var __read3, __values, BaggageImpl;
var init_baggage_impl = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/baggage/internal/baggage-impl.js"() {
    __read3 = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    __values = function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
        next: function() {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    BaggageImpl = /** @class */
    function() {
      function BaggageImpl2(entries) {
        this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
      }
      BaggageImpl2.prototype.getEntry = function(key) {
        var entry = this._entries.get(key);
        if (!entry) {
          return void 0;
        }
        return Object.assign({}, entry);
      };
      BaggageImpl2.prototype.getAllEntries = function() {
        return Array.from(this._entries.entries()).map(function(_a2) {
          var _b = __read3(_a2, 2), k = _b[0], v = _b[1];
          return [k, v];
        });
      };
      BaggageImpl2.prototype.setEntry = function(key, entry) {
        var newBaggage = new BaggageImpl2(this._entries);
        newBaggage._entries.set(key, entry);
        return newBaggage;
      };
      BaggageImpl2.prototype.removeEntry = function(key) {
        var newBaggage = new BaggageImpl2(this._entries);
        newBaggage._entries.delete(key);
        return newBaggage;
      };
      BaggageImpl2.prototype.removeEntries = function() {
        var e_1, _a2;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          keys[_i] = arguments[_i];
        }
        var newBaggage = new BaggageImpl2(this._entries);
        try {
          for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
            var key = keys_1_1.value;
            newBaggage._entries.delete(key);
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (keys_1_1 && !keys_1_1.done && (_a2 = keys_1.return)) _a2.call(keys_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return newBaggage;
      };
      BaggageImpl2.prototype.clear = function() {
        return new BaggageImpl2();
      };
      return BaggageImpl2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/baggage/utils.js
function createBaggage(entries) {
  if (entries === void 0) {
    entries = {};
  }
  return new BaggageImpl(new Map(Object.entries(entries)));
}
var init_utils = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/baggage/utils.js"() {
    init_diag();
    init_baggage_impl();
    DiagAPI.instance();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/context/context.js
function createContextKey(description) {
  return Symbol.for(description);
}
var BaseContext, ROOT_CONTEXT;
var init_context = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/context/context.js"() {
    BaseContext = /** @class */
    /* @__PURE__ */ function() {
      function BaseContext2(parentContext) {
        var self = this;
        self._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
        self.getValue = function(key) {
          return self._currentContext.get(key);
        };
        self.setValue = function(key, value) {
          var context2 = new BaseContext2(self._currentContext);
          context2._currentContext.set(key, value);
          return context2;
        };
        self.deleteValue = function(key) {
          var context2 = new BaseContext2(self._currentContext);
          context2._currentContext.delete(key);
          return context2;
        };
      }
      return BaseContext2;
    }();
    ROOT_CONTEXT = new BaseContext();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/propagation/TextMapPropagator.js
var defaultTextMapGetter, defaultTextMapSetter;
var init_TextMapPropagator = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/propagation/TextMapPropagator.js"() {
    defaultTextMapGetter = {
      get: function(carrier, key) {
        if (carrier == null) {
          return void 0;
        }
        return carrier[key];
      },
      keys: function(carrier) {
        if (carrier == null) {
          return [];
        }
        return Object.keys(carrier);
      }
    };
    defaultTextMapSetter = {
      set: function(carrier, key, value) {
        if (carrier == null) {
          return;
        }
        carrier[key] = value;
      }
    };
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js
var __read4, __spreadArray3, NoopContextManager;
var init_NoopContextManager = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js"() {
    init_context();
    __read4 = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    __spreadArray3 = function(to, from, pack) {
      if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    NoopContextManager = /** @class */
    function() {
      function NoopContextManager2() {
      }
      NoopContextManager2.prototype.active = function() {
        return ROOT_CONTEXT;
      };
      NoopContextManager2.prototype.with = function(_context, fn, thisArg) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
          args[_i - 3] = arguments[_i];
        }
        return fn.call.apply(fn, __spreadArray3([thisArg], __read4(args), false));
      };
      NoopContextManager2.prototype.bind = function(_context, target) {
        return target;
      };
      NoopContextManager2.prototype.enable = function() {
        return this;
      };
      NoopContextManager2.prototype.disable = function() {
        return this;
      };
      return NoopContextManager2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/api/context.js
var __read5, __spreadArray4, API_NAME2, NOOP_CONTEXT_MANAGER, ContextAPI;
var init_context2 = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/api/context.js"() {
    init_NoopContextManager();
    init_global_utils();
    init_diag();
    __read5 = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    __spreadArray4 = function(to, from, pack) {
      if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    API_NAME2 = "context";
    NOOP_CONTEXT_MANAGER = new NoopContextManager();
    ContextAPI = /** @class */
    function() {
      function ContextAPI2() {
      }
      ContextAPI2.getInstance = function() {
        if (!this._instance) {
          this._instance = new ContextAPI2();
        }
        return this._instance;
      };
      ContextAPI2.prototype.setGlobalContextManager = function(contextManager) {
        return registerGlobal(API_NAME2, contextManager, DiagAPI.instance());
      };
      ContextAPI2.prototype.active = function() {
        return this._getContextManager().active();
      };
      ContextAPI2.prototype.with = function(context2, fn, thisArg) {
        var _a2;
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
          args[_i - 3] = arguments[_i];
        }
        return (_a2 = this._getContextManager()).with.apply(_a2, __spreadArray4([context2, fn, thisArg], __read5(args), false));
      };
      ContextAPI2.prototype.bind = function(context2, target) {
        return this._getContextManager().bind(context2, target);
      };
      ContextAPI2.prototype._getContextManager = function() {
        return getGlobal(API_NAME2) || NOOP_CONTEXT_MANAGER;
      };
      ContextAPI2.prototype.disable = function() {
        this._getContextManager().disable();
        unregisterGlobal(API_NAME2, DiagAPI.instance());
      };
      return ContextAPI2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js
var TraceFlags;
var init_trace_flags = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js"() {
    (function(TraceFlags2) {
      TraceFlags2[TraceFlags2["NONE"] = 0] = "NONE";
      TraceFlags2[TraceFlags2["SAMPLED"] = 1] = "SAMPLED";
    })(TraceFlags || (TraceFlags = {}));
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js
var INVALID_SPANID, INVALID_TRACEID, INVALID_SPAN_CONTEXT;
var init_invalid_span_constants = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js"() {
    init_trace_flags();
    INVALID_SPANID = "0000000000000000";
    INVALID_TRACEID = "00000000000000000000000000000000";
    INVALID_SPAN_CONTEXT = {
      traceId: INVALID_TRACEID,
      spanId: INVALID_SPANID,
      traceFlags: TraceFlags.NONE
    };
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js
var NonRecordingSpan;
var init_NonRecordingSpan = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js"() {
    init_invalid_span_constants();
    NonRecordingSpan = /** @class */
    function() {
      function NonRecordingSpan2(_spanContext) {
        if (_spanContext === void 0) {
          _spanContext = INVALID_SPAN_CONTEXT;
        }
        this._spanContext = _spanContext;
      }
      NonRecordingSpan2.prototype.spanContext = function() {
        return this._spanContext;
      };
      NonRecordingSpan2.prototype.setAttribute = function(_key, _value) {
        return this;
      };
      NonRecordingSpan2.prototype.setAttributes = function(_attributes) {
        return this;
      };
      NonRecordingSpan2.prototype.addEvent = function(_name, _attributes) {
        return this;
      };
      NonRecordingSpan2.prototype.addLink = function(_link) {
        return this;
      };
      NonRecordingSpan2.prototype.addLinks = function(_links) {
        return this;
      };
      NonRecordingSpan2.prototype.setStatus = function(_status) {
        return this;
      };
      NonRecordingSpan2.prototype.updateName = function(_name) {
        return this;
      };
      NonRecordingSpan2.prototype.end = function(_endTime) {
      };
      NonRecordingSpan2.prototype.isRecording = function() {
        return false;
      };
      NonRecordingSpan2.prototype.recordException = function(_exception, _time) {
      };
      return NonRecordingSpan2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/context-utils.js
function getSpan(context2) {
  return context2.getValue(SPAN_KEY) || void 0;
}
function getActiveSpan() {
  return getSpan(ContextAPI.getInstance().active());
}
function setSpan(context2, span) {
  return context2.setValue(SPAN_KEY, span);
}
function deleteSpan(context2) {
  return context2.deleteValue(SPAN_KEY);
}
function setSpanContext(context2, spanContext) {
  return setSpan(context2, new NonRecordingSpan(spanContext));
}
function getSpanContext(context2) {
  var _a2;
  return (_a2 = getSpan(context2)) === null || _a2 === void 0 ? void 0 : _a2.spanContext();
}
var SPAN_KEY;
var init_context_utils = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/context-utils.js"() {
    init_context();
    init_NonRecordingSpan();
    init_context2();
    SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js
function isValidTraceId(traceId) {
  return VALID_TRACEID_REGEX.test(traceId) && traceId !== INVALID_TRACEID;
}
function isValidSpanId(spanId) {
  return VALID_SPANID_REGEX.test(spanId) && spanId !== INVALID_SPANID;
}
function isSpanContextValid(spanContext) {
  return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}
function wrapSpanContext(spanContext) {
  return new NonRecordingSpan(spanContext);
}
var VALID_TRACEID_REGEX, VALID_SPANID_REGEX;
var init_spancontext_utils = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js"() {
    init_invalid_span_constants();
    init_NonRecordingSpan();
    VALID_TRACEID_REGEX = /^([0-9a-f]{32})$/i;
    VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js
function isSpanContext(spanContext) {
  return typeof spanContext === "object" && typeof spanContext["spanId"] === "string" && typeof spanContext["traceId"] === "string" && typeof spanContext["traceFlags"] === "number";
}
var contextApi, NoopTracer;
var init_NoopTracer = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js"() {
    init_context2();
    init_context_utils();
    init_NonRecordingSpan();
    init_spancontext_utils();
    contextApi = ContextAPI.getInstance();
    NoopTracer = /** @class */
    function() {
      function NoopTracer2() {
      }
      NoopTracer2.prototype.startSpan = function(name, options, context2) {
        if (context2 === void 0) {
          context2 = contextApi.active();
        }
        var root = Boolean(options === null || options === void 0 ? void 0 : options.root);
        if (root) {
          return new NonRecordingSpan();
        }
        var parentFromContext = context2 && getSpanContext(context2);
        if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) {
          return new NonRecordingSpan(parentFromContext);
        } else {
          return new NonRecordingSpan();
        }
      };
      NoopTracer2.prototype.startActiveSpan = function(name, arg2, arg3, arg4) {
        var opts;
        var ctx;
        var fn;
        if (arguments.length < 2) {
          return;
        } else if (arguments.length === 2) {
          fn = arg2;
        } else if (arguments.length === 3) {
          opts = arg2;
          fn = arg3;
        } else {
          opts = arg2;
          ctx = arg3;
          fn = arg4;
        }
        var parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
        var span = this.startSpan(name, opts, parentContext);
        var contextWithSpanSet = setSpan(parentContext, span);
        return contextApi.with(contextWithSpanSet, fn, void 0, span);
      };
      return NoopTracer2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js
var NOOP_TRACER, ProxyTracer;
var init_ProxyTracer = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js"() {
    init_NoopTracer();
    NOOP_TRACER = new NoopTracer();
    ProxyTracer = /** @class */
    function() {
      function ProxyTracer2(_provider, name, version, options) {
        this._provider = _provider;
        this.name = name;
        this.version = version;
        this.options = options;
      }
      ProxyTracer2.prototype.startSpan = function(name, options, context2) {
        return this._getTracer().startSpan(name, options, context2);
      };
      ProxyTracer2.prototype.startActiveSpan = function(_name, _options, _context, _fn) {
        var tracer = this._getTracer();
        return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
      };
      ProxyTracer2.prototype._getTracer = function() {
        if (this._delegate) {
          return this._delegate;
        }
        var tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
        if (!tracer) {
          return NOOP_TRACER;
        }
        this._delegate = tracer;
        return this._delegate;
      };
      return ProxyTracer2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js
var NoopTracerProvider;
var init_NoopTracerProvider = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js"() {
    init_NoopTracer();
    NoopTracerProvider = /** @class */
    function() {
      function NoopTracerProvider2() {
      }
      NoopTracerProvider2.prototype.getTracer = function(_name, _version, _options) {
        return new NoopTracer();
      };
      return NoopTracerProvider2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js
var NOOP_TRACER_PROVIDER, ProxyTracerProvider;
var init_ProxyTracerProvider = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js"() {
    init_ProxyTracer();
    init_NoopTracerProvider();
    NOOP_TRACER_PROVIDER = new NoopTracerProvider();
    ProxyTracerProvider = /** @class */
    function() {
      function ProxyTracerProvider2() {
      }
      ProxyTracerProvider2.prototype.getTracer = function(name, version, options) {
        var _a2;
        return (_a2 = this.getDelegateTracer(name, version, options)) !== null && _a2 !== void 0 ? _a2 : new ProxyTracer(this, name, version, options);
      };
      ProxyTracerProvider2.prototype.getDelegate = function() {
        var _a2;
        return (_a2 = this._delegate) !== null && _a2 !== void 0 ? _a2 : NOOP_TRACER_PROVIDER;
      };
      ProxyTracerProvider2.prototype.setDelegate = function(delegate) {
        this._delegate = delegate;
      };
      ProxyTracerProvider2.prototype.getDelegateTracer = function(name, version, options) {
        var _a2;
        return (_a2 = this._delegate) === null || _a2 === void 0 ? void 0 : _a2.getTracer(name, version, options);
      };
      return ProxyTracerProvider2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/span_kind.js
var SpanKind;
var init_span_kind = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/span_kind.js"() {
    (function(SpanKind2) {
      SpanKind2[SpanKind2["INTERNAL"] = 0] = "INTERNAL";
      SpanKind2[SpanKind2["SERVER"] = 1] = "SERVER";
      SpanKind2[SpanKind2["CLIENT"] = 2] = "CLIENT";
      SpanKind2[SpanKind2["PRODUCER"] = 3] = "PRODUCER";
      SpanKind2[SpanKind2["CONSUMER"] = 4] = "CONSUMER";
    })(SpanKind || (SpanKind = {}));
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/status.js
var SpanStatusCode;
var init_status = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace/status.js"() {
    (function(SpanStatusCode2) {
      SpanStatusCode2[SpanStatusCode2["UNSET"] = 0] = "UNSET";
      SpanStatusCode2[SpanStatusCode2["OK"] = 1] = "OK";
      SpanStatusCode2[SpanStatusCode2["ERROR"] = 2] = "ERROR";
    })(SpanStatusCode || (SpanStatusCode = {}));
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/context-api.js
var context;
var init_context_api = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/context-api.js"() {
    init_context2();
    context = ContextAPI.getInstance();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/propagation/NoopTextMapPropagator.js
var NoopTextMapPropagator;
var init_NoopTextMapPropagator = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/propagation/NoopTextMapPropagator.js"() {
    NoopTextMapPropagator = /** @class */
    function() {
      function NoopTextMapPropagator2() {
      }
      NoopTextMapPropagator2.prototype.inject = function(_context, _carrier) {
      };
      NoopTextMapPropagator2.prototype.extract = function(context2, _carrier) {
        return context2;
      };
      NoopTextMapPropagator2.prototype.fields = function() {
        return [];
      };
      return NoopTextMapPropagator2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/baggage/context-helpers.js
function getBaggage(context2) {
  return context2.getValue(BAGGAGE_KEY) || void 0;
}
function getActiveBaggage() {
  return getBaggage(ContextAPI.getInstance().active());
}
function setBaggage(context2, baggage) {
  return context2.setValue(BAGGAGE_KEY, baggage);
}
function deleteBaggage(context2) {
  return context2.deleteValue(BAGGAGE_KEY);
}
var BAGGAGE_KEY;
var init_context_helpers = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/baggage/context-helpers.js"() {
    init_context2();
    init_context();
    BAGGAGE_KEY = createContextKey("OpenTelemetry Baggage Key");
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/api/propagation.js
var API_NAME3, NOOP_TEXT_MAP_PROPAGATOR, PropagationAPI;
var init_propagation = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/api/propagation.js"() {
    init_global_utils();
    init_NoopTextMapPropagator();
    init_TextMapPropagator();
    init_context_helpers();
    init_utils();
    init_diag();
    API_NAME3 = "propagation";
    NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();
    PropagationAPI = /** @class */
    function() {
      function PropagationAPI2() {
        this.createBaggage = createBaggage;
        this.getBaggage = getBaggage;
        this.getActiveBaggage = getActiveBaggage;
        this.setBaggage = setBaggage;
        this.deleteBaggage = deleteBaggage;
      }
      PropagationAPI2.getInstance = function() {
        if (!this._instance) {
          this._instance = new PropagationAPI2();
        }
        return this._instance;
      };
      PropagationAPI2.prototype.setGlobalPropagator = function(propagator) {
        return registerGlobal(API_NAME3, propagator, DiagAPI.instance());
      };
      PropagationAPI2.prototype.inject = function(context2, carrier, setter) {
        if (setter === void 0) {
          setter = defaultTextMapSetter;
        }
        return this._getGlobalPropagator().inject(context2, carrier, setter);
      };
      PropagationAPI2.prototype.extract = function(context2, carrier, getter) {
        if (getter === void 0) {
          getter = defaultTextMapGetter;
        }
        return this._getGlobalPropagator().extract(context2, carrier, getter);
      };
      PropagationAPI2.prototype.fields = function() {
        return this._getGlobalPropagator().fields();
      };
      PropagationAPI2.prototype.disable = function() {
        unregisterGlobal(API_NAME3, DiagAPI.instance());
      };
      PropagationAPI2.prototype._getGlobalPropagator = function() {
        return getGlobal(API_NAME3) || NOOP_TEXT_MAP_PROPAGATOR;
      };
      return PropagationAPI2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/propagation-api.js
var propagation;
var init_propagation_api = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/propagation-api.js"() {
    init_propagation();
    propagation = PropagationAPI.getInstance();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/api/trace.js
var API_NAME4, TraceAPI;
var init_trace = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/api/trace.js"() {
    init_global_utils();
    init_ProxyTracerProvider();
    init_spancontext_utils();
    init_context_utils();
    init_diag();
    API_NAME4 = "trace";
    TraceAPI = /** @class */
    function() {
      function TraceAPI2() {
        this._proxyTracerProvider = new ProxyTracerProvider();
        this.wrapSpanContext = wrapSpanContext;
        this.isSpanContextValid = isSpanContextValid;
        this.deleteSpan = deleteSpan;
        this.getSpan = getSpan;
        this.getActiveSpan = getActiveSpan;
        this.getSpanContext = getSpanContext;
        this.setSpan = setSpan;
        this.setSpanContext = setSpanContext;
      }
      TraceAPI2.getInstance = function() {
        if (!this._instance) {
          this._instance = new TraceAPI2();
        }
        return this._instance;
      };
      TraceAPI2.prototype.setGlobalTracerProvider = function(provider) {
        var success = registerGlobal(API_NAME4, this._proxyTracerProvider, DiagAPI.instance());
        if (success) {
          this._proxyTracerProvider.setDelegate(provider);
        }
        return success;
      };
      TraceAPI2.prototype.getTracerProvider = function() {
        return getGlobal(API_NAME4) || this._proxyTracerProvider;
      };
      TraceAPI2.prototype.getTracer = function(name, version) {
        return this.getTracerProvider().getTracer(name, version);
      };
      TraceAPI2.prototype.disable = function() {
        unregisterGlobal(API_NAME4, DiagAPI.instance());
        this._proxyTracerProvider = new ProxyTracerProvider();
      };
      return TraceAPI2;
    }();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace-api.js
var trace;
var init_trace_api = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/trace-api.js"() {
    init_trace();
    trace = TraceAPI.getInstance();
  }
});

// ../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/index.js
var init_esm = __esm({
  "../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api/build/esm/index.js"() {
    init_span_kind();
    init_status();
    init_context_api();
    init_propagation_api();
    init_trace_api();
  }
});

// ../../packages/core/dist/chunk-IFQGBW42.js
init_esm();
function hasActiveTelemetry(tracerName = "default-tracer") {
  try {
    return !!trace.getTracer(tracerName);
  } catch {
    return false;
  }
}
function getBaggageValues(ctx) {
  const currentBaggage = propagation.getBaggage(ctx);
  const requestId = currentBaggage?.getEntry("http.request_id")?.value;
  const componentName = currentBaggage?.getEntry("componentName")?.value;
  const runId = currentBaggage?.getEntry("runId")?.value;
  return {
    requestId,
    componentName,
    runId
  };
}
function withSpan(options) {
  return function(_target, propertyKey, descriptor) {
    if (!descriptor || typeof descriptor === "number") return;
    const originalMethod = descriptor.value;
    const methodName = String(propertyKey);
    descriptor.value = function(...args) {
      if (options?.skipIfNoTelemetry && !hasActiveTelemetry(options?.tracerName)) {
        return originalMethod.apply(this, args);
      }
      const tracer = trace.getTracer(options?.tracerName ?? "default-tracer");
      let spanName;
      let spanKind;
      if (typeof options === "string") {
        spanName = options;
      } else if (options) {
        spanName = options.spanName || methodName;
        spanKind = options.spanKind;
      } else {
        spanName = methodName;
      }
      const span = tracer.startSpan(spanName, { kind: spanKind });
      let ctx = trace.setSpan(context.active(), span);
      args.forEach((arg, index) => {
        try {
          span.setAttribute(`${spanName}.argument.${index}`, JSON.stringify(arg));
        } catch {
          span.setAttribute(`${spanName}.argument.${index}`, "[Not Serializable]");
        }
      });
      const { requestId, componentName, runId } = getBaggageValues(ctx);
      if (requestId) {
        span.setAttribute("http.request_id", requestId);
      }
      if (componentName) {
        span.setAttribute("componentName", componentName);
        span.setAttribute("runId", runId);
      } else if (this && this.name) {
        span.setAttribute("componentName", this.name);
        span.setAttribute("runId", this.runId);
        ctx = propagation.setBaggage(
          ctx,
          propagation.createBaggage({
            // @ts-ignore
            componentName: { value: this.name },
            // @ts-ignore
            runId: { value: this.runId },
            // @ts-ignore
            "http.request_id": { value: requestId }
          })
        );
      }
      let result;
      try {
        result = context.with(ctx, () => originalMethod.apply(this, args));
        if (result instanceof Promise) {
          return result.then((resolvedValue) => {
            try {
              span.setAttribute(`${spanName}.result`, JSON.stringify(resolvedValue));
            } catch {
              span.setAttribute(`${spanName}.result`, "[Not Serializable]");
            }
            return resolvedValue;
          }).finally(() => span.end());
        }
        try {
          span.setAttribute(`${spanName}.result`, JSON.stringify(result));
        } catch {
          span.setAttribute(`${spanName}.result`, "[Not Serializable]");
        }
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error"
        });
        if (error instanceof Error) {
          span.recordException(error);
        }
        throw error;
      } finally {
        if (!(result instanceof Promise)) {
          span.end();
        }
      }
    };
    return descriptor;
  };
}
function InstrumentClass(options) {
  return function(target) {
    const methods = Object.getOwnPropertyNames(target.prototype);
    methods.forEach((method) => {
      if (options?.excludeMethods?.includes(method) || method === "constructor") return;
      if (options?.methodFilter && !options.methodFilter(method)) return;
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, method);
      if (descriptor && typeof descriptor.value === "function") {
        Object.defineProperty(
          target.prototype,
          method,
          withSpan({
            spanName: options?.prefix ? `${options.prefix}.${method}` : method,
            skipIfNoTelemetry: true,
            spanKind: options?.spanKind || SpanKind.INTERNAL,
            tracerName: options?.tracerName
          })(target, method, descriptor)
        );
      }
    });
    return target;
  };
}

// ../../packages/core/dist/chunk-5YDTZN2X.js
var RegisteredLogger = {
  LLM: "LLM"};
var LogLevel = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error"};
var MastraLogger = class {
  name;
  level;
  transports;
  constructor(options = {}) {
    this.name = options.name || "Mastra";
    this.level = options.level || LogLevel.ERROR;
    this.transports = new Map(Object.entries(options.transports || {}));
  }
  getTransports() {
    return this.transports;
  }
  trackException(_error) {
  }
  async getLogs(transportId, params) {
    if (!transportId || !this.transports.has(transportId)) {
      return { logs: [], total: 0, page: params?.page ?? 1, perPage: params?.perPage ?? 100, hasMore: false };
    }
    return this.transports.get(transportId).getLogs(params) ?? {
      logs: [],
      total: 0,
      page: params?.page ?? 1,
      perPage: params?.perPage ?? 100,
      hasMore: false
    };
  }
  async getLogsByRunId({
    transportId,
    runId,
    fromDate,
    toDate,
    logLevel,
    filters,
    page,
    perPage
  }) {
    if (!transportId || !this.transports.has(transportId) || !runId) {
      return { logs: [], total: 0, page: page ?? 1, perPage: perPage ?? 100, hasMore: false };
    }
    return this.transports.get(transportId).getLogsByRunId({ runId, fromDate, toDate, logLevel, filters, page, perPage }) ?? {
      logs: [],
      total: 0,
      page: page ?? 1,
      perPage: perPage ?? 100,
      hasMore: false
    };
  }
};
var ConsoleLogger = class extends MastraLogger {
  constructor(options = {}) {
    super(options);
  }
  debug(message, ...args) {
    if (this.level === LogLevel.DEBUG) {
      console.debug(message, ...args);
    }
  }
  info(message, ...args) {
    if (this.level === LogLevel.INFO || this.level === LogLevel.DEBUG) {
      console.info(message, ...args);
    }
  }
  warn(message, ...args) {
    if (this.level === LogLevel.WARN || this.level === LogLevel.INFO || this.level === LogLevel.DEBUG) {
      console.warn(message, ...args);
    }
  }
  error(message, ...args) {
    if (this.level === LogLevel.ERROR || this.level === LogLevel.WARN || this.level === LogLevel.INFO || this.level === LogLevel.DEBUG) {
      console.error(message, ...args);
    }
  }
  async getLogs(_transportId, _params) {
    return { logs: [], total: 0, page: _params?.page ?? 1, perPage: _params?.perPage ?? 100, hasMore: false };
  }
  async getLogsByRunId(_args) {
    return { logs: [], total: 0, page: _args.page ?? 1, perPage: _args.perPage ?? 100, hasMore: false };
  }
};

// ../../packages/core/dist/chunk-5IEKR756.js
var MastraBase = class {
  component = RegisteredLogger.LLM;
  logger;
  name;
  telemetry;
  constructor({ component, name }) {
    this.component = component || RegisteredLogger.LLM;
    this.name = name;
    this.logger = new ConsoleLogger({ name: `${this.component} - ${this.name}` });
  }
  /**
   * Set the logger for the agent
   * @param logger
   */
  __setLogger(logger) {
    this.logger = logger;
    if (this.component !== RegisteredLogger.LLM) {
      this.logger.debug(`Logger updated [component=${this.component}] [name=${this.name}]`);
    }
  }
  /**
   * Set the telemetry for the
   * @param telemetry
   */
  __setTelemetry(telemetry) {
    this.telemetry = telemetry;
    if (this.component !== RegisteredLogger.LLM) {
      this.logger.debug(`Telemetry updated [component=${this.component}] [name=${this.telemetry.name}]`);
    }
  }
  /**
   * Get the telemetry on the vector
   * @returns telemetry
   */
  __getTelemetry() {
    return this.telemetry;
  }
  /* 
    get experimental_telemetry config
    */
  get experimental_telemetry() {
    return this.telemetry ? {
      // tracer: this.telemetry.tracer,
      tracer: this.telemetry.getBaggageTracer(),
      isEnabled: !!this.telemetry.tracer
    } : void 0;
  }
};

// ../../packages/core/dist/chunk-WQNOATKB.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", {
  value,
  configurable: true
});
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({
  kind: __decoratorStrings[kind],
  name,
  metadata,
  addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null))
});
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k = flags & 7, p = false;
  var j = 0;
  var extraInitializers = array[j] || (array[j] = []);
  var desc = k && ((target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(target , name));
  __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn(it) && (target = it);
  }
  return __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};

// ../../packages/core/dist/server/index.js
var _MastraAuthProvider_decorators;
var _init;
var _a;
_MastraAuthProvider_decorators = [InstrumentClass({
  prefix: "auth",
  excludeMethods: ["__setTools", "__setLogger", "__setTelemetry", "#log"]
})];
var MastraAuthProvider = class extends (_a = MastraBase) {
  constructor(options) {
    super({
      component: "AUTH",
      name: options?.name
    });
    if (options?.authorizeUser) {
      this.authorizeUser = options.authorizeUser.bind(this);
    }
  }
  registerOptions(opts) {
    if (opts?.authorizeUser) {
      this.authorizeUser = opts.authorizeUser.bind(this);
    }
  }
};
MastraAuthProvider = /* @__PURE__ */ ((_) => {
  _init = __decoratorStart(_a);
  MastraAuthProvider = __decorateElement(_init, 0, "MastraAuthProvider", _MastraAuthProvider_decorators, MastraAuthProvider);
  __runInitializers(_init, 1, MastraAuthProvider);
  return MastraAuthProvider;
})();
var MastraAuthFirebase = class extends MastraAuthProvider {
  serviceAccount;
  databaseId;
  constructor(options) {
    super({ name: options?.name ?? "firebase" });
    this.serviceAccount = options?.serviceAccount ?? process.env.FIREBASE_SERVICE_ACCOUNT;
    this.databaseId = options?.databaseId ?? process.env.FIRESTORE_DATABASE_ID ?? process.env.FIREBASE_DATABASE_ID;
    if (!admin__default.default.apps.length) {
      admin__default.default.initializeApp({
        credential: this.serviceAccount ? admin__default.default.credential.cert(this.serviceAccount) : admin__default.default.credential.applicationDefault()
      });
    }
    this.registerOptions(options);
  }
  async authenticateToken(token) {
    const decoded = await admin__default.default.auth().verifyIdToken(token);
    return decoded;
  }
  async authorizeUser(user) {
    const db = this.databaseId ? firestore.getFirestore(this.databaseId) : firestore.getFirestore();
    const userAccess = await db.doc(`/user_access/${user.uid}`).get();
    const userAccessData = userAccess.data();
    if (!userAccessData) {
      return false;
    }
    return true;
  }
};

exports.MastraAuthFirebase = MastraAuthFirebase;
