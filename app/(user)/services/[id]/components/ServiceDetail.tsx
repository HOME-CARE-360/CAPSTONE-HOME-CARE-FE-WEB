'use client';

import { Service } from '@/lib/api/services/fetchService';
import ServiceShowcase from './ServiceShowCase';
import ServiceDetailSection from './ServiceDetailSection';

type ServiceDetailProps = {
  service: Service;
};

export default function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background text-foreground">
        <ServiceShowcase service={service} />
        <ServiceDetailSection service={service} />
      </div>
    </div>
  );
}
