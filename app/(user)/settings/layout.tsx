import type { Metadata } from 'next';

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
    <div className="flex w-full">
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
