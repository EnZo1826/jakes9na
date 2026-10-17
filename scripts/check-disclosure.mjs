#!/usr/bin/env node
/**
 * Disclosure check: fails if a tracked file, a generated build file or a
 * commit message contains an IPv4 address, an internal-looking hostname or,
 * when --names-file is given, one of the names in that file.
 *
 * The name list is never stored in this repo. Maintainers keep it in a file
 * outside the repo (one name per line, `#` for comments) and run the name
 * check locally before each push. Matching is case-insensitive, and a space
 * in a name also matches `-`, `_`, `.` or no separator. CI runs without the
 * file, so it checks IPv4 addresses and hostnames only.
 *
 * Usage:
 *   node scripts/check-disclosure.mjs                    # all git-tracked files
 *   node scripts/check-disclosure.mjs --dir dist         # also scan a build dir
 *   node scripts/check-disclosure.mjs --commits A..B     # also scan commit messages
 *   node scripts/check-disclosure.mjs --names-file FILE  # also check names
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Lockfiles and binaries carry third-party strings we don't author.
const SKIP_FILES = new Set(['package-lock.json']);
const TEXT_EXT = /\.(md|json|ts|tsx|js|mjs|cjs|jsx|html|css|svg|txt|xml|yml|yaml|webmanifest)$|^\.gitignore$/i;
const BUILD_TEXT_EXT = /\.(html|json|svg|txt|xml|webmanifest)$/i;
const IPV4 = /(?<![\d.])(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)(?![\d.])/g;
const INTERNAL_HOST = /\b[a-z0-9][a-z0-9-]*\.(?:lan|internal|intranet|corp|home\.arpa)\b/gi;

const args = process.argv.slice(2);
const extraDirs = [];
let commitRange = null;
let namesFile = null;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--dir') extraDirs.push(args[++i]);
  else if (args[i] === '--commits') commitRange = args[++i];
  else if (args[i] === '--names-file') namesFile = args[++i];
}

// Names are reported by line number in the names file, never by value, so
// CI logs and terminal output don't repeat them.
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let namePatterns = [];
if (namesFile) {
  if (!existsSync(namesFile)) {
    console.error(`✖ --names-file not found: ${namesFile}`);
    process.exit(1);
  }
  namePatterns = readFileSync(namesFile, 'utf-8')
    .split(/\r?\n/)
    .map((line, index) => ({ name: line.trim(), line: index + 1 }))
    .filter(({ name }) => name && !name.startsWith('#'))
    .map(({ name, line }) => ({
      line,
      pattern: new RegExp(name.split(/\s+/).map(escapeRegExp).join('[\\s._-]*'), 'i'),
    }));
  if (namePatterns.length === 0) {
    console.error(`✖ --names-file has no names: ${namesFile}`);
    process.exit(1);
  }
}

const findings = [];

function scanText(label, text) {
  text.split(/\r?\n/).forEach((line, index) => {
    const where = `${label}:${index + 1}`;
    for (const { line: nameLine, pattern } of namePatterns) {
      if (pattern.test(line)) findings.push(`${where}: name from names file line ${nameLine}`);
    }
    for (const match of line.matchAll(IPV4)) findings.push(`${where}: IPv4 address ${match[0]}`);
    for (const match of line.matchAll(INTERNAL_HOST)) findings.push(`${where}: internal hostname ${match[0]}`);
  });
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: rootDir, encoding: 'utf-8' })
  .split('\0')
  .filter(Boolean);

let fileCount = 0;
for (const file of tracked) {
  // File names are disclosure too, so check every path before filtering.
  scanText(`[path] ${file}`, file);
  if (SKIP_FILES.has(path.basename(file)) || !TEXT_EXT.test(path.basename(file))) continue;
  const full = path.join(rootDir, file);
  if (!existsSync(full)) continue;
  scanText(file, readFileSync(full, 'utf-8'));
  fileCount += 1;
}

for (const dir of extraDirs) {
  const full = path.resolve(rootDir, dir);
  if (!existsSync(full)) {
    findings.push(`--dir ${dir}: not found`);
    continue;
  }
  for (const file of walk(full)) {
    const rel = path.relative(rootDir, file);
    scanText(`[path] ${rel}`, rel);
    // Bundled JS/CSS is minified third-party code whose property names look
    // like hostnames; its sources are already covered by the tracked-file scan.
    if (!BUILD_TEXT_EXT.test(path.basename(file))) continue;
    scanText(rel, readFileSync(file, 'utf-8'));
    fileCount += 1;
  }
}

let commitCount = 0;
if (commitRange) {
  const log = execFileSync('git', ['log', '--format=%H%n%B%x00', commitRange], { cwd: rootDir, encoding: 'utf-8' });
  for (const entry of log.split('\0').map((e) => e.trim()).filter(Boolean)) {
    const [sha, ...body] = entry.split('\n');
    scanText(`[commit ${sha.slice(0, 7)}]`, body.join('\n'));
    commitCount += 1;
  }
}

if (findings.length > 0) {
  console.error(`✖ Disclosure check failed (${findings.length} finding(s)):`);
  for (const finding of findings) console.error(`  ${finding}`);
  process.exit(1);
}
if (!namesFile) console.log('ℹ Name check skipped (no --names-file); IPv4 and hostname checks only.');
const names = namesFile ? `, no match for ${namePatterns.length} name(s)` : '';
console.log(`✓ Disclosure check passed: ${fileCount} file(s), ${commitCount} commit message(s), no IPs or internal hostnames${names}.`);
