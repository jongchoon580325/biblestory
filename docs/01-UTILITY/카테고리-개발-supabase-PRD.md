# 카테고리 관리 시스템 PRD (Product Requirements Document)
## Next.js + Supabase 기반 분산 아키텍처

---

## 1. 개요 및 목적

### 1.1 프로젝트 목적
- Next.js + Supabase를 활용한 확장 가능한 카테고리 관리 시스템 구축
- 실시간 데이터 동기화와 서버-클라이언트 분리 아키텍처 구현
- 타입 안전성과 성능 최적화를 고려한 엔터프라이즈급 솔루션 제공

### 1.2 기술 스택
- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: Zustand + React Query (TanStack Query)
- **Styling**: Tailwind CSS + shadcn/ui
- **Form Management**: React Hook Form + Zod
- **Testing**: Jest, React Testing Library, Playwright

---

## 2. 시스템 아키텍처

### 2.1 전체 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client (Web)  │◄──►│  Next.js API    │◄──►│    Supabase     │
│                 │    │   Routes        │    │   (PostgreSQL)  │
│ - React Query   │    │ - Validation    │    │ - RLS Policy    │
│ - Zustand       │    │ - Error Handle  │    │ - Realtime      │
│ - Form State    │    │ - Rate Limiting │    │ - Auth          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 데이터 플로우
1. **Create/Update**: Client → API Route → Validation → Supabase → Realtime Update
2. **Read**: Client → React Query → Cache/Supabase → UI Update
3. **Delete**: Client → Optimistic Update → API Route → Supabase → Rollback if Error

---

## 3. 데이터베이스 설계

### 3.1 Supabase 스키마 설계
```sql
-- Enable RLS
ALTER TABLE b_categories ENABLE ROW LEVEL SECURITY;

-- B_Categories table
CREATE TABLE b_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type category_type NOT NULL DEFAULT 'item',
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  slug VARCHAR(100) UNIQUE GENERATED ALWAYS AS (
    CASE 
      WHEN parent_id IS NULL THEN slugify(name)
      ELSE (SELECT slug FROM categories WHERE id = parent_id) || '/' || slugify(name)
    END
  ) STORED,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_parent_type CHECK (
    (type = 'group' AND parent_id IS NULL) OR 
    (type = 'item' AND parent_id IS NOT NULL)
  ),
  CONSTRAINT valid_name_length CHECK (length(trim(name)) >= 1),
  CONSTRAINT unique_name_per_parent UNIQUE (name, parent_id, user_id)
);

-- Category type enum
CREATE TYPE category_type AS ENUM ('group', 'item');

-- Indexes for performance
CREATE INDEX idx_b_categories_user_id ON b_categories(user_id);
CREATE INDEX idx_b_categories_parent_id ON b_categories(parent_id);
CREATE INDEX idx_b_categories_type ON b_categories(type);
CREATE INDEX idx_b_categories_order ON b_categories(order_index);
CREATE INDEX idx_b_categories_active ON b_categories(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_b_categories_updated_at 
    BEFORE UPDATE ON b_categories 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### 3.2 RLS (Row Level Security) 정책
```sql
-- 개발모드 정책 (제한 없음)
CREATE POLICY "Development mode - allow all" ON b_categories
  FOR ALL USING (true) WITH CHECK (true);

-- 프로덕션 정책 (사용자별 격리)
-- Users can only access their own categories
CREATE POLICY "Users can view own categories" ON b_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON b_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON b_categories
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON b_categories
  FOR DELETE USING (auth.uid() = user_id);

-- 개발환경에서는 개발모드 정책만 활성화하고, 프로덕션에서는 사용자별 정책 활성화
-- ALTER POLICY "Development mode - allow all" ON b_categories DISABLE; -- 프로덕션시 비활성화
```

---

## 4. 타입 정의 및 스키마

### 4.1 TypeScript 타입 정의
```typescript
// src/types/database.types.ts
export interface Database {
  public: {
    Tables: {
      b_categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
    };
    Enums: {
      category_type: 'group' | 'item';
    };
  };
}

// src/types/category.types.ts
export interface Category {
  id: string;
  name: string;
  type: 'group' | 'item';
  parent_id: string | null;
  order_index: number;
  slug: string;
  metadata: Record<string, any>;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryInsert {
  name: string;
  type: 'group' | 'item';
  parent_id?: string | null;
  order_index?: number;
  metadata?: Record<string, any>;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string;
  order_index?: number;
  metadata?: Record<string, any>;
  is_active?: boolean;
}

// src/types/api.types.ts
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  depth: number;
}

