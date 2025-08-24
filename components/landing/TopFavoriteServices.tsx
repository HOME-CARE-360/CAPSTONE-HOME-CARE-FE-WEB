'use client';

import { useGetTopFavoriteServices } from '@/hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, TrendingUp } from 'lucide-react';
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

export function TopFavoriteServices() {
  const { data, isLoading, error } = useGetTopFavoriteServices();
  const favoriteServices = data?.data.items ?? [];

  if (error) {
    return null; // Fail silently for landing page
  }

  if (isLoading) {
    return (
      <section className="py-12">
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

  // Transform TopFavoriteService to match Service interface
  const transformedServices: TransformedService[] = favoriteServices.map(favoriteService => ({
    id: favoriteService.serviceId,
    name: favoriteService.service.name,
    images: favoriteService.service.images,
    basePrice: favoriteService.service.basePrice,
    virtualPrice: favoriteService.service.virtualPrice,
    durationMinutes: favoriteService.service.durationMinutes,
    description: favoriteService.service.description,
    status: favoriteService.service.status,
    Category: { name: favoriteService.service.category.name, logo: '' },
    provider: favoriteService.service.provider.name,
    providerId: favoriteService.service.provider.id,
    // Add any other required fields
  }));

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Dịch vụ được yêu thích nhất</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Những dịch vụ được khách hàng đánh giá cao và thêm vào danh sách yêu thích
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {transformedServices.map((service, index) => (
            <div key={service.id} className="relative group">
              {/* Favorite Count Badge Overlay */}
              <div className="absolute top-4 right-4 z-20">
                <Badge className="bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 shadow-lg">
                  <Heart className="w-3 h-3 mr-1 fill-current" />
                  {favoriteServices[index].favoriteCount}
                </Badge>
              </div>

              {/* Category Badge Overlay */}
              {/* <div className="absolute bottom-4 left-4 z-20">
                <Badge variant="secondary" className="bg-white/90 text-slate-700 shadow-lg">
                  {favoriteServices[index].service.category.name}
                </Badge>
              </div> */}

              {/* Top Rank Indicator */}
              <div className="absolute bottom-4 right-4 z-20">
                <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full shadow-lg">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium text-pink-600">
                    Hạng {favoriteServices[index].rank}
                  </span>
                </div>
              </div>

              <ServiceCard service={service} priority={index < 3} size="md" />
            </div>
          ))}
        </div>

        {favoriteServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Không có dịch vụ yêu thích nào</p>
          </div>
        )}
      </div>
    </section>
  );
}
