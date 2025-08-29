'use client';

import { Service, ServiceStatus } from '@/lib/api/services/fetchManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Package, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useChangeService } from '@/hooks/useManager';
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
import { formatCurrency } from '@/utils/numbers/formatCurrency';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { mutate: changeStatus, isPending } = useChangeService();

  const images = service.images && service.images.length > 0 ? service.images : [];

  // Updated price logic based on your requirements
  const isDiscounted = service.virtualPrice > 0 && service.virtualPrice < service.basePrice;

  // Determine which price to display
  const displayPrice = service.virtualPrice > 0 ? service.virtualPrice : service.basePrice;
  const showOriginalPrice = isDiscounted; // Only show crossed out price when there's a discount

  const statusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-500 backdrop-blur-sm z-10">Đã duyệt</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500 backdrop-blur-sm z-10">Từ chối</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-400 backdrop-blur-sm z-10">Không hoạt động</Badge>;
      default:
        return <Badge className="bg-amber-500 backdrop-blur-sm z-10">Chờ duyệt</Badge>;
    }
  };

  const approveService = () => {
    changeStatus({ id: service.id, status: 'ACCEPTED' });
  };

  const rejectService = () => {
    changeStatus({ id: service.id, status: 'REJECTED' });
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div
      className="overflow-hidden transition-all duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square size-full mb-2 group">
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
        )}
        {images.length > 0 ? (
          <Image
            src={images[currentImageIndex]}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover rounded-2xl transition-opacity duration-300 ${
              isImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsImageLoading(false)}
          />
        ) : (
          <div className="relative w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
          {service.Category?.name && (
            <Badge className="bg-green-500 backdrop-blur-sm z-10">{service.Category.name}</Badge>
          )}
          {/* {isDiscounted && (
            <Badge className="bg-red-500 text-white border-red-500 backdrop-blur-sm z-10">
              -{discountPercent}%
            </Badge>
          )} */}
          <div>{statusBadge(service.status)}</div>
        </div>

        {isHovered && images.length > 1 && (
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

        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
            {currentImageIndex + 1}/{images.length}
          </div>
        )}
      </div>

      <div className="px-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="text-xl font-semibold">{formatCurrency(displayPrice)}</p>
            {showOriginalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(service.basePrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-2 text-foreground text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{service.durationMinutes} phút</span>
          </div>
          <div className="text-sm text-muted-foreground">{service.Category?.name || 'Dịch vụ'}</div>
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-medium line-clamp-2">{service.name}</h3>
        </div>
        <div className="mb-2">
          <h3 className="text-base font-bold line-clamp-2">{service.provider}</h3>
        </div>

        {service.status === 'PENDING' && (
          <div className="flex gap-2 mt-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  className="flex-1 border-gray-300 text-black hover:bg-gray-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận duyệt dịch vụ</AlertDialogTitle>
                  <AlertDialogDescription>Duyệt dịch vụ {service.name} ?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={approveService}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Duyệt
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isPending} className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" /> Từ chối
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận từ chối dịch vụ</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc muốn từ chối dịch vụ {service.name}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={rejectService}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Từ chối
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}
