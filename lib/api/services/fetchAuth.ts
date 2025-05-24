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
  status?: boolean;
  message?: Message;
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

export interface Message {
  message: string;
  path: string;
}

export interface LoginResponse {
  data?: Token;
  message?: Message;
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
  message?: Message;
}

export interface RegisterProviderRequest {
  taxId: string;
  companyType: 'SOLE_PROPRIETORSHIP' | 'LIMITED_LIABILITY' | 'PARTNERSHIP' | 'OTHER';
  industry: string;
  address: string;
  description: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  confirmPassword: string;
  code: string;
}

export interface RegisterProviderResponse {
  data?: {
    id: number;
    email: string;
    name: string;
    phone: string;
    taxId: string;
    companyType: string;
    industry: string;
    address: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: Message;
}

export const fetchAuth = {
  // Request OTP for registration or password reset
  verifyEmailWithOTP: async (data: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    try {
      const response = await apiService.post<OTPVerifyResponse, OTPVerifyRequest>(
        '/auth/otp',
        data
      );

      // Check if this is a successful response (status 200 or 201)
      if (response.status === 200 || response.status === 201) {
        // Ensure we return a proper success response even if the data structure is empty
        return { status: true };
      }

      return response.data;
    } catch (error: unknown) {
      // Properly type the error
      const apiError = error as { status?: number };

      // Check if this is actually a success response being treated as an error
      if (apiError.status === 200 || apiError.status === 201) {
        return { status: true };
      }

      // Enhanced error logging to see full error structure
      console.error('OTP API Error - Full structure:', JSON.stringify(error, null, 2));

      // Do not transform the error here, just pass it along to be handled by the hook
      throw error;
    }
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
    try {
      const response = await apiService.post<RegisterResponse, RegisterRequest>(
        '/auth/register',
        data
      );
      console.log('Register API Response:', response);

      // Check if this is a successful response (status 200 or 201)
      if (response.status === 200 || response.status === 201) {
        console.log('Registration successful with status:', response.status);
        // Ensure we return a proper success response
        return response.data || { status: true };
      }

      return response.data;
    } catch (error: unknown) {
      // Enhanced error logging to see full error structure
      console.error('Register API Error - Full structure:', JSON.stringify(error, null, 2));

      // Do not transform the error here, just pass it along to be handled by the hook
      throw error;
    }
  },

  // Register new provider
  registerProvider: async (data: RegisterProviderRequest): Promise<RegisterProviderResponse> => {
    try {
      const response = await apiService.post<RegisterProviderResponse, RegisterProviderRequest>(
        '/auth/register-provider',
        data
      );
      console.log('Register Provider API Response:', response);

      // Check if this is a successful response (status 200 or 201)
      if (response.status === 200 || response.status === 201) {
        console.log('Provider registration successful with status:', response.status);
        // Ensure we return a proper success response
        return response.data || { status: true };
      }

      return response.data;
    } catch (error: unknown) {
      // Enhanced error logging to see full error structure
      console.error(
        'Register Provider API Error - Full structure:',
        JSON.stringify(error, null, 2)
      );

      // Do not transform the error here, just pass it along to be handled by the hook
      throw error;
    }
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
