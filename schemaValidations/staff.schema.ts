import { z } from 'zod';

export const staffSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    name: z.string().min(1, 'Vui lòng nhập tên nhân viên'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
    categoryIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất một danh mục'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type StaffFormData = z.infer<typeof staffSchema>;
