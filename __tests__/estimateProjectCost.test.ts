import { estimateProjectCost, sourcingMaterialsTotal } from '../src/features/design/estimateProjectCost';
import type { DesignVersion } from '../src/features/design/types';

const baseVersion: DesignVersion = {
  id: 'v1',
  imageUri: '/ai-room-1.jpg',
  prompt: 'Open calm kitchen',
  tweaks: { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' },
  createdAt: '2026-01-01T00:00:00Z',
};

describe('estimateProjectCost', () => {
  it('returns higher totals for kitchen scope in prompt', () => {
    const kitchen = estimateProjectCost({
      ...baseVersion,
      prompt: 'Full kitchen remodel with custom cabinets and island',
    });
    const simple = estimateProjectCost(baseVersion);
    expect(kitchen.total).toBeGreaterThan(simple.total);
    expect(kitchen.hours).toBeGreaterThan(simple.hours);
  });

  it('rounds to $50 increments', () => {
    const c = estimateProjectCost(baseVersion);
    expect(c.total % 50).toBe(0);
    expect(c.materials % 50).toBe(0);
  });
});

describe('sourcingMaterialsTotal', () => {
  it('sums approved items only when requested', () => {
    const items = [
      { price: 10, quantity: 2, approved: true },
      { price: 5, quantity: 4, approved: false },
    ];
    expect(sourcingMaterialsTotal(items)).toBe(40);
    expect(sourcingMaterialsTotal(items, true)).toBe(20);
  });
});