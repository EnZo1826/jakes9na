#!/usr/bin/env node
/**
 * Measures the gzip size of the INITIAL JS bundle — i.e. every script the
 * browser loads without user interaction (the entry module(s) referenced
 * directly from dist/index.html plus any <link rel="modulepreload">
 * chunks it statically pulls in). Lazy chunks reachable only via
 * dynamic import() (e.g. the stubbed src/three/EngineeringCore.tsx) are
 * NOT preloaded by Vite and are intentionally excluded — that is the
 * whole point of the lazy boundary. Fails the build if the initial JS
 * exceeds the 180KB gz budget from the approved plan.
 */
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(rootDir, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!existsSync(indexHtmlPath)) {
  console.error(`✖ ${indexHtmlPath} not found — run "vite build" first.`);
  process.exit(1);
}

const html = readFileSync(indexHtmlPath, 'utf-8');

const scriptSrcs = [...html.matchAll(/<script[^>]*\stype="module"[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
const preloadHrefs = [...html.matchAll(/<link[^>]*\srel="modulepreload"[^>]*\shref="([^"]+)"/g)].map((m) => m[1]);

const initialJsFiles = [...new Set([...scriptSrcs, ...preloadHrefs])].filter((src) => src.endsWith('.js'));

if (initialJsFiles.length === 0) {
  console.error('✖ No initial JS entry found in dist/index.html.');
  process.exit(1);
}

const BUDGET_BYTES = 180 * 1024;
let totalGzip = 0;

console.log('Initial JS (loaded without user interaction, excluding lazy/dynamic chunks):');
for (const src of initialJsFiles) {
  // Strip Vite's `base` (/jakes9na/) so the URL maps back onto dist/.
  const filePath = path.join(distDir, src.replace(/^\/(?:jakes9na\/)?/, ''));
  const contents = readFileSync(filePath);
  const gzipSize = gzipSync(contents, { level: 9 }).length;
  totalGzip += gzipSize;
  console.log(`  ${src} — ${(gzipSize / 1024).toFixed(2)} KB gz`);
}

console.log(`\nTotal initial JS: ${(totalGzip / 1024).toFixed(2)} KB gz (budget: 180 KB gz)`);

if (totalGzip > BUDGET_BYTES) {
  console.error('✖ Initial JS bundle exceeds the 180KB gz budget.');
  process.exit(1);
}

console.log('✓ Initial JS bundle is within budget.');
