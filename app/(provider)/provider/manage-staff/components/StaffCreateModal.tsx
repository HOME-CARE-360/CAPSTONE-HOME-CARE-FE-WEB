'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffFormSchema, StaffFormData } from '@/schemaValidations/staff.schema';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
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
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Lock, Shield, Users } from 'lucide-react';
import Image from 'next/image';

interface StaffCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: StaffFormData) => void;
  initialData?: StaffFormData;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
}

export default function StaffCreateModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  isLoading = false,
}: StaffCreateModalProps) {
  const { data: categoryStaff, isLoading: isCategoriesLoading } = useCategories();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: initialData || {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      categoryIds: [],
    },
    mode: 'onChange',
  });

  const selectedCategoryIds = watch('categoryIds');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: StaffFormData) => {
    onSubmit(data);
    if (mode === 'create') {
      reset();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      if (mode === 'create') {
        reset();
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl">
                {mode === 'create' ? 'Thêm nhân viên mới' : 'Chỉnh sửa nhân viên'}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {mode === 'create'
                  ? 'Tạo tài khoản nhân viên mới cho hệ thống'
                  : 'Cập nhật thông tin nhân viên hiện có'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Basic Information Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Tên nhân viên <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          id="name"
                          placeholder="Nhập tên đầy đủ"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    )}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Số điện thoại <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          id="phone"
                          placeholder="0xxx xxx xxx"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    )}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Địa chỉ email <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="example@company.com"
                        className="pl-10"
                        disabled={mode === 'edit' || isLoading}
                      />
                    </div>
                  )}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                {mode === 'edit' && (
                  <p className="text-xs text-muted-foreground">
                    Email không thể thay đổi sau khi tạo tài khoản
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Password Section - Only for create mode */}
          {mode === 'create' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Bảo mật tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mật khẩu <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id="password"
                            type="password"
                            placeholder="Tối thiểu 6 ký tự"
                            className="pl-10"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Xác nhận mật khẩu <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id="confirmPassword"
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            className="pl-10"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Role & Permissions Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Vai trò & quyền hạn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryIds" className="text-sm font-medium">
                  Danh mục phụ trách <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="categoryIds"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={value => field.onChange([parseInt(value)])}
                      value={field.value[0]?.toString()}
                      disabled={isCategoriesLoading || isLoading}
                    >
                      <SelectTrigger id="categoryIds">
                        <SelectValue placeholder="Chọn danh mục dịch vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryStaff?.categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              {category.logo && (
                                <Image
                                  src={category.logo}
                                  alt={category.name}
                                  width={16}
                                  height={16}
                                  className="h-4 w-4 rounded-sm object-cover"
                                  unoptimized
                                />
                              )}
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryIds && (
                  <p className="text-xs text-destructive">{errors.categoryIds.message}</p>
                )}

                {/* Selected categories preview */}
                {selectedCategoryIds && selectedCategoryIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategoryIds.map(categoryId => {
                      const category = categoryStaff?.categories.find(c => c.id === categoryId);
                      return category ? (
                        <Badge key={categoryId} variant="secondary" className="text-xs">
                          {category.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          <SheetFooter className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isValid || (!isDirty && mode === 'edit')}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  {mode === 'create' ? 'Đang tạo...' : 'Đang cập nhật...'}
                </div>
              ) : mode === 'create' ? (
                'Tạo nhân viên'
              ) : (
                'Cập nhật thông tin'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
