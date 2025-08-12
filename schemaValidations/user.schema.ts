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
  wallet: z
    .object({
      id: z.number(),
      userId: z.number(),
      balance: z.number(),
      createdAt: z.string(),
      updatedAt: z.string(),
      accountHolder: z.string(),
      bankAccount: z.string(),
      bankName: z.string(),
    })
    .nullable(),
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

export const updateUserProfileRequestSchema = z.object({
  user: z.object({
    name: z.string(),
    phone: z.string(),
    avatar: z.string().optional().nullable(),
  }),
  customer: z.object({
    address: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
  }),
});

export const updateUserProfileResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    id: z.number(),
    updatedAt: z.string(),
  }),
  statusCode: z.number(),
});

export const changPasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(6, 'Ít nhất 6 ký tự'),
    newPassword: z.string().min(6, 'Ít nhất 6 ký tự'),
    confirmNewPassword: z.string().min(6, 'Ít nhất 6 ký tự'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu mới không khớp',
    path: ['confirmNewPassword'],
  });

export type UserType = z.infer<typeof userSchema>;
export type CustomerType = z.infer<typeof customerSchema>;
export type UpdateUserProfileRequestType = z.infer<typeof updateUserProfileRequestSchema>;
export type UpdateUserProfileResponseType = z.infer<typeof updateUserProfileResponseSchema>;
export type ChangePasswordRequestType = z.infer<typeof changPasswordRequestSchema>;
