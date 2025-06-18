'use client';

import { useState, useEffect } from 'react';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail } from 'lucide-react';

import { useGoogleLogin } from '@/hooks/useAuth';

// Schema for login form
const loginSchema = z.object({
  email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useLogin();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const router = useRouter();
  const { t } = useTranslation('common');
  const { data: googleLoginData } = useGoogleLogin();

  // Form initialization
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Handle redirect when authenticated using useEffect instead of during render
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Clear errors when form values change
  useEffect(() => {
    const subscription = form.watch(() => clearError());
    return () => subscription.unsubscribe();
  }, [form, clearError]);

  // Return null early if authenticated, but let the redirect happen in useEffect
  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (data: LoginFormValues) => {
    await login({
      email: data.email,
      password: data.password,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = () => {
    if (googleLoginData) {
      window.location.href = googleLoginData.url;
      console.log('googleLoginData', googleLoginData);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('login.title')}</CardTitle>
          <CardDescription className="text-center">{t('login.description')}</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.email')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t('login.email_placeholder')}
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
                      <FormLabel>{t('login.password')}</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {t('login.forgot_password')}
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('login.password_placeholder')}
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
                            {showPassword ? t('login.hide_password') : t('login.show_password')}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        {t('login.remember_me')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm text-destructive text-center rounded-md bg-destructive/10 p-2">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('login.loading') : t('login.submit')}
              </Button>
            </CardContent>
          </form>
        </Form>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <p className="px-6 text-center text-sm text-muted-foreground">
            {t('login.no_account')}{' '}
            <Link
              href="/register/email"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t('login.create_account')}
            </Link>
          </p>
          <button className="google-login-button" onClick={() => handleGoogleLogin()}>
            Đăng nhập với Google
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
