'use client';
import React from 'react';
import { Maximize2 } from 'lucide-react';
import { useBibleStore } from '@/stores/bibleStore';

interface ChapterTitleProps {
  onOpenFullscreen: () => void;
}

export const ChapterTitle = ({ onOpenFullscreen }: ChapterTitleProps) => {
  const { selectedBook, selectedChapter } = useBibleStore();

  // 책과 장이 선택되지 않은 경우
  if (!selectedBook || !selectedChapter) {
    return (
      <div className="bg-slate-700/50 p-4 border-b border-slate-600/50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-300">
            책과 장을 선택해 주세요
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            왼쪽에서 구약/신약과 책, 장을 선택하세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/50 p-4 border-b border-slate-600/50">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 책/장 정보 */}
        <div className="flex-1">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {selectedBook.name} {selectedChapter}장
            </h2>
            <p className="text-sm text-slate-400">
              우리말 성경
            </p>
          </div>
        </div>

        {/* 오른쪽: 전체보기 버튼 */}
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 bg-slate-600/50 hover:bg-slate-500/50 rounded-lg transition-colors"
            onClick={onOpenFullscreen}
            title="새 모달에서 전체화면으로 보기 (ESC로 종료)"
          >
            <Maximize2 className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
}; 