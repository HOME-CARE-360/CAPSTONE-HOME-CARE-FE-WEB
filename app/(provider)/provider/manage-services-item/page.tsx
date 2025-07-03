'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { Plus } from 'lucide-react';
import { useServiceItems } from '@/hooks/useServiceItem';
import { useState } from 'react';
import { ServiceItemSearchParams } from '@/lib/api/services/fetchServiceItem';
import { ServiceItemTable } from './components/ServiceItemTable';

export default function ManageServiceItemsPage() {
  const [searchParams, setSearchParams] = useState<ServiceItemSearchParams>({
    sortBy: 'createdAt',
    orderBy: 'desc',
    name: '',
    limit: 10,
    page: 1,
  });
  const { data: serviceItemData, isFetching: isServiceItemFetching } =
    useServiceItems(searchParams);

  const handleFilterChange = (params: Partial<ServiceItemSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  };

  return (
    <>
      <SiteHeader title="Quản lý mục dịch vụ" />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý mục dịch vụ</h1>
            <p className="text-muted-foreground">
              Quản lý các mục dịch vụ chi tiết mà bạn cung cấp cho khách hàng
            </p>
          </div>
          <Link href="/provider/manage-services-item/action">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm mục dịch vụ mới
            </Button>
          </Link>
        </div>

        {/* Service Item Table */}
        <ServiceItemTable
          data={serviceItemData?.serviceItems || []}
          isLoading={isServiceItemFetching}
          page={serviceItemData?.page}
          limit={serviceItemData?.limit}
          totalPages={serviceItemData?.totalPages}
          totalItems={serviceItemData?.totalItems}
          onFilterChange={handleFilterChange}
          searchFilters={searchParams}
        />
      </div>
    </>
  );
}
