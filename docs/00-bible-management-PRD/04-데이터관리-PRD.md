# 📋 04-데이터관리-PRD.md

## 🎯 **문서 개요**

### **문서명**: 데이터관리 페이지 상세 설계서

### **버전**: v1.0.0

### **작성일**: 2025.07.08

### **최종 수정일**: 2025.07.08

### **의존성**: 00-전체아키텍처-PRD.md, 00-공통시스템-PRD.md

---

## 🔧 **기능 개요**

> **"성경자료실 운영을 위한 통합 관리자 도구 - 콘텐츠 생성부터 백업까지"**

### **핵심 가치 제안**

- **Centralized Management**: 모든 콘텐츠와 카테고리를 한 곳에서 통합 관리
- **Efficient CRUD**: 직관적인 어코디언 인터페이스로 빠른 데이터 조작
- **Robust Backup**: 메타데이터와 실제 파일을 포함한 완전한 백업 시스템
- **Seamless Migration**: 개발/스테이징/운영 환경 간 데이터 이동 지원
- **Safe Operations**: 실수 방지를 위한 확인 절차와 복구 옵션

---

## 🏗️ **페이지 아키텍처**

### **전체 레이아웃 구조 (5:5 분할)**

```
┌─────────────────────────────────────────────────────────────┐
│  🔐 Admin Header (권한 확인 + 환경 표시)                     │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│  📁 카테고리 관리     │  💾 데이터 관리                      │
│  (50% 좌측)          │  (50% 우측)                         │
│                      │                                      │
│  📖 구약 성경 ▼      │  📤 내보내기     📥 가져오기        │
│  ├── 창세기          │  ┌──────────┐   ┌──────────┐        │
│  ├── 출애굽기        │  │ 데이터   │   │ 데이터   │        │
│  └── ...             │  │ 내보내기 │   │ 가져오기 │        │
│                      │  └──────────┘   └──────────┘        │
│  📖 신약 성경 ▼      │                                      │
│  ├── 마태복음        │  ┌──────────┐   ┌──────────┐        │
│  ├── 마가복음        │  │카테고리  │   │카테고리  │        │
│  └── ...             │  │내보내기  │   │가져오기  │        │
│                      │  └──────────┘   └──────────┘        │
│  ⚙️ 카테고리 액션     │                                      │
│  [추가] [편집] [삭제] │  🗑️ 초기화                         │
│                      │  ┌──────────┐   ┌──────────┐        │
│                      │  │ 데이터   │   │카테고리  │        │
│                      │  │ 초기화   │   │ 초기화   │        │
│                      │  └──────────┘   └──────────┘        │
└──────────────────────┴──────────────────────────────────────┘
```

### **반응형 레이아웃 전략**

```css
/* Desktop (1024px+) */
.data-management-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Tablet (768px - 1023px) */
@media (max-width: 1023px) {
  .data-management-layout {
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .data-management-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .category-section {
    order: 2; /* 모바일에서는 데이터 관리를 우선 표시 */
  }

  .data-section {
    order: 1;
  }
}
```

---

## 📁 **1. 카테고리 관리 시스템**

### **1-1. 어코디언 기반 카테고리 CRUD**

```typescript
interface BibleCategory {
  id: string;
  name: string; // 'old-testament', 'new-testament'
  displayName: string; // '구약 성경', '신약 성경'
  colorTheme: string;
  sortOrder: number;
  books: BibleBook[];
  createdAt: Date;
  updatedAt: Date;
}

interface BibleBook {
  id: string;
  categoryId: string;
  name: string;
  nameEnglish: string;
  abbreviation: string;
  sortOrder: number;
  totalChapters: number;
  contentsCount: number; // 등록된 자료 수
}

interface CategoryManagerProps {
  categories: BibleCategory[];
  onCategoryCreate: (category: Omit<BibleCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCategoryUpdate: (id: string, updates: Partial<BibleCategory>) => void;
  onCategoryDelete: (id: string) => void;
  onBookCreate: (categoryId: string, book: Omit<BibleBook, 'id' | 'categoryId'>) => void;
  onBookUpdate: (id: string, updates: Partial<BibleBook>) => void;
  onBookDelete: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
  onBookCreate,
  onBookUpdate,
  onBookDelete
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{type: 'category' | 'book', id: string} | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState<{type: 'category' | 'book', categoryId?: string} | null>(null);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="category-manager">
      <div className="section-header">
        <h2 className="section-title">📁 카테고리 관리</h2>
        <button
          className="create-btn primary"
          onClick={() => setShowCreateDialog({type: 'category'})}
        >
          <Icon name="plus" size="sm" />
          카테고리 추가
        </button>
      </div>

      {/* Categories Accordion */}
      <div className="categories-accordion">
        {categories
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(category => (
            <div key={category.id} className="accordion-item">
              {/* Category Header */}
              <div className="accordion-header">
                <button
                  className="accordion-trigger"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={expandedCategories.has(category.id)}
                >
                  <Icon
                    name={expandedCategories.has(category.id) ? "chevronDown" : "chevronRight"}
                    size="sm"
                  />
                  <div className="category-info">
                    <span className="category-name">{category.displayName}</span>
                    <span className="category-meta">
                      {category.books.length}권 •
                      {category.books.reduce((sum, book) => sum + book.contentsCount, 0)}개 자료
                    </span>
                  </div>
                </button>

                <div className="category-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => setEditingItem({type: 'category', id: category.id})}
                    title="카테고리 편집"
                  >
                    <Icon name="edit" size="xs" />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleCategoryDelete(category.id)}
                    title="카테고리 삭제"
                    disabled={category.books.length > 0}
                  >
                    <Icon name="trash2" size="xs" />
                  </button>
                </div>
              </div>

              {/* Category Content */}
              {expandedCategories.has(category.id) && (
                <div className="accordion-content">
                  {/* Books List */}
                  <div className="books-list">
                    {category.books
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map(book => (
                        <div key={book.id} className="book-item">
                          <div className="book-info">
                            <span className="book-name">{book.name}</span>
                            <span className="book-details">
                              {book.nameEnglish} • {book.totalChapters}장 • {book.contentsCount}개 자료
                            </span>
                          </div>

                          <div className="book-actions">
                            <button
                              className="action-btn edit"
                              onClick={() => setEditingItem({type: 'book', id: book.id})}
                              title="책 정보 편집"
                            >
                              <Icon name="edit" size="xs" />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleBookDelete(book.id)}
                              title="책 삭제"
                              disabled={book.contentsCount > 0}
                            >
                              <Icon name="trash2" size="xs" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* Add Book Button */}
                    <button
                      className="add-book-btn"
                      onClick={() => setShowCreateDialog({type: 'book', categoryId: category.id})}
                    >
                      <Icon name="plus" size="sm" />
                      새 책 추가
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Create/Edit Dialogs */}
      {showCreateDialog && (
        <CategoryCreateDialog
          type={showCreateDialog.type}
          categoryId={showCreateDialog.categoryId}
          onSave={(data) => {
            if (showCreateDialog.type === 'category') {
              onCategoryCreate(data as any);
            } else {
              onBookCreate(showCreateDialog.categoryId!, data as any);
            }
            setShowCreateDialog(null);
          }}
          onCancel={() => setShowCreateDialog(null)}
        />
      )}

      {editingItem && (
        <CategoryEditDialog
          type={editingItem.type}
          itemId={editingItem.id}
          categories={categories}
          onSave={(id, updates) => {
            if (editingItem.type === 'category') {
              onCategoryUpdate(id, updates);
            } else {
              onBookUpdate(id, updates);
            }
            setEditingItem(null);
          }}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};
```

