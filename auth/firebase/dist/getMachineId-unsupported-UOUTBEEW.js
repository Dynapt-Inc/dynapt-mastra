import { diag } from './chunk-JLXWUSDO.js';

// ../../node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/esm/detectors/platform/node/machine-id/getMachineId-unsupported.js
async function getMachineId() {
  diag.debug("could not read machine-id: unsupported platform");
  return void 0;
}

export { getMachineId };
