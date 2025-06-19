import * as child_process from 'child_process';
import * as util from 'util';

// ../../node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/esm/detectors/platform/node/machine-id/execAsync.js
var execAsync = util.promisify(child_process.exec);

export { execAsync };
