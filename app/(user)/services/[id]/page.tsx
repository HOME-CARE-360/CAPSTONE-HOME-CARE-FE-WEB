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
        <div className="mb-10">
          <Skeleton className="h-5 w-48 bg-gray-200" />
        </div>

        {/* Image gallery skeleton */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[28rem] md:h-[36rem] rounded-2xl overflow-hidden border-2 border-gray-200">
            <div className="lg:col-span-3">
              <Skeleton className="w-full h-full bg-gray-200" />
            </div>
            <div className="hidden lg:grid grid-rows-2 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-full rounded-xl bg-gray-200" />
              ))}
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* Header skeleton */}
            <div className="space-y-6">
              <div className="flex gap-3 mb-6">
                <Skeleton className="h-7 w-20 rounded-full bg-gray-200" />
                <Skeleton className="h-7 w-24 rounded-full bg-gray-200" />
              </div>
              <Skeleton className="h-12 w-4/5 bg-gray-200" />
              <div className="flex gap-6 pb-6 border-b border-gray-200">
                <Skeleton className="h-5 w-32 bg-gray-200" />
                <Skeleton className="h-5 w-28 bg-gray-200" />
              </div>
            </div>

            {/* Description card skeleton */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-lg bg-gray-200" />
                <Skeleton className="h-7 w-32 bg-gray-200" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-full bg-gray-200" />
                <Skeleton className="h-5 w-5/6 bg-gray-200" />
                <Skeleton className="h-5 w-4/5 bg-gray-200" />
              </div>
            </div>

            {/* Details grid skeleton */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-8 h-8 rounded-lg bg-gray-200" />
                <Skeleton className="h-7 w-40 bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-14 h-14 rounded-xl bg-gray-200" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-gray-200" />
                        <Skeleton className="h-6 w-16 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-8">
            <div className="border-2 border-gray-900 rounded-lg p-6 bg-white shadow-xl">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-10 w-32 bg-gray-200" />
                  <Skeleton className="h-5 w-24 bg-gray-200" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />
                  <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />
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
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            <AlertTriangle className="w-10 h-10 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Không thể tải dịch vụ</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error.message || 'Đã có lỗi xảy ra khi tải thông tin dịch vụ. Vui lòng thử lại.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onRetry}
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
            <Link href="/services">
              <Button
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3"
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
          <div className="text-8xl mb-8 text-gray-400">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Không tìm thấy dịch vụ</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link href="/services">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3">
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
