import { execAsync } from './chunk-N62AETLJ.js';
import { diag } from './chunk-JLXWUSDO.js';
import { promises } from 'fs';

async function getMachineId() {
  try {
    const result = await promises.readFile("/etc/hostid", { encoding: "utf8" });
    return result.trim();
  } catch (e) {
    diag.debug(`error reading machine id: ${e}`);
  }
  try {
    const result = await execAsync("kenv -q smbios.system.uuid");
    return result.stdout.trim();
  } catch (e) {
    diag.debug(`error reading machine id: ${e}`);
  }
  return void 0;
}

export { getMachineId };
