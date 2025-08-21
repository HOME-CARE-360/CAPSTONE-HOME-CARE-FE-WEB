'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUpdateProfile, useUserProfile } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Upload } from 'lucide-react';
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
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useWalletTopUp } from '@/hooks/usePayment';

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
  const router = useRouter();
  const { data: profile, refetch } = useUserProfile();
  const updateUserMutation = useUpdateProfile();
  const uploadImageMutation = useUploadImage();
  const [isLoading, setIsLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    profile?.data?.customer.dateOfBirth ? new Date(profile?.data.customer.dateOfBirth) : undefined
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const walletTopUpMutation = useWalletTopUp();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setTopUpAmount(digitsOnly);
  };

  const parsedAmount = topUpAmount ? Number(topUpAmount) : 0;

  const handleTopUp = async () => {
    try {
      if (!parsedAmount || parsedAmount <= 0) {
        toast.error('Vui lòng nhập số tiền hợp lệ');
        return;
      }
      const res = await walletTopUpMutation.mutateAsync({ amount: parsedAmount });
      const checkoutUrl = res?.data?.responseData?.checkoutUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        setIsTopUpOpen(false);
        setTopUpAmount('');
      } else {
        toast.error('Không tìm thấy liên kết thanh toán');
      }
    } catch (error) {
      toast.error('Không thể tạo giao dịch nạp tiền');
    }
  };

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

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      // Auto-upload avatar immediately
      try {
        setIsUploadingAvatar(true);
        const response = await uploadImageMutation.mutateAsync(file);
        if (response?.url) {
          form.setValue('user.avatar', response.url, { shouldDirty: true, shouldTouch: true });
          toast.success('Tải lên ảnh thành công!');
        }
      } catch (error) {
        toast.error('Tải lên ảnh thất bại');
      } finally {
        setIsUploadingAvatar(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Removed manual upload controls; image uploads immediately on selection

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      setIsLoading(true);
      // Update dateOfBirth in the form data
      data.customer.dateOfBirth = dateOfBirth ? dateOfBirth.toISOString() : null;
      // Enforce required fields in UI
      const addressValue = data.customer.address?.trim();
      if (!addressValue) {
        form.setError('customer.address', { type: 'manual', message: 'Vui lòng nhập địa chỉ' });
        throw new Error('Missing address');
      }
      if (!data.customer.dateOfBirth) {
        form.setError('customer.dateOfBirth' as never, {
          type: 'manual',
          message: 'Vui lòng chọn ngày sinh',
        });
        throw new Error('Missing dateOfBirth');
      }
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

  const currentAvatar = form.watch('user.avatar') || profile?.data?.user.avatar || '';
  const wallet = profile?.data?.user.wallet;

  const getWalletBankAccount = (w: unknown): string | undefined => {
    if (!w || typeof w !== 'object') return undefined;
    const walletObj = w as { bankAccount?: unknown; bankAccountNumber?: unknown };
    const bankAccount =
      typeof walletObj.bankAccount === 'string' ? walletObj.bankAccount : undefined;
    const bankAccountNumber =
      typeof walletObj.bankAccountNumber === 'string' ? walletObj.bankAccountNumber : undefined;
    return bankAccount || bankAccountNumber;
  };

  const handleOpenTopUp = () => {
    const bankAcc = getWalletBankAccount(wallet);
    if (!bankAcc) {
      router.push('/settings/bank');
      return;
    }
    setIsTopUpOpen(true);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Hồ Sơ Của Tôi</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin hồ sơ để bảo mật tài khoản
          </p>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
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
                          <RadioGroupItem value="MALE" id="male" className="text-green-500" />
                          <Label htmlFor="male" className="cursor-pointer">
                            Nam
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FEMALE" id="female" className="text-green-500" />
                          <Label htmlFor="female" className="cursor-pointer">
                            Nữ
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="OTHER" id="other" className="text-green-500" />
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
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          onSelect={d => {
                            setDateOfBirth(d);
                            form.setValue(
                              'customer.dateOfBirth',
                              (d
                                ? d.toISOString()
                                : null) as unknown as UpdateProfileFormData['customer']['dateOfBirth'],
                              {
                                shouldDirty: true,
                                shouldTouch: true,
                              }
                            );
                          }}
                          className="rounded-md border shadow-sm w-72"
                          captionLayout="dropdown"
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {(
                    form.formState.errors as unknown as {
                      customer?: { dateOfBirth?: { message?: string } };
                    }
                  ).customer?.dateOfBirth?.message && (
                    <p className="text-sm text-red-500 mt-1">
                      {
                        (
                          form.formState.errors as unknown as {
                            customer?: { dateOfBirth?: { message?: string } };
                          }
                        ).customer?.dateOfBirth?.message
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 ring-4 ring-blue-100 hover:ring-blue-200 transition-all duration-200">
                  <AvatarImage src={currentAvatar} className="object-cover" />
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
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        Chọn Ảnh
                      </>
                    )}
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
              {/* Remove manual upload controls to auto-upload on select */}

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Dung lượng tối đa 1MB</p>
                <p className="text-xs text-muted-foreground">Định dạng JPEG, PNG</p>
              </div>

              {/* Wallet */}
              {wallet && (
                <div className="w-full mt-4 rounded-lg border p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Số dư ví</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(wallet.balance, 'VND')}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chủ tài khoản</span>
                      <span className="font-medium">{wallet.accountHolder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngân hàng</span>
                      <span className="font-medium">{wallet.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tài khoản</span>
                      <span className="font-medium">
                        {(wallet as unknown as { bankAccount?: string; bankAccountNumber?: string })
                          .bankAccount ||
                          (wallet as unknown as { bankAccountNumber?: string }).bankAccountNumber}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                      <Button className="w-full" type="button" onClick={handleOpenTopUp}>
                        Nạp tiền vào ví
                      </Button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nạp tiền vào ví</DialogTitle>
                          <DialogDescription>
                            Vui lòng kiểm tra thông tin ví và nhập số tiền muốn nạp.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Chủ tài khoản</span>
                            <span className="font-medium">{wallet.accountHolder}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ngân hàng</span>
                            <span className="font-medium">{wallet.bankName}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Số tài khoản</span>
                            <span className="font-medium">
                              {(
                                wallet as unknown as {
                                  bankAccount?: string;
                                  bankAccountNumber?: string;
                                }
                              ).bankAccount ||
                                (wallet as unknown as { bankAccountNumber?: string })
                                  .bankAccountNumber}
                            </span>
                          </div>
                          <div className="pt-2">
                            <Label htmlFor="topup-amount">Số tiền</Label>
                            <Input
                              id="topup-amount"
                              inputMode="numeric"
                              value={topUpAmount}
                              onChange={handleAmountChange}
                              placeholder="Nhập số tiền"
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              {parsedAmount > 0
                                ? `Tương đương: ${formatCurrency(parsedAmount, 'VND')}`
                                : 'Nhập số tiền bạn muốn nạp'}
                            </p>
                          </div>
                        </div>
                        <DialogFooter className="mt-4">
                          <Button
                            type="button"
                            onClick={handleTopUp}
                            disabled={walletTopUpMutation.isPending || parsedAmount <= 0}
                          >
                            {walletTopUpMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tạo giao dịch...
                              </>
                            ) : (
                              'Xác nhận nạp tiền'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
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
