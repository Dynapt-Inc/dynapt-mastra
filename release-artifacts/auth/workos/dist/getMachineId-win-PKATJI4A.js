import { execAsync } from './chunk-N62AETLJ.js';
import { diag } from './chunk-JLXWUSDO.js';
import * as process from 'process';

async function getMachineId() {
  const args = "QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid";
  let command = "%windir%\\System32\\REG.exe";
  if (process.arch === "ia32" && "PROCESSOR_ARCHITEW6432" in process.env) {
    command = "%windir%\\sysnative\\cmd.exe /c " + command;
  }
  try {
    const result = await execAsync(`${command} ${args}`);
    const parts = result.stdout.split("REG_SZ");
    if (parts.length === 2) {
      return parts[1].trim();
    }
  } catch (e) {
    diag.debug(`error reading machine id: ${e}`);
  }
  return void 0;
}

export { getMachineId };
