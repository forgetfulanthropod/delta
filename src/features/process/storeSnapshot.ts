import type { DesignVersion } from '../design/types';
import type { ProjectSnapshot } from './types';

const DEFAULT_TWEAKS = {
  style: 'Modern',
  colorPalette: 'Warm neutrals',
  layout: 'Open plan',
};

const DEFAULT_PROMPT = 'Bright modern kitchen with natural materials and better flow';

/** Store slice shape used by buildProjectSnapshotFromStore (mirrors useDeltaStore). */
export interface StoreWizardSlice {
  currentProjectId: string | null;
  projects: Record<
    string,
    {
      name: string;
      baseImageUri?: string | null;
      designPrompt?: string;
      designTweaks?: { style: string; colorPalette: string; layout: string };
      hasScheduleBuilt?: boolean;
    }
  >;
  approvedDesign: DesignVersion | null;
  versions: DesignVersion[];
  sourcingItems: ProjectSnapshot['sourcingItems'];
  laborTasks: ProjectSnapshot['laborTasks'];
  scopeCompleted: Record<string, boolean>;
  baseImageUri: string | null;
  designPrompt: string;
  designTweaks: { style: string; colorPalette: string; layout: string };
  hasScheduleBuilt: boolean;
}

function resolvePrompt(slice: StoreWizardSlice, latest: DesignVersion | undefined): string {
  // Use store value as-is (including '') so describe_vision gating works during wizard.
  if (slice.designPrompt != null) return slice.designPrompt;
  if (latest?.prompt?.trim()) return latest.prompt;
  if (slice.approvedDesign?.prompt?.trim()) return slice.approvedDesign.prompt;
  return '';
}

/** Pass partial store tweaks through so per-step advancement works one field at a time. */
function resolveTweaks(
  slice: StoreWizardSlice,
  latest: DesignVersion | undefined,
): { style: string; colorPalette: string; layout: string } {
  const store = {
    style: slice.designTweaks?.style ?? '',
    colorPalette: slice.designTweaks?.colorPalette ?? '',
    layout: slice.designTweaks?.layout ?? '',
  };
  if (store.style || store.colorPalette || store.layout) {
    return store;
  }
  if (latest?.tweaks) return latest.tweaks;
  if (slice.approvedDesign?.tweaks) return slice.approvedDesign.tweaks;
  return store;
}

function resolveBaseImage(slice: StoreWizardSlice, latest: DesignVersion | undefined): string | null {
  if (slice.baseImageUri) return slice.baseImageUri;
  if (latest?.imageUri) return latest.imageUri;
  if (slice.approvedDesign?.imageUri) return slice.approvedDesign.imageUri;
  return null;
}

/** Build a ProjectSnapshot from real persisted store state (shared by UI + tests). */
export function buildProjectSnapshotFromStore(slice: StoreWizardSlice): ProjectSnapshot {
  const proj = slice.currentProjectId ? slice.projects[slice.currentProjectId] : null;
  const latest = slice.versions[0];

  return {
    projectName: proj?.name ?? 'My Remodel',
    baseImage: resolveBaseImage(slice, latest),
    prompt: resolvePrompt(slice, latest),
    tweaks: resolveTweaks(slice, latest),
    approvedDesign: slice.approvedDesign,
    versions: slice.versions || [],
    sourcingItems: slice.sourcingItems || [],
    laborTasks: slice.laborTasks || [],
    scopeCompleted: slice.scopeCompleted || {},
    hasSchedule: slice.hasScheduleBuilt,
  };
}

/** Fresh store slice as after App creates a project for a new owner. */
export function createInitialStoreSlice(projectName = 'My Remodel'): StoreWizardSlice {
  const id = 'proj_test_initial';
  return {
    currentProjectId: id,
    projects: { [id]: { name: projectName } },
    approvedDesign: null,
    versions: [],
    sourcingItems: [],
    laborTasks: [],
    scopeCompleted: {},
    baseImageUri: null,
    designPrompt: '',
    designTweaks: { style: '', colorPalette: '', layout: '' },
    hasScheduleBuilt: false,
  };
}