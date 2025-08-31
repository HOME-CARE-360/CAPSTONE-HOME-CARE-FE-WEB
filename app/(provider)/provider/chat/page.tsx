import { Suspense } from 'react';
import ProviderChat from '@/components/chat/ProviderChat';
import { SiteHeader } from '../../components/SiteHeader';

export default function ProviderChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-8 h-8 mx-auto mb-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Đang tải chat...</p>
          </div>
        </div>
      }
    >
      <SiteHeader title="Tin nhắn" />
      <ProviderChat />
    </Suspense>
  );
}
