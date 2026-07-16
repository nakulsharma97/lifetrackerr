#!/usr/bin/env node
/**
 * Push files to GitHub using the REST API (no git binary needed)
 * Run: GITHUB_TOKEN=ghp_xxx GITHUB_REPO=user/repo node github-push.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = process.env.GITHUB_REPO || ''; // e.g. "user/repo"
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const COMMIT_MSG = process.env.COMMIT_MSG || 'Add loading skeletons, error states, and form submitting UX';

const API = 'https://api.github.com';

function github(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: url,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'life-tracker-push',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${json.message || data}`));
          } else {
            resolve(json);
          }
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Get all files recursively, respecting .gitignore patterns
function getFiles(dir, prefix = '') {
  const files = [];
  const ignoreDirs = new Set(['.git', 'node_modules', 'dist', 'target', '.vite']);
  const ignoreFiles = new Set(['.DS_Store', 'Thumbs.db']);

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (ignoreDirs.has(entry.name) || entry.name.startsWith('.env')) continue;
    if (relPath.startsWith('frontend/node_modules/')) continue;
    if (relPath.startsWith('backend/target/')) continue;
    if (ignoreFiles.has(entry.name)) continue;

    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath, relPath));
    } else {
      files.push({ path: relPath, fullPath });
    }
  }
  return files;
}

async function main() {
  if (!TOKEN || !REPO) {
    console.log('❌ Set GITHUB_TOKEN and GITHUB_REPO (format: user/repo)');
    process.exit(1);
  }

  console.log(`📦 Pushing to ${REPO}/${BRANCH}...\n`);

  // 1. Get all local files
  const projectRoot = path.resolve(__dirname, '..');
  const files = getFiles(projectRoot);
  console.log(`📝 Found ${files.length} files to upload\n`);

  // 2. Get latest commit SHA from the branch
  let latestCommitSha;
  try {
    const refData = await github('GET', `/repos/${REPO}/git/ref/heads/${BRANCH}`);
    latestCommitSha = refData.object.sha;
    console.log(`🔍 Latest commit: ${latestCommitSha.slice(0, 8)}`);
  } catch (err) {
    // Branch might not exist yet
    try {
      const masterData = await github('GET', `/repos/${REPO}/git/ref/heads/master`);
      latestCommitSha = masterData.object.sha;
      console.log(`🔍 Using master branch: ${latestCommitSha.slice(0, 8)}`);
    } catch {
      console.log('📦 No existing commits found, creating initial commit');
      latestCommitSha = null;
    }
  }

  // 3. If we have an existing commit, get its tree SHA
  let baseTreeSha = null;
  if (latestCommitSha) {
    const commitData = await github('GET', `/repos/${REPO}/git/commits/${latestCommitSha}`);
    baseTreeSha = commitData.tree.sha;
  }

  // 4. Create blobs for all files and build tree entries
  console.log('☁️  Uploading files to GitHub...\n');
  const treeEntries = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const content = fs.readFileSync(file.fullPath);
    const isBinary = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'].some(ext => file.path.endsWith(ext));

    let blobSha;
    if (isBinary) {
      // Base64 encode binary files
      const b64 = content.toString('base64');
      const blob = await github('POST', `/repos/${REPO}/git/blobs`, {
        content: b64,
        encoding: 'base64',
      });
      blobSha = blob.sha;
    } else {
      // Text files - UTF-8
      const text = content.toString('utf-8');
      const blob = await github('POST', `/repos/${REPO}/git/blobs`, {
        content: text,
        encoding: 'utf-8',
      });
      blobSha = blob.sha;
    }

    treeEntries.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blobSha,
    });

    const pct = Math.round(((i + 1) / files.length) * 100);
    process.stdout.write(`\r   [${'█'.repeat(Math.floor(pct / 5))}${'░'.repeat(20 - Math.floor(pct / 5))}] ${pct}% (${i + 1}/${files.length})`);
  }

  console.log('\n');

  // 5. Create a new tree
  console.log('🌳 Creating tree...');
  const newTree = await github('POST', `/repos/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: treeEntries,
  });
  console.log(`   ✅ Tree: ${newTree.sha.slice(0, 8)}`);

  // 6. Create a commit
  console.log('💾 Creating commit...');
  const commit = await github('POST', `/repos/${REPO}/git/commits`, {
    message: COMMIT_MSG,
    tree: newTree.sha,
    parents: latestCommitSha ? [latestCommitSha] : [],
    author: {
      name: 'LifeTracker Bot',
      email: 'bot@lifetracker.app',
    },
  });
  console.log(`   ✅ Commit: ${commit.sha.slice(0, 8)}`);

  // 7. Update branch reference
  console.log('☁️  Updating branch...');
  await github('PATCH', `/repos/${REPO}/git/refs/heads/${BRANCH}`, {
    sha: commit.sha,
    force: true,
  });
  console.log(`   ✅ Branch ${BRANCH} updated!`);

  console.log('\n✅✅✅ Push successful! 🎉🎉🎉');
  console.log(`   https://github.com/${REPO}`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
