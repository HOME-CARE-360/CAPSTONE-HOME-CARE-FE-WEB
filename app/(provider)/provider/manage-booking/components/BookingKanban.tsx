'use client';

import { BookingCard } from './BookingCard';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle, Archive } from 'lucide-react';
import { AlertTitle } from '@/components/ui/alert';
import { AlertDescription } from '@/components/ui/alert';
import { ServiceRequestWithBooking } from '@/lib/api/services/fetchManageBooking';
import { useManageBookings, useBookingFilters } from '@/hooks/useManageBooking';
import { StatusServiceRequest } from '@/lib/api/services/fetchBooking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ACTIVE_COLUMNS = [
  {
    id: 'PENDING',
    title: 'Chờ xử lý',
    description: 'Đặt lịch mới cần được xem xét',
    icon: Clock,
  },
  {
    id: 'IN_PROGRESS',
    title: 'Đang xử lý',
    description: 'Đặt lịch đang được xử lý',
    icon: CheckCircle,
  },
];

const COMPLETED_COLUMNS = [
  {
    id: 'ESTIMATED',
    title: 'Đang ước lượng',
    description: 'Dịch vụ đang được ước lượng',
    icon: CheckCircle,
  },
  {
    id: 'COMPLETED',
    title: 'Đã hoàn thành',
    description: 'Đặt lịch đã hoàn thành',
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
  <div className="bg-white rounded-lg border border-gray-100 p-3 sm:p-4 space-y-3">
    {/* Header Section */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-3 w-20 sm:h-4 sm:w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded flex-shrink-0" />
    </div>

    {/* Service Information */}
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded flex-shrink-0" />
      <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
    </div>

    {/* Contact Information */}
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <div className="flex flex-col space-y-1 min-w-0 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <Skeleton className="h-3 w-32 sm:w-36" />
      </div>
      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        <Skeleton className="h-8 w-full sm:w-auto sm:flex-1" />
        <Skeleton className="h-8 w-full sm:w-auto sm:flex-1" />
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

  const bookingsArray: ServiceRequestWithBooking[] = bookings?.data || [];

  const groupedBookings = {
    PENDING: bookingsArray.filter(
      (booking: ServiceRequestWithBooking) =>
        booking.status === StatusServiceRequest.PENDING && booking.booking?.status !== 'CANCELLED'
    ),
    IN_PROGRESS: bookingsArray.filter(
      (booking: ServiceRequestWithBooking) =>
        booking.status === StatusServiceRequest.IN_PROGRESS &&
        booking.booking?.status !== 'CANCELLED'
    ),
    ESTIMATED: bookingsArray.filter(
      (booking: ServiceRequestWithBooking) =>
        booking.status === StatusServiceRequest.ESTIMATED &&
        !booking.booking?.completedAt &&
        booking.booking?.status !== 'CANCELLED'
    ),
    COMPLETED: bookingsArray.filter(
      (booking: ServiceRequestWithBooking) =>
        (booking.booking?.status === 'COMPLETED' ||
          (booking.status === StatusServiceRequest.ESTIMATED && booking.booking?.completedAt)) &&
        booking.booking?.status !== 'CANCELLED'
    ),
    CANCELLED: bookingsArray.filter(
      (booking: ServiceRequestWithBooking) =>
        booking.status === StatusServiceRequest.CANCELLED || booking.booking?.status === 'CANCELLED'
    ),
  };

  const activeBookingsCount = groupedBookings.PENDING.length + groupedBookings.IN_PROGRESS.length;
  const completedBookingsCount =
    groupedBookings.ESTIMATED.length +
    groupedBookings.COMPLETED.length +
    groupedBookings.CANCELLED.length;

  const renderKanbanColumns = (columns: typeof ACTIVE_COLUMNS | typeof COMPLETED_COLUMNS) => (
    <div
      className={`grid gap-4 sm:gap-6 ${
        columns === COMPLETED_COLUMNS
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2'
      }`}
    >
      {columns.map(column => {
        const columnBookings = groupedBookings[column.id as keyof typeof groupedBookings];
        return (
          <Card key={column.id} className="border-0 shadow-sm bg-gray-50/50">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
                    <column.icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {column.title}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                      {column.description}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs px-2 py-1 flex-shrink-0 ml-2">
                  {columnBookings.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3 min-h-[400px] sm:min-h-[500px]">
              {columnBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white border flex items-center justify-center mb-3">
                    <column.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Chưa có đặt lịch</p>
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                    Danh sách đặt lịch theo trạng thái
                  </p>
                </div>
              ) : (
                columnBookings.map((booking: ServiceRequestWithBooking) => (
                  <BookingCard
                    key={booking.id.toString()}
                    booking={booking}
                    status={column.id as ServiceRequestWithBooking['status']}
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
      <div className="space-y-4 sm:space-y-6">
        <Tabs value="active" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 min-w-[400px]">
              <TabsTrigger
                value="active"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Đang xử lý</span>
                <span className="sm:hidden">Đang xử lý</span>
                <Badge variant="secondary" className="text-xs">
                  {activeBookingsCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Đang ước lượng, Đã hoàn thành & Đã huỷ</span>
                <span className="sm:hidden">Hoàn thành</span>
                <Badge variant="outline" className="text-xs">
                  {completedBookingsCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="active" className="mt-4 sm:mt-6"></TabsContent>
        </Tabs>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {ACTIVE_COLUMNS.map(column => (
            <Card key={column.id} className="border-0 shadow-sm bg-gray-50/50">
              <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
                      <column.icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {column.title}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                        {column.description}
                      </p>
                    </div>
                  </div>
                  <div className="h-4 w-6 sm:h-5 sm:w-8 bg-gray-200 rounded animate-pulse flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-3">
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 min-w-[400px]">
            <TabsTrigger
              value="active"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Đang xử lý</span>
              <span className="sm:hidden">Đang xử lý</span>
              <Badge variant="secondary" className="text-xs">
                {activeBookingsCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Đang ước lượng, Đã hoàn thành & Đã huỷ</span>
              <span className="sm:hidden">Hoàn thành</span>
              <Badge variant="outline" className="text-xs">
                {completedBookingsCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-4 sm:mt-6">
          {renderKanbanColumns(ACTIVE_COLUMNS)}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 sm:mt-6">
          {renderKanbanColumns(COMPLETED_COLUMNS)}
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Trang <span className="font-medium">{bookings?.page ?? filters.currentPage}</span> /{' '}
          <span className="font-medium">{bookings?.totalPages ?? 1}</span> • Tổng{' '}
          <span className="font-medium">{bookings?.totalItems ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              filters.handlePageChange(Math.max(1, (bookings?.page ?? filters.currentPage) - 1))
            }
            disabled={(bookings?.page ?? filters.currentPage) <= 1 || isLoading}
          >
            Trước
          </Button>
          <Select
            value={String(filters.limit)}
            onValueChange={v => {
              const newLimit = Number(v);
              if (!Number.isNaN(newLimit)) {
                filters.handleLimitChange(newLimit);
              }
            }}
          >
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / trang</SelectItem>
              <SelectItem value="20">20 / trang</SelectItem>
              <SelectItem value="50">50 / trang</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              filters.handlePageChange(
                Math.min(
                  bookings?.totalPages ?? filters.currentPage + 1,
                  (bookings?.page ?? filters.currentPage) + 1
                )
              )
            }
            disabled={
              (bookings?.page ?? filters.currentPage) >= (bookings?.totalPages ?? 1) || isLoading
            }
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
