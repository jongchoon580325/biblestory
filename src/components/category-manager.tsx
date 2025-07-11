// 카테고리/책 어코디언 CRUD 인터페이스 - 1차 구조 구현
'use client';
import React, { useState } from 'react';
import Button from './ui/button';
import Icon from './ui/icon';
import Modal from './ui/modal';
import Input from './ui/input';
// import { Form } from './ui/form';

// 임시 타입(후속 단계에서 실제 데이터 연동)
interface BibleBook {
  id: string;
  name: string;
  nameEnglish?: string;
  abbreviation: string;
  sortOrder: number;
  totalChapters: number;
}
interface BibleCategory {
  id: string;
  name: string;
  displayName: string;
  colorTheme: string;
  sortOrder: number;
  books: BibleBook[];
}

// 더미 데이터(후속 단계에서 Supabase 연동)
const dummyCategories: BibleCategory[] = [
  {
    id: 'old-testament',
    name: 'old-testament',
    displayName: '구약 성경',
    colorTheme: 'old-testament',
    sortOrder: 1,
    books: [
      { id: 'genesis', name: '창세기', abbreviation: '창', sortOrder: 1, totalChapters: 50 },
      { id: 'exodus', name: '출애굽기', abbreviation: '출', sortOrder: 2, totalChapters: 40 },
    ],
  },
  {
    id: 'new-testament',
    name: 'new-testament',
    displayName: '신약 성경',
    colorTheme: 'new-testament',
    sortOrder: 2,
    books: [
      { id: 'matthew', name: '마태복음', abbreviation: '마', sortOrder: 1, totalChapters: 28 },
      { id: 'mark', name: '마가복음', abbreviation: '막', sortOrder: 2, totalChapters: 16 },
    ],
  },
];

// CSV 변환용 유틸 (간단 버전)
function toCSV(categories: BibleCategory[]): string {
  const rows = [
    'type,category_id,category_name,category_display_name,color_theme,sort_order,book_id,book_name,book_english,book_abbreviation,total_chapters,book_sort_order',
  ];
  categories.forEach(cat => {
    rows.push(`category,${cat.id},${cat.name},${cat.displayName},${cat.colorTheme},${cat.sortOrder},,,,,,`);
    cat.books.forEach(book => {
      rows.push(`book,${cat.id},${cat.name},${cat.displayName},${cat.colorTheme},${cat.sortOrder},${book.id},${book.name},${book.nameEnglish || ''},${book.abbreviation},${book.totalChapters},${book.sortOrder}`);
    });
  });
  return rows.join('\n');
}

