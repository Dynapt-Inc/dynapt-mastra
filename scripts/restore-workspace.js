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
    restore: '🔄',
  };
  console.log(`${levels[level]} ${message}`);
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: rootDir,
      encoding: 'utf8',
      ...options,
    });
    return result;
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    throw error;
  }
}

function restorePackageJson(filePath, repo = 'Dynapt-Inc/dynapt-mastra') {
  if (!fs.existsSync(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  const pkg = JSON.parse(content);
  let modified = false;

  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach(name => {
        const currentValue = pkg[depType][name];
        if (currentValue.includes(`github:${repo}#`)) {
          // Convert GitHub reference back to workspace reference
          if (name.startsWith('@mastra/') || name === 'mastra') {
            pkg[depType][name] = 'workspace:*';
            modified = true;
            log(`✅ Restored ${name} in ${filePath}: ${currentValue} → workspace:*`);
          }
        }
      });
    }
  });

  // Restore @internal/lint if it was removed
  if (pkg.devDependencies && !pkg.devDependencies['@internal/lint']) {
    // Check if other packages in the same directory level have it
    const parentDir = path.dirname(filePath);
    const grandParentDir = path.dirname(parentDir);

    // Look for other package.json files to see if they have @internal/lint
    const siblingDirs = fs.readdirSync(grandParentDir).filter(d => {
      const siblingPath = path.join(grandParentDir, d);
      return fs.statSync(siblingPath).isDirectory() && d !== path.basename(parentDir);
    });

    for (const siblingDir of siblingDirs) {
      const siblingPackageJson = path.join(grandParentDir, siblingDir, 'package.json');
      if (fs.existsSync(siblingPackageJson)) {
        const siblingPkg = JSON.parse(fs.readFileSync(siblingPackageJson, 'utf8'));
        if (siblingPkg.devDependencies && siblingPkg.devDependencies['@internal/lint']) {
          pkg.devDependencies['@internal/lint'] = 'workspace:*';
          modified = true;
          log(`✅ Restored @internal/lint in ${filePath}`);
          break;
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
    return true;
  }

  return false;
}

function restoreAllPackages(repo = 'Dynapt-Inc/dynapt-mastra') {
  log(`🔄 Restoring all packages from GitHub references to workspace references...`, 'restore');

  let totalRestored = 0;

  // Restore packages directory
  const packagesDir = path.join(rootDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    const packages = fs.readdirSync(packagesDir).filter(p => p !== '_config');
    packages.forEach(pkg => {
      const packageJsonPath = path.join(packagesDir, pkg, 'package.json');
      if (restorePackageJson(packageJsonPath, repo)) {
        totalRestored++;
      }
    });
  }

  // Restore other directories
  const otherDirs = ['integrations', 'stores', 'deployers', 'auth', 'client-sdks', 'voice'];
  otherDirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      const packages = fs.readdirSync(dirPath);
      packages.forEach(pkg => {
        const packageJsonPath = path.join(dirPath, pkg, 'package.json');
        if (restorePackageJson(packageJsonPath, repo)) {
          totalRestored++;
        }
      });
    }
  });

  log(`🎉 Restored ${totalRestored} packages to workspace references`, 'success');
}

function cleanupReleaseArtifacts() {
  log('Cleaning up release artifacts...', 'restore');

  const artifactsToClean = ['release-artifacts', 'release-artifacts.tar.gz', 'RELEASE_NOTES.md'];

  // Clean up release artifacts
  artifactsToClean.forEach(artifact => {
    const artifactPath = path.join(rootDir, artifact);
    if (fs.existsSync(artifactPath)) {
      if (fs.statSync(artifactPath).isDirectory()) {
        fs.rmSync(artifactPath, { recursive: true });
      } else {
        fs.unlinkSync(artifactPath);
      }
      log(`Removed ${artifact}`, 'info');
    }
  });

  // Clean up package archives
  const files = fs.readdirSync(rootDir);
  files.forEach(file => {
    if (file.match(/.*-v\d+\.\d+\.\d+.*\.tar\.gz$/)) {
      fs.unlinkSync(path.join(rootDir, file));
      log(`Removed ${file}`, 'info');
    }
  });
}

function updateLockfile() {
  log('Updating lockfile...', 'restore');
  try {
    runCommand('pnpm install');
    log('Lockfile updated successfully', 'success');
  } catch (error) {
    log('Failed to update lockfile', 'error');
    throw error;
  }
}

function checkGitStatus() {
  try {
    const status = runCommand('git status --porcelain');
    if (status.trim()) {
      log('Changes detected after restoration:', 'info');
      console.log(status);
      console.log('\nTo commit these changes:');
      console.log('  git add .');
      console.log('  git commit -m "chore: restore workspace dependencies"');
    } else {
      log('No changes detected', 'info');
    }
  } catch (error) {
    log('Could not check git status', 'warning');
  }
}

function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'restore':
      const repo = args[0] || 'Dynapt-Inc/dynapt-mastra';
      try {
        restoreAllPackages(repo);
        cleanupReleaseArtifacts();
        updateLockfile();
        checkGitStatus();
        log('Workspace restored successfully!', 'success');
      } catch (error) {
        log('Restoration failed', 'error');
        console.error(error.message);
        process.exit(1);
      }
      break;

    case 'clean':
      cleanupReleaseArtifacts();
      log('Release artifacts cleaned up', 'success');
      break;

    default:
      console.log('🔄 Workspace Restoration Script');
      console.log('');
      console.log('Commands:');
      console.log('  restore [repo]  - Restore workspace dependencies from GitHub references');
      console.log('  clean           - Clean up release artifacts only');
      console.log('');
      console.log('Examples:');
      console.log('  node restore-workspace.js restore');
      console.log('  node restore-workspace.js restore your-org/your-repo');
      console.log('  node restore-workspace.js clean');
      console.log('');
      console.log('This script helps recover from failed releases by:');
      console.log('- Converting GitHub dependencies back to workspace dependencies');
      console.log('- Cleaning up release artifacts');
      console.log('- Updating the lockfile');
      break;
  }
}

main();
