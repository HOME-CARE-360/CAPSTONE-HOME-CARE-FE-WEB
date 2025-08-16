import { useMutation, useQuery } from '@tanstack/react-query';
import { fundingService } from '@/lib/api/services/fetchFunding';
import { toast } from 'sonner';

export const useCreateWithDraw = () => {
  return useMutation({
    mutationFn: fundingService.createWithDraw,
    onSuccess: () => {
      toast.success('Yêu cầu rút tiền thành công');
    },
    onError: () => {
      toast.error('Yêu cầu rút tiền thất bại');
    },
  });
};

export const useGetListWithDraw = () => {
  return useQuery({
    queryKey: ['withdraw-list'],
    queryFn: fundingService.getListWithDraw,
  });
};

export const useGetDetailWithDraw = (id: number) => {
  return useQuery({
    queryKey: ['withdraw-detail', id],
    queryFn: () => fundingService.getDetailWithDraw(id),
  });
};
