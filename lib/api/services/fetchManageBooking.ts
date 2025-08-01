import apiService from '@/lib/api/core';

export interface BookingCategory {
  logo: string | null;
  name: string;
}

export interface BookingCustomer {
  address: string | null;
  gender: string | null;
  avatar: string | null;
  name: string;
  phone: string;
  email: string;
}

export interface Booking {
  id: number;
  customerId: number;
  providerId: number;
  note: string | null;
  preferredDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  location: string;
  phoneNumber: string;
  categoryId: number;
  category: BookingCategory;
  customer: BookingCustomer;
}

export interface AssignStaffToBookingRequest {
  staffId: number;
  customerId: number;
  serviceRequestId: number;
}

export interface CreateProposedBookingRequest {
  bookingId: number;
  notes: string;
  services: ProposedService[];
  [key: string]: unknown;
}

export interface ProposedService {
  serviceId: number;
  quantity: number;
}

export interface CreateProposedBookingResponse {
  success: boolean;
  code: string;
  message: string;
  data: unknown;
  statusCode: number;
  timestamp: string;
}

export interface ManageBookingResponse {
  data: Booking[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const serviceManageBooking = {
  getBookings: async (params?: GetBookingsParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiService.get(
      `/manage-bookings/list-service-request${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data as ManageBookingResponse;
  },

  assignStaff: async (data: AssignStaffToBookingRequest) => {
    const response = await apiService.post(`/manage-bookings/assign-staff-to-booking`, data);
    return response.data;
  },

  createProposed: async (
    data: CreateProposedBookingRequest
  ): Promise<CreateProposedBookingResponse> => {
    const response = await apiService.post<CreateProposedBookingResponse>(
      `/manage-bookings/create-proposed`,
      data
    );
    return response.data;
  },
};
