import {
  // useMutation,
  useQuery,
  //  useQueryClient
} from '@tanstack/react-query';
import serviceService, {
  ServiceListResponse,
  ServiceSearchParams,
  ServiceDetailResponse,
  // Service,
} from '@/lib/api/services/fetchService';

/**
 * Hook to fetch services with filters
 */
export function useServices(filters?: ServiceSearchParams) {
  return useQuery({
    queryKey: ['services', 'list', filters ? JSON.stringify(filters) : 'all'],
    queryFn: () => serviceService.getServices(filters),
    select: (response: ServiceListResponse) => ({
      services: response.data || [],
      totalItems: response.totalItems || 0,
      limit: response.limit || 10,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single service by ID
 */
export function useService(id?: string | number) {
  return useQuery({
    queryKey: ['services', 'detail', id],
    queryFn: () => serviceService.getService(id!),
    enabled: !!id,
    select: (response: ServiceDetailResponse) => ({
      service: response.data,
    }),
  });
}

/**
 * Hook to fetch services by provider ID
 */
export function useProviderServices(providerId?: number, page = 1, limit = 12) {
  return useServices(
    providerId
      ? {
          providerIds: [providerId],
          page,
          limit,
        }
      : undefined
  );
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
// export function useCreateService() {
//  const queryClient = useQueryClient();

//  return useMutation({
//    mutationFn: (newService: Partial<ServiceDetailRequest>) =>
//      serviceApi.createService(newService),
//    onSuccess: (data: ActionServiceResponse) => {
//      if (data.status) {
//        queryClient.invalidateQueries({ queryKey: ['services', 'list'] });
//      }
//    },
//  });
// }

/**
 * Hook to update an existing property
 */
// export function useUpdateProperty() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, ...updateData }: Partial<Service> & { id: string }) =>
//       serviceApi.updateService(id, updateData),
//     onSuccess: (data: ActionServiceResponse) => {
//       if (data.status && data.data && data.data.length > 0) {
//         queryClient.invalidateQueries({
//           queryKey: ['properties', 'detail', 'updated', data.data],
//         });
//         queryClient.invalidateQueries({ queryKey: ['properties', 'list'] });
//       }
//     },
//   });
// }

/**
 * Hook to delete a property
 */
// export function useDeleteProperty() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: string) => serviceApi.deleteService(id),
//     onSuccess: (data: ActionServiceResponse, id: string) => {
//       if (data.status) {
//         queryClient.removeQueries({ queryKey: ['services', 'detail', 'deleted', id] });
//         queryClient.invalidateQueries({ queryKey: ['services', 'list'] });
//       }
//     },
//   });
// }
