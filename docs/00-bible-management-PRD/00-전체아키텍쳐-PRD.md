# 📋 00-전체아키텍처-PRD.md

## 🎯 **프로젝트 개요**

### **프로젝트명**: 성경자료실 (Bible Resource Center)

### **버전**: v1.0.0

### **문서 버전**: 1.0

### **작성일**: 2025.07.08

### **최종 수정일**: 2025.07.08

---

## 🚀 **프로젝트 비전**

> **"전통적인 성경 읽기를 혁신하는 차세대 디지털 성경학 플랫폼"**

### **핵심 가치 제안**

- **몰입형 읽기 경험**: 방해요소 없는 깔끔한 인터페이스로 말씀에 집중
- **개인화된 학습**: 개인별 읽기 진도, 하이라이트, 묵상 기록 관리
- **풍부한 자료**: 운영자가 직접 제작하는 고품질 성경 해설 콘텐츠
- **통합 관리**: 읽기부터 자료 관리까지 원스톱 성경학 솔루션

---

## 🏛️ **시스템 아키텍처**

### **전체 아키텍처 다이어그램**

```
┌─────────────────── Frontend Layer ───────────────────┐
│  Next.js 14+ (App Router) + TypeScript + Tailwind    │
│  ├── 성경읽기 (Reading Engine + TTS)                  │
│  ├── 성경자료실 (Content Management + HTML Editor)    │
│  ├── 데이터관리 (Admin Dashboard)                      │
│  └── HOME (Analytics Dashboard)                      │
└───────────────────────┬───────────────────────────────┘
                        │
┌─────────────────── API Layer ─────────────────────────┐
│  Next.js API Routes + Supabase Edge Functions         │
│  ├── /api/bible/* (성경 텍스트 API)                    │
│  ├── /api/content/* (자료 CRUD API)                   │
│  ├── /api/progress/* (진도 추적 API)                   │
│  └── /api/admin/* (관리자 기능 API)                    │
└───────────────────────┬───────────────────────────────┘
                        │
┌─────────────────── Database Layer ────────────────────┐
│  Supabase PostgreSQL + Row Level Security             │
│  ├── 콘텐츠 테이블 (7개 정규화된 테이블)               │
│  ├── 사용자 진도 추적                                 │
│  ├── 파일 스토리지 (Supabase Storage)                 │
│  └── 실시간 동기화 (Realtime Subscriptions)          │
└───────────────────────┬───────────────────────────────┘
                        │
┌─────────────────── Infrastructure ────────────────────┐
│  Vercel (Hosting) + GitHub (CI/CD)                    │
│  ├── 자동 배포 파이프라인                             │
│  ├── 환경별 설정 (Dev/Staging/Prod)                   │
│  ├── 성능 모니터링 (Vercel Analytics)                 │
│  └── 도메인 & SSL 인증서                              │
└───────────────────────────────────────────────────────┘
```

---

## ⚙️ **기술 스택 상세**

### **Frontend Core**

```typescript
"dependencies": {
  "next": "^14.2.0",           // React 프레임워크
  "react": "^18.3.0",          // UI 라이브러리
  "typescript": "^5.5.0",      // 타입 안전성
  "tailwindcss": "^3.4.0",     // CSS 프레임워크
  "@supabase/supabase-js": "^2.44.0", // DB 클라이언트
  "lucide-react": "^0.395.0",  // 아이콘 라이브러리
  "framer-motion": "^11.2.0",  // 애니메이션
  "react-hook-form": "^7.52.0", // 폼 관리
  "zustand": "^4.5.0",         // 상태 관리
  "react-hot-toast": "^2.4.0", // 알림 시스템
  "date-fns": "^3.6.0"         // 날짜 처리
}
```

### **특화 기능 라이브러리**

```typescript
"specializedDeps": {
  "@monaco-editor/react": "^4.6.0",    // HTML 코드 에디터
  "react-speech-kit": "^3.0.1",        // TTS (Text-to-Speech)
  "html-react-parser": "^5.1.10",      // HTML 파싱 및 렌더링
  "jszip": "^3.10.1",                  // 파일 압축/해제
  "file-saver": "^2.0.5",              // 파일 다운로드
  "react-dropzone": "^14.2.3",         // 드래그&드롭 업로드
  "recharts": "^2.12.0",               // 차트 라이브러리
  "react-intersection-observer": "^9.10.2" // 스크롤 진도 추적
}
```

### **Backend & Database**

