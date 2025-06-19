'use strict';

var chunk6FSLIWKJ_cjs = require('./chunk-6FSLIWKJ.cjs');
var chunkF3KPPQ4I_cjs = require('./chunk-F3KPPQ4I.cjs');
var fs = require('fs');

async function getMachineId() {
  try {
    const result = await fs.promises.readFile("/etc/hostid", { encoding: "utf8" });
    return result.trim();
  } catch (e) {
    chunkF3KPPQ4I_cjs.diag.debug(`error reading machine id: ${e}`);
  }
  try {
    const result = await chunk6FSLIWKJ_cjs.execAsync("kenv -q smbios.system.uuid");
    return result.stdout.trim();
  } catch (e) {
    chunkF3KPPQ4I_cjs.diag.debug(`error reading machine id: ${e}`);
  }
  return void 0;
}

exports.getMachineId = getMachineId;
