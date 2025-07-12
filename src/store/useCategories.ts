import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCategoryStore } from './categoryStore';
import { Category, CategoryInsert, CategoryUpdate } from '@/types/category.types';
import { DropResult } from '@hello-pangea/dnd';

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch('/api/b-categories');
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to fetch categories');
  return result.data;
};

const createCategory = async (data: CategoryInsert): Promise<Category> => {
  const res = await fetch('/api/b-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to create category');
  return result.data;
};

const updateCategory = async ({ id, data }: { id: string; data: CategoryUpdate }): Promise<Category> => {
  const res = await fetch(`/api/b-categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to update category');
  return result.data;
};

const deleteCategory = async (id: string): Promise<void> => {
  const res = await fetch(`/api/b-categories/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.message || 'Failed to delete category');
  }
};

const reorderCategories = async (data: DropResult): Promise<void> => {
  const res = await fetch('/api/b-categories/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Failed to reorder categories');
};

export const useCategories = () => {
  const queryClient = useQueryClient();
  const { setOptimisticCategories } = useCategoryStore();

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ['b-categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onMutate: async (newCategory: CategoryInsert) => {
      await queryClient.cancelQueries({ queryKey: ['b-categories'] });
      const previous = queryClient.getQueryData<Category[]>(['b-categories']);
      const optimistic = {
        id: `temp-${Date.now()}`,
        ...newCategory,
        order_index: 0,
        slug: '',
        metadata: {},
        is_active: true,
        user_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        parent_id: newCategory.parent_id ?? null,
        type: newCategory.type,
      } as Category;
      queryClient.setQueryData(['b-categories'], (old) => Array.isArray(old) ? [...old, optimistic] : [optimistic]);
      setOptimisticCategories([...(previous || []), optimistic]);
      return { previous };
    },
    onError: (err, newCategory, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['b-categories'], context.previous);
        setOptimisticCategories(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['b-categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b-categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b-categories'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b-categories'] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    reorderCategories: reorderMutation.mutate,
    isReordering: reorderMutation.isPending,
  };
}; 