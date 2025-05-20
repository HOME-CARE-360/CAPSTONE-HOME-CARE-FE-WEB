'use client';

import ServiceDetail from './components/ServiceDetail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useService } from '@/hooks/useService';
// import ServiceShowcaseSkeleton from '@/components/serviceDetailSkeleton';
import { Service } from '@/lib/api/services/fetchService';

export default function Page({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useService(params.id);

  if (isLoading) return <div>Loading...</div>;
  // <ServiceShowcaseSkeleton />

  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <Header />
      <ServiceDetail service={data?.data as Service} />
      <Footer />
    </>
  );
}
