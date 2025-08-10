'use client';

import { useState } from 'react';
import { Category } from '@/lib/api/services/fetchCategory';
import { DataTable } from '@/components/dataTable';
import { useCategoryTableColumns } from './CategoryTableColumns';
import { CategoryTableFilters } from './CategoryTableFilters';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface CategoryTableProps {
  data: Category[];
  isLoading: boolean;
  onFilterChange: (filters: Record<string, string | number | boolean | null | undefined>) => void;
  onEdit: (category: Category) => void;
}

export function CategoryTable({ data, isLoading, onFilterChange, onEdit }: CategoryTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useCategoryTableColumns({ onEdit });

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

  return (
    <div className="space-y-4">
      <CategoryTableFilters table={table} onFilterChange={onFilterChange} />
      <DataTable columns={columns} data={data} isLoading={isLoading} />
    </div>
  );
}
