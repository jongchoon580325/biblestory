import { create } from 'zustand';
import { fetchCategories, fetchBooksByCategory, fetchChapterContent } from '@/utils/bibleApi';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Book {
  id: string;
  name: string;
  category_id: string;
  total_chapters: number;
}

export interface ChapterContent {
  id: string;
  book_id: string;
  chapter_number: number;
  html_content: string;
  storage_path?: string;
}

interface BibleStore {
  // 상태
  categories: Category[];
  books: Book[];
  selectedCategory: Category | null;
  selectedBook: Book | null;
  selectedChapter: number | null;
  chapterContent: ChapterContent | null;
  loading: boolean;
  error: string | null;
  contentLoading: boolean;
  contentError: string | null;

  // 액션
  fetchCategories: () => Promise<void>;
  fetchBooksByCategory: (categoryId: string) => Promise<void>;
  selectCategory: (category: Category) => void;
  selectBook: (book: Book) => void;
  selectChapter: (chapterNumber: number) => void;
  fetchChapterContent: (bookId: string, chapterNumber: number) => Promise<void>;
  clearError: () => void;
  clearContentError: () => void;
}

export const useBibleStore = create<BibleStore>((set, get) => ({
  // 초기 상태
  categories: [],
  books: [],
  selectedCategory: null,
  selectedBook: null,
  selectedChapter: null,
  chapterContent: null,
  loading: false,
  error: null,
  contentLoading: false,
  contentError: null,

  // 카테고리 목록 가져오기
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await fetchCategories();
      set({ categories, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '카테고리를 불러오는데 실패했습니다.', 
        loading: false 
      });
    }
  },

  // 카테고리별 책 목록 가져오기
  fetchBooksByCategory: async (categoryId: string) => {
    set({ loading: true, error: null });
    try {
      const books = await fetchBooksByCategory(categoryId);
      set({ books, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '책 목록을 불러오는데 실패했습니다.', 
        loading: false 
      });
    }
  },

  // 카테고리 선택
  selectCategory: (category: Category) => {
    set({ 
      selectedCategory: category,
      selectedBook: null,
      selectedChapter: null,
      chapterContent: null,
      contentError: null
    });
    get().fetchBooksByCategory(category.id);
  },

  // 책 선택
  selectBook: (book: Book) => {
    set({ 
      selectedBook: book,
      selectedChapter: 1, // 첫 번째 장으로 자동 설정
      chapterContent: null,
      contentError: null
    });
    // 책이 변경되면 첫 번째 장의 콘텐츠를 자동으로 가져오기
    get().fetchChapterContent(book.id, 1);
  },

  // 장 선택
  selectChapter: (chapterNumber: number) => {
    const { selectedBook } = get();
    if (!selectedBook) return;

    set({ 
      selectedChapter: chapterNumber,
      chapterContent: null,
      contentError: null
    });
    get().fetchChapterContent(selectedBook.id, chapterNumber);
  },

  // 장 콘텐츠 가져오기
  fetchChapterContent: async (bookId: string, chapterNumber: number) => {
    set({ contentLoading: true, contentError: null });
    try {
      const content = await fetchChapterContent(bookId, chapterNumber);
      set({ chapterContent: content, contentLoading: false });
    } catch (error) {
      set({ 
        contentError: error instanceof Error ? error.message : '장 콘텐츠를 불러오는데 실패했습니다.', 
        contentLoading: false 
      });
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
  clearContentError: () => set({ contentError: null })
})); 