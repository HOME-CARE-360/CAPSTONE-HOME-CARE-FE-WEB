'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatCurrency, Currency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  useCreateServiceItem,
  useUpdateServiceItem,
  useServiceItemDetail,
} from '@/hooks/useServiceManager';
import { ServiceItemRequest } from '@/lib/api/services/fetchServiceManager';

const serviceItemSchema = z.object({
  name: z.string().min(1, 'Tên vật tư là bắt buộc'),
  unitPrice: z.number().min(0, 'Giá đơn vị phải lớn hơn hoặc bằng 0'),
  warrantyPeriod: z.number().min(0, 'Thời gian bảo hành phải lớn hơn hoặc bằng 0'),
  brand: z.string().min(1, 'Thương hiệu là bắt buộc'),
  description: z.string().min(1, 'Mô tả là bắt buộc'),
  isActive: z.boolean(),
  model: z.string().min(1, 'Model là bắt buộc'),
  stockQuantity: z.number().min(0, 'Số lượng tồn phải lớn hơn hoặc bằng 0'),
});

type ServiceItemFormData = z.infer<typeof serviceItemSchema>;

interface ServiceItemSheetProps {
  serviceItemId?: number | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ServiceItemSheet({
  serviceItemId,
  trigger,
  open,
  onOpenChange,
}: ServiceItemSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unitPriceInput, setUnitPriceInput] = useState('');
  const isEditing = !!serviceItemId;

  const { data: serviceItemDetail } = useServiceItemDetail(serviceItemId || null);
  const { mutate: createServiceItem } = useCreateServiceItem();
  const { mutate: updateServiceItem } = useUpdateServiceItem();

  const form = useForm<ServiceItemFormData>({
    resolver: zodResolver(serviceItemSchema),
    defaultValues: {
      name: '',
      unitPrice: 0,
      warrantyPeriod: 0,
      brand: '',
      description: '',
      isActive: true,
      model: '',
      stockQuantity: 0,
    },
  });

  // Helper function to format number for display (with thousand separators)
  const formatNumber = (value: number | string): string => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return numericValue.toLocaleString('vi-VN');
  };

  // Helper function to format Vietnamese currency
  const formatVietnameseCurrency = (amount: number): string => {
    return formatCurrency(amount, Currency.VND);
  };

  // Helper function to handle price input
  const handlePriceInput = (value: string, onChange: (value: number) => void) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    const numberValue = numericValue ? parseInt(numericValue) : 0;

    // Update form value
    onChange(numberValue);

    // Update display value
    setUnitPriceInput(formatNumber(numberValue));
  };

  // Handle controlled open state
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }

    if (!newOpen) {
      // Reset form when closing
      form.reset();
      setUnitPriceInput('0');
    }
  };

  const actualOpen = open !== undefined ? open : isOpen;

  useEffect(() => {
    if (isEditing && serviceItemDetail?.data && actualOpen) {
      const item = serviceItemDetail.data;
      form.reset({
        name: item.name,
        unitPrice: item.unitPrice,
        warrantyPeriod: item.warrantyPeriod,
        brand: item.brand,
        description: item.description,
        isActive: item.isActive,
        model: item.model,
        stockQuantity: item.stockQuantity,
      });
      setUnitPriceInput(formatNumber(item.unitPrice));
    } else if (!isEditing && actualOpen) {
      form.reset({
        name: '',
        unitPrice: 0,
        warrantyPeriod: 0,
        brand: '',
        description: '',
        isActive: true,
        model: '',
        stockQuantity: 0,
      });
      setUnitPriceInput('0');
    }
  }, [serviceItemDetail, form, isEditing, actualOpen]);

  const handleSubmit = async (data: ServiceItemFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && serviceItemId) {
        updateServiceItem(
          { id: serviceItemId, ...data },
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
        const serviceItemData: ServiceItemRequest = {
          name: data.name,
          unitPrice: data.unitPrice,
          warrantyPeriod: data.warrantyPeriod,
          brand: data.brand,
          description: data.description,
          isActive: data.isActive,
          model: data.model,
          stockQuantity: data.stockQuantity,
        };

        createServiceItem(serviceItemData, {
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

  return (
    <Sheet open={actualOpen} onOpenChange={handleOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Cập nhật thông tin vật tư' : 'Tạo vật tư mới cho dịch vụ'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên vật tư *</Label>
              <Input id="name" placeholder="Nhập tên vật tư" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Thương hiệu *</Label>
              <Input id="brand" placeholder="Nhập thương hiệu" {...form.register('brand')} />
              {form.formState.errors.brand && (
                <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" placeholder="Nhập model" {...form.register('model')} />
              {form.formState.errors.model && (
                <p className="text-sm text-destructive">{form.formState.errors.model.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="unitPrice" className="text-sm font-medium">
                    Giá đơn vị
                  </Label>
                  <span className="text-destructive text-sm">*</span>
                </div>
                <div className="relative">
                  <Input
                    id="unitPrice"
                    value={unitPriceInput}
                    onChange={e =>
                      handlePriceInput(e.target.value, value => form.setValue('unitPrice', value))
                    }
                    className="h-11 pl-12"
                    placeholder="Nhập giá đơn vị"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    ₫
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Giá đơn vị: {formatVietnameseCurrency(form.watch('unitPrice') || 0)}
                </p>
                {form.formState.errors.unitPrice && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.unitPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Số lượng tồn *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  placeholder="0"
                  {...form.register('stockQuantity', { valueAsNumber: true })}
                />
                {form.formState.errors.stockQuantity && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.stockQuantity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warrantyPeriod">Thời gian bảo hành (tháng) *</Label>
              <Input
                id="warrantyPeriod"
                type="number"
                placeholder="0"
                {...form.register('warrantyPeriod', { valueAsNumber: true })}
              />
              {form.formState.errors.warrantyPeriod && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.warrantyPeriod.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả chi tiết về vật tư"
                className="min-h-[80px]"
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={checked => form.setValue('isActive', checked === true)}
              />
              <Label htmlFor="isActive">Kích hoạt vật tư</Label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
