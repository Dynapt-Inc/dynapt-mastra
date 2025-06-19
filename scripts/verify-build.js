#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packagesDir = path.join(__dirname, '..', 'packages');
const excludedPackages = ['_config']; // Packages that shouldn't have dist

function checkPackageBuild(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const distPath = path.join(packagePath, 'dist');

  if (!fs.existsSync(packageJsonPath)) {
    return { name: path.basename(packagePath), status: 'no-package-json' };
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const packageName = packageJson.name;

  if (!fs.existsSync(distPath)) {
    return { name: packageName, status: 'no-dist' };
  }

  const distFiles = fs.readdirSync(distPath);
  const hasJs = distFiles.some(f => f.endsWith('.js'));
  const hasCjs = distFiles.some(f => f.endsWith('.cjs'));
  const hasDts = distFiles.some(f => f.endsWith('.d.ts'));

  return {
    name: packageName,
    status: 'built',
    formats: {
      esm: hasJs,
      cjs: hasCjs,
      types: hasDts,
    },
    fileCount: distFiles.length,
  };
}

function main() {
  console.log('🔍 Verifying Mastra package builds...\n');

  const packages = fs
    .readdirSync(packagesDir)
    .filter(p => !excludedPackages.includes(p))
    .map(p => path.join(packagesDir, p))
    .filter(p => fs.statSync(p).isDirectory());

  const results = packages.map(checkPackageBuild);

  const built = results.filter(r => r.status === 'built');
  const failed = results.filter(r => r.status !== 'built');

  console.log('✅ Successfully built packages:');
  built.forEach(pkg => {
    const formats = Object.entries(pkg.formats)
      .filter(([_, has]) => has)
      .map(([format]) => format)
      .join(', ');
    console.log(`  • ${pkg.name} (${formats}) - ${pkg.fileCount} files`);
  });

  if (failed.length > 0) {
    console.log('\n❌ Failed/Missing builds:');
    failed.forEach(pkg => {
      console.log(`  • ${pkg.name}: ${pkg.status}`);
    });
  }

  console.log(`\n📊 Summary: ${built.length} built, ${failed.length} failed`);

  if (failed.length > 0) {
    console.log('\n💡 To fix failed builds, run: pnpm build');
    process.exit(1);
  } else {
    console.log('\n🎉 All packages built successfully!');
  }
}

main();
