'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EyeOff, Eye, Lock, User, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useRegisterWithOTP, useRequestOTP } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Registration form schema
const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Tên phải có ít nhất 2 ký tự' }),
    email: z.string().email({ message: 'Email không hợp lệ' }),
    phone: z.string().min(10, { message: 'Số điện thoại phải có ít nhất 10 số' }),
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    confirmPassword: z.string(),
    terms: z.boolean().refine(val => val === true, {
      message: 'Bạn phải đồng ý với điều khoản sử dụng',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpInvalid, setOtpInvalid] = useState(false);

  // Get email and OTP code from query parameters or localStorage
  const email = searchParams.get('email');
  const verified = searchParams.get('verified') === 'true';
  const [otpCode, setOtpCode] = useState(searchParams.get('code') || '');

  // Try to get OTP from localStorage if not in query params
  useEffect(() => {
    if (!otpCode) {
      const storedOTP = localStorage.getItem('otpCode');
      if (storedOTP) setOtpCode(storedOTP);
    }
  }, [otpCode]);

  // Create a form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: email || '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: true,
    },
  });

  // Get stored form data if available
  useEffect(() => {
    const storedData = localStorage.getItem('registerFormData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Pre-fill form with stored data
        Object.keys(parsedData).forEach(key => {
          if (parsedData[key] !== undefined && parsedData[key] !== null) {
            form.setValue(key as keyof RegisterFormValues, parsedData[key]);
          }
        });
      } catch (error) {
        console.error('Error parsing stored form data:', error);
      }
    }
  }, [form]);

  const { register: registerUser, isLoading, error: registerError } = useRegisterWithOTP();

  const { requestOTP, isLoading: isRequestingOTP } = useRequestOTP();

  // Store form data when it changes
  useEffect(() => {
    const subscription = form.watch(data => {
      localStorage.setItem('registerFormData', JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [form, form.watch]);

  // Check if we need to redirect to OTP verification
  useEffect(() => {
    if (!verified || !otpCode) {
      setOtpInvalid(true);
    }
  }, [verified, otpCode]);

  // Handle requesting a new OTP
  const handleRequestNewOTP = () => {
    const currentEmail = form.getValues().email;
    if (!currentEmail) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập địa chỉ email',
        variant: 'destructive',
      });
      return;
    }

    // Store form data before redirecting
    const formData = form.getValues();
    localStorage.setItem('registerFormData', JSON.stringify(formData));

    // Request new OTP and redirect
    requestOTP({
      email: currentEmail,
      type: 'REGISTER',
    });
  };

  // Handle form submission
  const onSubmit = (data: RegisterFormValues) => {
    // Get the latest OTP code - either from query params or localStorage
    const currentOTPCode = searchParams.get('code') || localStorage.getItem('otpCode');

    if (!currentOTPCode) {
      toast({
        title: 'Lỗi xác thực',
        description: 'Không tìm thấy mã OTP. Vui lòng thử lại.',
        variant: 'destructive',
      });
      setOtpInvalid(true);
      return;
    }

    // Register the user with all required fields
    registerUser({
      email: data.email,
      name: data.name,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
      code: currentOTPCode,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl font-bold text-center">Tạo tài khoản</CardTitle>
          <CardDescription className="text-center text-sm">
            {email ? `Hoàn thành đăng ký với email ${email}` : 'Nhập thông tin của bạn'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {otpInvalid && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cần xác thực OTP</AlertTitle>
              <AlertDescription>
                Vui lòng xác thực mã OTP trước khi đăng ký tài khoản.
                <div className="mt-2">
                  <Button
                    onClick={handleRequestNewOTP}
                    variant="outline"
                    size="sm"
                    disabled={isRequestingOTP}
                    className="w-full"
                  >
                    {isRequestingOTP ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      'Yêu cầu mã OTP'
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Email field - readonly if verified */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nguyen.van.a@example.com"
                  className={cn('h-10 pl-10', form.formState.errors.email && 'border-destructive')}
                  readOnly={!!email && verified}
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Full Name field */}
            <div className="space-y-1">
              <Label htmlFor="name">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  className={cn('h-10 pl-10', form.formState.errors.name && 'border-destructive')}
                  {...form.register('name')}
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Phone field */}
            <div className="space-y-1">
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0909 123 456"
                  className={cn('h-10 pl-10', form.formState.errors.phone && 'border-destructive')}
                  {...form.register('phone')}
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={cn(
                    'h-10 pl-10 pr-10',
                    form.formState.errors.password && 'border-destructive'
                  )}
                  {...form.register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-10 w-10 px-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={cn(
                    'h-10 pl-10 pr-10',
                    form.formState.errors.confirmPassword && 'border-destructive'
                  )}
                  {...form.register('confirmPassword')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-10 w-10 px-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  </span>
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Avatar upload */}
            <div className="space-y-3">
              <Label className="text-sm">
                Ảnh đại diện <span className="text-muted-foreground text-xs">(tùy chọn)</span>
              </Label>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                className={form.formState.errors.terms ? 'border-destructive' : ''}
                {...form.register('terms')}
              />
              <Label
                htmlFor="terms"
                className={cn('text-xs', form.formState.errors.terms && 'text-destructive')}
              >
                Tôi đồng ý với{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  điều khoản
                </Link>{' '}
                và{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  chính sách bảo mật
                </Link>
              </Label>
            </div>
            {form.formState.errors.terms && (
              <p className="text-xs text-destructive">{form.formState.errors.terms.message}</p>
            )}

            {/* Error message from API */}
            {registerError && (
              <div className="text-sm text-destructive text-center rounded-md bg-destructive/10 p-2">
                {registerError}
              </div>
            )}

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isLoading || otpInvalid}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                'Tạo tài khoản'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-3 pb-3">
          <div className="text-xs text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
