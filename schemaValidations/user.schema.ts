import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phone: z.string(),
  avatar: z.string().optional().nullable(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const customerSchema = z.object({
  id: z.number(),
  userId: z.number(),
  address: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserType = z.infer<typeof userSchema>;
export type CustomerType = z.infer<typeof customerSchema>;
