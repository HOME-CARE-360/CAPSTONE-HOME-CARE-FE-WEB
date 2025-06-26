import { CustomerType, UserType } from '@/schemaValidations/user.schema';
import apiService from '../core';
import { ValidationError } from './fetchAuth';
import { ProviderType } from '@/schemaValidations/privder.schema';
export interface User {
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  status?: string;
  role: string;
  about?: string;
  birthDate: string;
  joinedAt: string;
}

export interface UserResponse {
  data?: User;
  message?: string | ValidationError[];
}

export interface UserUpdateResponse {
  message?: string | ValidationError[];
}

export interface UserInfomationRepsonse {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInfomationResponse {
  id: number;
  userId: number;
  address: string | null;
  dateOfBirth: string;
  gender: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUserInformationResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    User: UserInfomationRepsonse;
    customer: CustomerInfomationResponse;
  };
  statusCode: number;
}

export interface GetProfileResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    user: UserType;
    customer: CustomerType;
  };
  statusCode: number;
}

export interface GetProviderResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    user: UserType;
    provider: ProviderType;
  };
  statusCode: number;
}

// User service with profile-related API methods
export const userService = {
  // Get current user profile
  getUserProfile: async (): Promise<GetProfileResponse> => {
    try {
      const response = await apiService.get<GetProfileResponse>('/publics/get-me');
      return response.data;
    } catch (error) {
      console.error('Get User Profile Error:', error);
      throw error;
    }
  },

  // Update current user profile
  updateUserProfile: async (profileData: Partial<User> | FormData): Promise<UserUpdateResponse> => {
    try {
      // The API service already handles FormData appropriately in its interceptors
      const response = await apiService.put<UserUpdateResponse, Partial<User> | FormData>(
        '/users/update-profile',
        profileData
      );
      return response.data;
    } catch (error) {
      console.error('Update User Profile Error:', error);
      throw error;
    }
  },

  getUserInfomation: async (userId: string | number): Promise<GetUserInformationResponse> => {
    const response = await apiService.get<GetUserInformationResponse>(
      `/users/get-customer-information/${userId}`
    );
    return response.data;
  },

  getProviderInfomation: async (providerId: string | number): Promise<GetProviderResponse> => {
    const response = await apiService.get<GetProviderResponse>(
      `/publics/get-service-provider-information/${providerId}`
    );
    console.log('response:: ', response);
    return response.data;
  },
};

export default userService;
