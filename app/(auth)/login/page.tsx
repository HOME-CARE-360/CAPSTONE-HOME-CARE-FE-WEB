'use client';

import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="mx-auto">
        <LoginForm />
      </div>
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        <Image
          src="/images/background.jpg"
          alt="logo background"
          fill
          style={{ objectFit: 'cover', zIndex: 0, opacity: 0.95 }}
          className="absolute inset-0"
          priority
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <p className="text-black">HomeCare</p>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-black">
              &ldquo;Đăng nhập để trở thành một phần của HomeCare&rdquo;
            </p>
            <footer className="text-sm text-black">HomeCare Team</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
