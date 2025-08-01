'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { getBookData } from '@/utils/bibleData';

interface FileValidationResult {
  isValid: boolean;
  bookName?: string;
  chapterNumber?: number;
  bookId?: string;
  error?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function BibleReadingUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ success: number; error: number }>({ success: 0, error: 0 });
  const [autoResetTimer, setAutoResetTimer] = useState<NodeJS.Timeout | null>(null);

  // 파일명 검증 함수
  const validateFileName = (fileName: string): FileValidationResult => {
    // 01-genesis-01.html 형식 검증
    const pattern = /^(\d{2})-([a-z]+)-(\d{2,3})\.html$/i;
    const match = fileName.match(pattern);
    
    if (!match) {
      return {
        isValid: false,
        error: '파일명 형식이 올바르지 않습니다. (예: 01-genesis-01.html)'
      };
    }

    const [, , bookName, chapterStr] = match;
    const chapterNumber = parseInt(chapterStr, 10);
    
    // 영어 책명을 한글 책명으로 변환
    const bookNameMap: Record<string, string> = {
      'genesis': '창세기',
      'exodus': '출애굽기',
      'leviticus': '레위기',
      'numbers': '민수기',
      'deuteronomy': '신명기',
      'joshua': '여호수아',
      'judges': '사사기',
      'ruth': '룻기',
      'samuel1': '사무엘상',
      'samuel2': '사무엘하',
      'kings1': '열왕기상',
      'kings2': '열왕기하',
      'chronicles1': '역대상',
      'chronicles2': '역대하',
      'ezra': '에스라',
      'nehemiah': '느헤미야',
      'esther': '에스더',
      'job': '욥기',
      'psalms': '시편',
      'proverbs': '잠언',
      'ecclesiastes': '전도서',
      'song': '아가',
      'isaiah': '이사야',
      'jeremiah': '예레미야',
      'lamentations': '예레미야애가',
      'ezekiel': '에스겔',
      'daniel': '다니엘',
      'hosea': '호세아',
      'joel': '요엘',
      'amos': '아모스',
      'obadiah': '오바댜',
      'jonah': '요나',
      'micah': '미가',
      'nahum': '나훔',
      'habakkuk': '하박국',
      'zephaniah': '스바냐',
      'haggai': '학개',
      'zechariah': '스가랴',
      'malachi': '말라기',
      'matthew': '마태복음',
      'mark': '마가복음',
      'luke': '누가복음',
      'john': '요한복음',
      'acts': '사도행전',
      'romans': '로마서',
      'corinthians1': '고린도전서',
      'corinthians2': '고린도후서',
      'galatians': '갈라디아서',
      'ephesians': '에베소서',
      'philippians': '빌립보서',
      'colossians': '골로새서',
      'thessalonians1': '데살로니가전서',
      'thessalonians2': '데살로니가후서',
      'timothy1': '디모데전서',
      'timothy2': '디모데후서',
      'titus': '디도서',
      'philemon': '빌레몬서',
      'hebrews': '히브리서',
      'james': '야고보서',
      'peter1': '베드로전서',
      'peter2': '베드로후서',
      'john1': '요한일서',
      'john2': '요한이서',
      'john3': '요한삼서',
      'jude': '유다서',
      'revelation': '요한계시록'
    };

    const koreanBookName = bookNameMap[bookName.toLowerCase()];
    if (!koreanBookName) {
      return {
        isValid: false,
        error: `알 수 없는 책명입니다: ${bookName}`
      };
    }

    // 책 데이터 확인
    const bookData = getBookData(koreanBookName);
    if (chapterNumber > bookData.totalChapters) {
      return {
        isValid: false,
        error: `${koreanBookName}은 ${bookData.totalChapters}장까지 있습니다. (입력: ${chapterNumber}장)`
      };
    }

    return {
      isValid: true,
      bookName: koreanBookName,
      chapterNumber,
      bookId: koreanBookName // 임시로 책명을 ID로 사용
    };
  };

  // 파일 처리 함수
  const processFiles = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList).filter(file => {
      return file.type === 'text/html' || file.name.endsWith('.html');
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // 업로드 진행률 초기화
    const progress: UploadProgress[] = newFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'pending'
    }));
    setUploadProgress(prev => [...prev, ...progress]);
  }, []);

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  // 파일 제거
  const removeFile = useCallback((fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => prev.filter(p => p.fileName !== fileName));
  }, []);

  // 업로드 실행
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadResults({ success: 0, error: 0 });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 진행률 업데이트
      setUploadProgress(prev => prev.map(p => 
        p.fileName === file.name 
          ? { ...p, status: 'uploading', progress: 0 }
          : p
      ));

      try {
        // 파일 내용 읽기
        const content = await file.text();
        
        // 파일명 검증
        const validation = validateFileName(file.name);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        // book_id 조회 (category 테이블에서)
        const { data: bookData, error: bookError } = await supabase
          .from('category')
          .select('id')
          .eq('name', validation.bookName)
          .not('parent_id', 'is', null) // 책만 조회 (구약/신약 제외)
          .single();

        if (bookError || !bookData) {
          throw new Error(`책 정보를 찾을 수 없습니다: ${validation.bookName}`);
        }

        // Storage 경로 생성
        const englishBookName = getBookData(validation.bookName!).nameEnglish;
        const storagePath = `readingbible/${englishBookName}/${file.name}`;

        // Supabase Storage에 파일 업로드
        const { error: storageError } = await supabase.storage
          .from('readingbible')
          .upload(storagePath, file);

        if (storageError) {
          throw new Error(`Storage 업로드 실패: ${storageError.message}`);
        }

        // rb_bible_chapters 테이블에 저장 (현재 외래키 제약조건에 맞춤)
        const { error } = await supabase
          .from('rb_bible_chapters')
          .insert({
            book_id: bookData.id,  // category 테이블의 ID (현재 외래키 제약조건)
            chapter_number: validation.chapterNumber,
            html_content: content,
            file_name: file.name,
            storage_path: storagePath
          });

        if (error) {
          // DB 저장 실패 시 Storage 파일 삭제
          await supabase.storage
            .from('readingbible')
            .remove([storagePath]);
          throw new Error(error.message);
        }

        // 성공 처리
        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name 
            ? { ...p, status: 'success', progress: 100 }
            : p
        ));
        successCount++;

      } catch (error) {
        // 에러 처리
        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name 
            ? { ...p, status: 'error', progress: 0, error: error instanceof Error ? error.message : '알 수 없는 오류' }
            : p
        ));
        errorCount++;
      }

      // 진행률 업데이트
      setUploadProgress(prev => prev.map(p => 
        p.fileName === file.name 
          ? { ...p, progress: 100 }
          : p
      ));
    }

    setUploadResults({ success: successCount, error: errorCount });
    setIsUploading(false);
    
    // 업로드 완료 후 3초 타이머 시작
    if (successCount > 0 || errorCount > 0) {
      startAutoResetTimer();
    }
  };

  // 파일 목록 초기화
  const clearFiles = () => {
    setFiles([]);
    setUploadProgress([]);
    setUploadResults({ success: 0, error: 0 });
    // 파일 입력 필드 초기화
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 자동 초기화 타이머 설정
  const startAutoResetTimer = () => {
    // 기존 타이머가 있다면 제거
    if (autoResetTimer) {
      clearTimeout(autoResetTimer);
    }
    
    // 3초 후 자동 초기화
    const timer = setTimeout(() => {
      clearFiles();
      setAutoResetTimer(null);
    }, 3000);
    
    setAutoResetTimer(timer);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (autoResetTimer) {
        clearTimeout(autoResetTimer);
      }
    };
  }, [autoResetTimer]);

  return (
    <div className="space-y-4 p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
      {/* 자동 분류 안내 */}
      <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-2">📖 성경읽기 자동 분류 시스템</h3>
        <p className="text-slate-300 text-sm">
          HTML 파일을 업로드하면 자동으로 readingbible Storage와 rb_bible_chapters 테이블에 저장됩니다.<br />
          파일명 형식: 01-genesis-01.html (영어 책명, 2자리 장 번호)
        </p>
      </div>

      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-white font-medium mb-2">HTML 파일을 드래그하거나 클릭하여 선택</p>
        <p className="text-slate-400 text-sm">지원 형식: .html</p>
        <input
          id="file-input"
          type="file"
          multiple
          accept=".html"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">선택된 파일 ({files.length}개)</h4>
            <button
              onClick={clearFiles}
              className="text-slate-400 hover:text-white text-sm"
            >
              모두 지우기
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-2 px-3">파일명</th>
                  <th className="text-left py-2 px-3">크기</th>
                  <th className="text-left py-2 px-3">상태</th>
                  <th className="text-left py-2 px-3">작업</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => {
                  const progress = uploadProgress.find(p => p.fileName === file.name);
                  const validation = validateFileName(file.name);
                  
                  return (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="py-2 px-3">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-slate-400" />
                          <span className={validation.isValid ? 'text-white' : 'text-red-400'}>
                            {file.name}
                          </span>
                        </div>
                        {!validation.isValid && (
                          <p className="text-red-400 text-xs mt-1">{validation.error}</p>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-2 px-3">
                        {progress?.status === 'success' && (
                          <div className="flex items-center text-green-400">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            완료
                          </div>
                        )}
                        {progress?.status === 'error' && (
                          <div className="flex items-center text-red-400">
                            <XCircle className="w-4 h-4 mr-1" />
                            오류
                          </div>
                        )}
                        {progress?.status === 'uploading' && (
                          <div className="flex items-center text-blue-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-1"></div>
                            업로드 중
                          </div>
                        )}
                        {progress?.status === 'pending' && (
                          <div className="flex items-center text-slate-400">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            대기 중
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => removeFile(file.name)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          제거
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 업로드 진행률 */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>업로드 진행률</span>
                <span>{uploadProgress.filter(p => p.status === 'success').length} / {files.length}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(uploadProgress.filter(p => p.status === 'success').length / files.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* 업로드 버튼 */}
          <button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className="w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200"
          >
            {isUploading ? '업로드 중...' : '업로드 시작'}
          </button>

          {/* 업로드 결과 */}
          {(uploadResults.success > 0 || uploadResults.error > 0) && (
            <div className="mt-2 space-y-1">
              {uploadResults.success > 0 && (
                <div className="flex items-center text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  성공: {uploadResults.success}개 파일
                </div>
              )}
              {uploadResults.error > 0 && (
                <div className="flex items-center text-red-400 text-sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  실패: {uploadResults.error}개 파일
                </div>
              )}
              {autoResetTimer && (
                <div className="flex items-center text-blue-400 text-sm">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-1"></div>
                  3초 후 자동 초기화
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 