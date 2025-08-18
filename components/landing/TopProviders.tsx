'use client';

import { useGetTopProvidersAllTime } from '@/hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Sparkles } from 'lucide-react';
import { ProviderCard } from './ProviderCard';

export function TopProviders() {
  const { data, isLoading, error } = useGetTopProvidersAllTime();
  const providers = data?.data.items ?? [];

  if (error) {
    return null; // Fail silently for landing page
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-80 mx-auto mb-4 rounded-lg" />
            <Skeleton className="h-6 w-96 mx-auto rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-50 to-transparent rounded-full blur-3xl opacity-40" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Được khách hàng tin tưởng
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-6 leading-tight">
            Nhà cung cấp hàng đầu
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá những đối tác xuất sắc với chất lượng dịch vụ được khách hàng đánh giá cao nhất
          </p>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {providers.map(provider => (
            <ProviderCard key={provider.id} provider={provider} size="md" />
          ))}
        </div>

        {providers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <Building2 className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Chưa có nhà cung cấp</h3>
            <p className="text-slate-500">Danh sách nhà cung cấp hàng đầu sẽ được cập nhật sớm</p>
          </div>
        )}

        {/* Bottom CTA */}
        {providers.length > 0 && (
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors duration-200 cursor-pointer">
              Khám phá thêm nhà cung cấp
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
