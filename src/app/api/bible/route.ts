import { NextResponse } from 'next/server';

export async function GET() {
  // 성경 API 정상 동작 확인용
  return NextResponse.json({ message: '성경 API 정상 동작' });
} 