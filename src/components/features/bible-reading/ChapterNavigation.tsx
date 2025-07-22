'use client';
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useBibleStore } from '@/stores/bibleStore';

export const ChapterNavigation = () => {
  const { 
    selectedBook, 
    selectedChapter,
    selectChapter
  } = useBibleStore();

  // 책과 장이 선택되지 않은 경우
  if (!selectedBook || !selectedChapter) {
    return null;
  }

  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      selectChapter(selectedChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < selectedBook.total_chapters) {
      selectChapter(selectedChapter + 1);
    }
  };

  const handleFirstChapter = () => {
    selectChapter(1);
  };

  const handleLastChapter = () => {
    selectChapter(selectedBook.total_chapters);
  };

  return (
    <div className="bg-slate-700/50 p-4 border-t border-slate-600/50">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 이전/첫 장 버튼 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFirstChapter}
            disabled={selectedChapter === 1}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="첫 장"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handlePreviousChapter}
            disabled={selectedChapter === 1}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="이전 장"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 중앙: 현재 장 정보 */}
        <div className="text-center">
          <div className="text-sm text-slate-400">
            {selectedBook.name} {selectedChapter}장
          </div>
          <div className="text-xs text-slate-500">
            {selectedChapter} / {selectedBook.total_chapters}장
          </div>
        </div>

        {/* 오른쪽: 다음/마지막 장 버튼 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNextChapter}
            disabled={selectedChapter === selectedBook.total_chapters}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="다음 장"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleLastChapter}
            disabled={selectedChapter === selectedBook.total_chapters}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="마지막 장"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}; 