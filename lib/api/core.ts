import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

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
  [key: string]: string | number | boolean | undefined | null | string[] | number[];
}

// Extend AxiosRequestConfig to include skipAuth
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
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
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
    config: ExtendedAxiosRequestConfig;
  }> = [];

  constructor(baseURL: string, timeout = 10000) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout,
    });

    this.setupInterceptors();
  }

  // Set auth token
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Process failed queue
  private processQueue(error: Error | null, token: string | null = null): void {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  // Setup request/response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth header if token exists and skipAuth is not true
        if (this.authToken && !(config as ExtendedAxiosRequestConfig).skipAuth) {
          config.headers.set('Authorization', `Bearer ${this.authToken}`);
        }

        // Handle FormData automatically
        if (config.data instanceof FormData) {
          config.headers.delete('Content-Type');
        }

        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config;

        // Handle authentication errors
        if (error.response?.status === 401) {
          if (this.onAuthError && !this.isRefreshing) {
            this.isRefreshing = true;

            try {
              await this.onAuthError();

              // Retry all queued requests
              this.processQueue(null, this.authToken);

              // Retry the original request
              if (originalRequest) {
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              this.processQueue(refreshError as Error);
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          } else if (this.isRefreshing) {
            // Queue failed requests while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve,
                reject,
                config: originalRequest!,
              });
            });
          }
        }

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
  private async request<T>(config: ExtendedAxiosRequestConfig): Promise<ApiResponse<T>> {
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

  // PATCH request
  async patch<T, D extends object = Record<string, unknown>>(
    url: string,
    data?: D
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
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

  // Upload directly to S3 with presigned URL
  async uploadToS3<T>(
    presignedUrl: string,
    file: File,
    onProgress?: (percentage: number) => void
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url: presignedUrl,
      data: file,
      headers: {
        'Content-Type': file.type,
      },
      // Disable the default authorization header for S3
      skipAuth: true,
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

// Create API service instance without onAuthError initially
const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL_BACKEND || '', 10000);

// Export a function to set the onAuthError callback later
export const setAuthErrorHandler = (handler: () => Promise<boolean>) => {
  apiService['onAuthError'] = handler;
};

export default apiService;
