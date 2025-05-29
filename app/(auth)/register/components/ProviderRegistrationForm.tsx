'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { OTPType, CompanyType } from '@/lib/api/services/fetchAuth';

const providerSchema = z
  .object({
    name: z.string().min(2, 'Business name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    taxId: z.string().min(10, 'Tax ID must be at least 10 characters'),
    companyType: z.nativeEnum(CompanyType),
    industry: z.string().min(2, 'Industry must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    terms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const otpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

type ProviderFormValues = z.infer<typeof providerSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export function ProviderRegistrationForm() {
  const { t } = useTranslation('common');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [otpRequested, setOtpRequested] = useState(false);
  const { registerProvider, requestOTP } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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

      toast({
        title: t('register.otp_sent_title'),
        description: t('register.otp_sent_description'),
        variant: 'default',
      });
    } catch (error: unknown) {
      console.error('Provider form - Failed to send OTP:', error);

      // Get the error message with fallbacks
      const typedError = error as { message?: string };
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
      setResendingOTP(false);
    }
  };

  const handleRegister = async (data: ProviderFormValues) => {
    const otpValue = otpForm.getValues('otp');
    if (!otpValue || !email) return;

    try {
      setVerifying(true);
      // Create registration data without 'terms' field
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

      // The registerProvider function now returns a Promise that can be properly awaited
      await registerProvider({
        ...registrationData,
        email: email,
        code: otpValue,
      });

      // If no error was thrown, registration was successful
      toast({
        title: t('register.success_title'),
        description: t('register.provider_success_description'),
        variant: 'default',
      });

      // Small delay before redirecting to ensure toast is shown
      setTimeout(() => {
        router.push('/login');
      }, 500);
    } catch (error: unknown) {
      console.error('Provider - Registration failed:', error);

      // Get error message with fallbacks
      const typedError = error as { message?: string };
      let errorMessage = typedError.message || t('register.provider_error_generic');

      // Handle specific error cases
      if (errorMessage.includes('InvalidOTP') || errorMessage.includes('Error.InvalidOTP')) {
        errorMessage = t('register.invalid_otp');
      }

      toast({
        title: t('register.error_title'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('register.provider.business_name')}</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            placeholder={t('register.provider.business_name_placeholder')}
            className="pl-10"
            {...form.register('name')}
          />
        </div>
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('register.provider.business_phone')}</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder={t('register.phone_placeholder')}
            className="pl-10"
            {...form.register('phone')}
          />
        </div>
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxId">{t('register.provider.tax_id')}</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="taxId"
            placeholder={t('register.provider.tax_id_placeholder')}
            className="pl-10"
            {...form.register('taxId')}
          />
        </div>
        {form.formState.errors.taxId && (
          <p className="text-sm text-destructive">{form.formState.errors.taxId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyType">{t('register.provider.company_type')}</Label>
        <Select
          onValueChange={value => form.setValue('companyType', value as CompanyType)}
          defaultValue={form.getValues('companyType')}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('register.provider.select_company_type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CompanyType.SOLE_PROPRIETORSHIP}>
              {t('register.provider.company_types.sole_proprietorship')}
            </SelectItem>
            <SelectItem value={CompanyType.LIMITED_LIABILITY}>
              {t('register.provider.company_types.limited_liability')}
            </SelectItem>
            <SelectItem value={CompanyType.PARTNERSHIP}>
              {t('register.provider.company_types.partnership')}
            </SelectItem>
            <SelectItem value={CompanyType.OTHER}>
              {t('register.provider.company_types.other')}
            </SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.companyType && (
          <p className="text-sm text-destructive">{form.formState.errors.companyType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">{t('register.provider.industry')}</Label>
        <Input
          id="industry"
          placeholder={t('register.provider.industry_placeholder')}
          {...form.register('industry')}
        />
        {form.formState.errors.industry && (
          <p className="text-sm text-destructive">{form.formState.errors.industry.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{t('register.provider.address')}</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="address"
            placeholder={t('register.provider.address_placeholder')}
            className="pl-10"
            {...form.register('address')}
          />
        </div>
        {form.formState.errors.address && (
          <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('register.provider.description')}</Label>
        <Textarea
          id="description"
          placeholder={t('register.provider.description_placeholder')}
          {...form.register('description')}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('register.password')}</Label>
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
        <Label htmlFor="confirmPassword">{t('register.confirm_password')}</Label>
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
          <Label>{t('register.enter_otp')}</Label>
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
                {t('register.sending_otp')}
              </>
            ) : (
              t('register.resend_otp')
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
          {t('register.terms')}{' '}
          <Link href="/terms" className="text-primary hover:underline">
            {t('register.terms_link')}
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
            {t('register.provider.loading')}
          </>
        ) : showOTP ? (
          t('register.provider.submit')
        ) : (
          t('register.continue')
        )}
      </Button>
    </form>
  );
}
