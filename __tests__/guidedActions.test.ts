import {
  retailerDeepLink,
  buildSourcingSuggestions,
  enrichSourcingFromAnalysis,
} from '../src/features/process/guidedActions';
import type { DesignVersion } from '../src/features/design/types';

const version: DesignVersion = {
  id: 'v1',
  imageUri: '/ai-room-1.jpg',
  prompt: 'Open modern kitchen with new cabinets',
  tweaks: { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' },
  createdAt: '2026-01-01T00:00:00Z',
};

describe('retailerDeepLink', () => {
  it('builds search URLs not homepages', () => {
    const url = retailerDeepLink('Quartz Countertop', "Lowe's");
    expect(url).toContain('lowes.com/search');
    expect(url).toContain('Quartz');
    expect(url).not.toMatch(/lowes\.com\/?$/);
  });

  it('encodes Amazon search terms', () => {
    const url = retailerDeepLink('LED Kit', 'Amazon');
    expect(url).toContain('amazon.com/s?k=');
    expect(url).toContain('LED');
  });
});

describe('buildSourcingSuggestions', () => {
  it('attaches deep links to every item', () => {
    const items = buildSourcingSuggestions(version);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.url).toBeDefined();
      expect(item.url).not.toMatch(/^(https:\/\/www\.(lowes|amazon|homedepot)\.com\/?)$/);
      expect(item.url).toMatch(/search|\/s\?k=|\/s\//);
    }
  });
});

describe('enrichSourcingFromAnalysis', () => {
  it('adds analysis materials without duplicating names', () => {
    const base = buildSourcingSuggestions(version);
    const enriched = enrichSourcingFromAnalysis(base, {
      roomType: 'kitchen',
      issues: [],
      suggestedMaterials: ['backsplash_tile', 'sink_faucet'],
      scopeHint: 'Kitchen remodel',
    });
    expect(enriched.length).toBeGreaterThan(base.length);
    const names = enriched.map((i) => i.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    expect(enriched.some((i) => i.name.includes('Backsplash'))).toBe(true);
  });
});