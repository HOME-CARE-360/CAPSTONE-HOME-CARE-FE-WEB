import { useMutation } from '@tanstack/react-query';
import {
  CreateProposalTransactionRequest,
  CreateProposalTransactionResponse,
  CheckPaymentStatusParams,
  CheckPaymentStatusResponse,
  paymentService,
  WalletTopUpRequest,
  WalletTopUpResponse,
} from '@/lib/api/services/fetchPayment';
import { toast } from 'sonner';

export const useCreateProposalTransaction = () => {
  return useMutation<CreateProposalTransactionResponse, Error, CreateProposalTransactionRequest>({
    mutationFn: data => paymentService.createProposalTransaction(data),
    onError: (error: unknown) => {
      // Type guard to check if error has response property
      const isAxiosError = (
        err: unknown
      ): err is { response: { data: { message: string | string[] } } } => {
        return typeof err === 'object' && err !== null && 'response' in err;
      };

      if (isAxiosError(error) && error.response?.data?.message) {
        const messages = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
        toast.error(`Error: ${messages}`);
      } else {
        // Type guard to check if error has message property
        const hasMessage = (err: unknown): err is { message: string } => {
          return typeof err === 'object' && err !== null && 'message' in err;
        };

        const errorMessage = hasMessage(error) ? error.message : 'An unknown error occurred.';
        toast.error(`Error: ${errorMessage}`);
      }
    },
  });
};

export const useWalletTopUp = () => {
  return useMutation<WalletTopUpResponse, Error, WalletTopUpRequest>({
    mutationFn: data => paymentService.walletTopUp(data),
  });
};

export const useCheckPaymentSuccess = () => {
  return useMutation<CheckPaymentStatusResponse, Error, CheckPaymentStatusParams>({
    mutationFn: data => paymentService.checkPaymentSuccess(data),
  });
};

export const useCheckPaymentFail = () => {
  return useMutation<CheckPaymentStatusResponse, Error, CheckPaymentStatusParams>({
    mutationFn: data => paymentService.checkPaymentFail(data),
  });
};
