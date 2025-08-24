'use client';

import { useMemo } from 'react';
import { useReportList } from '@/hooks/useManageBooking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { vi } from 'date-fns/locale';

export default function ReportPage() {
  const { data, isLoading } = useReportList();
  const reports = data?.data ?? [];

  const total = data?.totalItems ?? 0;

  const translateStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const translateReason = (reason: string) => {
    switch (reason) {
      case 'NO_SHOW':
        return 'Khách không xuất hiện';
      case 'INVALID_ADDRESS':
        return 'Địa chỉ không hợp lệ';
      case 'PAYMENT_ISSUE':
        return 'Vấn đề thanh toán';
      case 'OTHER':
        return 'Khác';
      default:
        return reason;
    }
  };

  const translateReporterType = (type: string) => {
    switch (type) {
      case 'CUSTOMER':
        return 'Khách hàng';
      case 'PROVIDER':
        return 'Nhà cung cấp';
      default:
        return type;
    }
  };

  const headerStats = useMemo(
    () => ({ total, pending: reports.filter(r => r.status === 'PENDING').length }),
    [reports, total]
  );

  return (
    <>
      <SiteHeader title={`Quản lý báo cáo - Tổng số báo cáo: ${headerStats.total}`} />

      <div className="p-4 md:p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map(report => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">Báo cáo #{report.id}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{translateReporterType(report.reporterType)}</Badge>
                    <Badge
                      variant={report.status === 'PENDING' ? 'secondary' : 'outline'}
                      className={report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                    >
                      {translateStatus(report.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Booking:</span>
                      <span className="font-medium">BK-{report.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời gian:</span>
                      <span className="font-medium">
                        {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lý do:</span>
                      <span className="font-medium">{translateReason(report.reason)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Mô tả</div>
                    <div className="text-sm text-gray-800 whitespace-pre-line">
                      {report.description}
                    </div>
                  </div>

                  {report.note && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Ghi chú</div>
                      <div className="text-sm text-gray-800 whitespace-pre-line">{report.note}</div>
                    </div>
                  )}

                  {Array.isArray(report.imageUrls) && report.imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Hình ảnh</div>
                      <div className="grid grid-cols-2 gap-2">
                        {report.imageUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative w-full aspect-square rounded overflow-hidden"
                          >
                            <Image src={url} alt="report" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
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
