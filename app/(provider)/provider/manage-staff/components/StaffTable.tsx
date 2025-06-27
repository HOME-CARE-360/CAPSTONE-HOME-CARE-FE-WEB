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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ColumnsIcon, Plus, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetAllStaffs, useCreateStaff } from '@/hooks/useStaff';
import { Staff, StaffSearchParams } from '@/lib/api/services/fetchStaff';
import StaffCreateModal, { StaffFormData } from './StaffCreateModal';
import { toast } from 'sonner';

export function StaffTable() {
  // State cho filters
  const [searchFilters, setSearchFilters] = React.useState<StaffSearchParams>({
    page: 1,
    limit: 10,
  });

  const { data: staffsData, isLoading, error } = useGetAllStaffs(searchFilters);
  const staffs = staffsData?.data || [];

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  const createStaffMutation = useCreateStaff();

  const columns = useStaffTableColumns({
    onEdit: (staff: Staff) => {
      setSelectedStaff(staff);
      setIsCreateModalOpen(true);
    },
    onDelete: (staff: Staff) => {
      console.log(staff);
      // deleteStaffMutation.mutate(staff.id);
    },
  });

  const table = useReactTable({
    data: staffs,
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

  // Handle filter changes
  const handleFilterChange = (filters: Partial<StaffSearchParams>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchFilters({
      orderBy: 'desc',
      page: 1,
      limit: 10,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    handleFilterChange({ page });
  };

  // Handle limit change
  const handleLimitChange = (limit: number) => {
    handleFilterChange({ limit, page: 1 });
  };

  const handleCreateStaff = async (data: StaffFormData) => {
    try {
      if (selectedStaff) {
        // TODO: Implement update staff API call
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await createStaffMutation.mutateAsync(data);
        toast.success('Tạo nhân viên thành công');
      }
      setIsCreateModalOpen(false);
      setSelectedStaff(null);
    } catch (error) {
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

  return (
    <div className="space-y-4">
      {/* Header với search và actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={globalFilter ?? ''}
              onChange={event => setGlobalFilter(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <ColumnsIcon className="mr-2 h-4 w-4" />
            Bộ lọc
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo nhân viên
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon className="mr-2 h-4 w-4" />
                Cột
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

      {/* Filters */}
      {showFilters && (
        <StaffTableFilters
          filters={searchFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

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
                  Không tìm thấy nhân viên
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {staffsData && (
        <StaffTablePagination
          currentPage={staffsData.page}
          totalPages={staffsData.totalPages}
          totalItems={staffsData.totalItems}
          limit={staffsData.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Create/Edit Modal */}
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
