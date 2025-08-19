import apiService from '@/lib/api/core';
import {
  CreateUserRequestType,
  GetAllUsersResponseType,
  GetUserByIdResponseType,
  GetStatisticsUsersResponseType,
  GetStatisticsRolesUserResponseType,
  AssginRoleToUserRequestType,
  AssignRoleToUserResponseType,
  ResetPasswordUserRequestType,
  ResetPasswordUserResponseType,
  GetAllRoleResponseType,
  CreateRoleResponseType,
  CreateRoleRequestType,
  GetRoleByIdResponseType,
  GetPermissionByRoleIdType,
  AssignPermissionToRoleRequestType,
  AssignPermissionToRoleResponseType,
  GetAllPermissionResponseType,
  GetReportMonthResponseType,
  GetReportMutipleMonthExportPDFResponseType,
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

  assignRoleToUser: async (data: AssginRoleToUserRequestType, userId: number) => {
    const url = `/admin/users/${userId}/roles`;
    const response = await apiService.post<AssignRoleToUserResponseType>(url, data);
    return response.data;
  },

  resetPasswordUser: async (data: ResetPasswordUserRequestType, userId: number) => {
    const url = `/admin/users/${userId}/reset-password`;
    const response = await apiService.post<ResetPasswordUserResponseType>(url, data);
    return response.data;
  },

  getAllRole: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/roles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<GetAllRoleResponseType>(url);
    return response.data;
  },

  createRole: async (data: CreateRoleRequestType) => {
    const url = `/admin/roles`;
    const response = await apiService.post<CreateRoleResponseType>(url, data);
    return response.data;
  },

  getRoleById: async (id: string | number) => {
    const url = `/admin/roles/${id}`;
    const response = await apiService.get<GetRoleByIdResponseType>(url);
    return response.data;
  },

  updateRole: async (id: number, data: CreateRoleRequestType) => {
    const url = `/admin/roles/${id}`;
    const response = await apiService.patch<CreateRoleResponseType>(url, data);
    return response.data;
  },

  deleteRole: async (id: number) => {
    const url = `/admin/roles/${id}`;
    const response = await apiService.delete<ResponseMessageType>(url);
    return response.data;
  },

  getPremissionByRoleId: async (roleId: number, params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/roles/${roleId}/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<GetPermissionByRoleIdType>(url);
    return response.data;
  },

  assignPermissionToRole: async (roleId: number, data: AssignPermissionToRoleRequestType) => {
    const url = `/admin/roles/${roleId}/permissions`;
    const response = await apiService.post<AssignPermissionToRoleResponseType>(url, data);
    return response.data;
  },

  getAllPermission: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<GetAllPermissionResponseType>(url);
    return response.data;
  },

  getReportMonth: async (params: { month: number; year: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());

    const url = `/admin/reports/monthly${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<GetReportMonthResponseType>(url);
    return response.data;
  },

  getExportPDFMutipleMonth: async (params: {
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.startMonth) queryParams.append('startMonth', params.startMonth.toString());
    if (params?.startYear) queryParams.append('startYear', params.startYear.toString());
    if (params?.endMonth) queryParams.append('endMonth', params.endMonth.toString());
    if (params?.endYear) queryParams.append('endYear', params.endYear.toString());

    const url = `/admin/reports/multi-months/export/pdf${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<GetReportMutipleMonthExportPDFResponseType>(url);
    return response.data;
  },

  getExportPDFMonthly: async (params: { month: number; year: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());

    const url = `/admin/reports/monthly/export/pdf${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<GetReportMutipleMonthExportPDFResponseType>(url);
    return response.data;
  },
};
