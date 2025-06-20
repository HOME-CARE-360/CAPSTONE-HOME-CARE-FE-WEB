import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColumnsIcon, ChevronDownIcon, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table } from '@tanstack/react-table';
import { Category } from '@/lib/api/services/fetchCategory';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ServiceManager } from '@/lib/api/services/fetchServiceManager';

interface ServiceTableFiltersProps {
  table: Table<ServiceManager>;
  categories: Category[];
  // onLimitChange: (value: string) => void;
  onFilterChange?: (filters: {
    searchTerm?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minDuration?: number;
    maxDuration?: number;
    limit?: number;
    page?: number;
  }) => void;
}

export function ServiceTableFilters({
  table,
  categories,
  onFilterChange,
}: ServiceTableFiltersProps) {
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    if (onFilterChange) {
      onFilterChange({
        searchTerm: key === 'name' ? (value as string) : undefined,
        category: key === 'categories' ? (value as string) : undefined,
        minPrice: key === 'basePrice' ? (value as number) : undefined,
        maxPrice: key === 'virtualPrice' ? (value as number) : undefined,
        limit: key === 'limit' ? (value as number) : undefined,
        page: key === 'page' ? (value as number) : 1,
      });
    }
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <Input
        placeholder={'Tìm kiếm dịch vụ'}
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={event => {
          table.getColumn('name')?.setFilterValue(event.target.value);
          handleFilterChange('name', event.target.value);
        }}
        className="max-w-sm"
      />
      <Select
        value={(table.getColumn('categories')?.getFilterValue() as string) ?? 'all'}
        onValueChange={value => {
          table.getColumn('categories')?.setFilterValue(value);
          handleFilterChange('categories', value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={'Loại dịch vụ'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Loại dịch vụ</SelectItem>
          {categories.map((category, index) => (
            <SelectItem key={index} value={category.name.toString()}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={value => {
          handleFilterChange('limit', parseInt(value));
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={'Số lượng'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10 </SelectItem>
          <SelectItem value="20">20 </SelectItem>
          <SelectItem value="50">50 </SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Lọc nâng cao
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-90">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Khoảng giá</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Giá thấp</label>
                  <Input
                    type="number"
                    placeholder={'Giá thấp'}
                    value={(table.getColumn('basePrice')?.getFilterValue() as number) ?? ''}
                    onChange={e => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      table.getColumn('basePrice')?.setFilterValue(value);
                      handleFilterChange('basePrice', value);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Giá cao</label>
                  <Input
                    type="number"
                    placeholder={'Giá cao'}
                    value={(table.getColumn('virtualPrice')?.getFilterValue() as number) ?? ''}
                    onChange={e => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      table.getColumn('virtualPrice')?.setFilterValue(value);
                      handleFilterChange('virtualPrice', value);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium leading-none">Khoảng thời gian</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Thời gian thấp nhất</label>
                  <Input
                    type="number"
                    placeholder={'Thời gian thấp nhất'}
                    value={(table.getColumn('durationMinutes')?.getFilterValue() as number) ?? ''}
                    onChange={e => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      table.getColumn('durationMinutes')?.setFilterValue(value);
                      handleFilterChange('durationMinutes', value);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Thời gian cao nhất</label>
                  <Input
                    type="number"
                    placeholder={'Thời gian cao nhất'}
                    value={(table.getColumn('durationMinutes')?.getFilterValue() as number) ?? ''}
                    onChange={e => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      table.getColumn('durationMinutes')?.setFilterValue(value);
                      handleFilterChange('durationMinutes', value);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  table.resetColumnFilters();
                  if (onFilterChange) {
                    onFilterChange({
                      page: 1,
                    });
                  }
                }}
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            <ColumnsIcon className="mr-2 h-4 w-4" />
            Cột
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter(column => column.getCanHide())
            .map(column => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                >
                  {`${column.id}`}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
