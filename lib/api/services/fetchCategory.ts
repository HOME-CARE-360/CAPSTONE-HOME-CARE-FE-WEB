import apiService from '@/lib/api/core';

export interface CategoryStaff {
  id: number;
  name: string;
  logo: string | null;
  parentCategory?: ParentCategory | null;
}

interface ParentCategory {
  id: number;
  name: string;
  logo: string | null;
}

export const categoryStaffService = {
  getAllCategoryStaff: async (): Promise<CategoryStaff[]> => {
    const response = await apiService.get<CategoryStaff[]>('/categories/get-list-category');
    return response.data;
  },
};
