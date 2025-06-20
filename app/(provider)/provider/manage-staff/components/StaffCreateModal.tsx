'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/hooks/useCategory';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import React from 'react';

const staffSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    name: z.string().min(1, 'Vui lòng nhập tên nhân viên'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
    categoryIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất một danh mục'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type StaffFormData = z.infer<typeof staffSchema>;

interface StaffCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: StaffFormData) => void;
  initialData?: StaffFormData;
  mode?: 'create' | 'edit';
}

// interface InitialStaffData {
//   email: string
//   name: string
//   password: string
//   categoryIds: number[]
// }

export default function StaffCreateModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: StaffCreateModalProps) {
  const {
    data: categoryStaff,
    // isLoading: isLoadingCategoryStaff,
    // error: errorCategoryStaff,
  } = useCategories();

  console.log('categoryStaff:: ', categoryStaff);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: initialData || {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      categoryIds: [],
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: StaffFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tạo nhân viên mới' : 'Chỉnh sửa nhân viên'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Nhập thông tin nhân viên để tạo tài khoản mới.'
              : 'Chỉnh sửa thông tin nhân viên.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Email"
                    disabled={mode === 'edit'}
                  />
                )}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="name">Tên nhân viên *</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} id="name" placeholder="Tên nhân viên" />}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
          </div>
          {mode === 'create' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Mật khẩu *</Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="password" type="password" placeholder="Mật khẩu" />
                  )}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <Input {...field} id="phone" placeholder="Số điện thoại" />}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="categoryIds">Danh mục *</Label>
            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={value => field.onChange([parseInt(value)])}
                  value={field.value[0]?.toString()}
                >
                  <SelectTrigger id="categoryIds">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryStaff?.categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryIds && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryIds.message}</p>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">{mode === 'create' ? 'Tạo nhân viên' : 'Cập nhật'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
