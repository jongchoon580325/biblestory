import React, { useRef, useState } from 'react';

export default function ExportImport() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 내보내기 핸들러 (샘플)
  const handleExportData = async () => {
    setExporting(true);
    // 실제 내보내기 로직 필요 (ZIP 생성 등)
    setTimeout(() => {
      setExporting(false);
      setResult('데이터 ZIP 내보내기 완료 (샘플)');
    }, 1000);
  };

  const handleExportCategory = async () => {
    setExporting(true);
    // 실제 내보내기 로직 필요 (JSON 생성 등)
    setTimeout(() => {
      setExporting(false);
      setResult('카테고리 JSON 내보내기 완료 (샘플)');
    }, 1000);
  };

  // 가져오기 핸들러 (샘플)
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImporting(true);
    // 실제 가져오기 로직 필요
    setTimeout(() => {
      setImporting(false);
      setResult('가져오기 완료 (샘플)');
    }, 1000);
  };

  return (
    <div className="space-y-4 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
      <div className="flex space-x-2">
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition"
          onClick={handleExportData}
          disabled={exporting}
        >
          데이터 ZIP 내보내기
        </button>
        <button
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition"
          onClick={handleExportCategory}
          disabled={exporting}
        >
          카테고리 JSON 내보내기
        </button>
      </div>
      <div className="flex space-x-2 items-center">
        <input
          type="file"
          accept=".zip,.json"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImport}
        />
        <button
          className="bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-slate-600 transition"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          파일 선택
        </button>
        <span className="text-slate-400 text-sm">{importing ? '가져오는 중...' : '가져오기'}</span>
      </div>
      {result && (
        <div className="text-green-400 text-sm">{result}</div>
      )}
    </div>
  );
} 