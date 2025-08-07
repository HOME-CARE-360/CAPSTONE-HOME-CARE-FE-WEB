'use client';

import { useGetFavorite } from '@/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Heart } from 'lucide-react';
import { ServiceCard } from '@/components/ServiceCard';
import { FavoriteResponse } from '@/lib/api/services/fetchUser';

const FavoriteSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader>
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-full" />
    </CardContent>
  </Card>
);

export default function FavoritesPage() {
  const { data, isLoading, error } = useGetFavorite();

  // The API returns a single favorite or an array, normalize to array
  const favorites = data?.data ? (Array.isArray(data.data) ? data.data : [data.data]) : [];

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Lỗi tải danh sách yêu thích
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Không thể tải danh sách yêu thích. Vui lòng thử lại sau.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dịch vụ yêu thích</h1>
        <p className="text-muted-foreground">
          Quản lý các dịch vụ bạn đã thêm vào danh sách yêu thích
        </p>
      </div>

      {/* Favorites Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <FavoriteSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((fav: FavoriteResponse['data']) => {
            const serviceWithRequiredProps = {
              ...fav.service,
              providerId: fav.service.provider?.id || 0,
              provider:
                typeof fav.service.provider === 'object' && fav.service.provider?.name
                  ? fav.service.provider.name
                  : 'Nhà cung cấp',
              Category: fav.service.categoryName
                ? { name: fav.service.categoryName, logo: '' }
                : { name: 'Dịch vụ', logo: '' },
            };
            return <ServiceCard key={fav.service.id} service={serviceWithRequiredProps} />;
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có dịch vụ yêu thích nào</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Bạn chưa thêm dịch vụ nào vào danh sách yêu thích. Hãy khám phá các dịch vụ và thêm
              vào yêu thích!
            </p>
            <Button className="mt-4">Khám phá dịch vụ</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
