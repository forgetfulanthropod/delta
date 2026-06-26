import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiUrl } from '../shared/api';
import { DesignVersion } from '../features/design/types';
import { SourcingItem } from '../features/sourcing/types';
import { Task } from '../features/labor/types';

export const DEFAULT_DESIGN_PROMPT =
  'Bright modern kitchen with natural materials and better flow';

export const DEFAULT_DESIGN_TWEAKS = {
  style: 'Modern',
  colorPalette: 'Warm neutrals',
  layout: 'Open plan',
};

export const EMPTY_DESIGN_TWEAKS = {
  style: '',
  colorPalette: '',
  layout: '',
};

interface ProjectData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  approvedDesign: DesignVersion | null;
  sourcingItems: SourcingItem[];
  laborTasks: Task[];
  versions: DesignVersion[];
  scopeCompleted?: Record<string, boolean>;
  scopeBurnSeries?: number[];
  baseImageUri?: string | null;
  designPrompt?: string;
  designTweaks?: { style: string; colorPalette: string; layout: string };
  hasScheduleBuilt?: boolean;
}

interface DeltaStore {
  // Design (current project view - for backward compat with existing screens)
  approvedDesign: DesignVersion | null;
  setApprovedDesign: (design: DesignVersion | null) => void;

  // Sourcing (current project view)
  sourcingItems: SourcingItem[];
  addSourcingItems: (items: SourcingItem[]) => void;
  toggleApproveItem: (id: string) => void;
  clearSourcing: () => void;

  // Labor (current project view)
  laborTasks: Task[];
  setLaborTasks: (tasks: Task[]) => void;

  // Scoping burndown (per-project persistence)
  scopeCompleted: Record<string, boolean>;
  scopeBurnSeries: number[];
  toggleScopeItem: (id: string) => void;
  setScopeCompleted: (completed: Record<string, boolean>) => void;
  setScopeBurnSeries: (series: number[]) => void;
  resetScopeProgress: () => void;

  // Design versions (Phase 1: per-project persistence for versions list)
  versions: DesignVersion[];
  addVersion: (version: DesignVersion) => void;
  setProjectVersions: (versions: DesignVersion[]) => void;
  clearVersions: () => void;

  // Guided wizard state (persisted per project for progress flags)
  baseImageUri: string | null;
  setBaseImageUri: (uri: string | null) => void;
  designPrompt: string;
  setDesignPrompt: (prompt: string) => void;
  designTweaks: { style: string; colorPalette: string; layout: string };
  setDesignTweaks: (tweaks: { style: string; colorPalette: string; layout: string }) => void;
  hasScheduleBuilt: boolean;
  setHasScheduleBuilt: (built: boolean) => void;

  // Worker experience (Priority #4): claiming/assignment flows, my assigned jobs, owner data integration
  workerAssignedJobs: any[];
  claimJob: (job: any) => void;
  unclaimJob: (jobId: string) => void;

  // Phase 3: reset all
  resetAll: () => void;

  // Multi-project support + enhanced persistence (Priority #2)
  currentProjectId: string | null;
  projects: Record<string, ProjectData>;
  createProject: (name?: string) => string;
  switchProject: (id: string) => void;
  saveCurrentProject: () => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, newName: string) => void;
  getProjects: () => ProjectData[];

  // Backend storage options (simple save/load via backend routes added for demo)
  saveProjectToBackend: (id?: string) => Promise<void>;
  loadProjectFromBackend: (id: string) => Promise<void>;
  listBackendProjects: () => Promise<any[]>;
}

