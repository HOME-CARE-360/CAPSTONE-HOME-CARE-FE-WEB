'use client';

import { BookingCard } from './BookingCard';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle, Archive } from 'lucide-react';
import { AlertTitle } from '@/components/ui/alert';
import { AlertDescription } from '@/components/ui/alert';
import { Booking } from '@/lib/api/services/fetchManageBooking';
import { useManageBookings, useBookingFilters } from '@/hooks/useManageBooking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ACTIVE_COLUMNS = [
  {
    id: 'PENDING',
    title: 'Chờ xử lý',
    description: 'Đặt lịch mới cần được xem xét',
    icon: Clock,
  },
  {
    id: 'CONFIRMED',
    title: 'Đã xác nhận',
    description: 'Đặt lịch đã được xác nhận',
    icon: CheckCircle,
  },
];

const COMPLETED_COLUMNS = [
  {
    id: 'COMPLETED',
    title: 'Hoàn thành',
    description: 'Dịch vụ đã hoàn thành',
    icon: CheckCircle,
  },
  {
    id: 'CANCELLED',
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

    {/* Status Badge */}
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-6 w-20 rounded-full" />
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
  const filters = useBookingFilters();
  const { data: bookings, isLoading, error } = useManageBookings(filters.params);
  const [activeTab, setActiveTab] = useState('active');

  const bookingsArray = bookings?.data || [];

  const groupedBookings = {
    PENDING: bookingsArray.filter(booking => booking.status === 'PENDING'),
    CONFIRMED: bookingsArray.filter(booking => booking.status === 'CONFIRMED'),
    IN_PROGRESS: bookingsArray.filter(booking => booking.status === 'IN_PROGRESS'),
    COMPLETED: bookingsArray.filter(booking => booking.status === 'COMPLETED'),
    CANCELLED: bookingsArray.filter(booking => booking.status === 'CANCELLED'),
  };

  const renderKanbanColumns = (columns: typeof ACTIVE_COLUMNS) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {columns.map(column => {
        const columnBookings = groupedBookings[column.id as Booking['status']];
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
                  <p className="text-xs text-gray-400 mt-1">Danh sách đặt lịch theo trạng thái</p>
                </div>
              ) : (
                columnBookings.map(booking => (
                  <BookingCard
                    key={booking.id.toString()}
                    booking={booking}
                    status={column.id as Booking['status']}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVE_COLUMNS.map(column => (
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
        <AlertDescription>{error?.message || 'Không thể tải dữ liệu đặt lịch'}</AlertDescription>
      </Alert>
    );
  }

  const activeBookingsCount =
    groupedBookings.PENDING.length +
    groupedBookings.CONFIRMED.length +
    groupedBookings.IN_PROGRESS.length;
  const completedBookingsCount =
    groupedBookings.COMPLETED.length + groupedBookings.CANCELLED.length;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="active" className="flex items-center gap-2">
            Đang xử lý
            <Badge variant="secondary" className="text-xs">
              {activeBookingsCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            Đã xong
            <Badge variant="outline" className="text-xs">
              {completedBookingsCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {renderKanbanColumns(ACTIVE_COLUMNS)}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {renderKanbanColumns(COMPLETED_COLUMNS)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
