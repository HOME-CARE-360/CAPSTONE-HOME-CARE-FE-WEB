'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/app/(admin)/components/SiteHeader';
import { UserTable } from './components/UserTable';
import { UserDetailModal } from './components/UserDetailModal';
import { Plus } from 'lucide-react';
import { useDeleteUser, useGetAllUsers, useCreateUser } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import { UserResponseType, UserFormData } from '@/schemaValidations/admin.schema';
import UserCreateModal from './components/UserCreateModal';

interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

interface PaginatedUsersData {
  data: {
    data: UserResponseType[];
    page: number;
    limit: number;
    total: number;
  };
}

export default function ManageUserPage() {
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    page: 1,
    limit: 10,
  });

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useGetAllUsers(searchParams) as {
    data: PaginatedUsersData | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const deleteUserMutation = useDeleteUser();
  const createUserMutation = useCreateUser();

  const handleFilterChange = (filters: Partial<UserSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...filters }));
  };

  const handleEdit = (user: UserResponseType) => {
    setSelectedUserId(user.id);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (user: UserResponseType) => {
    deleteUserMutation.mutate(user.id, {
      onSuccess: () => {
        toast.success('Xóa người dùng thành công');
        // Refetch users data
      },
      onError: (error: Error) => {
        toast.error('Có lỗi xảy ra khi xóa người dùng');
        console.error('Delete user error:', error);
      },
    });
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUserId(null);
  };

  const handleCreateUser = (userData: UserFormData) => {
    createUserMutation.mutate(userData, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        // Refetch users data
      },
    });
  };

  console.log('usersData?.data?.data: ', usersData);

  return (
    <>
      <SiteHeader title="Quản lý người dùng" />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
            <p className="text-muted-foreground">Quản lý tất cả người dùng trong hệ thống</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm người dùng mới
          </Button>
        </div>

        {/* User Table */}
        <UserTable
          data={(usersData as PaginatedUsersData)?.data?.data || []}
          isLoading={isUsersLoading}
          error={usersError}
          page={(usersData as PaginatedUsersData)?.data?.page}
          limit={(usersData as PaginatedUsersData)?.data?.limit}
          total={(usersData as PaginatedUsersData)?.data?.total}
          onFilterChange={handleFilterChange}
          searchFilters={searchParams}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* User Detail Modal */}
        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          userId={selectedUserId}
        />

        {/* User Create Modal */}
        <UserCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateUser}
          isLoading={createUserMutation.isPending}
        />
      </div>
    </>
  );
}
