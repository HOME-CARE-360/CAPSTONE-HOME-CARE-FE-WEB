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
import { ServiceItem, ServiceItemSearchParams } from '@/lib/api/services/fetchServiceItem';
import { ServiceItemTableFilters } from './ServiceItemTableFilters';
import { ServiceItemTablePagination } from './ServiceItemTablePagination';
import { useServiceItemTableColumns } from './ServiceItemTableColumns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { flexRender } from '@tanstack/react-table';

interface ServiceItemTableProps {
  data: ServiceItem[];
  onFilterChange?: (filters: ServiceItemSearchParams) => void;
  isLoading?: boolean;
  error?: Error | null;
  limit?: number;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  searchFilters?: ServiceItemSearchParams;
}

export function ServiceItemTable({
  data,
  onFilterChange,
  isLoading,
  error,
  limit,
  page,
  totalPages,
  totalItems,
  searchFilters,
}: ServiceItemTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useServiceItemTableColumns();

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<ServiceItem>[],
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
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
    (filters: ServiceItemSearchParams) => {
      if (onFilterChange) {
        onFilterChange(filters);
      }
    },
    [onFilterChange]
  );

  const handleFilterChange = (filters: Partial<ServiceItemSearchParams>) => {
    if (onFilterChange) {
      onFilterChange({
        ...searchFilters,
        ...filters,
      } as ServiceItemSearchParams);
    }
  };

  // Handle filter changes with debounce
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: ServiceItemSearchParams = {
        page: page || 1,
        limit: limit || 10,
        name: (columnFilters.find(f => f.id === 'name')?.value as string) || '',
        sortBy: (columnFilters.find(f => f.id === 'sortBy')?.value as string) || 'createdAt',
        orderBy: (columnFilters.find(f => f.id === 'orderBy')?.value as string) || 'desc',
      };
      debouncedFilterChange(filters);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [columnFilters, limit, page, debouncedFilterChange]);

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
      <ServiceItemTableFilters onFilterChange={handleFilterChange} />
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
            {isLoading ? (
              Array.from({ length: limit || 10 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
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
                  Chưa có mục dịch vụ nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ServiceItemTablePagination
        page={page || 1}
        totalPages={totalPages || 1}
        totalItems={totalItems || 0}
        pageSize={limit || 10}
        onPageChange={(newPage: number) => handleFilterChange({ page: newPage })}
        onPageSizeChange={(newSize: number) =>
          handleFilterChange({
            page: 1,
            limit: newSize,
            sortBy: 'createdAt',
            orderBy: 'desc',
            name: '',
          })
        }
      />
    </div>
  );
}
