'use client';

import { useState } from 'react';
import { useLogin, useGoogleLogin } from '@/hooks/useAuth';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { LoginFormValues, loginSchema } from '@/schemaValidations/auth.schema';
import Image from 'next/image';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useLogin();
  const { loginWithGoogle, isLoading: isGoogleLoading } = useGoogleLogin();
  // Form initialization
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await login({
      email: data.email,
      password: data.password,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Link href="/">
        <div className="flex w-full justify-center pb-2">
          <Image src="/images/logo.png" alt="HomeCare logo" width={100} height={100} />
        </div>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Đăng nhập vào HomeCare 360
          </CardTitle>
          <CardDescription className="text-center">
            Vui lòng nhập email và mật khẩu để đăng nhập
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Nhập email của bạn"
                          className="pl-10"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Mật khẩu</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                        tabIndex={-1}
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Nhập mật khẩu"
                          className="pl-10"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8"
                          onClick={togglePasswordVisibility}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang tải...' : 'Đăng nhập'}
              </Button>
              <div className="relative flex items-center py-2">
                <span className="flex-grow border-t border-muted-foreground/20" />
                <span className="mx-4 text-xs text-muted-foreground">hoặc</span>
                <span className="flex-grow border-t border-muted-foreground/20" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={loginWithGoogle}
                disabled={isGoogleLoading}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_17_40)">
                    <path
                      d="M47.532 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.02h13.02c-.528 2.848-2.12 5.26-4.52 6.88v5.68h7.32c4.28-3.94 6.73-9.74 6.73-16.876z"
                      fill="#4285F4"
                    />
                    <path
                      d="M24.48 48c6.12 0 11.26-2.04 15.01-5.54l-7.32-5.68c-2.04 1.36-4.66 2.18-7.69 2.18-5.92 0-10.94-4-12.74-9.36H4.24v5.84C7.98 43.98 15.62 48 24.48 48z"
                      fill="#34A853"
                    />
                    <path
                      d="M11.74 29.6c-.48-1.36-.76-2.8-.76-4.28s.28-2.92.76-4.28v-5.84H4.24A23.98 23.98 0 0 0 0 24.32c0 3.92.94 7.64 2.6 10.92l7.14-5.64z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M24.48 9.52c3.34 0 6.32 1.14 8.68 3.38l6.48-6.48C35.74 2.18 30.6 0 24.48 0 15.62 0 7.98 4.02 4.24 10.16l7.5 5.84c1.8-5.36 6.82-9.36 12.74-9.36z"
                      fill="#EA4335"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_17_40">
                      <path fill="#fff" d="M0 0h48v48H0z" />
                    </clipPath>
                  </defs>
                </svg>
                {isGoogleLoading ? 'Đang chuyển hướng...' : 'Đăng nhập với Google'}
              </Button>
            </CardContent>
          </form>
        </Form>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <p className="px-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              Tạo tài khoản
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}
