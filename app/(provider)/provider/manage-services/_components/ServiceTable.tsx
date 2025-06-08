import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Service } from '@/lib/api/services/fetchService';
import { Category } from '@/lib/api/services/fetchService';
import { ServiceTableFilters } from './ServiceTableFilters';
import { ServiceTablePagination } from './ServiceTablePagination';
import { useServiceTableColumns } from './ServiceTableColumns';
import { SearchServiceParams } from '@/utils/validation/services.schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ServiceTableProps {
  data: Service[];
  onFilterChange?: (filters: Partial<SearchServiceParams>) => void;
  isLoading?: boolean;
  error?: Error | null;
  limit: number;
  page: number;
  totalPages: number;
  totalItems: number;
  categories: Category[];
  searchFilters: SearchServiceParams;
  onEdit?: (service: Service) => void;
}

export function ServiceTable({
  data,
  onFilterChange,
  isLoading,
  error,
  limit,
  page,
  totalPages,
  totalItems,
  categories,
  searchFilters,
  onEdit,
}: ServiceTableProps) {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useServiceTableColumns({ onEdit });

  const pagination = {
    pageIndex: page - 1,
    pageSize: limit,
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleFilterChange = (filters: {
    searchTerm?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minDuration?: number;
    maxDuration?: number;
    limit?: number;
    page?: number;
  }) => {
    if (onFilterChange) {
      onFilterChange({
        ...searchFilters,
        page: filters.page ?? 1,
        limit: filters.limit ?? limit,
        searchTerm: filters.searchTerm,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
    }
  };

  const goToPage = (newPage: number) => {
    if (onFilterChange) {
      onFilterChange({
        ...searchFilters,
        page: newPage,
      });
    }
  };

  // Handle filter changes with debounce
  // React.useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     const filters: SearchServiceParams = {
  //       page: 1, // Reset to first page when filters change
  //       limit,
  //       searchTerm: columnFilters.find(f => f.id === 'name')?.value as string,
  //       category: columnFilters.find(f => f.id === 'categories')?.value as string,
  //       minPrice: columnFilters.find(f => f.id === 'basePrice')?.value as number,
  //       maxPrice: columnFilters.find(f => f.id === 'virtualPrice')?.value as number,
  //     };
  //     debouncedFilterChange(filters);
  //   }, 300); // 300ms debounce

  //   return () => clearTimeout(timeoutId);
  // }, [columnFilters, limit, debouncedFilterChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">{t('loading_data')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg border-destructive bg-destructive/10">
        <div className="flex flex-col items-center gap-2 text-center max-w-md p-6">
          <div className="text-lg font-medium text-destructive">{t('error_loading_data')}</div>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : t('error_loading_data')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ServiceTableFilters
        table={table}
        categories={categories}
        // limit={limit}
        // page={page}
        onFilterChange={handleFilterChange}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('no_services_found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ServiceTablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={goToPage}
      />
    </div>
  );
}
