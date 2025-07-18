import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export type UploadResult = {
  fileName: string;
  success: boolean;
  error?: string;
};

// 영문 폴더명/파일명 변환 유틸 (간단 변환, 실제 서비스는 slugify 등 활용 권장)
function toSlug(kor: string) {
  const map: Record<string, string> = {
    '창세기': 'genesis', '출애굽기': 'exodus', '레위기': 'leviticus', '민수기': 'numbers', '신명기': 'deuteronomy',
    '여호수아': 'joshua', '사사기': 'judges', '룻기': 'ruth', '사무엘상': '1_samuel', '사무엘하': '2_samuel',
    '열왕기상': '1_kings', '열왕기하': '2_kings', '역대상': '1_chronicles', '역대하': '2_chronicles', '에스라': 'ezra',
    '느헤미야': 'nehemiah', '에스더': 'esther', '욥기': 'job', '시편': 'psalms', '잠언': 'proverbs',
    '전도서': 'ecclesiastes', '아가': 'song_of_songs', '이사야': 'isaiah', '예레미야': 'jeremiah', '예레레미야애가': 'lamentations',
    '에스겔': 'ezekiel', '다니엘': 'daniel', '호세아': 'hosea', '요엘': 'joel', '아모스': 'amos',
    '오바댜': 'obadiah', '요나': 'jonah', '미가': 'micah', '나훔': 'nahum', '하박국': 'habakkuk',
    '스바냐': 'zephaniah', '학개': 'haggai', '스가랴': 'zechariah', '말라기': 'malachi',
    '마태복음': 'matthew', '마가복음': 'mark', '누가복음': 'luke', '요한복음': 'john', '사도행전': 'acts',
    '로마서': 'romans', '고린도전서': '1_corinthians', '고린도후서': '2_corinthians', '갈라디아서': 'galatians', '에베소서': 'ephesians',
    '빌립보서': 'philippians', '골로새서': 'colossians', '데살로니가전서': '1_thessalonians', '데살로니가후서': '2_thessalonians', '디모데전서': '1_timothy',
    '디모데후서': '2_timothy', '디도서': 'titus', '빌레몬서': 'philemon', '히브리서': 'hebrews', '야고보서': 'james',
    '베드로전서': '1_peter', '베드로후서': '2_peter', '요한일서': '1_john', '요한이서': '2_john', '요한삼서': '3_john',
    '유다서': 'jude', '요한계시록': 'revelation'
  };
  return map[kor] || kor;
}

const getTestamentFolder = (groupId: string, groups: {id: string, name: string}[]) => {
  const groupName = groups.find(g => g.id === groupId)?.name;
  if (groupName === '구약') return 'old_testament';
  if (groupName === '신약') return 'new_testament';
  return 'etc';
};

