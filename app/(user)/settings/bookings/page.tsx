'use client';

import { useState, Fragment } from 'react';
import {
  useCustomerBooking,
  useGetUserProposal,
  useUpdateUserProposal,
  useCancelServiceRequest,
} from '@/hooks/useUser';
import { CustomerBooking } from '@/lib/api/services/fetchUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Clock as ClockIcon,
  Loader2,
  LucideIcon,
  Flag,
} from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/utils/numbers/formatDate';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateProposalTransaction } from '@/hooks/usePayment';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { useForm } from 'react-hook-form';
import { useCreateReport } from '@/hooks/useBooking';
import { useUploadImage } from '@/hooks/useImage';

const getStatusConfig = (status: string) => {
  const map: Record<string, { label: string; icon: LucideIcon }> = {
    PENDING: { label: 'Chờ xác nhận', icon: ClockIcon },
    CONFIRMED: { label: 'Đã xác nhận', icon: CheckCircle },
    IN_PROGRESS: { label: 'Đang thực hiện', icon: ClockIcon },
    COMPLETED: { label: 'Hoàn thành', icon: CheckCircle },
    CANCELLED: { label: 'Đã hủy', icon: XCircle },
  };
  return map[status.toUpperCase()] || { label: status, icon: AlertCircle };
};

const getTransactionStatusConfig = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    FAILED: 'Thanh toán thất bại',
    // REFUNDED: 'Đã hoàn tiền',
  };
  return map[status.toUpperCase()] || status;
};

// Translate Service Request status to Vietnamese
const getServiceRequestStatusVi = (status: string) => {
  const key = status?.toUpperCase?.() || '';
  const map: Record<string, string> = {
    ESTIMATED: 'Đang ước lượng',
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    ACCEPTED: 'Đã chấp nhận',
    REJECTED: 'Từ chối',
    IN_PROGRESS: 'Đang thực hiện',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return map[key] || status;
};

// Translate payment method to Vietnamese
const getPaymentMethodVi = (method: string) => {
  const key = method?.toUpperCase?.() || '';
  const map: Record<string, string> = {
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    WALLET: 'Ví',
  };
  return map[key] || method;
};

// Strong types for bookings derived from API types
type BookingItem = CustomerBooking['data']['bookings'][0];

function isBookingItem(value: unknown): value is BookingItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'ServiceRequest' in value &&
    'ServiceProvider' in value
  );
}

function isBookingArray(value: unknown): value is BookingItem[] {
  return Array.isArray(value) && value.every(isBookingItem);
}