```sql
-- Supabase Stack
PostgreSQL 15+                 -- 메인 데이터베이스
Row Level Security (RLS)       -- 보안 정책
Supabase Storage              -- 파일 업로드
Edge Functions (Deno)         -- 서버리스 함수
Realtime Subscriptions        -- 실시간 데이터 동기화
```

### **개발 도구**

```json
"devDependencies": {
  "eslint": "^8.57.0",         // 코드 품질
  "prettier": "^3.3.0",        // 코드 포맷팅
  "@types/node": "^20.14.0",   // Node.js 타입
  "supabase": "^1.178.0",      // Supabase CLI
  "husky": "^9.0.0",           // Git Hooks
  "lint-staged": "^15.2.0"     // 스테이징 린트
}
```

---

## 🗄️ **데이터베이스 설계**

### **테이블 구조 (7개 핵심 테이블)**

#### **1. 카테고리 테이블 (b_categories)**

```sql
CREATE TABLE b_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,        -- 'old-testament', 'new-testament'
  display_name VARCHAR(100) NOT NULL,      -- '구약 성경', '신약 성경'
  color_theme VARCHAR(20) NOT NULL,        -- UI 테마 컬러
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **2. 성경 책 테이블 (b_bible_books)**

```sql
CREATE TABLE b_bible_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES b_categories(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,               -- '창세기', '마태복음'
  name_english VARCHAR(50),                -- 'Genesis', 'Matthew'
  abbreviation VARCHAR(10),                -- '창', '마'
  sort_order INTEGER NOT NULL,
  total_chapters INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);
```

#### **3. 성경 콘텐츠 테이블 (b_bible_contents)**

```sql
CREATE TABLE b_bible_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  bible_book_id UUID REFERENCES b_bible_books(id) ON DELETE SET NULL,
  chapter_number INTEGER,
  verse_range VARCHAR(50),                 -- '1:1-31', '3:1-17' 등
  theme_type VARCHAR(20) NOT NULL,         -- 'old-testament', 'new-testament'

  -- 콘텐츠 관련
  html_content TEXT NOT NULL,              -- 생성된 HTML 콘텐츠
  components_used JSONB,                   -- 사용된 컴포넌트 목록
  color_palette JSONB,                     -- 사용된 색상 정보

  -- 메타데이터
  word_count INTEGER DEFAULT 0,
  estimated_reading_time INTEGER DEFAULT 0, -- 분 단위
  difficulty_level VARCHAR(20) DEFAULT 'intermediate',
  target_audience VARCHAR(50) DEFAULT 'general',

  -- 상태 관리
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,

  -- 타임스탬프
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **4. 업로드 파일 테이블 (b_uploaded_files)**

```sql
CREATE TABLE b_uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,         -- Supabase Storage 경로
  upload_status VARCHAR(20) NOT NULL DEFAULT 'uploaded',
  raw_content TEXT,                        -- 원본 텍스트 내용
  user_id UUID,                           -- 향후 사용자 인증 시 활용
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **5. 사용자 진도 추적 (b_reading_progress)**

```sql
CREATE TABLE b_reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session VARCHAR(100) NOT NULL,      -- 익명 사용자 추적
  bible_book_id UUID REFERENCES b_bible_books(id),
  chapter_number INTEGER,
  reading_completed BOOLEAN DEFAULT false,
  listening_completed BOOLEAN DEFAULT false,
  reading_duration INTEGER DEFAULT 0,      -- 초 단위
  listening_duration INTEGER DEFAULT 0,    -- 초 단위
  completion_date TIMESTAMP WITH TIME ZONE,
  reading_percentage DECIMAL(5,2) DEFAULT 0, -- 스크롤 기반 완료율
  highlights JSONB,                        -- 개인 하이라이트 데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **6. 태그 시스템 (b_tags)**

