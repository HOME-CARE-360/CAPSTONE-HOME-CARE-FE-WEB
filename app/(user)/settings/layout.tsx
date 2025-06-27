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
    <div className="grid grid-cols-6 gap-10 container mx-auto mt-14 mb-14">
      <div className="col-span-1">
        <UserSidebar />
      </div>
      <div className="col-span-5">{children}</div>
    </div>
  );
}
