'use client';

import { useState } from 'react';
import { useGetReport } from '@/hooks/useBooking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Search,
  FileText,
  User,
  Building,
} from 'lucide-react';
import { formatDate } from '@/utils/numbers/formatDate';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Report } from '@/lib/api/services/fetchBooking';

const getStatusConfig = (status: string) => {
  const map: Record<
    string,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
  > = {
    PENDING: { label: 'Chờ xử lý', icon: Clock, variant: 'secondary' },
    ACCEPTED: { label: 'Đã chấp nhận', icon: CheckCircle, variant: 'default' },
    REJECTED: { label: 'Đã từ chối', icon: XCircle, variant: 'destructive' },
  };
  return map[status.toUpperCase()] || { label: status, icon: AlertCircle, variant: 'outline' };
};

interface ReportCardProps {
  report: Report;
}

const ReportCard = ({ report }: ReportCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = getStatusConfig(report.status);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={statusConfig.variant} className="gap-1">
                <statusConfig.icon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                #{report.id}
              </Badge>
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flag className="h-4 w-4 text-orange-500" />
              Báo cáo sự cố
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {formatDate(report.createdAt)}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls={`report-${report.id}-details`}
            className="hover:bg-muted/50"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Report Summary */}
        <div className="space-y-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Lý do báo cáo
            </h4>
            <p className="text-sm text-muted-foreground">{report.reason}</p>
          </div>

          <div className="bg-muted/30 rounded-lg p-3">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Mô tả chi tiết
            </h4>
            <p className="text-sm text-muted-foreground">{report.description}</p>
          </div>
        </div>

        {/* Provider Info */}
        <div className="flex gap-3 items-start p-3 bg-muted/20 rounded-lg">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold truncate">
              {report.provider?.name || 'Không có thông tin'}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {report.provider?.email || 'Không có email'}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground truncate">
              <User className="h-3 w-3" />
              {report.provider?.phone || 'Không có số điện thoại'}
            </div>
          </div>
        </div>

        {/* Booking Info */}
        <div className="bg-muted/20 rounded-lg p-3">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500" />
            Thông tin đặt dịch vụ
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Mã đặt:</span>
              <p className="font-medium">#{report.booking?.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Trạng thái:</span>
              <p className="font-medium">{report.booking?.status}</p>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div
            id={`report-${report.id}-details`}
            className="space-y-4 animate-in fade-in-0 slide-in-from-top-1 duration-200"
          >
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Ngày tạo:</span>
                <p className="font-medium">{formatDate(report.createdAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trạng thái xử lý:</span>
                <p className="font-medium">{statusConfig.label}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ReportSkeleton = () => (
  <Card className="overflow-hidden animate-pulse">
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
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
    </CardContent>
  </Card>
);

const EmptyState = ({ status }: { status?: string }) => (
  <Card className="py-12 text-center">
    <Flag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">
      {status ? `Không có báo cáo ${status.toLowerCase()}` : 'Chưa có báo cáo nào'}
    </h3>
    <p className="text-muted-foreground">
      {status
        ? `Bạn chưa có báo cáo nào ở trạng thái ${status.toLowerCase()}`
        : 'Bạn chưa tạo báo cáo nào. Hãy tạo báo cáo khi gặp sự cố với dịch vụ.'}
    </p>
  </Card>
);

export default function ReportsPage() {
  const { data: reportData, isLoading, error } = useGetReport();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const reports = reportData?.data?.reports || [];

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || report.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const statuses = [
    { key: 'all', label: 'Tất cả', count: reports.length },
    {
      key: 'pending',
      label: 'Chờ xử lý',
      count: reports.filter(r => r.status.toUpperCase() === 'PENDING').length,
    },
    {
      key: 'accepted',
      label: 'Đã chấp nhận',
      count: reports.filter(r => r.status.toUpperCase() === 'ACCEPTED').length,
    },
    {
      key: 'rejected',
      label: 'Đã từ chối',
      count: reports.filter(r => r.status.toUpperCase() === 'REJECTED').length,
    },
  ];

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">Lỗi tải danh sách báo cáo</CardTitle>
          <CardDescription>Vui lòng thử lại sau hoặc liên hệ hỗ trợ</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Flag className="h-8 w-8 text-orange-500" />
          Báo cáo của tôi
        </h1>
        <p className="text-muted-foreground text-lg">
          Theo dõi tất cả các báo cáo sự cố bạn đã gửi
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo lý do, mô tả hoặc tên nhà cung cấp..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status.key} value={status.key}>
                {status.label} ({status.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {statuses.map(status => (
            <TabsTrigger key={status.key} value={status.key}>
              {status.label}
              <span className="ml-2 text-xs bg-muted px-2 rounded-full">{status.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {statuses.map(status => (
          <TabsContent key={status.key} value={status.key} className="mt-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ReportSkeleton key={i} />
                ))}
              </div>
            ) : filteredReports.filter(
                r => status.key === 'all' || r.status.toUpperCase() === status.key.toUpperCase()
              ).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredReports
                  .filter(
                    r => status.key === 'all' || r.status.toUpperCase() === status.key.toUpperCase()
                  )
                  .map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
              </div>
            ) : (
              <EmptyState status={status.key === 'all' ? undefined : status.label} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
