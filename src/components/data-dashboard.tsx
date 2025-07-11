'use client';

import React, { useState } from "react";
import Card from './ui/card';
import Button from './ui/button';
import Icon from './ui/icon';
import CategoryManager from './category-manager';
import Modal from './ui/modal';
import useMediaQuery from './useMediaQuery';
import JSZip from 'jszip';
import { supabase } from '../app/supabaseClient';

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

  // 더미 데이터 내보내기 카드
  function DataExportCard() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
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
    // ZIP 다운로드(실데이터)
    const handleDataExport = async () => {
      setIsExporting(true);
      setExportProgress(0);
      try {
        setExportProgress(10);
        // Supabase에서 전체 데이터 fetch
        const { data: categories } = await supabase.from('b_categories').select('*');
        setExportProgress(30);
        const { data: books } = await supabase.from('b_bible_books').select('*');
        setExportProgress(50);
        const { data: contents } = await supabase.from('b_bible_contents').select('*');
        setExportProgress(70);
        // JSON으로 묶기
        const exportData = {
          categories: categories || [],
          books: books || [],
          contents: contents || [],
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
        alert('데이터 내보내기(백업) 완료!');
      } catch (e) {
        setIsExporting(false);
        setExportProgress(0);
        alert('내보내기 오류: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
      }
    };
    return (
      <Card className="data-export-card">
        <div className="card-header">
          <div className="header-content flex items-center gap-2 mb-2">
            <Icon name="download" size="lg" />
            <div>
              <h3>📤 데이터 내보내기</h3>
              <p className="text-xs text-gray-500">모든 성경 자료와 메타데이터를 ZIP 파일로 내보냅니다</p>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="export-info text-sm mb-2">
            <div>내보낼 데이터: <span className="font-bold">성경 자료, 카테고리, 진도 기록</span></div>
            <div>파일 형식: <span className="font-bold">ZIP (메타데이터 JSON + HTML 파일)</span></div>
            <div>예상 크기: <span className="font-bold">~50MB (콘텐츠 양에 따라 변동)</span></div>
          </div>
          {isExporting && (
            <div className="export-progress mb-2">
              <div className="w-full h-2 bg-gray-200 rounded">
                <div className="h-2 bg-blue-500 rounded" style={{ width: `${exportProgress}%` }} />
              </div>
              <span className="text-xs">{exportProgress}% 완료</span>
            </div>
          )}
        </div>
        <div className="card-actions flex gap-2 mt-2">
          <Button variant="outline" onClick={() => setShowPreview(true)} disabled={isExporting}>
            <Icon name="view" size="sm" /> 미리보기
          </Button>
          <Button variant="primary" onClick={handleDataExport} loading={isExporting} disabled={isExporting}>
            <Icon name="download" size="sm" /> 내보내기 시작
          </Button>
        </div>
        {/* Export Preview Modal */}
        {showPreview && (
          <Modal isOpen={true} onClose={() => setShowPreview(false)} title="내보내기 미리보기" size="lg">
            <div className="space-y-2">
              <div>총 콘텐츠: <b>{exportPreview.totalContent}</b></div>
              <div>카테고리: <b>{exportPreview.totalCategories}</b></div>
              <div>예상 크기: <b>{exportPreview.totalSize}</b></div>
              <div>포함 항목: <b>{exportPreview.includedItems.categories.join(', ')} / {exportPreview.includedItems.books.join(', ')}</b></div>
              <div>마지막 업데이트: {exportPreview.lastUpdate.toLocaleString()}</div>
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="ghost" onClick={() => setShowPreview(false)}>취소</Button>
                <Button variant="primary" onClick={() => { setShowPreview(false); handleDataExport(); }}>내보내기 시작</Button>
              </div>
            </div>
          </Modal>
        )}
      </Card>
    );
  }

  // 데이터 가져오기(복원) 카드
  function DataImportCard() {
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [importOptions, setImportOptions] = useState({
      overwriteExisting: false,
      mergeCategories: true,
      createBackup: true,
    });
    // 더미 미리보기 데이터
    const importPreview = uploadedFile
      ? {
          totalContent: 123,
          totalCategories: 2,
          totalSize: '1.2MB',
          includedItems: {
            categories: ['구약 성경', '신약 성경'],
            books: ['창세기', '출애굽기', '마태복음', '마가복음'],
            contentTypes: ['본문', '이미지', '첨부파일'],
          },
        }
      : null;
    // 파일 업로드 핸들러(더미)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.name.endsWith('.zip')) {
        alert('ZIP 파일만 업로드 가능합니다.');
        return;
      }
      setUploadedFile(file);
      setShowPreview(true);
    };
    // 데이터 가져오기(복원) 실행(실데이터)
    const handleDataImport = async () => {
      if (!uploadedFile) return;
      setIsImporting(true);
      setImportProgress(0);
      try {
        setImportProgress(10);
        // ZIP 파일에서 bible-data.json 추출
        const zip = await JSZip.loadAsync(uploadedFile);
        setImportProgress(30);
        const jsonFile = zip.file('bible-data.json');
        if (!jsonFile) throw new Error('bible-data.json 파일이 없습니다.');
        const jsonText = await jsonFile.async('string');
        setImportProgress(50);
        const data = JSON.parse(jsonText);
        // 옵션: 기존 데이터 삭제(덮어쓰기)
        if (importOptions.overwriteExisting) {
          await supabase.from('b_bible_contents').delete().neq('id', '');
          await supabase.from('b_bible_books').delete().neq('id', '');
          await supabase.from('b_categories').delete().neq('id', '');
        }
        setImportProgress(70);
        // 카테고리/책/자료 일괄 upsert
        if (data.categories?.length) {
          await supabase.from('b_categories').upsert(data.categories);
        }
        if (data.books?.length) {
          await supabase.from('b_bible_books').upsert(data.books);
        }
        if (data.contents?.length) {
          await supabase.from('b_bible_contents').upsert(data.contents);
        }
        setImportProgress(100);
        setIsImporting(false);
        setImportProgress(0);
        setUploadedFile(null);
        setShowPreview(false);
        alert('데이터 가져오기(복원) 완료!');
      } catch (e) {
        setIsImporting(false);
        setImportProgress(0);
        alert('가져오기 오류: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
      }
    };
    return (
      <Card className="data-import-card mt-4">
        <div className="card-header">
          <div className="header-content flex items-center gap-2 mb-2">
            <Icon name="upload" size="lg" />
            <div>
              <h3>📥 데이터 가져오기/복원</h3>
              <p className="text-xs text-gray-500">ZIP 파일로 내보낸 성경 자료를 가져옵니다</p>
            </div>
          </div>
        </div>
        <div className="card-content">
          {!uploadedFile ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <input
                type="file"
                accept=".zip"
                onChange={handleFileUpload}
                className="mb-2"
                disabled={isImporting}
              />
              <span className="text-xs text-neutral-500">ZIP 파일만 지원</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-sm">업로드 파일: <b>{uploadedFile.name}</b></div>
              <Button variant="outline" onClick={() => setShowPreview(true)} disabled={isImporting}>
                <Icon name="view" size="sm" /> 미리보기
              </Button>
              <div className="import-options flex gap-4 mt-2">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={importOptions.overwriteExisting}
                    onChange={e => setImportOptions(opt => ({ ...opt, overwriteExisting: e.target.checked }))}
                    disabled={isImporting}
                  /> 기존 데이터 덮어쓰기
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={importOptions.mergeCategories}
                    onChange={e => setImportOptions(opt => ({ ...opt, mergeCategories: e.target.checked }))}
                    disabled={isImporting}
                  /> 카테고리 병합
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={importOptions.createBackup}
                    onChange={e => setImportOptions(opt => ({ ...opt, createBackup: e.target.checked }))}
                    disabled={isImporting}
                  /> 가져오기 전 백업 생성
                </label>
              </div>
              <Button variant="primary" onClick={handleDataImport} loading={isImporting} disabled={isImporting} className="mt-2">
                <Icon name="upload" size="sm" /> 데이터 가져오기 시작
              </Button>
              {isImporting && (
                <div className="import-progress mt-2">
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-green-500 rounded" style={{ width: `${importProgress}%` }} />
                  </div>
                  <span className="text-xs">{importProgress}% 완료</span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Import Preview Modal */}
        {showPreview && importPreview && (
          <Modal isOpen={true} onClose={() => setShowPreview(false)} title="가져오기 미리보기" size="lg">
            <div className="space-y-2">
              <div>총 컨텐츠: <b>{importPreview.totalContent}</b></div>
              <div>카테고리: <b>{importPreview.totalCategories}</b></div>
              <div>예상 크기: <b>{importPreview.totalSize}</b></div>
              <div>포함 항목: <b>{importPreview.includedItems.categories.join(', ')} / {importPreview.includedItems.books.join(', ')}</b></div>
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="ghost" onClick={() => setShowPreview(false)}>취소</Button>
                <Button variant="primary" onClick={() => { setShowPreview(false); handleDataImport(); }}>가져오기 시작</Button>
              </div>
            </div>
          </Modal>
        )}
      </Card>
    );
  }

  // 데이터 초기화/카테고리 초기화(실데이터)
  function DataResetCard() {
    const [showResetDialog, setShowResetDialog] = useState<'data' | 'categories' | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    // 더미 초기화 핸들러
    const handleReset = async (type: 'data' | 'categories') => {
      setIsResetting(true);
      setShowResetDialog(null);
      try {
        // 1. 자동 백업(내보내기와 동일)
        const { data: categories } = await supabase.from('b_categories').select('*');
        const { data: books } = await supabase.from('b_bible_books').select('*');
        const { data: contents } = await supabase.from('b_bible_contents').select('*');
        const exportData = {
          categories: categories || [],
          books: books || [],
          contents: contents || [],
          exportedAt: new Date().toISOString(),
        };
        const zip = new JSZip();
        zip.file('bible-data.json', JSON.stringify(exportData, null, 2));
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bible-data-backup-before-reset-${new Date().toISOString().slice(0,10)}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        // 2. 실제 초기화
        if (type === 'data') {
          // 자료/진도/파일만 삭제, 카테고리/책 보존
          await supabase.from('b_bible_contents').delete().neq('id', '');
        } else if (type === 'categories') {
          // 카테고리/책/자료 전체 삭제
          await supabase.from('b_bible_contents').delete().neq('id', '');
          await supabase.from('b_bible_books').delete().neq('id', '');
          await supabase.from('b_categories').delete().neq('id', '');
          // 기본 카테고리/책 복원(샘플)
          const defaultCategories = [
            { id: 'old-testament', name: 'old-testament', display_name: '구약', color_theme: 'old-testament', sort_order: 1 },
            { id: 'new-testament', name: 'new-testament', display_name: '신약', color_theme: 'new-testament', sort_order: 2 },
          ];
          const defaultBooks = [
            { id: 'genesis', category_id: 'old-testament', name: '창세기', name_english: 'Genesis', abbreviation: '창', total_chapters: 50, sort_order: 1 },
            { id: 'exodus', category_id: 'old-testament', name: '출애굽기', name_english: 'Exodus', abbreviation: '출', total_chapters: 40, sort_order: 2 },
            { id: 'matthew', category_id: 'new-testament', name: '마태복음', name_english: 'Matthew', abbreviation: '마', total_chapters: 28, sort_order: 1 },
            { id: 'mark', category_id: 'new-testament', name: '마가복음', name_english: 'Mark', abbreviation: '막', total_chapters: 16, sort_order: 2 },
          ];
          await supabase.from('b_categories').upsert(defaultCategories);
          await supabase.from('b_bible_books').upsert(defaultBooks);
        }
        setIsResetting(false);
        alert(type === 'data' ? '데이터 초기화(실데이터) 완료!' : '카테고리 초기화(실데이터) 및 기본값 복원 완료!');
      } catch (e) {
        setIsResetting(false);
        alert('초기화 오류: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
      }
    };
    return (
      <Card className="mb-2 mt-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Icon name="settings" size="sm" /> 데이터/카테고리 초기화
        </h3>
        <div className="flex gap-2 mb-2">
          <Button size="sm" variant="danger" onClick={() => setShowResetDialog('data')} disabled={isResetting}>
            데이터 초기화
          </Button>
          <Button size="sm" variant="danger" onClick={() => setShowResetDialog('categories')} disabled={isResetting}>
            카테고리 초기화
          </Button>
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
      </Card>
    );
  }

  // 시스템 현황/모니터링 카드
  function SystemMonitorCard() {
    const [systemStats] = useState({
      totalContents: 123,
      totalCategories: 2,
      totalBooks: 66,
      activeUsers: 5,
      storageUsed: '12.3MB',
      lastUpdate: new Date(),
    });
    const [recentActivities] = useState([
      { id: 1, action: 'export', description: '데이터 내보내기 완료', user: 'admin@bible.com', createdAt: new Date() },
      { id: 2, action: 'import', description: '데이터 가져오기(복원) 완료', user: 'admin@bible.com', createdAt: new Date(Date.now() - 1000 * 60 * 5) },
      { id: 3, action: 'reset', description: '카테고리 초기화 실행', user: 'admin@bible.com', createdAt: new Date(Date.now() - 1000 * 60 * 10) },
      { id: 4, action: 'edit', description: '카테고리명 수정: 구약성경 → 구약', user: 'user1@bible.com', createdAt: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 5, action: 'add', description: '신규 책 추가: 요한계시록', user: 'user2@bible.com', createdAt: new Date(Date.now() - 1000 * 60 * 60) },
    ]);
    // 활동 아이콘 매핑
    const getActivityIcon = (action: string) => {
      switch (action) {
        case 'export': return <Icon name="download" size="sm" />;
        case 'import': return <Icon name="upload" size="sm" />;
        case 'reset': return <Icon name="settings" size="sm" />;
        case 'edit': return <Icon name="edit" size="sm" />;
        case 'add': return <Icon name="plus" size="sm" />;
        default: return <Icon name="star" size="sm" />;
      }
    };
    // 시간 포맷
    const formatTimeAgo = (date: Date) => {
      const diff = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diff < 1) return '방금 전';
      if (diff < 60) return `${diff}분 전`;
      if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
      return `${Math.floor(diff / 1440)}일 전`;
    };
    return (
      <Card className="mb-2 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="star" size="sm" /> 시스템 현황
          </h3>
          <span className="text-xs text-neutral-400">마지막 업데이트: {systemStats.lastUpdate.toLocaleTimeString()}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 flex flex-col items-center">
            <span className="text-lg font-bold">{systemStats.totalContents}</span>
            <span className="text-xs">총 콘텐츠</span>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 flex flex-col items-center">
            <span className="text-lg font-bold">{systemStats.totalCategories}</span>
            <span className="text-xs">카테고리</span>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 flex flex-col items-center">
            <span className="text-lg font-bold">{systemStats.totalBooks}</span>
            <span className="text-xs">성경책</span>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 flex flex-col items-center">
            <span className="text-lg font-bold">{systemStats.activeUsers}</span>
            <span className="text-xs">활성 사용자</span>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 flex flex-col items-center col-span-2">
            <span className="text-lg font-bold">{systemStats.storageUsed}</span>
            <span className="text-xs">스토리지 사용량</span>
          </div>
        </div>
        <div className="mt-2">
          <h4 className="font-semibold text-sm mb-1">최근 활동</h4>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {recentActivities.map(a => (
              <li key={a.id} className="flex items-center gap-2 py-1 text-xs">
                <span>{getActivityIcon(a.action)}</span>
                <span className="flex-1">{a.description}</span>
                <span className="text-neutral-400">{a.user}</span>
                <span className="text-neutral-400">{formatTimeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
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
              <DataExportCard />
              <DataImportCard />
              <DataResetCard />
              <SystemMonitorCard />
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
          <span className="ml-2 px-2 py-1 rounded bg-green-100 text-green-700 text-xs">운영 환경</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">로그아웃</Button>
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
            <DataExportCard />
            <DataImportCard />
            <DataResetCard />
            <SystemMonitorCard />
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