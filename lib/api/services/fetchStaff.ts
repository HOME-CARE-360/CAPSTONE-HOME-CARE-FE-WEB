import apiService, { RequestParams } from '@/lib/api/core';

export interface GetAllStaffResponse<T> {
  data: T;
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Staff {
  id: number;
  userId: number;
  providerId: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  staffCategories: CategoriesStaff[];
  user: StaffInfo;
}

export interface StaffInfo {
  avatar: string;
  email: string;
  phone: string;
  createdAt: Date;
  name: string;
}

export interface CategoriesStaff {
  staffId: number;
  categoryId: number;
  category: CategoryName;
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  confirmPassword: string;
  categoryIds: number[];
  [key: string]: unknown;
}

export interface CategoryName {
  name: string;
}

export interface CreateStaffReponse {
  message: string;
}

// Check-in interfaces
export interface StaffCheckInResponse {
  success: boolean;
  code: string;
  message: string;
  data: WorkLog;
  statusCode: number;
  timestamp: string;
}

export interface WorkLog {
  id: number;
  staffId: number;
  bookingId: number;
  checkIn: string;
  checkOut: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffCheckInErrorResponse {
  statusCode: number;
  error: string;
  message: {
    message: string;
    path: string[];
  };
  timestamp: string;
  details: {
    bookingId: number;
    preferredDate: string;
    today: string;
  };
}

// Inspection Report interfaces
export interface CreateInspectionReportRequest {
  bookingId: number;
  estimatedTime: number;
  note: string;
  images: string[];
  [key: string]: unknown;
}

export interface CreateInspectionReportResponse {
  success: boolean;
  code: string;
  message: string;
  data: InspectionReport;
  statusCode: number;
  timestamp: string;
}

export interface InspectionReport {
  id: number;
  bookingId: number;
  staffId: number;
  estimatedTime: number;
  note: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// Proposal interfaces
export interface GetProposalResponse {
  success: boolean;
  code: string;
  message: string;
  data: ProposalData[];
  statusCode: number;
  timestamp: string;
}

export interface ProposalData {
  id: number;
  bookingId: number;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  services: ProposalService[];
}

export interface ProposalService {
  id: number;
  proposalId: number;
  serviceId: number;
  quantity: number;
  service: {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    durationMinutes: number;
  };
}

// Thêm interface cho query parameters
export interface StaffSearchParams {
  orderBy?: 'asc' | 'desc';
  categories?: number[];
  name?: string;
  page?: number;
  limit?: number;
}

// Convert StaffSearchParams to RequestParams
const convertStaffFilters = (filters?: StaffSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.orderBy) params.orderBy = filters.orderBy;
  if (filters.categories && filters.categories.length > 0) {
    params.categories = filters.categories;
  }
  if (filters.name) params.name = filters.name;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  return params;
};

export const staffService = {
  getAllStaff: async (filters?: StaffSearchParams): Promise<GetAllStaffResponse<Staff[]>> => {
    const params = convertStaffFilters(filters);
    const response = await apiService.get<GetAllStaffResponse<Staff[]>>(
      '/manage-staffs/list-staff',
      params
    );
    return response.data;
  },

  getStaffAvailable: async (filters?: StaffSearchParams): Promise<GetAllStaffResponse<Staff[]>> => {
    const params = convertStaffFilters(filters);
    const response = await apiService.get<GetAllStaffResponse<Staff[]>>(
      '/manage-staffs/get-available-staff',
      params
    );
    return response.data;
  },

  createStaff: async (data: CreateStaffRequest): Promise<CreateStaffReponse> => {
    const response = await apiService.post<CreateStaffReponse>('/manage-staffs/create-staff', data);
    return response.data;
  },

  staffCheckIn: async (bookingId: number): Promise<StaffCheckInResponse> => {
    const response = await apiService.post<StaffCheckInResponse>(
      `/staffs/staff-checkin/${bookingId}`,
      {}
    );
    return response.data;
  },

  createInspectionReport: async (
    data: CreateInspectionReportRequest
  ): Promise<CreateInspectionReportResponse> => {
    const response = await apiService.post<CreateInspectionReportResponse>(
      '/staffs/create-inspection-report',
      data
    );
    return response.data;
  },

  getProposal: async (bookingId: number): Promise<GetProposalResponse> => {
    const response = await apiService.get<GetProposalResponse>(
      `/staffs/staff-get-proposal/${bookingId}`
    );
    return response.data;
  },

  // getStaffInfomation: async (staffId: string | number): Promise<GetStaffResponse> => {
  //   const response = await apiService.get<GetProviderResponse>(
  //     `/publics/get-staff-information/${staffId}`
  //   );
  //   return response.data;
  // }
};
