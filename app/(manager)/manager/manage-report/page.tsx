'use client';

import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { useGetListReport, useUpdateReport, useGetReportDetail } from '@/hooks/useManager';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarClock,
  Filter,
  RefreshCcw,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  User,
} from 'lucide-react';
import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

type StatusFilter = 'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED';

const statusColorMap: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
};

type IconComponent = ComponentType<{ className?: string }>;
const statusIconMap: Record<string, IconComponent> = {
  PENDING: Clock,
  RESOLVED: CheckCircle,
  REJECTED: XCircle,
};

const statusTextMap: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã xử lý',
  REJECTED: 'Từ chối',
};

// Vietnamese translations for report reasons
const reasonTextMap: Record<string, string> = {
  POOR_SERVICE_QUALITY: 'Chất lượng dịch vụ kém',
  STAFF_BEHAVIOR: 'Thái độ nhân viên',
  TECHNICAL_ISSUES: 'Vấn đề kỹ thuật',
  NO_SHOW: 'Không xuất hiện',
  INVALID_ADDRESS: 'Địa chỉ không hợp lệ',
};

// Vietnamese translations for user types
const userTypeTextMap: Record<string, string> = {
  CUSTOMER: 'Khách hàng',
  PROVIDER: 'Nhà cung cấp',
};

