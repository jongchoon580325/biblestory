import { supabase } from './supabaseClient';
import { getBookData } from './bibleData';

// 카테고리 인터페이스
export interface Category {
  id: string;
  name: string;
  parent_id: string | null; // 구약/신약 구분 (null이면 그룹, 있으면 책)
  order: number;
  created_at: string;
}

// 책 인터페이스
export interface Book {
  id: string;
  category_id: string;
  name: string;
  name_english: string;
  total_chapters: number;
  order: number;
  is_active: boolean;
}

// 장 콘텐츠 인터페이스
export interface ChapterContent {
  id: string;
  book_id: string;
  chapter_number: number;
  html_content: string;
  file_name: string;
  storage_path: string;
  created_at: string;
}

// 카테고리 목록 조회 (구약/신약 그룹만)
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .is('parent_id', null)
      .order('order');
    
    if (error) {
      console.error('카테고리 조회 오류:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    throw error;
  }
};

// 카테고리별 책 목록 조회
export const fetchBooksByCategory = async (categoryId: string): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .eq('parent_id', categoryId)
      .order('order');
    
    if (error) {
      console.error('책 목록 조회 오류:', error);
      throw error;
    }
    
    // Category를 Book으로 변환
    const books: Book[] = (data || []).map(category => {
      const bookData = getBookData(category.name);
      return {
        id: category.id,
        category_id: category.parent_id!,
        name: category.name,
        name_english: bookData.nameEnglish,
        total_chapters: bookData.totalChapters,
        order: category.order,
        is_active: true
      };
    });
    
    return books;
  } catch (error) {
    console.error('책 목록 조회 실패:', error);
    throw error;
  }
};

// 모든 책 목록 조회 (캐싱용)
export const fetchAllBooks = async (): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .not('parent_id', 'is', null)
      .order('order');
    
    if (error) {
      console.error('전체 책 목록 조회 오류:', error);
      throw error;
    }
    
    // Category를 Book으로 변환
    const books: Book[] = (data || []).map(category => {
      const bookData = getBookData(category.name);
      return {
        id: category.id,
        category_id: category.parent_id!,
        name: category.name,
        name_english: bookData.nameEnglish,
        total_chapters: bookData.totalChapters,
        order: category.order,
        is_active: true
      };
    });
    
    return books;
  } catch (error) {
    console.error('전체 책 목록 조회 실패:', error);
    throw error;
  }
}; 

// 장 콘텐츠 조회
export const fetchChapterContent = async (bookId: string, chapterNumber: number): Promise<ChapterContent | null> => {
  try {
    const { data, error } = await supabase
      .from('rb_bible_chapters')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter_number', chapterNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // 데이터가 없는 경우
        console.log(`장 콘텐츠 없음: bookId=${bookId}, chapter=${chapterNumber}`);
        return null;
      }
      console.error('장 콘텐츠 조회 오류:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('장 콘텐츠 조회 실패:', error);
    throw error;
  }
}; 