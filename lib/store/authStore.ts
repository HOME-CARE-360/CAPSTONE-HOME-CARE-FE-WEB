import { create } from 'zustand';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import apiService, { setAuthErrorHandler } from '@/lib/api/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import fetchAuth from '@/lib/api/services/fetchAuth';
import router from 'next/router';

// Define the structure of the decoded token
interface DecodedToken extends JwtPayload {
  id?: string;
  userId?: string;
  user_id?: string;
  uid?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null, refreshToken: string | null) => void;
  refreshAccessToken: () => Promise<boolean>;
  logout: () => void;
  forceClearAll: () => void;
  getAuthState: () => {
    store: AuthState;
    cookies: { authToken: string | null; refreshToken: string | null; userId: string | null };
  };
}

// Function to decode the token and extract user info
const getUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // The user ID can be in 'id', 'sub' (standard), 'userId', 'user_id', or 'uid'
    const userId = decoded.id || decoded.sub || decoded.userId || decoded.user_id || decoded.uid;

    if (!userId) {
      console.error(
        'Token does not contain a valid user ID claim (checked: id, sub, userId, user_id, uid).'
      );
      return null;
    }

    return {
      id: userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      avatar: decoded.avatar,
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const useAuthStore = create<AuthState>()((set, get) => {
  return {
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setToken: (token, refreshToken) => {
      if (token && refreshToken) {
        const user = getUserFromToken(token);
        if (user) {
          set({ token, refreshToken, user, isAuthenticated: true, isLoading: false });
          setCookie('auth-token', token, { maxAge: 60 * 60 * 24 * 7, path: '/' });
          setCookie('refresh-token', refreshToken, { maxAge: 60 * 60 * 24 * 7, path: '/' });
          setCookie('userId', user.id, { maxAge: 60 * 60 * 24 * 7, path: '/' });
          apiService.setAuthToken(token);
        } else {
          get().logout();
        }
      } else {
        get().logout();
      }
    },

    refreshAccessToken: async () => {
      try {
        // Prefer in-memory refresh token, fallback to cookie
        const tokenFromState = get().refreshToken;
        const tokenFromCookie = (getCookie('refresh-token') as string | null) ?? null;
        const currentRefreshToken = tokenFromState || tokenFromCookie;

        if (!currentRefreshToken) {
          console.warn('No refresh token available');
          get().logout();
          return false;
        }

        // Avoid sending stale Authorization header on refresh request
        apiService.setAuthToken(null);

        const response = await fetchAuth.refreshToken(currentRefreshToken);
        if (response.data?.accessToken && response.data?.refreshToken) {
          get().setToken(response.data.accessToken, response.data.refreshToken);
          return true;
        }

        console.error('Invalid refresh token response:', response);
        get().logout();
        return false;
      } catch (error: unknown) {
        console.error('Failed to refresh token:', error);

        // Check if it's a 401 error specifically
        type ErrorWithStatus = { status?: number; response?: { status?: number } };
        const err = error as ErrorWithStatus;
        console.log('err: ', err);
        if (err?.response?.status === 401 || err?.status === 401) {
          router.push('/login');
          console.log('Refresh token expired (401), logging out');
        }

        // Force logout regardless of error type
        get().logout();
        return false;
      }
    },

    logout: () => {
      console.log('Logging out - clearing all auth data');
      deleteCookie('auth-token', { path: '/' });
      deleteCookie('refresh-token', { path: '/' });
      deleteCookie('userId', { path: '/' });
      apiService.setAuthToken(null);
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new Event('logout'));
        } catch (error: unknown) {
          console.error('Failed to dispatch logout event:', error);
        }
      }
      console.log('Logout completed - all auth data cleared');
    },

    forceClearAll: () => {
      deleteCookie('auth-token', { path: '/' });
      deleteCookie('refresh-token', { path: '/' });
      deleteCookie('userId', { path: '/' });
      apiService.setAuthToken(null);
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },

    // Utility function to check current auth state
    getAuthState: () => {
      const cookies = {
        authToken: (getCookie('auth-token') as string | null) ?? null,
        refreshToken: (getCookie('refresh-token') as string | null) ?? null,
        userId: (getCookie('userId') as string | null) ?? null,
      };
      const state = get();
      return {
        store: state,
        cookies,
      };
    },
  };
});

// Initial state sync from cookies
const initializeAuthFromCookies = () => {
  const storedToken = getCookie('auth-token') as string | null;
  const storedRefreshToken = getCookie('refresh-token') as string | null;

  if (storedToken && storedRefreshToken) {
    // Validate the stored token before setting it
    const user = getUserFromToken(storedToken);
    if (user) {
      useAuthStore.getState().setToken(storedToken, storedRefreshToken);
    } else {
      // Invalid token, clear cookies and store
      console.log('Invalid stored token found, clearing auth data');
      useAuthStore.getState().logout();
    }
  } else {
    // No tokens found, ensure clean state
    useAuthStore.getState().logout();
  }
};

// Initialize auth state when the module loads
initializeAuthFromCookies();

// Remove any legacy persisted auth state from localStorage (we now rely on cookies only)
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('auth-storage');
  } catch (error) {
    console.error('Error removing legacy auth-storage from localStorage:', error);
  }
}

// Wire API 401 handler to our token refresh flow
setAuthErrorHandler(async () => {
  const success = await useAuthStore.getState().refreshAccessToken();
  return success;
});
