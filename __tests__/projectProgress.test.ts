import {
  computeAreaFlags,
  canAdvanceFromStep,
  getRecommendedStep,
  getNextStep,
  getPreviousStep,
  overallProgressPercent,
  flagsNeedingAttention,
} from '../src/features/process/projectProgress';
import type { ProjectSnapshot } from '../src/features/process/types';
import type { DesignVersion } from '../src/features/design/types';

function emptySnapshot(overrides: Partial<ProjectSnapshot> = {}): ProjectSnapshot {
  return {
    projectName: '',
    baseImage: null,
    approvedDesign: null,
    versions: [],
    sourcingItems: [],
    laborTasks: [],
    scopeCompleted: {},
    ...overrides,
  };
}

const sampleDesign: DesignVersion = {
  id: 'v1',
  imageUri: '/test-images/before-after/after-1.jpg',
  prompt: 'Modern kitchen remodel',
  tweaks: { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' },
  createdAt: '2026-01-01T00:00:00Z',
};

describe('computeAreaFlags', () => {
  it('flags design as needs_attention when versions exist but none approved', () => {
    const flags = computeAreaFlags(
      emptySnapshot({
        projectName: 'Oak St',
        baseImage: '/before.jpg',
        prompt: 'Modern kitchen',
        tweaks: sampleDesign.tweaks,
        versions: [sampleDesign],
      }),
    );
    const design = flags.find((f) => f.area === 'design');
    expect(design?.status).toBe('needs_attention');
    expect(design?.message).toMatch(/approve/i);
  });

  it('flags sourcing when items exist but none approved', () => {
    const flags = computeAreaFlags(
      emptySnapshot({
        approvedDesign: sampleDesign,
        sourcingItems: [
          { id: '1', name: 'Flooring', retailer: "Lowe's", price: 4, quantity: 100, approved: false },
        ],
      }),
    );
    const sourcing = flags.find((f) => f.area === 'sourcing');
    expect(sourcing?.status).toBe('needs_attention');
    expect(sourcing?.percentComplete).toBe(0);
  });

  it('marks design complete at 100% when approved', () => {
    const flags = computeAreaFlags(
      emptySnapshot({
        projectName: 'Done',
        baseImage: '/b.jpg',
        approvedDesign: sampleDesign,
        versions: [sampleDesign],
      }),
    );
    const design = flags.find((f) => f.area === 'design');
    expect(design?.status).toBe('complete');
    expect(design?.percentComplete).toBe(100);
  });

  it('flags scheduling in progress when labor tasks exist', () => {
    const flags = computeAreaFlags(
      emptySnapshot({
        laborTasks: [{ id: 'l1', name: 'Paint', estimatedHours: 4 }],
        hasSchedule: false,
      }),
    );
    expect(flags.find((f) => f.area === 'scheduling')?.status).toBe('in_progress');
  });
});

describe('getRecommendedStep', () => {
  it('starts at welcome for empty project', () => {
    expect(getRecommendedStep(emptySnapshot())).toBe('welcome');
  });

  it('resumes at capture_photo when named but no photo', () => {
    expect(getRecommendedStep(emptySnapshot({ projectName: 'Kitchen' }))).toBe('capture_photo');
  });

  it('resumes at approve_materials when sourcing partially approved', () => {
    const step = getRecommendedStep(
      emptySnapshot({
        projectName: 'X',
        baseImage: '/b.jpg',
        prompt: 'Kitchen',
        tweaks: sampleDesign.tweaks,
        approvedDesign: sampleDesign,
        versions: [sampleDesign],
        sourcingItems: [
          { id: '1', name: 'A', retailer: 'Amazon', price: 10, quantity: 1, approved: true },
          { id: '2', name: 'B', retailer: 'Amazon', price: 20, quantity: 1, approved: false },
        ],
      }),
    );
    expect(step).toBe('approve_materials');
  });
});

describe('step navigation helpers', () => {
  it('canAdvanceFromStep gates welcome on project name', () => {
    expect(canAdvanceFromStep('welcome', emptySnapshot())).toBe(false);
    expect(canAdvanceFromStep('welcome', emptySnapshot({ projectName: 'My House' }))).toBe(true);
  });

  it('getNextStep and getPreviousStep walk the ordered flow', () => {
    expect(getNextStep('welcome')).toBe('capture_photo');
    expect(getPreviousStep('capture_photo')).toBe('welcome');
    expect(getNextStep('project_complete')).toBeNull();
  });
});

describe('flagsNeedingAttention', () => {
  it('returns incomplete and flagged areas', () => {
    const flags = computeAreaFlags(
      emptySnapshot({
        projectName: 'P',
        baseImage: '/b.jpg',
        versions: [sampleDesign],
        prompt: 'x',
        tweaks: sampleDesign.tweaks,
      }),
    );
    const attention = flagsNeedingAttention(flags);
    expect(attention.length).toBeGreaterThan(0);
    expect(attention.some((f) => f.area === 'design')).toBe(true);
  });

  it('overallProgressPercent averages area completion', () => {
    const flags = computeAreaFlags(
      emptySnapshot({
        projectName: 'P',
        approvedDesign: sampleDesign,
        versions: [sampleDesign],
        baseImage: '/b.jpg',
      }),
    );
    const pct = overallProgressPercent(flags);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
});