import apiService from '../core';

export interface ServiceManager {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  virtualPrice: number;
  images: string[];
  durationMinutes: number;
  providerId: number;
  price: number;
  discount: number;
  duration: number;
  categories: string[];
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
  categories: string[];
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

export const serviceManagerService = {
  // TODO: getList service
  getListServices: async (): Promise<ServiceManagerResponse> => {
    try {
      //   const params = convertServiceFilters(filters);
      const response = await apiService.get<ServiceManagerResponse>(
        '/manage-services/list-service'
      );
      return response.data;
    } catch (error) {
      console.error('Get Services Error:', error);
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
