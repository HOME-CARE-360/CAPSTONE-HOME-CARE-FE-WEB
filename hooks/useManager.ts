import {
  ChangeStatusProviderRequest,
  CompanySearchParams,
  managerSerivce,
} from '@/lib/api/services/fetchManager';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetListProvider = (filters?: CompanySearchParams) => {
  return useQuery({
    queryKey: ['getListProvider', filters],
    queryFn: () => managerSerivce.getListProvider(filters),
  });
};

export const useChangeStatusProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['changeStatusProvider'],
    mutationFn: (payload: ChangeStatusProviderRequest) =>
      managerSerivce.changeStatusProvider(payload),
    onSuccess: res => {
      toast.success(res.message || 'Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['getListProvider'] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : 'Có lỗi xảy ra khi cập nhật trạng thái';
      toast.error(message);
    },
  });
};
