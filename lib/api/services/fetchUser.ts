import {
  CustomerType,
  UpdateUserProfileRequestType,
  UpdateUserProfileResponseType,
  ChangePasswordRequestType,
  UserType,
} from '@/schemaValidations/user.schema';
import apiService, { RequestParams } from '../core';
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
        PaymentTransaction?: {
          id: number;
          gateway: string;
          status: string;
          transactionDate: string;
          amountIn: number;
          amountOut: number;
          accumulated: number;
          referenceNumber: string;
          transactionContent: string;
          body: string;
          accountNumber: string | null;
          subAccount: string | null;
          createdAt: string;
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

// Reviews
export interface ReviewBookingMeta {
  id: number;
  status: string;
}

export interface ReviewProviderMeta {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface UserReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  booking: ReviewBookingMeta;
  provider: ReviewProviderMeta;
}

export interface GetUserReviewsResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    code: string;
    message: string;
    data: {
      reviews: UserReview[];
      totalItems: number;
      page: number;
      limit: number;
      totalPages: number;
      sortBy?: string;
      sortOrder?: string;
    };
    statusCode: number;
    timestamp: string;
  };
}

export interface UserReviewsSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
}

export interface MaintenanceSuggestionParams extends RequestParams {
  categoryId?: number;
  dueSoon?: boolean;
  priorityFilter?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  limit?: number;
  type?: string;
}

export interface MaintenanceSuggestion {
  assetId: number;
  assetName: string;
  categoryId: number;
  brand: string;
  model: string;
  code: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  reason: string;
  nextDueDate: string;
  dueInDays: number;
  intervalDays: number;
  lastServiceDate: string;
  totalServicesCount: number;
}

export interface MaintenanceSuggestionsResponse {
  success: boolean;
  code: string;
  message: string;
  data: MaintenanceSuggestion[];
}

export interface ExternalProduct {
  id: number;
  title: string;
  url: string;
  imageUrl: string;
  brand: string;
  model: string;
  categoryId: number;
  price: number;
  currency: string;
  discountPct: number | null;
  promoEndsAt: string | null;
  source: string;
  releaseDate: string | null;
  scrapedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSuggestion {
  id: number;
  customerAssetId: number;
  productId: number;
  score: number;
  reason: string;
  status: 'NEW' | 'VIEWED' | 'PURCHASED' | 'IGNORED';
  createdAt: string;
  updatedAt: string;
  ExternalProduct: ExternalProduct;
}

export interface ServiceSuggestionsResponse {
  message: string;
  data: ServiceSuggestion[];
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
    bookingId: number;
    notes: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
    createdAt: string;
    ProposalItem: {
      id: number;
      proposalId: number;
      serviceId: number;
      quantity: number | string;
      status: string;
      price: number;
      createdAt: string;
      Service: {
        id: number;
        basePrice: number;
        virtualPrice: number;
        images: string[];
        durationMinutes: number;
        providerId: number;
        createdById: number;
        updatedById: number;
        deletedById: number | null;
        deletedAt: string | null;
        createdAt: string;
        updatedAt: string;
        name: string;
        publishedAt: string;
        description: string;
        categoryId: number;
        unit: 'PER_JOB' | 'PER_HOUR' | string;
        status: 'ACCEPTED' | 'PENDING' | 'REJECTED' | string;
        Category?: {
          id: number;
          name: string;
        };
        serviceItems?: ServiceItem[];
      };
    }[];
    customerAssets?: {
      id: number;
      categoryId: number;
      brand: string;
      model: string;
      serial: string;
      nickname: string;
      lastMaintenanceDate: string | null;
      totalMaintenanceCount: number;
    }[];
    inspectedAssets?: unknown[];
    assetsByCategory?: Record<string, unknown[]>;
  };
  statusCode: number;
  timestamp: string; // ISO 8601
}

export interface ServiceItem {
  serviceId: number;
  serviceItemId: number;
  serviceItem: {
    id: number;
    name: string;
    unitPrice: number;
    warrantyPeriod: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    brand: string;
    description: string;
    isActive: boolean;
    model: string;
    stockQuantity: number;
    unit: string;
    providerId: number;
  };
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

export interface CancelServiceRequestResponse {
  message: string;
}

// Top Services and Providers
export interface TopDiscountedService {
  id: number;
  name: string;
  images: string[];
  basePrice: number;
  virtualPrice: number;
  discountPercent: number;
  durationMinutes: number;
  description: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
  };
  provider: {
    id: number;
    address: string;
    name: string;
    phone: string;
    email: string;
    avatar: string;
  };
}

export interface TopDiscountedServicesResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    items: TopDiscountedService[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  statusCode: number;
  timestamp: string;
}

export interface TopProvider {
  rank: number;
  id: number;
  address: string;
  userId: number;
  companyType: string;
  industry: string | null;
  logo: string | null;
  taxId: string;
  verificationStatus: string;
  verifiedAt: string | null;
  contact: {
    name: string;
    phone: string;
    email: string;
    avatar: string | null;
  };
  completedBookingsCount: number;
  rating: {
    average: number;
    totalReviews: number;
  };
}

export interface TopProvidersResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    items: TopProvider[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  statusCode: number;
  timestamp: string;
}

export interface TopFavoriteService {
  rank: number;
  serviceId: number;
  favoriteCount: number;
  service: {
    id: number;
    name: string;
    images: string[];
    basePrice: number;
    virtualPrice: number;
    durationMinutes: number;
    status: string;
    description: string;
    updatedAt: string;
    category: {
      id: number;
      name: string;
    };
    provider: {
      id: number;
      address: string;
      userId: number;
      name: string;
      phone: string;
      email: string;
      logo: string | null;
    };
  };
}

