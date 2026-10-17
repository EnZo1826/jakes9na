#!/usr/bin/env node
/**
 * External link check. Collects every http(s) URL from content/*.json, the
 * Markdown docs, index.html and the built dist/*.html, then requests each
 * one (HEAD, falling back to GET). Fails on 4xx/5xx, DNS or timeout errors.
 *
 * Some hosts refuse anonymous bots (LinkedIn answers 999); those are listed
 * in BOT_BLOCKED and only reported, never failed. URLs on the site's own
 * future GitHub Pages origin are skipped because they 404 until Pages is enabled with owner approval.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BOT_BLOCKED = new Set(['www.linkedin.com', 'linkedin.com']);
const SKIP_PREFIXES = ['https://enzo1826.github.io/jakes9na'];
const SKIP_HOSTS = new Set(['localhost', 'www.w3.org', 'www.sitemaps.org', 'json-schema.org']);
const URL_RE = /https?:\/\/[^\s"'<>()`\\]+/g;

const listDir = (dir, re) =>
  existsSync(path.join(rootDir, dir))
    ? readdirSync(path.join(rootDir, dir)).filter((f) => re.test(f)).map((f) => path.join(dir, f))
    : [];

const sources = [
  ...listDir('content', /\.json$/),
  ...listDir('.', /\.md$/),
  'index.html',
  ...listDir('dist', /\.html$/),
].filter((f) => existsSync(path.join(rootDir, f)));

const urls = new Map();
for (const file of sources) {
  for (const match of readFileSync(path.join(rootDir, file), 'utf-8').matchAll(URL_RE)) {
    const url = match[0].replace(/[.,;:]+$/, '');
    if (!urls.has(url)) urls.set(url, file);
  }
}

async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        headers: { 'User-Agent': 'jakes9na-link-check' },
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok || method === 'GET') return { status: response.status };
    } catch (error) {
      if (method === 'GET') return { error: error.cause?.code ?? error.message };
    }
  }
  return { error: 'unreachable' };
}

let failures = 0;
let checked = 0;
for (const [url, file] of urls) {
  const { hostname } = new URL(url);
  if (SKIP_HOSTS.has(hostname) || SKIP_PREFIXES.some((p) => url.startsWith(p))) continue;
  const result = await probe(url);
  checked += 1;
  const ok = result.status !== undefined && result.status < 400;
  if (ok) {
    console.log(`✓ ${result.status} ${url}`);
  } else if (BOT_BLOCKED.has(hostname)) {
    console.log(`~ ${result.status ?? result.error} ${url} (host blocks bots; reported only)`);
  } else {
    failures += 1;
    console.error(`✖ ${result.status ?? result.error} ${url} (from ${file})`);
  }
}

console.log(`\n${checked} external link(s) checked, ${failures} broken.`);
process.exit(failures > 0 ? 1 : 0);
