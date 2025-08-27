'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUpdateProfile, useUserProfile } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Upload, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
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
import { useCreateWithDraw, useGetListWithDraw, useGetDetailWithDraw } from '@/hooks/useFunding';

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

// Withdraw data types - import from the actual service
interface WithdrawItem {
  id: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  processedAt: string | null;
  processedById: number | null;
  note: string | null;
  userId: number;
}

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
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedWithdrawId, setSelectedWithdrawId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const walletTopUpMutation = useWalletTopUp();
  const createWithdrawMutation = useCreateWithDraw();
  const { data: withdrawList, isLoading: isLoadingWithdraws } = useGetListWithDraw();

  // Fetch withdraw detail when needed
  const { data: withdrawDetail, isLoading: isLoadingDetail } = useGetDetailWithDraw(
    selectedWithdrawId || 0,
    { enabled: !!selectedWithdrawId && isDetailOpen }
  );

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setTopUpAmount(digitsOnly);
  };

  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setWithdrawAmount(digitsOnly);
  };

  const parsedAmount = topUpAmount ? Number(topUpAmount) : 0;
  const parsedWithdrawAmount = withdrawAmount ? Number(withdrawAmount) : 0;

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

  const handleWithdraw = async () => {
    try {
      if (!parsedWithdrawAmount || parsedWithdrawAmount < 30000) {
        toast.error('Số tiền rút tối thiểu là 30.000 VND');
        return;
      }

      const currentBalance = wallet?.balance || 0;
      if (parsedWithdrawAmount > currentBalance) {
        toast.error('Số tiền rút không được vượt quá số dư hiện tại');
        return;
      }

      await createWithdrawMutation.mutateAsync({ amount: parsedWithdrawAmount });
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
      // Refresh profile to update wallet balance
      refetch();
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  };

  const handleViewDetail = (withdrawId: number) => {
    setSelectedWithdrawId(withdrawId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedWithdrawId(null);
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
      <Card className="my-10">
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
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="w-full" type="button" onClick={handleOpenTopUp}>
                        Nạp tiền vào ví
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        type="button"
                        onClick={() => {
                          const bankAcc = getWalletBankAccount(wallet);
                          if (!bankAcc) {
                            router.push('/settings/bank');
                            return;
                          }
                          setIsWithdrawOpen(true);
                        }}
                      >
                        Rút tiền
                      </Button>
                    </div>

                    {/* Top Up Dialog */}
                    <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
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

                    {/* Withdraw Dialog */}
                    <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rút tiền từ ví</DialogTitle>
                          <DialogDescription>
                            Vui lòng kiểm tra thông tin ví và nhập số tiền muốn rút.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Số dư hiện tại</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(wallet?.balance || 0, 'VND')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Chủ tài khoản</span>
                            <span className="font-medium">{wallet?.accountHolder}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ngân hàng</span>
                            <span className="font-medium">{wallet?.bankName}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Số tài khoản</span>
                            <span className="font-medium">
                              {(
                                wallet as unknown as {
                                  bankAccount?: string;
                                  bankAccountNumber?: string;
                                }
                              )?.bankAccount ||
                                (wallet as unknown as { bankAccountNumber?: string })
                                  ?.bankAccountNumber}
                            </span>
                          </div>
                          <div className="pt-2">
                            <Label htmlFor="withdraw-amount">Số tiền</Label>
                            <Input
                              id="withdraw-amount"
                              inputMode="numeric"
                              value={
                                withdrawAmount ? Number(withdrawAmount).toLocaleString('vi-VN') : ''
                              }
                              onChange={handleWithdrawAmountChange}
                              placeholder="Nhập số tiền"
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              {parsedWithdrawAmount > 0
                                ? `Tương đương: ${formatCurrency(parsedWithdrawAmount, 'VND')}`
                                : 'Nhập số tiền bạn muốn rút'}
                            </p>
                            {parsedWithdrawAmount > (wallet?.balance || 0) && (
                              <p className="text-xs text-red-500 mt-1">
                                Số tiền rút không được vượt quá số dư hiện tại
                              </p>
                            )}
                            {parsedWithdrawAmount > 0 && parsedWithdrawAmount < 30000 && (
                              <p className="text-xs text-red-500 mt-1">
                                Số tiền rút tối thiểu là 30.000 VND
                              </p>
                            )}
                          </div>
                        </div>
                        <DialogFooter className="mt-4">
                          <Button
                            type="button"
                            onClick={handleWithdraw}
                            disabled={
                              createWithdrawMutation.isPending ||
                              parsedWithdrawAmount < 30000 ||
                              parsedWithdrawAmount > (wallet?.balance || 0)
                            }
                          >
                            {createWithdrawMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              'Xác nhận rút tiền'
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

      {/* Withdraw History */}
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Lịch sử rút tiền</CardTitle>
          <p className="text-sm text-muted-foreground">
            Theo dõi tất cả các giao dịch rút tiền của bạn
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingWithdraws ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải lịch sử rút tiền...</span>
            </div>
          ) : withdrawList && withdrawList.length > 0 ? (
            <div className="space-y-4">
              {withdrawList.map((withdraw: WithdrawItem) => {
                const getStatusConfig = (status: string) => {
                  const statusMap: Record<
                    string,
                    {
                      label: string;
                      variant: 'default' | 'secondary' | 'destructive' | 'outline';
                      icon: React.ComponentType<{ className?: string }>;
                    }
                  > = {
                    PENDING: { label: 'Đang xử lý', variant: 'secondary', icon: Clock },
                    APPROVED: { label: 'Đã duyệt', variant: 'default', icon: CheckCircle },
                    COMPLETED: { label: 'Hoàn thành', variant: 'default', icon: CheckCircle },
                    REJECTED: { label: 'Từ chối', variant: 'destructive', icon: XCircle },
                    CANCELLED: { label: 'Đã hủy', variant: 'outline', icon: XCircle },
                  };
                  return (
                    statusMap[status.toUpperCase()] || {
                      label: status,
                      variant: 'outline' as const,
                      icon: Clock,
                    }
                  );
                };

                const statusConfig = getStatusConfig(withdraw.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={withdraw.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">
                              {formatCurrency(withdraw.amount, 'VND')}
                            </span>
                            <Badge variant={statusConfig.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <p>
                            Yêu cầu:{' '}
                            {format(new Date(withdraw.createdAt), 'dd/MM/yyyy HH:mm', {
                              locale: vi,
                            })}
                          </p>
                          {withdraw.processedAt && (
                            <p>
                              Xử lý:{' '}
                              {format(new Date(withdraw.processedAt), 'dd/MM/yyyy HH:mm', {
                                locale: vi,
                              })}
                            </p>
                          )}
                          {withdraw.note && <p className="mt-1">Ghi chú: {withdraw.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(withdraw.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch rút tiền</h3>
              <p className="text-gray-500">
                Bạn chưa thực hiện giao dịch rút tiền nào. Nhấn &apos;Rút tiền&apos; để tạo yêu cầu
                mới.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={handleCloseDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch rút tiền</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về yêu cầu rút tiền #{selectedWithdrawId}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải chi tiết...</span>
            </div>
          ) : withdrawDetail ? (
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">
                    {formatCurrency(withdrawDetail.amount, 'VND')}
                  </span>
                  <Badge
                    variant={
                      withdrawDetail.status === 'COMPLETED'
                        ? 'default'
                        : withdrawDetail.status === 'PENDING'
                          ? 'secondary'
                          : withdrawDetail.status === 'APPROVED'
                            ? 'default'
                            : 'destructive'
                    }
                    className="gap-1"
                  >
                    {withdrawDetail.status === 'PENDING' && <Clock className="h-3 w-3" />}
                    {(withdrawDetail.status === 'COMPLETED' ||
                      withdrawDetail.status === 'APPROVED') && <CheckCircle className="h-3 w-3" />}
                    {(withdrawDetail.status === 'REJECTED' ||
                      withdrawDetail.status === 'CANCELLED') && <XCircle className="h-3 w-3" />}
                    {withdrawDetail.status === 'PENDING' && 'Đang xử lý'}
                    {withdrawDetail.status === 'APPROVED' && 'Đã duyệt'}
                    {withdrawDetail.status === 'COMPLETED' && 'Hoàn thành'}
                    {withdrawDetail.status === 'REJECTED' && 'Từ chối'}
                    {withdrawDetail.status === 'CANCELLED' && 'Đã hủy'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mã giao dịch</label>
                      <p className="font-medium">#{withdrawDetail.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày yêu cầu</label>
                      <p className="font-medium">
                        {format(new Date(withdrawDetail.createdAt), 'dd/MM/yyyy HH:mm', {
                          locale: vi,
                        })}
                      </p>
                    </div>
                    {withdrawDetail.processedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Ngày xử lý</label>
                        <p className="font-medium">
                          {format(new Date(withdrawDetail.processedAt), 'dd/MM/yyyy HH:mm', {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                      <p className="font-medium">
                        {withdrawDetail.status === 'PENDING' && 'Đang chờ xử lý'}
                        {withdrawDetail.status === 'APPROVED' && 'Đã được duyệt'}
                        {withdrawDetail.status === 'COMPLETED' && 'Đã hoàn thành'}
                        {withdrawDetail.status === 'REJECTED' && 'Đã bị từ chối'}
                        {withdrawDetail.status === 'CANCELLED' && 'Đã bị hủy'}
                      </p>
                    </div>
                    {withdrawDetail.note && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                        <p className="font-medium">{withdrawDetail.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              {withdrawDetail.User && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Thông tin người duyệt</h4>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={withdrawDetail.User.avatar || ''}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-sm font-bold">
                        {getNameFallback(withdrawDetail.User.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <label className="text-gray-500">Họ tên</label>
                          <p className="font-medium">{withdrawDetail.User.name}</p>
                        </div>
                        <div>
                          <label className="text-gray-500">Email</label>
                          <p className="font-medium">{withdrawDetail.User.email}</p>
                        </div>
                        <div>
                          <label className="text-gray-500">Số điện thoại</label>
                          <p className="font-medium">{withdrawDetail.User.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Không thể tải chi tiết giao dịch</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDetail}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
