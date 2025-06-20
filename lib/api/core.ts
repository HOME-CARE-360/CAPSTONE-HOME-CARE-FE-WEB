import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API error field structure
export interface ApiErrorField {
  message: string;
  path: string;
}

// API error response structure
export interface ApiErrorResponse {
  message: string | ApiErrorField[];
  error?: string;
  statusCode?: number;
}

// Response wrapper
export interface ApiResponse<T> {
  data: T;
  status?: number;
  headers: Record<string, string>;
  message?: string;
}

// Request parameters object
export interface RequestParams {
  [key: string]: string | number | boolean | undefined | null | string[];
}

// Shared error handling utility
export function getErrorMessage(error: ApiErrorResponse): string {
  if (typeof error.message === 'string') {
    return error.message;
  }

  if (Array.isArray(error.message) && error.message.length > 0) {
    return error.message[0].message;
  }

  return error.error || 'An unexpected error occurred';
}

// API service class
export class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private onAuthError?: () => void;

  constructor(baseURL: string, timeout = 10000, onAuthError?: () => void) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout,
    });

    this.onAuthError = onAuthError;
    this.setupInterceptors();
  }

  // Set auth token
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Setup request/response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        // Add auth header if token exists
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Handle FormData automatically
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }

        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError<ApiErrorResponse>) => {
        // Log the raw error for debugging
        console.error('API Error intercepted:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        });

        // Handle authentication errors
        if (error.response?.status === 401 && this.onAuthError) {
          this.onAuthError();
        }

        // Pass through the API error directly without transforming it
        // This preserves the original error structure from the API
        return Promise.reject(
          error.response?.data || {
            message: error.message,
            statusCode: error.response?.status,
          }
        );
      }
    );
  }

  // Process parameters for GET requests
  private createParams(params?: RequestParams): URLSearchParams | undefined {
    if (!params) return undefined;

    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach(item => urlParams.append(key, String(item)));
      } else {
        urlParams.append(key, String(value));
      }
    });

    return urlParams;
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T & { message?: string }> = await this.client(config);

    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>,
      message: response.data.message,
    };
  }

  // GET request
  async get<T>(url: string, params?: RequestParams): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params: this.createParams(params),
    });
  }

  // POST request
  async post<T, D extends object = Record<string, unknown>>(
    url: string,
    data?: D
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
    });
  }

  // PUT request
  async put<T, D extends object = Record<string, unknown>>(
    url: string,
    data?: D
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
    });
  }

  // DELETE request
  async delete<T>(url: string, params?: RequestParams): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      params: this.createParams(params),
    });
  }

  // Upload file(s)
  async upload<T>(
    url: string,
    files: File | File[],
    fieldName = 'file',
    additionalData?: Record<string, string | number | boolean>,
    onProgress?: (percentage: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    // Add file(s)
    if (Array.isArray(files)) {
      files.forEach(file => formData.append(fieldName, file));
    } else {
      formData.append(fieldName, files);
    }

    // Add additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      onUploadProgress: onProgress
        ? progressEvent => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            onProgress(percentage);
          }
        : undefined,
    });
  }

  // Extract field errors from API error response
  getFieldErrors(error: ApiErrorResponse): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    if (Array.isArray(error.message)) {
      error.message.forEach(item => {
        if (item.path && item.message) {
          fieldErrors[item.path] = item.message;
        }
      });
    }

    return fieldErrors;
  }
}

// Create and export the default API service instance
const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL_BACKEND || '', 600000);

export default apiService;
