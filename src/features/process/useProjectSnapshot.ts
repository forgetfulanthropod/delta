import { useMemo } from 'react';
import { useDeltaStore } from '../../store/useDeltaStore';
import type { ProjectSnapshot } from './types';

export function useProjectSnapshot(
  extras?: Partial<Pick<ProjectSnapshot, 'baseImage' | 'prompt' | 'tweaks' | 'hasSchedule' | 'projectName'>>,
): ProjectSnapshot {
  const store = useDeltaStore();
  const proj = store.currentProjectId ? store.projects[store.currentProjectId] : null;

  return useMemo(
    () => ({
      projectName: extras?.projectName ?? proj?.name ?? 'My Remodel',
      baseImage: extras?.baseImage ?? null,
      prompt: extras?.prompt,
      tweaks: extras?.tweaks,
      approvedDesign: store.approvedDesign,
      versions: store.versions || [],
      sourcingItems: store.sourcingItems || [],
      laborTasks: store.laborTasks || [],
      scopeCompleted: store.scopeCompleted || {},
      hasSchedule: extras?.hasSchedule ?? (store.laborTasks || []).length > 0,
    }),
    [
      extras?.projectName,
      extras?.baseImage,
      extras?.prompt,
      extras?.tweaks,
      extras?.hasSchedule,
      proj?.name,
      store.approvedDesign,
      store.versions,
      store.sourcingItems,
      store.laborTasks,
      store.scopeCompleted,
    ],
  );
}