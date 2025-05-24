'use client';

import { useTranslation } from 'react-i18next';
import ServiceDetail from './components/ServiceDetail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useService } from '@/hooks/useService';
// import ServiceShowcaseSkeleton from '@/components/serviceDetailSkeleton';

export default function Page({ params }: { params: { id: string } }) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useService(params.id);

  if (isLoading) return <div>{t('services.loading')}</div>;
  // <ServiceShowcaseSkeleton />

  if (error) return <div>{t('services.error', { error: error.message })}</div>;

  if (!data?.service) return <div>{t('services.not_found')}</div>;

  return (
    <>
      <Header />
      <ServiceDetail service={data.service} />
      <Footer />
    </>
  );
}
