import apiService from '@/lib/api/core';
import {
  CreateUserRequestType,
  GetAllUsersResponseType,
  GetUserByIdResponseType,
  GetStatisticsUsersResponseType,
  GetStatisticsRolesUserResponseType,
} from '@/schemaValidations/admin.schema';
import { ResponseMessageType } from '@/schemaValidations/response.schema';

interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const AdminService = {
  getUsers: async (params?: UserSearchParams): Promise<GetAllUsersResponseType> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<GetAllUsersResponseType>(url);
    return response.data;
  },

  getUserById: async (id: string | number) => {
    const url = `/admin/users/${id}`;
    const response = await apiService.get<GetUserByIdResponseType>(url);
    return response.data;
  },

  deleteUser: async (id: string | number) => {
    const url = `/admin/users/${id}`;
    const response = await apiService.delete<ResponseMessageType>(url);
    return response.data;
  },

  createUser: async (data: CreateUserRequestType) => {
    const url = `/admin/users`;
    const response = await apiService.post<ResponseMessageType>(url, data);
    return response.data;
  },

  getStatisticsUsers: async () => {
    const url = `/admin/statistics/users`;
    const response = await apiService.get<GetStatisticsUsersResponseType>(url);
    return response.data;
  },

  getStatisticsRolesUser: async () => {
    const url = `/admin/statistics/roles`;
    const response = await apiService.get<GetStatisticsRolesUserResponseType>(url);
    return response.data;
  },
};
