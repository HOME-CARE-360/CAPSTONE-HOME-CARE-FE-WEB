'use client';

import { useState } from 'react';
import {
  useCustomerBooking,
  useGetUserProposal,
  useUpdateUserProposal,
  useCancelServiceRequest,
  useGetUserBookingDetail,
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
import { useCreateProposalTransaction, usePayExistingServiceRequest } from '@/hooks/usePayment';
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
const getStatusConfig = (
  status: string,
  serviceRequestStatus?: string,
  hasProposal?: boolean,
  hasPendingPayment?: boolean
) => {
  const map: Record<
    string,
    {
      label: string;
      icon: LucideIcon;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
  > = {
    PENDING: {
      label: hasPendingPayment
        ? 'Chờ bạn thanh toán tiền đặt cọc'
        : hasProposal
          ? 'Chờ bạn xem đề xuất'
          : serviceRequestStatus?.toUpperCase() === 'ESTIMATED' ||
              serviceRequestStatus?.toUpperCase() === 'ESTIMATE'
            ? 'Chờ bạn xem đề xuất'
            : 'Chờ nhà cung cấp xác nhận',
      icon: ClockIcon,
      variant: 'secondary',
    },
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
    REFUNDED: { label: 'Đã hoàn tiền', variant: 'outline' },
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
  STAFF_NO_SHOW = 'STAFF_NO_SHOW',
}

// Report reason labels
const getReportReasonLabel = (reason: ReportReason): string => {
  const map: Record<ReportReason, string> = {
    [ReportReason.POOR_SERVICE_QUALITY]: 'Chất lượng dịch vụ kém',
    [ReportReason.STAFF_BEHAVIOR]: 'Thái độ nhân viên không tốt',
    [ReportReason.TECHNICAL_ISSUES]: 'Vấn đề kỹ thuật',
    [ReportReason.STAFF_NO_SHOW]: 'Nhân viên không đến đúng giờ',
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
  paymentTransactions,
}: {
  bookingId: number;
  bookingStatus: string;
  serviceRequestStatus?: string;
  transactionStatus?: string;
  transactionAmount?: number;
  paymentTransactionStatus?: string;
  paymentTransactionAmountOut?: number;
  hasTransaction: boolean;
  paymentTransactions?: Array<{
    id: number;
    gateway: string;
    status: string;
    transactionDate: string;
    amountIn: number;
    amountOut: number;
    accumulated: number;
    referenceNumber: string;
    transactionContent: string;
    body: string;
    accountNumber: string | null;
    subAccount: string | null;
    createdAt: string;
  }>;
}) => {
  const { data, isLoading, error } = useGetUserProposal(bookingId);
  const { mutate: updateProposal, isPending: isUpdating } = useUpdateUserProposal();
  const { mutate: createTransaction, isPending: isCreatingPayment } =
    useCreateProposalTransaction();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Payment error dialog state
  const [isPaymentErrorOpen, setIsPaymentErrorOpen] = useState(false);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<unknown>('Đã xảy ra lỗi khi thanh toán.');

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

  // Get the latest payment transaction from the passed payment transactions
  const latestPaymentTransaction =
    Array.isArray(paymentTransactions) && paymentTransactions.length > 0
      ? [...paymentTransactions].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : null;

  // Check if the latest payment transaction is successful
  const latestPaymentStatus =
    latestPaymentTransaction?.status?.toUpperCase() ||
    paymentTransactionStatus?.toUpperCase() ||
    transactionStatus?.toUpperCase() ||
    '';
  const isPaid = latestPaymentStatus === 'PAID' || latestPaymentStatus === 'SUCCESS';

  // Use the latest payment transaction amount if available and successful
  const actualDepositAmount = latestPaymentTransaction?.amountOut || paymentTransactionAmountOut;
  const hasDepositAmount =
    isPaid && typeof actualDepositAmount === 'number' && !Number.isNaN(actualDepositAmount);
  const depositAmount = hasDepositAmount ? Math.max(actualDepositAmount as number, 0) : 0;
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
      <div className="rounded-lg border bg-muted/10 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold">Đề xuất #{proposal.id}</h4>
            <p className="text-xs text-muted-foreground">{formatDate(proposal.createdAt)}</p>
          </div>
          <Badge
            variant={proposal.status === 'ACCEPTED' ? 'default' : 'outline'}
            className="text-xs w-fit"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{item.Service?.name ?? 'Dịch vụ'}</span>
                    <span className="text-muted-foreground">
                      {' '}
                      × {normalizeQuantity(item.quantity)}
                    </span>
                  </div>
                  <div className="whitespace-nowrap font-medium text-right sm:text-left">
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
                              className="flex flex-col gap-3 border rounded-lg p-3 bg-muted/20"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className="font-semibold text-sm truncate">
                                    {actualServiceItem?.name || 'Không có tên'}
                                  </span>
                                  {actualServiceItem?.brand && (
                                    <span className="py-0.5 px-2 rounded bg-muted text-muted-foreground text-xs w-fit">
                                      {actualServiceItem.brand}
                                    </span>
                                  )}
                                </div>
                                {actualServiceItem?.model && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Model:{' '}
                                    <span className="text-xs font-medium text-foreground">
                                      {actualServiceItem.model}
                                    </span>
                                  </div>
                                )}
                                {actualServiceItem?.description && (
                                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {actualServiceItem.description}
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
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
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 p-3 text-center text-sm text-muted-foreground border rounded-md bg-muted/20">
            Không có mục dịch vụ nào
          </div>
        )}

        {/* Only show total calculations if proposal is not rejected */}
        {!isRejected && (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="text-muted-foreground">Tổng giá trị đề xuất</span>
              <span className="font-semibold text-right sm:text-left">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            {hasDepositAmount && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-muted-foreground">Số tiền đặt cọc</span>
                  <span className="font-medium text-right sm:text-left">
                    - {formatCurrency(depositAmount)}
                  </span>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-muted-foreground">Tổng Cộng:</span>
                  <span className="font-semibold text-right sm:text-left">
                    {formatCurrency(remainingAfterDeposit)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {canShowActions && (
        <div className="flex flex-col gap-2 pt-1" aria-live="polite">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Pay with Wallet */}
            <Button
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-150"
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
                      // Handle the error structure from the API response
                      if (typeof err === 'object' && err !== null && 'response' in err) {
                        const axiosError = err as { response: { data: { message: unknown } } };
                        const messageData = axiosError.response.data.message;

                        if (Array.isArray(messageData) && messageData.length > 0) {
                          // Handle array of error objects
                          setPaymentErrorMsg(messageData);
                        } else {
                          setPaymentErrorMsg(messageData);
                        }
                      } else {
                        setPaymentErrorMsg(
                          'Số dư ví không đủ để thanh toán đề xuất. Vui lòng kiểm tra lại số dư sau.'
                        );
                      }
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
              className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
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
                      // Handle the error structure from the API response
                      if (typeof err === 'object' && err !== null && 'response' in err) {
                        const axiosError = err as { response: { data: { message: unknown } } };
                        const messageData = axiosError.response.data.message;

                        if (Array.isArray(messageData) && messageData.length > 0) {
                          // Handle array of error objects
                          setPaymentErrorMsg(messageData);
                        } else {
                          setPaymentErrorMsg(messageData);
                        }
                      } else {
                        setPaymentErrorMsg(
                          'Không thể khởi tạo thanh toán chuyển khoản ngân hàng. Vui lòng thử lại sau.'
                        );
                      }
                      setIsPaymentErrorOpen(true);
                    },
                  }
                )
              }
            >
              {isCreatingPayment ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4 mr-1 text-white" aria-label="Loading" />
                  Đang xử lý
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
            className="w-full transition-colors duration-150"
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
        <DialogContent className="max-w-md mx-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lỗi thanh toán</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground break-words">
            {(() => {
              if (typeof paymentErrorMsg === 'string') {
                return paymentErrorMsg;
              }
              if (Array.isArray(paymentErrorMsg)) {
                return paymentErrorMsg.map((m: unknown, i: number) => {
                  if (typeof m === 'object' && m && 'message' in m) {
                    const errorDetail = m as {
                      message: string;
                      currentBalance?: number;
                      requiredAmount?: number;
                    };
                    return (
                      <div key={i} className="space-y-1">
                        <span className="block">{errorDetail.message}</span>
                        {errorDetail.currentBalance !== undefined &&
                          errorDetail.requiredAmount !== undefined && (
                            <div className="text-xs space-y-1 mt-2 p-2 bg-muted/50 rounded">
                              <div>
                                Số dư hiện tại: {errorDetail.currentBalance.toLocaleString('vi-VN')}{' '}
                                đ
                              </div>
                              <div>
                                Số tiền cần thanh toán:{' '}
                                {errorDetail.requiredAmount.toLocaleString('vi-VN')} đ
                              </div>
                              <div className="text-destructive font-medium">
                                Thiếu:{' '}
                                {(
                                  errorDetail.requiredAmount - errorDetail.currentBalance
                                ).toLocaleString('vi-VN')}{' '}
                                đ
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  }
                  return (
                    <span key={i} className="block">
                      {String(m)}
                    </span>
                  );
                });
              }
              if (typeof paymentErrorMsg === 'object' && paymentErrorMsg !== null) {
                return JSON.stringify(paymentErrorMsg);
              }
              return String(paymentErrorMsg);
            })()}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentErrorOpen(false)}
              className="w-full sm:w-auto"
            >
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

  // Check if there's a proposal for this booking (only fetch when expanded for performance)
  const {
    data: proposalData,
    isLoading: isLoadingProposal,
    error: proposalError,
  } = useGetUserProposal(booking.id, isExpanded);
  const hasProposal = Boolean(proposalData?.data);

  // Only fetch detailed booking data when expanded (performance optimization)
  const {
    data: bookingDetailData,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useGetUserBookingDetail(booking.id, isExpanded);
  const hasExistingReports = Boolean(bookingDetailData?.data?.BookingReport?.length);

  // Check if there's a pending payment transaction
  const hasPendingPayment =
    Array.isArray(booking.ServiceRequest?.PaymentTransaction) &&
    booking.ServiceRequest.PaymentTransaction.length > 0 &&
    booking.ServiceRequest.PaymentTransaction.some(payment => payment.status === 'PENDING');

  const statusConfig = getStatusConfig(
    booking.status,
    booking.ServiceRequest?.status,
    hasProposal,
    hasPendingPayment
  );
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
    // Use report booking for all statuses
    reportBooking(
      {
        description: values.description,
        imageUrls: values.imageUrls,
        note: '',
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
  const { mutate: payExistingServiceRequest, isPending: isPayingExisting } =
    usePayExistingServiceRequest();
  const router = useRouter();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow break-inside-avoid mb-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex flex-wrap items-center gap-2">
            {booking.ServiceRequest?.status?.toUpperCase() === 'PENDING' &&
              booking.status.toUpperCase() !== 'CANCELLED' &&
              !booking.Staff_Booking_staffIdToStaff && (
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
            {booking.status?.toUpperCase() === 'STAFF_COMPLETED' &&
              !(
                Array.isArray(booking.BookingReport) &&
                booking.BookingReport.some(report => report.status === 'PENDING')
              ) && (
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
            {/* Show report button based on status, date logic, payment status, and existing reports */}
            {(() => {
              const isStaffCompleted = booking.status?.toUpperCase() === 'STAFF_COMPLETED';
              const isPending = booking.status?.toUpperCase() === 'PENDING';

              // Don't show report button if there are existing reports
              if (
                hasExistingReports ||
                (isStaffCompleted &&
                  Array.isArray(booking.BookingReport) &&
                  booking.BookingReport.length > 0)
              ) {
                return null;
              }

              if (isStaffCompleted) {
                // Always show for completed bookings (if no existing reports)
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReportOpen(true)}
                    aria-label="Báo cáo sự cố cho đơn đặt này"
                  >
                    <Flag className="h-4 w-4 mr-1" /> Báo cáo
                  </Button>
                );
              }

              if (isPending) {
                // For pending bookings, check if preferredDate is coming (future) or if there's pending payment
                const preferredDate = new Date(booking.ServiceRequest.preferredDate);
                const now = new Date();
                const isPreferredDateComing = preferredDate < now;

                // Check if the latest payment transaction is pending
                let hasLatestPendingPayment = false;
                if (
                  Array.isArray(booking.ServiceRequest?.PaymentTransaction) &&
                  booking.ServiceRequest.PaymentTransaction.length > 0
                ) {
                  // Sort by createdAt to get the latest payment transaction
                  const sortedTransactions = [...booking.ServiceRequest.PaymentTransaction].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  );
                  const latestPayment = sortedTransactions[0];
                  hasLatestPendingPayment = latestPayment.status === 'PENDING';
                }

                // Don't show report button if the latest payment is pending
                if (hasLatestPendingPayment) {
                  return null;
                }

                // Check if booking is pending for more than 30 minutes and staff has been assigned
                const bookingCreatedAt = new Date(booking.createdAt);
                const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
                const isPendingMoreThan30Minutes = bookingCreatedAt < thirtyMinutesAgo;

                // Check if there's a staff assigned
                const hasStaffAssigned = Boolean(booking.Staff_Booking_staffIdToStaff?.User?.name);

                if (isPreferredDateComing || (isPendingMoreThan30Minutes && hasStaffAssigned)) {
                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReportOpen(true)}
                      aria-label="Báo cáo sự cố cho đơn đặt này"
                    >
                      <Flag className="h-4 w-4 mr-1" /> Báo cáo
                    </Button>
                  );
                }
              }

              return null;
            })()}
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
        <div className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-muted/30 rounded-lg">
          <div className="flex gap-3 items-start w-full sm:w-auto">
            {booking.ServiceProvider.logo ? (
              <Image
                src={booking.ServiceProvider.logo}
                alt={booking.ServiceProvider.User_ServiceProvider_userIdToUser.name}
                width={48}
                height={48}
                className="rounded-full flex-shrink-0"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Building className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="max-w-64 flex-1">
              <h4 className="text-sm font-semibold truncate">
                {booking.ServiceProvider.User_ServiceProvider_userIdToUser.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {booking.ServiceProvider.description}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate ">{booking.ServiceRequest.location}</span>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto sm:ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
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

        {/* Details */}
        <div className="grid gap-2 text-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-muted-foreground">Ghi chú:</span>
            <span className="text-right sm:text-left break-words">
              {booking.ServiceRequest.note || 'Không có'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-muted-foreground">Ngày ưu tiên:</span>
            <span className="text-right sm:text-left">
              {formatDate(booking.ServiceRequest.preferredDate)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-muted-foreground">SĐT:</span>
            <span className="text-right sm:text-left font-mono">
              {booking.ServiceRequest.phoneNumber}
            </span>
          </div>
        </div>

        {/* Transaction */}
        {booking.Transaction && (
          <>
            <Separator />
            <div className="grid gap-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span>Thanh toán đặt dịch vụ</span>
                <Badge variant={transactionStatusConfig.variant} className="w-fit">
                  {transactionStatusConfig.label}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className="text-right sm:text-left font-medium">
                  {booking.Transaction?.amount !== undefined ? (
                    formatCurrency(booking.Transaction.amount)
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Phương thức:</span>
                <span className="text-right sm:text-left">
                  {booking.Transaction?.method ? (
                    getPaymentMethodVi(booking.Transaction.method)
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Mã tham chiếu:</span>
                <span className="font-mono text-right sm:text-left break-all">
                  {booking.Transaction?.orderCode ? (
                    booking.Transaction.orderCode
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </span>
              </div>
              {booking.Transaction?.paidAt && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground">Ngày thanh toán:</span>
                  <span className="text-right sm:text-left">
                    {formatDate(booking.Transaction.paidAt)}
                  </span>
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
              <div className="space-y-1">
                <span className="text-muted-foreground">Danh mục:</span>
                <p className="font-medium">{booking.ServiceRequest.Category.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Nhân viên:</span>
                <p className="font-medium">
                  {booking.Staff_Booking_staffIdToStaff?.User?.name ? (
                    booking.Staff_Booking_staffIdToStaff.User.name
                  ) : (
                    <span className="text-muted-foreground">Chưa được phân công</span>
                  )}
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-muted-foreground">Cập nhật:</span>
                <p className="font-medium">{formatDate(booking.updatedAt)}</p>
              </div>
            </div>

            {/* Detailed Information from API */}

            {/* Payment Transaction */}
            {booking.ServiceRequest.PaymentTransaction &&
            Array.isArray(booking.ServiceRequest.PaymentTransaction) &&
            booking.ServiceRequest.PaymentTransaction.length > 0 ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Thanh toán tiền đặt cọc</h3>
                  {(() => {
                    const sortedTransactions = [...booking.ServiceRequest.PaymentTransaction].sort(
                      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    const latestPayment = sortedTransactions[0];

                    return (
                      <div key={latestPayment.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <span className="text-muted-foreground">Trạng thái:</span>
                            <div>
                              <Badge
                                variant={
                                  latestPayment.status === 'PENDING'
                                    ? 'secondary'
                                    : latestPayment.status === 'SUCCESS'
                                      ? 'default'
                                      : 'destructive'
                                }
                                className="w-fit"
                              >
                                {latestPayment.status === 'SUCCESS'
                                  ? 'Thành công'
                                  : latestPayment.status === 'PENDING'
                                    ? 'Đang chờ'
                                    : latestPayment.status === 'FAILED'
                                      ? 'Thất bại'
                                      : latestPayment.status === 'REFUNDED'
                                        ? 'Đã hoàn tiền'
                                        : latestPayment.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground">Số tiền:</span>
                            <p className="font-medium">{formatCurrency(latestPayment.amountOut)}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-muted-foreground">Mã tham chiếu:</span>
                            <p className="font-mono font-medium break-all">
                              {latestPayment.referenceNumber}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground">Ngày giao dịch:</span>
                            <p className="font-medium">
                              {formatDate(latestPayment.transactionDate)}
                            </p>
                          </div>
                          {latestPayment.transactionContent && (
                            <div className="space-y-1 sm:col-span-2">
                              <span className="text-muted-foreground">Nội dung:</span>
                              <p className="font-medium break-words">
                                {latestPayment.transactionContent}
                              </p>
                            </div>
                          )}
                          {latestPayment.accountNumber && (
                            <div className="space-y-1">
                              <span className="text-muted-foreground">Số tài khoản:</span>
                              <p className="font-mono font-medium break-all">
                                {latestPayment.accountNumber}
                              </p>
                            </div>
                          )}
                          {latestPayment.accumulated > 0 && (
                            <div className="space-y-1">
                              <span className="text-muted-foreground">Tích lũy:</span>
                              <p className="font-medium">
                                {formatCurrency(latestPayment.accumulated)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Payment buttons for PENDING or FAILED status - but not for cancelled bookings */}
                        {(latestPayment.status === 'PENDING' ||
                          latestPayment.status === 'FAILED') &&
                          booking.status.toUpperCase() !== 'CANCELLED' && (
                            <div className="mt-3 pt-3 border-t">
                              <h3 className="text-sm font-semibold my-2">
                                Thanh toán lại tiền đặt cọc
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button
                                  size="sm"
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-150"
                                  disabled={isPayingExisting}
                                  onClick={() =>
                                    payExistingServiceRequest({
                                      serviceRequestId: booking.serviceRequestId,
                                      paymentMethod: 'WALLET',
                                    })
                                  }
                                >
                                  {isPayingExisting ? (
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="animate-spin h-4 w-4" />
                                      Đang xử lý...
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-2">
                                      <Wallet className="h-4 w-4" />
                                      Ví
                                    </span>
                                  )}
                                </Button>

                                <Button
                                  size="sm"
                                  className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
                                  disabled={isPayingExisting}
                                  onClick={() =>
                                    payExistingServiceRequest({
                                      serviceRequestId: booking.serviceRequestId,
                                      paymentMethod: 'BANK_TRANSFER',
                                    })
                                  }
                                >
                                  {isPayingExisting ? (
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="animate-spin h-4 w-4" />
                                      Đang xử lý
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-2">
                                      <CreditCard className="h-4 w-4" />
                                      Chuyển khoản
                                    </span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Thanh toán tiền đặt cọc</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-3">
                      Chưa có giao dịch thanh toán đặt cọc
                    </div>

                    {/* Payment buttons when no PaymentTransaction exists - but not for cancelled bookings */}
                    {booking.status.toUpperCase() !== 'CANCELLED' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-150"
                          disabled={isPayingExisting}
                          onClick={() =>
                            payExistingServiceRequest({
                              serviceRequestId: booking.serviceRequestId,
                              paymentMethod: 'WALLET',
                            })
                          }
                        >
                          {isPayingExisting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="animate-spin h-4 w-4" />
                              Đang xử lý...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              Ví
                            </span>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
                          disabled={isPayingExisting}
                          onClick={() =>
                            payExistingServiceRequest({
                              serviceRequestId: booking.serviceRequestId,
                              paymentMethod: 'BANK_TRANSFER',
                            })
                          }
                        >
                          {isPayingExisting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="animate-spin h-4 w-4" />
                              Đang xử lý
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Chuyển khoản
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {isLoadingDetail ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Thông tin chi tiết</h3>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : detailError ? (
              <div className="text-sm text-muted-foreground">Không thể tải thông tin chi tiết.</div>
            ) : bookingDetailData?.data ? (
              <>
                {/* Work Log */}
                {bookingDetailData.data.WorkLog && bookingDetailData.data.WorkLog.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Thông tin chi tiết</h3>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Lịch sử làm việc</h4>
                        {bookingDetailData.data.WorkLog.map(workLog => (
                          <div key={workLog.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="flex flex-col">
                                <span className="text-muted-foreground">Check-in:</span>
                                <p className="font-medium">{formatDate(workLog.checkIn)}</p>
                                {workLog.checkInImages.length > 0 ? (
                                  <Image
                                    src={workLog.checkInImages[0]}
                                    alt="Check-in"
                                    width={100}
                                    height={100}
                                    className="rounded-lg"
                                  />
                                ) : (
                                  <span className="text-muted-foreground">Không có hình ảnh</span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-muted-foreground">Check-out:</span>
                                <p className="font-medium">
                                  {workLog.checkOut
                                    ? formatDate(workLog.checkOut)
                                    : 'Chưa check-out'}
                                  {workLog.checkOutImages.length > 0 ? (
                                    <Image
                                      src={workLog.checkOutImages[0]}
                                      alt="Check-out"
                                      width={100}
                                      height={100}
                                      className="rounded-lg"
                                    />
                                  ) : (
                                    <span className="text-muted-foreground">Không có hình ảnh</span>
                                  )}
                                </p>
                              </div>
                              {workLog.note && (
                                <div className="sm:col-span-2">
                                  <span className="text-muted-foreground">Ghi chú:</span>
                                  <p className="font-medium">{workLog.note}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Proposal Details */}
                {/* {bookingDetailData.data.Proposal && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Đề xuất dịch vụ</h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-muted-foreground text-sm">Trạng thái:</span>
                            <Badge variant={bookingDetailData.data.Proposal.status === 'ACCEPTED' ? 'default' : 'outline'}>
                              {bookingDetailData.data.Proposal.status === 'ACCEPTED' ? 'Đã chấp nhận' : 
                               bookingDetailData.data.Proposal.status === 'PENDING' ? 'Chờ xử lý' : 
                               bookingDetailData.data.Proposal.status}
                            </Badge>
                          </div>
                          {bookingDetailData.data.Proposal.notes && (
                            <div>
                              <span className="text-muted-foreground text-sm">Ghi chú:</span>
                              <p className="font-medium text-xs">{bookingDetailData.data.Proposal.notes}</p>
                            </div>
                          )}
                          {bookingDetailData.data.Proposal.ProposalItem && bookingDetailData.data.Proposal.ProposalItem.length > 0 && (
                            <div>
                              <span className="text-muted-foreground text-xs">Dịch vụ đề xuất:</span>
                              <div className="mt-1 space-y-1">
                                {bookingDetailData.data.Proposal.ProposalItem.map((item) => (
                                  <div key={item.id} className="flex justify-between text-xs">
                                    <span>{item.Service.name} x {item.quantity}</span>
                                    <span className="font-medium">{formatCurrency(item.price)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )} */}

                {/* Booking Reports */}
                {bookingDetailData.data.BookingReport &&
                  bookingDetailData.data.BookingReport.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Báo cáo sự cố</h4>
                      {bookingDetailData.data.BookingReport.map(report => (
                        <div
                          key={report.id}
                          className="p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-start">
                              <span className="text-muted-foreground">Trạng thái:</span>
                              <Badge
                                variant={report.status === 'PENDING' ? 'secondary' : 'default'}
                              >
                                {report.status === 'PENDING'
                                  ? 'Chờ xử lý'
                                  : report.status === 'REJECTED'
                                    ? 'Không giải quyết'
                                    : report.status === 'RESOLVED'
                                      ? 'Đã giải quyết'
                                      : report.status}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Lý do:</span>
                              <p className="font-medium">
                                {report.reason === 'POOR_SERVICE_QUALITY'
                                  ? 'Chất lượng dịch vụ kém'
                                  : report.reason === 'STAFF_BEHAVIOR'
                                    ? 'Thái độ nhân viên không tốt'
                                    : report.reason === 'STAFF_NO_SHOW'
                                      ? 'Nhân viên không đến đúng giờ'
                                      : report.reason === 'INVALID_ADDRESS'
                                        ? 'Địa chỉ không hợp lý'
                                        : report.reason === 'TECHNICAL_ISSUES'
                                          ? 'Vấn đề kỹ thuật'
                                          : report.reason}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Mô tả:</span>
                              <p className="font-medium">{report.description}</p>
                            </div>
                            {report.imageUrls && (
                              <div>
                                <span className="text-muted-foreground">Hình ảnh:</span>
                                <div className="flex flex-wrap gap-2">
                                  {report.imageUrls.map((imageUrl, index) => (
                                    <Image
                                      key={index}
                                      src={imageUrl}
                                      alt={`Report Image ${index + 1}`}
                                      width={100}
                                      height={100}
                                      className="rounded-lg object-cover"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {report.note && (
                              <div>
                                <span className="text-muted-foreground">Ghi chú:</span>
                                <p className="font-medium">{report.note}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Ngày báo cáo:</span>
                              <p className="font-medium">{formatDate(report.createdAt)}</p>
                            </div>
                            {report.reviewResponse && (
                              <div>
                                <span className="text-muted-foreground">Phản hồi:</span>
                                <p className="font-medium">{report.reviewResponse}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                {/* </div> */}
              </>
            ) : null}

            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Đề xuất dịch vụ</h3>
              {isLoadingProposal ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : proposalError ? (
                <div className="text-sm text-muted-foreground">Không thể tải đề xuất dịch vụ.</div>
              ) : (
                <ProposalSection
                  bookingId={booking.id}
                  bookingStatus={booking.status}
                  serviceRequestStatus={booking.ServiceRequest?.status}
                  transactionStatus={booking.Transaction?.status}
                  transactionAmount={booking.Transaction?.amount}
                  paymentTransactionStatus={
                    Array.isArray(booking.ServiceRequest?.PaymentTransaction) &&
                    booking.ServiceRequest.PaymentTransaction.length > 0
                      ? booking.ServiceRequest.PaymentTransaction[0].status
                      : undefined
                  }
                  paymentTransactionAmountOut={
                    Array.isArray(booking.ServiceRequest?.PaymentTransaction) &&
                    booking.ServiceRequest.PaymentTransaction.length > 0
                      ? booking.ServiceRequest.PaymentTransaction[0].amountOut
                      : undefined
                  }
                  hasTransaction={Boolean(
                    booking.Transaction && booking.Transaction.status?.toUpperCase() !== 'PENDING'
                  )}
                  paymentTransactions={
                    Array.isArray(booking.ServiceRequest?.PaymentTransaction)
                      ? booking.ServiceRequest.PaymentTransaction
                      : booking.ServiceRequest?.PaymentTransaction
                        ? [booking.ServiceRequest.PaymentTransaction]
                        : undefined
                  }
                />
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-md mx-auto sm:max-w-lg">
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
                  <SelectItem value={ReportReason.STAFF_NO_SHOW}>
                    {getReportReasonLabel(ReportReason.STAFF_NO_SHOW)}
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
            {/* <div className="space-y-2">
              <Label htmlFor={`note-${booking.id}`}>Ghi chú</Label>
              <Textarea

                id={`note-${booking.id}`}
                placeholder="Ghi chú cho nhân viên"
                aria-invalid={!!errors.note}
                {...register('note', { required: true, minLength: 10 })}
              />
            </div> */}
            <div className="space-y-2">
              <Label>Hình ảnh minh họa (tùy chọn)</Label>
              <ImageUpload
                disabled={isUploading || isReporting}
                onChange={(urls: string[]) => setValue('imageUrls', urls, { shouldDirty: true })}
                onUpload={handleUpload}
                value={imageUrls}
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsReportOpen(false)}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isReporting} className="w-full sm:w-auto min-w-24">
                {isReporting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Đang xử lý
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
        <DialogContent className="max-w-md mx-auto sm:max-w-lg">
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
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsReviewOpen(false)}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button
                onClick={submitReview}
                disabled={isReviewing || !rating}
                className="w-full sm:w-auto min-w-24"
              >
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: bookingData, isLoading, error } = useCustomerBooking({ page, limit });

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
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl space-y-4 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold">Đặt dịch vụ của tôi</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Theo dõi tất cả các đặt dịch vụ của bạn
        </p>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-7 min-w-[900px]">
            {statuses.map(s => (
              <TabsTrigger key={s.key} value={s.key} className="text-xs sm:text-sm">
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden text-xs">
                  {s.key === 'today'
                    ? 'Hôm nay'
                    : s.key === 'all'
                      ? 'Tất cả'
                      : s.key === 'pending'
                        ? 'Chờ xác nhận'
                        : s.key === 'confirmed'
                          ? 'Đã xác nhận'
                          : s.key === 'staff-completed'
                            ? 'Nhân viên đã xong'
                            : s.key === 'completed'
                              ? 'Hoàn thành'
                              : s.key === 'cancelled'
                                ? 'Đã hủy'
                                : s.label}
                </span>
                <span className="ml-1 text-muted-foreground text-xs">
                  ({bookings.filter(s.filter).length})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {statuses.map(s => (
          <TabsContent key={s.key} value={s.key} className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BookingSkeleton key={i} />
                ))}
              </div>
            ) : bookings.filter(s.filter).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Trang <span className="font-medium">{bookingData?.page ?? page}</span> /{' '}
          <span className="font-medium">{bookingData?.totalPages ?? 1}</span> • Tổng{' '}
          <span className="font-medium">{bookingData?.totalItems ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={(bookingData?.page ?? page) <= 1 || isLoading}
          >
            Trước
          </Button>
          <Select value={String(limit)} onValueChange={v => setLimit(Number(v))}>
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
            onClick={() => setPage(p => Math.min(bookingData?.totalPages ?? p + 1, p + 1))}
            disabled={(bookingData?.page ?? page) >= (bookingData?.totalPages ?? 1) || isLoading}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
