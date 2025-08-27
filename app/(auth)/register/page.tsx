'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerRegistrationForm } from './components/CustomerRegistrationForm';
import { ProviderRegistrationForm } from './components/ProviderRegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'provider'>('customer');

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="lg:p-8">
        <div className="flex w-full justify-center pb-2">
          <Link href="/">
            <Image src="/images/logo.png" alt="HomeCare logo" width={100} height={100} />
          </Link>
        </div>
        <Card className="mx-auto w-full max-w-[500px]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              Đăng ký tài khoản
            </CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin để tạo tài khoản mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={value => setActiveTab(value as 'customer' | 'provider')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer">Khách hàng</TabsTrigger>
                <TabsTrigger value="provider">Người bán</TabsTrigger>
              </TabsList>
              <TabsContent value="customer">
                <CustomerRegistrationForm />
              </TabsContent>
              <TabsContent value="provider">
                <ProviderRegistrationForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
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
