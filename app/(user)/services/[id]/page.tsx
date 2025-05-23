'use client';

import ServiceDetail from './components/ServiceDetail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useService } from '@/hooks/useService';
// import ServiceShowcaseSkeleton from '@/components/serviceDetailSkeleton';

export default function Page({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useService(params.id);

  if (isLoading) return <div>Loading...</div>;
  // <ServiceShowcaseSkeleton />

  if (error) return <div>Error: {error.message}</div>;

  if (!data?.service) return <div>Service not found</div>;

  return (
    <>
      <Header />
      <ServiceDetail service={data.service} />
      <Footer />
    </>
  );
}
