'use client';

import { useState } from 'react';
import {
  useCustomerBooking,
  useGetUserProposal,
  useUpdateUserProposal,
  useCancelServiceRequest,
} from '@/hooks/useUser';
import { useReportBooking } from '@/hooks/useManageBooking';
import { CustomerBooking } from '@/lib/api/services/fetchUser';

// Define proper types to avoid 'any'
interface ServiceItem {
  id?: number;
  name?: string;
  brand?: string;
  model?: string;
  description?: string;
  unitPrice?: number;
  warrantyPeriod?: number;
  unit?: string;
  stockQuantity?: number;
}

interface ServiceItemWrapper {
  serviceItem?: ServiceItem;
  id?: number;
  name?: string;
  brand?: string;
  model?: string;
  description?: string;
  unitPrice?: number;
  warrantyPeriod?: number;
  unit?: string;
  stockQuantity?: number;
}

// Helper function to safely get provider ID from booking
function getProviderIdFromBooking(booking: BookingItem): number | undefined {
  // Try to get providerId if it exists (some bookings may have this property)
  const serviceProvider = booking.ServiceProvider;

  // Check if serviceProvider has a providerId property (may exist in some API responses)
  if (serviceProvider && 'providerId' in serviceProvider) {
    return (serviceProvider as { providerId?: number }).providerId || serviceProvider.id;
  }

  return serviceProvider?.id;
}
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
  Star,
  Wallet,
  CreditCard,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { useForm } from 'react-hook-form';
import { useCreateReview, useCompleteBooking } from '@/hooks/useBooking';
import { useUploadImage } from '@/hooks/useImage';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetOrCreateConversation } from '@/hooks/useConversation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

//Booking status
const getStatusConfig = (status: string) => {
  const map: Record<
    string,
    {
      label: string;
      icon: LucideIcon;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
  > = {
    PENDING: { label: 'Chờ nhà cung cấp xác nhận', icon: ClockIcon, variant: 'secondary' },
    CONFIRMED: { label: 'Đã xác nhận', icon: CheckCircle, variant: 'default' },
    STAFF_COMPLETED: { label: 'Nhân viên thực hiện xong', icon: CheckCircle, variant: 'default' },
    COMPLETED: { label: 'Hoàn thành', icon: CheckCircle, variant: 'default' },
    CANCELLED: { label: 'Đã hủy', icon: XCircle, variant: 'destructive' },
  };
  return (
    map[status.toUpperCase()] || { label: status, icon: AlertCircle, variant: 'outline' as const }
  );
};

const getTransactionStatusConfig = (status: string) => {
  const map: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    PENDING: { label: 'Chờ thanh toán', variant: 'secondary' },
    PAID: { label: 'Đã thanh toán', variant: 'default' },
    SUCCESS: { label: 'Đã thanh toán', variant: 'default' },
    FAILED: { label: 'Thanh toán thất bại', variant: 'destructive' },
    // REFUNDED: { label: 'Đã hoàn tiền', variant: 'outline' },
  };
  return map[status.toUpperCase()] || { label: status, variant: 'outline' as const };
};

// Translate Service Request status to Vietnamese
// const getServiceRequestStatusVi = (status: string) => {
//   const key = status?.toUpperCase?.() || '';
//   const map: Record<string, string> = {
//     WAIT_FOR_PAYMENT: 'Đang chờ thanh toán',
//     ESTIMATED: 'Đang ước lượng',
//     PENDING: 'Chờ nhà cung cấp tìm kiếm nhân viên cho bạn',
//     // CONFIRMED: 'Đã xác nhận',
//     // ACCEPTED: 'Đã chấp nhận',
//     // REJECTED: 'Từ chối',
//     IN_PROGRESS: 'Đang thực hiện',
//     // COMPLETED: 'Hoàn thành',
//     CANCELLED: 'Đã hủy',
//   };
//   return map[key] || status;
// };

// Report reasons enum
enum ReportReason {
  POOR_SERVICE_QUALITY = 'POOR_SERVICE_QUALITY',
  STAFF_BEHAVIOR = 'STAFF_BEHAVIOR',
  TECHNICAL_ISSUES = 'TECHNICAL_ISSUES',
}

