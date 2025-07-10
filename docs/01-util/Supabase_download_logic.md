# Supabase Storage 파일 다운로드 로직 (실제 다운로드 폴더 저장)

이 문서는 Supabase Storage에서 파일을 다운로드할 때 브라우저 미리보기 없이 실제로 사용자의 다운로드 폴더에 저장하는 가장 확실한 방법을 안내합니다.

---

## 핵심 원리

- Supabase Storage의 `.download()` 메서드로 파일 데이터를 Blob 형태로 받아옴
- Blob 데이터를 `URL.createObjectURL()`로 변환
- 동적으로 `<a download>` 태그를 생성해 클릭 이벤트를 트리거
- 다운로드 완료 후 메모리 정리

---

## 예시 코드 (React 컴포넌트)

```typescript
import { supabase } from '@/lib/supabase';

// 파일 다운로드 핸들러
const handleFileDownload = async (fileName: string) => {
  const filePath = `uploads/${fileName}`; // 파일 경로 예시
  const { data, error } = await supabase.storage.from('biblefiles').download(filePath);
  if (error) {
    alert('다운로드 실패: ' + error.message);
    return;
  }
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
```

---

## 사용 예시 (컴포넌트 내)

```typescript
<ul>
  {fileList.map((name) => (
    <li key={name}>
      {name}
      <button onClick={() => handleFileDownload(name)} style={{ marginLeft: 8 }}>다운로드</button>
    </li>
  ))}
</ul>
```

---

## 주의사항 및 팁

- 반드시 `.download()`로 Blob 데이터를 받아야 브라우저 미리보기가 아닌 실제 다운로드가 보장됩니다.
- 파일명, 경로, 버킷명을 정확히 지정해야 합니다.
- 대용량 파일도 동일하게 동작하지만, 네트워크 환경에 따라 다운로드 시간이 달라질 수 있습니다.
- 다운로드 완료 후 `URL.revokeObjectURL(url)`로 메모리 누수를 방지하세요.
- 에러 발생 시 사용자에게 안내 메시지를 보여주는 것이 좋습니다.

---

## 참고

- Supabase 공식 문서: [https://supabase.com/docs/guides/storage/file-downloads](https://supabase.com/docs/guides/storage/file-downloads)
- 이 방식은 모든 브라우저(Chrome, Edge, Safari 등)에서 동작합니다.

---

**이 문서를 참고하여 테이블 등 다양한 곳에서 파일 다운로드 기능을 구현할 수 있습니다.**
