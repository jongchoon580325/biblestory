'use client';
import React, { useEffect } from 'react';
import { useBibleStore, Category, Book } from '@/stores/bibleStore';
import { Loader2 } from 'lucide-react';

// 구약/신약 토글 컴포넌트
const TestamentToggle = ({ 
  oldTestament, 
  newTestament, 
  selectedCategory, 
  onSelectCategory 
}: {
  oldTestament: Category[];
  newTestament: Category[];
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">성경 선택</h3>
      <div className="flex bg-slate-700/50 rounded-lg p-1">
        <button 
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            selectedCategory?.name === '구약'
              ? 'text-white bg-blue-600' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          onClick={() => {
            if (oldTestament.length > 0) {
              onSelectCategory(oldTestament[0]);
            }
          }}
        >
          구약
        </button>
        <button 
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            selectedCategory?.name === '신약'
              ? 'text-white bg-blue-600' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          onClick={() => {
            if (newTestament.length > 0) {
              onSelectCategory(newTestament[0]);
            }
          }}
        >
          신약
        </button>
      </div>
    </div>
  );
};

// 책 목록 컴포넌트
const BookList = ({ 
  books, 
  selectedBook, 
  onSelectBook, 
  loading 
}: {
  books: Book[];
  selectedBook: Book | null;
  onSelectBook: (book: Book) => void;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300">책 선택</h4>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300">책 선택</h4>
        <div className="text-center py-8 text-slate-400 text-sm">
          구약/신약을 선택해 주세요
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-300">책 선택</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
        {books.map((book) => (
          <button
            key={book.id}
            className={`py-2 px-2 rounded-md text-xs transition-colors text-center ${
              selectedBook?.id === book.id
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            onClick={() => onSelectBook(book)}
          >
            {book.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// 장 목록 컴포넌트
const ChapterList = ({ 
  selectedBook,
  selectedChapter,
  onSelectChapter
}: {
  selectedBook: Book | null;
  selectedChapter: number | null;
  onSelectChapter: (chapter: number) => void;
}) => {
  if (!selectedBook) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300">장 선택</h4>
        <div className="text-center py-8 text-slate-400 text-sm">
          책을 선택해 주세요
        </div>
      </div>
    );
  }

  const chapters = Array.from({ length: selectedBook.total_chapters }, (_, i) => i + 1);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-300">
        장 선택 ({selectedBook.total_chapters}장)
      </h4>
      <div className="grid grid-cols-8 gap-1 h-32 overflow-y-auto pr-2">
        {chapters.map((chapter) => (
          <button
            key={chapter}
            className={`py-2 px-1 rounded text-xs transition-colors ${
              selectedChapter === chapter
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            onClick={() => onSelectChapter(chapter)}
          >
            {chapter}
          </button>
        ))}
      </div>
    </div>
  );
};

// 메인 사이드바 컨테이너
export const SidebarContainer = () => {
  const { 
    categories, 
    books, 
    selectedCategory, 
    selectedBook,
    selectedChapter,
    loading,
    error,
    fetchCategories,
    selectCategory,
    selectBook,
    selectChapter
  } = useBibleStore();
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // 카테고리 로딩 완료 후 구약 자동 선택
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      const oldTestament = categories.find(cat => cat.name === '구약');
      if (oldTestament) {
        selectCategory(oldTestament);
      }
    }
  }, [categories, selectedCategory, selectCategory]);
  
  // 구약/신약 분류 (name 기준)
  const oldTestament = categories.filter(cat => cat.name === '구약');
  const newTestament = categories.filter(cat => cat.name === '신약');
  
  return (
    <div className="w-80 flex-shrink-0 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
      <div className="space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        {/* 구약/신약 토글 */}
        <TestamentToggle 
          oldTestament={oldTestament}
          newTestament={newTestament}
          selectedCategory={selectedCategory}
          onSelectCategory={selectCategory}
        />
        
        {/* 책 목록 */}
        <BookList 
          books={books}
          selectedBook={selectedBook}
          onSelectBook={selectBook}
          loading={loading}
        />
        
        {/* 장 목록 */}
        <ChapterList 
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          onSelectChapter={selectChapter}
        />
      </div>
    </div>
  );
}; 