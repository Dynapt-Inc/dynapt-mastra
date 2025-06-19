# Release Process Guide

This document outlines the CI/CD pipeline and release process for the Mastra monorepo.

## 📋 Overview

The repository supports both automated and manual release processes:

1. **Automated CI/CD Pipeline** - GitHub Actions workflow that builds, tests, and creates releases
2. **Manual Release Process** - Local scripts for manual releases
3. **Dependency Management** - Tools to update internal dependencies to use release tags

## 🚀 Automated Release Process (Recommended)

### Using the GitHub Actions Workflow

The automated release process is handled by the `Build and Release` workflow (`.github/workflows/build-and-release.yml`).

#### Triggering a Release

**Option 1: Manual Trigger**

1. Go to the Actions tab in your GitHub repository
2. Select "Build and Release" workflow
3. Click "Run workflow"
4. Enter the version (e.g., `v1.0.0`)
5. Choose whether it's a prerelease
6. Click "Run workflow"

**Option 2: Git Tag**

1. Create and push a git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. The workflow will automatically trigger

#### What the Workflow Does

1. **Environment Setup**

   - Checks out the repository
   - Sets up Node.js and pnpm
   - Installs dependencies

2. **Build Process**

   - Builds all packages: `pnpm run build:packages`
   - Builds integrations, stores, deployers, auth, and clients
   - Runs the test suite

3. **Release Preparation**

   - Prepares packages for GitHub distribution
   - Updates internal dependencies to use the new tag
   - Creates release artifacts and archives

4. **GitHub Release**

   - Creates a comprehensive GitHub release
   - Uploads all built artifacts
   - Generates detailed release notes

5. **Dependency Updates**
   - Creates a PR to update dependencies to use the new release tag
   - Updates all internal `github:Dynapt-Inc/dynapt-mastra#main` references

## 🔧 Manual Release Process

### Prerequisites

- Clean git working directory
- Node.js 20.x
- pnpm installed
- Git configured for commits

### Running a Manual Release

```bash
# Basic release
node scripts/manual-release.js v1.0.0

# Skip tests (faster, but not recommended)
node scripts/manual-release.js v1.0.0 --skip-tests

# Don't create git tag (for testing)
node scripts/manual-release.js v1.0.0 --no-tag

# Skip clean directory check
node scripts/manual-release.js v1.0.0 --skip-clean
```

### Manual Release Steps

The script performs these steps:

1. **Validation**

   - Validates version format
   - Checks for clean working directory
   - Installs dependencies

2. **Build**

   - Runs all build commands
   - Executes test suite
   - Validates all packages build successfully

3. **Package Preparation**

   - Updates package.json files for GitHub distribution
   - Updates internal dependencies to use the new tag

4. **Archive Creation**

   - Creates `release-artifacts-{version}.tar.gz` with all built packages
   - Creates individual package archives
   - Generates comprehensive release notes

5. **Git Operations**
   - Commits all changes
   - Creates annotated git tag
   - Provides instructions for pushing

## 🔄 Dependency Management

### Current Dependency Pattern

Internal packages currently reference each other using:

```json
{
  "dependencies": {
    "@mastra/core": "github:Dynapt-Inc/dynapt-mastra#main"
  }
}
```

### Updating Dependencies to Release Tags

**Update all dependencies to a specific tag:**

```bash
node scripts/update-dependencies-to-tag.js update v1.0.0
```

**List current GitHub dependencies:**

```bash
node scripts/update-dependencies-to-tag.js list
```

**Update dependencies for a different repository:**

```bash
node scripts/update-dependencies-to-tag.js update v1.0.0 your-org/your-repo
```

### After Release - Using Tagged Dependencies

Once a release is created, update your projects to use the tagged version:

```json
{
  "dependencies": {
    "@mastra/core": "github:Dynapt-Inc/dynapt-mastra#v1.0.0",
    "@mastra/server": "github:Dynapt-Inc/dynapt-mastra#v1.0.0",
    "@mastra/cli": "github:Dynapt-Inc/dynapt-mastra#v1.0.0"
  }
}
```

## 📦 Release Contents

Each release includes:

### Core Packages

