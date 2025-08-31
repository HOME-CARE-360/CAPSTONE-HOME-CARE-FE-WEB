import apiService from '../core';

export interface CreateProposalTransactionRequest {
  bookingId: number;
  method: 'BANK_TRANSFER' | 'WALLET';
}

export interface CreateProposalTransactionResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    message: string;
    transactionId: number;
    bookingId: number;
    amount: number;
    method: 'BANK_TRANSFER' | 'WALLET' | string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
    createdAt: string;
    responseData: {
      bin: string;
      accountNumber: string;
      accountName: string;
      amount: number;
      description: string;
      orderCode: number;
      currency: string;
      paymentLinkId: string;
      status: 'PENDING' | 'PAID' | 'FAILED' | string;
      checkoutUrl: string;
      qrCode: string;
    };
  };
  statusCode: number;
  timestamp: string;
}

export interface WalletTopUpResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    responseData: {
      bin: string;
      accountNumber: string;
      accountName: string;
      amount: number;
      description: string;
      orderCode: number;
      currency: string;
      paymentLinkId: string;
      status: string;
      checkoutUrl: string;
      qrCode: string;
    };
  };
  statusCode: number;
  timestamp: string;
}

export interface WalletTopUpRequest {
  amount: number;
}

export interface CheckPaymentStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    message: string;
  };
  statusCode: number;
  timestamp: string; // ISO 8601
}

export interface CheckPaymentStatusParams {
  orderCode: string;
  status: string;
}

export interface PayExistingServiceRequestRequest {
  serviceRequestId: number;
  paymentMethod: 'BANK_TRANSFER' | 'WALLET';
}

export interface PayExistingServiceRequestResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    message: string;
    paymentTransactionId: number;
    referenceNumber: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    amountOut: number;
    gateway: string;
    transactionDate: string;
    userId: number;
    serviceRequestId: number;
    responseData: {
      bin: string;
      accountNumber: string;
      accountName: string;
      amount: number;
      description: string;
      orderCode: number;
      currency: string;
      paymentLinkId: string;
      status: 'PENDING' | 'PAID' | 'FAILED';
      checkoutUrl: string;
      qrCode: string;
    };
    checkoutUrl: string;
    requiresPayment: boolean;
  };
  statusCode: number;
  timestamp: string;
}

export const paymentService = {
  createProposalTransaction: async (
    data: CreateProposalTransactionRequest
  ): Promise<CreateProposalTransactionResponse> => {
    // Ensure data is a plain object to satisfy Record<string, unknown>
    const payload: Record<string, unknown> = {
      bookingId: data.bookingId,
      method: data.method,
    };
    const response = await apiService.post<CreateProposalTransactionResponse>(
      '/payments/create-proposal-transaction',
      payload
    );
    return response.data;
  },

  walletTopUp: async (data: WalletTopUpRequest): Promise<WalletTopUpResponse> => {
    const payload: Record<string, unknown> = {
      amount: data.amount,
    };
    const response = await apiService.post<WalletTopUpResponse>('/payments/create-topup', payload);
    return response.data;
  },

  checkPaymentSuccess: async (
    data: CheckPaymentStatusParams
  ): Promise<CheckPaymentStatusResponse> => {
    const payload: Record<string, unknown> = {
      orderCode: data.orderCode,
      status: data.status,
    };
    const response = await apiService.post<CheckPaymentStatusResponse>(
      '/payments/success',
      payload
    );
    return response.data;
  },

  checkPaymentFail: async (data: CheckPaymentStatusParams): Promise<CheckPaymentStatusResponse> => {
    const payload: Record<string, unknown> = {
      orderCode: data.orderCode,
      status: data.status,
    };
    const response = await apiService.post<CheckPaymentStatusResponse>('/payments/failed', payload);
    return response.data;
  },

  payExistingServiceRequest: async (
    data: PayExistingServiceRequestRequest
  ): Promise<PayExistingServiceRequestResponse> => {
    const payload: Record<string, unknown> = {
      serviceRequestId: data.serviceRequestId,
      paymentMethod: data.paymentMethod,
    };
    const response = await apiService.post<PayExistingServiceRequestResponse>(
      '/payments/pay-existing-service-request',
      payload
    );
    return response.data;
  },
};
