#!/usr/bin/env node
/**
 * POST smoke for /api/projects and /api/analyze (guided fields + analysis keys).
 * Requires backend on :4000. Writes to stdout for harness capture.
 */
const BASE = process.env.DELTA_API_URL || 'http://localhost:4000';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const lines = [];
lines.push('=== verify-backend-api.mjs ===');

try {
  const analyze = await post('/api/analyze', {
    prompt: 'Modern kitchen remodel',
    tweaks: { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' },
    imageUri: '/test-images/before-after/before-1.jpg',
  });
  lines.push(`analyze status: ${analyze.status}`);
  lines.push(`analyze roomType: ${analyze.data.roomType || 'MISSING'}`);
  lines.push(`analyze suggestedMaterials: ${(analyze.data.suggestedMaterials || []).length}`);
  lines.push(`analyze success: ${analyze.data.success}`);

  const save = await post('/api/projects', {
    id: 'proj_verify_guided',
    name: 'Verify Guided',
    baseImageUri: '/before.jpg',
    designPrompt: 'Calm kitchen',
    designTweaks: { style: 'Modern', colorPalette: 'Warm', layout: 'Open' },
    hasScheduleBuilt: false,
    versions: [],
    sourcingItems: [],
    laborTasks: [],
  });
  lines.push(`projects POST status: ${save.status}`);
  lines.push(`projects baseImageUri: ${save.data.project?.baseImageUri || 'MISSING'}`);
  lines.push(`projects designPrompt: ${save.data.project?.designPrompt || 'MISSING'}`);

  const getRes = await fetch(`${BASE}/api/projects/proj_verify_guided`);
  const getData = await getRes.json().catch(() => ({}));
  lines.push(`projects GET status: ${getRes.status}`);
  lines.push(`GET designPrompt match: ${getData.project?.designPrompt === 'Calm kitchen'}`);

  const ok =
    analyze.data.success &&
    analyze.data.roomType &&
    save.data.success &&
    save.data.project?.baseImageUri === '/before.jpg' &&
    getData.project?.designPrompt === 'Calm kitchen';

  lines.push(`api checks passed: ${ok}`);
  lines.push('DONE');
  console.log(lines.join('\n'));
  process.exit(ok ? 0 : 1);
} catch (err) {
  lines.push(`ERROR: ${err.message}`);
  lines.push('DONE');
  console.log(lines.join('\n'));
  process.exit(1);
}