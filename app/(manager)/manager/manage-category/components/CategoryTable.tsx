'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { Category } from '@/lib/api/services/fetchCategory';
import { CategoryTableFilters } from './CategoryTableFilters';
import { CategoryTablePagination } from './CategoryTablePagination';
import { useCategoryTableColumns } from './CategoryTableColumns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryFilters {
  name?: string;
  page?: number;
  limit?: number;
}

interface CategoryTableProps {
  data: Category[];
  onFilterChange?: (filters: CategoryFilters) => void;
  isLoading?: boolean;
  error?: Error | null;
  limit?: number;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  searchFilters?: CategoryFilters;
}

export function CategoryTable({
  data,
  onFilterChange,
  isLoading,
  error,
  limit = 10,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  searchFilters,
}: CategoryTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useCategoryTableColumns();

  const table = useReactTable({
    data,
    columns,
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
  const debouncedFilterChange = useCallback(
    (filters: CategoryFilters) => {
      if (onFilterChange) {
        onFilterChange(filters);
      }
    },
    [onFilterChange]
  );

  const handleFilterChange = (filters: Partial<CategoryFilters>) => {
    if (onFilterChange) {
      onFilterChange({
        ...searchFilters,
        ...filters,
      });
    }
  };

  // Handle filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: CategoryFilters = {
        page: page || 1,
        limit: limit || 10,
        name: (columnFilters.find(f => f.id === 'name')?.value as string) || '',
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
      <CategoryTableFilters table={table} onFilterChange={handleFilterChange} />
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
                  Chưa có danh mục nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <CategoryTablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={limit}
        onPageChange={(newPage: number) => handleFilterChange({ page: newPage })}
        onPageSizeChange={(newSize: number) =>
          handleFilterChange({
            page: 1,
            limit: newSize,
            name: '',
          })
        }
      />
    </div>
  );
}
