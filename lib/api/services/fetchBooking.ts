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

export interface CreateServiceRequestResponse {
  code: string;
  data: {
    message: string;
    amount: number;
    transactionId: number;
    bookingId: number;
    createdAt: string;
    createdById: number;
    method: 'BANK_TRANSFER' | 'WALLET' | string;
    responseData: {
      accountNumber: string;
      accountName: string;
      amount: number;
      bin: string;
      checkoutUrl: string;
      currency: string;
      description: string;
      orderCode: string;
      paymentLinkId: string;
      qrCode: string;
      status: string;
    };
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
  };
  message: string;
  statusCode: number;
  success: boolean;
  timestamp: string;
}

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
};
