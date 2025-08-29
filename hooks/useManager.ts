import {
  ChangeStatusProviderRequest,
  CompanySearchParams,
  managerSerivce,
  ServiceSearchParams,
  ChangeStatusServiceRequest,
  ReportSearchParams,
  ReportListResponse,
  ReportDetail,
  WithdrawListResponse,
  WithdrawSearchParams,
  WithdrawItem,
  UpdateWithdrawRequest,
  UpdateWithdrawResponse,
  UpdateReportRequest,
  UpdateReportResponse,
} from '@/lib/api/services/fetchManager';
import { useAuthStore } from '@/lib/store/authStore';
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

export const useGetListService = (filters?: Partial<ServiceSearchParams>) => {
  return useQuery({
    queryKey: ['getListService', filters],
    queryFn: () => managerSerivce.getListService(filters as ServiceSearchParams | undefined),
  });
};

export const useChangeService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['changeService'],
    mutationFn: (payload: ChangeStatusServiceRequest) =>
      managerSerivce.changeStatusService(payload),
    onSuccess: res => {
      toast.success(res.message || 'Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['getListService'] });
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

export const useGetListReport = (filters?: Partial<ReportSearchParams>) => {
  return useQuery<ReportListResponse>({
    queryKey: ['getListReport', filters],
    queryFn: () => managerSerivce.getListReport(filters as ReportSearchParams | undefined),
  });
};

export const useGetReportDetail = (id?: number) => {
  return useQuery<ReportDetail | undefined>({
    queryKey: ['getReportDetail', id],
    queryFn: async () => {
      if (!id) return undefined;
      return managerSerivce.getReportDetail(id);
    },
    enabled: !!id,
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  return useMutation<UpdateReportResponse, unknown, UpdateReportRequest>({
    mutationKey: ['updateReport'],
    mutationFn: payload => managerSerivce.updateReport(payload),
    onSuccess: res => {
      toast.success(res?.message || 'Cập nhật báo cáo thành công');
      queryClient.invalidateQueries({ queryKey: ['getListReport'] });
      queryClient.invalidateQueries({ queryKey: ['getReportDetail'] });
    },
    onError: (error: unknown) => {
      // Prefer structured API error message
      let message = 'Có lỗi xảy ra khi cập nhật báo cáo';
      if (typeof error === 'object' && error !== null) {
        const err = error as { message?: string; statusCode?: number } & Record<string, unknown>;
        if (err.message) message = err.message;
      }
      // Log to console for debugging specific validation errors (422 etc.)
      // eslint-disable-next-line no-console
      console.error('Update report error:', error);
      toast.error(message);
    },
  });
};

export const useGetListWithdraw = (filters?: Partial<WithdrawSearchParams>) => {
  return useQuery<WithdrawListResponse>({
    queryKey: ['getListWithdraw', filters],
    queryFn: () => managerSerivce.getListWithdraw(filters as WithdrawSearchParams | undefined),
  });
};

export const useGetWithdrawDetail = (id?: number) => {
  return useQuery<WithdrawItem | undefined>({
    queryKey: ['getWithdrawDetail', id],
    queryFn: async () => {
      if (!id) return undefined;
      return managerSerivce.getWithdrawDetail(id);
    },
    enabled: !!id,
  });
};

export const useUpdateWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation<UpdateWithdrawResponse, unknown, UpdateWithdrawRequest>({
    mutationKey: ['updateWithdraw'],
    mutationFn: payload => managerSerivce.updateWithdraw(payload),
    onSuccess: res => {
      toast.success(res?.message || 'Cập nhật trạng thái rút tiền thành công');
      queryClient.invalidateQueries({ queryKey: ['getListWithdraw'] });
      queryClient.invalidateQueries({ queryKey: ['getWithdrawDetail'] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : 'Có lỗi xảy ra khi cập nhật rút tiền';
      toast.error(message);
    },
  });
};

export function useGetManagerProfile() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery({
    queryKey: ['manager', 'profile'],
    queryFn: () => managerSerivce.getManagerProfile(),
    enabled: isAuthenticated,
    // select: (data: GetProfileResponse) => ({
    //   profile: data.data,
    //   message: data.message,
    // }),
  });
}
