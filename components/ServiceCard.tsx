import Image from 'next/image';
import { Service } from '@/lib/api/services/fetchService';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';
import { Clock, Heart, Share2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { useAddOrRemoveFavorite, useGetFavorite } from '@/hooks/useUser';
import { FavoriteResponse } from '@/lib/api/services/fetchUser';
import { useAuthStore } from '@/lib/store/authStore';
import { AuthDialog } from '@/components/ui/auth-dialog';
import { toast } from 'sonner';

interface ServiceCardProps {
  service: Service;
  priority?: boolean;
  onHover?: (serviceId: string | null) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function ServiceCard({
  service,
  priority = false,
  onHover,
  size = 'md',
  className,
}: ServiceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<number[]>([0]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { isAuthenticated } = useAuthStore();

  // Fetch all favorite services
  const { data: favoriteData } = useGetFavorite();
  // Normalize to array of service IDs
  const favoriteIds = useMemo(() => {
    if (!favoriteData?.data) return [];
    if (Array.isArray(favoriteData.data)) {
      return favoriteData.data.map((fav: FavoriteResponse['data']) => fav.service.id);
    }
    return [favoriteData.data.service.id];
  }, [favoriteData]);

  // Local state for optimistic UI
  const [isFavorite, setIsFavorite] = useState(favoriteIds.includes(service.id));

  // Keep local state in sync with server
  useEffect(() => {
    setIsFavorite(favoriteIds.includes(service.id));
  }, [favoriteIds, service.id]);

  const { mutate: toggleFavorite, isPending: isToggling } = useAddOrRemoveFavorite();

  const hasVirtual = (service.virtualPrice ?? 0) > 0;
  const effectivePrice = hasVirtual ? service.virtualPrice : service.basePrice;
  const isDiscounted = hasVirtual && service.virtualPrice < service.basePrice;

  // Category handling: support both object and array shapes at runtime
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

  const extractCategoryNames = (input: unknown): string[] => {
    if (Array.isArray(input)) {
      return input
        .map(item => (isRecord(item) && typeof item.name === 'string' ? item.name : null))
        .filter((n): n is string => typeof n === 'string');
    }
    if (isRecord(input) && typeof input.name === 'string') {
      return [input.name];
    }
    return [];
  };

  const categoryNames = extractCategoryNames(service.Category as unknown);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(service.id.toString());
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
  };

  // Preload next and previous images
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (index >= 0 && index < service.images.length && !preloadedImages.includes(index)) {
        const img = new window.Image();
        img.src = service.images[index];
        setPreloadedImages(prev => [...prev, index]);
      }
    };
    const nextIndex = (currentImageIndex + 1) % service.images.length;
    preloadImage(nextIndex);
    const prevIndex = currentImageIndex === 0 ? service.images.length - 1 : currentImageIndex - 1;
    preloadImage(prevIndex);
  }, [currentImageIndex, service.images, preloadedImages]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev === service.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev === 0 ? service.images.length - 1 : prev - 1));
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Bạn cần đăng nhập để yêu thích dịch vụ này');
      setShowAuthDialog(true);
      return;
    }

    // Optimistic update
    setIsFavorite(!isFavorite);
    toggleFavorite(service.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Share functionality
  };

  const handleAuthSuccess = () => {
    // After successful login, the favorite state will be updated automatically
    // through the useGetFavorite hook
  };

  return (
    <>
      <Link href={`/service/${service.id}`}>
        <div
          className={cn('overflow-hidden transition-all duration-300 flex flex-col', className)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={cn('relative aspect-square size-full mb-2 group', size === 'sm' && 'mb-1')}
          >
            {isImageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
            )}
            <Image
              src={service.images[currentImageIndex] || '/placeholder-service.jpg'}
              alt={service.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                'object-cover rounded-2xl transition-opacity duration-300',
                isImageLoading ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={() => setIsImageLoading(false)}
            />
            {service.images.map(
              (url, index) =>
                index !== currentImageIndex && (
                  <Image
                    key={index}
                    src={url}
                    alt={`${service.name} - Image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="hidden"
                    priority={index === 0}
                  />
                )
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              {/* {categoryNames.slice(0, 2).map(name => (
                <Badge
                  key={name}
                  variant="outline"
                  className={cn(
                    'bg-white/90 backdrop-blur-sm hover:bg-white/90 z-10',
                    size === 'sm' && 'text-[10px] px-2 py-0.5'
                  )}
                >
                  {name}
                </Badge>
              ))} */}
            </div>
            {isHovered && service.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full h-8 w-8 z-10"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full h-8 w-8 z-10"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
            {service.images.length > 1 && (
              <div
                className={cn(
                  'absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10',
                  size === 'sm' && 'text-[10px]'
                )}
              >
                {currentImageIndex + 1}/{service.images.length}
              </div>
            )}
          </div>
          <div className={cn('px-1', size === 'sm' && 'px-0')}>
            <div className="flex justify-between items-center">
              <div>
                <p className={cn('text-xl font-semibold', size === 'sm' && 'text-base')}>
                  {formatCurrency(effectivePrice)}
                  {isDiscounted && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      {formatCurrency(service.basePrice)}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'hover:text-red-600 transition-colors',
                      isFavorite && 'text-red-600',
                      !isAuthenticated && 'hover:scale-110 transition-transform hover:bg-red-50'
                    )}
                    onClick={handleFavoriteClick}
                    disabled={isToggling}
                    aria-label={
                      !isAuthenticated
                        ? 'Đăng nhập để yêu thích'
                        : isFavorite
                          ? 'Xóa khỏi yêu thích'
                          : 'Thêm vào yêu thích'
                    }
                    title={
                      !isAuthenticated
                        ? 'Đăng nhập để yêu thích dịch vụ này'
                        : isFavorite
                          ? 'Xóa khỏi yêu thích'
                          : 'Thêm vào yêu thích'
                    }
                  >
                    <Heart
                      className={cn(
                        'size-5',
                        isFavorite && 'fill-current',
                        !isAuthenticated && 'opacity-70'
                      )}
                    />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-blue-600"
                  onClick={handleShareClick}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div
              className={cn(
                'flex justify-between items-center mb-2 text-foreground text-sm',
                size === 'sm' && 'text-xs'
              )}
            >
              <div className="flex items-center">
                <Clock className={cn('size-4 mr-1', size === 'sm' && 'size-3')} />
                <span>{service.durationMinutes} phút</span>
              </div>
              <div
                className={cn('text-sm text-muted-foreground', size === 'sm' && 'text-xs')}
                aria-label="Service category"
              >
                {categoryNames[0] ?? 'Dịch vụ'}
              </div>
            </div>
            <div className="mb-2">
              <h3 className={cn('text-base font-medium line-clamp-2', size === 'sm' && 'text-sm')}>
                {service.name}
              </h3>
            </div>
            <div className="mb-2">
              <div
                className={cn(
                  'flex items-center text-xs text-muted-foreground',
                  size === 'sm' && 'text-[10px]'
                )}
              >
                <User className={cn('size-4 mr-1', size === 'sm' && 'size-3')} />
                <span>
                  {typeof service.provider === 'object' &&
                  service.provider !== null &&
                  'name' in service.provider
                    ? (service.provider as { name: string }).name
                    : String(service.provider)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