export const useDeltaStore = create<DeltaStore>()(
  persist(
    (set, get) => ({
      // Multi-project state (Priority #2)
      currentProjectId: null,
      projects: {},

      // Current view (synced from active project for compat)
      approvedDesign: null,
      setApprovedDesign: (design) =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (!currentId) {
            currentId = `proj_${Date.now()}_auto`;
            const now = new Date().toISOString();
            projects = {
              ...projects,
              [currentId]: {
                id: currentId,
                name: 'My Project',
                createdAt: now,
                updatedAt: now,
                approvedDesign: design,
                sourcingItems: state.sourcingItems || [],
                laborTasks: state.laborTasks || [],
                versions: state.versions || [],
              },
            };
          } else if (projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                approvedDesign: design,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { approvedDesign: design, currentProjectId: currentId, projects };
        }),

      sourcingItems: [],
      addSourcingItems: (items) =>
        set((state) => {
          const newSourcing = [...(state.sourcingItems || []), ...items];
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (!currentId) {
            currentId = `proj_${Date.now()}_auto`;
            const now = new Date().toISOString();
            projects = {
              ...projects,
              [currentId]: {
                id: currentId,
                name: 'My Project',
                createdAt: now,
                updatedAt: now,
                approvedDesign: state.approvedDesign || null,
                sourcingItems: newSourcing,
                laborTasks: state.laborTasks || [],
                versions: state.versions || [],
              },
            };
          } else if (projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                sourcingItems: newSourcing,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { sourcingItems: newSourcing, currentProjectId: currentId, projects };
        }),
      toggleApproveItem: (id) =>
        set((state) => {
          const newSourcing = (state.sourcingItems || []).map((item) =>
            item.id === id ? { ...item, approved: !item.approved } : item
          );
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (!currentId) {
            currentId = `proj_${Date.now()}_auto`;
            const now = new Date().toISOString();
            projects = {
              ...projects,
              [currentId]: {
                id: currentId,
                name: 'My Project',
                createdAt: now,
                updatedAt: now,
                approvedDesign: state.approvedDesign || null,
                sourcingItems: newSourcing,
                laborTasks: state.laborTasks || [],
                versions: state.versions || [],
              },
            };
          } else if (projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                sourcingItems: newSourcing,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { sourcingItems: newSourcing, currentProjectId: currentId, projects };
        }),
      clearSourcing: () =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (!currentId) {
            currentId = `proj_${Date.now()}_auto`;
            const now = new Date().toISOString();
            projects = {
              ...projects,
              [currentId]: {
                id: currentId,
                name: 'My Project',
                createdAt: now,
                updatedAt: now,
                approvedDesign: state.approvedDesign || null,
                sourcingItems: [],
                laborTasks: state.laborTasks || [],
                versions: state.versions || [],
              },
            };
          } else if (projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                sourcingItems: [],
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { sourcingItems: [], currentProjectId: currentId, projects };
        }),

      laborTasks: [],
      setLaborTasks: (tasks) =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (!currentId) {
            currentId = `proj_${Date.now()}_auto`;
            const now = new Date().toISOString();
            projects = {
              ...projects,
              [currentId]: {
                id: currentId,
                name: 'My Project',
                createdAt: now,
                updatedAt: now,
                approvedDesign: state.approvedDesign || null,
                sourcingItems: state.sourcingItems || [],
                laborTasks: tasks,
                versions: state.versions || [],
              },
            };
          } else if (projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                laborTasks: tasks,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { laborTasks: tasks, currentProjectId: currentId, projects };
        }),

      scopeCompleted: {},
      scopeBurnSeries: [],
      toggleScopeItem: (id) =>
        set((state) => {
          const next = { ...state.scopeCompleted, [id]: !state.scopeCompleted[id] };
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (currentId && projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                scopeCompleted: next,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { scopeCompleted: next, projects };
        }),
      setScopeCompleted: (completed) =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (currentId && projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                scopeCompleted: completed,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { scopeCompleted: completed, projects };
        }),
      setScopeBurnSeries: (series) =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (currentId && projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                scopeBurnSeries: series,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { scopeBurnSeries: series, projects };
        }),
      resetScopeProgress: () =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (currentId && projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                scopeCompleted: {},
                scopeBurnSeries: [],
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { scopeCompleted: {}, scopeBurnSeries: [], projects };
        }),

      // Design versions per project (Phase 1 persistence - not just local component state)
      versions: [],
      addVersion: (version) =>
        set((state) => {
          const newVersions = [version, ...(state.versions || [])];
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (!currentId) {
            currentId = `proj_${Date.now()}_auto`;
            const now = new Date().toISOString();
            projects = {
              ...projects,
              [currentId]: {
                id: currentId,
                name: 'My Project',
                createdAt: now,
                updatedAt: now,
                approvedDesign: state.approvedDesign || null,
                sourcingItems: state.sourcingItems || [],
                laborTasks: state.laborTasks || [],
                versions: newVersions,
              },
            };
          } else if (projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                versions: newVersions,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { versions: newVersions, currentProjectId: currentId, projects };
        }),
      setProjectVersions: (vers) =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (!currentId) {
            currentId = `proj_${Date.now()}_auto`;
            const now = new Date().toISOString();
            projects = {
              ...projects,
              [currentId]: {
                id: currentId,
                name: 'My Project',
                createdAt: now,
                updatedAt: now,
                approvedDesign: state.approvedDesign || null,
                sourcingItems: state.sourcingItems || [],
                laborTasks: state.laborTasks || [],
                versions: vers,
              },
            };
          } else if (projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                versions: vers,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { versions: vers, currentProjectId: currentId, projects };
        }),
      clearVersions: () =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (!currentId) {
            currentId = `proj_${Date.now()}_auto`;
            const now = new Date().toISOString();
            projects = {
              ...projects,
              [currentId]: {
                id: currentId,
                name: 'My Project',
                createdAt: now,
                updatedAt: now,
                approvedDesign: state.approvedDesign || null,
                sourcingItems: state.sourcingItems || [],
                laborTasks: state.laborTasks || [],
                versions: [],
              },
            };
          } else if (projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                versions: [],
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { versions: [], currentProjectId: currentId, projects };
        }),

      baseImageUri: null,
      setBaseImageUri: (uri) =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (currentId && projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                baseImageUri: uri,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { baseImageUri: uri, projects };
        }),
      designPrompt: '',
      setDesignPrompt: (prompt) =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (currentId && projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                designPrompt: prompt,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { designPrompt: prompt, projects };
        }),
      designTweaks: { ...EMPTY_DESIGN_TWEAKS },
      setDesignTweaks: (tweaks) =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (currentId && projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                designTweaks: tweaks,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { designTweaks: tweaks, projects };
        }),
      hasScheduleBuilt: false,
      setHasScheduleBuilt: (built) =>
        set((state) => {
          let currentId = state.currentProjectId;
          let projects = state.projects || {};
          if (currentId && projects[currentId]) {
            projects = {
              ...projects,
              [currentId]: {
                ...projects[currentId],
                hasScheduleBuilt: built,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return { hasScheduleBuilt: built, projects };
        }),

      // Worker state (top-level for demo role separation; integrates with laborTasks on claim; kept out of per-owner-project)
      workerAssignedJobs: [],
      claimJob: (job) =>
        set((state) => ({
          workerAssignedJobs: [
            ...state.workerAssignedJobs.filter((j: any) => j.id !== job.id),
            { ...job, claimedAt: new Date().toISOString() },
          ],
        })),
      unclaimJob: (jobId) =>
        set((state) => ({
          workerAssignedJobs: state.workerAssignedJobs.filter((j: any) => j.id !== jobId),
        })),

      resetAll: () =>
        set((state) => {
          const cleared = {
            approvedDesign: null as DesignVersion | null,
            sourcingItems: [] as SourcingItem[],
            laborTasks: [] as Task[],
            versions: [] as DesignVersion[],
            scopeCompleted: {} as Record<string, boolean>,
            scopeBurnSeries: [] as number[],
            baseImageUri: null as string | null,
            designPrompt: '',
            designTweaks: { ...EMPTY_DESIGN_TWEAKS },
            hasScheduleBuilt: false,
          };
          let projects = state.projects || {};
          if (state.currentProjectId && projects[state.currentProjectId]) {
            projects = {
              ...projects,
              [state.currentProjectId]: {
                ...projects[state.currentProjectId],
                ...cleared,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return {
            ...cleared,
            workerAssignedJobs: [],
            projects,
          };
        }),

      // Full multi-project + metadata + history + backend (Priority #2)
      createProject: (name = 'Untitled Project') => {
        const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date().toISOString();
        const newProj: ProjectData = {
          id,
          name,
          createdAt: now,
          updatedAt: now,
          approvedDesign: null,
          sourcingItems: [],
          laborTasks: [],
          versions: [],
          scopeCompleted: {},
          scopeBurnSeries: [],
          baseImageUri: null,
          designPrompt: '',
          designTweaks: { ...EMPTY_DESIGN_TWEAKS },
          hasScheduleBuilt: false,
        };
        set((state) => ({
          projects: { ...(state.projects || {}), [id]: newProj },
          currentProjectId: id,
          approvedDesign: null,
          sourcingItems: [],
          laborTasks: [],
          versions: [],
          scopeCompleted: {},
          scopeBurnSeries: [],
          baseImageUri: null,
          designPrompt: '',
          designTweaks: { ...EMPTY_DESIGN_TWEAKS },
          hasScheduleBuilt: false,
        }));
        return id;
      },
      switchProject: (id: string) =>
        set((state) => {
          const proj = (state.projects || {})[id];
          if (!proj) return {};
          return {
            currentProjectId: id,
            approvedDesign: proj.approvedDesign,
            sourcingItems: proj.sourcingItems || [],
            laborTasks: proj.laborTasks || [],
            versions: proj.versions || [],
            scopeCompleted: proj.scopeCompleted || {},
            scopeBurnSeries: proj.scopeBurnSeries || [],
            baseImageUri: proj.baseImageUri ?? null,
            designPrompt: proj.designPrompt ?? '',
            designTweaks: proj.designTweaks || { ...EMPTY_DESIGN_TWEAKS },
            hasScheduleBuilt: proj.hasScheduleBuilt ?? false,
          };
        }),
      saveCurrentProject: () =>
        set((state) => {
          const id = state.currentProjectId;
          const projs = state.projects || {};
          if (!id || !projs[id]) return {};
          return {
            projects: {
              ...projs,
              [id]: {
                ...projs[id],
                approvedDesign: state.approvedDesign,
                sourcingItems: state.sourcingItems,
                laborTasks: state.laborTasks,
                versions: state.versions,
                scopeCompleted: state.scopeCompleted,
                scopeBurnSeries: state.scopeBurnSeries,
                baseImageUri: state.baseImageUri,
                designPrompt: state.designPrompt,
                designTweaks: state.designTweaks,
                hasScheduleBuilt: state.hasScheduleBuilt,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      deleteProject: (id: string) =>
        set((state) => {
          const projs = { ...(state.projects || {}) };
          delete projs[id];
          const wasCurrent = state.currentProjectId === id;
          if (!wasCurrent) {
            return { projects: projs };
          }
          const remaining = Object.keys(projs);
          if (remaining.length === 0) {
            return {
              projects: projs,
              currentProjectId: null,
              approvedDesign: null,
              sourcingItems: [],
              laborTasks: [],
              versions: [],
              scopeCompleted: {},
              scopeBurnSeries: [],
              baseImageUri: null,
              designPrompt: '',
              designTweaks: { ...EMPTY_DESIGN_TWEAKS },
              hasScheduleBuilt: false,
            };
          }
          const nextId = remaining[0];
          const nextProj = projs[nextId];
          return {
            projects: projs,
            currentProjectId: nextId,
            approvedDesign: nextProj.approvedDesign,
            sourcingItems: nextProj.sourcingItems || [],
            laborTasks: nextProj.laborTasks || [],
            versions: nextProj.versions || [],
            scopeCompleted: nextProj.scopeCompleted || {},
            scopeBurnSeries: nextProj.scopeBurnSeries || [],
            baseImageUri: nextProj.baseImageUri ?? null,
            designPrompt: nextProj.designPrompt ?? '',
            designTweaks: nextProj.designTweaks || { ...EMPTY_DESIGN_TWEAKS },
            hasScheduleBuilt: nextProj.hasScheduleBuilt ?? false,
          };
        }),
      renameProject: (id: string, newName: string) =>
        set((state) => {
          const projs = state.projects || {};
          if (!projs[id]) return {};
          return {
            projects: {
              ...projs,
              [id]: {
                ...projs[id],
                name: (newName || 'Untitled').trim(),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      getProjects: () => {
        const state = get();
        return Object.values(state.projects || {}).sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt)
        ) as ProjectData[];
      },

      saveProjectToBackend: async (id?: string) => {
        const state = get();
        const targetId = id || state.currentProjectId;
        if (!targetId) {
          console.warn('[persist] No current project id to save to backend');
          return;
        }
        const projs = state.projects || {};
        const proj = projs[targetId] || {
          id: targetId,
          name: 'Current Project',
          approvedDesign: state.approvedDesign,
          sourcingItems: state.sourcingItems,
          laborTasks: state.laborTasks,
          versions: state.versions || [],
        };
        try {
          const res = await fetch(apiUrl('/api/projects'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: proj.id,
              name: proj.name,
              approvedDesign: proj.approvedDesign,
              sourcingItems: proj.sourcingItems,
              laborTasks: proj.laborTasks,
              versions: proj.versions || state.versions || [],
              scopeCompleted: proj.scopeCompleted || state.scopeCompleted || {},
              scopeBurnSeries: proj.scopeBurnSeries || state.scopeBurnSeries || [],
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (data?.success) {
            console.log('[persist] Saved project to backend:', data.project?.id || targetId);
          }
        } catch (e) {
          console.warn('[persist] Backend saveProjectToBackend failed:', e);
        }
      },
      loadProjectFromBackend: async (id: string) => {
        try {
          const res = await fetch(apiUrl(`/api/projects/${encodeURIComponent(id)}`));
          const data = await res.json().catch(() => ({}));
          if (data?.success && data.project) {
            const p = data.project;
            const localId = p.id || `proj_backend_${Date.now()}`;
            const now = new Date().toISOString();
            const loaded: ProjectData = {
              id: localId,
              name: p.name || 'Loaded from Backend',
              createdAt: p.createdAt || now,
              updatedAt: now,
              approvedDesign: p.approvedDesign || null,
              sourcingItems: p.sourcingItems || [],
              laborTasks: p.laborTasks || [],
              versions: p.versions || [],
              scopeCompleted: p.scopeCompleted || {},
              scopeBurnSeries: p.scopeBurnSeries || [],
            };
            set((s: any) => ({
              projects: { ...(s.projects || {}), [localId]: loaded },
              currentProjectId: localId,
              approvedDesign: loaded.approvedDesign,
              sourcingItems: loaded.sourcingItems,
              laborTasks: loaded.laborTasks,
              versions: loaded.versions,
              scopeCompleted: loaded.scopeCompleted || {},
              scopeBurnSeries: loaded.scopeBurnSeries || [],
            }));
            console.log('[persist] Loaded project from backend:', localId);
          }
        } catch (e) {
          console.warn('[persist] loadProjectFromBackend failed:', e);
        }
      },
      listBackendProjects: async () => {
        try {
          const res = await fetch(apiUrl('/api/projects'));
          const data = await res.json().catch(() => ({}));
          return data?.success ? (data.projects || []) : [];
        } catch (e) {
          console.warn('[persist] listBackendProjects failed:', e);
          return [];
        }
      },
    }),
    {
      name: 'delta-store', // persists to localStorage on web (and AsyncStorage adapter possible)
      // @ts-ignore - localStorage for web; on pure RN provide custom storage via @react-native-async-storage/async-storage
      // Web uses built-in localStorage automatically via createJSONStorage.
      // For full native RN: `pnpm add @react-native-async-storage/async-storage` then use conditional AsyncStorage.
      // import AsyncStorage from '@react-native-async-storage/async-storage';
      // import { Platform } from 'react-native';
      // storage: createJSONStorage(() => (Platform.OS === 'web' ? localStorage : AsyncStorage)),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
        projects: state.projects,
        approvedDesign: state.approvedDesign,
        sourcingItems: state.sourcingItems,
        laborTasks: state.laborTasks,
        versions: state.versions,
        scopeCompleted: state.scopeCompleted,
        scopeBurnSeries: state.scopeBurnSeries,
        baseImageUri: state.baseImageUri,
        designPrompt: state.designPrompt,
        designTweaks: state.designTweaks,
        hasScheduleBuilt: state.hasScheduleBuilt,
        workerAssignedJobs: state.workerAssignedJobs,
      }),
      version: 4,
      migrate: (persistedState: any, version: number) => {
        const ps = persistedState || {};
        if (version < 4) {
          ps.baseImageUri = ps.baseImageUri ?? null;
          ps.designPrompt = ps.designPrompt ?? '';
          ps.designTweaks = ps.designTweaks || { ...EMPTY_DESIGN_TWEAKS };
          ps.hasScheduleBuilt = ps.hasScheduleBuilt ?? false;
          if (ps.projects) {
            Object.keys(ps.projects).forEach((id) => {
              ps.projects[id].baseImageUri = ps.projects[id].baseImageUri ?? null;
              ps.projects[id].designPrompt =
                ps.projects[id].designPrompt ?? '';
              ps.projects[id].designTweaks =
                ps.projects[id].designTweaks || { ...EMPTY_DESIGN_TWEAKS };
              ps.projects[id].hasScheduleBuilt = ps.projects[id].hasScheduleBuilt ?? false;
            });
          }
        }
        if (version < 3) {
          ps.scopeCompleted = ps.scopeCompleted || {};
          ps.scopeBurnSeries = ps.scopeBurnSeries || [];
          if (ps.projects) {
            Object.keys(ps.projects).forEach((id) => {
              ps.projects[id].scopeCompleted = ps.projects[id].scopeCompleted || {};
              ps.projects[id].scopeBurnSeries = ps.projects[id].scopeBurnSeries || [];
            });
          }
        }
        if (version < 2 || !ps.projects) {
          const hasOldData = ps.approvedDesign || (ps.sourcingItems && ps.sourcingItems.length > 0) || (ps.laborTasks && ps.laborTasks.length > 0) || (ps.versions && ps.versions.length > 0);
          if (hasOldData) {
            const id = `proj_${Date.now()}_legacy`;
            const now = new Date().toISOString();
            const legacyProject: ProjectData = {
              id,
              name: 'Legacy Project (migrated from prior session)',
              createdAt: now,
              updatedAt: now,
              approvedDesign: ps.approvedDesign || null,
              sourcingItems: ps.sourcingItems || [],
              laborTasks: ps.laborTasks || [],
              versions: ps.versions || [],
            };
            return {
              ...ps,
              currentProjectId: id,
              projects: { [id]: legacyProject },
            };
          }
          return { ...ps, currentProjectId: null, projects: {} };
        }
        return ps;
      },
    }
  )
);
