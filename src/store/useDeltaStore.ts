import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DesignVersion } from '../features/design/types';
import { SourcingItem } from '../features/sourcing/types';
import { Task } from '../features/labor/types';

interface ProjectData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  approvedDesign: DesignVersion | null;
  sourcingItems: SourcingItem[];
  laborTasks: Task[];
}

interface DeltaStore {
  // Design (current project view - for backward compat with existing screens)
  approvedDesign: DesignVersion | null;
  setApprovedDesign: (design: DesignVersion) => void;

  // Sourcing (current project view)
  sourcingItems: SourcingItem[];
  addSourcingItems: (items: SourcingItem[]) => void;
  toggleApproveItem: (id: string) => void;
  clearSourcing: () => void;

  // Labor (current project view)
  laborTasks: Task[];
  setLaborTasks: (tasks: Task[]) => void;

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
      setLaborTasks: (tasks) => set({ laborTasks: tasks }),

      // Worker state (top-level for demo role separation; integrates with laborTasks on claim)
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
        set({
          approvedDesign: null,
          sourcingItems: [],
          laborTasks: [],
          workerAssignedJobs: [],
          currentProjectId: null,
          projects: {},
        }),

      // Multi-project + backend stubs (Priority #2 persistence; minimal to satisfy TS after recent interface expansion.
      // Full logic lives in other work; these prevent type errors during AI Quality iterations & typecheck runs.
      // AI work (DesignStudio estimates/suggestions) depends on clean typecheck.
      createProject: (name = 'Untitled Project') => {
        const id = 'proj_' + Date.now().toString(36);
        // stub: in real would set + switch
        return id;
      },
      switchProject: (id: string) => {
        /* stub for persistence */
      },
      saveCurrentProject: () => {
        /* stub */
      },
      deleteProject: (id: string) => {
        /* stub */
      },
      renameProject: (id: string, newName: string) => {
        /* stub */
      },
      getProjects: () => [] as any,
      saveProjectToBackend: async (id?: string) => { /* stub */ },
      loadProjectFromBackend: async (id: string) => { /* stub */ },
      listBackendProjects: async () => [] as any,
    }),
    {
      name: 'delta-store', // persists to localStorage on web (and AsyncStorage adapter possible)
      // @ts-ignore - localStorage for web; on pure RN provide custom storage via @react-native-async-storage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        approvedDesign: state.approvedDesign,
        sourcingItems: state.sourcingItems,
        laborTasks: state.laborTasks,
        workerAssignedJobs: state.workerAssignedJobs,
        // persistence stubs (partial to keep AI typechecks clean)
        currentProjectId: state.currentProjectId,
        projects: state.projects,
      }),
    }
  )
);