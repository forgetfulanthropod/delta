import {
  scopeTreeFromLaborTasks,
  hoursToStoryPoints,
  DEMO_SCOPE_TREE,
} from '../src/features/scoping/scopeFromLabor';

describe('scopeFromLabor', () => {
  it('maps labor tasks to trade groups with story points', () => {
    const tree = scopeTreeFromLaborTasks([
      { id: '1', name: 'Demo kitchen', estimatedHours: 14, category: 'demo' },
      { id: '2', name: 'Install cabinets', estimatedHours: 8, category: 'carpentry' },
      { id: '3', name: 'Paint walls', estimatedHours: 5, category: 'painting' },
    ]);
    expect(tree.length).toBe(3);
    const trades = tree.map((g) => g.trade).sort();
    expect(trades).toEqual(['Carpentry', 'Demolition', 'Painting']);
    expect(tree.find((g) => g.trade === 'Demolition')?.items[0].points).toBeGreaterThan(0);
  });

  it('returns empty array for no tasks', () => {
    expect(scopeTreeFromLaborTasks([])).toEqual([]);
  });

  it('converts hours to fibonacci-ish story points', () => {
    expect(hoursToStoryPoints(1)).toBe(2);
    expect(hoursToStoryPoints(10)).toBeGreaterThanOrEqual(5);
    expect(hoursToStoryPoints(10)).toBeLessThanOrEqual(13);
  });

  it('demo scope tree has trades with points', () => {
    expect(DEMO_SCOPE_TREE.length).toBeGreaterThan(4);
    const total = DEMO_SCOPE_TREE.flatMap((g) => g.items).reduce((s, i) => s + i.points, 0);
    expect(total).toBeGreaterThan(50);
  });
});