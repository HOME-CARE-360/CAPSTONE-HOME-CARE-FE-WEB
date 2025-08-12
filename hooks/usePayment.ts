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

export const useCreateProposalTransaction = () => {
  return useMutation<CreateProposalTransactionResponse, Error, CreateProposalTransactionRequest>({
    mutationFn: data => paymentService.createProposalTransaction(data),
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
