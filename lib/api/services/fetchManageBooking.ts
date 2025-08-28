import apiService from '@/lib/api/core';
import { StatusServiceRequest } from './fetchBooking';
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
  status: StatusServiceRequest;
  createdAt: string;
  updatedAt: string;
  location: string;
  phoneNumber: string;
  categoryId: number;
  category: BookingCategory;
  customer: BookingCustomer;
}

// New interface for the actual API response structure
export interface ServiceRequestWithBooking {
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
  category: BookingCategory;
  customer: BookingCustomer;
  booking: {
    id: number;
    customerId: number;
    providerId: number;
    status: string;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    staffId: number | null;
    serviceRequestId: number;
    completedAt: string | null;
  };
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

export interface UpdateProposedBookingRequest {
  notes: string;
  services: {
    serviceId: number;
    quantity: number;
    price: number;
  }[];
  proposalId: number;
}

export interface ProposedService {
  serviceId: number;
  quantity: number;
  price: number;
}

export interface ServiceItem {
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
}

export interface AttachedItem {
  serviceId: number;
  serviceItemId: number;
  serviceItem: ServiceItem;
}

export interface Service {
  id: number;
  name: string;
  basePrice: number;
  virtualPrice: number;
  images: string[];
  durationMinutes: number;
  description: string;
  publishedAt: string;
  attachedItems: AttachedItem[];
  category: {
    name: string;
    logo: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProposalItem {
  id: number;
  proposalId: number;
  serviceId: number;
  quantity: number;
  price: number;
  createdAt: string;
  Service: Service;
}

export interface Proposal {
  id: number;
  notes: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  ProposalItem: ProposalItem[];
}

export interface InspectionReport {
  id: number;
  note: string;
  estimatedTime: number;
  images: string[];
  createdAt: string;
}

export interface Staff {
  id: number;
  userId: number;
  providerId: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  user: {
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
}

export interface DetailBooking {
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
  category: BookingCategory;
  customer: BookingCustomer;
  staff?: Staff;
  inspectionReport?: InspectionReport;
  Proposal?: Proposal;
}

export interface CreateProposedBookingResponse {
  success: boolean;
  code: string;
  message: string;
  data: unknown;
  statusCode: number;
  timestamp: string;
}

export interface UpdateProposedBookingResponse {
  message: string;
}

// Report booking
export type ReporterType = 'CUSTOMER' | 'PROVIDER';

export enum ReportReason {
  NO_SHOW = 'NO_SHOW',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
}

export interface ReportBookingRequest {
  description: string;
  imageUrls: string[];
  note: string;
  reporterType: ReporterType;
  reason: ReportReason | string;
  reportedCustomerId: number;
  reportedProviderId: number;
  bookingId: number;
}

export interface UpdateReportBookingRequest {
  id: number;
  description: string;
  imageUrls: string[];
  note: string;
  reporterType: ReporterType;
  reason: ReportReason | string;
}

export interface ReportBookingResponse {
  message: string;
}

// List reports
export interface BookingReportItem {
  id: number;
  bookingId: number;
  reporterId: number;
  reporterType: ReporterType;
  reportedCustomerId: number;
  reportedProviderId: number;
  reason: ReportReason | string;
  description: string;
  imageUrls: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  createdAt: string;
  reviewedAt: string | null;
  reviewedById: number | null;
  note: string | null;
  reviewResponse: string | null;
}

export interface GetReportListResponse {
  data: BookingReportItem[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Report detail interfaces
export interface ReportDetailBooking {
  id: number;
  customerId: number;
  providerId: number;
  status: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  staffId: number;
  serviceRequestId: number;
  completedAt: string | null;
  Proposal: unknown | null;
}

export interface ReportDetailCustomerProfile {
  id: number;
  userId: number;
  address: string;
  dateOfBirth: string;
  gender: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    phone: string;
    email: string;
    avatar: string;
  };
}

export interface ReportDetailServiceProvider {
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
  verifiedAt: string;
  verifiedById: number | null;
  user: {
    name: string;
    phone: string;
    email: string;
    avatar: string | null;
  };
}

export interface ReportDetailResponse {
  id: number;
  bookingId: number;
  reporterId: number;
  reporterType: ReporterType;
  reportedCustomerId: number;
  reportedProviderId: number;
  reason: ReportReason | string;
  description: string;
  imageUrls: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  createdAt: string;
  reviewedAt: string | null;
  reviewedById: number | null;
  note: string | null;
  reviewResponse: string | null;
  Booking: ReportDetailBooking;
  CustomerProfile: ReportDetailCustomerProfile;
  ServiceProvider: ReportDetailServiceProvider;
}

export interface ManageBookingResponse {
  data: ServiceRequestWithBooking[];
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

  updateProposed: async (
    data: UpdateProposedBookingRequest
  ): Promise<UpdateProposedBookingResponse> => {
    const response = await apiService.patch<
      UpdateProposedBookingResponse,
      UpdateProposedBookingRequest
    >(`/manage-bookings/edit-proposed`, data);
    return response.data;
  },

  reportBooking: async (data: ReportBookingRequest): Promise<ReportBookingResponse> => {
    const response = await apiService.post<ReportBookingResponse, ReportBookingRequest>(
      `/manage-bookings/report-booking`,
      data
    );
    return response.data;
  },

  getReportList: async (): Promise<GetReportListResponse> => {
    const response = await apiService.get(`/manage-bookings/get-list-report`);
    return response.data as GetReportListResponse;
  },

  getReportDetail: async (id: number): Promise<ReportDetailResponse> => {
    const response = await apiService.get(`/manage-bookings/get-report-detail/${id}`);
    return response.data as ReportDetailResponse;
  },

  updateReportBooking: async (data: UpdateReportBookingRequest): Promise<ReportBookingResponse> => {
    const response = await apiService.patch<ReportBookingResponse, UpdateReportBookingRequest>(
      `/manage-bookings/update-report-booking`,
      data
    );
    return response.data;
  },
};
