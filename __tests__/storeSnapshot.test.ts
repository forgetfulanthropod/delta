import {
  buildProjectSnapshotFromStore,
  createInitialStoreSlice,
  type StoreWizardSlice,
} from '../src/features/process/storeSnapshot';
import {
  computeAreaFlags,
  getRecommendedStep,
  canAdvanceFromStep,
} from '../src/features/process/projectProgress';
import type { DesignVersion } from '../src/features/design/types';

const sampleDesign: DesignVersion = {
  id: 'v1',
  imageUri: '/test-images/before-after/after-1.jpg',
  prompt: 'Modern kitchen remodel',
  tweaks: { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' },
  createdAt: '2026-01-01T00:00:00Z',
};

const sampleDesignAlt: DesignVersion = {
  id: 'v2',
  imageUri: '/ai-room-1.jpg',
  prompt: 'Modern kitchen remodel',
  tweaks: { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' },
  createdAt: '2026-01-02T00:00:00Z',
};

function applyWizardProgress(slice: StoreWizardSlice): StoreWizardSlice {
  return {
    ...slice,
    baseImageUri: '/test-images/before-after/before-1.jpg',
    designPrompt: 'Modern kitchen remodel',
    designTweaks: { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' },
    versions: [sampleDesign, sampleDesignAlt],
    approvedDesign: sampleDesign,
    sourcingItems: [
      { id: '1', name: 'Flooring', retailer: "Lowe's", price: 4, quantity: 100, approved: true },
      { id: '2', name: 'Paint', retailer: 'Amazon', price: 40, quantity: 4, approved: false },
    ],
    laborTasks: [{ id: 'l1', name: 'Install flooring', estimatedHours: 6 }],
    hasScheduleBuilt: false,
  };
}

describe('buildProjectSnapshotFromStore', () => {
  it('derives photo from baseImageUri for progress screen (not null)', () => {
    const slice = createInitialStoreSlice('Kitchen');
    slice.baseImageUri = '/test-images/before-after/before-1.jpg';
    const snap = buildProjectSnapshotFromStore(slice);
    expect(snap.baseImage).toBe('/test-images/before-after/before-1.jpg');
    const design = computeAreaFlags(snap).find((f) => f.area === 'design');
    expect(design?.percentComplete).toBeGreaterThanOrEqual(35);
  });

  it('matches progress screen snapshot after approve+versions at 100% design', () => {
    const slice = applyWizardProgress(createInitialStoreSlice('Oak St'));
    const snap = buildProjectSnapshotFromStore(slice);
    const design = computeAreaFlags(snap).find((f) => f.area === 'design');
    expect(design?.status).toBe('complete');
    expect(design?.percentComplete).toBe(100);
  });

  it('flags sourcing needs_attention when items unapproved', () => {
    const slice = applyWizardProgress(createInitialStoreSlice('Oak St'));
    const snap = buildProjectSnapshotFromStore(slice);
    const sourcing = computeAreaFlags(snap).find((f) => f.area === 'sourcing');
    expect(sourcing?.status).toBe('in_progress');
    expect(sourcing?.percentComplete).toBe(50);
  });

  it('getRecommendedStep from store slice resumes at approve_materials', () => {
    const slice = applyWizardProgress(createInitialStoreSlice('Oak St'));
    expect(getRecommendedStep(buildProjectSnapshotFromStore(slice))).toBe('approve_materials');
  });

  it('canAdvanceFromStep uses persisted baseImageUri', () => {
    const slice = createInitialStoreSlice('P');
    slice.baseImageUri = '/photo.jpg';
    expect(canAdvanceFromStep('capture_photo', buildProjectSnapshotFromStore(slice))).toBe(true);
  });

  it('hoped outcome description resumes at review_design', () => {
    const slice = createInitialStoreSlice('Kitchen');
    slice.baseImageUri = '/before.jpg';
    slice.designPrompt =
      'I hope the finished space feels bright, uncluttered, and easy to cook in with friends.';

    const snap = buildProjectSnapshotFromStore(slice);
    expect(canAdvanceFromStep('describe_vision', snap)).toBe(true);
    expect(getRecommendedStep(snap)).toBe('review_design');
  });
});