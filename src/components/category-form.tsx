import React, { useEffect, useState } from 'react';
import { CategoryType } from '@/types/category.types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryFormSchema } from '@/types/category.schema';
import { z } from 'zod';
// --- 임시 성경책 상수 (constants/bible-books.ts가 없을 경우 아래 사용) ---
const BIBLE_BOOKS = [
  '창세기', '출애굽기', '레위기', '민수기', '신명기',
  '여호수아', '사사기', '룻기', '사무엘상', '사무엘하',
  '열왕기상', '열왕기하', '역대상', '역대하', '에스라',
  '느헤미야', '에스더', '욥기', '시편', '잠언',
  '전도서', '아가', '이사야', '예레미야', '예레미야애가',
  '에스겔', '다니엘', '호세아', '요엘', '아모스',
  '오바댜', '요나', '미가', '나훔', '하박국',
  '스바냐', '학개', '스가랴', '말라기',
  '마태복음', '마가복음', '누가복음', '요한복음', '사도행전',
  '로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서',
  '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서',
  '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서',
  '베드로전서', '베드로후서', '요한일서', '요한이서', '요한삼서',
  '유다서', '요한계시록',
];

interface CategoryFormProps {
  onSubmit: (data: { name: string; type: CategoryType; parent_id?: string | null } | { names: string[]; type: CategoryType; parent_id?: string | null }) => void;
  onCancel: () => void;
  groups?: { id: string; name: string }[];
  isLoading?: boolean;
  initialData?: {
    name: string;
    type: CategoryType;
    parent_id?: string | null;
  };
}

type FormValues = z.infer<typeof categoryFormSchema>;

export default function CategoryForm({ onSubmit, onCancel, groups = [], isLoading, initialData }: CategoryFormProps) {
  const [multiMode, setMultiMode] = useState(false);
  const [multiInput, setMultiInput] = useState('');
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'group',
      parent_id: initialData?.parent_id ?? null,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        type: initialData.type || 'group',
        parent_id: initialData.parent_id ?? null,
      });
      setMultiMode(false);
      setMultiInput('');
    }
  }, [initialData, reset]);

  const type = watch('type');

  const handleFormSubmit = (data: FormValues) => {
    if (multiMode) {
      // 다중 입력: 줄바꿈 기준으로 분리, 공백/빈값 제거
      const names = multiInput
        .split('\n')
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      if (names.length === 0) return;
      onSubmit({ names, type: data.type, parent_id: data.type === 'item' ? data.parent_id : null });
    } else {
      onSubmit({ name: data.name.trim(), type: data.type, parent_id: data.type === 'item' ? data.parent_id : null });
    }
  };

  // 자동 성경책 입력 핸들러
  const handleAutoFillBibleBooks = () => {
    setAutoFillLoading(true);
    setTimeout(() => {
      setMultiInput(BIBLE_BOOKS.join('\n'));
      setAutoFillLoading(false);
    }, 300); // UX: 약간의 딜레이로 피드백
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-neutral-800 p-4 rounded-lg space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-semibold">카테고리 입력</label>
        <button
          type="button"
          className={`ml-auto px-2 py-1 rounded text-xs ${multiMode ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-white'}`}
          onClick={() => { setMultiMode((m) => !m); setMultiInput(''); }}
          disabled={isLoading}
        >
          {multiMode ? '단일 입력' : '여러 개 입력'}
        </button>
      </div>
      {multiMode ? (
        <>
          <div className="flex items-center gap-2">
            <label htmlFor="multi-input" className="font-semibold">카테고리명 (여러 줄 입력)</label>
            {/* 자동 성경책 입력 버튼: item 타입일 때만 노출 */}
            {watch('type') === 'item' && (
              <button
                type="button"
                className="px-2 py-1 text-xs bg-blue-100 rounded hover:bg-blue-200 disabled:opacity-50"
                onClick={handleAutoFillBibleBooks}
                disabled={autoFillLoading}
                aria-busy={autoFillLoading}
              >
                {autoFillLoading ? '입력 중...' : '자동 성경책 입력'}
              </button>
            )}
          </div>
          <textarea
            id="multi-input"
            className={`w-full border rounded p-2 min-h-[120px] ${errors.name ? 'border-red-500' : ''}`}
            value={multiInput}
            onChange={e => setMultiInput(e.target.value)}
            placeholder={"줄바꿈으로 여러 개 입력 (예: 창세기\n출애굽기 ...)"}
            aria-label="여러 카테고리명 입력"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'multi-input-error' : undefined}
            autoFocus
          />
          {errors.name && (
            <div id="multi-input-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.name.message}
            </div>
          )}
          <div className="text-xs text-neutral-400 mt-1">예: 구약\n신약\n시편</div>
        </>
      ) : (
        <div>
          <label htmlFor="name" className="font-semibold">카테고리명</label>
          <input
            id="name"
            type="text"
            className={`w-full px-3 py-2 rounded bg-neutral-900 text-white border border-neutral-700 focus:outline-none ${errors.name ? 'border-red-500' : ''}`}
            {...register('name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            autoFocus
          />
          {errors.name && (
            <div id="name-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.name.message}
            </div>
          )}
        </div>
      )}
      <div>
        <label className="block text-sm mb-1">타입</label>
        <select
          className="w-full px-3 py-2 rounded bg-neutral-900 text-white border border-neutral-700"
          {...register('type')}
          disabled={isLoading || !!initialData}
        >
          <option value="group">그룹</option>
          <option value="item">항목</option>
        </select>
        {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type.message}</div>}
      </div>
      {type === 'item' && (
        <div>
          <label className="block text-sm mb-1">상위 그룹</label>
          <select
            className="w-full px-3 py-2 rounded bg-neutral-900 text-white border border-neutral-700"
            {...register('parent_id')}
            disabled={isLoading}
          >
            <option value="">그룹 선택</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          {errors.parent_id && <div className="text-red-500 text-sm mt-1">{errors.parent_id.message}</div>}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded bg-neutral-700 text-white" disabled={isLoading}>취소</button>
        <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 text-white" disabled={isLoading}>저장</button>
      </div>
    </form>
  );
}