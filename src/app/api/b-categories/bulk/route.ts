import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { bulkCreateSchema } from '@/types/category.schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { group_name, items } = bulkCreateSchema.parse(body);
    const supabase = createRouteHandlerClient({ cookies });
    // 그룹 생성
    const { data: group, error: groupError } = await supabase
      .from('b_categories')
      .insert({
        name: group_name,
        type: 'group',
        order_index: 0,
      })
      .select()
      .single();
    if (groupError) throw groupError;
    // 하위 항목들 생성
    const itemsToInsert = items.map((item, index) => ({
      name: item,
      type: 'item',
      parent_id: group.id,
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
    return NextResponse.json({ data: { group, items: createdItems }, error: null, message: 'Categories created successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create categories', data: null, message: String(error) }, { status: 500 });
  }
} 