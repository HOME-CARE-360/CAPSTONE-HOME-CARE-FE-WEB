'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { ServiceTable } from './components/ServiceTable';
import { Plus } from 'lucide-react';
import { useServiceManager } from '@/hooks/useServiceManager';
import { useCategories } from '@/hooks/useCategory';
import { useState } from 'react';
import { ServiceManagerSearchParams } from '@/lib/api/services/fetchServiceManager';

export default function ManageServicesPage() {
  const [searchParams, setSearchParams] = useState<ServiceManagerSearchParams>({
    sortBy: 'createdAt',
    orderBy: 'desc',
    // createdById: 0,
    // maxPrice: 0,
    // minPrice: 0,
    name: '',
    limit: 10,
    page: 1,
  });
  const { data: serviceData, isFetching: isServiceFetching } = useServiceManager(searchParams);
  const { data: categoryData, isFetching: isCategoryFetching } = useCategories();

  const handleFilterChange = (params: Partial<ServiceManagerSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  };

  return (
    <>
      <SiteHeader title="Quản lý dịch vụ" />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý dịch vụ</h1>
            <p className="text-muted-foreground">
              Quản lý các dịch vụ mà bạn cung cấp cho khách hàng
            </p>
          </div>
          <Link href="/provider/manage-services/action">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm dịch vụ mới
            </Button>
          </Link>
        </div>

        {/* Service Table */}
        <ServiceTable
          data={serviceData?.services || []}
          categories={categoryData?.categories || []}
          isLoading={isServiceFetching || isCategoryFetching}
          page={serviceData?.page}
          limit={serviceData?.limit}
          totalPages={serviceData?.totalPages}
          totalItems={serviceData?.totalItems}
          onFilterChange={handleFilterChange}
          searchFilters={searchParams}
        />
      </div>
    </>
  );
}
