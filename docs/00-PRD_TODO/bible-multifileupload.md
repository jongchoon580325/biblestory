# 성경 자료 다중 파일 업로드 PRD

## 1. 개요

### 1.1 목적
기존 단일 파일 업로드의 비효율성을 해결하고, 여러 장의 성경 자료를 한 번에 업로드할 수 있는 다중 파일 업로드 시스템을 구현한다.

### 1.2 현재 문제점
- **단일 파일 업로드**: 한 번에 1개 파일만 업로드 가능
- **반복 작업**: 10장이면 10번의 개별 업로드 프로세스 필요
- **비효율성**: 시간과 노력이 많이 소요되는 구조

### 1.3 개선 목표
- **일괄 업로드**: 한 번에 여러 파일 선택 가능
- **자동 매핑**: 선택된 파일들을 자동으로 장별로 매핑
- **일괄 처리**: 한 번의 업로드로 모든 파일을 DB에 저장

## 2. 기술적 가능성

### 2.1 구현 가능성
✅ **완전히 가능합니다**

### 2.2 핵심 기술 요소
1. **파일 선택**: `multiple` 속성으로 여러 파일 동시 선택
2. **파일명 패턴**: `001-genesis-01.html`, `002-genesis-02.html` 등으로 자동 매핑
3. **배치 업로드**: Supabase의 `upsert` 기능으로 일괄 처리
4. **진행률 표시**: 업로드 진행 상황을 실시간으로 표시

## 3. 파일명 패턴 및 매핑 로직

### 3.1 파일명 구조 (현재 구현 기준)
```
01-genesis-01.html
│  │       │
│  │       └─ 실제 장 번호 (1장) ← 매핑 기준
│  └─ 성경 책명 (genesis)
└─ 접두사 (순서/버전 표시) ← 무시
```

### 3.2 현재 단일 파일 업로드 vs 다중 파일 업로드 비교

#### 3.2.1 현재 구현 (단일 파일 업로드)
```typescript
// FileUpload.tsx 현재 구조
const [files, setFiles] = useState<File[]>([]); // 다중 파일 선택 가능
const [chapter, setChapter] = useState('');     // 단일 장 번호 입력

// 업로드 시 모든 파일이 동일한 장 번호로 저장됨
for (const file of files) {
  // 모든 파일이 같은 장 번호로 저장되는 문제
  const { error: metaError } = await supabase.from('b_materials').upsert({
    category_id: data.id,
    chapter: Number(chapter), // 모든 파일이 동일한 장 번호
    file_name: file.name,
    storage_path: filePath,
    created_at: new Date().toISOString()
  });
}
```

#### 3.2.2 개선된 다중 파일 업로드 구조
```typescript
// 다중 파일 업로드 시 파일명에서 장 번호 자동 추출
const extractChapterFromFileName = (fileName: string): number | null => {
  // 01-genesis-01.html → 1
  // 02-genesis-02.html → 2
  const match = fileName.match(/[0-9]{2,3}-[a-zA-Z0-9]+-([0-9]+)\.html/);
  return match ? parseInt(match[1]) : null;
};

// 각 파일별로 개별 장 번호 추출하여 저장
for (const file of files) {
  const extractedChapter = extractChapterFromFileName(file.name);
  if (!extractedChapter) {
    // 파일명 패턴이 맞지 않는 경우 스킵
    continue;
  }
  
  const { error: metaError } = await supabase.from('b_materials').upsert({
    category_id: data.id,
    chapter: extractedChapter, // 파일명에서 추출한 장 번호
    file_name: file.name,
    storage_path: filePath,
    file_size: file.size,      // 추가된 컬럼
    mime_type: file.type,      // 추가된 컬럼
    created_at: new Date().toISOString()
  });
}
```