// Report reason labels
const getReportReasonLabel = (reason: ReportReason): string => {
  const map: Record<ReportReason, string> = {
    [ReportReason.POOR_SERVICE_QUALITY]: 'Chất lượng dịch vụ kém',
    [ReportReason.STAFF_BEHAVIOR]: 'Thái độ nhân viên không tốt',
    [ReportReason.TECHNICAL_ISSUES]: 'Vấn đề kỹ thuật',
  };
  return map[reason] || reason;
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
  serviceRequestStatus,
  transactionStatus,
  paymentTransactionStatus,
  paymentTransactionAmountOut,
  hasTransaction,
}: {
  bookingId: number;
  bookingStatus: string;
  serviceRequestStatus?: string;
  transactionStatus?: string;
  transactionAmount?: number;
  paymentTransactionStatus?: string;
  paymentTransactionAmountOut?: number;
  hasTransaction: boolean;
}) => {
  const { data, isLoading, error } = useGetUserProposal(bookingId);
  const { mutate: updateProposal, isPending: isUpdating } = useUpdateUserProposal();
  const { mutate: createTransaction, isPending: isCreatingPayment } =
    useCreateProposalTransaction();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Payment error dialog state
  const [isPaymentErrorOpen, setIsPaymentErrorOpen] = useState(false);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string>('Đã xảy ra lỗi khi thanh toán.');

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

  // Get all pending proposal items across all timestamps
  const allPendingItems = Array.isArray(proposal.ProposalItem)
    ? proposal.ProposalItem.filter(item => item.status === 'PENDING' || item.status === 'ACCEPTED')
    : [];

  const totalAmount = allPendingItems.reduce((total, item) => {
    const price =
      item.Service?.virtualPrice && item.Service.virtualPrice > 0
        ? item.Service.virtualPrice
        : (item.Service?.basePrice ?? 0);
    return total + price * normalizeQuantity(item.quantity);
  }, 0);

  const computedPaidStatus = (paymentTransactionStatus || transactionStatus || '').toUpperCase();
  const isPaid = computedPaidStatus === 'PAID' || computedPaidStatus === 'SUCCESS';
  const hasDepositAmount =
    isPaid &&
    typeof paymentTransactionAmountOut === 'number' &&
    !Number.isNaN(paymentTransactionAmountOut);
  const depositAmount = hasDepositAmount ? Math.max(paymentTransactionAmountOut as number, 0) : 0;
  const remainingAfterDeposit = hasDepositAmount
    ? Math.max(totalAmount - depositAmount, 0)
    : totalAmount;

  const isEstimate =
    (serviceRequestStatus || '').toUpperCase() === 'ESTIMATE' ||
    (serviceRequestStatus || '').toUpperCase() === 'ESTIMATED';
  const hasProposalItems = allPendingItems.length > 0;
  const isRejected = (proposal.status || '').toUpperCase() === 'REJECTED';
  const canShowActions = isEstimate && hasProposalItems && !isRejected && !hasTransaction;

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
                ? 'Chờ bạn chấp nhận dịch vụ'
                : proposal.status === 'REJECTED'
                  ? 'Chờ nhà cung cấp đưa ra dịch vụ phù hợp với bạn'
                  : proposal.status}
          </Badge>
        </div>

        {proposal.notes && <p className="mt-2 text-sm text-muted-foreground">{proposal.notes}</p>}
        {allPendingItems.length > 0 ? (
          <div className="mt-3 space-y-3">
            {allPendingItems.map((item, index) => (
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
                      (item.Service?.virtualPrice && item.Service.virtualPrice > 0
                        ? item.Service.virtualPrice
                        : (item.Service?.basePrice ?? 0)) * normalizeQuantity(item.quantity)
                    )}
                  </div>
                </div>

                {/* Service Items Details */}
                {Array.isArray(item.Service?.serviceItems) &&
                  item.Service.serviceItems.length > 0 && (
                    <div className="mt-2 grid gap-2">
                      {item.Service.serviceItems.map(
                        (serviceItem: ServiceItemWrapper, itemIndex: number) => {
                          // Handle different possible structures
                          const actualServiceItem: ServiceItem =
                            serviceItem?.serviceItem || serviceItem;

                          return (
                            <div
                              key={actualServiceItem?.id || `service-item-${index}-${itemIndex}`}
                              className="flex flex-col sm:flex-row items-end sm:items-end gap-3 border rounded-lg p-3 bg-muted/20"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm truncate">
                                    {actualServiceItem?.name || 'Không có tên'}
                                  </span>
                                  {actualServiceItem?.brand && (
                                    <span className="ml-1 py-0.5 rounded bg-muted text-muted-foreground text-xs">
                                      {actualServiceItem.brand}
                                    </span>
                                  )}
                                </div>
                                {actualServiceItem?.model && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Model:{' '}
                                    <span className="text-xs font-medium text-foreground">
                                      {actualServiceItem.model}
                                    </span>
                                  </div>
                                )}
                                {actualServiceItem?.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                    {actualServiceItem.description}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 text-xs min-w-[120px]">
                                <div>
                                  <span className="text-muted-foreground">Đơn giá: </span>
                                  <span className="font-medium">
                                    {actualServiceItem?.unitPrice
                                      ? formatCurrency(actualServiceItem.unitPrice)
                                      : 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Bảo hành: </span>
                                  <span>{actualServiceItem?.warrantyPeriod || 0} tháng</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>
                    {`Đề xuất ${index + 1}`} · {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 p-3 text-center text-sm text-muted-foreground border rounded-md bg-muted/20">
            Không có mục dịch vụ nào
          </div>
        )}

        <div className="mt-3 space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tổng giá trị đề xuất</span>
            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
          </div>
          {hasDepositAmount && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Số tiền đặt cọc</span>
                <span className="font-medium">- {formatCurrency(depositAmount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tổng Cộng:</span>
                <span className="font-semibold">{formatCurrency(remainingAfterDeposit)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {canShowActions && (
        <div
          className="flex flex-col sm:flex-row items-stretch justify-end gap-2 pt-1"
          aria-live="polite"
        >
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            {/* Pay with Wallet */}
            <Button
              size="sm"
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-150"
              disabled={isCreatingPayment}
              aria-label="Ví"
              onClick={() =>
                createTransaction(
                  { bookingId, method: 'WALLET' },
                  {
                    onSuccess: () => {
                      // Reload page to reflect updated payment state
                      router.refresh();
                    },
                    onError: (err: unknown) => {
                      const message =
                        typeof err === 'object' && err !== null && 'message' in err
                          ? String((err as { message?: string }).message || '')
                          : '';
                      setPaymentErrorMsg(
                        message || 'Không thể thanh toán bằng ví. Vui lòng thử lại sau.'
                      );
                      setIsPaymentErrorOpen(true);
                    },
                  }
                )
              }
            >
              {isCreatingPayment ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4 mr-1 text-white" aria-label="Loading" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Ví
                </span>
              )}
            </Button>

            {/* Pay with Bank Transfer */}
            <Button
              size="sm"
              className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
              disabled={isCreatingPayment}
              aria-label="Thanh toán bằng chuyển khoản ngân hàng"
              onClick={() =>
                createTransaction(
                  { bookingId, method: 'BANK_TRANSFER' },
                  {
                    onSuccess: response => {
                      const url = response?.data?.responseData?.checkoutUrl;
                      if (typeof window !== 'undefined' && url) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }
                      // After opening checkout, we also refresh the page to update state
                      router.refresh();
                    },
                    onError: (err: unknown) => {
                      const message =
                        typeof err === 'object' && err !== null && 'message' in err
                          ? String((err as { message?: string }).message || '')
                          : '';
                      setPaymentErrorMsg(
                        message ||
                          'Không thể khởi tạo thanh toán chuyển khoản ngân hàng. Vui lòng thử lại sau.'
                      );
                      setIsPaymentErrorOpen(true);
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
                  <CreditCard className="h-4 w-4" />
                  Chuyển khoản
                </span>
              )}
            </Button>
          </div>

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

      {/* Payment Error Dialog */}
      <Dialog open={isPaymentErrorOpen} onOpenChange={setIsPaymentErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lỗi thanh toán</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {(() => {
              if (typeof paymentErrorMsg === 'string') {
                return paymentErrorMsg;
              }
              if (
                paymentErrorMsg &&
                typeof paymentErrorMsg === 'object' &&
                'message' in paymentErrorMsg
              ) {
                const msg = (paymentErrorMsg as { message?: string }).message;
                if (Array.isArray(msg)) {
                  return msg.map((m: unknown, i: number) =>
                    typeof m === 'object' && m && 'message' in m ? (
                      <span key={i}>{(m as { message: string }).message}</span>
                    ) : (
                      <span key={i}>{String(m)}</span>
                    )
                  );
                }
                if (typeof msg === 'string') {
                  return msg;
                }
                if (typeof msg === 'object') {
                  return JSON.stringify(msg);
                }
              }
              return JSON.stringify(paymentErrorMsg);
            })()}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentErrorOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BookingCard = ({ booking }: { booking: CustomerBooking['data']['bookings'][0] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const statusConfig = getStatusConfig(booking.status);
  const transactionStatusConfig = getTransactionStatusConfig(
    booking.Transaction?.status || 'PENDING'
  );

  type ReportFormValues = {
    reason: ReportReason;
    description: string;
    imageUrls: string[];
    note: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ReportFormValues>({
    defaultValues: { reason: ReportReason.POOR_SERVICE_QUALITY, description: '', imageUrls: [] },
  });

  const imageUrls = watch('imageUrls');
  const { mutate: reportBooking, isPending: isReporting } = useReportBooking();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutate: cancelServiceRequest, isPending: isCancelling } = useCancelServiceRequest();
  const { mutate: completeBooking, isPending: isCompleting } = useCompleteBooking();
  const queryClient = useQueryClient();

  const handleUpload = async (file: File): Promise<string> => {
    const res = await uploadImage(file);
    return res.url;
  };

  const onSubmitReport = (values: ReportFormValues) => {
    reportBooking(
      {
        description: values.description,
        imageUrls: values.imageUrls,
        note: values.note,
        reporterType: 'CUSTOMER',
        reason: values.reason,
        reportedCustomerId: booking.customerId,
        reportedProviderId: booking.providerId,
        bookingId: booking.id,
      },
      {
        onSuccess: () => {
          setIsReportOpen(false);
          reset({ reason: ReportReason.POOR_SERVICE_QUALITY, description: '', imageUrls: [] });
        },
      }
    );
  };

  // Review
  const { mutate: createReview, isPending: isReviewing } = useCreateReview();
  const [rating, setRating] = useState<string>('5');
  const [comment, setComment] = useState<string>('');

  const submitReview = () => {
    createReview(
      { bookingId: booking.id, data: { rating: parseInt(rating, 10), comment } },
      {
        onSuccess: () => {
          setIsReviewOpen(false);
          setRating('5');
          setComment('');
        },
      }
    );
  };

  const { mutate: getOrCreateConv } = useGetOrCreateConversation();
  const router = useRouter();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow break-inside-avoid mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={statusConfig.variant} className="gap-1">
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
            {booking.ServiceRequest?.status?.toUpperCase() === 'PENDING' &&
              booking.status.toUpperCase() !== 'CANCELLED' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isCancelling}
                  onClick={() =>
                    cancelServiceRequest({ serviceRequestId: booking.serviceRequestId })
                  }
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
            {booking.status?.toUpperCase() === 'STAFF_COMPLETED' && (
              <Button
                variant="default"
                size="sm"
                disabled={isCompleting}
                onClick={() =>
                  completeBooking(
                    { bookingId: booking.id },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['users', 'bookings'] });
                      },
                    }
                  )
                }
                aria-label="Hoàn thành đơn đặt này"
              >
                {isCompleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Đang xử lý...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" /> Hoàn thành
                  </>
                )}
              </Button>
            )}
            {/* Always allow reporting */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportOpen(true)}
              aria-label="Báo cáo sự cố cho đơn đặt này"
            >
              <Flag className="h-4 w-4 mr-1" /> Báo cáo
            </Button>
            {booking.status?.toUpperCase() === 'COMPLETED' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsReviewOpen(true)}
                aria-label="Đánh giá dịch vụ cho đơn đặt này"
              >
                <Star className="h-4 w-4 mr-1" /> Đánh giá
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
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const providerId = getProviderIdFromBooking(booking);
                  if (!providerId) return;
                  getOrCreateConv(
                    { receiverId: Number(providerId) },
                    {
                      onSuccess: conversation => {
                        router.push(`/settings/chat?conversationId=${conversation.id}`);
                      },
                    }
                  );
                }}
              >
                Liên hệ
              </Button>
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
                <span>Thanh toán đặt dịch vụ</span>
                <Badge variant={transactionStatusConfig.variant}>
                  {transactionStatusConfig.label}
                </Badge>
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

            {/* Payment Transaction */}
            {booking.ServiceRequest.PaymentTransaction && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Thanh toán tiền đặt cọc</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <p className="font-medium">
                        <Badge
                          variant={
                            booking.ServiceRequest.PaymentTransaction.status === 'PENDING'
                              ? 'secondary'
                              : booking.ServiceRequest.PaymentTransaction.status === 'SUCCESS'
                                ? 'default'
                                : 'destructive'
                          }
                        >
                          {booking.ServiceRequest.PaymentTransaction.status === 'SUCCESS'
                            ? 'Thành công'
                            : booking.ServiceRequest.PaymentTransaction.status === 'PENDING'
                              ? 'Đang chờ'
                              : booking.ServiceRequest.PaymentTransaction.status === 'FAILED'
                                ? 'Thất bại'
                                : booking.ServiceRequest.PaymentTransaction.status}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Số tiền:</span>
                      <p className="font-medium">
                        {formatCurrency(booking.ServiceRequest.PaymentTransaction.amountOut)}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Mã tham chiếu:</span>
                      <p className="font-mono font-medium">
                        {booking.ServiceRequest.PaymentTransaction.referenceNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ngày giao dịch:</span>
                      <p className="font-medium">
                        {formatDate(booking.ServiceRequest.PaymentTransaction.transactionDate)}
                      </p>
                    </div>
                    {booking.ServiceRequest.PaymentTransaction.transactionContent && (
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Nội dung:</span>
                        <p className="font-medium">
                          {booking.ServiceRequest.PaymentTransaction.transactionContent}
                        </p>
                      </div>
                    )}
                    {booking.ServiceRequest.PaymentTransaction.accountNumber && (
                      <div>
                        <span className="text-muted-foreground">Số tài khoản:</span>
                        <p className="font-mono font-medium">
                          {booking.ServiceRequest.PaymentTransaction.accountNumber}
                        </p>
                      </div>
                    )}
                    {booking.ServiceRequest.PaymentTransaction.accumulated > 0 && (
                      <div>
                        <span className="text-muted-foreground">Tích lũy:</span>
                        <p className="font-medium">
                          {formatCurrency(booking.ServiceRequest.PaymentTransaction.accumulated)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Đề xuất dịch vụ</h3>
              <ProposalSection
                bookingId={booking.id}
                bookingStatus={booking.status}
                serviceRequestStatus={booking.ServiceRequest?.status}
                transactionStatus={booking.Transaction?.status}
                transactionAmount={booking.Transaction?.amount}
                paymentTransactionStatus={booking.ServiceRequest?.PaymentTransaction?.status}
                paymentTransactionAmountOut={booking.ServiceRequest?.PaymentTransaction?.amountOut}
                hasTransaction={Boolean(
                  booking.Transaction && booking.Transaction.status?.toUpperCase() !== 'PENDING'
                )}
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Báo cáo sự cố</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitReport)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`reason-${booking.id}`}>Lý do</Label>
              <Select
                value={watch('reason')}
                onValueChange={value => setValue('reason', value as ReportReason)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReportReason.POOR_SERVICE_QUALITY}>
                    {getReportReasonLabel(ReportReason.POOR_SERVICE_QUALITY)}
                  </SelectItem>
                  <SelectItem value={ReportReason.STAFF_BEHAVIOR}>
                    {getReportReasonLabel(ReportReason.STAFF_BEHAVIOR)}
                  </SelectItem>
                  <SelectItem value={ReportReason.TECHNICAL_ISSUES}>
                    {getReportReasonLabel(ReportReason.TECHNICAL_ISSUES)}
                  </SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor={`note-${booking.id}`}>Ghi chú</Label>
              <Textarea
                id={`note-${booking.id}`}
                placeholder="Ghi chú cho nhân viên"
                aria-invalid={!!errors.note}
                {...register('note', { required: true, minLength: 10 })}
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

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá dịch vụ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Chấm điểm</Label>
              <RadioGroup
                value={rating}
                onValueChange={setRating}
                className="flex items-center gap-3"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} className="flex items-center gap-1">
                    <RadioGroupItem id={`rating-${booking.id}-${n}`} value={String(n)} />
                    <Label
                      htmlFor={`rating-${booking.id}-${n}`}
                      className="flex items-center gap-1"
                    >
                      <Star
                        className={
                          n <= parseInt(rating, 10)
                            ? 'h-4 w-4 text-yellow-500'
                            : 'h-4 w-4 text-muted-foreground'
                        }
                      />
                      {n}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`comment-${booking.id}`} className="text-sm">
                Nhận xét
              </Label>
              <Textarea
                id={`comment-${booking.id}`}
                placeholder="Chia sẻ trải nghiệm của bạn"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsReviewOpen(false)}>
                Hủy
              </Button>
              <Button onClick={submitReview} disabled={isReviewing || !rating} className="min-w-24">
                {isReviewing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Đang gửi
                  </span>
                ) : (
                  'Gửi đánh giá'
                )}
              </Button>
            </DialogFooter>
          </div>
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

  // Helper function to check if booking is today
  const isBookingToday = (booking: BookingItem): boolean => {
    const today = new Date();
    const bookingDate = new Date(booking.createdAt);
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  };

  const statuses: { key: string; label: string; filter: (b: BookingItem) => boolean }[] = [
    { key: 'today', label: 'Hôm nay', filter: isBookingToday },
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
      key: 'staff-completed',
      label: 'Nhân viên đã xong',
      filter: (b: BookingItem) => b.status.toUpperCase() === 'STAFF_COMPLETED',
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

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
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
