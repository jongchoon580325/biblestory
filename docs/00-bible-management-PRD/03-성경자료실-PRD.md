# 📋 03-성경자료실-PRD.md

## 🎯 **문서 개요**

### **문서명**: 성경자료실 페이지 상세 설계서

### **버전**: v1.0.0

### **작성일**: 2025.07.08

### **최종 수정일**: 2025.07.08

### **의존성**: 00-전체아키텍처-PRD.md, 00-공통시스템-PRD.md, 04-데이터관리-PRD.md

---

## 📚 **기능 개요**

> **"운영자가 직접 제작하는 고품질 성경 해설 콘텐츠의 허브 - 창작부터 공유까지"**

### **핵심 가치 제안**

- **Creative Content Hub**: HTML 편집기로 풍부한 멀티미디어 성경 자료 제작
- **Real-time Collaboration**: 실시간 편집 + 미리보기로 즉시 결과 확인
- **Community Engagement**: 댓글 시스템으로 묵상 나눔과 토론 활성화
- **Professional Publishing**: 전문적인 레이아웃과 다운로드 기능
- **Organized Library**: 권별/장별 체계적 자료 분류 및 관리

---

## 🏗️ **페이지 아키텍처**

### **3단계 네비게이션 구조**

```
1단계: 성경자료실 메인
┌─────────────────────────────────────────────────────────┐
│  [구약] [신약] 탭 네비게이션                              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│  │창세기│ │출애굽│ │레위기│ │민수기│ ... (카드 그리드)      │
│  └─────┘ └─────┘ └─────┘ └─────┘                       │
└─────────────────────────────────────────────────────────┘
                    ↓ 책 선택
2단계: 책별 자료 관리
┌─────────────────────────────────────────────────────────┐
│  📖 창세기 자료 관리                                     │
│  ┌─────────────────┐  ┌─────────────────────────────┐    │
│  │  📤 파일 업로드  │  │     📋 등록된 자료 목록      │    │
│  │                 │  │ ID | 제목 | 장 | 미리보기    │    │
│  │ 드래그&드롭     │  │ 1  | 창조  | 1 |    👁️      │    │
│  │ 또는 클릭       │  │ 2  | 타락  | 3 |    👁️      │    │
│  └─────────────────┘  └─────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                    ↓ 미리보기 클릭
3단계: 상세보기 & 편집
┌─────────────────────────────────────────────────────────┐
│  🔧 [편집] [전체보기] [다운로드]                          │
│  ┌──────────────┬──────────────────────────────────────┐ │
│  │   📝 코드    │           🖥️ 미리보기                │ │
│  │   편집기     │                                      │ │
│  │              │          렌더링된 HTML               │ │
│  │  HTML/CSS    │                                      │ │
│  │  실시간 편집  │                                      │ │
│  └──────────────┴──────────────────────────────────────┘ │
│  💬 댓글 섹션: "오늘 묵상한 말씀을 통해 얻은 은혜..."     │
└─────────────────────────────────────────────────────────┘
```

### **반응형 레이아웃 전략**

```css
/* Desktop (1200px+) */
.bible-resource-layout {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.resource-detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  height: calc(100vh - 200px);
}

/* Tablet (768px - 1199px) */
@media (max-width: 1199px) {
  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .resource-detail-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 1fr;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .bible-resource-layout {
    padding: 1rem;
  }

  .book-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .resource-detail-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .editor-section {
    order: 2;
  }

  .preview-section {
    order: 1;
  }
}
```

---

## 📖 **1. 메인 네비게이션 시스템**

### **1-1. 신/구약 탭 전환**

```typescript
interface TestamentTabsProps {
  activeTestament: 'old' | 'new';
  onTestamentChange: (testament: 'old' | 'new') => void;
  stats: {
    oldTestamentBooks: number;
    newTestamentBooks: number;
    oldTestamentResources: number;
    newTestamentResources: number;
  };
}

const TestamentTabs: React.FC<TestamentTabsProps> = ({
  activeTestament,
  onTestamentChange,
  stats
}) => {
  return (
    <div className="testament-tabs">
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTestament === 'old' ? 'active' : ''} old-testament`}
          onClick={() => onTestamentChange('old')}
          aria-label="구약 성경 자료"
        >
          <div className="tab-content">
            <div className="tab-icon">📜</div>
            <div className="tab-text">
              <span className="tab-title">구약 성경</span>
              <span className="tab-subtitle">{stats.oldTestamentBooks}권</span>
            </div>
            <div className="tab-stats">
              <span className="resource-count">{stats.oldTestamentResources}</span>
              <span className="resource-label">자료</span>
            </div>
          </div>
          <div className="tab-indicator" />
        </button>

        <button
          className={`tab-button ${activeTestament === 'new' ? 'active' : ''} new-testament`}
          onClick={() => onTestamentChange('new')}
          aria-label="신약 성경 자료"
        >
          <div className="tab-content">
            <div className="tab-icon">✨</div>
            <div className="tab-text">
              <span className="tab-title">신약 성경</span>
              <span className="tab-subtitle">{stats.newTestamentBooks}권</span>
            </div>
            <div className="tab-stats">
              <span className="resource-count">{stats.newTestamentResources}</span>
              <span className="resource-label">자료</span>
            </div>
          </div>
          <div className="tab-indicator" />
        </button>
      </div>
    </div>
  );
};
```

### **1-2. 책별 카드 그리드 (애니메이션)**

```typescript
interface BibleBookCard {
  id: string;
  name: string;
  nameEnglish: string;
  totalChapters: number;
  resourceCount: number;
  lastUpdated: Date;
  coverImage?: string;
  description: string;
}

