'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface WorkLogCardProps {
  workLog: {
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
  };
}

export function WorkLogCard({ workLog }: WorkLogCardProps) {
  const getStatusInfo = () => {
    if (workLog.checkIn && workLog.checkOut) {
      return {
        status: 'completed',
        label: 'Hoàn thành',
        icon: CheckCircle,
      };
    } else if (workLog.checkIn && !workLog.checkOut) {
      return {
        status: 'in-progress',
        label: 'Đang làm việc',
        icon: AlertCircle,
      };
    } else {
      return {
        status: 'pending',
        label: 'Chờ bắt đầu',
        icon: Clock,
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm - dd/MM/yyyy', { locale: vi });
  };

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: vi,
    });
  };

  return (
    <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Booking #{workLog.booking.id}</h3>
              <p className="text-sm text-gray-500">Tạo {getTimeAgo(workLog.createdAt)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Ngày tạo:</span>
            </div>
            <p className="font-medium text-gray-900">{formatDateTime(workLog.createdAt)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Trạng thái booking:</span>
            </div>
            <Badge variant="outline" className="capitalize border-gray-200 text-gray-700">
              {workLog.booking.status.toLowerCase()}
            </Badge>
          </div>
        </div>

        {(workLog.checkIn || workLog.checkOut) && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Thời gian làm việc</h4>
            <div className="space-y-2">
              {workLog.checkIn && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Check-in</span>
                  </div>
                  <span className="text-sm text-gray-600">{formatDateTime(workLog.checkIn)}</span>
                </div>
              )}

              {workLog.checkOut && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Check-out</span>
                  </div>
                  <span className="text-sm text-gray-600">{formatDateTime(workLog.checkOut)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {workLog.note && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Ghi chú</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {workLog.note}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!workLog.checkIn && (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-700 rounded-md py-2 text-sm font-medium border border-gray-200">
              Todo
            </div>
          )}

          {workLog.checkOut && (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-700 rounded-md py-2 text-sm font-medium border border-gray-200">
              <span className="mr-2">✔️</span>
              Đã check out
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
