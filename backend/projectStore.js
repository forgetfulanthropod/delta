const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'data', 'projects.json');

const EMPTY_TWEAKS = { style: '', colorPalette: '', layout: '' };

function loadProjectsFromDisk() {
  try {
    if (!fs.existsSync(STORE_PATH)) return {};
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn('[projectStore] load failed:', err.message);
    return {};
  }
}

function persistProjectsToDisk(store) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.warn('[projectStore] persist failed:', err.message);
  }
}

/** Normalize inbound project payload (POST body) to full guided-aware shape. */
function normalizeProjectPayload(body, existing = {}) {
  const now = new Date().toISOString();
  const projId = body.id || existing.id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    id: projId,
    name: body.name ?? existing.name ?? 'Untitled',
    createdAt: existing.createdAt || body.createdAt || now,
    updatedAt: now,
    approvedDesign: body.approvedDesign ?? existing.approvedDesign ?? null,
    sourcingItems: body.sourcingItems ?? existing.sourcingItems ?? [],
    laborTasks: body.laborTasks ?? existing.laborTasks ?? [],
    versions: body.versions ?? existing.versions ?? [],
    scopeCompleted: body.scopeCompleted ?? existing.scopeCompleted ?? {},
    scopeBurnSeries: body.scopeBurnSeries ?? existing.scopeBurnSeries ?? [],
    baseImageUri: body.baseImageUri ?? existing.baseImageUri ?? null,
    designPrompt: body.designPrompt ?? existing.designPrompt ?? '',
    designTweaks: body.designTweaks ?? existing.designTweaks ?? { ...EMPTY_TWEAKS },
    hasScheduleBuilt: !!(body.hasScheduleBuilt ?? existing.hasScheduleBuilt),
  };
}

function createProjectStore() {
  let projectsStore = loadProjectsFromDisk();

  return {
    list() {
      return Object.values(projectsStore);
    },
    get(id) {
      return projectsStore[id] || null;
    },
    upsert(body) {
      const existing = body.id ? projectsStore[body.id] || {} : {};
      const project = normalizeProjectPayload(body, existing);
      projectsStore[project.id] = project;
      persistProjectsToDisk(projectsStore);
      return project;
    },
    remove(id) {
      const existed = !!projectsStore[id];
      delete projectsStore[id];
      if (existed) persistProjectsToDisk(projectsStore);
      return existed;
    },
    _resetForTests() {
      projectsStore = {};
      try {
        if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
      } catch {
        /* ignore */
      }
    },
  };
}

module.exports = {
  createProjectStore,
  normalizeProjectPayload,
  EMPTY_TWEAKS,
};