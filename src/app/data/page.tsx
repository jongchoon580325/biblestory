  'use client';
  import React, { useEffect, useState } from 'react';
  import Link from 'next/link';
  import { Database, Book, Heart, Mail, Globe, ArrowUpCircle, ArrowDownCircle, RotateCcw, ListTree, Lock, Key, BookOpen } from 'lucide-react';
  import FileUpload from '@/components/features/FileUpload';
  import { ExportDataButton } from '@/components/features/ExportDataButton';
  import { ExportCategoryButton } from '@/components/features/ExportCategoryButton';
  import { ResetDataButton } from '@/components/features/ResetDataButton';
  import { ResetCategoryButton } from '@/components/features/ResetCategoryButton';
  import { ImportDataButton } from '@/components/features/ImportDataButton';
  import { ImportCategoryButton } from '@/components/features/ImportCategoryButton';
  import CategoryForm from '@/components/features/CategoryForm';
  import BibleReadingUpload from '@/components/features/BibleReadingUpload';
  import { supabase } from '@/utils/supabaseClient';
  import JSZip from 'jszip';
  // Category 타입 정의 (CategoryForm.tsx와 동일)
  type Category = {
    id: string;
    name: string;
    parent_id: string | null;
    order: number;
    created_at?: string;
    books?: Category[];
  };

  type Book = {
    id: string;
    name: string;
    order: number;
  };

  import ScrollToTopButton from '@/components/features/ScrollToTopButton';
  // Supabase Storage 파일/폴더 타입 정의
  // SupabaseStorageFile 타입 선언 제거

  export default function DataPage() {
    // 관리자 인증 상태
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    // 비밀번호 관리 상태
    const [currentPassword, setCurrentPassword] = useState('1111'); // 초기 비밀번호
    const [newPassword, setNewPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    
    // 샘플 핸들러 및 로딩 상태
    const [exportingCategory, setExportingCategory] = React.useState(false);
    const [resettingData, setResettingData] = React.useState(false);
    const [resettingCategory, setResettingCategory] = React.useState(false);
    const [importingData, setImportingData] = React.useState(false);
    const [importingCategory, setImportingCategory] = React.useState(false);
    const [showResetCategoryModal, setShowResetCategoryModal] = useState(false);
    const [resetCategoryError, setResetCategoryError] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    // 토스트 메시지 상태
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    // 토스트 노출 함수
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 2500);
    };
    // 내보내기 모달 상태
    const [showExportModal, setShowExportModal] = useState(false);
    // pendingExport 상태 제거

    // 페이지 로드 시 인증 상태 확인
    useEffect(() => {
      const savedAuth = sessionStorage.getItem('dataPageAuthenticated');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        setShowPasswordModal(true);
      }
    }, []);

    // 비밀번호 인증 처리
    const handlePasswordAuth = () => {
      if (password === currentPassword) {
        setIsAuthenticated(true);
        setShowPasswordModal(false);
        setPassword('');
        setPasswordError('');
        sessionStorage.setItem('dataPageAuthenticated', 'true');
        showToast('관리자 인증 성공!', 'success');
      } else {
        setPasswordError('비밀번호가 올바르지 않습니다.');
        setPassword('');
      }
    };

      // 비밀번호 변경 처리
  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      showToast('새 비밀번호를 입력해주세요.', 'error');
      return;
    }
    
    if (newPassword.length < 4) {
      showToast('비밀번호는 최소 4자 이상이어야 합니다.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      // 실제로는 서버에 저장하거나 더 안전한 방법을 사용해야 함
      setCurrentPassword(newPassword);
      setNewPassword('');
      showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
    } catch {
      showToast('비밀번호 변경에 실패했습니다.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

    // 내보내기 버튼 클릭 시 모달 표시
    const handleExportDataModal = () => {
      setShowExportModal(true);
    };

    // 모달에서 확인 시 실제 내보내기 실행
    const handleExportDataConfirmed = async () => {
      setShowExportModal(false);
      setExportingCategory(true); // 내보내기 진행 중 표시
      try {
        // 1. 그룹 카테고리(구약/신약)
        const { data: groups, error: groupError } = await supabase
          .from('category')
          .select('*')
          .is('parent_id', null)
          .order('order', { ascending: true });
        if (groupError) throw groupError;
        // 2. 하위 카테고리(책)
        const { data: allBooks, error: bookError } = await supabase
          .from('category')
          .select('*')
          .not('parent_id', 'is', null)
          .order('order', { ascending: true });
        if (bookError) throw bookError;
        // 3. 계층 구조로 변환
        const withBooks = (groups || []).map(group => ({
          ...group,
          books: (allBooks || [])
            .filter(book => book.parent_id === group.id)
            .map(book => ({
              id: book.id,
              name: book.name,
              order: book.order,
              parent_id: book.parent_id,
              created_at: book.created_at,
            }))
        }));
        // 4. JSON 변환 및 다운로드
        const jsonStr = JSON.stringify(withBooks, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        // 파일명: yyyy-mm-dd-bible-category.json
        const dateStr = new Date().toISOString().slice(0,10);
        a.href = url;
        a.download = `${dateStr}-bible-category.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast('카테고리 내보내기 성공!', 'success');
      } catch (err: unknown) {
        let msg = '알 수 없는 오류';
        if (typeof err === 'object' && err !== null && 'message' in err) {
          const maybeMsg = (err as Record<string, unknown>).message;
          if (typeof maybeMsg === 'string') {
            msg = maybeMsg;
          } else {
            msg = JSON.stringify(err);
          }
        } else {
          msg = String(err);
        }
        showToast('카테고리 내보내기 실패: ' + msg, 'error');
      } finally {
        setExportingCategory(false);
        setShowExportModal(false);
      }
    };

    useEffect(() => {
      const fetchCategories = async () => {
        // 그룹 카테고리(구약/신약)
        const { data: groups, error } = await supabase
          .from('category')
          .select('*')
          .is('parent_id', null)
          .order('order', { ascending: true });
        console.log('groups:', groups, 'error:', error);
        if (error) return;
        // 하위 카테고리(책)
        const { data: allBooks } = await supabase
          .from('category')
          .select('*')
          .not('parent_id', 'is', null)
          .order('order', { ascending: true });
        console.log('allBooks:', allBooks);
        // 계층 구조로 변환
        const withBooks = (groups || []).map(group => ({
          ...group,
          books: (allBooks || [])
            .filter(book => book.parent_id === group.id)
            .map(book => ({
              id: book.id,
              name: book.name,
              order: book.order,
            })) // Book 타입으로 변환
        }));
        console.log('withBooks:', withBooks);
        setCategories(withBooks);
      };
      fetchCategories();
    }, []);

    // 데이터 가져오기 핸들러
    const handleImportData = async (file: File) => {
      setImportingData(true);
      try {
        const zip = await JSZip.loadAsync(file);
        // meta.json 파싱
        const metaFile = zip.file('meta.json');
        if (!metaFile) throw new Error('meta.json 파일이 없습니다.');
        const metaText = await metaFile.async('string');
        const materials = JSON.parse(metaText);
        // html 파일들 업로드
        const uploadResults = [];
        for (const path in zip.files) {
          if (path === 'meta.json') continue;
          const zipEntry = zip.file(path);
          if (!zipEntry) continue;
          const fileData = await zipEntry.async('blob');
          // Storage 업로드
          const { error } = await supabase.storage.from('biblefiles').upload(path, fileData, { upsert: true, contentType: 'text/html' });
          uploadResults.push({ path, error });
        }
        // 메타데이터 insert (upsert)
        for (const row of materials) {
          await supabase.from('b_materials').upsert(row);
        }
        showToast('데이터 가져오기 성공!', 'success');
      } catch (err: unknown) {
        let msg = '알 수 없는 오류';
        if (typeof err === 'object' && err !== null && 'message' in err) {
          const maybeMsg = (err as Record<string, unknown>).message;
          if (typeof maybeMsg === 'string') {
            msg = maybeMsg;
          } else {
            msg = JSON.stringify(err);
          }
        } else {
          msg = String(err);
        }
        showToast('데이터 가져오기 실패: ' + msg, 'error');
      } finally {
        setImportingData(false);
      }
    };
    const handleImportCategory = async (file: File) => {
      setImportingCategory(true);
      try {
        const text = await file.text();
        const categories: Category[] = JSON.parse(text);
        // 계층 구조를 flat하게 변환
        const flatCategories: Category[] = [];
        for (const group of categories) {
          flatCategories.push({
            id: group.id,
            name: group.name,
            parent_id: null,
            order: group.order,
            created_at: group.created_at,
          });
          if (Array.isArray(group.books)) {
            for (const book of group.books) {
              flatCategories.push({
                id: book.id,
                name: book.name,
                parent_id: group.id,
                order: book.order,
                created_at: book.created_at,
              });
            }
          }
        }
        // Supabase insert/upsert
        for (const row of flatCategories) {
          await supabase.from('category').upsert(row);
        }
        showToast('카테고리 가져오기 성공!', 'success');
      } catch (err) {
        showToast('카테고리 가져오기 실패: ' + (err as Error)?.message, 'error');
      } finally {
        setImportingCategory(false);
      }
    };

    // 데이터 초기화 핸들러
    const handleResetData = async () => {
      setResettingData(true);
      try {
        // 1. 테이블 전체 삭제
        await supabase.from('b_materials').delete().not('id', 'is', null);
        // 2. Storage 모든 파일 삭제 (폴더 구조 완전 지원)
        async function listAllFiles(path = ''): Promise<string[]> {
          let allFiles: string[] = [];
          const { data: files, error } = await supabase.storage.from('biblefiles').list(path, { limit: 1000 });
          if (error || !files) return allFiles;
          for (const file of files) {
            if (file.metadata && file.metadata.isFolder) {
              // 폴더면 재귀 탐색 (폴더명은 allFiles에 추가하지 않음)
              const subFiles = await listAllFiles((path ? path + '/' : '') + file.name);
              allFiles = allFiles.concat(subFiles);
            } else {
              // 파일이면 경로 추가
              allFiles.push((path ? path + '/' : '') + file.name);
            }
          }
          return allFiles;
        }
        const allFiles = await listAllFiles();
        console.log('삭제 대상 파일 목록:', allFiles);
        if (allFiles.length > 0) {
          const { error: removeError } = await supabase.storage.from('biblefiles').remove(allFiles);
          if (removeError) {
            console.error('파일 삭제 에러:', removeError.message);
          }
        }
        showToast('데이터 초기화 성공!', 'success');
      } catch (err: unknown) {
        const msg = (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message : String(err);
        showToast('데이터 초기화 실패: ' + msg, 'error');
      } finally {
        setResettingData(false);
      }
    };

    // 데이터 초기화 모달 상태
    const [showResetDataModal, setShowResetDataModal] = useState(false);

    // 데이터 초기화 버튼 클릭 시 모달 표시
    const handleResetDataModal = () => {
      setShowResetDataModal(true);
    };

    // 모달에서 확인 시 실제 데이터 초기화 실행
    const handleResetDataConfirmed = async () => {
      setShowResetDataModal(false);
      await handleResetData();
    };

    // 카테고리 초기화 핸들러 복원
    const handleResetCategory = async () => {
      setResettingCategory(true);
      setResetCategoryError('');
      const { error } = await supabase.from('category').delete().not('id', 'is', null);
      setResettingCategory(false);
      setShowResetCategoryModal(false);
      if (error) {
        setResetCategoryError('카테고리 초기화 실패: ' + error.message);
        alert('카테고리 초기화 실패: ' + error.message);
      } else {
        showToast('카테고리 초기화 성공!', 'success');
        setTimeout(() => setToast(null), 2500);
        window.location.reload();
      }
    };

    console.log('CategoryForm categories:', categories);

    // 인증되지 않은 경우 비밀번호 입력 모달만 표시
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-900" style={{ backgroundColor: '#292828' }}>
          {/* 배경 그라데이션 */}
          <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-slate-900/10 pointer-events-none" />
          {/* 네비게이션 */}
          <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                  <Link href="/" className="flex items-center space-x-3 group outline-none focus:ring-2 focus:ring-blue-400 rounded-xl transition">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
                      <Book className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:underline">
                      Bible Room Study
                    </h1>
                  </Link>
                </div>
                <div className="flex items-center space-x-1">
                  <Link href="/" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50">HOME</Link>
                  <Link href="/read" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50">READ</Link>
                  <Link href="/data" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-blue-400 border border-blue-500/30 bg-blue-500/20">DATA</Link>
                </div>
              </div>
            </div>
          </nav>
          
          {/* 비밀번호 입력 모달 */}
          {showPasswordModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px]">
                <div className="text-white text-lg font-bold mb-2 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-blue-400" />
                  관리자 인증
                </div>
                <div className="text-slate-300 mb-4">DATA 페이지에 접근하려면 관리자 비밀번호를 입력하세요.</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordAuth()}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {passwordError && <div className="text-red-400 text-sm">{passwordError}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition"
                    onClick={() => window.history.back()}
                  >
                    취소
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition"
                    onClick={handlePasswordAuth}
                  >
                    인증
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900" style={{ backgroundColor: '#292828' }}>
        {/* 배경 그라데이션 */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-slate-900/10 pointer-events-none" />
        {/* 네비게이션 */}
        <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3 group outline-none focus:ring-2 focus:ring-blue-400 rounded-xl transition">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
                    <Book className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:underline">
                    Bible Room Study
                  </h1>
                </Link>
              </div>
              <div className="flex items-center space-x-1">
                <Link href="/" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50">HOME</Link>
                <Link href="/read" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50">READ</Link>
                <Link href="/data" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-blue-400 border border-blue-500/30 bg-blue-500/20">DATA</Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8 relative">
          <div className="space-y-8">
            {/* 스티키 헤더 섹션 */}
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 -mx-6 px-6 py-4">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  자료 관리
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  소중한 자료를 관리하는 공간입니다.
                </p>
              </div>
            </div>
            {/* 콘텐츠 2단 그리드: 좌/우 5:5 동일 분할 */}
            <div className="flex flex-row items-start gap-8">
              {/* 좌측: 성경자료 등록 + 카테고리 관리 (50%) */}
              <div className="flex-[0_0_50%] basis-1/2 flex flex-col space-y-6 min-w-0">
                <div className="flex items-center text-xl font-bold text-white mb-2">
                  <Book className="w-6 h-6 mr-2 text-blue-400" />
                  성경자료 등록
                </div>
                <FileUpload />
                <div className="flex items-center text-xl font-bold text-white mb-2">
                  <ListTree className="w-6 h-6 mr-2 text-emerald-400" />
                  카테고리 관리
                </div>
                <CategoryForm categories={categories} />
                
                {/* 성경읽기 자료 등록 */}
                <div className="flex items-center text-xl font-bold text-white mb-2">
                  <BookOpen className="w-6 h-6 mr-2 text-purple-400" />
                  성경읽기 자료 등록
                </div>
                <BibleReadingUpload />
              </div>
              {/* 우측: 데이터 관리 버튼 그리드 (50%) */}
              <div className="flex-[0_0_50%] basis-1/2 flex flex-col space-y-8 self-start w-full">
                <div className="flex items-center text-xl font-bold text-white mb-2">
                  <Database className="w-6 h-6 mr-2 text-purple-400" />
                  데이터 관리
                </div>
                {/* 데이터 내보내기 섹션 */}
                <div>
                  <div className="flex items-center text-lg font-semibold text-slate-200 mb-2">
                    <ArrowUpCircle className="w-5 h-5 mr-1 text-blue-400" />
                    데이터/카테고리 데이터 [내보내기]
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ExportDataButton onExport={handleExportDataModal} loading={false} />
                    <ExportCategoryButton onExport={handleExportDataConfirmed} loading={exportingCategory} />
                  </div>
                </div>
                {/* 데이터 가져오기 섹션 */}
                <div>
                  <div className="flex items-center text-lg font-semibold text-slate-200 mb-2">
                    <ArrowDownCircle className="w-5 h-5 mr-1 text-green-400" />
                    데이터/카테고리 데이터 [가져오기]
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ImportDataButton onImport={handleImportData} loading={importingData} />
                    <ImportCategoryButton onImport={handleImportCategory} loading={importingCategory} />
                  </div>
                </div>
                {/* 초기화 섹션 */}
                <div>
                  <div className="flex items-center text-lg font-semibold text-slate-200 mb-2">
                    <RotateCcw className="w-5 h-5 mr-1 text-pink-400" />
                    초기화
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ResetDataButton onReset={handleResetDataModal} loading={resettingData} />
                    <ResetCategoryButton onReset={() => setShowResetCategoryModal(true)} loading={resettingCategory} />
                  </div>
                </div>
                {/* 관리자 비밀번호 관리 섹션 */}
                <div>
                  <div className="flex items-center text-lg font-semibold text-slate-200 mb-2">
                    <Key className="w-5 h-5 mr-1 text-yellow-400" />
                    관리자 비밀번호 관리
                  </div>
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="새 비밀번호를 입력하세요"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? '변경 중...' : '비밀번호 변경'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* 이하 기존 안내/설명 영역 유지 */}
          </div>
        </main>
        {/* 푸터 */}
        <footer className="mt-16 border-t border-slate-700/50 py-8">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <Globe className="w-4 h-4" />
              <span>Your Personal Bible Room Study, Built with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>by 나종춘</span>
              <span>|</span>
              <a 
                href="mailto:najongchoon@gmail.com" 
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>najongchoon@gmail.com</span>
              </a>
            </div>
          </div>
        </footer>
        {/* 카테고리 초기화 모달 */}
        {showResetCategoryModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px]">
              <div className="text-white text-lg font-bold mb-2">카테고리 전체 초기화</div>
              <div className="text-slate-300 mb-4">정말 모든 카테고리를 <span className="text-red-400 font-semibold">초기화</span> 하시겠습니까?<br/>이 작업은 되돌릴 수 없습니다.</div>
              {resetCategoryError && <div className="text-red-400 text-sm mb-2">{resetCategoryError}</div>}
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition"
                  onClick={() => setShowResetCategoryModal(false)}
                  disabled={resettingCategory}
                >
                  취소
                </button>
                <button
                  className="px-4 py-2 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition"
                  onClick={handleResetCategory}
                  disabled={resettingCategory}
                >
                  {resettingCategory ? '초기화 중...' : '초기화'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 데이터 초기화 모달 */}
        {showResetDataModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px]">
              <div className="text-white text-lg font-bold mb-2">데이터 전체 초기화</div>
              <div className="text-slate-300 mb-4">정말 모든 데이터를 <span className="text-red-400 font-semibold">초기화</span> 하시겠습니까?<br/>이 작업은 되돌릴 수 없습니다.</div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition"
                  onClick={() => setShowResetDataModal(false)}
                  disabled={resettingData}
                >
                  취소
                </button>
                <button
                  className="px-4 py-2 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition"
                  onClick={handleResetDataConfirmed}
                  disabled={resettingData}
                >
                  {resettingData ? '초기화 중...' : '초기화'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 토스트 메시지 */}
        {toast && (
          <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-white font-semibold text-lg transition-all animate-fade-in-up
            ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-400 to-blue-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}
          >
            {toast.type === 'success' ? (
              <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            {toast.msg}
          </div>
        )}

        {/* 내보내기 확인 모달 */}
        {showExportModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9998]">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px] animate-fade-in-up">
              <div className="text-white text-lg font-bold mb-2 flex items-center gap-2">
                <ArrowUpCircle className="w-6 h-6 text-blue-400" />
                카테고리 JSON 내보내기
              </div>
              <div className="text-slate-300 mb-4">정말 <span className="text-blue-400 font-semibold">카테고리 데이터를 내보내기</span> 하시겠습니까?<br/>JSON 파일로 저장됩니다.</div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition"
                  onClick={() => setShowExportModal(false)}
                  disabled={exportingCategory}
                >
                  취소
                </button>
                <button
                  className="px-4 py-2 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition"
                  onClick={handleExportDataConfirmed}
                  disabled={exportingCategory}
                >
                  {exportingCategory ? '내보내는 중...' : '내보내기'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 위로가기(ScrollToTop) 플로팅 버튼 */}
        <ScrollToTopButton />
      </div>
    );
  } 