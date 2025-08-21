'use client';

import { useGetTopDiscountedServices } from '@/hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ServiceCard } from '@/components/ServiceCard';

// Interface for transformed service to match ServiceCard requirements
interface TransformedService {
  id: number;
  name: string;
  images: string[];
  basePrice: number;
  virtualPrice: number;
  durationMinutes: number;
  description: string;
  status: string;
  Category: { name: string; logo: string };
  provider: string;
  providerId: number;
}

export function TopDiscountedServices() {
  const { data, isLoading, error } = useGetTopDiscountedServices();
  const services = data?.data.items ?? [];

  if (error) {
    return null; // Fail silently for landing page
  }

  if (isLoading) {
    return (
      <section className="py-12 ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Transform TopDiscountedService to match Service interface
  const transformedServices: TransformedService[] = services.map(service => ({
    id: service.id,
    name: service.name,
    images: service.images,
    basePrice: service.basePrice,
    virtualPrice: service.virtualPrice,
    durationMinutes: service.durationMinutes,
    description: service.description,
    status: 'ACCEPTED',
    Category: { name: service.category.name, logo: '' },
    provider: service.provider.name,
    providerId: service.provider.id,
    // Add any other required fields
  }));

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Dịch vụ giảm giá tốt nhất</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Khám phá các dịch vụ chất lượng với mức giá ưu đãi đặc biệt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformedServices.map((service, index) => (
            <div key={service.id} className="relative group">
              {/* Category Badge Overlay */}
              <div className="absolute top-4 right-4 z-20">
                <Badge variant="secondary" className="bg-white/90 text-slate-700 shadow-lg">
                  {services[index].category.name}
                </Badge>
              </div>

              <ServiceCard service={service} priority={index < 3} size="md" />
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Không có dịch vụ giảm giá nào</p>
          </div>
        )}
      </div>
    </section>
  );
}
