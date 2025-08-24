'use client';

import { useGetServiceProviderInformation } from '@/hooks/useUser';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import ProviderInfoCard from './components/ProviderInfoCard';
import ProviderServicesList from './components/ProviderServicesList';

export default function ServiceProviderProfile() {
  const { id } = useParams();
  const numericId = Number(id);
  const { data, isLoading, error } = useGetServiceProviderInformation(numericId);

  if (isNaN(numericId)) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg border p-10 text-center text-muted-foreground">
          ID nhà cung cấp không hợp lệ.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>

          {/* Main Profile Card Skeleton */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-56" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Information Skeleton */}
                <div className="space-y-6">
                  <Skeleton className="h-5 w-40" />
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <div className="space-y-2 w-full">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Details Skeleton */}
                <div className="space-y-6">
                  <Skeleton className="h-5 w-40" />
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <div className="space-y-2 w-full">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-56" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg border p-10 text-center text-muted-foreground">
          Không thể tải thông tin nhà cung cấp.
        </div>
      </div>
    );
  }

  const providerData = data?.data;
  if (!providerData) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg border p-10 text-center text-muted-foreground">
          Không thể tải thông tin nhà cung cấp.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProviderInfoCard providerData={providerData} />
        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Dịch vụ</h2>
          <p className="text-sm text-muted-foreground">
            Danh sách dịch vụ do nhà cung cấp cung cấp
          </p>
          <ProviderServicesList providerId={providerData.serviceProvider.id} />
        </div>
      </div>
    </div>
  );
}
