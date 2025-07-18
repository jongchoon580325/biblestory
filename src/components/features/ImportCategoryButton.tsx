import React, { useRef } from 'react';
export function ImportCategoryButton({ onImport, loading }: { onImport: (file: File) => void; loading: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        className="w-full bg-gradient-to-r from-cyan-400 to-blue-400 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 hover:shadow-2xl hover:brightness-110 transition-all duration-200"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? '가져오는 중...' : '카테고리 JSON 가져오기'}
      </button>
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileInputRef}
        onChange={e => {
          if (e.target.files && e.target.files[0]) onImport(e.target.files[0]);
        }}
      />
    </>
  );
} 