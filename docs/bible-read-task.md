# 📋 Bible Read Task Implementation Guide

## 🎯 **문서 개요**

### **문서명**: 성경읽기 기능 구현 Task To Do
### **버전**: v1.0.0
### **작성일**: 2025.07.18
### **최종 수정일**: 2025.07.18
### **참조 문서**: `docs/00-PRD_TODO/02-성경읽기-PRD.md`

---

## 📚 **PRD 문서 참조 지시사항**

### **⚠️ 중요: PRD 문서 필수 참조**
이 Task 문서는 `docs/00-PRD_TODO/02-성경읽기-PRD.md` 문서의 상세 설계를 기반으로 작성되었습니다.

**구현 시 반드시 다음을 확인하세요:**
- ✅ **PRD 문서의 모든 인터페이스 정의** 참조
- ✅ **PRD 문서의 컴포넌트 구조** 정확히 구현
- ✅ **PRD 문서의 API 스펙** 준수
- ✅ **PRD 문서의 데이터베이스 스키마** 적용
- ✅ **PRD 문서의 파일명 규칙** (`01-genesis-01.html` 형식) 준수

---

## 🏗️ **Phase 1: 데이터베이스 및 타입 시스템 구축**

### **Task 1-1: 독립적 데이터 모델 구현**
**참조**: PRD 문서 - "독립적 데이터 모델 설계" 섹션

#### **1-1-1. TypeScript 인터페이스 생성**
```bash
# 파일 생성
touch src/types/bible-reading.ts
```

**구현 내용:**
- [ ] `BibleBook` 인터페이스 구현
- [ ] `BibleChapter` 인터페이스 구현  
- [ ] `BibleVerse` 인터페이스 구현
- [ ] `ReadingProgress` 인터페이스 구현
- [ ] `UserHighlight` 인터페이스 구현

