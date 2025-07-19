import React, { useRef, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export type UploadResult = {
  fileName: string;
  success: boolean;
  error?: string;
};

// 파일명 검증 결과 타입
type FileValidationResult = {
  isValid: boolean;
  bookName?: string;
  chapter?: number;
  error?: string;
};

// 파일 메타데이터 타입
type FileMetadata = {
  file: File;
  fileName: string;
  chapter: number;
  filePath: string;
  categoryId: string;
};

// 업로드 진행률 컴포넌트
const UploadProgress = ({ 
  current, 
  total, 
  isUploading 
}: { 
  current: number; 
  total: number; 
  isUploading: boolean; 
}) => {
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

// 파일 검증 테이블 컴포넌트
const FileValidationTable = ({ 
  files, 
  onRemoveFile 
}: { 
  files: File[]; 
  onRemoveFile: (index: number) => void; 
}) => {
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
            const extracted = extractBookAndChapter(file.name);
            return (
              <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/30">
                <td className="px-4 py-2">
                  <span className={validation.isValid ? 'text-green-400' : 'text-red-400'}>
                    {validation.isValid ? '✅' : '❌'}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs">
                  {file.name}
                </td>
                <td className="px-4 py-2 text-slate-400">
                  {(file.size / 1024).toFixed(1)}KB
                </td>
                <td className="px-4 py-2 text-blue-400 font-semibold">
                  {extracted?.chapter || '-'}
                </td>
                <td className="px-4 py-2">
                  <button 
                    onClick={() => onRemoveFile(index)} 
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="파일 제거"
                  >
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

const getTestamentFolder = (bookName: string) => {
  // 신약 성경 목록
  const newTestamentBooks = [
    '마태복음', '마가복음', '누가복음', '요한복음', '사도행전',
    '로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서',
    '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서',
    '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서',
    '베드로전서', '베드로후서', '요한일서', '요한이서', '요한삼서',
    '유다서', '요한계시록'
  ];
  
  return newTestamentBooks.includes(bookName) ? 'new_testament' : 'old_testament';
};

// 영문 → 한글 책명 매핑
const englishToKoreanBook = (englishName: string): string => {
  const bookMap: Record<string, string> = {
    'genesis': '창세기', 'exodus': '출애굽기', 'leviticus': '레위기', 'numbers': '민수기', 'deuteronomy': '신명기',
    'joshua': '여호수아', 'judges': '사사기', 'ruth': '룻기', '1_samuel': '사무엘상', '2_samuel': '사무엘하',
    '1_kings': '열왕기상', '2_kings': '열왕기하', '1_chronicles': '역대상', '2_chronicles': '역대하', 'ezra': '에스라',
    'nehemiah': '느헤미야', 'esther': '에스더', 'job': '욥기', 'psalms': '시편', 'proverbs': '잠언',
    'ecclesiastes': '전도서', 'song_of_songs': '아가', 'isaiah': '이사야', 'jeremiah': '예레미야', 'lamentations': '예레레미야애가',
    'ezekiel': '에스겔', 'daniel': '다니엘', 'hosea': '호세아', 'joel': '요엘', 'amos': '아모스',
    'obadiah': '오바댜', 'jonah': '요나', 'micah': '미가', 'nahum': '나훔', 'habakkuk': '하박국',
    'zephaniah': '스바냐', 'haggai': '학개', 'zechariah': '스가랴', 'malachi': '말라기',
    'matthew': '마태복음', 'mark': '마가복음', 'luke': '누가복음', 'john': '요한복음', 'acts': '사도행전',
    'romans': '로마서', '1_corinthians': '고린도전서', '2_corinthians': '고린도후서', 'galatians': '갈라디아서', 'ephesians': '에베소서',
    'philippians': '빌립보서', 'colossians': '골로새서', '1_thessalonians': '데살로니가전서', '2_thessalonians': '데살로니가후서', '1_timothy': '디모데전서',
    '2_timothy': '디모데후서', 'titus': '디도서', 'philemon': '빌레몬서', 'hebrews': '히브리서', 'james': '야고보서',
    '1_peter': '베드로전서', '2_peter': '베드로후서', '1_john': '요한일서', '2_john': '요한이서', '3_john': '요한삼서',
    'jude': '유다서', 'revelation': '요한계시록'
  };
  return bookMap[englishName.toLowerCase()] || englishName;
};

// 한글 → DB category_id 매핑
const getCategoryIdByBookName = async (bookName: string): Promise<string> => {
  const { data, error } = await supabase
    .from('category')
    .select('id')
    .eq('name', bookName)
    .single();
  
  if (error || !data) {
    throw new Error(`책명 매핑 실패: ${bookName} (${error?.message || '데이터 없음'})`);
  }
  
  return data.id;
};

// 파일명에서 책명과 장 번호 자동 추출 함수
const extractBookAndChapter = (fileName: string): { bookName: string; chapter: number } | null => {
  const match = fileName.match(/^([0-9]{2})-([a-z_]+)-([0-9]{1,3})\.html$/);
  if (!match) return null;
  
  const chapter = parseInt(match[3]);
  if (chapter < 1 || chapter > 150) return null;
  
  return {
    bookName: match[2],
    chapter
  };
};

// 파일명 패턴 검증 함수 (개선)
const validateFileName = (fileName: string): FileValidationResult => {
  const extracted = extractBookAndChapter(fileName);
  
  if (!extracted) {
    return { 
      isValid: false, 
      error: '파일명 패턴이 올바르지 않습니다. (예: 01-genesis-01.html)' 
    };
  }
  
  const koreanBookName = englishToKoreanBook(extracted.bookName);
  if (koreanBookName === extracted.bookName) {
    return { 
      isValid: false, 
      error: `알 수 없는 책명: ${extracted.bookName}` 
    };
  }
  
  return { 
    isValid: true, 
    bookName: extracted.bookName, 
    chapter: extracted.chapter 
  };
};

// 자동 분류 함수
const autoClassifyFile = async (fileName: string) => {
  const extracted = extractBookAndChapter(fileName);
  if (!extracted) {
    throw new Error('파일명 패턴 오류');
  }
  
  const koreanBookName = englishToKoreanBook(extracted.bookName);
  const testament = getTestamentFolder(koreanBookName);
  const categoryId = await getCategoryIdByBookName(koreanBookName);
  
  return {
    bookName: koreanBookName,
    chapter: extracted.chapter,
    testament,
    categoryId
  };
};

// 파일별 메타데이터 생성 함수 (자동 분류)
const createMaterialMetadata = async (files: File[]): Promise<FileMetadata[]> => {
  const metadataPromises = files.map(async (file) => {
    const classification = await autoClassifyFile(file.name);
    const bookSlug = toSlug(classification.bookName);
    
    const ext = file.name.split('.').pop();
    const safeFileName = encodeURIComponent(file.name.replace(/\.[^/.]+$/, ''));
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const filePath = `${classification.testament}/${bookSlug}/${safeFileName}-${timestamp}.${ext}`;
    
    return {
      file,
      fileName: file.name,
      chapter: classification.chapter,
      filePath,
      categoryId: classification.categoryId
    };
  });
  
  return Promise.all(metadataPromises);
};

// Storage 병렬 업로드 함수
const uploadFilesToStorage = async (fileMetadata: FileMetadata[]): Promise<{ success: boolean; fileName: string; error?: string }[]> => {
  const uploadPromises = fileMetadata.map(async (metadata) => {
    try {
      const { error } = await supabase.storage
        .from('biblefiles')
        .upload(metadata.filePath, metadata.file, { 
          upsert: true, 
          contentType: 'text/html' 
        });
      
      if (error) {
        return { success: false, fileName: metadata.fileName, error: error.message };
      }
      
      return { success: true, fileName: metadata.fileName };
    } catch (error) {
      return { 
        success: false, 
        fileName: metadata.fileName, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  });
  
  return Promise.all(uploadPromises);
};

// DB 일괄 삽입 함수
const insertMaterialsToDB = async (fileMetadata: FileMetadata[]): Promise<{ success: boolean; fileName: string; error?: string }[]> => {
  const materialsData = fileMetadata.map(metadata => ({
    category_id: metadata.categoryId,
    chapter: metadata.chapter,
    file_name: metadata.fileName,
    storage_path: metadata.filePath,
    file_size: metadata.file.size,
    mime_type: metadata.file.type || 'text/html',
    created_at: new Date().toISOString()
  }));
  
  try {
    const { error } = await supabase.from('b_materials').upsert(materialsData);
    
    if (error) {
      return fileMetadata.map(metadata => ({
        success: false,
        fileName: metadata.fileName,
        error: `DB 저장 실패: ${error.message}`
      }));
    }
    
    return fileMetadata.map(metadata => ({
      success: true,
      fileName: metadata.fileName
    }));
  } catch (error) {
    return fileMetadata.map(metadata => ({
      success: false,
      fileName: metadata.fileName,
      error: `DB 저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }));
  }
};

// 실패한 Storage 파일 정리 함수
const cleanupFailedStorageFiles = async (failedUploads: { fileName: string; filePath: string }[]) => {
  const cleanupPromises = failedUploads.map(async ({ filePath }) => {
    try {
      await supabase.storage.from('biblefiles').remove([filePath]);
    } catch (error) {
      console.error(`Storage 파일 정리 실패: ${filePath}`, error);
    }
  });
  
  await Promise.allSettled(cleanupPromises);
};

export default function FileUpload({ onUploadComplete }: { onUploadComplete?: (results: UploadResult[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 자동 분류 시스템 - 기존 그룹/책 선택 로직 제거

  // 파일 제거 핸들러
  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // 파일 검증 및 즉시 피드백
  const validateAndSetFiles = (selectedFiles: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: { file: File; error: string }[] = [];
    
    selectedFiles.forEach(file => {
      const validation = validateFileName(file.name);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error || '알 수 없는 오류' });
      }
    });
    
    // 유효한 파일들만 설정
    if (validFiles.length > 0) {
      setFiles(validFiles);
    }
    
    // 부적합한 파일들에 대한 즉시 피드백
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(({ file, error }) => `${file.name}: ${error}`).join('\n');
      showToast(`부적합한 파일이 제외되었습니다:\n${errorMessages}`, 'warning');
    }
    
    // 성공 메시지
    if (validFiles.length > 0) {
      const successMessage = invalidFiles.length > 0 
        ? `${validFiles.length}개 파일이 선택되었습니다. (${invalidFiles.length}개 제외)`
        : `${validFiles.length}개 파일이 선택되었습니다.`;
      showToast(successMessage, 'success');
    }
  };

  // 파일 선택 핸들러 - 즉시 피드백 개선
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      validateAndSetFiles(selectedFiles);
    }
  };

  // 드래그앤드롭 핸들러 - 즉시 피드백 개선
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndSetFiles(droppedFiles);
    }
  };

  // 드래그오버 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // 드래그리브 핸들러
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // 업로드 버튼 클릭
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  
  const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 업로드 가능 여부 확인 (자동 분류)
  const canUpload = files.length > 0 && !uploading;
  
  // 모든 파일이 유효한지 확인
  const allFilesValid = files.length > 0 && files.every(file => validateFileName(file.name).isValid);

  const handleUpload = async () => {
    // 입력값 검증 - 파일만 필요
    if (!files.length) {
      showToast('파일을 선택하세요.', 'error');
      return;
    }
    
    // 파일 검증 재확인
    const invalidFiles = files.filter(file => !validateFileName(file.name).isValid);
    if (invalidFiles.length > 0) {
      showToast('부적합한 파일이 포함되어 있습니다. 파일을 다시 선택해주세요.', 'error');
      return;
    }
    
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    
    try {
      
      // 파일별 메타데이터 생성 (자동 분류)
      let fileMetadata: FileMetadata[];
      try {
        fileMetadata = await createMaterialMetadata(files);
      } catch (error) {
        showToast(`메타데이터 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, 'error');
        setUploading(false);
        setUploadProgress({ current: 0, total: 0 });
        return;
      }
      
      // Storage 병렬 업로드
      setUploadProgress({ current: 0, total: files.length });
      const storageResults = await uploadFilesToStorage(fileMetadata);
      
      // Storage 업로드 결과 확인
      const successfulUploads = storageResults.filter(result => result.success);
      const failedUploads = storageResults.filter(result => !result.success);
      
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map(result => `${result.fileName}: ${result.error}`).join('\n');
        showToast(`Storage 업로드 실패:\n${errorMessages}`, 'error');
        
        // 성공한 파일들만 DB에 저장
        const successfulMetadata = fileMetadata.filter(metadata => 
          successfulUploads.some(result => result.fileName === metadata.fileName)
        );
        
        if (successfulMetadata.length > 0) {
          setUploadProgress({ current: successfulUploads.length, total: files.length });
          const dbResults = await insertMaterialsToDB(successfulMetadata);
          
          // DB 결과와 Storage 결과를 결합
          const finalResults: UploadResult[] = [
            ...dbResults.map(result => ({
              fileName: result.fileName,
              success: result.success,
              error: result.error
            })),
            ...failedUploads.map(result => ({
              fileName: result.fileName,
              success: false,
              error: result.error
            }))
          ];
          
          setUploadResults(finalResults);
          setUploading(false);
          onUploadComplete?.(finalResults);
          return;
        } else {
          setUploadResults(failedUploads.map(result => ({
            fileName: result.fileName,
            success: false,
            error: result.error
          })));
          setUploading(false);
          onUploadComplete?.(failedUploads.map(result => ({
            fileName: result.fileName,
            success: false,
            error: result.error
          })));
          return;
        }
      }
      
      // 모든 Storage 업로드 성공 시 DB 일괄 삽입
      setUploadProgress({ current: files.length, total: files.length });
      const dbResults = await insertMaterialsToDB(fileMetadata);
      
      // DB 삽입 결과 확인
      const dbFailures = dbResults.filter(result => !result.success);
      
      if (dbFailures.length > 0) {
        // DB 삽입 실패 시 Storage 파일 정리
        const failedFilePaths = fileMetadata
          .filter(metadata => dbFailures.some(result => result.fileName === metadata.fileName))
          .map(metadata => ({ fileName: metadata.fileName, filePath: metadata.filePath }));
        
        await cleanupFailedStorageFiles(failedFilePaths);
        
        const errorMessages = dbFailures.map(result => `${result.fileName}: ${result.error}`).join('\n');
        showToast(`DB 저장 실패:\n${errorMessages}`, 'error');
        
        setUploadResults(dbResults.map(result => ({
          fileName: result.fileName,
          success: result.success,
          error: result.error
        })));
        setUploading(false);
        onUploadComplete?.(dbResults.map(result => ({
          fileName: result.fileName,
          success: result.success,
          error: result.error
        })));
        return;
      }
      
      // 모든 작업 성공
      const finalResults: UploadResult[] = fileMetadata.map(metadata => ({
        fileName: metadata.fileName,
        success: true
      }));
      
      setUploadResults(finalResults);
      setUploading(false);
      showToast(`업로드 완료! ${finalResults.length}개 파일이 성공적으로 저장되었습니다.`, 'success');
      
      // 상태 초기화 (3초 후)
      setTimeout(() => {
        setFiles([]);
        setUploadResults([]);
        setUploadProgress({ current: 0, total: 0 });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 3000);
      
      onUploadComplete?.(finalResults);
      
    } catch (error) {
      showToast(`업로드 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, 'error');
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  // 토스트 스타일 클래스
  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500';
    }
  };

  return (
    <div className="space-y-4 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
      {/* 자동 분류 안내 */}
      <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600">
        <h3 className="text-slate-300 font-semibold mb-2">🎯 자동 분류 시스템</h3>
        <p className="text-slate-400 text-sm">
          파일명을 기반으로 자동으로 구약/신약, 책명, 장번호를 분류합니다
        </p>
        <p className="text-slate-500 text-xs mt-1">
          예시: 01-genesis-01.html → 구약/창세기/1장
        </p>
      </div>
      {/* 드래그앤드롭 영역 - 안내 메시지 업데이트 */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-300 bg-slate-700/50 scale-105' 
            : 'border-blue-400 bg-slate-900 hover:bg-slate-800'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-2">
          <p className="text-slate-300 font-semibold text-lg">
            {isDragOver ? '파일을 여기에 놓으세요!' : '파일을 드래그하거나 클릭하여 선택'}
          </p>
          <p className="text-slate-400 text-sm">
            지원 형식: HTML 파일 (01-genesis-01.html, 02-matthew-02.html)
          </p>
          <p className="text-slate-500 text-xs">
            여러 파일을 동시에 선택할 수 있습니다
          </p>
        </div>
        <input type="file" multiple accept=".html" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>
      {/* 파일 검증 테이블 - 기존 단순 파일 리스트를 테이블로 교체 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-slate-300 font-semibold">
            선택된 파일 목록 ({files.length}개)
          </h3>
          <FileValidationTable files={files} onRemoveFile={handleRemoveFile} />
        </div>
      )}
      {/* 업로드 진행률 표시 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-slate-300 font-semibold">업로드 진행률</h3>
          <UploadProgress 
            current={uploadProgress.current} 
            total={uploadProgress.total} 
            isUploading={uploading} 
          />
        </div>
      )}
      {/* 업로드 버튼 및 진행상태 */}
      <button
        className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
          canUpload && allFilesValid
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:brightness-110 hover:scale-105 hover:shadow-2xl'
            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
        }`}
        onClick={handleUpload}
        disabled={!canUpload || !allFilesValid}
        title={
          !files.length ? '파일을 선택하세요' :
          !allFilesValid ? '부적합한 파일이 포함되어 있습니다' :
          uploading ? '업로드 중입니다' :
          '업로드 시작'
        }
      >
        {uploading ? '업로드 중...' : '업로드'}
      </button>
      {uploadResults.length > 0 && (
        <div className="mt-2 space-y-1">
          <h4 className="text-slate-300 font-semibold">업로드 결과</h4>
          {uploadResults.map(res => (
            <div key={res.fileName} className={`text-sm ${res.success ? 'text-green-400' : 'text-red-400'}`}>
              {res.fileName}: {res.success ? '✅ 성공' : `❌ 실패 (${res.error})`}
            </div>
          ))}
        </div>
      )}
      {/* 개선된 토스트 알림 */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-white font-semibold text-lg transition-all animate-fade-in-up ${getToastStyle(toast.type)}`}>
          <span>
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
