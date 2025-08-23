import apiService from '@/lib/api/core';

export interface GetAllBookingsResponse<T> {
  data: T;
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBookingRequest {
  providerId: number;
  note?: string;
  preferredDate: string;
  location: string;
  categoryId: number;
  phoneNumber: string;
  paymentMethod: 'BANK_TRANSFER' | 'WALLET';
}

// Payment response variants
export interface BankTransferPaymentData {
  message: string;
  paymentTransactionId: number;
  referenceNumber: string | number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
  amountOut: number;
  gateway: 'PAYOS' | string;
  transactionDate?: string;
  userId: number;
  serviceRequestId: number;
  responseData?: {
    bin?: string;
    accountNumber?: string;
    accountName?: string;
    amount?: number;
    description?: string;
    orderCode?: string | number;
    currency?: string;
    paymentLinkId?: string;
    status?: string;
    checkoutUrl?: string;
    qrCode?: string;
  };
  checkoutUrl?: string; // some backends duplicate this at top-level
  requiresPayment?: boolean;
}

export interface WalletPaymentData {
  message: string;
  paymentTransactionId: number;
  referenceNumber: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
  amountOut: number;
  gateway: 'INTERNAL_WALLET' | string;
  transactionDate: string;
  userId: number;
  serviceRequestId: number;
  paidViaWallet?: boolean;
  walletBalanceAfter?: number;
}

export type CreateServiceRequestData = BankTransferPaymentData | WalletPaymentData;

export interface CreateServiceRequestResponse {
  success: boolean;
  code: string;
  message: string;
  data: CreateServiceRequestData;
  statusCode: number;
  timestamp: string;
}

// Type guards for runtime checks
export const isBankTransferData = (data: unknown): data is BankTransferPaymentData => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    d['gateway'] === 'PAYOS' || 'responseData' in d || 'checkoutUrl' in d || 'requiresPayment' in d
  );
};

export const isWalletPaymentData = (data: unknown): data is WalletPaymentData => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d['gateway'] === 'INTERNAL_WALLET' || d['paidViaWallet'] === true;
};

export enum StatusBooking {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum StatusServiceRequest {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  ESTIMATED = 'ESTIMATED',
  CANCELLED = 'CANCELLED',
}

export interface Booking {
  id: number;
  status: StatusBooking;
  createdAt: string;
  serviceRequestId: number;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  serviceRequest: {
    id: number;
    preferredDate: string;
    note: string;
    location: string;
    phoneNumber: string;
    status: StatusServiceRequest;
    categoryId: number;
    categoryName: string;
  };
}

export interface DetailBookingResponse {
  id: number;
  customerId: number;
  providerId: number;
  note: string | null;
  preferredDate: string;
  status: StatusServiceRequest;
  createdAt: string;
  updatedAt: string;
  location: string;
  phoneNumber: string;
  categoryId: number;
  category: {
    logo: string | null;
    name: string;
  };
  booking: {
    id: number;
    status: StatusBooking;
    transaction: {
      id: number;
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
    } | null;
    staff: {
      id: number;
      user: {
        avatar: string | null;
        email: string;
        name: string;
        phone: string;
      };
    } | null;
    inspectionReport: {
      id: number;
      estimatedTime: number;
      note: string;
      images: string[];
      createdAt: string;
    } | null;
    Proposal: {
      id: number;
      notes: string;
      createdAt: string;
      status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
      ProposalItem: Array<{
        id: number;
        proposalId: number;
        serviceId: number;
        quantity: number;
        createdAt: string;
        Service: {
          basePrice: number;
          virtualPrice: number;
          description: string;
          name: string;
          images: string[];
          durationMinutes: number;
          category: {
            id: number;
            name: string;
            logo: string | null;
            parentCategoryId: number;
            createdById: number | null;
            updatedById: number | null;
            deletedById: number | null;
            deletedAt: string | null;
            createdAt: string;
            updatedAt: string;
          };
          attachedItems: unknown[];
        };
      }>;
    } | null;
  };
  customer: {
    address: string | null;
    gender: string | null;
    avatar: string | null;
    name: string;
    phone: string;
    email: string;
  };
}

// API-aligned response type for manage-bookings/service-request-detail
export interface GetDetailBookingResponse {
  id: number;
  customerId: number;
  providerId: number;
  note: string | null;
  preferredDate: string;
  status: StatusServiceRequest | string;
  createdAt: string;
  updatedAt: string;
  location: string;
  phoneNumber: string;
  categoryId: number;
  category: {
    logo: string | null;
    name: string;
  };
  booking: {
    id: number;
    status: StatusBooking | string;
    transaction: {
      id: number;
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
    } | null;
    staff: {
      id: number;
      user: {
        avatar: string | null;
        email: string;
        name: string;
        phone: string;
      };
    } | null;
    inspectionReport: {
      id: number;
      estimatedTime: number;
      note: string;
      images: string[];
      createdAt: string;
    } | null;
    Proposal: {
      id: number;
      notes: string;
      createdAt: string;
      status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
      ProposalItem: Array<{
        id: number;
        proposalId: number;
        serviceId: number;
        quantity: number;
        createdAt: string;
        Service: {
          basePrice: number;
          virtualPrice: number;
          description: string;
          name: string;
          images: string[];
          durationMinutes: number;
          category: {
            id: number;
            name: string;
            logo: string | null;
            parentCategoryId: number;
            createdById: number | null;
            updatedById: number | null;
            deletedById: number | null;
            deletedAt: string | null;
            createdAt: string;
            updatedAt: string;
          };
          attachedItems: unknown[];
        };
      }>;
    } | null;
  };
  customer: {
    address: string | null;
    gender: string | null;
    avatar: string | null;
    name: string;
    phone: string;
    email: string;
  };
}

export interface StaffBookingResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    bookings: Booking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  statusCode: number;
  timestamp: string;
}

