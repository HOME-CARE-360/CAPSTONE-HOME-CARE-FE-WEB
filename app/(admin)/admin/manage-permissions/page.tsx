'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Key } from 'lucide-react';
import {
  useAssignPermissionToRole,
  useGetAllPermission,
  useGetPremissionByRoleId,
  useGetAllRoles,
} from '@/hooks/useAdmin';
import { toast } from 'sonner';
import { PermissionsOverview } from './components/PermissionsOverview';
import { PermissionsList } from './components/PermissionsList';
import { RolePermissions } from './components/RolePermissions';
import { AssignPermissionsModal } from './components/AssignPermissionsModal';

export default function ManagePermissionsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Permissions pagination
  const [permissionsPage, setPermissionsPage] = useState(1);
  const [permissionsLimit, setPermissionsLimit] = useState(10);

  // Roles pagination - get all roles with pagination
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesLimit] = useState(100); // Higher limit to get all roles

  const {
    data: permissionsData,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = useGetAllPermission({ page: permissionsPage, limit: permissionsLimit });

  const {
    data: rolesData,
    isLoading: isRolesLoading,
    error: rolesError,
  } = useGetAllRoles({ page: rolesPage, limit: rolesLimit });

  const {
    data: rolePermissionsData,
    isLoading: isRolePermissionsLoading,
    error: rolePermissionsError,
  } = useGetPremissionByRoleId(selectedRoleId || 0, { page: 1, limit: 100 });

  const assignPermissionMutation = useAssignPermissionToRole();

  const permissions = permissionsData?.data?.data || [];
  const roles = rolesData?.data?.data || [];
  const rolePermissions = rolePermissionsData?.data?.data || [];

  // Pagination info
  const permissionsTotal = permissionsData?.data?.total || 0;
  const rolesTotal = rolesData?.data?.total || 0;

  // Load all roles when component mounts
  useEffect(() => {
    if (rolesTotal > 0 && roles.length < rolesTotal) {
      // Load more roles if needed
      const totalPages = Math.ceil(rolesTotal / rolesLimit);
      if (rolesPage < totalPages) {
        setRolesPage(prev => prev + 1);
      }
    }
  }, [rolesTotal, roles.length, rolesLimit, rolesPage]);

  const handleAssignPermissions = async (data: { roleId: string; permissionIds: number[] }) => {
    try {
      await assignPermissionMutation.mutation.mutateAsync({
        roleId: parseInt(data.roleId),
        data: { permissionIds: data.permissionIds },
      });
      setIsAssignModalOpen(false);
      toast.success('Gán quyền thành công');
    } catch (error) {
      console.error('Assign permissions error:', error);
    }
  };

  const handlePermissionsPageChange = (page: number) => {
    setPermissionsPage(page);
  };

  const handlePermissionsLimitChange = (limit: number) => {
    setPermissionsLimit(limit);
    setPermissionsPage(1); // Reset về trang đầu khi thay đổi limit
  };

  const handleRoleChange = (roleId: number) => {
    setSelectedRoleId(roleId);
  };

  if (isPermissionsLoading || isRolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (permissionsError || rolesError) {
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý quyền hạn</h1>
          <p className="text-muted-foreground">Quản lý và phân quyền trong hệ thống</p>
        </div>
        <AssignPermissionsModal
          roles={roles}
          isOpen={isAssignModalOpen}
          onOpenChange={setIsAssignModalOpen}
          onSubmit={handleAssignPermissions}
          isLoading={assignPermissionMutation.isLoading}
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số quyền</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissionsTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số vai trò</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rolesTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số module</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(new Set(permissions.map(p => p.module))).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phương thức HTTP</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(new Set(permissions.map(p => p.method))).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="permissions">Danh sách quyền</TabsTrigger>
          <TabsTrigger value="role-permissions">Quyền theo vai trò</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PermissionsOverview />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <PermissionsList
            permissions={permissions}
            total={permissionsTotal}
            page={permissionsPage}
            limit={permissionsLimit}
            isLoading={isPermissionsLoading}
            onPageChange={handlePermissionsPageChange}
            onLimitChange={handlePermissionsLimitChange}
          />
        </TabsContent>

        <TabsContent value="role-permissions" className="space-y-6">
          <RolePermissions
            roles={roles}
            rolePermissions={rolePermissions}
            selectedRoleId={selectedRoleId}
            isLoading={isRolePermissionsLoading}
            error={rolePermissionsError}
            onRoleChange={handleRoleChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
