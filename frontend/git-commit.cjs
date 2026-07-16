#!/usr/bin/env node
/**
 * Commit & push script using isomorphic-git
 * Run: node git-commit.js
 *
 * Prerequisites:
 * 1. Set GITHUB_TOKEN env var or paste it below
 * 2. Set GITHUB_REPO env var (e.g. "https://github.com/username/repo.git")
 */

const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const REPO_DIR = path.resolve(__dirname, '..'); // project root
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const COMMIT_MSG = process.env.COMMIT_MSG || 'Add loading skeletons, error states, and form submitting UX';

async function main() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.log('\n❌ Missing credentials! Set these env vars OR edit this script:');
    console.log('   export GITHUB_TOKEN=ghp_xxxxxxxxxxxx');
    console.log('   export GITHUB_REPO=https://github.com/username/repo.git\n');
    console.log('   Or run: GITHUB_TOKEN=ghp_xxx GITHUB_REPO=https://github.com/user/repo.git node git-commit.js\n');
    process.exit(1);
  }

  const repoUrl = GITHUB_REPO.replace('https://', `https://x-access-token:${GITHUB_TOKEN}@`);

  try {
    // Check if .git exists
    let isRepo = false;
    try {
      await git.log({ fs, dir: REPO_DIR, depth: 1 });
      isRepo = true;
      console.log('✅ Existing git repo detected');
    } catch {
      console.log('📦 Initializing new git repo...');
      await git.init({ fs, dir: REPO_DIR });
    }

    // Stage all files (recursively)
    console.log('📝 Staging all files...');
    const files = [];
    function walk(dir, relativeDir = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativeDir, entry.name);
        if (entry.name === '.git' || entry.name === 'node_modules' || 
            entry.name === 'dist' || entry.name === 'target' ||
            entry.name.startsWith('.env')) continue;
        if (entry.isDirectory()) {
          walk(fullPath, relPath);
        } else {
          files.push(relPath);
        }
      }
    }
    walk(REPO_DIR);
    
    for (const file of files) {
      await git.add({ fs, dir: REPO_DIR, filepath: file });
    }
    console.log(`   ✅ Staged ${files.length} files`);

    // Commit
    console.log('💾 Creating commit...');
    const sha = await git.commit({
      fs,
      dir: REPO_DIR,
      author: { name: 'LifeTracker Bot', email: 'bot@lifetracker.app' },
      message: COMMIT_MSG,
    });
    console.log(`   ✅ Commit created: ${sha.slice(0, 8)}`);

    // Push
    console.log('☁️  Pushing to GitHub...');
    await git.push({
      fs,
      http,
      dir: REPO_DIR,
      url: GITHUB_REPO,
      onAuth: () => ({ username: 'x-access-token', password: GITHUB_TOKEN }),
      corsProxy: 'https://cors.isomorphic-git.org',
    });
    console.log('   ✅ Push successful! 🎉');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

main();
