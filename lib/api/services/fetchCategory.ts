import { CategoryCreateType, CategoryUpdateType } from '@/schemaValidations/category.schema';
import apiService, { RequestParams } from '../core';
import { ResponseMessageType } from '@/schemaValidations/response.schema';
export interface Category {
  id: number;
  logo: string | null;
  name: string;
  parentCategory?: Category | null;
}

export interface CategoryResponse {
  data: Category[];
}

export interface CategorySearchParams {
  name?: string;
}

// Convert ServiceSearchParams to RequestParams
const convertCategoryFilters = (filters?: CategorySearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.name) params.name = filters.name;

  return params;
};

export const categoryService = {
  getCategories: async (filters?: CategorySearchParams): Promise<Category[]> => {
    const params = convertCategoryFilters(filters);
    const response = await apiService.get<Category[]>('/categories/get-list-category', params);
    return response.data;
  },

  deleteCategoryById: async (id: string | number): Promise<ResponseMessageType> => {
    const response = await apiService.delete<ResponseMessageType>(
      `/managers/delete-category/${id}`
    );
    return response.data;
  },

  updateCategoryById: async (
    id: string | number,
    data: CategoryUpdateType
  ): Promise<ResponseMessageType> => {
    const response = await apiService.patch<ResponseMessageType>(
      `/managers/update-category/${id}`,
      data
    );
    return response.data;
  },

  createCategory: async (data: CategoryCreateType): Promise<ResponseMessageType> => {
    const response = await apiService.post<ResponseMessageType>(`/managers/create-category`, data);
    return response.data;
  },
};
