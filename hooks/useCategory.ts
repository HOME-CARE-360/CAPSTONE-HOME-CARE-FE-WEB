import { useQuery } from '@tanstack/react-query';
import { categoryService, Category, CategorySearchParams } from '@/lib/api/services/fetchCategory';

export function useCategories(filters?: CategorySearchParams) {
  return useQuery({
    queryKey: ['categories', 'list', filters ? JSON.stringify(filters) : 'all'],
    queryFn: () => categoryService.getCategories(filters),
    select: (categories: Category[]) => ({
      categories: categories || [],
    }),
  });
}
