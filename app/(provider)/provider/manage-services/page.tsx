'use client';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { Plus, Search } from 'lucide-react';
import { useServiceManager } from '@/hooks/useServiceManager';
import { useState, useCallback } from 'react';
import { ServiceManagerSearchParams, ServiceManager } from '@/lib/api/services/fetchServiceManager';
import { ServiceList } from './components/ServiceList';
import { SheetService } from './components/SheetService';
import { Input } from '@/components/ui/input';

export default function ManageServicesPage() {
  const [searchParams, setSearchParams] = useState<ServiceManagerSearchParams>({
    sortBy: 'createdAt',
    orderBy: 'desc',
    name: '',
    limit: 10,
    page: 1,
  });

  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceManager | null>(null);

  const { data: serviceData, isFetching: isServiceFetching } = useServiceManager(searchParams);

  const handleEditService = useCallback((service: ServiceManager) => {
    setSelectedService(service);
    setIsEditSheetOpen(true);
  }, []);

  const handleCloseEditSheet = useCallback(() => {
    setIsEditSheetOpen(false);
    setSelectedService(null);
  }, []);

  const handleFilterChange = useCallback((filters: Partial<ServiceManagerSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...filters,
      page: 1,
    }));
  }, []);

  const services = serviceData?.data || [];

  return (
    <>
      <SiteHeader title="Quản lý dịch vụ" />

      <div className="container space-y-6">
        {/* Redesigned Filter Bar */}
        <div className="flex items-center justify-between gap-4 bg-white border-b-2 p-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <form
              className="flex"
              onSubmit={e => {
                e.preventDefault();
                handleFilterChange({ name: searchParams.name });
              }}
              role="search"
              aria-label="Tìm kiếm dịch vụ"
            >
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                value={searchParams.name}
                onChange={e => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                className="pl-10"
                name="service-search"
                aria-label="Tìm kiếm dịch vụ"
                autoComplete="off"
              />
              <Button
                type="submit"
                className="ml-2 px-4 bg-green-500 hover:bg-green-600 text-white"
                aria-label="Tìm kiếm"
              >
                Tìm
              </Button>
            </form>
          </div>

          {/* View Mode Buttons */}
          {/* <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-9 w-9 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div> */}

          <SheetService
            trigger={
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới
              </Button>
            }
          />
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <ServiceList
            services={services}
            isLoading={isServiceFetching}
            onEdit={handleEditService}
          />
        </div>

        {/* Edit Service Sheet */}
        <SheetService
          service={selectedService}
          open={isEditSheetOpen}
          onOpenChange={handleCloseEditSheet}
        />
      </div>
    </>
  );
}
