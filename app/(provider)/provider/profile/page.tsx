'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useUserProfile, useUpdateBankAccount } from '@/hooks/useUser';
import { useCreateWithDraw, useGetListWithDraw } from '@/hooks/useFunding';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Phone,
  Clock,
  Shield,
  Check,
  User as LucideUser,
  Loader2,
  FileImage,
  CreditCard,
  CheckCircle,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBank } from '@/hooks/useBank';
import type { Bank } from '@/lib/api/services/fetchBank';
import { formatDate } from '@/utils/numbers/formatDate';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { LoadingState } from './components/loadingState';
import { ErrorState } from './components/errorState';
import { EmptyState } from './components/emptyState';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [backgroundImage, setBackgroundImage] = useState('');
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [isChangingBackground, setIsChangingBackground] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const savedBackground = localStorage.getItem('userBackgroundImage');
      if (savedBackground) {
        setBackgroundImage(savedBackground);
      }
    }
  }, []);

  const { data: profileResponse, isLoading, error, refetch } = useUserProfile();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Extract user and customer data from the response
  const userData = profileResponse?.data?.user;
  const customerData = profileResponse?.data?.customer;

  // Bank tab form setup
  const bankAccountSchema = z.object({
    bankCode: z.string().min(1, 'Vui lòng chọn ngân hàng'),
    accountNumber: z
      .string()
      .min(1, 'Số tài khoản là bắt buộc')
      .regex(/^\d+$/, 'Số tài khoản chỉ được chứa số')
      .min(8, 'Số tài khoản phải có ít nhất 8 chữ số')
      .max(19, 'Số tài khoản không được vượt quá 19 chữ số'),
  });

  type BankAccountFormData = z.infer<typeof bankAccountSchema>;

  const { data: bankData, isLoading: isBankLoading } = useBank();
  const { mutate: updateBankAccount } = useUpdateBankAccount();
  const { mutate: createWithdraw, isPending: isCreatingWithdraw } = useCreateWithDraw();
  const { isLoading: isWithdrawLoading, error: withdrawError } = useGetListWithDraw();

  const bankForm = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { bankCode: '', accountNumber: '' },
    mode: 'onChange',
  });

  const [isSubmittingBank, setIsSubmittingBank] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredBanks: Bank[] =
    bankData?.data?.filter(bank => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        bank.name.toLowerCase().includes(q) ||
        bank.shortName.toLowerCase().includes(q) ||
        bank.code.toLowerCase().includes(q)
      );
    }) ?? [];

  const handleBankSelect = (bankCode: string) => {
    const bank = filteredBanks.find(b => b.code === bankCode) ?? null;
    setSelectedBank(bank);
    bankForm.setValue('bankCode', bankCode, { shouldValidate: true, shouldDirty: true });
    bankForm.clearErrors('bankCode');
  };

  const handleSubmitBank = (data: BankAccountFormData) => {
    setIsSubmittingBank(true);
    updateBankAccount(
      { bankCode: data.bankCode, accountNumber: data.accountNumber },
      {
        onSuccess: () => {
          toast.success('Cập nhật thông tin tài khoản ngân hàng thành công!');
          bankForm.reset();
          setSelectedBank(null);
          setSearchTerm('');
        },
        onSettled: () => setIsSubmittingBank(false),
      }
    );
  };

  const formatAccountNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccountNumber(e.target.value);
    bankForm.setValue('accountNumber', formatted.replace(/\s/g, ''));
    e.target.value = formatted;
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatarFile', file);
    if (userData) {
      formData.append('userName', userData.name);
      formData.append('fullName', userData.name);
      formData.append('email', userData.email);
      if (userData.phone) {
        formData.append('phoneNumber', userData.phone);
      }
      if (customerData?.address) {
        formData.append('about', customerData.address);
      }
      if (customerData?.dateOfBirth) {
        formData.append('birthDate', customerData.dateOfBirth);
      }
      if (userData.status) {
        formData.append('status', userData.status);
      }
      formData.append('role', 'PROVIDER');
    }
    // TODO: Implement updateProfile mutation
    setIsUploadingAvatar(false);
    toast.success('Avatar updated successfully');
  };

  const handleBackgroundClick = () => {
    backgroundInputRef.current?.click();
  };

  const handleBackgroundChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsChangingBackground(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBackgroundImage(base64String);
        localStorage.setItem('userBackgroundImage', base64String);
        setIsChangingBackground(false);
        toast.success('Background updated');
      };
      reader.onerror = () => {
        setIsChangingBackground(false);
        toast.error('Failed to update background image. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to update background:', error);
      setIsChangingBackground(false);
      toast.error('Failed to update background image. Please try again.');
    }
  };

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} error={error} />;
  }

  if (!profileResponse || !userData) {
    return (
      <EmptyState
        apiResponse={{
          status: false,
          code: 404,
          message: 'No profile data',
        }}
      />
    );
  }

  return (
    <>
      <div className="w-full min-h-screen">
        {/* Profile Header with Background Image */}
        <div
          className="relative bg-cover bg-center h-full md:h-[550px]"
          style={{
            backgroundImage: `url('${
              backgroundImage ||
              'https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80'
            }')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/95"></div>

          <input
            type="file"
            ref={backgroundInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleBackgroundChange}
            disabled={isChangingBackground}
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 shadow-lg z-10"
            onClick={handleBackgroundClick}
            disabled={isChangingBackground}
          >
            {isChangingBackground ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileImage className="h-4 w-4 mr-2" />
            )}
            Change Cover
          </Button>

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-end gap-4">
              <div className="relative mb-[-1rem] md:mb-[-2rem]">
                <input
                  type="file"
                  ref={avatarInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={userData.avatar || ''} />
                    <AvatarFallback className="text-4xl bg-primary/10">
                      {userData.name ? (
                        userData.name.substring(0, 2).toUpperCase()
                      ) : (
                        <LucideUser className="h-12 w-12" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="flex-1 text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-muted-foreground">
                  {userData.name}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">@{userData.name}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="px-2 py-1">
                    <Check className="h-3 w-3 mr-1" /> {userData.status}
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 bg-background/30 backdrop-blur-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Provider
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 bg-background/30 backdrop-blur-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    Joined {userData.createdAt ? new Date(userData.createdAt).getFullYear() : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-background w-full">
          <div className="max-w-screen-2xl mx-auto px-4 py-6">
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b mb-6">
                <TabsList className="bg-transparent justify-start">
                  <TabsTrigger
                    value="overview"
                    className={`px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all ${
                      activeTab === 'overview'
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Tổng quan
                  </TabsTrigger>
                  <TabsTrigger
                    value="bank"
                    className={`px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all ${
                      activeTab === 'bank' ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    Ngân hàng
                  </TabsTrigger>
                  <TabsTrigger
                    value="funding"
                    className={`px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all ${
                      activeTab === 'funding' ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    Rút tiền
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="mt-0">
                {/* Profile Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-primary" />
                        Thông tin liên lạc
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{userData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{userData.phone || 'Not provided'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        Thông tin công ty
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Birthdate{' '}
                            {customerData?.dateOfBirth
                              ? formatDate(customerData.dateOfBirth)
                              : 'Không cung cấp'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Member Since {formatDate(userData.createdAt || '')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}

                  {/* <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-primary" />
                        Account Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Status {userData.status || 'Active'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Role Provider</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}

                  <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-primary" />
                        Ví thanh toán
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {userData.wallet ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Số dư</span>
                            <span className="font-semibold">
                              {formatCurrency(userData.wallet.balance)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Ngân hàng</span>
                            <span className="font-medium">{userData.wallet.bankName}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Chủ tài khoản</span>
                            <span className="font-medium">{userData.wallet.accountHolder}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Số tài khoản</span>
                            <span className="font-mono">{userData.wallet.bankAccount}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Cập nhật</span>
                            <span>{formatDate(userData.wallet.updatedAt)}</span>
                          </div>
                          <Button className="mt-3 w-full" onClick={() => setIsWithdrawOpen(true)}>
                            Yêu cầu rút tiền
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Chưa liên kết ví thanh toán
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="funding" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-primary" />
                        Danh sách yêu cầu rút tiền
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
                      {isWithdrawLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ) : withdrawError ? (
                        <div>Lỗi tải danh sách rút tiền</div>
                      ) : (
                        <>
                          <p>- TODO: Hiển thị danh sách yêu cầu rút tiền gần đây</p>
                          <p>- TODO: Bộ lọc theo trạng thái và thời gian</p>
                          <p>- TODO: Xem chi tiết yêu cầu rút tiền</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="bank" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-primary" />
                        Liên kết tài khoản ngân hàng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">
                      <form
                        onSubmit={bankForm.handleSubmit(handleSubmitBank)}
                        className="space-y-6"
                        noValidate
                      >
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="bank-search">Tìm kiếm ngân hàng</Label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="bank-search"
                                placeholder="Tìm kiếm ngân hàng..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <Label>Chọn ngân hàng</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-md p-3">
                            {isBankLoading ? (
                              Array.from({ length: 8 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 p-3 border rounded-md"
                                >
                                  <Skeleton className="h-8 w-8 rounded-full" />
                                  <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                  </div>
                                </div>
                              ))
                            ) : filteredBanks.length > 0 ? (
                              filteredBanks.map(bank => (
                                <button
                                  key={bank.code}
                                  type="button"
                                  onClick={() => handleBankSelect(bank.code)}
                                  className={`flex items-center gap-3 p-3 border rounded-md text-left transition-all hover:bg-accent ${
                                    selectedBank?.code === bank.code
                                      ? 'border-primary bg-primary/5'
                                      : 'hover:border-primary/50'
                                  }`}
                                >
                                  <div className="relative">
                                    {bank.logo ? (
                                      <Image
                                        src={bank.logo}
                                        alt={bank.name}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                        style={{ width: 32, height: 'auto' }}
                                        unoptimized
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                      </div>
                                    )}
                                    {/* {bank.transferSupported === 1 && (
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </Badge>
                              )} */}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{bank.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {bank.shortName}
                                    </p>
                                  </div>
                                  {selectedBank?.code === bank.code && (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                Không tìm thấy ngân hàng phù hợp
                              </div>
                            )}
                          </div>
                          {bankForm.formState.errors.bankCode && (
                            <p className="text-sm text-destructive">
                              {bankForm.formState.errors.bankCode.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="accountNumber">Số tài khoản</Label>
                          <Input
                            id="accountNumber"
                            placeholder="Nhập số tài khoản ngân hàng"
                            inputMode="numeric"
                            onChange={handleAccountNumberChange}
                            className="font-mono text-lg tracking-wider"
                            maxLength={23}
                          />
                          {bankForm.formState.errors.accountNumber && (
                            <p className="text-sm text-destructive">
                              {bankForm.formState.errors.accountNumber.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Số tài khoản phải có từ 8-19 chữ số
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmittingBank || !selectedBank}
                        >
                          {isSubmittingBank ? 'Đang cập nhật...' : 'Cập nhật tài khoản ngân hàng'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {selectedBank && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Ngân hàng đã chọn</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          {selectedBank.logo ? (
                            <Image
                              src={selectedBank.logo}
                              alt={selectedBank.name}
                              width={48}
                              height={48}
                              className="rounded-full"
                              unoptimized
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{selectedBank.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedBank.shortName}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Mã ngân hàng:</span>
                            <span className="font-mono">{selectedBank.code}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Hỗ trợ chuyển khoản:</span>
                            <Badge
                              variant={
                                selectedBank.transferSupported === 1 ? 'default' : 'secondary'
                              }
                            >
                              {selectedBank.transferSupported === 1 ? 'Có' : 'Không'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border border-border/30 shadow-sm">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium">Bảo mật thông tin</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2 text-sm text-muted-foreground">
                      <p>Thông tin được mã hóa và chỉ sử dụng cho mục đích thanh toán.</p>
                      <p>Vui lòng đảm bảo số tài khoản chính xác trước khi xác nhận.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu rút tiền</DialogTitle>
          </DialogHeader>
          {userData.wallet ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Ngân hàng</Label>
                <Input value={userData.wallet.bankName} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Chủ tài khoản</Label>
                <Input value={userData.wallet.accountHolder} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Số tài khoản</Label>
                <Input value={userData.wallet.bankAccount} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Số dư khả dụng</Label>
                <Input value={formatCurrency(userData.wallet.balance)} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Số tiền rút</Label>
                <Input
                  inputMode="numeric"
                  placeholder="Nhập số tiền"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <p className="text-xs text-muted-foreground">
                  Số tiền không được vượt quá số dư khả dụng.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Vui lòng liên kết tài khoản ngân hàng trong tab Ngân hàng trước khi rút tiền.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
              Hủy
            </Button>
            <Button
              disabled={
                !userData.wallet ||
                isCreatingWithdraw ||
                !withdrawAmount ||
                Number(withdrawAmount) <= 0 ||
                Number(withdrawAmount) > (userData.wallet?.balance ?? 0)
              }
              onClick={() => {
                const amount = Number(withdrawAmount);
                if (!Number.isFinite(amount) || amount <= 0) return;
                createWithdraw(
                  { amount },
                  {
                    onSuccess: () => {
                      setIsWithdrawOpen(false);
                      setWithdrawAmount('');
                    },
                  }
                );
              }}
            >
              {isCreatingWithdraw ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi yêu cầu
                </span>
              ) : (
                'Xác nhận rút tiền'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
