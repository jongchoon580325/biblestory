// b_categories 테이블 타입 정의 (Supabase 연동)

export interface Category {
  id: string;
  name: string;
  type: 'group' | 'item';
  parent_id: string | null;
  order_index: number;
  slug: string;
  metadata: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string;
  order_index?: number;
  metadata?: Record<string, unknown>;
  is_active?: boolean;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  depth: number;
}

export type CategoryType = 'group' | 'item'; 