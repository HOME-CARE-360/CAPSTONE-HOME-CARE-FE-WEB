import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import serviceService, {
  ServiceResponse,
  ServiceSearchParams,
  Service,
  ActionServiceResponse,
  ServiceDetailRequest,
  ServiceDetailResponse,
} from '@/lib/api/services/fetchService';

/**
 * Hook to fetch services with filters
 */
export function useServices(filters?: ServiceSearchParams) {
  // const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { isLoading, isError, data, error, refetch, isFetching } = useQuery({
    queryKey: ['services', 'list', filters ? JSON.stringify(filters) : 'all'],
    queryFn: () => serviceService.getServices(filters),
    // enabled: isAuthenticated,
    select: (data: ServiceResponse) => ({
      services: data.data?.services || [],
      count: data.data?.count || 0,
      limit: data.data?.limit || 10,
      page: data.data?.page || 1,
      totalPages: data.data?.totalPages || 1,
      status: data.status,
      message: data.message,
    }),
  });

  return {
    isLoading,
    isError,
    data,
    error,
    refetch,
    isFetching,
    services: data?.services || [],
    count: data?.count || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 1,
    status: data?.status,
    message: data?.message,
  };
}

/**
 * Hook to fetch a single service by ID
 */
export function useService(id?: string) {
  return useQuery({
    queryKey: ['services', 'detail', id],
    queryFn: () => serviceService.getService(id!),
    // enabled: !!id && isAuthenticated,
    select: (data: ServiceDetailResponse) => ({
      service: data.data,
      status: data.status,
      message: data.message,
      data: data.data,
    }),
  });
}

// export const usePropertyBySlug = (slug: string) => {
//   return useQuery({
//     queryKey: ['properties', 'detail', slug],
//     queryFn: () => propertyService.getProperty(slug),
//     enabled: !!slug, // Only run if slug exists
//     select: (data: PropertyResponse) => ({
//       property: data.data,
//       status: data.status,
//       message: data.message,
//       data: data.data,
//     }),
//   });
// };
/**
 * Hook to create a new property
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newService: Partial<ServiceDetailRequest>) =>
      serviceService.createService(newService),
    onSuccess: (data: ActionServiceResponse) => {
      if (data.status) {
        queryClient.invalidateQueries({ queryKey: ['services', 'list'] });
      }
    },
  });
}

/**
 * Hook to update an existing property
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updateData }: Partial<Service> & { id: string }) =>
      serviceService.updateService(id, updateData),
    onSuccess: (data: ActionServiceResponse) => {
      if (data.status && data.data && data.data.length > 0) {
        queryClient.invalidateQueries({
          queryKey: ['properties', 'detail', 'updated', data.data],
        });
        queryClient.invalidateQueries({ queryKey: ['properties', 'list'] });
      }
    },
  });
}

/**
 * Hook to delete a property
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceService.deleteService(id),
    onSuccess: (data: ActionServiceResponse, id: string) => {
      if (data.status) {
        queryClient.removeQueries({ queryKey: ['services', 'detail', 'deleted', id] });
        queryClient.invalidateQueries({ queryKey: ['services', 'list'] });
      }
    },
  });
}
