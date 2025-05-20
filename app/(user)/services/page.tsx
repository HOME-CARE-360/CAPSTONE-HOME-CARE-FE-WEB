'use client';

import ServicesListings from './components/ServicesListings';
import SearchFilter from './components/SearchFilter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ServicesPage() {
  return (
    <div className="font-mann">
      <Header />
      <SearchFilter />
      <ServicesListings />
      <Footer />
    </div>
  );
}
