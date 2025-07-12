import React from 'react';
import { useCategories } from '@/store/useCategories';
import { useCategoryStore } from '@/store/categoryStore';
import { Book, FileText, Edit2, Trash2 } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface CategoryTreeProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function CategoryTree({ onEdit, onDelete }: CategoryTreeProps) {
  const { categories, isLoading } = useCategories();
  const { expandedGroups, toggleGroup } = useCategoryStore();

  if (isLoading) return <div className="text-neutral-400">로딩 중...</div>;
  if (!categories.length) return <div className="text-neutral-500">카테고리가 없습니다.</div>;

  const groupCategories = categories.filter(cat => cat.type === 'group');

  return (
    <Droppable droppableId="group-list" type="group">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
          {groupCategories.map((group, groupIdx) => (
            <Draggable key={group.id} draggableId={group.id} index={groupIdx}>
              {(dragProvided) => (
                <div
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  className="bg-neutral-800 rounded p-3"
                >
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleGroup(group.id)}>
                    <span {...dragProvided.dragHandleProps} className="cursor-grab"><Book className="w-5 h-5 text-blue-400" /></span>
                    <span className="font-semibold text-white">{group.name}</span>
                    <span className="ml-2 text-xs text-neutral-400">(그룹)</span>
                    {onEdit && (
                      <button className="ml-auto text-blue-400 hover:text-blue-300" onClick={e => { e.stopPropagation(); onEdit(group.id); }} title="수정"><Edit2 className="w-4 h-4" /></button>
                    )}
                    {onDelete && (
                      <button className="ml-1 text-red-400 hover:text-red-300" onClick={e => { e.stopPropagation(); onDelete(group.id); }} title="삭제"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                  {expandedGroups.has(group.id) && (
                    <Droppable droppableId={group.id} type="item">
                      {(itemProvided) => (
                        <div ref={itemProvided.innerRef} {...itemProvided.droppableProps} className="ml-6 mt-2 space-y-1">
                          {categories.filter(cat => cat.parent_id === group.id).map((item, itemIdx) => (
                            <Draggable key={item.id} draggableId={item.id} index={itemIdx}>
                              {(itemDragProvided) => (
                                <div
                                  ref={itemDragProvided.innerRef}
                                  {...itemDragProvided.draggableProps}
                                  className="flex items-center gap-2"
                                >
                                  <span {...itemDragProvided.dragHandleProps} className="cursor-grab"><FileText className="w-4 h-4 text-green-400" /></span>
                                  <span className="text-white">{item.name}</span>
                                  {onEdit && (
                                    <button className="ml-auto text-blue-400 hover:text-blue-300" onClick={e => { e.stopPropagation(); onEdit(item.id); }} title="수정"><Edit2 className="w-4 h-4" /></button>
                                  )}
                                  {onDelete && (
                                    <button className="ml-1 text-red-400 hover:text-red-300" onClick={e => { e.stopPropagation(); onDelete(item.id); }} title="삭제"><Trash2 className="w-4 h-4" /></button>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {categories.filter(cat => cat.parent_id === group.id).length === 0 && (
                            <div className="text-xs text-neutral-500">하위 항목 없음</div>
                          )}
                          {itemProvided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  )}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
} 