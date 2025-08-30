'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { AIChatBox } from './AIChatBox';

export function AIChatBoxWrapper() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || user?.role !== 'CUSTOMER') {
    return null;
  }

  return <AIChatBox />;
}
