import apiService from '../core';
import { ValidationError } from './fetchAuth';
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

// User service with profile-related API methods
export const userService = {
  // Get current user profile
  getUserProfile: async (): Promise<UserResponse> => {
    try {
      const response = await apiService.get<UserResponse>('/users/profile');
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
};

export default userService;