export interface TopFavoriteServicesResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    items: TopFavoriteService[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  statusCode: number;
  timestamp: string;
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
        '/publics/link-bank-account',
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

  getUserReviews: async (filters?: UserReviewsSearchParams): Promise<GetUserReviewsResponse> => {
    const response = await apiService.get<GetUserReviewsResponse>(
      `/users/reviews`,
      filters as never
    );
    return response.data;
  },

  deleteUserReview: async (reviewId: number): Promise<{ message: string }> => {
    const response = await apiService.delete<{ message: string }>(`/users/reviews/${reviewId}`);
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

  cancelServiceRequest: async (serviceRequestId: number): Promise<CancelServiceRequestResponse> => {
    const response = await apiService.patch<CancelServiceRequestResponse>(
      `/users/cancel-service-request/${serviceRequestId}`,
      {}
    );
    return response.data;
  },

  getTopDiscountedServices: async (): Promise<TopDiscountedServicesResponse> => {
    const response = await apiService.get<TopDiscountedServicesResponse>(
      '/publics/top-discounted-services'
    );
    return response.data;
  },

  getTopProvidersAllTime: async (): Promise<TopProvidersResponse> => {
    const response = await apiService.get<TopProvidersResponse>('/publics/top-providers-all-time');
    return response.data;
  },

  getTopFavoriteServices: async (): Promise<TopFavoriteServicesResponse> => {
    const response = await apiService.get<TopFavoriteServicesResponse>(
      '/publics/top-favorite-services'
    );
    return response.data;
  },

  getMaintenanceSuggestions: async (
    params?: MaintenanceSuggestionParams
  ): Promise<MaintenanceSuggestionsResponse> => {
    try {
      const response = await apiService.get<MaintenanceSuggestionsResponse>(
        '/users/suggestions',
        params
      );
      return response.data;
    } catch (error) {
      console.error('Get Maintenance Suggestions Error:', error);
      throw error;
    }
  },

  getServiceSuggestions: async (): Promise<ServiceSuggestionsResponse> => {
    try {
      const response = await apiService.get<ServiceSuggestionsResponse>('/services/get-suggestion');
      return response.data;
    } catch (error) {
      console.error('Get Service Suggestions Error:', error);
      throw error;
    }
  },

  getServiceReviews: async (
    serviceId: number,
    params?: ServiceReviewsSearchParams
  ): Promise<GetServiceReviewsResponse> => {
    try {
      const response = await apiService.get<GetServiceReviewsResponse>(
        `/users/services/${serviceId}/reviews`,
        params
      );
      return response.data;
    } catch (error) {
      console.error('Get Service Reviews Error:', error);
      throw error;
    }
  },

  // Provider transactions
  getProviderTransactions: async (): Promise<GetProviderTransactionsResponse> => {
    const response = await apiService.get<GetProviderTransactionsResponse>(
      '/users/provider-transactions'
    );
    return response.data;
  },

  getTransactions: async (): Promise<GetTransactionsResponse> => {
    const response = await apiService.get<GetTransactionsResponse>('/users/transactions');
    return response.data;
  },
};

export interface ServiceReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  booking: {
    id: number;
    status: string;
  };
  serviceId: number | null;
  customer: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
      avatar: string | null;
    };
  };
}

export interface ServiceReviewsSummary {
  averageRating: number;
  totalReviews: number;
  histogram: {
    [key: string]: number;
  };
}

export interface GetServiceReviewsResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    serviceId: number;
    reviews: ServiceReview[];
    summary: ServiceReviewsSummary;
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
    sortBy: string;
    sortOrder: string;
  };
  statusCode: number;
  timestamp: string;
}

export interface ServiceReviewsSearchParams extends RequestParams {
  rating?: number;
  page?: number;
  limit?: number;
}

// Transactions
export interface WalletTransactionItem {
  id: number;
  gateway: string;
  occurredAt: string;
  transactionDate: string;
  createdAt: string;
  accountNumber: string | null;
  subAccount: string | null;
  amountIn: number;
  amountOut: number;
  accumulated: number;
  referenceNumber: string | null;
  transactionContent: string;
  status: string;
  serviceRequestId: number | null;
  withdrawalRequestId: number | null;
}

export interface PaginatedTransactionsMeta {
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface ProposalPaymentsSection {
  items: unknown[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface WalletSection extends PaginatedTransactionsMeta {
  moneyIn: WalletTransactionItem[];
  moneyOut: WalletTransactionItem[];
}

export interface GetTransactionsResponse {
  data: {
    success: boolean;
    code: string;
    message: string;
    data: {
      proposalPayments: ProposalPaymentsSection;
      wallet: WalletSection;
    };
    statusCode: number;
    timestamp: string;
  };
}

// Provider transactions (provider wallet activities)
export interface ProviderTransactionItem {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string | null;
  subAccount: string | null;
  amountIn: number;
  amountOut: number;
  accumulated: number;
  referenceNumber: string | null;
  transactionContent: string | null;
  body: string | null;
  createdAt: string;
  serviceRequestId: number | null;
  status: string;
  userId: number;
  withdrawalRequestId: number | null;
  ServiceRequest: unknown | null;
}

export interface GetProviderTransactionsResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    data: ProviderTransactionItem[];
  };
  statusCode: number;
  timestamp: string;
}

export default userService;
