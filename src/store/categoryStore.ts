import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Category } from '@/types/category.types';

interface CategoryStore {
  expandedGroups: Set<string>;
  optimisticCategories: Category[];
  draggedItem: Category | null;

  toggleGroup: (groupId: string) => void;
  setOptimisticCategories: (categories: Category[]) => void;
  setDraggedItem: (item: Category | null) => void;
  reset: () => void;
}

export const useCategoryStore = create<CategoryStore>()(
  devtools(
    (set) => ({
      expandedGroups: new Set(),
      optimisticCategories: [],
      draggedItem: null,

      toggleGroup: (groupId: string) =>
        set((state) => {
          const newExpanded = new Set(state.expandedGroups);
          if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
          } else {
            newExpanded.add(groupId);
          }
          return { expandedGroups: newExpanded };
        }),

      setOptimisticCategories: (categories) =>
        set({ optimisticCategories: categories }),

      setDraggedItem: (item) => set({ draggedItem: item }),

      reset: () =>
        set({
          expandedGroups: new Set(),
          optimisticCategories: [],
          draggedItem: null,
        }),
    }),
    { name: 'category-store' }
  )
); 