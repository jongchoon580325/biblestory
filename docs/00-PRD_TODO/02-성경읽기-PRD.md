# 📋 02-성경읽기-PRD.md

## 🎯 **문서 개요**

### **문서명**: 성경읽기 페이지 상세 설계서
### **버전**: v2.0.0
### **작성일**: 2025.07.08
### **최종 수정일**: 2025.07.18

---

## 🔍 **현재 프로젝트 환경 분석 및 적용 가능성**

### **기술 스택 호환성 평가** ✅
- **Next.js 15**: PRD 요구사항과 완벽 호환
- **React 19**: 최신 기능 활용 가능
- **TypeScript**: 타입 안정성 확보
- **Tailwind CSS**: 반응형 디자인 구현 가능
- **Supabase**: 데이터베이스 및 인증 시스템 완벽 지원
- **Zustand**: 복잡한 상태 관리 요구사항 충족
- **Shadcn/UI**: 고급 UI 컴포넌트 라이브러리 적용

### **독립적 데이터 모델 설계** ✅
- **기존 `bibleMapping.ts`와 완전 분리**: PRD의 `BibleBook` 인터페이스 독립 구현
- **새로운 데이터 구조**: `id`, `nameEnglish`, `abbreviation` 등 PRD 요구사항 그대로 적용
- **타입 안정성**: TypeScript 인터페이스로 완전한 타입 체크

### **독립적 Supabase 테이블 구조** ✅
- **신규 테이블 생성**: `b_bible_contents`, `b_reading_progress` 독립 구현
- **기존 테이블과 분리**: `b_materials`, `b_categories`와 완전 독립 운영
- **데이터 무결성**: 성경읽기 전용 데이터 모델로 일관성 확보

### **UI 컴포넌트 라이브러리** ✅
- **shadcn/ui 적용**: Modal, Button, Select 등 고급 컴포넌트 구현
- **일관된 디자인 시스템**: Tailwind CSS와 완벽 통합
- **접근성 준수**: ARIA 레이블 및 키보드 네비게이션 지원

### **독립적 FileUpload 컴포넌트** ✅
- **READ 페이지 전용**: 기존 FileUpload와 별개로 신규 구현
- **성경읽기 특화**: 성경 콘텐츠 업로드에 최적화된 기능
- **사용자 경험**: 직관적이고 효율적인 업로드 인터페이스

### **동적 라우팅 구조** ✅
- **Next.js App Router**: `/read/[book]/[chapter]` 동적 라우팅 구현
- **SEO 최적화**: 메타데이터 및 구조화된 데이터 지원
- **성능 최적화**: 자동 코드 스플리팅 및 지연 로딩

### **완전 독립적 시스템** ✅
- **모듈화 설계**: 기존 프로젝트와 완전 분리
- **확장성**: 향후 기능 추가 및 수정 용이
- **유지보수성**: 명확한 책임 분리 및 의존성 관리

---

## 📚 **기능 개요**

> **"몰입형 성경 읽기 경험을 제공하는 차세대 디지털 성경 플랫폼의 핵심 MVP"**

### **핵심 가치 제안**
- **Progressive Reading**: 구약/신약→책→장 단계별 선택으로 자연스러운 읽기 흐름
- **Multi-Modal Experience**: 읽기와 듣기를 완벽하게 통합한 TTS 경험
- **Simple & Focused**: 핵심 기능에 집중한 직관적이고 빠른 성경 읽기
- **HTML Rendering**: 업로드된 HTML 파일 소스의 완벽한 렌더링
- **Real-time Highlight**: TTS 재생 중 현재 읽는 절의 실시간 하이라이트

---

## 🏗️ **독립적 데이터 모델 설계**

### **독립적 BibleBook 인터페이스**
```typescript
// types/bible-reading.ts
export interface BibleBook {
  id: string;
  name: string;
  nameEnglish: string;
  abbreviation: string;
  totalChapters: number;
  category: 'old-testament' | 'new-testament';
  completedChapters: number;
  currentChapter?: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BibleChapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  subtitle?: string;
  estimatedReadingTime: number;
  wordCount: number;
  verses: BibleVerse[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface BibleVerse {
  id: string;
  chapterId: string;
  number: number;
  text: string;
  reference: string;
  isHighlighted?: boolean;
  highlightType?: 'personal' | 'community' | 'study';
  notes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  chapterNumber: number;
  readingCompleted: boolean;
  listeningCompleted: boolean;
  readingDuration: number;
  listeningDuration: number;
  completionPercentage: number;
  scrollProgress: number;
  versesRead: number[];
  lastReadAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserHighlight {
  id: string;
  userId: string;
  verseId: string;
  type: 'personal' | 'community' | 'study';
  color?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **독립적 Supabase 테이블 스키마**
```sql
-- 성경 책 정보 테이블
CREATE TABLE rb_bible_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  name_english VARCHAR(50) NOT NULL,
  abbreviation VARCHAR(10) NOT NULL,
  total_chapters INTEGER NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('old-testament', 'new-testament')),
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 성경 장 정보 테이블
CREATE TABLE rb_bible_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES rb_bible_books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(200),
  estimated_reading_time INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  html_content TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, chapter_number)
);

-- 성경 구절 정보 테이블
CREATE TABLE rb_bible_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES rb_bible_chapters(id) ON DELETE CASCADE,
  verse_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  reference VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, verse_number)
);

-- 읽기 진도 추적 테이블
CREATE TABLE rb_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES rb_bible_books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  reading_completed BOOLEAN DEFAULT FALSE,
  listening_completed BOOLEAN DEFAULT FALSE,
  reading_duration INTEGER DEFAULT 0,
  listening_duration INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  scroll_progress DECIMAL(5,2) DEFAULT 0,
  verses_read INTEGER[] DEFAULT '{}',
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id, chapter_number)
);

-- 사용자 하이라이트 테이블
CREATE TABLE rb_user_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id UUID REFERENCES rb_bible_verses(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('personal', 'community', 'study')),
  color VARCHAR(7),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_rb_bible_books_category ON rb_bible_books(category);
CREATE INDEX idx_rb_bible_chapters_book_id ON rb_bible_chapters(book_id);
CREATE INDEX idx_rb_bible_verses_chapter_id ON rb_bible_verses(chapter_id);
CREATE INDEX idx_rb_reading_progress_user_book ON rb_reading_progress(user_id, book_id);
CREATE INDEX idx_rb_user_highlights_user_verse ON rb_user_highlights(user_id, verse_id);

-- RLS (Row Level Security) 정책
ALTER TABLE rb_bible_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb_bible_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb_bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb_user_highlights ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (성경 내용은 모든 사용자가 읽기 가능)
CREATE POLICY "Public read access" ON rb_bible_books FOR SELECT USING (true);
CREATE POLICY "Public read access" ON rb_bible_chapters FOR SELECT USING (true);
CREATE POLICY "Public read access" ON rb_bible_verses FOR SELECT USING (true);

-- 사용자별 읽기/쓰기 정책 (진도 및 하이라이트는 본인만)
CREATE POLICY "User read/write access" ON rb_reading_progress 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "User read/write access" ON rb_user_highlights 
  FOR ALL USING (auth.uid() = user_id);
```

---

## 📁 **독립적 FileUpload 컴포넌트 설계**

### **READ 페이지 전용 FileUpload 인터페이스**
```typescript
// components/features/bible-reading/BibleFileUpload.tsx
interface BibleFileUploadProps {
  onUploadComplete: (fileData: BibleFileData) => void;
  onUploadError: (error: string) => void;
  maxFileSize?: number; // 기본값: 10MB
  allowedFormats?: string[]; // 기본값: ['html', 'htm']
}

interface BibleFileData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  bookId: string;
  chapterNumber: number;
  content: string;
  metadata: {
    title: string;
    subtitle?: string;
    estimatedReadingTime: number;
    wordCount: number;
  };
}

