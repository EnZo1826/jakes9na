#!/usr/bin/env node
/**
 * Prints the representative Lighthouse CI run (category scores + LCP, CLS,
 * TBT) as a Markdown table, and appends it to $GITHUB_STEP_SUMMARY when run
 * in Actions. Report only: never fails on low scores, only on a missing
 * report. Reads the `lhci upload --target=filesystem` output directory.
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const reportDir = path.resolve(process.argv[2] ?? 'lighthouse-report');
const manifestPath = path.join(reportDir, 'manifest.json');
if (!existsSync(manifestPath)) {
  console.error(`✖ ${manifestPath} not found — did "lhci collect" + "lhci upload" run?`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
const rows = [];
for (const run of manifest.filter((entry) => entry.isRepresentativeRun)) {
  const lhr = JSON.parse(readFileSync(run.jsonPath, 'utf-8'));
  const score = (id) => Math.round((lhr.categories[id]?.score ?? 0) * 100);
  const audit = (id) => lhr.audits[id]?.displayValue ?? 'n/a';
  rows.push(
    `| ${run.url} | ${score('performance')} | ${score('accessibility')} | ${score('best-practices')} | ${score('seo')} | ${audit('largest-contentful-paint')} | ${audit('cumulative-layout-shift')} | ${audit('total-blocking-time')} |`,
  );
}

const table = [
  `### Lighthouse (representative of ${manifest.length} run(s), mobile emulation, report only)`,
  '',
  '| URL | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |',
  '|---|---|---|---|---|---|---|---|',
  ...rows,
  '',
].join('\n');

console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${table}\n`);
