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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ColumnsIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetAllStaffs } from '@/hooks/useStaff';
import StaffCreateModal from './StaffCreateModal';
import { StaffFormData } from './StaffCreateModal';
import { useCreateStaff } from '@/hooks/useStaff';
import { Staff } from '@/lib/api/services/fetchStaff';
import { toast } from '@/hooks/useToast';

export function StaffTable() {
  const { data: staffs, isLoading, error } = useGetAllStaffs();

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null);
  const createStaffMutation = useCreateStaff();
  // console.log('categoryStaff::', categoryStaff);
  console.log('staffs', staffs);

  const columns = useStaffTableColumns({
    onEdit: (staff: Staff) => {
      setSelectedStaff(staff);
      setIsCreateModalOpen(true);
    },
  });

  const table = useReactTable({
    data: staffs || [],
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleCreateStaff = async (data: StaffFormData) => {
    try {
      if (selectedStaff) {
        // TODO: Implement update staff API call
        toast({
          title: 'Cập nhật nhân viên',
          description: 'Cập nhật nhân viên thành công',
          variant: 'default',
        });
      } else {
        await createStaffMutation.mutateAsync(data);
        toast({
          title: 'Tạo nhân viên',
          description: 'Tạo nhân viên thành công',
          variant: 'default',
        });
      }
      setIsCreateModalOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      // toast.error(selectedStaff ? 'Cập nhật nhân viên thất bại' : 'Tạo nhân viên thất bại');
      console.error('Error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedStaff(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading staff data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg border-destructive bg-destructive/10">
        <div className="flex flex-col items-center gap-2 text-center max-w-md p-6">
          <div className="text-lg font-medium text-destructive">Error Loading Staff</div>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Failed to load staff data. Please try again later.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  console.log('selectedStaff:: ', selectedStaff);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search staff..."
          value={globalFilter ?? ''}
          onChange={event => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>Tạo nhân viên</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon className="mr-2 h-4 w-4" />
                Columns
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
          </DropdownMenu>
        </div>
      </div>
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
                  No staff found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <StaffCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateStaff}
        mode={selectedStaff ? 'edit' : 'create'}
        initialData={
          selectedStaff
            ? {
                email: selectedStaff.user.email,
                name: selectedStaff.user.name,
                phone: selectedStaff.user.phone,
                categoryIds: selectedStaff.staffCategories.map(cat => cat.categoryId),
                password: '',
                confirmPassword: '',
              }
            : undefined
        }
      />
    </div>
  );
}
