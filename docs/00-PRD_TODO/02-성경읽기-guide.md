# 📖 02-성경읽기-guide.md

## 🎯 **문서 개요**

### **문서명**: 성경읽기용 한글 성경 본문 텍스트 소스 상세 가이드
### **버전**: v1.0.0
### **작성일**: 2025.07.18
### **최종 수정일**: 2025.07.18
### **의존성**: 02-성경읽기-PRD.md

---

## 📚 **1. 텍스트 소스 기본 정보**

### **1-1. 권장 텍스트 소스**
- **우리말 성경**: 한국성서공회에서 발행한 현대적이고 읽기 쉬운 번역본
- **개역개정판 (KRV)**: 가장 널리 사용되는 한글 성경 번역본
- **새번역 (NIV)**: 현대적이고 읽기 쉬운 번역
- **공동번역**: 천주교와 개신교가 공동으로 번역한 성경
- **표준새번역 (KSB)**: 한국성서공회에서 발행한 현대적 번역

### **1-2. 텍스트 소스 선택 기준**
- **가독성**: 현대 한국어 문법에 맞는 자연스러운 표현
- **정확성**: 원문과의 일치도 99% 이상
- **일관성**: 용어와 번역 스타일의 통일성
- **완전성**: 모든 구절이 누락 없이 포함
- **라이선스**: 상업적 사용 가능한 번역본

---

## 📁 **2. 파일 구조 및 준비 방법**

### **2-1. 파일 준비 방식**

#### **Q1: 책명별로 소스를 준비해야 하는건지?**
**A: 장별로 준비하는 것을 권장합니다.**

**이유:**
- **성능 최적화**: 필요한 장만 로딩하여 메모리 효율성 증대
- **사용자 경험**: 빠른 로딩 시간으로 즉시 읽기 가능
- **유지보수**: 개별 장 수정 시 전체 책에 영향 없음
- **확장성**: 향후 장별 메타데이터 추가 용이

#### **Q2: HTML 형태로 장별 또는 책명별로 준비해야 하는 건지?**
**A: 장별 HTML 파일 형태로 준비합니다.**

**권장 구조:**
```
bible-content/
├── old-testament/
│   ├── genesis/
│   │   ├── 01-genesis-01.html
│   │   ├── 02-genesis-02.html
│   │   ├── 03-genesis-03.html
│   │   └── ...
│   ├── exodus/
│   │   ├── 01-exodus-01.html
│   │   ├── 02-exodus-02.html
│   │   └── ...
│   └── ...
└── new-testament/
    ├── matthew/
    │   ├── 01-matthew-01.html
    │   ├── 02-matthew-02.html
    │   └── ...
    └── ...
```

### **2-2. HTML 파일 구조 요구사항**

#### **기본 HTML 템플릿**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>창세기 1장</title>
    <meta name="book" content="창세기">
    <meta name="book-english" content="genesis">
    <meta name="chapter" content="1">
    <meta name="translation" content="우리말성경">
    <meta name="total-verses" content="31">
    <meta name="estimated-reading-time" content="3">
</head>
<body>
    <div class="bible-chapter">
        <header class="chapter-header">
            <h1 class="chapter-title">창세기 1장</h1>
            <p class="chapter-subtitle">천지 창조</p>
        </header>
        
        <div class="verses-container">
            <div class="verse" data-verse="1">
                <span class="verse-number">1</span>
                <span class="verse-text">태초에 하나님이 천지를 창조하시니라</span>
            </div>
            
            <div class="verse" data-verse="2">
                <span class="verse-number">2</span>
                <span class="verse-text">땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라</span>
            </div>
            
            <!-- 추가 구절들... -->
        </div>
        
        <footer class="chapter-footer">
            <p class="reading-info">예상 읽기 시간: 3분 | 총 31구절</p>
        </footer>
    </div>
