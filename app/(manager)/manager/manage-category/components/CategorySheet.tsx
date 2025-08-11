'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Category } from '@/lib/api/services/fetchCategory';
import { useCategories, useCreateCategory, useUpdateCategoryById } from '@/hooks/useCategory';
import { Plus, Edit, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUploadImage } from '@/hooks/useImage';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  logo: z.string().optional(),
  parentCategoryId: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CategorySheetProps {
  category?: Category | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CategorySheet({ category, trigger, open, onOpenChange }: CategorySheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!category;

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategoryById();

  const { mutateAsync: uploadImageAsync, isPending: isUploading } = useUploadImage();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: '',
      parentCategoryId: undefined,
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setIsOpen(next);

    if (!next) {
      form.reset();
    }
  };

  const isSheetOpen = open !== undefined ? open : isOpen;

  useEffect(() => {
    if (!isSheetOpen) return;
    if (isEditing && category) {
      form.reset({
        name: category.name,
        logo: category.logo ?? '',
        parentCategoryId: category.parentCategory?.id,
      });
    } else {
      form.reset({ name: '', logo: '', parentCategoryId: undefined });
    }
  }, [category, form, isEditing, isSheetOpen]);

  const onSubmit = (data: FormData) => {
    if (isEditing && category) {
      updateCategory(
        { id: category.id, data },
        {
          onSuccess: () => {
            toast.success('Cập nhật danh mục thành công');
            handleOpenChange(false);
          },
          onError: () => toast.error('Cập nhật danh mục thất bại'),
        }
      );
    } else {
      createCategory(data, {
        onSuccess: () => {
          toast.success('Tạo danh mục thành công');
          handleOpenChange(false);
        },
        onError: () => toast.error('Tạo danh mục thất bại'),
      });
    }
  };

  const isSubmitting = isCreating || isUpdating;

  const handleImageUpload = async (file: File) => {
    try {
      const response = await uploadImageAsync(file);
      // ImageResponse is expected to contain a direct url field
      const uploadedUrl = (response as { url?: string }).url;
      if (!uploadedUrl) throw new Error('Invalid upload response');
      form.setValue('logo', uploadedUrl);
      toast.success('Tải ảnh lên thành công');
    } catch (error) {
      toast.error('Tải ảnh lên thất bại');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeLogo = () => {
    form.setValue('logo', '');
  };

  const currentLogo = form.watch('logo');

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5" /> Chỉnh sửa danh mục
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" /> Thêm danh mục mới
              </>
            )}
          </SheetTitle>
          <SheetDescription>
            {isEditing ? 'Cập nhật thông tin danh mục' : 'Tạo danh mục mới'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                placeholder="Nhập tên danh mục"
                {...form.register('name')}
                disabled={isSubmitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="space-y-3">
                {currentLogo ? (
                  <div className="relative">
                    <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      <Image src={currentLogo} alt="Category logo" fill className="object-cover" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeLogo}
                      disabled={isSubmitting || isUploading}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Tải ảnh logo lên</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting || isUploading}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        'Chọn ảnh'
                      )}
                    </Button>
                  </div>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting || isUploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Danh mục chính</Label>
              <Select
                value={(form.watch('parentCategoryId') ?? 'none').toString()}
                onValueChange={value =>
                  form.setValue('parentCategoryId', value === 'none' ? undefined : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục cha (tuỳ chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  {categories
                    .filter(c => !category || c.id !== category.id)
                    .map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="sm:mr-2"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                </>
              ) : isEditing ? (
                <>
                  <Edit className="h-5 w-5 mr-2" /> Cập nhật
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" /> Tạo mới
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
