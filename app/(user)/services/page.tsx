'use client';

import { Suspense } from 'react';
import ServicesListings from './components/ServicesListings';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ServicesPage() {
  return (
    <div className="font-mann">
      <Header />
      <Suspense fallback={<div>Loading services...</div>}>
        <ServicesListings />
      </Suspense>
      <Footer />
    </div>
  );
}
