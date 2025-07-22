import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { UserResponseType } from '@/schemaValidations/admin.schema';

interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

interface UserTableFiltersProps {
  table: Table<UserResponseType>;
  onFilterChange?: (filters: Partial<UserSearchParams>) => void;
}

export function UserTableFilters({ table, onFilterChange }: UserTableFiltersProps) {
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    if (onFilterChange) {
      const filters: Partial<UserSearchParams> = {};

      switch (key) {
        case 'search':
          filters.search = (value as string) || '';
          break;
        case 'status':
          filters.status = (value as string) || '';
          break;
        case 'role':
          filters.role = (value as string) || '';
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
        placeholder="Tìm kiếm theo tên..."
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
