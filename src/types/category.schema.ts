import { z } from 'zod';

// 카테고리 단일 생성/수정 폼 스키마
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, '카테고리명을 입력해주세요')
    .max(100, '카테고리명은 100자 이하로 입력해주세요')
    .trim(),
  type: z.enum(['group', 'item']),
  parent_id: z.string().uuid().optional().nullable(),
  items: z.array(z.string().trim().min(1)).optional(), // 다중 입력용
});

// 그룹 + 다중 하위 항목 생성용
export const bulkCreateSchema = z.object({
  group_name: z.string().min(1, '그룹명을 입력해주세요').max(100).trim(),
  items: z
    .array(z.string().trim().min(1))
    .min(1, '최소 하나의 항목을 입력해주세요')
    .max(50, '최대 50개까지 입력 가능합니다'),
});

// 드래그앤드롭 순서 변경용
export const dragDropSchema = z.object({
  source: z.object({
    index: z.number(),
    droppableId: z.string(),
  }),
  destination: z.object({
    index: z.number(),
    droppableId: z.string(),
  }),
  draggableId: z.string(),
});

// 카테고리 수정용(partial)
export const categoryUpdateSchema = categoryFormSchema.partial();

// 순서 일괄 변경용
export const categoryReorderSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().uuid(),
      order_index: z.number().int().min(0),
    })
  ),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type CategoryUpdateData = z.infer<typeof categoryUpdateSchema>;
export type CategoryReorderData = z.infer<typeof categoryReorderSchema>; 