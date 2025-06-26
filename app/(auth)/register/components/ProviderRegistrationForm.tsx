'use client';

import { useState, useEffect } from 'react';
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
import { EyeOff, Eye, Lock, User, Building2, MapPin } from 'lucide-react';
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
  const [isFormValid, setIsFormValid] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [otpRequested, setOtpRequested] = useState(false);
  const { registerProvider, requestOTP } = useAuth();

  // Get email from localStorage on component mount
  useEffect(() => {
    try {
      const formData = localStorage.getItem('registerFormData');
      if (formData) {
        const parsedData = JSON.parse(formData);
        if (parsedData.email) {
          setEmail(parsedData.email);
          // Show OTP form directly since we already have the email
          setShowOTP(true);
          setOtpRequested(true);
        }
      }
    } catch (error) {
      console.error('Failed to get email from localStorage:', error);
    }
  }, []);

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
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

  // Update form validity whenever values change
  const validateForm = () => {
    const isValid = form.formState.isValid && !form.formState.errors.root;
    setIsFormValid(isValid);
  };

  form.watch(() => validateForm());

  const handleContinue = () => {
    if (!isFormValid || !email) return;

    // Don't make an API call - just show the OTP form
    setShowOTP(true);
    setOtpRequested(true);
  };

  const handleResendOTP = async () => {
    if (!email || resendingOTP) return;

    try {
      setResendingOTP(true);

      await requestOTP({
        email: email,
        type: OTPType.REGISTER,
      });
    } finally {
      setResendingOTP(false);
    }
  };

  const handleRegister = async (data: ProviderFormValues) => {
    const otpValue = otpForm.getValues('otp');
    if (!otpValue || !email) return;

    try {
      setVerifying(true);
      const registrationData = {
        name: data.name,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        taxId: data.taxId,
        companyType: data.companyType,
        industry: data.industry,
        address: data.address,
        description: data.description,
      };

      await registerProvider({
        ...registrationData,
        email: email,
        code: otpValue,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
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
            <SelectItem value={CompanyType.SOLE_PROPRIETORSHIP}>Công ty riêng lẻ</SelectItem>
            <SelectItem value={CompanyType.LIMITED_LIABILITY}>Công ty hợp danh</SelectItem>
            <SelectItem value={CompanyType.PARTNERSHIP}>Công ty cổ phần</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.companyType && (
          <p className="text-sm text-destructive">{form.formState.errors.companyType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Ngành nghề</Label>
        <Input id="industry" placeholder="Nhập ngành nghề" {...form.register('industry')} />
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
        <Textarea id="description" placeholder="Nhập mô tả" {...form.register('description')} />
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

      {showOTP && (
        <div className="w-full flex flex-col items-center justify-center my-4 gap-4">
          <Label>Nhập mã OTP</Label>
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
            className="mt-2"
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
        type={showOTP ? 'submit' : 'button'}
        className="w-full"
        disabled={!isFormValid || verifying || !email || (showOTP ? false : otpRequested)}
        onClick={showOTP ? undefined : handleContinue}
      >
        {verifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý...
          </>
        ) : showOTP ? (
          'Đăng ký'
        ) : (
          'Tiếp tục'
        )}
      </Button>
    </form>
  );
}
