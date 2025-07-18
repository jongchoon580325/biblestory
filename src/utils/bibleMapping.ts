// 성경 파일명 매핑 및 분류 로직
export interface BibleBook {
  englishName: string;    // 파일명에서 추출되는 영어 이름 (genesis, exodus 등)
  koreanName: string;     // 한글 책명 (창세기, 출애굽기 등)
  testament: '구약' | '신약';  // 구약/신약 분류
  order: number;          // 성경 내 순서
}

// 전체 성경 책 매핑 데이터
export const BIBLE_BOOKS: BibleBook[] = [
  // 구약 (39권)
  { englishName: 'genesis', koreanName: '창세기', testament: '구약', order: 1 },
  { englishName: 'exodus', koreanName: '출애굽기', testament: '구약', order: 2 },
  { englishName: 'leviticus', koreanName: '레위기', testament: '구약', order: 3 },
  { englishName: 'numbers', koreanName: '민수기', testament: '구약', order: 4 },
  { englishName: 'deuteronomy', koreanName: '신명기', testament: '구약', order: 5 },
  { englishName: 'joshua', koreanName: '여호수아', testament: '구약', order: 6 },
  { englishName: 'judges', koreanName: '사사기', testament: '구약', order: 7 },
  { englishName: 'ruth', koreanName: '룻기', testament: '구약', order: 8 },
  { englishName: 'samuel1', koreanName: '사무엘상', testament: '구약', order: 9 },
  { englishName: 'samuel2', koreanName: '사무엘하', testament: '구약', order: 10 },
  { englishName: 'kings1', koreanName: '열왕기상', testament: '구약', order: 11 },
  { englishName: 'kings2', koreanName: '열왕기하', testament: '구약', order: 12 },
  { englishName: 'chronicles1', koreanName: '역대상', testament: '구약', order: 13 },
  { englishName: 'chronicles2', koreanName: '역대하', testament: '구약', order: 14 },
  { englishName: 'ezra', koreanName: '에스라', testament: '구약', order: 15 },
  { englishName: 'nehemiah', koreanName: '느헤미야', testament: '구약', order: 16 },
  { englishName: 'esther', koreanName: '에스더', testament: '구약', order: 17 },
  { englishName: 'job', koreanName: '욥기', testament: '구약', order: 18 },
  { englishName: 'psalms', koreanName: '시편', testament: '구약', order: 19 },
  { englishName: 'proverbs', koreanName: '잠언', testament: '구약', order: 20 },
  { englishName: 'ecclesiastes', koreanName: '전도서', testament: '구약', order: 21 },
  { englishName: 'song', koreanName: '아가', testament: '구약', order: 22 },
  { englishName: 'isaiah', koreanName: '이사야', testament: '구약', order: 23 },
  { englishName: 'jeremiah', koreanName: '예레미야', testament: '구약', order: 24 },
  { englishName: 'lamentations', koreanName: '예레미야애가', testament: '구약', order: 25 },
  { englishName: 'ezekiel', koreanName: '에스겔', testament: '구약', order: 26 },
  { englishName: 'daniel', koreanName: '다니엘', testament: '구약', order: 27 },
  { englishName: 'hosea', koreanName: '호세아', testament: '구약', order: 28 },
  { englishName: 'joel', koreanName: '요엘', testament: '구약', order: 29 },
  { englishName: 'amos', koreanName: '아모스', testament: '구약', order: 30 },
  { englishName: 'obadiah', koreanName: '오바댜', testament: '구약', order: 31 },
  { englishName: 'jonah', koreanName: '요나', testament: '구약', order: 32 },
  { englishName: 'micah', koreanName: '미가', testament: '구약', order: 33 },
  { englishName: 'nahum', koreanName: '나훔', testament: '구약', order: 34 },
  { englishName: 'habakkuk', koreanName: '하박국', testament: '구약', order: 35 },
  { englishName: 'zephaniah', koreanName: '스바냐', testament: '구약', order: 36 },
  { englishName: 'haggai', koreanName: '학개', testament: '구약', order: 37 },
  { englishName: 'zechariah', koreanName: '스가랴', testament: '구약', order: 38 },
  { englishName: 'malachi', koreanName: '말라기', testament: '구약', order: 39 },
  
  // 신약 (27권)
  { englishName: 'matthew', koreanName: '마태복음', testament: '신약', order: 40 },
  { englishName: 'mark', koreanName: '마가복음', testament: '신약', order: 41 },
  { englishName: 'luke', koreanName: '누가복음', testament: '신약', order: 42 },
  { englishName: 'john', koreanName: '요한복음', testament: '신약', order: 43 },
  { englishName: 'acts', koreanName: '사도행전', testament: '신약', order: 44 },
  { englishName: 'romans', koreanName: '로마서', testament: '신약', order: 45 },
  { englishName: 'corinthians1', koreanName: '고린도전서', testament: '신약', order: 46 },
  { englishName: 'corinthians2', koreanName: '고린도후서', testament: '신약', order: 47 },
  { englishName: 'galatians', koreanName: '갈라디아서', testament: '신약', order: 48 },
  { englishName: 'ephesians', koreanName: '에베소서', testament: '신약', order: 49 },
  { englishName: 'philippians', koreanName: '빌립보서', testament: '신약', order: 50 },
  { englishName: 'colossians', koreanName: '골로새서', testament: '신약', order: 51 },
  { englishName: 'thessalonians1', koreanName: '데살로니가전서', testament: '신약', order: 52 },
  { englishName: 'thessalonians2', koreanName: '데살로니가후서', testament: '신약', order: 53 },
  { englishName: 'timothy1', koreanName: '디모데전서', testament: '신약', order: 54 },
  { englishName: 'timothy2', koreanName: '디모데후서', testament: '신약', order: 55 },
  { englishName: 'titus', koreanName: '디도서', testament: '신약', order: 56 },
  { englishName: 'philemon', koreanName: '빌레몬서', testament: '신약', order: 57 },
  { englishName: 'hebrews', koreanName: '히브리서', testament: '신약', order: 58 },
  { englishName: 'james', koreanName: '야고보서', testament: '신약', order: 59 },
  { englishName: 'peter1', koreanName: '베드로전서', testament: '신약', order: 60 },
  { englishName: 'peter2', koreanName: '베드로후서', testament: '신약', order: 61 },
  { englishName: 'john1', koreanName: '요한일서', testament: '신약', order: 62 },
  { englishName: 'john2', koreanName: '요한이서', testament: '신약', order: 63 },
  { englishName: 'john3', koreanName: '요한삼서', testament: '신약', order: 64 },
  { englishName: 'jude', koreanName: '유다서', testament: '신약', order: 65 },
  { englishName: 'revelation', koreanName: '요한계시록', testament: '신약', order: 66 }
];