interface BookGridProps {
  testament: 'old' | 'new';
  books: BibleBookCard[];
  onBookSelect: (book: BibleBookCard) => void;
}

const BookGrid: React.FC<BookGridProps> = ({
  testament,
  books,
  onBookSelect
}) => {
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

  const filteredBooks = books.filter(book =>
    book.testament === testament
  );

  return (
    <motion.div
      className="book-grid"
      variants={staggerChildren}
      initial="initial"
      animate="animate"
    >
      {filteredBooks.map((book, index) => (
        <motion.div
          key={book.id}
          variants={childVariant}
          whileHover={{
            scale: 1.05,
            rotateY: 5,
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.95 }}
          className="book-card-wrapper"
        >
          <div
            className={`book-card ${testament}-theme`}
            onMouseEnter={() => setHoveredBook(book.id)}
            onMouseLeave={() => setHoveredBook(null)}
            onClick={() => onBookSelect(book)}
            role="button"
            tabIndex={0}
            aria-label={`${book.name} 자료실 열기`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onBookSelect(book);
              }
            }}
          >
            {/* Card Header */}
            <div className="card-header">
              <div className="book-cover">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={`${book.name} 표지`} />
                ) : (
                  <div className="default-cover">
                    <span className="book-number">{index + 1}</span>
                  </div>
                )}
              </div>

              <div className="book-info">
                <h3 className="book-name">{book.name}</h3>
                <p className="book-english">{book.nameEnglish}</p>
              </div>
            </div>

            {/* Card Content */}
            <div className="card-content">
              <p className="book-description">{book.description}</p>

              <div className="book-stats">
                <div className="stat-item">
                  <Icon name="book" size="sm" />
                  <span>{book.totalChapters}장</span>
                </div>
                <div className="stat-item">
                  <Icon name="fileText" size="sm" />
                  <span>{book.resourceCount}개 자료</span>
                </div>
                <div className="stat-item">
                  <Icon name="clock" size="sm" />
                  <span>{formatTimeAgo(book.lastUpdated)}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="card-footer">
              <div className="progress-indicator">
                <div className="progress-label">완성도</div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(book.resourceCount / book.totalChapters) * 100}%`
                    }}
                  />
                </div>
                <div className="progress-text">
                  {Math.round((book.resourceCount / book.totalChapters) * 100)}%
                </div>
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <AnimatePresence>
              {hoveredBook === book.id && (
                <motion.div
                  className="hover-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="hover-content">
                    <Icon name="eye" size="lg" />
                    <span>자료실 열기</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glow Effect */}
            <div className="card-glow" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
```

### **1-3. 카드 애니메이션 CSS**

```css
/* Book Card Animations */
.book-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(10px);

  /* 3D 효과를 위한 transform-style */
  transform-style: preserve-3d;
  perspective: 1000px;
}

.book-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    var(--theme-primary) 0%,
    transparent 50%,
    var(--theme-secondary) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.book-card:hover::before {
  opacity: 0.1;
}

.book-card:hover {
  border-color: var(--theme-primary);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px var(--theme-primary),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-8px) rotateX(5deg) rotateY(5deg);
}

/* Card Glow Effect */
.card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    var(--theme-primary),
    var(--theme-secondary),
    var(--theme-primary)
  );
  border-radius: 18px;
  opacity: 0;
  z-index: -2;
  transition: opacity 0.3s ease;
  animation: glowRotate 3s linear infinite;
}

.book-card:hover .card-glow {
  opacity: 0.5;
}

@keyframes glowRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Hover Overlay */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  gap: 0.5rem;
  z-index: 10;
}

/* Progress Indicator */
.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--border-primary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--theme-primary), var(--theme-secondary));
  transition: width 0.5s ease;
}

/* Testament Themes */
.old-testament.book-card {
  --theme-primary: #7c3aed;
  --theme-secondary: #a855f7;
}

.new-testament.book-card {
  --theme-primary: #059669;
  --theme-secondary: #10b981;
}

/* Responsive Cards */
@media (max-width: 768px) {
  .book-card {
    padding: 1rem;
    transform: none !important; /* 모바일에서는 3D 효과 비활성화 */
  }

  .book-card:hover {
    transform: translateY(-4px);
  }

  .card-header {
    flex-direction: column;
    text-align: center;
  }

  .book-stats {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
```

---

## 📁 **2. 책별 자료 관리 시스템**

### **2-1. 파일 업로드 섹션**

