import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { Category } from '@/lib/api/services/fetchCategory';
import { ServiceManager, ServiceManagerSearchParams } from '@/lib/api/services/fetchServiceManager';

interface ServiceTableFiltersProps {
  table: Table<ServiceManager>;
  categories: Category[];
  onFilterChange?: (filters: Partial<ServiceManagerSearchParams>) => void;
}

export function ServiceTableFilters({ table, onFilterChange }: ServiceTableFiltersProps) {
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    if (onFilterChange) {
      const filters: Partial<ServiceManagerSearchParams> = {};

      switch (key) {
        case 'name':
          filters.name = (value as string) || '';
          break;
        case 'minPrice':
          // filters.minPrice = value as number || 0;
          break;
        case 'maxPrice':
          // filters.maxPrice = value as number || 0;
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
        placeholder={'Tìm kiếm dịch vụ'}
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={event => {
          table.getColumn('name')?.setFilterValue(event.target.value);
          handleFilterChange('name', event.target.value);
        }}
        className="max-w-sm"
      />
      {/* <Select
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
        </Select> */}
      {/* <Popover>
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
                      // handleFilterChange('minPrice', value);
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
                      // handleFilterChange('maxPrice', value);
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
      </Popover> */}
      {/* <DropdownMenu>
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
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu> */}
    </div>
  );
}
