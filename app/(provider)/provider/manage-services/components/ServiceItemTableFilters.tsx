import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table } from '@tanstack/react-table';
import { ServiceItem, ServiceItemSearchParams } from '@/lib/api/services/fetchServiceManager';

interface ServiceItemTableFiltersProps {
  table: Table<ServiceItem>;
  onFilterChange?: (filters: Partial<ServiceItemSearchParams>) => void;
}

export function ServiceItemTableFilters({ table, onFilterChange }: ServiceItemTableFiltersProps) {
  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    if (onFilterChange) {
      const filters: Partial<ServiceItemSearchParams> = {};

      switch (key) {
        case 'name':
          filters.name = (value as string) || '';
          break;
        case 'brand':
          filters.brand = (value as string) || '';
          break;
        case 'isActive':
          filters.isActive = value === 'all' ? undefined : (value as boolean);
          break;
        case 'limit':
          filters.limit = (value as number) || 10;
          break;
        case 'page':
          filters.page = (value as number) || 1;
          break;
      }

      onFilterChange(filters);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <Input
        placeholder="Tìm kiếm vật tư..."
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={event => {
          table.getColumn('name')?.setFilterValue(event.target.value);
          handleFilterChange('name', event.target.value);
        }}
        className="max-w-sm"
      />

      <Input
        placeholder="Tìm theo thương hiệu..."
        value={(table.getColumn('brand')?.getFilterValue() as string) ?? ''}
        onChange={event => {
          table.getColumn('brand')?.setFilterValue(event.target.value);
          handleFilterChange('brand', event.target.value);
        }}
        className="max-w-sm"
      />

      <Select
        onValueChange={value => {
          const filterValue = value === 'all' ? undefined : value === 'true';
          table.getColumn('isActive')?.setFilterValue(filterValue);
          handleFilterChange('isActive', filterValue);
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="true">Hoạt động</SelectItem>
          <SelectItem value="false">Tạm ngưng</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
