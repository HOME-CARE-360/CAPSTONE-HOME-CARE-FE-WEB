'use client';

import { Suspense } from 'react';
import ServicesListings from './components/ServicesListings';

export default function ServicesPage() {
  return (
    <div className="font-mann">
      <Suspense fallback={<div>Loading services...</div>}>
        <ServicesListings />
      </Suspense>
    </div>
  );
}