const BibleFileUpload: React.FC<BibleFileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFormats = ['html', 'htm']
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 파일 유효성 검사
  const validateFile = (file: File): string[] => {
    const errors: string[] = [];
    
    // 파일 크기 검사
    if (file.size > maxFileSize) {
      errors.push(`파일 크기가 ${maxFileSize / (1024 * 1024)}MB를 초과합니다.`);
    }
    
    // 파일 형식 검사
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      errors.push(`지원하지 않는 파일 형식입니다. (${allowedFormats.join(', ')})`);
    }
    
    // 파일명 형식 검사 (예: 01-genesis-01.html)
    const fileNamePattern = /^(\d+)-[a-z]+-\d+\.html$/i;
    if (!fileNamePattern.test(file.name)) {
      errors.push('파일명 형식이 올바르지 않습니다. (예: 01-genesis-01.html)');
    }
    
    // 접두사와 장 번호 일치 검증
    const match = file.name.match(/^(\d+)-[a-z]+-(\d+)\.html$/i);
    if (match) {
      const [, prefixNumber, chapterNumber] = match;
      if (parseInt(prefixNumber) !== parseInt(chapterNumber)) {
        errors.push(`파일명 접두사(${prefixNumber})와 장 번호(${chapterNumber})가 일치하지 않습니다.`);
      }
    }
    
    return errors;
  };

  // 파일 내용 미리보기
  const handleFileSelect = async (file: File) => {
    const errors = validateFile(file);
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      setSelectedFile(null);
      setPreviewContent('');
      return;
    }
    
    setSelectedFile(file);
    
    try {
      const content = await file.text();
      setPreviewContent(content);
      
      // HTML 파싱 및 메타데이터 추출
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // 제목 추출
      const title = doc.querySelector('h1, h2, .title')?.textContent || '';
      const subtitle = doc.querySelector('h3, h4, .subtitle')?.textContent || '';
      
      // 단어 수 계산
      const textContent = doc.body?.textContent || '';
      const wordCount = textContent.trim().split(/\s+/).length;
      
      // 예상 읽기 시간 계산 (평균 200단어/분)
      const estimatedReadingTime = Math.ceil(wordCount / 200);
      
      console.log('파일 메타데이터:', {
        title,
        subtitle,
        wordCount,
        estimatedReadingTime
      });
      
    } catch (error) {
      setValidationErrors(['파일 내용을 읽을 수 없습니다.']);
    }
  };

  // 파일 업로드 처리
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // 파일명에서 책명과 장 번호 추출
      const fileNameMatch = selectedFile.name.match(/^(\d+)-([a-z]+)-(\d+)\.html$/i);
      if (!fileNameMatch) {
        throw new Error('파일명 형식이 올바르지 않습니다.');
      }
      
      const [, prefixNumber, bookName, chapterStr] = fileNameMatch;
      const chapterNumber = parseInt(chapterStr);
      
      // 접두사와 장 번호 일치 검증
      if (parseInt(prefixNumber) !== chapterNumber) {
        throw new Error(`파일명 접두사(${prefixNumber})와 장 번호(${chapterNumber})가 일치하지 않습니다.`);
      }
      
      // Supabase Storage에 업로드
      const filePath = `bible-content/${bookName}/${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('biblefiles')
        .upload(filePath, selectedFile, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });
      
      if (uploadError) throw uploadError;
      
      // 데이터베이스에 메타데이터 저장
      const content = await selectedFile.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      const fileData: BibleFileData = {
        id: uploadData.path,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadDate: new Date(),
        bookId: bookName,
        chapterNumber,
        content,
        metadata: {
          title: doc.querySelector('h1, h2, .title')?.textContent || '',
          subtitle: doc.querySelector('h3, h4, .subtitle')?.textContent || '',
          estimatedReadingTime: Math.ceil((doc.body?.textContent || '').trim().split(/\s+/).length / 200),
          wordCount: (doc.body?.textContent || '').trim().split(/\s+/).length
        }
      };
      
      onUploadComplete(fileData);
      
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bible-file-upload">
      <div className="upload-area">
        <input
          type="file"
          accept=".html,.htm"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="file-input"
          disabled={isUploading}
        />
        
        {selectedFile && (
          <div className="file-info">
            <h4>선택된 파일: {selectedFile.name}</h4>
            <p>크기: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            
            {validationErrors.length > 0 && (
              <div className="validation-errors">
                {validationErrors.map((error, index) => (
                  <p key={index} className="error-text">{error}</p>
                ))}
              </div>
            )}
            
            {previewContent && (
              <div className="content-preview">
                <h5>내용 미리보기</h5>
                <div 
                  className="preview-content"
                  dangerouslySetInnerHTML={{ __html: previewContent.substring(0, 500) + '...' }}
                />
              </div>
            )}
            
            <button
              onClick={handleUpload}
              disabled={isUploading || validationErrors.length > 0}
              className="upload-btn"
            >
              {isUploading ? '업로드 중...' : '업로드'}
            </button>
            
            {isUploading && (
              <div className="upload-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                />
                <span>{Math.round(uploadProgress)}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

### **독립적 FileUpload 스타일링**
```css
/* components/features/bible-reading/BibleFileUpload.css */
.bible-file-upload {
  @apply w-full max-w-2xl mx-auto p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50;
}

.upload-area {
  @apply space-y-4;
}

.file-input {
  @apply w-full p-4 border-2 border-dashed border-slate-600 rounded-lg text-center cursor-pointer transition-colors hover:border-blue-500 focus:border-blue-500 focus:outline-none;
}

.file-info {
  @apply space-y-4 p-4 bg-slate-700/30 rounded-lg;
}

.validation-errors {
  @apply space-y-1;
}

.error-text {
  @apply text-red-400 text-sm;
}

.content-preview {
  @apply space-y-2;
}

.preview-content {
  @apply max-h-40 overflow-y-auto p-3 bg-slate-900/50 rounded text-sm text-slate-300;
}

