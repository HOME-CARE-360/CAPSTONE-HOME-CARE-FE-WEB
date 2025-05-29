'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

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
import { OTPType, OTPVerifyRequest } from '@/lib/api/services/fetchAuth';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ' }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function RegisterEmailPage() {
  const { requestOTP, isLoading: isRequestingOTP } = useRequestOTP();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation('common');

  useEffect(() => {
    localStorage.removeItem('otpCode');
    localStorage.removeItem('registerFormData');
  }, []);

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handler for requesting OTP
  const handleRequestOTP = async (data: EmailFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      localStorage.setItem('registerFormData', JSON.stringify({ email: data.email }));

      const payload: OTPVerifyRequest = {
        email: data.email,
        type: OTPType.REGISTER,
      };
      // Call the requestOTP function and await its result
      await requestOTP(payload);

      // Show success toast and redirect
      toast({
        title: t('register.otp_sent_title'),
        description: t('register.otp_sent_description'),
        variant: 'default',
      });

      // Small delay before redirecting to ensure toast is shown
      setTimeout(() => {
        router.push('/register');
      }, 500);
    } catch (error: unknown) {
      console.error('OTP request failed:', error);

      // Type assertion for the error
      const typedError = error as {
        status?: number;
        originalError?: { status: number };
        message?: string;
      };

      // Special case: if the error contains a success status, treat it as a success
      if (
        typedError.status === 201 ||
        typedError.status === 200 ||
        (typedError.originalError &&
          (typedError.originalError.status === 201 || typedError.originalError.status === 200))
      ) {
        toast({
          title: t('register.otp_sent_title'),
          description: t('register.otp_sent_description'),
          variant: 'default',
        });

        // Small delay before redirecting to ensure toast is shown
        setTimeout(() => {
          router.push('/register');
        }, 500);

        return;
      }

      // Get the error message with fallbacks
      let errorMessage = typedError.message || t('register.otp_error_generic');

      // Handle specific error cases
      if (
        errorMessage.includes('EmailAlreadyExists') ||
        errorMessage.includes('Error.EmailAlreadyExists')
      ) {
        errorMessage = t('register.email_already_exists');
      }

      toast({
        title: t('register.otp_error_title'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('register.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('register.email_step_description')}
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
                    <FormLabel>{t('register.email')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t('register.email_placeholder')}
                          className="h-10 pl-10"
                          {...field}
                          disabled={isRequestingOTP || isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isRequestingOTP || isSubmitting}>
                {isRequestingOTP || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('register.sending_otp')}
                  </>
                ) : (
                  <>
                    {t('register.continue')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col border-t pt-4">
          <div className="text-xs text-muted-foreground text-center">
            {t('register.have_account')}{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t('register.login_link')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
