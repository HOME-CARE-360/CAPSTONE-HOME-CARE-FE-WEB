'use client';

import { useState } from 'react';
import { useCustomerBooking } from '@/hooks/useUser';
import { CustomerBooking } from '@/lib/api/services/fetchUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  Eye,
} from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/utils/numbers/formatDate';
import { formatCurrency } from '@/utils/numbers/formatCurrency';

type Booking = CustomerBooking['data']['bookings'] & {
  Transaction?: {
    id: number;
    bookingId: number;
    amount: number;
    status: string;
    method: string;
    paidAt: string | null;
    createdById: number;
    updatedById: number | null;
    deletedById: number | null;
    deletedAt: string | null;
    createdAt: string;
    orderCode: string;
  };
};

const getStatusConfig = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return {
        label: 'Chờ xác nhận',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon,
      };
    case 'CONFIRMED':
      return {
        label: 'Đã xác nhận',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
      };
    case 'IN_PROGRESS':
      return {
        label: 'Đang thực hiện',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: ClockIcon,
      };
    case 'COMPLETED':
      return {
        label: 'Hoàn thành',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
      };
    case 'CANCELLED':
      return {
        label: 'Đã hủy',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
      };
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertCircle,
      };
  }
};

const getTransactionStatusConfig = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return {
        label: 'Chờ thanh toán',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      };
    case 'PAID':
      return {
        label: 'Đã thanh toán',
        color: 'bg-green-100 text-green-800 border-green-200',
      };
    case 'FAILED':
      return {
        label: 'Thanh toán thất bại',
        color: 'bg-red-100 text-red-800 border-red-200',
      };
    case 'REFUNDED':
      return {
        label: 'Đã hoàn tiền',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
      };
  }
};

const BookingCard = ({ booking }: { booking: Booking }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = getStatusConfig(booking.status);

  // Transaction may not exist on booking, so use optional chaining
  const transactionStatus = booking.Transaction?.status || 'PENDING';
  const transactionStatusConfig = getTransactionStatusConfig(transactionStatus);

  const StatusIcon = statusConfig.icon;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${statusConfig.color} border`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                #{booking.id}
              </Badge>
            </div>
            <CardTitle className="text-lg">Đặt dịch vụ</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {formatDate(booking.createdAt)}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Provider Information */}
        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="relative">
            {booking.ServiceProvider.logo ? (
              <Image
                src={booking.ServiceProvider.logo}
                alt={booking.ServiceProvider.User_ServiceProvider_userIdToUser.name}
                width={48}
                height={48}
                className="rounded-full"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {booking.ServiceProvider.User_ServiceProvider_userIdToUser.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {booking.ServiceProvider.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">
                {booking.ServiceRequest.location}
              </span>
            </div>
          </div>
        </div>

        {/* Service Request Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ghi chú:</span>
            <span className="font-medium">{booking.ServiceRequest.note || 'Không có'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ngày ưu tiên:</span>
            <span className="font-medium">{formatDate(booking.ServiceRequest.preferredDate)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Số điện thoại:</span>
            <span className="font-medium">{booking.ServiceRequest.phoneNumber}</span>
          </div>
        </div>

        {/* Transaction Information */}
        {booking.Transaction && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Thanh toán</span>
                <Badge className={`${transactionStatusConfig.color} border`}>
                  {transactionStatusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(booking.Transaction.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phương thức:</span>
                <span className="font-medium">{booking.Transaction.method}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono text-xs">{booking.Transaction.orderCode}</span>
              </div>
              {booking.Transaction.paidAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ngày thanh toán:</span>
                  <span className="font-medium">{formatDate(booking.Transaction.paidAt)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <>
            <Separator />
            <div className="space-y-3">
              <h5 className="text-sm font-medium">Chi tiết bổ sung</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Trạng thái dịch vụ:</span>
                  <p className="font-medium">{booking.ServiceRequest.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Danh mục:</span>
                  <p className="font-medium">ID: {booking.ServiceRequest.categoryId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nhân viên:</span>
                  <p className="font-medium">ID: {booking.staffId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                  <p className="font-medium">{formatDate(booking.updatedAt)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const BookingSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-8 ml-2" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </CardContent>
  </Card>
);

export default function BookingsPage() {
  const { data: bookingData, isLoading, error } = useCustomerBooking();

  // Handle the case where bookings might be a single object or array
  const bookings = Array.isArray(bookingData?.bookings)
    ? bookingData.bookings
    : bookingData?.bookings
      ? [bookingData.bookings]
      : [];

  // Group bookings by status
  interface Booking {
    status: string;
    [key: string]: unknown;
  }

  function isBooking(obj: unknown): obj is Booking {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'status' in obj &&
      typeof (obj as { status: unknown }).status === 'string'
    );
  }

  const pendingBookings = bookings
    .filter(isBooking)
    .filter(b => b.status.toUpperCase() === 'PENDING');
  const confirmedBookings = bookings
    .filter(isBooking)
    .filter(b => b.status.toUpperCase() === 'CONFIRMED');
  const inProgressBookings = bookings
    .filter(isBooking)
    .filter(b => b.status.toUpperCase() === 'IN_PROGRESS');
  const completedBookings = bookings
    .filter(isBooking)
    .filter(b => b.status.toUpperCase() === 'COMPLETED');
  const cancelledBookings = bookings
    .filter(isBooking)
    .filter(b => b.status.toUpperCase() === 'CANCELLED');

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Lỗi tải danh sách đặt dịch vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDescription>
              Không thể tải danh sách đặt dịch vụ. Vui lòng thử lại sau.
            </AlertDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Đặt dịch vụ của tôi</h1>
        <p className="text-muted-foreground">Quản lý và theo dõi tất cả các đặt dịch vụ của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Chờ xác nhận</span>
            </div>
            <p className="text-2xl font-bold mt-2">{pendingBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Đã xác nhận</span>
            </div>
            <p className="text-2xl font-bold mt-2">{confirmedBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Đang thực hiện</span>
            </div>
            <p className="text-2xl font-bold mt-2">{inProgressBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Hoàn thành</span>
            </div>
            <p className="text-2xl font-bold mt-2">{completedBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Đã hủy</span>
            </div>
            <p className="text-2xl font-bold mt-2">{cancelledBookings.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Tất cả ({bookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Chờ xác nhận ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Đã xác nhận ({confirmedBookings.length})</TabsTrigger>
          <TabsTrigger value="in-progress">
            Đang thực hiện ({inProgressBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành ({completedBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy ({cancelledBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <BookingSkeleton key={i} />
              ))}
            </div>
          ) : bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có đặt dịch vụ nào</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Bạn chưa có đặt dịch vụ nào. Hãy khám phá các dịch vụ và đặt lịch ngay!
                </p>
                <Button className="mt-4">Khám phá dịch vụ</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {confirmedBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cancelledBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
