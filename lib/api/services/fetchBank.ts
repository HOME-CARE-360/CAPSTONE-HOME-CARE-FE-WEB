import apiService from '@/lib/api/core';

// External shape from https://api.banklookup.net/bank/list
interface ExternalBankItem {
  id: string;
  name: string;
  code: string;
  bin: number;
  short_name: string;
  logo_url: string;
  icon_url: string;
  swift_code: string | null;
  lookup_supported: number;
}

interface ExternalBankResponse {
  code: number;
  success: boolean;
  data: ExternalBankItem[];
  msg: string;
}

// Internal normalized shape used across the app
export interface Bank {
  id: string;
  name: string;
  code: string;
  bin: number;
  shortName: string;
  logo: string; // use logo_url
  icon?: string; // optional icon url
  lookupSupported: number;
  // Keep backward compatibility with previous UI usage
  transferSupported?: number;
}

export interface BankListResponse {
  code: number;
  success: boolean;
  data: Bank[];
  msg: string;
}

export const bankService = {
  getBankList: async (): Promise<BankListResponse> => {
    const response = await apiService.get<ExternalBankResponse>(
      'https://api.banklookup.net/bank/list'
    );
    const payload = response.data;

    const normalized: Bank[] = (payload.data || []).map(
      (item): Bank => ({
        id: item.id,
        name: item.name,
        code: item.code,
        bin: item.bin,
        shortName: item.short_name,
        logo: item.logo_url,
        icon: item.icon_url,
        lookupSupported: item.lookup_supported,
        transferSupported: item.lookup_supported,
      })
    );

    return {
      code: payload.code,
      success: payload.success,
      data: normalized,
      msg: payload.msg,
    };
  },
};