### **1-2. 카테고리 생성/편집 다이얼로그**

```typescript
interface CategoryCreateDialogProps {
  type: 'category' | 'book';
  categoryId?: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CategoryCreateDialog: React.FC<CategoryCreateDialogProps> = ({
  type,
  categoryId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState(
    type === 'category'
      ? {
          name: '',
          displayName: '',
          colorTheme: 'default',
          sortOrder: 0
        }
      : {
          name: '',
          nameEnglish: '',
          abbreviation: '',
          totalChapters: 1,
          sortOrder: 0
        }
  );

  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (type === 'category') {
      if (!formData.name?.trim()) newErrors.name = '카테고리 식별자는 필수입니다';
      if (!formData.displayName?.trim()) newErrors.displayName = '표시 이름은 필수입니다';
      if (!/^[a-z-]+$/.test(formData.name)) {
        newErrors.name = '영문 소문자와 하이픈만 사용 가능합니다';
      }
    } else {
      if (!formData.name?.trim()) newErrors.name = '책 이름은 필수입니다';
      if (!formData.nameEnglish?.trim()) newErrors.nameEnglish = '영문 이름은 필수입니다';
      if (!formData.abbreviation?.trim()) newErrors.abbreviation = '약어는 필수입니다';
      if (formData.totalChapters < 1) newErrors.totalChapters = '장 수는 1 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setIsValidating(true);
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={type === 'category' ? '새 카테고리 추가' : '새 책 추가'}
      size="md"
    >
      <div className="create-dialog">
        {type === 'category' ? (
          <>
            <Input
              label="카테고리 식별자"
              placeholder="old-testament, new-testament"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({...prev, name: value}))}
              error={isValidating ? errors.name : undefined}
              helpText="영문 소문자와 하이픈만 사용 (예: old-testament)"
              required
            />

            <Input
              label="표시 이름"
              placeholder="구약 성경, 신약 성경"
              value={formData.displayName}
              onChange={(value) => setFormData(prev => ({...prev, displayName: value}))}
              error={isValidating ? errors.displayName : undefined}
              required
            />

            <div className="form-group">
              <label htmlFor="color-theme">테마 색상</label>
              <select
                id="color-theme"
                value={formData.colorTheme}
                onChange={(e) => setFormData(prev => ({...prev, colorTheme: e.target.value}))}
              >
                <option value="default">기본</option>
                <option value="old-testament">구약 테마 (보라)</option>
                <option value="new-testament">신약 테마 (초록)</option>
                <option value="meditation">묵상 테마 (빨강)</option>
              </select>
            </div>

            <Input
              label="정렬 순서"
              type="number"
              value={formData.sortOrder.toString()}
              onChange={(value) => setFormData(prev => ({...prev, sortOrder: parseInt(value) || 0}))}
              helpText="작은 숫자일수록 앞에 표시됩니다"
            />
          </>
        ) : (
          <>
            <Input
              label="책 이름"
              placeholder="창세기, 마태복음"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({...prev, name: value}))}
              error={isValidating ? errors.name : undefined}
              required
            />

            <Input
              label="영문 이름"
              placeholder="Genesis, Matthew"
              value={formData.nameEnglish}
              onChange={(value) => setFormData(prev => ({...prev, nameEnglish: value}))}
              error={isValidating ? errors.nameEnglish : undefined}
              required
            />

            <Input
              label="약어"
              placeholder="창, 마"
              value={formData.abbreviation}
              onChange={(value) => setFormData(prev => ({...prev, abbreviation: value}))}
              error={isValidating ? errors.abbreviation : undefined}
              helpText="1-3글자로 입력해주세요"
              required
            />

            <Input
              label="총 장 수"
              type="number"
              min="1"
              max="150"
              value={formData.totalChapters.toString()}
              onChange={(value) => setFormData(prev => ({...prev, totalChapters: parseInt(value) || 1}))}
              error={isValidating ? errors.totalChapters : undefined}
              required
            />

            <Input
              label="정렬 순서"
              type="number"
              value={formData.sortOrder.toString()}
              onChange={(value) => setFormData(prev => ({...prev, sortOrder: parseInt(value) || 0}))}
              helpText="같은 카테고리 내에서의 정렬 순서"
            />
          </>
        )}

        <div className="dialog-actions">
          <Button variant="ghost" onClick={onCancel}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            추가
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

### **1-3. 카테고리 삭제 확인 시스템**

```typescript
interface DeleteConfirmationProps {
  type: 'category' | 'book';
  itemName: string;
  dependentCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  type,
  itemName,
  dependentCount,
  onConfirm,
  onCancel
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const expectedConfirmText = `삭제 ${itemName}`;
  const canDelete = confirmText === expectedConfirmText && dependentCount === 0;

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={`${type === 'category' ? '카테고리' : '책'} 삭제 확인`}
      size="md"
    >
      <div className="delete-confirmation">
        <div className="warning-section">
          <div className="warning-icon">
            <Icon name="alertTriangle" size="lg" />
          </div>
          <div className="warning-content">
            <h3>정말로 삭제하시겠습니까?</h3>
            <p>
              <strong>{itemName}</strong>을(를) 삭제하려고 합니다.
            </p>

