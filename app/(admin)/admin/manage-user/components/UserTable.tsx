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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { UserTableFilters } from '@/app/(admin)/admin/manage-user/components/UserTableFilters';
import { UserTablePagination } from '@/app/(admin)/admin/manage-user/components/UserTablePagination';
import { useUserTableColumns } from '@/app/(admin)/admin/manage-user/components/UserTableColumns';
import { UserResponseType } from '@/schemaValidations/admin.schema';

interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

interface UserTableProps {
  data: UserResponseType[];
  onFilterChange?: (filters: Partial<UserSearchParams>) => void;
  isLoading?: boolean;
  error?: Error | null;
  limit?: number;
  page?: number;
  total?: number;
  searchFilters?: UserSearchParams;
  onEdit?: (user: UserResponseType) => void;
  onDelete?: (user: UserResponseType) => void;
  onResetPassword?: (user: UserResponseType) => void;
  onAssignRole?: (user: UserResponseType) => void;
}

export function UserTable({
  data,
  onFilterChange,
  isLoading,
  error,
  limit,
  page,
  total,
  searchFilters,
  onEdit,
  onDelete,
}: UserTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useUserTableColumns({
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

  const handleFilterChange = (filters: Partial<UserSearchParams>) => {
    if (onFilterChange) {
      onFilterChange({
        ...searchFilters,
        ...filters,
      } as UserSearchParams);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg border-destructive bg-destructive/10">
        <div className="flex flex-col items-center gap-2 text-center max-w-md p-6">
          <div className="text-lg font-medium text-destructive">Lỗi khi tải</div>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Không tải được dữ liệu người dùng. Vui lòng thử lại sau.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserTableFilters table={table} onFilterChange={handleFilterChange} />

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
                  Không tìm thấy người dùng
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <UserTablePagination
        page={page || 1}
        totalItems={total || 0}
        pageSize={limit || 10}
        onPageChange={(newPage: number) => handleFilterChange({ page: newPage })}
        onPageSizeChange={(newSize: number) =>
          handleFilterChange({
            page: 1,
            limit: newSize,
          })
        }
      />
    </div>
  );
}
