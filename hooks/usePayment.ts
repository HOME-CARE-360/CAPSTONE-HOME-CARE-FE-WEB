import { useMutation } from '@tanstack/react-query';
import {
  CreateProposalTransactionRequest,
  CreateProposalTransactionResponse,
  paymentService,
} from '@/lib/api/services/fetchPayment';

export const useCreateProposalTransaction = () => {
  return useMutation<CreateProposalTransactionResponse, Error, CreateProposalTransactionRequest>({
    mutationFn: data => paymentService.createProposalTransaction(data),
  });
};
