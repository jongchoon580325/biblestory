'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/supabaseClient';

// 성경 책, 장, 본문 데이터 타입 정의
interface BibleBook {
  id: string;
  name: string;
  nameEnglish: string;
  abbreviation: string;
  sortOrder: number;
  totalChapters: number;
}

interface BibleChapterData {
  id: string;
  book_id: string;
  chapter_number: number;
  verses: string[];
  metadata: {
    title: string;
    subtitle: string;
    estimated_reading_time: number;
    word_count: number;
  };
}

// BibleReader 컴포넌트 Props
interface BibleReaderProps {
  initialCategory?: 'old-testament' | 'new-testament';
}

/**
 * BibleReader - 성경읽기 엔진 컴포넌트(최초 버전)
 * - 구약/신약, 책, 장 선택 네비게이션
 * - 본문 표시, 진도 표시(진행률)
 * - Supabase 연동
 * - Tailwind CSS 스타일, 접근성 고려
 */
export default function BibleReader({ initialCategory = 'old-testament' }: BibleReaderProps) {
  // 상태: 카테고리, 책, 장, 본문, 로딩, 에러
  const [category, setCategory] = useState<'old-testament' | 'new-testament'>(initialCategory);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [chapterCount, setChapterCount] = useState<number>(0);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리(구약/신약)별 책 목록 불러오기
  useEffect(() => {
    setLoading(true);
    supabase
      .from('b_bible_books')
      .select('*')
      .eq('category_id', category === 'old-testament' ? 'old-testament' : 'new-testament')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError('성경 책 목록을 불러오지 못했습니다.');
          setBooks([]);
        } else {
          setBooks(data || []);
          setSelectedBook(data && data.length > 0 ? data[0] : null);
        }
        setLoading(false);
      });
  }, [category]);

  // 책 선택 시 장 수 초기화
  useEffect(() => {
    if (selectedBook) {
      setChapterCount(selectedBook.totalChapters);
      setSelectedChapter(1);
    }
  }, [selectedBook]);

  // 장 선택 시 본문 데이터 불러오기
  useEffect(() => {
    if (!selectedBook) return;
    setLoading(true);
    supabase
      .from('b_bible_contents')
      .select('*')
      .eq('bible_book_id', selectedBook.id)
      .eq('chapter_number', selectedChapter)
      .eq('status', 'published')
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError('본문 데이터를 불러오지 못했습니다.');
          setChapterData(null);
        } else {
          // 구절 파싱(예시: <p>1. 태초에 ...</p> → 배열)
          const verses = data.html_content
            ? data.html_content.split(/<p[^>]*>/).map((v: string) => v.replace(/<\/p>/g, '').trim()).filter(Boolean)
            : [];
          setChapterData({
            id: data.id,
            book_id: data.bible_book_id,
            chapter_number: data.chapter_number,
            verses,
            metadata: {
              title: data.title,
              subtitle: data.subtitle || '',
              estimated_reading_time: data.estimated_reading_time || 0,
              word_count: data.word_count || 0,
            },
          });
        }
        setLoading(false);
      });
  }, [selectedBook, selectedChapter]);

  // 진도(진행률) 계산 예시(구현 확장 가능)
  const progress = chapterData && chapterData.verses.length > 0 ? 100 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-[var(--bg-card)] text-[var(--text-primary)] dark:bg-black dark:text-white rounded-lg shadow-md">
      {/* 카테고리 토글 */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded font-semibold transition-colors duration-150 ${category === 'old-testament' ? 'bg-blue-500 text-white' : 'bg-transparent text-[var(--text-primary)] dark:text-white border border-gray-300 dark:border-gray-600'}`}
          onClick={() => setCategory('old-testament')}
          aria-pressed={category === 'old-testament'}
        >
          구약
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold transition-colors duration-150 ${category === 'new-testament' ? 'bg-blue-500 text-white' : 'bg-transparent text-[var(--text-primary)] dark:text-white border border-gray-300 dark:border-gray-600'}`}
          onClick={() => setCategory('new-testament')}
          aria-pressed={category === 'new-testament'}
        >
          신약
        </button>
      </div>
      {/* 책 선택 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {books.map((book) => (
          <button
            key={book.id}
            className={`px-3 py-1 rounded text-sm ${selectedBook?.id === book.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)]'}`}
            onClick={() => setSelectedBook(book)}
            aria-pressed={selectedBook?.id === book.id}
          >
            {book.name}
          </button>
        ))}
      </div>
      {/* 장 선택 */}
      {chapterCount > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`px-2 py-1 rounded text-xs ${selectedChapter === num ? 'bg-blue-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-[var(--text-primary)]'}`}
              onClick={() => setSelectedChapter(num)}
              aria-pressed={selectedChapter === num}
            >
              {num}장
            </button>
          ))}
        </div>
      )}
      {/* 본문 표시 */}
      <div className="min-h-[200px] bg-[var(--bg-secondary)] dark:bg-gray-900 rounded p-4 mb-4 text-[var(--text-primary)]">
        {loading && <div className="text-center text-gray-400">로딩 중...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {chapterData && (
          <>
            <h2 className="text-lg font-bold mb-2">{chapterData.metadata.title} {chapterData.chapter_number}장</h2>
            <div className="text-sm text-gray-500 mb-2">{chapterData.metadata.subtitle}</div>
            <ol className="list-decimal pl-5 space-y-1">
              {chapterData.verses.map((verse, idx) => (
                <li key={idx} className="leading-relaxed">{verse}</li>
              ))}
            </ol>
          </>
        )}
      </div>
      {/* 진도 표시(예시) */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded mb-2">
        <div
          className="h-2 bg-blue-500 rounded"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="text-xs text-right text-gray-400">진도: {progress}%</div>
    </div>
  );
} 