'use client';

import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { WorkLogStats } from './components/WorkLogStats';
import { useGetWorkLog } from '@/hooks/useStaff';

export default function StaffReviewsPage() {
  const { data: workLogData, isLoading, refetch } = useGetWorkLog();

  const handleRefresh = () => {
    refetch();
  };

  const workLogs = workLogData?.data?.workLogs || [];

  return (
    <>
      <SiteHeader title="Quản lý lịch làm việc" />
      <div className="flex min-h-screen flex-col bg-gray-50">
        <main className="flex-1 container px-6 py-8 mx-auto max-w-7xl">
          <div className="space-y-8">
            <WorkLogStats workLogs={workLogs} isLoading={isLoading} onRefresh={handleRefresh} />
          </div>
        </main>
      </div>
    </>
  );
}
