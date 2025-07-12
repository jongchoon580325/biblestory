'use client';

import React, { useState, useRef } from "react";
import Card from './ui/card';
import Button from './ui/button';
import Icon from './ui/icon';
import Modal from './ui/modal';
import useMediaQuery from './useMediaQuery';
import JSZip from 'jszip';
import { supabase } from '../app/supabaseClient';
import Toast from './ui/toast';
import CategoryManager from './category-manager';

/**
 * DataDashboard - 데이터관리 대시보드 컴포넌트
 * - 좌측: 카테고리 관리(어코디언, CRUD)
 * - 우측: 데이터 내보내기/가져오기/초기화/모니터링 카드
 * - 관리자 헤더, 시스템 현황, 활동 로그 등 포함
 * - Tailwind CSS, 접근성, 확장성 고려
 */
const DataDashboard: React.FC = () => {
  // TODO: 상태, 데이터, 핸들러 등 구현 예정
  const [edgeResult, setEdgeResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const categoryManagerRef = useRef<{ fetchData: () => void }>(null);

  // Supabase Edge Function 호출 함수
  const callEdgeFunction = async () => {
    setLoading(true);
    setEdgeResult("");
    try {
      const res = await fetch(
        "https://gqfryirmszmxpgczhgcp.functions.supabase.co/hello",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      setEdgeResult(data.message || JSON.stringify(data));
    } catch (e) {
      setEdgeResult("에러 발생: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 데이터 초기화/카테고리 초기화(실데이터)
  function DataResetCard() {
    const [showResetDialog, setShowResetDialog] = useState<'data' | 'categories' | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState<null | 'data' | 'categories'>(null);
    // 더미 초기화 핸들러
    const handleReset = async (type: 'data' | 'categories') => {
      setIsResetting(true);
      setShowResetDialog(null);
      try {
        if (type === 'data') {
          // 자료/진도/파일만 삭제, 카테고리/책 보존
          await supabase.from('b_bible_contents').delete().not('id', 'is', null);
        } else if (type === 'categories') {
          // 카테고리/책/자료 전체 삭제
          await supabase.from('b_bible_contents').delete().not('id', 'is', null);
          await supabase.from('b_bible_books').delete().not('id', 'is', null);
          // 실제 카테고리 데이터 전체 삭제
          const { error } = await supabase.from('b_categories').delete().not('id', 'is', null);
          if (error) throw error;
        }
        setIsResetting(false);
        setShowSuccessModal(type);
        // 초기화 후 카테고리 목록 새로고침
        if (categoryManagerRef.current && categoryManagerRef.current.fetchData) {
          categoryManagerRef.current.fetchData();
        }
      } catch (e) {
        setIsResetting(false);
        setShowSuccessModal(null);
        alert('초기화 오류: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
      }
    };
    return (
      <Card className="mb-2 mt-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Icon name="settings" size="sm" /> 데이터/카테고리 초기화
        </h3>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <Button size="sm" variant="danger" onClick={() => setShowResetDialog('data')} disabled={isResetting} className="w-full">
              데이터 초기화
            </Button>
          </div>
          <div className="flex-1">
            <Button size="sm" variant="danger" onClick={() => setShowResetDialog('categories')} disabled={isResetting} className="w-full">
              카테고리 초기화
            </Button>
          </div>
        </div>
        <div className="text-xs text-neutral-500 mb-2">초기화 전 자동 백업, 복구 옵션 제공</div>
        <ul className="text-xs text-neutral-500 list-disc pl-4 mb-2">
          <li>데이터 초기화: 모든 자료/진도/파일 삭제, 카테고리/책 보존</li>
          <li>카테고리 초기화: 카테고리/책 삭제, 기본값 복원</li>
        </ul>
        {isResetting && (
          <div className="w-full h-2 bg-orange-200 rounded mt-2">
            <div className="h-2 bg-orange-500 rounded" style={{ width: '100%' }} />
          </div>
        )}
        {/* 확인 다이얼로그 */}
        {showResetDialog && (
          <Modal isOpen={true} onClose={() => setShowResetDialog(null)} title="초기화 확인" size="md">
            <div className="space-y-2">
              <div className="text-red-600 font-bold">정말로 {showResetDialog === 'data' ? '데이터' : '카테고리'}를 초기화하시겠습니까?</div>
              <div className="text-xs text-neutral-500">초기화 전 자동 백업이 생성되며, 이 작업은 되돌릴 수 없습니다.</div>
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="ghost" onClick={() => setShowResetDialog(null)}>취소</Button>
                <Button variant="danger" onClick={() => handleReset(showResetDialog)} loading={isResetting}>초기화 진행</Button>
              </div>
            </div>
          </Modal>
        )}
        {/* 초기화 성공 모달 */}
        {showSuccessModal && (
          <Modal isOpen={true} onClose={() => setShowSuccessModal(null)} title="초기화 완료" size="sm">
            <div className="space-y-2 text-center">
              <div className="text-2xl text-green-600">✔️</div>
              <div className="font-bold">{showSuccessModal === 'data' ? '데이터' : '카테고리'} 초기화가 완료되었습니다.</div>
              <Button variant="primary" onClick={() => setShowSuccessModal(null)} className="mt-4 w-full">확인</Button>
            </div>
          </Modal>
        )}
      </Card>
    );
  }

  // 모바일 탭 네비게이션 및 뷰 전환
  function MobileDataManagement() {
    return (
      <div className="mobile-data-management">
        {/* Mobile Tab Navigation */}
        <div className="mobile-tabs">
          <button
            className={`tab-btn ${activeMobileTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('data')}
          >
            <Icon name="settings" size="sm" />
            데이터 관리
          </button>
          <button
            className={`tab-btn ${activeMobileTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('categories')}
          >
            <Icon name="book" size="sm" />
            카테고리
          </button>
        </div>
        {/* Tab Content */}
        <div className="tab-content">
          {activeMobileTab === 'data' && (
            <div className="data-management-mobile">
              <DataExportImportCard />
              <DataResetCard />
              {/* SystemMonitorCard 삭제, 아래에 카테고리 내보내기/가져오기 UI 추가 */}
              <CategoryExportImportCard />
            </div>
          )}
          {activeMobileTab === 'categories' && (
            <div className="category-management-mobile">
              <CategoryManager />
            </div>
          )}
        </div>
      </div>
    );
  }

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeMobileTab, setActiveMobileTab] = useState<'data' | 'categories'>('data');

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-2 md:px-8">
      {/* 관리자 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="settings" size="md" />
          <h1 className="text-2xl font-bold">데이터 관리</h1>
        </div>
      </div>
      {/* 반응형: 모바일은 탭 네비게이션, 데스크탑은 2컬럼 */}
      {isMobile ? (
        <MobileDataManagement />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 data-management-layout">
          {/* 좌측: 카테고리 관리 */}
          <section className="bg-[var(--bg-card)] text-[var(--text-primary)] dark:bg-neutral-900 dark:text-white rounded-lg shadow p-4 flex flex-col min-h-[500px]">
            <CategoryManager />
          </section>
          {/* 우측: 데이터 관리/모니터링 */}
          <section className="bg-[var(--bg-card)] text-[var(--text-primary)] dark:bg-neutral-900 dark:text-white rounded-lg shadow p-4 flex flex-col min-h-[500px]">
            <DataExportImportCard />
            <DataResetCard />
            {/* SystemMonitorCard 삭제, 아래에 카테고리 내보내기/가져오기 UI 추가 */}
            <CategoryExportImportCard />
          </section>
        </div>
      )}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
        onClick={callEdgeFunction}
        disabled={loading}
      >
        {loading ? "Edge Function 호출 중..." : "Edge Function 테스트 호출"}
      </button>
      {edgeResult && (
        <div className="mt-2 text-green-700">{edgeResult}</div>
      )}
    </div>
  );
};

export default DataDashboard; 

// CategoryExportImportCard 컴포넌트 정의 추가
function CategoryExportImportCard() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState(0);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [showExportConfirm, setShowExportConfirm] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // 내보내기 핸들러
  const handleCategoryExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      setExportProgress(20);
      // Supabase에서 실제 카테고리 데이터 fetch
      const { data, error } = await supabase
        .from('b_categories')
        .select('*')
        .order('order_index');
      if (error) throw new Error(error.message);
      setExportProgress(60);
      const exportData = {
        categories: data,
        exportedAt: new Date().toISOString(),
      };
      // JSON 파일로 저장
      const today = new Date().toISOString().slice(0,10);
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${today}-카테고리-내보내기.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportProgress(100);
      setIsExporting(false);
      setExportProgress(0);
      setToastMsg('카테고리 내보내기 완료!');
    } catch (e) {
      setIsExporting(false);
      setExportProgress(0);
      setToastMsg('내보내기 오류: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
    }
  };
  // 가져오기 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setToastMsg('JSON 파일만 업로드 가능합니다.');
      return;
    }
    setUploadedFile(file);
    setShowPreview(true);
  };
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const handleCategoryImport = async () => {
    if (!uploadedFile) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);
    try {
      setImportProgress(20);
      // JSON 파일 파싱
      const jsonStr = await uploadedFile.text();
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        throw new Error('JSON 파싱 오류: 올바른 JSON 형식이 아닙니다.');
      }
      if (!parsed.categories || !Array.isArray(parsed.categories)) throw new Error('카테고리 데이터가 올바르지 않습니다.');
      const categories = parsed.categories;
      // 필수 필드/타입 체크
      for (const cat of categories) {
        if (!cat.name || typeof cat.name !== 'string') throw new Error('카테고리명 누락/오류');
        if (!cat.type || (cat.type !== 'group' && cat.type !== 'item')) throw new Error('카테고리 타입 오류');
      }
      setImportProgress(60);
      // 기존 카테고리 전체 삭제
      const { error: delError } = await supabase.from('b_categories').delete().not('id', 'is', null);
      if (delError) throw delError;
      setImportProgress(80);
      // 새 카테고리 일괄 insert (id, parent_id, name, type, order_index만 포함, 순서 보장)
      const allowedKeys = ['id', 'name', 'type', 'parent_id', 'order_index'];
      // 1. parent_id가 null인 항목(최상위) 먼저
      const topLevel = categories.filter((cat: Record<string, unknown>) => !cat.parent_id);
      const children = categories.filter((cat: Record<string, unknown>) => cat.parent_id);
      // 2. 필터링 함수
      const filterKeys = (cat: Record<string, unknown>) => {
        const filtered: Record<string, unknown> = {};
        for (const key of allowedKeys) {
          if (cat[key] !== undefined) filtered[key] = cat[key];
        }
        if (!('parent_id' in filtered)) filtered.parent_id = null;
        if (typeof filtered.order_index !== 'number') filtered.order_index = 0;
        return filtered;
      };
      // 3. insert 순서대로 실행
      let insError = null;
      // 3-1. 최상위 카테고리 insert
      if (topLevel.length > 0) {
        const { error } = await supabase.from('b_categories').insert(topLevel.map(filterKeys));
        if (error) insError = error;
      }
      // 3-2. 하위 카테고리 insert
      if (!insError && children.length > 0) {
        const { error } = await supabase.from('b_categories').insert(children.map(filterKeys));
        if (error) insError = error;
      }
      if (insError) {
        console.error('카테고리 insert 에러:', insError);
        setImportResult({ success: false, message: insError.message });
        return;
      }
      setImportProgress(100);
      setIsImporting(false);
      setImportProgress(0);
      setUploadedFile(null);
      setShowPreview(false);
      setImportResult({ success: true, message: '카테고리 가져오기 완료!' });
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setIsImporting(false);
      setImportProgress(0);
      setImportResult({ success: false, message: e instanceof Error ? e.message : '가져오기 오류' });
    }
  };
  return (
    <Card className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="book" size="lg" />
        <h3 className="font-semibold">📦 카테고리 항목 내보내기/가져오기</h3>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Button variant="primary" onClick={() => setShowExportConfirm(true)} loading={isExporting} disabled={isExporting} className="w-full !hover:bg-blue-600">
            <Icon name="download" size="sm" /> 내보내기
          </Button>
          {isExporting && (
            <div className="w-full h-2 bg-gray-200 rounded mt-2">
              <div className="h-2 bg-blue-500 rounded" style={{ width: `${exportProgress}%` }} />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="mb-2 w-full"
            disabled={isImporting}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <Button variant="primary" onClick={handleCategoryImport} loading={isImporting} disabled={isImporting} className="w-full !hover:bg-blue-600">
            <Icon name="upload" size="sm" /> 가져오기
          </Button>
          {isImporting && (
            <div className="w-full h-2 bg-green-500 rounded mt-2" style={{ width: `${importProgress}%` }} />
          )}
        </div>
      </div>
      {/* 내보내기 확인 모달 */}
      {showExportConfirm && (
        <Modal isOpen={true} onClose={() => setShowExportConfirm(false)} title="정말 내보내기 하시겠습니까?" size="md">
          <div className="space-y-2 text-center">
            <div className="text-2xl">📦</div>
            <div className="font-bold">카테고리 데이터를 JSON 파일로 내보냅니다.</div>
            <div className="text-sm text-neutral-400">진행하시겠습니까?</div>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="ghost" onClick={() => setShowExportConfirm(false)}>취소</Button>
              <Button variant="primary" onClick={() => { setShowExportConfirm(false); handleCategoryExport(); }}>내보내기</Button>
            </div>
          </div>
        </Modal>
      )}
      {/* 토스트 메시지 */}
      {toastMsg && <Toast type="success" title="알림" message={toastMsg} />}
      {/* 미리보기 모달 */}
      {showPreview && uploadedFile && (
        <Modal isOpen={true} onClose={() => setShowPreview(false)} title="카테고리 가져오기 미리보기" size="md">
          <div className="space-y-2">
            <div>업로드 파일: <b>{uploadedFile.name}</b></div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="ghost" onClick={() => setShowPreview(false)}>취소</Button>
              <Button variant="primary" onClick={() => { setShowPreview(false); handleCategoryImport(); }}>가져오기 시작</Button>
            </div>
          </div>
        </Modal>
      )}
      {/* 가져오기 결과 모달 */}
      {importResult && (
        <Modal isOpen={true} onClose={() => setImportResult(null)} title={importResult.success ? '가져오기 성공' : '가져오기 실패'} size="sm">
          <div className="space-y-2 text-center">
            <div className={`text-2xl ${importResult.success ? 'text-green-600' : 'text-red-600'}`}>{importResult.success ? '✔️' : '❌'}</div>
            <div className="font-bold">{importResult.message}</div>
            <Button variant="primary" onClick={() => setImportResult(null)} className="mt-4 w-full">확인</Button>
          </div>
        </Modal>
      )}
    </Card>
  );
} 

// DataExportCard, DataImportCard를 하나의 DataExportImportCard로 통합
// 아래에 새로운 DataExportImportCard 컴포넌트 정의 추가
// 기존 <DataExportCard /> <DataImportCard /> 호출부를 <DataExportImportCard />로 교체
function DataExportImportCard() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [importProgress, setImportProgress] = React.useState(0);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [showExportConfirm, setShowExportConfirm] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // 더미 미리보기 데이터
  const exportPreview = {
    totalContent: 123,
    totalCategories: 2,
    totalSize: '1.2MB',
    lastUpdate: new Date(),
    includedItems: {
      categories: ['구약 성경', '신약 성경'],
      books: ['창세기', '출애굽기', '마태복음', '마가복음'],
      contentTypes: ['본문', '이미지', '첨부파일'],
    },
  };
  // 내보내기 핸들러
  const handleDataExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      setExportProgress(10);
      setExportProgress(30);
      setExportProgress(50);
      setExportProgress(70);
      // 더미 데이터 JSON
      const exportData = {
        categories: exportPreview.includedItems.categories,
        books: exportPreview.includedItems.books,
        contents: [],
        exportedAt: new Date().toISOString(),
      };
      // JSZip으로 압축
      const zip = new JSZip();
      zip.file('bible-data.json', JSON.stringify(exportData, null, 2));
      const blob = await zip.generateAsync({ type: 'blob' });
      setExportProgress(100);
      // 파일명: yyyy-mm-dd-성경데이터-내보내기.zip
      const today = new Date().toISOString().slice(0,10);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${today}-성경데이터-내보내기.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setExportProgress(0);
      setToastMsg('데이터 내보내기(백업) 완료!');
    } catch (e) {
      setIsExporting(false);
      setExportProgress(0);
      setToastMsg('내보내기 오류: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
    }
  };
  // 가져오기 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      setToastMsg('ZIP 파일만 업로드 가능합니다.');
      return;
    }
    setUploadedFile(file);
  };
  const handleDataImport = async () => {
    if (!uploadedFile) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }
    setIsImporting(true);
    setImportProgress(0);
    try {
      setImportProgress(10);
      setImportProgress(30);
      setImportProgress(50);
      setImportProgress(70);
      setImportProgress(100);
      setIsImporting(false);
      setImportProgress(0);
      setUploadedFile(null);
      setToastMsg('데이터 가져오기(복원) 완료!');
    } catch (e) {
      setIsImporting(false);
      setImportProgress(0);
      setToastMsg('가져오기 오류: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
    }
  };
  return (
    <Card className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="download" size="lg" />
        <h3 className="font-semibold">📤 데이터 내보내기/가져오기</h3>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {/* 내보내기 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Button variant="primary" onClick={() => setShowExportConfirm(true)} loading={isExporting} disabled={isExporting} className="w-full !hover:bg-blue-600">
            <Icon name="download" size="sm" /> 내보내기
          </Button>
          {isExporting && (
            <div className="w-full h-2 bg-blue-200 rounded mt-2">
              <div className="h-2 bg-blue-500 rounded" style={{ width: `${exportProgress}%` }} />
            </div>
          )}
        </div>
        {/* 가져오기 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <input
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            className="mb-2 w-full"
            disabled={isImporting}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <Button variant="primary" onClick={handleDataImport} loading={isImporting} disabled={isImporting} className="w-full !hover:bg-blue-600">
            <Icon name="upload" size="sm" /> 가져오기
          </Button>
          {isImporting && (
            <div className="w-full h-2 bg-green-200 rounded mt-2">
              <div className="h-2 bg-green-500 rounded" style={{ width: `${importProgress}%` }} />
            </div>
          )}
        </div>
      </div>
      {/* 내보내기 확인 모달 */}
      {showExportConfirm && (
        <Modal isOpen={true} onClose={() => setShowExportConfirm(false)} title="정말 내보내기 하시겠습니까?" size="md">
          <div className="space-y-2 text-center">
            <div className="text-2xl">📦</div>
            <div className="font-bold">데이터를 ZIP 파일로 내보냅니다.</div>
            <div className="text-sm text-neutral-400">진행하시겠습니까?</div>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="ghost" onClick={() => setShowExportConfirm(false)}>취소</Button>
              <Button variant="primary" onClick={() => { setShowExportConfirm(false); handleDataExport(); }}>내보내기</Button>
            </div>
          </div>
        </Modal>
      )}
      {/* 토스트 메시지 */}
      {toastMsg && <Toast type="success" title="알림" message={toastMsg} />}
    </Card>
  );
} 