</body>
</html>
```

#### **파일명 규칙**
- **형식**: `{장번호}-{책명영문}-{장번호}.html`
- **예시**: `01-genesis-01.html`, `05-matthew-05.html`
- **규칙**: 
  - 접두사: 장 번호와 동일한 2자리 숫자 (01-, 02-, 03...)
  - 책명: 소문자 영문 (genesis, exodus, matthew 등)
  - 구분자: `-` (하이픈)
  - 장번호: 2자리 숫자 (01, 02, 03...)
  - 확장자: `.html`
  - **명명 패턴**: 접두사와 장 번호가 동일한 숫자 형식 사용

---

## 🗄️ **3. 데이터베이스 업로드 및 관리**

### **3-1. 업로드 프로세스**

#### **Q3: HTML 파일 형태로 file upload 하여 DB Table에 업로드 한다면 업로드 현황을 프론트앤드에서 어떤 형태로 관리해야 하는지?**

**A: 단계별 업로드 현황 관리 시스템을 구축합니다.**

#### **3-1-1. 업로드 현황 관리 구조**
```typescript
interface UploadStatus {
  id: string;
  fileName: string;
  bookName: string;
  chapterNumber: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  errorMessage?: string;
  uploadedAt?: Date;
  processedAt?: Date;
}

interface UploadBatch {
  id: string;
  batchName: string;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  status: 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}
