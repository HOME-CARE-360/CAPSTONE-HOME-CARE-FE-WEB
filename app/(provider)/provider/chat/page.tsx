import { Suspense } from 'react';
import ProviderChat from '@/components/chat/ProviderChat';

export default function ProviderChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Đang tải chat...</div>}>
      <ProviderChat />
    </Suspense>
  );
}
