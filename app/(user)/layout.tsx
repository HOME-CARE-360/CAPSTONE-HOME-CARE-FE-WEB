import type React from 'react';
import '@/app/globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'HomeCare 360 - Your Comprehensive Home Service Solution',
  description:
    'In the modern busy life, households increasingly require flexible, quick, and personalized home services. Traditional booking methods are often inefficient, inconvenient, and lack transparency.',
};

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-mann">
      <Header />
      {children}
    </div>
  );
}
