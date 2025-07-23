import { Input } from '@/components/ui/input';
import { Staff, StaffSearchParams } from '@/lib/api/services/fetchStaff';
import { Table } from '@tanstack/react-table';
import { Category } from '@/lib/api/services/fetchCategory';

interface StaffTableFiltersProps {
  table: Table<Staff>;
  categories: Category[];
  onFilterChange?: (filters: Partial<StaffSearchParams>) => void;
}

export function StaffTableFilters({ table, onFilterChange }: StaffTableFiltersProps) {
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    if (onFilterChange) {
      const filters: Partial<StaffSearchParams> = {};

      switch (key) {
        case 'name':
          filters.name = (value as string) || '';
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
        placeholder="Tìm kiếm nhân viên..."
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={event => {
          table.getColumn('name')?.setFilterValue(event.target.value);
          handleFilterChange('name', event.target.value);
        }}
        className="max-w-sm"
      />
    </div>
  );
}
