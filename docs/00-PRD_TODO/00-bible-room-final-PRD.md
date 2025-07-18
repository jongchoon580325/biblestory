# Bible Room Study - 웹앱 개발 최종 문서

## 📋 프로젝트 개요

**프로젝트명**: Bible Room Study  
**개발자**: 나종춘 (najongchoon@gmail.com)  
**기술 스택**: Next.js 14+ (App Router) + Lucide Icons + Supabase  
**목적**: 구약/신약 성경공부 자료의 체계적 관리 및 학습을 위한 웹 애플리케이션

---

## 🎯 핵심 요구사항

### 기술 아키텍처
```
Frontend: Next.js 14+ (App Router, TypeScript)
UI Library: Tailwind CSS + Lucide Icons  
Database: Supabase (PostgreSQL)
Storage: Supabase Storage (파일 업로드)
Authentication: 패스워드 기반 관리자 인증 (gppc!!5096)
Theme: 다크모드 전용 (#292828)
```

### 프로젝트 설정
- **프로젝트 너비**: 중앙정렬, 1024px 고정
- **컬러 스키마**: 다크모드만 지원 (라이트모드 없음)
- **가독성**: 성경공부에 최적화된 컬러 팔레트
- **메뉴 구성**: HOME, DATA (라우팅)
- **Footer**: "Your Personal Bible Room Study, Built with ❤️ by 나종춘 | najongchoon@gmail.com"

---

## 🏗️ 페이지별 상세 기능 명세

### HOME 페이지

#### 레이아웃 구조
```
1. 헤더 (타이틀 + 설명)
2. 탭 네비게이션 (구약/신약)
3. 통계 카드 (2개 - 총 책수, 저장된 자료)
4. 성경 책 그리드 (5열 고정)
5. 플로팅 액션 버튼 (위로가기, 전체화면)
```

#### 구약/신약 탭 시스템
- **구약**: 39권 → 5×8 그리드 배열
- **신약**: 27권 → 5×6 그리드 배열
- **통계 표시**: 각 탭별 동적 데이터 표시

#### 책 카드 기능
- **심플 디자인**: 책명 + 자료 개수만 표시
- **인터랙션**: 
  - 호버 시 컬러 변환 애니메이션
  - 폭죽 파티클 효과 (8개 랜덤 파티클)
  - 선택 상태 시각적 표시
- **상세 페이지 기능** (개발 예정):
  - 완벽한 HTML 렌더링
  - 전체화면 모드
  - 위로가기 버튼
  - 페이지네이션 + 실시간 검색/필터링
  - 소스 편집기 (textarea) + 실시간 미리보기

### DATA 페이지 (관리자 전용)

#### 접근 제어
- **인증 방식**: 패스워드 입력 (초기값: `gppc!!5096`)
- **권한**: 관리자만 접근 가능

#### 레이아웃 구조 (5:5 그리드)
```
좌측 영역:
├── 상단: 자료등록
└── 하단: 카테고리등록

우측 영역:
├── 상단: 데이터/카테고리 내보내기/가져오기
└── 하단: 데이터/카테고리 초기화
```

#### 자료 관리 기능
- **파일 업로드**: 
  - 드래그앤드롭 + 다중선택 지원
  - HTML 파일 전용
  - 권별/책별 자동 분류 저장
- **카테고리 관리**:
  - 구약/신약 분류
  - 각 책별 세부 카테고리
- **백업/복원**:
  - 데이터 내보내기: ZIP (JSON 메타데이터 + HTML 파일)
  - 카테고리 내보내기: JSON 형태
  - 데이터/카테고리 초기화 기능

#### 업로드 프로세스
```
1. 권명 선택 (구약/신약)
2. 책명 선택 (창세기, 출애굽기, ... 마태복음, 마가복음, ...)
3. 파일 업로드 (드래그앤드롭/다중선택)
4. 자동 분류 저장 (HOME 페이지에서 확인 가능)
```

---

## 🗄️ 데이터베이스 설계

### Supabase 설정
```sql
-- 데이터베이스명: 테이블 접두어 'b_' 사용
-- 스토리지 버킷명: 'biblefiles'
-- RLS 정책: 개발모드 (All Open)
```

