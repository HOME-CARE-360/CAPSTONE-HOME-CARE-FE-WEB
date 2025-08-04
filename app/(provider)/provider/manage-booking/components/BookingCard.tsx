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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/lib/api/services/fetchManageBooking';
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
import { useAssignStaffToBooking, useCreateProposedBooking } from '@/hooks/useManageBooking';
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
import Image from 'next/image';

interface BookingCardProps {
  booking: Booking;
  status?: Booking['status'];
  isDragging?: boolean;
  isLoading?: boolean;
  onStaffAssigned?: () => void;
}

interface ServiceSelection extends ProposedService {
  service?: ServiceManager;
}

export function BookingCard({ booking, isDragging, isLoading, onStaffAssigned }: BookingCardProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Proposed services state
  const [notes, setNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);

  // Get detailed booking data
  const { data: detailBooking } = useDetailBooking(booking.id);

  // Fetch staff for this booking's category
  const { data: staffData, isLoading: isLoadingStaff } = useGetStaffAvailable({
    categories: [booking.categoryId],
    orderBy: 'asc',
  });

  const { mutate: assignStaff, isPending: isAssigning } = useAssignStaffToBooking();

  // Proposed services hooks
  const { data: servicesData, isLoading: isLoadingServices } = useServiceManager({
    sortBy: 'createdAt',
    orderBy: 'desc',
    name: '',
    limit: 100,
    page: 1,
  });
  const { mutate: createProposed, isPending: isCreatingProposal } = useCreateProposedBooking();

  const initials = booking.customer.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'IN_PROGRESS':
        return { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'ESTIMATED':
        return { label: 'Đã ước lượng', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { label: 'Không xác định', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const statusConfig = getStatusConfig(booking.status);
  const availableStaff = staffData?.data || [];
  const availableServices = servicesData?.data || [];

  // Check if inspection report exists and if staff is already assigned
  const hasInspectionReport = detailBooking?.booking?.inspectionReport !== undefined;
  const hasStaffAssigned = detailBooking?.booking?.staff !== undefined;

  // Check if booking is in progress
  const isInProgress = booking.status === 'IN_PROGRESS';

  // Determine if we should show proposal tab
  // Show when: no inspection report OR booking is in progress
  const shouldShowProposalTab = !hasInspectionReport || isInProgress;

  // Determine if we should show staff assignment section
  const shouldShowStaffAssignment = !hasStaffAssigned;

  // Proposed services functions
  const addService = (service: ServiceManager) => {
    const existingIndex = selectedServices.findIndex(s => s.serviceId === service.id);

    if (existingIndex >= 0) {
      setSelectedServices(prev =>
        prev.map((s, index) => (index === existingIndex ? { ...s, quantity: s.quantity + 1 } : s))
      );
    } else {
      setSelectedServices(prev => [...prev, { serviceId: service.id, quantity: 1, service }]);
    }
  };

  const updateQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeService(serviceId);
      return;
    }

    setSelectedServices(prev =>
      prev.map(s => (s.serviceId === serviceId ? { ...s, quantity } : s))
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
    }));

    createProposed(
      {
        bookingId: booking.id,
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
  };

  const totalAmount = selectedServices.reduce((total, s) => {
    return total + (s.service?.basePrice || 0) * s.quantity;
  }, 0);

  const isProposalFormValid = selectedServices.length > 0;

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
                </SheetTitle>
                <SheetDescription>Thông tin chi tiết về yêu cầu đặt lịch</SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList
                    className={`grid w-full ${shouldShowProposalTab ? 'grid-cols-2' : 'grid-cols-1'}`}
                  >
                    <TabsTrigger value="details">Chi tiết & Phân công</TabsTrigger>
                    {shouldShowProposalTab && (
                      <TabsTrigger value="proposal">Đề xuất dịch vụ</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="details" className="mt-6 space-y-6">
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
                            <Image src={booking.category.logo} alt="" className="w-8 h-8" />
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
                      {shouldShowProposalTab && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Hành động nhanh</h4>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setActiveTab('proposal')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {isInProgress
                              ? 'Thêm dịch vụ trong quá trình thực hiện'
                              : 'Đề xuất dịch vụ bổ sung'}
                          </Button>
                        </div>
                      )}

                      {shouldShowProposalTab && <Separator />}

                      {/* Staff Assignment */}
                      {shouldShowStaffAssignment && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Phân công nhân viên</h4>

                          {/* Staff Selection */}
                          <div className="space-y-3">
                            {isLoadingStaff ? (
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                              </div>
                            ) : availableStaff.length === 0 ? (
                              <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                                Không có nhân viên phù hợp với dịch vụ này
                              </div>
                            ) : (
                              <>
                                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                                  <SelectTrigger>
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
                                            <span className="font-medium">{staff.user.name}</span>
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
                                  className="w-full"
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
                                      Phân công nhân viên
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
                          <h4 className="text-sm font-medium text-gray-700">
                            Nhân viên được phân công
                          </h4>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={detailBooking.booking.staff.user.avatar || undefined}
                                />
                                <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                  {detailBooking.booking.staff.user.name
                                    .split(' ')
                                    .map(n => n.charAt(0))
                                    .join('')
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-green-900">
                                  {detailBooking.booking.staff.user.name}
                                </p>
                                <p className="text-sm text-green-700">
                                  {detailBooking.booking.staff.user.email}
                                </p>
                                <p className="text-sm text-green-700">
                                  {detailBooking.booking.staff.user.phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Show inspection report if exists */}
                      {hasInspectionReport && detailBooking?.booking?.inspectionReport && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Báo cáo khảo sát</h4>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-blue-700">Thời gian ước tính:</p>
                                  <p className="font-medium text-blue-900">
                                    {detailBooking.booking.inspectionReport.estimatedTime} phút
                                  </p>
                                </div>
                                <div className="text-xs text-blue-600">
                                  {format(
                                    new Date(detailBooking.booking.inspectionReport.createdAt),
                                    'dd/MM/yyyy HH:mm',
                                    { locale: vi }
                                  )}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-blue-700 mb-1">Ghi chú:</p>
                                <p className="text-sm text-blue-900">
                                  {detailBooking.booking.inspectionReport.note}
                                </p>
                              </div>

                              {detailBooking.booking.inspectionReport.images &&
                                detailBooking.booking.inspectionReport.images.length > 0 && (
                                  <div>
                                    <p className="text-sm text-blue-700 mb-2">Hình ảnh khảo sát:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {detailBooking.booking.inspectionReport.images.map(
                                        (image, index) => (
                                          <div
                                            key={index}
                                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                                          >
                                            <Image
                                              src={image}
                                              alt={`Inspection ${index + 1}`}
                                              fill
                                              className="object-cover"
                                            />
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
                    </div>
                  </TabsContent>

                  {shouldShowProposalTab && (
                    <TabsContent value="proposal" className="mt-6 space-y-6">
                      {/* Proposal Form */}
                      <form onSubmit={handleSubmitProposal} className="space-y-6">
                        {/* Booking Information */}
                        <div
                          className={`p-4 rounded-lg ${isInProgress ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                        >
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            Thông tin đặt lịch
                            {isInProgress && (
                              <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200">
                                Đang xử lý
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
                                <span className="font-medium text-blue-700">
                                  Có thể đề xuất dịch vụ bổ sung
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Service Selection */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            {isInProgress ? 'Chọn dịch vụ bổ sung' : 'Chọn dịch vụ'}
                          </h3>
                          {isInProgress && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-sm text-amber-800">
                                <strong>Lưu ý:</strong> Đây là các dịch vụ bổ sung có thể thêm vào
                                trong quá trình thực hiện công việc.
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
                                        ? 'border-blue-500 bg-blue-50'
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
                                        <div className="flex items-center gap-2 mt-2">
                                          <Badge variant="secondary" className="text-xs">
                                            {service.basePrice.toLocaleString('vi-VN')}đ
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
                              <h3 className="text-sm font-medium text-gray-900">Dịch vụ đã chọn</h3>
                              <div className="space-y-3">
                                {selectedServices.map(item => (
                                  <div
                                    key={item.serviceId}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">
                                        {item.service?.name}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {item.service?.basePrice.toLocaleString('vi-VN')}đ x{' '}
                                        {item.quantity}
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
                                ))}
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
                            disabled={!isProposalFormValid || isCreatingProposal}
                            className="flex-1"
                          >
                            {isCreatingProposal ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang tạo đề xuất...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                Tạo đề xuất ({selectedServices.length} dịch vụ)
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveTab('details')}
                            disabled={isCreatingProposal}
                          >
                            Hủy
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={cn('font-normal border', statusConfig.color)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Service Information */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
            {booking.category.logo ? (
              <Image src={booking.category.logo} alt="" className="w-4 h-4" />
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
            <span className="text-sm text-gray-600 truncate">{booking.customer.phone || '--'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 truncate" title={booking.location}>
              {booking.location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
