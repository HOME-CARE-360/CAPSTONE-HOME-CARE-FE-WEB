import {
  CustomerType,
  UpdateUserProfileRequestType,
  UpdateUserProfileResponseType,
  ChangePasswordRequestType,
  UserType,
} from '@/schemaValidations/user.schema';
import apiService from '../core';
import { ValidationError } from './fetchAuth';
import { ProviderType } from '@/schemaValidations/provider.schema';
import { StatusBooking, StatusServiceRequest } from './fetchBooking';
import { CompanyType, VerificationStatus } from './fetchManager';
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
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInfomationResponse {
  id: number;
  userId: number;
  address: string | null;
  dateOfBirth: string;
  gender: string;
  createdAt: string;
  updatedAt: string;
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

export interface UpdateBankAccountRequest {
  bankCode: string;
  accountNumber: string;
}

export interface CustomerBooking {
  success: boolean;
  code: string;
  message: string;
  data: {
    bookings: {
      id: number;
      customerId: number;
      providerId: number;
      status: StatusBooking;
      deletedAt: string | null;
      createdAt: string;
      updatedAt: string;
      staffId: number;
      serviceRequestId: number;
      ServiceRequest: {
        id: number;
        customerId: number;
        providerId: number;
        note: string;
        preferredDate: string;
        status: StatusServiceRequest;
        createdAt: string;
        updatedAt: string;
        location: string;
        phoneNumber: string;
        categoryId: number;
        Category: {
          id: number;
          name: string;
          logo: string | null;
          parentCategoryId: number | null;
          createdById: number | null;
          updatedById: number | null;
          deletedById: number | null;
          deletedAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
      };
      ServiceProvider: {
        id: number;
        description: string;
        address: string;
        createdAt: string;
        updatedAt: string;
        userId: number;
        companyType: string;
        industry: string | null;
        licenseNo: string | null;
        logo: string | null;
        taxId: string;
        verificationStatus: string;
        verifiedAt: string | null;
        verifiedById: number | null;
        User_ServiceProvider_userIdToUser: {
          name: string;
          email: string;
          phone: string;
          avatar: string | null;
        };
      };
      Staff_Booking_staffIdToStaff?: {
        id: number;
        userId: number;
        providerId: number;
        createdAt: string;
        updatedAt: string;
        isActive: boolean;
        User: {
          name: string;
          email: string;
          phone: string;
          avatar: string | null;
        };
      };
      WorkLog?: {
        id: number;
        staffId: number;
        bookingId: number;
        checkIn: string;
        checkOut: string | null;
        note: string | null;
        createdAt: string;
        updatedAt: string;
      };
      Transaction?: {
        id: number;
        bookingId: number;
        amount: number;
        status: string;
        method: string;
        paidAt: string | null;
        createdById: number;
        updatedById: number | null;
        deletedById: number | null;
        deletedAt: string | null;
        createdAt: string;
        orderCode: string;
      };
    }[];
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  statusCode: number;
  timestamp: string;
}

export interface FavoriteResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    favoritedAt: string;
    serviceId: number;
    service: {
      id: number;
      name: string;
      basePrice: number;
      virtualPrice: number;
      images: string[];
      description: string;
      durationMinutes: number;
      status: string;
      categoryId: number;
      categoryName: string;
      provider: {
        id: number;
        address: string;
        userId: number;
        name: string;
        phone: string;
        email: string;
      };
    };
  };
  statusCode: number;
  timestamp: string;
}

export interface AddOrRemoveFavoriteResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    favoritedAt: string;
    serviceId: number;
    service: {
      id: number;
      name: string;
      basePrice: number;
      virtualPrice: number;
      images: string[];
      description: string;
      durationMinutes: number;
      status: string;
      categoryId: number;
      categoryName: string;
      provider: {
        id: number;
        address: string;
        userId: number;
        name: string;
        phone: string;
        email: string;
      };
    };
  };
  statusCode: number;
  timestamp: string;
}

