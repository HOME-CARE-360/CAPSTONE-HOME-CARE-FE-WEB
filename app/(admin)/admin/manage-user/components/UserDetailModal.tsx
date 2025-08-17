'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useGetUserById,
  useGetAllRoles,
  useResetPasswordUser,
  useAssignRoleToUser,
} from '@/hooks/useAdmin';
import { formatToVietnamTime } from '@/utils/helper';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Users,
  Key,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
}

export function UserDetailModal({ isOpen, onClose, userId }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const { data: userData, isLoading, error } = useGetUserById(userId || 0);
  const { data: rolesData, isLoading: isRolesLoading, error: rolesError } = useGetAllRoles();
  const resetPasswordMutation = useResetPasswordUser();
  const assignRoleMutation = useAssignRoleToUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = userData?.data as any;
  const roles = rolesData?.data?.data || [];

  console.log('user: ', user);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!userId) return;

    resetPasswordMutation.mutate(
      { data: resetPasswordData, userId },
      {
        onSuccess: () => {
          toast.success('Đặt lại mật khẩu thành công');
          setResetPasswordData({ newPassword: '', confirmPassword: '' });
          setActiveTab('details');
        },
        onError: (error: Error) => {
          toast.error('Có lỗi xảy ra khi đặt lại mật khẩu');
          console.error('Reset password error:', error);
        },
      }
    );
  };

  const handleAssignRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoleIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một vai trò');
      return;
    }
    if (!userId) return;

    assignRoleMutation.mutate(
      { data: { roleIds: selectedRoleIds }, userId },
      {
        onSuccess: () => {
          toast.success('Gán vai trò thành công');
          setSelectedRoleIds([]);
          setActiveTab('details');
        },
        onError: (error: Error) => {
          toast.error('Có lỗi xảy ra khi gán vai trò');
          console.error('Assign role error:', error);
        },
      }
    );
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleClose = () => {
    setActiveTab('details');
    setResetPasswordData({ newPassword: '', confirmPassword: '' });
    setSelectedRoleIds([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chi tiết người dùng
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết và quản lý người dùng trong hệ thống
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">Không thể tải thông tin người dùng</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : user ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Thông tin</TabsTrigger>
              <TabsTrigger value="reset-password">Đặt lại mật khẩu</TabsTrigger>
              <TabsTrigger value="assign-role">Gán vai trò</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {user.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Thông tin liên hệ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Vai trò
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user.roles?.map((role: { name: string }, index: number) => (
                    <Badge key={index} variant="secondary">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              {user.customer && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Thông tin khách hàng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {user.customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.customer.address}</span>
                      </div>
                    )}
                    {user.customer.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatToVietnamTime(user.customer.dateOfBirth)}
                        </span>
                      </div>
                    )}
                    {user.customer.gender && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.customer.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Staff Information */}
              {user.staff && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Thông tin nhân viên
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={user.staff.isActive ? 'default' : 'destructive'}>
                        {user.staff.isActive ? 'Đang làm việc' : 'Đã nghỉ việc'}
                      </Badge>
                    </div>
                    {user.staff.provider && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Nhà cung cấp dịch vụ</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          <p className="text-sm">ID: {user.staff.provider.id}</p>
                          <p className="text-sm">
                            Trạng thái: {user.staff.provider.verificationStatus}
                          </p>
                          {user.staff.provider.address && (
                            <p className="text-sm">Địa chỉ: {user.staff.provider.address}</p>
                          )}
                          {user.staff.provider.description && (
                            <p className="text-sm">Mô tả: {user.staff.provider.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Provider Information */}
              {user.provider && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Thông tin nhà cung cấp
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{user.provider.verificationStatus}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">Mô tả: {user.provider.description}</p>
                      <p className="text-sm">Địa chỉ: {user.provider.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Thông tin hệ thống
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ngày tạo:</span>
                    <p>{formatToVietnamTime(user.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                    <p>{formatToVietnamTime(user.updatedAt)}</p>
                  </div>
                  {user.deletedAt && (
                    <div>
                      <span className="text-muted-foreground">Ngày xóa:</span>
                      <p className="text-destructive">{formatToVietnamTime(user.deletedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reset-password" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Đặt lại mật khẩu</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nhập mật khẩu mới cho người dùng {user.name}
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={resetPasswordData.newPassword}
                      onChange={e =>
                        setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                      }
                      required
                      minLength={8}
                      placeholder="Nhập mật khẩu mới..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={resetPasswordData.confirmPassword}
                      onChange={e =>
                        setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      required
                      minLength={8}
                      placeholder="Xác nhận mật khẩu mới..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                      Hủy
                    </Button>
                    <Button type="submit" disabled={resetPasswordMutation.isPending}>
                      {resetPasswordMutation.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="assign-role" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Gán vai trò</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chọn vai trò để gán cho người dùng {user.name}
                </p>

                <form onSubmit={handleAssignRole} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Chọn vai trò</Label>
                    {isRolesLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Đang tải danh sách vai trò...
                        </p>
                      </div>
                    ) : rolesError ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-destructive">Có lỗi khi tải danh sách vai trò</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.reload()}
                          className="mt-2"
                        >
                          Thử lại
                        </Button>
                      </div>
                    ) : roles.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Không có vai trò nào khả dụng
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                          {roles.map(role => (
                            <div key={role.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`role-${role.id}`}
                                checked={selectedRoleIds.includes(role.id)}
                                onCheckedChange={() => handleRoleToggle(role.id)}
                              />
                              <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer">
                                {role.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {selectedRoleIds.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Đã chọn {selectedRoleIds.length} vai trò
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                      Hủy
                    </Button>
                    <Button type="submit" disabled={assignRoleMutation.isPending}>
                      {assignRoleMutation.isPending ? 'Đang xử lý...' : 'Gán vai trò'}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