### 테이블 구조
```sql
-- 카테고리 테이블 (구약/신약)
CREATE TABLE b_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- '구약', '신약'
  created_at TIMESTAMP DEFAULT NOW()
);

-- 성경 책 테이블
CREATE TABLE b_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES b_categories(id),
  name VARCHAR(100) NOT NULL, -- '창세기', '출애굽기' 등
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 자료 테이블
CREATE TABLE b_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES b_books(id),
  title VARCHAR(200) NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage 경로
  content TEXT, -- HTML 내용 (선택사항)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 관리자 인증 테이블
CREATE TABLE b_admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 스토리지 구조
```
biblefiles/
├── old_testament/
│   ├── genesis/
│   ├── exodus/
│   └── ...
└── new_testament/
    ├── matthew/
    ├── mark/
    └── ...
```

---

## 🎨 UI/UX 디자인 가이드라인

### 다크모드 컬러 팔레트
```css
/* 기본 색상 */
Primary Background: #292828
Secondary Background: slate-800/50
Border Colors: slate-700/50

/* 액센트 색상 */
Blue Gradient: from-blue-500 to-blue-600
Purple Gradient: from-purple-500 to-purple-600
Success: from-green-500 to-green-600

/* 텍스트 */
Primary Text: white
Secondary Text: slate-400
Accent Text: blue-400, purple-400
```

### 컴포넌트 디자인 시스템
- **Glassmorphism**: 반투명 유리 질감 효과
- **Gradient Overlays**: 미묘한 색상 그라데이션
- **Smooth Animations**: 0.3초 부드러운 전환 효과
- **Card Elevation**: 호버 시 3D 상승 효과
- **Particle Effects**: 폭죽 애니메이션 (0.6초 지속)

### 반응형 디자인
- **데스크톱**: 1024px 고정 너비
- **태블릿**: 적응형 그리드 시스템
- **모바일**: 단일 열 스택 레이아웃

---

## 🚀 개발 단계별 로드맵

### Phase 1: 기본 인프라 구축
1. **프로젝트 초기화**
   - Next.js 14 + TypeScript + Tailwind CSS 설정
   - Lucide Icons 설치 및 설정
   - 폴더 구조 생성

2. **레이아웃 시스템**
   - 다크모드 전용 레이아웃 구현
   - Navigation 컴포넌트 개발
   - Footer 컴포넌트 개발
   - 라우팅 구조 설정 (HOME, DATA)

3. **Supabase 연결**
   - 환경변수 설정
   - 클라이언트 초기화
   - 연결 상태 확인 로직 구현

### Phase 2: HOME 페이지 개발
1. **기본 레이아웃**
   - 헤더 섹션 구현
   - 탭 네비게이션 시스템
   - 통계 카드 (2개) 구현

2. **성경 책 그리드**
   - 5열 고정 그리드 시스템
   - 책 카드 컴포넌트 개발
   - 선택 상태 관리

3. **인터랙션 효과**
   - 호버 애니메이션
   - 폭죽 파티클 시스템
   - 플로팅 액션 버튼

### Phase 3: 데이터베이스 연동
1. **테이블 생성**
   - SQL 스크립트 실행
   - RLS 정책 설정
   - 기본 데이터 삽입

2. **API 래퍼 함수**
   - CRUD 연산 함수
   - 파일 업로드 함수
   - 에러 핸들링

3. **실제 데이터 연동**
   - 책 목록 동적 로딩
   - 통계 데이터 계산
   - 검색/필터링 구현

### Phase 4: DATA 페이지 개발
1. **인증 시스템**
   - 패스워드 입력 모달
   - 세션 관리
   - 권한 체크

2. **자료 관리 기능**
   - 파일 업로드 (드래그앤드롭)
   - 카테고리 관리
   - CRUD 인터페이스

3. **백업/복원 시스템**
   - ZIP 파일 생성/추출
   - JSON 내보내기/가져오기
   - 데이터 초기화

### Phase 5: 고급 기능 및 최적화
1. **상세 페이지**
   - HTML 렌더링 엔진
   - 전체화면 모드
   - 소스 편집기 + 실시간 미리보기

2. **성능 최적화**
   - 이미지 최적화 (Next.js Image)
   - 코드 스플리팅
   - 캐싱 전략

3. **사용자 경험 개선**
   - 로딩 스피너
   - 에러 바운더리
   - 토스트 알림

---

## Supabase MCP 기반 백엔드 구축 우선순위

1. **Supabase 프로젝트 및 환경변수 발급**
   - Supabase 프로젝트 생성 및 대시보드 접근
   - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 등 환경변수 발급 및 .env.local에 저장
   - *이유: 프론트엔드와의 연결 및 모든 리소스 관리의 출발점*

2. **스토리지 버킷(biblefiles) 생성**
   - biblefiles 버킷 및 old_testament/new_testament 하위 폴더 구조 생성
   - *이유: 자료 업로드/다운로드 기능 구현을 위한 파일 저장소 선구축*

3. **DB 테이블 및 스키마 생성**
   - b_categories, b_books, b_materials, b_admin 등 PRD 명세 기반 SQL 실행
   - 외래키, 기본값, 인덱스 등 제약조건 포함
   - *이유: 데이터 구조 확정 및 CRUD, 인증 등 핵심 기능 구현 기반 마련*

4. **Row Level Security(RLS) 및 인증 정책 설정**
   - 개발 단계에서는 All Open, 운영 전환 시 권한별 정책 적용
   - b_admin 테이블 기반 관리자 인증 정책 설정
   - *이유: 데이터 보안 및 접근 제어, 관리자 기능 분리*

5. **테스트용 더미 데이터/파일 삽입(선택)**
   - 카테고리, 책, 자료 등 최소 1~2개 샘플 데이터 삽입
   - 스토리지에 샘플 파일 업로드
   - *이유: 프론트엔드 연동 및 UI/UX 개발 시 실제 데이터 기반 테스트 가능*

6. **API/CRUD 래퍼 함수 및 마이그레이션 관리(선택)**
   - Supabase Function/Edge Function, 자동화 스크립트 등 활용
   - *이유: 반복 작업 자동화, 구조 변경 이력 관리, 확장성 확보*

---

## 🔧 기술적 구현 세부사항

### 필수 패키지 설치
```bash
# 기본 의존성
npm install lucide-react @supabase/supabase-js