export interface StaffBookingDetailResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    id: number;
    status: StatusBooking;
    createdAt: string;
    customer: {
      id: number;
      name: string;
      phone: string;
      address: string;
    };
    serviceRequest: {
      id: number;
      preferredDate: string;
      note: string;
      location: string;
      phoneNumber: string;
      status: StatusServiceRequest;
      category: {
        id: number;
        name: string;
      };
    };
  };
  statusCode: number;
  timestamp: string;
}

export interface CreateReportRequest {
  reason: string;
  description: string;
  imageUrls: string[];
}

export interface CreateReportResponse {
  success: true;
  code: string;
  message: string;
  data: {
    id: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
  };
  statusCode: number;
  timestamp: string;
}

export interface Report {
  id: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  booking: Booking;
  provider: Provider;
}

export interface Booking {
  id: number;
  status: StatusBooking;
}

export interface Provider {
  name: string;
  email: string;
  phone: string;
}

export interface GetReportResponse {
  success: true;
  code: string;
  message: string;
  data: {
    reports: Report[];
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  statusCode: number;
  timestamp: string;
}

// Reviews
export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface CreateReviewResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
  };
  statusCode: number;
  timestamp: string;
}

export interface CompleteBookingRequest {
  bookingId: number;
}

export interface CompleteBookingResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    id: number;
    status: string;
    updatedAt: string;
  };
  statusCode: number;
  timestamp: string;
}

export const serviceBooking = {
  createBooking: async (data: CreateBookingRequest): Promise<CreateServiceRequestResponse> => {
    try {
      const response = await apiService.post(`/bookings/create-service-request`, data);
      return response.data as CreateServiceRequestResponse;
    } catch (error) {
      console.error('Create Booking Service Error:', error);
      throw error;
    }
  },

  getAllBookings: async () => {
    try {
      const response = await apiService.get(`/manage-bookings/list-service-request`);
      return response.data;
    } catch (error) {
      console.error('Get All Bookings Error:', error);
      throw error;
    }
  },

  getDetailBooking: async (id: number) => {
    try {
      const response = await apiService.get(`/manage-bookings/service-request-detail/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get Detail Booking Error:', error);
      throw error;
    }
  },

  getStaffListBooking: async (): Promise<StaffBookingResponse> => {
    try {
      const response = await apiService.get(`/staffs/get-list-booking`);
      return response.data as StaffBookingResponse;
    } catch (error) {
      console.error('Get List Booking Error:', error);
      throw error;
    }
  },

  getStaffBookingDetail: async (bookingId: number): Promise<StaffBookingDetailResponse> => {
    try {
      const response = await apiService.get(`/staffs/get-booking-detail/${bookingId}`);
      return response.data as StaffBookingDetailResponse;
    } catch (error) {
      console.error('Get Staff Booking Detail Error:', error);
      throw error;
    }
  },

  updateCompleteBookingOfUser: async (bookingId: number) => {
    try {
      const response = await apiService.put(
        `/manage-bookings/update-complete-booking-of-user/${bookingId}`
      );
      return response.data;
    } catch (error) {
      console.error('Update Complete Booking Of User Error:', error);
      throw error;
    }
  },

  createReport: async (bookingId: number, data: CreateReportRequest) => {
    try {
      const response = await apiService.post(`/users/create-customer-report/${bookingId}`, data);
      return response.data as CreateReportResponse;
    } catch (error) {
      console.error('Create Report Error:', error);
      throw error;
    }
  },

  getReport: async (): Promise<GetReportResponse> => {
    try {
      const response = await apiService.get(`/users/my-reports`);
      return response.data as GetReportResponse;
    } catch (error) {
      console.error('Get Report Error:', error);
      throw error;
    }
  },

  createReview: async (bookingId: number, data: CreateReviewRequest) => {
    try {
      const response = await apiService.post(`/users/create-review/${bookingId}`, data);
      return response.data as CreateReviewResponse;
    } catch (error) {
      console.error('Create Review Error:', error);
      throw error;
    }
  },

  completeBooking: async (data: CompleteBookingRequest): Promise<CompleteBookingResponse> => {
    try {
      const response = await apiService.patch(`/users/complete-booking`, data);
      return response.data as CompleteBookingResponse;
    } catch (error) {
      console.error('Complete Booking Error:', error);
      throw error;
    }
  },
};
