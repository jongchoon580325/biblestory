import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { dragDropSchema } from '@/types/category.schema';

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Item not found', data: null, message: 'Dragged item not found' }, { status: 404 });
    }
    // 순서 재정렬: 같은 부모 내에서만 처리(기본)
    const { data: siblings, error: siblingsError } = await supabase
      .from('b_categories')
      .select('id, order_index')
      .eq('parent_id', draggedItem.parent_id)
      .order('order_index');
    if (siblingsError) {
      return NextResponse.json({ error: 'Failed to fetch siblings', data: null, message: siblingsError.message }, { status: 500 });
    }
    // 순서 재배치
    const updated = [...siblings];
    const from = source.index;
    const to = destination.index;
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    // order_index 일괄 업데이트
    for (let i = 0; i < updated.length; i++) {
      await supabase.from('b_categories').update({ order_index: i }).eq('id', updated[i].id);
    }
    return NextResponse.json({ data: { success: true }, error: null, message: 'Categories reordered successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder categories', data: null, message: String(error) }, { status: 500 });
  }
} 