'use client';

import { supabase } from './supabaseClient';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Supabase 연결 테스트 쿼리 (b_categories 테이블에서 1개 row 조회)
    const testSupabase = async () => {
      const { data, error } = await supabase.from('b_categories').select('*').limit(1);
      if (error) {
        console.error('[Supabase 연결 실패]', error);
      } else {
        console.log('[Supabase 연결 성공]', data);
      }
    };
    testSupabase();
  }, []);

  return (
    <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-8 w-full mx-auto" />
  );
}
