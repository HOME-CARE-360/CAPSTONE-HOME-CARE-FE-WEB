'use client';

import { TopDiscountedServices } from './TopDiscountedServices';
import { TopProviders } from './TopProviders';
import { TopFavoriteServices } from './TopFavoriteServices';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-slate-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Nền tảng dịch vụ gia đình hàng đầu
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Home Care{' '}
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                360
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Nền tảng kết nối dịch vụ gia đình chất lượng cao với khách hàng. Đơn giản, nhanh chóng
              và đáng tin cậy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="category">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Khám phá dịch vụ
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="register">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold border-2 border-green-500 hover:border-green-600 hover:bg-slate-50 transition-all duration-200"
                >
                  Đăng ký ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Discounted Services */}
      <TopDiscountedServices />

      {/* Top Providers */}
      <TopProviders />

      {/* Top Favorite Services */}
      <TopFavoriteServices />
    </div>
  );
}
