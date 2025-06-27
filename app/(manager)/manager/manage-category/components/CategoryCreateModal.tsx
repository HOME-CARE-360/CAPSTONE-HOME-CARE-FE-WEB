'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCategories } from '@/hooks/useCategory';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import React from 'react';
import { Category } from '@/lib/api/services/fetchCategory';

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  logo: z.string().optional(),
  parentCategoryId: z.number().optional(),
  description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: CategoryFormData) => void;
  initialData?: Category;
  mode?: 'create' | 'edit';
}

export default function CategoryCreateModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: CategoryCreateModalProps) {
  const {
    data: categoriesData,
    // isLoading: isLoadingCategories,
    // error: errorCategories,
  } = useCategories();

  const categories = categoriesData?.categories || [];

  console.log('categories:: ', categories);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          logo: initialData.logo || '',
          parentCategoryId: initialData.parentCategory?.id,
          description: '',
        }
      : {
          name: '',
          logo: '',
          parentCategoryId: undefined,
          description: '',
        },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        logo: initialData.logo || '',
        parentCategoryId: initialData.parentCategory?.id,
        description: '',
      });
    } else {
      reset({
        name: '',
        logo: '',
        parentCategoryId: undefined,
        description: '',
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: CategoryFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Nhập thông tin để tạo danh mục mới.'
              : 'Chỉnh sửa thông tin danh mục.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Tên danh mục *</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="name" placeholder="Nhập tên danh mục" />
                )}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Controller
                name="logo"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="logo" placeholder="https://example.com/logo.png" />
                )}
              />
              {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="parentCategoryId">Danh mục cha</Label>
            <Controller
              name="parentCategoryId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={value =>
                    field.onChange(value === 'none' ? undefined : parseInt(value))
                  }
                  value={field.value?.toString() || 'none'}
                >
                  <SelectTrigger id="parentCategoryId">
                    <SelectValue placeholder="Chọn danh mục cha (tùy chọn)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có danh mục cha</SelectItem>
                    {categories
                      .filter(category => category.id !== initialData?.id) // Không cho phép chọn chính nó làm parent
                      .map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.parentCategoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.parentCategoryId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Mô tả chi tiết về danh mục (tùy chọn)"
                  rows={3}
                />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">{mode === 'create' ? 'Tạo danh mục' : 'Cập nhật'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
