import apiService from '../core';
import { Message } from './fetchAuth';

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
  message?: Message;
}

export interface UserUpdateResponse {
  code: string;
  status: boolean;
  message?: string;
  data?: string;
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

// User service with profile-related API methods
export const userService = {
  // Get current user profile
  getUserProfile: async (): Promise<UserResponse> => {
    const response = await apiService.get<UserResponse>('/users/profile');
    return response.data;
  },

  // Update current user profile
  updateUserProfile: async (profileData: Partial<User> | FormData): Promise<UserUpdateResponse> => {
    // The API service already handles FormData appropriately in its interceptors
    const response = await apiService.put<UserUpdateResponse, Partial<User> | FormData>(
      '/users/update-profile',
      profileData
    );
    return response.data;
  },

  getUserInfomation: async (userId: string | number): Promise<GetUserInformationResponse> => {
    const response = await apiService.get<GetUserInformationResponse>(
      `/users/get-customer-information/${userId}`
    );
    return response.data;
  },
};

export default userService;
