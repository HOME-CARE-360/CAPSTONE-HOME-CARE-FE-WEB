'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import {
  useCreateService,
  useServiceItems,
  useUpdateService,
  useServiceManagerDetail,
} from '@/hooks/useServiceManager';
import { useCategories } from '@/hooks/useCategory';
import { useUploadImage } from '@/hooks/useImage';
import {
  ServiceItem,
  ServiceManager,
  ServiceManagerRequest,
} from '@/lib/api/services/fetchServiceManager';
import { Category } from '@/lib/api/services/fetchCategory';
import { Plus, Edit, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/store/authStore';

const serviceFormSchema = z.object({
  name: z.string().min(1, 'Tên dịch vụ là bắt buộc'),
  description: z.string().min(4, 'Mô tả dịch vụ phải có ít nhất 4 từ'),
  basePrice: z.number().min(0, 'Giá cơ bản phải lớn hơn 0'),
  virtualPrice: z.number().min(0, 'Giá ảo phải lớn hơn 0'),
  durationMinutes: z.number().min(1, 'Thời gian phải lớn hơn 0'),
  categoryId: z.number().min(1, 'Vui lòng chọn loại dịch vụ'),
  serviceItemsId: z.array(z.number()).optional(),
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
  const { data: serviceItems, isLoading: isServiceItemsLoading } = useServiceItems({
    limit: 1000,
    page: 1,
    brand: '',
    isActive: true,
    sortBy: 'createdAt',
    orderBy: 'desc',
    name: '',
  });
  const isSheetOpen = open !== undefined ? open : isOpen;
  // Fetch service detail when editing and sheet is open
  const detailId = isEditing && service ? service.id : null;
  const {
    data: serviceDetailResponse,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useServiceManagerDetail(isSheetOpen ? detailId : null);
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      virtualPrice: 0,
      durationMinutes: 30,
      categoryId: 0,
      serviceItemsId: [],
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

  // isSheetOpen declared earlier for hook usage

  useEffect(() => {
    if (!isSheetOpen) return;

    if (isEditing) {
      const detail = serviceDetailResponse?.data;
      if (detail) {
        form.reset({
          name: detail.name,
          description: detail.description,
          basePrice: detail.basePrice,
          virtualPrice: detail.virtualPrice,
          durationMinutes: detail.durationMinutes,
          // Detail response category lacks id, fallback to provided service's category id if available
          categoryId: service?.category?.id || 0,
          serviceItemsId: detail.attachedItems?.map(ai => ai.serviceItem.id) || [],
        });

        if (detail.images && detail.images.length > 0) {
          const existingImages: UploadedImage[] = detail.images.map((url, index) => ({
            id: `existing-${index}`,
            file: new File([], 'existing-image'),
            preview: url,
            status: 'success',
            url: url,
          }));
          setUploadedImages(existingImages);
        } else {
          setUploadedImages([]);
        }
      }
    } else if (!isEditing) {
      form.reset({
        name: '',
        description: '',
        basePrice: 0,
        virtualPrice: 0,
        durationMinutes: 30,
        categoryId: 0,
        serviceItemsId: [],
      });
      setUploadedImages([]);
    }
  }, [serviceDetailResponse, service, form, isEditing, isSheetOpen]);

  // Force-refetch detail each time the sheet opens to avoid stale data
  useEffect(() => {
    if (isEditing && isSheetOpen && detailId) {
      refetchDetail();
    }
  }, [isEditing, isSheetOpen, detailId, refetchDetail]);

  // Pre-fill category from list service on first open so Select shows immediately
  useEffect(() => {
    if (isSheetOpen && isEditing && service?.category?.id) {
      const currentCategoryId = form.getValues('categoryId');
      if (!currentCategoryId || currentCategoryId === 0) {
        form.setValue('categoryId', service.category.id);
      }
    }
  }, [isSheetOpen, isEditing, service, form]);

  // Nudge Select to render label when categories arrive by re-setting the same value
  useEffect(() => {
    if (!isSheetOpen) return;
    const selectedId = form.getValues('categoryId');
    if (selectedId && categoryData?.categories?.length) {
      form.setValue('categoryId', selectedId);
    }
  }, [categoryData, isSheetOpen, form]);

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
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      toast.error('Bạn cần đăng nhập để tạo dịch vụ');
      return;
    }
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
          serviceItemsId: data.serviceItemsId ?? [],
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
  const { isAuthenticated } = useAuthStore();
  const canSubmit = isAuthenticated && form.formState.isValid && !isSubmitting;

  const formatCurrencyVi = (value: number): string => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const parseCurrencyToNumber = (input: string): number => {
    const digitsOnly = input.replace(/[^\d]/g, '');
    return digitsOnly ? Number(digitsOnly) : 0;
  };

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

        {isEditing && isDetailLoading ? (
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between w-full">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
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
                  <p className="text-sm text-red-600">
                    {form.formState.errors.description.message}
                  </p>
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

              {/* Service Items Selection */}
              <div className="space-y-2">
                <Label htmlFor="serviceItems">Vật tư</Label>

                {/* Display selected service items */}
                {(form.watch('serviceItemsId') || []).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Đã chọn:</p>
                    <div className="flex flex-wrap gap-2">
                      {(form.watch('serviceItemsId') || []).map((serviceItemId: number) => {
                        const serviceItem = serviceItems?.data?.data?.find(
                          item => item.id === serviceItemId
                        );
                        return (
                          <div
                            key={serviceItemId}
                            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                          >
                            <span>{serviceItem?.name || `Service ${serviceItemId}`}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentServiceItems = form.getValues('serviceItemsId') || [];
                                const updatedItems = currentServiceItems.filter(
                                  id => id !== serviceItemId
                                );
                                form.setValue('serviceItemsId', updatedItems);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Select
                  value={''}
                  onValueChange={value => {
                    const currentServiceItems = form.getValues('serviceItemsId') || [];
                    const parsedValue = parseInt(value);
                    if (!currentServiceItems.includes(parsedValue)) {
                      form.setValue('serviceItemsId', [...currentServiceItems, parsedValue]);
                    }
                  }}
                  disabled={isSubmitting || isServiceItemsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn service items" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceItems?.data?.data
                      ?.filter(
                        (serviceItem: ServiceItem) =>
                          !(form.watch('serviceItemsId') || []).includes(serviceItem.id)
                      )
                      .map((serviceItem: ServiceItem) => (
                        <SelectItem key={serviceItem.id} value={serviceItem.id.toString()}>
                          {serviceItem.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Giá cơ bản (VNĐ) *</Label>
                  <Controller
                    name="basePrice"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="basePrice"
                        inputMode="numeric"
                        placeholder="0"
                        value={field.value ? formatCurrencyVi(field.value) : ''}
                        onChange={e => field.onChange(parseCurrencyToNumber(e.target.value))}
                        onBlur={() => field.onChange(field.value || 0)}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {form.formState.errors.basePrice && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.basePrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="virtualPrice">Giá ảo (VNĐ) *</Label>
                  <Controller
                    name="virtualPrice"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="virtualPrice"
                        inputMode="numeric"
                        placeholder="0"
                        value={field.value ? formatCurrencyVi(field.value) : ''}
                        onChange={e => field.onChange(parseCurrencyToNumber(e.target.value))}
                        onBlur={() => field.onChange(field.value || 0)}
                        disabled={isSubmitting}
                      />
                    )}
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
                disabled={!canSubmit}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold shadow"
                aria-disabled={!canSubmit}
                title={
                  !isAuthenticated
                    ? 'Vui lòng đăng nhập để thực hiện'
                    : !form.formState.isValid
                      ? 'Vui lòng điền đầy đủ thông tin hợp lệ'
                      : undefined
                }
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
        )}
      </SheetContent>
    </Sheet>
  );
}
