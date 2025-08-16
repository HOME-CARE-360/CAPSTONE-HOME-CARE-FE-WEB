'use client';

import { Suspense } from 'react';
import CategoriesListings from './components/CategoriesListings';

export default function ServicesPage() {
  return (
    <div className="font-mann">
      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoriesListings />
      </Suspense>
    </div>
  );
}
