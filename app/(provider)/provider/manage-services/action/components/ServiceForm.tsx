'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { CardFooter } from '@/components/ui/card';
import { AutocompleteSelect } from './AutocompleteSelect';
import { DraggableImageUpload } from './DraggableImageUpload';
import { Category } from '@/lib/api/services/fetchCategory';
import { ServiceManager } from '@/lib/api/services/fetchServiceManager';

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.number().min(0, 'Base price must be greater than 0'),
  virtualPrice: z.number().min(0, 'Virtual price must be greater than 0'),
  durationMinutes: z.number().min(1, 'Duration must be greater than 0'),
  categories: z.array(z.number()).default([]),
  images: z.array(z.string()).default([]),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: ServiceManager;
  categories: Category[];
  isEditMode: boolean;
}

export function ServiceForm({ initialData, categories, isEditMode }: ServiceFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
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

  // Custom price input handler
  const handlePriceChange = (value: string, onChange: (value: number) => void) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    // Convert to number
    const numberValue = numericValue ? parseInt(numericValue) : 0;
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá cơ bản</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="0"
                      className="pr-20"
                      value={formatCurrency(field.value, Currency.VND)}
                      onChange={e => handlePriceChange(e.target.value, field.onChange)}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                      VND
                    </div>
                  </div>
                </FormControl>
                <FormDescription>Giá cơ bản cho dịch vụ này</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="virtualPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá ảo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="0"
                      className="pr-20"
                      value={formatCurrency(field.value, Currency.VND)}
                      onChange={e => handlePriceChange(e.target.value, field.onChange)}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                      VND
                    </div>
                  </div>
                </FormControl>
                <FormDescription>Giá ảo cho dịch vụ này</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="durationMinutes"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Thời gian (phút)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="30"
                  min={1}
                  onChange={e => onChange(Number(e.target.value))}
                  {...field}
                />
              </FormControl>
              <FormDescription>Thời gian thực hiện dịch vụ</FormDescription>
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
