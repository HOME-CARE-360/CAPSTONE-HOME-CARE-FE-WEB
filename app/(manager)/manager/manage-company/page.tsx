'use client';

import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { useGetListProvider } from '@/hooks/useManager';
import { useState, useCallback } from 'react';
import {
  CompanySearchParams,
  CompanyType,
  VerificationStatus,
} from '@/lib/api/services/fetchManager';
import { CompanyList } from './components/CompanyList';
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

export default function ManageCompanyPage() {
  const [filters, setFilters] = useState<CompanySearchParams>({
    page: 1,
    limit: 12,
    name: '',
    companyType: undefined,
    verificationStatus: undefined,
  });

  const { data, isFetching } = useGetListProvider(filters);
  const companies = data?.data || [];

  const handleFilterChange = useCallback((partial: Partial<CompanySearchParams>) => {
    setFilters(prev => ({ ...prev, ...partial, page: 1 }));
  }, []);

  return (
    <>
      <SiteHeader title="Quản lý công ty" />
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
              aria-label="Tìm kiếm công ty"
            >
              <Input
                placeholder="Tìm kiếm công ty..."
                value={filters.name}
                onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
                className="pl-10"
                name="company-search"
                aria-label="Tìm kiếm công ty"
                autoComplete="off"
              />
              <Button type="submit" className="ml-2 px-4" aria-label="Tìm kiếm">
                Tìm
              </Button>
            </form>
          </div>
          <Select
            value={filters.companyType || 'all'}
            onValueChange={v =>
              handleFilterChange({ companyType: v === 'all' ? undefined : (v as CompanyType) })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại hình" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại hình</SelectItem>
              <SelectItem value={CompanyType.SOLE_PROPRIETORSHIP}>Doanh nghiệp tư nhân</SelectItem>
              <SelectItem value={CompanyType.LIMITED_LIABILITY}>Công ty TNHH</SelectItem>
              <SelectItem value={CompanyType.JOINT_STOCK}>Công ty cổ phần</SelectItem>
              <SelectItem value={CompanyType.PARTNERSHIP}>Công ty hợp danh</SelectItem>
              <SelectItem value={CompanyType.OTHER}>Khác</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.verificationStatus || 'all'}
            onValueChange={v =>
              handleFilterChange({
                verificationStatus: v === 'all' ? undefined : (v as VerificationStatus),
              })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value={VerificationStatus.PENDING}>Chờ duyệt</SelectItem>
              <SelectItem value={VerificationStatus.VERIFIED}>Đã duyệt</SelectItem>
              <SelectItem value={VerificationStatus.REJECTED}>Từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                page: 1,
                limit: 12,
                name: '',
                companyType: undefined,
                verificationStatus: undefined,
              })
            }
          >
            Xóa bộ lọc
          </Button>
        </div>

        {/* Company Grid */}
        <CompanyList companies={companies} isLoading={isFetching} />
      </div>
    </>
  );
}
