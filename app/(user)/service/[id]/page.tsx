import { Suspense } from 'react';
import ServiceDetail from '../components/ServiceDetail';

export default function ServiceDetailPage() {
  return (
    <div className="font-mann">
      <Suspense fallback={<div>Loading service...</div>}>
        <ServiceDetail />
      </Suspense>
    </div>
  );
}
