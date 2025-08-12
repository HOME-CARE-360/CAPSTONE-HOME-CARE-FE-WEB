'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCreateService, useUpdateService } from '@/hooks/useServiceManager';
import { useCategories } from '@/hooks/useCategory';
import { useUploadImage } from '@/hooks/useImage';
import { ServiceManager, ServiceManagerRequest } from '@/lib/api/services/fetchServiceManager';
import { Category } from '@/lib/api/services/fetchCategory';
import { Plus, Edit, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const serviceFormSchema = z.object({
  name: z.string().min(1, 'Tên dịch vụ là bắt buộc'),
  description: z.string().min(1, 'Mô tả dịch vụ là bắt buộc'),
  basePrice: z.number().min(0, 'Giá cơ bản phải lớn hơn 0'),
  virtualPrice: z.number().min(0, 'Giá ảo phải lớn hơn 0'),
  durationMinutes: z.number().min(1, 'Thời gian phải lớn hơn 0'),
  categoryId: z.number().min(1, 'Vui lòng chọn loại dịch vụ'),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  url?: string;
}

interface SheetServiceProps {
  service?: ServiceManager | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SheetService({ service, trigger, open, onOpenChange }: SheetServiceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const isEditing = !!service;

  const { data: categoryData, isLoading: isCategoryLoading } = useCategories();
  const { mutate: createService, isPending: isCreating } = useCreateService();
  const { mutate: updateService, isPending: isUpdating } = useUpdateService();
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      virtualPrice: 0,
      durationMinutes: 30,
      categoryId: 0,
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setIsOpen(open);
    }
    if (!open) {
      form.reset();
      setUploadedImages([]);
    }
  };

  const isSheetOpen = open !== undefined ? open : isOpen;

  useEffect(() => {
    if (!isSheetOpen) return;

    if (isEditing && service) {
      form.reset({
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        virtualPrice: service.virtualPrice,
        durationMinutes: service.durationMinutes,
        categoryId: service.category?.id || 0,
      });

      // Convert existing service images to UploadedImage format
      if (service.images && service.images.length > 0) {
        const existingImages: UploadedImage[] = service.images.map((url, index) => ({
          id: `existing-${index}`,
          file: new File([], 'existing-image'),
          preview: url,
          status: 'success',
          url: url,
        }));
        setUploadedImages(existingImages);
      }
    } else if (!isEditing) {
      form.reset({
        name: '',
        description: '',
        basePrice: 0,
        virtualPrice: 0,
        durationMinutes: 30,
        categoryId: 0,
      });
      setUploadedImages([]);
    }
  }, [service, form, isEditing, isSheetOpen]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
    }));

    setUploadedImages(prev => [...prev, ...newImages]);

    // Upload each new image
    newImages.forEach(image => {
      uploadImage(image.file, {
        onSuccess: response => {
          setUploadedImages(prev =>
            prev.map(img =>
              img.id === image.id ? { ...img, status: 'success', url: response.url } : img
            )
          );
        },
        onError: () => {
          setUploadedImages(prev =>
            prev.map(img => (img.id === image.id ? { ...img, status: 'error' } : img))
          );
        },
      });
    });
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);
    try {
      // Get all successfully uploaded image URLs
      const imageUrls = uploadedImages
        .filter(img => img.status === 'success')
        .map(img => img.url || img.preview)
        .filter(Boolean);

      if (isEditing && service) {
        updateService(
          { id: service.id, ...data, images: imageUrls },
          {
            onSuccess: () => {
              toast.success('Cập nhật dịch vụ thành công');
              handleOpenChange(false);
            },
            onError: () => {
              toast.error('Cập nhật dịch vụ thất bại');
            },
          }
        );
      } else {
        const serviceData: ServiceManagerRequest = {
          ...data,
          images: imageUrls,
          serviceItemsId: [], // Empty service items array for now
        };

        createService(serviceData, {
          onSuccess: () => {
            toast.success('Tạo dịch vụ thành công');
            handleOpenChange(false);
          },
          onError: () => {
            toast.error('Tạo dịch vụ thất bại');
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitting = isCreating || isUpdating || isLoading;

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5" />
                Chỉnh sửa dịch vụ
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Thêm dịch vụ mới
              </>
            )}
          </SheetTitle>
          <SheetDescription className="mt-1">
            {isEditing ? 'Cập nhật thông tin dịch vụ' : 'Tạo dịch vụ mới cho khách hàng'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-4">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên dịch vụ *</Label>
              <Input
                id="name"
                placeholder="Nhập tên dịch vụ"
                {...form.register('name')}
                disabled={isSubmitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả dịch vụ"
                rows={3}
                {...form.register('description')}
                disabled={isSubmitting}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Loại dịch vụ *</Label>
              <Select
                value={form.watch('categoryId')?.toString() || ''}
                onValueChange={value => form.setValue('categoryId', parseInt(value))}
                disabled={isSubmitting || isCategoryLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  {categoryData?.categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-600">{form.formState.errors.categoryId.message}</p>
              )}
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Giá cơ bản (VNĐ) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  placeholder="0"
                  {...form.register('basePrice', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {form.formState.errors.basePrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.basePrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="virtualPrice">Giá ảo (VNĐ) *</Label>
                <Input
                  id="virtualPrice"
                  type="number"
                  placeholder="0"
                  {...form.register('virtualPrice', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {form.formState.errors.virtualPrice && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.virtualPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Thời gian thực hiện (phút) *</Label>
              <Input
                id="durationMinutes"
                type="number"
                placeholder="30"
                {...form.register('durationMinutes', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {form.formState.errors.durationMinutes && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.durationMinutes.message}
                </p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between w-full">
              <Label>Hình ảnh dịch vụ</Label>
              <span className="text-xs text-gray-500">{uploadedImages.length}/10</span>
            </div>
            <div className="space-y-3 w-full">
              {/* Image Upload Input */}
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden w-full"
                  disabled={isUploading || isSubmitting}
                />
                <Label
                  htmlFor="image-upload"
                  className={`w-full inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg cursor-pointer transition hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 ${
                    isUploading || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-700">
                    {isUploading ? 'Đang tải lên...' : 'Tải lên hình ảnh'}
                  </span>
                </Label>
              </div>

              {/* Image Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {uploadedImages.map(image => (
                    <div
                      key={image.id}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                    >
                      <Image
                        src={image.preview}
                        alt="Service image preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />

                      {/* Loading Overlay */}
                      {image.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}

                      {/* Error Overlay */}
                      {image.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                          <span className="text-red-700 text-xs font-semibold">Lỗi tải lên</span>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        aria-label="Xóa hình ảnh"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity shadow-lg"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              className="bg-green-500 hover:bg-green-600 text-white font-semibold shadow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Edit className="h-5 w-5 mr-2" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  {isEditing ? 'Cập nhật' : 'Tạo mới'}
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
