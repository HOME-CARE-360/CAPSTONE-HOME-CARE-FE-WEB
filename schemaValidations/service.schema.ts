import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.number().min(0, 'Base price must be greater than 0'),
  virtualPrice: z.number().min(0, 'Virtual price must be greater than 0'),
  durationMinutes: z.number().min(1, 'Duration must be greater than 0'),
  categories: z.array(z.number()).default([]),
  images: z.array(z.string()).default([]),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
