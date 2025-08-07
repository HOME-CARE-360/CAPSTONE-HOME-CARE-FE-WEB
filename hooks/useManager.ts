import { CompanySearchParams, managerSerivce } from '@/lib/api/services/fetchManager';
import { useQuery } from '@tanstack/react-query';

export const useGetListProvider = (filters?: CompanySearchParams) => {
  return useQuery({
    queryKey: ['getListProvider', filters],
    queryFn: () => managerSerivce.getListProvider(filters),
  });
};
