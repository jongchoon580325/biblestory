import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { categoryFormSchema } from '@/types/category.schema';
import { z } from 'zod';

// GET: 카테고리 목록 조회
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from('b_categories')
      .select('*')
      .order('order_index');
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch categories', data: null, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ data, error: null, message: 'Categories fetched successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', data: null, message: String(error) }, { status: 500 });
  }
}

// POST: 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = categoryFormSchema.parse(body);
    const supabase = createRouteHandlerClient({ cookies });
    // order_index 계산
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
      .insert({ ...validatedData, order_index: nextOrder })
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: 'Failed to create category', data: null, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ data, error: null, message: 'Category created successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', data: null, message: error.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', data: null, message: String(error) }, { status: 500 });
  }
}

// PATCH/DELETE 등은 추후 상세 구현 