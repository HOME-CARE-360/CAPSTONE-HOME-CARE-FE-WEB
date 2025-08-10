'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { ServiceTable } from '@/app/(provider)/provider/manage-services/components/ServiceTable';
import { useServiceManager } from '@/hooks/useServiceManager';
import { ServiceSheet } from '@/app/(provider)/provider/manage-services/components/ServiceSheet';
import { ServiceManagerSearchParams, ServiceManager } from '@/lib/api/services/fetchServiceManager';

export default function ManageService() {
  const [searchParams, setSearchParams] = useState<ServiceManagerSearchParams>({
    sortBy: 'createdAt',
    orderBy: 'desc',
    name: '',
    limit: 10,
    page: 1,
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceManager | undefined>(undefined);

  const { data: serviceData, isFetching } = useServiceManager(searchParams);

  const handleFilterChange = (params: Partial<typeof searchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  };

  const handleCreateService = () => {
    setEditingService(undefined);
    setIsSheetOpen(true);
  };

  const handleEditService = (service: ServiceManager) => {
    setEditingService(service);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingService(undefined);
  };

  return (
    <>
      <SiteHeader title="Quản lý dịch vụ" />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý dịch vụ</h1>
            <p className="text-muted-foreground">Quản lý và cập nhật các dịch vụ</p>
          </div>
          <Button onClick={handleCreateService}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm dịch vụ mới
          </Button>
        </div>
        {/* Service Table */}
        <ServiceTable
          data={serviceData?.data || []}
          isLoading={isFetching}
          page={serviceData?.page}
          limit={serviceData?.limit}
          totalPages={serviceData?.totalPages}
          totalItems={serviceData?.totalItems}
          onFilterChange={handleFilterChange}
          searchFilters={searchParams}
          onEdit={handleEditService}
        />
        {/* Service Sheet */}
        <ServiceSheet
          serviceId={editingService?.id}
          open={isSheetOpen}
          onOpenChange={open => {
            if (!open) handleCloseSheet();
          }}
        />
      </div>
    </>
  );
}
