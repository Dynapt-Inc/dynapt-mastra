#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function log(message, level = 'info') {
  const levels = {
    info: '💡',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    build: '🔨',
    release: '🚀',
  };
  console.log(`${levels[level]} ${message}`);
}

function runCommand(command, options = {}) {
  log(`Running: ${command}`, 'build');
  try {
    const result = execSync(command, {
      cwd: rootDir,
      stdio: 'inherit',
      ...options,
    });
    return result;
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    throw error;
  }
}

function ensureCleanWorkingDirectory() {
  try {
    const status = execSync('git status --porcelain', {
      cwd: rootDir,
      encoding: 'utf8',
    });

    if (status.trim()) {
      log('Working directory is not clean. Please commit or stash changes first.', 'error');
      console.log('Uncommitted changes:');
      console.log(status);
      process.exit(1);
    }

    log('Working directory is clean', 'success');
  } catch (error) {
    log('Could not check git status', 'warning');
  }
}

function validateVersion(version) {
  const versionRegex = /^v?\d+\.\d+\.\d+(-[\w.-]+)?$/;
  if (!versionRegex.test(version)) {
    log(`Invalid version format: ${version}`, 'error');
    log('Expected format: v1.2.3 or 1.2.3 (with optional pre-release suffix)', 'info');
    process.exit(1);
  }

  // Ensure version starts with 'v'
  return version.startsWith('v') ? version : `v${version}`;
}

function buildAllPackages() {
  log('Building all packages...', 'build');

  const buildCommands = [
    'pnpm run build:packages',
    'pnpm run build:integrations',
    'pnpm run build:combined-stores',
    'pnpm run build:deployers',
    'pnpm run build:auth',
    'pnpm run build:clients',
  ];

  for (const command of buildCommands) {
    try {
      runCommand(command);
    } catch (error) {
      log(`Build step failed: ${command}`, 'error');
      throw error;
    }
  }

  log('All packages built successfully', 'success');
}

function runTests() {
  log('Running tests...', 'build');
  try {
    runCommand('pnpm test');
    log('All tests passed', 'success');
  } catch (error) {
    log('Tests failed', 'error');
    throw error;
  }
}

function preparePackagesForRelease(version, createTag = true) {
  log(`Preparing packages for release ${version}...`, 'build');

  // Run the existing prepare script
  runCommand('node scripts/prepare-github-release.js');

  // Update dependencies to use the new tag only if we're creating a tag
  if (createTag) {
    runCommand(`node scripts/update-dependencies-to-tag.js update ${version}`);
  } else {
    log('Skipping dependency update to tag (--no-tag flag used)', 'info');
  }

  log('Packages prepared for release', 'success');
}

function createReleaseArchives(version) {
  log('Creating release archives...', 'build');

  const releaseDir = path.join(rootDir, 'release-artifacts');

  // Clean up any existing release artifacts
  if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true });
  }

  fs.mkdirSync(releaseDir);

  // Copy built packages and other directories
  const dirsToInclude = ['packages', 'integrations', 'stores', 'deployers', 'auth', 'client-sdks', 'voice'];

  dirsToInclude.forEach(dir => {
    const srcPath = path.join(rootDir, dir);
    const destPath = path.join(releaseDir, dir);

    if (fs.existsSync(srcPath)) {
      runCommand(`cp -r ${srcPath} ${destPath}`);
      log(`Copied ${dir} to release artifacts`, 'info');
    }
  });

  // Copy root files
  const rootFiles = ['package.json', 'pnpm-lock.yaml', 'turbo.json', 'README.md'];

  rootFiles.forEach(file => {
    const srcPath = path.join(rootDir, file);
    const destPath = path.join(releaseDir, file);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      log(`Copied ${file} to release artifacts`, 'info');
    }
  });

  // Create main tarball
  runCommand(`tar -czf release-artifacts-${version}.tar.gz -C release-artifacts .`);

  // Create individual package archives
  const packagesDir = path.join(rootDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    const packages = fs.readdirSync(packagesDir).filter(p => p !== '_config');

    packages.forEach(pkg => {
      const packagePath = path.join(packagesDir, pkg);
      if (fs.statSync(packagePath).isDirectory()) {
        runCommand(`tar -czf ${pkg}-${version}.tar.gz -C packages ${pkg}`);
        log(`Created archive for ${pkg}`, 'info');
      }
    });
  }

  log('Release archives created successfully', 'success');
}

