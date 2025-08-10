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
import { useUploadImage } from '@/hooks/useImage';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import React from 'react';
import { Category } from '@/lib/api/services/fetchCategory';
import { Loader2, Upload, X, FolderOpen, Tag } from 'lucide-react';
import { categoryCreateSchema, type CategoryCreateType } from '@/schemaValidations/category.schema';
import Image from 'next/image';

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
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();

  const categories = categoriesData?.categories || [];

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file, {
        onSuccess: data => {
          setValue('logo', data.url);
        },
      });
    }
  };

  const handleRemoveImage = () => {
    setValue('logo', '');
  };

  const onSubmitForm = (data: CategoryCreateType) => {
    onSubmit(data);
    reset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl">
                {mode === 'create' ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {mode === 'create'
                  ? 'Nhập thông tin để tạo danh mục mới.'
                  : 'Chỉnh sửa thông tin danh mục.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8 py-8">
            {/* Category Name */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">1</span>
                </div>
                <div>
                  <Label className="text-base font-medium">Tên danh mục</Label>
                  <p className="text-sm text-muted-foreground">Nhập tên cho danh mục này</p>
                </div>
              </div>
              <div className="ml-11 space-y-2">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="VD: Điện tử, Thời trang..."
                      className="h-12 text-base border-0 bg-muted/30 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    />
                  )}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">2</span>
                </div>
                <div>
                  <Label className="text-base font-medium">Logo danh mục</Label>
                  <p className="text-sm text-muted-foreground">
                    Tải lên hình ảnh đại diện (tùy chọn)
                  </p>
                </div>
              </div>

              <div className="ml-11">
                {watchLogo && watchLogo.startsWith('http') ? (
                  <div className="relative inline-block">
                    <div className="relative group">
                      <Image
                        src={watchLogo}
                        alt={watchName || 'Logo'}
                        className="w-20 h-20 rounded-2xl object-cover border border-border/50"
                        width={80}
                        height={80}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Click để thay đổi
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 hover:border-border transition-colors">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="logo-upload"
                        disabled={isUploading}
                      />
                      <Label
                        htmlFor="logo-upload"
                        className="flex flex-col items-center gap-4 cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                          {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6" />
                          )}
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-medium">
                            {isUploading ? 'Đang tải lên...' : 'Tải lên hình ảnh'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            PNG, JPG hoặc GIF (tối đa 5MB)
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                )}
                {errors.logo && (
                  <p className="text-sm text-destructive mt-2">{errors.logo.message}</p>
                )}
              </div>
            </div>

            {/* Parent Category */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">3</span>
                </div>
                <div>
                  <Label className="text-base font-medium">Danh mục cha</Label>
                  <p className="text-sm text-muted-foreground">
                    Chọn danh mục cha để tạo cấu trúc phân cấp
                  </p>
                </div>
              </div>
              <div className="ml-11 space-y-2">
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
                      <SelectTrigger className="h-12 text-base border-0 bg-muted/30 focus:bg-background focus:ring-2 focus:ring-ring transition-all">
                        <SelectValue placeholder="Chọn danh mục cha..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-muted"></div>
                            Không có danh mục cha
                          </div>
                        </SelectItem>
                        {categories
                          .filter(category => category.id !== initialData?.id)
                          .map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              <div className="flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                                {category.name}
                              </div>
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
            </div>
          </form>
        </div>

        {/* Footer */}
        <SheetFooter className="pt-6 border-t border-border/50">
          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12">
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              onClick={handleSubmit(onSubmitForm)}
              className="flex-1 h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Đang tạo...' : 'Đang lưu...'}
                </>
              ) : (
                <>{mode === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi'}</>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
