"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Eye, Download, Edit, Trash2, Search, ChevronLeft, Check, X as XIcon, ArrowUp, Lock } from "lucide-react";
import { useParams } from "next/navigation";
import HtmlPreviewModal from "@/components/features/HtmlPreviewModal";
import { supabase } from "@/utils/supabaseClient";
import { saveAs } from "file-saver";
import { findBookByKoreanName } from "@/utils/bibleMapping";

// Supabase 연동 데이터 fetch 구조 준비

interface EditRowType {
  chapter: number;
  file_name: string;
}

interface MaterialRow {
  id: string;
  chapter: number;
  file_name: string;
  storage_path: string;
}

export default function BookTablePage() {
  const params = useParams();
  const bookName = params?.bookName ? decodeURIComponent(params.bookName as string) : '';
  const [data, setData] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string|null>(null);
  const [editRow, setEditRow] = useState<EditRowType|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalHtml, setModalHtml] = useState("");
  const [modalFileName, setModalFileName] = useState("");
  const [downloadPath, setDownloadPath] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 비밀번호 인증 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPassword] = useState('1111'); // DATA 페이지와 동일한 비밀번호
  const [pendingAction, setPendingAction] = useState<{
    type: 'edit' | 'delete';
    rowId: string;
    rowData?: EditRowType;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      // 책명으로 BibleBook 정보 찾기
      const bookInfo = findBookByKoreanName(bookName);
      if (!bookInfo) {
        setError(`알 수 없는 책명: ${bookName}`);
        setData([]);
        setLoading(false);
        return;
      }
      
      const { data: rows, error } = await supabase
        .from('b_materials')
        .select('id, chapter, file_name, storage_path')
        .ilike('file_name', `%-${bookInfo.englishName}-%`) // 해당 책의 파일만 필터링 (접두사 무관)
        .order('chapter', { ascending: true });
      if (error) {
        setError(error.message);
        setData([]);
      } else {
        setData(rows || []);
        // 데이터 로드 시 첫 페이지로 리셋
        setCurrentPage(1);
      }
      setLoading(false);
    };
    fetchData();
  }, [bookName]); // bookName이 변경될 때마다 재실행

  useEffect(() => {
    if (modalOpen && titleRef.current) {
      // 타이틀 위치로 스크롤 이동
      const y = titleRef.current.getBoundingClientRect().top + window.scrollY - 16; // 약간의 여유
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [modalOpen]);

  // 스크롤 감지 - 위로가기 버튼 표시/숨김
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 200);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지네이션 계산
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 항목 수 변경 핸들러
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 첫 페이지로 리셋
  };

  // 비밀번호 인증 처리
  const handlePasswordAuth = () => {
    if (password === currentPassword) {
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
      
      // 인증 성공 시 대기 중인 작업 실행
      if (pendingAction) {
        if (pendingAction.type === 'edit') {
          setEditId(pendingAction.rowId);
          setEditRow(pendingAction.rowData!);
        } else if (pendingAction.type === 'delete') {
          setDeleteId(pendingAction.rowId);
        }
        setPendingAction(null);
      }
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEditClick = (rowId: string, rowData: EditRowType) => {
    setPendingAction({ type: 'edit', rowId, rowData });
    setShowPasswordModal(true);
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = (rowId: string) => {
    setPendingAction({ type: 'delete', rowId });
    setShowPasswordModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-900" style={{ backgroundColor: '#292828' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center text-blue-400 hover:underline">
              <ChevronLeft className="w-5 h-5 mr-1" /> HOME
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/read" className="text-slate-400 hover:text-white">READ</Link>
          </div>
          <h2 ref={titleRef} className="text-2xl font-bold text-white">{bookName} 테이블 리스트</h2>
        </div>
        {/* 검색 필드 */}
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="검색..."
                className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
        {/* 테이블 리스트 */}
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
          <table className="min-w-full text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-900/80">
                <th className="px-4 py-3 text-left max-w-xs">
                  <div className="truncate" title="책명">책명</div>
                </th>
                <th className="px-4 py-3 text-left max-w-xs">
                  <div className="truncate" title="장">장</div>
                </th>
                <th className="px-4 py-3 text-left max-w-xs">
                  <div className="truncate" title="파일명">파일명</div>
                </th>
                <th className="px-4 py-3 text-center max-w-xs">
                  <div className="truncate" title="파일보기">파일보기</div>
                </th>
                <th className="px-4 py-3 text-center max-w-xs">
                  <div className="truncate" title="다운로드">다운로드</div>
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-center max-w-xs">
                  <div className="truncate" title="관리">관리</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">로딩 중...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="text-center py-8 text-red-500">{error}</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터가 없습니다.</td></tr>
              ) : currentData.map((row) => (
                <tr key={row.id} className="border-t border-slate-700 hover:bg-slate-700/20">
                  {/* 책명: 라우트 파라미터 사용 */}
                  <td className="px-4 py-2 font-semibold max-w-xs">
                    <div className="truncate" title={bookName}>
                      {bookName}
                    </div>
                  </td>
                  {/* 장 */}
                  <td className="px-4 py-2">
                    {editId === row.id ? (
                      <input
                        className="w-12 px-2 py-1 rounded border border-slate-400"
                        style={{ color: '#b3b1b1' }}
                        type="number"
                        min={1}
                        value={editRow?.chapter}
                        onChange={e => setEditRow({ ...editRow!, chapter: Number(e.target.value) })}
                      />
                    ) : (
                      `${row.chapter}장`
                    )}
                  </td>
                  {/* 파일명 */}
                  <td className="px-4 py-2 max-w-xs">
                    {editId === row.id ? (
                      <input
                        className="w-32 px-2 py-1 rounded border border-slate-400"
                        style={{ color: '#b3b1b1' }}
                        value={editRow?.file_name}
                        onChange={e => setEditRow({ ...editRow!, file_name: e.target.value })}
                      />
                    ) : (
                      <div className="truncate" title={row.file_name}>
                        {row.file_name}
                      </div>
                    )}
                  </td>
                  {/* 파일보기 */}
                  <td className="px-4 py-2 text-center">
                    <button
                      className="text-blue-400 hover:text-blue-200"
                      onClick={async () => {
                        setLoading(true);
                        setError(null);
                        // Storage에서 파일 fetch (html)
                        const { data: fileData, error } = await supabase
                          .storage
                          .from('biblefiles')
                          .download(row.storage_path);
                        if (error) {
                          setError('파일보기 실패: ' + error.message);
                          setModalHtml('');
                        } else if (fileData) {
                          const text = await fileData.text();
                          setModalHtml(text);
                        }
                        setModalFileName(row.file_name);
                        setModalOpen(true);
                        setLoading(false);
                      }}
                      title="파일보기"
                    >
                      <Eye className="inline w-3 h-3 md:w-5 md:h-5" />
                    </button>
                  </td>
                  {/* 다운로드 */}
                  <td className="px-4 py-2 text-center">
                    <button
                      className="text-purple-400 hover:text-purple-200"
                      onClick={() => {
                        setDownloadPath(row.storage_path);
                        setDownloadFileName(row.file_name);
                      }}
                      title="다운로드"
                    >
                      <Download className="inline w-3 h-3 md:w-5 md:h-5" />
                    </button>
                  </td>
                  {/* 관리(수정/삭제) */}
                  <td className="hidden md:table-cell px-4 py-2 text-center space-x-2">
                    {editId === row.id ? (
                      <>
                        <button
                          className="text-green-500 hover:text-green-700"
                          onClick={async () => {
                            setLoading(true);
                            setError(null);
                            const { error } = await supabase
                              .from('b_materials')
                              .update({
                                chapter: editRow!.chapter,
                                file_name: editRow!.file_name,
                              })
                              .eq('id', row.id);
                            if (error) {
                              setError('수정 실패: ' + error.message);
                            } else {
                              // 성공 시 데이터 refetch
                              const { data: rows, error: fetchError } = await supabase
                                .from('b_materials')
                                .select('id, chapter, file_name, storage_path')
                                .order('chapter', { ascending: true });
                              if (fetchError) {
                                setError(fetchError.message);
                                setData([]);
                              } else {
                                setData(rows || []);
                              }
                              setEditId(null);
                              setEditRow(null);
                            }
                            setLoading(false);
                          }}
                          title="저장"
                        >
                          <Check className="inline w-3 h-3 md:w-5 md:h-5" />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={() => {
                            setEditId(null);
                            setEditRow(null);
                          }}
                          title="취소"
                        >
                          <XIcon className="inline w-3 h-3 md:w-5 md:h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-green-400 hover:text-green-200"
                          onClick={() => handleEditClick(row.id, { chapter: row.chapter, file_name: row.file_name })}
                          title="수정"
                        >
                          <Edit className="inline w-3 h-3 md:w-5 md:h-5" />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-200"
                          onClick={() => handleDeleteClick(row.id)}
                          title="삭제"
                        >
                          <Trash2 className="inline w-3 h-3 md:w-5 md:h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 페이지네이션/항목보기 */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 space-y-2 md:space-y-0">
          {/* 전체 데이터 수 표시 */}
          <div className="text-slate-400 text-xs md:text-sm">
            총 {data.length}개 항목 중 {startIndex + 1}-{Math.min(endIndex, data.length)}개 표시
          </div>
          
          {/* 페이지네이션 컨트롤 */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* 페이지 번호 네비게이션 */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-1 md:space-x-2">
                {/* 이전 페이지 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  이전
                </button>
                
                {/* 페이지 번호들 */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                {/* 다음 페이지 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  다음
                </button>
              </div>
            )}
            
            {/* 항목보기 선택 */}
            <div className="flex items-center space-x-1 md:space-x-2">
              <span className="text-slate-400 text-xs md:text-sm">항목보기:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="bg-slate-800 text-white border border-slate-700 rounded px-1 py-1 md:px-2 md:py-1 text-xs md:text-sm"
              >
                <option value={10}>10개</option>
                <option value={20}>20개</option>
                <option value={30}>30개</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* 위로가기 버튼 */}
      {showScrollToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="위로가기"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
      {/* HtmlPreviewModal은 이제 전체화면 오버레이로만 동작하므로, 별도 중앙정렬/여백/스크롤 props/스타일 불필요 */}
      <HtmlPreviewModal
        open={modalOpen}
        initialHtml={modalHtml}
        fileName={modalFileName}
        onClose={() => setModalOpen(false)}
      />
      {/* 삭제 확인 모달 */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-xl p-8 min-w-[320px] text-center">
            <div className="mb-6 text-lg font-bold text-gray-800">정말 삭제하시겠습니까?</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded bg-red-500 text-white font-bold hover:bg-red-600"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  const { error } = await supabase
                    .from('b_materials')
                    .delete()
                    .eq('id', deleteId!);
                  if (error) {
                    setError('삭제 실패: ' + error.message);
                  } else {
                    // 성공 시 데이터 refetch
                    const { data: rows, error: fetchError } = await supabase
                      .from('b_materials')
                      .select('id, chapter, file_name, storage_path')
                      .order('chapter', { ascending: true });
                    if (fetchError) {
                      setError(fetchError.message);
                      setData([]);
                    } else {
                      setData(rows || []);
                    }
                  }
                  setDeleteId(null);
                  setLoading(false);
                }}
              >삭제</button>
              <button
                className="px-6 py-2 rounded bg-gray-300 text-gray-800 font-bold hover:bg-gray-400"
                onClick={() => setDeleteId(null)}
              >취소</button>
            </div>
          </div>
        </div>
      )}
      {/* 다운로드 확인 모달 */}
      {downloadPath && downloadFileName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-xl p-8 min-w-[320px] text-center">
            <div className="mb-6 text-lg font-bold text-gray-800">정말 다운로드 하시겠습니까?</div>
            <div className="mb-4 text-slate-600">{downloadFileName}</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded bg-purple-500 text-white font-bold hover:bg-purple-600"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  const { data: fileData, error } = await supabase
                    .storage
                    .from('biblefiles')
                    .download(downloadPath);
                  if (error) {
                    setError('다운로드 실패: ' + error.message);
                  } else if (fileData) {
                    const blob = fileData instanceof Blob ? fileData : new Blob([fileData]);
                    saveAs(blob, downloadFileName);
                  }
                  setLoading(false);
                  setDownloadPath(null);
                  setDownloadFileName(null);
                }}
              >다운로드</button>
              <button
                className="px-6 py-2 rounded bg-gray-300 text-gray-800 font-bold hover:bg-gray-400"
                onClick={() => {
                  setDownloadPath(null);
                  setDownloadFileName(null);
                }}
              >취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 인증 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px]">
            <div className="text-white text-lg font-bold mb-2 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-400" />
              관리자 인증
            </div>
            <div className="text-slate-300 mb-4">
              {pendingAction?.type === 'edit' ? '수정' : '삭제'} 작업을 수행하려면 관리자 비밀번호를 입력하세요.
            </div>
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
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                  setPendingAction(null);
                }}
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