export interface GetServiceProviderResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    serviceProvider: {
      id: number;
      description: string;
      address: string;
      createdAt: string; // ISO 8601 string
      updatedAt: string;
      userId: number;
      companyType: CompanyType;
      industry: string | null;
      licenseNo: string | null;
      logo: string | null;
      taxId: string;
      verificationStatus: VerificationStatus;
      verifiedAt: string;
      verifiedById: number | null;
    };
    user: {
      id: number;
      email: string;
      name: string;
      phone: string;
      avatar: string | null;
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;
      createdById: number | null;
      updatedById: number | null;
      createdAt: string;
      updatedAt: string;
    };
  };
  statusCode: number;
  timestamp: string;
}

export interface GetUserProposalResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    id: number;
    notes: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
    createdAt: string; // ISO 8601
    items: {
      id: number;
      serviceId: number;
      quantity: number;
      serviceName: string;
      unitPrice: number;
    }[];
  };
  statusCode: number;
  timestamp: string; // ISO 8601
}

export interface UpdateUserProposalResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    id: number;
  };
  statusCode: number;
}

export interface UpdateUserProposalRequest {
  action: 'ACCEPT' | 'REJECT';
}

export interface UserCompleteBookingRequest {
  bookingId: number;
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
  updateUserProfile: async (
    profileData: UpdateUserProfileRequestType
  ): Promise<UpdateUserProfileResponseType> => {
    try {
      // The API service already handles FormData appropriately in its interceptors
      const response = await apiService.patch<UpdateUserProfileResponseType>(
        '/users/update-customer-information',
        profileData
      );
      return response.data;
    } catch (error) {
      console.error('Update User Profile Error:', error);
      throw error;
    }
  },

  getUserInformation: async (userId: string | number): Promise<GetUserInformationResponse> => {
    const response = await apiService.get<GetUserInformationResponse>(
      `/users/get-customer-information/${userId}`
    );
    return response.data;
  },

  // getProviderInfomation: async (providerId: string | number): Promise<GetProviderResponse> => {
  //   const response = await apiService.get<GetProviderResponse>(
  //     `/publics/get-service-provider-information/${providerId}`
  //   );
  //   return response.data;
  // },

  // Change Passwod
  changePassword: async (data: ChangePasswordRequestType) => {
    const response = await apiService.patch<{ message: string }>('/publics/change-password', data);
    return response.data;
  },

  updateBankAccount: async (
    bankAccountData: UpdateBankAccountRequest
  ): Promise<{ message: string }> => {
    try {
      // Ensure the payload is a plain object for compatibility with apiService.patch
      const payload: Record<string, unknown> = { ...bankAccountData };
      const response = await apiService.patch<{ message: string }>(
        '/users/link-bank-account',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Update Bank Account Error:', error);
      throw error;
    }
  },

  getCustomerBooking: async (): Promise<CustomerBooking> => {
    const response = await apiService.get<CustomerBooking>('/users/my-bookings');
    return response.data;
  },

  getFavorite: async (): Promise<FavoriteResponse> => {
    const response = await apiService.get<FavoriteResponse>('/users/my-favorite-services');
    return response.data;
  },

  addOrRemoveFavorite: async (serviceId: number): Promise<AddOrRemoveFavoriteResponse> => {
    const response = await apiService.patch<AddOrRemoveFavoriteResponse>(
      `/users/my-favorite-services/${serviceId}`
    );
    return response.data;
  },

  getServiceProviderInformation: async (
    providerId: number
  ): Promise<GetServiceProviderResponse> => {
    const response = await apiService.get<GetServiceProviderResponse>(
      `/publics/get-service-provider-information/${providerId}`
    );
    return response.data;
  },

  getUserProposal: async (id: number): Promise<GetUserProposalResponse> => {
    const response = await apiService.get<GetUserProposalResponse>(`/users/my-proposal/${id}`);
    return response.data;
  },

  updateUserProposal: async (
    id: number,
    data: UpdateUserProposalRequest
  ): Promise<UpdateUserProposalResponse> => {
    try {
      // Ensure the payload is a plain object for compatibility with apiService.patch
      const payload: Record<string, unknown> = { ...data };
      const response = await apiService.patch<UpdateUserProposalResponse>(
        `/users/proposal/${id}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Update User Proposal Error:', error);
      throw error;
    }
  },
};

export default userService;
