import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useServices } from '@/hooks/useService';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceCard } from '@/components/ServiceCard';
import { useTranslation } from 'react-i18next';
import { ServiceSearchParams, ServiceType, TransactionType } from '@/lib/api/services/fetchService';
import { AlertTriangle, Search } from 'lucide-react';

// Price range mapping
const priceRangeMap: Record<string, { min: number; max: number | null }> = {
  '100k-300k': { min: 100000, max: 300000 },
  '300k-500k': { min: 300000, max: 500000 },
  '500k-750k': { min: 500000, max: 750000 },
  '750k-1m': { min: 750000, max: 1000000 },
  '1m-plus': { min: 1000000, max: null },
};

// Property size mapping
const propertySizeMap: Record<string, { min: number; max: number | null }> = {
  '500-1000': { min: 500, max: 1000 },
  '1000-1500': { min: 1000, max: 1500 },
  '1500-2000': { min: 1500, max: 2000 },
  '2000-3000': { min: 2000, max: 3000 },
  '3000-plus': { min: 3000, max: null },
};

// Build year mapping
const buildYearMap: Record<string, { min: number; max: number | null }> = {
  'before-1990': { min: 0, max: 1990 },
  '1990-2000': { min: 1990, max: 2000 },
  '2000-2010': { min: 2000, max: 2010 },
  '2010-2020': { min: 2010, max: 2020 },
  'after-2020': { min: 2020, max: null },
};

export default function PropertyListings() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<ServiceSearchParams>({});
  const [clientFilters, setClientFilters] = useState<{
    location?: string;
    priceRange?: string;
    propertySize?: string;
    buildYear?: string;
    city?: string;
    district?: string;
    ward?: string;
    transactionType?: string;
  }>({});
  const itemsPerPage = 8;

  // Handle search params changes and convert to API params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const filters: ServiceSearchParams = {
      pageNumber: page,
      pageSize: itemsPerPage,
    };

    // Extract search term
    if (params.has('searchTerm')) {
      filters.searchTerm = params.get('searchTerm') || undefined;
    }

    // Map property type
    if (params.has('propertyType')) {
      const propertyType = params.get('propertyType');
      if (propertyType === 'apartment') filters.type = ServiceType.APARTMENT;
      else if (propertyType === 'land') filters.type = ServiceType.LAND_PLOT;
      else if (propertyType === 'villa') filters.type = ServiceType.VILLA;
      else if (propertyType === 'shophouse') filters.type = ServiceType.SHOP_HOUSE;
    }

    // Map transaction type
    if (params.has('transactionType')) {
      const transactionType = params.get('transactionType');
      if (
        transactionType === TransactionType.FOR_SALE ||
        transactionType === TransactionType.FOR_RENT
      ) {
        filters.transactionType = transactionType;
      }
    }

    // Set client-side filters
    const newClientFilters = {
      location: params.get('location') || undefined,
      priceRange: params.get('priceRange') || undefined,
      propertySize: params.get('propertySize') || undefined,
      buildYear: params.get('buildYear') || undefined,
      city: params.get('city') || undefined,
      district: params.get('district') || undefined,
      ward: params.get('ward') || undefined,
      transactionType: params.get('transactionType') || undefined,
    };
    setClientFilters(newClientFilters);

    // Set filters
    setSearchFilters(filters);
  }, [searchParams, page]);

  // Fetch properties with filters
  const { services, isLoading, isError, error, isFetching, count, totalPages } =
    useServices(searchFilters);

  // Apply client-side filtering
  const filteredServices = services.filter(service => {
    // Location filter
    if (clientFilters.city || clientFilters.district || clientFilters.ward) {
      const serviceLocation = service.location;

      // Check city
      if (
        clientFilters.city &&
        !serviceLocation.city.toLowerCase().includes(clientFilters.city.toLowerCase())
      ) {
        return false;
      }

      // Check district
      if (
        clientFilters.district &&
        !serviceLocation.district.toLowerCase().includes(clientFilters.district.toLowerCase())
      ) {
        return false;
      }

      // Check ward
      if (
        clientFilters.ward &&
        !serviceLocation.ward.toLowerCase().includes(clientFilters.ward.toLowerCase())
      ) {
        return false;
      }
    }

    // Price range filter
    if (clientFilters.priceRange && service.priceDetails.salePrice) {
      const range = priceRangeMap[clientFilters.priceRange];
      if (range) {
        if (range.min && service.priceDetails.salePrice < range.min) return false;
        if (range.max && service.priceDetails.salePrice > range.max) return false;
      }
    }

    // Property size filter
    if (clientFilters.propertySize) {
      const range = propertySizeMap[clientFilters.propertySize];
      if (range) {
        if (range.min && service.propertyDetails.landArea < range.min) return false;
        if (range.max && service.propertyDetails.landArea > range.max) return false;
      }
    }

    // Build year filter
    if (clientFilters.buildYear) {
      const range = buildYearMap[clientFilters.buildYear];
      if (range) {
        if (range.min && service.yearBuilt < range.min) return false;
        if (range.max && service.yearBuilt > range.max) return false;
      }
    }

    return true;
  });

  // Handle pagination change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-background border-muted-foreground/20">
                <Skeleton className="w-full h-64 rounded-t-lg" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex gap-4 mt-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-10 w-28 rounded-md" />
                  </div>
                </div>
              </Card>
            ))}
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
          <h3 className="text-xl font-semibold mb-2">{t('services.error.title')}</h3>
          <p className="text-muted-foreground mb-2">{t('services.error.description')}</p>
          <p className="text-sm text-destructive mb-4">
            {error instanceof Error ? error.message : t('services.error.unknown')}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            {t('services.error.button')}
          </Button>
        </div>
      </div>
    );
  }

  // Empty results state
  if (filteredServices.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[500px] bg-background text-foreground text-center">
        <div className="text-center max-w-md mx-auto">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('services.empty.title')}</h3>
          <p className="text-muted-foreground mb-6">{t('services.empty.description')}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => (window.location.href = '/services')}
          >
            {t('services.empty.clear_filters')}
          </Button>
        </div>
      </div>
    );
  }

  // Calculate pagination
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);
  const calculatedTotalPages = Math.max(
    totalPages || Math.ceil(filteredServices.length / itemsPerPage),
    1
  );

  return (
    <section className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background text-foreground ">
      <div className="max-w-screen mx-auto">
        <div className="mb-12 text-center md:text-left md:flex md:justify-between md:items-end">
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('services.title')}</h2>
            <p className="text-muted-foreground font-light">
              {searchFilters.searchTerm
                ? t('services.search_results', { term: searchFilters.searchTerm, count })
                : t('services.description')}
            </p>
          </div>
        </div>

        {/* Properties grid with loading overlay when fetching */}
        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-medium">{t('services.updating')}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {paginatedServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} priority={index < 4} />
            ))}
          </div>
        </div>

        {calculatedTotalPages > 1 && (
          <Pagination className="mt-12">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(page - 1, 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: calculatedTotalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink isActive={page === i + 1} onClick={() => handlePageChange(i + 1)}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(page + 1, calculatedTotalPages))}
                  className={
                    page === calculatedTotalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </section>
  );
}
