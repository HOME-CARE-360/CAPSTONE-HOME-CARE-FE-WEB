import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import apiService, { setAuthErrorHandler } from '@/lib/api/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import fetchAuth from '@/lib/api/services/fetchAuth';

// Define the structure of the decoded token
interface DecodedToken extends JwtPayload {
  id?: string; // User ID might be in 'id'
  userId?: string; // or 'userId'
  user_id?: string; // or 'user_id'
  uid?: string; // or 'uid'
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Set up the auth error handler
      setAuthErrorHandler(async () => {
        return get().refreshAccessToken();
      });

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
            const currentRefreshToken = get().refreshToken;
            if (!currentRefreshToken) {
              get().logout();
              return false;
            }

            const response = await fetchAuth.refreshToken(currentRefreshToken);
            if (response.data?.accessToken && response.data?.refreshToken) {
              get().setToken(response.data.accessToken, response.data.refreshToken);
              return true;
            }

            console.error('Invalid refresh token response:', response);
            get().logout();
            return false;
          } catch (error) {
            console.error('Failed to refresh token:', error);
            get().logout();
            return false;
          }
        },

        logout: () => {
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
      };
    },
    {
      name: 'auth-storage',
      partialize: state => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Initial state sync from cookies
const storedToken = getCookie('auth-token') as string | null;
const storedRefreshToken = getCookie('refresh-token') as string | null;
useAuthStore.getState().setToken(storedToken, storedRefreshToken);
