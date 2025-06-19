'use strict';

var chunkF3KPPQ4I_cjs = require('./chunk-F3KPPQ4I.cjs');
var fs = require('fs');

async function getMachineId() {
  const paths = ["/etc/machine-id", "/var/lib/dbus/machine-id"];
  for (const path of paths) {
    try {
      const result = await fs.promises.readFile(path, { encoding: "utf8" });
      return result.trim();
    } catch (e) {
      chunkF3KPPQ4I_cjs.diag.debug(`error reading machine id: ${e}`);
    }
  }
  return void 0;
}

exports.getMachineId = getMachineId;
