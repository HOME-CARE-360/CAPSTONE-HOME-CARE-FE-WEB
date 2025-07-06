'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { EyeOff, Eye, Lock, User, Building2, MapPin, Mail } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2 } from 'lucide-react';
import { OTPType, CompanyType } from '@/lib/api/services/fetchAuth';
import {
  OtpFormValues,
  otpSchema,
  ProviderFormValues,
  providerSchema,
} from '@/schemaValidations/auth.schema';

export function ProviderRegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);
  const { registerProvider, requestOTP, isRequestingOTP } = useAuth();

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
      taxId: '',
      companyType: CompanyType.PARTNERSHIP,
      industry: '',
      address: '',
      description: '',
      terms: false,
    },
    mode: 'onChange',
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const handleVerifyEmail = async () => {
    const emailValue = form.getValues('email');
    const emailError = form.formState.errors.email;

    if (!emailValue || emailError) {
      form.trigger('email');
      return;
    }

    try {
      await requestOTP({
        email: emailValue,
        type: OTPType.REGISTER,
      });
      setShowOTP(true);
      setEmailVerified(true);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      // Don't show OTP input if there's an error
      setShowOTP(false);
      setEmailVerified(false);
    }
  };

  const handleResendOTP = async () => {
    const emailValue = form.getValues('email');
    if (!emailValue) return;

    try {
      setResendingOTP(true);
      await requestOTP({
        email: emailValue,
        type: OTPType.REGISTER,
      });
    } finally {
      setResendingOTP(false);
    }
  };

  const handleRegister = async (data: ProviderFormValues) => {
    const otpValue = otpForm.getValues('otp');
    if (!otpValue || !emailVerified) return;

    try {
      setVerifying(true);
      await registerProvider({
        email: data.email,
        name: data.name,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        taxId: data.taxId,
        companyType: data.companyType,
        industry: data.industry,
        address: data.address,
        description: data.description,
        code: otpValue,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Nhập địa chỉ email"
            className="pl-10"
            {...form.register('email')}
            disabled={emailVerified}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
        {!emailVerified && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleVerifyEmail}
            disabled={isRequestingOTP || !form.getValues('email')}
            className="w-full"
          >
            {isRequestingOTP ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi OTP...
              </>
            ) : (
              'Xác thực Email'
            )}
          </Button>
        )}
      </div>

      {showOTP && (
        <div className="w-full flex flex-col items-center justify-center my-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <Label>Nhập mã OTP đã gửi đến email của bạn</Label>
          <InputOTP
            maxLength={6}
            value={otpForm.watch('otp')}
            onChange={value => otpForm.setValue('otp', value)}
            disabled={verifying}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {otpForm.formState.errors.otp && (
            <p className="text-sm text-destructive">{otpForm.formState.errors.otp.message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResendOTP}
            disabled={resendingOTP}
          >
            {resendingOTP ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Gửi lại OTP
              </>
            ) : (
              'Gửi lại OTP'
            )}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Tên công ty</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            placeholder="Nhập tên công ty"
            className="pl-10"
            {...form.register('name')}
          />
        </div>
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="Nhập số điện thoại"
            className="pl-10"
            {...form.register('phone')}
          />
        </div>
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxId">Mã số thuế</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="taxId"
            placeholder="Nhập mã số thuế"
            className="pl-10"
            {...form.register('taxId')}
          />
        </div>
        {form.formState.errors.taxId && (
          <p className="text-sm text-destructive">{form.formState.errors.taxId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyType">Loại hình công ty</Label>
        <Select
          onValueChange={value => form.setValue('companyType', value as CompanyType)}
          defaultValue={form.getValues('companyType')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại hình công ty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CompanyType.SOLE_PROPRIETORSHIP}>Doanh nghiệp tư nhân</SelectItem>
            <SelectItem value={CompanyType.LIMITED_LIABILITY}>Công ty TNHH</SelectItem>
            <SelectItem value={CompanyType.JOINT_STOCK}>Công ty cổ phần</SelectItem>
            <SelectItem value={CompanyType.PARTNERSHIP}>Công ty hợp danh</SelectItem>
            <SelectItem value={CompanyType.OTHER}>Khác</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.companyType && (
          <p className="text-sm text-destructive">{form.formState.errors.companyType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Ngành nghề</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="industry"
            placeholder="Nhập ngành nghề"
            className="pl-10"
            {...form.register('industry')}
          />
        </div>
        {form.formState.errors.industry && (
          <p className="text-sm text-destructive">{form.formState.errors.industry.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="address"
            placeholder="Nhập địa chỉ"
            className="pl-10"
            {...form.register('address')}
          />
        </div>
        {form.formState.errors.address && (
          <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          placeholder="Mô tả về công ty"
          className="min-h-[80px]"
          {...form.register('description')}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="pl-10"
            {...form.register('password')}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            className="pl-10"
            {...form.register('confirmPassword')}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={form.watch('terms')}
          onCheckedChange={checked => {
            form.setValue('terms', checked === true);
          }}
        />
        <Label htmlFor="terms" className="text-sm">
          Đồng ý với{' '}
          <Link href="/terms" className="text-primary hover:underline">
            điều khoản và điều kiện
          </Link>
        </Label>
      </div>
      {form.formState.errors.terms && (
        <p className="text-sm text-destructive">{form.formState.errors.terms.message}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!form.formState.isValid || !emailVerified || !otpForm.watch('otp') || verifying}
      >
        {verifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng ký...
          </>
        ) : (
          'Đăng ký'
        )}
      </Button>
    </form>
  );
}
