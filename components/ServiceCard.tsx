import Image from 'next/image';
import { Service } from '@/lib/api/services/fetchService';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Heart, Share2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ServiceCardProps {
  service: Service;
  priority?: boolean;
  onHover?: (serviceId: string | null) => void;
  size?: 'sm' | 'md';
}

export function ServiceCard({ service, priority = false, onHover, size = 'md' }: ServiceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<number[]>([0]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const isDiscounted = service.virtualPrice > service.basePrice;
  const discountPercent = isDiscounted
    ? Math.round(((service.virtualPrice - service.basePrice) / service.virtualPrice) * 100)
    : 0;

  // Handle hover state changes
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

    // Preload next image
    const nextIndex = (currentImageIndex + 1) % service.images.length;
    preloadImage(nextIndex);

    // Preload previous image
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
    setIsFavorite(!isFavorite);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Share functionality
  };

  return (
    <Link href={`/services/${service.id}`}>
      <div
        className="overflow-hidden transition-all duration-300 flex flex-col"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Section with Badge */}
        <div className="relative aspect-square size-full mb-2 group">
          {/* Skeleton Loading */}
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
          )}

          {/* Main Image */}
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

          {/* Preload Hidden Images */}
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

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {Array.isArray(service.categories) &&
              service.categories.slice(0, 2).map(category => (
                <Badge
                  key={category.name}
                  variant="outline"
                  className={cn(
                    'bg-white/90 backdrop-blur-sm hover:bg-white/90 z-10',
                    size === 'sm' && 'text-[10px] px-2 py-0.5'
                  )}
                >
                  {category.name}
                </Badge>
              ))}
            {isDiscounted && (
              <Badge
                variant="outline"
                className={cn(
                  'bg-red-500 text-white border-red-500 backdrop-blur-sm z-10',
                  size === 'sm' && 'text-[10px] px-2 py-0.5'
                )}
              >
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Navigation Buttons */}
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

          {/* Image Counter */}
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

        <div className="px-1">
          {/* Price and Actions Section */}
          <div className="flex justify-between items-center">
            <div>
              <p className={cn('text-xl font-semibold', size === 'sm' && 'text-base')}>
                {formatCurrency(service.basePrice)}
                {isDiscounted && (
                  <span className="text-sm text-gray-400 line-through ml-2">
                    {formatCurrency(service.virtualPrice)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn('hover:text-red-600 transition-colors', isFavorite && 'text-red-600')}
                onClick={handleFavoriteClick}
              >
                <Heart className={cn('size-5', isFavorite && 'fill-current')} />
              </Button>
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

          {/* Service Details Section */}
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
              {Array.isArray(service.categories) &&
              service.categories.length > 0 &&
              typeof service.categories[0]?.name === 'string'
                ? service.categories[0].name
                : 'Dịch vụ'}
            </div>
          </div>

          {/* Service Name */}
          <div className="mb-2">
            <h3 className={cn('text-base font-medium line-clamp-2', size === 'sm' && 'text-sm')}>
              {service.name}
            </h3>
          </div>

          {/* Location Section */}
          <div className="mb-2">
            <div
              className={cn(
                'flex items-center text-xs text-muted-foreground',
                size === 'sm' && 'text-[10px]'
              )}
            >
              <User className={cn('size-4 mr-1', size === 'sm' && 'size-3')} />
              <span>{service.provider}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
