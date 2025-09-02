'use client';

import { useState, useEffect } from 'react';
import { useReportList, useReportDetail, useUpdateReportBooking } from '@/hooks/useManageBooking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Calendar,
  MapPin,
  Eye,
  Users,
  Building2,
  User,
  Phone,
  Mail,
  MapPin as MapPinIcon,
  Clock,
  X,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { vi } from 'date-fns/locale';
import type { BookingReportItem } from '@/lib/api/services/fetchManageBooking';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReportReason } from '@/lib/api/services/fetchManageBooking';
import { ImageUpload } from '@/components/ui/image-upload';
import { useUploadImage } from '@/hooks/useImage';

// Helper functions
const translateStatus = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý';
    case 'APPROVED':
      return 'Đã duyệt';
    case 'REJECTED':
      return 'Đã từ chối';
    case 'RESOLVED':
      return 'Đã xử lý';
    default:
      return status;
  }
};

const translateReason = (reason: string): string => {
  switch (reason) {
    // Provider report reasons
    case 'NO_SHOW':
      return 'Khách không có ở nhà';
    case 'INVALID_ADDRESS':
      return 'Địa chỉ không hợp lệ';
    // Customer report reasons
    case 'POOR_SERVICE_QUALITY':
      return 'Chất lượng dịch vụ kém';
    case 'STAFF_BEHAVIOR':
      return 'Thái độ nhân viên không tốt';
    case 'TECHNICAL_ISSUES':
      return 'Vấn đề kỹ thuật';
    default:
      return reason;
  }
};

const translateReporterType = (type: string): string => {
  switch (type) {
    case 'CUSTOMER':
      return 'Khách hàng';
    case 'PROVIDER':
      return 'Nhà cung cấp';
    default:
      return type;
  }
};

const translateCompanyType = (type: string): string => {
  switch (type) {
    case 'INDIVIDUAL':
      return 'Cá nhân';
    case 'PARTNERSHIP':
      return 'Công ty hợp danh';
    case 'CORPORATION':
      return 'Công ty cổ phần';
    case 'LLC':
      return 'Công ty TNHH';
    case 'SOLE_PROPRIETORSHIP':
      return 'Doanh nghiệp tư nhân';
    default:
      return type;
  }
};

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'APPROVED':
      return 'default';
    case 'REJECTED':
      return 'destructive';
    case 'RESOLVED':
      return 'default';
    default:
      return 'default';
  }
};

