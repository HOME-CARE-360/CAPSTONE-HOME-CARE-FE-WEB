'use client';

import { useState } from 'react';
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
import { useRequestOTP } from '@/hooks/useAuth';
import { OTPVerifyRequest } from '@/lib/api/services/fetchAuth';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

// Schema for email input form
const emailSchema = z.object({
  email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ' }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function RegisterEmailPage() {
  const { requestOTP, isLoading: isRequestingOTP } = useRequestOTP();

  // Check if we have any stored form data
  useState(() => {
    // Clear any stored OTP
    localStorage.removeItem('otpCode');
  });

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handler for requesting OTP
  const handleRequestOTP = (data: EmailFormValues) => {
    // Store email in form data
    localStorage.setItem('registerFormData', JSON.stringify({ email: data.email }));

    const payload: OTPVerifyRequest = {
      email: data.email,
      type: 'REGISTER',
    };
    requestOTP(payload);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Tạo tài khoản</CardTitle>
          <CardDescription className="text-center">
            Nhập email của bạn để bắt đầu quá trình đăng ký
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
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
                    Tiếp tục
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col border-t pt-4">
          <div className="text-xs text-muted-foreground text-center">
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
