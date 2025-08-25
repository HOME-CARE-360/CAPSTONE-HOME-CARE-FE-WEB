'use client';

import { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Eye,
  UserPlus,
  Clock,
  Loader2,
  FileText,
  Plus,
  Minus,
  X,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/lib/api/services/fetchManageBooking';
import type { GetDetailBookingResponse } from '@/lib/api/services/fetchBooking';
import { useDetailBooking } from '@/hooks/useBooking';
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
import { useGetStaffAvailable } from '@/hooks/useStaff';
import {
  useAssignStaffToBooking,
  useCreateProposedBooking,
  useUpdateProposedBooking,
  useReportBooking,
} from '@/hooks/useManageBooking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useServiceManager } from '@/hooks/useServiceManager';
import { ProposedService } from '@/lib/api/services/fetchManageBooking';
import { ServiceManager } from '@/lib/api/services/fetchServiceManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { useGetOrCreateConversation } from '@/hooks/useConversation';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/image-upload';
import { useUploadImage } from '@/hooks/useImage';
import { ReportReason } from '@/lib/api/services/fetchManageBooking';

interface BookingCardProps {
  booking: Booking;
  status?: Booking['status'];
  isDragging?: boolean;
  isLoading?: boolean;
  onStaffAssigned?: () => void;
}

interface ServiceSelection {
  serviceId: number;
  quantity: number;
  price?: number;
  service?: ServiceManager;
}

export function BookingCard({ booking, isDragging, isLoading, onStaffAssigned }: BookingCardProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Proposed services state
  const [notes, setNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);

  // Get detailed booking data - only fetch when sheet is open
  const { data: detailBooking, isLoading: isLoadingDetail } = useDetailBooking(booking.id, {
    enabled: open,
  });

  // Fetch staff for this booking's category - only fetch when sheet is open
  const { data: staffData, isLoading: isLoadingStaff } = useGetStaffAvailable(
    {
      categories: [booking.categoryId],
      orderBy: 'asc',
    },
    {
      enabled: open,
    }
  );

  const { mutate: assignStaff, isPending: isAssigning } = useAssignStaffToBooking();

  // Proposed services hooks - only fetch when sheet is open
  const { data: servicesData, isLoading: isLoadingServices } = useServiceManager(
    {
      sortBy: 'createdAt',
      orderBy: 'desc',
      name: '',
      limit: 100,
      page: 1,
    },
    {
      enabled: open,
    }
  );
  const { mutate: createProposed, isPending: isCreatingProposal } = useCreateProposedBooking();
  const { mutate: updateProposed, isPending: isUpdatingProposal } = useUpdateProposedBooking();
  const { mutate: reportBooking, isPending: isReporting } = useReportBooking();
  const uploadMutation = useUploadImage();

  const initials = booking.customer.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const availableStaff = staffData?.data || [];
  const availableServices = (servicesData?.data || []).filter(s => s.status !== 'PENDING');

  // Check if inspection report exists and if staff is already assigned
  const hasInspectionReport = !!detailBooking?.booking?.inspectionReport;
  const hasStaffAssigned = !!detailBooking?.booking?.staff;

  // Check if booking is in progress
  const isInProgress = booking.status === 'IN_PROGRESS';
  const isPending = booking.status === 'PENDING';

  // Determine if we should show proposal tab
  // Show when: no inspection report OR booking is estimated OR proposal is rejected
  const shouldShowProposalTab =
    !hasInspectionReport ||
    booking.status === 'ESTIMATED' ||
    detailBooking?.booking?.Proposal?.status === 'REJECTED';

  // Hide quick actions and proposal tab when booking is pending
  const shouldShowQuickActions = shouldShowProposalTab && !isPending;

  // Determine if we should show staff assignment section
  // Show staff assignment only when booking is pending AND no staff is assigned
  const shouldShowStaffAssignment = isPending && !hasStaffAssigned;

  // Check if this is a pending booking that needs immediate attention
  const needsStaffAssignment = isPending && !hasStaffAssigned;

  // Report booking state
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>(ReportReason.NO_SHOW);
  const [reportDescription, setReportDescription] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reportImages, setReportImages] = useState<string[]>([]);

  const isOverduePending = (() => {
    if (!isPending) return false;
    const preferred = new Date(booking.preferredDate).getTime();
    const now = Date.now();
    const thirtyMinMs = 30 * 60 * 1000;
    return now - preferred >= thirtyMinMs;
  })();

  const handleUpload = async (file: File): Promise<string> => {
    const res = await uploadMutation.mutateAsync(file);
    return res.url;
  };

  const handleSubmitReport = () => {
    if (!reportDescription.trim()) {
      toast.error('Vui lòng nhập mô tả báo cáo');
      return;
    }
    reportBooking(
      {
        description: reportDescription.trim(),
        imageUrls: reportImages,
        note: reportNote.trim(),
        reporterType: 'CUSTOMER',
        reason: reportReason,
        reportedCustomerId: booking.customerId,
        reportedProviderId: booking.providerId,
        bookingId: booking.id,
      },
      {
        onSuccess: () => {
          setReportDescription('');
          setReportNote('');
          setReportImages([]);
          setReportReason(ReportReason.NO_SHOW);
          setReportSheetOpen(false);
        },
      }
    );
  };

  // Conversation - provider contacts customer
  const { mutate: getOrCreateConv, isPending: isCreatingConv } = useGetOrCreateConversation();
  const router = useRouter();

  // Proposed services functions
  const addService = (service: ServiceManager) => {
    const existingIndex = selectedServices.findIndex(s => s.serviceId === service.id);

    if (existingIndex >= 0) {
      setSelectedServices(prev =>
        prev.map((s, index) => (index === existingIndex ? { ...s, quantity: s.quantity + 1 } : s))
      );
    } else {
      const price =
        service.virtualPrice && service.virtualPrice !== 0
          ? service.virtualPrice
          : service.basePrice;
      setSelectedServices(prev => [
        ...prev,
        { serviceId: service.id, quantity: 1, price, service },
      ]);
    }
  };

  const updateQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeService(serviceId);
      return;
    }

    setSelectedServices(prev =>
      prev.map(s => {
        if (s.serviceId === serviceId) {
          const price =
            s.service && s.service.virtualPrice && s.service.virtualPrice !== 0
              ? s.service.virtualPrice
              : s.service?.basePrice || 0;
          return { ...s, quantity, price };
        }
        return s;
      })
    );
  };

  const removeService = (serviceId: number) => {
    setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId));
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      return;
    }

    const services: ProposedService[] = selectedServices.map(s => ({
      serviceId: s.serviceId,
      quantity: s.quantity,
      price: s.price || 0,
    }));

    const existingProposal = detailBooking?.booking?.Proposal;
    const bookingIdForProposal = detailBooking?.booking?.id;
    const existingProposalId = existingProposal?.id as number | undefined;

    if (existingProposalId) {
      updateProposed(
        {
          proposalId: existingProposalId,
          notes: notes.trim(),
          services,
        },
        {
          onSuccess: () => {
            setNotes('');
            setSelectedServices([]);
            setActiveTab('details');
            onStaffAssigned?.();
          },
        }
      );
    } else {
      if (!bookingIdForProposal) {
        toast.error('Không tìm thấy mã booking để tạo đề xuất');
        return;
      }
      createProposed(
        {
          bookingId: bookingIdForProposal,
          notes: notes.trim(),
          services,
        },
        {
          onSuccess: () => {
            setNotes('');
            setSelectedServices([]);
            setActiveTab('details');
            onStaffAssigned?.();
          },
        }
      );
    }
  };

  const totalAmount = selectedServices.reduce((total, s) => {
    const price = s.price || 0;
    return total + price * s.quantity;
  }, 0);

  const isProposalFormValid = selectedServices.length > 0;
  const isSubmittingProposal = isCreatingProposal || isUpdatingProposal;

  // Aggregate proposal items by service to avoid duplicates (e.g., rejected + newly added)
  type ProposalItemType = NonNullable<
    GetDetailBookingResponse['booking']['Proposal']
  >['ProposalItem'][number];
  const rawProposalItems: ProposalItemType[] = Array.isArray(
    detailBooking?.booking?.Proposal?.ProposalItem
  )
    ? (detailBooking?.booking?.Proposal?.ProposalItem as ProposalItemType[])
    : [];

  // Determine the latest proposal by proposalId using newest createdAt among its items
  const itemsByProposal = new Map<number, ProposalItemType[]>();
  rawProposalItems.forEach(item => {
    const list = itemsByProposal.get(item.proposalId) ?? [];
    list.push(item);
    itemsByProposal.set(item.proposalId, list);
  });

  let lastProposalId: number | null = null;
  let lastProposalTime = -Infinity;
  itemsByProposal.forEach((items, pid) => {
    const maxTime = Math.max(...items.map(it => new Date(it.createdAt).getTime()));
    if (maxTime > lastProposalTime) {
      lastProposalTime = maxTime;
      lastProposalId = pid;
    }
  });

  const lastProposalItems: ProposalItemType[] =
    lastProposalId !== null ? (itemsByProposal.get(lastProposalId) ?? []) : [];

  // Within the latest proposal, take only the most recent snapshot (items with max createdAt)
  const lastMaxTime = lastProposalItems.reduce(
    (max, it) => Math.max(max, new Date(it.createdAt).getTime()),
    -Infinity
  );
  const lastSnapshotItems = lastProposalItems.filter(
    it => new Date(it.createdAt).getTime() === lastMaxTime
  );
  // Deduplicate by serviceId in that snapshot (prefer larger id if duplicated)
  const dedupMap = new Map<number, ProposalItemType>();
  lastSnapshotItems.forEach(it => {
    const existing = dedupMap.get(it.serviceId);
    if (!existing || (it.id ?? 0) > (existing.id ?? 0)) {
      dedupMap.set(it.serviceId, it);
    }
  });
  // Helper function to safely extract price from proposal item
  const getItemPrice = (item: ProposalItemType): number => {
    // Check if item has a direct price property (type-safe way)
    const directPrice = 'price' in item && typeof item.price === 'number' ? item.price : undefined;

    // Fallback to service pricing
    const servicePrice =
      item.Service?.virtualPrice && item.Service.virtualPrice !== 0
        ? item.Service.virtualPrice
        : item.Service?.basePrice;

    return directPrice ?? servicePrice ?? 0;
  };

  const proposalDisplayItems = Array.from(dedupMap.values()).map(item => ({
    item,
    totalQuantity: item.quantity,
    price: getItemPrice(item),
  }));

  const handleAssignStaff = () => {
    if (!selectedStaffId) {
      toast.error('Vui lòng chọn nhân viên');
      return;
    }

    assignStaff(
      {
        staffId: parseInt(selectedStaffId),
        customerId: booking.customerId,
        serviceRequestId: booking.id,
      },
      {
        onSuccess: () => {
          toast.success('Phân công nhân viên thành công');
          setSelectedStaffId('');
          setOpen(false);
          onStaffAssigned?.();
        },
        onError: error => {
          const errorMessage = error?.message || 'Có lỗi xảy ra khi phân công nhân viên';
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <>
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
                <AvatarImage src={booking.customer.avatar || undefined} />
                <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{booking.customer.name}</h3>
                <p className="text-xs text-gray-500">BK{booking.id}</p>
              </div>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50">
                  <Eye className="h-4 w-4 text-gray-500" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Chi tiết đặt lịch
                    {needsStaffAssignment && (
                      <Badge variant="destructive" className="ml-2">
                        Cần phân công
                      </Badge>
                    )}
                  </SheetTitle>
                  <SheetDescription>Thông tin chi tiết về yêu cầu đặt lịch</SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                  {/* Loading state when sheet is opened */}
                  {isLoadingDetail && (
                    <div className="space-y-6">
                      {/* Booking Information Skeleton */}
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid gap-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-4 w-40" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Customer Information Skeleton */}
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid gap-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-4 w-28" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-4 w-36" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Service Information Skeleton */}
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Staff Assignment Skeleton */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="space-y-3">
                          <Skeleton className="h-16 w-full rounded-lg" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isLoadingDetail && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList
                        className={`grid w-full ${shouldShowQuickActions ? 'grid-cols-2' : 'grid-cols-1'}`}
                      >
                        <TabsTrigger value="details">Chi tiết & Phân công</TabsTrigger>
                        {shouldShowQuickActions && (
                          <TabsTrigger value="proposal">
                            {detailBooking?.booking?.Proposal?.status === 'REJECTED'
                              ? 'Đề xuất lại'
                              : 'Đề xuất dịch vụ'}
                          </TabsTrigger>
                        )}
                      </TabsList>

                      <TabsContent value="details" className="mt-6 space-y-6">
                        {/* Priority Alert for Pending Bookings */}
                        {needsStaffAssignment && (
                          <Alert className="border-green-200 bg-green-50">
                            <AlertTriangle className="h-4 w-4 text-green-600" />
                            <AlertDescription>
                              <strong>Ưu tiên cao:</strong> Đặt lịch này cần được phân công nhân
                              viên ngay để xử lý.
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Booking Information */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Thông tin đặt lịch</h3>
                          <div className="grid gap-4 text-sm">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Mã đặt lịch</p>
                                <p className="font-medium">BK{booking.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Ngày & Giờ hẹn</p>
                                <p className="font-medium">
                                  {format(new Date(booking.preferredDate), 'dd/MM/yyyy - HH:mm', {
                                    locale: vi,
                                  })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(booking.preferredDate), 'EEEE', { locale: vi })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Địa điểm</p>
                                <p className="font-medium">{booking.location}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Customer Information */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Thông tin khách hàng</h3>
                          <div className="grid gap-4 text-sm">
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Họ và tên</p>
                                <p className="font-medium">{booking.customer.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{booking.customer.email || '--'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Số điện thoại</p>
                                <p className="font-medium">{booking.customer.phone || '--'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Service Information */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Loại dịch vụ</h3>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {booking.category.logo ? (
                                <Image
                                  src={booking.category.logo}
                                  alt=""
                                  className="w-8 h-8"
                                  width={100}
                                  height={100}
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-300 rounded" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.category.name}</p>
                              <p className="text-sm text-gray-500">Dịch vụ được yêu cầu</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="space-y-4">
                          {/* Quick Actions */}
                          {shouldShowQuickActions && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-700">Hành động nhanh</h4>
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setActiveTab('proposal')}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {detailBooking?.booking?.Proposal?.status === 'REJECTED'
                                  ? 'Đề xuất lại dịch vụ (đã bị từ chối)'
                                  : isInProgress
                                    ? 'Thêm dịch vụ trong quá trình thực hiện'
                                    : booking.status === 'ESTIMATED'
                                      ? 'Đề xuất dịch vụ cho đặt lịch đã ước lượng'
                                      : 'Đề xuất dịch vụ bổ sung'}
                              </Button>
                            </div>
                          )}

                          {shouldShowQuickActions && <Separator />}

                          {/* Staff Assignment - Always show for pending bookings */}
                          {shouldShowStaffAssignment && (
                            <div
                              className={cn(
                                'space-y-3',
                                needsStaffAssignment &&
                                  'p-4 bg-green-50 border border-green-200 rounded-lg'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-600" />
                                <h4 className="text-sm font-medium text-gray-700">
                                  {needsStaffAssignment
                                    ? 'Phân công nhân viên (Ưu tiên)'
                                    : 'Phân công nhân viên'}
                                </h4>
                                {needsStaffAssignment && (
                                  <Badge variant="destructive" className="ml-auto text-xs">
                                    Cần xử lý ngay
                                  </Badge>
                                )}
                              </div>

                              {/* Staff Selection */}
                              <div className="space-y-3">
                                {isLoadingStaff ? (
                                  <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                  </div>
                                ) : availableStaff.length === 0 ? (
                                  <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                      Không có nhân viên phù hợp với dịch vụ này. Vui lòng kiểm tra
                                      lại danh sách nhân viên.
                                    </AlertDescription>
                                  </Alert>
                                ) : (
                                  <>
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                      <p className="text-sm">
                                        <strong>Hướng dẫn:</strong> Chọn nhân viên phù hợp để xử lý
                                        đặt lịch này.
                                        {needsStaffAssignment &&
                                          ' Đây là ưu tiên cao cần xử lý ngay.'}
                                      </p>
                                    </div>

                                    <Select
                                      value={selectedStaffId}
                                      onValueChange={setSelectedStaffId}
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          needsStaffAssignment &&
                                            'border-green-400 focus:border-green-500'
                                        )}
                                      >
                                        <SelectValue placeholder="Chọn nhân viên" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableStaff.map(staff => (
                                          <SelectItem key={staff.id} value={staff.id.toString()}>
                                            <div className="flex items-center gap-2">
                                              <Avatar className="h-6 w-6">
                                                <AvatarImage src={staff.user.avatar} />
                                                <AvatarFallback className="text-xs">
                                                  {staff.user.name
                                                    .split(' ')
                                                    .map(n => n.charAt(0))
                                                    .join('')
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="flex flex-col">
                                                <span className="font-medium">
                                                  {staff.user.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {staff.user.email}
                                                </span>
                                              </div>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <Button
                                      onClick={handleAssignStaff}
                                      className={cn(
                                        'w-full',
                                        needsStaffAssignment &&
                                          'bg-green-500 hover:bg-green-600 text-white'
                                      )}
                                      disabled={!selectedStaffId || isAssigning}
                                    >
                                      {isAssigning ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Đang phân công...
                                        </>
                                      ) : (
                                        <>
                                          <UserPlus className="h-4 w-4 mr-2" />
                                          {needsStaffAssignment
                                            ? 'Phân công ngay'
                                            : 'Phân công nhân viên'}
                                        </>
                                      )}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Show assigned staff information if staff exists */}
                          {hasStaffAssigned && detailBooking?.booking?.staff && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                Nhân viên được phân công
                              </h4>
                              <div className="p-4 border rounded-lg bg-green-50 border-green-200 flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-green-200 shadow-sm">
                                  <AvatarImage
                                    src={detailBooking.booking.staff.user.avatar || undefined}
                                  />
                                  <AvatarFallback className="text-base font-bold bg-green-100">
                                    {detailBooking.booking.staff.user.name
                                      .split(' ')
                                      .map(n => n.charAt(0))
                                      .join('')
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {detailBooking.booking.staff.user.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 truncate">
                                      {detailBooking.booking.staff.user.email || '--'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 truncate">
                                      {detailBooking.booking.staff.user.phone || '--'}
                                    </span>
                                  </div>
                                </div>
                                {/* Optional: Add a badge or status */}
                                <Badge
                                  variant="outline"
                                  className="text-xs border-green-400 text-green-700 bg-white"
                                >
                                  Đã phân công
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Show inspection report if exists */}
                          {hasInspectionReport && detailBooking?.booking?.inspectionReport && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <h4 className="text-base font-semibold text-gray-900">
                                  Báo cáo khảo sát
                                </h4>
                              </div>

                              <div className="border border-gray-200 rounded-xl overflow-hidden">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <h5 className="font-medium text-gray-900">
                                        Thông tin khảo sát
                                      </h5>
                                      <p className="text-sm text-gray-500">
                                        Thời gian ước tính:{' '}
                                        <span className="font-medium text-gray-900">
                                          {detailBooking.booking.inspectionReport.estimatedTime}{' '}
                                          phút
                                        </span>
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">Tạo lúc</p>
                                      <p className="text-sm font-medium text-gray-700">
                                        {format(
                                          new Date(
                                            detailBooking.booking.inspectionReport.createdAt
                                          ),
                                          'dd/MM/yyyy HH:mm',
                                          { locale: vi }
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="px-6 py-4 space-y-4">
                                  <div>
                                    <h6 className="text-sm font-medium text-gray-700 mb-2">
                                      Ghi chú đánh giá
                                    </h6>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                      {detailBooking.booking.inspectionReport.note}
                                    </p>
                                  </div>

                                  {detailBooking.booking.inspectionReport.images &&
                                    detailBooking.booking.inspectionReport.images.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-medium text-gray-700 mb-3">
                                          Hình ảnh hiện trường (
                                          {detailBooking.booking.inspectionReport.images.length})
                                        </h6>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                          {detailBooking.booking.inspectionReport.images.map(
                                            (image, index) => (
                                              <div
                                                key={index}
                                                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-md transition-shadow"
                                              >
                                                <Image
                                                  src={image}
                                                  alt={`Khảo sát ${index + 1}`}
                                                  fill
                                                  className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity" />
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Show existing proposals if any */}
                          {detailBooking?.booking?.Proposal && proposalDisplayItems.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <h4 className="text-base font-semibold text-gray-900">
                                  Dịch vụ đã đề xuất
                                </h4>
                                <div className="flex gap-2">
                                  {detailBooking.booking.Proposal.status === 'REJECTED' && (
                                    <Badge variant="outline" className="text-xs border-gray-300">
                                      Đã bị từ chối
                                    </Badge>
                                  )}
                                  {detailBooking.booking.Proposal.status === 'PENDING' && (
                                    <Badge variant="outline" className="text-xs border-gray-300">
                                      Đang chờ duyệt
                                    </Badge>
                                  )}
                                  {detailBooking.booking.Proposal.status === 'APPROVED' && (
                                    <Badge variant="outline" className="text-xs border-gray-300">
                                      Đã duyệt
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="border border-gray-200 rounded-xl overflow-hidden">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium text-gray-900">
                                        Chi tiết đề xuất
                                      </h5>
                                      <p className="text-sm text-gray-500 mt-1">
                                        {proposalDisplayItems.length} dịch vụ được đề xuất
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">Tạo lúc</p>
                                      <p className="text-sm font-medium text-gray-700">
                                        {format(
                                          new Date(detailBooking.booking.Proposal.createdAt),
                                          'dd/MM/yyyy HH:mm',
                                          { locale: vi }
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Services List */}
                                <div className="px-6 py-4">
                                  <div className="space-y-4">
                                    {proposalDisplayItems.map(
                                      ({ item, totalQuantity, price }, idx) => {
                                        const firstImage = Array.isArray(item.Service?.images)
                                          ? item.Service?.images[0]
                                          : undefined;

                                        return (
                                          <div
                                            key={item.id ?? idx}
                                            className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                          >
                                            <div className="flex gap-4">
                                              {/* Service Image */}
                                              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                {firstImage ? (
                                                  <Image
                                                    src={firstImage}
                                                    alt={item.Service?.name ?? ''}
                                                    fill
                                                    className="object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                    <FileText className="h-8 w-8 text-gray-400" />
                                                  </div>
                                                )}
                                              </div>

                                              {/* Service Details */}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                  <div className="flex-1">
                                                    <h6 className="font-medium text-gray-900 truncate">
                                                      {item.Service?.name ?? ''}
                                                    </h6>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                      {item.Service?.description ||
                                                        'Không có mô tả'}
                                                    </p>
                                                  </div>
                                                  <Badge variant="outline" className="ml-3 text-xs">
                                                    x{totalQuantity}
                                                  </Badge>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="font-semibold text-gray-900">
                                                      {price.toLocaleString('vi-VN')}đ
                                                    </span>
                                                    <span>
                                                      {item.Service?.durationMinutes} phút
                                                    </span>
                                                  </div>
                                                  <span className="text-sm font-medium text-gray-900">
                                                    Tổng:{' '}
                                                    {(price * totalQuantity).toLocaleString(
                                                      'vi-VN'
                                                    )}
                                                    đ
                                                  </span>
                                                </div>

                                                {/* Attached Items */}
                                                {item.Service?.attachedItems &&
                                                  item.Service.attachedItems.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                      <h6 className="text-xs font-medium text-gray-700 mb-2">
                                                        Vật tư đi kèm (
                                                        {item.Service.attachedItems.length})
                                                      </h6>
                                                      <div className="space-y-2">
                                                        {item.Service.attachedItems.map(
                                                          (attachedItem, itemIndex: number) => {
                                                            const serviceItem =
                                                              attachedItem.serviceItem;
                                                            return (
                                                              <div
                                                                key={serviceItem.id || itemIndex}
                                                                className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-xs"
                                                              >
                                                                <div className="flex-1">
                                                                  <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-gray-900">
                                                                      {serviceItem.name}
                                                                    </span>
                                                                    {serviceItem.brand && (
                                                                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                                                        {serviceItem.brand}
                                                                      </span>
                                                                    )}
                                                                    {serviceItem.model && (
                                                                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                                                        {serviceItem.model}
                                                                      </span>
                                                                    )}
                                                                  </div>
                                                                  {serviceItem.description && (
                                                                    <p className="text-gray-600 mt-1 line-clamp-1">
                                                                      {serviceItem.description}
                                                                    </p>
                                                                  )}
                                                                </div>
                                                                <div className="text-right ml-3">
                                                                  <div className="font-medium text-gray-900">
                                                                    {serviceItem.unitPrice?.toLocaleString(
                                                                      'vi-VN'
                                                                    )}
                                                                    đ
                                                                  </div>
                                                                  {serviceItem.warrantyPeriod && (
                                                                    <div className="text-gray-500">
                                                                      BH:{' '}
                                                                      {serviceItem.warrantyPeriod}{' '}
                                                                      tháng
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </div>
                                                            );
                                                          }
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>

                                  {/* Proposal Notes */}
                                  {detailBooking.booking.Proposal.notes && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                      <h6 className="text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú đề xuất
                                      </h6>
                                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                        {detailBooking.booking.Proposal.notes}
                                      </p>
                                    </div>
                                  )}

                                  {/* Total Summary */}
                                  <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">
                                        Tổng giá trị đề xuất
                                      </span>
                                      <span className="text-lg font-semibold text-gray-900">
                                        {proposalDisplayItems
                                          .reduce((total, { item, totalQuantity, price }) => {
                                            const itemPrice =
                                              price ||
                                              item.Service?.virtualPrice ||
                                              item.Service?.basePrice ||
                                              0;
                                            return total + itemPrice * totalQuantity;
                                          }, 0)
                                          .toLocaleString('vi-VN')}
                                        đ
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {shouldShowQuickActions && (
                        <TabsContent value="proposal" className="mt-6 space-y-6">
                          {/* Proposal Form */}
                          <form onSubmit={handleSubmitProposal} className="space-y-6">
                            {/* Booking Information */}
                            <div
                              className={`p-4 rounded-lg ${
                                isInProgress
                                  ? 'bg-green-50 border border-green-200'
                                  : booking.status === 'ESTIMATED'
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50'
                              }`}
                            >
                              <h3 className="text-sm font-medium text-gray-900 mb-2">
                                Thông tin đặt lịch
                                {isInProgress && <Badge className="ml-2">Đang xử lý</Badge>}
                                {booking.status === 'ESTIMATED' && (
                                  <Badge className="ml-2 bg-green-100 text-green-700 border-green-200">
                                    Đã ước lượng
                                  </Badge>
                                )}
                                {detailBooking?.booking?.Proposal?.status === 'REJECTED' && (
                                  <Badge className="ml-2 bg-red-100 text-red-700 border-red-200">
                                    Đề xuất bị từ chối
                                  </Badge>
                                )}
                              </h3>
                              <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Khách hàng:</span>
                                  <span className="font-medium">{booking.customer.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Mã booking:</span>
                                  <span className="font-medium">BK-{booking.id}</span>
                                </div>
                                {isInProgress && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Trạng thái:</span>
                                    <span className="font-medium text-green-700">
                                      Có thể đề xuất dịch vụ bổ sung
                                    </span>
                                  </div>
                                )}
                                {booking.status === 'ESTIMATED' && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Trạng thái:</span>
                                    <span className="font-medium text-green-700">
                                      Có thể đề xuất dịch vụ cho đặt lịch đã ước lượng
                                    </span>
                                  </div>
                                )}
                                {detailBooking?.booking?.Proposal?.status === 'REJECTED' && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Trạng thái:</span>
                                    <span className="font-medium text-red-700">
                                      Đề xuất trước đã bị từ chối - cần đề xuất lại
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator />

                            {/* Service Selection */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium text-gray-900">
                                {detailBooking?.booking?.Proposal?.status === 'REJECTED'
                                  ? 'Chọn dịch vụ để đề xuất lại'
                                  : isInProgress
                                    ? 'Chọn dịch vụ bổ sung'
                                    : booking.status === 'ESTIMATED'
                                      ? 'Chọn dịch vụ cho đặt lịch đã ước lượng'
                                      : 'Chọn dịch vụ'}
                              </h3>
                              {isInProgress && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <p className="text-sm">
                                    <strong>Lưu ý:</strong> Đây là các dịch vụ bổ sung có thể thêm
                                    vào trong quá trình thực hiện công việc.
                                  </p>
                                </div>
                              )}
                              {booking.status === 'ESTIMATED' && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <p className="text-sm text-green-800">
                                    <strong>Lưu ý:</strong> Đây là các dịch vụ có thể đề xuất cho
                                    đặt lịch đã được ước lượng và có báo cáo khảo sát.
                                  </p>
                                </div>
                              )}
                              {detailBooking?.booking?.Proposal?.status === 'REJECTED' && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-sm text-red-800">
                                    <strong>Lưu ý:</strong> Đề xuất trước đã bị từ chối. Vui lòng
                                    xem xét và đề xuất lại với thông tin phù hợp hơn.
                                  </p>
                                </div>
                              )}

                              {isLoadingServices ? (
                                <div className="text-center py-4">
                                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                  <p className="text-sm text-gray-500 mt-2">
                                    Đang tải danh sách dịch vụ...
                                  </p>
                                </div>
                              ) : (
                                <div className="grid gap-3 max-h-60 overflow-y-auto">
                                  {availableServices.map(service => {
                                    const isSelected = selectedServices.some(
                                      s => s.serviceId === service.id
                                    );
                                    return (
                                      <div
                                        key={service.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                          isSelected
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => addService(service)}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">
                                              {service.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                              {service.description}
                                            </p>

                                            {/* Show attached item details if available */}
                                            {service.attachedItems &&
                                              service.attachedItems.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                  <h6 className="text-xs font-medium text-gray-700 mb-2">
                                                    Vật tư đi kèm ({service.attachedItems.length})
                                                  </h6>
                                                  <div className="space-y-2">
                                                    {service.attachedItems.map(item => {
                                                      const sItem = item.serviceItem;
                                                      return (
                                                        <div
                                                          key={sItem.id}
                                                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-xs"
                                                        >
                                                          <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                              <span className="font-medium text-gray-900">
                                                                {sItem.name}
                                                              </span>
                                                              {sItem.brand && (
                                                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                                                  {sItem.brand}
                                                                </span>
                                                              )}
                                                              {sItem.model && (
                                                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                                                  {sItem.model}
                                                                </span>
                                                              )}
                                                            </div>
                                                            {sItem.description && (
                                                              <p className="text-gray-600 mt-1 line-clamp-1">
                                                                {sItem.description}
                                                              </p>
                                                            )}
                                                          </div>
                                                          <div className="text-right ml-3">
                                                            <div className="font-medium text-gray-900">
                                                              {sItem.unitPrice?.toLocaleString(
                                                                'vi-VN'
                                                              )}
                                                              đ
                                                            </div>
                                                            {sItem.warrantyPeriod && (
                                                              <div className="text-gray-500">
                                                                BH: {sItem.warrantyPeriod} tháng
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              )}

                                            <div className="flex items-center gap-2 mt-2">
                                              <Badge variant="secondary" className="text-xs">
                                                {(service.virtualPrice && service.virtualPrice !== 0
                                                  ? service.virtualPrice
                                                  : service.basePrice
                                                ).toLocaleString('vi-VN')}
                                                đ
                                              </Badge>
                                              <span className="text-xs text-gray-500">
                                                {service.durationMinutes} phút
                                              </span>
                                            </div>
                                          </div>
                                          {isSelected && (
                                            <Badge variant="default" className="ml-2">
                                              Đã chọn
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Selected Services */}
                            {selectedServices.length > 0 && (
                              <>
                                <Separator />
                                <div className="space-y-4">
                                  <h3 className="text-sm font-medium text-gray-900">
                                    Dịch vụ đã chọn
                                  </h3>
                                  <div className="space-y-3">
                                    {selectedServices.map(item => {
                                      const price = item.price || 0;
                                      return (
                                        <div
                                          key={item.serviceId}
                                          className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                          <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">
                                              {item.service?.name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                              {price.toLocaleString('vi-VN')}đ x {item.quantity}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() =>
                                                updateQuantity(item.serviceId, item.quantity - 1)
                                              }
                                            >
                                              <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm font-medium">
                                              {item.quantity}
                                            </span>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() =>
                                                updateQuantity(item.serviceId, item.quantity + 1)
                                              }
                                            >
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                              onClick={() => removeService(item.serviceId)}
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Total */}
                                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-blue-900">Tổng cộng:</span>
                                      <span className="font-bold text-blue-900 text-lg">
                                        {totalAmount.toLocaleString('vi-VN')}đ
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Notes */}
                            <div className="space-y-2">
                              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                                Ghi chú đề xuất (tùy chọn)
                              </Label>
                              <Textarea
                                id="notes"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Lý do đề xuất dịch vụ bổ sung, lợi ích cho khách hàng..."
                                rows={3}
                                className="resize-none"
                              />
                            </div>

                            <Separator />

                            {/* Submit Button */}
                            <div className="flex gap-3">
                              <Button
                                type="submit"
                                disabled={!isProposalFormValid || isSubmittingProposal}
                                className="flex-1"
                              >
                                {isSubmittingProposal ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {detailBooking?.booking?.Proposal?.id
                                      ? 'Đang cập nhật đề xuất...'
                                      : 'Đang tạo đề xuất...'}
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    {detailBooking?.booking?.Proposal?.id
                                      ? `Cập nhật đề xuất (${selectedServices.length} dịch vụ)`
                                      : `Tạo đề xuất (${selectedServices.length} dịch vụ)`}
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab('details')}
                                disabled={isSubmittingProposal}
                              >
                                Hủy
                              </Button>
                            </div>
                          </form>
                        </TabsContent>
                      )}
                    </Tabs>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Service Information */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              {booking.category.logo ? (
                <Image
                  src={booking.category.logo}
                  alt=""
                  className="w-4 h-4"
                  width={100}
                  height={100}
                />
              ) : (
                <div className="w-4 h-4 bg-gray-300 rounded" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">{booking.category.name}</span>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">
                  {format(new Date(booking.preferredDate), 'dd/MM/yyyy', { locale: vi })}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(booking.preferredDate), 'HH:mm', { locale: vi })} -{' '}
                  {format(new Date(booking.preferredDate), 'EEEE', { locale: vi })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 truncate">
                {booking.customer.phone || '--'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 truncate" title={booking.location}>
                {booking.location}
              </span>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isCreatingConv}
                onClick={() =>
                  getOrCreateConv(
                    { receiverId: Number(booking.customerId) },
                    {
                      onSuccess: conversation => {
                        router.push(`/provider/chat?conversationId=${conversation.id}`);
                      },
                    }
                  )
                }
              >
                {isCreatingConv ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Liên hệ...
                  </span>
                ) : (
                  'Liên hệ'
                )}
              </Button>
              {isOverduePending && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-2"
                  onClick={() => setReportSheetOpen(true)}
                >
                  Báo cáo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Report Sheet */}
      <Sheet open={reportSheetOpen} onOpenChange={setReportSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">Báo cáo đặt lịch</SheetTitle>
            <SheetDescription>Vui lòng cung cấp thông tin chi tiết</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Lý do</Label>
              <Select value={reportReason} onValueChange={v => setReportReason(v as ReportReason)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReportReason.NO_SHOW}>Khách không xuất hiện</SelectItem>
                  <SelectItem value={ReportReason.INVALID_ADDRESS}>Địa chỉ không hợp lệ</SelectItem>
                  {/* <SelectItem value={ReportReason.INAPPROPRIATE_BEHAVIOR}>Ứng xử không phù hợp</SelectItem> */}
                  <SelectItem value={ReportReason.PAYMENT_ISSUE}>Vấn đề thanh toán</SelectItem>
                  <SelectItem value={ReportReason.OTHER}>Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
                rows={3}
                placeholder="Mô tả chi tiết sự việc"
              />
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={reportNote}
                onChange={e => setReportNote(e.target.value)}
                rows={2}
                placeholder="Ghi chú bổ sung (tùy chọn)"
              />
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh</Label>
              <ImageUpload
                disabled={uploadMutation.isPending}
                value={reportImages}
                onChange={setReportImages}
                onUpload={handleUpload}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmitReport} disabled={isReporting} className="flex-1">
                {isReporting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang gửi...
                  </span>
                ) : (
                  'Gửi báo cáo'
                )}
              </Button>
              <Button variant="outline" onClick={() => setReportSheetOpen(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
