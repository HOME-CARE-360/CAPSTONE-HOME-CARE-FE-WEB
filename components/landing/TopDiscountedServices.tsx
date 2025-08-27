'use client';

import { useCallback, useMemo, useState } from 'react';
import { useGetTopDiscountedServices } from '@/hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/ServiceCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(services.length / pageSize));
  const [page, setPage] = useState(0);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const visibleIndexes = useMemo(() => {
    const start = page * pageSize;
    return [start, start + 1, start + 2, start + 3];
  }, [page]);

  const goPrev = useCallback(() => {
    if (canPrev) setPage(p => Math.max(0, p - 1));
  }, [canPrev]);

  const goNext = useCallback(() => {
    if (canNext) setPage(p => Math.min(totalPages - 1, p + 1));
  }, [canNext, totalPages]);

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

        {/* Carousel Row */}
        <div className="relative">
          {/* Left control (stick to left) */}
          <div className="absolute -left-12 top-1/4 z-20">
            <Button
              variant="outline"
              size="icon"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Xem trước"
              className="rounded-full shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Visible items (4 per view) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleIndexes.map((idx, i) => {
              const svc = transformedServices[idx];
              if (!svc) return <div key={`empty-${i}`} />;
              return (
                <div key={svc.id} className="relative group">
                  <div className="absolute top-4 right-4 z-20">
                    <Badge variant="secondary" className="bg-white/90 text-slate-700 shadow-lg">
                      {services[idx]?.category?.name}
                    </Badge>
                  </div>
                  <ServiceCard service={svc} priority={idx < 4} size="md" />
                </div>
              );
            })}
          </div>

          {/* Right control */}
          <div className="absolute -right-12 top-1/4 z-20">
            <Button
              variant="outline"
              size="icon"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Xem thêm"
              className="rounded-full shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page indicators */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`h-2 w-2 rounded-full ${i === page ? 'bg-slate-900' : 'bg-slate-300'}`}
                onClick={() => setPage(i)}
                aria-label={`Tới trang ${i + 1}`}
              />
            ))}
          </div>
        )}

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Không có dịch vụ giảm giá nào</p>
          </div>
        )}
      </div>
    </section>
  );
}
