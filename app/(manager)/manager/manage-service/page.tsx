'use client';

import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { useGetListService } from '@/hooks/useManager';
import { useState, useCallback } from 'react';
import { Service, ServiceSearchParams, ServiceStatus } from '@/lib/api/services/fetchManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceList } from './components/ServiceList';

export default function ManageServicePage() {
  const [filters, setFilters] = useState<Partial<ServiceSearchParams>>({
    name: '',
    status: 'PENDING',
    page: 1,
    limit: 12,
  });

  const { data, isFetching } = useGetListService(filters);
  const services: Service[] = data?.data || [];

  const handleFilterChange = useCallback((partial: Partial<ServiceSearchParams>) => {
    setFilters(prev => ({ ...prev, ...partial, page: 1 }));
  }, []);

  return (
    <>
      <SiteHeader title="Quản lý dịch vụ" />
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 bg-white border-b-2 p-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <form
              className="flex"
              onSubmit={e => {
                e.preventDefault();
                handleFilterChange({ name: filters.name });
              }}
              role="search"
              aria-label="Tìm kiếm dịch vụ"
            >
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                value={filters.name}
                onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
                className="pl-10"
                name="service-search"
                aria-label="Tìm kiếm dịch vụ"
                autoComplete="off"
              />
              <Button type="submit" className="ml-2 px-4" aria-label="Tìm kiếm">
                Tìm
              </Button>
            </form>
          </div>

          <Select
            value={(filters.status as ServiceStatus) || 'PENDING'}
            onValueChange={v => handleFilterChange({ status: v as ServiceStatus })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="ACCEPTED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
              <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setFilters({ name: '', status: 'PENDING', page: 1, limit: 12 })}
          >
            Xóa bộ lọc
          </Button>
        </div>

        {/* Service Grid */}
        <ServiceList services={services} isLoading={isFetching} />
      </div>
    </>
  );
}
