'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDescription } from '@/components/ui/alert';
import { useBank } from '@/hooks/useBank';
import { useUpdateBankAccount } from '@/hooks/useUser';
import { Bank } from '@/lib/api/services/fetchBank';
import { UpdateBankAccountRequest } from '@/lib/api/services/fetchUser';
import { Search, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

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

export default function BankAccountPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: bankData, isLoading: isBankLoading, error: bankError } = useBank();
  const { mutate: updateBankAccount } = useUpdateBankAccount();

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankCode: '',
      accountNumber: '',
    },
  });

  // Filter banks based on search term
  const filteredBanks =
    bankData?.data?.filter(
      bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.code.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleBankSelect = (bankCode: string) => {
    const bank = bankData?.data?.find(b => b.code === bankCode);
    setSelectedBank(bank || null);
    form.setValue('bankCode', bankCode);
    form.clearErrors('bankCode');
  };

  const handleSubmit = (data: BankAccountFormData) => {
    setIsSubmitting(true);

    const bankAccountData: UpdateBankAccountRequest = {
      bankCode: data.bankCode,
      accountNumber: data.accountNumber,
    };

    updateBankAccount(bankAccountData, {
      onSuccess: () => {
        toast.success('Cập nhật thông tin tài khoản ngân hàng thành công!');
        form.reset();
        setSelectedBank(null);
        setSearchTerm('');
      },
      onError: () => {
        toast.error('Cập nhật thông tin tài khoản thất bại. Vui lòng thử lại!');
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  const formatAccountNumber = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Format with spaces every 4 digits
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccountNumber(e.target.value);
    form.setValue('accountNumber', formatted.replace(/\s/g, ''));
    e.target.value = formatted;
  };

  if (bankError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Lỗi tải danh sách ngân hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDescription>
              Không thể tải danh sách ngân hàng. Vui lòng thử lại sau.
            </AlertDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tài khoản ngân hàng</h1>
        <p className="text-muted-foreground">
          Cập nhật thông tin tài khoản ngân hàng để nhận thanh toán từ dịch vụ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thông tin tài khoản ngân hàng
              </CardTitle>
              <CardDescription>Chọn ngân hàng và nhập số tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Bank Selection */}
                <div className="space-y-4">
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

                  {/* Bank List */}
                  <div className="space-y-2">
                    <Label>Chọn ngân hàng</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-md p-3">
                      {isBankLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
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
                    {form.formState.errors.bankCode && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.bankCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Account Number */}
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Số tài khoản</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Nhập số tài khoản ngân hàng"
                    onChange={handleAccountNumberChange}
                    className="font-mono text-lg tracking-wider"
                    maxLength={23} // 19 digits + 4 spaces
                  />
                  {form.formState.errors.accountNumber && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.accountNumber.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Số tài khoản phải có từ 8-19 chữ số
                  </p>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isSubmitting || !selectedBank}>
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật tài khoản ngân hàng'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          {/* Selected Bank Info */}
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
                    <p className="text-sm text-muted-foreground">{selectedBank.shortName}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mã ngân hàng:</span>
                    <span className="font-mono">{selectedBank.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hỗ trợ chuyển khoản:</span>
                    <Badge variant={selectedBank.transferSupported === 1 ? 'default' : 'secondary'}>
                      {selectedBank.transferSupported === 1 ? 'Có' : 'Không'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Bảo mật thông tin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Thông tin được mã hóa và bảo mật</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Chỉ sử dụng cho mục đích thanh toán</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Tuân thủ quy định bảo mật ngân hàng</p>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hướng dẫn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Cách tìm ngân hàng:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Gõ tên ngân hàng hoặc mã ngân hàng</li>
                  <li>• Chọn ngân hàng từ danh sách</li>
                  <li>• Nhập số tài khoản chính xác</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
