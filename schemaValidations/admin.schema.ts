import z from 'zod';
import { userSchema, customerSchema } from '@/schemaValidations/user.schema';
import { providerSchema } from './provider.schema';
import { staffSchema } from './staff.schema';
import { buildPaginationResponseSchema } from './response.schema';

// Role Schema
const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Pick specific fields from existing schemas
const userResponseSchema = userSchema
  .pick({
    id: true,
    email: true,
    name: true,
    phone: true,
    avatar: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    deletedAt: z.string().nullable(),
    customer: customerSchema
      .pick({
        id: true,
        address: true,
        dateOfBirth: true,
        gender: true,
      })
      .optional(),
    staff: staffSchema
      .pick({
        id: true,
        isActive: true,
      })
      .extend({
        provider: providerSchema.pick({
          id: true,
          verificationStatus: true,
          address: true,
          description: true,
        }),
      })
      .optional(),
    provider: providerSchema
      .pick({
        id: true,
        description: true,
        address: true,
        verificationStatus: true,
      })
      .optional(),
    roles: z.array(roleSchema),
  });

// Final response schema
export const getUserByIdResponseSchema = buildPaginationResponseSchema(userResponseSchema, {
  paginated: false,
});

export const getAllUsersResponseSchema = buildPaginationResponseSchema(userResponseSchema, {
  paginated: true,
});

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt');

export const createUserRequestSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(3),
  phone: z.string().min(10),
  avatar: z.string().optional(),
  status: z.string(),
  role: z.string(),
});

// Form schema with password confirmation
export const userFormSchema = createUserRequestSchema
  .extend({
    confirmPassword: z.string().min(6),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export const getStatisticsUserSchema = z.object({
  totals: z.object({
    users: z.number(),
    active: z.number(),
    inactive: z.number(),
    blocked: z.number(),
  }),
  types: z.object({
    customers: z.number(),
    serviceProviders: z.number(),
    staff: z.number(),
    adminOnly: z.number(),
  }),
});

export const getStatisticsRolesUserSchema = z.object({
  totalRoles: z.number(),
  roles: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      userCount: z.number(),
      percentage: z.number(),
    })
  ),
});

export const getStatisticsUsersResponseSchema =
  buildPaginationResponseSchema(getStatisticsUserSchema);

export const getStatisticsRolesUserResponseSchema = buildPaginationResponseSchema(
  getStatisticsRolesUserSchema
);

export type GetAllUsersResponseType = z.infer<typeof getAllUsersResponseSchema>;
export type UserResponseType = z.infer<typeof userResponseSchema>;
export type GetUserByIdResponseType = z.infer<typeof getUserByIdResponseSchema>;
export type CreateUserRequestType = z.infer<typeof createUserRequestSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;
export type GetStatisticsUsersResponseType = z.infer<typeof getStatisticsUsersResponseSchema>;
export type GetStatisticsRolesUserResponseType = z.infer<
  typeof getStatisticsRolesUserResponseSchema
>;
