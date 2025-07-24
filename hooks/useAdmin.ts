import { useQuery, useMutation } from '@tanstack/react-query';
import { AdminService } from '@/lib/api/services/fetchAdmin';
import { toast } from 'sonner';
import {
  CreateUserRequestType,
  GetAllUsersResponseType,
  UserFormData,
} from '@/schemaValidations/admin.schema';

interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const useGetAllUsers = (params?: UserSearchParams) => {
  const { data, isLoading, error } = useQuery<GetAllUsersResponseType>({
    queryKey: ['admin', 'users', params],
    queryFn: () => AdminService.getUsers(params),
  });

  console.log('data: ', data);

  return {
    data,
    isLoading,
    error,
  };
};

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
  const mutation = useMutation({
    mutationFn: (data: UserFormData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userDataForServer } = data;
      return AdminService.createUser(userDataForServer as CreateUserRequestType);
    },
    onSuccess: () => {
      toast.success('Tạo người dùng thành công');
    },
    onError: (error: Error) => {
      toast.error('Có lỗi xảy ra khi tạo người dùng');
      console.error('Create user error:', error);
    },
  });

  return mutation;
};

export const useGetStatisticsUsers = () => {
  const { data, isLoading, error } = useQuery({
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