```typescript
interface FileUploadSectionProps {
  bookId: string;
  bookName: string;
  onUploadComplete: (files: UploadedFile[]) => void;
  onUploadProgress: (progress: number) => void;
}

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  chapterNumber?: number;
  title?: string;
  description?: string;
  createdAt: Date;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  bookId,
  bookName,
  onUploadComplete,
  onUploadProgress
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const htmlFiles = acceptedFiles.filter(file =>
      file.type === 'text/html' || file.name.endsWith('.html')
    );

    if (htmlFiles.length !== acceptedFiles.length) {
      toast.warning('HTML 파일만 업로드 가능합니다.');
    }

    setUploadQueue(htmlFiles);
  }, []);

  const handleUpload = async () => {
    if (uploadQueue.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = uploadQueue.map(async (file, index) => {
        // 파일을 Supabase Storage에 업로드
        const fileId = crypto.randomUUID();
        const filePath = `bible-resources/${bookId}/${fileId}.html`;

        const { data, error } = await supabase.storage
          .from('biblefiles')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // HTML 파일 내용 파싱
        const htmlContent = await file.text();
        const parsedContent = parseHTMLContent(htmlContent);

        // 데이터베이스에 메타데이터 저장
        const { data: contentData, error: contentError } = await supabase
          .from('b_bible_contents')
          .insert({
            title: parsedContent.title || file.name.replace('.html', ''),
            subtitle: parsedContent.subtitle,
            bible_book_id: bookId,
            chapter_number: parsedContent.chapterNumber,
            verse_range: parsedContent.verseRange,
            html_content: htmlContent,
            word_count: htmlContent.length,
            estimated_reading_time: Math.ceil(htmlContent.length / 1000),
            status: 'draft'
          })
          .select()
          .single();

        if (contentError) throw contentError;

        // 진행률 업데이트
        const progress = ((index + 1) / uploadQueue.length) * 100;
        setUploadProgress(progress);
        onUploadProgress(progress);

        return {
          id: contentData.id,
          filename: data.path,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: data.path,
          chapterNumber: parsedContent.chapterNumber,
          title: contentData.title,
          description: parsedContent.subtitle,
          createdAt: new Date(contentData.created_at)
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      onUploadComplete(uploadedFiles);

      toast.success(`${uploadedFiles.length}개 파일이 성공적으로 업로드되었습니다!`);
      setUploadQueue([]);

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="file-upload-section" padding="lg">
      <div className="upload-header">
        <h3>📤 {bookName} 자료 업로드</h3>
        <p>HTML 파일을 드래그하거나 클릭하여 업로드하세요</p>
      </div>

      <Dropzone
        onDrop={handleDrop}
        accept={{ 'text/html': ['.html'] }}
        multiple={true}
        disabled={uploading}
        className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="dropzone-content">
          {uploadQueue.length === 0 ? (
            <>
              <div className="upload-icon">
                <Icon name="upload" size="xl" />
              </div>
              <h4>HTML 파일을 여기에 드래그하세요</h4>
              <p>또는 클릭하여 파일을 선택하세요</p>
              <div className="upload-note">
                <Icon name="info" size="sm" />
                <span>여러 파일 동시 업로드 가능</span>
              </div>
            </>
          ) : (
            <div className="upload-queue">
              <h4>업로드 대기 중인 파일 ({uploadQueue.length}개)</h4>
              <div className="file-list">
                {uploadQueue.map((file, index) => (
                  <div key={index} className="file-item">
                    <Icon name="fileText" size="sm" />
                    <span className="filename">{file.name}</span>
                    <span className="filesize">{formatFileSize(file.size)}</span>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadQueue(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Icon name="x" size="xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Dropzone>

      {uploadQueue.length > 0 && (
        <div className="upload-actions">
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="progress-text">{Math.round(uploadProgress)}% 완료</span>
            </div>
          )}

          <div className="action-buttons">
            <Button
              variant="ghost"
              onClick={() => setUploadQueue([])}
              disabled={uploading}
            >
              전체 취소
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={uploading}
              disabled={uploadQueue.length === 0}
            >
              <Icon name="upload" size="sm" />
              업로드 시작
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
```

### **2-2. 등록된 자료 목록 테이블**

