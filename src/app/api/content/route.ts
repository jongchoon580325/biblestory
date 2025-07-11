import { NextResponse } from 'next/server';

export async function GET() {
  // 자료실 API 정상 동작 확인용
  return NextResponse.json({ message: '자료실 API 정상 동작' });
} 