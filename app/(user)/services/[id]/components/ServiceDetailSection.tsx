'use client';
import { Service } from '@/lib/api/services/fetchService';
import { Home, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProviderInfomation } from '@/hooks/useUser';
import ProviderInfo from '@/app/(user)/services/[id]/components/ProviderInfo';

interface ServiceDetailsSectionProps {
  service: Service;
}

export default function ServiceDetailsSection({ service }: ServiceDetailsSectionProps) {
  const { data: profileProvider, isLoading: isProviderLoading } = useGetProviderInfomation(
    service.providerId
  );

  const summarySpecs = [
    {
      icon: <Clock className="size-4" />,
      value: `${service.durationMinutes} phút`,
      label: 'Thời gian',
    },
    {
      icon: <Tag className="size-4" />,
      value: service.Category.name,
      label: 'Danh mục',
    },
  ];

  // Show loading skeleton while provider is loading
  if (isProviderLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content - 2/3 width */}
        <div className="lg:w-2/3">
          {/* Header skeleton */}
          <div className="mb-4 md:mb-6">
            <Skeleton className="h-8 md:h-12 w-4/5 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Summary Chips skeleton */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-4 md:mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-md" />
            ))}
          </div>

          <Skeleton className="h-px w-full mb-4 md:mb-6" />

          {/* Description card skeleton */}
          <div className="shadow-lg border-0 rounded-lg p-6 bg-white mb-4 md:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-6 h-6 rounded-lg" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>

          {/* Details card skeleton */}
          <div className="shadow-lg border-0 rounded-lg p-6 bg-white mb-4 md:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-6 h-6 rounded-lg" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-zinc-50/50 rounded-md border border-zinc-200"
                >
                  <Skeleton className="w-5 h-5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:w-1/3">
          <div className="shadow-lg border-0 rounded-lg p-6 bg-white sticky top-24">
            <div className="space-y-6">
              {/* Price skeleton */}
              <div className="text-center">
                <Skeleton className="h-8 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>

              {/* Action buttons skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>

              {/* Provider info skeleton */}
              <div className="space-y-4 pt-4 border-t">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-3 p-2 rounded-lg">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content - 2/3 width */}
      <div className="lg:w-2/3">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-4xl font-bold mb-2">{service.name}</h1>
        </div>
        {/* Summary Chips */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-4 md:mb-8">
          {summarySpecs.map((spec, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-zinc-50/50 p-2 rounded-md border border-zinc-200"
            >
              {spec.icon}
              <span className="text-xs md:text-sm font-medium">{spec.value}</span>
            </div>
          ))}
        </div>
        {/* Description Section */}
        <Card id="description" className="mb-4 md:mb-8">
          <CardHeader className="max-md:px-4 max-md:pb-2 max-md:pt-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-xl">
              <Home className="size-4 md:size-5" />
              Mô tả
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Thông tin chi tiết về dịch vụ
            </CardDescription>
          </CardHeader>
          <CardContent className="max-md:px-4 max-md:pb-3">
            <p className="text-foreground font-light leading-relaxed text-xs md:text-base">
              {service.description}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Sidebar - 1/3 width */}
      <div className="lg:w-1/3 space-y-8">
        {/* Provider Info */}
        {profileProvider && (
          <ProviderInfo providerProfile={profileProvider.data} service={service} />
        )}
      </div>
    </div>
  );
}
