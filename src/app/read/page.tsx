'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book, Heart, Mail, Globe } from 'lucide-react';
import { useBibleStore } from '@/stores/bibleStore';
import { SidebarContainer } from '@/components/features/bible-reading/SidebarContainer';
import { ChapterTitle } from '@/components/features/bible-reading/ChapterTitle';
import { ChapterContent } from '@/components/features/bible-reading/ChapterContent';
import { ChapterNavigation } from '@/components/features/bible-reading/ChapterNavigation';
import { FullscreenModal } from '@/components/features/bible-reading/FullscreenModal';
import ScrollToTopButton from '@/components/features/ScrollToTopButton';

export default function ReadPage() {
  const { fetchCategories, selectedBook, selectedChapter, chapterContent } = useBibleStore();
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 전체보기 모달 열기
  const handleOpenFullscreen = () => {
    if (!chapterContent?.html_content) {
      console.warn('HTML 콘텐츠가 없습니다');
      return;
    }
    setIsFullscreenOpen(true);
  };

  // 전체보기 모달 닫기
  const handleCloseFullscreen = () => {
    setIsFullscreenOpen(false);
  };

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
              <Link href="/" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50">HOME</Link>
              <Link href="/read" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-blue-400 border border-blue-500/30 bg-blue-500/20">READ</Link>
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
                우리말 성경 읽기
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                하나님의 말씀을 읽는 자와 듣는 자가 복이 있습니다.(계 1:3)
              </p>
            </div>
          </div>

          {/* 성경읽기 레이아웃 */}
          <div className="flex gap-6 min-h-0" style={{ height: 'calc(100vh - 280px)' }}>
            {/* 왼쪽 사이드바 - 성경선택 */}
            <SidebarContainer />

            {/* 오른쪽 읽기 영역 */}
            <div className="flex-1 min-w-0 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden flex flex-col">
              {/* 상단 헤더 - 장 제목 */}
              <ChapterTitle onOpenFullscreen={handleOpenFullscreen} />

              {/* 본문 영역 - 장 콘텐츠 */}
              <ChapterContent />

              {/* 하단 네비게이션 */}
              <ChapterNavigation />
            </div>
          </div>
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

      {/* 전체보기 모달 - 최상위 레벨에서 렌더링 */}
      {chapterContent?.html_content && (
        <FullscreenModal
          isOpen={isFullscreenOpen}
          onClose={handleCloseFullscreen}
          content={chapterContent.html_content}
          title={`${selectedBook?.name} ${selectedChapter}장`}
        />
      )}

      {/* 위로가기(ScrollToTop) 플로팅 버튼 */}
      <ScrollToTopButton />
    </div>
  );
} 