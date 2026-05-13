import { create } from 'zustand';
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
}

export const useDeltaStore = create<DeltaStore>((set) => ({
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
}));