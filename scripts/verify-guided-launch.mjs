#!/usr/bin/env node
/**
 * Structural launch verification: bundle observables + store-derived flag smoke.
 * Run after build:web — output captured to scratch by harness.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(root, 'dist/assets');
const indexHtml = join(root, 'dist/index.html');

const requiredTestIds = [
  'guided-process-screen',
  'project-progress-screen',
  'progress-flag-list',
  'progress-attention-banner',
  'guided-progress-link',
];
const requiredPatterns = ['progress-flag-${', 'progress-overall-fill'];

let jsBundle = '';
if (existsSync(assetsDir)) {
  const jsFile = readdirSync(assetsDir).find((f) => f.startsWith('index-') && f.endsWith('.js'));
  if (jsFile) {
    jsBundle = readFileSync(join(assetsDir, jsFile), 'utf8');
  }
}

const lines = [];
lines.push('=== verify-guided-launch.mjs ===');
lines.push(`index.html exists: ${existsSync(indexHtml)}`);
lines.push(`bundle chars: ${jsBundle.length}`);

let allPresent = true;
for (const id of requiredTestIds) {
  const found = jsBundle.includes(id);
  lines.push(`testID "${id}": ${found ? 'PRESENT' : 'MISSING'}`);
  if (!found) allPresent = false;
}
for (const pat of requiredPatterns) {
  const found = jsBundle.includes(pat);
  lines.push(`pattern "${pat}": ${found ? 'PRESENT' : 'MISSING'}`);
  if (!found) allPresent = false;
}

lines.push(`all observables present: ${allPresent}`);
lines.push('DONE');
console.log(lines.join('\n'));
process.exit(allPresent ? 0 : 1);