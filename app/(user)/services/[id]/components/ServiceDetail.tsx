'use client';

import { Service } from '@/lib/api/services/fetchService';
import ServiceShowcase from './ServiceShowCase';
import ServiceDetailSection from './ServiceDetailSection';

type ServiceDetailProps = {
  service: Service;
};

export default function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ServiceShowcase service={service} />
      <ServiceDetailSection service={service} />
    </main>
  );
}
