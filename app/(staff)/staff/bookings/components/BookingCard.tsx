'use client';

import { useState } from 'react';
import { MapPin, Phone, User, Calendar, Eye, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Booking, StatusBooking } from '@/lib/api/services/fetchBooking';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BookingCardProps {
  booking: Booking;
  status?: StatusBooking;
  isDragging?: boolean;
  isLoading?: boolean;
  onStaffAssigned?: () => void;
}

export function BookingCard({ booking, isDragging, isLoading }: BookingCardProps) {
  const [open, setOpen] = useState(false);

  const initials = booking.customer.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const getStatusConfig = (status: StatusBooking) => {
    switch (status) {
      case StatusBooking.PENDING:
        return { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case StatusBooking.CONFIRMED:
        return { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case StatusBooking.IN_PROGRESS:
        return {
          label: 'Đang thực hiện',
          color: 'bg-orange-100 text-orange-700 border-orange-200',
        };
      case StatusBooking.COMPLETED:
        return { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200' };
      case StatusBooking.CANCELLED:
        return { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { label: 'Không xác định', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const statusConfig = getStatusConfig(booking.status);

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
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{booking.customer.name}</h3>
              <p className="text-xs text-gray-500">SR-{booking.serviceRequestId}</p>
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
                  Chi tiết yêu cầu dịch vụ
                </SheetTitle>
                <SheetDescription>Thông tin chi tiết về yêu cầu dịch vụ</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Booking Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Thông tin yêu cầu</h3>
                  <div className="grid gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Mã yêu cầu</p>
                        <p className="font-medium">SR-{booking.serviceRequestId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Ngày hẹn</p>
                        <p className="font-medium">
                          {format(
                            new Date(booking.serviceRequest.preferredDate),
                            'dd/MM/yyyy HH:mm',
                            { locale: vi }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Địa điểm</p>
                        <p className="font-medium">{booking.serviceRequest.location}</p>
                      </div>
                    </div>
                    {booking.serviceRequest.note && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-muted-foreground">Ghi chú</p>
                          <p className="font-medium">{booking.serviceRequest.note}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Thông tin khách hàng</h3>
                  <div className="grid gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Họ và tên</p>
                        <p className="font-medium">{booking.customer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Số điện thoại</p>
                        <p className="font-medium">{booking.customer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Địa chỉ</p>
                        <p className="font-medium">{booking.customer.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">SĐT liên hệ yêu cầu</p>
                        <p className="font-medium">{booking.serviceRequest.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Service Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Dịch vụ</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {booking.serviceRequest.categoryName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.serviceRequest.categoryName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Danh mục: {booking.serviceRequest.categoryId}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Status Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Trạng thái</h3>
                  <div className="flex items-center gap-3">
                    <Badge className={cn('font-normal border', statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Tạo lúc:{' '}
                      {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={cn('font-normal border text-xs', statusConfig.color)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Service Information */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-blue-600 text-xs font-bold">
              {booking.serviceRequest.categoryName.charAt(0)}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 truncate">
            {booking.serviceRequest.categoryName}
          </span>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {format(new Date(booking.serviceRequest.preferredDate), 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 truncate">{booking.customer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span
              className="text-sm text-gray-600 truncate"
              title={booking.serviceRequest.location}
            >
              {booking.serviceRequest.location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
