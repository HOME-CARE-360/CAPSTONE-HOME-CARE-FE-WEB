import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import fetchAuth, {
  LoginCredentials,
  RegisterRequest,
  LoginResponse,
  RegisterProviderRequest,
  ValidationError,
  RegisterProviderResponse,
  RegisterResponse,
  OTPVerifyRequest,
  OTPVerifyResponse,
} from '@/lib/api/services/fetchAuth';
import { toast } from 'sonner';

// OTP verification hook
export function useRequestOTP() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<ValidationError | null>(null);
  const { mutate: requestOTPMutation, isPending: isLoading } = useMutation({
    mutationFn: fetchAuth.verifyEmailWithOTP,
    onSettled: (data: OTPVerifyResponse | undefined) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'otpVerify'] });
      if (data?.message) {
        toast.success(data.message as string);
      }
    },
    onError: (error: ValidationError) => {
      setError(error);
      let errorMessage = 'An unexpected error occurred';
      if (error?.message && Array.isArray(error.message) && error.message.length > 0) {
        errorMessage = error.message[0]?.message || errorMessage;
      } else if (typeof error?.message === 'string') {
        errorMessage = error.message;
      }

      // Don't show toast for EmailAlreadyExists error - let the form handle it
      if (error?.code !== 'EmailAlreadyExists') {
        toast.error(errorMessage);
      }
    },
  });

  // Wrap the mutation to make it properly awaitable and handle EmailAlreadyExists error
  const requestOTP = (data: OTPVerifyRequest) => {
    setError(null);
    return new Promise<void>((resolve, reject) => {
      requestOTPMutation(data, {
        onSuccess: () => resolve(),
        onError: (err: ValidationError) => {
          // For EmailAlreadyExists, we want to reject with a specific error
          if (err?.code === 'EmailAlreadyExists') {
            reject(new Error('EmailAlreadyExists'));
          } else {
            reject(err);
          }
        },
      });
    });
  };

  return {
    requestOTP,
    isLoading,
    error,
    errorMessage: error ? (error.message as string) : null,
    clearError: () => setError(null),
  };
}

// Register hook
export function useRegister() {
  const [error, setError] = useState<ValidationError | null>(null);
  const router = useRouter();
  const {
    mutate: registerMutation,
    isPending: isLoading,
    error: registerError,
  } = useMutation({
    mutationFn: fetchAuth.register,
    onSuccess: (data: RegisterResponse) => {
      if (data?.message) {
        toast.success(data.message as string);
      }
      router.push('/login');
    },
    onError: (error: ValidationError) => {
      let errorMessage = 'An unexpected error occurred';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message: string | ValidationError[] };
        if (Array.isArray(errorObj.message)) {
          errorMessage = errorObj.message[0]?.message || errorMessage;
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      }
      toast.error(errorMessage);
      router.push('/login');
    },
  });

  // Wrap the mutation in a Promise to make it properly awaitable
  const register = (data: RegisterRequest) => {
    setError(null);
    return new Promise<void>((resolve, reject) => {
      registerMutation(data, {
        onSuccess: () => resolve(),
        onError: err => reject(err),
      });
    });
  };

  const currentError = error || (registerError as ValidationError | null);

  return {
    register,
    isLoading,
    error: currentError,
    errorMessage: currentError ? (currentError.message as string) : null,
    clearError: () => setError(null),
  };
}

// Register provider hook
export function useRegisterProvider() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<ValidationError | null>(null);

  const { mutate: registerProviderMutation, isPending: isLoading } = useMutation({
    mutationFn: fetchAuth.registerProvider,
    onSettled: (data: RegisterProviderResponse | undefined) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'registerProvider'] });
      if (data?.message) {
        toast.success(data.message as string);
      }
      router.push('/login');
    },
    onError: (error: ValidationError) => {
      let errorMessage = 'An unexpected error occurred';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message: string | ValidationError[] };
        if (Array.isArray(errorObj.message)) {
          errorMessage = errorObj.message[0]?.message || errorMessage;
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      }
      toast.error(errorMessage);
    },
  });

  // Wrap the mutation in a Promise to make it properly awaitable
  const registerProvider = (data: RegisterProviderRequest) => {
    setError(null);
    return new Promise<void>((resolve, reject) => {
      registerProviderMutation(data, {
        onSuccess: () => resolve(),
        onError: err => reject(err),
      });
    });
  };

  return {
    registerProvider,
    isLoading,
    error,
    errorMessage: error ? (error.message as string) : null,
    clearError: () => setError(null),
  };
}

// Login hook
export function useLogin() {
  const queryClient = useQueryClient();
  const { setToken } = useAuthStore();
  const [error, setError] = useState<ValidationError | null>(null);
  const router = useRouter();
  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await fetchAuth.login(credentials);
      if (!response || !response.data?.accessToken || !response.data?.refreshToken) {
        const errorMessage = Array.isArray(response.message)
          ? response.message[0]?.message || 'Invalid response'
          : response.message || 'Invalid response';
        throw new Error(errorMessage);
      }
      return response;
    },
    onSuccess: (response: LoginResponse) => {
      try {
        // save token to zustand and cookie
        const token = response.data?.accessToken || null;
        const refreshToken = response.data?.refreshToken || null;
        setToken(token, refreshToken);
        router.push('/');
        // refresh queries related to auth
        queryClient.invalidateQueries({ queryKey: ['auth', 'login'] });
        setError(null);
      } catch (err) {
        setError({ message: 'Error storing token', code: 'TOKEN_ERROR' } as ValidationError);
        toast.error('Error storing token');
      }
    },
    onError: (error: unknown) => {
      let errorMessage = 'An unexpected error occurred';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message: string | ValidationError[] };
        if (Array.isArray(errorObj.message)) {
          errorMessage = errorObj.message[0]?.message || errorMessage;
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      }
      toast.error(errorMessage);
    },
  });
  return {
    login,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

// Main auth hook that combines functionality
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout: storeLogout, token, isAuthenticated } = useAuthStore();
  const loginHook = useLogin();
  const registerHook = useRegister();
  const otpHook = useRequestOTP();
  const registerProviderHook = useRegisterProvider();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: () => fetchAuth.logout(),
    onSuccess: () => {
      // Clear both zustand store and cookies
      storeLogout();
      deleteCookie('auth-token', { path: '/' });
      window.dispatchEvent(new Event('logout'));
      queryClient.clear(); // Clear all queries
      router.push('/login');
    },
    onError: () => {
      // Still logout locally even if API call fails
      storeLogout();
      deleteCookie('auth-token', { path: '/' });

      router.push('/login');
    },
  });

  // Combine errors from all hooks
  const error =
    loginHook.error || registerHook.error || otpHook.error || registerProviderHook.error;
  const errorMessage = error ? (error.message as string) : null;

  return {
    token,
    isAuthenticated,
    isLoading:
      loginHook.isLoading ||
      registerHook.isLoading ||
      isLoggingOut ||
      otpHook.isLoading ||
      registerProviderHook.isLoading,
    error,
    errorMessage,

    login: loginHook.login,
    logout,
    register: registerHook.register,
    requestOTP: otpHook.requestOTP,
    isRequestingOTP: otpHook.isLoading,
    registerProvider: registerProviderHook.registerProvider,

    clearError: () => {
      loginHook.clearError();
      registerHook.clearError();
      otpHook.clearError();
      registerProviderHook.clearError();
    },
  };
}

export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { url } = await fetchAuth.googleLogin();
      window.location.href = url;
    } catch (err) {
      setError('Không thể lấy liên kết Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginWithGoogle,
    isLoading,
    error,
  };
}
