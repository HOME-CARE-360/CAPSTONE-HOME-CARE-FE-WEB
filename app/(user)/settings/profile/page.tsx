'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUpdateProfile, useUserProfile } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getNameFallback } from '@/utils/helper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserProfileRequestSchema } from '@/schemaValidations/user.schema';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useUploadImage } from '@/hooks/useImage';

type UpdateProfileFormData = {
  user: {
    name: string;
    phone: string;
    avatar?: string | null;
  };
  customer: {
    address?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
  };
};

export default function ProfilePage() {
  const { data: profile, refetch } = useUserProfile();
  const updateUserMutation = useUpdateProfile();
  const uploadImageMutation = useUploadImage();
  const [isLoading, setIsLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    profile?.data?.customer.dateOfBirth ? new Date(profile?.data.customer.dateOfBirth) : undefined
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateUserProfileRequestSchema),
    defaultValues: {
      user: {
        name: profile?.data?.user.name || '',
        phone: profile?.data?.user.phone || '',
        avatar: profile?.data?.user.avatar || null,
      },
      customer: {
        address: profile?.data?.customer?.address || null,
        dateOfBirth: profile?.data?.customer?.dateOfBirth || null,
        gender: profile?.data?.customer?.gender || 'OTHER',
      },
    },
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile?.data) {
      form.reset({
        user: {
          name: profile.data.user.name || '',
          phone: profile.data.user.phone || '',
          avatar: profile.data.user.avatar || null,
        },
        customer: {
          address: profile.data.customer?.address || null,
          dateOfBirth: profile.data.customer?.dateOfBirth || null,
          gender: profile.data.customer?.gender || 'OTHER',
        },
      });
      setDateOfBirth(
        profile.data.customer?.dateOfBirth ? new Date(profile.data.customer.dateOfBirth) : undefined
      );
    }
  }, [profile?.data, form]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (1MB)
      if (file.size > 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 1MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      const response = await uploadImageMutation.mutateAsync(selectedImage);
      if (response?.url) {
        form.setValue('user.avatar', response.url);
        toast.success('Tải lên ảnh thành công!');
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (error) {
      toast.error('Tải lên ảnh thất bại');
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      setIsLoading(true);
      // Update dateOfBirth in the form data
      data.customer.dateOfBirth = dateOfBirth ? dateOfBirth.toISOString() : null;
      await updateUserMutation.mutateAsync(data);
      toast.success('Cập nhật hồ sơ thành công!');
      refetch();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
      console.error('Update profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Chọn ngày sinh';
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  const currentAvatar = imagePreview || profile?.data?.user.avatar;

  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle>Hồ Sơ Của Tôi</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin hồ sơ để bảo mật tài khoản
          </p>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Info Form */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <Label htmlFor="name">Tên</Label>
                <Controller
                  name="user.name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        id="name"
                        className={cn(
                          'transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                          fieldState.error && 'border-red-500 focus:ring-red-500'
                        )}
                      />
                      {fieldState.error && (
                        <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <Label>Email</Label>
                <div className="flex gap-2">
                  <Input disabled value={profile?.data?.user.email} className="bg-gray-50" />
                </div>
              </div>

              <div>
                <Label>Số điện thoại</Label>
                <div className="flex gap-2">
                  <Controller
                    name="user.phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="flex-1">
                        <Input
                          {...field}
                          className={cn(
                            'transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            fieldState.error && 'border-red-500 focus:ring-red-500'
                          )}
                        />
                        {fieldState.error && (
                          <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                  <Button variant="outline" size="sm" type="button">
                    Thay đổi
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Địa chỉ</Label>
                <Controller
                  name="customer.address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        id="address"
                        placeholder="Nhập địa chỉ của bạn"
                        value={field.value || ''}
                        className={cn(
                          'transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                          fieldState.error && 'border-red-500 focus:ring-red-500'
                        )}
                      />
                      {fieldState.error && (
                        <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <Label>Giới tính</Label>
                <Controller
                  name="customer.gender"
                  control={form.control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="MALE" id="male" className="text-blue-600" />
                        <Label htmlFor="male" className="cursor-pointer">
                          Nam
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="FEMALE" id="female" className="text-blue-600" />
                        <Label htmlFor="female" className="cursor-pointer">
                          Nữ
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OTHER" id="other" className="text-blue-600" />
                        <Label htmlFor="other" className="cursor-pointer">
                          Khác
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              <div>
                <Label>Ngày sinh</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                          !dateOfBirth && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                        {formatDate(dateOfBirth)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="rounded-lg border bg-white shadow-lg">
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          onSelect={setDateOfBirth}
                          disabled={date => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                          className="rounded-lg"
                          classNames={{
                            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                            month: 'space-y-4',
                            caption: 'flex justify-center pt-1 relative items-center',
                            caption_label: 'text-sm font-medium text-gray-900',
                            nav: 'space-x-1 flex items-center',
                            nav_button: cn(
                              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity',
                              'hover:bg-gray-100 rounded-md'
                            ),
                            nav_button_previous: 'absolute left-1',
                            nav_button_next: 'absolute right-1',
                            table: 'w-full border-collapse space-y-1',
                            head_row: 'flex',
                            head_cell: 'text-gray-500 rounded-md w-8 font-normal text-[0.8rem]',
                            row: 'flex w-full mt-2',
                            cell: cn(
                              'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-100',
                              'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
                            ),
                            day: cn(
                              'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
                              'hover:bg-gray-100 rounded-md transition-colors',
                              'focus:bg-gray-100 focus:text-gray-900'
                            ),
                            day_selected: cn(
                              'bg-blue-600 text-white hover:bg-blue-700 hover:text-white',
                              'focus:bg-blue-600 focus:text-white'
                            ),
                            day_today: 'bg-gray-100 text-gray-900',
                            day_outside: 'text-gray-400 opacity-50',
                            day_disabled: 'text-gray-400 opacity-50',
                            day_range_middle:
                              'aria-selected:bg-gray-100 aria-selected:text-gray-900',
                            day_hidden: 'invisible',
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" size="sm" type="button">
                    Thay đổi
                  </Button>
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 ring-4 ring-blue-100 hover:ring-blue-200 transition-all duration-200">
                  <AvatarImage src={currentAvatar || ''} className="object-cover" />
                  <AvatarFallback className="text-black text-xl font-bold">
                    {getNameFallback(profile?.data?.user.name || 'User')}
                  </AvatarFallback>
                </Avatar>

                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Chọn Ảnh
                  </Button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Image upload controls */}
              {selectedImage && (
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleImageUpload}
                      disabled={uploadImageMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {uploadImageMutation.isPending ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-1 h-3 w-3" />
                          Tải lên
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={removeSelectedImage}
                      className="px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-green-600 text-center">{selectedImage.name}</p>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Dung lượng tối đa 1MB</p>
                <p className="text-xs text-muted-foreground">Định dạng JPEG, PNG</p>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isDirty}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
