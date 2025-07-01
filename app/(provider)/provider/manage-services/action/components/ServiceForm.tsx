'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, ServiceFormValues } from '@/schemaValidations/service.schema';
import { useCreateService, useUpdateService } from '@/hooks/useServiceManager';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CardFooter } from '@/components/ui/card';
import { AutocompleteSelect } from './AutocompleteSelect';
import { DraggableImageUpload } from './DraggableImageUpload';
import { Category } from '@/lib/api/services/fetchCategory';
import { ServiceManager } from '@/lib/api/services/fetchServiceManager';
import { ClockIcon } from 'lucide-react';

interface ServiceFormProps {
  initialData?: ServiceManager;
  categories: Category[];
  isEditMode: boolean;
}

export function ServiceForm({ initialData, categories, isEditMode }: ServiceFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [basePriceInput, setBasePriceInput] = useState('');
  const [virtualPriceInput, setVirtualPriceInput] = useState('');

  const { mutate: createService, isPending: isCreating } = useCreateService();
  const { mutate: updateService, isPending: isUpdating } = useUpdateService();
  const { mutate: uploadImage } = useUploadImage();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      virtualPrice: 0,
      durationMinutes: 30,
      categories: [],
      images: [],
    },
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        basePrice: initialData.basePrice,
        virtualPrice: initialData.virtualPrice,
        durationMinutes: Number(initialData.durationMinutes),
        categories: Array.isArray(initialData.categories)
          ? initialData.categories.map((c: Category) => c.id)
          : [],
        images: initialData.images,
      });
      setImages(initialData.images);
      setBasePriceInput(formatNumber(initialData.basePrice));
      setVirtualPriceInput(formatNumber(initialData.virtualPrice));
    }
  }, [isEditMode, initialData, form]);

  const onSubmit = (data: ServiceFormValues) => {
    const formData = {
      ...data,
      images,
      basePrice: Number(data.basePrice),
      virtualPrice: Number(data.virtualPrice),
      durationMinutes: Number(data.durationMinutes),
      categories: data.categories,
    };

    if (isEditMode && initialData?.id) {
      updateService({
        id: initialData.id,
        ...formData,
      });
    } else {
      createService(formData);
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

  const isPending = isCreating || isUpdating;

  // Helper function to format number for display (with thousand separators)
  const formatNumber = (value: number | string): string => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return numericValue.toLocaleString('vi-VN');
  };

  // Helper function to format Vietnamese currency
  const formatVietnameseCurrency = (amount: number): string => {
    return formatCurrency(amount, Currency.VND);
  };

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} giờ`;
    }

    return `${hours}:${remainingMinutes.toString().padStart(2, '0')} giờ`;
  };

  // Helper function to handle price input
  const handlePriceInput = (
    inputType: 'basePrice' | 'virtualPrice',
    value: string,
    onChange: (value: number) => void
  ) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    const numberValue = numericValue ? parseInt(numericValue) : 0;

    // Update form value
    onChange(numberValue);

    // Update display value
    if (inputType === 'basePrice') {
      setBasePriceInput(formatNumber(numberValue));
    } else {
      setVirtualPriceInput(formatNumber(numberValue));
    }
  };

  // Helper function to handle duration input
  const handleDurationInput = (value: string, onChange: (value: number) => void) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    const numberValue = numericValue ? parseInt(numericValue) : 0;

    // Update form value
    onChange(numberValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên dịch vụ</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên dịch vụ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả dịch vụ (ít nhất 20 ký tự)"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="basePrice" className="text-sm font-medium">
                      Giá cơ bản
                    </Label>
                    <span className="text-destructive text-sm">*</span>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="basePrice"
                        value={formatNumber(field.value || 0)}
                        onChange={e =>
                          handlePriceInput('basePrice', e.target.value, field.onChange)
                        }
                        className="h-11 pl-12"
                        placeholder="Nhập giá cơ bản"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                        ₫
                      </span>
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Giá cơ bản của dịch vụ: {formatVietnameseCurrency(field.value || 0)}
                  </p>
                  {/* Display the controlled input value for debugging/usage */}
                  <p className="text-xs text-muted-foreground">
                    (Giá cơ bản nhập: {basePriceInput})
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="virtualPrice"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="virtualPrice" className="text-sm font-medium">
                      Giá ảo
                    </Label>
                    <span className="text-destructive text-sm">*</span>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="virtualPrice"
                        value={formatNumber(field.value || 0)}
                        onChange={e =>
                          handlePriceInput('virtualPrice', e.target.value, field.onChange)
                        }
                        className="h-11 pl-12"
                        placeholder="Nhập giá ảo"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                        ₫
                      </span>
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Giá ảo của dịch vụ: {formatVietnameseCurrency(field.value || 0)}
                  </p>
                  {/* Display the controlled input value for debugging/usage */}
                  <p className="text-xs text-muted-foreground">
                    (Giá ảo nhập: {virtualPriceInput})
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="durationMinutes"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="durationMinutes" className="text-sm font-medium">
                    Thời gian thực hiện
                  </Label>
                  <span className="text-destructive text-sm">*</span>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="durationMinutes"
                      type="text"
                      value={formatNumber(value || 0)}
                      onChange={e => handleDurationInput(e.target.value, onChange)}
                      className="h-11 pl-12"
                      placeholder="Nhập thời gian"
                      {...field}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      <ClockIcon className="w-4 h-4" />
                    </span>
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Thời gian thực hiện dịch vụ: {formatDuration(value || 0)}
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <FormControl>
                <AutocompleteSelect
                  value={field.value}
                  onChange={(values: number[]) => {
                    const numberValues = values.map(Number);
                    field.onChange(numberValues);
                  }}
                  options={categories}
                  placeholder="Chọn danh mục..."
                />
              </FormControl>
              <FormDescription>Tìm kiếm và chọn nhiều danh mục cho dịch vụ của bạn</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Ảnh dịch vụ</FormLabel>
          <FormControl>
            <DraggableImageUpload
              value={images}
              onChange={setImages}
              onUpload={handleImageUpload}
              maxImages={3}
            />
          </FormControl>
          <FormDescription>Tải lên tối đa 3 ảnh. Kéo thả để sắp xếp lại thứ tự.</FormDescription>
          <FormMessage />
        </FormItem>

        <CardFooter className="px-0 pb-0">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? isEditMode
                ? 'Đang cập nhật...'
                : 'Đang tạo...'
              : isEditMode
                ? 'Cập nhật dịch vụ'
                : 'Tạo dịch vụ'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
