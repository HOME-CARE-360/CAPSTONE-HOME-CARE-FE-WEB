'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Loader2 } from 'lucide-react';
import { categoryCreateSchema, type CategoryCreateType } from '@/schemaValidations/category.schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: CategoryCreateType) => void;
  initialData?: Category;
  mode?: 'create' | 'edit';
}

export default function CategorySheet({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: CategorySheetProps) {
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  const categories = categoriesData?.categories || [];

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryCreateType>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          logo: initialData.logo || '',
          parentCategoryId: initialData.parentCategory?.id,
        }
      : {
          name: '',
          logo: '',
          parentCategoryId: undefined,
        },
  });

  const watchLogo = watch('logo');
  const watchName = watch('name');

  React.useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        logo: initialData.logo || '',
        parentCategoryId: initialData.parentCategory?.id,
      });
    } else {
      reset({
        name: '',
        logo: '',
        parentCategoryId: undefined,
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: CategoryCreateType) => {
    // Only submit the logo if it's a valid URL
    const formData = {
      ...data,
      logo: data.logo && data.logo.startsWith('http') ? data.logo : '',
    };
    onSubmit(formData);
    reset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}</SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Nhập thông tin để tạo danh mục mới.'
              : 'Chỉnh sửa thông tin danh mục.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 py-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên danh mục <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="name" placeholder="Nhập tên danh mục" />
                )}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  {watchLogo && watchLogo.startsWith('http') && (
                    <AvatarImage src={watchLogo} alt={watchName} />
                  )}
                  <AvatarFallback className="bg-primary/10">
                    {watchName?.substring(0, 2).toUpperCase() || 'NA'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Controller
                    name="logo"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} id="logo" placeholder="https://example.com/logo.png" />
                    )}
                  />
                  {errors.logo && <p className="text-sm text-destructive">{errors.logo.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentCategoryId">Danh mục cha</Label>
            <Controller
              name="parentCategoryId"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={isLoadingCategories}
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
              <p className="text-sm text-destructive">{errors.parentCategoryId.message}</p>
            )}
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Đang tạo...' : 'Đang cập nhật...'}
                </>
              ) : (
                <>{mode === 'create' ? 'Tạo danh mục' : 'Cập nhật'}</>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
