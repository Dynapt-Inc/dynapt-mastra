import { spawn } from 'child_process';
import { Transform } from 'stream';
import * as fs3 from 'fs';
import fs3__default from 'fs';
import fsPromises from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { MastraBase } from '@mastra/core/base';
import fsExtra, { readJSON, writeJSON, ensureFile } from 'fs-extra/esm';

// src/deploy/log.ts
var createPinoStream = (logger) => {
  return new Transform({
    transform(chunk, _encoding, callback) {
      const line = chunk.toString().trim();
      if (line) {
        console.log(line);
        logger.info(line);
      }
      callback(null, chunk);
    }
  });
};
function createChildProcessLogger({ logger, root }) {
  const pinoStream = createPinoStream(logger);
  return async ({ cmd, args, env }) => {
    try {
      const subprocess = spawn(cmd, args, {
        cwd: root,
        shell: true,
        env
      });
      subprocess.stdout?.pipe(pinoStream);
      subprocess.stderr?.pipe(pinoStream);
      return new Promise((resolve, reject) => {
        subprocess.on("close", (code) => {
          pinoStream.end();
          if (code === 0) {
            resolve({ success: true });
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
        subprocess.on("error", (error) => {
          pinoStream.end();
          logger.error("Process failed", { error });
          reject(error);
        });
      });
    } catch (error) {
      console.log(error);
      logger.error("Process failed", { error });
      pinoStream.end();
      return { success: false, error };
    }
  };
}
var Deps = class extends MastraBase {
  packageManager;
  rootDir;
  constructor(rootDir = process.cwd()) {
    super({ component: "DEPLOYER", name: "DEPS" });
    this.rootDir = rootDir;
    this.packageManager = this.getPackageManager();
  }
  findLockFile(dir) {
    const lockFiles = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lock"];
    for (const file of lockFiles) {
      if (fs3__default.existsSync(path.join(dir, file))) {
        return file;
      }
    }
    const parentDir = path.resolve(dir, "..");
    if (parentDir !== dir) {
      return this.findLockFile(parentDir);
    }
    return null;
  }
  getPackageManager() {
    const lockFile = this.findLockFile(this.rootDir);
    switch (lockFile) {
      case "pnpm-lock.yaml":
        return "pnpm";
      case "package-lock.json":
        return "npm";
      case "yarn.lock":
        return "yarn";
      case "bun.lock":
        return "bun";
      default:
        return "npm";
    }
  }
  getWorkspaceDependencyPath({ pkgName, version }) {
    return `file:./workspace-module/${pkgName}-${version}.tgz`;
  }
  async pack({ dir, destination }) {
    const cpLogger = createChildProcessLogger({
      logger: this.logger,
      root: dir
    });
    return cpLogger({
      cmd: `${this.packageManager} pack --pack-destination ${destination}`,
      args: [],
      env: {
        PATH: process.env.PATH
      }
    });
  }
  async writePnpmConfig(dir, options) {
    const packageJsonPath = path.join(dir, "package.json");
    const packageJson = await readJSON(packageJsonPath);
    packageJson.pnpm = {
      ...packageJson.pnpm,
      supportedArchitectures: {
        os: options.os || [],
        cpu: options.cpu || [],
        libc: options.libc || []
      }
    };
    await writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  }
  async writeYarnConfig(dir, options) {
    const yarnrcPath = path.join(dir, ".yarnrc.yml");
    const config = {
      supportedArchitectures: {
        cpu: options.cpu || [],
        os: options.os || [],
        libc: options.libc || []
      }
    };
    await fsPromises.writeFile(
      yarnrcPath,
      `supportedArchitectures:
${Object.entries(config.supportedArchitectures).map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`).join("\n")}`
    );
  }
  getNpmArgs(options) {
    const args = [];
    if (options.cpu) args.push(`--cpu=${options.cpu.join(",")}`);
    if (options.os) args.push(`--os=${options.os.join(",")}`);
    if (options.libc) args.push(`--libc=${options.libc.join(",")}`);
    return args;
  }
  async install({
    dir = this.rootDir,
    architecture
  } = {}) {
    let runCommand = this.packageManager;
    let args = [];
    switch (this.packageManager) {
      case "pnpm":
        runCommand = `${this.packageManager} --ignore-workspace install`;
        if (architecture) {
          await this.writePnpmConfig(dir, architecture);
        }
        break;
      case "yarn":
        await ensureFile(path.join(dir, "yarn.lock"));
        if (architecture) {
          await this.writeYarnConfig(dir, architecture);
        }
        runCommand = `${this.packageManager} install`;
        break;
      case "npm":
        runCommand = `${this.packageManager} install`;
        if (architecture) {
          args = this.getNpmArgs(architecture);
        }
        break;
      default:
        runCommand = `${this.packageManager} install`;
    }
    const cpLogger = createChildProcessLogger({
      logger: this.logger,
      root: dir
    });
    const env = {
      PATH: process.env.PATH
    };
    if (process.env.npm_config_registry) {
      env.npm_config_registry = process.env.npm_config_registry;
    }
    return cpLogger({
      cmd: runCommand,
      args,
      env
    });
  }
  async installPackages(packages) {
    let runCommand = this.packageManager;
    if (this.packageManager === "npm") {
      runCommand = `${this.packageManager} i`;
    } else {
      runCommand = `${this.packageManager} add`;
    }
    const env = {
      PATH: process.env.PATH
    };
    if (process.env.npm_config_registry) {
      env.npm_config_registry = process.env.npm_config_registry;
    }
    const cpLogger = createChildProcessLogger({
      logger: this.logger,
      root: ""
    });
    return cpLogger({
      cmd: `${runCommand}`,
      args: packages,
      env
    });
  }
  async checkDependencies(dependencies) {
    try {
      const packageJsonPath = path.join(this.rootDir, "package.json");
      try {
        await fsPromises.access(packageJsonPath);
      } catch {
        return "No package.json file found in the current directory";
      }
      const packageJson = await readJSON(packageJsonPath);
      for (const dependency of dependencies) {
        if (!packageJson.dependencies || !packageJson.dependencies[dependency]) {
          return `Please install ${dependency} before running this command (${this.packageManager} install ${dependency})`;
        }
      }
      return "ok";
    } catch (err) {
      console.error(err);
      return "Could not check dependencies";
    }
  }
  async getProjectName() {
    try {
      const packageJsonPath = path.join(this.rootDir, "package.json");
      const pkg = await readJSON(packageJsonPath);
      return pkg.name;
    } catch (err) {
      throw err;
    }
  }
  async getPackageVersion() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pkgJsonPath = path.join(__dirname, "..", "..", "package.json");
    const content = await readJSON(pkgJsonPath);
    return content.version;
  }
  async addScriptsToPackageJson(scripts) {
    const packageJson = await readJSON("package.json");
    packageJson.scripts = {
      ...packageJson.scripts,
      ...scripts
    };
    await writeJSON("package.json", packageJson, { spaces: 2 });
  }
};
var DepsService = class extends Deps {
};
var EnvService = class {
};
var FileEnvService = class extends EnvService {
  filePath;
  constructor(filePath) {
    super();
    this.filePath = filePath;
  }
  readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs3.readFile(filePath, "utf8", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  writeFile({ filePath, data }) {
    return new Promise((resolve, reject) => {
      fs3.writeFile(filePath, data, "utf8", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  async updateEnvData({
    key,
    value,
    filePath = this.filePath,
    data
  }) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (data.match(regex)) {
      data = data.replace(regex, `${key}=${value}`);
    } else {
      data += `
${key}=${value}`;
    }
    await this.writeFile({ filePath, data });
    console.log(`${key} set to ${value} in ENV file.`);
    return data;
  }
  async getEnvValue(key) {
    try {
      const data = await this.readFile(this.filePath);
      const regex = new RegExp(`^${key}=(.*)$`, "m");
      const match = data.match(regex);
      return match?.[1] || null;
    } catch (err) {
      console.error(`Error reading ENV value: ${err}`);
      return null;
    }
  }
  async setEnvValue(key, value) {
    try {
      const data = await this.readFile(this.filePath);
      await this.updateEnvData({ key, value, data });
    } catch (err) {
      console.error(`Error writing ENV value: ${err}`);
    }
  }
};
var FileService = class {
  /**
   *
   * @param inputFile the file in the starter files directory to copy
   * @param outputFilePath the destination path
   * @param replaceIfExists flag to replace if it exists
   * @returns
   */
  async copyStarterFile(inputFile, outputFilePath, replaceIfExists) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.resolve(__dirname, "..", "starter-files", inputFile);
    const fileString = fs3__default.readFileSync(filePath, "utf8");
    if (fs3__default.existsSync(outputFilePath) && !replaceIfExists) {
      console.log(`${outputFilePath} already exists`);
      return false;
    }
    await fsExtra.outputFile(outputFilePath, fileString);
    return true;
  }
  async setupEnvFile({ dbUrl }) {
    const envPath = path.join(process.cwd(), ".env.development");
    await fsExtra.ensureFile(envPath);
    const fileEnvService = new FileEnvService(envPath);
    await fileEnvService.setEnvValue("DB_URL", dbUrl);
  }
  getFirstExistingFile(files) {
    for (const f of files) {
      if (fs3__default.existsSync(f)) {
        return f;
      }
    }
    throw new Error("Missing required file, checked the following paths: " + files.join(", "));
  }
  replaceValuesInFile({
    filePath,
    replacements
  }) {
    let fileContent = fs3__default.readFileSync(filePath, "utf8");
    replacements.forEach(({ search, replace }) => {
      fileContent = fileContent.replaceAll(search, replace);
    });
    fs3__default.writeFileSync(filePath, fileContent);
  }
};

export { Deps, DepsService, EnvService, FileService, createChildProcessLogger, createPinoStream };
