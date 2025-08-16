'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  User,
  Calendar,
  Eye,
  Clock,
  FileText,
  UserCheck,
  Loader2,
  Upload,
  X,
  CheckCircle,
  Package,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Booking, StatusServiceRequest } from '@/lib/api/services/fetchBooking';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  useStaffCheckIn,
  useGetProposal,
  useCreateInspectionReport,
  useStaffCheckOut,
} from '@/hooks/useStaff';
import { useUploadImage } from '@/hooks/useImage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BookingCardProps {
  booking: Booking;
  status?: StatusServiceRequest;
  isDragging?: boolean;
  isLoading?: boolean;
  onStaffAssigned?: () => void;
}

interface InspectionReportFormData {
  estimatedTime: number;
  note: string;
  images: string[];
}

interface UploadedImage {
  id: string;
  file: File;
  url?: string;
  preview: string;
  status: 'uploading' | 'success' | 'error';
}

export function BookingCard({ booking, isDragging, isLoading, onStaffAssigned }: BookingCardProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState<InspectionReportFormData>({
    estimatedTime: 0,
    note: '',
    images: [],
  });
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutImages, setCheckoutImages] = useState<UploadedImage[]>([]);

  const { mutate: checkIn, isPending: isCheckingIn } = useStaffCheckIn();
  const { data: proposalData, isLoading: isLoadingProposal } = useGetProposal(booking.id);
  const { mutate: createReport, isPending: isCreatingReport } = useCreateInspectionReport();
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutate: staffCheckOut, isPending: isCheckingOut } = useStaffCheckOut();

  const initials = booking.customer.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const getStatusConfig = (status: StatusServiceRequest) => {
    switch (status) {
      case StatusServiceRequest.PENDING:
        return {
          label: 'Chờ xử lý',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: AlertTriangle,
          priority: 'high',
        };
      case StatusServiceRequest.IN_PROGRESS:
        return {
          label: 'Đang trong quá trình',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Play,
          priority: 'medium',
        };
      case StatusServiceRequest.ESTIMATED:
        return {
          label: 'Đã ước lượng',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          priority: 'low',
        };
      case StatusServiceRequest.CANCELLED:
        return {
          label: 'Đã hủy',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: X,
          priority: 'low',
        };
      default:
        return {
          label: 'Không xác định',
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Clock,
          priority: 'low',
        };
    }
  };

  const statusConfig = getStatusConfig(booking.serviceRequest.status);
  const isInProgress = booking.serviceRequest.status === StatusServiceRequest.IN_PROGRESS;
  const isEstimated = booking.serviceRequest.status === StatusServiceRequest.ESTIMATED;

  // Check if staff has already checked in for this booking
  // For IN_PROGRESS status, we assume they have checked in
  const hasCheckedIn = booking.serviceRequest.status === StatusServiceRequest.IN_PROGRESS;
  const needsCheckIn = isInProgress && !hasCheckedIn;

  // Workflow validation
  const canCheckIn = !hasCheckedIn && !isEstimated;
  const canCreateReport = isInProgress && hasCheckedIn;
  const canViewProposals = isInProgress || isEstimated;

  const handleCheckIn = () => {
    checkIn(booking.id, {
      onSuccess: () => {
        setOpen(false);
        onStaffAssigned?.();
      },
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const imageId = `${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);

      const newImage: UploadedImage = {
        id: imageId,
        file,
        preview,
        status: 'uploading',
      };

      setUploadedImages(prev => [...prev, newImage]);

      uploadImage(file, {
        onSuccess: response => {
          setUploadedImages(prev =>
            prev.map(img =>
              img.id === imageId ? { ...img, url: response.url, status: 'success' as const } : img
            )
          );
        },
        onError: () => {
          setUploadedImages(prev =>
            prev.map(img => (img.id === imageId ? { ...img, status: 'error' as const } : img))
          );
        },
      });
    });
  };

  const removeImage = (index: number) => {
    const imageToRemove = uploadedImages[index];
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.estimatedTime || formData.estimatedTime <= 0) {
      return;
    }

    if (!formData.note.trim()) {
      return;
    }

    const successfulImages = uploadedImages
      .filter(img => img.status === 'success' && img.url)
      .map(img => img.url!);

    createReport(
      {
        bookingId: booking.id,
        estimatedTime: formData.estimatedTime,
        note: formData.note.trim(),
        images: successfulImages,
      },
      {
        onSuccess: () => {
          setFormData({
            estimatedTime: 0,
            note: '',
            images: [],
          });
          setUploadedImages([]);
          setActiveTab('details');
          onStaffAssigned?.();
        },
      }
    );
  };

  const handleCheckoutImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const imageId = `${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);

      const newImage: UploadedImage = {
        id: imageId,
        file,
        preview,
        status: 'uploading',
      };

      setCheckoutImages(prev => [...prev, newImage]);

      uploadImage(file, {
        onSuccess: response => {
          setCheckoutImages(prev =>
            prev.map(img =>
              img.id === imageId ? { ...img, url: response.url, status: 'success' as const } : img
            )
          );
        },
        onError: () => {
          setCheckoutImages(prev =>
            prev.map(img => (img.id === imageId ? { ...img, status: 'error' as const } : img))
          );
        },
      });
    });
  };

  const removeCheckoutImage = (index: number) => {
    const imageToRemove = checkoutImages[index];
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    setCheckoutImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const successfulImages = checkoutImages
      .filter(img => img.status === 'success' && img.url)
      .map(img => img.url!);
    staffCheckOut(
      { bookingId: booking.id, data: { imageUrls: successfulImages } },
      {
        onSuccess: () => {
          setCheckoutOpen(false);
          setCheckoutImages([]);
          onStaffAssigned?.();
        },
      }
    );
  };

  const hasUploadingImages = uploadedImages.some(img => img.status === 'uploading');
  const isFormValid = formData.estimatedTime > 0 && formData.note.trim().length > 0;

  // Reset form and cleanup when sheet closes
  useEffect(() => {
    if (!open) {
      // Clean up existing images
      uploadedImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      setUploadedImages([]);
      setFormData({
        estimatedTime: 0,
        note: '',
        images: [],
      });
      setActiveTab('details');
    }
  }, [open]); // Only depend on open state change

  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg overflow-hidden',
        'border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200',
        isDragging && 'rotate-2 scale-105 shadow-lg',
        isLoading && 'opacity-50 pointer-events-none',
        needsCheckIn && 'border-l-4 border-l-blue-400 bg-blue-50/30'
      )}
    >
      {/* Priority indicator for bookings that need check-in */}
      {needsCheckIn && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
      )}

      <div className="p-4">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-50">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{booking.customer.name}</h3>
              <p className="text-xs text-gray-500">SR-{booking.serviceRequestId}</p>
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
                  Chi tiết yêu cầu dịch vụ
                  {needsCheckIn && (
                    <Badge variant="destructive" className="ml-2">
                      Cần check-in
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription>Thông tin chi tiết về yêu cầu dịch vụ</SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Chi tiết</TabsTrigger>
                    <TabsTrigger value="proposals" disabled={!canViewProposals}>
                      Đề xuất dịch vụ
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-6 space-y-6">
                    {/* Priority Alert for Bookings that need check-in */}
                    {needsCheckIn && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Bước tiếp theo:</strong> Bạn cần check-in để bắt đầu xử lý yêu cầu
                          này.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Workflow Progress */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900">Tiến trình xử lý</h3>
                      <div className="space-y-3">
                        <div
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border',
                            needsCheckIn
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200'
                          )}
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              needsCheckIn ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                            )}
                          >
                            {needsCheckIn ? '1' : <CheckCircle className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Check-in</p>
                            <p className="text-sm text-gray-500">
                              {needsCheckIn ? 'Cần thực hiện để bắt đầu' : 'Đã hoàn thành'}
                            </p>
                          </div>
                          {needsCheckIn && (
                            <Button
                              onClick={handleCheckIn}
                              disabled={isCheckingIn}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 just"
                            >
                              {isCheckingIn ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Đang check-in...
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Check-in ngay
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        <div
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border',
                            canCreateReport
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          )}
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              canCreateReport
                                ? 'bg-green-500 text-white'
                                : isEstimated
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-300 text-gray-500'
                            )}
                          >
                            {canCreateReport ? (
                              '2'
                            ) : isEstimated ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              '2'
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Tạo báo cáo khảo sát</p>
                            <p className="text-sm text-gray-500">
                              {canCreateReport
                                ? 'Có thể thực hiện'
                                : isEstimated
                                  ? 'Đã hoàn thành'
                                  : 'Chờ check-in'}
                            </p>
                          </div>
                          {canCreateReport && (
                            <Button
                              onClick={() => setActiveTab('report')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Tạo báo cáo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Booking Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900">Thông tin yêu cầu</h3>
                      <div className="grid gap-4 text-sm">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Mã yêu cầu</p>
                            <p className="font-medium">SR-{booking.serviceRequestId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Ngày & Giờ hẹn</p>
                            <p className="font-medium">
                              {format(
                                new Date(booking.serviceRequest.preferredDate),
                                'dd/MM/yyyy - HH:mm',
                                { locale: vi }
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(booking.serviceRequest.preferredDate), 'EEEE', {
                                locale: vi,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Địa điểm</p>
                            <p className="font-medium">{booking.serviceRequest.location}</p>
                          </div>
                        </div>
                        {booking.serviceRequest.note && (
                          <div className="flex items-start gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-muted-foreground">Ghi chú</p>
                              <p className="font-medium">{booking.serviceRequest.note}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900">Thông tin khách hàng</h3>
                      <div className="grid gap-4 text-sm">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Họ và tên</p>
                            <p className="font-medium">{booking.customer.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Số điện thoại</p>
                            <p className="font-medium">{booking.customer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Địa chỉ</p>
                            <p className="font-medium">{booking.customer.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">SĐT liên hệ yêu cầu</p>
                            <p className="font-medium">{booking.serviceRequest.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Service Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900">Dịch vụ</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {booking.serviceRequest.categoryName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.serviceRequest.categoryName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Danh mục: {booking.serviceRequest.categoryId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Status Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900">Trạng thái</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={cn(
                              'font-normal border flex items-center gap-1',
                              statusConfig.color
                            )}
                          >
                            <statusConfig.icon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Tạo lúc:{' '}
                            {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm', {
                              locale: vi,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="proposals" className="mt-6 space-y-6">
                    {/* Proposals Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        <h3 className="text-sm font-medium text-gray-900">
                          Đề xuất dịch vụ bổ sung
                        </h3>
                      </div>

                      {isLoadingProposal ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="text-sm text-gray-500 mt-2">Đang tải đề xuất...</p>
                        </div>
                      ) : proposalData?.data ? (
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Đề xuất #{proposalData.data.id}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {format(
                                    new Date(proposalData.data.createdAt),
                                    'dd/MM/yyyy HH:mm',
                                    {
                                      locale: vi,
                                    }
                                  )}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  proposalData.data.status === 'ACCEPTED' ? 'default' : 'outline'
                                }
                                className={`text-xs ${
                                  proposalData.data.status === 'ACCEPTED'
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : proposalData.data.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                      : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {proposalData.data.status === 'ACCEPTED'
                                  ? 'Đã chấp nhận'
                                  : proposalData.data.status === 'PENDING'
                                    ? 'Chờ xử lý'
                                    : proposalData.data.status}
                              </Badge>
                            </div>

                            {proposalData.data.notes && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600">{proposalData.data.notes}</p>
                              </div>
                            )}

                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-gray-700">
                                Dịch vụ đề xuất:
                              </h5>
                              {proposalData.data.items.map(service => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{service.service.name}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      {service.service.virtualPrice.toLocaleString('vi-VN')}đ x{' '}
                                      {service.quantity}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {service.service.durationMinutes} phút
                                    </p>
                                  </div>
                                </div>
                              ))}

                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-900">Tổng cộng:</span>
                                  <span className="font-bold text-green-500 text-lg">
                                    {proposalData.data.items
                                      .reduce(
                                        (total, service) =>
                                          total + service.service.virtualPrice * service.quantity,
                                        0
                                      )
                                      .toLocaleString('vi-VN')}
                                    đ
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-sm font-medium text-gray-500">Chưa có đề xuất nào</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            Các đề xuất dịch vụ bổ sung sẽ hiển thị ở đây
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Hidden Report Tab - Accessible via button */}
                  <TabsContent value="report" className="mt-6 space-y-6">
                    {/* Inspection Report Form */}
                    <form onSubmit={handleCreateReport} className="space-y-6">
                      {/* Booking Information */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          Thông tin công việc
                        </h3>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Khách hàng:</span>
                            <span className="font-medium">{booking.customer.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dịch vụ:</span>
                            <span className="font-medium">
                              {booking.serviceRequest.categoryName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mã booking:</span>
                            <span className="font-medium">BK-{booking.id}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Estimated Time */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="estimatedTime"
                          className="text-sm font-medium text-gray-700"
                        >
                          Thời gian ước tính (phút) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="estimatedTime"
                            type="number"
                            min="1"
                            max="480"
                            value={formData.estimatedTime || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                estimatedTime: parseInt(e.target.value) || 0,
                              }))
                            }
                            placeholder="Nhập thời gian ước tính (phút)"
                            className="pl-10"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Thời gian dự kiến để hoàn thành công việc (1-480 phút)
                        </p>
                      </div>

                      {/* Note */}
                      <div className="space-y-2">
                        <Label htmlFor="note" className="text-sm font-medium text-gray-700">
                          Ghi chú báo cáo <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="note"
                          value={formData.note}
                          onChange={e => setFormData(prev => ({ ...prev, note: e.target.value }))}
                          placeholder="Mô tả tình trạng hiện tại, vấn đề cần xử lý, yêu cầu đặc biệt..."
                          rows={4}
                          className="resize-none"
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Chi tiết tình trạng và đánh giá ban đầu
                        </p>
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-700">
                            Hình ảnh hiện trường (tùy chọn)
                          </Label>
                          {uploadedImages.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {uploadedImages.filter(img => img.status === 'success').length}/
                              {uploadedImages.length} thành công
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id="image-upload"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <Label
                            htmlFor="image-upload"
                            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer transition-colors ${
                              isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                            }`}
                          >
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            {isUploading ? 'Đang tải lên...' : 'Tải lên hình ảnh'}
                          </Label>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, JPEG (tối đa 5MB mỗi file)
                          </span>
                        </div>

                        {/* Image Preview */}
                        {uploadedImages.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {uploadedImages.map((image, index) => (
                              <div key={image.id} className="relative group">
                                <Image
                                  src={image.preview}
                                  alt={`Uploaded ${index + 1}`}
                                  width={96}
                                  height={96}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />

                                {/* Upload Status Overlay */}
                                {image.status === 'uploading' && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                                  </div>
                                )}

                                {image.status === 'success' && (
                                  <div className="absolute top-1 left-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3" />
                                  </div>
                                )}

                                {image.status === 'error' && (
                                  <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                                    <span className="text-red-600 text-xs font-medium">
                                      Lỗi tải lên
                                    </span>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Submit Button */}
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={!isFormValid || isCreatingReport || hasUploadingImages}
                          className="flex-1"
                        >
                          {isCreatingReport ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang tạo báo cáo...
                            </>
                          ) : hasUploadingImages ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang tải hình ảnh...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Tạo báo cáo
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab('details')}
                          disabled={isCreatingReport || hasUploadingImages}
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Status Badge with Priority Indicator */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2 justify-end">
            {canCheckIn && (
              <Button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                size="sm"
                className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Đang check-in...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3 w-3 mr-1" />
                    Check-in
                  </>
                )}
              </Button>
            )}

            {canCreateReport && (
              <Button
                onClick={() => {
                  setOpen(true);
                  setActiveTab('report');
                }}
                size="sm"
                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-3 w-3 mr-1" />
                Báo cáo
              </Button>
            )}

            {isEstimated && (
              <Button
                onClick={() => setCheckoutOpen(true)}
                size="sm"
                className="h-7 px-2 text-xs bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Check out
              </Button>
            )}
          </div>
        </div>

        {/* Service Information */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-blue-600 text-xs font-bold">
              {booking.serviceRequest.categoryName.charAt(0)}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 truncate">
            {booking.serviceRequest.categoryName}
          </span>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">
                {format(new Date(booking.serviceRequest.preferredDate), 'dd/MM/yyyy', {
                  locale: vi,
                })}
              </span>
              <span className="text-xs text-gray-500">
                {format(new Date(booking.serviceRequest.preferredDate), 'HH:mm', { locale: vi })} -{' '}
                {format(new Date(booking.serviceRequest.preferredDate), 'EEEE', { locale: vi })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 truncate">{booking.customer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span
              className="text-sm text-gray-600 truncate"
              title={booking.serviceRequest.location}
            >
              {booking.serviceRequest.location}
            </span>
          </div>
        </div>
      </div>
      {/* Check-out Dialog */}
      <Sheet open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full flex flex-col p-0">
          <div className="px-6 py-5 border-b">
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Check out công việc
              </SheetTitle>
              <SheetDescription className="mt-1">
                Tải lên hình ảnh hoàn thành (tùy chọn), sau đó xác nhận check out.
              </SheetDescription>
            </SheetHeader>
          </div>
          <form
            onSubmit={handleSubmitCheckout}
            className="flex-1 flex flex-col justify-between px-6 py-5 space-y-6"
          >
            <div>
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh hoàn thành (tối đa 4)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    id="checkout-image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleCheckoutImageSelect}
                    className="hidden"
                    disabled={isUploading || checkoutImages.length >= 4}
                  />
                  <Label
                    htmlFor="checkout-image-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg cursor-pointer transition hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 ${
                      isUploading || checkoutImages.length >= 4
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    ) : (
                      <Upload className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="font-medium text-gray-700">
                      {isUploading
                        ? 'Đang tải lên...'
                        : checkoutImages.length >= 6
                          ? 'Đã đạt giới hạn'
                          : 'Tải lên hình ảnh'}
                    </span>
                  </Label>
                  <span className="text-xs text-gray-500">{checkoutImages.length}/4</span>
                </div>
              </div>
              {checkoutImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {checkoutImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                    >
                      <Image
                        src={image.preview}
                        alt={`Checkout ${index + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-28 object-cover"
                        style={{ aspectRatio: '1/1' }}
                        priority={index === 0}
                      />
                      {image.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                      {image.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                          <span className="text-red-700 text-xs font-semibold">Lỗi tải lên</span>
                        </div>
                      )}
                      <button
                        type="button"
                        aria-label="Xóa hình ảnh"
                        onClick={() => removeCheckoutImage(index)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity shadow-lg"
                        tabIndex={0}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <SheetFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCheckoutOpen(false)}
                disabled={isCheckingOut || isUploading}
                className="sm:mr-2"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isCheckingOut || isUploading}
                className="bg-gray-800 hover:bg-gray-900 text-white font-semibold shadow"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Đang check out...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Xác nhận check out
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
