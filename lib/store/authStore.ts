import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import apiService from '@/lib/api/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';

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
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
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
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true

      setToken: token => {
        if (token) {
          const user = getUserFromToken(token);
          if (user) {
            set({ token, user, isAuthenticated: true, isLoading: false });
            setCookie('auth-token', token, { maxAge: 60 * 60 * 24 * 7, path: '/' });
            setCookie('userId', user.id, { maxAge: 60 * 60 * 24 * 7, path: '/' });
            apiService.setAuthToken(token);
          } else {
            // If token is invalid, logout
            get().logout();
          }
        } else {
          // If no token, logout
          get().logout();
        }
      },

      logout: () => {
        deleteCookie('auth-token', { path: '/' });
        deleteCookie('userId', { path: '/' });
        apiService.setAuthToken(null);
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      // Persist only the token, user will be derived from it
      partialize: state => ({
        token: state.token,
      }),
    }
  )
);

// Initial state sync from cookie
useAuthStore.getState().setToken(getCookie('auth-token') as string | null);
