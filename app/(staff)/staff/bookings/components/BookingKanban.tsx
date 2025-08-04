'use client';

import { BookingCard } from './BookingCard';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle, Archive } from 'lucide-react';
import { AlertTitle } from '@/components/ui/alert';
import { AlertDescription } from '@/components/ui/alert';
import { Booking, StatusServiceRequest } from '@/lib/api/services/fetchBooking';
import { useStaffBooking } from '@/hooks/useBooking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ALL_COLUMNS = [
  {
    id: StatusServiceRequest.IN_PROGRESS,
    title: 'Đang trong quá trình',
    description: 'Dịch vụ đang trong quá trình',
    icon: CheckCircle,
  },
  {
    id: StatusServiceRequest.ESTIMATED,
    title: 'Đang ước lượng',
    description: 'Dịch vụ đang được ước lượng',
    icon: Clock,
  },
  {
    id: StatusServiceRequest.CANCELLED,
    title: 'Đã hủy',
    description: 'Đặt lịch đã bị hủy',
    icon: Archive,
  },
];

const BookingCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-3">
    {/* Header Section */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full border-2" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>

    {/* Status Badge with Action Buttons */}
    <div className="flex items-center justify-between gap-2 mb-3">
      <Skeleton className="h-6 w-20 rounded-full" />
      <div className="flex gap-1">
        <Skeleton className="h-7 w-16 rounded" />
        <Skeleton className="h-7 w-14 rounded" />
      </div>
    </div>

    {/* Service Information */}
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="h-4 w-32" />
    </div>

    {/* Contact Information */}
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <div className="flex flex-col space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  </div>
);

interface BookingKanbanProps {
  onRefresh: () => void;
}

export function BookingKanban({ onRefresh }: BookingKanbanProps) {
  const { data: staffBookingsData, isLoading, error } = useStaffBooking();

  const bookingsArray = staffBookingsData?.data?.bookings || [];

  const groupedBookings: Record<StatusServiceRequest, Booking[]> = {
    [StatusServiceRequest.PENDING]: bookingsArray.filter(
      booking => booking.serviceRequest.status === StatusServiceRequest.PENDING
    ),
    [StatusServiceRequest.IN_PROGRESS]: bookingsArray.filter(
      booking => booking.serviceRequest.status === StatusServiceRequest.IN_PROGRESS
    ),
    [StatusServiceRequest.ESTIMATED]: bookingsArray.filter(
      booking => booking.serviceRequest.status === StatusServiceRequest.ESTIMATED
    ),
    [StatusServiceRequest.CANCELLED]: bookingsArray.filter(
      booking => booking.serviceRequest.status === StatusServiceRequest.CANCELLED
    ),
  };

  const renderKanbanColumns = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ALL_COLUMNS.map(column => {
        const columnBookings = groupedBookings[column.id as StatusServiceRequest];
        return (
          <Card key={column.id} className="border-0 shadow-sm bg-gray-50/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center">
                    <column.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-900">
                      {column.title}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">{column.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {columnBookings.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 min-h-[500px]">
              {columnBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center mb-3">
                    <column.icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Chưa có đặt lịch</p>
                  <p className="text-xs text-gray-400 mt-1">Danh sách công việc theo trạng thái</p>
                </div>
              ) : (
                columnBookings.map((booking: Booking) => (
                  <BookingCard
                    key={booking.id.toString()}
                    booking={booking}
                    status={booking.serviceRequest.status}
                    isDragging={false}
                    isLoading={false}
                    onStaffAssigned={onRefresh}
                  />
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ALL_COLUMNS.map(column => (
            <Card key={column.id} className="border-0 shadow-sm bg-gray-50/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center">
                      <column.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-gray-900">
                        {column.title}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">{column.description}</p>
                    </div>
                  </div>
                  <div className="h-5 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <BookingCardSkeleton key={index} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>
          {(error as Error)?.message || 'Không thể tải dữ liệu đặt lịch'}
        </AlertDescription>
      </Alert>
    );
  }

  return <div className="space-y-6">{renderKanbanColumns()}</div>;
}
