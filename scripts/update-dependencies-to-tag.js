#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function updatePackageJson(filePath, targetTag, repo = 'Dynapt-Inc/dynapt-mastra') {
  if (!fs.existsSync(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  const pkg = JSON.parse(content);
  let modified = false;

  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach(name => {
        const currentValue = pkg[depType][name];
        if (currentValue.includes(`github:${repo}#main`)) {
          pkg[depType][name] = `github:${repo}#${targetTag}`;
          modified = true;
          console.log(`✅ Updated ${name} in ${filePath}: ${currentValue} → ${pkg[depType][name]}`);
        } else if (currentValue.includes(`github:${repo}#`) && !currentValue.includes(`#${targetTag}`)) {
          pkg[depType][name] = `github:${repo}#${targetTag}`;
          modified = true;
          console.log(`✅ Updated ${name} in ${filePath}: ${currentValue} → ${pkg[depType][name]}`);
        }
      });
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
    return true;
  }

  return false;
}

function updateAllPackages(targetTag, repo = 'Dynapt-Inc/dynapt-mastra') {
  console.log(`🔄 Updating all dependencies to use tag: ${targetTag}\n`);

  let totalUpdated = 0;

  // Update packages directory
  const packagesDir = path.join(rootDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    const packages = fs.readdirSync(packagesDir).filter(p => p !== '_config');
    packages.forEach(pkg => {
      const packageJsonPath = path.join(packagesDir, pkg, 'package.json');
      if (updatePackageJson(packageJsonPath, targetTag, repo)) {
        totalUpdated++;
      }
    });
  }

  // Update other directories
  const otherDirs = ['integrations', 'stores', 'deployers', 'auth', 'client-sdks', 'voice'];
  otherDirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      const packages = fs.readdirSync(dirPath);
      packages.forEach(pkg => {
        const packageJsonPath = path.join(dirPath, pkg, 'package.json');
        if (updatePackageJson(packageJsonPath, targetTag, repo)) {
          totalUpdated++;
        }
      });
    }
  });

  console.log(`\n🎉 Updated ${totalUpdated} packages to use tag: ${targetTag}`);
}

function listCurrentDependencies(repo = 'Dynapt-Inc/dynapt-mastra') {
  console.log(`📋 Current GitHub dependencies for ${repo}:\n`);

  const dirs = ['packages', 'integrations', 'stores', 'deployers', 'auth', 'client-sdks', 'voice'];

  dirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      const packages = fs.readdirSync(dirPath);
      packages.forEach(pkg => {
        const packageJsonPath = path.join(dirPath, pkg, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const content = fs.readFileSync(packageJsonPath, 'utf8');
          const packageJson = JSON.parse(content);

          ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
            if (packageJson[depType]) {
              Object.entries(packageJson[depType]).forEach(([name, version]) => {
                if (version.includes(`github:${repo}`)) {
                  console.log(`  ${packageJson.name} → ${name}: ${version}`);
                }
              });
            }
          });
        }
      });
    }
  });
}

function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'update':
      const targetTag = args[0];
      const repo = args[1] || 'Dynapt-Inc/dynapt-mastra';

      if (!targetTag) {
        console.error('❌ Please provide a target tag');
        console.error('Usage: node update-dependencies-to-tag.js update <tag> [repo]');
        console.error('Example: node update-dependencies-to-tag.js update v1.0.0');
        process.exit(1);
      }

      updateAllPackages(targetTag, repo);
      break;

    case 'list':
      const listRepo = args[0] || 'Dynapt-Inc/dynapt-mastra';
      listCurrentDependencies(listRepo);
      break;

    default:
      console.log('🔧 Dependency Management Script');
      console.log('');
      console.log('Commands:');
      console.log('  update <tag> [repo]  - Update all dependencies to use specified tag');
      console.log('  list [repo]          - List current GitHub dependencies');
      console.log('');
      console.log('Examples:');
      console.log('  node update-dependencies-to-tag.js update v1.0.0');
      console.log('  node update-dependencies-to-tag.js update main');
      console.log('  node update-dependencies-to-tag.js list');
      break;
  }
}

main();
