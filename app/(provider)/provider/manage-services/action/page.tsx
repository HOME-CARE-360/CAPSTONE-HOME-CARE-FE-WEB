'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useServiceManagerDetail } from '@/hooks/useServiceManager';
import { useCategories } from '@/hooks/useCategory';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { ServiceCard } from './components/ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';

function CreateServiceContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('id');
  const id = serviceId ? parseInt(serviceId) : null;

  const { data: serviceData, isLoading: isServiceLoading } = useServiceManagerDetail(id);
  const { data: categoryData, isLoading: isCategoryLoading } = useCategories();

  const isEditMode = id !== null;
  const isLoading = isCategoryLoading || isServiceLoading;
  const allCategories = categoryData?.categories || [];

  return (
    <>
      <SiteHeader title={isEditMode ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ'} />
      <ServiceCard
        isEditMode={isEditMode}
        isLoading={isLoading}
        serviceData={serviceData?.data}
        categories={allCategories}
      />
    </>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <SiteHeader title="Đang tải..." />
      <div className="w-full p-6">
        <div className="flex flex-col gap-2 mb-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-5 w-[300px]" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    </>
  );
}

export default function CreateServicePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CreateServiceContent />
    </Suspense>
  );
}
