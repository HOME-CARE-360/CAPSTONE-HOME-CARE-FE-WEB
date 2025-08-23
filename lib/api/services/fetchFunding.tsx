import apiService from '../core';

export interface CreateWithDrawRequest {
  amount: number;
}

export interface CreateWithDrawResponse {
  success: boolean;
  code: string;
  message: string;
  data?: WithdrawRequest;
}

export interface WithdrawRequest {
  id: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  processedAt: string | null;
  processedById: number | null;
  note: string | null;
  userId: number;
}

export interface GetListWithDrawResponse extends Array<WithdrawRequest> {}

export interface WithdrawDetailUser {
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

export interface WithdrawDetailResponse {
  id: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  processedAt: string | null;
  note: string | null;
  User: WithdrawDetailUser;
}

export interface GetDetailWithDrawResponse extends WithdrawDetailResponse {}

export const fundingService = {
  createWithDraw: async (data: CreateWithDrawRequest): Promise<CreateWithDrawResponse> => {
    const response = await apiService.post<CreateWithDrawResponse>(
      '/publics/create-withdraw-request',
      {
        amount: data.amount,
      }
    );
    return response.data;
  },

  getListWithDraw: async (): Promise<GetListWithDrawResponse> => {
    const response = await apiService.get<GetListWithDrawResponse>('/publics/get-list-withdraw');
    return response.data;
  },

  getDetailWithDraw: async (id: number): Promise<GetDetailWithDrawResponse> => {
    const response = await apiService.get<GetDetailWithDrawResponse>(
      `/publics/get-withdraw-detail/${id}`
    );
    return response.data;
  },
};
