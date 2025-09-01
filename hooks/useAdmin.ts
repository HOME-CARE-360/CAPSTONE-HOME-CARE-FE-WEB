import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminService,
  SystemConfigsResponse,
  CreateSystemConfigRequest,
  UpdateSystemConfigRequest,
} from '@/lib/api/services/fetchAdmin';
import { toast } from 'sonner';
import {
  AssginRoleToUserRequestType,
  AssignPermissionToRoleRequestType,
  CreateRoleRequestType,
  CreateRoleResponseType,
  CreateUserRequestType,
  GetAllPermissionResponseType,
  GetAllRoleResponseType,
  GetAllUsersResponseType,
  GetPermissionByRoleIdType,
  GetReportMonthResponseType,
  GetReportMutipleMonthExportPDFResponseType,
  GetStatisticsUsersResponseType,
  ResetPasswordUserRequestType,
  UserFormData,
} from '@/schemaValidations/admin.schema';
import { useAuthStore } from '@/lib/store/authStore';

interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

interface SystemConfigSearchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useGetAllUsers = (params?: UserSearchParams) => {
  const { data, isLoading, error } = useQuery<GetAllUsersResponseType>({
    queryKey: ['admin', 'users', params],
    queryFn: () => AdminService.getUsers(params),
  });

  return {
    data,
    isLoading,
    error,
  };
};

export function useGetAdminProfile() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: () => AdminService.getAdminProfile(),
    enabled: isAuthenticated,
    // select: (data: GetProfileResponse) => ({
    //   profile: data.data,
    //   message: data.message,
    // }),
  });
}

export const useGetUserById = (id: string | number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => AdminService.getUserById(id),
  });

  return {
    data,
    isLoading,
    error,
  };
};

export const useDeleteUser = () => {
  const mutation = useMutation({
    mutationFn: (id: string | number) => AdminService.deleteUser(id),
    onSuccess: () => {
      toast.success('Xóa người dùng thành công');
    },
    onError: (error: Error) => {
      toast.error('Có lỗi xảy ra khi xóa người dùng');
      console.error('Delete user error:', error);
    },
  });

  return mutation;
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: UserFormData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userDataForServer } = data;
      return AdminService.createUser(userDataForServer as CreateUserRequestType);
    },
    onSuccess: () => {
      toast.success('Tạo người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: Error) => {
      toast.error('Có lỗi xảy ra khi tạo người dùng');
      console.error('Create user error:', error);
    },
  });

  return mutation;
};

export const useGetStatisticsUsers = () => {
  const { data, isLoading, error } = useQuery<GetStatisticsUsersResponseType>({
    queryKey: ['admin', 'statistics', 'users'],
    queryFn: () => AdminService.getStatisticsUsers(),
  });

  return {
    data,
    isLoading,
    error,
  };
};

export const useGetStatisticsRolesUser = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'statistics', 'roles'],
    queryFn: () => AdminService.getStatisticsRolesUser(),
  });

  return {
    data,
    isLoading,
    error,
  };
};

export const useAssignRoleToUser = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ data, userId }: { data: AssginRoleToUserRequestType; userId: number }) => {
      return AdminService.assignRoleToUser(data, userId);
    },
    onSuccess: () => {
      toast.success('Gán vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: Error) => {
      toast.error('Có lỗi xảy ra khi gán vai trò');
      console.error('Assign role to user error:', error);
    },
  });

  return mutation;
};

export const useResetPasswordUser = () => {
  const mutation = useMutation({
    mutationFn: ({ data, userId }: { data: ResetPasswordUserRequestType; userId: number }) => {
      return AdminService.resetPasswordUser(data, userId);
    },
    onSuccess: () => {
      toast.success('Thay đổi mật khẩu người dùng thành công');
    },
  });

  return mutation;
};

