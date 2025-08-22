'use client';

import { useParams } from 'next/navigation';
import { useService, useServices } from '@/hooks/useService';
import { useCategories } from '@/hooks/useCategory';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { useGetServiceProviderInformation } from '@/hooks/useUser';
import Link from 'next/link';
import { ServiceCard } from '@/components/ServiceCard';
import type { Service as ServiceForCard } from '@/lib/api/services/fetchService';
import { useMemo } from 'react';

export default function ServiceDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data, isLoading, isError } = useService(id);
  const service = data?.service;
  const { data: categoriesData } = useCategories();

  // Compute IDs early and call hooks unconditionally to preserve hook order
  const providerId: number | undefined =
    typeof service?.providerId === 'number' ? service?.providerId : undefined;
  const relatedCategoryId: number | undefined = useMemo(() => {
    // Try to match by category name
    const categoryName = service?.Category?.name?.trim();
    if (!categoryName || !categoriesData?.categories) return undefined;

    const list = categoriesData.categories || [];
    const found = list.find(c => c.name.trim().toLowerCase() === categoryName.toLowerCase());
    return found?.id;
  }, [service?.Category?.name, categoriesData]);

  const { data: providerData, isLoading: isProviderLoading } = useGetServiceProviderInformation(
    (providerId as number) ?? 0
  );
  const excludeServiceId: number | undefined =
    service && typeof service.id === 'number' ? service.id : undefined;
  const { data: relatedData, isLoading: isRelatedLoading } = useServiceRelated(
    relatedCategoryId,
    excludeServiceId
  );

  if (isLoading) {
    return (
      <section className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full aspect-square rounded-2xl" />
          <div>
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-80 mb-2" />
            <Skeleton className="h-4 w-72 mb-2" />
          </div>
        </div>
      </section>
    );
  }

  if (isError || !service) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        Không thể tải chi tiết dịch vụ
      </div>
    );
  }

  return (
    <section className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image
            src={service.images?.[0] || '/placeholder-service.jpg'}
            alt={service.name}
            fill
            className="object-cover rounded-2xl"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-semibold">
              {formatCurrency(
                (service.virtualPrice ?? 0) > 0 ? service.virtualPrice : service.basePrice
              )}
            </span>
            {(service.virtualPrice ?? 0) > 0 && service.virtualPrice < service.basePrice && (
              <span className="text-muted-foreground line-through">
                {formatCurrency(service.basePrice)}
              </span>
            )}
            {(service.virtualPrice ?? 0) === 0 && (
              <span className="text-lg text-green-600 font-medium">Miễn phí</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4" />
            <span>{service.durationMinutes} phút</span>
          </div>
          <div className="mb-4">
            {service.Category?.name && <Badge variant="outline">{service.Category.name}</Badge>}
          </div>
          <p className="text-muted-foreground mb-6">{service.description}</p>

          <Link href={`/booking/${service.id}`}>
            <Button size="lg">Đặt lịch</Button>
          </Link>

          {/* Provider Info under the button */}
          {providerId && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Nhà cung cấp</h2>
              <div className="flex items-center gap-4 p-4 border rounded-xl bg-card">
                {isProviderLoading ? (
                  <>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                  </>
                ) : providerData?.data ? (
                  <>
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {providerData.data.serviceProvider.logo ? (
                        <Image
                          src={providerData.data.serviceProvider.logo}
                          alt={providerData.data.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{providerData.data.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {providerData.data.serviceProvider.address}
                      </div>
                    </div>
                    <Link
                      href={`/service-provider/${providerData.data.serviceProvider.id}`}
                      className="text-primary underline text-sm"
                    >
                      Xem nhà cung cấp
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Services */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {service?.Category?.name
            ? `Dịch vụ cùng danh mục: ${service.Category.name}`
            : 'Dịch vụ khác'}
        </h2>
        {isRelatedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden transition-all duration-300 flex flex-col">
                <div className="relative aspect-square size-full mb-2">
                  <Skeleton className="absolute inset-0 rounded-2xl" />
                </div>
                <div className="px-1">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="mb-2">
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                  <div className="mb-2">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {((relatedData?.services as ServiceForCard[]) || []).length > 0 ? (
              ((relatedData?.services as ServiceForCard[]) || []).map(
                (s: ServiceForCard, index: number) => (
                  <ServiceCard key={s.id} service={s} priority={index < 2} />
                )
              )
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Không có dịch vụ liên quan nào
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Hook for related services by category, excluding current service
function useServiceRelated(categoryId: number | undefined, excludeServiceId: number | undefined) {
  const filters = useMemo(() => {
    const f: { categories?: number[]; page?: number; limit?: number } = {};
    // If we have a categoryId, filter by category, otherwise get general services
    if (typeof categoryId === 'number' && categoryId >= 0) {
      f.categories = [categoryId];
    }
    f.page = 1;
    f.limit = 6;
    return f;
  }, [categoryId]);

  const query = useServices(filters);

  // Filter out the current service from results
  if (query.data?.services && typeof excludeServiceId === 'number') {
    query.data.services = query.data.services.filter(s => s.id !== excludeServiceId);
  }

  return query;
}
