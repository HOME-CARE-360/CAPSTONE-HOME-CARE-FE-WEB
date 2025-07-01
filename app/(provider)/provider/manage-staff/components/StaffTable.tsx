'use client';
import * as React from 'react';
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
import { useStaffTableColumns } from './StaffTableColumns';
import { StaffTableFilters } from './StaffTableFilters';
import { StaffTablePagination } from './StaffTablePagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Staff, StaffSearchParams } from '@/lib/api/services/fetchStaff';
import { Category } from '@/lib/api/services/fetchCategory';

interface StaffTableProps {
  data: Staff[];
  onFilterChange?: (filters: Partial<StaffSearchParams>) => void;
  isLoading?: boolean;
  error?: Error | null;
  limit?: number;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  categories?: Category[];
  searchFilters?: StaffSearchParams;
  onEdit?: (staff: Staff) => void;
  onDelete?: (staff: Staff) => void;
}

export function StaffTable({
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
  onDelete,
}: StaffTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useStaffTableColumns({
    onEdit,
    onDelete,
  });

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

  const handleFilterChange = (filters: Partial<StaffSearchParams>) => {
    if (onFilterChange) {
      onFilterChange({
        ...searchFilters,
        ...filters,
      } as StaffSearchParams);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg border-destructive bg-destructive/10">
        <div className="flex flex-col items-center gap-2 text-center max-w-md p-6">
          <div className="text-lg font-medium text-destructive">Error Loading Staff</div>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Failed to load staff data. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StaffTableFilters
        table={table}
        categories={categories || []}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
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
                  Không tìm thấy nhân viên
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <StaffTablePagination
        page={page || 1}
        totalPages={totalPages || 1}
        totalItems={totalItems || 0}
        pageSize={limit || 10}
        onPageChange={(newPage: number) => handleFilterChange({ page: newPage })}
        onPageSizeChange={(newSize: number) =>
          handleFilterChange({
            page: 1,
            limit: newSize,
            orderBy: 'desc',
          })
        }
      />
    </div>
  );
}
