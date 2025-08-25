import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category, CategorySearchParams } from '@/lib/api/services/fetchCategory';
import { toast } from 'sonner';
import { CategoryCreateType, CategoryUpdateType } from '@/schemaValidations/category.schema';

export function useCategories(filters?: CategorySearchParams) {
  return useQuery({
    queryKey: ['categories', 'list', filters ? JSON.stringify(filters) : 'all'],
    queryFn: () => categoryService.getCategories(filters),
    select: (categories: Category[]) => ({
      categories: categories || [],
    }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDeleteCategoryById() {
  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategoryById(id),
    onSuccess: () => {
      toast.success('Xóa danh mục thành công');
    },
    onError: () => {
      toast.error('Xóa danh mục thất bại');
    },
  });
}

export function useUpdateCategoryById() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryUpdateType }) =>
      categoryService.updateCategoryById(id, data),
    onSuccess: () => {
      toast.success('Cập nhật danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => {
      toast.error('Cập nhật danh mục thất bại');
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreateType) => categoryService.createCategory(data),
    onSuccess: () => {
      toast.success('Tạo danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => {
      toast.error('Tạo danh mục thất bại');
    },
  });
}
