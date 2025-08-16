'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users, Shield } from 'lucide-react';
import { useCreateRole, useGetAllRoles, useUpdateRole, useDeleteRole } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const roleFormSchema = z.object({
  name: z.string().min(1, 'Tên vai trò không được để trống'),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  permissions: Array<{
    id: number;
    name: string;
    description: string | null;
    path: string;
    method: string;
    module: string;
  }>;
}

export default function ManageRolePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: rolesData, isLoading, error } = useGetAllRoles();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  const createForm = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const editForm = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const roles = rolesData?.data?.data || [];

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRole = async (data: RoleFormData) => {
    try {
      await createRoleMutation.mutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      createForm.reset();
      toast.success('Tạo vai trò thành công');
    } catch (error) {
      console.error('Create role error:', error);
    }
  };

  const handleEditRole = async (data: RoleFormData) => {
    if (!selectedRole) return;

    try {
      await updateRoleMutation.mutation.mutateAsync({
        id: selectedRole.id,
        data,
      });
      setIsEditModalOpen(false);
      setSelectedRole(null);
      editForm.reset();
      toast.success('Cập nhật vai trò thành công');
    } catch (error) {
      console.error('Update role error:', error);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      await deleteRoleMutation.mutation.mutateAsync(role.id);
      toast.success('Xóa vai trò thành công');
    } catch (error) {
      console.error('Delete role error:', error);
    }
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    editForm.reset({ name: role.name });
    setIsEditModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.reset();
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRole(null);
    editForm.reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý vai trò</h1>
          <p className="text-muted-foreground">Quản lý các vai trò và quyền hạn trong hệ thống</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo vai trò mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo vai trò mới</DialogTitle>
              <DialogDescription>Thêm một vai trò mới vào hệ thống</DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreateRole)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên vai trò</Label>
                <Input
                  id="name"
                  placeholder="Nhập tên vai trò..."
                  {...createForm.register('name')}
                />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={closeCreateModal}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createRoleMutation.isLoading}>
                  {createRoleMutation.isLoading ? 'Đang tạo...' : 'Tạo vai trò'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số vai trò</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vai trò đang hoạt động</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng quyền hạn</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.reduce((total, role) => total + role.permissions.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách vai trò</CardTitle>
          <CardDescription>Quản lý tất cả các vai trò trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Tìm kiếm vai trò..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên vai trò</TableHead>
                  <TableHead>Số quyền hạn</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Không tìm thấy vai trò nào' : 'Chưa có vai trò nào'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{role.name}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.permissions.length} quyền</Badge>
                      </TableCell>
                      <TableCell>{new Date(role.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{new Date(role.updatedAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(role)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa vai trò</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa vai trò &quot;{role.name}&quot;? Hành
                                  động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRole(role)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa vai trò</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin vai trò &quot;{selectedRole?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditRole)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên vai trò</Label>
              <Input
                id="edit-name"
                placeholder="Nhập tên vai trò..."
                {...editForm.register('name')}
              />
              {editForm.formState.errors.name && (
                <p className="text-sm text-destructive">{editForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={closeEditModal}>
                Hủy
              </Button>
              <Button type="submit" disabled={updateRoleMutation.isLoading}>
                {updateRoleMutation.isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
