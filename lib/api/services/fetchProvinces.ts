import apiService from '../core';

export interface Communes {
  code: string;
  name: string;
  englishName: string;
  administrativeLevel: string;
  provinceCode: string;
  provinceName: string;
  decree: string;
}

export interface ProvincesCommunesResponse {
  requestId: string;
  communes: Communes[];
}

export interface Provinces {
  code: string;
  name: string;
  englishName: string;
  administrativeLevel: string;
  decree: string;
}

export interface ProvincesResponse {
  requestId: string;
  provinces: Provinces[];
}

export const provinceService = {
  getProvince: async (effectiveDate: string) => {
    const response = await apiService.get<ProvincesResponse>(
      `https://production.cas.so/address-kit/${effectiveDate}/provinces`
    );
    return response.data;
  },

  getProvinceCommunes: async (effectiveDate: string, provinceID: string) => {
    const response = await apiService.get<ProvincesCommunesResponse>(
      `https://production.cas.so/address-kit/${effectiveDate}/provinces/${provinceID}/communes`
    );
    return response.data;
  },
};
