import { useTranslation } from 'react-i18next';
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
import { Service } from '@/lib/api/services/fetchService';
import { Category } from '@/lib/api/services/fetchService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ServiceTableFiltersProps {
  table: Table<Service>;
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
  const { t } = useTranslation();

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
    <div className="flex items-center gap-4">
      <Input
        placeholder={t('search_services')}
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
          <SelectValue placeholder={t('select_category')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('all_categories')}</SelectItem>
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
          <SelectValue placeholder={t('items_per_page')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5 {t('items')}</SelectItem>
          <SelectItem value="10">10 {t('items')}</SelectItem>
          <SelectItem value="20">20 {t('items')}</SelectItem>
          <SelectItem value="50">50 {t('items')}</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {t('advanced_filters')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t('price_range')}</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('min_price')}</label>
                  <Input
                    type="number"
                    placeholder={t('min_price')}
                    value={(table.getColumn('basePrice')?.getFilterValue() as number) ?? ''}
                    onChange={e => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      table.getColumn('basePrice')?.setFilterValue(value);
                      handleFilterChange('basePrice', value);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('max_price')}</label>
                  <Input
                    type="number"
                    placeholder={t('max_price')}
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
              <h4 className="font-medium leading-none">{t('duration')}</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('min_duration')}</label>
                  <Input
                    type="number"
                    placeholder={t('min_duration')}
                    value={(table.getColumn('durationMinutes')?.getFilterValue() as number) ?? ''}
                    onChange={e => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      table.getColumn('durationMinutes')?.setFilterValue(value);
                      handleFilterChange('durationMinutes', value);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('max_duration')}</label>
                  <Input
                    type="number"
                    placeholder={t('max_duration')}
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
                {t('reset_filters')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            <ColumnsIcon className="mr-2 h-4 w-4" />
            {t('columns')}
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
                  {t(`service.${column.id}`)}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
