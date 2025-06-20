#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function checkPublishedPackages() {
  console.log('🔍 Checking published packages...\n');

  // Get all package.json files in the workspace
  const workspacePackages = [];

  function findPackages(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        const fullPath = path.join(dir, entry.name);
        const packageJsonPath = path.join(fullPath, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.name && packageJson.name.startsWith('@caleblawson')) {
              workspacePackages.push({
                name: packageJson.name,
                version: packageJson.version,
                path: fullPath,
                private: packageJson.private,
              });
            }
          } catch (e) {
            // Skip invalid package.json files
          }
        }

        // Recursively search subdirectories
        findPackages(fullPath);
      }
    }
  }

  findPackages('.');

  console.log(`Found ${workspacePackages.length} @caleblawson packages in workspace\n`);

  const published = [];
  const notPublished = [];

  for (const pkg of workspacePackages) {
    if (pkg.private) {
      console.log(`⏭️  ${pkg.name} (private - skipping)`);
      continue;
    }

    try {
      execSync(`npm view ${pkg.name} version`, { stdio: 'pipe' });
      console.log(`✅ ${pkg.name}`);
      published.push(pkg);
    } catch (error) {
      console.log(`❌ ${pkg.name}`);
      notPublished.push(pkg);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Published: ${published.length}`);
  console.log(`❌ Not Published: ${notPublished.length}`);

  if (notPublished.length > 0) {
    console.log(`\n📝 Packages still need to be published:`);
    notPublished.forEach(pkg => {
      console.log(`   ${pkg.name} (${pkg.path})`);
    });

    console.log(`\n🚀 To publish remaining packages:`);
    console.log(`pnpm -r --filter "${notPublished.map(p => p.name).join('" --filter "')}" publish --access public`);

    console.log(`\n📁 Or publish by directory:`);
    notPublished.forEach(pkg => {
      console.log(`cd ${pkg.path} && npm publish --access public`);
    });
  } else {
    console.log(`\n🎉 All packages are published!`);
  }
}

checkPublishedPackages().catch(console.error);
