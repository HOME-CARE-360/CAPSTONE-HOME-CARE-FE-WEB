'use client';

import {
  useGetStatisticsUsers,
  useGetStatisticsRolesUser,
  useGetReportMonth,
  useGetExportPDFMutipleMonth,
} from '@/hooks/useAdmin';
import { SiteHeader } from '@/app/(admin)/components/SiteHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  FileText,
  PieChart,
  BarChart,
  LineChart,
  Eye,
  Download,
  FileDown,
  RefreshCw,
} from 'lucide-react';
import { DataReportMonthResponseType } from '@/schemaValidations/admin.schema';
import { useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdminDashboardPage() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [activeTab, setActiveTab] = useState('overview');

  // PDF Export state
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(2025);
  const [endMonth, setEndMonth] = useState(12);
  const [endYear, setEndYear] = useState(2025);
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: statisticsUsers,
    isLoading: isLoadingStatisticsUsers,
    error: errorStatisticsUsers,
  } = useGetStatisticsUsers();

  const {
    data: statisticsRolesUser,
    isLoading: isLoadingStatisticsRolesUser,
    error: errorStatisticsRolesUser,
  } = useGetStatisticsRolesUser();

  const { data: dataReportMonth, isLoading: isLoadingReportMonth } = useGetReportMonth({
    year: selectedYear,
    month: selectedMonth,
  });

  const {
    data: pdfExportData,
    isLoading: isLoadingPDFExport,
    error: errorPDFExport,
    refetch: refetchPDFExport,
  } = useGetExportPDFMutipleMonth({
    startMonth,
    startYear,
    endMonth,
    endYear,
  });

  const isLoading = isLoadingStatisticsUsers || isLoadingStatisticsRolesUser;
  const hasError = errorStatisticsUsers || errorStatisticsRolesUser;

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Handle PDF export
  const handleExportPDF = async () => {
    if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
      toast.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
      return;
    }

    setIsExporting(true);
    try {
      await refetchPDFExport();
      if (pdfExportData?.data) {
        // Decode base64 string to binary data
        const binaryString = atob(pdfExportData.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create blob and download
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bao-cao-${startMonth}-${startYear}-den-${endMonth}-${endYear}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Xuất PDF thành công');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Có lỗi xảy ra khi xuất PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Prepare chart data
  const prepareUserStatisticsData = (report: DataReportMonthResponseType) => {
    return [
      { name: 'Tổng', value: report.userStatistics.totalUsers, color: '#0088FE' },
      { name: 'Mới', value: report.userStatistics.newUsers, color: '#00C49F' },
      { name: 'Hoạt động', value: report.userStatistics.activeUsers, color: '#FFBB28' },
      { name: 'Không hoạt động', value: report.userStatistics.inactiveUsers, color: '#FF8042' },
      { name: 'Bị cấm', value: report.userStatistics.blockedUsers, color: '#8884D8' },
    ];
  };

  const prepareUserTypesData = (report: DataReportMonthResponseType) => {
    return [
      { name: 'Khách hàng', value: report.usersByType.customers },
      { name: 'Nhà cung cấp', value: report.usersByType.serviceProviders },
      { name: 'Nhân viên', value: report.usersByType.staff },
      { name: 'Quản trị viên', value: report.usersByType.adminOnly },
    ];
  };

  const prepareActivityData = (report: DataReportMonthResponseType) => {
    return [
      { name: 'Đăng nhập', value: report.activitySummary.totalLogins },
      { name: 'Thiết bị', value: report.activitySummary.totalDevices },
      { name: 'Thông báo', value: report.activitySummary.totalNotifications },
    ];
  };

  const prepareTopUsersData = (report: DataReportMonthResponseType) => {
    return (
      report.topUsers
        ?.slice(0, 5)
        .map((user: { name: string; email: string; status: string }, index: number) => ({
          name: user.name,
          email: user.email,
          status: user.status,
          value: index + 1,
        })) || []
    );
  };

  // Get the report data for display
  const currentReport = dataReportMonth || null;

  return (
    <>
      <SiteHeader title="Dashboard" />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan về hệ thống và thống kê người dùng</p>
        </div>

        {hasError && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-2 p-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Lỗi tải dữ liệu</p>
                <p className="text-sm text-muted-foreground">
                  Không thể tải thống kê dashboard. Vui lòng thử lại sau.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!hasError && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Báo cáo
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Xuất PDF
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Users */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {statisticsUsers?.data?.totals?.users || 0}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Tất cả người dùng trong hệ thống
                    </p>
                  </CardContent>
                </Card>

                {/* Active Users */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-green-600">
                        {statisticsUsers?.data?.totals?.active || 0}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Người dùng đang hoạt động</p>
                  </CardContent>
                </Card>

                {/* Inactive Users */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Người dùng không hoạt động
                    </CardTitle>
                    <UserX className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-orange-600">
                        {statisticsUsers?.data?.totals?.inactive || 0}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Người dùng không hoạt động</p>
                  </CardContent>
                </Card>

                {/* Blocked Users */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Người dùng bị cấm</CardTitle>
                    <Shield className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-red-600">
                        {statisticsUsers?.data?.totals?.blocked || 0}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Người dùng bị cấm</p>
                  </CardContent>
                </Card>
              </div>

              {/* User Types */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-blue-600">
                        {statisticsUsers?.data?.types?.customers || 0}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Tổng số khách hàng</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nhà cung cấp</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-purple-600">
                        {statisticsUsers?.data?.types?.serviceProviders || 0}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Tổng số nhà cung cấp</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
                    <Activity className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-green-600">
                        {statisticsUsers?.data?.types?.staff || 0}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Tổng số nhân viên</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
                    <Shield className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-red-600">
                        {statisticsUsers?.data?.types?.adminOnly || 0}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Tổng số quản trị viên</p>
                  </CardContent>
                </Card>
              </div>

              {/* Role Statistics */}
              {statisticsRolesUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Thống kê vai trò người dùng
                    </CardTitle>
                    <CardDescription>
                      Phân bố người dùng theo vai trò trong hệ thống
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      Dữ liệu vai trò người dùng
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              {/* Date Selection Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Chọn thời gian báo cáo
                  </CardTitle>
                  <CardDescription>Chọn năm và tháng để xem báo cáo chi tiết</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="year">Năm</Label>
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={value => setSelectedYear(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="month">Tháng</Label>
                      <Select
                        value={selectedMonth.toString()}
                        onValueChange={value => setSelectedMonth(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tháng" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Data Display */}
              {isLoadingReportMonth ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : currentReport ? (
                <div className="space-y-6">
                  {/* Report Header */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Báo cáo tháng {currentReport.month}/{currentReport.year}
                      </CardTitle>
                      <CardDescription>
                        Dữ liệu chi tiết về người dùng và hoạt động trong tháng
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Charts Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* User Statistics Bar Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart className="h-4 w-4" />
                          Thống kê người dùng
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsBarChart data={prepareUserStatisticsData(currentReport)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* User Types Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-4 w-4" />
                          Phân loại người dùng
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={prepareUserTypesData(currentReport)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareUserTypesData(currentReport).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Activity Summary Area Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LineChart className="h-4 w-4" />
                          Tóm tắt hoạt động
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={prepareActivityData(currentReport)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.6}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Top Users Bar Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Người dùng hàng đầu
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsBarChart data={prepareTopUsersData(currentReport)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82CA9D" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Data Tables */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Thống kê người dùng</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Tổng:</span>
                          <span className="font-medium">
                            {currentReport.userStatistics.totalUsers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Mới:</span>
                          <span className="font-medium text-green-600">
                            {currentReport.userStatistics.newUsers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Hoạt động:</span>
                          <span className="font-medium text-blue-600">
                            {currentReport.userStatistics.activeUsers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Không hoạt động:</span>
                          <span className="font-medium text-orange-600">
                            {currentReport.userStatistics.inactiveUsers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Bị cấm:</span>
                          <span className="font-medium text-red-600">
                            {currentReport.userStatistics.blockedUsers}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Phân loại người dùng</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Khách hàng:</span>
                          <span className="font-medium">{currentReport.usersByType.customers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Nhà cung cấp:</span>
                          <span className="font-medium">
                            {currentReport.usersByType.serviceProviders}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Nhân viên:</span>
                          <span className="font-medium">{currentReport.usersByType.staff}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Quản trị viên:</span>
                          <span className="font-medium">{currentReport.usersByType.adminOnly}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Tóm tắt hoạt động</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Đăng nhập:</span>
                          <span className="font-medium">
                            {currentReport.activitySummary.totalLogins}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Thiết bị:</span>
                          <span className="font-medium">
                            {currentReport.activitySummary.totalDevices}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Thông báo:</span>
                          <span className="font-medium">
                            {currentReport.activitySummary.totalNotifications}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Users List */}
                  {currentReport.topUsers && currentReport.topUsers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Người dùng hàng đầu</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {currentReport.topUsers
                            .slice(0, 5)
                            .map(
                              (
                                user: { name: string; email: string; status: string },
                                userIndex: number
                              ) => (
                                <div
                                  key={userIndex}
                                  className="flex items-center justify-between p-2 border rounded"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                      {user.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{user.name}</p>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant={user.status === 'active' ? 'default' : 'secondary'}
                                  >
                                    {user.status}
                                  </Badge>
                                </div>
                              )
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Không có dữ liệu báo cáo</h3>
                    <p className="text-muted-foreground text-center">
                      Không tìm thấy dữ liệu báo cáo cho tháng {selectedMonth}/{selectedYear}.
                      <br />
                      Vui lòng thử chọn thời gian khác.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Export PDF Tab */}
            <TabsContent value="export" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileDown className="h-5 w-5" />
                    Xuất báo cáo PDF
                  </CardTitle>
                  <CardDescription>
                    Chọn khoảng thời gian để xuất báo cáo PDF chi tiết
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Range Selection */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Start Date */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Thời gian bắt đầu</Label>
                        <p className="text-sm text-muted-foreground">
                          Chọn tháng và năm bắt đầu cho báo cáo
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="startMonth">Tháng</Label>
                          <Select
                            value={startMonth.toString()}
                            onValueChange={value => setStartMonth(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tháng" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map(month => (
                                <SelectItem key={month.value} value={month.value.toString()}>
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startYear">Năm</Label>
                          <Select
                            value={startYear.toString()}
                            onValueChange={value => setStartYear(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn năm" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Thời gian kết thúc</Label>
                        <p className="text-sm text-muted-foreground">
                          Chọn tháng và năm kết thúc cho báo cáo
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="endMonth">Tháng</Label>
                          <Select
                            value={endMonth.toString()}
                            onValueChange={value => setEndMonth(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tháng" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map(month => (
                                <SelectItem key={month.value} value={month.value.toString()}>
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endYear">Năm</Label>
                          <Select
                            value={endYear.toString()}
                            onValueChange={value => setEndYear(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn năm" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Export Summary */}
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Tóm tắt xuất báo cáo</h4>
                          <p className="text-sm text-muted-foreground">
                            Báo cáo từ tháng {startMonth}/{startYear} đến tháng {endMonth}/{endYear}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          {(() => {
                            const monthsDiff =
                              (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
                            return `${monthsDiff} tháng`;
                          })()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Export Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleExportPDF}
                      disabled={isExporting || isLoadingPDFExport}
                      className="flex items-center gap-2"
                    >
                      {isExporting || isLoadingPDFExport ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {isExporting || isLoadingPDFExport ? 'Đang xuất...' : 'Xuất PDF'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setStartMonth(1);
                        setStartYear(new Date().getFullYear());
                        setEndMonth(12);
                        setEndYear(new Date().getFullYear());
                      }}
                    >
                      Đặt lại
                    </Button>
                  </div>

                  {/* Error Display */}
                  {errorPDFExport && (
                    <Card className="border-destructive bg-destructive/10">
                      <CardContent className="flex items-center gap-2 p-4">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <div>
                          <p className="font-medium text-destructive">Lỗi xuất PDF</p>
                          <p className="text-sm text-muted-foreground">
                            Có lỗi xảy ra khi tạo báo cáo PDF. Vui lòng thử lại.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Success Message */}
                  {pdfExportData?.success && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="flex items-center gap-2 p-4">
                        <FileDown className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">Xuất PDF thành công</p>
                          <p className="text-sm text-green-600">
                            Báo cáo PDF đã được tạo và tải xuống.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
