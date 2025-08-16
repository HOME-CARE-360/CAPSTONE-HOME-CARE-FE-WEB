import Image from 'next/image';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChevronLeft, ChevronRight, Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ServiceManager, StatusService } from '@/lib/api/services/fetchServiceManager';
import { useDeleteService } from '@/hooks/useServiceManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ServiceCardProps {
  service: ServiceManager;
  priority?: boolean;
  onHover?: (serviceId: string | null) => void;
  size?: 'sm' | 'md';
  onEdit?: (service: ServiceManager) => void;
  showActions?: boolean;
}

export function ServiceCard({
  service,
  priority = false,
  onHover,
  size = 'md',
  onEdit,
  showActions = false,
}: ServiceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<number[]>([0]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();

  const isDiscounted = service.virtualPrice < service.basePrice;

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(service.id.toString());
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
  };

  const handleDelete = () => {
    deleteService(service.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(service);
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

  const cardContent = (
    <div className="flex flex-col" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="relative aspect-square size-full mb-2 group">
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
          {service.category && (
            <Badge
              variant="outline"
              className={cn(
                'bg-white/90 backdrop-blur-sm hover:bg-white/90 z-10',
                size === 'sm' && 'text-[10px] px-2 py-0.5'
              )}
            >
              {service.category.name}
            </Badge>
          )}
          {service.status === StatusService.PENDING && (
            <Badge
              variant="outline"
              className={cn(
                'bg-yellow-500 text-white border-yellow-500 backdrop-blur-sm z-10',
                size === 'sm' && 'text-[10px] px-2 py-0.5'
              )}
            >
              Đang chờ duyệt
            </Badge>
          )}
          {service.status === StatusService.REJECTED && (
            <Badge
              variant="outline"
              className={cn(
                'bg-red-500 text-white border-red-500 backdrop-blur-sm z-10',
                size === 'sm' && 'text-[10px] px-2 py-0.5'
              )}
            >
              Từ chối
            </Badge>
          )}
          {service.status === StatusService.ACCEPTED && (
            <Badge
              variant="outline"
              className={cn(
                'bg-green-500 text-white border-green-500 backdrop-blur-sm z-10',
                size === 'sm' && 'text-[10px] px-2 py-0.5'
              )}
            >
              Đã được duyệt
            </Badge>
          )}
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
      <div className="px-1">
        <div className="flex justify-between items-center">
          <div>
            <p className={cn('text-xl font-semibold', size === 'sm' && 'text-base')}>
              {formatCurrency(service.virtualPrice)}
              {isDiscounted && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  {formatCurrency(service.basePrice)}
                </span>
              )}
            </p>
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
            {service.category?.name || 'Dịch vụ'}
          </div>
        </div>
        <div className="mb-2">
          <h3 className={cn('text-base font-medium line-clamp-2', size === 'sm' && 'text-sm')}>
            {service.name}
          </h3>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={isDeleting}
              className="flex-1 border-gray-300 text-black hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Sửa
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting} className="flex-1">
                  <Trash className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa dịch vụ {service.name} ? Hành động này không thể hoàn
                    tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );

  // If showActions is true, don't wrap in Link
  if (showActions) {
    return cardContent;
  }

  // Otherwise, wrap in Link for navigation
  return <Link href={`/services/${service.id}`}>{cardContent}</Link>;
}
