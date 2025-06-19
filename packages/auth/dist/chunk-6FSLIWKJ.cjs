'use strict';

var child_process = require('child_process');
var util = require('util');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var child_process__namespace = /*#__PURE__*/_interopNamespace(child_process);
var util__namespace = /*#__PURE__*/_interopNamespace(util);

// ../../node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/esm/detectors/platform/node/machine-id/execAsync.js
var execAsync = util__namespace.promisify(child_process__namespace.exec);

exports.execAsync = execAsync;
