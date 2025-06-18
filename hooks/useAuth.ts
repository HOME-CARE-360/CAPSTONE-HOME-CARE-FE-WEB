import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { setCookie, deleteCookie } from 'cookies-next';
import fetchAuth, {
  LoginCredentials,
  RegisterRequest,
  LoginResponse,
  OTPVerifyRequest,
  RegisterProviderRequest,
} from '@/lib/api/services/fetchAuth';

interface ApiError extends Error {
  status?: number;
  originalError?: unknown;
  error?: {
    message?: string | { message: string; path?: string }[];
  };
  message: string;
}

// OTP verification hook
export function useRequestOTP() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { mutate: requestOTP, isPending: isLoading } = useMutation({
    mutationFn: async (data: OTPVerifyRequest) => {
      try {
        const response = await fetchAuth.verifyEmailWithOTP(data);

        // Check if the response contains an error message
        if (response.message && !response.status) {
          console.error('OTP Error from API response:', response.message);
          throw new Error(JSON.stringify(response.message));
        }

        // Successful response
        return response;
      } catch (error: unknown) {
        console.error('OTP verification failed in mutation function:', error);

        // Type guard and check for successful responses
        const typedError = error as ApiError;

        // Don't process errors if they're actually successful responses
        if (typedError.status === 201 || typedError.status === 200) {
          return { status: true };
        }

        // Transform the error to a standard format to make it easier to handle
        let errorMessage = '';

        // Handle various error formats
        if (typedError.error?.message) {
          if (Array.isArray(typedError.error.message)) {
            errorMessage = typedError.error.message[0]?.message || 'OTP verification failed';
          } else {
            errorMessage = typedError.error.message;
          }
        } else if (Array.isArray(typedError.message)) {
          errorMessage =
            (typedError.message as unknown as { message: string }[])[0]?.message ||
            'OTP verification failed';
        } else if (typeof typedError.message === 'string') {
          try {
            // Try to parse JSON error message
            const parsed = JSON.parse(typedError.message);
            errorMessage = Array.isArray(parsed)
              ? parsed[0]?.message || 'OTP verification failed'
              : parsed.message || 'OTP verification failed';
          } catch {
            errorMessage = typedError.message;
          }
        } else {
          errorMessage = 'OTP verification failed';
        }

        // Create a standardized error object
        const standardError = new Error(errorMessage) as ApiError;
        // Attach original error for reference
        standardError.originalError = error;
        throw standardError;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'otpVerify'] });
    },
    onError: (error: Error) => {
      console.error('OTP verification failed in onError:', error);
      setError(error.message || 'OTP verification failed');
      // Do NOT re-throw here as it breaks React Query's error handling
    },
  });

  return {
    requestOTP: (data: OTPVerifyRequest) => {
      // Clear previous errors before making a new request
      setError(null);
      return new Promise<void>((resolve, reject) => {
        requestOTP(data, {
          onSuccess: () => resolve(),
          onError: err => reject(err),
        });
      });
    },
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

// Register hook
export function useRegister() {
  const [error, setError] = useState<string | null>(null);

  const {
    mutate: registerMutation,
    isPending: isLoading,
    error: registerError,
  } = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      try {
        const response = await fetchAuth.register(data);

        // Check if this is an error message - since some APIs might include a success message
        // that shouldn't be treated as an error
        if (
          response.message &&
          typeof response.message === 'object' &&
          !response.message.toString().includes('Thank you')
        ) {
          console.error('Register error from API response:', response.message);
          throw new Error(JSON.stringify(response.message));
        }

        // If we get here, consider it a success
        return response;
      } catch (error: unknown) {
        console.error('Registration failed in mutation function:', error);

        // Type guard for error
        const typedError = error as ApiError;

        // Transform the error to a standard format
        let errorMessage = '';

        // Handle various error formats
        if (typedError.error?.message) {
          if (Array.isArray(typedError.error.message)) {
            errorMessage = typedError.error.message[0]?.message || 'Registration failed';
          } else {
            errorMessage = typedError.error.message;
          }
        } else if (Array.isArray(typedError.message)) {
          errorMessage =
            (typedError.message as unknown as { message: string }[])[0]?.message ||
            'Registration failed';
        } else if (typeof typedError.message === 'string') {
          try {
            // Try to parse JSON error message
            const parsed = JSON.parse(typedError.message);
            errorMessage = Array.isArray(parsed)
              ? parsed[0]?.message || 'Registration failed'
              : parsed.message || 'Registration failed';
          } catch {
            errorMessage = typedError.message;
          }
        } else {
          errorMessage = 'Registration failed';
        }

        // Create a standardized error object
        const standardError = new Error(errorMessage) as ApiError;
        // Attach original error for reference
        standardError.originalError = error;
        throw standardError;
      }
    },
    onError: (error: Error) => {
      console.error('Registration failed in onError:', error);
      setError(error.message || 'Registration failed');
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

  return {
    register,
    isLoading,
    error: error || registerError?.message || null,
    clearError: () => setError(null),
  };
}

// Register provider hook
export function useRegisterProvider() {
  const [error, setError] = useState<string | null>(null);

  const { mutate: registerProviderMutation, isPending: isLoading } = useMutation({
    mutationFn: async (data: RegisterProviderRequest) => {
      try {
        const response = await fetchAuth.registerProvider(data);
        // Check if this is an error message - since some APIs might include a success message
        // that shouldn't be treated as an error
        if (
          response.message &&
          typeof response.message === 'object' &&
          !response.message.toString().includes('Thank you')
        ) {
          console.error('Register provider error from API response:', response.message);
          throw new Error(JSON.stringify(response.message));
        }

        // If we get here, consider it a success
        return response;
      } catch (error: unknown) {
        console.error('Provider registration failed in mutation function:', error);

        // Type guard for error
        const typedError = error as ApiError;

        // Transform the error to a standard format
        let errorMessage = '';

        // Handle various error formats
        if (typedError.error?.message) {
          if (Array.isArray(typedError.error.message)) {
            errorMessage = typedError.error.message[0]?.message || 'Registration failed';
          } else {
            errorMessage = typedError.error.message;
          }
        } else if (Array.isArray(typedError.message)) {
          errorMessage =
            (typedError.message as unknown as { message: string }[])[0]?.message ||
            'Registration failed';
        } else if (typeof typedError.message === 'string') {
          try {
            // Try to parse JSON error message
            const parsed = JSON.parse(typedError.message);
            errorMessage = Array.isArray(parsed)
              ? parsed[0]?.message || 'Registration failed'
              : parsed.message || 'Registration failed';
          } catch {
            errorMessage = typedError.message;
          }
        } else {
          errorMessage = 'Registration failed';
        }

        // Create a standardized error object
        const standardError = new Error(errorMessage) as ApiError;
        // Attach original error for reference
        standardError.originalError = error;
        throw standardError;
      }
    },
    onError: (error: Error) => {
      console.error('Provider registration failed in onError:', error);
      setError(error.message || 'Registration failed');
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
    clearError: () => setError(null),
  };
}

// Login hook
export function useLogin() {
  const queryClient = useQueryClient();
  const { setToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      try {
        const response = await fetchAuth.login(credentials);

        if (!response || !response.message) {
          throw new Error(`${response?.message?.path} ${response?.message?.message}`);
        }

        return response;
      } catch (err) {
        console.error('Login API Error:', err);
        throw new Error(err instanceof Error ? err.message : 'Login failed');
      }
    },
    onSuccess: (response: LoginResponse) => {
      try {
        // save token to zustand and cookie
        const token = response.data?.accessToken || null;
        setToken(token);

        setCookie('auth-token', token, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        // refresh queries related to auth
        queryClient.invalidateQueries({ queryKey: ['auth', 'login'] });

        // clear error
        setError(null);
      } catch (err) {
        console.error('Error storing token:', err);
        setError('Error storing token');
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
  const { toast } = useToast();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: () => fetchAuth.logout(),
    onSuccess: () => {
      // Clear both zustand store and cookies
      storeLogout();
      deleteCookie('auth-token', { path: '/' });
      window.dispatchEvent(new Event('logout'));
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
      registerHook.isLoading ||
      isLoggingOut ||
      otpHook.isLoading ||
      registerProviderHook.isLoading,
    error: loginHook.error || registerHook.error || otpHook.error || registerProviderHook.error,

    login: loginHook.login,
    logout,
    register: registerHook.register,
    requestOTP: otpHook.requestOTP,
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
  return useQuery({
    queryKey: ['google-login'],
    queryFn: () => fetchAuth.googleLogin(),
  });
}
