'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Book, Database, Heart, Mail, Bookmark, Globe } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import ScrollToTopButton from '@/components/features/ScrollToTopButton';
import { 
  extractBookFromFileName, 
  getOldTestamentBooks, 
  getNewTestamentBooks,
} from '@/utils/bibleMapping';

// 기존 하드코딩된 배열 제거
// const oldTestament = [...];
// const newTestament = [...];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'구약' | '신약'>('구약');
  const [availableBooks, setAvailableBooks] = useState<{
    구약: { name: string; count: number }[];
    신약: { name: string; count: number }[];
  }>({ 구약: [], 신약: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableBooks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
        }
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // b_materials 테이블에서 모든 파일명 가져오기
        const { data: materials, error: fetchError } = await supabase
          .from('b_materials')
          .select('file_name')
          .order('file_name');
        
        if (fetchError) {
          throw new Error(`데이터 가져오기 실패: ${fetchError.message}`);
        }
        
        // 파일명에서 책명 추출 및 분류 (개수 포함)
        const 구약: { [key: string]: number } = {};
        const 신약: { [key: string]: number } = {};
        
        materials?.forEach(material => {
          const bookInfo = extractBookFromFileName(material.file_name);
          if (bookInfo) {
            if (bookInfo.testament === '구약') {
              구약[bookInfo.koreanName] = (구약[bookInfo.koreanName] || 0) + 1;
            } else {
              신약[bookInfo.koreanName] = (신약[bookInfo.koreanName] || 0) + 1;
            }
          }
        });
        
        // 성경 순서대로 정렬
        const sortByBibleOrder = (books: { [key: string]: number }) => {
          const allOldTestament = getOldTestamentBooks();
          const allNewTestament = getNewTestamentBooks();
          
          return Object.entries(books)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => {
              const aIndex = allOldTestament.indexOf(a.name);
              const bIndex = allOldTestament.indexOf(b.name);
              if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
              
              const aNewIndex = allNewTestament.indexOf(a.name);
              const bNewIndex = allNewTestament.indexOf(b.name);
              if (aNewIndex !== -1 && bNewIndex !== -1) return aNewIndex - bNewIndex;
              
              return 0;
            });
        };
        
        setAvailableBooks({
          구약: sortByBibleOrder(구약),
          신약: sortByBibleOrder(신약)
        });
        
      } catch (err) {
        console.error('책 목록 가져오기 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        
        // 오류 시 기본값 설정 (현재는 빈 배열)
        setAvailableBooks({ 구약: [], 신약: [] });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableBooks();
  }, []);

  const books = availableBooks[activeTab];
  const totalOldTestament = availableBooks.구약.length;
  const totalNewTestament = availableBooks.신약.length;

  return (
    <div className="min-h-screen bg-slate-900" style={{ backgroundColor: '#292828' }}>
      {/* 배경 그라데이션 */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-slate-900/10 pointer-events-none" />
      
      {/* 네비게이션 */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 group outline-none focus:ring-2 focus:ring-blue-400 rounded-xl transition">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:underline">
                  Bible Room Study
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              <Link href="/" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-blue-400 border border-blue-500/30 bg-blue-500/20">HOME</Link>
              <Link href="/read" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50">READ</Link>
              <Link href="/data" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50">DATA</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 relative">
        <div className="space-y-8">
          {/* 스티키 헤더 섹션 */}
          <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 -mx-6 px-6 py-4">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Bible Room Study
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                하나님의 말씀을 깊이 있게 공부하는 개인 성경 공부실입니다.
              </p>
            </div>
          </div>


          
          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-8">
              <div className="text-slate-400">데이터를 불러오는 중...</div>
            </div>
          )}
          
          {/* 오류 상태 */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-400 mb-4">오류: {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                다시 시도
              </button>
            </div>
          )}
          
          {/* 메인 콘텐츠 (로딩/오류가 아닐 때만 표시) */}
          {!loading && !error && (
            <>
              {/* 탭 네비게이션 */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">
                <div className="flex space-x-2">
                  {['구약', '신약'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as '구약' | '신약')}
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        activeTab === tab
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      {tab} ({tab === '구약' ? totalOldTestament : totalNewTestament}권)
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 탭별 통계 카드 */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Book className="w-10 h-10 text-blue-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">{totalOldTestament}권</p>
                        <p className="text-blue-400 text-sm">구약 책</p>
                      </div>
                    </div>
                    {/* 구약 총 자료수 표시 */}
                    <div className="text-right">
                      <div className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                        <span className="text-green-400 text-sm font-medium">
                          총 자료수 {availableBooks.구약.reduce((sum, book) => sum + book.count, 0)} 개
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Database className="w-10 h-10 text-purple-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">{totalNewTestament}권</p>
                        <p className="text-purple-400 text-sm">신약 책</p>
                      </div>
                    </div>
                    {/* 신약 총 자료수 표시 */}
                    <div className="text-right">
                      <div className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                        <span className="text-green-400 text-sm font-medium">
                          총 자료수 {availableBooks.신약.reduce((sum, book) => sum + book.count, 0)} 개
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 책 그리드 */}
              {books.length > 0 ? (
                <div className="grid grid-cols-5 gap-4">
                  {books.map((book) => (
                    <Link
                      key={book.name}
                      href={`/books/${encodeURIComponent(book.name)}`}
                      className={
                        'group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden'
                      }
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-xl" />
                      <div className="relative z-10 text-center">
                        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3 rounded-lg mx-auto w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Bookmark className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-lg mb-2">
                          {book.name}
                        </h3>
                        {/* 자료 개수 표시 */}
                        <div className="inline-flex items-center justify-center px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                          <span className="text-green-400 text-sm font-medium">
                            자료수 {book.count} 개
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 text-lg mb-4">
                    {activeTab}에 해당하는 자료가 아직 없습니다.
                  </div>
                  <p className="text-slate-500">
                    파일을 업로드하면 해당 책이 여기에 표시됩니다.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="mt-16 border-t border-slate-700/50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <Globe className="w-4 h-4" />
            <span>Your Personal Bible Room Study, Built with</span>
            <Heart className="w-4 h-4 text-red-400 fill-current" />
            <span>by 나종춘</span>
            <span>|</span>
            <a 
              href="mailto:najongchoon@gmail.com" 
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>najongchoon@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>
      {/* 위로가기(ScrollToTop) 플로팅 버튼 */}
      <ScrollToTopButton />
    </div>
  );
}
