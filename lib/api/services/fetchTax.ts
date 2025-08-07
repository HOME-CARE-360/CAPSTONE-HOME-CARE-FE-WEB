import apiService from '../core';

export interface BusinessInfoResponse {
  code: string;
  desc: string;
  data?: BusinessInfo;
}

export interface BusinessInfo {
  id: string;
  name: string;
  internationalName: string;
  shortName: string;
  address: string;
}

export const fetchTax = async (taxCode: string) => {
  const response = await apiService.get<BusinessInfoResponse>(
    `https://api.vietqr.io/v2/business/${taxCode}`
  );
  return response.data;
};