export const useGetAllRoles = (params?: { page?: number; limit?: number }) => {
  const { data, isLoading, error } = useQuery<GetAllRoleResponseType>({
    queryKey: ['admin', 'roles', params],
    queryFn: () => AdminService.getAllRole(params),
  });

  return {
    data,
    isLoading,
    error,
  };
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: CreateRoleRequestType) => {
      return AdminService.createRole(data);
    },
    onSuccess: (data: CreateRoleResponseType) => {
      console.log(data);
      toast.success('Tạo vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
    onError: (error: Error) => {
      console.log(error);
      toast.error('Có lỗi xảy ra khi tạo vai trò');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });

  return {
    mutation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateRoleRequestType }) => {
      return AdminService.updateRole(id, data);
    },
    onSuccess: () => {
      toast.success('Cập nhật vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
    onError: (error: Error) => {
      toast.error('Có lỗi xảy ra khi cập nhật vai trò');
      console.error('Update role error:', error);
    },
  });

  return {
    mutation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: number) => {
      return AdminService.deleteRole(id);
    },
    onSuccess: () => {
      toast.success('Xóa vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
    onError: (error: Error) => {
      toast.error('Có lỗi xảy ra khi xóa vai trò');
      console.error('Delete role error:', error);
    },
  });

  return {
    mutation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export const useAssignPermissionToRole = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ roleId, data }: { roleId: number; data: AssignPermissionToRoleRequestType }) => {
      return AdminService.assignPermissionToRole(roleId, data);
    },
    onSuccess: () => {
      toast.success('Gán quyền thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
    onError: (error: Error) => {
      console.log('error: ', error);
      toast.error('Có lỗi xảy ra khi gán quyền');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });

  return {
    mutation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export const useGetAllPermission = (params?: { page?: number; limit?: number }) => {
  const { data, isLoading, error } = useQuery<GetAllPermissionResponseType>({
    queryKey: ['admin', 'permission', params],
    queryFn: () => AdminService.getAllPermission(params),
  });

  return {
    data,
    isLoading,
    error,
  };
};

export const useGetPremissionByRoleId = (
  roleId: number,
  params?: { page?: number; limit?: number }
) => {
  const { data, isLoading, error } = useQuery<GetPermissionByRoleIdType>({
    queryKey: ['admin', 'permission', 'role', roleId, params],
    queryFn: () => AdminService.getPremissionByRoleId(roleId, params),
  });

  return {
    data,
    isLoading,
    error,
  };
};

export const useGetReportMonth = (params: { year: number; month: number }) => {
  const { data, isLoading, error } = useQuery<GetReportMonthResponseType>({
    queryKey: ['admin', 'report', 'month', params],
    queryFn: () => AdminService.getReportMonth(params),
  });

  return {
    data: data?.data,
    isLoading,
    error,
  };
};

export const useGetExportPDFMutipleMonth = (params: {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
}) => {
  const { data, isLoading, error, refetch } = useQuery<GetReportMutipleMonthExportPDFResponseType>({
    queryKey: ['admin', 'report', 'export', 'pdf', params],
    queryFn: () => AdminService.getExportPDFMutipleMonth(params),
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};

export const useGetExportPDFMonthly = (params: { month: number; year: number }) => {
  const { data, isLoading, error } = useQuery<GetReportMutipleMonthExportPDFResponseType>({
    queryKey: ['admin', 'report', 'export', 'pdf', 'monthly', params],
    queryFn: () => AdminService.getExportPDFMonthly(params),
  });

  return {
    data,
    isLoading,
    error,
  };
};

// System Configs hooks
export const useGetSystemConfigs = (params?: SystemConfigSearchParams) => {
  const { data, isLoading, error } = useQuery<SystemConfigsResponse>({
    queryKey: ['admin', 'system-configs', params],
    queryFn: () => AdminService.getSystemConfigs(params),
  });

  return {
    data,
    isLoading,
    error,
  };
};

export const useGetSystemConfigById = (id: string | number) => {
  const { data, isLoading, error } = useQuery<SystemConfigsResponse>({
    queryKey: ['admin', 'system-configs', id],
    queryFn: () => AdminService.getSystemConfigById(id),
    enabled: !!id,
  });

  return {
    data,
    isLoading,
    error,
  };
};

export const useCreateSystemConfig = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: CreateSystemConfigRequest) => AdminService.createSystemConfig(data),
    onSuccess: () => {
      toast.success('Tạo cấu hình hệ thống thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-configs'] });
    },
    onError: (error: Error) => {
      toast.error('Có lỗi xảy ra khi tạo cấu hình hệ thống');
      console.error('Create system config error:', error);
    },
  });

  return {
    mutation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSystemConfigRequest }) =>
      AdminService.updateSystemConfig(id, data),
    onSuccess: () => {
      toast.success('Cập nhật cấu hình hệ thống thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-configs'] });
    },
    onError: (error: Error) => {
      toast.error('Có lỗi xảy ra khi cập nhật cấu hình hệ thống');
      console.error('Update system config error:', error);
    },
  });

  return {
    mutation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export const useDeleteSystemConfig = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: number) => AdminService.deleteSystemConfig(id),
    onSuccess: () => {
      toast.success('Xóa cấu hình hệ thống thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-configs'] });
    },
    onError: (error: Error) => {
      toast.error('Có lỗi xảy ra khi xóa cấu hình hệ thống');
      console.error('Delete system config error:', error);
    },
  });

  return {
    mutation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