```typescript
interface ResourceTableProps {
  bookId: string;
  resources: BibleResource[];
  onPreview: (resource: BibleResource) => void;
  onEdit: (resource: BibleResource) => void;
  onDelete: (resourceId: string) => void;
  onStatusChange: (resourceId: string, status: 'draft' | 'published' | 'archived') => void;
}

interface BibleResource {
  id: string;
  title: string;
  subtitle?: string;
  chapterNumber?: number;
  verseRange?: string;
  status: 'draft' | 'published' | 'archived';
  wordCount: number;
  estimatedReadingTime: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
}

const ResourceTable: React.FC<ResourceTableProps> = ({
  bookId,
  resources,
  onPreview,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [sortField, setSortField] = useState<keyof BibleResource>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = useMemo(() => {
    let filtered = resources;

    // 상태 필터
    if (filterStatus !== 'all') {
      filtered = filtered.filter(resource => resource.status === filterStatus);
    }

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [resources, filterStatus, searchQuery, sortField, sortDirection]);

  const handleSort = (field: keyof BibleResource) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-success';
      case 'draft': return 'text-warning';
      case 'archived': return 'text-muted';
      default: return 'text-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return '발행됨';
      case 'draft': return '초안';
      case 'archived': return '보관됨';
      default: return status;
    }
  };

  return (
    <Card className="resource-table-card" padding="lg">
      <div className="table-header">
        <div className="header-left">
          <h3>📋 등록된 자료 목록</h3>
          <span className="resource-count">
            총 {resources.length}개 ({filteredResources.length}개 표시)
          </span>
        </div>

        <div className="header-controls">
          {/* Search */}
          <Input
            placeholder="제목 또는 부제목 검색..."
            value={searchQuery}
            onChange={setSearchQuery}
            leftIcon={<Icon name="search" size="sm" />}
            className="search-input"
          />

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="status-filter"
          >
            <option value="all">전체 상태</option>
            <option value="draft">초안</option>
            <option value="published">발행됨</option>
            <option value="archived">보관됨</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="resource-table">
          <thead>
            <tr>
              <th
                className="sortable"
                onClick={() => handleSort('title')}
              >
                제목
                {sortField === 'title' && (
                  <Icon name={sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'} size="xs" />
                )}
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('chapterNumber')}
              >
                장
                {sortField === 'chapterNumber' && (
                  <Icon name={sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'} size="xs" />
                )}
              </th>
              <th>구절</th>
              <th
                className="sortable"
                onClick={() => handleSort('status')}
              >
                상태
                {sortField === 'status' && (
                  <Icon name={sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'} size="xs" />
                )}
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('viewCount')}
              >
                조회수
                {sortField === 'viewCount' && (
                  <Icon name={sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'} size="xs" />
                )}
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('updatedAt')}
              >
                수정일
                {sortField === 'updatedAt' && (
                  <Icon name={sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'} size="xs" />
                )}
              </th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map(resource => (
              <tr key={resource.id} className="resource-row">
                <td className="title-cell">
                  <div className="title-content">
                    <span className="title">{resource.title}</span>
                    {resource.subtitle && (
                      <span className="subtitle">{resource.subtitle}</span>
                    )}
                    <div className="meta-info">
                      {resource.wordCount}자 • 약 {resource.estimatedReadingTime}분 읽기
                    </div>
                  </div>
                </td>
                <td className="chapter-cell">
                  {resource.chapterNumber ? (
                    <span className="chapter-badge">{resource.chapterNumber}장</span>
                  ) : (
                    <span className="no-chapter">-</span>
                  )}
                </td>
                <td className="verse-cell">
                  {resource.verseRange || '-'}
                </td>
                <td className="status-cell">
                  <select
                    value={resource.status}
                    onChange={(e) => onStatusChange(resource.id, e.target.value as any)}
                    className={`status-select ${getStatusColor(resource.status)}`}
                  >
                    <option value="draft">초안</option>
                    <option value="published">발행됨</option>
                    <option value="archived">보관됨</option>
                  </select>
                </td>
                <td className="view-count-cell">
                  <div className="view-count">
                    <Icon name="eye" size="sm" />
                    <span>{resource.viewCount.toLocaleString()}</span>
                  </div>
                </td>
                <td className="date-cell">
                  {formatDistanceToNow(resource.updatedAt, { addSuffix: true })}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn preview"
                      onClick={() => onPreview(resource)}
                      title="미리보기"
                    >
                      <Icon name="eye" size="sm" />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => onEdit(resource)}
                      title="편집"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => onDelete(resource.id)}
                      title="삭제"
                    >
                      <Icon name="trash2" size="sm" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredResources.length === 0 && (
          <div className="empty-state">
            <Icon name="fileText" size="xl" />
            <h4>등록된 자료가 없습니다</h4>
            <p>
              {searchQuery || filterStatus !== 'all'
                ? '검색 조건에 맞는 자료가 없습니다'
                : 'HTML 파일을 업로드하여 자료를 등록하세요'
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
```

---

## ✏️ **3. HTML 편집기 시스템**

### **3-1. Monaco Editor 통합**

