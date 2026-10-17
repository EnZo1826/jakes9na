#!/usr/bin/env node
/**
 * Build-time GitHub data job. Fetches the public profile of the account in
 * content/profile.json plus the repos listed in content/github-allowlist.json
 * and writes public/data/github.json, which GithubActivity reads at runtime
 * from the same origin. Visitors' browsers never call the GitHub API and no
 * token is ever shipped to the client.
 *
 * Auth: GITHUB_TOKEN from the Actions environment if present (raises the
 * rate limit; read-only public data either way). Never logged.
 *
 * Failure policy: any API error leaves NO github.json behind (the UI then
 * shows its static fallback panel) and exits 0, so a GitHub outage can't
 * block a deploy. Pass --strict to exit 1 instead (the scheduled deploy does,
 * so an outage leaves the last good deploy live). An allow-listed repo that is
 * private, missing, owned by another account, a fork or archived is skipped,
 * not published.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outFile = path.join(rootDir, 'public', 'data', 'github.json');
const strict = process.argv.includes('--strict');
const API = 'https://api.github.com';
const REPO_NAME = /^[A-Za-z0-9._-]{1,100}$/;

const profile = JSON.parse(readFileSync(path.join(rootDir, 'content', 'profile.json'), 'utf-8'));
const allowlist = JSON.parse(readFileSync(path.join(rootDir, 'content', 'github-allowlist.json'), 'utf-8'));
const username = profile.github?.username;

if (!username || !/^[A-Za-z0-9-]{1,39}$/.test(username)) {
  console.error('✖ content/profile.json github.username is missing or invalid.');
  process.exit(1);
}
if (!Array.isArray(allowlist.repos) || allowlist.repos.some((name) => typeof name !== 'string' || !REPO_NAME.test(name))) {
  console.error('✖ content/github-allowlist.json "repos" must be an array of plain repo names.');
  process.exit(1);
}

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'jakes9na-site-build',
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function getJson(urlPath) {
  const response = await fetch(`${API}${urlPath}`, { headers, signal: AbortSignal.timeout(15000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GET ${urlPath} → HTTP ${response.status}`);
  return response.json();
}

function giveUp(message) {
  rmSync(outFile, { force: true });
  console.warn(`⚠ ${message}`);
  console.warn('⚠ github.json not written; the site will show its static fallback panel.');
  process.exit(strict ? 1 : 0);
}

let user;
try {
  user = await getJson(`/users/${username}`);
} catch (error) {
  giveUp(`profile fetch failed: ${error.message}`);
}
if (!user) giveUp(`GitHub user ${username} not found.`);

const repos = [];
for (const name of allowlist.repos) {
  let repo;
  try {
    repo = await getJson(`/repos/${username}/${name}`);
  } catch (error) {
    giveUp(`repo fetch failed for ${name}: ${error.message}`);
  }
  if (
    !repo ||
    repo.private ||
    repo.visibility !== 'public' ||
    repo.owner?.login?.toLowerCase() !== username.toLowerCase()
  ) {
    console.warn(`⚠ skipping ${name}: not a public repo owned by ${username}.`);
    continue;
  }
  if (repo.fork || repo.archived) {
    console.warn(`⚠ skipping ${name}: forks and archived repos are not published.`);
    continue;
  }
  repos.push({
    name: repo.name,
    description: repo.description ?? undefined,
    url: repo.html_url,
    language: repo.language ?? undefined,
  });
}

// Only live API values are published — nothing derived or estimated.
const payload = {
  generated_at: new Date().toISOString(),
  source: `${API}/users/${username}`,
  profile_url: user.html_url,
  stats: {
    public_repos: user.public_repos,
  },
  repos,
};

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`✓ wrote ${path.relative(rootDir, outFile)} (${repos.length} allow-listed repo(s))`);