# 개발 의존성
npm install -D tailwindcss @types/node typescript

# 추가 기능 (선택사항)
npm install framer-motion react-dropzone
```

### 환경변수 설정 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD_HASH=hashed_password
```

### 폴더 구조
```
src/
├── app/
│   ├── layout.tsx           # 전역 레이아웃
│   ├── page.tsx            # HOME 페이지
│   ├── data/
│   │   └── page.tsx        # DATA 페이지 (관리자)
│   └── globals.css         # 전역 스타일
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx  # 네비게이션
│   │   └── Footer.tsx      # 푸터
│   ├── ui/
│   │   ├── Card.tsx        # 카드 컴포넌트
│   │   ├── Button.tsx      # 버튼 컴포넌트
│   │   └── Modal.tsx       # 모달 컴포넌트
│   └── features/
│       ├── BookGrid.tsx    # 책 그리드
│       ├── TabStats.tsx    # 통계 카드
│       └── FileUpload.tsx  # 파일 업로드
├── hooks/
│   ├── useSupabase.ts      # Supabase 훅
│   └── useAuth.ts          # 인증 훅
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   └── utils.ts            # 유틸리티 함수
└── types/
    └── index.ts            # TypeScript 타입 정의
```

---

## 🛡️ 보안 및 성능 고려사항

### 보안
- **입력 검증**: HTML 콘텐츠 XSS 방지
- **파일 검증**: 업로드 파일 타입/크기 제한
- **인증**: 관리자 세션 보안 관리
- **RLS**: Supabase Row Level Security 적용

### 성능
- **이미지 최적화**: Next.js Image 컴포넌트 활용
- **코드 스플리팅**: 페이지별 동적 임포트
- **캐싱**: Supabase 쿼리 결과 캐싱
- **번들 최적화**: Tree shaking 및 압축

