'use client';

import { BookingCard } from './BookingCard';
import { useState, useEffect } from 'react';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle, Settings, Archive } from 'lucide-react';
import { AlertTitle } from '@/components/ui/alert';
import { AlertDescription } from '@/components/ui/alert';
import { Booking } from '@/lib/api/services/fetchManageBooking';
import { useManageBookings, useBookingFilters } from '@/hooks/useManageBooking';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
  {
    id: 'IN_PROGRESS',
    title: 'Đang thực hiện',
    description: 'Dịch vụ đang được thực hiện',
    icon: Settings,
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
  <div className="bg-white rounded-lg border p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-6 w-20" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
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

  // Store local state for optimistic updates
  const [localBookings, setLocalBookings] = useState<Booking[]>([]);

  // Update local state when API data changes
  useEffect(() => {
    if (bookings?.data) {
      setLocalBookings(bookings.data);
    }
  }, [bookings]);

  const bookingsArray = localBookings;

  const groupedBookings = {
    PENDING: bookingsArray.filter(booking => booking.status === 'PENDING'),
    CONFIRMED: bookingsArray.filter(booking => booking.status === 'CONFIRMED'),
    IN_PROGRESS: bookingsArray.filter(booking => booking.status === 'IN_PROGRESS'),
    COMPLETED: bookingsArray.filter(booking => booking.status === 'COMPLETED'),
    CANCELLED: bookingsArray.filter(booking => booking.status === 'CANCELLED'),
  };

  // Handle drag and drop event to update booking status
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Optimistically update the local state
    setLocalBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id.toString() === draggableId
          ? { ...booking, status: destination.droppableId as Booking['status'] }
          : booking
      )
    );

    // TODO: Implement actual API call to update booking status
    console.log('Update booking status:', {
      bookingId: draggableId,
      from: source.droppableId,
      to: destination.droppableId,
    });
  };

  const renderKanbanColumns = (columns: typeof ACTIVE_COLUMNS) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Droppable droppableId={column.id}>
              {provided => (
                <CardContent
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 space-y-3 min-h-[500px]"
                >
                  {columnBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center mb-3">
                        <column.icon className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">Chưa có đặt lịch</p>
                      <p className="text-xs text-gray-400 mt-1">Kéo thả để thay đổi trạng thái</p>
                    </div>
                  ) : (
                    columnBookings.map((booking, index) => (
                      <Draggable
                        key={booking.id.toString()}
                        draggableId={booking.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                          >
                            <BookingCard
                              booking={booking}
                              status={column.id as Booking['status']}
                              isDragging={snapshot.isDragging}
                              isLoading={false}
                              onStaffAssigned={onRefresh}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </CardContent>
              )}
            </Droppable>
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
          <DragDropContext onDragEnd={handleDragEnd}>
            {renderKanbanColumns(ACTIVE_COLUMNS)}
          </DragDropContext>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            {renderKanbanColumns(COMPLETED_COLUMNS)}
          </DragDropContext>
        </TabsContent>
      </Tabs>
    </div>
  );
}
