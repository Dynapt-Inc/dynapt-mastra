import * as p from '@clack/prompts';
import color2 from 'picocolors';
import child_process from 'child_process';
import util from 'util';
import * as fs3 from 'fs';
import fs3__default, { existsSync } from 'fs';
import fs4 from 'fs/promises';
import path2, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import fsExtra3, { readJSON, ensureFile, writeJSON } from 'fs-extra/esm';
import os from 'os';
import prettier from 'prettier';
import shellQuote from 'shell-quote';
import yoctoSpinner from 'yocto-spinner';
import { PinoLogger } from '@mastra/loggers';

// src/commands/create/create.ts
var DepsService = class {
  packageManager;
  constructor() {
    this.packageManager = this.getPackageManager();
  }
  findLockFile(dir) {
    const lockFiles = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lock"];
    for (const file of lockFiles) {
      if (fs3__default.existsSync(path2.join(dir, file))) {
        return file;
      }
    }
    const parentDir = path2.resolve(dir, "..");
    if (parentDir !== dir) {
      return this.findLockFile(parentDir);
    }
    return null;
  }
  getPackageManager() {
    const lockFile = this.findLockFile(process.cwd());
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
  async installPackages(packages) {
    let runCommand = this.packageManager;
    if (this.packageManager === "npm") {
      runCommand = `${this.packageManager} i`;
    } else {
      runCommand = `${this.packageManager} add`;
    }
    const packageList = packages.join(" ");
    return execa(`${runCommand} ${packageList}`, {
      all: true,
      shell: true,
      stdio: "inherit"
    });
  }
  async checkDependencies(dependencies) {
    try {
      const packageJsonPath = path2.join(process.cwd(), "package.json");
      try {
        await fs4.access(packageJsonPath);
      } catch {
        return "No package.json file found in the current directory";
      }
      const packageJson = JSON.parse(await fs4.readFile(packageJsonPath, "utf-8"));
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
      const packageJsonPath = path2.join(process.cwd(), "package.json");
      const packageJson = await fs4.readFile(packageJsonPath, "utf-8");
      const pkg = JSON.parse(packageJson);
      return pkg.name;
    } catch (err) {
      throw err;
    }
  }
  async getPackageVersion() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pkgJsonPath = path2.join(__dirname, "..", "package.json");
    const content = await fsExtra3.readJSON(pkgJsonPath);
    return content.version;
  }
  async addScriptsToPackageJson(scripts) {
    const packageJson = JSON.parse(await fs4.readFile("package.json", "utf-8"));
    packageJson.scripts = {
      ...packageJson.scripts,
      ...scripts
    };
    await fs4.writeFile("package.json", JSON.stringify(packageJson, null, 2));
  }
};

