import apiService, { RequestParams } from '../core';

export interface Category {
  logo: string;
  name: string;
}
export interface Service {
  id: number;
  name: string;
  basePrice: number;
  virtualPrice: number;
  images: string[];
  durationMinutes: number;
  providerId: number;
  description: string;
  Category: Category;
  provider: string;
}

// API response types
export interface ServiceListResponse {
  data: Service[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceDetailResponse {
  data: Service;
}

export interface SortBy {
  createdAt: string;
  price: number;
  discount: string;
}

export interface OrderBy {
  asc: string;
  desc: string;
}

// Search parameters
export interface ServiceSearchParams {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: number[];
  minPrice?: number;
  maxPrice?: number;
  providerId?: number;
  sortBy?: SortBy;
  orderBy?: OrderBy;
}

// Convert ServiceSearchParams to RequestParams
const convertServiceFilters = (filters?: ServiceSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.name) params.name = filters.name;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
  if (filters.providerId !== undefined) params.providerId = filters.providerId;

  return params;
};

// Service API methods
export const serviceService = {
  // Get all services with filters
  getServices: async (filters?: ServiceSearchParams): Promise<ServiceListResponse> => {
    try {
      const params = convertServiceFilters(filters);
      const response = await apiService.get<ServiceListResponse>(
        '/services/get-list-service',
        params
      );
      return response.data;
    } catch (error) {
      console.error('Get Services Error:', error);
      throw error;
    }
  },

  // Get a single service by ID
  getService: async (id: string | number): Promise<ServiceDetailResponse> => {
    try {
      const response = await apiService.get<ServiceDetailResponse>(`/services/detail/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get Service Detail Error:', error);
      throw error;
    }
  },
};

export default serviceService;
