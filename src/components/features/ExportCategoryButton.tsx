import React from 'react';
export function ExportCategoryButton({ onExport, loading }: { onExport: () => void; loading: boolean }) {
  return (
    <button
      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 hover:shadow-2xl hover:brightness-110 transition-all duration-200"
      onClick={onExport}
      disabled={loading}
    >
      {loading ? '내보내는 중...' : '카테고리 JSON 내보내기'}
    </button>
  );
} 