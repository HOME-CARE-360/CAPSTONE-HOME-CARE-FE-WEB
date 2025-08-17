'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetAllPermission } from '@/hooks/useAdmin';

const assignPermissionSchema = z.object({
  roleId: z.string().min(1, 'Vui lòng chọn vai trò'),
  permissionIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất một quyền'),
});

type AssignPermissionFormData = z.infer<typeof assignPermissionSchema>;

interface Role {
  id: number;
  name: string;
}

interface AssignPermissionsModalProps {
  roles: Role[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AssignPermissionFormData) => Promise<void>;
  isLoading: boolean;
}

export function AssignPermissionsModal({
  roles,
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
}: AssignPermissionsModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [permissionsPage, setPermissionsPage] = useState(1);
  const [permissionsLimit] = useState(100); // High limit to get all permissions

  // Fetch all permissions
  const {
    data: permissionsData,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = useGetAllPermission({ page: permissionsPage, limit: permissionsLimit });

  const permissions = permissionsData?.data?.data || [];

  const assignForm = useForm<AssignPermissionFormData>({
    resolver: zodResolver(assignPermissionSchema),
    defaultValues: {
      roleId: '',
      permissionIds: [],
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      assignForm.reset();
      setSelectedRoleId('');
      setSearchTerm('');
    }
  }, [isOpen, assignForm]);

  // Filter permissions based on search term
  const filteredPermissions = permissions.filter(
    permission =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    assignForm.setValue('roleId', roleId);
  };

  const handlePermissionToggle = (permissionId: number) => {
    const currentIds = assignForm.getValues('permissionIds');
    const newIds = currentIds.includes(permissionId)
      ? currentIds.filter(id => id !== permissionId)
      : [...currentIds, permissionId];
    assignForm.setValue('permissionIds', newIds);
  };

  const handleSubmit = async (data: AssignPermissionFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Gán quyền cho vai trò
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gán quyền cho vai trò</DialogTitle>
          <DialogDescription>Chọn vai trò và quyền hạn để gán</DialogDescription>
        </DialogHeader>
        <form onSubmit={assignForm.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Chọn vai trò</Label>
              <Select onValueChange={handleRoleChange} value={selectedRoleId}>
                <SelectTrigger>
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
              {assignForm.formState.errors.roleId && (
                <p className="text-sm text-destructive">
                  {assignForm.formState.errors.roleId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Chọn quyền hạn</Label>

              {/* Search permissions */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm quyền hạn..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {isPermissionsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Đang tải quyền hạn...</p>
                </div>
              ) : permissionsError ? (
                <div className="text-center py-4">
                  <p className="text-sm text-destructive">Có lỗi khi tải quyền hạn</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                  {filteredPermissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {searchTerm ? 'Không tìm thấy quyền nào' : 'Chưa có quyền nào'}
                    </p>
                  ) : (
                    filteredPermissions.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={assignForm.watch('permissionIds').includes(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                        />
                        <Label
                          htmlFor={`permission-${permission.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          <div className="flex items-center justify-between">
                            <span>{permission.name}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">{permission.method}</Badge>
                              <span>{permission.module}</span>
                            </div>
                          </div>
                          {permission.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </p>
                          )}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              )}
              {assignForm.formState.errors.permissionIds && (
                <p className="text-sm text-destructive">
                  {assignForm.formState.errors.permissionIds.message}
                </p>
              )}
              {assignForm.watch('permissionIds').length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Đã chọn {assignForm.watch('permissionIds').length} quyền
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Gán quyền'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
