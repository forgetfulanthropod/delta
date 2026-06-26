import { useMemo } from 'react';
import { useDeltaStore } from '../../store/useDeltaStore';
import { buildProjectSnapshotFromStore } from './storeSnapshot';
import type { ProjectSnapshot } from './types';

export function useProjectSnapshot(): ProjectSnapshot {
  const slice = useDeltaStore((s) => ({
    currentProjectId: s.currentProjectId,
    projects: s.projects,
    approvedDesign: s.approvedDesign,
    versions: s.versions,
    sourcingItems: s.sourcingItems,
    laborTasks: s.laborTasks,
    scopeCompleted: s.scopeCompleted,
    baseImageUri: s.baseImageUri,
    designPrompt: s.designPrompt,
    designTweaks: s.designTweaks,
    hasScheduleBuilt: s.hasScheduleBuilt,
  }));

  return useMemo(() => buildProjectSnapshotFromStore(slice), [slice]);
}