// 파일명에서 책명 추출 함수
export function extractBookFromFileName(fileName: string): BibleBook | null {
  // 파일명 패턴: 01-genesis-01.html, 25-exodus_02.html, 001-psalms-001.html, 150-psalms-150.html 등
  // 2자리 또는 3자리 숫자 접두사 다음의 책명 부분만 캡처 (언더스코어나 하이픈 이전까지)
  const match = fileName.match(/[0-9]{2,3}-([a-zA-Z0-9]+)(?:[-_][a-zA-Z0-9]+)?\.html/);
  if (!match) return null;
  
  const englishName = match[1].toLowerCase();
  return BIBLE_BOOKS.find(book => book.englishName === englishName) || null;
}

// 한글 책명으로 BibleBook 찾기
export function findBookByKoreanName(koreanName: string): BibleBook | null {
  return BIBLE_BOOKS.find(book => book.koreanName === koreanName) || null;
}

// 영어 이름으로 BibleBook 찾기
export function findBookByEnglishName(englishName: string): BibleBook | null {
  return BIBLE_BOOKS.find(book => book.englishName === englishName.toLowerCase()) || null;
}

// 구약/신약별 책 목록 반환
export function getBooksByTestament(testament: '구약' | '신약'): BibleBook[] {
  return BIBLE_BOOKS.filter(book => book.testament === testament);
}

// 구약 책 목록 (한글명만)
export function getOldTestamentBooks(): string[] {
  return getBooksByTestament('구약').map(book => book.koreanName);
}

// 신약 책 목록 (한글명만)
export function getNewTestamentBooks(): string[] {
  return getBooksByTestament('신약').map(book => book.koreanName);
}

// 특정 책의 구약/신약 분류 확인
export function getTestamentByKoreanName(koreanName: string): '구약' | '신약' | null {
  const book = findBookByKoreanName(koreanName);
  return book ? book.testament : null;
}

// 파일명이 유효한 성경 파일인지 확인
export function isValidBibleFile(fileName: string): boolean {
  return extractBookFromFileName(fileName) !== null;
} 