'use client';

import { useMemo, useState } from 'react';
import { useProviderServices } from '@/hooks/useService';
import { ServiceCard } from '@/components/ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ProviderServicesListProps {
  providerId: number;
}

export default function ProviderServicesList({ providerId }: ProviderServicesListProps) {
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data, isLoading, isFetching } = useProviderServices(providerId, page, limit);

  const services = data?.services ?? [];
  const totalPages = data?.totalPages ?? 1;

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {services.map(service => (
          <ServiceCard key={service.id} service={service} size="sm" />
        ))}
        {isFetching && (
          <div className="col-span-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-60">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(p => Math.max(1, p - 1))}
                aria-disabled={page === 1}
              />
            </PaginationItem>
            {pageNumbers.map(p => (
              <PaginationItem key={p}>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md border ${
                    p === page ? 'bg-muted' : 'bg-background'
                  }`}
                  onClick={() => setPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