#### **1-1-2. Supabase 테이블 생성**
**참조**: PRD 문서 - "독립적 Supabase 테이블 스키마" 섹션

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
```

**구현 내용:**
- [ ] Supabase SQL 에디터에서 테이블 생성
- [ ] RLS (Row Level Security) 정책 설정
- [ ] 인덱스 생성 (성능 최적화)
- [ ] 초기 데이터 삽입 (구약/신약 책 정보)

---

## 🎮 **Phase 2: 네비게이션 시스템 구현**

### **Task 2-1: 좌측 사이드바 컴포넌트**
**참조**: PRD 문서 - "네비게이션 시스템" 섹션

#### **2-1-1. 신/구약 토글 스위치**
```bash
# 파일 생성
touch src/components/features/bible-reading/TestamentToggle.tsx
```

**구현 내용:**
- [ ] `TestamentToggle` 컴포넌트 구현
- [ ] 구약/신약 버튼 UI 구현
- [ ] 활성 상태 스타일링
- [ ] 접근성 (ARIA) 속성 추가

#### **2-1-2. 성경 책 목록**
```bash
# 파일 생성
touch src/components/features/bible-reading/BookList.tsx
```

**구현 내용:**
- [ ] `BookList` 컴포넌트 구현
- [ ] 책별 카드 UI 구현
- [ ] 스크롤 가능한 목록
- [ ] 선택된 책 하이라이트

#### **2-1-3. 장 목록**
```bash
# 파일 생성
touch src/components/features/bible-reading/ChapterList.tsx
```

**구현 내용:**
- [ ] `ChapterList` 컴포넌트 구현
- [ ] 장별 버튼 UI 구현
- [ ] 스크롤 가능한 목록
- [ ] 현재 장 하이라이트

---

## 📖 **Phase 3: 본문 표시 시스템 구현**

### **Task 3-1: 성경 읽기 핵심 기능**
**참조**: PRD 문서 - "본문 표시 시스템" 섹션

#### **3-1-1. 상단 헤더 영역**
```bash
# 파일 생성
touch src/components/features/bible-reading/ChapterHeader.tsx
```

**구현 내용:**
- [ ] `ChapterHeader` 컴포넌트 구현
- [ ] 책명과 장 숫자 표시
- [ ] 장 제목 표시 (선택사항)
- [ ] 반응형 디자인

#### **3-1-2. HTML 본문 렌더링 영역**
```bash
# 파일 생성
touch src/components/features/bible-reading/BibleContent.tsx
```

**구현 내용:**
- [ ] `BibleContent` 컴포넌트 구현
- [ ] `dangerouslySetInnerHTML` 활용
- [ ] 구절 클릭 이벤트 처리
- [ ] 현재 읽는 구절 하이라이트

#### **3-1-3. 하단 네비게이션 영역**
```bash
# 파일 생성
touch src/components/features/bible-reading/ChapterNavigation.tsx
```

**구현 내용:**
- [ ] `ChapterNavigation` 컴포넌트 구현
- [ ] 이전/다음 장 버튼
- [ ] 버튼 활성화/비활성화 상태
- [ ] 접근성 속성 추가

---

## 🔊 **Phase 4: TTS 기능 구현**

### **Task 4-1: TTS 읽기 콘트롤**
**참조**: PRD 문서 - "TTS 읽기 콘트롤" 섹션

#### **4-1-1. TTS 컨트롤 컴포넌트**
```bash
# 파일 생성
touch src/components/features/bible-reading/TTSControls.tsx
```

**구현 내용:**
- [ ] `TTSControls` 컴포넌트 구현
- [ ] 재생/일시정지/정지 버튼
- [ ] 현재 구절/전체 구절 표시
- [ ] Web Speech API 연동

#### **4-1-2. TTS 서비스 구현**
```bash
# 파일 생성
touch src/services/ttsService.ts
```

**구현 내용:**
- [ ] Web Speech API 래퍼 함수
- [ ] 한국어 TTS 설정
- [ ] 구절별 TTS 재생
- [ ] 에러 처리

#### **4-1-3. 현재 읽는 절 하이라이트**
```bash
# 파일 생성
touch src/components/features/bible-reading/VerseHighlight.tsx
```

**구현 내용:**
- [ ] `VerseHighlight` 컴포넌트 구현
- [ ] 현재 구절 시각적 하이라이트
- [ ] CSS 애니메이션 효과
- [ ] 실시간 업데이트

---

## 💾 **Phase 5: 데이터 관리 및 API 구현**

### **Task 5-1: HTML 파일 렌더링 API**
**참조**: PRD 문서 - "데이터 관리 및 API" 섹션

#### **5-1-1. API 함수 구현**
```bash
# 파일 생성
touch src/lib/api/bible.ts
```

**구현 내용:**
- [ ] `fetchBibleChapter` 함수 구현
- [ ] `getChapterNavigation` 함수 구현
- [ ] Supabase 쿼리 최적화
- [ ] 에러 처리 및 타입 안정성

#### **5-1-2. 데이터 훅 구현**
```bash
# 파일 생성
touch src/hooks/useBibleData.ts
```

**구현 내용:**
- [ ] `useBibleData` 커스텀 훅 구현
- [ ] 장 데이터 로딩 상태 관리
- [ ] 캐싱 및 성능 최적화
- [ ] 에러 상태 처리

---

## 🎨 **Phase 6: 레이아웃 및 스타일링**

### **Task 6-1: 전체 레이아웃 구현**
**참조**: PRD 문서 - "전체 레이아웃 구조" 섹션

#### **6-1-1. 메인 레이아웃 컴포넌트**
```bash
# 파일 생성
touch src/components/features/bible-reading/BibleReadingLayout.tsx
```

**구현 내용:**
- [ ] 2열 그리드 레이아웃 (사이드바 + 읽기 영역)
- [ ] 반응형 디자인 (데스크톱/태블릿/모바일)
- [ ] CSS Grid/Flexbox 활용
- [ ] Tailwind CSS 스타일링

#### **6-1-2. 반응형 스타일링**
```bash
# 파일 생성
touch src/styles/bible-reading.css
```

**구현 내용:**
- [ ] 데스크톱 (1024px+) 스타일
- [ ] 태블릿 (768px - 1023px) 스타일
- [ ] 모바일 (< 768px) 스타일
- [ ] 다크모드 지원

---

## 🔧 **Phase 7: 독립적 FileUpload 컴포넌트**

### **Task 7-1: 성경읽기 전용 업로드**
**참조**: PRD 문서 - "독립적 FileUpload 컴포넌트 설계" 섹션

#### **7-1-1. FileUpload 컴포넌트**
```bash
# 파일 생성
touch src/components/features/bible-reading/BibleFileUpload.tsx
```

**구현 내용:**
- [ ] HTML 파일 업로드 기능
- [ ] 파일명 규칙 검증 (`01-genesis-01.html`)
- [ ] 파일 내용 미리보기
- [ ] 업로드 진행률 표시

#### **7-1-2. 파일 처리 로직**
```bash
# 파일 생성
touch src/lib/bibleFileProcessor.ts
```

**구현 내용:**
- [ ] HTML 파일 파싱
- [ ] 메타데이터 추출
- [ ] 데이터베이스 저장
- [ ] 에러 처리

---

## 🚀 **Phase 8: 메인 페이지 통합**

### **Task 8-1: READ 페이지 구현**
**참조**: PRD 문서 - "최종 구현 체크리스트" 섹션

#### **8-1-1. 메인 페이지 컴포넌트**
```bash
# 파일 수정
# src/app/read/page.tsx
```

**구현 내용:**
- [ ] 기존 헤더 유지
- [ ] 사이드바 + 읽기 영역 통합
- [ ] 상태 관리 (Zustand)
- [ ] 라우팅 처리

#### **8-1-2. 상태 관리 구현**
```bash
# 파일 생성
touch src/stores/bibleReadingStore.ts
```

**구현 내용:**
- [ ] 현재 선택된 책/장 상태
- [ ] TTS 재생 상태
- [ ] 읽기 진행 상태
- [ ] UI 상태 관리

---

## 🧪 **Phase 9: 테스트 및 최적화**

### **Task 9-1: 기능 테스트**
**참조**: PRD 문서 - "기술적 요구사항" 섹션

#### **9-1-1. 컴포넌트 테스트**
```bash
# 파일 생성
touch src/components/features/bible-reading/__tests__/BibleContent.test.tsx
```

**구현 내용:**
- [ ] 각 컴포넌트 단위 테스트
- [ ] 사용자 인터랙션 테스트
- [ ] 에러 케이스 테스트
- [ ] 접근성 테스트

#### **9-1-2. 성능 최적화**
**구현 내용:**
- [ ] 컴포넌트 메모이제이션
- [ ] 이미지 최적화
- [ ] 번들 크기 최적화
- [ ] 로딩 성능 개선

---

## 📋 **Phase 10: 최종 검증 및 배포**

### **Task 10-1: 최종 검증**
**참조**: PRD 문서 - "최종 구현 체크리스트" 섹션

#### **10-1-1. 기능 검증**
- [ ] ✅ 왼쪽 사이드바: 구약/신약 탭, 책 목록, 장 목록
- [ ] ✅ 상단 헤더: 선택된 책명과 장 숫자 표시
- [ ] ✅ 중앙 본문: HTML 파일 소스 완벽 렌더링
- [ ] ✅ 하단 네비게이션: 이전/다음 장 버튼
- [ ] ✅ TTS 기능: 성경 본문 읽기 콘트롤
- [ ] ✅ 하이라이트: 현재 읽는 절 실시간 하이라이트

#### **10-1-2. 사용자 경험 검증**
- [ ] ✅ 직관적이고 빠른 성경 읽기
- [ ] ✅ TTS 재생 중 현재 구절 시각적 표시
- [ ] ✅ 간단한 장 이동 네비게이션
- [ ] ✅ 사이드바를 통한 빠른 책/장 선택

#### **10-1-3. 기술적 요구사항 검증**
- [ ] ✅ HTML 파일 업로드 및 저장 시스템
- [ ] ✅ HTML 콘텐츠 렌더링 (`dangerouslySetInnerHTML`)
- [ ] ✅ Web Speech API를 활용한 TTS 구현
- [ ] ✅ 구절별 하이라이트 CSS 스타일링
- [ ] ✅ 장 네비게이션 API 구현
- [ ] ✅ 반응형 레이아웃 (데스크톱/태블릿/모바일)

---

## 🎯 **구현 우선순위**

### **🔥 High Priority (Phase 1-3)**
1. 데이터베이스 및 타입 시스템 구축
2. 네비게이션 시스템 구현
3. 본문 표시 시스템 구현

### **⚡ Medium Priority (Phase 4-6)**
4. TTS 기능 구현
5. 데이터 관리 및 API 구현
6. 레이아웃 및 스타일링

### **📈 Low Priority (Phase 7-10)**
7. 독립적 FileUpload 컴포넌트
8. 메인 페이지 통합
9. 테스트 및 최적화
10. 최종 검증 및 배포

---

## 📚 **참조 문서 및 리소스**

### **필수 참조 문서**
- 📋 **PRD 문서**: `docs/00-PRD_TODO/02-성경읽기-PRD.md`
- 📖 **가이드 문서**: `docs/00-PRD_TODO/02-성경읽기-guide.md`
- 🎨 **UI 컴포넌트**: shadcn/ui 라이브러리
- 🗄️ **데이터베이스**: Supabase 문서

### **기술 스택**
- **프레임워크**: Next.js 15, React 19
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand
- **데이터베이스**: Supabase
- **UI 라이브러리**: shadcn/ui

---

**📋 문서 상태**: ✅ **완료** - 성경읽기 기능 구현 Task To Do  
**🎯 핵심 목표**: PRD 문서 기반 완벽한 성경읽기 기능 구현  
**📁 파일 구조**: 체계적인 Phase별 구현 가이드  
**🔧 기술 요구사항**: TypeScript, React, Next.js, Supabase, TTS  
**📅 예상 완료**: Phase별 순차적 구현 후 최종 통합 