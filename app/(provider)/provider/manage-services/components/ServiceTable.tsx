/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as React from 'react';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { ServiceManager } from '@/lib/api/services/fetchServiceManager';
import { Category } from '@/lib/api/services/fetchCategory';
import { ServiceTableFilters } from './ServiceTableFilters';
import { ServiceTablePagination } from './ServiceTablePagination';
import { useServiceTableColumns } from './ServiceTableColumns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ServiceSearchParams } from '@/lib/api/services/fetchService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/numbers/formatCurrency';

// interface ServiceSearchParams {
//   page: number;
//   limit: number;
//   searchTerm?: string;
//   category?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   minDuration?: number;
//   maxDuration?: number;
// }

interface ServiceTableProps {
  data: ServiceManager[];
  onFilterChange?: (filters: ServiceSearchParams) => void;
  isLoading?: boolean;
  error?: Error | null;
  limit?: number;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  categories?: Category[];
  searchFilters?: ServiceSearchParams;
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
}: ServiceTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [currentPage, setCurrentPage] = React.useState(page || 1);
  const [pageSize, setPageSize] = React.useState(limit || 10);

  const columns = useServiceTableColumns();

  // const pagination = {
  //   pageIndex: page ? page - 1 : page,
  //   pageSize: limit,
  // };

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<ServiceManager>[],
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      // pagination,
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

  // Debounce filter changes
  const debouncedFilterChange = React.useCallback(
    (filters: ServiceSearchParams) => {
      if (onFilterChange) {
        onFilterChange(filters);
      }
    },
    [onFilterChange]
  );

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

  // Handle filter changes with debounce
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: ServiceSearchParams = {
        page, // Reset to first page when filters change
        limit,
        searchTerm: columnFilters.find(f => f.id === 'name')?.value as string,
        category: columnFilters.find(f => f.id === 'categories')?.value as string,
        minPrice: columnFilters.find(f => f.id === 'basePrice')?.value as number,
        maxPrice: columnFilters.find(f => f.id === 'virtualPrice')?.value as number,
      };
      debouncedFilterChange(filters);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [columnFilters, limit, debouncedFilterChange]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg border-destructive bg-destructive/10">
        <div className="flex flex-col items-center gap-2 text-center max-w-md p-6">
          <div className="text-lg font-medium text-destructive">Lỗi</div>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Lỗi khi tải dữ liệu'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ServiceTableFilters
        table={table}
        categories={categories || []}
        // limit={limit}
        // page={page}
        onFilterChange={handleFilterChange}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên dịch vụ</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Giá cơ bản</TableHead>
              <TableHead>Giá ưu đãi</TableHead>
              <TableHead>Thời gian (phút)</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Chưa có dịch vụ nào
                </TableCell>
              </TableRow>
            ) : (
              data.map(service => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>{formatCurrency(service.basePrice)}</TableCell>
                  <TableCell>{formatCurrency(service.virtualPrice)}</TableCell>
                  <TableCell>{service.durationMinutes}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Chỉnh sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ServiceTablePagination
        page={currentPage}
        totalPages={totalPages || 1}
        totalItems={totalItems || 0}
        pageSize={pageSize}
        onPageChange={page => setCurrentPage(page)}
        onPageSizeChange={size => {
          setPageSize(size);
          setCurrentPage(1); // Reset to first page when changing page size
        }}
      />
    </div>
  );
}
