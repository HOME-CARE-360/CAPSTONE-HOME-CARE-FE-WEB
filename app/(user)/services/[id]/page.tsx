'use client';

import ServiceDetail from './components/ServiceDetail';
import { useService } from '@/hooks/useService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

// Modern loading skeleton component
function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb skeleton */}
        <div className="mb-2">
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Image gallery skeleton */}
        <div className="mb-4 md:mb-8">
          <div className="grid grid-cols-5 gap-2 h-[32rem] rounded-xl overflow-hidden border shadow-lg">
            <div className="col-span-2">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
            <div className="col-span-3 grid grid-cols-2 grid-rows-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Content skeleton */}
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
      </div>
    </div>
  );
}

// Modern error component
function ServiceError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <AlertTriangle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Không thể tải dịch vụ</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {error.message || 'Đã có lỗi xảy ra khi tải thông tin dịch vụ. Vui lòng thử lại.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onRetry}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
            <Link href="/services">
              <Button
                variant="outline"
                className="border-2 border-primary/20 text-primary hover:bg-primary/5 font-semibold px-6 py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay về danh sách
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modern not found component
function ServiceNotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-8 text-muted-foreground">🔍</div>
          <h1 className="text-3xl font-bold mb-3">Không tìm thấy dịch vụ</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link href="/services">
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay về danh sách dịch vụ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  const { data, isLoading, error, refetch } = useService(params.id);

  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (error) {
    return <ServiceError error={error} onRetry={() => refetch()} />;
  }

  if (!data?.service) {
    return <ServiceNotFound />;
  }

  return (
    <div className="min-h-screen bg-white">
      <ServiceDetail service={data.service} />
    </div>
  );
}