export interface CategoryFormData {
  name: string;
  type: 'group' | 'item';
  parent_id?: string;
  items?: string[]; // 다중 입력용 (하위 항목들)
}

export interface BulkCreateData {
  group_name: string;
  items: string[];
}

export interface DragDropItem {
  id: string;
  type: 'group' | 'item';
  parent_id?: string | null;
  order_index: number;
}

export interface ReorderData {
  source: {
    index: number;
    droppableId: string;
  };
  destination: {
    index: number;
    droppableId: string;
  };
  draggableId: string;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 4.2 Zod 스키마 검증
```typescript
// src/lib/validations/category.schema.ts
import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, '카테고리명을 입력해주세요')
    .max(100, '카테고리명은 100자 이하로 입력해주세요')
    .trim(),
  type: z.enum(['group', 'item']),
  parent_id: z.string().uuid().optional().nullable(),
  items: z.array(z.string().trim().min(1)).optional(), // 다중 입력용
});

// src/app/api/b-categories/bulk/route.ts - 다중 입력 API
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { group_name, items } = bulkCreateSchema.parse(body);
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // 트랜잭션으로 그룹과 하위 항목들을 일괄 생성
    const { data: group, error: groupError } = await supabase
      .from('b_categories')
      .insert({
        name: group_name,
        type: 'group',
        user_id: user.id,
        order_index: 0,
      })
      .select()
      .single();
    
    if (groupError) throw groupError;
    
    // 하위 항목들 생성
    const itemsToInsert = items.map((item, index) => ({
      name: item,
      type: 'item' as const,
      parent_id: group.id,
      user_id: user.id,
      order_index: index,
    }));
    
    const { data: createdItems, error: itemsError } = await supabase
      .from('b_categories')
      .insert(itemsToInsert)
      .select();
    
    if (itemsError) {
      // 롤백 - 그룹 삭제
      await supabase.from('b_categories').delete().eq('id', group.id);
      throw itemsError;
    }
    
    return NextResponse.json({
      data: { group, items: createdItems },
      error: null,
      message: 'Categories created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create categories', data: null, message: String(error) },
      { status: 500 }
    );
  }
});

// src/app/api/b-categories/reorder/route.ts - 드래그앤드롭
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { source, destination, draggableId } = dragDropSchema.parse(body);
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // 드래그 항목 정보 조회
    const { data: draggedItem } = await supabase
      .from('b_categories')
      .select('*')
      .eq('id', draggableId)
      .single();
    
    if (!draggedItem) {
      return NextResponse.json(
        { error: 'Item not found', data: null, message: 'Dragged item not found' },
        { status: 404 }
      );
    }
    
    // 순서 재정렬 로직
    await reorderCategories(supabase, {
      itemId: draggableId,
      sourceIndex: source.index,
      destinationIndex: destination.index,
      sourceParentId: source.droppableId === 'root' ? null : source.droppableId,
      destinationParentId: destination.droppableId === 'root' ? null : destination.droppableId,
    });
    
    return NextResponse.json({
      data: { success: true },
      error: null,
      message: 'Categories reordered successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reorder categories', data: null, message: String(error) },
      { status: 500 }
    );
  }
});

export const bulkCreateSchema = z.object({
  group_name: z.string().min(1, '그룹명을 입력해주세요').max(100).trim(),
  items: z
    .array(z.string().trim().min(1))
    .min(1, '최소 하나의 항목을 입력해주세요')
    .max(50, '최대 50개까지 입력 가능합니다'),
});

export const dragDropSchema = z.object({
  source: z.object({
    index: z.number(),
    droppableId: z.string(),
  }),
  destination: z.object({
    index: z.number(),
    droppableId: z.string(),
  }),
  draggableId: z.string(),
});

export const categoryUpdateSchema = categoryFormSchema.partial();

export const categoryReorderSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().uuid(),
      order_index: z.number().int().min(0),
    })
  ),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type CategoryUpdateData = z.infer<typeof categoryUpdateSchema>;
export type CategoryReorderData = z.infer<typeof categoryReorderSchema>;
```

---

## 5. API 설계

### 5.1 RESTful API 라우트 구조
```
GET    /api/b-categories              # 카테고리 목록 조회 (트리 구조)
POST   /api/b-categories              # 카테고리 생성
POST   /api/b-categories/bulk         # 그룹 + 다중 하위 항목 생성 
GET    /api/b-categories/[id]         # 특정 카테고리 조회
PATCH  /api/b-categories/[id]         # 카테고리 수정
DELETE /api/b-categories/[id]         # 카테고리 삭제
POST   /api/b-categories/reorder      # 드래그앤드롭 순서 변경
DELETE /api/b-categories              # 모든 카테고리 삭제 (초기화)
```

### 5.2 API Route 구현 예시
```typescript
// src/app/api/b-categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { categoryFormSchema } from '@/lib/validations/category.schema';
import { ratelimit } from '@/lib/rate-limit';
import { withAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    
    const supabase = createRouteHandlerClient({ cookies });
    
    let query = supabase
      .from('b_categories')
      .select('*')
      .order('order_index');
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch categories', data: null, message: error.message },
        { status: 500 }
      );
    }
    
    // Transform flat data to tree structure
    const treeData = buildCategoryTree(data);
    
    return NextResponse.json({
      data: treeData,
      error: null,
      message: 'Categories fetched successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', data: null, message: String(error) },
      { status: 500 }
    );
  }
}

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', data: null, message: 'Too many requests' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const validatedData = categoryFormSchema.parse(body);
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Calculate order_index
    const { data: siblings } = await supabase
      .from('b_categories')
      .select('order_index')
      .eq('type', validatedData.type)
      .eq('parent_id', validatedData.parent_id || null)
      .order('order_index', { ascending: false })
      .limit(1);
    
    const nextOrder = siblings?.[0]?.order_index ? siblings[0].order_index + 1 : 0;
    
    const { data, error } = await supabase
      .from('b_categories')
      .insert({
        ...validatedData,
        order_index: nextOrder,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create category', data: null, message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { data, error: null, message: 'Category created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', data: null, message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', data: null, message: String(error) },
      { status: 500 }
    );
  }
});
```

---

## 6. 클라이언트 상태 관리

### 6.1 React Query + Zustand 조합
```typescript
// src/lib/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCategoryStore } from '@/store/categoryStore';
import { categoryService } from '@/lib/services/categoryService';

export const useCategories = () => {
  const queryClient = useQueryClient();
  const { optimisticCategories, setOptimisticCategories } = useCategoryStore();
  
  const categoriesQuery = useQuery({
    queryKey: ['b-categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onMutate: async (newCategory) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['b-categories'] });
      const previousCategories = queryClient.getQueryData(['b-categories']);
      
      const optimisticCategory = {
        id: `temp-${Date.now()}`,
        ...newCategory,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['b-categories'], (old: any) => 
        old ? [...old, optimisticCategory] : [optimisticCategory]
      );
      
      return { previousCategories };
    },
    onError: (err, newCategory, context) => {
      queryClient.setQueryData(['b-categories'], context?.previousCategories);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['b-categories'] });
    },
  });
  
  // 다중입력 생성
  const bulkCreateMutation = useMutation({
    mutationFn: categoryService.bulkCreateCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b-categories'] });
    },
  });
  
  // 드래그앤드롭 순서 변경
  const reorderMutation = useMutation({
    mutationFn: categoryService.reorderCategories,
    onMutate: async (reorderData) => {
      await queryClient.cancelQueries({ queryKey: ['b-categories'] });
      const previousCategories = queryClient.getQueryData(['b-categories']);
      
      // Optimistic reorder update
      // 실제 재정렬 로직 구현
      
      return { previousCategories };
    },
    onError: (err, reorderData, context) => {
      queryClient.setQueryData(['b-categories'], context?.previousCategories);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['b-categories'] });
    },
  });
  
  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory: createMutation.mutate,
    isCreating: createMutation.isPending,
    bulkCreateCategories: bulkCreateMutation.mutate,
    isBulkCreating: bulkCreateMutation.isPending,
    reorderCategories: reorderMutation.mutate,
    isReordering: reorderMutation.isPending,
  };
};

// src/store/categoryStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
    (set, get) => ({
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
```

### 6.2 실시간 업데이트 (Supabase Realtime)
```typescript
// src/lib/hooks/useRealtimeCategories.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useRealtimeCategories = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('b-categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'b_categories',
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          // Invalidate and refetch categories
          queryClient.invalidateQueries({ queryKey: ['b-categories'] });
          
          // Optional: Show toast notification for external changes
          if (payload.eventType !== 'INSERT') {
            // Show notification only for updates/deletes from other users
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
```

---

## 7. 컴포넌트 설계

### 7.1 컴포넌트 계층구조
```
CategoryManager/
├── CategoryTree/
│   ├── CategoryGroup/
│   │   ├── CategoryGroupHeader/
│   │   └── CategoryItem/
│   └── EmptyState/
├── CategoryForm/
│   ├── CategoryFormFields/
│   └── CategoryFormActions/
├── CategoryActions/
│   ├── BulkActions/
│   └── SingleActions/
└── Modals/
    ├── CreateCategoryModal/
    ├── EditCategoryModal/
    ├── DeleteConfirmModal/
    └── BulkDeleteModal/
```

### 7.2 주요 컴포넌트 구현
```typescript
// src/components/categories/CategoryManager.tsx
'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DragDropContext } from '@hello-pangea/dnd';
import { CategoryTree } from './CategoryTree';
import { CategoryActions } from './CategoryActions';
import { BulkCreateModal } from './BulkCreateModal';
import { useRealtimeCategories } from '@/lib/hooks/useRealtimeCategories';
import { useCategories } from '@/lib/hooks/useCategories';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Book, Plus, Settings } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export function CategoryManager() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="category-theme">
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={<CategoryManagerError />}>
          <CategoryManagerContent />
        </ErrorBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function CategoryManagerContent() {
  useRealtimeCategories();
  const { reorderCategories } = useCategories();
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    reorderCategories({
      source: result.source,
      destination: result.destination,
      draggableId: result.draggableId,
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Book className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">성경 카테고리 관리</h1>
            </div>
            <CategoryActions />
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <React.Suspense fallback={<LoadingSpinner />}>
              <CategoryTree />
            </React.Suspense>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

// src/components/categories/CategoryTree.tsx
export function CategoryTree() {
  const { categories, isLoading, error } = useCategories();
  const { expandedGroups, toggleGroup } = useCategoryStore();
  
  if (isLoading) return <CategoryTreeSkeleton />;
  if (error) return <CategoryTreeError error={error} />;
  if (!categories.length) return <EmptyState />;
  
  const groupCategories = categories.filter(cat => cat.type === 'group');
  
  return (
    <div className="space-y-2">
      {groupCategories.map((group) => (
        <CategoryGroup
          key={group.id}
          group={group}
          isExpanded={expandedGroups.has(group.id)}
          onToggle={() => toggleGroup(group.id)}
          children={categories.filter(cat => cat.parent_id === group.id)}
        />
      ))}
    </div>
  );
}
```

---

## 8. 폼 관리 및 검증

### 8.1 React Hook Form + Zod 통합
```typescript
// src/components/categories/CategoryForm.tsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryFormSchema, CategoryFormData } from '@/lib/validations/category.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Plus, Trash2, Book, Scroll } from 'lucide-react';

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  groups?: Category[];
}

export function CategoryForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading,
  groups = [] 
}: CategoryFormProps) {
  const [isMultiMode, setIsMultiMode] = useState(false);
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'group',
      parent_id: initialData?.parent_id || null,
      items: [''],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedType = form.watch('type');
  
  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };
  
  const addBibleBooks = () => {
    const oldTestamentBooks = [
      '창세기', '출애굽기', '레위기', '민수기', '신명기', '여호수아', '사사기', '룻기',
      '사무엘상', '사무엘하', '열왕기상', '열왕기하', '역대상', '역대하', '에스라', '느헤미야',
      '에스더', '욥기', '시편', '잠언', '전도서', '아가서', '이사야', '예레미야', '예레미야애가',
      '에스겔', '다니엘', '호세아', '요엘', '아모스', '오바댜', '요나', '미가', '나훔', '하박국',
      '스바냐', '학개', '스가랴', '말라기'
    ];
    
    form.setValue('items', oldTestamentBooks);
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          label="그룹명"
          error={form.formState.errors.name}
          required
        >
          <div className="flex items-center space-x-2">
            <Book className="w-5 h-5 text-blue-400" />
            <Input
              {...form.register('name')}
              placeholder="예: 구약성경"
              autoFocus
              disabled={isLoading}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </FormField>
        
        <FormField
          label="타입"
          error={form.formState.errors.type}
          required
        >
          <Select
            value={watchedType}
            onValueChange={(value) => {
              form.setValue('type', value as 'group' | 'item');
              setIsMultiMode(value === 'group');
            }}
            disabled={isLoading}
            className="bg-gray-700 border-gray-600 text-white"
          >
            <option value="group">그룹 (성경 구분)</option>
            <option value="item">개별 항목</option>
          </Select>
        </FormField>
        
        {watchedType === 'item' && (
          <FormField
            label="상위 그룹"
            error={form.formState.errors.parent_id}
          >
            <Select
              value={form.watch('parent_id') || ''}
              onValueChange={(value) => form.setValue('parent_id', value || null)}
              disabled={isLoading}
              className="bg-gray-700 border-gray-600 text-white"
            >
              <option value="">그룹을 선택하세요</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}
        
        {isMultiMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">하위 항목들</label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addBibleBooks}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 border-blue-500"
                >
                  <Scroll className="w-4 h-4 mr-1" />
                  구약성경 자동입력
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => append('')}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 border-green-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  항목 추가
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Input
                    {...form.register(`items.${index}`)}
                    placeholder={`항목 ${index + 1}`}
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(index)}
                      disabled={isLoading}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isValid}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? '저장 중...' : isMultiMode ? '그룹 및 항목 생성' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## 9. 에러 핸들링 및 로딩 상태

### 9.1 에러 바운더리 및 에러 처리
```typescript
// src/components/ui/ErrorBoundary.tsx
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">문제가 발생했습니다</h2>
      <p className="text-gray-600 mb-4">
        {error.message || '알 수 없는 오류가 발생했습니다.'}
      </p>
      <Button
        onClick={resetErrorBoundary}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>다시 시도</span>
      </Button>
    </div>
  );
}

