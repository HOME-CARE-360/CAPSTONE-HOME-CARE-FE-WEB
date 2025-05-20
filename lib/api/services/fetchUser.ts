import apiService from '../core';

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
  code: string;
  status: boolean;
  message?: string;
  data: User;
}

export interface UserUpdateResponse {
  code: string;
  status: boolean;
  message?: string;
  data?: string;
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
};

export default userService;
