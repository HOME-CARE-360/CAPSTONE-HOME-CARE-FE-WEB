'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userFormSchema, UserFormData } from '@/schemaValidations/admin.schema';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Lock, Shield, Users } from 'lucide-react';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => void;
  initialData?: UserFormData;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
}

export default function UserCreateModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  isLoading = false,
}: UserCreateModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData || {
      email: '',
      password: '',
      name: '',
      phone: '',
      avatar: '',
      status: 'ACTIVE',
      role: 'USER',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: UserFormData) => {
    console.log('userData:: ', data);
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
                {mode === 'create' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {mode === 'create'
                  ? 'Tạo tài khoản người dùng mới cho hệ thống'
                  : 'Cập nhật thông tin người dùng hiện có'}
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
                    Tên người dùng <span className="text-destructive">*</span>
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
                        placeholder="example@email.com"
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

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-sm font-medium">
                  URL Ảnh đại diện
                </Label>
                <Controller
                  name="avatar"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="avatar"
                      placeholder="https://example.com/avatar.jpg"
                      disabled={isLoading}
                    />
                  )}
                />
                {errors.avatar && (
                  <p className="text-xs text-destructive">{errors.avatar.message}</p>
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

          {/* Role & Status Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Vai trò & trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Vai trò <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* <SelectItem value="USER">Người dùng</SelectItem>
                          <SelectItem value="PROVIDER">Nhà cung cấp</SelectItem>
                          <SelectItem value="ADMIN">Quản trị viên</SelectItem> */}
                          <SelectItem value="MANAGER">Người quản lý</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Trạng thái <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                          <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                          <SelectItem value="BLOCKED">Bị cấm</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-xs text-destructive">{errors.status.message}</p>
                  )}
                </div>
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
                'Tạo người dùng'
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
