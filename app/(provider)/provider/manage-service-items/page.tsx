'use client';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { Plus, Search } from 'lucide-react';
import { useServiceItems } from '@/hooks/useServiceManager';
import { useState, useCallback } from 'react';
import { ServiceItemSearchParams, ServiceItem } from '@/lib/api/services/fetchServiceManager';
import { ServiceItemList } from './components/ServiceItemList';
import { SheetServiceItem } from './components/SheetServiceItem';
import { Input } from '@/components/ui/input';

export default function ManageServiceItemsPage() {
  const [searchParams, setSearchParams] = useState<ServiceItemSearchParams>({
    sortBy: 'createdAt',
    orderBy: 'desc',
    name: '',
    brand: '',
    isActive: undefined,
    limit: 10,
    page: 1,
  });

  // State for editing service items
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedServiceItem, setSelectedServiceItem] = useState<ServiceItem | null>(null);

  const { data: serviceItemData, isFetching: isServiceItemFetching } =
    useServiceItems(searchParams);

  const handleEditServiceItem = useCallback((serviceItem: ServiceItem) => {
    setSelectedServiceItem(serviceItem);
    setIsEditSheetOpen(true);
  }, []);

  const handleCloseEditSheet = useCallback(() => {
    setIsEditSheetOpen(false);
    setSelectedServiceItem(null);
  }, []);

  const handleFilterChange = useCallback((filters: Partial<ServiceItemSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...filters,
      page: 1,
    }));
  }, []);

  const serviceItems = serviceItemData?.data?.data || [];

  return (
    <>
      <SiteHeader title="Quản lý vật tư" />

      <div className="space-y-6">
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
              aria-label="Tìm kiếm vật tư"
            >
              <Input
                placeholder="Tìm kiếm vật tư..."
                value={searchParams.name}
                onChange={e => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                className="pl-10"
                name="service-search"
                aria-label="Tìm kiếm vật tư"
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

          <SheetServiceItem
            trigger={
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới
              </Button>
            }
          />
        </div>

        {/* Service Items List */}
        <div className="space-y-4">
          {/* <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Danh sách vật tư</h2>
            <div className="text-sm text-muted-foreground">
              {serviceItems.length} vật tư
            </div>
          </div> */}

          <ServiceItemList
            serviceItems={serviceItems}
            isLoading={isServiceItemFetching}
            onEdit={handleEditServiceItem}
          />
        </div>

        {/* Edit Service Item Sheet */}
        <SheetServiceItem
          serviceItem={selectedServiceItem}
          open={isEditSheetOpen}
          onOpenChange={handleCloseEditSheet}
        />
      </div>
    </>
  );
}
