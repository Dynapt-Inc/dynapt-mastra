import fs2 from 'fs/promises';
import path4, { dirname } from 'path';
import { fileURLToPath } from 'url';

// src/utils.ts
var mdxFileCache = /* @__PURE__ */ new Map();
var __dirname = dirname(fileURLToPath(import.meta.url));
function fromRepoRoot(relative) {
  return path4.resolve(__dirname, `../../../`, relative);
}
function fromPackageRoot(relative) {
  return path4.resolve(__dirname, `../`, relative);
}
var log = console.error;
async function* walkMdxFiles(dir) {
  if (mdxFileCache.has(dir)) {
    for (const file of mdxFileCache.get(dir)) yield file;
    return;
  }
  const filesInDir = [];
  const entries = await fs2.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path4.join(dir, entry.name);
    if (entry.isDirectory()) {
      for await (const file of walkMdxFiles(fullPath)) {
        filesInDir.push(file);
        yield file;
      }
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      filesInDir.push(fullPath);
      yield fullPath;
    }
  }
  mdxFileCache.set(dir, filesInDir);
}
async function searchDocumentContent(keywords, baseDir) {
  if (keywords.length === 0) return [];
  const fileScores = /* @__PURE__ */ new Map();
  for await (const filePath of walkMdxFiles(baseDir)) {
    let content;
    try {
      content = await fs2.readFile(filePath, "utf-8");
    } catch {
      continue;
    }
    const lines = content.split("\n");
    lines.forEach((lineText) => {
      const lowerLine = lineText.toLowerCase();
      for (const keyword of keywords) {
        if (lowerLine.includes(keyword.toLowerCase())) {
          const relativePath = path4.relative(baseDir, filePath).replace(/\\/g, "/");
          if (!fileScores.has(relativePath)) {
            fileScores.set(relativePath, {
              path: relativePath,
              keywordMatches: /* @__PURE__ */ new Set(),
              totalMatches: 0,
              titleMatches: 0,
              pathRelevance: calculatePathRelevance(relativePath, keywords)
            });
          }
          const score = fileScores.get(relativePath);
          score.keywordMatches.add(keyword);
          score.totalMatches++;
          if (lowerLine.includes("#") || lowerLine.includes("title")) {
            score.titleMatches++;
          }
        }
      }
    });
  }
  const validFiles = Array.from(fileScores.values()).sort((a, b) => calculateFinalScore(b, keywords.length) - calculateFinalScore(a, keywords.length)).slice(0, 10);
  return validFiles.map((score) => score.path);
}
function calculatePathRelevance(filePath, keywords) {
  let relevance = 0;
  const pathLower = filePath.toLowerCase();
  if (pathLower.startsWith("reference/")) relevance += 2;
  keywords.forEach((keyword) => {
    if (pathLower.includes(keyword.toLowerCase())) relevance += 3;
  });
  const highValueDirs = ["rag", "memory", "agents", "workflows"];
  if (highValueDirs.some((dir) => pathLower.includes(dir))) {
    relevance += 1;
  }
  return relevance;
}
function calculateFinalScore(score, totalKeywords) {
  const allKeywordsBonus = score.keywordMatches.size === totalKeywords ? 10 : 0;
  return score.totalMatches * 1 + score.titleMatches * 3 + score.pathRelevance * 2 + score.keywordMatches.size * 5 + allKeywordsBonus;
}
function extractKeywordsFromPath(path5) {
  const filename = path5.split("/").pop()?.replace(/\.(mdx|md)$/, "") || "";
  const keywords = /* @__PURE__ */ new Set();
  const splitParts = filename.split(/[-_]|(?=[A-Z])/);
  splitParts.forEach((keyword) => {
    if (keyword.length > 2) {
      keywords.add(keyword.toLowerCase());
    }
  });
  return Array.from(keywords);
}
function normalizeKeywords(keywords) {
  return Array.from(new Set(keywords.flatMap((k) => k.split(/\s+/).filter(Boolean)).map((k) => k.toLowerCase())));
}
async function getMatchingPaths(path5, queryKeywords, baseDir) {
  const pathKeywords = extractKeywordsFromPath(path5);
  const allKeywords = normalizeKeywords([...pathKeywords, ...queryKeywords || []]);
  if (allKeywords.length === 0) {
    return "";
  }
  const suggestedPaths = await searchDocumentContent(allKeywords, baseDir);
  if (suggestedPaths.length === 0) {
    return "";
  }
  const pathList = suggestedPaths.map((path6) => `- ${path6}`).join("\n");
  return `Here are some paths that might be relevant based on your query:

${pathList}`;
}
var EXAMPLES_SOURCE = fromRepoRoot("examples");
var OUTPUT_DIR = fromPackageRoot(".docs/organized/code-examples");
async function prepareCodeExamples() {
  try {
    await fs2.rm(OUTPUT_DIR, { recursive: true, force: true });
  } catch {
  }
  await fs2.mkdir(OUTPUT_DIR, { recursive: true });
  const examples = await fs2.readdir(EXAMPLES_SOURCE, { withFileTypes: true });
  const exampleDirs = examples.filter((entry) => entry.isDirectory());
  for (const dir of exampleDirs) {
    const examplePath = path4.join(EXAMPLES_SOURCE, dir.name);
    const outputFile = path4.join(OUTPUT_DIR, `${dir.name}.md`);
    const files = [];
    try {
      const packageJson = await fs2.readFile(path4.join(examplePath, "package.json"), "utf-8");
      files.push({
        path: "package.json",
        content: packageJson
      });
    } catch {
    }
    try {
      const srcPath = path4.join(examplePath, "src");
      await scanDirectory(srcPath, srcPath, files);
    } catch {
    }
    if (files.length > 0) {
      const output = files.map((file) => `### ${file.path}
\`\`\`${getFileType(file.path)}
${file.content}
\`\`\`
`).join("\n");
      const totalLines = output.split("\n").length;
      const limit = 1e3;
      if (totalLines > limit) {
        log(`Skipping ${dir.name}: ${totalLines} lines exceeds limit of ${limit}`);
        continue;
      }
      await fs2.writeFile(outputFile, output, "utf-8");
      log(`Generated ${dir.name}.md with ${totalLines} lines`);
    }
  }
}
async function scanDirectory(basePath, currentPath, files) {
  const entries = await fs2.readdir(currentPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path4.join(currentPath, entry.name);
    const relativePath = path4.relative(basePath, fullPath);
    if (entry.isDirectory()) {
      await scanDirectory(basePath, fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      const content = await fs2.readFile(fullPath, "utf-8");
      files.push({
        path: relativePath,
        content
      });
    }
  }
}
function getFileType(filePath) {
  if (filePath === "package.json") return "json";
  if (filePath.endsWith(".ts")) return "typescript";
  return "";
}
var DOCS_SOURCE = fromRepoRoot("docs/src/content/en/docs");
var REFERENCE_SOURCE = fromRepoRoot("docs/src/content/en/reference");
var COURSE_SOURCE = fromRepoRoot("docs/src/course");
var DOCS_DEST = fromPackageRoot(".docs/raw");
var REFERENCE_DEST = path4.join(DOCS_DEST, "reference");
var COURSE_DEST = path4.join(DOCS_DEST, "course");
async function copyDir(src, dest) {
  await fs2.mkdir(dest, { recursive: true });
  const entries = await fs2.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path4.join(src, entry.name);
    const destPath = path4.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile() && (entry.name.endsWith(".mdx") || entry.name.endsWith(".md"))) {
      await fs2.copyFile(srcPath, destPath);
    }
  }
}
async function copyRaw() {
  try {
    try {
      await fs2.rm(DOCS_DEST, { recursive: true });
    } catch {
    }
    await copyDir(DOCS_SOURCE, DOCS_DEST);
    await copyDir(REFERENCE_SOURCE, REFERENCE_DEST);
    await copyDir(COURSE_SOURCE, COURSE_DEST);
    log("\u2705 Documentation files copied successfully");
  } catch (error) {
    console.error("\u274C Failed to copy documentation files:", error);
    process.exit(1);
  }
}
var SOURCE_DIRS = ["packages", "speech", "stores", "voice", "integrations", "deployers", "client-sdks"].map(
  fromRepoRoot
);
var CHANGELOGS_DEST = fromPackageRoot(".docs/organized/changelogs");
var MAX_LINES = 300;
function truncateContent(content, maxLines) {
  const lines = content.split("\n");
  if (lines.length <= maxLines) return content;
  const visibleLines = lines.slice(0, maxLines);
  const hiddenCount = lines.length - maxLines;
  return visibleLines.join("\n") + `

... ${hiddenCount} more lines hidden. See full changelog in package directory.`;
}
async function processPackageDir(packagePath, outputDir) {
  let packageName;
  try {
    const packageJsonPath = path4.join(packagePath, "package.json");
    const packageJson = JSON.parse(await fs2.readFile(packageJsonPath, "utf-8"));
    packageName = packageJson.name;
    if (!packageName) {
      log(`Skipping ${path4.basename(packagePath)}: No package name found in package.json`);
      return;
    }
  } catch {
    console.error(`Skipping ${path4.basename(packagePath)}: No valid package.json found`);
    return;
  }
  try {
    const changelogPath = path4.join(packagePath, "CHANGELOG.md");
    let changelog;
    try {
      changelog = await fs2.readFile(changelogPath, "utf-8");
      changelog = truncateContent(changelog, MAX_LINES);
    } catch {
      changelog = "No changelog available.";
    }
    const outputFile = path4.join(outputDir, `${encodeURIComponent(packageName)}.md`);
    await fs2.writeFile(outputFile, changelog, "utf-8");
    log(`Generated changelog for ${packageName}`);
  } catch (error) {
    console.error(`Error processing changelog for ${packageName}:`, error);
  }
}
async function preparePackageChanges() {
  const outputDir = path4.resolve(process.cwd(), CHANGELOGS_DEST);
  try {
    await fs2.rm(outputDir, { recursive: true, force: true });
  } catch {
  }
  await fs2.mkdir(outputDir, { recursive: true });
  for (const sourceDir of SOURCE_DIRS) {
    const fullSourceDir = path4.resolve(process.cwd(), sourceDir);
    try {
      await fs2.access(fullSourceDir);
      const entries = await fs2.readdir(fullSourceDir, { withFileTypes: true });
      const packageDirs = entries.filter((entry) => entry.isDirectory()).filter((entry) => entry.name !== "docs-mcp" && entry.name !== "_config");
      for (const dir of packageDirs) {
        const packagePath = path4.join(fullSourceDir, dir.name);
        await processPackageDir(packagePath, outputDir);
      }
    } catch {
      console.error(`Skipping ${sourceDir}: Directory not found or not accessible`);
    }
  }
}

// src/prepare-docs/prepare.ts
async function prepare() {
  log("Preparing documentation...");
  await copyRaw();
  log("Preparing code examples...");
  await prepareCodeExamples();
  log("Preparing package changelogs...");
  await preparePackageChanges();
  log("Documentation preparation complete!");
}
if (process.env.PREPARE === `true`) {
  try {
    await prepare();
  } catch (error) {
    console.error("Error preparing documentation:", error);
    process.exit(1);
  }
}

export { fromPackageRoot, getMatchingPaths, prepare };
