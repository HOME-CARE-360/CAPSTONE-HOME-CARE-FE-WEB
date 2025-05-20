import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { setCookie, deleteCookie } from 'cookies-next';
import fetchAuth, {
  LoginCredentials,
  OTPVerifyRequest,
  OTPVerifyResponse,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
} from '@/lib/api/services/fetchAuth';

// OTP request hook
export function useRequestOTP() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    mutate: requestOTP,
    isPending: isLoading,
    error: otpError,
    isSuccess,
  } = useMutation({
    mutationFn: (data: OTPVerifyRequest) => fetchAuth.verifyEmailWithOTP(data),
    onSuccess: (response: OTPVerifyResponse, variables) => {
      setEmail(variables.email);
      toast({
        title: 'OTP Sent',
        description: response.message || 'OTP has been sent to your email',
      });
      // Redirect to OTP verification page with email
      router.push(`/otp?email=${encodeURIComponent(variables.email)}&type=${variables.type}`);
    },
    onError: (error: Error) => {
      console.error('OTP request failed:', error);
      setError(error.message || 'Failed to send OTP');
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    },
  });

  return {
    requestOTP,
    isLoading,
    isSuccess,
    email,
    error: error || otpError?.message || null,
    clearError: () => setError(null),
  };
}

// Register with OTP hook
export function useRegisterWithOTP() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    mutate: register,
    isPending: isLoading,
    error: registerError,
    isSuccess,
  } = useMutation({
    mutationFn: (data: RegisterRequest) => fetchAuth.register(data),
    onSuccess: () => {
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully',
      });
      // Clean up any stored form data
      localStorage.removeItem('registerFormData');
      localStorage.removeItem('otpCode');

      router.push('/login');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Registration failed';

      if (
        (error as unknown as RegisterResponse).statusCode === 422 &&
        (error as unknown as RegisterResponse).message?.[0]?.message === 'Error.OTPExpired'
      ) {
        setError('OTP has expired. Please request a new OTP.');
        toast({
          title: 'OTP Expired',
          description: 'Your OTP has expired. Please request a new one.',
          variant: 'destructive',
        });
        router.push('/register/email');
      } else {
        setError(errorMessage);
        toast({
          title: 'Registration Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
  });

  return {
    register,
    isLoading,
    isSuccess,
    error: error || registerError?.message || null,
    clearError: () => setError(null),
  };
}

// Login hook
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const {
    mutate: login,
    isPending: isLoading,
    error: loginError,
  } = useMutation({
    mutationFn: (credentials: LoginCredentials) => fetchAuth.login(credentials),
    onSuccess: (response: LoginResponse) => {
      if (response.data) {
        // Store token in both zustand store and cookies for middleware
        const token = response.data.accessToken;
        setToken(token);
        setCookie('auth-token', token, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        queryClient.invalidateQueries({ queryKey: ['auth', 'login'] });
        router.push('/');
      } else {
        setError(response.message || 'Login failed');
      }
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed');
    },
  });

  return {
    login,
    isLoading,
    error: error || loginError?.message || null,
    clearError: () => setError(null),
  };
}

// Main auth hook that combines functionality
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout: storeLogout, token, isAuthenticated } = useAuthStore();
  const loginHook = useLogin();
  const requestOTPHook = useRequestOTP();
  const registerWithOTPHook = useRegisterWithOTP();
  const { toast } = useToast();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: () => fetchAuth.logout(),
    onSuccess: () => {
      // Clear both zustand store and cookies
      storeLogout();
      deleteCookie('auth-token', { path: '/' });
      localStorage.removeItem('registerFormData');
      localStorage.removeItem('otpCode');

      queryClient.clear(); // Clear all queries
      router.push('/login');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
      // Still logout locally even if API call fails
      storeLogout();
      deleteCookie('auth-token', { path: '/' });
      localStorage.removeItem('registerFormData');
      localStorage.removeItem('otpCode');

      router.push('/login');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
        variant: 'default',
      });
    },
  });

  return {
    token,
    isAuthenticated,
    isLoading:
      loginHook.isLoading ||
      isLoggingOut ||
      requestOTPHook.isLoading ||
      registerWithOTPHook.isLoading,
    error: loginHook.error || requestOTPHook.error || registerWithOTPHook.error,

    login: loginHook.login,
    logout,
    requestOTP: requestOTPHook.requestOTP,
    registerWithOTP: registerWithOTPHook.register,

    clearError: () => {
      loginHook.clearError();
      requestOTPHook.clearError();
      registerWithOTPHook.clearError();
    },
  };
}