- `@mastra/core` - Core framework functionality
- `@mastra/server` - Server implementation
- `@mastra/cli` - Command line interface
- `@mastra/mcp` - MCP (Message Control Protocol) support
- `@mastra/deployer` - Deployment utilities
- `@mastra/playground-ui` - Playground UI components
- `@mastra/rag` - RAG (Retrieval Augmented Generation) support
- `@mastra/memory` - Memory management
- `@mastra/evals` - Evaluation framework
- `@mastra/auth` - Authentication utilities
- `@mastra/agui` - Agent UI components
- `@mastra/loggers` - Logging utilities
- `@mastra/schema-compat` - Schema compatibility layer
- `@mastra/create-mastra` - Project scaffolding

### Client SDKs

- `@mastra/client-js` - JavaScript client SDK

### Integrations

- `@mastra/firecrawl` - Firecrawl integration
- `@mastra/github` - GitHub integration
- `@mastra/mem0` - Mem0 integration
- `@mastra/ragie` - Ragie integration

### Storage Solutions

- `@mastra/astra` - Astra DB integration
- `@mastra/chroma` - Chroma vector database
- `@mastra/clickhouse` - ClickHouse integration
- `@mastra/cloudflare` - Cloudflare storage
- `@mastra/dynamodb` - DynamoDB integration
- `@mastra/libsql` - LibSQL integration
- `@mastra/mongodb` - MongoDB integration
- `@mastra/pg` - PostgreSQL integration
- `@mastra/pinecone` - Pinecone vector database
- And many more...

### Authentication Providers

- `@mastra/auth0` - Auth0 integration
- `@mastra/clerk` - Clerk integration
- `@mastra/firebase` - Firebase Auth
- `@mastra/supabase` - Supabase Auth
- `@mastra/workos` - WorkOS integration

### Deployers

- `@mastra/cloudflare-deployer` - Cloudflare deployment
- `@mastra/netlify-deployer` - Netlify deployment
- `@mastra/vercel-deployer` - Vercel deployment

### Voice Services

- `@mastra/openai-voice` - OpenAI voice services
- `@mastra/elevenlabs-voice` - ElevenLabs integration
- `@mastra/deepgram-voice` - Deepgram integration
- And many more voice providers...

## 🏷️ Versioning Strategy

### Version Format

- Use semantic versioning: `v{major}.{minor}.{patch}`
- Examples: `v1.0.0`, `v1.2.3`, `v2.0.0-beta.1`

### Release Types

- **Major Release** (`v2.0.0`) - Breaking changes
- **Minor Release** (`v1.1.0`) - New features, backward compatible
- **Patch Release** (`v1.0.1`) - Bug fixes, backward compatible
- **Prerelease** (`v1.0.0-beta.1`) - Testing releases

### Branch Strategy

- `main` - Production-ready code
- Release tags point to specific commits on `main`
- Dependencies updated via PRs after releases

## 🔍 Troubleshooting

### Common Issues

**Build Failures**

- Ensure all dependencies are installed: `pnpm install`
- Check TypeScript errors: `pnpm typecheck`
- Verify tests pass: `pnpm test`

**Dependency Issues**

- Use `pnpm install --shamefully-hoist` if needed
- Clear node_modules and reinstall
- Check for conflicting versions

**Lockfile Mismatch Error**

If you see: `ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile"`

This happens when package.json files have GitHub dependencies but the lockfile has workspace dependencies. Fix with:

```bash
# Restore workspace dependencies
pnpm release:restore

# Or manually
node scripts/restore-workspace.js restore
```

**Git Issues**

- Ensure working directory is clean
- Check git configuration for commits
- Verify GitHub token permissions for releases

### Getting Help

1. Check the workflow logs in GitHub Actions
2. Run the manual release script with verbose output
3. Use the dependency management script to debug references
4. Review the existing releases for patterns

## 📋 Quick Reference

### Commands

```bash
# Automated release (GitHub Actions)
# Go to Actions → Build and Release → Run workflow

# Manual release
node scripts/manual-release.js v1.0.0

# Update dependencies
node scripts/update-dependencies-to-tag.js update v1.0.0

# List dependencies
node scripts/update-dependencies-to-tag.js list

# Build all packages
pnpm run build:packages

# Restore workspace after failed release
pnpm release:restore

# Clean up release artifacts
pnpm release:clean
```

### Key Files

- `.github/workflows/build-and-release.yml` - Main CI/CD workflow
- `scripts/manual-release.js` - Manual release script
- `scripts/update-dependencies-to-tag.js` - Dependency management
- `scripts/prepare-github-release.js` - Package preparation
- `package.json` - Root package with build scripts

---

This process ensures consistent, reliable releases with proper dependency management and comprehensive testing.
