const {
  createProjectStore,
  normalizeProjectPayload,
} = require('../backend/projectStore');

describe('normalizeProjectPayload', () => {
  it('roundtrips guided wizard fields', () => {
    const body = {
      id: 'proj_test',
      name: 'Kitchen',
      baseImageUri: '/before.jpg',
      designPrompt: 'Open calm kitchen',
      designTweaks: { style: 'Modern', colorPalette: 'Warm', layout: 'Open plan' },
      hasScheduleBuilt: true,
      versions: [{ id: 'v1', imageUri: '/after.jpg', prompt: 'x', tweaks: {}, createdAt: '2026-01-01' }],
      scopeCompleted: { t1: true },
    };
    const normalized = normalizeProjectPayload(body);
    expect(normalized.baseImageUri).toBe('/before.jpg');
    expect(normalized.designPrompt).toBe('Open calm kitchen');
    expect(normalized.hasScheduleBuilt).toBe(true);
    expect(normalized.versions).toHaveLength(1);
    expect(normalized.scopeCompleted.t1).toBe(true);
  });
});

describe('createProjectStore', () => {
  it('upserts and retrieves projects', () => {
    const store = createProjectStore();
    store._resetForTests();
    const saved = store.upsert({
      id: 'proj_e2e',
      name: 'E2E',
      designPrompt: 'test',
      baseImageUri: '/photo.jpg',
    });
    expect(saved.id).toBe('proj_e2e');
    const loaded = store.get('proj_e2e');
    expect(loaded.designPrompt).toBe('test');
    expect(loaded.baseImageUri).toBe('/photo.jpg');
    store._resetForTests();
  });
});