### 접근성
- **키보드 네비게이션**: 모든 기능 키보드 접근 가능
- **스크린 리더**: 의미론적 HTML 구조
- **색상 대비**: WCAG 2.1 AA 가이드라인 준수
- **포커스 관리**: 명확한 포커스 표시

---

## 📊 성경 데이터 구조

### 구약 39권
```
모세오경: 창세기, 출애굽기, 레위기, 민수기, 신명기
역사서: 여호수아, 사사기, 룻기, 사무엘상, 사무엘하, 열왕기상, 열왕기하, 역대상, 역대하, 에스라, 느헤미야, 에스더
시가서: 욥기, 시편, 잠언, 전도서, 아가
대선지서: 이사야, 예레미야, 예레미야애가, 에스겔, 다니엘
소선지서: 호세아, 요엘, 아모스, 오바댜, 요나, 미가, 나훔, 하박국, 스바냐, 학개, 스가랴, 말라기
```

### 신약 27권
```
복음서: 마태복음, 마가복음, 누가복음, 요한복음
역사서: 사도행전
바울서신: 로마서, 고린도전서, 고린도후서, 갈라디아서, 에베소서, 빌립보서, 골로새서, 데살로니가전서, 데살로니가후서, 디모데전서, 디모데후서, 디도서, 빌레몬서
일반서신: 히브리서, 야고보서, 베드로전서, 베드로후서, 요한일서, 요한이서, 요한삼서, 유다서
예언서: 요한계시록
```

---

## 🎯 개발 우선순위 및 마일스톤

### Sprint 1 (주차 1-2): 기반 구조
- [ ] 프로젝트 초기화 및 환경 설정
- [ ] 기본 레이아웃 및 네비게이션 구현
- [ ] Supabase 연결 및 데이터베이스 설계
- [ ] HOME 페이지 기본 UI 구현

### Sprint 2 (주차 3-4): 핵심 기능
- [ ] 성경 책 그리드 시스템 완성
- [ ] 탭 네비게이션 및 통계 카드 구현
- [ ] 인터랙션 효과 (호버, 애니메이션) 추가
- [ ] 데이터베이스 실제 연동

### Sprint 3 (주차 5-6): 관리 기능
- [ ] DATA 페이지 인증 시스템 구현
- [ ] 파일 업로드 및 관리 기능
- [ ] 백업/복원 시스템 개발
- [ ] CRUD 인터페이스 완성

### Sprint 4 (주차 7-8): 고급 기능
- [ ] 상세 페이지 및 뷰어 구현
- [ ] 검색/필터링 시스템
- [ ] 소스 편집기 및 실시간 미리보기
- [ ] 성능 최적화 및 테스트

### Sprint 5 (주차 9-10): 마무리
- [ ] 사용자 테스트 및 피드백 반영
- [ ] 버그 수정 및 안정화
- [ ] 문서화 및 배포 준비
- [ ] 최종 검토 및 출시

---

## 📈 향후 확장 계획

### 단기 계획 (3개월)
- 모바일 앱 개발 (React Native)
- 오프라인 모드 지원 (PWA)
- 사용자 계정 시스템
- 학습 진도 추적 기능

### 중기 계획 (6개월)
- AI 기반 성경 구절 추천
- 음성 녹음/재생 기능
- 그룹 스터디 기능
- 클라우드 동기화

### 장기 계획 (1년)
- 다국어 지원
- API 서비스 제공
- 교회/기관용 버전
- 고급 분석 도구

---

## 📞 연락처 및 지원

**개발자**: 나종춘  
**이메일**: najongchoon@gmail.com  
**프로젝트**: Bible Room Study  
**라이선스**: MIT License  

**기술 지원**: 개발 관련 문의 및 피드백 환영  
**협업 문의**: 교회 및 기관 맞춤 개발 상담 가능

---

## 📚 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

*"말씀을 깊이 있게 공부하고 나누는 디지털 성경 공부방"*

**Bible Room Study** - 여러분의 개인적인 성경 공부 공간을 만들어 갑니다.