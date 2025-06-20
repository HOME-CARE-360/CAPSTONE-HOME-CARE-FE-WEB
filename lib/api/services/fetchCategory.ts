import apiService, { RequestParams } from '../core';

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
};
