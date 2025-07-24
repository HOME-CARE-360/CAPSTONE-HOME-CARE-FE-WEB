'use client';

import { BookingKanban } from './components/BookingKanban';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';

export default function StaffBookingPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <SiteHeader title="Quản lý đặt lịch" />
      <div className="flex min-h-screen flex-col bg-gray-50/30">
        <main className="flex-1 container px-6 py-8 mx-auto max-w-7xl">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">Quản lý đặt lịch</h1>
                </div>
                <p className="text-gray-600 text-sm">
                  Quản lý và xử lý các yêu cầu đặt lịch từ khách hàng
                </p>
              </div>

              <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </Button>
            </div>

            {/* Main Kanban Content */}
            <BookingKanban onRefresh={handleRefresh} />
          </div>
        </main>
      </div>
    </>
  );
}