### 3.3 매핑 기준 (개선된 버전)
- **접두사 무시**: `01-`, `02-` 등은 순서 표시용
- **장 번호 추출**: 파일명 끝부분에서 실제 장 번호 추출
- **자동 매핑**: 사용자가 장 번호를 수동으로 입력할 필요 없음
- **예시 매핑**:
  - `01-genesis-01.html` → 1장
  - `02-genesis-02.html` → 2장
  - `03-genesis-03.html` → 3장

### 3.4 정규식 패턴 (개선된 버전)
```javascript
// 2자리 또는 3자리 숫자 접두사 지원
const chapterPattern = /[0-9]{2,3}-([a-zA-Z0-9]+)-([0-9]+)\.html/;

// 파일명 검증 함수
const validateFileName = (fileName: string): {
  isValid: boolean;
  bookName?: string;
  chapter?: number;
  error?: string;
} => {
  const match = fileName.match(chapterPattern);
  if (!match) {
    return { 
      isValid: false, 
      error: '파일명 패턴이 올바르지 않습니다. (예: 01-genesis-01.html)' 
    };
  }
  
  const bookName = match[1];
  const chapter = parseInt(match[2]);
  
  if (chapter < 1 || chapter > 150) {
    return { 
      isValid: false, 
      error: '장 번호는 1-150 범위여야 합니다.' 
    };
  }
  
  return { isValid: true, bookName, chapter };
};
```

## 4. 다중입력 레이아웃 설계 (현재 구현 기반 개선)

### 4.1 전체 레이아웃 구조 (현재 FileUpload.tsx 기반)
```
┌─────────────────────────────────────────────────────────────┐
│                    성경자료 등록 (다중 업로드)                │
├─────────────────────────────────────────────────────────────┤
│ 1. 기본 정보 선택 (현재 구현 유지)                           │
│ ┌─────────────┬─────────────┐                              │
│ │ 구약/신약   │   책명      │                              │
│ │ [구약 ▼]    │ [창세기 ▼]  │                              │
│ └─────────────┴─────────────┘                              │
│ ※ 장 번호 입력 필드 제거 (파일명에서 자동 추출)              │
├─────────────────────────────────────────────────────────────┤
│ 2. 파일 선택 영역 (현재 구현 개선)                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  📁 파일을 여기에 드래그하거나 클릭하여 선택하세요        │ │
│ │  [파일 선택] 버튼 (multiple 속성)                       │ │
│ │  지원 형식: 01-genesis-01.html, 02-genesis-02.html      │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 3. 선택된 파일 목록 (테이블) - 신규 추가                    │
│ ┌─────┬─────────────────────┬──────────┬──────────┬──────┐ │
│ │상태 │      파일명          │   크기   │   장번호  │ 액션 │ │
│ ├─────┼─────────────────────┼──────────┼──────────┼──────┤ │
│ │ ✅  │ 01-genesis-01.html  │  2.3KB   │    1     │ ❌   │ │
│ │ ✅  │ 02-genesis-02.html  │  2.1KB   │    2     │ ❌   │ │
│ │ ❌  │ genesis-03.html     │  2.5KB   │   -      │ ❌   │ │
│ │ ⚠️  │ 04-genesis-01.html  │  2.0KB   │    1     │ ❌   │ │
│ └─────┴─────────────────────┴──────────┴──────────┴──────┘ │
├─────────────────────────────────────────────────────────────┤
│ 4. 업로드 진행률 (신규 추가)                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ████████████████████████████████████████████████████████ │ │
│ │ 진행률: 60% (3/5 파일 완료)                              │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 5. 액션 버튼 (현재 구현 개선)                               │
│ [파일 다시 선택]  [업로드 시작]  [취소]                     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 현재 FileUpload.tsx와의 차이점

#### 4.2.1 제거되는 요소
- **장 번호 입력 필드**: 파일명에서 자동 추출하므로 불필요
- **단순 파일 리스트**: 테이블 형태로 변경하여 더 상세한 정보 표시

#### 4.2.2 추가되는 요소
- **파일 상태 테이블**: 각 파일의 검증 결과와 장 번호 표시
- **진행률 표시**: 업로드 진행 상황을 실시간으로 표시
- **파일별 상태 아이콘**: 적합/부적합/경고 상태 시각화

### 4.3 파일 상태 아이콘 시스템

#### 4.3.1 아이콘 표시 기준
- ✅ **적합**: 올바른 파일명 패턴 (예: `01-genesis-01.html`)
- ❌ **부적합**: 잘못된 패턴 (예: `genesis-01.html`, `01-genesis.txt`)
- ⚠️ **경고**: 중복 장 번호 또는 기존 파일과 충돌

#### 4.3.2 아이콘 기능
- 시각적 즉시 피드백으로 사용자 경험 향상
- 부적합 파일 클릭 시 구체적인 오류 메시지 표시
- 적합하지 않은 파일은 업로드 버튼 비활성화

### 4.4 주요 UI 컴포넌트 (현재 구현 기반)

#### 4.4.1 파일 선택 영역 (기존 개선)
```typescript
// 현재 FileUpload.tsx의 드래그앤드롭 영역 유지
<div className="border-2 border-dashed border-blue-400 rounded-xl p-8 text-center cursor-pointer bg-slate-900 hover:bg-slate-800 transition"
     onDrop={handleDrop}
     onDragOver={e => e.preventDefault()}
     onClick={() => fileInputRef.current?.click()}>
  <p className="text-slate-400">여기로 파일을 드래그하거나 클릭하여 선택</p>
  <p className="text-slate-500 text-sm mt-2">지원 형식: 01-genesis-01.html, 02-genesis-02.html</p>
  <input type="file" multiple accept=".html" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
