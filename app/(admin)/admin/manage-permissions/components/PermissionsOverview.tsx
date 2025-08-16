'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetAllPermission } from '@/hooks/useAdmin';

export function PermissionsOverview() {
  // Fetch all permissions without pagination
  const { data: permissionsData, isLoading, error } = useGetAllPermission({ page: 1, limit: 1000 }); // High limit to get all permissions

  const permissions = permissionsData?.data?.data || [];
  const getPermissionCountByModule = () => {
    const moduleCount: Record<string, number> = {};
    permissions.forEach(permission => {
      moduleCount[permission.module] = (moduleCount[permission.module] || 0) + 1;
    });
    return moduleCount;
  };

  const getMethodCount = () => {
    const methodCount: Record<string, number> = {};
    permissions.forEach(permission => {
      methodCount[permission.method] = (methodCount[permission.method] || 0) + 1;
    });
    return methodCount;
  };

  const moduleCount = getPermissionCountByModule();
  const methodCount = getMethodCount();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Phân bố quyền theo module</CardTitle>
            <CardDescription>Số lượng quyền trong từng module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Đang tải dữ liệu...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Phân bố quyền theo module</CardTitle>
            <CardDescription>Số lượng quyền trong từng module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-destructive">Có lỗi khi tải dữ liệu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bố quyền theo module</CardTitle>
          <CardDescription>Số lượng quyền trong từng module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(moduleCount).map(([module, count]) => (
              <div key={module} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{module}</p>
                  <p className="text-sm text-muted-foreground">{count} quyền</p>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Method Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bố theo phương thức HTTP</CardTitle>
          <CardDescription>Số lượng quyền theo từng phương thức</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(methodCount).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{method}</p>
                  <p className="text-sm text-muted-foreground">{count} quyền</p>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
