import apiService from '../core';
import { RequestParams } from '../core';
import { Category } from './fetchCategory';

export interface ServiceManager {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  virtualPrice: number;
  images: string[];
  durationMinutes: number;
  providerId: number;
  provider: string;
  price: number;
  discount: number;
  duration: number;
  categories: Category[];
}
export interface ServiceManagerSearchParams {
  sortBy: string;
  orderBy: string;
  // createdById: number;
  // maxPrice: number;
  // minPrice: number;
  name: string;
  limit: number;
  page: number;
}

export interface ServiceManagerResponse {
  data: ServiceManager[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceManagerRequest {
  basePrice: number;
  images: string[];
  description: string;
  name: string;
  virtualPrice: number;
  durationMinutes: number;
  categories: number[];
}

export interface ServiceManagerUpdateRequest {
  id: number;
  basePrice?: number;
  images?: string[];
  description?: string;
  name?: string;
  virtualPrice?: number;
  durationMinutes?: number;
  categories?: number[];
}

interface ValidationError {
  validation?: string;
  code: string;
  message: string;
  path?: string;
  minimum?: number;
  type?: string;
  inclusive?: boolean;
  exact?: boolean;
}

export interface ServiceManagerCreateResponse {
  message: string | ValidationError[];
  error?: string;
  statusCode?: number;
}

export interface ServiceManagerDetailResponse {
  data: ServiceManager;
}

// Convert ServiceSearchParams to RequestParams
const convertServiceFilters = (filters?: ServiceManagerSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  // if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  // if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
  if (filters.name !== undefined) params.name = filters.name;
  if (filters.sortBy !== undefined) params.sortBy = filters.sortBy;
  if (filters.orderBy !== undefined) params.orderBy = filters.orderBy;
  // if (filters.createdById !== undefined) params.createdById = filters.createdById;

  return params;
};

export const serviceManagerService = {
  // TODO: getList service
  getListServices: async (
    params: ServiceManagerSearchParams = {
      sortBy: 'createdAt',
      orderBy: 'desc',
      // createdById: 0,
      // maxPrice: 0,
      // minPrice: 0,
      name: '',
      limit: 10,
      page: 1,
    }
  ): Promise<ServiceManagerResponse> => {
    try {
      const convertedParams = convertServiceFilters(params);
      const response = await apiService.get<ServiceManagerResponse>(
        '/manage-services/list-service',
        convertedParams
      );
      return response.data;
    } catch (error) {
      console.error('Get Services Error:', error);
      throw error;
    }
  },

  getService: async (id: number): Promise<ServiceManagerDetailResponse> => {
    try {
      const response = await apiService.get<ServiceManagerDetailResponse>(
        `/manage-services/detail/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Get Service Detail Error:', error);
      throw error;
    }
  },

  updateService: async (
    service: ServiceManagerUpdateRequest
  ): Promise<ServiceManagerCreateResponse> => {
    try {
      const response = await apiService.patch<
        ServiceManagerCreateResponse,
        ServiceManagerUpdateRequest
      >('/manage-services/update-service', service);
      return response.data;
    } catch (error) {
      console.error('Update Service Error:', error);
      throw error;
    }
  },

  createService: async (service: ServiceManagerRequest): Promise<ServiceManagerCreateResponse> => {
    try {
      const response = await apiService.post<ServiceManagerCreateResponse, ServiceManagerRequest>(
        '/manage-services/create-service',
        service
      );
      return response.data;
    } catch (error) {
      console.error('Create Service Error:', error);
      throw error;
    }
  },
};
