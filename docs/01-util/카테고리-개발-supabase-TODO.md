# 카테고리 관리(좌) 섹션 - Supabase 기반 구현 세부 TODO

## 1. 데이터베이스/타입/스키마 준비
  - [x] Supabase b_categories 테이블/ENUM/인덱스/RLS 정책 적용
  - [x] TypeScript 타입(Category, CategoryInsert, CategoryUpdate 등) 정의
  - [x] Zod 스키마(categoryFormSchema, bulkCreateSchema, dragDropSchema 등) 작성

## 2. API 라우트 구현 (Next.js App Router)
  - [x] /api/b-categories (GET/POST/PATCH/DELETE)
  - [x] /api/b-categories/bulk (다중 입력)
  - [x] /api/b-categories/reorder (드래그앤드롭)
  - [x] API 입력 검증, 에러/권한 처리, 응답 포맷 통일

## 3. 상태관리/동기화
  - [x] useCategories (React Query + Zustand) 훅 구현
  - [x] useCategoryStore (Zustand) - 확장/최적화
  - [x] useRealtimeCategories (Supabase Realtime) 실시간 동기화

## 4. 카테고리 관리 UI 컴포넌트
  - [x] CategoryManager (최상위)
  - [x] CategoryTree (트리/리스트)
  - [x] CategoryGroup/CategoryItem (그룹/항목)
  - [x] CategoryForm (단일/다중 입력)
  - [x] CategoryActions (추가/삭제/정렬)
  - [x] Modals (생성/수정/삭제/벌크)
  - [x] EmptyState/로딩/에러/피드백 UI
  - [x] 드래그앤드롭(@hello-pangea/dnd) 적용
  - [x] 다크모드, Lucide 아이콘, 반응형/접근성

## 5. 폼/검증/UX
  - [ ] React Hook Form + Zod 통합
  - [ ] 단일/다중 입력, 자동 성경책 입력, 드래그앤드롭 지원
  - [ ] 에러/로딩/빈상태/접근성/반응형 UI

## 6. 보안/테스트/확장성
  - [ ] Supabase Auth/RLS/미들웨어 인증/권한
  - [ ] 입력 검증(DOMPurify 등)
  - [ ] 단위/컴포넌트/E2E 테스트(Jest, RTL, Playwright)
  - [ ] 확장성(다국어, 권한, 템플릿, 대량입출력 등)

## 7. 성능/최적화/모니터링
  - [ ] React Query 캐싱/옵티미스틱 업데이트
  - [ ] 컴포넌트 메모이제이션/코드스플리팅
  - [ ] Sentry 등 에러/성능 모니터링

## 8. 문서화/커밋/배포
  - [ ] README/PRD/코드/테스트 문서화
  - [ ] 커밋 메시지/히스토리/브랜치 전략 준수
  - [ ] .env/next.config 등 환경설정/보안 점검

---

> 각 항목 완료 시 production build 및 테스트 필수. 빌드/린트 오류 발생 시 즉시 수정 후 재확인. 모든 단계는 PRD/가이드라인/보안정책을 엄격히 준수할 것. 