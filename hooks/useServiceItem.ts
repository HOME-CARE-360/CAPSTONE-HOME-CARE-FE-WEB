import { useQuery } from '@tanstack/react-query';
import { fetchServiceItems, ServiceItemSearchParams } from '@/lib/api/services/fetchServiceItem';

export const useServiceItems = (params: ServiceItemSearchParams) => {
  return useQuery({
    queryKey: ['serviceItems', params],
    queryFn: () => fetchServiceItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