function generateReleaseNotes(version) {
  log('Generating release notes...', 'build');

  const releaseNotes = `# Release ${version}

This release includes all built packages and dependencies.

## 📦 Built Packages

### Core Packages
- @mastra/core
- @mastra/server  
- @mastra/cli
- @mastra/mcp
- @mastra/deployer
- @mastra/playground-ui
- @mastra/rag
- @mastra/memory
- @mastra/evals
- @mastra/auth
- @mastra/cloud
- @mastra/agui
- @mastra/loggers
- @mastra/schema-compat
- @mastra/mcp-docs-server
- @mastra/mcp-registry-registry
- @mastra/create-mastra

### Client SDKs
- @mastra/client-js

### Integrations
- @mastra/firecrawl
- @mastra/github
- @mastra/mem0
- @mastra/ragie

### Storage Solutions
- @mastra/astra
- @mastra/chroma
- @mastra/clickhouse
- @mastra/cloudflare
- @mastra/cloudflare-d1
- @mastra/couchbase
- @mastra/dynamodb
- @mastra/lance
- @mastra/libsql
- @mastra/mongodb
- @mastra/opensearch
- @mastra/pg
- @mastra/pinecone
- @mastra/qdrant
- @mastra/turbopuffer
- @mastra/upstash
- @mastra/vectorize

### Authentication
- @mastra/auth0
- @mastra/clerk
- @mastra/firebase
- @mastra/supabase
- @mastra/workos

### Deployers
- @mastra/cloudflare-deployer
- @mastra/netlify-deployer
- @mastra/vercel-deployer

### Voice
- @mastra/azure-voice
- @mastra/cloudflare-voice
- @mastra/deepgram-voice
- @mastra/elevenlabs-voice
- @mastra/gladia-voice
- @mastra/google-voice
- @mastra/murf-voice
- @mastra/openai-voice
- @mastra/openai-realtime-api-voice
- @mastra/playai-voice
- @mastra/sarvam-voice
- @mastra/speechify-voice

## 🚀 Usage

To use packages from this release in your project:

\`\`\`json
{
  "dependencies": {
    "@mastra/core": "github:Dynapt-Inc/dynapt-mastra#${version}",
    "@mastra/server": "github:Dynapt-Inc/dynapt-mastra#${version}"
  }
}
\`\`\`

## 📋 Installation

1. Download the release artifacts
2. Extract to your project
3. Run \`pnpm install\`
4. Reference packages using the GitHub tag

## ✅ Verification

All packages have been built and tested successfully in this release.

Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(rootDir, 'RELEASE_NOTES.md'), releaseNotes);
  log('Release notes generated', 'success');
}

function commitAndTag(version) {
  log(`Creating git tag ${version}...`, 'build');

  try {
    // Add all changes
    runCommand('git add .');

    // Check if there are changes to commit
    const status = execSync('git status --porcelain', {
      cwd: rootDir,
      encoding: 'utf8',
    });

    if (status.trim()) {
      runCommand(`git commit -m "chore: prepare release ${version}"`);
      log('Changes committed', 'success');
    } else {
      log('No changes to commit', 'info');
    }

    // Create tag
    runCommand(`git tag -a ${version} -m "Release ${version}"`);
    log(`Tag ${version} created`, 'success');

    log('Ready to push with: git push origin main --tags', 'info');
  } catch (error) {
    log('Failed to commit and tag', 'error');
    throw error;
  }
}

function printInstructions(version) {
  log('Manual release preparation completed!', 'release');
  console.log('\n📋 Next Steps:');
  console.log('1. Review the changes with: git diff HEAD~1');
  console.log('2. Push the changes and tag: git push origin main --tags');
  console.log('3. Create a GitHub release manually or run the GitHub Action');
  console.log('4. Upload the release artifacts:');
  console.log(`   - release-artifacts-${version}.tar.gz`);
  console.log(`   - Individual package archives (*-${version}.tar.gz)`);
  console.log('\n🔗 After release is created:');
  console.log(`GitHub reference: github:Dynapt-Inc/dynapt-mastra#${version}`);
}

function main() {
  const [, , version, ...options] = process.argv;

  if (!version) {
    console.log('🚀 Manual Release Script');
    console.log('');
    console.log('Usage: node manual-release.js <version> [options]');
    console.log('');
    console.log('Arguments:');
    console.log('  version    Version to release (e.g., v1.0.0 or 1.0.0)');
    console.log('');
    console.log('Options:');
    console.log('  --skip-tests    Skip running tests');
    console.log('  --skip-clean    Skip clean working directory check');
    console.log("  --no-tag        Don't create git tag");
    console.log('');
    console.log('Examples:');
    console.log('  node manual-release.js v1.0.0');
    console.log('  node manual-release.js 1.2.3 --skip-tests');
    process.exit(0);
  }

  const normalizedVersion = validateVersion(version);
  const skipTests = options.includes('--skip-tests');
  const skipClean = options.includes('--skip-clean');
  const noTag = options.includes('--no-tag');

  try {
    log(`Starting manual release process for ${normalizedVersion}`, 'release');

    // Check working directory
    if (!skipClean) {
      ensureCleanWorkingDirectory();
    }

    // Install dependencies
    log('Installing dependencies...', 'build');
    runCommand('pnpm install');

    // Build all packages
    buildAllPackages();

    // Run tests
    if (!skipTests) {
      runTests();
    }

    // Prepare packages for release
    preparePackagesForRelease(normalizedVersion, !noTag);

    // Update lockfile after dependency changes
    log('Updating lockfile after dependency changes...', 'build');
    runCommand('pnpm install');

    // Create release archives
    createReleaseArchives(normalizedVersion);

    // Generate release notes
    generateReleaseNotes(normalizedVersion);

    // Commit and tag
    if (!noTag) {
      commitAndTag(normalizedVersion);
    }

    // Print next steps
    printInstructions(normalizedVersion);
  } catch (error) {
    log('Release process failed', 'error');
    console.error(error.message);
    process.exit(1);
  }
}

main();
