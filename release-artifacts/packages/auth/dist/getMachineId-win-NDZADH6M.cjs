'use strict';

var chunk6FSLIWKJ_cjs = require('./chunk-6FSLIWKJ.cjs');
var chunkF3KPPQ4I_cjs = require('./chunk-F3KPPQ4I.cjs');
var process = require('process');

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

var process__namespace = /*#__PURE__*/_interopNamespace(process);

async function getMachineId() {
  const args = "QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid";
  let command = "%windir%\\System32\\REG.exe";
  if (process__namespace.arch === "ia32" && "PROCESSOR_ARCHITEW6432" in process__namespace.env) {
    command = "%windir%\\sysnative\\cmd.exe /c " + command;
  }
  try {
    const result = await chunk6FSLIWKJ_cjs.execAsync(`${command} ${args}`);
    const parts = result.stdout.split("REG_SZ");
    if (parts.length === 2) {
      return parts[1].trim();
    }
  } catch (e) {
    chunkF3KPPQ4I_cjs.diag.debug(`error reading machine id: ${e}`);
  }
  return void 0;
}

exports.getMachineId = getMachineId;
