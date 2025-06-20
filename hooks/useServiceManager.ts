import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ServiceManagerResponse,
  ServiceManagerRequest,
  serviceManagerService,
  ServiceManagerCreateResponse,
} from '@/lib/api/services/fetchServiceManager';
import { toast } from 'sonner';

export function useServiceManager() {
  return useQuery({
    queryKey: ['service-manager', 'list'],
    queryFn: () => serviceManagerService.getListServices(),
    select: (response: ServiceManagerResponse) => ({
      services: response.data || [],
      totalItems: response.totalItems || 0,
      limit: response.limit || 10,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    }),
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