// src/commands/utils.ts
function getPackageManager() {
  const userAgent = process.env.npm_config_user_agent || "";
  const execPath = process.env.npm_execpath || "";
  if (userAgent.includes("yarn")) {
    return "yarn";
  }
  if (userAgent.includes("pnpm")) {
    return "pnpm";
  }
  if (userAgent.includes("npm")) {
    return "npm";
  }
  if (execPath.includes("yarn")) {
    return "yarn";
  }
  if (execPath.includes("pnpm")) {
    return "pnpm";
  }
  if (execPath.includes("npm")) {
    return "npm";
  }
  return "npm";
}
function getPackageManagerInstallCommand(pm) {
  switch (pm) {
    case "npm":
      return "install";
    case "yarn":
      return "add";
    case "pnpm":
      return "add";
    default:
      return "install";
  }
}
var args = ["-y", "@mastra/mcp-docs-server"];
var createMcpConfig = (editor) => {
  if (editor === "vscode") {
    return {
      servers: {
        mastra: process.platform === `win32` ? {
          command: "cmd",
          args: ["/c", "npx", ...args],
          type: "stdio"
        } : {
          command: "npx",
          args,
          type: "stdio"
        }
      }
    };
  }
  return {
    mcpServers: {
      mastra: {
        command: "npx",
        args
      }
    }
  };
};
function makeConfig(original, editor) {
  if (editor === "vscode") {
    return {
      ...original,
      servers: {
        ...original?.servers || {},
        ...createMcpConfig(editor).servers
      }
    };
  }
  return {
    ...original,
    mcpServers: {
      ...original?.mcpServers || {},
      ...createMcpConfig(editor).mcpServers
    }
  };
}
async function writeMergedConfig(configPath, editor) {
  const configExists = existsSync(configPath);
  const config = makeConfig(configExists ? await readJSON(configPath) : {}, editor);
  await ensureFile(configPath);
  await writeJSON(configPath, config, {
    spaces: 2
  });
}
var windsurfGlobalMCPConfigPath = path2.join(os.homedir(), ".codeium", "windsurf", "mcp_config.json");
var cursorGlobalMCPConfigPath = path2.join(os.homedir(), ".cursor", "mcp.json");
path2.join(process.cwd(), ".vscode", "mcp.json");
var vscodeGlobalMCPConfigPath = path2.join(
  os.homedir(),
  process.platform === "win32" ? path2.join("AppData", "Roaming", "Code", "User", "settings.json") : process.platform === "darwin" ? path2.join("Library", "Application Support", "Code", "User", "settings.json") : path2.join(".config", "Code", "User", "settings.json")
);
async function installMastraDocsMCPServer({ editor, directory }) {
  if (editor === `cursor`) {
    await writeMergedConfig(path2.join(directory, ".cursor", "mcp.json"), "cursor");
  }
  if (editor === `vscode`) {
    await writeMergedConfig(path2.join(directory, ".vscode", "mcp.json"), "vscode");
  }
  if (editor === `cursor-global`) {
    const alreadyInstalled = await globalMCPIsAlreadyInstalled(editor);
    if (alreadyInstalled) {
      return;
    }
    await writeMergedConfig(cursorGlobalMCPConfigPath, "cursor-global");
  }
  if (editor === `windsurf`) {
    const alreadyInstalled = await globalMCPIsAlreadyInstalled(editor);
    if (alreadyInstalled) {
      return;
    }
    await writeMergedConfig(windsurfGlobalMCPConfigPath, editor);
  }
}
async function globalMCPIsAlreadyInstalled(editor) {
  let configPath = ``;
  if (editor === "windsurf") {
    configPath = windsurfGlobalMCPConfigPath;
  } else if (editor === "cursor-global") {
    configPath = cursorGlobalMCPConfigPath;
  } else if (editor === "vscode") {
    configPath = vscodeGlobalMCPConfigPath;
  }
  if (!configPath || !existsSync(configPath)) {
    return false;
  }
  try {
    const configContents = await readJSON(configPath);
    if (!configContents) return false;
    if (editor === "vscode") {
      if (!configContents.servers) return false;
      const hasMastraMCP2 = Object.values(configContents.servers).some(
        (server) => server?.args?.find((arg) => arg?.includes(`@mastra/mcp-docs-server`))
      );
      return hasMastraMCP2;
    }
    if (!configContents?.mcpServers) return false;
    const hasMastraMCP = Object.values(configContents.mcpServers).some(
      (server) => server?.args?.find((arg) => arg?.includes(`@mastra/mcp-docs-server`))
    );
    return hasMastraMCP;
  } catch {
    return false;
  }
}

// src/services/service.env.ts
var EnvService = class {
};

// src/services/service.fileEnv.ts
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

