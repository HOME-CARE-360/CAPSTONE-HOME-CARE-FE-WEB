import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  logo: z.string().optional(),
  parentCategoryId: z.number().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema;

export const categorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  logo: z.string().nullable(),
  parentCategory: z
    .object({
      id: z.number(),
      name: z.string(),
      logo: z.string().nullable(),
    })
    .nullable()
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const categoryResponseSchema = z.object({
  categories: z.array(categorySchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type CategoryType = z.infer<typeof categorySchema>;
export type CategoryCreateType = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateType = z.infer<typeof categoryUpdateSchema>;
export type CategoryResponseType = z.infer<typeof categoryResponseSchema>;