</div>
```

#### 4.4.2 파일 목록 테이블 (신규 추가)
```typescript
// 새로운 테이블 컴포넌트
const FileValidationTable = ({ files, onRemoveFile }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-slate-300">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="px-4 py-2 text-left">상태</th>
            <th className="px-4 py-2 text-left">파일명</th>
            <th className="px-4 py-2 text-left">크기</th>
            <th className="px-4 py-2 text-left">장번호</th>
            <th className="px-4 py-2 text-left">액션</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => {
            const validation = validateFileName(file.name);
            return (
              <tr key={index} className="border-b border-slate-800">
                <td className="px-4 py-2">
                  {validation.isValid ? '✅' : '❌'}
                </td>
                <td className="px-4 py-2">{file.name}</td>
                <td className="px-4 py-2">{(file.size / 1024).toFixed(1)}KB</td>
                <td className="px-4 py-2">{validation.chapter || '-'}</td>
                <td className="px-4 py-2">
                  <button onClick={() => onRemoveFile(index)} className="text-red-400 hover:text-red-300">
                    ❌
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
```

#### 4.4.3 진행률 표시 (신규 추가)
```typescript
// 진행률 컴포넌트
const UploadProgress = ({ current, total, isUploading }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-sm text-slate-400 text-center">
        {isUploading ? `진행률: ${percentage.toFixed(1)}% (${current}/${total} 파일 완료)` : '업로드 준비 완료'}
      </div>
    </div>
  );
};
```

## 5. DB Table 적용 구현

### 5.1 배치 업로드 로직

#### 5.1.1 파일 수집 및 분석
1. 선택된 모든 파일을 배열로 수집
2. 각 파일별로 파일명에서 장 번호와 책명 추출
3. 파일명 패턴 검증 및 오류 파일 필터링
4. 중복 장 번호 검사 및 경고 표시
5. **기존 DB 데이터와의 충돌 검사** (중요 추가사항)

#### 5.1.2 사전 검증 프로세스
1. **category_id 조회**: 선택된 책명에 해당하는 category.id 확인
2. **기존 파일 중복 검사**: 동일한 책의 동일한 장이 이미 존재하는지 확인
3. **파일 크기 제한 검사**: 각 파일의 크기가 허용 범위 내인지 확인
4. **총 업로드 용량 검사**: 전체 파일 크기가 Storage 용량 제한을 초과하지 않는지 확인

#### 5.1.3 Storage 업로드
1. **경로 생성**: `biblefiles/{testament}/{book_name}/` 경로 자동 생성
2. **파일명 정규화**: 특수문자 처리 및 안전한 파일명으로 변환
3. **Supabase Storage에 파일들을 순차적으로 업로드**
4. **업로드 성공한 파일들의 메타데이터를 일괄 수집**
5. **실패한 파일에 대한 오류 정보 수집**

### 5.2 DB Table 구조 및 컬럼 매핑

#### 5.2.1 테이블 정보
- **테이블명**: `b_materials`
- **설명**: 성경 자료 파일의 메타데이터 저장
- **RLS 정책**: 현재는 개발모드로 정책설정하고 배포시에 정책설정을 강화

#### 5.2.2 실제 구현된 컬럼 구조 및 매핑
```sql
-- 현재 실제 구현된 b_materials 테이블 구조
CREATE TABLE b_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES category(id) NOT NULL,
  chapter INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 누락된 컬럼들 (추가 필요)
ALTER TABLE b_materials ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE b_materials ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/html';
ALTER TABLE b_materials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 제약조건 추가 (현재 누락됨)
ALTER TABLE b_materials ADD CONSTRAINT IF NOT EXISTS check_chapter_range 
  CHECK (chapter >= 1 AND chapter <= 150);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_b_materials_category_chapter ON b_materials(category_id, chapter);
CREATE INDEX IF NOT EXISTS idx_b_materials_file_name ON b_materials(file_name);
CREATE INDEX IF NOT EXISTS idx_b_materials_created_at ON b_materials(created_at);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_b_materials_updated_at 
    BEFORE UPDATE ON b_materials 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### 5.2.3 파일 정보 → DB 컬럼 매핑 (실제 구현 기준)
| 파일 정보 | DB 컬럼 | 데이터 타입 | 설명 | 예시 | 현재 구현 상태 |
|-----------|---------|-------------|------|------|----------------|
| 파일명 | `file_name` | TEXT | 원본 업로드 파일명 | `01-genesis-01.html` | ✅ 구현됨 |
| 장 번호 | `chapter` | INTEGER | 추출된 장 번호 (1-150) | `1` | ✅ 구현됨 |
| 책명 ID | `category_id` | UUID | category 테이블의 책 ID | `uuid-1234-5678` | ✅ 구현됨 |
| Storage 경로 | `storage_path` | TEXT | Supabase Storage 경로 | `old_testament/genesis/01-genesis-01.html` | ✅ 구현됨 |
| 파일 크기 | `file_size` | BIGINT | 파일 크기 (bytes) | `2048` | ❌ 누락됨 |
| 파일 타입 | `mime_type` | TEXT | MIME 타입 | `text/html` | ❌ 누락됨 |
| 생성일시 | `created_at` | TIMESTAMP | 업로드 시각 | `2024-01-15T10:30:00Z` | ✅ 구현됨 |
| 수정일시 | `updated_at` | TIMESTAMP | 마지막 수정 시각 | `2024-01-15T10:30:00Z` | ❌ 누락됨 |

#### 5.2.4 현재 FileUpload.tsx의 실제 DB 저장 로직
```typescript
// 현재 구현된 upsert 로직 (FileUpload.tsx 147-155라인)
const { error: metaError } = await supabase.from('b_materials').upsert({
  category_id: data.id,           // ✅ 책명 ID
  chapter: Number(chapter),       // ✅ 장 번호
  file_name: file.name,           // ✅ 원본 파일명
  storage_path: filePath,         // ✅ Storage 경로
  created_at: new Date().toISOString() // ✅ 생성일시
});
```

#### 5.2.5 다중 파일 업로드 시 필요한 개선사항
1. **누락된 컬럼 추가**: `file_size`, `mime_type`, `updated_at`
2. **제약조건 강화**: 장 번호 범위 검증 (1-150)
3. **인덱스 최적화**: 검색 성능 향상
4. **일괄 처리**: 다중 파일 업로드 시 배치 처리
5. **메타데이터 보강**: 파일 크기, MIME 타입 등 추가 정보 저장

#### 5.2.6 관련 테이블 구조 (현재 구현 기준)
```sql
-- 카테고리 테이블 (현재 사용 중)
CREATE TABLE category (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES category(id),
  order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 예시 데이터 구조
-- 구약/신약 (parent_id = null)
INSERT INTO category (id, name, parent_id, order) VALUES 
('old-testament-id', '구약', null, 1),
('new-testament-id', '신약', null, 2);

-- 책명 (parent_id = 구약/신약 ID)
INSERT INTO category (id, name, parent_id, order) VALUES 
('genesis-id', '창세기', 'old-testament-id', 1),
('exodus-id', '출애굽기', 'old-testament-id', 2);
```

### 5.3 DB 일괄 삽입 (현재 구현 기반 개선)

#### 5.3.1 현재 구현의 문제점
```typescript
// 현재 FileUpload.tsx의 문제점
for (const file of files) {
  // 1. 모든 파일이 동일한 장 번호로 저장됨
  // 2. 파일별 개별 처리로 성능 저하
  // 3. 누락된 메타데이터 (file_size, mime_type)
  const { error: metaError } = await supabase.from('b_materials').upsert({
    category_id: data.id,
    chapter: Number(chapter), // 모든 파일이 동일한 장 번호
    file_name: file.name,
    storage_path: filePath,
    created_at: new Date().toISOString()
    // file_size, mime_type 누락
  });
}
```

#### 5.3.2 개선된 메타데이터 구성
```typescript
// 다중 파일 업로드용 메타데이터 구성
interface MaterialMetadata {
  id?: string;              // UUID 자동 생성
  category_id: string;      // 책명에 해당하는 category.id
  chapter: number;          // 파일명에서 추출된 장 번호 (1-150 범위)
  file_name: string;        // 원본 파일명 (사용자 업로드 파일명)
  storage_path: string;     // Storage 경로 (testament/book/filename)
  file_size: number;        // 파일 크기 (bytes) - 추가됨
  mime_type: string;        // 파일 타입 (text/html) - 추가됨
  created_at: string;       // 업로드 시각 (ISO 8601)
  updated_at?: string;      // 수정 시각 (자동 업데이트) - 추가됨
}

// 파일별 메타데이터 생성 함수
const createMaterialMetadata = (
  file: File, 
  categoryId: string, 
  storagePath: string
): MaterialMetadata => {
  const extractedChapter = extractChapterFromFileName(file.name);
  
  return {
    category_id: categoryId,
    chapter: extractedChapter || 1, // 기본값 1 (검증 후 사용)
    file_name: file.name,
    storage_path: storagePath,
    file_size: file.size,           // 추가된 필드
    mime_type: file.type || 'text/html', // 추가된 필드
    created_at: new Date().toISOString()
  };
};
```

#### 5.3.3 개선된 일괄 삽입 처리
```typescript
// 다중 파일 일괄 업로드 함수
const uploadMultipleFiles = async (files: File[], categoryId: string) => {
  const uploadResults: UploadResult[] = [];
  const validFiles: MaterialMetadata[] = [];
  
  // 1. 파일 검증 및 메타데이터 준비
  for (const file of files) {
    const validation = validateFileName(file.name);
    if (!validation.isValid) {
      uploadResults.push({ 
        fileName: file.name, 
        success: false, 
        error: validation.error 
      });
      continue;
    }
    
    const testamentFolder = getTestamentFolder(section, groups);
    const bookSlug = toSlug(bookKor);
    const filePath = `${testamentFolder}/${bookSlug}/${file.name}`;
    
    validFiles.push(createMaterialMetadata(file, categoryId, filePath));
  }
  
  // 2. Storage 일괄 업로드
  const storageResults = await Promise.allSettled(
    validFiles.map(async (metadata, index) => {
      const file = files[index];
      const { error } = await supabase.storage
        .from('biblefiles')
        .upload(metadata.storage_path, file, { 
          upsert: true, 
          contentType: metadata.mime_type 
        });
      return { metadata, error };
    })
  );
  
  // 3. 성공한 파일들의 메타데이터만 수집
  const successfulMetadata = storageResults
    .filter((result): result is PromiseFulfilledResult<{metadata: MaterialMetadata, error: any}> => 
      result.status === 'fulfilled' && !result.value.error
    )
    .map(result => result.value.metadata);
  
  // 4. DB 일괄 삽입 (배치 처리)
  if (successfulMetadata.length > 0) {
    const { error: batchError } = await supabase
      .from('b_materials')
      .upsert(successfulMetadata);
    
    if (batchError) {
      // DB 삽입 실패 시 Storage 파일들 정리
      await cleanupStorageFiles(successfulMetadata.map(m => m.storage_path));
      throw new Error(`DB 삽입 실패: ${batchError.message}`);
    }
  }
  
  return uploadResults;
};
```

#### 5.3.4 데이터 무결성 보장 (개선된 버전)
1. **외래키 제약조건**: category_id가 유효한 category.id인지 확인
2. **장 번호 범위 검증**: 1-150 범위 내인지 확인 (제약조건 추가)
3. **파일명 중복 방지**: 동일한 category_id + chapter 조합 중복 방지
4. **필수 필드 검증**: 모든 필수 필드가 누락되지 않았는지 확인
5. **파일 크기 제한**: 각 파일의 크기가 허용 범위 내인지 확인

### 5.4 마이그레이션 SQL (현재 DB 구조 개선)

#### 5.4.1 누락된 컬럼 추가
```sql
-- 누락된 컬럼들 추가
ALTER TABLE b_materials ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE b_materials ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/html';
ALTER TABLE b_materials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 기존 데이터에 대한 기본값 설정
UPDATE b_materials SET 
  file_size = 0,
  mime_type = 'text/html',
  updated_at = created_at
WHERE file_size IS NULL OR mime_type IS NULL OR updated_at IS NULL;
```

#### 5.4.2 제약조건 및 인덱스 추가
```sql
-- 장 번호 범위 제약조건 추가
ALTER TABLE b_materials ADD CONSTRAINT IF NOT EXISTS check_chapter_range 
  CHECK (chapter >= 1 AND chapter <= 150);

-- 성능 최적화를 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_b_materials_category_chapter ON b_materials(category_id, chapter);
CREATE INDEX IF NOT EXISTS idx_b_materials_file_name ON b_materials(file_name);
CREATE INDEX IF NOT EXISTS idx_b_materials_created_at ON b_materials(created_at);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_b_materials_updated_at 
    BEFORE UPDATE ON b_materials 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### 5.4.3 기존 데이터 정리 (선택사항)
```sql
-- 기존 데이터의 file_size 업데이트 (Storage에서 실제 크기 조회)
-- 이 부분은 별도 스크립트로 구현 필요

-- 중복 데이터 정리 (동일한 category_id + chapter 조합)
DELETE FROM b_materials 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM b_materials 
  GROUP BY category_id, chapter
);
```

### 5.4 에러 처리 및 롤백

#### 5.4.1 부분 실패 처리
- **개별 파일 업로드 실패 시 해당 파일만 스킵하고 계속 진행**
- **DB 삽입 실패 시 이미 업로드된 Storage 파일들을 정리**
- **사용자에게 실패한 파일 목록과 성공한 파일 목록을 상세히 보고**
- **재시도 로직**: 네트워크 오류 시 자동 재시도 (최대 3회)

#### 5.4.2 트랜잭션 관리
- **Storage 업로드와 DB 삽입을 분리하여 각각 독립적으로 처리**
- **부분 실패 시에도 성공한 부분은 유지하고 실패한 부분만 재시도 가능**
- **롤백 기능으로 데이터 일관성 보장**
- **로깅 시스템**: 모든 업로드 과정을 상세히 로깅하여 디버깅 지원

#### 5.4.3 오류 분류 및 처리
1. **네트워크 오류**: 자동 재시도 (최대 3회)
2. **권한 오류**: 사용자에게 권한 확인 요청
3. **용량 초과 오류**: 파일 크기 제한 안내
4. **중복 파일 오류**: 덮어쓰기 여부 확인
5. **형식 오류**: 파일 형식 검증 실패 시 안내

### 5.5 성능 최적화

#### 5.5.1 병렬 처리
- **Storage 업로드는 병렬로 처리하여 속도 향상** (최대 5개 동시 업로드)
- **DB 삽입은 일괄 처리로 효율성 극대화** (배치 크기: 100개)
- **메모리 사용량 모니터링**: 동시 업로드 수 조절

#### 5.5.2 메모리 관리
- **대용량 파일 처리 시 메모리 사용량 최적화**
- **스트리밍 업로드로 메모리 효율성 향상**
- **가비지 컬렉션 최적화**: 업로드 완료 후 메모리 정리

#### 5.5.3 캐싱 전략
- **category_id 조회 결과 캐싱**: 반복 조회 방지
- **파일 검증 결과 캐싱**: 동일 파일 재검증 방지
- **업로드 진행률 캐싱**: 페이지 새로고침 시에도 진행률 유지

### 5.6 보안 및 권한 관리

#### 5.6.1 파일 보안
- **파일 타입 검증**: HTML 파일만 허용
- **파일 크기 제한**: 최대 10MB per file
- **악성 코드 검사**: 업로드된 파일 내용 검증

#### 5.5.2 권한 관리
- **RLS 정책 준수**: 사용자별 데이터 접근 제한
- **관리자 권한 확인**: DATA 페이지 접근 권한 검증
- **업로드 권한 검증**: 해당 카테고리에 대한 쓰기 권한 확인

### 5.6 모니터링 및 로깅

#### 5.6.1 업로드 모니터링
- **실시간 진행률 추적**: 각 파일별 업로드 상태
- **성능 메트릭 수집**: 업로드 속도, 성공률 등
- **오류 패턴 분석**: 자주 발생하는 오류 유형 파악

#### 5.6.2 상세 로깅
- **업로드 시작/완료 로그**: 타임스탬프와 함께 기록
- **오류 상세 정보**: 오류 발생 위치와 원인 기록
- **사용자 액션 로그**: 파일 선택, 업로드 시도 등 기록

## 6. 사용자 경험 (UX) 개선

### 6.1 즉시 피드백
- 파일 선택 즉시 패턴 검증 및 상태 표시
- 실시간 진행률 업데이트
- 오류 발생 시 즉시 알림

### 6.2 직관적 인터페이스
- 드래그앤드롭으로 쉬운 파일 선택
- 시각적 아이콘으로 상태 명확히 표시
- 단계별 진행 상황 표시

### 6.3 오류 처리
- 구체적인 오류 메시지 제공
- 오류 파일 개별 제거 가능
- 재시도 기능 제공

## 7. 구현 우선순위 (현재 프로젝트 기준)

### 7.1 Phase 1 (즉시 구현 가능 - DB 구조 개선)
1. **DB 마이그레이션**: 누락된 컬럼 추가 및 제약조건 설정
   - `file_size`, `mime_type`, `updated_at` 컬럼 추가
   - 장 번호 범위 제약조건 (1-150) 추가
   - 인덱스 최적화
   - 자동 업데이트 트리거 설정

2. **파일명 검증 로직**: 현재 FileUpload.tsx에 추가
   - 파일명에서 장 번호 자동 추출 함수 구현
   - 파일명 패턴 검증 함수 구현
   - 기존 업로드 로직에 검증 단계 추가

### 7.2 Phase 2 (핵심 기능 구현)
1. **다중 파일 업로드 UI**: 현재 FileUpload.tsx 개선
   - 장 번호 입력 필드 제거
   - 파일 검증 테이블 추가
   - 진행률 표시 컴포넌트 추가
   - 파일별 상태 아이콘 시스템 구현

2. **일괄 처리 로직**: 업로드 성능 개선
   - Storage 병렬 업로드 구현
   - DB 일괄 삽입 로직 구현
   - 에러 처리 및 롤백 로직 강화

### 7.3 Phase 3 (사용자 경험 개선)
1. **고급 검증 기능**
   - 중복 장 번호 검사
   - 기존 파일과의 충돌 검사
   - 파일 크기 제한 검사

2. **성능 최적화**
   - 메모리 사용량 최적화
   - 캐싱 전략 구현
   - 업로드 속도 모니터링

## 8. 테스트 시나리오 (현재 구현 기준)

### 8.1 기능 테스트
- **기존 단일 파일 업로드**: 현재 기능이 정상 동작하는지 확인
- **다중 파일 업로드**: 여러 파일 동시 업로드 테스트
- **파일명 패턴 검증**: 다양한 파일명 패턴 테스트
  - `01-genesis-01.html` (정상)
  - `genesis-01.html` (오류)
  - `01-genesis-01.txt` (오류)
- **장 번호 자동 추출**: 파일명에서 장 번호 정확히 추출되는지 확인

### 8.2 데이터 무결성 테스트
- **DB 컬럼 추가**: 새로운 컬럼들이 정상적으로 추가되는지 확인
- **제약조건 검증**: 장 번호 범위 제약조건이 정상 동작하는지 확인
- **인덱스 성능**: 검색 성능이 개선되는지 확인
- **트리거 동작**: updated_at 자동 업데이트가 정상 동작하는지 확인

### 8.3 성능 테스트
- **대용량 파일 업로드**: 10MB 이상 파일 업로드 테스트
- **다중 파일 동시 업로드**: 10개 이상 파일 동시 업로드 테스트
- **메모리 사용량**: 업로드 중 메모리 사용량 모니터링
- **네트워크 오류**: 업로드 중 네트워크 오류 상황 테스트

### 8.4 사용자 경험 테스트
- **파일 검증 피드백**: 부적합 파일에 대한 즉시 피드백 확인
- **진행률 표시**: 업로드 진행률이 정확히 표시되는지 확인
- **오류 처리**: 다양한 오류 상황에서 적절한 메시지 표시 확인
- **반응형 디자인**: 모바일/태블릿에서 UI 정상 동작 확인

## 9. 마이그레이션 체크리스트

### 9.1 DB 마이그레이션 (즉시 실행 가능)
- [ ] `file_size` 컬럼 추가
- [ ] `mime_type` 컬럼 추가 (기본값: 'text/html')
- [ ] `updated_at` 컬럼 추가
- [ ] 장 번호 범위 제약조건 추가 (1-150)
- [ ] 성능 최적화 인덱스 추가
- [ ] 자동 업데이트 트리거 설정
- [ ] 기존 데이터 기본값 설정

### 9.2 코드 마이그레이션
- [ ] 파일명 검증 함수 구현
- [ ] 장 번호 자동 추출 함수 구현
- [ ] FileUpload.tsx UI 개선
- [ ] 일괄 업로드 로직 구현
- [ ] 에러 처리 강화
- [ ] 진행률 표시 구현

### 9.3 테스트 및 검증
- [ ] 기존 기능 정상 동작 확인
- [ ] 새로운 기능 정상 동작 확인
- [ ] 성능 테스트 완료
- [ ] 사용자 경험 테스트 완료
- [ ] 오류 상황 테스트 완료

---

**이 PRD를 기반으로 구현하면 현재 단일 파일 업로드의 한계를 완전히 해결하고, 사용자 경험을 크게 향상시킬 수 있습니다. 특히 DB 구조 개선과 파일명 자동 매핑을 통해 업로드 효율성을 극대화할 수 있습니다.** 