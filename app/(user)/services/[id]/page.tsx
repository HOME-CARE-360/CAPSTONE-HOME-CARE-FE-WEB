'use client';

import ServiceDetail from './components/ServiceDetail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useService } from '@/hooks/useService';
// import ServiceShowcaseSkeleton from '@/components/serviceDetailSkeleton';

export default function Page({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useService(params.id);

  if (isLoading) return <div>Đang tải...</div>;
  // <ServiceShowcaseSkeleton />

  if (error) return <div>Lỗi: {error.message}</div>;

  if (!data?.service) return <div>Không tìm thấy dịch vụ</div>;

  return (
    <>
      <Header />
      <ServiceDetail service={data.service} />
      <Footer />
    </>
  );
}
