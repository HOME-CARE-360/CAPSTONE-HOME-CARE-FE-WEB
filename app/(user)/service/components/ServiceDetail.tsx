'use client';

import { useParams } from 'next/navigation';
import { useService, useServices } from '@/hooks/useService';
import { useCategories } from '@/hooks/useCategory';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star } from 'lucide-react';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { useGetServiceProviderInformation, useGetServiceReviews } from '@/hooks/useUser';
import Link from 'next/link';
import { ServiceCard } from '@/components/ServiceCard';
import type { Service as ServiceForCard } from '@/lib/api/services/fetchService';
import { useMemo, useState, useEffect } from 'react';
import { formatDate } from '@/utils/numbers/formatDate';

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

  // Reviews state and data
  const [reviewsPage, setReviewsPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const { data: reviewsData, isLoading: isReviewsLoading } = useGetServiceReviews(
    service?.id ?? 0,
    { page: reviewsPage, limit: 5, rating: selectedRating }
  );

  useEffect(() => {
    setReviewsPage(1);
  }, [selectedRating]);

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
      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 auto-rows-auto">
        {/* Row 1, Column 1: Service Image */}
        <div className="relative aspect-square">
          <Image
            src={service.images?.[0] || '/placeholder-service.jpg'}
            alt={service.name}
            fill
            className="object-cover rounded-2xl"
          />
        </div>

        {/* Row 1, Column 2: Service Details */}
        <div className="space-y-6 flex flex-col justify-between">
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
              <Button size="lg" className="w-full">
                Đặt lịch
              </Button>
            </Link>
          </div>

          {/* Provider Info */}
          {providerId && (
            <div>
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

        {/* Row 2, Column 1: Rating Summary & Histogram */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Đánh giá dịch vụ</h2>
          </div>

          {/* Rating Summary */}
          {reviewsData?.data?.summary && (
            <div className="space-y-4">
              {/* Overall Rating */}
              <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                <div className="text-4xl font-bold mb-2">
                  {reviewsData.data.summary.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= reviewsData.data.summary.averageRating
                          ? 'fill-current'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  {reviewsData.data.summary.totalReviews} đánh giá
                </div>
              </div>

              {/* Rating Histogram */}
              <div className="p-6 border rounded-lg">
                <h3 className="text-sm font-medium mb-4">Phân bố đánh giá</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviewsData.data.summary.histogram[rating] || 0;
                    const percentage =
                      reviewsData.data.summary.totalReviews > 0
                        ? (count / reviewsData.data.summary.totalReviews) * 100
                        : 0;

                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm">{rating}</span>
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-foreground h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Row 2, Column 2: Rating Filter & Reviews List */}
        <div className="space-y-6">
          {/* Rating Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedRating === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRating(undefined)}
            >
              Tất cả
            </Button>
            {[5, 4, 3, 2, 1].map(rating => (
              <Button
                key={rating}
                variant={selectedRating === rating ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRating(rating)}
                className="flex items-center gap-1"
              >
                <Star className="h-3 w-3" />
                {rating}
              </Button>
            ))}
          </div>

          {/* Reviews List */}
          <div className="h-96 overflow-y-auto">
            {isReviewsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviewsData?.data?.reviews && reviewsData.data.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.data.reviews.map(review => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {review.customer.user.avatar ? (
                          <Image
                            src={review.customer.user.avatar}
                            alt={review.customer.user.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                            {review.customer.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{review.customer.user.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating ? 'fill-current' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {reviewsData.data.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewsPage(prev => Math.max(1, prev - 1))}
                      disabled={reviewsPage === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                      {reviewsPage} / {reviewsData.data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setReviewsPage(prev => Math.min(reviewsData.data.totalPages, prev + 1))
                      }
                      disabled={reviewsPage === reviewsData.data.totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Chưa có đánh giá nào
                </h3>
                <p className="text-xs text-muted-foreground">
                  Hãy là người đầu tiên đánh giá dịch vụ này
                </p>
              </div>
            )}
          </div>
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
