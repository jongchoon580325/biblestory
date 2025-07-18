import React from 'react';
export function ResetDataButton({ onReset, loading }: { onReset: () => void; loading: boolean }) {
  return (
    <button
      className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 hover:shadow-2xl hover:brightness-110 transition-all duration-200"
      onClick={onReset}
      disabled={loading}
    >
      {loading ? '초기화 중...' : '데이터 초기화'}
    </button>
  );
} 