export default function ReportPage() {
  const { data, isLoading, error, refetch } = useReportList();
  const reports = data?.data ?? [];
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);

  const handleRefresh = (): void => {
    refetch();
  };

  if (error) {
    return (
      <>
        <SiteHeader title="Quản lý báo cáo" />
        <div className="p-4 md:p-6">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Không thể tải dữ liệu</h3>
                  <p className="text-sm text-muted-foreground">
                    Đã xảy ra lỗi khi tải danh sách báo cáo. Vui lòng thử lại.
                  </p>
                </div>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Quản lý báo cáo" />

      <div className="p-4 md:p-6 space-y-6">
        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-32" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Chưa có báo cáo nào</h3>
                  <p className="text-sm text-muted-foreground">
                    Hiện tại chưa có báo cáo nào được gửi đến.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {reports.map((report: BookingReportItem) => (
              <Card
                key={report.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Báo cáo #{report.id}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {translateReporterType(report.reporterType)}
                      </Badge>
                      <Badge variant={getStatusVariant(report.status)} className="text-xs">
                        {translateStatus(report.status)}
                      </Badge>
                      <Sheet
                        open={detailSheetOpen && selectedReportId === report.id}
                        onOpenChange={open => {
                          if (open) {
                            setSelectedReportId(report.id);
                            setDetailSheetOpen(true);
                          } else {
                            setDetailSheetOpen(false);
                            setSelectedReportId(null);
                          }
                        }}
                      >
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                          <ReportDetailSheet reportId={report.id} />
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Report Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Booking:</span>
                      <span className="font-medium">BK-{report.bookingId}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="font-medium">
                        {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Lý do:</span>
                      <span className="font-medium">{translateReason(report.reason)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Mô tả</span>
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                      {report.description}
                    </div>
                  </div>

                  {/* Note */}
                  {report.note && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Ghi chú</span>
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                          {report.note}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Images */}
                  {Array.isArray(report.imageUrls) && report.imageUrls.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Hình ảnh ({report.imageUrls.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {report.imageUrls.map((url: string, idx: number) => (
                            <div
                              key={idx}
                              className="relative w-full aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors duration-200"
                            >
                              <Image
                                src={url}
                                alt={`Báo cáo ${report.id} - Hình ${idx + 1}`}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Edit Button - Only show if report is not RESOLVED */}
                  {report.status !== 'RESOLVED' && (
                    <>
                      <Separator />
                      <div className="flex justify-end">
                        <Sheet
                          open={editSheetOpen && editingReportId === report.id}
                          onOpenChange={open => {
                            if (open) {
                              setEditingReportId(report.id);
                              setEditSheetOpen(true);
                            } else {
                              setEditSheetOpen(false);
                              setEditingReportId(null);
                            }
                          }}
                        >
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <FileText className="h-4 w-4 mr-2" />
                              Chỉnh sửa báo cáo
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                            <EditReportSheet reportId={report.id} />
                          </SheetContent>
                        </Sheet>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Report Detail Sheet Component
function ReportDetailSheet({ reportId }: { reportId: number }) {
  const { data: reportDetail, isLoading, error } = useReportDetail(reportId, true);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Chi tiết báo cáo</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    );
  }

  if (error || !reportDetail) {
    return (
      <div className="space-y-6">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Chi tiết báo cáo</SheetTitle>
          <SheetDescription>Không thể tải thông tin báo cáo</SheetDescription>
        </SheetHeader>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Đã xảy ra lỗi khi tải thông tin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Chi tiết báo cáo #{reportDetail.id}
        </SheetTitle>
        <SheetDescription>Thông tin chi tiết về báo cáo đặt lịch</SheetDescription>
      </SheetHeader>

      {/* Report Status */}
      <div className="flex items-center gap-2">
        <Badge variant={getStatusVariant(reportDetail.status)} className="text-sm">
          {translateStatus(reportDetail.status)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Tạo lúc: {format(new Date(reportDetail.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
        </span>
      </div>

      <Separator />

      {/* Report Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Thông tin báo cáo</h3>
        <div className="grid gap-4 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Lý do</p>
              <p className="font-medium">{translateReason(reportDetail.reason)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Mô tả</p>
              <p className="font-medium">{reportDetail.description}</p>
            </div>
          </div>
          {reportDetail.note && (
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Ghi chú</p>
                <p className="font-medium">{reportDetail.note}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Người báo cáo</p>
              <p className="font-medium">{translateReporterType(reportDetail.reporterType)}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Booking Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Thông tin đặt lịch</h3>
        <div className="grid gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Mã booking</p>
              <p className="font-medium">BK-{reportDetail.Booking.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Trạng thái</p>
              <p className="font-medium">{translateStatus(reportDetail.Booking.status)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Ngày tạo</p>
              <p className="font-medium">
                {format(new Date(reportDetail.Booking.createdAt), 'dd/MM/yyyy HH:mm', {
                  locale: vi,
                })}
              </p>
            </div>
          </div>
          {reportDetail.Booking.staffId && (
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">ID Nhân viên</p>
                <p className="font-medium">#{reportDetail.Booking.staffId}</p>
              </div>
            </div>
          )}
          {reportDetail.Booking.completedAt && (
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Ngày hoàn thành</p>
                <p className="font-medium">
                  {format(new Date(reportDetail.Booking.completedAt), 'dd/MM/yyyy HH:mm', {
                    locale: vi,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Service Request Information */}
      {reportDetail.Booking.serviceRequest && (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Thông tin yêu cầu dịch vụ</h3>
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Ngày ưu tiên</p>
                    <p className="font-medium">
                      {format(
                        new Date(reportDetail.Booking.serviceRequest.preferredDate),
                        'dd/MM/yyyy HH:mm',
                        {
                          locale: vi,
                        }
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Trạng thái yêu cầu</p>
                    <p className="font-medium">{reportDetail.Booking.serviceRequest.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Địa chỉ</p>
                    <p className="font-medium">{reportDetail.Booking.serviceRequest.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{reportDetail.Booking.serviceRequest.phoneNumber}</p>
                  </div>
                </div>
                {reportDetail.Booking.serviceRequest.note && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Ghi chú</p>
                      <p className="font-medium">{reportDetail.Booking.serviceRequest.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Proposal Information */}
      {reportDetail.Booking.Proposal && (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Thông tin đề xuất</h3>
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">ID Đề xuất</p>
                    <p className="font-medium">#{reportDetail.Booking.Proposal.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Trạng thái</p>
                    <Badge
                      variant={
                        reportDetail.Booking.Proposal.status === 'ACCEPTED'
                          ? 'default'
                          : reportDetail.Booking.Proposal.status === 'REJECTED'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {reportDetail.Booking.Proposal.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Ngày tạo</p>
                    <p className="font-medium">
                      {format(
                        new Date(reportDetail.Booking.Proposal.createdAt),
                        'dd/MM/yyyy HH:mm',
                        {
                          locale: vi,
                        }
                      )}
                    </p>
                  </div>
                </div>
                {reportDetail.Booking.Proposal.notes && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Ghi chú</p>
                      <p className="font-medium">{reportDetail.Booking.Proposal.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Proposal Items */}
              {reportDetail.Booking.Proposal.ProposalItem &&
                reportDetail.Booking.Proposal.ProposalItem.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-muted-foreground text-xs font-medium">Các mục đề xuất:</p>
                    <div className="space-y-2">
                      {reportDetail.Booking.Proposal.ProposalItem.map(item => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-background rounded p-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Dịch vụ #{item.serviceId}</span>
                            <span className="text-muted-foreground">× {item.quantity}</span>
                            <Badge
                              variant={
                                item.status === 'ACCEPTED'
                                  ? 'default'
                                  : item.status === 'REJECTED'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                              className="text-xs"
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <span className="font-medium">
                            {item.price.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Customer Information */}
      {reportDetail.CustomerProfile && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Thông tin khách hàng</h3>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={reportDetail.CustomerProfile?.user.avatar || undefined} />
              <AvatarFallback className="text-base font-bold">
                {reportDetail.CustomerProfile?.user.name
                  .split(' ')
                  .map(n => n.charAt(0))
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{reportDetail.CustomerProfile?.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {reportDetail.CustomerProfile?.user.phone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {reportDetail.CustomerProfile?.user.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {reportDetail.CustomerProfile?.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Giới tính: {reportDetail.CustomerProfile?.gender === 'MALE' ? 'Nam' : 'Nữ'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Ngày sinh:{' '}
                  {format(new Date(reportDetail.CustomerProfile?.dateOfBirth), 'dd/MM/yyyy', {
                    locale: vi,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Service Provider Information */}
      {reportDetail.ServiceProvider && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Thông tin nhà cung cấp</h3>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={reportDetail.ServiceProvider?.user.avatar || undefined} />
              <AvatarFallback className="text-base font-bold">
                {reportDetail.ServiceProvider?.user.name
                  .split(' ')
                  .map(n => n.charAt(0))
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{reportDetail.ServiceProvider?.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {translateCompanyType(reportDetail.ServiceProvider?.companyType || '')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {reportDetail.ServiceProvider?.user.phone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {reportDetail.ServiceProvider?.user.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {reportDetail.ServiceProvider?.address}
                </span>
              </div>
              {reportDetail.ServiceProvider?.description && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Mô tả: {reportDetail.ServiceProvider?.description}
                  </span>
                </div>
              )}
              {reportDetail.ServiceProvider?.taxId && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Mã số thuế: {reportDetail.ServiceProvider?.taxId}
                  </span>
                </div>
              )}
              {reportDetail.ServiceProvider?.verificationStatus && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      reportDetail.ServiceProvider?.verificationStatus === 'VERIFIED'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {reportDetail.ServiceProvider?.verificationStatus === 'VERIFIED'
                      ? 'Đã xác minh'
                      : 'Chưa xác minh'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Images */}
      {reportDetail.imageUrls && reportDetail.imageUrls.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              Hình ảnh báo cáo ({reportDetail.imageUrls.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {reportDetail.imageUrls.map((url: string, idx: number) => (
                <div
                  key={idx}
                  className="relative w-full aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors duration-200"
                >
                  <Image
                    src={url}
                    alt={`Báo cáo ${reportDetail.id} - Hình ${idx + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Review Information */}
      {reportDetail.reviewedAt && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Thông tin xử lý</h3>
            <div className="grid gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Thời gian xử lý</p>
                  <p className="font-medium">
                    {format(new Date(reportDetail.reviewedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </div>
              </div>
              {reportDetail.reviewResponse && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Phản hồi xử lý</p>
                    <p className="font-medium">{reportDetail.reviewResponse}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Edit Report Sheet Component
function EditReportSheet({ reportId }: { reportId: number }) {
  const { data: reportDetail, isLoading, error } = useReportDetail(reportId, true);
  const { mutate: updateReport, isPending } = useUpdateReportBooking();
  const uploadMutation = useUploadImage();
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState<ReportReason>(ReportReason.NO_SHOW);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Initialize form data when report detail loads
  useEffect(() => {
    if (reportDetail) {
      setDescription(reportDetail.description);
      setNote(reportDetail.note || '');
      setReason(reportDetail.reason as ReportReason);
      setImageUrls(reportDetail.imageUrls);
    }
  }, [reportDetail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportDetail) return;

    updateReport({
      id: reportDetail.id,
      description: description.trim(),
      imageUrls,
      note: note.trim(),
      reporterType: reportDetail.reporterType,
      reason,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Chỉnh sửa báo cáo</SheetTitle>
          <SheetDescription>Đang tải thông tin...</SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    );
  }

  if (error || !reportDetail) {
    return (
      <div className="space-y-6">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Chỉnh sửa báo cáo</SheetTitle>
          <SheetDescription>Không thể tải thông tin báo cáo</SheetDescription>
        </SheetHeader>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Đã xảy ra lỗi khi tải thông tin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Chỉnh sửa báo cáo #{reportDetail.id}
        </SheetTitle>
        <SheetDescription>Cập nhật thông tin báo cáo đặt lịch</SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reason Selection */}
        <div className="space-y-2">
          <Label htmlFor="reason">Lý do báo cáo</Label>
          <Select value={reason} onValueChange={value => setReason(value as ReportReason)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn lý do" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ReportReason.NO_SHOW}>Khách không có ở nhà</SelectItem>
              <SelectItem value={ReportReason.INVALID_ADDRESS}>Địa chỉ không hợp lệ</SelectItem>
              <SelectItem value={ReportReason.POOR_SERVICE_QUALITY}>
                Chất lượng dịch vụ kém
              </SelectItem>
              <SelectItem value={ReportReason.STAFF_BEHAVIOR}>
                Thái độ nhân viên không tốt
              </SelectItem>
              <SelectItem value={ReportReason.TECHNICAL_ISSUES}>Vấn đề kỹ thuật</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả chi tiết</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết sự việc"
            rows={4}
            required
          />
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="note">Ghi chú bổ sung</Label>
          <Textarea
            id="note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ghi chú bổ sung (tùy chọn)"
            rows={3}
          />
        </div>

        {/* Current Images */}
        {imageUrls.length > 0 && (
          <div className="space-y-3">
            <Label>Hình ảnh hiện tại ({imageUrls.length})</Label>
            <div className="grid grid-cols-2 gap-3">
              {imageUrls.map((url: string, idx: number) => (
                <div
                  key={idx}
                  className="relative w-full aspect-square rounded-lg overflow-hidden border border-border"
                >
                  <Image src={url} alt={`Hình ${idx + 1}`} fill className="object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Images */}
        <div className="space-y-3">
          <Label>Thêm hình ảnh mới</Label>
          <ImageUpload
            disabled={uploadMutation.isPending}
            value={[]}
            onChange={newImages => {
              // Add new images to existing ones
              setImageUrls(prev => [...prev, ...newImages]);
            }}
            onUpload={async (file: File) => {
              const res = await uploadMutation.mutateAsync(file);
              return res.url;
            }}
          />
          <p className="text-xs text-muted-foreground">
            Bạn có thể thêm nhiều hình ảnh mới để bổ sung cho báo cáo
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật báo cáo'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
