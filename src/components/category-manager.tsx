'use client';

import React, { useState } from 'react';
import { useCategories } from '@/store/useCategories';
import { useRealtimeCategories } from '@/store/useRealtimeCategories';
import { Book } from 'lucide-react';
import CategoryTree from './category-tree';
import CategoryActions from './category-actions';
import CategoryForm from './category-form';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

export default function CategoryManager() {
  useRealtimeCategories();
  const {
    categories, isLoading, error,
    createCategory, isCreating,
    updateCategory, isUpdating,
    deleteCategory, isDeleting,
    reorderCategories
  } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleAdd = () => { setEditId(null); setShowForm(true); };
  const handleCancel = () => { setShowForm(false); setEditId(null); };
  const handleSubmit = (data: { name: string; type: 'group' | 'item'; parent_id?: string | null } | { names: string[]; type: 'group' | 'item'; parent_id?: string | null }) => {
    if ('names' in data) {
      // 다중 입력
      data.names.forEach(name => {
        createCategory({ name, type: data.type, parent_id: data.parent_id });
      });
      setToast('여러 카테고리 추가 완료');
    } else {
      if (editId) {
        updateCategory({ id: editId, data });
        setToast('카테고리 수정 완료');
      } else {
        createCategory(data);
        setToast('카테고리 추가 완료');
      }
    }
    setShowForm(false);
    setEditId(null);
  };
  const handleEdit = (id: string) => { setEditId(id); setShowForm(true); };
  const handleDelete = (id: string) => setDeleteId(id);
  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteCategory(deleteId);
      setToast('카테고리 삭제 완료');
    }
    setDeleteId(null);
  };
  const handleDeleteCancel = () => setDeleteId(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderCategories(result);
  };

  const groupOptions = categories.filter(c => c.type === 'group').map(g => ({ id: g.id, name: g.name }));
  const editData = editId ? categories.find(c => c.id === editId) : undefined;

  return (
    <div className="min-h-[400px] bg-neutral-900 text-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-3 mb-4">
        <Book className="w-7 h-7 text-blue-400" />
        <h2 className="text-2xl font-bold">카테고리 관리</h2>
      </div>
      <CategoryActions onAdd={handleAdd} />
      <DragDropContext onDragEnd={handleDragEnd}>
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-full max-w-sm">
              <CategoryForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                groups={groupOptions}
                isLoading={isCreating || isUpdating}
                initialData={editData}
              />
            </div>
          </div>
        )}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-xs text-center">
              <div className="text-lg mb-4">정말 삭제하시겠습니까?</div>
              <div className="flex gap-2 justify-center mt-4">
                <button className="px-3 py-1.5 rounded bg-neutral-700 text-white" onClick={handleDeleteCancel} disabled={isDeleting}>취소</button>
                <button className="px-3 py-1.5 rounded bg-red-600 text-white" onClick={handleDeleteConfirm} disabled={isDeleting}>삭제</button>
              </div>
            </div>
          </div>
        )}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-800 text-white px-6 py-3 rounded shadow-lg z-50 text-center animate-fade-in">
            {toast}
            <button className="ml-4 text-blue-400 underline" onClick={() => setToast(null)}>닫기</button>
          </div>
        )}
        {isLoading && <div className="text-neutral-400">로딩 중...</div>}
        {error && <div className="text-red-500">에러: {String(error)}</div>}
        {!isLoading && !error && (
          <CategoryTree onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </DragDropContext>
    </div>
  );
} 