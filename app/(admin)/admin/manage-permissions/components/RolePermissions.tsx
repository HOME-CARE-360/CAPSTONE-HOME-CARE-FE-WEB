'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Permission {
  id: number;
  name: string;
  description: string | null;
  path: string;
  method: string;
  module: string;
}

interface Role {
  id: number;
  name: string;
}

interface RolePermissionsProps {
  roles: Role[];
  rolePermissions: Permission[];
  selectedRoleId: number | null;
  isLoading: boolean;
  error: Error | null;
  onRoleChange: (roleId: number) => void;
}

export function RolePermissions({
  roles,
  rolePermissions,
  selectedRoleId,
  isLoading,
  error,
  onRoleChange,
}: RolePermissionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quyền hạn theo vai trò</CardTitle>
        <CardDescription>Xem quyền hạn của từng vai trò</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Chọn vai trò để xem quyền hạn</Label>
            <Select
              onValueChange={value => onRoleChange(parseInt(value))}
              value={selectedRoleId?.toString() || ''}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Chọn vai trò..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRoleId && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Đang tải quyền hạn...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive">Có lỗi khi tải quyền hạn</p>
                </div>
              ) : rolePermissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Vai trò này chưa có quyền hạn nào</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên quyền</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Đường dẫn</TableHead>
                        <TableHead>Phương thức</TableHead>
                        <TableHead>Module</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rolePermissions.map(permission => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <div className="font-medium">{permission.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {permission.description || 'Không có mô tả'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {permission.path}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{permission.method}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{permission.module}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