const ProposalSection = ({
  bookingId,
  bookingStatus,
  transactionStatus,
}: {
  bookingId: number;
  bookingStatus: string;
  transactionStatus?: string;
}) => {
  const { data, isLoading, error } = useGetUserProposal(bookingId);
  const { mutate: updateProposal, isPending: isUpdating } = useUpdateUserProposal();
  const { mutate: createTransaction, isPending: isCreatingPayment } =
    useCreateProposalTransaction();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-muted-foreground">Không có đề xuất dịch vụ.</div>;
  }

  const proposal = data?.data;

  if (!proposal) {
    return <div className="text-sm text-muted-foreground">Chưa có đề xuất dịch vụ.</div>;
  }

  const normalizeQuantity = (q: unknown): number => {
    return typeof q === 'number' ? q : typeof q === 'string' ? parseInt(q, 10) || 0 : 0;
  };

  const sortedItems = Array.isArray(proposal.ProposalItem)
    ? [...proposal.ProposalItem].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : [];

  const lastProposalItem = sortedItems.length > 0 ? sortedItems[sortedItems.length - 1] : undefined;

  const totalAmount = lastProposalItem
    ? (lastProposalItem.Service?.virtualPrice ?? 0) * normalizeQuantity(lastProposalItem.quantity)
    : 0;

  const isPaid = transactionStatus?.toUpperCase() === 'PAID';
  const canShowActions = bookingStatus?.toUpperCase() === 'CONFIRMED' && !isPaid;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/10 p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold">Đề xuất #{proposal.id}</h4>
            <p className="text-xs text-muted-foreground">{formatDate(proposal.createdAt)}</p>
          </div>
          <Badge
            variant={proposal.status === 'ACCEPTED' ? 'default' : 'outline'}
            className="text-xs"
          >
            {proposal.status === 'ACCEPTED'
              ? 'Đã được thêm'
              : proposal.status === 'PENDING'
                ? 'Chờ xử lý'
                : proposal.status}
          </Badge>
        </div>

        {proposal.notes && <p className="mt-2 text-sm text-muted-foreground">{proposal.notes}</p>}

        {sortedItems && sortedItems.length > 0 ? (
          <div className="mt-3 space-y-3">
            {sortedItems.map((item, index) => (
              <div key={item.id} className="rounded-md border bg-background p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex-1 pr-2 truncate">
                    <span className="font-medium">{item.Service?.name ?? 'Dịch vụ'}</span>
                    <span className="text-muted-foreground">
                      {' '}
                      × {normalizeQuantity(item.quantity)}
                    </span>
                  </div>
                  <div className="whitespace-nowrap font-medium">
                    {formatCurrency(
                      (item.Service?.virtualPrice ?? 0) * normalizeQuantity(item.quantity)
                    )}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>
                    {`Đề xuất ${index + 1}`} · {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
            {lastProposalItem && (
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                <span>Đề xuất gần nhất</span>
                <span>{formatDate(lastProposalItem.createdAt)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 p-3 text-center text-sm text-muted-foreground border rounded-md bg-muted/20">
            Không có mục dịch vụ nào
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tổng cộng</span>
          <span className="font-semibold">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {canShowActions && (
        <div
          className="flex flex-col sm:flex-row items-stretch justify-end gap-2 pt-1"
          aria-live="polite"
        >
          <Button
            size="sm"
            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
            disabled={isCreatingPayment}
            aria-label="Thanh toán đề xuất"
            onClick={() =>
              createTransaction(
                { bookingId, method: 'BANK_TRANSFER' },
                {
                  onSuccess: response => {
                    const url = response?.data?.responseData?.checkoutUrl;
                    if (typeof window !== 'undefined' && url) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  },
                }
              )
            }
          >
            {isCreatingPayment ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4 mr-1 text-white" aria-label="Loading" />
                Đang chuyển đến thanh toán...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Thanh toán
              </span>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 sm:flex-initial transition-colors duration-150"
            disabled={isUpdating}
            aria-label="Từ chối đề xuất"
            onClick={() =>
              updateProposal(
                { id: bookingId, data: { action: 'REJECT' } },
                {
                  onSuccess: () =>
                    queryClient.invalidateQueries({ queryKey: ['users', 'proposal', bookingId] }),
                }
              )
            }
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 mr-1 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Từ chối
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ booking }: { booking: CustomerBooking['data']['bookings'][0] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const statusConfig = getStatusConfig(booking.status);
  const transactionStatusLabel = getTransactionStatusConfig(
    booking.Transaction?.status || 'PENDING'
  );

  type ReportFormValues = {
    reason: string;
    description: string;
    imageUrls: string[];
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ReportFormValues>({
    defaultValues: { reason: '', description: '', imageUrls: [] },
  });

  const imageUrls = watch('imageUrls');
  const { mutate: createReport, isPending: isReporting } = useCreateReport();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutate: cancelServiceRequest, isPending: isCancelling } = useCancelServiceRequest();

  const handleUpload = async (file: File): Promise<string> => {
    const res = await uploadImage(file);
    return res.url;
  };

  const onSubmitReport = (values: ReportFormValues) => {
    createReport(
      {
        bookingId: booking.id,
        data: {
          reason: values.reason,
          description: values.description,
          imageUrls: values.imageUrls,
        },
      },
      {
        onSuccess: () => {
          setIsReportOpen(false);
          reset();
        },
      }
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow break-inside-avoid mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <statusConfig.icon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                #{booking.id}
              </Badge>
            </div>
            <CardTitle className="text-lg">Đặt dịch vụ</CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {formatDate(booking.createdAt)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {booking.ServiceRequest?.status?.toUpperCase() === 'PENDING' && (
              <Button
                variant="outline"
                size="sm"
                disabled={isCancelling}
                onClick={() => cancelServiceRequest({ serviceRequestId: booking.serviceRequestId })}
                aria-label="Hủy yêu cầu dịch vụ"
              >
                {isCancelling ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Đang hủy...
                  </span>
                ) : (
                  'Hủy yêu cầu'
                )}
              </Button>
            )}
            {booking.status?.toUpperCase() === 'COMPLETED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReportOpen(true)}
                aria-label="Báo cáo sự cố cho đơn đặt này"
              >
                <Flag className="h-4 w-4 mr-1" /> Báo cáo
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={`booking-${booking.id}-details`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Provider */}
        <div className="flex gap-3 items-start p-3 bg-muted/30 rounded-lg">
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
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
              <Building className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold truncate">
              {booking.ServiceProvider.User_ServiceProvider_userIdToUser.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {booking.ServiceProvider.description}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground truncate">
              <MapPin className="h-3 w-3" />
              {booking.ServiceRequest.location}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ghi chú:</span>
            {booking.ServiceRequest.note || 'Không có'}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ngày ưu tiên:</span>
            {formatDate(booking.ServiceRequest.preferredDate)}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SĐT:</span>
            {booking.ServiceRequest.phoneNumber}
          </div>
        </div>

        {/* Transaction */}
        {booking.Transaction && (
          <>
            <Separator />
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Thanh toán</span>
                <Badge variant="outline">{transactionStatusLabel}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền:</span>
                {booking.Transaction?.amount !== undefined ? (
                  formatCurrency(booking.Transaction.amount)
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức:</span>
                {booking.Transaction?.method ? (
                  getPaymentMethodVi(booking.Transaction.method)
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono">
                  {booking.Transaction?.orderCode ? (
                    booking.Transaction.orderCode
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </span>
              </div>
              {booking.Transaction?.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày thanh toán:</span>
                  {formatDate(booking.Transaction.paidAt)}
                </div>
              )}
            </div>
          </>
        )}

        {/* Expanded */}
        {isExpanded && (
          <div
            id={`booking-${booking.id}-details`}
            className="space-y-4 animate-in fade-in-0 slide-in-from-top-1 duration-200"
          >
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Trạng thái:</span>
                <p className="font-medium">
                  {getServiceRequestStatusVi(booking.ServiceRequest.status)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Danh mục:</span>
                <p className="font-medium">{booking.ServiceRequest.Category.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nhân viên:</span>
                <p className="font-medium">
                  {booking.Staff_Booking_staffIdToStaff?.User?.name ? (
                    booking.Staff_Booking_staffIdToStaff.User.name
                  ) : (
                    <span className="text-muted-foreground">Chưa được phân công</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Cập nhật:</span>
                <p className="font-medium">{formatDate(booking.updatedAt)}</p>
              </div>
            </div>

            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Đề xuất dịch vụ</h3>
              <ProposalSection
                bookingId={booking.id}
                bookingStatus={booking.status}
                transactionStatus={booking.Transaction?.status}
              />
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Báo cáo sự cố</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitReport)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`reason-${booking.id}`}>Lý do</Label>
              <Input
                id={`reason-${booking.id}`}
                placeholder="Nhập lý do báo cáo"
                aria-invalid={!!errors.reason}
                {...register('reason', { required: true, minLength: 3 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`description-${booking.id}`}>Mô tả chi tiết</Label>
              <Textarea
                id={`description-${booking.id}`}
                placeholder="Mô tả vấn đề bạn gặp phải"
                aria-invalid={!!errors.description}
                {...register('description', { required: true, minLength: 10 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hình ảnh minh họa (tùy chọn)</Label>
              <ImageUpload
                disabled={isUploading || isReporting}
                onChange={(urls: string[]) => setValue('imageUrls', urls, { shouldDirty: true })}
                onUpload={handleUpload}
                value={imageUrls}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsReportOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isReporting} className="min-w-24">
                {isReporting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Đang gửi
                  </span>
                ) : (
                  'Gửi báo cáo'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const BookingSkeleton = () => (
  <Card className="overflow-hidden animate-pulse break-inside-avoid mb-4">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </CardContent>
  </Card>
);

export default function BookingsPage() {
  const { data: bookingData, isLoading, error } = useCustomerBooking();

  const bookings: BookingItem[] = isBookingArray(bookingData?.bookings)
    ? bookingData!.bookings
    : isBookingItem(bookingData?.bookings)
      ? [bookingData!.bookings]
      : [];

  const statuses: { key: string; label: string; filter: (b: BookingItem) => boolean }[] = [
    { key: 'all', label: 'Tất cả', filter: () => true },
    {
      key: 'pending',
      label: 'Chờ xác nhận',
      filter: (b: BookingItem) => b.status.toUpperCase() === 'PENDING',
    },
    {
      key: 'confirmed',
      label: 'Đã xác nhận',
      filter: (b: BookingItem) => b.status.toUpperCase() === 'CONFIRMED',
    },
    {
      key: 'in-progress',
      label: 'Đang thực hiện',
      filter: (b: BookingItem) => b.status.toUpperCase() === 'IN_PROGRESS',
    },
    {
      key: 'completed',
      label: 'Hoàn thành',
      filter: (b: BookingItem) => b.status.toUpperCase() === 'COMPLETED',
    },
    {
      key: 'cancelled',
      label: 'Đã hủy',
      filter: (b: BookingItem) => b.status.toUpperCase() === 'CANCELLED',
    },
  ];

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="text-center py-8">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <CardTitle>Lỗi tải danh sách đặt dịch vụ</CardTitle>
          <CardDescription>Vui lòng thử lại sau</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Đặt dịch vụ của tôi</h1>
        <p className="text-muted-foreground">Theo dõi tất cả các đặt dịch vụ của bạn</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {statuses.map(s => (
            <TabsTrigger key={s.key} value={s.key}>
              {s.label}{' '}
              <span className="ml-1 text-muted-foreground text-xs">
                ({bookings.filter(s.filter).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {statuses.map(s => (
          <TabsContent key={s.key} value={s.key}>
            {isLoading ? (
              <div className="columns-1 md:columns-2 gap-4 [column-fill:_balance]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BookingSkeleton key={i} />
                ))}
              </div>
            ) : bookings.filter(s.filter).length > 0 ? (
              <div className="columns-1 md:columns-2 gap-4 [column-fill:_balance]">
                {bookings.filter(s.filter).map((b: BookingItem) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            ) : (
              <Card className="py-12 text-center">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Không có dữ liệu</p>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
