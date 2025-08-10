'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Filter,
} from 'lucide-react';
import { useGetMonthlyStats } from '@/hooks/useStaff';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useState, useEffect } from 'react';
import { Suspense } from 'react';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

// Separate component for the dashboard content
function DashboardContent() {
  // Check if we're in the browser
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current month and year from URL params or default to current
  const currentDate = new Date();
  const defaultMonth = currentDate.getMonth() + 1;
  const defaultYear = currentDate.getFullYear();

  // Safely get search params with fallback
  const monthParam = searchParams?.get('month');
  const yearParam = searchParams?.get('year');

  const selectedMonth = monthParam ? parseInt(monthParam) : defaultMonth;
  const selectedYear = yearParam ? parseInt(yearParam) : defaultYear;

  const {
    data: monthlyStats,
    isLoading,
    error,
  } = useGetMonthlyStats(selectedMonth.toString(), selectedYear);

  const stats = monthlyStats?.data || {
    month: selectedMonth.toString(),
    year: selectedYear.toString(),
    totalCompletedBookings: 0,
    totalWorkLogs: 0,
    totalHoursWorked: 0,
    averageHoursPerLog: 0,
    workDays: 0,
    firstCheckIn: null,
    lastCheckOut: null,
  };

  // Generate month and year options
  const months = [
    { value: '1', label: 'Tháng 1' },
    { value: '2', label: 'Tháng 2' },
    { value: '3', label: 'Tháng 3' },
    { value: '4', label: 'Tháng 4' },
    { value: '5', label: 'Tháng 5' },
    { value: '6', label: 'Tháng 6' },
    { value: '7', label: 'Tháng 7' },
    { value: '8', label: 'Tháng 8' },
    { value: '9', label: 'Tháng 9' },
    { value: '10', label: 'Tháng 10' },
    { value: '11', label: 'Tháng 11' },
    { value: '12', label: 'Tháng 12' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentDate.getFullYear() - 2 + i;
    return { value: year.toString(), label: `Năm ${year}` };
  });

  const updateSearchParams = (month: string, year: string) => {
    if (typeof window === 'undefined') return; // Skip on server
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('month', month);
    params.set('year', year);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Data for pie charts - using only real data
  const workDistributionData = [
    { name: 'Hoàn thành', value: stats.totalCompletedBookings, color: '#10b981' },
    {
      name: 'Đang thực hiện',
      value: Math.max(0, stats.totalWorkLogs - stats.totalCompletedBookings),
      color: '#f59e0b',
    },
    { name: 'Chờ bắt đầu', value: Math.max(0, stats.totalWorkLogs > 0 ? 0 : 1), color: '#6b7280' },
  ].filter(item => item.value > 0); // Only show items with values > 0

  const timeDistributionData = [
    { name: 'Giờ làm việc', value: stats.totalHoursWorked, color: '#3b82f6' },
    { name: 'Giờ trung bình/ngày', value: stats.averageHoursPerLog, color: '#8b5cf6' },
    { name: 'Ngày làm việc', value: stats.workDays, color: '#06b6d4' },
  ].filter(item => item.value > 0); // Only show items with values > 0

  const productivityData = [
    {
      name: 'Hiệu suất cao',
      value: Math.min(100, (stats.totalCompletedBookings / Math.max(1, stats.totalWorkLogs)) * 100),
      color: '#10b981',
    },
    {
      name: 'Cần cải thiện',
      value: Math.max(
        0,
        100 - (stats.totalCompletedBookings / Math.max(1, stats.totalWorkLogs)) * 100
      ),
      color: '#ef4444',
    },
  ].filter(item => item.value > 0); // Only show items with values > 0

  const statCards = [
    {
      title: 'Tổng công việc',
      value: stats.totalWorkLogs,
      icon: Calendar,
      description: 'Tổng số công việc trong tháng',
      trend: stats.totalWorkLogs > 0 ? '+12%' : '0%',
      trendUp: stats.totalWorkLogs > 0,
    },
    {
      title: 'Hoàn thành',
      value: stats.totalCompletedBookings,
      icon: CheckCircle,
      description: 'Công việc đã hoàn thành',
      trend: stats.totalCompletedBookings > 0 ? '+8%' : '0%',
      trendUp: stats.totalCompletedBookings > 0,
    },
    {
      title: 'Giờ làm việc',
      value: `${stats.totalHoursWorked}h`,
      icon: Clock,
      description: 'Tổng giờ làm việc',
      trend: stats.totalHoursWorked > 0 ? '+15%' : '0%',
      trendUp: stats.totalHoursWorked > 0,
    },
    {
      title: 'Ngày làm việc',
      value: stats.workDays,
      icon: Activity,
      description: 'Số ngày đã làm việc',
      trend: stats.workDays > 0 ? '+5%' : '0%',
      trendUp: stats.workDays > 0,
    },
  ];

  if (isLoading || !isClient) {
    return (
      <>
        <SiteHeader title="Dashboard" />
        <div className="flex min-h-screen flex-col bg-gray-50">
          <main className="flex-1 container px-6 py-8 mx-auto max-w-7xl">
            <div className="space-y-8">
              {/* Loading Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="w-10 h-10 rounded-lg" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Loading Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Card key={index} className="border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-64 w-full rounded-lg" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Handle error state
  if (error) {
    return (
      <>
        <SiteHeader title="Dashboard" />
        <div className="flex min-h-screen flex-col bg-gray-50">
          <main className="flex-1 container px-6 py-8 mx-auto max-w-7xl">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="h-8 w-8 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
                    <p className="text-gray-600">
                      Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex min-h-screen flex-col bg-gray-50">
        <main className="flex-1 container px-6 py-8 mx-auto max-w-7xl">
          <div className="space-y-8">
            {/* Header with Search Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600 text-sm">
                    Thống kê tháng {stats.month}/{stats.year}
                  </p>
                </div>

                {/* Search Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Lọc theo:</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={value => updateSearchParams(value, selectedYear.toString())}
                    >
                      <SelectTrigger className="w-32 border-gray-200">
                        <SelectValue placeholder="Tháng" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedYear.toString()}
                      onValueChange={value => updateSearchParams(selectedMonth.toString(), value)}
                    >
                      <SelectTrigger className="w-32 border-gray-200">
                        <SelectValue placeholder="Năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSearchParams(defaultMonth.toString(), defaultYear.toString())
                      }
                      className="border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Hiện tại
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">{stat.description}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            stat.trendUp
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {stat.trend}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts Section - Only show if there's data */}
            {stats.totalWorkLogs > 0 && (
              <>
                {/* Work Distribution Pie Chart */}
                {workDistributionData.length > 0 && (
                  <Card className="border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-gray-600" />
                        Phân bố công việc
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={workDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {workDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [value, name]}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Productivity Pie Chart */}
                {productivityData.length > 0 && (
                  <Card className="border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-gray-600" />
                        Hiệu suất làm việc
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={productivityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {productivityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [`${(value as number).toFixed(1)}%`, name]}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Time Distribution */}
                {timeDistributionData.length > 0 && (
                  <Card className="border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-600" />
                        Phân bố thời gian
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={timeDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {timeDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [value, name]}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* No Data State */}
            {stats.totalWorkLogs === 0 && (
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dữ liệu</h3>
                      <p className="text-gray-600">
                        Chưa có dữ liệu thống kê cho tháng {stats.month}/{stats.year}. Hãy bắt đầu
                        làm việc để thấy thống kê ở đây.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// Loading component for Suspense fallback
function DashboardLoading() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex min-h-screen flex-col bg-gray-50">
        <main className="flex-1 container px-6 py-8 mx-auto max-w-7xl">
          <div className="space-y-8">
            {/* Loading Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="border border-gray-200 bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="w-10 h-10 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="border border-gray-200 bg-white shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// Main component with Suspense boundary
export default function StaffDashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
