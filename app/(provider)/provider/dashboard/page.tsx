'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useProviderDashboardDefault,
  useProviderDashboardCurrentMonth,
  useProviderDashboardCurrentWeek,
} from '@/hooks/useProvider';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Star,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { formatDate } from '@/utils/numbers/formatDate';
import { ProviderDashboardResponseType } from '@/schemaValidations/provider.schema';

// Dashboard Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'danger':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
  };

  return (
    <Card className={`${getVariantStyles()} transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Date Range Selector Component
interface DateRangeSelectorProps {
  onRangeChange: (range: 'default' | 'week' | 'month' | 'custom') => void;
  onGranularityChange: (granularity: 'day' | 'week' | 'month') => void;
  currentRange: string;
  currentGranularity: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onRangeChange,
  onGranularityChange,
  currentRange,
  currentGranularity,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={currentRange} onValueChange={onRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chọn khoảng thời gian" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">30 ngày qua</SelectItem>
          <SelectItem value="week">Tuần hiện tại</SelectItem>
          <SelectItem value="month">Tháng hiện tại</SelectItem>
          <SelectItem value="custom">Tùy chỉnh</SelectItem>
        </SelectContent>
      </Select>

      <Select value={currentGranularity} onValueChange={onGranularityChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Độ chi tiết" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Theo ngày</SelectItem>
          <SelectItem value="week">Theo tuần</SelectItem>
          <SelectItem value="month">Theo tháng</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// Loading State Component
const DashboardLoading = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Error State Component
const DashboardError = ({ error, refetch }: { error: Error; refetch: () => void }) => (
  <Card className="border-destructive">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        Lỗi tải dữ liệu Dashboard
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground mb-4">
        {error.message || 'Đã xảy ra lỗi khi tải dữ liệu dashboard.'}
      </p>
      <Button onClick={refetch} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Thử lại
      </Button>
    </CardContent>
  </Card>
);

export default function ProviderDashboardPage() {
  const [dateRange, setDateRange] = useState<'default' | 'week' | 'month' | 'custom'>('default');
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  // Use different hooks based on selected date range
  const defaultDashboard = useProviderDashboardDefault();
  const weekDashboard = useProviderDashboardCurrentWeek();
  const monthDashboard = useProviderDashboardCurrentMonth();

  // Determine which query to use based on date range
  const getActiveQuery = () => {
    switch (dateRange) {
      case 'week':
        return weekDashboard;
      case 'month':
        return monthDashboard;
      default:
        return defaultDashboard;
    }
  };

  const { data, isLoading, error, refetch } = getActiveQuery();

  const handleRangeChange = (range: 'default' | 'week' | 'month' | 'custom') => {
    setDateRange(range);
  };

  const handleGranularityChange = (newGranularity: 'day' | 'week' | 'month') => {
    setGranularity(newGranularity);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Tổng quan hiệu suất dịch vụ của bạn</p>
          </div>
        </div>
        <DashboardLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Tổng quan hiệu suất dịch vụ của bạn</p>
          </div>
        </div>
        <DashboardError error={error} refetch={refetch} />
      </div>
    );
  }

  // Use actual API data or fallback to default values
  const dashboardData: ProviderDashboardResponseType = data || {
    range: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    bookings: {
      total: 0,
      byStatus: {
        PENDING: 0,
        CONFIRMED: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        WAIT_FOR_PAYMENT: 0,
      },
    },
    revenue: {
      totalPaid: 0,
      paidCount: 0,
    },
    rating: {
      avg: 0,
      count: 0,
    },
    customers: {
      unique: 0,
      repeat: 0,
    },
    serviceRequests: {
      PENDING: 0,
      WAIT_FOR_PAYMENT: 0,
      IN_PROGRESS: 0,
    },
    conversations: {
      conversationsWithUnread: 0,
      unreadTotal: 0,
    },
    wallet: {
      balance: 0,
    },
    withdrawals: {},
    series: {
      range: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      granularity: 'day',
      revenue: [],
      bookings: [],
    },
    topServices: [],
  };

  // Calculate completion rate
  const totalBookings = dashboardData.bookings.total;
  const completedBookings = dashboardData.bookings.byStatus.COMPLETED;
  const completionRate =
    totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hiệu suất dịch vụ của bạn</p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangeSelector
            onRangeChange={handleRangeChange}
            onGranularityChange={handleGranularityChange}
            currentRange={dateRange}
            currentGranularity={granularity}
          />
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng doanh thu"
          value={formatCurrency(dashboardData.revenue.totalPaid)}
          description="Tổng thu nhập trong kỳ"
          icon={<DollarSign />}
          variant="success"
        />
        <StatsCard
          title="Tổng đặt dịch vụ"
          value={dashboardData.bookings.total}
          description="Số đặt dịch vụ mới"
          icon={<Calendar />}
        />
        <StatsCard
          title="Đánh giá trung bình"
          value={dashboardData.rating.avg.toFixed(1)}
          description="Điểm hài lòng khách hàng"
          icon={<Star />}
          variant={dashboardData.rating.avg >= 4.5 ? 'success' : 'warning'}
        />
        <StatsCard
          title="Tỷ lệ hoàn thành"
          value={`${completionRate}%`}
          description="Dịch vụ hoàn thành thành công"
          icon={<CheckCircle />}
          variant={completionRate >= 90 ? 'success' : 'warning'}
        />
      </div>

      {/* Service Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Dịch vụ hoàn thành
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {dashboardData.bookings.byStatus.COMPLETED}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Đã hoàn thành</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Đang chờ xử lý
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {dashboardData.bookings.byStatus.PENDING +
                dashboardData.bookings.byStatus.IN_PROGRESS}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Đang chờ hoàn thành</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Dịch vụ bị hủy
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {dashboardData.bookings.byStatus.CANCELLED}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Đã hủy hoặc thất bại</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.customers.unique}</div>
            <p className="text-xs text-muted-foreground">Khách hàng mới</p>
            <div className="text-sm text-muted-foreground mt-1">
              {dashboardData.customers.repeat} khách hàng quay lại
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tin nhắn</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.conversations.unreadTotal}</div>
            <p className="text-xs text-muted-foreground">Tin nhắn chưa đọc</p>
            <div className="text-sm text-muted-foreground mt-1">
              {dashboardData.conversations.conversationsWithUnread} cuộc hội thoại
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ví tiền</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.wallet.balance)}</div>
            <p className="text-xs text-muted-foreground">Số dư hiện tại</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Xu hướng doanh thu
            </CardTitle>
            <CardDescription>Hiệu suất doanh thu theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Biểu đồ sẽ được hiển thị ở đây</p>
                <p className="text-sm">Phân tích doanh thu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Phân tích đặt dịch vụ
            </CardTitle>
            <CardDescription>Mô hình đặt dịch vụ và thông tin khách hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Biểu đồ sẽ được hiển thị ở đây</p>
                <p className="text-sm">Phân tích đặt dịch vụ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      {dashboardData.topServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dịch vụ phổ biến nhất</CardTitle>
            <CardDescription>Các dịch vụ được đặt nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topServices.map((service, index) => (
                <div
                  key={service.serviceId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.quantity} đơn đặt hàng
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{service.basePrice}</p>
                    <p className="text-xs text-muted-foreground">Giá cơ bản</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Các đặt dịch vụ và cập nhật dịch vụ mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Đặt dịch vụ mới</p>
                    <p className="text-sm text-muted-foreground">
                      Dịch vụ #{1234 + i} - Dọn dẹp nhà cửa
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">150.000đ</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
