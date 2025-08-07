import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useServices } from '@/hooks/useService';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceCard } from '@/components/ServiceCard';
import { ServicesPagination } from './ServicesPagination';
import ServicesFilter from './ServicesFilter';
import { ServiceSearchParams } from '@/lib/api/services/fetchService';
import { AlertTriangle, Search } from 'lucide-react';

export default function ServicesListings() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<ServiceSearchParams>({});
  const [clientFilters, setClientFilters] = useState<{
    categories?: string;
  }>({});
  const itemsPerPage = 9;

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const filters: ServiceSearchParams = {
      page,
      limit: itemsPerPage,
    };

    if (params.has('name')) {
      filters.name = params.get('name') || undefined;
    }

    const categoryParams = params.getAll('categories');
    if (categoryParams.length > 0) {
      const categoryIds = categoryParams
        .map(id => Number(id))
        .filter((id): id is number => !isNaN(id));
      filters.categories = categoryIds.length > 0 ? categoryIds : undefined;
    }

    const newClientFilters = {
      priceRange: params.get('priceRange') || undefined,
      categories: params.get('categories') || undefined,
    };
    setClientFilters(newClientFilters);

    setSearchFilters(filters);
  }, [searchParams, page]);

  const { data, isLoading, isError, error, isFetching } = useServices(searchFilters);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background">
        <div className="max-w-screen mx-auto">
          <div className="mb-12 text-center md:text-left md:flex md:justify-between md:items-end">
            <div className="max-w-lg">
              <Skeleton className="h-10 w-56 mb-3" />
              <Skeleton className="h-5 w-full max-w-md" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar Skeleton */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-6 w-24 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="h-6 w-20 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Services Grid Skeleton */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden transition-all duration-300 flex flex-col"
                  >
                    {/* Image Skeleton - Square aspect ratio */}
                    <div className="relative aspect-square size-full mb-2">
                      <Skeleton className="w-full h-full rounded-2xl" />

                      {/* Skeleton badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-12 rounded-full" />
                      </div>

                      {/* Skeleton image counter */}
                      <div className="absolute bottom-2 right-2">
                        <Skeleton className="h-5 w-8 rounded-full" />
                      </div>
                    </div>

                    <div className="px-1">
                      {/* Price and Actions Skeleton */}
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </div>

                      {/* Duration and Category Skeleton */}
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Skeleton className="h-4 w-4 mr-1" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>

                      {/* Service Name Skeleton */}
                      <div className="mb-2">
                        <Skeleton className="h-5 w-full mb-1" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>

                      {/* Provider Name Skeleton */}
                      <div className="mb-2">
                        <div className="flex items-center">
                          <Skeleton className="h-4 w-4 mr-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Skeleton */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[500px] bg-background text-foreground text-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Lỗi</h3>
          <p className="text-muted-foreground mb-2">Đã xảy ra lỗi khi tải dịch vụ</p>
          <p className="text-sm text-destructive mb-4">
            {error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dịch vụ'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  // Empty results state
  if (!data?.services || data.services.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[500px] bg-background text-foreground text-center">
        <div className="text-center max-w-md mx-auto">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Không tìm thấy dịch vụ</h3>
          <p className="text-muted-foreground mb-6">Không tìm thấy dịch vụ</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => (window.location.href = '/services')}
          >
            Đặt lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background text-foreground">
      <div className="max-w-screen mx-auto">
        {/* Header */}
        <div className="mb-12 text-center md:text-left md:flex md:justify-between md:items-end">
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Dịch vụ</h2>
            <p className="text-muted-foreground font-light">
              {searchFilters.name ? `Tìm kiếm: ${searchFilters.name}` : 'Dịch vụ'}
            </p>
            {clientFilters.categories && (
              <div className="mt-2 text-sm text-muted-foreground">
                Bộ lọc:
                {clientFilters.categories && (
                  <span className="ml-2">{clientFilters.categories}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content with Filter and Services */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <ServicesFilter />
          </div>

          {/* Services Grid */}
          <div className="flex-1">
            {/* Services grid with loading overlay when fetching */}
            <div className="relative">
              {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-primary font-medium">Đang cập nhật</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.services.map((service, index) => (
                  <ServiceCard key={service.id} service={service} priority={index < 4} />
                ))}
              </div>
            </div>

            <ServicesPagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
              isLoading={isFetching}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
