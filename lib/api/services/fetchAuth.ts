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
  ADMIN = 'ADMIN',
  SERVICE_PROVIDER = 'SERVICE PROVIDER',
  CUSTOMER = 'CUSTOMER',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
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

export interface GoogleLoginResponse {
  url: string;
}

export interface RefreshTokenResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
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

  // Google login
  googleLogin: async (): Promise<GoogleLoginResponse> => {
    const response = await apiService.get<GoogleLoginResponse>('/auth/google-link');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      const res = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        const status = res.status;
        // Normalize to structured 401 error for upstream handling
        if (status === 401) {
          const structuredError = {
            status: 401,
            response: { status: 401 },
          } as { status?: number; response?: { status?: number } };
          throw structuredError;
        }
        const message = await res.text();
        throw new Error(message || 'Failed to refresh token');
      }

      const data = (await res.json()) as RefreshTokenResponse;
      return data;
    } catch (error: unknown) {
      console.error('Refresh Token API Error:', error);
      type ErrorWithStatus = { status?: number; response?: { status?: number } };
      const err = error as ErrorWithStatus;
      if (err?.response?.status === 401 || err?.status === 401) {
        throw err;
      }
      throw error;
    }
  },

  // Change Password

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
