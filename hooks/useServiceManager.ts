import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ServiceManagerRequest,
  serviceManagerService,
  ServiceManagerCreateResponse,
  ServiceManagerSearchParams,
  ServiceManagerUpdateRequest,
  ServiceManagerDetailResponse,
  ServiceItemRequest,
  ServiceItemCreateResponse,
  ServiceItemSearchParams,
  ServiceItemUpdateRequest,
  ServiceItemDetailResponse,
  ServiceItemResponse,
} from '@/lib/api/services/fetchServiceManager';
import { toast } from 'sonner';

// Service Management Hooks
export function useServiceManager(params: ServiceManagerSearchParams) {
  return useQuery({
    queryKey: ['service-manager', 'list', params],
    queryFn: () => serviceManagerService.getListServices(params),
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

// Service Item Management Hooks
export function useServiceItems(params: ServiceItemSearchParams) {
  return useQuery<ServiceItemResponse>({
    queryKey: ['service-items', 'list', params],
    queryFn: () => serviceManagerService.getListServiceItems(params),
  });
}

export function useServiceItemDetail(id: number | null) {
  return useQuery<ServiceItemDetailResponse | null>({
    queryKey: ['service-items', 'detail', id],
    queryFn: () => (id ? serviceManagerService.getServiceItem(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateServiceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceItem: ServiceItemRequest) =>
      serviceManagerService.createServiceItem(serviceItem),
    onSuccess: (data: ServiceItemCreateResponse) => {
      queryClient.invalidateQueries({ queryKey: ['service-items', 'list'] });
      toast.success(data.message as string);
    },
    onError: (error: ServiceItemCreateResponse) => {
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

export function useUpdateServiceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceItem: ServiceItemUpdateRequest) =>
      serviceManagerService.updateServiceItem(serviceItem),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['service-items', 'list'] });
      toast.success(data.message as string);
    },
    onError: (error: ServiceItemCreateResponse) => {
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

export function useDeleteServiceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceManagerService.deleteServiceItem(id),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['service-items', 'list'] });
      toast.success(data.message as string);
    },
    onError: (error: ServiceItemCreateResponse) => {
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