```typescript
import * as monaco from 'monaco-editor';
import { Editor } from '@monaco-editor/react';

interface HTMLEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const HTMLEditor: React.FC<HTMLEditorProps> = ({
  initialContent,
  onContentChange,
  onSave,
  isLoading = false,
  readOnly = false
}) => {
  const [content, setContent] = useState(initialContent);
  const [editorInstance, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 자동 저장 기능
  const debouncedSave = useMemo(
    () => debounce((newContent: string) => {
      onContentChange(newContent);
    }, 1000),
    [onContentChange]
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    setEditorInstance(editor);

    // 커스텀 키바인딩 설정
    editor.addAction({
      id: 'save-content',
      label: 'Save Content',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        onSave();
      }
    });

    // HTML 자동완성 및 검증 설정
    monaco.languages.html.htmlDefaults.setOptions({
      format: {
        tabSize: 2,
        insertSpaces: true,
        wrapLineLength: 120,
        unformatted: 'default": "a, abbr, acronym, b, bdo, big, br, button, cite, code, dfn, em, i, img, input, kbd, label, map, mark, math, meter, noscript, object, output, progress, q, ruby, s, samp, script, select, small, span, strong, sub, sup, textarea, time, tt, u, var, wbr"',
        contentUnformatted: 'pre,code,textarea',
        indentInnerHtml: false,
        preserveNewLines: true,
        maxPreserveNewLines: undefined,
        indentHandlebars: false,
        endWithNewline: false,
        extraLiners: 'head, body, /html',
        wrapAttributes: 'auto'
      }
    });
  };

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    debouncedSave(newContent);
  };

  const insertTemplate = (template: string) => {
    if (!editorInstance) return;

    const selection = editorInstance.getSelection();
    if (selection) {
      editorInstance.executeEdits('insert-template', [{
        range: selection,
        text: template
      }]);
    }
  };

  // HTML 템플릿들
  const templates = {
    article: `<article class="bible-study">
  <header>
    <h1>제목을 입력하세요</h1>
    <p class="subtitle">부제목을 입력하세요</p>
  </header>

  <section class="content">
    <p>내용을 입력하세요...</p>
  </section>
</article>`,

    verse: `<div class="verse-highlight">
  <blockquote class="bible-verse">
    <p>"성경 구절을 입력하세요"</p>
    <cite>성경 책 장:절</cite>
  </blockquote>
</div>`,

    meditation: `<div class="meditation-box">
  <h3>묵상</h3>
  <div class="meditation-content">
    <p>묵상 내용을 입력하세요...</p>
  </div>
</div>`,

    application: `<div class="application-section">
  <h3>적용</h3>
  <ol>
    <li>첫 번째 적용점</li>
    <li>두 번째 적용점</li>
    <li>세 번째 적용점</li>
  </ol>
</div>`
  };

  return (
    <div className={`html-editor ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Editor Header */}
      <div className="editor-header">
        <div className="header-left">
          <h4>📝 HTML 편집기</h4>
          {isLoading && (
            <div className="loading-indicator">
              <Icon name="loader" size="sm" className="animate-spin" />
              <span>로딩 중...</span>
            </div>
          )}
        </div>

        <div className="header-controls">
          {/* Template Dropdown */}
          <div className="template-selector">
            <select onChange={(e) => {
              if (e.target.value) {
                insertTemplate(templates[e.target.value as keyof typeof templates]);
                e.target.value = '';
              }
            }}>
              <option value="">템플릿 삽입</option>
              <option value="article">기사 템플릿</option>
              <option value="verse">성경 구절</option>
              <option value="meditation">묵상 박스</option>
              <option value="application">적용 섹션</option>
            </select>
          </div>

          {/* Action Buttons */}
          <button
            className="header-btn"
            onClick={() => {
              if (editorInstance) {
                const action = editorInstance.getAction('editor.action.formatDocument');
                action?.run();
              }
            }}
            title="코드 정리 (Ctrl+Shift+F)"
          >
            <Icon name="code" size="sm" />
          </button>

          <button
            className="header-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "전체화면 해제" : "전체화면"}
          >
            <Icon name={isFullscreen ? "minimize" : "maximize"} size="sm" />
          </button>

          <button
            className="header-btn save"
            onClick={onSave}
            title="저장 (Ctrl+S)"
          >
            <Icon name="save" size="sm" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="editor-container">
        <Editor
          height="100%"
          defaultLanguage="html"
          value={content}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            readOnly,
            theme: 'vs-dark',
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            accessibilitySupport: 'auto'
          }}
          loading={
            <div className="editor-loading">
              <Icon name="loader" size="lg" className="animate-spin" />
              <p>편집기를 불러오는 중...</p>
            </div>
          }
        />
      </div>

      {/* Editor Footer */}
      <div className="editor-footer">
        <div className="editor-stats">
          <span>글자 수: {content.length.toLocaleString()}</span>
          <span>줄 수: {content.split('\n').length}</span>
          <span>예상 읽기 시간: {Math.ceil(content.length / 1000)}분</span>
        </div>

        <div className="editor-actions">
          <button
            className="action-btn"
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success('클립보드에 복사되었습니다');
            }}
          >
            <Icon name="copy" size="sm" />
            복사
          </button>

          <button
            className="action-btn"
            onClick={onSave}
          >
            <Icon name="save" size="sm" />
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
```

### **3-2. 실시간 미리보기**

```typescript
interface HTMLPreviewProps {
  content: string;
  isLoading?: boolean;
  onContentClick?: (element: HTMLElement) => void;
}

