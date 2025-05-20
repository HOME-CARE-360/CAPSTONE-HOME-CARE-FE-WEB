'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

import { useToast } from '@/hooks/useToast';
import { useRequestOTP } from '@/hooks/useAuth';
import { OTPVerifyRequest } from '@/lib/api/services/fetchAuth';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

// Schema for email input form
const emailSchema = z.object({
  email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ' }),
});

// Schema for OTP input form
const otpSchema = z.object({
  otp: z.string().length(6, { message: 'Mã OTP phải có 6 chữ số' }),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export default function OTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const {
    requestOTP,
    isLoading: isRequestingOTP,
    isSuccess: isOTPRequested,
    email: otpEmail,
  } = useRequestOTP();

  // Check if email is passed in query params
  const paramEmail = searchParams.get('email');
  const type = (searchParams.get('type') as 'REGISTER' | 'RESET_PASSWORD') || 'REGISTER';

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: paramEmail || '',
    },
  });

  // OTP form
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Handler for requesting OTP
  const handleRequestOTP = useCallback(
    (data: EmailFormValues) => {
      const payload: OTPVerifyRequest = {
        email: data.email,
        type: type,
      };
      requestOTP(payload);
    },
    [type, requestOTP]
  );

  // If email is passed in query params, auto-send OTP
  useEffect(() => {
    if (paramEmail && !otpSent && !isRequestingOTP) {
      handleRequestOTP({ email: paramEmail });
      setOtpSent(true);
    }
  }, [paramEmail, otpSent, isRequestingOTP, handleRequestOTP]);

  // Effect to show OTP form after successful OTP request
  useEffect(() => {
    if (isOTPRequested) {
      setOtpSent(true);
      // Start countdown for resend button (60 seconds)
      setCountdown(60);
    }
  }, [isOTPRequested]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Handler for verifying OTP
  const handleVerifyOTP = async (data: OtpFormValues) => {
    const email = otpEmail || emailForm.getValues().email;

    setVerifying(true);
    setVerifyError(null);

    try {
      // Store the OTP code in local storage for the registration form
      localStorage.setItem('otpCode', data.otp);

      // Show success toast
      toast({
        title: 'Xác thực thành công',
        description: 'Mã OTP hợp lệ, đang chuyển hướng đến trang đăng ký',
      });

      // Navigate to registration page with verified status
      router.push(`/register?email=${encodeURIComponent(email)}&verified=true&code=${data.otp}`);
    } catch (error) {
      setVerifyError('Đã xảy ra lỗi khi xác thực mã OTP. Vui lòng thử lại.');
      console.error('OTP verification error:', error);
    } finally {
      setVerifying(false);
    }
  };

  // Handler for resending OTP
  const handleResendOTP = () => {
    const email = otpEmail || emailForm.getValues().email;
    if (!email) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập địa chỉ email',
        variant: 'destructive',
      });
      return;
    }

    handleRequestOTP({ email });
    // Reset the form to clear any previous errors
    otpForm.reset({ otp: '' });
    setVerifyError(null);
  };

  // Handler for changing email
  const handleChangeEmail = () => {
    setOtpSent(false);
    // Reset the OTP form
    otpForm.reset({ otp: '' });
    setVerifyError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Xác thực tài khoản</CardTitle>
          <CardDescription className="text-center">
            {!otpSent
              ? 'Nhập địa chỉ email của bạn để nhận mã OTP'
              : 'Nhập mã OTP đã được gửi đến email của bạn'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!otpSent ? (
            // Email input form
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleRequestOTP)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="nguyen.van.a@example.com"
                            className="h-10 pl-10"
                            {...field}
                            disabled={isRequestingOTP}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isRequestingOTP}>
                  {isRequestingOTP ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      Gửi mã OTP
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            // OTP verification form
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Chúng tôi đã gửi mã xác thực đến</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="font-medium">{otpEmail || emailForm.getValues().email}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleChangeEmail}
                      className="h-6 px-2 text-xs"
                      disabled={verifying || isRequestingOTP}
                    >
                      Thay đổi
                    </Button>
                  </div>
                </div>

                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center space-y-3">
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={verifying}
                        >
                          <InputOTPGroup className="gap-2 sm:gap-3">
                            <InputOTPSlot index={0} className="h-12 w-12 sm:h-14 sm:w-14" />
                            <InputOTPSlot index={1} className="h-12 w-12 sm:h-14 sm:w-14" />
                            <InputOTPSlot index={2} className="h-12 w-12 sm:h-14 sm:w-14" />
                            <InputOTPSlot index={3} className="h-12 w-12 sm:h-14 sm:w-14" />
                            <InputOTPSlot index={4} className="h-12 w-12 sm:h-14 sm:w-14" />
                            <InputOTPSlot index={5} className="h-12 w-12 sm:h-14 sm:w-14" />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {verifyError && (
                  <div className="text-sm text-destructive text-center rounded-md bg-destructive/10 p-2">
                    {verifyError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isRequestingOTP || verifying || countdown > 0}
                    className="sm:flex-1"
                  >
                    {isRequestingOTP ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {countdown > 0 ? `Gửi lại sau (${countdown}s)` : 'Gửi lại mã'}
                  </Button>

                  <Button
                    type="submit"
                    disabled={verifying || otpForm.getValues().otp.length !== 6}
                    className="sm:flex-1"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      'Xác thực'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col border-t pt-4">
          <div className="text-xs text-muted-foreground text-center">
            Quay lại{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
