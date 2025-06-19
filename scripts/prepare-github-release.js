#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.join(__dirname, '..', 'packages');

// Get version mappings from workspace packages
function getWorkspaceVersions() {
  const versions = {};

  const packages = fs
    .readdirSync(packagesDir)
    .filter(p => p !== '_config')
    .map(p => path.join(packagesDir, p))
    .filter(p => fs.statSync(p).isDirectory());

  for (const packagePath of packages) {
    const packageJsonPath = path.join(packagePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      versions[packageJson.name] = packageJson.version;
    }
  }

  return versions;
}

// Replace workspace dependencies with GitHub references
function updatePackageForGithub(packagePath, workspaceVersions, githubRepo) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let modified = false;

  // Function to update dependencies
  const updateDeps = deps => {
    if (!deps) return;

    for (const [name, version] of Object.entries(deps)) {
      if (version.startsWith('workspace:')) {
        if (name === '@internal/lint') {
          // Remove internal lint dependency for external consumption
          delete deps[name];
          modified = true;
        } else if (workspaceVersions[name]) {
          // Replace with GitHub reference
          deps[name] = `github:${githubRepo}#main`;
          modified = true;
        }
      }
    }
  };

  // Update all dependency types
  updateDeps(packageJson.dependencies);
  updateDeps(packageJson.devDependencies);
  updateDeps(packageJson.peerDependencies);

  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated ${packageJson.name}`);
  }
}

function main() {
  const githubRepo = process.argv[2] || 'Dynapt-Inc/dynapt-mastra';

  console.log(`🔧 Preparing packages for GitHub release: ${githubRepo}\n`);

  const workspaceVersions = getWorkspaceVersions();
  console.log('📦 Found workspace packages:');
  Object.entries(workspaceVersions).forEach(([name, version]) => {
    console.log(`  • ${name}@${version}`);
  });
  console.log();

  const packages = fs
    .readdirSync(packagesDir)
    .filter(p => p !== '_config')
    .map(p => path.join(packagesDir, p))
    .filter(p => fs.statSync(p).isDirectory());

  packages.forEach(packagePath => {
    updatePackageForGithub(packagePath, workspaceVersions, githubRepo);
  });

  console.log('\n🎉 All packages prepared for GitHub distribution!');
  console.log('\n📝 Next steps:');
  console.log('1. Commit and push to GitHub');
  console.log('2. Reference individual packages in your project:');
  console.log('\n```json');
  console.log('{');
  console.log('  "dependencies": {');
  console.log(`    "@mastra/core": "github:${githubRepo}#main",`);
  console.log(`    "@mastra/server": "github:${githubRepo}#main"`);
  console.log('  }');
  console.log('}');
  console.log('```');
}

main();
