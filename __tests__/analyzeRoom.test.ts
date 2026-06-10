import { inferLocalAnalysis } from '../src/features/design/analyzeRoom';

describe('inferLocalAnalysis', () => {
  it('infers kitchen from prompt keywords', () => {
    const result = inferLocalAnalysis('Modern kitchen with island', { style: 'Modern' });
    expect(result.roomType).toBe('kitchen');
    expect(result.suggestedMaterials.length).toBeGreaterThan(0);
  });

  it('infers bathroom from prompt keywords', () => {
    const result = inferLocalAnalysis('Spa-like master bath', { style: 'Minimal' });
    expect(result.roomType).toBe('bathroom');
  });

  it('defaults to living_room for generic prompts', () => {
    const result = inferLocalAnalysis('Cozy reading nook', { style: 'Rustic' });
    expect(result.roomType).toBe('living_room');
  });
});