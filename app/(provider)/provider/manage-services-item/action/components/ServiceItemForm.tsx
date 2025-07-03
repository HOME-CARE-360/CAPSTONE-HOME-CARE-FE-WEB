'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUploadImage } from '@/hooks/useImage';
import { formatCurrency, Currency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DraggableImageUpload } from './DraggableImageUpload';
import { ServiceItem } from '@/lib/api/services/fetchServiceItem';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

// Service Item Schema
const serviceItemSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  unitPrice: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  warrantyPeriod: z.number().min(0, 'Thời gian bảo hành phải lớn hơn hoặc bằng 0'),
  brand: z.string().min(1, 'Thương hiệu là bắt buộc'),
  description: z.string().optional(),
  isActive: z.boolean(),
  model: z.string().min(1, 'Model là bắt buộc'),
  stockQuantity: z.number().min(0, 'Số lượng tồn kho phải lớn hơn hoặc bằng 0'),
  images: z.array(z.string()).optional(),
});

type ServiceItemFormValues = z.infer<typeof serviceItemSchema>;

interface ServiceItemFormProps {
  initialData?: ServiceItem | null;
  isEditMode: boolean;
}

export function ServiceItemForm({ initialData, isEditMode }: ServiceItemFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [unitPriceInput, setUnitPriceInput] = useState('');

  const { mutate: uploadImage } = useUploadImage();

  const form = useForm<ServiceItemFormValues>({
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
      images: [],
    },
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        name: initialData.name,
        unitPrice: initialData.unitPrice,
        warrantyPeriod: initialData.warrantyPeriod,
        brand: initialData.brand,
        description: initialData.description,
        isActive: initialData.isActive,
        model: initialData.model,
        stockQuantity: initialData.stockQuantity,
        images: initialData.images,
      });
      setImages(initialData.images);
      setUnitPriceInput(formatNumber(initialData.unitPrice));
    }
  }, [isEditMode, initialData, form]);

  const onSubmit = (data: ServiceItemFormValues) => {
    const formData = {
      ...data,
      images,
      unitPrice: Number(data.unitPrice),
      warrantyPeriod: Number(data.warrantyPeriod),
      stockQuantity: Number(data.stockQuantity),
    };

    console.log('Service Item Form Data:', formData);

    // TODO: Implement create/update service item API calls
    if (isEditMode && initialData?.id) {
      // updateServiceItem({ id: initialData.id, ...formData });
      console.log('Updating service item:', formData);
    } else {
      // createServiceItem(formData);
      console.log('Creating service item:', formData);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      return await new Promise<string>((resolve, reject) => {
        uploadImage(file, {
          onSuccess: data => {
            setImages(prev => [...prev, data.url]);
            resolve(data.url);
          },
          onError: error => {
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // Helper function to format number for display (with thousand separators)
  const formatNumber = (value: number | string): string => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return numericValue.toLocaleString('vi-VN');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/provider/manage-services-item">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Chỉnh sửa mục dịch vụ' : 'Thêm mục dịch vụ mới'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Cập nhật thông tin mục dịch vụ' : 'Tạo mục dịch vụ mới cho khách hàng'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thương hiệu *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập thương hiệu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập model" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mô tả chi tiết về sản phẩm" rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Giá cả & Tồn kho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá bán (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0"
                          value={unitPriceInput}
                          onChange={e => handlePriceInput(e.target.value, field.onChange)}
                        />
                      </FormControl>
                      <FormDescription>
                        Giá hiện tại: {formatCurrency(field.value, Currency.VND)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng tồn kho *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="warrantyPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bảo hành (tháng) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Trạng thái hoạt động</FormLabel>
                        <FormDescription>
                          Bật/tắt hiển thị sản phẩm này cho khách hàng
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Toggle pressed={field.value} onPressedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <DraggableImageUpload
                images={images}
                onImagesChange={setImages}
                onImageUpload={handleImageUpload}
                maxImages={10}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/provider/manage-services-item">Hủy</Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
