import z from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
  parentCategoryId: z.number().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema;

export const categorySchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  logo: z.string().optional(),
  parentCategoryId: z.number().optional(),
});

export type CategoryType = z.infer<typeof categorySchema>;
export type CategoryCreateType = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateType = z.infer<typeof categoryUpdateSchema>;