```

#### **3-1-2. 프론트엔드 업로드 현황 UI**
```typescript
// components/features/bible-reading/UploadStatusManager.tsx
const UploadStatusManager: React.FC = () => {
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>([]);
  const [currentBatch, setCurrentBatch] = useState<UploadBatch | null>(null);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);

  return (
    <div className="upload-status-manager">
      {/* 배치 현황 */}
      <div className="batch-overview">
        <h3>업로드 배치 현황</h3>
        <div className="batch-list">
          {uploadBatches.map(batch => (
            <div key={batch.id} className="batch-item">
              <div className="batch-info">
                <span className="batch-name">{batch.batchName}</span>
                <span className="batch-progress">
                  {batch.completedFiles}/{batch.totalFiles}
                </span>
              </div>
              <div className="batch-status">
                <span className={`status-badge ${batch.status}`}>
                  {batch.status === 'in-progress' && '진행중'}
                  {batch.status === 'completed' && '완료'}
                  {batch.status === 'failed' && '실패'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 개별 파일 현황 */}
      <div className="file-status">
        <h3>파일별 업로드 현황</h3>
        <div className="file-list">
          {uploadStatuses.map(status => (
            <div key={status.id} className="file-item">
              <div className="file-info">
                <span className="file-name">{status.fileName}</span>
                <span className="file-location">
                  {status.bookName} {status.chapterNumber}장
                </span>
              </div>
              <div className="file-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
                <span className="progress-text">{status.progress}%</span>
              </div>
              <div className="file-status-badge">
                <span className={`status ${status.status}`}>
                  {status.status === 'pending' && '대기중'}
                  {status.status === 'uploading' && '업로드중'}
                  {status.status === 'processing' && '처리중'}
                  {status.status === 'completed' && '완료'}
                  {status.status === 'failed' && '실패'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### **3-2. 업로드 처리 로직**

#### **3-2-1. 파일 업로드 및 파싱**
```typescript
// utils/bibleUploadProcessor.ts
export const processBibleFile = async (file: File): Promise<ProcessedBibleData> => {
  try {
    // 1. 파일명에서 메타데이터 추출
    const metadata = extractMetadataFromFileName(file.name);
    
    // 2. HTML 내용 파싱
    const content = await file.text();
    const verses = parseVersesFromHTML(content);
    
    // 3. 데이터베이스 저장
    const savedData = await saveToDatabase(metadata, verses);
    
    return {
      success: true,
      data: savedData,
      metadata,
      verseCount: verses.length
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      metadata: null,
      verseCount: 0
    };
  }
};

const extractMetadataFromFileName = (fileName: string) => {
  const match = fileName.match(/(\d+)-([a-z]+)-(\d+)\.html/);
  if (!match) {
    throw new Error('잘못된 파일명 형식입니다. (예: 01-genesis-01.html)');
  }
  
  const [, prefixNumber, bookEnglish, chapterStr] = match;
  const chapterNumber = parseInt(chapterStr);
  const prefixNumberInt = parseInt(prefixNumber);
  
  // 접두사와 장 번호가 일치하는지 검증
  if (prefixNumberInt !== chapterNumber) {
    throw new Error(`파일명 접두사(${prefixNumberInt})와 장 번호(${chapterNumber})가 일치하지 않습니다.`);
  }
  
  return {
    bookEnglish,
    chapterNumber,
    bookName: getKoreanBookName(bookEnglish),
    fileName
  };
};

const parseVersesFromHTML = (htmlContent: string): VerseData[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const verses: VerseData[] = [];
  const verseElements = doc.querySelectorAll('.verse, [data-verse]');
  
  verseElements.forEach(element => {
    const verseNumber = parseInt(element.getAttribute('data-verse') || '0');
    const verseText = element.querySelector('.verse-text')?.textContent?.trim() || '';
    
    if (verseNumber > 0 && verseText) {
      verses.push({
        number: verseNumber,
        text: verseText,
        reference: `창 ${1}:${verseNumber}` // 동적 생성 필요
      });
    }
  });
  
  return verses.sort((a, b) => a.number - b.number);
};
```

#### **3-2-2. 데이터베이스 저장**
```typescript
// utils/bibleDatabase.ts
export const saveToDatabase = async (metadata: FileMetadata, verses: VerseData[]) => {
  const { data: bookData, error: bookError } = await supabase
    .from('rb_bible_books')
    .select('id')
    .eq('name_english', metadata.bookEnglish)
    .single();
  
  if (bookError) {
    throw new Error(`책 정보를 찾을 수 없습니다: ${metadata.bookEnglish}`);
  }
  
  // 장 정보 저장
  const { data: chapterData, error: chapterError } = await supabase
    .from('rb_bible_chapters')
    .upsert({
      book_id: bookData.id,
      chapter_number: metadata.chapterNumber,
      title: `${metadata.bookName} ${metadata.chapterNumber}장`,
      estimated_reading_time: Math.ceil(verses.length / 10), // 평균 10구절/분
      word_count: verses.reduce((sum, verse) => sum + verse.text.split(/\s+/).length, 0),
      html_content: generateHTMLContent(verses),
      status: 'published'
    })
    .select()
    .single();
  
  if (chapterError) {
    throw new Error(`장 정보 저장 실패: ${chapterError.message}`);
  }
  
  // 구절 정보 저장
  const verseInserts = verses.map(verse => ({
    chapter_id: chapterData.id,
    verse_number: verse.number,
    text: verse.text,
    reference: `${metadata.bookName} ${metadata.chapterNumber}:${verse.number}`
  }));
  
  const { error: versesError } = await supabase
    .from('rb_bible_verses')
    .upsert(verseInserts);
  
  if (versesError) {
    throw new Error(`구절 정보 저장 실패: ${versesError.message}`);
  }
  
  return {
    chapterId: chapterData.id,
    verseCount: verses.length,
    bookName: metadata.bookName,
    chapterNumber: metadata.chapterNumber
  };
};
```

---

## 📊 **4. 업로드 현황 관리 시스템**

### **4-1. 실시간 업로드 현황 추적**

#### **4-1-1. Zustand 상태 관리**
```typescript
// stores/uploadStatusStore.ts
interface UploadStatusStore {
  batches: UploadBatch[];
  currentBatch: UploadBatch | null;
  fileStatuses: UploadStatus[];
  isUploading: boolean;
  
  // Actions
  createBatch: (batchName: string, files: File[]) => void;
  updateFileStatus: (fileId: string, status: Partial<UploadStatus>) => void;
  completeBatch: (batchId: string) => void;
  resetUpload: () => void;
}

export const useUploadStatusStore = create<UploadStatusStore>((set, get) => ({
  batches: [],
  currentBatch: null,
  fileStatuses: [],
  isUploading: false,
  
  createBatch: (batchName, files) => {
    const batch: UploadBatch = {
      id: crypto.randomUUID(),
      batchName,
      totalFiles: files.length,
      completedFiles: 0,
      failedFiles: 0,
      status: 'in-progress',
      createdAt: new Date()
    };
    
    const fileStatuses: UploadStatus[] = files.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      bookName: extractBookName(file.name),
      chapterNumber: extractChapterNumber(file.name),
      status: 'pending',
      progress: 0
    }));
    
    set({
      batches: [...get().batches, batch],
      currentBatch: batch,
      fileStatuses: [...get().fileStatuses, ...fileStatuses],
      isUploading: true
    });
  },
  
  updateFileStatus: (fileId, status) => {
    set(state => ({
      fileStatuses: state.fileStatuses.map(file => 
        file.id === fileId ? { ...file, ...status } : file
      )
    }));
  },
  
  completeBatch: (batchId) => {
    set(state => ({
      batches: state.batches.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'completed', completedAt: new Date() }
          : batch
      ),
      isUploading: false
    }));
  },
  
  resetUpload: () => {
    set({
      batches: [],
      currentBatch: null,
      fileStatuses: [],
      isUploading: false
    });
  }
}));
```

#### **4-1-2. 실시간 업데이트 훅**
```typescript
// hooks/useUploadProgress.ts
export const useUploadProgress = () => {
  const { fileStatuses, updateFileStatus, completeBatch } = useUploadStatusStore();
  
  const uploadFiles = async (files: File[]) => {
    const batchId = crypto.randomUUID();
    
    for (const file of files) {
      const fileId = crypto.randomUUID();
      
      try {
        // 업로드 시작
        updateFileStatus(fileId, { status: 'uploading', progress: 0 });
        
        // 파일 처리
        const result = await processBibleFile(file);
        
        if (result.success) {
          updateFileStatus(fileId, { 
            status: 'completed', 
            progress: 100,
            uploadedAt: new Date()
          });
        } else {
          updateFileStatus(fileId, { 
            status: 'failed', 
            errorMessage: result.error
          });
        }
        
      } catch (error) {
        updateFileStatus(fileId, { 
          status: 'failed', 
          errorMessage: error instanceof Error ? error.message : '알 수 없는 오류'
        });
      }
    }
    
    completeBatch(batchId);
  };
  
  return { uploadFiles, fileStatuses };
};
```

### **4-2. 업로드 현황 UI 컴포넌트**

#### **4-2-1. 업로드 진행률 표시**
```typescript
// components/features/bible-reading/UploadProgress.tsx
const UploadProgress: React.FC = () => {
  const { fileStatuses, isUploading } = useUploadStatusStore();
  
  const completedCount = fileStatuses.filter(f => f.status === 'completed').length;
  const failedCount = fileStatuses.filter(f => f.status === 'failed').length;
  const totalCount = fileStatuses.length;
  
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  return (
    <div className="upload-progress-panel">
      <div className="progress-header">
        <h3>성경 파일 업로드 현황</h3>
        <div className="progress-stats">
          <span className="stat-item">
            완료: <strong>{completedCount}</strong>
          </span>
          <span className="stat-item">
            실패: <strong className="text-red-500">{failedCount}</strong>
          </span>
          <span className="stat-item">
            전체: <strong>{totalCount}</strong>
          </span>
        </div>
      </div>
      
      <div className="overall-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <span className="progress-text">{Math.round(overallProgress)}%</span>
      </div>
      
      <div className="file-list">
        {fileStatuses.map(file => (
          <div key={file.id} className="file-item">
            <div className="file-info">
              <span className="file-name">{file.fileName}</span>
              <span className="file-location">
                {file.bookName} {file.chapterNumber}장
              </span>
            </div>
            <div className="file-status">
              <span className={`status-badge ${file.status}`}>
                {getStatusText(file.status)}
              </span>
              {file.errorMessage && (
                <span className="error-message">{file.errorMessage}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔧 **5. 텍스트 품질 관리**

### **5-1. 자동 검증 시스템**

#### **5-1-1. 파일 유효성 검사**
```typescript
// utils/bibleValidation.ts
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    totalVerses: number;
    totalWords: number;
    averageWordsPerVerse: number;
    missingVerses: number[];
  };
}

export const validateBibleFile = (file: File, expectedVerseCount: number): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    statistics: {
      totalVerses: 0,
      totalWords: 0,
      averageWordsPerVerse: 0,
      missingVerses: []
    }
  };
  
  // 파일명 검증
  const fileNamePattern = /^(\d+)-[a-z]+-\d+\.html$/i;
  if (!fileNamePattern.test(file.name)) {
    result.errors.push('파일명 형식이 올바르지 않습니다. (예: 01-genesis-01.html)');
    result.isValid = false;
  }
  
  // 접두사와 장 번호 일치 검증
  const match = file.name.match(/^(\d+)-[a-z]+-(\d+)\.html$/i);
  if (match) {
    const [, prefixNumber, chapterNumber] = match;
    if (parseInt(prefixNumber) !== parseInt(chapterNumber)) {
      result.errors.push(`파일명 접두사(${prefixNumber})와 장 번호(${chapterNumber})가 일치하지 않습니다.`);
      result.isValid = false;
    }
  }
  
  // 파일 크기 검증
  if (file.size > 10 * 1024 * 1024) { // 10MB
    result.errors.push('파일 크기가 10MB를 초과합니다.');
    result.isValid = false;
  }
  
  // 파일 형식 검증
  if (!file.name.endsWith('.html')) {
    result.errors.push('HTML 파일만 업로드 가능합니다.');
    result.isValid = false;
  }
  
  return result;
};
```

#### **5-1-2. 내용 품질 검사**
```typescript
export const validateBibleContent = (verses: VerseData[], expectedVerseCount: number): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    statistics: {
      totalVerses: verses.length,
      totalWords: 0,
      averageWordsPerVerse: 0,
      missingVerses: []
    }
  };
  
  // 구절 수 검증
  if (verses.length !== expectedVerseCount) {
    result.errors.push(`구절 수 불일치: 예상 ${expectedVerseCount}개, 실제 ${verses.length}개`);
    result.isValid = false;
  }
  
  // 구절 번호 연속성 검증
  const verseNumbers = verses.map(v => v.number).sort((a, b) => a - b);
  for (let i = 1; i <= expectedVerseCount; i++) {
    if (!verseNumbers.includes(i)) {
      result.statistics.missingVerses.push(i);
      result.errors.push(`누락된 구절: ${i}절`);
      result.isValid = false;
    }
  }
  
  // 텍스트 품질 검증
  verses.forEach(verse => {
    if (verse.text.length < 5) {
      result.warnings.push(`${verse.number}절: 텍스트가 너무 짧습니다`);
    }
    
    if (verse.text.length > 500) {
      result.warnings.push(`${verse.number}절: 텍스트가 너무 깁니다`);
    }
    
    result.statistics.totalWords += verse.text.split(/\s+/).length;
  });
  
  result.statistics.averageWordsPerVerse = 
    Math.round(result.statistics.totalWords / verses.length);
  
  return result;
};
```

### **5-2. 텍스트 정규화**

#### **5-2-1. 구절 텍스트 정규화**
```typescript
export const normalizeVerseText = (text: string): string => {
  return text
    .replace(/[^\w\s가-힣.,!?;:()]/g, '') // 특수문자 제거
    .replace(/\s+/g, ' ')                 // 공백 정리
    .replace(/^[\d\s.。]+/, '')           // 앞쪽 구절 번호 제거
    .trim();
};

export const normalizeReference = (book: string, chapter: number, verse: number): string => {
  const bookAbbr = getBookAbbreviation(book);
  return `${bookAbbr} ${chapter}:${verse}`;
};
```

---

## 📋 **6. 구현 체크리스트**

### **6-1. 텍스트 소스 준비**
- [ ] 우리말 성경 텍스트 소스 확보
- [ ] 장별 HTML 파일 생성
- [ ] 파일명 규칙 적용 (`01-genesis-01.html` 형식)
- [ ] 접두사와 장 번호 일치 검증 로직 구현
- [ ] 메타데이터 포함 (책명, 장번호, 번역본 정보)
- [ ] 구절별 구조화 (`data-verse` 속성 포함)

### **6-2. 업로드 시스템 구현**
- [ ] 독립적 FileUpload 컴포넌트 개발
- [ ] 파일 유효성 검사 로직 구현
- [ ] HTML 파싱 및 구절 추출 기능
- [ ] 데이터베이스 저장 로직 구현
- [ ] 실시간 업로드 현황 관리

### **6-3. 품질 관리 시스템**
- [ ] 자동 검증 시스템 구현
- [ ] 텍스트 정규화 기능
- [ ] 오류 처리 및 복구 기능
- [ ] 업로드 현황 모니터링

### **6-4. 사용자 인터페이스**
- [ ] 업로드 진행률 표시 UI
- [ ] 파일별 상태 표시
- [ ] 오류 메시지 표시
- [ ] 배치 업로드 관리

---

## 🎯 **7. 다음 단계**

1. **우리말 성경 텍스트 소스 확보**: 한국성서공회 또는 공개 도메인 소스 활용
2. **HTML 템플릿 생성**: 표준화된 HTML 구조로 변환
3. **업로드 시스템 개발**: 독립적 FileUpload 컴포넌트 구현
4. **품질 검증 시스템**: 자동화된 검증 및 정규화 기능
5. **사용자 인터페이스**: 직관적인 업로드 현황 관리 UI

---

**📋 문서 상태**: ✅ **완료** - 성경읽기용 텍스트 소스 상세 가이드  
**🎯 핵심 내용**: 우리말 성경 텍스트 소스 준비 및 업로드 시스템  
**📁 파일 구조**: 장별 HTML 파일 형태로 체계적 관리  
**🔧 기술 요구사항**: HTML 파싱, 데이터베이스 저장, 실시간 현황 관리  
**📅 다음 리뷰**: 텍스트 소스 확보 후 