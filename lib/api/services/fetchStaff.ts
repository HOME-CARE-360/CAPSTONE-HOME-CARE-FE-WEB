import { StaffFormData } from '@/app/(provider)/provider/manage-staff/components/StaffCreateModal';
import apiService from '@/lib/api/core';

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

export interface CategoryName {
  name: string;
}

export interface CreateStaffReponse {
  message: string;
}

export const staffService = {
  getAllStaff: async (): Promise<GetAllStaffResponse<Staff[]>> => {
    const response = await apiService.get<GetAllStaffResponse<Staff[]>>(
      '/manage-staffs/list-staff'
    );
    return response.data;
  },

  createStaff: async (data: StaffFormData): Promise<CreateStaffReponse> => {
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
