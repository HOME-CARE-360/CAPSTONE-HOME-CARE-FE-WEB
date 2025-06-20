import apiService from '../core';

export interface ValidationError {
  validation?: string;
  code: string;
  message: string;
  path?: string;
  minimum?: number;
  type?: string;
  inclusive?: boolean;
  exact?: boolean;
}

export enum Roles {
  Admin = 'Admin',
  SERVICE_PROVIDER = 'SERVICE PROVIDER',
  CUSTOMER = 'CUSTOMER',
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export enum OTPType {
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  DISABLE_2FA = 'DISABLE_2FA',
  LOGIN = 'LOGIN',
}

export interface OTPVerifyRequest {
  email: string;
  type: OTPType;
}

export interface OTPVerifyResponse {
  message?: string | ValidationError[];
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
  data?: Token;
  message?: string | ValidationError[];
}

export interface RegisterResponse {
  message?: string | ValidationError[];
}

export enum CompanyType {
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  LIMITED_LIABILITY = 'LIMITED_LIABILITY',
  JOINT_STOCK = 'JOINT_STOCK',
  PARTNERSHIP = 'PARTNERSHIP',
  OTHER = 'OTHER',
}

export interface RegisterProviderRequest {
  taxId: string;
  companyType: CompanyType;
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
  message?: string | ValidationError[];
}

export const fetchAuth = {
  // Request OTP for registration or password reset
  verifyEmailWithOTP: async (data: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    try {
      const response = await apiService.post<OTPVerifyResponse, OTPVerifyRequest>(
        '/auth/otp',
        data
      );
      return response.data;
    } catch (error) {
      console.error('OTP API Error:', error);
      throw error;
    }
  },

  // Login with credentials
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await apiService.post<LoginResponse, LoginCredentials>(
        '/auth/login',
        credentials
      );
      return response.data;
    } catch (error) {
      console.error('Login API Error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiService.post<RegisterResponse, RegisterRequest>(
        '/auth/register',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Register API Error:', error);
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
      return response.data;
    } catch (error) {
      console.error('Register Provider API Error:', error);
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
