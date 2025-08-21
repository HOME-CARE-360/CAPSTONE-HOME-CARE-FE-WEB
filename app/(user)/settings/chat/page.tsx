import { Suspense } from 'react';
import UserChat from '@/components/chat/UserChat';

export default function SettingsChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Đang tải chat...</div>}>
      <UserChat />
    </Suspense>
  );
}
