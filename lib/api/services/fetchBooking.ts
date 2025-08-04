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
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD';
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
    };
    staff?: {
      id: number;
      user: {
        avatar: string | null;
        email: string;
        name: string;
        phone: string;
      };
    };
    inspectionReport?: {
      id: number;
      estimatedTime: number;
      note: string;
      images: string[];
      createdAt: string;
    };
    Proposal?: {
      id: number;
      notes: string;
      createdAt: string;
      status: string;
      ProposalItem: Array<{
        id: number;
        proposalId: number;
        serviceId: number;
        quantity: number;
        createdAt: string;
        Service: {
          basePrice: number;
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
    };
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

export const serviceBooking = {
  createBooking: async (data: CreateBookingRequest) => {
    try {
      const response = await apiService.post(`/bookings/create-service-request`, data);
      return response.data;
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
};
