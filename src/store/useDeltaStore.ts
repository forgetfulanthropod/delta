import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DesignVersion } from '../features/design/types';
import { SourcingItem } from '../features/sourcing/types';
import { Task } from '../features/labor/types';

interface DeltaStore {
  // Design
  approvedDesign: DesignVersion | null;
  setApprovedDesign: (design: DesignVersion) => void;

  // Sourcing
  sourcingItems: SourcingItem[];
  addSourcingItems: (items: SourcingItem[]) => void;
  toggleApproveItem: (id: string) => void;
  clearSourcing: () => void;

  // Labor
  laborTasks: Task[];
  setLaborTasks: (tasks: Task[]) => void;

  // Phase 3: reset all
  resetAll: () => void;
}

export const useDeltaStore = create<DeltaStore>()(
  persist(
    (set) => ({
      approvedDesign: null,
      setApprovedDesign: (design) => set({ approvedDesign: design }),

      sourcingItems: [],
      addSourcingItems: (items) =>
        set((state) => ({ sourcingItems: [...state.sourcingItems, ...items] })),
      toggleApproveItem: (id) =>
        set((state) => ({
          sourcingItems: state.sourcingItems.map((item) =>
            item.id === id ? { ...item, approved: !item.approved } : item
          ),
        })),
      clearSourcing: () => set({ sourcingItems: [] }),

      laborTasks: [],
      setLaborTasks: (tasks) => set({ laborTasks: tasks }),

      resetAll: () =>
        set({
          approvedDesign: null,
          sourcingItems: [],
          laborTasks: [],
        }),
    }),
    {
      name: 'delta-store', // persists to localStorage on web (and AsyncStorage adapter possible)
      // @ts-ignore - localStorage for web; on pure RN provide custom storage via @react-native-async-storage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        approvedDesign: state.approvedDesign,
        sourcingItems: state.sourcingItems,
        laborTasks: state.laborTasks,
      }),
    }
  )
);