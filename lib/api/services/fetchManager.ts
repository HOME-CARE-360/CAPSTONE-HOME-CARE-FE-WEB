import apiService, { RequestParams } from '../core';

export interface CompanyListResponse {
  data: Company[];
  pagination: PaginationMeta;
}

export enum CompanyType {
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  LIMITED_LIABILITY = 'LIMITED_LIABILITY',
  JOINT_STOCK = 'JOINT_STOCK',
  PARTNERSHIP = 'PARTNERSHIP',
  OTHER = 'OTHER',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface Company {
  id: number;
  description: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  companyType: CompanyType;
  industry: string | null;
  licenseNo: string | null;
  logo: string | null;
  taxId: string;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  verifiedById: number | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CompanySearchParams {
  page?: number;
  limit?: number;
  name?: string;
  companyType?: CompanyType;
  verificationStatus?: VerificationStatus;
}

export interface ChangeStatusProviderRequest {
  id: number;
  verificationStatus: VerificationStatus;
}

export interface ChangeStatusProviderResponse {
  message: string;
}

export interface ServiceCategory {
  logo: string | null;
  name: string;
}

export type ServiceStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'INACTIVE';

export interface Service {
  id: number;
  basePrice: number;
  virtualPrice: number;
  images: string[];
  durationMinutes: number;
  providerId: number;
  name: string;
  description: string;
  categoryId: number;
  unit: 'PER_JOB' | 'PER_HOUR' | 'PER_ITEM';
  status: ServiceStatus;
  Category: ServiceCategory;
  provider: string;
}

export interface ServiceListResponse {
  data: Service[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceSearchParams {
  status: ServiceStatus;
  categoryId: number;
  providerIds: number[];
  name: string;
  page: number;
  limit: number;
}

// Reports
export interface Report {
  id: number;
  customerId: number;
  providerId: number;
  bookingId: number;
  reason: string;
  description: string;
  imageUrls: string[];
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedById: number | null;
  note: string | null;
}

export interface ReportListResponse {
  data: Report[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReportSearchParams {
  page?: number;
  limit?: number;
  status?: string;
  query?: string;
}

// Withdraws
export interface WithdrawItemUser {
  id?: number;
  name?: string | null;
  email?: string | null;
}

export interface WithdrawItem {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  processedAt: string | null;
  processedById: number | null;
  note: string | null;
  userId: number;
  User: WithdrawItemUser | null;
}

export interface WithdrawListResponse {
  data: WithdrawItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface WithdrawSearchParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface UpdateWithdrawRequest {
  id: number;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  note?: string | null;
}

export interface UpdateWithdrawResponse {
  message: string;
}

export interface ChangeStatusServiceRequest {
  id: number;
  status: 'ACCEPTED' | 'REJECTED';
}

export interface ChangeStatusServiceResponse {
  message: string;
}

const convertManagerFilters = (filters?: CompanySearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.name) params.name = filters.name;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.companyType) params.companyType = filters.companyType;
  if (filters.verificationStatus) params.verificationStatus = filters.verificationStatus;

  return params;
};

const convertServiceFilters = (filters?: ServiceSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.name) params.name = filters.name;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.status) params.status = filters.status;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.providerIds) params.providerIds = filters.providerIds;

  return params;
};

const convertReportFilters = (filters?: ReportSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.status) params.status = filters.status;
  if (filters.query) params.query = filters.query;

  return params;
};

const convertWithdrawFilters = (filters?: WithdrawSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.status) params.status = filters.status;

  return params;
};

export const managerSerivce = {
  getListProvider: async (filters?: CompanySearchParams): Promise<CompanyListResponse> => {
    const params = convertManagerFilters(filters);
    const response = await apiService.get<CompanyListResponse>(
      '/managers/get-list-provider',
      params
    );
    return response.data;
  },

  changeStatusProvider: async (
    data: ChangeStatusProviderRequest
  ): Promise<ChangeStatusProviderResponse> => {
    const response = await apiService.patch<
      ChangeStatusProviderResponse,
      ChangeStatusProviderRequest
    >(`/managers/change-status-provider`, data);
    return response.data;
  },

  getListService: async (filters?: ServiceSearchParams): Promise<ServiceListResponse> => {
    const params = convertServiceFilters(filters);
    const response = await apiService.get<ServiceListResponse>(
      '/managers/get-list-service',
      params
    );
    return response.data;
  },

  changeStatusService: async (
    data: ChangeStatusServiceRequest
  ): Promise<ChangeStatusServiceResponse> => {
    const response = await apiService.patch<
      ChangeStatusServiceResponse,
      ChangeStatusServiceRequest
    >('/managers/change-status-service', data);
    return response.data;
  },

  getListReport: async (filters?: ReportSearchParams): Promise<ReportListResponse> => {
    const params = convertReportFilters(filters);
    const response = await apiService.get<ReportListResponse>('/managers/get-list-report', params);
    return response.data;
  },

  getListWithdraw: async (filters?: WithdrawSearchParams): Promise<WithdrawListResponse> => {
    const params = convertWithdrawFilters(filters);
    const response = await apiService.get<WithdrawListResponse>(
      '/managers/get-list-withdraw',
      params
    );
    return response.data;
  },

  getWithdrawDetail: async (id: number): Promise<WithdrawItem> => {
    const response = await apiService.get<WithdrawItem>(`/managers/get-withdraw-detail/${id}`);
    return response.data as unknown as WithdrawItem;
  },

  updateWithdraw: async (payload: UpdateWithdrawRequest): Promise<UpdateWithdrawResponse> => {
    const response = await apiService.patch<UpdateWithdrawResponse, UpdateWithdrawRequest>(
      '/managers/update-withdraw',
      payload
    );
    return response.data;
  },
};