export default function ManageReportPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const { data, isLoading, refetch, isFetching } = useGetListReport({
    page,
    limit,
    status: status === 'ALL' ? undefined : status,
  });

  // update report mutation
  const { mutate: updateReport, isPending: isUpdating } = useUpdateReport();
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState<string>('');
  const [lockedReportId, setLockedReportId] = useState<number | null>(null);

  // Update dialog (single button action) state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'RESOLVED' | 'REJECTED'>(
    'PENDING'
  );
  const [note, setNote] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch report detail when pencil button is clicked
  const { data: reportDetail } = useGetReportDetail(selectedReportForDetail || undefined);

  const handleSubmitUpdate = () => {
    if (!selectedReportId) return;
    const payload: {
      id: number;
      status: 'PENDING' | 'RESOLVED' | 'REJECTED';
      note?: string;
      amount?: number;
      reporterId?: number;
    } = {
      id: selectedReportId,
      status: selectedStatus,
      note: note?.trim() ? note.trim() : undefined,
    };

    if (selectedStatus === 'RESOLVED') {
      if (typeof amount === 'number') payload.amount = amount;
      // Use reporterId from report detail
      if (reportDetail?.reporterId) payload.reporterId = reportDetail.reporterId;
    }

    updateReport(payload, {
      onSuccess: () => {
        setUpdateDialogOpen(false);
        setSelectedReportId(null);
        setNote('');
        setAmount('');
        setSelectedReportForDetail(null);
        setDetailDialogOpen(false);
      },
      onError: (err: unknown) => {
        setLockedReportId(selectedReportId);
        let msg = '';
        if (typeof err === 'object' && err !== null) {
          const e = err as { message?: string | { message?: string }[]; statusCode?: number };
          if (Array.isArray(e.message)) {
            msg = e.message
              .map(m => m?.message)
              .filter(Boolean)
              .join('\n');
          } else if (typeof e.message === 'string') {
            msg = e.message;
          }
        }
        setErrorDialogMsg(
          msg || 'Không thể cập nhật báo cáo. Vui lòng thử lại hoặc liên hệ hỗ trợ.'
        );
        setErrorDialogOpen(true);
      },
    });
  };

  const totalPages = data?.totalPages ?? 1;
  const reports = data?.data ?? [];

  const headerActions = useMemo(
    () => (
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between w-full gap-3">
          <Select value={status} onValueChange={v => setStatus(v as StatusFilter)}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Tất cả
                </div>
              </SelectItem>
              <SelectItem value="PENDING">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Chờ xử lý
                </div>
              </SelectItem>
              <SelectItem value="RESOLVED">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Đã xử lý
                </div>
              </SelectItem>
              <SelectItem value="REJECTED">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  Từ chối
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10"
          >
            <RefreshCcw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
            Làm mới
          </Button>
        </div>
      </div>
    ),
    [isFetching, page, refetch, status, totalPages]
  );

  return (
    <div className="p-0 md:p-0">
      <SiteHeader title="Quản lý báo cáo" />
      <div className="p-4 pt-0 space-y-6">
        <div>
          <CardHeader className="space-y-6 pb-6">{headerActions}</CardHeader>
          <CardContent className="px-6 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Card key={idx} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-16 h-16 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                        <Skeleton className="w-20 h-8" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <Card className="border">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileText className="h-8 w-8" />
                        <p className="text-sm font-medium">Không có báo cáo nào</p>
                        <p className="text-xs">Hãy thử thay đổi bộ lọc</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  reports.map((report, index) => (
                    <Card
                      key={report.id}
                      className={cn(
                        'border transition-all duration-200 hover:shadow-md',
                        index % 2 === 0 && 'bg-muted/10'
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                          {/* Left Section - Images and Basic Info */}
                          <div className="flex-shrink-0 space-y-3">
                            <div className="flex gap-2">
                              {(report.imageUrls || []).slice(0, 2).map((url, idx) => (
                                <Image
                                  width={200}
                                  height={200}
                                  key={idx}
                                  src={url}
                                  alt={`report-${report.id}-${idx}`}
                                  className={cn(
                                    'rounded object-cover border',
                                    (report.imageUrls || []).length === 1
                                      ? 'w-32 h-32'
                                      : 'w-16 h-16'
                                  )}
                                />
                              ))}
                              {(report.imageUrls || []).length > 2 && (
                                <div className="w-16 h-16 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                  +{(report.imageUrls || []).length - 2}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(report.createdAt).toLocaleDateString('vi-VN')}{' '}
                                {new Date(report.createdAt).toLocaleTimeString('vi-VN')}
                              </span>
                            </div>
                          </div>

                          {/* Center Section - Report Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <div className="space-y-1">
                                <h4 className="font-medium text-sm">
                                  {reasonTextMap[report.reason] || report.reason}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {report.description}
                                </p>
                                {report.note && (
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Ghi chú:</span> {report.note}
                                  </p>
                                )}
                                {report.reviewResponse && (
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Phản hồi:</span>{' '}
                                    {report.reviewResponse}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* User Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {report.CustomerProfile && (
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                  <Image
                                    width={100}
                                    height={100}
                                    src={report.CustomerProfile.user?.avatar || ''}
                                    alt={report.CustomerProfile.user?.name || ''}
                                    className="w-10 h-10 rounded-full border object-cover"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {report.CustomerProfile.user?.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {report.CustomerProfile.user?.email}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {report.CustomerProfile.user?.phone}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {report.ServiceProvider && (
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                  <div className="w-10 h-10 rounded-full border bg-muted flex items-center justify-center overflow-hidden">
                                    {report.ServiceProvider.logo ? (
                                      <Image
                                        width={100}
                                        height={100}
                                        src={report.ServiceProvider.logo}
                                        alt={report.ServiceProvider.user?.name || ''}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xs px-1 text-muted-foreground">
                                        {report.ServiceProvider.user?.name
                                          ?.slice(0, 2)
                                          .toUpperCase() || '--'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {report.ServiceProvider.user?.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {report.ServiceProvider.user?.email}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {report.ServiceProvider.address}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Section - Status and Actions */}
                          <div className="flex-shrink-0 space-y-3">
                            <div className="flex justify-end">
                              <Badge
                                className={cn(
                                  'border transition-colors duration-200 text-xs px-3 py-1',
                                  statusColorMap[report.status] ??
                                    'bg-slate-50 text-slate-700 border-slate-200'
                                )}
                              >
                                {(() => {
                                  const StatusIcon = statusIconMap[report.status] || AlertCircle;
                                  return (
                                    <>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {statusTextMap[report.status] || report.status}
                                    </>
                                  );
                                })()}
                              </Badge>
                            </div>

                            {report.reporterType && (
                              <div className="text-center">
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {userTypeTextMap[report.reporterType]}
                                </span>
                              </div>
                            )}

                            {lockedReportId !== report.id && (
                              <Button
                                variant="default"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => {
                                  setSelectedReportId(report.id);
                                  setSelectedReportForDetail(report.id);
                                  setSelectedStatus(
                                    (report.status?.toUpperCase?.() as
                                      | 'PENDING'
                                      | 'RESOLVED'
                                      | 'REJECTED') || 'PENDING'
                                  );
                                  setNote(report.note || '');
                                  setDetailDialogOpen(true);
                                }}
                                title="Xem chi tiết báo cáo"
                                className="w-full"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4 w-full justify-between">
                <div className="text-sm text-muted-foreground font-medium">
                  Tổng <span className="font-bold">{data?.total ?? 0}</span> báo cáo
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (page > 1) setPage(page - 1);
                        }}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                      const p = start + index;
                      if (p > totalPages) return null;
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === page}
                            onClick={e => {
                              e.preventDefault();
                              setPage(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (page < totalPages) setPage(page + 1);
                        }}
                        disabled={page >= totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <Select value={String(limit)} onValueChange={v => setLimit(Number(v))}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / trang</SelectItem>
                    <SelectItem value="20">20 / trang</SelectItem>
                    <SelectItem value="50">50 / trang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lỗi cập nhật</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">{errorDialogMsg}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setErrorDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật báo cáo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* <div className="text-sm">Mã báo cáo: #{selectedReportId ?? '--'}</div> */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={selectedStatus}
                onValueChange={v => setSelectedStatus(v as 'PENDING' | 'RESOLVED' | 'REJECTED')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                  <SelectItem value="RESOLVED">Đã xử lý</SelectItem>
                  <SelectItem value="REJECTED">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedStatus === 'RESOLVED' && (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Số tiền</Label>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    value={typeof amount === 'number' ? amount.toLocaleString('vi-VN') : amount}
                    onChange={e => {
                      const v = e.target.value.replace(/\./g, '');
                      if (v === '') {
                        setAmount('');
                      } else if (/^\d+$/.test(v)) {
                        setAmount(Number(v));
                      }
                    }}
                    placeholder="Nhập số tiền"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                placeholder="Nhập ghi chú để giải quyết báo cáo (tùy chọn)"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="min-h-[96px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitUpdate} disabled={isUpdating}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết báo cáo #{selectedReportId}</DialogTitle>
          </DialogHeader>

          {reportDetail ? (
            <div className="space-y-6">
              {/* Basic Report Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Lý do báo cáo</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {reasonTextMap[reportDetail.reason] || reportDetail.reason}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Thời gian tạo</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {new Date(reportDetail.createdAt).toLocaleDateString('vi-VN')}{' '}
                    {new Date(reportDetail.createdAt).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Mô tả chi tiết</span>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {reportDetail.description}
                  </p>
                </div>
              </div>

              {/* Images */}
              {Array.isArray(reportDetail.imageUrls) && reportDetail.imageUrls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Hình ảnh ({reportDetail.imageUrls.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {reportDetail.imageUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border"
                      >
                        <Image
                          src={url}
                          alt={`Báo cáo ${reportDetail.id} - Hình ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Profile */}
              {reportDetail.CustomerProfile && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Thông tin khách hàng</span>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Image
                        width={60}
                        height={60}
                        src={reportDetail.CustomerProfile.user?.avatar || ''}
                        alt={reportDetail.CustomerProfile.user?.name || ''}
                        className="w-15 h-15 rounded-full border object-cover"
                      />
                      <div className="space-y-2 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Tên</p>
                            <p className="text-sm font-medium">
                              {reportDetail.CustomerProfile.user?.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">
                              {reportDetail.CustomerProfile.user?.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Số điện thoại</p>
                            <p className="text-sm font-medium">
                              {reportDetail.CustomerProfile.user?.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Địa chỉ</p>
                            <p className="text-sm font-medium">
                              {reportDetail.CustomerProfile.address || '--'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Giới tính</p>
                            <p className="text-sm font-medium">
                              {reportDetail.CustomerProfile.gender || '--'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Ngày sinh</p>
                            <p className="text-sm font-medium">
                              {reportDetail.CustomerProfile.dateOfBirth
                                ? new Date(
                                    reportDetail.CustomerProfile.dateOfBirth
                                  ).toLocaleDateString('vi-VN')
                                : '--'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Provider */}
              {reportDetail.ServiceProvider && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Thông tin nhà cung cấp</span>
                  </div>
                  <div className="bg-green-50/50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-15 h-15 rounded-full border bg-muted flex items-center justify-center overflow-hidden">
                        {reportDetail.ServiceProvider.logo ? (
                          <Image
                            width={60}
                            height={60}
                            src={reportDetail.ServiceProvider.logo}
                            alt={reportDetail.ServiceProvider.user?.name || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {reportDetail.ServiceProvider.user?.name?.slice(0, 2).toUpperCase() ||
                              '--'}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Tên công ty</p>
                            <p className="text-sm font-medium">
                              {reportDetail.ServiceProvider.user?.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">
                              {reportDetail.ServiceProvider.user?.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Số điện thoại</p>
                            <p className="text-sm font-medium">
                              {reportDetail.ServiceProvider.user?.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Địa chỉ</p>
                            <p className="text-sm font-medium">
                              {reportDetail.ServiceProvider.address || '--'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Loại công ty</p>
                            <p className="text-sm font-medium">
                              {reportDetail.ServiceProvider.companyType || '--'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Mã số thuế</p>
                            <p className="text-sm font-medium">
                              {reportDetail.ServiceProvider.taxId || '--'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Information */}
              {reportDetail.Booking && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Thông tin đặt dịch vụ</span>
                  </div>
                  <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Mã đặt dịch vụ</p>
                        <p className="text-sm font-medium">#{reportDetail.Booking.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trạng thái</p>
                        <p className="text-sm font-medium">{reportDetail.Booking.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày tạo</p>
                        <p className="text-sm font-medium">
                          {new Date(reportDetail.Booking.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày cập nhật</p>
                        <p className="text-sm font-medium">
                          {new Date(reportDetail.Booking.updatedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      {reportDetail.Booking.staffId && (
                        <div>
                          <p className="text-xs text-muted-foreground">Nhân viên phụ trách</p>
                          <p className="text-sm font-medium">#{reportDetail.Booking.staffId}</p>
                        </div>
                      )}
                      {reportDetail.Booking.completedAt && (
                        <div>
                          <p className="text-xs text-muted-foreground">Ngày hoàn thành</p>
                          <p className="text-sm font-medium">
                            {new Date(reportDetail.Booking.completedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {(reportDetail.note || reportDetail.reviewResponse) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Ghi chú & Phản hồi</span>
                  </div>
                  <div className="space-y-3">
                    {reportDetail.note && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Ghi chú:</p>
                        <p className="text-sm">{reportDetail.note}</p>
                      </div>
                    )}
                    {reportDetail.reviewResponse && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Phản hồi:</p>
                        <p className="text-sm">{reportDetail.reviewResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Đang tải thông tin...</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
            <Button
              onClick={() => {
                setDetailDialogOpen(false);
                setUpdateDialogOpen(true);
              }}
              disabled={!reportDetail}
            >
              Cập nhật báo cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
