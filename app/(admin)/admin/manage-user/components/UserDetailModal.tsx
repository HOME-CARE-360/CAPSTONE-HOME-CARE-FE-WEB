'use client';

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
import { useGetUserById } from '@/hooks/useAdmin';
import { formatToVietnamTime } from '@/utils/helper';
import { X, User, Mail, Phone, Calendar, MapPin, Building, Users } from 'lucide-react';
import Image from 'next/image';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
}

export function UserDetailModal({ isOpen, onClose, userId }: UserDetailModalProps) {
  const { data: userData, isLoading, error } = useGetUserById(userId || 0);

  const user = userData?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chi tiết người dùng
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về người dùng trong hệ thống</DialogDescription>
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
          <div className="space-y-6">
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
                {user.roles.map((role, index) => (
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
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
