'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { ServiceItemCard } from './components/ServiceItemCard';
import { Skeleton } from '@/components/ui/skeleton';

function CreateServiceItemContent() {
  const searchParams = useSearchParams();
  const serviceItemId = searchParams.get('id');
  const id = serviceItemId ? parseInt(serviceItemId) : null;

  const isEditMode = id !== null;
  const isLoading = false; // Will be replaced with actual loading state

  return (
    <>
      <SiteHeader title={isEditMode ? 'Cập nhật mục dịch vụ' : 'Thêm mục dịch vụ'} />
      <ServiceItemCard
        isEditMode={isEditMode}
        isLoading={isLoading}
        serviceItemData={null} // Will be replaced with actual data
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

export default function CreateServiceItemPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CreateServiceItemContent />
    </Suspense>
  );
}
