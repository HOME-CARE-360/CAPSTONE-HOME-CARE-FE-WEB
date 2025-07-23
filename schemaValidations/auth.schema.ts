import { CompanyType } from '@/lib/api/services/fetchAuth';
import { z } from 'zod';

// Schema for login form
export const loginSchema = z.object({
  email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
});

export const emailSchema = z.object({
  email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ' }),
});

export const customerSchema = z
  .object({
    email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ' }),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

export const providerSchema = z
  .object({
    email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ' }),
    name: z.string().min(2, 'Business name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    taxId: z.string().min(10, 'Tax ID must be at least 10 characters'),
    companyType: z.nativeEnum(CompanyType),
    industry: z.string().min(2, 'Industry must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    terms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// const otpSchema = z.object({
//   otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
// });

export type ProviderFormValues = z.infer<typeof providerSchema>;
// type OtpFormValues = z.infer<typeof otpSchema>;

export type CustomerFormValues = z.infer<typeof customerSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;

export type EmailFormValues = z.infer<typeof emailSchema>;

export type LoginFormValues = z.infer<typeof loginSchema>;
