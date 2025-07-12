import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface CategoryActionsProps {
  onAdd: () => void;
  onReset?: () => void;
}

export default function CategoryActions({ onAdd, onReset }: CategoryActionsProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow text-sm"
        onClick={onAdd}
        type="button"
      >
        <Plus className="w-4 h-4" /> 추가
      </button>
      {onReset && (
        <button
          className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-800 text-white rounded shadow text-sm"
          onClick={onReset}
          type="button"
        >
          <RefreshCw className="w-4 h-4" /> 초기화
        </button>
      )}
    </div>
  );
} 