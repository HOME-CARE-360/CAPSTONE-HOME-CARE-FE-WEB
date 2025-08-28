'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { StaffTable } from './components/StaffTable';
import { Plus } from 'lucide-react';
import { useGetAllStaffs, useCreateStaff } from '@/hooks/useStaff';
import { useCategories } from '@/hooks/useCategory';
import { StaffSearchParams } from '@/lib/api/services/fetchStaff';
import StaffCreateModal from './components/StaffCreateModal';
import { StaffFormData } from '@/schemaValidations/staff.schema';
import { toast } from 'sonner';
import { Staff } from '@/lib/api/services/fetchStaff';

export default function StaffManagementPage() {
  const [searchParams, setSearchParams] = useState<StaffSearchParams>({
    orderBy: 'desc',
    page: 1,
    limit: 10,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const {
    data: staffsData,
    isLoading: isStaffLoading,
    error: staffError,
  } = useGetAllStaffs(searchParams);
  const { data: categoryData, isLoading: isCategoryLoading } = useCategories();
  const createStaffMutation = useCreateStaff();

  const handleFilterChange = (filters: Partial<StaffSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...filters }));
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

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsCreateModalOpen(true);
  };

  // TODO: Implement delete staff API call
  const handleDelete = (staff: Staff) => {
    console.log(staff);
    // deleteStaffMutation.mutate(staff.id);
  };

  return (
    <>
      <SiteHeader title="Quản lý nhân viên" />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
            <p className="text-muted-foreground">Quản lý nhân viên và phân quyền trong hệ thống</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhân viên mới
          </Button>
        </div>

        {/* Staff Table */}
        <StaffTable
          data={staffsData?.data || []}
          categories={categoryData?.categories || []}
          isLoading={isStaffLoading || isCategoryLoading}
          error={staffError}
          page={staffsData?.page}
          limit={staffsData?.limit}
          totalPages={staffsData?.totalPages}
          totalItems={staffsData?.totalItems}
          onFilterChange={handleFilterChange}
          searchFilters={searchParams}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Create/Edit Modal */}
        <StaffCreateModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreateStaff}
          mode={selectedStaff ? 'edit' : 'create'}
          isLoading={createStaffMutation.isPending}
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
    </>
  );
}