export default function FileUpload({ onUploadComplete }: { onUploadComplete?: (results: UploadResult[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 그룹/책/장 상태 (DB 연동)
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]); // 구약/신약
  const [books, setBooks] = useState<{ id: string; name: string }[]>([]); // 하위 책
  const [section, setSection] = useState(''); // 그룹 id
  const [book, setBook] = useState(''); // 책 id
  const [chapter, setChapter] = useState('');

  // 그룹(구약/신약) fetch
  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('category')
        .select('id, name')
        .is('parent_id', null)
        .order('order', { ascending: true });
      if (!error && data) {
        setGroups(data);
        if (data.length > 0) setSection(data[0].id); // 첫 그룹 자동 선택
      }
    };
    fetchGroups();
  }, []);

  // 그룹 선택 시 하위 책 fetch
  useEffect(() => {
    if (!section) return;
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('category')
        .select('id, name')
        .eq('parent_id', section)
        .order('order', { ascending: true });
      if (!error && data) {
        setBooks(data);
        setBook(data.length > 0 ? data[0].id : ''); // 첫 책 자동 선택
      } else {
        setBooks([]);
        setBook('');
      }
    };
    fetchBooks();
  }, [section]);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // 드래그앤드롭 핸들러
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  // 업로드 버튼 클릭
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleUpload = async () => {
    // 입력값 검증
    if (!section || !book || !chapter || !files.length) {
      showToast('권명, 책명, 장, 파일을 모두 선택/입력하세요.');
      return;
    }
    if (Number(chapter) < 1) {
      showToast('장 번호는 1 이상이어야 합니다.');
      return;
    }
    setUploading(true);
    // 책명 id 조회
    const { data, error } = await supabase
      .from('category')
      .select('id, name')
      .eq('parent_id', section)
      .eq('id', book)
      .single();
    if (error || !data) {
      showToast('책명 id 조회 실패: ' + (error?.message || '데이터 없음'));
      setUploading(false);
      return;
    }
    const bookKor = data.name;
    const bookSlug = toSlug(bookKor);
    const testamentFolder = getTestamentFolder(section, groups);
    const chapterStr = String(chapter).padStart(2, '0');
    // 파일 업로드
    const uploadResults: UploadResult[] = [];
    let hasError = false;
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const safeFileName = encodeURIComponent(file.name.replace(/\.[^/.]+$/, ''));
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
      const filePath = `${testamentFolder}/${bookSlug}/${chapterStr}-${safeFileName}-${timestamp}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('biblefiles').upload(filePath, file, { upsert: true, contentType: 'text/html' });
      if (uploadError) {
        uploadResults.push({ fileName: file.name, success: false, error: uploadError.message });
        hasError = true;
        showToast(`파일 업로드 실패: ${file.name} (${uploadError.message})`);
      } else {
        const { error: metaError } = await supabase.from('b_materials').upsert({
          category_id: data.id,
          chapter: Number(chapter),
          file_name: file.name,
          storage_path: filePath,
          created_at: new Date().toISOString()
        });
        if (metaError) {
          uploadResults.push({ fileName: file.name, success: false, error: '메타데이터 저장 실패: ' + metaError.message });
          hasError = true;
          showToast(`메타데이터 저장 실패: ${file.name} (${metaError.message})`);
        } else {
          uploadResults.push({ fileName: file.name, success: true });
        }
      }
    }
    setUploadResults(uploadResults);
    setUploading(false);
    if (!hasError) {
      showToast('업로드 및 저장 성공!');
      setTimeout(() => {
        setFiles([]);
        setUploadResults([]);
        setChapter('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 2000);
    }
    onUploadComplete?.(uploadResults);
  };

  return (
    <div className="space-y-4 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
      {/* 그룹/책/장 선택 (DB 연동 2단 콤보박스) */}
      <div className="flex space-x-2">
        {/* 그룹(구약/신약) 콤보박스 */}
        <select value={section} onChange={e => setSection(e.target.value)} className="px-2 py-1 rounded bg-slate-900 text-white border border-slate-700">
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        {/* 하위 책 콤보박스 */}
        <select value={book} onChange={e => setBook(e.target.value)} className="px-2 py-1 rounded bg-slate-900 text-white border border-slate-700">
          {books.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        {/* 장 입력 */}
        <input type="number" placeholder="장" value={chapter} onChange={e => setChapter(e.target.value)} className="px-2 py-1 rounded bg-slate-900 text-white border border-slate-700 w-20" />
      </div>
      {/* 드래그앤드롭 영역 */}
      <div className="border-2 border-dashed border-blue-400 rounded-xl p-8 text-center cursor-pointer bg-slate-900 hover:bg-slate-800 transition"
           onDrop={handleDrop}
           onDragOver={e => e.preventDefault()}
           onClick={() => fileInputRef.current?.click()}>
        <p className="text-slate-400">여기로 파일을 드래그하거나 클릭하여 선택</p>
        <input type="file" multiple accept=".html" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>
      {/* 파일 리스트 */}
      <ul className="text-slate-300 text-sm">
        {files.map(file => (
          <li key={file.name}>{file.name}</li>
        ))}
      </ul>
      {/* 업로드 버튼 및 진행상태 */}
      <button
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl font-semibold transition hover:brightness-110 hover:scale-105 hover:shadow-2xl duration-200"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? '업로드 중...' : '업로드'}
      </button>
      {uploadResults.length > 0 && (
        <div className="mt-2">
          {uploadResults.map(res => (
            <div key={res.fileName} className={res.success ? 'text-green-400' : 'text-red-400'}>
              {res.fileName}: {res.success ? '성공' : `실패 (${res.error})`}
            </div>
          ))}
        </div>
      )}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-white font-semibold text-lg transition-all animate-fade-in-up bg-gradient-to-r from-red-500 to-pink-500">
          {toast}
        </div>
      )}
    </div>
  );
}
