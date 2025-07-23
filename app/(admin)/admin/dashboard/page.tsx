'use client';

import { useGetStatisticsUsers, useGetStatisticsRolesUser } from '@/hooks/useAdmin';
import { SiteHeader } from '@/app/(admin)/components/SiteHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
  Activity,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

type StatisticsData = {
  totals: {
    users: number;
    active: number;
    inactive: number;
    blocked: number;
  };
  types: {
    customers: number;
    serviceProviders: number;
    staff: number;
    adminOnly: number;
  };
};

type RolesData = {
  roles: Array<{
    id: number;
    name: string;
    userCount: number;
    percentage: number;
  }>;
};
export default function AdminDashboardPage() {
  const {
    data: statisticsUsers,
    isLoading: isLoadingStatisticsUsers,
    error: errorStatisticsUsers,
  } = useGetStatisticsUsers() as {
    data: StatisticsData | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const {
    data: statisticsRolesUser,
    isLoading: isLoadingStatisticsRolesUser,
    error: errorStatisticsRolesUser,
  } = useGetStatisticsRolesUser() as {
    data: RolesData | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const isLoading = isLoadingStatisticsUsers || isLoadingStatisticsRolesUser;
  const hasError = errorStatisticsUsers || errorStatisticsRolesUser;

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
          <>
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
                    <div className="text-2xl font-bold">{statisticsUsers?.totals?.users || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground">Tất cả người dùng trong hệ thống</p>
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
                      {statisticsUsers?.totals?.active || 0}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Người dùng đang hoạt động</p>
                </CardContent>
              </Card>

              {/* Inactive Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Người dùng không hoạt động</CardTitle>
                  <UserX className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-orange-600">
                      {statisticsUsers?.totals?.inactive || 0}
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
                      {statisticsUsers?.totals?.blocked || 0}
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
                      {statisticsUsers?.types?.customers || 0}
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
                      {statisticsUsers?.types?.serviceProviders || 0}
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
                      {statisticsUsers?.types?.staff || 0}
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
                      {statisticsUsers?.types?.adminOnly || 0}
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
                  <CardDescription>Phân bố người dùng theo vai trò trong hệ thống</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {statisticsRolesUser?.roles?.map(role => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <div>
                            <p className="font-medium">{role.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {role.userCount} người dùng
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{role.percentage.toFixed(1)}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
