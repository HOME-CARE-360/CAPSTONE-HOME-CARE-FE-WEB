'use client';

import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { Category } from '@/lib/api/services/fetchCategory';

interface CategoryFilters {
  name?: string;
  page?: number;
  limit?: number;
}

interface CategoryTableFiltersProps {
  table: Table<Category>;
  onFilterChange?: (filters: Partial<CategoryFilters>) => void;
}

export function CategoryTableFilters({ table, onFilterChange }: CategoryTableFiltersProps) {
  const handleFilterChange = (key: string, value: string | undefined) => {
    if (onFilterChange) {
      const filters: Partial<CategoryFilters> = {};

      switch (key) {
        case 'name':
          filters.name = value || '';
          break;
      }

      onFilterChange(filters);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <Input
        placeholder="Tìm kiếm danh mục..."
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
