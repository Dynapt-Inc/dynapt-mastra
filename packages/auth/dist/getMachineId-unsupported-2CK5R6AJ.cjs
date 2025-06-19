'use strict';

var chunkF3KPPQ4I_cjs = require('./chunk-F3KPPQ4I.cjs');

// ../../node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/esm/detectors/platform/node/machine-id/getMachineId-unsupported.js
async function getMachineId() {
  chunkF3KPPQ4I_cjs.diag.debug("could not read machine-id: unsupported platform");
  return void 0;
}

exports.getMachineId = getMachineId;
