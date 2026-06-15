const {
  buildRoomAnalysis,
  inferRoomType,
  inferIssues,
} = require('../backend/roomAnalysis');

describe('roomAnalysis', () => {
  it('infers kitchen from prompt', () => {
    expect(inferRoomType('Modern kitchen with island')).toBe('kitchen');
  });

  it('infers issues from vision description', () => {
    const issues = inferIssues('peeling paint, shattered windows, overgrown yard');
    expect(issues).toContain('dated_finishes');
    expect(issues).toContain('structural_or_surface_damage');
    expect(issues).toContain('clutter_or_overgrowth');
  });

  it('builds analysis using image description text', () => {
    const result = buildRoomAnalysis({
      prompt: 'Refresh this space',
      tweaks: { style: 'Modern', colorPalette: 'Warm neutrals' },
      imageDescription: 'A dated kitchen with dark cabinets and poor lighting near the island.',
    });
    expect(result.roomType).toBe('kitchen');
    expect(result.issues).toContain('dated_finishes');
    expect(result.issues).toContain('poor_lighting');
    expect(result.suggestedMaterials).toContain('cabinet_hardware');
    expect(result.scopeHint).toContain('vision analysis');
  });
});