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
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
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
    status: string;
    categoryId: number;
    categoryName: string;
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
