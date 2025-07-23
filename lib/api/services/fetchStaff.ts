import apiService, { RequestParams } from '@/lib/api/core';

export interface GetAllStaffResponse<T> {
  data: T;
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Staff {
  id: number;
  userId: number;
  providerId: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  staffCategories: CategoriesStaff[];
  user: StaffInfo;
}

export interface StaffInfo {
  avatar: string;
  email: string;
  phone: string;
  createdAt: Date;
  name: string;
}

export interface CategoriesStaff {
  staffId: number;
  categoryId: number;
  category: CategoryName;
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  confirmPassword: string;
  categoryIds: number[];
  [key: string]: unknown;
}

export interface CategoryName {
  name: string;
}

export interface CreateStaffReponse {
  message: string;
}

// Thêm interface cho query parameters
export interface StaffSearchParams {
  orderBy?: 'asc' | 'desc';
  categories?: number[];
  name?: string;
  page?: number;
  limit?: number;
}

// Convert StaffSearchParams to RequestParams
const convertStaffFilters = (filters?: StaffSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.orderBy) params.orderBy = filters.orderBy;
  if (filters.categories && filters.categories.length > 0) {
    params.categories = filters.categories;
  }
  if (filters.name) params.name = filters.name;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  return params;
};

export const staffService = {
  getAllStaff: async (filters?: StaffSearchParams): Promise<GetAllStaffResponse<Staff[]>> => {
    const params = convertStaffFilters(filters);
    const response = await apiService.get<GetAllStaffResponse<Staff[]>>(
      '/manage-staffs/list-staff',
      params
    );
    return response.data;
  },

  createStaff: async (data: CreateStaffRequest): Promise<CreateStaffReponse> => {
    const response = await apiService.post<CreateStaffReponse>('/manage-staffs/create-staff', data);
    return response.data;
  },

  // getStaffInfomation: async (staffId: string | number): Promise<GetStaffResponse> => {
  //   const response = await apiService.get<GetProviderResponse>(
  //     `/publics/get-staff-information/${staffId}`
  //   );
  //   return response.data;
  // }
};
