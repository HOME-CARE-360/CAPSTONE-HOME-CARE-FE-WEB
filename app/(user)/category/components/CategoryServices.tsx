'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useServices } from '@/hooks/useService';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { ServiceCard } from '@/components/ServiceCard';
import type { Service as ServiceForCard } from '@/lib/api/services/fetchService';

export default function CategoryServices() {
  const params = useParams<{ id: string }>();
  const categoryId = Number(params?.id);

  const filters = useMemo(() => {
    const f: { categoryId?: number[]; page?: number; limit?: number } = {};
    if (!Number.isNaN(categoryId)) {
      f.categoryId = [categoryId];
    }
    f.page = 1;
    f.limit = 12;
    return f;
  }, [categoryId]);

  const { data, isLoading, isError, error, isFetching } = useServices(filters);

  if (isLoading) {
    return (
      <section className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background">
        <div className="mb-8">
          <div className="max-w-md">
            <Skeleton className="h-10 w-56 mb-3" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
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
      </section>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-background text-foreground">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Lỗi</h3>
          <p className="text-muted-foreground mb-2">Đã xảy ra lỗi khi tải dịch vụ</p>
          <p className="text-sm text-destructive mb-4">
            {error instanceof Error ? error.message : 'Không thể tải dịch vụ'}
          </p>
        </div>
      </div>
    );
  }

  const services = data?.services ?? [];

  // Runtime helpers to keep types safe without using any
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

  const asString = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);

  const asNumber = (v: unknown, fallback = 0): number =>
    typeof v === 'number' && !Number.isNaN(v) ? v : fallback;

  const asStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

  const getCategoryName = (srv: Record<string, unknown>): string => {
    const cat = srv['Category'];
    if (isRecord(cat) && typeof cat.name === 'string') return cat.name;
    if (Array.isArray(cat) && cat.length > 0 && isRecord(cat[0]) && typeof cat[0].name === 'string')
      return cat[0].name;
    return 'Dịch vụ';
  };

  const adaptToServiceCard = (raw: unknown): ServiceForCard => {
    const r = isRecord(raw) ? raw : {};
    const provider = r['provider'];
    const providerName =
      isRecord(provider) && typeof provider.name === 'string'
        ? provider.name
        : asString(provider, '');

    return {
      id: asNumber(r['id']),
      name: asString(r['name']),
      basePrice: asNumber(r['basePrice']),
      virtualPrice: asNumber(r['virtualPrice']),
      images: asStringArray(r['images']),
      durationMinutes: asNumber(r['durationMinutes']),
      providerId: asNumber(r['providerId']),
      description: asString(r['description']),
      Category: { logo: '', name: getCategoryName(r) },
      provider: providerName,
    };
  };

  return (
    <section className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background text-foreground">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Dịch vụ theo danh mục</h2>
        <p className="text-muted-foreground">Hiển thị dịch vụ thuộc danh mục #{categoryId}</p>
      </div>

      {isFetching && <div className="mb-4 text-sm text-muted-foreground">Đang cập nhật...</div>}

      {services.length === 0 ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center text-muted-foreground">Không có dịch vụ nào</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const normalized = adaptToServiceCard(service);
            return <ServiceCard key={normalized.id} service={normalized} priority={index < 4} />;
          })}
        </div>
      )}
    </section>
  );
}
