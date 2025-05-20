import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import apiService from '@/lib/api/core';

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

  // Actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  syncAuthState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: token => {
        // Sync the token with cookies when it's set in the store
        if (token) {
          setCookie('auth-token', token, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          });
          // Set token in API service for authenticated requests
          apiService.setAuthToken(token);
        } else {
          deleteCookie('auth-token', { path: '/' });
          // Clear token in API service
          apiService.setAuthToken(null);
        }

        set(() => ({
          token,
          isAuthenticated: !!token,
        }));
      },

      setUser: user => set(() => ({ user })),

      login: (token, user) => {
        // Sync the token with cookies on login
        setCookie('auth-token', token, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });
        // Set token in API service for authenticated requests
        apiService.setAuthToken(token);

        set(() => ({
          token,
          user,
          isAuthenticated: true,
        }));
      },

      logout: () => {
        // Clear cookies on logout
        deleteCookie('auth-token', { path: '/' });
        // Clear token in API service
        apiService.setAuthToken(null);

        set(() => ({
          token: null,
          user: null,
          isAuthenticated: false,
        }));
      },

      syncAuthState: () => {
        if (typeof window !== 'undefined') {
          const cookieToken = getCookie('auth-token');

          set(state => {
            const storeHasToken = !!state.token;
            const cookieHasToken = !!cookieToken;

            // If there's a mismatch between cookie and store
            if (storeHasToken !== cookieHasToken) {
              // Prefer cookie token for middleware compatibility
              if (cookieHasToken) {
                return {
                  token: cookieToken as string,
                  isAuthenticated: true,
                };
              } else {
                return {
                  token: null,
                  isAuthenticated: false,
                };
              }
            }

            return {
              isAuthenticated: storeHasToken,
            };
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist these fields
      partialize: state => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.isAuthenticated = !!state.token;
          // Set token in API service on rehydration if available
          if (state.token) {
            apiService.setAuthToken(state.token);
          }

          // After rehydration, check for cookie token as well
          if (typeof window !== 'undefined') {
            const cookieToken = getCookie('auth-token');
            if (!state.token && cookieToken) {
              state.setToken(cookieToken as string);
            } else if (state.token && !cookieToken) {
              setCookie('auth-token', state.token, {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
              });
            }
          }
        }
      },
    }
  )
);

// Initialize auth state from storage
setTimeout(() => {
  const state = useAuthStore.getState();
  if (typeof window !== 'undefined') {
    const cookieToken = getCookie('auth-token');
    const storeHasToken = !!state.token;
    const cookieHasToken = !!cookieToken;

    // If we have a token in store or cookie, set it in the API service
    if (storeHasToken) {
      apiService.setAuthToken(state.token);
    } else if (cookieHasToken) {
      apiService.setAuthToken(cookieToken as string);
    }

    if (storeHasToken !== cookieHasToken) {
      state.syncAuthState();
    } else if (storeHasToken && !state.isAuthenticated) {
      state.syncAuthState();
    }
  }
}, 0);
