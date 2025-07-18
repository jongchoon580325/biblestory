import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Check, X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/utils/supabaseClient';

type Book = {
  id: string;
  name: string;
  order: number;
};

type Category = {
  id: string;
  name: string;
  parent_id: string | null; // 그룹/하위 구분
  order: number;
  created_at?: string;
  books?: Book[]; // 하위 카테고리 확장 대비
};

interface CategoryFormProps {
  categories: Category[];
}

// Sortable Book Item
interface SortableBookItemProps {
  book: Book;
  editingId: string | null;
  editValue: string;
  onEditStart: (bookId: string, name: string) => void;
  onEditSave: (bookId: string | null) => void;
  onDeleteModal: (bookId: string, bookName: string) => void;
  setEditValue: React.Dispatch<React.SetStateAction<string>>;
}

function SortableBookItem({ book, editingId, editValue, onEditStart, onEditSave, onDeleteModal, setEditValue }: SortableBookItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: book.id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2"
    >
      <div className="flex items-center gap-2 w-full">
        <button {...attributes} {...listeners} className="cursor-grab p-1 text-slate-400 hover:text-blue-400 focus:outline-none">
          <GripVertical className="w-4 h-4" />
        </button>
        {editingId === book.id ? (
          <>
            <input
              className="bg-slate-700 text-white rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={editValue}
              autoFocus
              onChange={e => setEditValue(e.target.value)}
              onBlur={() => onEditSave(book.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') onEditSave(book.id);
                if (e.key === 'Escape') onEditSave(null);
              }}
            />
            <button className="p-1 ml-1 rounded hover:bg-green-500/20 transition" title="저장" onMouseDown={e => { e.preventDefault(); onEditSave(book.id); }}>
              <Check className="w-4 h-4 text-green-400" />
            </button>
          </>
        ) : (
          <>
            <span className="text-slate-200 font-medium truncate flex-1">{book.name}</span>
            <button className="p-1 rounded hover:bg-blue-500/20 transition" title="수정" onClick={() => onEditStart(book.id, book.name)}>
              <Pencil className="w-4 h-4 text-blue-400" />
            </button>
            <button className="p-1 rounded hover:bg-red-500/20 transition" title="삭제" onClick={() => onDeleteModal(book.id, book.name)}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

// 그룹 카테고리(구약/신약) 드래그앤드롭용 SortableCategoryItem
interface SortableCategoryItemProps {
  category: Category;
  children: React.ReactNode;
}
function SortableCategoryItem({ category, children }: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="relative"
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button {...attributes} {...listeners} className="cursor-grab p-1 text-slate-400 hover:text-blue-400 focus:outline-none">
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
      <div className="pl-7">{children}</div>
    </div>
  );
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categories }) => {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const [modal, setModal] = useState<{ open: boolean; bookId: string | null; bookName: string }>({ open: false, bookId: null, bookName: '' });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSubModalOpen, setAddSubModalOpen] = useState(false);
  const [addSubName, setAddSubName] = useState('');
  const [addSubLoading, setAddSubLoading] = useState(false);
  const [addSubError, setAddSubError] = useState('');
  const [addSubParentId, setAddSubParentId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupValue, setEditGroupValue] = useState('');
  const [deleteGroupModal, setDeleteGroupModal] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deleteGroupName, setDeleteGroupName] = useState('');
  const [deleteGroupLoading, setDeleteGroupLoading] = useState(false);
  const [deleteGroupError, setDeleteGroupError] = useState('');

  // dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor));

  const handleToggle = (key: string) => {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const handleEditStart = (bookId: string, name: string) => {
    setEditingId(bookId);
    setEditValue(name);
  };
  const handleEditSave = (bookId: string | null) => {
    if (!bookId) {
      setEditingId(null);
      setEditValue('');
      return;
    }
    setLocalCategories(prev =>
      prev.map(cat => ({
        ...cat,
        books: cat.books ? cat.books.map(book =>
          book.id === bookId ? { ...book, name: editValue } : book
        ) : [],
      }))
    );
    setEditingId(null);
    setEditValue('');
  };
  const handleDeleteModal = (bookId: string, bookName: string) => {
    setModal({ open: true, bookId, bookName });
  };
  const handleDelete = () => {
    if (!modal.bookId) return;
    setLocalCategories(prev =>
      prev.map(cat => ({
        ...cat,
        books: cat.books ? cat.books.filter(book => book.id !== modal.bookId) : [],
      }))
    );
    setModal({ open: false, bookId: null, bookName: '' });
  };

  // 카테고리 추가 핸들러
  const handleAddCategory = async () => {
    if (!addName.trim()) {
      setAddError('카테고리명을 입력하세요.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    const order = localCategories.filter(c => c.parent_id === null).length + 1;
    const { data, error } = await supabase
      .from('category')
      .insert([{ name: addName, parent_id: null, order }])
      .select();
    setAddLoading(false);
    if (error) {
      setAddError(error.message);
      return;
    }
    if (data) {
      setLocalCategories(prev => [...prev, data[0]]);
      setAddModalOpen(false);
      setAddName('');
    }
  };

  // 하위 카테고리(books) 추가 핸들러
  const handleAddSubCategory = async () => {
    if (!addSubName.trim() || !addSubParentId) {
      setAddSubError('하위 카테고리명을 입력하세요.');
      return;
    }
    setAddSubLoading(true);
    setAddSubError('');
    // 해당 그룹의 하위 카테고리 개수로 order 결정
    const parentCat = localCategories.find(c => c.id === addSubParentId);
    const order = (parentCat?.books?.length || 0) + 1;
    const { data, error } = await supabase
      .from('category')
      .insert([{ name: addSubName, parent_id: addSubParentId, order }])
      .select();
    setAddSubLoading(false);
    if (error) {
      setAddSubError(error.message);
      return;
    }
    if (data && data[0]) {
      setLocalCategories(prev => prev.map(cat =>
        cat.id === addSubParentId
          ? { ...cat, books: [...(cat.books || []), { id: data[0].id, name: data[0].name, order: data[0].order }] }
          : cat
      ));
      setAddSubModalOpen(false);
      setAddSubName('');
      setAddSubParentId(null);
    }
  };

  // 드래그앤드롭 정렬 핸들러 (동일 그룹 내에서만)
  const handleDragEnd = (groupId: string | null, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalCategories(prev =>
      prev.map(cat =>
        cat.parent_id === groupId
          ? {
              ...cat,
              books: arrayMove(
                cat.books || [],
                (cat.books || []).findIndex(b => b.id === active.id),
                (cat.books || []).findIndex(b => b.id === over.id)
              ).map((b, idx) => ({ ...b, order: idx + 1 })),
            }
          : cat
      )
    );
  };

  // 그룹 카테고리 드래그앤드롭 정렬 핸들러
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalCategories(prev =>
      arrayMove(
        prev,
        prev.findIndex(c => c.id === active.id),
        prev.findIndex(c => c.id === over.id)
      ).map((cat, idx) => ({ ...cat, order: idx + 1 }))
    );
  };

  // 그룹명 인라인 수정 시작
  const handleEditGroupStart = (groupId: string, name: string) => {
    setEditingGroupId(groupId);
    setEditGroupValue(name);
  };
  // 그룹명 인라인 수정 저장
  const handleEditGroupSave = async (groupId: string | null) => {
    if (!groupId) {
      setEditingGroupId(null);
      setEditGroupValue('');
      return;
    }
    if (!editGroupValue.trim()) {
      setEditingGroupId(null);
      setEditGroupValue('');
      return;
    }
    // DB 업데이트
    const { error } = await supabase
      .from('category')
      .update({ name: editGroupValue })
      .eq('id', groupId);
    if (!error) {
      setLocalCategories(prev => prev.map(cat =>
        cat.id === groupId ? { ...cat, name: editGroupValue } : cat
      ));
    }
    setEditingGroupId(null);
    setEditGroupValue('');
  };

  // 그룹 삭제 모달 오픈
  const handleDeleteGroupModal = (groupId: string, groupName: string) => {
    setDeleteGroupId(groupId);
    setDeleteGroupName(groupName);
    setDeleteGroupModal(true);
    setDeleteGroupError('');
  };
  // 그룹 삭제 실행
  const handleDeleteGroup = async () => {
    if (!deleteGroupId) return;
    setDeleteGroupLoading(true);
    setDeleteGroupError('');
    const { error } = await supabase
      .from('category')
      .delete()
      .eq('id', deleteGroupId);
    setDeleteGroupLoading(false);
    if (error) {
      setDeleteGroupError(error.message);
      return;
    }
    setLocalCategories(prev => prev.filter(cat => cat.id !== deleteGroupId));
    setDeleteGroupModal(false);
    setDeleteGroupId(null);
    setDeleteGroupName('');
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 w-full">
      {/* 상단: 카테고리 추가 버튼 우측 배치 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-bold text-white">카테고리 관리</div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg font-semibold shadow hover:shadow-lg transition text-sm"
        >
          <Plus className="w-4 h-4" /> 카테고리 추가
        </button>
      </div>
      {/* 카테고리 추가 모달 */}
      {addModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px]">
            <div className="text-white text-lg font-bold mb-2">그룹 카테고리 추가</div>
            <input
              className="w-full bg-slate-700 text-white rounded px-3 py-2 mb-2"
              placeholder="카테고리명 입력"
              value={addName}
              onChange={e => setAddName(e.target.value)}
              disabled={addLoading}
            />
            {addError && <div className="text-red-400 text-sm">{addError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition"
                onClick={() => setAddModalOpen(false)}
                disabled={addLoading}
              >
                취소
              </button>
              <button
                className="px-4 py-2 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition"
                onClick={handleAddCategory}
                disabled={addLoading}
              >
                {addLoading ? '추가 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 하위 카테고리 추가 모달 */}
      {addSubModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px]">
            <div className="text-white text-lg font-bold mb-2">하위 카테고리 추가</div>
            <input
              className="w-full bg-slate-700 text-white rounded px-3 py-2 mb-2"
              placeholder="하위 카테고리명 입력"
              value={addSubName}
              onChange={e => setAddSubName(e.target.value)}
              disabled={addSubLoading}
            />
            {addSubError && <div className="text-red-400 text-sm">{addSubError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition"
                onClick={() => { setAddSubModalOpen(false); setAddSubName(''); setAddSubParentId(null); }}
                disabled={addSubLoading}
              >
                취소
              </button>
              <button
                className="px-4 py-2 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition"
                onClick={handleAddSubCategory}
                disabled={addSubLoading}
              >
                {addSubLoading ? '추가 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 그룹 카테고리(구약/신약) 드래그앤드롭 */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
        <SortableContext items={localCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {localCategories.map(cat => (
              <SortableCategoryItem key={cat.id} category={cat}>
                <div className="bg-slate-900/60 rounded-xl p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none mb-2 hover:bg-slate-800/40 rounded-lg px-2 py-1 transition"
                    onClick={() => handleToggle(cat.name)}
                  >
                    {editingGroupId === cat.id ? (
                      <>
                        <input
                          className="bg-slate-700 text-white rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={editGroupValue}
                          autoFocus
                          onChange={e => setEditGroupValue(e.target.value)}
                          onBlur={() => handleEditGroupSave(cat.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleEditGroupSave(cat.id);
                            if (e.key === 'Escape') handleEditGroupSave(null);
                          }}
                        />
                        <button className="p-1 ml-1 rounded hover:bg-green-500/20 transition" title="저장" onMouseDown={e => { e.preventDefault(); handleEditGroupSave(cat.id); }}>
                          <Check className="w-4 h-4 text-green-400" />
                        </button>
                      </>
                    ) : (
                      <span className="font-semibold text-lg text-white">{cat.name}</span>
                    )}
                    <div className="flex items-center gap-2">
                      {/* 하위 카테고리 추가 */}
                      <button className="p-1 rounded hover:bg-green-500/20 transition" title="하위 카테고리 추가" onClick={e => { e.stopPropagation(); setAddSubParentId(cat.id); setAddSubModalOpen(true); }}>
                        <Plus className="w-4 h-4 text-green-400" />
                      </button>
                      {/* 그룹명 인라인 수정 */}
                      <button className="p-1 rounded hover:bg-blue-500/20 transition" title="수정" onClick={e => { e.stopPropagation(); handleEditGroupStart(cat.id, cat.name); }}>
                        <Pencil className="w-4 h-4 text-blue-400" />
                      </button>
                      {/* 그룹 삭제 */}
                      <button className="p-1 rounded hover:bg-red-500/20 transition" title="삭제" onClick={e => { e.stopPropagation(); handleDeleteGroupModal(cat.id, cat.name); }}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  {open[cat.name] && cat && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={event => handleDragEnd(cat.id, event)}>
                      <SortableContext items={(cat.books || []).map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <ul className="space-y-2">
                          {(cat.books || []).map(book => (
                            <SortableBookItem
                              key={book.id}
                              book={book}
                              editingId={editingId}
                              editValue={editValue}
                              onEditStart={handleEditStart}
                              onEditSave={handleEditSave}
                              onDeleteModal={handleDeleteModal}
                              setEditValue={setEditValue}
                            />
                          ))}
                        </ul>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </SortableCategoryItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {/* 삭제 확인 모달 */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white text-lg font-bold">삭제 확인</div>
              <button onClick={() => setModal({ open: false, bookId: null, bookName: '' })} className="p-1 rounded hover:bg-slate-700">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="text-slate-300 mb-4">정말 <span className="text-red-400 font-semibold">{modal.bookName}</span> 책을 삭제하시겠습니까?</div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition" onClick={() => setModal({ open: false, bookId: null, bookName: '' })}>취소</button>
              <button className="px-4 py-2 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition" onClick={handleDelete}>삭제</button>
            </div>
          </div>
        </div>
      )}
      {/* 그룹 삭제 확인 모달 */}
      {deleteGroupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 space-y-4 min-w-[320px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white text-lg font-bold">그룹 삭제 확인</div>
              <button onClick={() => setDeleteGroupModal(false)} className="p-1 rounded hover:bg-slate-700">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="text-slate-300 mb-4">정말 <span className="text-red-400 font-semibold">{deleteGroupName}</span> 그룹을 삭제하시겠습니까?<br/>하위 카테고리도 모두 삭제됩니다.</div>
            {deleteGroupError && <div className="text-red-400 text-sm mb-2">{deleteGroupError}</div>}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition" onClick={() => setDeleteGroupModal(false)} disabled={deleteGroupLoading}>취소</button>
              <button className="px-4 py-2 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition" onClick={handleDeleteGroup} disabled={deleteGroupLoading}>{deleteGroupLoading ? '삭제 중...' : '삭제'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryForm; 