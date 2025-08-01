'use client';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { ServiceTable } from './components/ServiceTable';
import { ServiceItemTable } from './components/ServiceItemTable';
import { ServiceItemSheet } from './components/ServiceItemSheet';
import { ServiceSheet } from './components/ServiceSheet';
import { Plus, Package, Wrench } from 'lucide-react';
import { useServiceItems, useServiceManager } from '@/hooks/useServiceManager';
import { useCategories } from '@/hooks/useCategory';
import { useState } from 'react';
import {
  ServiceItemSearchParams,
  ServiceManagerSearchParams,
  ServiceManager,
} from '@/lib/api/services/fetchServiceManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ManageServicesPage() {
  const [searchParams, setSearchParams] = useState<ServiceManagerSearchParams>({
    sortBy: 'createdAt',
    orderBy: 'desc',
    name: '',
    limit: 10,
    page: 1,
  });
  const [searchParamsItem, setSearchParamsItem] = useState<ServiceItemSearchParams>({
    sortBy: 'createdAt',
    orderBy: 'desc',
    name: '',
    brand: '',
    limit: 10,
    page: 1,
  });

  // State for editing services
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceManager | null>(null);

  const { data: serviceData, isFetching: isServiceFetching } = useServiceManager(searchParams);
  const {
    data: serviceItemData,
    isFetching: isServiceItemFetching,
    error: serviceItemError,
  } = useServiceItems(searchParamsItem);
  const { data: categoryData, isFetching: isCategoryFetching } = useCategories();

  const handleFilterChange = (params: Partial<ServiceManagerSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  };

  const handleFilterChangeItem = (params: Partial<ServiceItemSearchParams>) => {
    setSearchParamsItem(prev => ({ ...prev, ...params }));
  };

  const handleEditService = (service: ServiceManager) => {
    setSelectedService(service);
    setIsEditSheetOpen(true);
  };

  const handleCloseEditSheet = () => {
    setIsEditSheetOpen(false);
    setSelectedService(null);
  };

  return (
    <>
      <SiteHeader title="Quản lý dịch vụ" />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý dịch vụ</h1>
            <p className="text-muted-foreground">Quản lý các dịch vụ và vật tư thiết bị của bạn</p>
          </div>
        </div>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Vật tư thiết bị
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Dịch vụ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Dịch vụ</h2>
                <p className="text-sm text-muted-foreground">
                  Quản lý các dịch vụ mà bạn cung cấp cho khách hàng
                </p>
              </div>
              <ServiceSheet
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm dịch vụ mới
                  </Button>
                }
              />
            </div>

            <ServiceTable
              data={serviceData?.data || []}
              categories={categoryData?.categories || []}
              isLoading={isServiceFetching || isCategoryFetching}
              page={serviceData?.page}
              limit={serviceData?.limit}
              totalPages={serviceData?.totalPages}
              totalItems={serviceData?.totalItems}
              onFilterChange={handleFilterChange}
              searchFilters={searchParams}
              onEdit={handleEditService}
            />
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Vật tư thiết bị</h2>
                <p className="text-sm text-muted-foreground">
                  Quản lý các vật tư, thiết bị sử dụng trong dịch vụ
                </p>
              </div>
              <ServiceItemSheet
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm vật tư mới
                  </Button>
                }
              />
            </div>

            <ServiceItemTable
              data={Array.isArray(serviceItemData?.data?.data) ? serviceItemData.data.data : []}
              isLoading={isServiceItemFetching}
              error={serviceItemError}
              page={serviceItemData?.data?.page || 1}
              limit={serviceItemData?.data?.limit || 10}
              totalPages={serviceItemData?.data?.totalPages || 1}
              totalItems={serviceItemData?.data?.totalItems || 0}
              onFilterChange={handleFilterChangeItem}
              searchFilters={searchParamsItem}
            />
          </TabsContent>
        </Tabs>

        {/* Edit Service Sheet */}
        <ServiceSheet
          serviceId={selectedService?.id}
          open={isEditSheetOpen}
          onOpenChange={open => {
            if (!open) {
              handleCloseEditSheet();
            }
          }}
        />
      </div>
    </>
  );
}
