# Bible FileUpload → Supabase 저장 로직 PRD

## 1. 목적
- 성경자료 등록 섹션(FileUpload 컴포넌트)에서 업로드되는 파일과 입력 정보를 Supabase Table 및 Storage에 일관성 있게 저장하는 로직의 상세 설계 및 구현 기준을 정의한다.

## 2. 입력 항목 및 업로드 정보
- **권명(구약/신약)**: 상위 그룹 (old_testament, new_testament)
- **책명(창세기, 마태복음 등)**: 66권 중 하나 (각각 폴더로 매핑)
- **장(숫자)**: 1, 2, 3, ... (파일명 또는 메타데이터로 사용)
- **업로드 파일명**: 예) 00-genesis_03.html

## 3. Supabase 구조
### 1) 테이블
- **b_categories**: 66권(구약/신약) 전체 책 정보 (id, name, parent_id 등)
- **b_materials**: 업로드된 자료(파일) 메타데이터 저장
  - 컬럼 예시: id, category_id(책), chapter(장), file_name, storage_path, created_at 등

### 2) 스토리지
- **bucket: biblefiles**
  - old_testament/
    - genesis/
      - 00-genesis_03.html
  - new_testament/
    - matthew/
      - 00-matthew_01.html

## 4. 저장 로직 상세 흐름
1. **입력값 선택/입력**
   - 권명(구약/신약) → 책명 → 장 → 파일 선택
2. **스토리지 업로드**
   - 경로: `biblefiles/{old_testament|new_testament}/{책명영문}/00-{책명영문}_{장번호}.html`
   - 예: `biblefiles/old_testament/genesis/00-genesis_03.html`
3. **메타데이터 테이블 저장**
   - 테이블: `b_materials`
   - 저장 정보:
     - category_id: 책명에 해당하는 b_categories.id
     - chapter: 장 번호
     - file_name: 업로드 파일명
     - storage_path: 실제 스토리지 경로
     - created_at: 업로드 시각 등
4. **b_categories는 책 구조 관리, b_materials는 자료(파일) 관리**

## 5. 예시 시나리오
- 사용자가 '구약', '창세기', '3장', '00-genesis_03.html' 파일 업로드 시:
  - Storage: `biblefiles/old_testament/genesis/00-genesis_03.html`에 저장
  - b_materials:
    - category_id: (창세기 id)
    - chapter: 3
    - file_name: 00-genesis_03.html
    - storage_path: biblefiles/old_testament/genesis/00-genesis_03.html
    - created_at: (업로드 시각)

## 6. 확장 및 관리 고려사항
- 파일명/경로 규칙은 일관성 유지(책명 영문 변환, 장번호 2자리 등)
- 업로드 성공 후 b_materials에 insert, 실패 시 롤백/에러 처리
- 추후 상세페이지/미리보기/편집 등에서 이 메타데이터를 활용
- 중복 업로드, 덮어쓰기, 삭제 등 예외 처리 정책 명확화
- Supabase Storage와 Table 간 동기화 유지

## 7. 참고
- 기존 b_categories, biblefiles 구조와 연동
- 확장성, 검색, 관리, UX를 고려한 설계 

## 8. 세부 개발 절차(Task)

1. **입력값 검증 및 b_categories 연동 구현**
   - 목적: FileUpload 컴포넌트에서 권명, 책명, 장, 파일명 입력값을 유효성 검증하고, 책명에 해당하는 b_categories.id를 조회
   - 주요 구현: 입력값 유효성 체크, Supabase 쿼리로 책명 id 조회, 에러 발생 시 UI 피드백(토스트 등)
   - 검증 기준: 모든 입력값이 유효하지 않으면 업로드 불가, 책명 id가 정확히 조회되어야 하며, 에러 발생 시 UI에 즉시 표시

2. **Supabase Storage 파일 업로드 경로 및 규칙 구현**
   - 목적: 입력값에 따라 biblefiles/{old|new}_testament/{book}/00-{book}_{chapter}.html 경로로 파일 업로드
   - 주요 구현: 영문 폴더명/파일명 생성 유틸리티, Supabase Storage API 업로드, 업로드 성공/실패 결과 UI 반영
   - 검증 기준: 파일이 지정 경로에 정상적으로 업로드되고, 업로드 결과가 UI에 표시되어야 함

3. **b_materials 테이블 메타데이터 저장 로직 구현**
   - 목적: 파일 업로드 성공 시 b_materials 테이블에 메타데이터(category_id, chapter, file_name, storage_path, created_at 등) 저장
   - 주요 구현: 업로드 성공 후 Supabase insert 쿼리, 중복/덮어쓰기 정책 적용, 저장 실패 시 롤백/에러 처리
   - 검증 기준: 메타데이터가 b_materials에 정확히 저장되고, 중복/덮어쓰기 정책이 적용되어야 함

4. **업로드 예외처리 및 UI/UX 피드백 강화**
   - 목적: 업로드 실패, 중복, 덮어쓰기, 네트워크 오류 등 다양한 예외 상황에 대한 처리와 사용자 피드백 강화
   - 주요 구현: try-catch 및 에러 메시지 처리, 업로드/저장 실패 시 UI 피드백, 상태별 토스트/상태 표시 구현
   - 검증 기준: 모든 예외 상황에서 사용자에게 명확한 피드백이 제공되고, UI/UX가 일관성 있게 동작해야 함

5. **확장성 및 관리 정책 문서화**
   - 목적: 파일명/경로 규칙, 중복/덮어쓰기/삭제 정책, Table-Storage 동기화, 확장성(검색, 미리보기 등) 관리 방안 문서화
   - 주요 구현: bible-fileupload-PRD.md에 정책/규칙/확장 방안 추가, 실제 구현과 문서 내용 일치 지속 관리
   - 검증 기준: 문서와 실제 구현이 일치하며, 확장/유지보수/관리 정책이 명확히 정의되어야 함 