export function ErrorBoundary({ children, fallback }: { 
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
        // Send to error reporting service
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// src/lib/services/categoryService.ts
class CategoryService {
  async getCategories(): Promise<CategoryTreeNode[]> {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch categories');
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }
  
  async createCategory(data: CategoryFormData): Promise<Category> {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create category');
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }
}

export const categoryService = new CategoryService();
```

---

## 10. 성능 최적화

### 10.1 React Query 최적화 설정
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('401')) {
          return false; // Don't retry auth errors
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
        // Show toast notification
      },
    },
  },
});
```

### 10.2 컴포넌트 최적화
```typescript
// src/components/categories/CategoryItem.tsx
import React, { memo } from 'react';
import { useMemo, useCallback } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Book, FileText, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CategoryItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  index: number;
  isDragging?: boolean;
}

export const CategoryItem = memo(function CategoryItem({
  category,
  onEdit,
  onDelete,
  index,
  isDragging,
}: CategoryItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(category);
  }, [category, onEdit]);
  
  const handleDelete = useCallback(() => {
    onDelete(category.id);
  }, [category.id, onDelete]);
  
  const Icon = category.type === 'group' ? Book : FileText;
  const iconColor = category.type === 'group' ? 'text-blue-400' : 'text-green-400';
  
  return (
    <Draggable draggableId={category.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            flex items-center justify-between p-4 rounded-lg transition-all duration-200
            ${snapshot.isDragging 
              ? 'bg-gray-700 shadow-lg rotate-2 scale-105' 
              : 'bg-gray-800 hover:bg-gray-700'
            }
            ${category.type === 'group' ? 'border-l-4 border-blue-500' : 'border-l-4 border-green-500'}
          `}
        >
          <div className="flex items-center space-x-3">
            <div 
              {...provided.dragHandleProps}
              className="text-gray-400 hover:text-gray-300 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <span className="font-medium text-white">{category.name}</span>
            {category.type === 'group' && (
              <span className="px-2 py-1 text-xs bg-blue-600 text-blue-100 rounded-full">
                그룹
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              aria-label={`Edit ${category.name}`}
              className="text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              aria-label={`Delete ${category.name}`}
              className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );
});
```

---

## 11. 보안 고려사항

### 11.1 인증 및 권한 관리
```typescript
// src/lib/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function withAuth(handler: (request: NextRequest, context: { user: any }) => Promise<NextResponse>) {
  return async function (request: NextRequest): Promise<NextResponse> {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      
      if (error || !user) {
        return NextResponse.json(
          { error: 'Unauthorized', data: null, message: 'Authentication required' },
          { status: 401 }
        );
      }
      
      return handler(request, { user });
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal server error', data: null, message: String(error) },
        { status: 500 }
      );
    }
  };
}

// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
});
```

### 11.2 입력 검증 및 XSS 방지
```typescript
// src/lib/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export function validateCategoryName(name: string): boolean {
  const sanitized = sanitizeInput(name.trim());
  return sanitized.length > 0 && sanitized.length <= 100;
}
```

---

## 12. 테스팅 전략

### 12.1 단위 테스트
```typescript
// src/lib/services/__tests__/categoryService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from '../categoryService';

// Mock fetch
global.fetch = vi.fn();

describe('CategoryService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  describe('getCategories', () => {
    it('should fetch bible categories successfully', async () => {
      const mockCategories = [
        { id: '1', name: '구약성경', type: 'group' },
        { id: '2', name: '창세기', type: 'item', parent_id: '1' },
        { id: '3', name: '출애굽기', type: 'item', parent_id: '1' },
      ];
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCategories, error: null }),
      } as Response);
      
      const result = await categoryService.getCategories();
      
      expect(fetch).toHaveBeenCalledWith('/api/b-categories');
      expect(result).toEqual(mockCategories);
    });
    
    it('should throw error when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error', message: 'Internal error' }),
      } as Response);
      
      await expect(categoryService.getCategories()).rejects.toThrow('Internal error');
    });
  });
  
  describe('bulkCreateCategories', () => {
    it('should create group with multiple items', async () => {
      const bulkData = {
        group_name: '구약성경',
        items: ['창세기', '출애굽기', '레위기']
      };
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          data: { group: { id: '1', name: '구약성경' }, items: [] }, 
          error: null 
        }),
      } as Response);
      
      const result = await categoryService.bulkCreateCategories(bulkData);
      
      expect(fetch).toHaveBeenCalledWith('/api/b-categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData),
      });
    });
  });
});
```

### 12.2 컴포넌트 테스트
```typescript
// src/components/categories/__tests__/CategoryForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoryForm } from '../CategoryForm';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('CategoryForm', () => {
  it('should render form fields correctly', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();
    
    render(
      <CategoryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByLabelText('카테고리명')).toBeInTheDocument();
    expect(screen.getByLabelText('타입')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });
  
  it('should show validation errors for empty name', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();
    
    render(
      <CategoryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      { wrapper: createWrapper() }
    );
    
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    
    await waitFor(() => {
      expect(screen.getByText('카테고리명을 입력해주세요')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

### 12.3 E2E 테스트
```typescript
// tests/e2e/bible-categories.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Bible Category Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to categories page
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');
    await page.goto('/categories');
  });
  
  test('should create Old Testament group with bulk books', async ({ page }) => {
    await page.click('[data-testid=add-group-button]');
    await page.fill('[data-testid=group-name-input]', '구약성경');
    await page.click('[data-testid=auto-fill-old-testament]');
    await page.click('[data-testid=save-button]');
    
    await expect(page.locator('[data-testid=category-list]')).toContainText('구약성경');
    await expect(page.locator('[data-testid=category-list]')).toContainText('창세기');
    await expect(page.locator('[data-testid=category-list]')).toContainText('출애굽기');
  });
  
  test('should support drag and drop reordering', async ({ page }) => {
    // Create test categories first
    await page.click('[data-testid=add-group-button]');
    await page.fill('[data-testid=group-name-input]', '구약성경');
    await page.fill('[data-testid=items-input-0]', '창세기');
    await page.click('[data-testid=add-item-button]');
    await page.fill('[data-testid=items-input-1]', '출애굽기');
    await page.click('[data-testid=save-button]');
    
    // Test drag and drop
    const sourceItem = page.locator('[data-testid=draggable-item]').first();
    const targetItem = page.locator('[data-testid=draggable-item]').last();
    
    await sourceItem.dragTo(targetItem);
    
    // Verify order changed
    const firstItem = page.locator('[data-testid=category-item]').first();
    await expect(firstItem).toContainText('출애굽기');
  });
  
  test('should work in dark mode by default', async ({ page }) => {
    await expect(page.locator('body')).toHaveClass(/dark/);
    await expect(page.locator('[data-testid=main-container]')).toHaveCSS('background-color', 'rgb(17, 24, 39)');
  });
  
  test('should display proper icons for groups and items', async ({ page }) => {
    await page.click('[data-testid=add-group-button]');
    await page.fill('[data-testid=group-name-input]', '구약성경');
    await page.click('[data-testid=save-button]');
    
    // Check for Book icon on group
    await expect(page.locator('[data-testid=group-icon]')).toBeVisible();
    
    // Add item and check for FileText icon
    await page.click('[data-testid=add-item-button]');
    await page.fill('[data-testid=item-name-input]', '창세기');
    await page.selectOption('[data-testid=parent-select]', { label: '구약성경' });
    await page.click('[data-testid=save-button]');
    
    await expect(page.locator('[data-testid=item-icon]')).toBeVisible();
  });
});
```

---

## 13. 배포 및 환경 설정

### 13.1 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Rate limiting (optional)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
```

### 13.2 배포 최적화
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  images: {
    domains: ['your-supabase-url.supabase.co'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 14. 모니터링 및 로깅

### 14.1 에러 모니터링
```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

export function logError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error);
  Sentry.captureException(error, { extra: context });
}

export function logInfo(message: string, data?: Record<string, any>) {
  console.info(message, data);
  // Send to analytics service if needed
}
```

---

## 15. 확장성 고려사항

### 15.1 향후 확장 가능한 기능
- **다국어 지원**: i18n 대응을 위한 번역 테이블 구조
- **권한 관리**: 팀별/역할별 카테고리 접근 권한
- **카테고리 템플릿**: 미리 정의된 카테고리 구조 제공
- **대량 가져오기/내보내기**: CSV/Excel 파일 지원
- **카테고리 분석**: 사용 통계 및 인사이트 제공
- **API 공개**: 외부 시스템 연동을 위한 REST/GraphQL API

### 15.2 성능 확장성
- **캐싱 전략**: Redis 기반 다단계 캐싱
- **데이터베이스 최적화**: 인덱스 최적화, 쿼리 성능 튜닝
- **CDN 활용**: 정적 에셋 최적화
- **마이크로서비스**: 기능별 서비스 분리 가능성

---

## 16. 협업 및 개발 프로세스

### 16.1 코드 품질 관리
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 16.2 Git Workflow
```bash
# Branch naming convention
feature/category-management-ui
bugfix/category-deletion-error
hotfix/security-vulnerability

# Commit message convention
feat: add category reordering functionality
fix: resolve duplicate category name validation
docs: update API documentation
test: add unit tests for category service
```

---

## 17. 결론

이 PRD는 Next.js + Supabase 기반의 성경 카테고리 관리 시스템을 구축하기 위한 종합적인 가이드를 제공합니다. 

**핵심 특징:**
- **성경 구조 최적화**: 구약/신약 그룹과 성경책 하위 항목의 계층적 구조
- **다중입력 시스템**: 성경책들을 한번에 입력할 수 있는 벌크 생성 기능
- **직관적 드래그앤드롭**: @hello-pangea/dnd를 활용한 순서 변경
- **다크모드 UI**: 기본 다크테마와 Lucide 아이콘으로 현대적 인터페이스
- **타입 안전성**: TypeScript + Zod를 통한 엔드투엔드 타입 안전성
- **성능 최적화**: React Query + 낙관적 업데이트 + 실시간 동기화
- **확장성**: 모듈형 아키텍처 + 클린 코드 원칙
- **보안**: RLS (개발/프로덕션 정책) + 인증 + 입력 검증 + Rate Limiting
- **테스트 커버리지**: 단위/통합/E2E 테스트 전략
- **모니터링**: 에러 추적 + 성능 모니터링

**주요 개선사항:**
1. **테이블명**: `b_categories`로 명명하여 성경 카테고리 전용 구조
2. **개발모드**: 제한 없는 RLS 정책으로 개발 편의성 제공
3. **성경 구조**: 구약성경 → 창세기, 출애굽기 등의 실제 성경 구조 반영
4. **다중입력**: 성경책들을 배열로 한번에 입력하는 벌크 생성 API
5. **드래그앤드롭**: 직관적인 순서 변경으로 UX 향상
6. **다크모드**: 기본 다크테마로 현대적이고 눈에 편한 인터페이스
7. **Lucide 아이콘**: Book, Scroll, FileText 등 의미있는 아이콘 사용

이 설계를 바탕으로 성경 연구나 교육 목적의 전문적이고 사용자 친화적인 카테고리 관리 시스템을 구축할 수 있습니다.