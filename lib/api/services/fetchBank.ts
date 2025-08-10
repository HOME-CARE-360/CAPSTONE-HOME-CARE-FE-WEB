import apiService from '@/lib/api/core';

export interface Bank {
  id: number;
  name: string;
  accountNumber: string;
  accountName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

export interface GetAllBankResponse {
  code: string;
  desc: string;
  data: Bank[];
}

export const bankService = {
  getBankList: async (): Promise<GetAllBankResponse> => {
    const response = await apiService.get<GetAllBankResponse>('https://api.vietqr.io/v2/banks');
    return response.data;
  },
};