            {dependentCount > 0 && (
              <div className="dependency-warning">
                <Icon name="xCircle" size="sm" />
                <span>
                  이 {type === 'category' ? '카테고리에는 ' + dependentCount + '개의 책이' : '책에는 ' + dependentCount + '개의 자료가'}
                  있어 삭제할 수 없습니다.
                </span>
              </div>
            )}
          </div>
        </div>

        {dependentCount === 0 && (
          <>
            <div className="confirmation-input">
              <label htmlFor="confirm-input">
                삭제를 확인하려면 <code>{expectedConfirmText}</code>를 입력하세요:
              </label>
              <Input
                id="confirm-input"
                value={confirmText}
                onChange={setConfirmText}
                placeholder={expectedConfirmText}
                autoFocus
              />
            </div>

            <div className="consequences-warning">
              <h4>⚠️ 삭제 후 발생하는 일:</h4>
              <ul>
                <li>모든 관련 데이터가 영구적으로 삭제됩니다</li>
                <li>사용자 진도 기록이 초기화될 수 있습니다</li>
                <li>이 작업은 되돌릴 수 없습니다</li>
              </ul>
            </div>
          </>
        )}

        <div className="dialog-actions">
          <Button variant="ghost" onClick={onCancel}>
            취소
          </Button>
          {dependentCount === 0 && (
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={!canDelete}
              loading={isDeleting}
            >
              영구 삭제
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
```

---

## 💾 **2. 데이터 관리 시스템**

### **2-1. 데이터 내보내기 (ZIP 형태)**

```typescript
interface DataExportManager {
  exportData: () => Promise<void>;
  exportCategories: () => Promise<void>;
  getExportPreview: () => Promise<ExportPreview>;
}

interface ExportPreview {
  totalContent: number;
  totalCategories: number;
  totalSize: string;
  lastUpdate: Date;
  includedItems: {
    categories: string[];
    books: string[];
    contentTypes: string[];
  };
}

const DataExportCard: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportPreview, setExportPreview] = useState<ExportPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleDataExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // 1. 데이터베이스에서 모든 콘텐츠 가져오기
      setExportProgress(20);
      const contents = await fetchAllContents();

      // 2. 메타데이터 생성
      setExportProgress(40);
      const metadata = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalItems: contents.length,
        categories: await fetchCategories(),
        books: await fetchBooks(),
        contentSummary: generateContentSummary(contents)
      };

      // 3. ZIP 파일 생성
      setExportProgress(60);
      const zip = new JSZip();

