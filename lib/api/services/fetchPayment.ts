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
};
