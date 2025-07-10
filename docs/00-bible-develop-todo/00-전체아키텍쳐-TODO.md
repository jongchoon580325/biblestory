# 전체 아키텍처 실전 TO DO 리스트

1. **Next.js 14+ 프로젝트 초기화 및 기본 구조 세팅**

- [x] Next.js 14+ 프로젝트 생성
- [x] TypeScript 설정
- [x] Tailwind CSS 설정
- [x] 폴더 구조 설계 및 생성
- [x] 글로벌 스타일(globals.css) 작성
- [x] 환경별 설정 파일(.env) 분리
- [x] dev 서버 및 빌드 정상 기동 확인
- [x] 환경별 변수 적용 검증

2. **Supabase 프로젝트 생성 및 연결**

- [x] Supabase 콘솔에서 프로젝트 생성
- [x] API URL/Key 발급 및 .env.local 적용
- [x] @supabase/supabase-js 연동
- [x] 연결 테스트 및 쿼리 확인

3. **7개 핵심 테이블 및 시드 데이터 생성**

- [x] b_categories 테이블 생성
- [x] b_bible_books 테이블 생성
- [x] b_bible_contents 테이블 생성
- [x] b_uploaded_files 테이블 생성
- [x] b_reading_progress 테이블 생성
- [x] b_tags 테이블 생성
- [x] b_bible_content_tags 테이블 생성
- [x] 각 테이블 시드 데이터 삽입
- [x] 외래키/인덱스/정책 적용
- [x] 쿼리 결과 확인

4. **RLS(행 수준 보안) 및 정책 적용**

- [x] 운영/개발 환경별 RLS 정책 작성
- [x] 공개/관리자/사용자별 접근 정책 적용
- [x] Storage 버킷 정책 적용
- [x] 정책별 접근 테스트
- [x] 비인가 접근 차단 검증
- [x] 관리자/사용자별 권한 분리 검증

5. **코드 품질 도구(ESLint, Prettier, Husky, lint-staged) 설정**

- [x] eslint 설치 및 설정
- [x] prettier 설치 및 설정
- [x] husky, lint-staged 설치 및 pre-commit hook 적용
- [x] lint, format 정상 동작 확인
- [x] 코드 일관성 유지 검증

6. **CI/CD 파이프라인(GitHub Actions, Vercel) 구축**

- [ ] .github/workflows/deploy.yml 작성
- [ ] Vercel 프로젝트 연동
- [ ] 환경별 배포 테스트
- [ ] PR/Push 시 자동 빌드·배포 확인
- [ ] 배포 이력 및 실패 시 알림 동작 검증

7. **프론트엔드 주요 기능 개발 (성경읽기, 자료실, 데이터관리, HOME)**

- [ ] 성경읽기 엔진 컴포넌트 개발
- [ ] 자료실 CRUD 기능 개발
- [ ] 데이터관리 대시보드 개발
- [ ] HOME(분석) 화면 개발
- [ ] 상태관리(zustand) 연동
- [ ] 폼(react-hook-form) 연동
- [ ] TTS, 차트 등 특화 기능 연동
- [ ] 각 기능별 화면 렌더링 및 동작 검증

8. **API/Edge Function 구현 및 연동**

- [ ] /api/bible API Route 구현
- [ ] /api/content API Route 구현
- [ ] /api/progress API Route 구현
- [ ] /api/admin API Route 구현
- [ ] Supabase Edge Function 작성 및 배포
- [ ] 프론트엔드와 연동 테스트

9. **성능 최적화(코드 스플리팅, 이미지, 쿼리, 캐싱)**

- [ ] React.lazy 코드 스플리팅 적용
- [ ] next/image 이미지 최적화 적용
- [ ] DB 인덱스/함수/뷰 최적화
- [ ] API 응답 최적화 및 캐싱 전략 적용
- [ ] LCP/FID/CLS, API/쿼리 응답, 페이지 로드/전환 속도 기준 충족 검증

10. **모니터링 및 에러 추적 시스템 구축**

- [ ] Vercel Analytics 연동
- [ ] JS 에러/404 추적 시스템 구축
- [ ] 사용자 행동/기능 사용률 분석
- [ ] 분석/에러/사용자 데이터 수집 및 대시보드 확인

11. **백업 및 재해 복구 자동화**

- [ ] Supabase 자동 백업 설정
- [ ] Edge Function 기반 커스텀 백업/복구 함수 작성
- [ ] 롤백/복구 스크립트 작성
- [ ] 다중 환경 분리 및 복구 테스트
- [ ] 일일 백업, 복구 테스트, 롤백 시나리오 검증

12. **문서화 및 README/개발가이드 정비**

- [ ] README.md 최신화
- [ ] docs/ 디렉토리 내 상세 문서 작성
- [ ] API/DB/배포/백업 가이드 작성
- [ ] 신규 개발자 온보딩 가능 수준의 가이드 제공

---

- 각 항목은 선행/후행 관계, 의존성, 검증 기준이 명확하며, 실제 개발자가 바로 실행할 수 있도록 설계됨.
- 세부 SQL, 정책, 예시 등은 PRD 문서(00-전체아키텍쳐-PRD.md) 참조.
