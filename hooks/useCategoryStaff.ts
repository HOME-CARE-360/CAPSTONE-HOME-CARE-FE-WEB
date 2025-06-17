import { CategoryStaff, categoryStaffService } from '@/lib/api/services/fetchCategory';
import { useQuery } from '@tanstack/react-query';

export function useGetAllCategoryStaff() {
  return useQuery<CategoryStaff[]>({
    queryKey: ['categoryStaff'],
    queryFn: async () => {
      const response = await categoryStaffService.getAllCategoryStaff();
      return response;
    },
  });
}
