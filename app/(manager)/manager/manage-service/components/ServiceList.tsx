'use client';

import { Service } from '@/lib/api/services/fetchManager';
import { ServiceCard } from './ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Search } from 'lucide-react';

interface ServiceListProps {
  services: Service[];
  isLoading: boolean;
}

export function ServiceList({ services, isLoading }: ServiceListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dịch vụ nào</h3>
        <p className="text-gray-500 mb-6">
          Không tìm thấy dịch vụ nào. Hãy thay đổi bộ lọc hoặc tìm kiếm.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Search className="h-4 w-4" />
          <span>Không có dịch vụ phù hợp bộ lọc hiện tại</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-6">
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
