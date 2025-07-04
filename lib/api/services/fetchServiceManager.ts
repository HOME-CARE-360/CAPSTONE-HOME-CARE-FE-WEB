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
  categories: Category;
}

export interface ServiceItem {
  id: number;
  name: string;
  unitPrice: number;
  warrantyPeriod: number;
  createdAt: string;
  deletedAt: string;
  updatedAt: string;
  brand: string;
  description: string;
  isActive: boolean;
  model: string;
  stockQuantity: number;
  unit: string;
  providerId: number;
}

export interface ServiceManagerSearchParams {
  sortBy: string;
  orderBy: string;
  name: string;
  limit: number;
  page: number;
}

export interface ServiceItemSearchParams {
  sortBy: string;
  orderBy: string;
  name: string;
  brand: string;
  isActive?: boolean;
  limit: number;
  page: number;
}

export interface ServiceManagerResponse {
  data: ServiceManager[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

export interface ServiceItemResponse {
  data: {
    data: ServiceItem[];
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface ServiceManagerRequest {
  basePrice: number;
  images: string[];
  description: string;
  serviceItemsId: number[];
  name: string;
  virtualPrice: number;
  durationMinutes: number;
  categoryId: number;
}

export interface ServiceItemRequest {
  name: string;
  unitPrice: number;
  warrantyPeriod: number;
  brand: string;
  description: string;
  isActive: boolean;
  model: string;
  stockQuantity: number;
}

export interface ServiceManagerUpdateRequest {
  id: number;
  basePrice?: number;
  images?: string[];
  description?: string;
  name?: string;
  virtualPrice?: number;
  durationMinutes?: number;
  serviceItemsId?: number[];
  categoryId?: number;
}

export interface ServiceItemUpdateRequest {
  id: number;
  name?: string;
  unitPrice?: number;
  warrantyPeriod?: number;
  brand?: string;
  description?: string;
  isActive?: boolean;
  model?: string;
  stockQuantity?: number;
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

export interface ServiceItemCreateResponse {
  message: string | ValidationError[];
  error?: string;
  statusCode?: number;
}

export interface ServiceManagerDetailResponse {
  data: ServiceManager;
  message: string;
}

export interface ServiceItemDetailResponse {
  data: ServiceItem;
  message: string;
}

// Convert ServiceSearchParams to RequestParams
const convertServiceFilters = (filters?: ServiceManagerSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.name !== undefined) params.name = filters.name;
  if (filters.sortBy !== undefined) params.sortBy = filters.sortBy;
  if (filters.orderBy !== undefined) params.orderBy = filters.orderBy;

  return params;
};

// Convert ServiceItemSearchParams to RequestParams
const convertServiceItemFilters = (filters?: ServiceItemSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.name !== undefined) params.name = filters.name;
  if (filters.brand !== undefined) params.brand = filters.brand;
  if (filters.isActive !== undefined) params.isActive = filters.isActive;
  if (filters.sortBy !== undefined) params.sortBy = filters.sortBy;
  if (filters.orderBy !== undefined) params.orderBy = filters.orderBy;

  return params;
};

export const serviceManagerService = {
  // Service management
  getListServices: async (
    params: ServiceManagerSearchParams = {
      sortBy: 'createdAt',
      orderBy: 'desc',
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

  // Service item management
  getListServiceItems: async (
    params: ServiceItemSearchParams = {
      sortBy: 'createdAt',
      orderBy: 'desc',
      name: '',
      brand: '',
      isActive: undefined,
      limit: 10,
      page: 1,
    }
  ): Promise<ServiceItemResponse> => {
    try {
      const convertedParams = convertServiceItemFilters(params);
      const response = await apiService.get<ServiceItemResponse>(
        '/manage-services/get-service-item',
        convertedParams
      );
      return response.data;
    } catch (error) {
      console.error('Get Service Items Error:', error);
      throw error;
    }
  },

  getServiceItem: async (id: number): Promise<ServiceItemDetailResponse> => {
    try {
      const response = await apiService.get<ServiceItemDetailResponse>(
        `/manage-services/detail/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Get Service Item Detail Error:', error);
      throw error;
    }
  },

  createServiceItem: async (
    serviceItem: ServiceItemRequest
  ): Promise<ServiceItemCreateResponse> => {
    try {
      const response = await apiService.post<ServiceItemCreateResponse, ServiceItemRequest>(
        '/manage-services/create-service-item',
        serviceItem
      );
      return response.data;
    } catch (error) {
      console.error('Create Service Item Error:', error);
      throw error;
    }
  },

  updateServiceItem: async (
    serviceItem: ServiceItemUpdateRequest
  ): Promise<ServiceItemCreateResponse> => {
    try {
      const response = await apiService.patch<ServiceItemCreateResponse, ServiceItemUpdateRequest>(
        '/manage-services/update-service',
        serviceItem
      );
      return response.data;
    } catch (error) {
      console.error('Update Service Item Error:', error);
      throw error;
    }
  },

  deleteServiceItem: async (id: number): Promise<ServiceItemCreateResponse> => {
    try {
      const response = await apiService.patch<ServiceItemCreateResponse, ServiceItemUpdateRequest>(
        `/manage-services/delete-service/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Delete Service Item Error:', error);
      throw error;
    }
  },
};
