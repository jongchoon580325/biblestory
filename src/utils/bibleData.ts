// 66권 성경 책별 장 수 및 영어명 데이터
export const BIBLE_BOOKS_DATA: Record<string, { totalChapters: number; nameEnglish: string }> = {
  // 구약 (39권)
  '창세기': { totalChapters: 50, nameEnglish: 'genesis' },
  '출애굽기': { totalChapters: 40, nameEnglish: 'exodus' },
  '레위기': { totalChapters: 27, nameEnglish: 'leviticus' },
  '민수기': { totalChapters: 36, nameEnglish: 'numbers' },
  '신명기': { totalChapters: 34, nameEnglish: 'deuteronomy' },
  '여호수아': { totalChapters: 24, nameEnglish: 'joshua' },
  '사사기': { totalChapters: 21, nameEnglish: 'judges' },
  '룻기': { totalChapters: 4, nameEnglish: 'ruth' },
  '사무엘상': { totalChapters: 31, nameEnglish: '1-samuel' },
  '사무엘하': { totalChapters: 24, nameEnglish: '2-samuel' },
  '열왕기상': { totalChapters: 22, nameEnglish: '1-kings' },
  '열왕기하': { totalChapters: 25, nameEnglish: '2-kings' },
  '역대상': { totalChapters: 29, nameEnglish: '1-chronicles' },
  '역대하': { totalChapters: 36, nameEnglish: '2-chronicles' },
  '에스라': { totalChapters: 10, nameEnglish: 'ezra' },
  '느헤미야': { totalChapters: 13, nameEnglish: 'nehemiah' },
  '에스더': { totalChapters: 10, nameEnglish: 'esther' },
  '욥기': { totalChapters: 42, nameEnglish: 'job' },
  '시편': { totalChapters: 150, nameEnglish: 'psalms' },
  '잠언': { totalChapters: 31, nameEnglish: 'proverbs' },
  '전도서': { totalChapters: 12, nameEnglish: 'ecclesiastes' },
  '아가': { totalChapters: 8, nameEnglish: 'song-of-solomon' },
  '이사야': { totalChapters: 66, nameEnglish: 'isaiah' },
  '예레미야': { totalChapters: 52, nameEnglish: 'jeremiah' },
  '예레미야애가': { totalChapters: 5, nameEnglish: 'lamentations' },
  '에스겔': { totalChapters: 48, nameEnglish: 'ezekiel' },
  '다니엘': { totalChapters: 12, nameEnglish: 'daniel' },
  '호세아': { totalChapters: 14, nameEnglish: 'hosea' },
  '요엘': { totalChapters: 3, nameEnglish: 'joel' },
  '아모스': { totalChapters: 9, nameEnglish: 'amos' },
  '오바댜': { totalChapters: 1, nameEnglish: 'obadiah' },
  '요나': { totalChapters: 4, nameEnglish: 'jonah' },
  '미가': { totalChapters: 7, nameEnglish: 'micah' },
  '나훔': { totalChapters: 3, nameEnglish: 'nahum' },
  '하박국': { totalChapters: 3, nameEnglish: 'habakkuk' },
  '스바냐': { totalChapters: 3, nameEnglish: 'zephaniah' },
  '학개': { totalChapters: 2, nameEnglish: 'haggai' },
  '스가랴': { totalChapters: 14, nameEnglish: 'zechariah' },
  '말라기': { totalChapters: 4, nameEnglish: 'malachi' },

  // 신약 (27권)
  '마태복음': { totalChapters: 28, nameEnglish: 'matthew' },
  '마가복음': { totalChapters: 16, nameEnglish: 'mark' },
  '누가복음': { totalChapters: 24, nameEnglish: 'luke' },
  '요한복음': { totalChapters: 21, nameEnglish: 'john' },
  '사도행전': { totalChapters: 28, nameEnglish: 'acts' },
  '로마서': { totalChapters: 16, nameEnglish: 'romans' },
  '고린도전서': { totalChapters: 16, nameEnglish: '1-corinthians' },
  '고린도후서': { totalChapters: 13, nameEnglish: '2-corinthians' },
  '갈라디아서': { totalChapters: 6, nameEnglish: 'galatians' },
  '에베소서': { totalChapters: 6, nameEnglish: 'ephesians' },
  '빌립보서': { totalChapters: 4, nameEnglish: 'philippians' },
  '골로새서': { totalChapters: 4, nameEnglish: 'colossians' },
  '데살로니가전서': { totalChapters: 5, nameEnglish: '1-thessalonians' },
  '데살로니가후서': { totalChapters: 3, nameEnglish: '2-thessalonians' },
  '디모데전서': { totalChapters: 6, nameEnglish: '1-timothy' },
  '디모데후서': { totalChapters: 4, nameEnglish: '2-timothy' },
  '디도서': { totalChapters: 3, nameEnglish: 'titus' },
  '빌레몬서': { totalChapters: 1, nameEnglish: 'philemon' },
  '히브리서': { totalChapters: 13, nameEnglish: 'hebrews' },
  '야고보서': { totalChapters: 5, nameEnglish: 'james' },
  '베드로전서': { totalChapters: 5, nameEnglish: '1-peter' },
  '베드로후서': { totalChapters: 3, nameEnglish: '2-peter' },
  '요한일서': { totalChapters: 5, nameEnglish: '1-john' },
  '요한이서': { totalChapters: 1, nameEnglish: '2-john' },
  '요한삼서': { totalChapters: 1, nameEnglish: '3-john' },
  '유다서': { totalChapters: 1, nameEnglish: 'jude' },
  '요한계시록': { totalChapters: 22, nameEnglish: 'revelation' }
};

// 유틸리티 함수
export const getBookData = (bookName: string) => {
  return BIBLE_BOOKS_DATA[bookName] || { totalChapters: 50, nameEnglish: bookName.toLowerCase() };
};

export const getTotalChapters = (bookName: string): number => {
  return getBookData(bookName).totalChapters;
};

export const getBookEnglishName = (bookName: string): string => {
  return getBookData(bookName).nameEnglish;
}; 