# 카테고리 관리 시스템 1차 설계안 (Bible 프로젝트 적용)

## Next.js + Supabase 기반 성경 카테고리 관리 PRD
## 본 설계안은 bible/03/03-bible-supabase/docs/01-uitl/카테고리-개발-supabase-PRD.md 문서를 참조한다.
---

## 1. 개요 및 목적
- 성경 데이터(구약/신약/책/장 등) 계층적 카테고리 관리
- Next.js(App Router) + Supabase(PostgreSQL, RLS, Realtime) 기반
- 실시간 동기화, 타입 안전성, 확장성, UX 최적화

## 2. 데이터베이스 설계
- 테이블: `b_categories` (성경 카테고리)
- 주요 필드: id, name, type('group'|'item'), parent_id, order_index, slug, metadata, is_active, user_id, created_at, updated_at
- ENUM: category_type ('group', 'item')
- RLS: 개발모드(전체 허용), 프로덕션(사용자별 격리)

## 3. 타입 및 스키마
- Category, CategoryInsert, CategoryUpdate, CategoryTreeNode 등 TypeScript 타입 정의
- Zod 스키마: categoryFormSchema, bulkCreateSchema, dragDropSchema 등

## 4. API 설계
- RESTful 구조: /api/b-categories (목록, 생성, 수정, 삭제, 일괄생성, 순서변경 등)
- 예시: GET/POST /api/b-categories, POST /api/b-categories/bulk, POST /api/b-categories/reorder

## 5. 상태관리 및 동기화
- React Query + Zustand 조합
- useCategories, useCategoryStore, useRealtimeCategories 훅 설계
- 실시간 동기화: Supabase Realtime 채널 활용

## 6. 컴포넌트 구조
- CategoryManager (최상위)
  - CategoryTree (트리/리스트)
  - CategoryForm (단일/다중 입력)
  - CategoryActions (추가/삭제/정렬)
  - Modals (생성/수정/삭제/벌크 등)
- UI: Tailwind CSS, shadcn/ui, Lucide 아이콘, 다크모드

## 7. 폼/검증/UX
- React Hook Form + Zod 통합
- 단일/다중 입력, 자동 성경책 입력, 드래그앤드롭 지원
- 에러/로딩/빈상태/접근성/반응형 UI

## 8. 보안/테스트/확장성
- 인증/권한: Supabase Auth, RLS, 미들웨어
- 입력 검증: Zod, DOMPurify
- 테스트: 단위/컴포넌트/E2E (Jest, RTL, Playwright)
- 확장성: 다국어, 권한, 템플릿, 대량입출력, 통계, API 공개 등

## 9. 배포/환경/모니터링
- .env, next.config, Sentry, Upstash, CDN 등

---

> 본 설계안은 bible/03/03-bible-supabase/docs/01-uitl/카테고리-개발-supabase-PRD.md 문서를 배경으로 본 프로젝트의 성경 카테고리 관리 시스템 PRD로 제작하였으며, 실제 구현 시 상세 구조/컴포넌트/상태관리/테스트/보안 등은 첨부 PRD : 카테고리-개발-supabase-PRD.md를 기준으로 단계별 확장/구체화합니다. 