import { useMutation } from '@tanstack/react-query';
import {
  CreateProposalTransactionRequest,
  CreateProposalTransactionResponse,
  CheckPaymentStatusParams,
  CheckPaymentStatusResponse,
  paymentService,
  WalletTopUpRequest,
  WalletTopUpResponse,
  PayExistingServiceRequestRequest,
  PayExistingServiceRequestResponse,
} from '@/lib/api/services/fetchPayment';
import { toast } from 'sonner';

export const useCreateProposalTransaction = () => {
  return useMutation<CreateProposalTransactionResponse, Error, CreateProposalTransactionRequest>({
    mutationFn: data => paymentService.createProposalTransaction(data),
    onSuccess: () => {
      toast.success('Thanh toán thành công');
      window.location.reload();
    },
    // Remove onError handler to let the component handle errors via onError callback
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

export const usePayExistingServiceRequest = () => {
  return useMutation<PayExistingServiceRequestResponse, Error, PayExistingServiceRequestRequest>({
    mutationFn: data => paymentService.payExistingServiceRequest(data),
    onSuccess: (response, variables) => {
      if (variables.paymentMethod === 'WALLET') {
        toast.success('Thanh toán thành công');
        window.location.reload();
      } else if (response.data.checkoutUrl) {
        // For bank transfer, open checkout URL
        window.open(response.data.checkoutUrl, '_blank', 'noopener,noreferrer');
        toast.success('Đang chuyển hướng đến trang thanh toán');
      }
    },
    onError: (error: unknown) => {
      // Type guard to check if error has response property
      const isAxiosError = (
        err: unknown
      ): err is {
        response: {
          data: {
            message:
              | string
              | string[]
              | { message: string; currentBalance: number; requiredAmount: number }[];
          };
        };
      } => {
        return typeof err === 'object' && err !== null && 'response' in err;
      };

      if (isAxiosError(error) && error.response?.data?.message) {
        const messages = error.response.data.message;

        if (Array.isArray(messages)) {
          // Handle array of error objects
          const errorMessages = messages.map(msg => {
            if (typeof msg === 'object' && msg !== null && 'message' in msg) {
              return (msg as { message: string }).message;
            }
            return String(msg);
          });
          toast.error(`Error: ${errorMessages.join(', ')}`);
        } else if (typeof messages === 'string') {
          toast.error(`Error: ${messages}`);
        } else {
          toast.error('An unknown error occurred.');
        }
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
