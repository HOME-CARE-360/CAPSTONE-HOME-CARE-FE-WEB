/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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
import { ServiceItem, ServiceItemSearchParams } from '@/lib/api/services/fetchServiceManager';
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
  error?: unknown;
  limit?: number;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  searchFilters?: ServiceItemSearchParams;
}

export function ServiceItemTable({
  data = [],
  onFilterChange,
  isLoading = false,
  error,
  limit = 10,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  searchFilters,
}: ServiceItemTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useServiceItemTableColumns();

  const debouncedFilterChange = useCallback(
    (filters: ServiceItemSearchParams) => {
      if (onFilterChange && filters) {
        try {
          onFilterChange(filters);
        } catch (error) {
          console.error('Error in filter change:', error);
        }
      }
    },
    [onFilterChange]
  );

  const handleFilterChange = useCallback(
    (filters: Partial<ServiceItemSearchParams>) => {
      if (onFilterChange) {
        const currentFilters = searchFilters || {};
        onFilterChange({
          ...currentFilters,
          ...filters,
        } as ServiceItemSearchParams);
      }
    },
    [onFilterChange, searchFilters]
  );

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const safeColumns = useMemo(() => columns || [], [columns]);

  const table = useReactTable({
    data: safeData,
    columns: safeColumns as ColumnDef<ServiceItem>[],
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!Array.isArray(columnFilters)) return;

      const filters: ServiceItemSearchParams = {
        page: page || 1,
        limit: limit || 10,
        name: (columnFilters.find(f => f?.id === 'name')?.value as string) || '',
        brand: (columnFilters.find(f => f?.id === 'brand')?.value as string) || '',
        isActive: columnFilters.find(f => f?.id === 'isActive')?.value as boolean | undefined,
        sortBy: (columnFilters.find(f => f?.id === 'sortBy')?.value as string) || 'createdAt',
        orderBy: (columnFilters.find(f => f?.id === 'orderBy')?.value as string) || 'desc',
      };

      if (debouncedFilterChange) {
        debouncedFilterChange(filters);
      }
    }, 300);

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
      <ServiceItemTableFilters table={table} onFilterChange={handleFilterChange} />
      <div className="rounded-md border">
        <Table className="table-fixed">
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
              Array.from({ length: limit }).map((_, index) => (
                <TableRow key={index}>
                  {safeColumns.map((_column: ColumnDef<ServiceItem>, colIndex: number) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={`row-${row.original.id}`}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={`cell-${row.original.id}-${cell.column.id}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={safeColumns.length} className="h-24 text-center">
                  Chưa có vật tư nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ServiceItemTablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={limit}
        onPageChange={(newPage: number) => handleFilterChange({ page: newPage })}
        onPageSizeChange={(newSize: number) =>
          handleFilterChange({
            page: 1,
            limit: newSize,
            sortBy: 'createdAt',
            orderBy: 'desc',
            name: '',
            brand: '',
            isActive: undefined,
          })
        }
      />
    </div>
  );
}