const HTMLPreview: React.FC<HTMLPreviewProps> = ({
  content,
  isLoading = false,
  onContentClick
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // HTML 콘텐츠 처리 및 보안 검증
  useEffect(() => {
    const processHTML = async () => {
      if (!content.trim()) {
        setProcessedContent('<div class="empty-preview">내용을 입력하면 여기에 미리보기가 표시됩니다</div>');
        return;
      }

      try {
        // DOMPurify로 XSS 방지
        const cleanHTML = DOMPurify.sanitize(content, {
          ALLOWED_TAGS: [
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'strong', 'em', 'u', 'strike', 'blockquote', 'cite',
            'ul', 'ol', 'li', 'br', 'hr', 'img', 'a',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'article', 'section', 'header', 'footer', 'aside'
          ],
          ALLOWED_ATTR: [
            'class', 'id', 'href', 'src', 'alt', 'title',
            'target', 'rel', 'data-*'
          ],
          ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        });

        // 기본 스타일 래퍼 추가
        const wrappedHTML = `
          <div class="bible-content-preview">
            ${cleanHTML}
          </div>
        `;

        setProcessedContent(wrappedHTML);
      } catch (error) {
        console.error('HTML processing error:', error);
        setProcessedContent('<div class="error-preview">미리보기 처리 중 오류가 발생했습니다</div>');
      }
    };

    processHTML();
  }, [content]);

  // 미리보기 영역 클릭 이벤트 처리
  const handlePreviewClick = useCallback((event: React.MouseEvent) => {
    if (onContentClick && event.target instanceof HTMLElement) {
      event.preventDefault();
      onContentClick(event.target);
    }
  }, [onContentClick]);

  // 미리보기 스크롤 동기화
  const handleScroll = useCallback((event: React.UIEvent) => {
    const scrollElement = event.currentTarget;
    const scrollPercentage = scrollElement.scrollTop /
      (scrollElement.scrollHeight - scrollElement.clientHeight);

    // 편집기와 스크롤 동기화 이벤트 발생
    window.dispatchEvent(new CustomEvent('preview-scroll', {
      detail: { scrollPercentage }
    }));
  }, []);

  return (
    <div className={`html-preview ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Preview Header */}
      <div className="preview-header">
        <div className="header-left">
          <h4>🖥️ 미리보기</h4>
          {isLoading && (
            <div className="loading-indicator">
              <Icon name="loader" size="sm" className="animate-spin" />
              <span>렌더링 중...</span>
            </div>
          )}
        </div>

        <div className="header-controls">
          <button
            className="header-btn"
            onClick={() => {
              if (previewRef.current) {
                previewRef.current.scrollTop = 0;
              }
            }}
            title="맨 위로"
          >
            <Icon name="chevronUp" size="sm" />
          </button>

          <button
            className="header-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "전체화면 해제" : "전체화면"}
          >
            <Icon name={isFullscreen ? "minimize" : "maximize"} size="sm" />
          </button>

          <button
            className="header-btn"
            onClick={() => {
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>성경 자료 미리보기</title>
                      <style>
                        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; }
                        .bible-content-preview { max-width: 800px; margin: 0 auto; padding: 20px; }
                      </style>
                    </head>
                    <body>${processedContent}</body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.print();
              }
            }}
            title="인쇄"
          >
            <Icon name="printer" size="sm" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        ref={previewRef}
        className="preview-container"
        onClick={handlePreviewClick}
        onScroll={handleScroll}
      >
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>

      {/* Preview Footer */}
      <div className="preview-footer">
        <div className="preview-info">
          <span>렌더링 완료</span>
          <span>•</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>

        <div className="zoom-controls">
          <button
            className="zoom-btn"
            onClick={() => {
              if (previewRef.current) {
                const currentZoom = parseFloat(previewRef.current.style.zoom || '1');
                previewRef.current.style.zoom = Math.max(0.5, currentZoom - 0.1).toString();
              }
            }}
          >
            <Icon name="zoomOut" size="sm" />
          </button>

          <span className="zoom-level">100%</span>

          <button
            className="zoom-btn"
            onClick={() => {
              if (previewRef.current) {
                const currentZoom = parseFloat(previewRef.current.style.zoom || '1');
                previewRef.current.style.zoom = Math.min(2, currentZoom + 0.1).toString();
              }
            }}
          >
            <Icon name="zoomIn" size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
};
```

### **3-3. 편집기 레이아웃 및 분할**

```typescript
interface EditorLayoutProps {
  resource: BibleResource;
  onSave: (content: string) => void;
  onClose: () => void;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({
  resource,
  onSave,
  onClose
}) => {
  const [content, setContent] = useState(resource.htmlContent || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  // 자동 저장 기능
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      setIsDirty(false);
      toast.success('저장되었습니다');
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave]);

  // 페이지 떠나기 전 확인
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <div className="editor-layout">
      {/* Top Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button
            className="back-btn"
            onClick={onClose}
          >
            <Icon name="chevronLeft" size="sm" />
            돌아가기
          </button>

          <div className="resource-info">
            <h2>{resource.title}</h2>
            {resource.subtitle && <p>{resource.subtitle}</p>}
            {isDirty && <span className="dirty-indicator">• 저장되지 않음</span>}
          </div>
        </div>

        <div className="toolbar-center">
          <div className="view-mode-selector">
            <button
              className={`mode-btn ${viewMode === 'editor' ? 'active' : ''}`}
              onClick={() => setViewMode('editor')}
            >
              <Icon name="code" size="sm" />
              편집기
            </button>
            <button
              className={`mode-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
            >
              <Icon name="layout" size="sm" />
              분할
            </button>
            <button
              className={`mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              <Icon name="eye" size="sm" />
              미리보기
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button className="toolbar-btn">
            <Icon name="download" size="sm" />
            다운로드
          </button>

          <button className="toolbar-btn">
            <Icon name="share" size="sm" />
            공유
          </button>

          <button
            className="toolbar-btn primary"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? (
              <Icon name="loader" size="sm" className="animate-spin" />
            ) : (
              <Icon name="save" size="sm" />
            )}
            저장
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`editor-content ${viewMode}`}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="editor-panel">
            <HTMLEditor
              initialContent={content}
              onContentChange={handleContentChange}
              onSave={handleSave}
              isLoading={isSaving}
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-panel">
            <HTMLPreview
              content={content}
              isLoading={isSaving}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 💬 **4. 댓글 시스템**

### **4-1. 댓글 작성 및 표시**

```typescript
interface Comment {
  id: string;
  contentId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  isHighlighted: boolean;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  replies: Comment[];
}

interface CommentSectionProps {
  contentId: string;
  comments: Comment[];
  onCommentAdd: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => void;
  onCommentLike: (commentId: string) => void;
  onCommentReply: (parentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  contentId,
  comments,
  onCommentAdd,
  onCommentLike,
  onCommentReply
}) => {
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !authorName.trim()) {
      toast.error('이름과 댓글 내용을 모두 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      await onCommentAdd({
        contentId,
        authorName: authorName.trim(),
        content: newComment.trim(),
        isHighlighted: false,
        likeCount: 0
      });

      setNewComment('');
      toast.success('댓글이 등록되었습니다');
    } catch (error) {
      toast.error('댓글 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCommentDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString();
  };

  return (
    <div className="comment-section">
      <div className="comment-header">
        <h3>💬 묵상 나눔</h3>
        <span className="comment-count">{comments.length}개의 댓글</span>
      </div>

      {/* Comment Form */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <Input
            placeholder="이름"
            value={authorName}
            onChange={setAuthorName}
            className="author-input"
            maxLength={20}
            required
          />
        </div>

        <div className="form-content">
          <textarea
            className="comment-textarea"
            placeholder="오늘 묵상한 말씀을 통해 얻은 은혜를 함께 나눕니다..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            maxLength={500}
            required
          />
          <div className="textarea-footer">
            <span className="char-count">{newComment.length}/500</span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              disabled={!newComment.trim() || !authorName.trim()}
            >
              댓글 작성
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onLike={() => onCommentLike(comment.id)}
            onReply={(reply) => onCommentReply(comment.id, reply)}
            formatDate={formatCommentDate}
          />
        ))}

        {comments.length === 0 && (
          <div className="empty-comments">
            <Icon name="messageCircle" size="xl" />
            <h4>아직 댓글이 없습니다</h4>
            <p>첫 번째로 은혜를 나누어보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 개별 댓글 컴포넌트
const CommentItem: React.FC<{
  comment: Comment;
  onLike: () => void;
  onReply: (reply: any) => void;
  formatDate: (date: Date) => string;
  isReply?: boolean;
}> = ({ comment, onLike, onReply, formatDate, isReply = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim() || !replyAuthor.trim()) return;

    onReply({
      contentId: comment.contentId,
      authorName: replyAuthor.trim(),
      content: replyContent.trim(),
      isHighlighted: false,
      likeCount: 0
    });

    setReplyContent('');
    setReplyAuthor('');
    setShowReplyForm(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  return (
    <div className={`comment-item ${isReply ? 'reply' : ''} ${comment.isHighlighted ? 'highlighted' : ''}`}>
      <div className="comment-content">
        <div className="comment-header">
          <div className="author-info">
            <div className="author-avatar">
              {comment.authorName.charAt(0).toUpperCase()}
            </div>
            <div className="author-details">
              <span className="author-name">{comment.authorName}</span>
              <span className="comment-date">{formatDate(comment.createdAt)}</span>
            </div>
          </div>

          {comment.isHighlighted && (
            <div className="highlight-badge">
              <Icon name="star" size="sm" />
              추천 댓글
            </div>
          )}
        </div>

        <div className="comment-text">
          {comment.content}
        </div>

        <div className="comment-actions">
          <button
            className={`action-btn like ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Icon name="heart" size="sm" />
            <span>{comment.likeCount + (isLiked ? 1 : 0)}</span>
          </button>

          {!isReply && (
            <button
              className="action-btn reply"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Icon name="messageCircle" size="sm" />
              답글
            </button>
          )}

          <button className="action-btn report">
            <Icon name="flag" size="sm" />
            신고
          </button>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <form className="reply-form" onSubmit={handleReplySubmit}>
          <Input
            placeholder="이름"
            value={replyAuthor}
            onChange={setReplyAuthor}
            size="sm"
            maxLength={20}
          />
          <div className="reply-input-group">
            <textarea
              placeholder={`${comment.authorName}님에게 답글...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              maxLength={300}
            />
            <div className="reply-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(false)}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={!replyContent.trim() || !replyAuthor.trim()}
              >
                답글 작성
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-container">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={() => onLike()}
              onReply={() => {}}
              formatDate={formatDate}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 📱 **5. 반응형 및 모바일 최적화**

### **5-1. 모바일 네비게이션**

```typescript
const MobileBibleResource: React.FC = () => {
  const [activeView, setActiveView] = useState<'books' | 'resources' | 'editor'>('books');
  const [selectedBook, setSelectedBook] = useState<BibleBookCard | null>(null);
  const [selectedResource, setSelectedResource] = useState<BibleResource | null>(null);

  const handleBookSelect = (book: BibleBookCard) => {
    setSelectedBook(book);
    setActiveView('resources');
  };

  const handleResourceEdit = (resource: BibleResource) => {
    setSelectedResource(resource);
    setActiveView('editor');
  };

  const handleBack = () => {
    if (activeView === 'editor') {
      setActiveView('resources');
      setSelectedResource(null);
    } else if (activeView === 'resources') {
      setActiveView('books');
      setSelectedBook(null);
    }
  };

  return (
    <div className="mobile-bible-resource">
      {/* Mobile Header */}
      <div className="mobile-header">
        {activeView !== 'books' && (
          <button className="back-btn" onClick={handleBack}>
            <Icon name="chevronLeft" size="sm" />
          </button>
        )}

        <h1 className="header-title">
          {activeView === 'books' && '성경자료실'}
          {activeView === 'resources' && selectedBook?.name}
          {activeView === 'editor' && '편집기'}
        </h1>

        {activeView === 'books' && (
          <button className="search-btn">
            <Icon name="search" size="sm" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mobile-content">
        {activeView === 'books' && (
          <MobileBookGrid onBookSelect={handleBookSelect} />
        )}

        {activeView === 'resources' && selectedBook && (
          <MobileResourceList
            book={selectedBook}
            onResourceEdit={handleResourceEdit}
          />
        )}

        {activeView === 'editor' && selectedResource && (
          <MobileEditor
            resource={selectedResource}
            onClose={handleBack}
          />
        )}
      </div>
    </div>
  );
};
```

### **5-2. 모바일 편집기**

```typescript
const MobileEditor: React.FC<{
  resource: BibleResource;
  onClose: () => void;
}> = ({ resource, onClose }) => {
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [content, setContent] = useState(resource.htmlContent || '');

  return (
    <div className="mobile-editor">
      {/* Mobile Editor Header */}
      <div className="mobile-editor-header">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${editorMode === 'edit' ? 'active' : ''}`}
            onClick={() => setEditorMode('edit')}
          >
            편집
          </button>
          <button
            className={`mode-btn ${editorMode === 'preview' ? 'active' : ''}`}
            onClick={() => setEditorMode('preview')}
          >
            미리보기
          </button>
        </div>

        <div className="editor-actions">
          <button className="action-btn">
            <Icon name="save" size="sm" />
          </button>
          <button className="action-btn">
            <Icon name="more" size="sm" />
          </button>
        </div>
      </div>

      {/* Mobile Editor Content */}
      <div className="mobile-editor-content">
        {editorMode === 'edit' ? (
          <div className="mobile-code-editor">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mobile-textarea"
              placeholder="HTML 내용을 입력하세요..."
            />

            {/* Mobile Toolbar */}
            <div className="mobile-toolbar">
              <button className="toolbar-btn">
                <Icon name="bold" size="sm" />
              </button>
              <button className="toolbar-btn">
                <Icon name="italic" size="sm" />
              </button>
              <button className="toolbar-btn">
                <Icon name="link" size="sm" />
              </button>
              <button className="toolbar-btn">
                <Icon name="image" size="sm" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mobile-preview">
            <HTMLPreview content={content} />
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## ✅ **구현 체크리스트**

### **메인 네비게이션**

- [ ] 신/구약 탭 전환 애니메이션
- [ ] 책별 카드 그리드 레이아웃
- [ ] 카드 호버 효과 및 3D 애니메이션
- [ ] 진행률 표시 및 통계
- [ ] 반응형 카드 그리드

### **자료 관리 시스템**

- [ ] 드래그&드롭 파일 업로드
- [ ] HTML 파일 파싱 및 메타데이터 추출
- [ ] 자료 목록 테이블 (정렬/필터/검색)
- [ ] 상태 관리 (초안/발행/보관)
- [ ] 파일 업로드 진행률 표시

### **HTML 편집기**

- [ ] Monaco Editor 통합
- [ ] 실시간 미리보기
- [ ] HTML 템플릿 시스템
- [ ] 자동 저장 기능
- [ ] 전체화면 모드

### **댓글 시스템**

- [ ] 댓글 작성 폼
- [ ] 댓글 목록 및 답글
- [ ] 좋아요 기능
- [ ] 추천 댓글 표시
- [ ] 신고 기능

### **고급 기능**

- [ ] 분할 화면 편집기
- [ ] HTML 보안 검증 (DOMPurify)
- [ ] 파일 다운로드
- [ ] 인쇄 기능
- [ ] 공유 기능

### **반응형 최적화**

- [ ] 모바일 탭 네비게이션
- [ ] 터치 친화적 편집기
- [ ] 작은 화면 최적화
- [ ] 스와이프 제스처

---