// src/services/service.file.ts
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
    const __dirname = path2.dirname(__filename);
    const filePath = path2.resolve(__dirname, "starter-files", inputFile);
    const fileString = fs3__default.readFileSync(filePath, "utf8");
    if (fs3__default.existsSync(outputFilePath) && !replaceIfExists) {
      console.log(`${outputFilePath} already exists`);
      return false;
    }
    await fsExtra3.outputFile(outputFilePath, fileString);
    return true;
  }
  async setupEnvFile({ dbUrl }) {
    const envPath = path2.join(process.cwd(), ".env.development");
    await fsExtra3.ensureFile(envPath);
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
var logger = new PinoLogger({
  name: "Mastra CLI",
  level: "info"
});

// src/commands/init/utils.ts
var exec = util.promisify(child_process.exec);
var getAISDKPackage = (llmProvider) => {
  switch (llmProvider) {
    case "openai":
      return "@ai-sdk/openai";
    case "anthropic":
      return "@ai-sdk/anthropic";
    case "groq":
      return "@ai-sdk/groq";
    case "google":
      return "@ai-sdk/google";
    case "cerebras":
      return "@ai-sdk/cerebras";
    default:
      return "@ai-sdk/openai";
  }
};
var getProviderImportAndModelItem = (llmProvider) => {
  let providerImport = "";
  let modelItem = "";
  if (llmProvider === "openai") {
    providerImport = `import { openai } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `openai('gpt-4o-mini')`;
  } else if (llmProvider === "anthropic") {
    providerImport = `import { anthropic } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `anthropic('claude-3-5-sonnet-20241022')`;
  } else if (llmProvider === "groq") {
    providerImport = `import { groq } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `groq('llama-3.3-70b-versatile')`;
  } else if (llmProvider === "google") {
    providerImport = `import { google } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `google('gemini-1.5-pro-latest')`;
  } else if (llmProvider === "cerebras") {
    providerImport = `import { cerebras } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `cerebras('llama-3.3-70b')`;
  }
  return { providerImport, modelItem };
};
async function writeAgentSample(llmProvider, destPath, addExampleTool) {
  const { providerImport, modelItem } = getProviderImportAndModelItem(llmProvider);
  const instructions = `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn\u2019t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      ${addExampleTool ? "Use the weatherTool to fetch current weather data." : ""}
`;
  const content = `
${providerImport}
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
${addExampleTool ? `import { weatherTool } from '../tools/weather-tool';` : ""}

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: \`${instructions}\`,
  model: ${modelItem},
  ${addExampleTool ? "tools: { weatherTool }," : ""}
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    })
  })
});
    `;
  const formattedContent = await prettier.format(content, {
    parser: "typescript",
    singleQuote: true
  });
  await fs4.writeFile(destPath, "");
  await fs4.writeFile(destPath, formattedContent);
}
async function writeWorkflowSample(destPath, llmProvider) {
  const { providerImport, modelItem } = getProviderImportAndModelItem(llmProvider);
  const content = `${providerImport}
import { Agent } from '@mastra/core/agent';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = ${modelItem};

const agent = new Agent({
  name: 'Weather Agent',
  model: llm,
  instructions: \`
        You are a local activities and travel expert who excels at weather-based planning. Analyze the weather data and provide practical activity recommendations.

        For each day in the forecast, structure your response exactly as follows:

        \u{1F4C5} [Day, Month Date, Year]
        \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

        \u{1F321}\uFE0F WEATHER SUMMARY
        \u2022 Conditions: [brief description]
        \u2022 Temperature: [X\xB0C/Y\xB0F to A\xB0C/B\xB0F]
        \u2022 Precipitation: [X% chance]

        \u{1F305} MORNING ACTIVITIES
        Outdoor:
        \u2022 [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]

        \u{1F31E} AFTERNOON ACTIVITIES
        Outdoor:
        \u2022 [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]

        \u{1F3E0} INDOOR ALTERNATIVES
        \u2022 [Activity Name] - [Brief description including specific venue]
          Ideal for: [weather condition that would trigger this alternative]

        \u26A0\uFE0F SPECIAL CONSIDERATIONS
        \u2022 [Any relevant weather warnings, UV index, wind conditions, etc.]

        Guidelines:
        - Suggest 2-3 time-specific outdoor activities per day
        - Include 1-2 indoor backup options
        - For precipitation >50%, lead with indoor activities
        - All activities must be specific to the location
        - Include specific venues, trails, or locations
        - Consider activity intensity based on temperature
        - Keep descriptions concise but informative

        Maintain this exact formatting for consistency, using the emoji and section headers as shown.
      \`,
});

const forecastSchema = z.object({
  date: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  precipitationChance: z.number(),
  condition: z.string(),
  location: z.string(),
})

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
  }
  return conditions[code] || 'Unknown'
}

const fetchWeather = createStep({
  id: 'fetch-weather',
  description: 'Fetches weather forecast for a given city',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const geocodingUrl = \`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(inputData.city)}&count=1\`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = (await geocodingResponse.json()) as {
      results: { latitude: number; longitude: number; name: string }[];
    };

    if (!geocodingData.results?.[0]) {
      throw new Error(\`Location '\${inputData.city}' not found\`);
    }

    const { latitude, longitude, name } = geocodingData.results[0];

    const weatherUrl = \`https://api.open-meteo.com/v1/forecast?latitude=\${latitude}&longitude=\${longitude}&current=precipitation,weathercode&timezone=auto,&hourly=precipitation_probability,temperature_2m\`;
    const response = await fetch(weatherUrl);
    const data = (await response.json()) as {
      current: {
        time: string
        precipitation: number
        weathercode: number
      }
      hourly: {
        precipitation_probability: number[]
        temperature_2m: number[]
      }
    }

    const forecast = {
      date: new Date().toISOString(),
      maxTemp: Math.max(...data.hourly.temperature_2m),
      minTemp: Math.min(...data.hourly.temperature_2m),
      condition: getWeatherCondition(data.current.weathercode),
      precipitationChance: data.hourly.precipitation_probability.reduce(
        (acc, curr) => Math.max(acc, curr),
        0
      ),
      location: name
    }

    return forecast;
  },
});


const planActivities = createStep({
  id: 'plan-activities',
  description: 'Suggests activities based on weather conditions',
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData }) => {
    const forecast = inputData

    if (!forecast) {
      throw new Error('Forecast data not found')
    }

    const prompt = \`Based on the following weather forecast for \${forecast.location}, suggest appropriate activities:
      \${JSON.stringify(forecast, null, 2)}
      \`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let activitiesText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }

    return {
      activities: activitiesText,
    };
  },
});

const weatherWorkflow = createWorkflow({
  id: 'weather-workflow',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: z.object({
    activities: z.string(),
  })
})
  .then(fetchWeather)
  .then(planActivities);

weatherWorkflow.commit();

export { weatherWorkflow };`;
  const formattedContent = await prettier.format(content, {
    parser: "typescript",
    semi: true,
    singleQuote: true
  });
  await fs4.writeFile(destPath, formattedContent);
}
async function writeToolSample(destPath) {
  const fileService = new FileService();
  await fileService.copyStarterFile("tools.ts", destPath);
}
async function writeCodeSampleForComponents(llmprovider, component, destPath, importComponents) {
  switch (component) {
    case "agents":
      return writeAgentSample(llmprovider, destPath, importComponents.includes("tools"));
    case "tools":
      return writeToolSample(destPath);
    case "workflows":
      return writeWorkflowSample(destPath, llmprovider);
    default:
      return "";
  }
}
var createComponentsDir = async (dirPath, component) => {
  const componentPath = dirPath + `/${component}`;
  await fsExtra3.ensureDir(componentPath);
};
var writeIndexFile = async ({
  dirPath,
  addAgent,
  addExample,
  addWorkflow
}) => {
  const indexPath = dirPath + "/index.ts";
  const destPath = path2.join(indexPath);
  try {
    await fs4.writeFile(destPath, "");
    const filteredExports = [
      addWorkflow ? `workflows: { weatherWorkflow },` : "",
      addAgent ? `agents: { weatherAgent },` : ""
    ].filter(Boolean);
    if (!addExample) {
      await fs4.writeFile(
        destPath,
        `
import { Mastra } from '@mastra/core';

export const mastra = new Mastra()
        `
      );
      return;
    }
    await fs4.writeFile(
      destPath,
      `
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
${addWorkflow ? `import { weatherWorkflow } from './workflows/weather-workflow';` : ""}
${addAgent ? `import { weatherAgent } from './agents/weather-agent';` : ""}

export const mastra = new Mastra({
  ${filteredExports.join("\n  ")}
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
`
    );
  } catch (err) {
    throw err;
  }
};
var checkAndInstallCoreDeps = async (addExample) => {
  const depsService = new DepsService();
  let depCheck = await depsService.checkDependencies(["@mastra/core"]);
  if (depCheck !== "ok") {
    await installCoreDeps("@mastra/core");
  }
  if (addExample) {
    depCheck = await depsService.checkDependencies(["@mastra/libsql"]);
    if (depCheck !== "ok") {
      await installCoreDeps("@mastra/libsql");
    }
  }
};
var spinner = yoctoSpinner({ text: "Installing Mastra core dependencies\n" });
async function installCoreDeps(pkg) {
  try {
    const confirm2 = await p.confirm({
      message: `You do not have the ${pkg} package installed. Would you like to install it?`,
      initialValue: false
    });
    if (p.isCancel(confirm2)) {
      p.cancel("Installation Cancelled");
      process.exit(0);
    }
    if (!confirm2) {
      p.cancel("Installation Cancelled");
      process.exit(0);
    }
    spinner.start();
    const depsService = new DepsService();
    await depsService.installPackages([`${pkg}@latest`]);
    spinner.success("@mastra/core installed successfully");
  } catch (err) {
    console.error(err);
  }
}
var getAPIKey = async (provider) => {
  let key = "OPENAI_API_KEY";
  switch (provider) {
    case "anthropic":
      key = "ANTHROPIC_API_KEY";
      return key;
    case "groq":
      key = "GROQ_API_KEY";
      return key;
    case "google":
      key = "GOOGLE_GENERATIVE_AI_API_KEY";
      return key;
    case "cerebras":
      key = "CEREBRAS_API_KEY";
      return key;
    default:
      return key;
  }
};
var writeAPIKey = async ({
  provider,
  apiKey = "your-api-key"
}) => {
  const key = await getAPIKey(provider);
  const escapedKey = shellQuote.quote([key]);
  const escapedApiKey = shellQuote.quote([apiKey]);
  await exec(`echo ${escapedKey}=${escapedApiKey} >> .env`);
};
var createMastraDir = async (directory) => {
  let dir = directory.trim().split("/").filter((item) => item !== "");
  const dirPath = path2.join(process.cwd(), ...dir, "mastra");
  try {
    await fs4.access(dirPath);
    return { ok: false };
  } catch {
    await fsExtra3.ensureDir(dirPath);
    return { ok: true, dirPath };
  }
};
var writeCodeSample = async (dirPath, component, llmProvider, importComponents) => {
  const destPath = dirPath + `/${component}/weather-${component.slice(0, -1)}.ts`;
  try {
    await writeCodeSampleForComponents(llmProvider, component, destPath, importComponents);
  } catch (err) {
    throw err;
  }
};
var interactivePrompt = async () => {
  p.intro(color2.inverse(" Mastra Init "));
  const mastraProject = await p.group(
    {
      directory: () => p.text({
        message: "Where should we create the Mastra files? (default: src/)",
        placeholder: "src/",
        defaultValue: "src/"
      }),
      llmProvider: () => p.select({
        message: "Select default provider:",
        options: [
          { value: "openai", label: "OpenAI", hint: "recommended" },
          { value: "anthropic", label: "Anthropic" },
          { value: "groq", label: "Groq" },
          { value: "google", label: "Google" },
          { value: "cerebras", label: "Cerebras" }
        ]
      }),
      llmApiKey: async ({ results: { llmProvider } }) => {
        const keyChoice = await p.select({
          message: `Enter your ${llmProvider} API key?`,
          options: [
            { value: "skip", label: "Skip for now", hint: "default" },
            { value: "enter", label: "Enter API key" }
          ],
          initialValue: "skip"
        });
        if (keyChoice === "enter") {
          return p.text({
            message: "Enter your API key:",
            placeholder: "sk-..."
          });
        }
        return void 0;
      },
      configureEditorWithDocsMCP: async () => {
        const windsurfIsAlreadyInstalled = await globalMCPIsAlreadyInstalled(`windsurf`);
        const cursorIsAlreadyInstalled = await globalMCPIsAlreadyInstalled(`cursor`);
        const vscodeIsAlreadyInstalled = await globalMCPIsAlreadyInstalled(`vscode`);
        const editor = await p.select({
          message: `Make your AI IDE into a Mastra expert? (installs Mastra docs MCP server)`,
          options: [
            { value: "skip", label: "Skip for now", hint: "default" },
            {
              value: "cursor",
              label: "Cursor (project only)",
              hint: cursorIsAlreadyInstalled ? `Already installed globally` : void 0
            },
            {
              value: "cursor-global",
              label: "Cursor (global, all projects)",
              hint: cursorIsAlreadyInstalled ? `Already installed` : void 0
            },
            {
              value: "windsurf",
              label: "Windsurf",
              hint: windsurfIsAlreadyInstalled ? `Already installed` : void 0
            },
            {
              value: "vscode",
              label: "VSCode",
              hint: vscodeIsAlreadyInstalled ? `Already installed` : void 0
            }
          ]
        });
        if (editor === `skip`) return void 0;
        if (editor === `windsurf` && windsurfIsAlreadyInstalled) {
          p.log.message(`
Windsurf is already installed, skipping.`);
          return void 0;
        }
        if (editor === `vscode` && vscodeIsAlreadyInstalled) {
          p.log.message(`
VSCode is already installed, skipping.`);
          return void 0;
        }
        if (editor === `cursor`) {
          p.log.message(
            `
Note: you will need to go into Cursor Settings -> MCP Settings and manually enable the installed Mastra MCP server.
`
          );
        }
        if (editor === `cursor-global`) {
          const confirm2 = await p.select({
            message: `Global install will add/update ${cursorGlobalMCPConfigPath} and make the Mastra docs MCP server available in all your Cursor projects. Continue?`,
            options: [
              { value: "yes", label: "Yes, I understand" },
              { value: "skip", label: "No, skip for now" }
            ]
          });
          if (confirm2 !== `yes`) {
            return void 0;
          }
        }
        if (editor === `windsurf`) {
          const confirm2 = await p.select({
            message: `Windsurf only supports a global MCP config (at ${windsurfGlobalMCPConfigPath}) is it ok to add/update that global config?
This means the Mastra docs MCP server will be available in all your Windsurf projects.`,
            options: [
              { value: "yes", label: "Yes, I understand" },
              { value: "skip", label: "No, skip for now" }
            ]
          });
          if (confirm2 !== `yes`) {
            return void 0;
          }
        }
        return editor;
      }
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      }
    }
  );
  return mastraProject;
};
var checkPkgJson = async () => {
  const cwd = process.cwd();
  const pkgJsonPath = path2.join(cwd, "package.json");
  let isPkgJsonPresent = false;
  try {
    await fsExtra3.readJSON(pkgJsonPath);
    isPkgJsonPresent = true;
  } catch {
    isPkgJsonPresent = false;
  }
  if (isPkgJsonPresent) {
    return;
  }
  logger.debug('package.json not found, create one or run "mastra create" to create a new project');
  process.exit(0);
};

// src/commands/init/init.ts
var s = p.spinner();
var exec2 = util.promisify(child_process.exec);
var init = async ({
  directory,
  addExample = false,
  components,
  llmProvider = "openai",
  llmApiKey,
  configureEditorWithDocsMCP
}) => {
  s.start("Initializing Mastra");
  try {
    const result = await createMastraDir(directory);
    if (!result.ok) {
      s.stop(color2.inverse(" Mastra already initialized "));
      return { success: false };
    }
    const dirPath = result.dirPath;
    await Promise.all([
      writeIndexFile({
        dirPath,
        addExample,
        addWorkflow: components.includes("workflows"),
        addAgent: components.includes("agents")
      }),
      ...components.map((component) => createComponentsDir(dirPath, component)),
      writeAPIKey({ provider: llmProvider, apiKey: llmApiKey })
    ]);
    if (addExample) {
      await Promise.all([
        ...components.map(
          (component) => writeCodeSample(dirPath, component, llmProvider, components)
        )
      ]);
      const depService = new DepsService();
      const needsLibsql = await depService.checkDependencies(["@mastra/libsql"]) !== `ok`;
      if (needsLibsql) {
        await depService.installPackages(["@mastra/libsql"]);
      }
      const needsMemory = components.includes(`agents`) && await depService.checkDependencies(["@mastra/memory"]) !== `ok`;
      if (needsMemory) {
        await depService.installPackages(["@mastra/memory"]);
      }
      const needsLoggers = await depService.checkDependencies(["@mastra/loggers"]) !== `ok`;
      if (needsLoggers) {
        await depService.installPackages(["@mastra/loggers"]);
      }
    }
    const key = await getAPIKey(llmProvider || "openai");
    const aiSdkPackage = getAISDKPackage(llmProvider);
    const depsService = new DepsService();
    const pm = depsService.packageManager;
    const installCommand = getPackageManagerInstallCommand(pm);
    await exec2(`${pm} ${installCommand} ${aiSdkPackage}`);
    if (configureEditorWithDocsMCP) {
      await installMastraDocsMCPServer({
        editor: configureEditorWithDocsMCP,
        directory: process.cwd()
      });
    }
    s.stop();
    if (!llmApiKey) {
      p.note(`
      ${color2.green("Mastra initialized successfully!")}

      Add your ${color2.cyan(key)} as an environment variable
      in your ${color2.cyan(".env")} file
      `);
    } else {
      p.note(`
      ${color2.green("Mastra initialized successfully!")}
      `);
    }
    return { success: true };
  } catch (err) {
    s.stop(color2.inverse("An error occurred while initializing Mastra"));
    console.error(err);
    return { success: false };
  }
};
var exec3 = util.promisify(child_process.exec);
var execWithTimeout = async (command, timeoutMs) => {
  try {
    const promise = exec3(command, { killSignal: "SIGTERM" });
    if (!timeoutMs) {
      return await promise;
    }
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Command timed out")), timeoutMs);
    });
    try {
      const result = await Promise.race([promise, timeout]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.message === "Command timed out") {
        throw new Error("Something went wrong during installation, please try again.");
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
async function installMastraDependency(pm, dependency, versionTag, isDev, timeout) {
  let installCommand = getPackageManagerInstallCommand(pm);
  if (isDev) {
    installCommand = `${installCommand} --save-dev`;
  }
  try {
    await execWithTimeout(`${pm} ${installCommand} ${dependency}${versionTag}`, timeout);
  } catch (err) {
    if (versionTag === "@latest") {
      throw new Error(
        `Failed to install ${dependency}@latest: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
    try {
      await execWithTimeout(`${pm} ${installCommand} ${dependency}@latest`, timeout);
    } catch (fallbackErr) {
      throw new Error(
        `Failed to install ${dependency} (tried ${versionTag} and @latest): ${fallbackErr instanceof Error ? fallbackErr.message : "Unknown error"}`
      );
    }
  }
}
var createMastraProject = async ({
  projectName: name,
  createVersionTag,
  timeout
}) => {
  p.intro(color2.inverse(" Mastra Create "));
  const projectName = name ?? await p.text({
    message: "What do you want to name your project?",
    placeholder: "my-mastra-app",
    defaultValue: "my-mastra-app"
  });
  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }
  const s2 = p.spinner();
  try {
    s2.start("Creating project");
    try {
      await fs4.mkdir(projectName);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "EEXIST") {
        s2.stop(`A directory named "${projectName}" already exists. Please choose a different name.`);
        process.exit(1);
      }
      throw new Error(
        `Failed to create project directory: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    process.chdir(projectName);
    const pm = getPackageManager();
    const installCommand = getPackageManagerInstallCommand(pm);
    s2.message("Initializing project structure");
    try {
      await exec3(`npm init -y`);
      await exec3(`npm pkg set type="module"`);
      await exec3(`npm pkg set engines.node=">=20.9.0"`);
      const depsService = new DepsService();
      await depsService.addScriptsToPackageJson({
        dev: "mastra dev",
        build: "mastra build",
        start: "mastra start"
      });
    } catch (error) {
      throw new Error(
        `Failed to initialize project structure: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    s2.stop("Project structure created");
    s2.start(`Installing ${pm} dependencies`);
    try {
      await exec3(`${pm} ${installCommand} zod`);
      await exec3(`${pm} ${installCommand} typescript @types/node --save-dev`);
      await exec3(`echo '{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "outDir": "dist"
  },
  "include": [
    "src/**/*"
  ]
}' > tsconfig.json`);
    } catch (error) {
      throw new Error(
        `Failed to install basic dependencies: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    s2.stop(`${pm} dependencies installed`);
    s2.start("Installing mastra");
    const versionTag = createVersionTag ? `@${createVersionTag}` : "@latest";
    try {
      await installMastraDependency(pm, "mastra", versionTag, true, timeout);
    } catch (error) {
      throw new Error(`Failed to install Mastra CLI: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    s2.stop("mastra installed");
    s2.start("Installing dependencies");
    try {
      await installMastraDependency(pm, "@mastra/core", versionTag, false, timeout);
      await installMastraDependency(pm, "@mastra/libsql", versionTag, false, timeout);
      await installMastraDependency(pm, "@mastra/memory", versionTag, false, timeout);
    } catch (error) {
      throw new Error(
        `Failed to install Mastra dependencies: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    s2.stop("Mastra dependencies installed");
    s2.start("Adding .gitignore");
    try {
      await exec3(`echo output.txt >> .gitignore`);
      await exec3(`echo node_modules >> .gitignore`);
      await exec3(`echo dist >> .gitignore`);
      await exec3(`echo .mastra >> .gitignore`);
      await exec3(`echo .env.development >> .gitignore`);
      await exec3(`echo .env >> .gitignore`);
      await exec3(`echo *.db >> .gitignore`);
      await exec3(`echo *.db-* >> .gitignore`);
    } catch (error) {
      throw new Error(`Failed to create .gitignore: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    s2.stop(".gitignore added");
    p.outro("Project created successfully");
    console.log("");
    return { projectName };
  } catch (error) {
    s2.stop();
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    p.cancel(`Project creation failed: ${errorMessage}`);
    process.exit(1);
  }
};

// src/commands/create/create.ts
var create = async (args2) => {
  const { projectName } = await createMastraProject({
    projectName: args2?.projectName,
    createVersionTag: args2?.createVersionTag,
    timeout: args2?.timeout
  });
  const directory = args2.directory || "src/";
  if (args2.components === void 0 || args2.llmProvider === void 0 || args2.addExample === void 0) {
    const result = await interactivePrompt();
    await init({
      ...result,
      llmApiKey: result?.llmApiKey,
      components: ["agents", "tools", "workflows"],
      addExample: true
    });
    postCreate({ projectName });
    return;
  }
  const { components = [], llmProvider = "openai", addExample = false, llmApiKey } = args2;
  await init({
    directory,
    components,
    llmProvider,
    addExample,
    llmApiKey,
    configureEditorWithDocsMCP: args2.mcpServer
  });
  postCreate({ projectName });
};
var postCreate = ({ projectName }) => {
  const packageManager = getPackageManager();
  p.outro(`
   ${color2.green("To start your project:")}

    ${color2.cyan("cd")} ${projectName}
    ${color2.cyan(`${packageManager} run dev`)}
  `);
};

export { DepsService, FileService, checkAndInstallCoreDeps, checkPkgJson, create, init, interactivePrompt, logger };
