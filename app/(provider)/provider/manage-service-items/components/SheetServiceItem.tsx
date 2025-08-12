'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCreateServiceItem, useUpdateServiceItem } from '@/hooks/useServiceManager';
import { ServiceItem } from '@/lib/api/services/fetchServiceManager';
import { Plus, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const serviceItemFormSchema = z.object({
  name: z.string().min(1, 'Tên vật tư là bắt buộc'),
  description: z.string().min(1, 'Mô tả vật tư là bắt buộc'),
  unitPrice: z.number().min(0, 'Giá đơn vị phải lớn hơn 0'),
  warrantyPeriod: z.number().min(0, 'Thời gian bảo hành phải lớn hơn 0'),
  brand: z.string().min(1, 'Thương hiệu là bắt buộc'),
  model: z.string().min(1, 'Model là bắt buộc'),
  stockQuantity: z.number().min(0, 'Số lượng tồn kho phải lớn hơn 0'),
  isActive: z.boolean(),
});

type ServiceItemFormData = z.infer<typeof serviceItemFormSchema>;

interface SheetServiceItemProps {
  serviceItem?: ServiceItem | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SheetServiceItem({
  serviceItem,
  trigger,
  open,
  onOpenChange,
}: SheetServiceItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!serviceItem;

  const { mutate: createServiceItem, isPending: isCreating } = useCreateServiceItem();
  const { mutate: updateServiceItem, isPending: isUpdating } = useUpdateServiceItem();

  const form = useForm<ServiceItemFormData>({
    resolver: zodResolver(serviceItemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      unitPrice: 0,
      warrantyPeriod: 12,
      brand: '',
      model: '',
      stockQuantity: 0,
      isActive: true,
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
    }
  };

  const isSheetOpen = open !== undefined ? open : isOpen;

  useEffect(() => {
    if (!isSheetOpen) return;

    if (isEditing && serviceItem) {
      form.reset({
        name: serviceItem.name,
        description: serviceItem.description,
        unitPrice: serviceItem.unitPrice,
        warrantyPeriod: serviceItem.warrantyPeriod,
        brand: serviceItem.brand,
        model: serviceItem.model,
        stockQuantity: serviceItem.stockQuantity,
        isActive: serviceItem.isActive,
      });
    } else if (!isEditing) {
      form.reset({
        name: '',
        description: '',
        unitPrice: 0,
        warrantyPeriod: 12,
        brand: '',
        model: '',
        stockQuantity: 0,
        isActive: true,
      });
    }
  }, [serviceItem, form, isEditing, isSheetOpen]);

  const onSubmit = async (data: ServiceItemFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && serviceItem) {
        updateServiceItem(
          { ...data, id: serviceItem.id },
          {
            onSuccess: () => {
              toast.success('Cập nhật vật tư thành công');
              handleOpenChange(false);
            },
            onError: () => {
              toast.error('Cập nhật vật tư thất bại');
            },
          }
        );
      } else {
        createServiceItem(data, {
          onSuccess: () => {
            toast.success('Tạo vật tư thành công');
            handleOpenChange(false);
          },
          onError: () => {
            toast.error('Tạo vật tư thất bại');
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
                Chỉnh sửa vật tư
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Thêm vật tư mới
              </>
            )}
          </SheetTitle>
          <SheetDescription className="mt-1">
            {isEditing ? 'Cập nhật thông tin vật tư' : 'Tạo vật tư mới cho dịch vụ'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-4">
            {/* Service Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên vật tư *</Label>
              <Input
                id="name"
                placeholder="Nhập tên vật tư"
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
                placeholder="Nhập mô tả vật tư"
                rows={3}
                {...form.register('description')}
                disabled={isSubmitting}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Brand and Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Thương hiệu *</Label>
                <Input
                  id="brand"
                  placeholder="Nhập thương hiệu"
                  {...form.register('brand')}
                  disabled={isSubmitting}
                />
                {form.formState.errors.brand && (
                  <p className="text-sm text-red-600">{form.formState.errors.brand.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  placeholder="Nhập model"
                  {...form.register('model')}
                  disabled={isSubmitting}
                />
                {form.formState.errors.model && (
                  <p className="text-sm text-red-600">{form.formState.errors.model.message}</p>
                )}
              </div>
            </div>

            {/* Price and Warranty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Giá đơn vị (VNĐ) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  placeholder="0"
                  {...form.register('unitPrice', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {form.formState.errors.unitPrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.unitPrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyPeriod">Thời gian bảo hành (tháng) *</Label>
                <Input
                  id="warrantyPeriod"
                  type="number"
                  placeholder="12"
                  {...form.register('warrantyPeriod', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {form.formState.errors.warrantyPeriod && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.warrantyPeriod.message}
                  </p>
                )}
              </div>
            </div>

            {/* Stock and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Số lượng tồn kho *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  placeholder="0"
                  {...form.register('stockQuantity', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {form.formState.errors.stockQuantity && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.stockQuantity.message}
                  </p>
                )}
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="unit">Đơn vị *</Label>
                <Input
                  id="unit"
                  placeholder="cái"
                  {...form.register('unit')}
                  disabled={isSubmitting}
                />
                {form.formState.errors.unit && (
                  <p className="text-sm text-red-600">{form.formState.errors.unit.message}</p>
                )}
              </div> */}
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={checked => form.setValue('isActive', checked as boolean)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Vật tư đang hoạt động
              </Label>
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
