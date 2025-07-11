import { NextResponse } from 'next/server';

export async function GET() {
  // 관리자 API 정상 동작 확인용
  return NextResponse.json({ message: '관리자 API 정상 동작' });
} 