      // 메타데이터 추가
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));

      // 콘텐츠 파일들 추가
      setExportProgress(80);
      for (const content of contents) {
        const fileName = `${content.book_name}/${content.chapter_number}장_${content.title}.html`;
        zip.file(fileName, content.html_content);

        // 이미지나 첨부파일이 있다면 별도 폴더에 추가
        if (content.attachments) {
          for (const attachment of content.attachments) {
            const attachmentData = await fetchAttachment(attachment.file_path);
            zip.file(`attachments/${attachment.filename}`, attachmentData);
          }
        }
      }

      // 4. 다운로드
      setExportProgress(100);
      const blob = await zip.generateAsync({type: 'blob'});
      const fileName = `bible-data-export-${new Date().toISOString().split('T')[0]}.zip`;
      saveAs(blob, fileName);

      toast.success('데이터 내보내기가 완료되었습니다!');

    } catch (error) {
      console.error('Export failed:', error);
      toast.error('내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const loadExportPreview = async () => {
    const preview = await generateExportPreview();
    setExportPreview(preview);
    setShowPreview(true);
  };

  return (
    <Card className="data-export-card" padding="lg">
      <div className="card-header">
        <div className="header-content">
          <Icon name="download" size="lg" />
          <div>
            <h3>📤 데이터 내보내기</h3>
            <p>모든 성경 자료와 메타데이터를 ZIP 파일로 내보냅니다</p>
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="export-info">
          <div className="info-item">
            <span className="label">내보낼 데이터:</span>
            <span className="value">성경 자료, 카테고리, 진도 기록</span>
          </div>
          <div className="info-item">
            <span className="label">파일 형식:</span>
            <span className="value">ZIP (메타데이터 JSON + HTML 파일)</span>
          </div>
          <div className="info-item">
            <span className="label">예상 크기:</span>
            <span className="value">~50MB (콘텐츠 양에 따라 변동)</span>
          </div>
        </div>

        {isExporting && (
          <div className="export-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <span className="progress-text">{exportProgress}% 완료</span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <Button
          variant="outline"
          onClick={loadExportPreview}
          disabled={isExporting}
        >
          <Icon name="eye" size="sm" />
          미리보기
        </Button>
        <Button
          variant="primary"
          onClick={handleDataExport}
          loading={isExporting}
          disabled={isExporting}
        >
          <Icon name="download" size="sm" />
          내보내기 시작
        </Button>
      </div>

      {/* Export Preview Modal */}
      {showPreview && exportPreview && (
        <Modal
          isOpen={true}
          onClose={() => setShowPreview(false)}
          title="내보내기 미리보기"
          size="lg"
        >
          <ExportPreviewContent
            preview={exportPreview}
            onConfirm={() => {
              setShowPreview(false);
              handleDataExport();
            }}
            onCancel={() => setShowPreview(false)}
          />
        </Modal>
      )}
    </Card>
  );
};
```

### **2-2. 데이터 가져오기 (ZIP 업로드)**

```typescript
const DataImportCard: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importOptions, setImportOptions] = useState({
    overwriteExisting: false,
    mergeCategories: true,
    importProgress: false,
    createBackup: true
  });

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file || !file.name.endsWith('.zip')) {
      toast.error('ZIP 파일만 업로드 가능합니다.');
      return;
    }

    setUploadedFile(file);

    try {
      // ZIP 파일 미리보기 생성
      const preview = await analyzeImportFile(file);
      setImportPreview(preview);
    } catch (error) {
      toast.error('파일 분석 중 오류가 발생했습니다.');
      setUploadedFile(null);
    }
  };

  const handleDataImport = async () => {
    if (!uploadedFile || !importPreview) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      // 1. 백업 생성 (옵션이 활성화된 경우)
      if (importOptions.createBackup) {
        setImportProgress(10);
        await createBackupBeforeImport();
      }

      // 2. ZIP 파일 압축 해제
      setImportProgress(20);
      const zip = new JSZip();
      const contents = await zip.loadAsync(uploadedFile);

      // 3. 메타데이터 읽기 및 검증
      setImportProgress(30);
      const metadataFile = contents.files['metadata.json'];
      if (!metadataFile) {
        throw new Error('메타데이터 파일이 없습니다.');
      }

      const metadata = JSON.parse(await metadataFile.async('text'));
      await validateImportMetadata(metadata);

      // 4. 카테고리 및 책 정보 가져오기
      setImportProgress(50);
      if (importOptions.mergeCategories) {
        await mergeCategories(metadata.categories, metadata.books);
      } else {
        await replaceCategories(metadata.categories, metadata.books);
      }

      // 5. 콘텐츠 파일들 가져오기
      setImportProgress(70);
      const contentFiles = Object.keys(contents.files)
        .filter(name => name.endsWith('.html'))
        .filter(name => !name.startsWith('metadata'));

      for (let i = 0; i < contentFiles.length; i++) {
        const fileName = contentFiles[i];
        const fileContent = await contents.files[fileName].async('text');
        await importContentFile(fileName, fileContent, importOptions.overwriteExisting);

        // 진행률 업데이트
        const fileProgress = (i / contentFiles.length) * 20; // 20% 할당
        setImportProgress(70 + fileProgress);
      }

      // 6. 첨부파일 처리
      setImportProgress(90);
      await processAttachments(contents, metadata);

      // 7. 완료 처리
      setImportProgress(100);
      await finalizeImport();

      toast.success(`${contentFiles.length}개의 콘텐츠가 성공적으로 가져와졌습니다!`);

      // 상태 초기화
      setUploadedFile(null);
      setImportPreview(null);

    } catch (error) {
      console.error('Import failed:', error);
      toast.error(`가져오기 실패: ${error.message}`);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  return (
    <Card className="data-import-card" padding="lg">
      <div className="card-header">
        <div className="header-content">
          <Icon name="upload" size="lg" />
          <div>
            <h3>📥 데이터 가져오기</h3>
            <p>ZIP 파일로 내보낸 성경 자료를 가져옵니다</p>
          </div>
        </div>
      </div>

      <div className="card-content">
        {!uploadedFile ? (
          <Dropzone
            onDrop={handleFileUpload}
            accept={{ 'application/zip': ['.zip'] }}
            maxFiles={1}
            className="import-dropzone"
          >
            <div className="dropzone-content">
              <Icon name="upload" size="xl" />
              <h4>ZIP 파일을 드래그하거나 클릭하여 선택</h4>
              <p>성경자료실에서 내보낸 ZIP 파일만 지원됩니다</p>
            </div>
          </Dropzone>
        ) : (
          <div className="upload-success">
            <div className="file-info">
              <Icon name="fileText" size="lg" />
              <div>
                <h4>{uploadedFile.name}</h4>
                <p>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {importPreview && (
              <div className="import-preview">
                <h5>가져올 데이터</h5>
                <div className="preview-stats">
                  <div className="stat">
                    <span className="label">콘텐츠:</span>
                    <span className="value">{importPreview.contentCount}개</span>
                  </div>
                  <div className="stat">
                    <span className="label">카테고리:</span>
                    <span className="value">{importPreview.categoryCount}개</span>
                  </div>
                  <div className="stat">
                    <span className="label">내보낸 날짜:</span>
                    <span className="value">{new Date(importPreview.exportDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Import Options */}
            <div className="import-options">
              <h5>가져오기 옵션</h5>
              <div className="options-grid">
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={importOptions.overwriteExisting}
                    onChange={(e) => setImportOptions(prev => ({
                      ...prev,
                      overwriteExisting: e.target.checked
                    }))}
                  />
                  <span>기존 데이터 덮어쓰기</span>
                </label>

                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={importOptions.mergeCategories}
                    onChange={(e) => setImportOptions(prev => ({
                      ...prev,
                      mergeCategories: e.target.checked
                    }))}
                  />
                  <span>카테고리 병합</span>
                </label>

                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={importOptions.createBackup}
                    onChange={(e) => setImportOptions(prev => ({
                      ...prev,
                      createBackup: e.target.checked
                    }))}
                  />
                  <span>가져오기 전 백업 생성</span>
                </label>
              </div>
            </div>

            {isImporting && (
              <div className="import-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <span className="progress-text">
                  {importProgress}% 완료 - 데이터를 가져오는 중...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card-actions">
        {uploadedFile && (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setUploadedFile(null);
                setImportPreview(null);
              }}
              disabled={isImporting}
            >
              파일 제거
            </Button>
            <Button
              variant="primary"
              onClick={handleDataImport}
              loading={isImporting}
              disabled={isImporting || !importPreview}
            >
              <Icon name="upload" size="sm" />
              가져오기 시작
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
```

### **2-3. 카테고리 내보내기/가져오기 (CSV 형태)**

```typescript
const CategoryExportImportCard: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[] | null>(null);

  const handleCategoryExport = async () => {
    setIsExporting(true);

    try {
      // 1. 모든 카테고리와 책 정보 가져오기
      const categories = await fetchCategories();
      const books = await fetchAllBooks();

      // 2. CSV 데이터 생성
      const csvData = generateCategoryCSV(categories, books);

      // 3. CSV 파일로 변환
      const csvContent = Papa.unparse(csvData, {
        header: true,
        encoding: 'utf-8',
        skipEmptyLines: true
      });

      // 4. BOM 추가 (Excel 한글 지원)
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
      const fileName = `bible-categories-${new Date().toISOString().split('T')[0]}.csv`;
      saveAs(blob, fileName);

      toast.success('카테고리 정보가 CSV 파일로 내보내졌습니다!');

    } catch (error) {
      toast.error('카테고리 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('CSV 파일만 업로드 가능합니다.');
      return;
    }

    setUploadedFile(file);

    try {
      // CSV 파일 파싱 및 미리보기
      const text = await file.text();
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        encoding: 'utf-8'
      });

      if (parsed.errors.length > 0) {
        throw new Error('CSV 파일 형식이 올바르지 않습니다.');
      }

      setCsvPreview(parsed.data.slice(0, 5)); // 처음 5행만 미리보기

    } catch (error) {
      toast.error('CSV 파일 읽기에 실패했습니다.');
      setUploadedFile(null);
    }
  };

  const handleCategoryImport = async () => {
    if (!uploadedFile) return;

    setIsImporting(true);

    try {
      // 1. CSV 파일 전체 파싱
      const text = await uploadedFile.text();
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        encoding: 'utf-8'
      });

      // 2. 데이터 검증
      const validationResult = validateCsvData(parsed.data);
      if (!validationResult.isValid) {
        throw new Error(`데이터 검증 실패: ${validationResult.errors.join(', ')}`);
      }

      // 3. 백업 생성
      await createCategoryBackup();

      // 4. 카테고리 및 책 정보 업데이트
      await importCategoriesFromCsv(parsed.data);

      toast.success(`${parsed.data.length}개의 카테고리 정보가 성공적으로 가져와졌습니다!`);

      // 상태 초기화
      setUploadedFile(null);
      setCsvPreview(null);

    } catch (error) {
      toast.error(`가져오기 실패: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="category-export-import-section">
      {/* Export Card */}
      <Card className="category-export-card" padding="lg">
        <div className="card-header">
          <div className="header-content">
            <Icon name="download" size="lg" />
            <div>
              <h3>📤 카테고리 내보내기</h3>
              <p>카테고리와 책 정보를 CSV 파일로 내보냅니다</p>
            </div>
          </div>
        </div>

        <div className="card-content">
          <div className="export-info">
            <div className="info-item">
              <span className="label">포함 내용:</span>
              <span className="value">카테고리 정보, 책 목록, 정렬 순서</span>
            </div>
            <div className="info-item">
              <span className="label">파일 형식:</span>
              <span className="value">CSV (Excel 편집 가능)</span>
            </div>
            <div className="info-item">
              <span className="label">용도:</span>
              <span className="value">대량 편집, 백업, 다른 환경 이동</span>
            </div>
          </div>
        </div>

        <div className="card-actions">
          <Button
            variant="primary"
            onClick={handleCategoryExport}
            loading={isExporting}
          >
            <Icon name="download" size="sm" />
            CSV 다운로드
          </Button>
        </div>
      </Card>

      {/* Import Card */}
      <Card className="category-import-card" padding="lg">
        <div className="card-header">
          <div className="header-content">
            <Icon name="upload" size="lg" />
            <div>
              <h3>📥 카테고리 가져오기</h3>
              <p>CSV 파일로 카테고리와 책 정보를 가져옵니다</p>
            </div>
          </div>
        </div>

        <div className="card-content">
          {!uploadedFile ? (
            <Dropzone
              onDrop={handleFileUpload}
              accept={{ 'text/csv': ['.csv'] }}
              maxFiles={1}
              className="csv-dropzone"
            >
              <div className="dropzone-content">
                <Icon name="fileText" size="xl" />
                <h4>CSV 파일을 드래그하거나 클릭하여 선택</h4>
                <p>Excel에서 편집한 카테고리 정보를 가져올 수 있습니다</p>
              </div>
            </Dropzone>
          ) : (
            <div className="csv-upload-success">
              <div className="file-info">
                <Icon name="fileText" size="lg" />
                <div>
                  <h4>{uploadedFile.name}</h4>
                  <p>{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              {csvPreview && (
                <div className="csv-preview">
                  <h5>CSV 미리보기 (처음 5행)</h5>
                  <div className="preview-table">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(csvPreview[0] || {}).map(key => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value: any, cellIndex) => (
                              <td key={cellIndex}>{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="import-warning">
                <Icon name="alertTriangle" size="sm" />
                <span>가져오기 전에 자동 백업이 생성됩니다</span>
              </div>
            </div>
          )}
        </div>

        <div className="card-actions">
          {uploadedFile && (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setUploadedFile(null);
                  setCsvPreview(null);
                }}
                disabled={isImporting}
              >
                파일 제거
              </Button>
              <Button
                variant="primary"
                onClick={handleCategoryImport}
                loading={isImporting}
                disabled={isImporting || !csvPreview}
              >
                <Icon name="upload" size="sm" />
                가져오기 시작
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

// CSV 데이터 생성 함수
const generateCategoryCSV = (categories: BibleCategory[], books: BibleBook[]): any[] => {
  const csvData: any[] = [];

  categories.forEach(category => {
    // 카테고리 행 추가
    csvData.push({
      'type': 'category',
      'category_id': category.id,
      'category_name': category.name,
      'category_display_name': category.displayName,
      'color_theme': category.colorTheme,
      'sort_order': category.sortOrder,
      'book_id': '',
      'book_name': '',
      'book_english': '',
      'book_abbreviation': '',
      'total_chapters': '',
      'book_sort_order': '',
      'created_at': category.createdAt.toISOString(),
      'updated_at': category.updatedAt.toISOString()
    });

    // 해당 카테고리의 책들 추가
    const categoryBooks = books.filter(book => book.categoryId === category.id);
    categoryBooks.forEach(book => {
      csvData.push({
        'type': 'book',
        'category_id': category.id,
        'category_name': category.name,
        'category_display_name': category.displayName,
        'color_theme': category.colorTheme,
        'sort_order': category.sortOrder,
        'book_id': book.id,
        'book_name': book.name,
        'book_english': book.nameEnglish,
        'book_abbreviation': book.abbreviation,
        'total_chapters': book.totalChapters,
        'book_sort_order': book.sortOrder,
        'created_at': '',
        'updated_at': ''
      });
    });
  });

  return csvData;
};

// CSV 데이터 검증 함수
const validateCsvData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredFields = ['type', 'category_name', 'category_display_name'];

  // 필수 필드 검증
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field] || row[field].toString().trim() === '') {
        errors.push(`${index + 1}행: ${field} 필드가 비어있습니다`);
      }
    });

    // type 필드 검증
    if (row.type && !['category', 'book'].includes(row.type)) {
      errors.push(`${index + 1}행: type은 'category' 또는 'book'이어야 합니다`);
    }

    // book 타입일 때 추가 검증
    if (row.type === 'book') {
      if (!row.book_name || row.book_name.toString().trim() === '') {
        errors.push(`${index + 1}행: book 타입에는 book_name이 필수입니다`);
      }
      if (!row.total_chapters || isNaN(parseInt(row.total_chapters))) {
        errors.push(`${index + 1}행: total_chapters는 숫자여야 합니다`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// CSV에서 카테고리 가져오기 함수
const importCategoriesFromCsv = async (csvData: any[]): Promise<void> => {
  const categoriesMap = new Map();
  const booksMap = new Map();

  // 데이터 분류
  csvData.forEach(row => {
    if (row.type === 'category') {
      categoriesMap.set(row.category_id, {
        id: row.category_id,
        name: row.category_name,
        displayName: row.category_display_name,
        colorTheme: row.color_theme,
        sortOrder: parseInt(row.sort_order) || 0
      });
    } else if (row.type === 'book') {
      if (!booksMap.has(row.category_id)) {
        booksMap.set(row.category_id, []);
      }
      booksMap.get(row.category_id).push({
        id: row.book_id || crypto.randomUUID(),
        categoryId: row.category_id,
        name: row.book_name,
        nameEnglish: row.book_english,
        abbreviation: row.book_abbreviation,
        totalChapters: parseInt(row.total_chapters) || 1,
        sortOrder: parseInt(row.book_sort_order) || 0
      });
    }
  });

  // 카테고리 업데이트
  for (const [categoryId, categoryData] of categoriesMap) {
    await upsertCategory(categoryData);
  }

  // 책 정보 업데이트
  for (const [categoryId, books] of booksMap) {
    for (const book of books) {
      await upsertBook(book);
    }
  }
};
```

### **2-4. 데이터 초기화 시스템**

```typescript
const DataResetCard: React.FC = () => {
  const [showResetDialog, setShowResetDialog] = useState<'data' | 'categories' | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleDataReset = async () => {
    setIsResetting(true);

    try {
      // 1. 백업 생성
      await createEmergencyBackup();

      // 2. 모든 콘텐츠 데이터 삭제
      await deleteAllContents();

      // 3. 진도 기록 초기화
      await resetProgressData();

      // 4. 업로드된 파일 삭제
      await cleanupUploadedFiles();

      toast.success('모든 데이터가 초기화되었습니다.');

    } catch (error) {
      toast.error('데이터 초기화 중 오류가 발생했습니다.');
    } finally {
      setIsResetting(false);
      setShowResetDialog(null);
    }
  };

  const handleCategoryReset = async () => {
    setIsResetting(true);

    try {
      // 1. 백업 생성
      await createEmergencyBackup();

      // 2. 모든 카테고리와 책 정보 삭제
      await deleteAllCategories();

      // 3. 기본 카테고리 재생성
      await createDefaultCategories();

      toast.success('카테고리가 기본값으로 초기화되었습니다.');

    } catch (error) {
      toast.error('카테고리 초기화 중 오류가 발생했습니다.');
    } finally {
      setIsResetting(false);
      setShowResetDialog(null);
    }
  };

  return (
    <div className="reset-section">
      <h3 className="section-title">🗑️ 초기화</h3>
      <p className="section-description">
        주의: 모든 초기화 작업은 자동 백업을 생성한 후 진행됩니다.
      </p>

      <div className="reset-cards">
        <Card className="reset-card data-reset" padding="md">
          <div className="reset-header">
            <Icon name="database" size="lg" />
            <div>
              <h4>데이터 초기화</h4>
              <p>모든 성경 자료와 진도 기록을 삭제합니다</p>
            </div>
          </div>

          <div className="reset-details">
            <h5>삭제될 항목:</h5>
            <ul>
              <li>모든 성경 자료 콘텐츠</li>
              <li>사용자 진도 기록</li>
              <li>업로드된 파일</li>
              <li>하이라이트 데이터</li>
            </ul>
            <p className="preserve-note">
              ✅ 카테고리와 책 정보는 보존됩니다
            </p>
          </div>

          <Button
            variant="danger"
            onClick={() => setShowResetDialog('data')}
            disabled={isResetting}
          >
            데이터 초기화
          </Button>
        </Card>

        <Card className="reset-card category-reset" padding="md">
          <div className="reset-header">
            <Icon name="folder" size="lg" />
            <div>
              <h4>카테고리 초기화</h4>
              <p>모든 카테고리와 책 정보를 기본값으로 되돌립니다</p>
            </div>
          </div>

          <div className="reset-details">
            <h5>삭제될 항목:</h5>
            <ul>
              <li>사용자 정의 카테고리</li>
              <li>추가된 성경책</li>
              <li>카테고리 순서 설정</li>
              <li>테마 커스터마이징</li>
            </ul>
            <p className="restore-note">
              🔄 구약 39권, 신약 27권 기본 구성으로 복원
            </p>
          </div>

          <Button
            variant="danger"
            onClick={() => setShowResetDialog('categories')}
            disabled={isResetting}
          >
            카테고리 초기화
          </Button>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <ResetConfirmationDialog
          type={showResetDialog}
          onConfirm={showResetDialog === 'data' ? handleDataReset : handleCategoryReset}
          onCancel={() => setShowResetDialog(null)}
          isProcessing={isResetting}
        />
      )}
    </div>
  );
};
```

---

## 🔐 **3. 관리자 인증 및 권한 시스템**

### **3-1. 관리자 헤더 및 환경 표시**

```typescript
interface AdminHeaderProps {
  currentUser: {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
    permissions: string[];
  } | null;
  environment: 'development' | 'staging' | 'production';
  onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  environment,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const environmentConfig = {
    development: { color: '#10b981', label: '개발', icon: '🔧' },
    staging: { color: '#f59e0b', label: '스테이징', icon: '🧪' },
    production: { color: '#ef4444', label: '운영', icon: '🚀' }
  };

  const config = environmentConfig[environment];

  return (
    <div className="admin-header">
      <div className="header-left">
        <h1 className="admin-title">
          🛠️ 데이터 관리
        </h1>

        <div
          className="environment-badge"
          style={{ backgroundColor: config.color }}
        >
          {config.icon} {config.label} 환경
        </div>
      </div>

      <div className="header-right">
        {/* System Status */}
        <div className="system-status">
          <div className="status-item">
            <Icon name="database" size="sm" />
            <span>DB 연결됨</span>
          </div>
          <div className="status-item">
            <Icon name="server" size="sm" />
            <span>API 정상</span>
          </div>
        </div>

        {/* User Menu */}
        <div className="user-menu">
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {currentUser?.email.charAt(0).toUpperCase()}
            </div>
            <span className="user-email">{currentUser?.email}</span>
            <Icon name="chevronDown" size="sm" />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="info-item">
                  <span className="label">역할:</span>
                  <span className="value">
                    {currentUser?.role === 'super_admin' ? '최고 관리자' : '관리자'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">권한:</span>
                  <span className="value">{currentUser?.permissions.length}개</span>
                </div>
              </div>

              <div className="menu-divider" />

              <button className="menu-item">
                <Icon name="user" size="sm" />
                프로필 설정
              </button>

              <button className="menu-item">
                <Icon name="key" size="sm" />
                비밀번호 변경
              </button>

              <div className="menu-divider" />

              <button
                className="menu-item danger"
                onClick={onLogout}
              >
                <Icon name="logOut" size="sm" />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### **3-2. 권한 기반 기능 제어**

```typescript
interface PermissionGuardProps {
  requiredPermission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermission,
  fallback = null,
  children
}) => {
  const { currentUser } = useAdminAuth();

  const hasPermission = currentUser?.permissions.includes(requiredPermission) ||
                       currentUser?.role === 'super_admin';

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// 사용 예시
const DataManagementActions: React.FC = () => {
  return (
    <div className="management-actions">
      <PermissionGuard requiredPermission="data:export">
        <DataExportCard />
      </PermissionGuard>

      <PermissionGuard requiredPermission="data:import">
        <DataImportCard />
      </PermissionGuard>

      <PermissionGuard
        requiredPermission="data:reset"
        fallback={
          <Card padding="md">
            <div className="permission-denied">
              <Icon name="lock" size="lg" />
              <p>데이터 초기화 권한이 없습니다</p>
            </div>
          </Card>
        }
      >
        <DataResetCard />
      </PermissionGuard>
    </div>
  );
};
```

---

## 📊 **4. 실시간 모니터링 및 로깅**

### **4-1. 실시간 시스템 상태 모니터링**

```typescript
const SystemMonitor: React.FC = () => {
  const [systemStats, setSystemStats] = useState({
    totalContents: 0,
    totalCategories: 0,
    totalBooks: 0,
    activeUsers: 0,
    storageUsed: '0 MB',
    lastUpdate: new Date()
  });

  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // 실시간 시스템 통계 구독
    const statsSubscription = supabase
      .channel('system_stats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'b_bible_contents'
      }, () => {
        // 통계 재계산
        fetchSystemStats();
      })
      .subscribe();

    // 활동 로그 구독
    const activitySubscription = supabase
      .channel('admin_activities')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_activity_logs'
      }, (payload) => {
        setRecentActivities(prev => [payload.new as ActivityLog, ...prev.slice(0, 9)]);
      })
      .subscribe();

    return () => {
      statsSubscription.unsubscribe();
      activitySubscription.unsubscribe();
    };
  }, []);

  return (
    <div className="system-monitor">
      <div className="monitor-header">
        <h3>📊 시스템 현황</h3>
        <div className="last-update">
          마지막 업데이트: {systemStats.lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{systemStats.totalContents}</div>
            <div className="stat-label">총 콘텐츠</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-number">{systemStats.totalCategories}</div>
            <div className="stat-label">카테고리</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-number">{systemStats.totalBooks}</div>
            <div className="stat-label">성경책</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{systemStats.activeUsers}</div>
            <div className="stat-label">활성 사용자</div>
          </div>
        </div>
      </div>

      <div className="recent-activities">
        <h4>최근 활동</h4>
        <div className="activity-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.action)}
              </div>
              <div className="activity-content">
                <div className="activity-description">
                  {activity.description}
                </div>
                <div className="activity-meta">
                  {activity.user_email} • {formatTimeAgo(activity.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### **4-2. 활동 로깅 시스템**

```typescript
interface ActivityLogger {
  logCategoryAction: (action: string, categoryId: string, details?: any) => Promise<void>;
  logDataAction: (action: string, details?: any) => Promise<void>;
  logSystemAction: (action: string, details?: any) => Promise<void>;
}

const useActivityLogger = (): ActivityLogger => {
  const { currentUser } = useAdminAuth();

  const logActivity = async (
    action: string,
    target_type: string,
    target_id?: string,
    details?: any
  ) => {
    try {
      await supabase.from('admin_activity_logs').insert({
        user_id: currentUser?.id,
        user_email: currentUser?.email,
        action,
        target_type,
        target_id,
        details: details ? JSON.stringify(details) : null,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return {
    logCategoryAction: (action, categoryId, details) =>
      logActivity(action, 'category', categoryId, details),

    logDataAction: (action, details) => logActivity(action, 'data', undefined, details),

    logSystemAction: (action, details) => logActivity(action, 'system', undefined, details),
  };
};

// 사용 예시
const CategoryManagerWithLogging: React.FC = () => {
  const logger = useActivityLogger();

  const handleCategoryCreate = async (categoryData: any) => {
    try {
      const newCategory = await createCategory(categoryData);
      await logger.logCategoryAction('create', newCategory.id, {
        name: categoryData.name,
        displayName: categoryData.displayName,
      });
      toast.success('카테고리가 생성되었습니다.');
    } catch (error) {
      await logger.logCategoryAction('create_failed', '', {
        error: error.message,
        data: categoryData,
      });
      toast.error('카테고리 생성에 실패했습니다.');
    }
  };

  // ... 나머지 구현
};
```

---

## 📱 **5. 반응형 및 모바일 최적화**

### **5-1. 모바일 네비게이션**

```typescript
const MobileDataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'data'>('data');

  return (
    <div className="mobile-data-management">
      {/* Mobile Tab Navigation */}
      <div className="mobile-tabs">
        <button
          className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <Icon name="database" size="sm" />
          데이터 관리
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Icon name="folder" size="sm" />
          카테고리
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'data' && (
          <div className="data-management-mobile">
            <DataExportCard />
            <DataImportCard />
            <CategoryExportCard />
            <DataResetCard />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="category-management-mobile">
            <CategoryManager {...categoryManagerProps} />
          </div>
        )}
      </div>
    </div>
  );
};
```

### **5-2. 모바일 최적화 CSS**

```css
/* Mobile Data Management Styles */
@media (max-width: 768px) {
  .data-management-layout {
    grid-template-columns: 1fr;
    padding: 1rem 0.5rem;
  }

  .mobile-tabs {
    display: flex;
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 4px;
    margin-bottom: 1rem;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .tab-btn {
    flex: 1;
    padding: 12px 8px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: var(--accent-primary);
    color: white;
  }

  /* Mobile Cards */
  .data-export-card,
  .data-import-card,
  .category-export-card {
    margin-bottom: 1rem;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .card-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Mobile Accordion */
  .categories-accordion {
    max-height: 70vh;
    overflow-y: auto;
  }

  .accordion-header {
    padding: 12px;
    font-size: 14px;
  }

  .category-actions,
  .book-actions {
    gap: 8px;
  }

  .action-btn {
    min-width: 32px;
    min-height: 32px;
  }

  /* Mobile Modal Adjustments */
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .dialog-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
}

/* Touch-friendly improvements */
@media (max-width: 768px) {
  .accordion-trigger,
  .book-item,
  .action-btn {
    min-height: 44px; /* Apple's recommended touch target */
  }

  .dropzone {
    min-height: 120px;
    padding: 1rem;
  }

  .progress-bar {
    height: 8px; /* Larger for better visibility */
  }
}
```

---

## ✅ **구현 체크리스트**

### **카테고리 관리 시스템**

- [ ] 어코디언 기반 CRUD 인터페이스 구현
- [ ] 카테고리 생성/편집 다이얼로그
- [ ] 책 정보 관리 기능
- [ ] 삭제 확인 및 의존성 체크
- [ ] 정렬 순서 관리

### **데이터 관리 시스템**

- [ ] ZIP 형태 데이터 내보내기
- [ ] 메타데이터 포함 백업 생성
- [ ] 드래그&드롭 파일 업로드
- [ ] 데이터 가져오기 및 병합 옵션
- [ ] CSS 형태 카테고리 내보내기

### **초기화 및 백업**

- [ ] 안전한 데이터 초기화 시스템
- [ ] 자동 백업 생성
- [ ] 복구 옵션 제공
- [ ] 확인 절차 구현

### **관리자 기능**

- [ ] 권한 기반 접근 제어
- [ ] 관리자 인증 시스템
- [ ] 환경별 설정 관리
- [ ] 활동 로깅 시스템

### **모니터링 및 로깅**

- [ ] 실시간 시스템 상태 표시
- [ ] 활동 로그 추적
- [ ] 성능 메트릭 수집
- [ ] 오류 모니터링

### **반응형 최적화**

- [ ] 모바일 탭 네비게이션
- [ ] 터치 친화적 인터페이스
- [ ] 작은 화면 최적화
- [ ] 접근성 개선

---

## 🎯 **다음 단계**

데이터관리 페이지 설계 완료 후 다음 순서로 진행:

1. **03-성경자료실-PRD.md** - HTML 편집기 및 고급 콘텐츠 관리 기능
2. **01-HOME-PRD.md** - 통합 대시보드 및 분석 기능

---

**📋 문서 상태**: ✅ **완료** - 데이터관리 페이지 상세 설계 확정  
**🛠️ 핵심 기능**: 완전한 백업/복원 시스템 + 권한 기반 관리  
**🔐 보안성**: 다단계 확인 + 활동 로깅 + 권한 제어  
**📅 다음 리뷰**: 성경자료실 페이지 PRD 작성 후
