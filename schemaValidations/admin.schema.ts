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

export const assignRoleToUserResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  statusCode: z.number(),
});

export const assginRoleToUserRequestSchema = z.object({
  roleIds: z.array(z.number()),
});

export const resetPasswordUserRequestSchema = z.object({
  newPassword: z.string(),
  confirmPassword: z.string(),
});

export const resetPasswordUserResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
  data: z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    phone: z.string(),
    avatar: z.string(),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullable(),
    roles: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
  }),
});

export const getAllRoleResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
  data: z.object({
    data: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        permissions: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            description: z.string().nullable(),
            path: z.string(),
            method: z.string(),
            module: z.string(),
          })
        ),
      })
    ),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export const createRoleRequestSchema = z.object({
  name: z.string(),
});

export const createRoleResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    permissions: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        path: z.string(),
        method: z.string(),
        module: z.string(),
      })
    ),
    userCount: z.number(),
  }),
});

export const getRoleByIdResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export const getPermissionByRoleIdSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
  data: z.object({
    data: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        path: z.string(),
        method: z.string(),
        module: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    ),
  }),
});

export const assignPermissionToRoleRequestSchema = z.object({
  permissionIds: z.array(z.number()),
});

export const assignPermissionToRoleResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export const getAllPermissionResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
  data: z.object({
    data: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        path: z.string(),
        method: z.string(),
        module: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    ),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export type GetAllPermissionResponseType = z.infer<typeof getAllPermissionResponseSchema>;
export type AssignPermissionToRoleResponseType = z.infer<
  typeof assignPermissionToRoleResponseSchema
>;
export type AssignPermissionToRoleRequestType = z.infer<typeof assignPermissionToRoleRequestSchema>;
export type GetPermissionByRoleIdType = z.infer<typeof getPermissionByRoleIdSchema>;
export type GetRoleByIdResponseType = z.infer<typeof getRoleByIdResponseSchema>;
export type CreateRoleResponseType = z.infer<typeof createRoleResponseSchema>;
export type CreateRoleRequestType = z.infer<typeof createRoleRequestSchema>;
export type GetAllRoleResponseType = z.infer<typeof getAllRoleResponseSchema>;
export type ResetPasswordUserRequestType = z.infer<typeof resetPasswordUserRequestSchema>;
export type ResetPasswordUserResponseType = z.infer<typeof resetPasswordUserResponseSchema>;
export type AssignRoleToUserResponseType = z.infer<typeof assignRoleToUserResponseSchema>;
export type AssginRoleToUserRequestType = z.infer<typeof assginRoleToUserRequestSchema>;
export type GetAllUsersResponseType = z.infer<typeof getAllUsersResponseSchema>;
export type UserResponseType = z.infer<typeof userResponseSchema>;
export type GetUserByIdResponseType = z.infer<typeof getUserByIdResponseSchema>;
export type CreateUserRequestType = z.infer<typeof createUserRequestSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;
export type GetStatisticsUsersResponseType = z.infer<typeof getStatisticsUsersResponseSchema>;
export type GetStatisticsRolesUserResponseType = z.infer<
  typeof getStatisticsRolesUserResponseSchema
>;
