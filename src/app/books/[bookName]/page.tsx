"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Eye, Download, Edit, Trash2, Search, ChevronLeft, Check, X as XIcon } from "lucide-react";
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
        .ilike('file_name', `00-${bookInfo.englishName}-%`) // 해당 책의 파일만 필터링
        .order('chapter', { ascending: true });
      if (error) {
        setError(error.message);
        setData([]);
      } else {
        setData(rows || []);
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

  return (
    <div className="min-h-screen bg-slate-900" style={{ backgroundColor: '#292828' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center text-blue-400 hover:underline">
            <ChevronLeft className="w-5 h-5 mr-1" /> HOME
          </Link>
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
          <table className="min-w-full text-sm text-slate-300">
            <thead>
              <tr className="bg-slate-900/80">
                <th className="px-4 py-3 text-left">책명</th>
                <th className="px-4 py-3 text-left">장</th>
                <th className="px-4 py-3 text-left">파일명</th>
                <th className="px-4 py-3 text-center">파일보기</th>
                <th className="px-4 py-3 text-center">다운로드</th>
                <th className="px-4 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">로딩 중...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center py-8 text-red-500">{error}</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">데이터가 없습니다.</td></tr>
              ) : data.map((row) => (
                <tr key={row.id} className="border-t border-slate-700 hover:bg-slate-700/20">
                  {/* 책명: 라우트 파라미터 사용 */}
                  <td className="px-4 py-2 font-semibold">{bookName}</td>
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
                  <td className="px-4 py-2">
                    {editId === row.id ? (
                      <input
                        className="w-32 px-2 py-1 rounded border border-slate-400"
                        style={{ color: '#b3b1b1' }}
                        value={editRow?.file_name}
                        onChange={e => setEditRow({ ...editRow!, file_name: e.target.value })}
                      />
                    ) : (
                      row.file_name
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
                      <Eye className="inline w-5 h-5" />
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
                      <Download className="inline w-5 h-5" />
                    </button>
                  </td>
                  {/* 관리(수정/삭제) */}
                  <td className="px-4 py-2 text-center space-x-2">
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
                          <Check className="inline w-5 h-5" />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={() => {
                            setEditId(null);
                            setEditRow(null);
                          }}
                          title="취소"
                        >
                          <XIcon className="inline w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-green-400 hover:text-green-200"
                          onClick={() => {
                            setEditId(row.id);
                            setEditRow({ chapter: row.chapter, file_name: row.file_name });
                          }}
                          title="수정"
                        >
                          <Edit className="inline w-5 h-5" />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-200"
                          onClick={() => setDeleteId(row.id)}
                          title="삭제"
                        >
                          <Trash2 className="inline w-5 h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 페이지네이션/항목보기(목업) */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">항목보기:</span>
            <select className="bg-slate-800 text-white border border-slate-700 rounded px-2 py-1">
              <option>10개</option>
              <option>20개</option>
              <option>30개</option>
            </select>
          </div>
        </div>
        {/* 위로가기(플로팅) 버튼 자리 */}
      </div>
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
    </div>
  );
} 