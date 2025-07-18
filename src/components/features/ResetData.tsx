import React, { useState } from 'react';

export default function ResetData() {
  const [showModal, setShowModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleReset = async () => {
    setResetting(true);
    // 실제 초기화 로직 필요
    setTimeout(() => {
      setResetting(false);
      setShowModal(false);
      setResult('초기화 완료 (샘플)');
    }, 1000);
  };

  return (
    <div className="space-y-4 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
      <button
        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition"
        onClick={() => setShowModal(true)}
        disabled={resetting}
      >
        전체 데이터/카테고리 초기화
      </button>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4">
            <div className="text-white text-lg font-bold">정말 초기화 하시겠습니까?</div>
            <div className="flex space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold"
                onClick={handleReset}
                disabled={resetting}
              >
                {resetting ? '초기화 중...' : '확인'}
              </button>
              <button
                className="bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold"
                onClick={() => setShowModal(false)}
                disabled={resetting}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      {result && (
        <div className="text-green-400 text-sm">{result}</div>
      )}
    </div>
  );
} 