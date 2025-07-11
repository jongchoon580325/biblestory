import { NextResponse } from 'next/server';

export async function GET() {
  // 진행상황 API 정상 동작 확인용
  return NextResponse.json({ message: '진행상황 API 정상 동작' });
} 