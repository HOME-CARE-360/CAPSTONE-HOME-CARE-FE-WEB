'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerRegistrationForm } from './components/CustomerRegistrationForm';
import { ProviderRegistrationForm } from './components/ProviderRegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'provider'>('customer');
  const { t } = useTranslation('common');

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Marketplace
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">&ldquo;{t('register.testimonial')}&rdquo;</p>
            <footer className="text-sm">{t('register.testimonial_author')}</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <Card className="mx-auto w-full max-w-[450px]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              {t('register.title')}
            </CardTitle>
            <CardDescription className="text-center">{t('register.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={value => setActiveTab(value as 'customer' | 'provider')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer">{t('register.tabs.customer')}</TabsTrigger>
                <TabsTrigger value="provider">{t('register.tabs.provider')}</TabsTrigger>
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
    </div>
  );
}
