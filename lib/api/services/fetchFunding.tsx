import apiService from '../core';

export interface CreateWithDrawRequest {
  amount: number;
}

export interface CreateWithDrawResponse {
  success: boolean;
  code: string;
  message: string;
}

export interface GetListWithDrawResponse {
  success: boolean;
  code: string;
  message: string;
}

export interface GetDetailWithDrawResponse {
  success: boolean;
  code: string;
  message: string;
}

export const fundingService = {
  createWithDraw: async (data: CreateWithDrawRequest): Promise<CreateWithDrawResponse> => {
    const response = await apiService.post<CreateWithDrawResponse>(
      '/manage-funding/create-withdraw-request',
      {
        amount: data.amount,
      }
    );
    return response.data;
  },

  getListWithDraw: async (): Promise<GetListWithDrawResponse> => {
    const response = await apiService.get<GetListWithDrawResponse>(
      '/manage-funding/get-list-withdraw'
    );
    return response.data;
  },

  getDetailWithDraw: async (id: number): Promise<GetDetailWithDrawResponse> => {
    const response = await apiService.get<GetDetailWithDrawResponse>(
      `/manage-funding/get-withdraw-detail/${id}`
    );
    return response.data;
  },
};