```sql
CREATE TABLE b_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3498db',      -- 헥스 컬러
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **7. 콘텐츠-태그 연결 (b_bible_content_tags)**

```sql
CREATE TABLE b_bible_content_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bible_content_id UUID REFERENCES b_bible_contents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES b_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bible_content_id, tag_id)
);
```

### **핵심 인덱스 설계**

```sql
-- 성능 최적화 인덱스
CREATE INDEX idx_b_contents_book_status ON b_bible_contents(bible_book_id, status);
CREATE INDEX idx_b_progress_session ON b_reading_progress(user_session, created_at DESC);
CREATE INDEX idx_b_contents_published ON b_bible_contents(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_b_contents_featured ON b_bible_contents(is_featured, view_count DESC) WHERE is_featured = true;
```

---

## 🔒 **보안 및 권한 설정**

### **개발 환경 (관대한 접근)**

```sql
-- 개발 단계: 모든 테이블에 대해 전체 접근 허용
CREATE POLICY "dev_full_access_all_tables" ON b_categories FOR ALL USING (true);
-- (모든 테이블에 동일 정책 적용)
```

### **운영 환경 (엄격한 보안)**

```sql
-- 공개 읽기 가능 데이터
CREATE POLICY "public_read_categories" ON b_categories FOR SELECT USING (true);
CREATE POLICY "public_read_bible_books" ON b_bible_books FOR SELECT USING (true);
CREATE POLICY "public_read_published_contents" ON b_bible_contents
  FOR SELECT USING (status = 'published');

-- 관리자 전용 데이터
CREATE POLICY "admin_only_manage_contents" ON b_bible_contents
  FOR ALL USING (auth.role() = 'service_role');

-- 사용자별 진도 데이터 (세션 기반)
CREATE POLICY "user_own_progress" ON b_reading_progress
  FOR ALL USING (user_session = current_setting('app.current_user_session', true));
```

### **Storage 버킷 설정**

```sql
-- 파일 업로드용 버킷
INSERT INTO storage.buckets (id, name, public) VALUES ('biblefiles', 'biblefiles', false);

-- Storage 보안 정책
CREATE POLICY "admin_upload_files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'biblefiles' AND auth.role() = 'service_role');
```

---

## 🌐 **환경 설정**

### **환경 변수 구성**

#### **개발 환경 (.env.local)**

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development

# 기능 플래그
NEXT_PUBLIC_ENABLE_TTS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true

# 로깅
NEXT_PUBLIC_LOG_LEVEL=debug
```

#### **운영 환경 (.env.production)**

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 앱 설정
NEXT_PUBLIC_APP_URL=https://bible-resource.vercel.app
NEXT_PUBLIC_APP_ENV=production

# 기능 플래그
NEXT_PUBLIC_ENABLE_TTS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true

# 로깅
NEXT_PUBLIC_LOG_LEVEL=error

# 성능 최적화
NEXT_PUBLIC_REVALIDATE_INTERVAL=3600
NEXT_PUBLIC_CDN_URL=https://cdn.bible-resource.com
```

---

## 🚀 **배포 전략**

### **CI/CD 파이프라인 (GitHub Actions)**

#### **.github/workflows/deploy.yml**

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### **Vercel 배포 설정**

#### **vercel.json**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "regions": ["icn1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/bible/:path*",
      "destination": "/api/bible/:path*"
    }
  ]
}
```

---

## 📊 **성능 최적화 전략**

### **Frontend 최적화**

```typescript
// 코드 스플리팅
const BibleReader = lazy(() => import('@/components/BibleReader'));
const HTMLEditor = lazy(() => import('@/components/HTMLEditor'));
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));

// 이미지 최적화
import Image from 'next/image';

// SEO 최적화
export const metadata: Metadata = {
  title: '성경자료실 - 차세대 디지털 성경학 플랫폼',
  description: '몰입형 성경 읽기와 풍부한 자료를 제공하는 성경학 플랫폼',
  keywords: ['성경', '성경읽기', '성경공부', '묵상', '기독교'],
};
```

### **Database 최적화**

```sql
-- 쿼리 성능 최적화 함수
CREATE OR REPLACE FUNCTION get_popular_contents(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title VARCHAR(200),
  view_count INTEGER,
  theme_type VARCHAR(20)
) AS $
BEGIN
  RETURN QUERY
  SELECT bc.id, bc.title, bc.view_count, bc.theme_type
  FROM b_bible_contents bc
  WHERE bc.status = 'published'
  ORDER BY bc.view_count DESC, bc.created_at DESC
  LIMIT limit_count;
END;
$ LANGUAGE plpgsql;

-- 캐싱을 위한 materialized view
CREATE MATERIALIZED VIEW content_stats AS
SELECT
  theme_type,
  COUNT(*) as total_count,
  AVG(view_count) as avg_views,
  MAX(updated_at) as last_updated
FROM b_bible_contents
WHERE status = 'published'
GROUP BY theme_type;

-- 자동 갱신 트리거
CREATE OR REPLACE FUNCTION refresh_content_stats()
RETURNS TRIGGER AS $
BEGIN
  REFRESH MATERIALIZED VIEW content_stats;
  RETURN NULL;
END;
$ LANGUAGE plpgsql;
```

---

## 📈 **모니터링 및 분석**

### **성능 메트릭**

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **페이지 로드 시간**: 초기 로드 < 3초, 페이지 전환 < 1초
- **API 응답 시간**: 평균 < 200ms, P95 < 500ms
- **데이터베이스 쿼리**: 평균 < 50ms, 복잡 쿼리 < 200ms

### **사용자 행동 분석**

- **읽기 완료율**: 장별 완주 비율 추적
- **기능 사용률**: TTS, 하이라이트, 모드 전환 사용 빈도
- **콘텐츠 인기도**: 조회수, 체류 시간, 공유 횟수
- **오류 추적**: JavaScript 에러, API 실패율, 404 페이지

---

## 🔄 **데이터 백업 및 복구**

### **자동 백업 전략**

```sql
-- 매일 자동 백업을 위한 Edge Function
CREATE OR REPLACE FUNCTION backup_essential_data()
RETURNS JSON AS $
DECLARE
  backup_data JSON;
BEGIN
  SELECT json_build_object(
    'contents', (SELECT json_agg(row_to_json(bc)) FROM b_bible_contents bc WHERE bc.status = 'published'),
    'categories', (SELECT json_agg(row_to_json(cat)) FROM b_categories cat),
    'books', (SELECT json_agg(row_to_json(bb)) FROM b_bible_books bb),
    'timestamp', NOW()
  ) INTO backup_data;

  RETURN backup_data;
END;
$ LANGUAGE plpgsql;
```

### **재해 복구 계획**

1. **일일 백업**: Supabase 자동 백업 + 커스텀 데이터 덤프
2. **버전 관리**: Git을 통한 코드 버전 관리
3. **다중 환경**: Dev/Staging/Production 분리
4. **롤백 전략**: Vercel deployment rollback + DB 포인트 복구

---

## 📝 **개발 가이드라인**

### **코딩 컨벤션**

```typescript
// 파일 명명 규칙
components /
  BibleReader / // PascalCase for components
  pages /
  bible -
  reading / // kebab-case for pages
    utils /
    formatVerse.ts; // camelCase for utilities
types / bible.types.ts; // camelCase with .types suffix

// 컴포넌트 구조
interface BibleReaderProps {
  bookId: string;
  chapterNumber: number;
  initialMode?: ReadingMode;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  bookId,
  chapterNumber,
  initialMode = 'verse',
}) => {
  // 컴포넌트 로직
};
```

### **Git 워크플로우**

```bash
# 브랜치 전략
main                 # 운영 배포 브랜치
develop             # 개발 통합 브랜치
feature/reading-ui  # 기능별 브랜치
hotfix/security-fix # 긴급 수정 브랜치

# 커밋 메시지 규칙
feat: Add TTS functionality to Bible reader
fix: Resolve highlight state persistence issue
docs: Update architecture documentation
style: Apply consistent button styling
refactor: Optimize database queries
test: Add unit tests for progress tracking
```

---

## ✅ **완료 체크리스트**

### **아키텍처 기반 구축**

- [ ] Next.js 14+ 프로젝트 초기화
- [ ] Supabase 프로젝트 생성 및 연결
- [ ] TypeScript 및 Tailwind CSS 설정
- [ ] 7개 핵심 테이블 생성 및 시드 데이터
- [ ] RLS 보안 정책 설정
- [ ] Vercel 배포 환경 구성

### **개발 환경 설정**

- [ ] ESLint + Prettier 설정
- [ ] Husky + lint-staged 설정
- [ ] GitHub Actions CI/CD 파이프라인
- [ ] 환경 변수 설정 (dev/prod)
- [ ] Supabase CLI 로컬 개발 환경

### **모니터링 준비**

- [ ] Vercel Analytics 연동
- [ ] 에러 추적 시스템 구축
- [ ] 성능 메트릭 대시보드
- [ ] 백업 자동화 스크립트

---

## 🎯 **다음 단계**

1. **05-공통시스템-PRD.md** 작성 (디자인시스템, 컴포넌트 라이브러리)
2. **02-성경읽기-PRD.md** 작성 (핵심 MVP 기능)
3. **04-데이터관리-PRD.md** 작성 (관리자 도구)
4. **03-성경자료실-PRD.md** 작성 (고급 편집 기능)
5. **01-HOME-PRD.md** 작성 (통합 대시보드)

---

**📋 문서 상태**: ✅ **완료** - 전체 아키텍처 설계 확정  
**👥 검토자**: 시니어 개발자, 시스템 아키텍트  
**📅 다음 리뷰**: 공통시스템 PRD 작성 후
