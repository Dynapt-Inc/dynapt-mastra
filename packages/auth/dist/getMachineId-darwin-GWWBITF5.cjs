'use strict';

var chunk6FSLIWKJ_cjs = require('./chunk-6FSLIWKJ.cjs');
var chunkF3KPPQ4I_cjs = require('./chunk-F3KPPQ4I.cjs');

// ../../node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/esm/detectors/platform/node/machine-id/getMachineId-darwin.js
async function getMachineId() {
  try {
    const result = await chunk6FSLIWKJ_cjs.execAsync('ioreg -rd1 -c "IOPlatformExpertDevice"');
    const idLine = result.stdout.split("\n").find((line) => line.includes("IOPlatformUUID"));
    if (!idLine) {
      return void 0;
    }
    const parts = idLine.split('" = "');
    if (parts.length === 2) {
      return parts[1].slice(0, -1);
    }
  } catch (e) {
    chunkF3KPPQ4I_cjs.diag.debug(`error reading machine id: ${e}`);
  }
  return void 0;
}

exports.getMachineId = getMachineId;