function downloadCSV(data: string, filename: string) {
  const blob = new Blob(['\uFEFF' + data], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): Record<string, string>[] {
  const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const keys = header.split(',');
  return lines.map(line => {
    const values = line.split(',');
    return Object.fromEntries(keys.map((k, i) => [k, values[i] || '']));
  });
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<BibleCategory[]>(dummyCategories);
  const [expanded, setExpanded] = useState<string | null>(null);
  // 다이얼로그 상태
  const [showDialog, setShowDialog] = useState<null | { type: 'category' | 'book'; mode: 'create' | 'edit'; categoryId?: string; item?: BibleCategory | BibleBook }>(null);
  // 삭제 확인 다이얼로그 상태
  const [deleteDialog, setDeleteDialog] = useState<null | { type: 'category' | 'book'; item: BibleCategory | BibleBook; dependentCount: number }>(null);
  // CSV 업로드 상태
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[] | null>(null);
  const [csvFileName, setCsvFileName] = useState('');

  // CSV 내보내기
  const handleExportCSV = () => {
    const csv = toCSV(categories);
    downloadCSV(csv, `bible-categories-${new Date().toISOString().slice(0,10)}.csv`);
  };
  // CSV 업로드
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const text = await file.text();
    setCsvPreview(parseCSV(text).slice(0, 5)); // 미리보기 5행
  };
  // CSV 가져오기(더미: 상태 반영)
  const handleImportCSV = () => {
    if (!csvPreview) return;
    // CSV 데이터를 카테고리/책 구조로 변환
    const cats: BibleCategory[] = [];
    let lastCat: BibleCategory | null = null;
    csvPreview.forEach(row => {
      if (row.type === 'category') {
        lastCat = {
          id: row.category_id,
          name: row.category_name,
          displayName: row.category_display_name,
          colorTheme: row.color_theme,
          sortOrder: Number(row.sort_order) || 0,
          books: [],
        };
        cats.push(lastCat);
      } else if (row.type === 'book' && lastCat) {
        lastCat.books.push({
          id: row.book_id,
          name: row.book_name,
          nameEnglish: row.book_english,
          abbreviation: row.book_abbreviation,
          totalChapters: Number(row.total_chapters) || 1,
          sortOrder: Number(row.book_sort_order) || 0,
        });
      }
    });
    setCategories(cats);
    setCsvPreview(null);
    setCsvFileName('');
    alert('CSV 데이터 가져오기(상태 반영) 완료');
  };

  // 어코디언 토글
  const toggleAccordion = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  // 다이얼로그 열기
  const openCreateCategory = () => setShowDialog({ type: 'category', mode: 'create' });
  const openCreateBook = (categoryId: string) => setShowDialog({ type: 'book', mode: 'create', categoryId });
  const openEditCategory = (item: BibleCategory) => setShowDialog({ type: 'category', mode: 'edit', item });
  const openEditBook = (categoryId: string, item: BibleBook) => setShowDialog({ type: 'book', mode: 'edit', categoryId, item });
  const closeDialog = () => setShowDialog(null);

  // 삭제 버튼 클릭 시 다이얼로그 오픈
  const openDeleteCategory = (cat: BibleCategory) => {
    setDeleteDialog({ type: 'category', item: cat, dependentCount: cat.books.length });
  };
  const openDeleteBook = (cat: BibleCategory, book: BibleBook) => {
    // 자료 개수는 더미 0으로 처리(후속 단계에서 실제 자료 수 연동)
    setDeleteDialog({ type: 'book', item: book, dependentCount: 0 });
  };
  const closeDeleteDialog = () => setDeleteDialog(null);

  // 카테고리/책 정렬 순서 변경
  const moveCategory = (idx: number, dir: -1 | 1) => {
    setCategories(prev => {
      const arr = [...prev];
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= arr.length) return arr;
      [arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]];
      // sortOrder 재정렬
      return arr.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    });
  };
  const moveBook = (catId: string, idx: number, dir: -1 | 1) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const books = [...cat.books];
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= books.length) return cat;
      [books[idx], books[targetIdx]] = [books[targetIdx], books[idx]];
      // sortOrder 재정렬
      return { ...cat, books: books.map((b, i) => ({ ...b, sortOrder: i + 1 })) };
    }));
  };

  // TODO: 추가/편집/삭제 핸들러(후속 단계)

  return (
    <div className="flex-1 flex flex-col gap-2">
      {/* 상단: 타이틀 + 카테고리 추가 버튼 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon name="book" size="sm" />
          <span className="text-lg font-semibold">카테고리 관리</span>
        </div>
        <Button size="sm" variant="primary" onClick={openCreateCategory}>
          <Icon name="plus" size="sm" /> 카테고리 추가
        </Button>
      </div>
      {/* 카테고리 목록 (어코디언) */}
      <div className="flex flex-col gap-2">
        {categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat, catIdx) => (
          <div key={cat.id} className="border rounded bg-neutral-50 dark:bg-neutral-800">
            {/* 카테고리 헤더 */}
            <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => toggleAccordion(cat.id)}>
              <div className="flex items-center gap-2">
                <Icon name={expanded === cat.id ? 'chevronDown' : 'chevronRight'} size="sm" />
                <span className="font-semibold">{cat.displayName}</span>
                <span className="text-xs text-gray-500">{cat.books.length}권</span>
                <span className="text-xs text-gray-400 ml-2">순서: {cat.sortOrder}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); moveCategory(catIdx, -1); }} disabled={catIdx === 0}><Icon name="chevronUp" size="xs" /></Button>
                <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); moveCategory(catIdx, 1); }} disabled={catIdx === categories.length - 1}><Icon name="chevronDown" size="xs" /></Button>
                <Button size="sm" variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); openEditCategory(cat); }}><Icon name="edit" size="xs" /></Button>
                <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); openDeleteCategory(cat); }}><Icon name="delete" size="xs" /></Button>
              </div>
            </div>
            {/* 카테고리 내용 (책 목록) */}
            {expanded === cat.id && (
              <div className="pl-7 pr-3 pb-2 flex flex-col gap-1">
                {cat.books.sort((a, b) => a.sortOrder - b.sortOrder).map((book, bookIdx) => (
                  <div key={book.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span>{book.name}</span>
                      <span className="text-xs text-gray-400">({book.abbreviation})</span>
                      <span className="text-xs text-gray-400">{book.totalChapters}장</span>
                      <span className="text-xs text-gray-400 ml-2">순서: {book.sortOrder}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => moveBook(cat.id, bookIdx, -1)} disabled={bookIdx === 0}><Icon name="chevronUp" size="xs" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => moveBook(cat.id, bookIdx, 1)} disabled={bookIdx === cat.books.length - 1}><Icon name="chevronDown" size="xs" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEditBook(cat.id, book)}><Icon name="edit" size="xs" /></Button>
                      <Button size="sm" variant="danger" onClick={() => openDeleteBook(cat, book)}><Icon name="delete" size="xs" /></Button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="mt-1" onClick={() => openCreateBook(cat.id)}><Icon name="plus" size="xs" /> 책 추가</Button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* CSV 내보내기/가져오기 버튼 */}
      <div className="mt-2 flex gap-2 items-center">
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Icon name="download" size="sm" /> CSV 내보내기</Button>
        <label className="inline-block">
          <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          <Button size="sm" variant="outline"><Icon name="upload" size="sm" /> CSV 가져오기</Button>
        </label>
      </div>
      {/* CSV 미리보기 및 가져오기 */}
      {csvPreview && (
        <div className="mt-2 bg-neutral-100 dark:bg-neutral-800 rounded p-3">
          <div className="font-bold mb-1">CSV 미리보기: {csvFileName}</div>
          <div className="overflow-x-auto">
            <table className="text-xs border">
              <thead>
                <tr>
                  {Object.keys(csvPreview[0] || {}).map(k => <th key={k} className="border px-2 py-1">{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => <td key={j} className="border px-2 py-1">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="ghost" onClick={() => { setCsvPreview(null); setCsvFileName(''); }}>취소</Button>
            <Button size="sm" variant="primary" onClick={handleImportCSV}>가져오기</Button>
          </div>
        </div>
      )}
      {/* 생성/편집 다이얼로그 */}
      {showDialog && (
        <CategoryBookDialog {...showDialog} onClose={closeDialog} />
      )}
      {/* 삭제 확인 다이얼로그 */}
      {deleteDialog && (
        <DeleteConfirmation {...deleteDialog} onConfirm={closeDeleteDialog} onCancel={closeDeleteDialog} />
      )}
    </div>
  );
};

// 카테고리/책 생성·편집 다이얼로그 (유효성 검사 포함, 실제 저장은 후속 단계)
function CategoryBookDialog({ type, mode, item, onClose }: { type: 'category' | 'book'; mode: 'create' | 'edit'; item?: BibleCategory | BibleBook; onClose: () => void }) {
  const [form, setForm] = useState(() => {
    if (type === 'category') {
      const cat = (item && 'displayName' in item) ? item as BibleCategory : undefined;
      return {
        name: cat?.name || '',
        displayName: cat?.displayName || '',
        colorTheme: cat?.colorTheme || 'default',
        sortOrder: cat?.sortOrder || 0,
      };
    } else {
      const book = (item && 'abbreviation' in item) ? item as BibleBook : undefined;
      return {
        name: book?.name || '',
        nameEnglish: book?.nameEnglish || '',
        abbreviation: book?.abbreviation || '',
        totalChapters: book?.totalChapters || 1,
        sortOrder: book?.sortOrder || 0,
      };
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const errs: Record<string, string> = {};
    if (type === 'category') {
      if (!form.name.trim()) errs.name = '카테고리 식별자는 필수입니다';
      if (!(form.displayName ?? '').trim()) errs.displayName = '표시 이름은 필수입니다';
      if (!/^[a-z-]+$/.test(form.name)) errs.name = '영문 소문자와 하이픈만 사용';
    } else {
      if (!form.name.trim()) errs.name = '책 이름은 필수입니다';
      if (!(form.nameEnglish ?? '').trim()) errs.nameEnglish = '영문 이름은 필수입니다';
      if (!(form.abbreviation ?? '').trim()) errs.abbreviation = '약어는 필수입니다';
      if ((form.totalChapters ?? 0) < 1) errs.totalChapters = '장 수는 1 이상';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleChange = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: 실제 저장 로직(후속 단계)
    onClose();
  };
  return (
    <Modal isOpen={true} onClose={onClose} title={type === 'category' ? (mode === 'create' ? '카테고리 추가' : '카테고리 편집') : (mode === 'create' ? '책 추가' : '책 편집')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'category' ? (
          <>
            <Input label="카테고리 식별자" value={form.name} onChange={v => handleChange('name', v)} error={errors.name} required helpText="영문 소문자와 하이픈만 사용 (예: old-testament)" />
            <Input label="표시 이름" value={form.displayName} onChange={v => handleChange('displayName', v)} error={errors.displayName} required />
            <div className="form-group">
              <label htmlFor="color-theme">테마 색상</label>
              <select id="color-theme" value={form.colorTheme} onChange={e => handleChange('colorTheme', e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
                <option value="default">기본</option>
                <option value="old-testament">구약 테마 (보라)</option>
                <option value="new-testament">신약 테마 (초록)</option>
                <option value="meditation">묵상 테마 (빨강)</option>
              </select>
            </div>
            <Input label="정렬 순서" type="number" value={form.sortOrder.toString()} onChange={v => handleChange('sortOrder', parseInt(v) || 0)} helpText="작은 숫자일수록 앞에 표시" />
          </>
        ) : (
          <>
            <Input label="책 이름" value={form.name} onChange={v => handleChange('name', v)} error={errors.name} required />
            <Input label="영문 이름" value={form.nameEnglish} onChange={v => handleChange('nameEnglish', v)} error={errors.nameEnglish} required />
            <Input label="약어" value={form.abbreviation} onChange={v => handleChange('abbreviation', v)} error={errors.abbreviation} helpText="1-3글자" required />
            <Input label="총 장 수" type="number" value={(form.totalChapters ?? 1).toString()} onChange={v => handleChange('totalChapters', parseInt(v) || 1)} error={errors.totalChapters} required />
            <Input label="정렬 순서" type="number" value={form.sortOrder.toString()} onChange={v => handleChange('sortOrder', parseInt(v) || 0)} helpText="같은 카테고리 내에서의 정렬 순서" />
          </>
        )}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" type="button" onClick={onClose}>취소</Button>
          <Button variant="primary" type="submit">{mode === 'create' ? '추가' : '저장'}</Button>
        </div>
      </form>
    </Modal>
  );
}

// 삭제 확인 다이얼로그(의존성 체크, 확인 텍스트)
function DeleteConfirmation({ type, item, dependentCount, onConfirm, onCancel }: { type: 'category' | 'book'; item: BibleCategory | BibleBook; dependentCount: number; onConfirm: () => void; onCancel: () => void }) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting/*, setIsDeleting*/] = useState(false); // 후속 단계에서 사용
  const expectedText = `삭제 ${type === 'category' ? (item as BibleCategory).displayName : (item as BibleBook).name}`;
  const canDelete = confirmText === expectedText && dependentCount === 0;
  return (
    <Modal isOpen={true} onClose={onCancel} title={`${type === 'category' ? '카테고리' : '책'} 삭제 확인`} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Icon name="alert" size="lg" />
          <div>
            <div className="font-bold">정말로 삭제하시겠습니까?</div>
            <div><strong>{type === 'category' ? (item as BibleCategory).displayName : (item as BibleBook).name}</strong>을(를) 삭제하려고 합니다.</div>
            {dependentCount > 0 && (
              <div className="text-error mt-2">
                {type === 'category' ? `이 카테고리에는 ${dependentCount}개의 책이 있어 삭제할 수 없습니다.` : `이 책에는 ${dependentCount}개의 자료가 있어 삭제할 수 없습니다.`}
              </div>
            )}
          </div>
        </div>
        {dependentCount === 0 && (
          <div>
            <label className="block mb-1 text-sm">삭제를 확인하려면 <code>{expectedText}</code>를 입력하세요:</label>
            <Input value={confirmText} onChange={setConfirmText} placeholder={expectedText} />
          </div>
        )}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" type="button" onClick={onCancel}>취소</Button>
          {dependentCount === 0 && (
            <Button variant="danger" type="button" onClick={onConfirm} disabled={!canDelete} loading={isDeleting}>영구 삭제</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CategoryManager; 