#!/usr/bin/env node
/**
 * Start web (Vite :3000) and backend (Express :4000) together for local demo.
 * Usage: pnpm dev
 */
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

function run(cmd, args, label) {
  const child = spawn(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[dev] ${label} exited with code ${code}`);
      process.exit(code);
    }
  });
  return child;
}

console.log('[dev] Starting Delta web (:3000) + backend (:4000)…');
console.log('[dev] Open http://localhost:3000 — backend health at http://localhost:4000/api/health\n');

const backend = run('node', ['backend/server.js'], 'backend');
const web = run('pnpm', ['web'], 'web');

function shutdown() {
  backend.kill('SIGTERM');
  web.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);