.upload-btn {
  @apply w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.upload-progress {
  @apply space-y-2;
}

.progress-bar {
  @apply h-2 bg-slate-600 rounded-full overflow-hidden;
}

.progress-bar > div {
  @apply h-full bg-blue-500 transition-all duration-300;
}
```

---

## 🏗️ **페이지 아키텍처**

### **최종 구현 체크리스트**

#### **1. 핵심 기능 구현**
- [ ] **왼쪽 사이드바**: 구약/신약 탭, 책 목록, 장 목록
- [ ] **상단 헤더**: 선택된 책명과 장 숫자 표시
- [ ] **중앙 본문**: HTML 파일 소스 완벽 렌더링
- [ ] **하단 네비게이션**: 이전/다음 장 버튼
- [ ] **TTS 기능**: 성경 본문 읽기 콘트롤
- [ ] **하이라이트**: 현재 읽는 절 실시간 하이라이트

#### **2. 삭제된 부수 기능**
- ❌ 읽기 모드 (기본/집중/야간)
- ❌ 진행률 표시
- ❌ 개인/커뮤니티 하이라이트
- ❌ 책갈피 기능
- ❌ 복잡한 메타데이터 표시
- ❌ 구절별 개별 TTS 버튼
- ❌ 하단 복잡한 컨트롤

#### **3. 기술적 요구사항**
- [ ] HTML 파일 업로드 및 저장 시스템
- [ ] HTML 콘텐츠 렌더링 (`dangerouslySetInnerHTML`)
- [ ] Web Speech API를 활용한 TTS 구현
- [ ] 구절별 하이라이트 CSS 스타일링
- [ ] 장 네비게이션 API 구현
- [ ] 반응형 레이아웃 (데스크톱/태블릿/모바일)

#### **4. 사용자 경험**
- [ ] 직관적이고 빠른 성경 읽기
- [ ] TTS 재생 중 현재 구절 시각적 표시
- [ ] 간단한 장 이동 네비게이션
- [ ] 사이드바를 통한 빠른 책/장 선택

### **전체 레이아웃 구조**
```
┌─────────────────────────────────────────────────────────┐
│                    네비게이션 (기존)                      │
├─────────────────┬───────────────────────────────────────┤
│                 │                                       │
│   성경 선택     │            창세기 1장                  │
│   사이드바      ├───────────────────────────────────────┤
│                 │                                       │
│ ┌─────────────┐ │        HTML 본문 렌더링               │
│ │ 구약/신약   │ │        (구절별 구조화)                │
│ │   탭        │ │        [TTS 재생 중 하이라이트]       │
│ └─────────────┘ │                                       │
│                 │                                       │
│ ┌─────────────┐ │                                       │
│ │ 책 목록     │ │                                       │
│ │ (스크롤)    │ │                                       │
│ └─────────────┘ │                                       │
│                 │                                       │
│ ┌─────────────┐ │                                       │
│ │ 장 목록     │ │                                       │
│ │ (스크롤)    │ │                                       │
│ └─────────────┘ │                                       │
│                 │                                       │
│                 ├───────────────────────────────────────┤
│                 │        [이전 장] [다음 장]             │
└─────────────────┴───────────────────────────────────────┘
```

**핵심 기능 구성:**
- **왼쪽 사이드바**: 구약/신약 탭, 책 목록, 장 목록 (기존 유지)
- **오른쪽 읽기 영역**: 
  - 상단: 선택된 책명과 장 숫자 표시
  - 중앙: HTML 파일 소스 완벽 렌더링
  - 하단: 이전/다음 장 네비게이션
- **핵심 기능**: TTS 읽기 콘트롤, 현재 읽는 절 하이라이트

### **반응형 레이아웃 전략**
```css
/* Desktop (1024px+) */
.bible-reading-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Tablet (768px - 1023px) */
@media (max-width: 1023px) {
  .bible-reading-layout {
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .bible-reading-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .navigation-sidebar {
    order: 2; /* 모바일에서는 하단으로 이동 */
    position: sticky;
    bottom: 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-primary);
  }
}
```

---

## 🎮 **1. 네비게이션 시스템**

### **좌측 사이드바 구성**

#### **1-1. 신/구약 토글 스위치**
```typescript
interface TestamentToggleProps {
  activeTestament: 'old' | 'new';
  onToggle: (testament: 'old' | 'new') => void;
}

const TestamentToggle: React.FC<TestamentToggleProps> = ({
  activeTestament,
  onToggle
}) => {
  return (
    <div className="testament-toggle">
      <button 
        className={`toggle-btn ${activeTestament === 'old' ? 'active' : ''}`}
        onClick={() => onToggle('old')}
        aria-label="구약 성경 선택"
      >
        구약 (39권)
      </button>
      <button 
        className={`toggle-btn ${activeTestament === 'new' ? 'active' : ''}`}
        onClick={() => onToggle('new')}
        aria-label="신약 성경 선택"
      >
        신약 (27권)
      </button>
    </div>
  );
};
```

#### **1-2. 성경 책 선택 시스템**
```typescript
interface BibleBook {
  id: string;
  name: string;
  nameEnglish: string;
  abbreviation: string;
  totalChapters: number;
  category: 'old-testament' | 'new-testament';
  completedChapters: number;
  currentChapter?: number;
}

interface BookSelectorProps {
  testament: 'old' | 'new';
  books: BibleBook[];
  selectedBook?: BibleBook;
  onBookSelect: (book: BibleBook) => void;
}

const BookSelector: React.FC<BookSelectorProps> = ({
  testament,
  books,
  selectedBook,
  onBookSelect
}) => {
  const filteredBooks = books.filter(book => 
    book.category === `${testament}-testament`
  );

  return (
    <div className="book-selector">
      <h3 className="section-title">
        {testament === 'old' ? '구약 성경' : '신약 성경'}
      </h3>
      
      <div className="book-grid">
        {filteredBooks.map(book => {
          const completionRate = (book.completedChapters / book.totalChapters) * 100;
          
          return (
            <button
              key={book.id}
              className={`book-card ${selectedBook?.id === book.id ? 'selected' : ''}`}
              onClick={() => onBookSelect(book)}
              aria-label={`${book.name} ${book.totalChapters}장`}
            >
              <div className="book-name">{book.name}</div>
              <div className="book-meta">{book.totalChapters}장</div>
              <div className="book-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="completion-badge">
                {book.completedChapters}/{book.totalChapters}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

#### **1-3. 장(Chapter) 선택 네비게이션**
```typescript
interface ChapterNavigatorProps {
  selectedBook: BibleBook;
  currentChapter: number;
  readingProgress: Record<number, {
    readingCompleted: boolean;
    listeningCompleted: boolean;
    completionPercentage: number;
  }>;
  onChapterSelect: (chapterNumber: number) => void;
}

const ChapterNavigator: React.FC<ChapterNavigatorProps> = ({
  selectedBook,
  currentChapter,
  readingProgress,
  onChapterSelect
}) => {
  const chapters = Array.from(
    { length: selectedBook.totalChapters }, 
    (_, i) => i + 1
  );

  return (
    <div className="chapter-navigator">
      <h4 className="navigator-title">
        📖 {selectedBook.name}
      </h4>
      
      <div className="chapter-grid">
        {chapters.map(chapterNum => {
          const progress = readingProgress[chapterNum];
          const isCompleted = progress?.readingCompleted || progress?.listeningCompleted;
          const isCurrent = chapterNum === currentChapter;
          
          return (
            <button
              key={chapterNum}
              className={`
                chapter-btn 
                ${isCurrent ? 'current' : ''} 
                ${isCompleted ? 'completed' : ''}
              `}
              onClick={() => onChapterSelect(chapterNum)}
              aria-label={`${chapterNum}장 ${isCompleted ? '완료' : '미완료'}`}
            >
              <span className="chapter-number">{chapterNum}</span>
              {isCompleted && (
                <div className="completion-indicator">
                  {progress.readingCompleted && <Icon name="book" size="xs" />}
                  {progress.listeningCompleted && <Icon name="volume" size="xs" />}
                </div>
              )}
              {progress?.completionPercentage && (
                <div 
                  className="progress-ring"
                  style={{ 
                    background: `conic-gradient(
                      var(--accent-primary) ${progress.completionPercentage * 3.6}deg,
                      var(--border-primary) 0deg
                    )`
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Quick Jump Controls */}
      <div className="quick-jump">
        <button 
          className="nav-btn"
          onClick={() => onChapterSelect(Math.max(1, currentChapter - 1))}
          disabled={currentChapter <= 1}
          aria-label="이전 장"
        >
          <Icon name="chevronLeft" /> 이전
        </button>
        <button 
          className="nav-btn"
          onClick={() => onChapterSelect(Math.min(selectedBook.totalChapters, currentChapter + 1))}
          disabled={currentChapter >= selectedBook.totalChapters}
          aria-label="다음 장"
        >
          다음 <Icon name="chevronRight" />
        </button>
      </div>
    </div>
  );
};
```

#### **1-4. 개인 진도 대시보드**
```typescript
interface ProgressDashboardProps {
  dailyGoal: {
    readingMinutes: number;
    listeningMinutes: number;
  };
  todayProgress: {
    readingMinutes: number;
    listeningMinutes: number;
    chaptersCompleted: number;
    streak: number;
  };
  weeklyStats: {
    totalChapters: number;
    averageTime: number;
    favoriteBooks: string[];
  };
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  dailyGoal,
  todayProgress,
  weeklyStats
}) => {
  const readingProgress = (todayProgress.readingMinutes / dailyGoal.readingMinutes) * 100;
  const listeningProgress = (todayProgress.listeningMinutes / dailyGoal.listeningMinutes) * 100;

  return (
    <div className="progress-dashboard">
      <h4 className="dashboard-title">📊 오늘의 진도</h4>
      
      {/* Daily Goals */}
      <div className="daily-goals">
        <div className="goal-item">
          <div className="goal-header">
            <Icon name="bookOpen" size="sm" />
            <span>읽기</span>
          </div>
          <div className="goal-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill reading"
                style={{ width: `${Math.min(readingProgress, 100)}%` }}
              />
            </div>
            <span className="progress-text">
              {todayProgress.readingMinutes}분 / {dailyGoal.readingMinutes}분
            </span>
          </div>
        </div>
        
        <div className="goal-item">
          <div className="goal-header">
            <Icon name="volume" size="sm" />
            <span>듣기</span>
          </div>
          <div className="goal-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill listening"
                style={{ width: `${Math.min(listeningProgress, 100)}%` }}
              />
            </div>
            <span className="progress-text">
              {todayProgress.listeningMinutes}분 / {dailyGoal.listeningMinutes}분
            </span>
          </div>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{todayProgress.chaptersCompleted}</div>
          <div className="stat-label">완독 장</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">🔥 {todayProgress.streak}</div>
          <div className="stat-label">연속일</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{weeklyStats.totalChapters}</div>
          <div className="stat-label">주간 완독</div>
        </div>
      </div>
      
      {/* Achievements */}
      <div className="achievements">
        <h5>🏆 이번 주 성과</h5>
        <div className="achievement-list">
          {weeklyStats.favoriteBooks.map(book => (
            <div key={book} className="achievement-badge">
              📖 {book} 마스터
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 🎵 **2. 오디오 시스템 (TTS 통합)**

### **2-1. 오디오 플레이어 컴포넌트**
```typescript
interface AudioPlayerState {
  isPlaying: boolean;
  currentVerse: number;
  totalVerses: number;
  currentTime: number;
  totalTime: number;
  playbackRate: number;
  volume: number;
  isLoading: boolean;
}

interface AudioPlayerProps {
  verses: BibleVerse[];
  initialSettings: {
    voice: string;
    rate: number;
    pitch: number;
    volume: number;
  };
  onVerseChange: (verseIndex: number) => void;
  onProgressUpdate: (progress: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  verses,
  initialSettings,
  onVerseChange,
  onProgressUpdate
}) => {
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentVerse: 0,
    totalVerses: verses.length,
    currentTime: 0,
    totalTime: 0,
    playbackRate: initialSettings.rate,
    volume: initialSettings.volume,
    isLoading: false
  });

  const { speak, stop, pause, resume, supported } = useSpeechSynthesis();

  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    } else {
      const currentVerse = verses[playerState.currentVerse];
      speak({
        text: `${currentVerse.number}절. ${currentVerse.text}`,
        voice: speechSynthesis.getVoices().find(v => v.name === initialSettings.voice),
        rate: playerState.playbackRate,
        pitch: initialSettings.pitch,
        volume: playerState.volume
      });
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleNext = () => {
    const nextVerse = Math.min(playerState.currentVerse + 1, verses.length - 1);
    setPlayerState(prev => ({ ...prev, currentVerse: nextVerse }));
    onVerseChange(nextVerse);
  };

  const handlePrevious = () => {
    const prevVerse = Math.max(playerState.currentVerse - 1, 0);
    setPlayerState(prev => ({ ...prev, currentVerse: prevVerse }));
    onVerseChange(prevVerse);
  };

  return (
    <div className="audio-player">
      {/* Main Controls */}
      <div className="player-controls">
        <button 
          className="control-btn"
          onClick={handlePrevious}
          disabled={playerState.currentVerse === 0}
          aria-label="이전 구절"
        >
          <Icon name="chevronLeft" />
        </button>
        
        <button 
          className="play-btn"
          onClick={handlePlayPause}
          disabled={!supported || playerState.isLoading}
          aria-label={playerState.isPlaying ? "일시정지" : "재생"}
        >
          {playerState.isLoading ? (
            <div className="loading-spinner" />
          ) : playerState.isPlaying ? (
            <Icon name="pause" />
          ) : (
            <Icon name="play" />
          )}
        </button>
        
        <button 
          className="control-btn"
          onClick={handleNext}
          disabled={playerState.currentVerse === verses.length - 1}
          aria-label="다음 구절"
        >
          <Icon name="chevronRight" />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar" role="progressbar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${(playerState.currentVerse / verses.length) * 100}%` 
            }}
          />
        </div>
        <div className="progress-text">
          {playerState.currentVerse + 1} / {verses.length} 구절
        </div>
      </div>
      
      {/* Current Verse Indicator */}
      <div className="current-verse-info">
        <Icon name="volume" size="sm" />
        <span className="verse-text">
          {verses[playerState.currentVerse]?.number}절: 
          {verses[playerState.currentVerse]?.text.substring(0, 30)}...
        </span>
      </div>
      
      {/* Advanced Controls */}
      <div className="advanced-controls">
        <div className="control-group">
          <label htmlFor="playback-rate">재생 속도</label>
          <select 
            id="playback-rate"
            value={playerState.playbackRate}
            onChange={(e) => setPlayerState(prev => ({ 
              ...prev, 
              playbackRate: parseFloat(e.target.value) 
            }))}
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="volume">음량</label>
          <input 
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={playerState.volume}
            onChange={(e) => setPlayerState(prev => ({ 
              ...prev, 
              volume: parseFloat(e.target.value) 
            }))}
          />
        </div>
        
        <button className="timer-btn">
          <Icon name="clock" size="sm" />
          취침 타이머
        </button>
      </div>
    </div>
  );
};
```

### **2-2. TTS 설정 및 음성 선택**
```typescript
interface TTSSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2  
  volume: number; // 0 to 1
  autoAdvance: boolean;
  pauseBetweenVerses: number; // milliseconds
}

const TTSSettingsPanel: React.FC<{
  settings: TTSSettings;
  onChange: (settings: TTSSettings) => void;
}> = ({ settings, onChange }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const koreanVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('ko') || 
        voice.name.includes('Korean') ||
        voice.name.includes('한국')
      );
      setVoices(koreanVoices.length > 0 ? koreanVoices : availableVoices.slice(0, 5));
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  return (
    <div className="tts-settings-panel">
      <h4>🎵 음성 설정</h4>
      
      <div className="setting-group">
        <label htmlFor="voice-select">음성 선택</label>
        <select 
          id="voice-select"
          value={settings.voice?.name || ''}
          onChange={(e) => {
            const selectedVoice = voices.find(v => v.name === e.target.value);
            onChange({ ...settings, voice: selectedVoice || null });
          }}
        >
          <option value="">기본 음성</option>
          {voices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>
      
      <div className="setting-group">
        <label htmlFor="rate-slider">
          말하기 속도: {settings.rate.toFixed(1)}x
        </label>
        <input 
          id="rate-slider"
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.rate}
          onChange={(e) => onChange({ 
            ...settings, 
            rate: parseFloat(e.target.value) 
          })}
        />
      </div>
      
      <div className="setting-group">
        <label htmlFor="pitch-slider">
          음조: {settings.pitch.toFixed(1)}
        </label>
        <input 
          id="pitch-slider"
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.pitch}
          onChange={(e) => onChange({ 
            ...settings, 
            pitch: parseFloat(e.target.value) 
          })}
        />
      </div>
      
      <div className="setting-group">
        <label>
          <input 
            type="checkbox"
            checked={settings.autoAdvance}
            onChange={(e) => onChange({ 
              ...settings, 
              autoAdvance: e.target.checked 
            })}
          />
          자동으로 다음 구절 재생
        </label>
      </div>
      
      {settings.autoAdvance && (
        <div className="setting-group">
          <label htmlFor="pause-duration">
            구절 간 멈춤: {settings.pauseBetweenVerses / 1000}초
          </label>
          <input 
            id="pause-duration"
            type="range"
            min="500"
            max="5000"
            step="500"
            value={settings.pauseBetweenVerses}
            onChange={(e) => onChange({ 
              ...settings, 
              pauseBetweenVerses: parseInt(e.target.value) 
            })}
          />
        </div>
      )}
    </div>
  );
};
```

---

## 📖 **3. 본문 표시 시스템**

### **3-1. 성경 읽기 핵심 기능**

#### **3-1-1. 상단 헤더 영역**
```typescript
interface ChapterHeaderProps {
  bookName: string;
  chapterNumber: number;
  chapterTitle?: string;
}

const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  bookName,
  chapterNumber,
  chapterTitle
}) => {
  return (
    <div className="chapter-header">
      <h1 className="chapter-title">
        {bookName} {chapterNumber}장
      </h1>
      {chapterTitle && (
        <p className="chapter-subtitle">{chapterTitle}</p>
      )}
    </div>
  );
};
```

#### **3-1-2. HTML 본문 렌더링 영역**
```typescript
interface BibleContentProps {
  htmlContent: string;
  currentAudioVerse?: number;
  onVerseClick?: (verseNumber: number) => void;
}

const BibleContent: React.FC<BibleContentProps> = ({
  htmlContent,
  currentAudioVerse,
  onVerseClick
}) => {
  return (
    <div className="bible-content">
      <div 
        className="html-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        onClick={(e) => {
          const verseElement = (e.target as HTMLElement).closest('[data-verse]');
          if (verseElement) {
            const verseNumber = parseInt(verseElement.getAttribute('data-verse') || '0');
            onVerseClick?.(verseNumber);
          }
        }}
      />
      {currentAudioVerse && (
        <div className="current-verse-highlight" data-verse={currentAudioVerse}>
          현재 읽는 구절: {currentAudioVerse}절
        </div>
      )}
    </div>
  );
};
```

#### **3-1-3. 하단 네비게이션 영역**
```typescript
interface ChapterNavigationProps {
  hasPreviousChapter: boolean;
  hasNextChapter: boolean;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
}

const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  hasPreviousChapter,
  hasNextChapter,
  onPreviousChapter,
  onNextChapter
}) => {
  return (
    <div className="chapter-navigation">
      <button 
        className="nav-btn prev-btn"
        disabled={!hasPreviousChapter}
        onClick={onPreviousChapter}
        aria-label="이전 장으로 이동"
      >
        이전 장
      </button>
      <button 
        className="nav-btn next-btn"
        disabled={!hasNextChapter}
        onClick={onNextChapter}
        aria-label="다음 장으로 이동"
      >
        다음 장
      </button>
    </div>
  );
};
```

### **3-2. TTS 읽기 콘트롤**
```typescript
interface TTSControlsProps {
  isPlaying: boolean;
  currentVerse: number;
  totalVerses: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVerseSelect: (verseNumber: number) => void;
}

const TTSControls: React.FC<TTSControlsProps> = ({
  isPlaying,
  currentVerse,
  totalVerses,
  onPlay,
  onPause,
  onStop,
  onVerseSelect
}) => {
  return (
    <div className="tts-controls">
      <div className="tts-buttons">
        <button 
          className="tts-btn play-btn"
          onClick={isPlaying ? onPause : onPlay}
          aria-label={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button 
          className="tts-btn stop-btn"
          onClick={onStop}
          aria-label="정지"
        >
          ⏹️
        </button>
      </div>
      
      <div className="tts-progress">
        <span className="current-verse">현재: {currentVerse}절</span>
        <span className="total-verses">전체: {totalVerses}절</span>
      </div>
    </div>
  );
};
```

### **3-3. 현재 읽는 절 하이라이트 기능**
```typescript
interface VerseHighlightProps {
  currentVerse: number;
  verses: Array<{ number: number; text: string }>;
}

const VerseHighlight: React.FC<VerseHighlightProps> = ({
  currentVerse,
  verses
}) => {
  return (
    <div className="verse-highlight-container">
      {verses.map(verse => (
        <div
          key={verse.number}
          className={`verse ${currentVerse === verse.number ? 'highlighted' : ''}`}
          data-verse={verse.number}
        >
          <span className="verse-number">{verse.number}</span>
          <span className="verse-text">{verse.text}</span>
        </div>
      ))}
    </div>
  );
};
```

  const fontSizeOptions = [
    { value: 'small', label: '작게' },
    { value: 'medium', label: '보통' },
    { value: 'large', label: '크게' },
    { value: 'xl', label: '매우크게' }
  ] as const;

  return (
    <div className="reading-mode-controls">
      {/* Reading Mode Selection */}
      <div className="control-group">
        <h4 className="control-label">읽기 모드</h4>
        <div className="mode-selector">
          {modeOptions.map(option => (
            <button
              key={option.value}
              className={`mode-btn ${currentMode === option.value ? 'active' : ''}`}
              onClick={() => onModeChange(option.value as ReadingMode)}
              title={option.description}
              aria-label={`${option.label} 모드로 변경`}
            >
              <Icon name={option.icon} size="sm" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Font Size Control */}
      <div className="control-group">
        <h4 className="control-label">글자 크기</h4>
        <div className="font-size-selector">
          {fontSizeOptions.map(option => (
            <button
              key={option.value}
              className={`font-btn ${fontSize === option.value ? 'active' : ''}`}
              onClick={() => onFontSizeChange(option.value)}
              aria-label={`글자 크기 ${option.label}로 변경`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Additional Controls */}
      <div className="control-group">
        <h4 className="control-label">화면 설정</h4>
        <div className="additional-controls">
          <button 
            className="control-btn"
            onClick={onThemeToggle}
            aria-label={`${theme === 'dark' ? '라이트' : '다크'} 모드로 변경`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="sm" />
            {theme === 'dark' ? '라이트모드' : '다크모드'}
          </button>
          
          <button className="control-btn">
            <Icon name="maximize" size="sm" />
            전체화면
          </button>
          
          <button className="control-btn">
            <Icon name="bookmark" size="sm" />
            책갈피
          </button>
        </div>
      </div>
    </div>
  );
};
```

### **3-2. 성경 본문 렌더링 컴포넌트**
```typescript
interface BibleVerse {
  number: number;
  text: string;
  reference: string; // e.g., "창 1:1"
  isHighlighted?: boolean;
  highlightType?: 'personal' | 'community' | 'study';
  notes?: string[];
}

interface BibleContentProps {
  verses: BibleVerse[];
  readingMode: ReadingMode;
  fontSize: string;
  currentAudioVerse?: number;
  highlightMode: boolean;
  onVerseClick: (verseNumber: number) => void;
  onVerseHighlight: (verseNumber: number, type: 'personal' | 'community' | 'study') => void;
}

const BibleContent: React.FC<BibleContentProps> = ({
  verses,
  readingMode,
  fontSize,
  currentAudioVerse,
  highlightMode,
  onVerseClick,
  onVerseHighlight
}) => {
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const handleVerseInteraction = (verseNumber: number) => {
    if (highlightMode) {
      onVerseHighlight(verseNumber, 'personal');
    } else {
      setSelectedVerse(verseNumber === selectedVerse ? null : verseNumber);
      onVerseClick(verseNumber);
    }
  };

  const renderVerse = (verse: BibleVerse, index: number) => {
    const isCurrentAudio = currentAudioVerse === verse.number;
    const isSelected = selectedVerse === verse.number;
    
    const verseClasses = `
      verse
      ${readingMode}-mode
      ${verse.isHighlighted ? `highlighted-${verse.highlightType}` : ''}
      ${isCurrentAudio ? 'current-audio' : ''}
      ${isSelected ? 'selected' : ''}
      ${fontSize}
    `;

    return (
      <div
        key={verse.number}
        className={verseClasses}
        data-verse={verse.number}
        onClick={() => handleVerseInteraction(verse.number)}
        role="button"
        tabIndex={0}
        aria-label={`${verse.number}절: ${verse.text.substring(0, 50)}...`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleVerseInteraction(verse.number);
          }
        }}
      >
        {/* Verse Number */}
        <span className="verse-number" aria-label={`${verse.number}절`}>
          {verse.number}
        </span>
        
        {/* Verse Text */}
        <span className="verse-text">
          {verse.text}
        </span>
        
        {/* Audio Playing Indicator */}
        {isCurrentAudio && (
          <div className="audio-indicator" aria-label="현재 재생 중">
            <div className="audio-waves">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        {/* Highlight Indicator */}
        {verse.isHighlighted && (
          <div className={`highlight-indicator ${verse.highlightType}`}>
            <Icon 
              name={verse.highlightType === 'personal' ? 'heart' : 
                    verse.highlightType === 'community' ? 'users' : 'star'} 
              size="xs" 
            />
          </div>
        )}
        
        {/* Notes Indicator */}
        {verse.notes && verse.notes.length > 0 && (
          <div className="notes-indicator">
            <Icon name="messageCircle" size="xs" />
            <span className="notes-count">{verse.notes.length}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bible-content ${readingMode}-layout`}>
      {/* Chapter Header */}
      <div className="chapter-header">
        <h1 className="chapter-title">
          {verses[0]?.reference.split(':')[0]} {/* e.g., "창세기 1장" */}
        </h1>
        <div className="chapter-meta">
          <span className="verse-count">{verses.length}개 구절</span>
          <span className="reading-time">예상 읽기 시간 {Math.ceil(verses.length / 3)}분</span>
        </div>
      </div>
      
      {/* Verses Container */}
      <div className="verses-container">
        {readingMode === 'meditation' ? (
          // Meditation Mode: One verse at a time
          <div className="meditation-container">
            {verses.map((verse, index) => (
              <div key={verse.number} className="meditation-verse-wrapper">
                {renderVerse(verse, index)}
                {index < verses.length - 1 && (
                  <div className="verse-divider">⬥</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Normal and Paragraph Modes
          <div className="normal-verses-container">
            {verses.map((verse, index) => renderVerse(verse, index))}
          </div>
        )}
      </div>
      
      {/* Reading Progress Indicator */}
      <div className="reading-progress-indicator">
        <div className="progress-line">
          <div 
            className="progress-fill"
            style={{ 
              width: `${selectedVerse ? (selectedVerse / verses.length) * 100 : 0}%` 
            }}
          />
        </div>
        <span className="progress-text">
          {selectedVerse ? `${selectedVerse}/${verses.length} 구절` : '읽기 시작'}
        </span>
      </div>
    </div>
  );
};
```

### **3-3. 읽기 모드별 스타일링**
```css
/* Base Verse Styling */
.verse {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.verse:hover {
  background: var(--hover-overlay);
  border-left-color: var(--accent-primary);
}

.verse-number {
  font-weight: 600;
  color: var(--accent-primary);
  font-size: 0.9em;
  min-width: 2rem;
  flex-shrink: 0;
}

.verse-text {
  flex: 1;
  line-height: 1.7;
}

/* Reading Mode Variations */

/* 1. Verse Mode (Default) */
.verse.verse-mode {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
}

/* 2. Paragraph Mode */
.paragraph-layout .verse {
  display: inline;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
}

.paragraph-layout .verse-number {
  font-size: 0.75em;
  vertical-align: super;
  margin-right: 0.25rem;
}

.paragraph-layout .verse-text {
  display: inline;
}

/* 3. Meditation Mode */
.meditation-verse-wrapper {
  margin: 3rem 0;
  text-align: center;
}

.verse.meditation-mode {
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.meditation-mode .verse-text {
  font-size: 1.25em;
  line-height: 2;
  text-align: center;
  font-weight: 400;
}

.verse-divider {
  text-align: center;
  font-size: 1.5rem;
  color: var(--text-muted);
  margin: 2rem 0;
}

/* Font Size Variations */
.verse.small .verse-text { font-size: 0.875rem; }
.verse.medium .verse-text { font-size: 1rem; }
.verse.large .verse-text { font-size: 1.125rem; }
.verse.xl .verse-text { font-size: 1.25rem; }

/* Highlight Styles */
.verse.highlighted-personal {
  background: var(--highlight-personal);
  border-left-color: var(--accent-primary);
}

.verse.highlighted-community {
  background: var(--highlight-community);
  border-left-color: var(--success);
}

.verse.highlighted-study {
  background: var(--highlight-study);
  border-left-color: #a855f7;
}

/* Current Audio Verse */
.verse.current-audio {
  background: var(--highlight-meditation);
  border-left-color: #eab308;
  box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.3);
}

/* Audio Playing Animation */
.audio-indicator {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.audio-waves {
  display: flex;
  gap: 2px;
  align-items: end;
}

.audio-waves span {
  width: 2px;
  background: #eab308;
  animation: audioWave 1s ease-in-out infinite alternate;
}

.audio-waves span:nth-child(2) { animation-delay: 0.1s; }
.audio-waves span:nth-child(3) { animation-delay: 0.2s; }

@keyframes audioWave {
  from { height: 4px; }
  to { height: 12px; }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .verse {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .meditation-mode {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .verse-divider {
    margin: 1rem 0;
  }
}
```

---

## ✨ **4. 하이라이트 시스템**

### **4-1. 하이라이트 관리 컴포넌트**
```typescript
interface Highlight {
  id: string;
  verseNumber: number;
  type: 'personal' | 'community' | 'study';
  color?: string;
  note?: string;
  createdAt: Date;
  userId?: string;
}

interface HighlightManagerProps {
  highlights: Highlight[];
  onAdd: (verseNumber: number, type: Highlight['type'], note?: string) => void;
  onRemove: (highlightId: string) => void;
  onUpdate: (highlightId: string, updates: Partial<Highlight>) => void;
}

const HighlightManager: React.FC<HighlightManagerProps> = ({
  highlights,
  onAdd,
  onRemove,
  onUpdate
}) => {
  const [activeMode, setActiveMode] = useState<Highlight['type'] | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState<number | null>(null);

  const highlightTypes = [
    { 
      type: 'personal', 
      label: '개인 하이라이트', 
      icon: 'heart', 
      color: '#3b82f6',
      description: '개인적인 묵상과 깨달음' 
    },
    { 
      type: 'community', 
      label: '커뮤니티 하이라이트', 
      icon: 'users', 
      color: '#10b981',
      description: '많은 사용자가 선택한 구절' 
    },
    { 
      type: 'study', 
      label: '연구 하이라이트', 
      icon: 'star', 
      color: '#a855f7',
      description: '학습과 연구를 위한 표시' 
    }
  ] as const;

  const getHighlightStats = () => {
    return highlightTypes.map(type => ({
      ...type,
      count: highlights.filter(h => h.type === type.type).length
    }));
  };

  return (
    <div className="highlight-manager">
      <div className="highlight-controls">
        <h4 className="controls-title">✨ 하이라이트 도구</h4>
        
        {/* Mode Selector */}
        <div className="highlight-mode-selector">
          {highlightTypes.map(type => (
            <button
              key={type.type}
              className={`highlight-mode-btn ${activeMode === type.type ? 'active' : ''}`}
              onClick={() => setActiveMode(activeMode === type.type ? null : type.type)}
              style={{ '--highlight-color': type.color } as React.CSSProperties}
              title={type.description}
            >
              <Icon name={type.icon} size="sm" />
              <span>{type.label}</span>
              <span className="highlight-count">
                {highlights.filter(h => h.type === type.type).length}
              </span>
            </button>
          ))}
        </div>
        
        {/* Active Mode Indicator */}
        {activeMode && (
          <div className="active-mode-indicator">
            <Icon name="info" size="sm" />
            <span>
              {highlightTypes.find(t => t.type === activeMode)?.description}
            </span>
            <button 
              className="deactivate-btn"
              onClick={() => setActiveMode(null)}
            >
              해제
            </button>
          </div>
        )}
      </div>
      
      {/* Highlight Statistics */}
      <div className="highlight-stats">
        <h5>📊 하이라이트 현황</h5>
        <div className="stats-grid">
          {getHighlightStats().map(stat => (
            <div key={stat.type} className="stat-card">
              <div className="stat-icon" style={{ color: stat.color }}>
                <Icon name={stat.icon} size="sm" />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stat.count}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Highlights */}
      <div className="recent-highlights">
        <h5>📝 최근 하이라이트</h5>
        <div className="highlights-list">
          {highlights
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
            .map(highlight => (
              <div key={highlight.id} className="highlight-item">
                <div className="highlight-info">
                  <span className="verse-ref">{highlight.verseNumber}절</span>
                  <span className={`highlight-type ${highlight.type}`}>
                    <Icon 
                      name={highlightTypes.find(t => t.type === highlight.type)?.icon || 'star'} 
                      size="xs" 
                    />
                  </span>
                </div>
                {highlight.note && (
                  <p className="highlight-note">{highlight.note}</p>
                )}
                <div className="highlight-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => setShowNoteDialog(highlight.verseNumber)}
                  >
                    <Icon name="edit" size="xs" />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => onRemove(highlight.id)}
                  >
                    <Icon name="trash2" size="xs" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      
      {/* Note Dialog */}
      {showNoteDialog && (
        <NoteDialog
          verseNumber={showNoteDialog}
          existingNote={highlights.find(h => h.verseNumber === showNoteDialog)?.note}
          onSave={(note) => {
            const existingHighlight = highlights.find(h => h.verseNumber === showNoteDialog);
            if (existingHighlight) {
              onUpdate(existingHighlight.id, { note });
            }
            setShowNoteDialog(null);
          }}
          onCancel={() => setShowNoteDialog(null)}
        />
      )}
    </div>
  );
};
```

### **4-2. 노트 작성 다이얼로그**
```typescript
interface NoteDialogProps {
  verseNumber: number;
  existingNote?: string;
  onSave: (note: string) => void;
  onCancel: () => void;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
  verseNumber,
  existingNote = '',
  onSave,
  onCancel
}) => {
  const [note, setNote] = useState(existingNote);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (note.trim()) {
      setIsSaving(true);
      try {
        await onSave(note.trim());
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={`${verseNumber}절 묵상 노트`}
      size="md"
    >
      <div className="note-dialog">
        <div className="note-input-section">
          <label htmlFor="note-textarea" className="sr-only">
            묵상 노트 작성
          </label>
          <textarea
            id="note-textarea"
            className="note-textarea"
            placeholder="이 구절을 통해 받은 은혜나 깨달음을 기록해보세요..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
            maxLength={500}
            autoFocus
          />
          <div className="character-count">
            {note.length}/500
          </div>
        </div>
        
        <div className="note-suggestions">
          <h6>💡 묵상 가이드</h6>
          <div className="suggestion-tags">
            <button 
              className="suggestion-tag"
              onClick={() => setNote(prev => `${prev}\n\n🎯 적용점: `)}
            >
              적용점
            </button>
            <button 
              className="suggestion-tag"
              onClick={() => setNote(prev => `${prev}\n\n🙏 기도제목: `)}
            >
              기도제목
            </button>
            <button 
              className="suggestion-tag"
              onClick={() => setNote(prev => `${prev}\n\n❤️ 감사: `)}
            >
              감사
            </button>
            <button 
              className="suggestion-tag"
              onClick={() => setNote(prev => `${prev}\n\n🤔 질문: `)}
            >
              질문
            </button>
          </div>
        </div>
        
        <div className="dialog-actions">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            loading={isSaving}
            disabled={!note.trim()}
          >
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

---

## 📊 **5. 진도 추적 시스템**

### **5-1. 읽기 진도 추적 로직**
```typescript
interface ReadingSession {
  id: string;
  bookId: string;
  chapterNumber: number;
  startTime: Date;
  endTime?: Date;
  readingDuration: number; // seconds
  listeningDuration: number; // seconds
  completionPercentage: number; // 0-100
  scrollProgress: number; // 0-100
  versesRead: number[];
  mode: ReadingMode;
  completed: boolean;
}

const useReadingProgress = (bookId: string, chapterNumber: number) => {
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  // Initialize session when component mounts
  useEffect(() => {
    const newSession: ReadingSession = {
      id: crypto.randomUUID(),
      bookId,
      chapterNumber,
      startTime: new Date(),
      readingDuration: 0,
      listeningDuration: 0,
      completionPercentage: 0,
      scrollProgress: 0,
      versesRead: [],
      mode: 'verse',
      completed: false
    };
    
    setSession(newSession);
    setIsTracking(true);
  }, [bookId, chapterNumber]);

  // Track scroll progress
  const updateScrollProgress = useCallback((scrollPercentage: number) => {
    if (session && isTracking) {
      setSession(prev => prev ? {
        ...prev,
        scrollProgress: Math.max(prev.scrollProgress, scrollPercentage),
        completionPercentage: Math.max(prev.completionPercentage, scrollPercentage * 0.8) // 80% weight for scroll
      } : null);
    }
  }, [session, isTracking]);

  // Track verse interaction
  const markVerseRead = useCallback((verseNumber: number) => {
    if (session && isTracking) {
      setSession(prev => {
        if (!prev) return null;
        
        const newVersesRead = prev.versesRead.includes(verseNumber) 
          ? prev.versesRead 
          : [...prev.versesRead, verseNumber];
          
        const readPercentage = (newVersesRead.length / totalVerses) * 100;
        
        return {
          ...prev,
          versesRead: newVersesRead,
          completionPercentage: Math.max(prev.completionPercentage, readPercentage)
        };
      });
    }
  }, [session, isTracking]);

  // Track reading time
  useEffect(() => {
    if (!isTracking || !session) return;

    const interval = setInterval(() => {
      setSession(prev => prev ? {
        ...prev,
        readingDuration: prev.readingDuration + 1
      } : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, session]);

  // Save session when unmounting or completing
  const completeSession = useCallback(async () => {
    if (session) {
      const completedSession = {
        ...session,
        endTime: new Date(),
        completed: session.completionPercentage >= 90 // 90% threshold for completion
      };
      
      // Save to Supabase
      await saveReadingSession(completedSession);
      setIsTracking(false);
    }
  }, [session]);

  return {
    session,
    updateScrollProgress,
    markVerseRead,
    completeSession,
    isTracking
  };
};
```

### **5-2. 실시간 진도 표시 컴포넌트**
```typescript
interface ProgressIndicatorProps {
  session: ReadingSession | null;
  totalVerses: number;
  currentVerse?: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  session,
  totalVerses,
  currentVerse
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!session) return null;

  const readingProgress = (session.versesRead.length / totalVerses) * 100;
  const timeProgress = Math.min((session.readingDuration / 600) * 100, 100); // 10분 기준
  const overallProgress = session.completionPercentage;

  return (
    <div className={`progress-indicator ${isVisible ? 'visible' : 'hidden'}`}>
      {/* Top Progress Bar */}
      <div className="top-progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      
      {/* Detailed Progress Panel */}
      <div className="progress-panel">
        <button 
          className="toggle-btn"
          onClick={() => setIsVisible(!isVisible)}
          aria-label={isVisible ? "진도 패널 숨기기" : "진도 패널 보기"}
        >
          <Icon name={isVisible ? "chevronUp" : "chevronDown"} size="sm" />
        </button>
        
        {isVisible && (
          <div className="progress-details">
            {/* Reading Stats */}
            <div className="progress-stat">
              <div className="stat-icon">📖</div>
              <div className="stat-content">
                <div className="stat-label">읽은 구절</div>
                <div className="stat-value">
                  {session.versesRead.length} / {totalVerses}
                </div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill reading"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Time Stats */}
            <div className="progress-stat">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-label">읽기 시간</div>
                <div className="stat-value">
                  {Math.floor(session.readingDuration / 60)}분 {session.readingDuration % 60}초
                </div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill time"
                    style={{ width: `${timeProgress}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Audio Stats */}
            {session.listeningDuration > 0 && (
              <div className="progress-stat">
                <div className="stat-icon">🎵</div>
                <div className="stat-content">
                  <div className="stat-label">듣기 시간</div>
                  <div className="stat-value">
                    {Math.floor(session.listeningDuration / 60)}분 {session.listeningDuration % 60}초
                  </div>
                </div>
              </div>
            )}
            
            {/* Completion Prediction */}
            <div className="completion-prediction">
              {overallProgress >= 90 ? (
                <div className="completion-ready">
                  🎉 완독 달성! 
                  <button className="mark-complete-btn">
                    완료 표시
                  </button>
                </div>
              ) : (
                <div className="completion-progress">
                  완독까지 {100 - Math.round(overallProgress)}% 남음
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### **5-3. 스크롤 기반 진도 추적**
```typescript
const useScrollProgress = (onProgressUpdate: (progress: number) => void) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = throttle(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      
      if (maxScroll <= 0) {
        setProgress(100);
        onProgressUpdate(100);
        return;
      }
      
      const scrollProgress = (scrollTop / maxScroll) * 100;
      const clampedProgress = Math.min(Math.max(scrollProgress, 0), 100);
      
      setProgress(clampedProgress);
      onProgressUpdate(clampedProgress);
    }, 100);

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [onProgressUpdate]);

  return { containerRef, progress };
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}
```

---

## 📱 **6. 반응형 최적화**

### **6-1. 모바일 네비게이션**
```typescript
const MobileNavigation: React.FC<{
  selectedBook: BibleBook;
  currentChapter: number;
  onBookChange: (book: BibleBook) => void;
  onChapterChange: (chapter: number) => void;
}> = ({ selectedBook, currentChapter, onBookChange, onChapterChange }) => {
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);

  return (
    <div className="mobile-navigation">
      {/* Bottom Tab Bar */}
      <div className="mobile-tab-bar">
        <button 
          className="tab-btn"
          onClick={() => setShowBookSelector(true)}
        >
          <Icon name="book" size="sm" />
          <span>책 선택</span>
        </button>
        
        <button 
          className="tab-btn"
          onClick={() => setShowChapterSelector(true)}
        >
          <Icon name="list" size="sm" />
          <span>장 선택</span>
        </button>
        
        <button className="tab-btn">
          <Icon name="bookmark" size="sm" />
          <span>책갈피</span>
        </button>
        
        <button className="tab-btn">
          <Icon name="heart" size="sm" />
          <span>하이라이트</span>
        </button>
      </div>
      
      {/* Book Selector Modal */}
      <Modal
        isOpen={showBookSelector}
        onClose={() => setShowBookSelector(false)}
        title="성경 선택"
        size="full"
      >
        <MobileBookSelector 
          onSelect={(book) => {
            onBookChange(book);
            setShowBookSelector(false);
          }}
        />
      </Modal>
      
      {/* Chapter Selector Modal */}
      <Modal
        isOpen={showChapterSelector}
        onClose={() => setShowChapterSelector(false)}
        title={`${selectedBook.name} 장 선택`}
        size="lg"
      >
        <MobileChapterSelector 
          book={selectedBook}
          currentChapter={currentChapter}
          onSelect={(chapter) => {
            onChapterChange(chapter);
            setShowChapterSelector(false);
          }}
        />
      </Modal>
    </div>
  );
};
```

### **6-2. 터치 제스처 지원**
```typescript
const useTouchGestures = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  onDoubleTap: () => void
) => {
  const [touchStart, setTouchStart] = useState<TouchEvent['touches'][0] | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0]);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0];
    const deltaX = touchStart.clientX - touchEnd.clientX;
    const deltaY = touchStart.clientY - touchEnd.clientY;
    
    // Swipe detection (minimum 50px horizontal movement, less than 100px vertical)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
      if (deltaX > 0) {
        onSwipeLeft(); // Next chapter
      } else {
        onSwipeRight(); // Previous chapter
      }
    }
    
    // Double tap detection
    const now = Date.now();
    if (now - lastTap < 300) {
      onDoubleTap();
    }
    setLastTap(now);
    
    setTouchStart(null);
  };

  return { handleTouchStart, handleTouchEnd };
};
```

---

## 💾 **7. 데이터 관리 및 API**

### **7-1. HTML 파일 렌더링 API**
```typescript
// api/bible.ts
export interface BibleChapterData {
  id: string;
  book_id: string;
  chapter_number: number;
  html_content: string;
  metadata: {
    title: string;
    subtitle?: string;
    total_verses: number;
  };
}

export const fetchBibleChapter = async (
  bookId: string, 
  chapterNumber: number
): Promise<BibleChapterData> => {
  const { data, error } = await supabase
    .from('rb_bible_chapters')
    .select(`
      *,
      bible_book:rb_bible_books(*)
    `)
    .eq('book_id', bookId)
    .eq('chapter_number', chapterNumber)
    .eq('status', 'published')
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    book_id: data.book_id,
    chapter_number: data.chapter_number,
    html_content: data.html_content,
    metadata: {
      title: data.title,
      subtitle: data.subtitle || '',
      total_verses: data.total_verses || 0
    }
  };
};

export const getChapterNavigation = async (
  bookId: string, 
  currentChapter: number
) => {
  const { data: chapters, error } = await supabase
    .from('rb_bible_chapters')
    .select('chapter_number')
    .eq('book_id', bookId)
    .order('chapter_number');

  if (error) throw error;
  
  const chapterNumbers = chapters.map(c => c.chapter_number);
  const currentIndex = chapterNumbers.indexOf(currentChapter);
  
  return {
    hasPrevious: currentIndex > 0,
    hasNext: currentIndex < chapterNumbers.length - 1,
    previousChapter: currentIndex > 0 ? chapterNumbers[currentIndex - 1] : null,
    nextChapter: currentIndex < chapterNumbers.length - 1 ? chapterNumbers[currentIndex + 1] : null
  };
};
      verses_read: session.versesRead
    });

  if (error) throw error;
};

export const fetchReadingProgress = async (
  bookId: string
): Promise<Record<number, any>> => {
  const { data, error } = await supabase
    .from('rb_reading_progress')
    .select('*')
    .eq('user_id', getUserSession())
    .eq('book_id', bookId);

  if (error) throw error;
  
  return data.reduce((acc, item) => {
    acc[item.chapter_number] = {
      readingCompleted: item.reading_completed,
      listeningCompleted: item.listening_completed,
      completionPercentage: item.completion_percentage
    };
    return acc;
  }, {});
};
```

### **7-2. 실시간 데이터 동기화**
```typescript
// hooks/useRealtimeProgress.ts
export const useRealtimeProgress = (bookId: string) => {
  const [progress, setProgress] = useState<Record<number, any>>({});

  useEffect(() => {
    // Initial data fetch
    fetchReadingProgress(bookId).then(setProgress);

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`progress:${bookId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rb_reading_progress',
          filter: `book_id=eq.${bookId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setProgress(prev => ({
              ...prev,
              [payload.new.chapter_number]: {
                readingCompleted: payload.new.reading_completed,
                listeningCompleted: payload.new.listening_completed,
                completionPercentage: payload.new.completion_percentage
              }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookId]);

  return progress;
};
```

---

## ✅ **구현 체크리스트**

### **환경 설정 및 의존성**
- [ ] shadcn/ui 설치 및 초기 설정
- [ ] 독립적 데이터 모델 타입 정의 (`types/bible-reading.ts`)
- [ ] 독립적 Supabase 테이블 스키마 생성
- [ ] 동적 라우팅 구조 설정 (`/read/[book]/[chapter]`)

### **네비게이션 시스템**
- [ ] 신/구약 토글 스위치 구현
- [ ] 성경 책 카드 그리드 레이아웃
- [ ] 장별 네비게이션 (완료 상태 표시)
- [ ] 개인 진도 대시보드 구현
- [ ] 모바일 네비게이션 적응

### **오디오 시스템**
- [ ] TTS 엔진 통합 (Web Speech API)
- [ ] 오디오 플레이어 컨트롤
- [ ] 음성 설정 패널 구현
- [ ] 구절별 자동 재생 기능
- [ ] 취침 타이머 기능

### **본문 표시 시스템**
- [ ] 3가지 읽기 모드 구현
- [ ] 반응형 폰트 크기 조절
- [ ] 구절별 상호작용 기능
- [ ] 하이라이트 시스템 구현
- [ ] 노트 작성 다이얼로그

### **진도 추적 시스템**
- [ ] 스크롤 기반 진도 추적
- [ ] 읽기 시간 측정
- [ ] 완료 체크 로직 구현
- [ ] 실시간 진도 표시
- [ ] Supabase 데이터 동기화

### **독립적 FileUpload 시스템**
- [ ] READ 페이지 전용 FileUpload 컴포넌트
- [ ] 성경 콘텐츠 특화 업로드 기능
- [ ] 실시간 미리보기 및 검증
- [ ] 업로드 진행률 표시
- [ ] 에러 처리 및 복구 기능

### **반응형 최적화**
- [ ] 모바일 터치 제스처 지원
- [ ] 태블릿 레이아웃 최적화
- [ ] 접근성 키보드 네비게이션
- [ ] 성능 최적화 (lazy loading)

### **데이터 관리**
- [ ] 독립적 Supabase 쿼리 함수 구현
- [ ] 실시간 데이터 동기화
- [ ] 로컬 스토리지 백업
- [ ] 오프라인 모드 지원

---

## 🎯 **다음 단계**

성경읽기 페이지 설계 완료 후 다음 순서로 진행:

1. **shadcn/ui 환경 설정** - UI 컴포넌트 라이브러리 설치 및 설정
2. **독립적 데이터 모델 구현** - 타입 정의 및 Supabase 테이블 생성
3. **동적 라우팅 구조 구축** - `/read/[book]/[chapter]` 라우팅 구현
4. **04-데이터관리-PRD.md** - 관리자 도구 및 콘텐츠 관리 시스템
5. **03-성경자료실-PRD.md** - HTML 편집기 및 자료 관리 기능
6. **01-HOME-PRD.md** - 통합 대시보드 및 분석 기능

---

**📋 문서 상태**: ✅ **완료** - 성경읽기 페이지 상세 설계 확정 (v2.0.0)  
**🎯 핵심 기능**: 읽기/듣기/진도추적 통합 완성  
**📱 사용자 경험**: 몰입형 성경 읽기 환경 구축  
**🔧 기술 스택**: Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase, shadcn/ui  
**📅 다음 리뷰**: shadcn/ui 환경 설정 완료 후

---

## 📖 **성경읽기용 한글 성경 본문 텍스트 소스**

### **1. 텍스트 소스 형태 및 구조**

#### **1-1. 권장 텍스트 소스**
- **개역개정판 (KRV)**: 가장 널리 사용되는 한글 성경 번역본
- **새번역 (NIV)**: 현대적이고 읽기 쉬운 번역
- **공동번역**: 천주교와 개신교가 공동으로 번역한 성경
- **표준새번역 (KSB)**: 한국성서공회에서 발행한 현대적 번역

#### **1-2. 텍스트 구조 요구사항**
```html
<!-- 권장 HTML 구조 -->
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>창세기 1장</title>
    <meta name="book" content="창세기">
    <meta name="chapter" content="1">
    <meta name="translation" content="개역개정">
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

#### **1-3. 구절별 데이터 구조**
```typescript
interface VerseData {
  number: number;           // 구절 번호
  text: string;            // 구절 본문
  reference: string;       // 성경 참조 (예: "창 1:1")
  paragraph?: number;      // 문단 구분 (선택사항)
  section?: string;        // 섹션 제목 (선택사항)
}
```

### **2. 텍스트 소스 준비 방법**

#### **2-1. 기존 성경 텍스트 활용**
```typescript
// 기존 성경 파일에서 텍스트 추출 및 변환
const convertExistingBibleText = (htmlContent: string): VerseData[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const verses: VerseData[] = [];
  const verseElements = doc.querySelectorAll('.verse, [data-verse], p');
  
  verseElements.forEach((element, index) => {
    const verseNumber = parseInt(element.getAttribute('data-verse') || (index + 1).toString());
    const verseText = element.textContent?.trim() || '';
    
    if (verseText) {
      verses.push({
        number: verseNumber,
        text: verseText,
        reference: `창 ${1}:${verseNumber}` // 동적으로 생성
      });
    }
  });
  
  return verses;
};
```

#### **2-2. 텍스트 정제 및 표준화**
```typescript
// 텍스트 정제 함수
const sanitizeBibleText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')           // 연속 공백 제거
    .replace(/[^\w\s가-힣.,!?;:()]/g, '') // 특수문자 정리
    .trim();
};

// 구절 번호 추출 함수
const extractVerseNumber = (text: string): { number: number; cleanText: string } => {
  const verseMatch = text.match(/^(\d+)\s*[.。]\s*(.+)$/);
  if (verseMatch) {
    return {
      number: parseInt(verseMatch[1]),
      cleanText: sanitizeBibleText(verseMatch[2])
    };
  }
  
  // 구절 번호가 없는 경우 처리
  return {
    number: 0,
    cleanText: sanitizeBibleText(text)
  };
};
```

### **3. 텍스트 소스 관리 시스템**

#### **3-1. 파일명 규칙**
```
bible-content/
├── old-testament/
│   ├── genesis/
│   │   ├── 01-genesis-01.html
│   │   ├── 02-genesis-02.html
│   │   └── ...
│   ├── exodus/
│   │   ├── 01-exodus-01.html
│   │   └── ...
│   └── ...
└── new-testament/
    ├── matthew/
    │   ├── 01-matthew-01.html
    │   └── ...
    └── ...
```

**파일명 명명 규칙:**
- **형식**: `{장번호}-{책명영문}-{장번호}.html`
- **예시**: `01-genesis-01.html`, `05-matthew-05.html`
- **규칙**: 접두사와 장 번호가 동일한 숫자 형식 사용

#### **3-2. 메타데이터 구조**
```json
{
  "book": {
    "name": "창세기",
    "nameEnglish": "genesis",
    "abbreviation": "창",
    "category": "old-testament",
    "totalChapters": 50,
    "order": 1
  },
  "chapter": {
    "number": 1,
    "title": "천지 창조",
    "subtitle": "하나님의 창조 사역",
    "estimatedReadingTime": 3,
    "wordCount": 450,
    "verseCount": 31
  },
  "translation": {
    "name": "개역개정",
    "abbreviation": "KRV",
    "year": 1998,
    "publisher": "대한성서공회"
  }
}
```

### **4. 텍스트 품질 관리**

#### **4-1. 자동 검증 시스템**
```typescript
interface TextValidationResult {
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

const validateBibleText = (verses: VerseData[], expectedVerseCount: number): TextValidationResult => {
  const result: TextValidationResult = {
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

#### **4-2. 텍스트 정규화**
```typescript
// 구절 텍스트 정규화
const normalizeVerseText = (text: string): string => {
  return text
    .replace(/[^\w\s가-힣.,!?;:()]/g, '') // 특수문자 제거
    .replace(/\s+/g, ' ')                 // 공백 정리
    .replace(/^[\d\s.。]+/, '')           // 앞쪽 구절 번호 제거
    .trim();
};

// 참조 형식 표준화
const normalizeReference = (book: string, chapter: number, verse: number): string => {
  const bookAbbr = getBookAbbreviation(book);
  return `${bookAbbr} ${chapter}:${verse}`;
};
```

### **5. 성능 최적화**

#### **5-1. 텍스트 압축 및 캐싱**
```typescript
// 텍스트 압축 (선택사항)
const compressBibleText = (verses: VerseData[]): string => {
  const compressed = verses.map(verse => 
    `${verse.number}:${verse.text}`
  ).join('|');
  
  return btoa(compressed); // Base64 인코딩
};

// 압축 해제
const decompressBibleText = (compressed: string): VerseData[] => {
  const decoded = atob(compressed);
  return decoded.split('|').map(item => {
    const [number, text] = item.split(':');
    return {
      number: parseInt(number),
      text,
      reference: `창 1:${number}` // 동적 생성 필요
    };
  });
};
```

#### **5-2. 지연 로딩**
```typescript
// 구절별 지연 로딩
const useLazyVerseLoading = (chapterId: string, verseRange: [number, number]) => {
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadVerses = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/verses/${chapterId}?start=${verseRange[0]}&end=${verseRange[1]}`);
        const data = await response.json();
        setVerses(data);
      } catch (error) {
        console.error('구절 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVerses();
  }, [chapterId, verseRange]);
  
  return { verses, loading };
};
```

### **6. 텍스트 소스 권장사항**

#### **6-1. 텍스트 품질 기준**
- **정확성**: 원문과의 일치도 99% 이상
- **가독성**: 현대 한국어 문법에 맞는 자연스러운 표현
- **일관성**: 용어와 번역 스타일의 통일성
- **완전성**: 모든 구절이 누락 없이 포함

#### **6-2. 기술적 요구사항**
- **인코딩**: UTF-8 필수
- **형식**: HTML 또는 JSON 형태
- **구조**: 구절별 명확한 구분
- **메타데이터**: 책, 장, 번역본 정보 포함

#### **6-3. 라이선스 고려사항**
- **공개 도메인**: 개역개정판, 새번역 등
- **상업적 사용**: 출판사별 라이선스 확인 필요
- **저작권**: 번역본별 저작권 정보 명시

---

## 🏗️ **페이지 아키텍처**