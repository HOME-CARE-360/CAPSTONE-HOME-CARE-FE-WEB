'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { WorkLogList } from './WorkLogList';

interface WorkLogStatsProps {
  workLogs: Array<{
    id: number;
    checkIn?: string | null;
    checkOut?: string | null;
    note?: string | null;
    createdAt: string;
    booking: {
      id: number;
      status: string;
      createdAt: string;
    };
  }>;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function WorkLogStats({ workLogs, isLoading = false, onRefresh }: WorkLogStatsProps) {
  const stats = {
    total: workLogs.length,
    completed: workLogs.filter(log => log.checkIn && log.checkOut).length,
    inProgress: workLogs.filter(log => log.checkIn && !log.checkOut).length,
    pending: workLogs.filter(log => !log.checkIn && !log.checkOut).length,
  };

  const statCards = [
    {
      title: 'Tổng công việc',
      value: stats.total,
      icon: Users,
      description: 'Tổng số công việc đã được giao',
    },
    {
      title: 'Hoàn thành',
      value: stats.completed,
      icon: CheckCircle,
      description: 'Công việc đã hoàn thành',
    },
    {
      title: 'Đang làm việc',
      value: stats.inProgress,
      icon: AlertCircle,
      description: 'Công việc đang thực hiện',
    },
    {
      title: 'Chờ bắt đầu',
      value: stats.pending,
      icon: Clock,
      description: 'Công việc chờ bắt đầu',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <WorkLogList workLogs={workLogs} isLoading={isLoading} onRefresh={onRefresh} />
    </div>
  );
}
