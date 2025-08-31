'use client';

import { BookingCard } from './BookingCard';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle, Archive, AlertTriangle } from 'lucide-react';
import { AlertTitle } from '@/components/ui/alert';
import { AlertDescription } from '@/components/ui/alert';
import { Booking, StatusServiceRequest } from '@/lib/api/services/fetchBooking';
import { useStaffBooking } from '@/hooks/useBooking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ACTIVE_COLUMNS = [
  {
    id: StatusServiceRequest.PENDING,
    title: 'Chờ xử lý',
    description: 'Dịch vụ đang chờ xử lý',
    icon: AlertTriangle,
  },
  {
    id: StatusServiceRequest.IN_PROGRESS,
    title: 'Đang trong quá trình',
    description: 'Dịch vụ đang trong quá trình',
    icon: CheckCircle,
  },
];

const COMPLETED_COLUMNS = [
  {
    id: StatusServiceRequest.ESTIMATED,
    title: 'Đã ước lượng',
    description: 'Dịch vụ đã được ước lượng',
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
  <div className="bg-white rounded-lg border border-gray-100 p-3 sm:p-4 space-y-3">
    {/* Header Section */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-3 w-20 sm:h-4 sm:w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded" />
    </div>

    {/* Status Badge with Action Buttons */}
    <div className="flex items-center justify-between gap-2 mb-3">
      <Skeleton className="h-5 w-16 sm:h-6 sm:w-20 rounded-full" />
      <div className="flex gap-1">
        <Skeleton className="h-6 w-12 sm:h-7 sm:w-16 rounded" />
        <Skeleton className="h-6 w-10 sm:h-7 sm:w-14 rounded" />
      </div>
    </div>

    {/* Service Information */}
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
      <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
    </div>

    {/* Contact Information */}
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
        <div className="flex flex-col space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
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

  // Treat backend booking.status = 'COMPLETED' as completed regardless of serviceRequest status
  const isCompletedBooking = (booking: Booking) =>
    `${booking.status}`.toUpperCase() === 'COMPLETED';

  const groupedBookings: Record<StatusServiceRequest, Booking[]> = {
    [StatusServiceRequest.PENDING]: bookingsArray.filter(
      booking =>
        booking.serviceRequest.status === StatusServiceRequest.PENDING &&
        booking.status !== 'CANCELLED'
    ),
    [StatusServiceRequest.IN_PROGRESS]: bookingsArray.filter(
      booking =>
        booking.serviceRequest.status === StatusServiceRequest.IN_PROGRESS &&
        booking.status !== 'CANCELLED'
    ),
    [StatusServiceRequest.ESTIMATED]: bookingsArray.filter(
      booking =>
        booking.serviceRequest.status === StatusServiceRequest.ESTIMATED &&
        !isCompletedBooking(booking) &&
        booking.status !== 'CANCELLED'
    ),
    [StatusServiceRequest.CANCELLED]: bookingsArray.filter(
      booking =>
        booking.status === 'CANCELLED' ||
        booking.serviceRequest.status === StatusServiceRequest.CANCELLED
    ),
  };

  const renderActiveColumns = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {ACTIVE_COLUMNS.map(column => {
        const columnBookings = groupedBookings[column.id as StatusServiceRequest];
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
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white border flex items-center justify-center mb-3 sm:mb-3">
                    <column.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Chưa có đặt lịch</p>
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                    Danh sách công việc theo trạng thái
                  </p>
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

  const renderCompletedColumns = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
      {COMPLETED_COLUMNS.map(column => {
        const columnBookings = groupedBookings[column.id as StatusServiceRequest];
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
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white border flex items-center justify-center mb-3 sm:mb-3">
                    <column.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Chưa có đặt lịch</p>
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                    Danh sách công việc theo trạng thái
                  </p>
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
      <div className="space-y-4 sm:space-y-6">
        <Tabs defaultValue="active" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 min-w-[400px]">
              <TabsTrigger value="active" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="sm:hidden">Đang xử lý</span>
                <span className="hidden sm:inline">Đang xử lý</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="sm:hidden">Hoàn thành</span>
                <span className="hidden sm:inline">Đã xử lý</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          </TabsContent>

          <TabsContent value="completed" className="mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              {COMPLETED_COLUMNS.map(column => (
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
          </TabsContent>
        </Tabs>
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 min-w-[400px]">
            <TabsTrigger value="active" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="sm:hidden">Đang xử lý</span>
              <span className="hidden sm:inline">Đang xử lý</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="sm:hidden">Hoàn thành</span>
              <span className="hidden sm:inline">Đang trong quá trình</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-4 sm:mt-6">
          {renderActiveColumns()}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 sm:mt-6">
          {renderCompletedColumns()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
