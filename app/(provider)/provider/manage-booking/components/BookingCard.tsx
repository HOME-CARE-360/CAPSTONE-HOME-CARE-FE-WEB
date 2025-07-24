'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, User, Calendar, Eye, UserPlus, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/lib/api/services/fetchManageBooking';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useGetStaffAvailable } from '@/hooks/useStaff';
import { useAssignStaffToBooking } from '@/hooks/useManageBooking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface BookingCardProps {
  booking: Booking;
  status?: Booking['status'];
  isDragging?: boolean;
  isLoading?: boolean;
  onStaffAssigned?: () => void;
}

export function BookingCard({ booking, isDragging, isLoading, onStaffAssigned }: BookingCardProps) {
  const [open, setOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Fetch staff for this booking's category
  const { data: staffData, isLoading: isLoadingStaff } = useGetStaffAvailable({
    categories: [booking.categoryId],
    orderBy: 'asc',
  });

  const { mutate: assignStaff, isPending: isAssigning } = useAssignStaffToBooking();

  const initials = booking.customer.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'IN_PROGRESS':
        return {
          label: 'Đang thực hiện',
          color: 'bg-orange-100 text-orange-700 border-orange-200',
        };
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { label: 'Không xác định', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const statusConfig = getStatusConfig(booking.status);
  const availableStaff = staffData?.data || [];

  const handleAssignStaff = () => {
    if (!selectedStaffId) {
      toast.error('Vui lòng chọn nhân viên');
      return;
    }

    assignStaff(
      {
        staffId: parseInt(selectedStaffId),
        customerId: booking.customerId,
        serviceRequestId: booking.id,
      },
      {
        onSuccess: () => {
          toast.success('Phân công nhân viên thành công');
          setSelectedStaffId('');
          setOpen(false);
          onStaffAssigned?.();
        },
        onError: error => {
          const errorMessage = error?.message || 'Có lỗi xảy ra khi phân công nhân viên';
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg overflow-hidden',
        'border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200',
        isDragging && 'rotate-2 scale-105 shadow-lg',
        isLoading && 'opacity-50 pointer-events-none'
      )}
    >
      <div className="p-4">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-50">
              <AvatarImage src={booking.customer.avatar || undefined} />
              <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{booking.customer.name}</h3>
              <p className="text-xs text-gray-500">BK{booking.id}</p>
            </div>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50">
                <Eye className="h-4 w-4 text-gray-500" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl">
              <SheetHeader>
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Chi tiết đặt lịch
                </SheetTitle>
                <SheetDescription>Thông tin chi tiết về yêu cầu đặt lịch</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Booking Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Thông tin đặt lịch</h3>
                  <div className="grid gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Mã đặt lịch</p>
                        <p className="font-medium">BK{booking.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Ngày hẹn</p>
                        <p className="font-medium">
                          {format(new Date(booking.preferredDate), 'dd/MM/yyyy', { locale: vi })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Địa điểm</p>
                        <p className="font-medium">{booking.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Thông tin khách hàng</h3>
                  <div className="grid gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Họ và tên</p>
                        <p className="font-medium">{booking.customer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{booking.customer.email || '--'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Số điện thoại</p>
                        <p className="font-medium">{booking.customer.phone || '--'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Service Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Dịch vụ</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {booking.category.logo ? (
                        <Image src={booking.category.logo} alt="" className="w-8 h-8" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{booking.category.name}</p>
                      <p className="text-sm text-gray-500">Dịch vụ được yêu cầu</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Phân công nhân viên</h3>
                  </div>

                  {/* Staff Selection */}
                  <div className="space-y-3">
                    {isLoadingStaff ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : availableStaff.length === 0 ? (
                      <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        Không có nhân viên phù hợp với dịch vụ này
                      </div>
                    ) : (
                      <>
                        <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhân viên" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStaff.map(staff => (
                              <SelectItem key={staff.id} value={staff.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={staff.user.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {staff.user.name
                                        .split(' ')
                                        .map(n => n.charAt(0))
                                        .join('')
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{staff.user.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {staff.user.email}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          onClick={handleAssignStaff}
                          className="w-full"
                          disabled={!selectedStaffId || isAssigning}
                        >
                          {isAssigning ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang phân công...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Phân công nhân viên
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={cn('font-normal border', statusConfig.color)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Service Information */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
            {booking.category.logo ? (
              <Image src={booking.category.logo} alt="" className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4 bg-gray-300 rounded" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">{booking.category.name}</span>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {format(new Date(booking.preferredDate), 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 truncate">{booking.customer.phone || '--'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 truncate" title={booking.location}>
              {booking.location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
