import * as z from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.number().min(0, 'Base price must be greater than 0'),
  virtualPrice: z.number().min(0, 'Virtual price must be greater than 0'),
  durationMinutes: z.number().min(1, 'Duration must be greater than 0'),
  images: z.array(z.string()).default([]),
  categories: z.array(z.number()).default([]),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

export const searchServiceSchema = z.object({
  page: z.number().min(1, 'Page must be greater than 0'),
  limit: z.number().min(1, 'Limit must be greater than 0'),
  searchTerm: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sortBy: z.string().optional(),
  orderBy: z.string().optional(),
});

export type SearchServiceParams = z.infer<typeof searchServiceSchema>;
