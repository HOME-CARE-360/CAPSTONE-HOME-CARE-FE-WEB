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

export const managerSerivce = {
  getListProvider: async (filters?: CompanySearchParams): Promise<CompanyListResponse> => {
    const params = convertManagerFilters(filters);
    const response = await apiService.get<CompanyListResponse>(
      '/managers/get-list-provider',
      params
    );
    return response.data;
  },

  // changeStatusProvider: async (id: number; verificationStatus: VerificationStatus): Promise<
};
