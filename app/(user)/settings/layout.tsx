import type { Metadata } from 'next';
import UserSidebar from '@/app/(user)/components/UserSidebar';

export const metadata: Metadata = {
  title: 'Setting Customer',
  description: 'Settings for customers',
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <UserSidebar />
        <main className="px-2 pb-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-6 gap-10 container mx-auto min-h-screen">
          <div className="col-span-1 w-56">
            <UserSidebar />
          </div>
          <div className="col-span-5">
            <div className="max-w-6xl mx-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
