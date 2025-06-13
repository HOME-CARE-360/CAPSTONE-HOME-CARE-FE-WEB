'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useEffect } from 'react';

const serviceSchema = z.object({
  name: z.string().min(1, 'Tên dịch vụ là bắt buộc'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  basePrice: z.number().min(1000, 'Giá cơ bản phải ít nhất 1,000đ'),
  virtualPrice: z.number().min(1000, 'Giá hiển thị phải ít nhất 1,000đ'),
  durationMinutes: z.number().min(15, 'Thời gian phải ít nhất 15 phút'),
  images: z.array(z.string()).default([]),
  categories: z.array(z.string()).min(1, 'Phải chọn ít nhất một danh mục'),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  virtualPrice: number;
  durationMinutes: number;
  images: string[];
  categories: Category[];
}

interface ServiceFormProps {
  editingService: Service | null;
  categories: Category[];
  onSubmit: (data: ServiceFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ServiceForm({
  editingService,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      virtualPrice: 0,
      durationMinutes: 60,
      images: [],
      categories: [],
    },
  });

  // Cập nhật form khi editingService thay đổi
  useEffect(() => {
    if (editingService) {
      form.reset({
        name: editingService.name,
        description: editingService.description,
        basePrice: editingService.basePrice,
        virtualPrice: editingService.virtualPrice,
        durationMinutes: editingService.durationMinutes,
        images: editingService.images,
        categories: editingService.categories.map(cat => cat.id),
      });
    } else {
      form.reset({
        name: '',
        description: '',
        basePrice: 0,
        virtualPrice: 0,
        durationMinutes: 60,
        images: [],
        categories: [],
      });
    }
  }, [editingService, form]);

  const handleSubmit = async (data: ServiceFormValues) => {
    try {
      await onSubmit(data);
      if (!editingService) {
        form.reset();
      }
    } catch (error) {
      console.error('Lỗi khi lưu dịch vụ:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Thông tin cơ bản</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên dịch vụ *</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Dọn dẹp nhà cửa tổng quát" {...field} />
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
                <FormLabel>Mô tả dịch vụ *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả chi tiết về dịch vụ, quy trình thực hiện, những gì khách hàng sẽ nhận được..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Giá cả và thời gian */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Giá cả và thời gian</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá cơ bản (VNĐ) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100000"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="virtualPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá hiển thị (VNĐ) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="150000"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thời gian thực hiện (phút) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="60"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Danh mục */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Danh mục dịch vụ</h3>

          <FormField
            control={form.control}
            name="categories"
            render={() => (
              <FormItem>
                <FormLabel>Chọn danh mục *</FormLabel>
                <div className="grid grid-cols-1 gap-3">
                  {categories.map(category => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categories"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={category.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={checked => {
                                  return checked
                                    ? field.onChange([...field.value, category.id])
                                    : field.onChange(
                                        field.value?.filter(value => value !== category.id)
                                      );
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">{category.name}</FormLabel>
                              {category.description && (
                                <p className="text-sm text-muted-foreground">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Hình ảnh */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Hình ảnh dịch vụ</h3>

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL hình ảnh</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {field.value.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={image}
                          onChange={e => {
                            const newImages = [...field.value];
                            newImages[index] = e.target.value;
                            field.onChange(newImages);
                          }}
                          placeholder="https://example.com/image.jpg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newImages = field.value.filter((_, i) => i !== index);
                            field.onChange(newImages);
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => field.onChange([...field.value, ''])}
                    >
                      Thêm hình ảnh
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : editingService ? 'Cập nhật dịch vụ' : 'Tạo dịch vụ'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
