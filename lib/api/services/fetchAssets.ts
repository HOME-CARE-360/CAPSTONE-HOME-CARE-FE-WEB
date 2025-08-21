import apiService from '../core';

export interface Asset {
  id: number;
  categoryId: number;
  customerId?: number;
  brand: string;
  model: string;
  serial: string;
  nickname: string;
  description?: string;
  purchaseDate: string;
  lastMaintenanceDate?: string | null;
  totalMaintenanceCount: number;
  createdAt?: string;
  updatedAt?: string;
  Category?: {
    id: number;
    name: string;
    logo?: string | null;
    parentCategoryId?: number | null;
  };
}

export interface AssetCreateRequest {
  categoryId: number;
  brand: string;
  model: string;
  serial: string;
  nickname: string;
  purchaseDate: string;
}

export type AssetUpdateRequest = Partial<AssetCreateRequest>;

export interface AssetResponse {
  message?: string;
  data?: Asset;
}

export interface AssetsListResponse {
  success?: boolean;
  code?: string;
  message?: string;
  data?: Asset[];
  statusCode?: number;
  timestamp?: string;
}

// API returns a nested envelope where the outer `data` contains another response object
interface AssetsListOuterEnvelope {
  success?: boolean;
  message?: string;
  data?: AssetsListInnerEnvelope;
}

interface AssetsListInnerEnvelope {
  success?: boolean;
  code?: string;
  message?: string;
  data?: Asset[];
  statusCode?: number;
  timestamp?: string;
}

export const fetchAssets = {
  async list(customerId: number): Promise<AssetsListResponse> {
    const response = await apiService.get<AssetsListOuterEnvelope>(`/users/${customerId}/assets`);
    const outer = response.data;
    const possibleInner = outer?.data as unknown; // could be envelope or array

    // Case 1: Flat response with data: Asset[]
    if (Array.isArray(possibleInner)) {
      return {
        success: outer?.success,
        message: outer?.message,
        // outer flat shape does not provide code/statusCode/timestamp in our typings
        data: possibleInner,
        statusCode: undefined,
        timestamp: undefined,
      };
    }

    // Case 2: Nested response where data is an inner envelope
    const inner = (possibleInner || {}) as AssetsListInnerEnvelope;
    return {
      success: outer?.success ?? inner?.success,
      message: outer?.message ?? inner?.message,
      code: inner?.code,
      data: inner?.data ?? [],
      statusCode: inner?.statusCode,
      timestamp: inner?.timestamp,
    };
  },

  async create(customerId: number, payload: AssetCreateRequest): Promise<AssetResponse> {
    const response = await apiService.post<AssetResponse, AssetCreateRequest>(
      `/users/${customerId}/assets`,
      payload
    );
    return response.data;
  },

  async update(assetId: number, payload: AssetUpdateRequest): Promise<AssetResponse> {
    const response = await apiService.patch<AssetResponse, AssetUpdateRequest>(
      `/users/assets/${assetId}`,
      payload
    );
    return response.data;
  },

  async remove(assetId: number): Promise<{ message?: string }> {
    const response = await apiService.delete<{ message?: string }>(`/users/assets/${assetId}`);
    return response.data;
  },
};

export default fetchAssets;
