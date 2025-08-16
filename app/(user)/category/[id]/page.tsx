import { Suspense } from 'react';
import CategoryServices from '../components/CategoryServices';

export default function CategoryServicesPage() {
  return (
    <div className="font-mann">
      <Suspense fallback={<div>Loading services...</div>}>
        <CategoryServices />
      </Suspense>
    </div>
  );
}
