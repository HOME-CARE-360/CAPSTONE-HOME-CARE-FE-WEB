import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ServiceManagerResponse,
  ServiceManagerRequest,
  serviceManagerService,
  ServiceManagerCreateResponse,
  ServiceManagerSearchParams,
  ServiceManagerUpdateRequest,
  ServiceManagerDetailResponse,
} from '@/lib/api/services/fetchServiceManager';
import { toast } from 'sonner';

export function useServiceManager(params: ServiceManagerSearchParams) {
  return useQuery({
    queryKey: ['service-manager', 'list', params],
    queryFn: () => serviceManagerService.getListServices(params),
    select: (response: ServiceManagerResponse) => ({
      services: response.data || [],
      totalItems: response.totalItems || 0,
      limit: response.limit || 10,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    }),
  });
}

export function useServiceManagerDetail(id: number | null) {
  return useQuery<ServiceManagerDetailResponse | null>({
    queryKey: ['service-manager', 'detail', id],
    queryFn: () => (id ? serviceManagerService.getService(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (service: ServiceManagerUpdateRequest) =>
      serviceManagerService.updateService(service),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['service-manager', 'list'] });
      toast.success(data.message as string);
    },
    onError: (error: ServiceManagerCreateResponse) => {
      if (Array.isArray(error.message)) {
        error.message.forEach(err => {
          toast.error(err.message as string);
        });
      } else {
        toast.error(error.message as string);
      }
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (service: ServiceManagerRequest) => serviceManagerService.createService(service),
    onSuccess: (data: ServiceManagerCreateResponse) => {
      queryClient.invalidateQueries({ queryKey: ['service-manager', 'list'] });
      toast.success(data.message as string);
    },
    onError: (error: ServiceManagerCreateResponse) => {
      if (Array.isArray(error.message)) {
        error.message.forEach(err => {
          toast.error(err.message as string);
        });
      } else {
        toast.error(error.message as string);
      }
    },
  });
}
