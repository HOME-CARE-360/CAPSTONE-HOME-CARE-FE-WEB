import apiService from '../core';

export enum Roles {
  Admin = 'Admin',
  Customer = 'Customer',
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OTPVerifyRequest {
  email: string;
  type: 'REGISTER' | 'RESET_PASSWORD';
}

export interface OTPVerifyResponse {
  message: string;
  status?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  confirmPassword: string;
  code: string;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message?: string;
  data: Token;
}

export interface RegisterResponse {
  data?: {
    id: number;
    email: string;
    name: string;
    phone: string;
    avatar: string | null;
    status: string;
    createdById: string | null;
    updatedById: string | null;
    deletedById: string | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    roles: Array<{
      id: number;
      name: string;
    }>;
  };
  // Error message
  message?: [
    {
      message: string;
      path: string;
    },
  ];
  error?: string;
  statusCode?: number;
}

export const fetchAuth = {
  // Request OTP for registration or password reset
  verifyEmailWithOTP: async (data: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    const response = await apiService.post<OTPVerifyResponse, OTPVerifyRequest>('/auth/otp', data);
    return response.data;
  },

  // Login with credentials
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse, LoginCredentials>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiService.post<RegisterResponse, RegisterRequest>(
      '/auth/register',
      data
    );
    return response.data;
  },

  // Logout - no API call, just return resolved promise
  logout: async (): Promise<void> => {
    return Promise.resolve();
  },

  //   // Refresh token
  //   refreshToken: async (): Promise<AuthResponse> => {
  //     const response = await apiService.post<AuthResponse>('/auth/refresh-token', {});
  //     return response.data;
  //   },

  //   // Reset password request
  //   requestPasswordReset: async (email: string): Promise<AuthResponse> => {
  //     const response = await apiService.post<AuthResponse>('/auth/forgot-password', { email });
  //     return response.data;
  //   },

  //   // Reset password with token
  //   resetPassword: async (token: string, newPassword: string): Promise<AuthResponse> => {
  //     const response = await apiService.post<AuthResponse>('/auth/reset-password', {
  //       token,
  //       newPassword
  //     });
  //     return response.data;
  //   }
};

export default fetchAuth;
