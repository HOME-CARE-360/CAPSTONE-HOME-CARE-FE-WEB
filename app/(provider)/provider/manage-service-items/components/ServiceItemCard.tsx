'use client';

import { ServiceItem } from '@/lib/api/services/fetchServiceManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Package, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, Currency } from '@/utils/numbers/formatCurrency';
import { useDeleteServiceItem } from '@/hooks/useServiceManager';
import { useState } from 'react';
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

interface ServiceItemCardProps {
  serviceItem: ServiceItem;
  onEdit: (serviceItem: ServiceItem) => void;
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
}

export function ServiceItemCard({ serviceItem, onEdit }: ServiceItemCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { mutate: deleteServiceItem, isPending: isDeleting } = useDeleteServiceItem();

  const placeholderImages: string[] = [];

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleDelete = () => {
    deleteServiceItem(serviceItem.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(serviceItem);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev === placeholderImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev === 0 ? placeholderImages.length - 1 : prev - 1));
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500 backdrop-blur-sm z-10">Hoạt động</Badge>
    ) : (
      <Badge className="bg-red-500 backdrop-blur-sm z-10">Không hoạt động</Badge>
    );
  };

  return (
    <div className="flex flex-col" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="relative aspect-square size-full mb-2 group">
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
        )}

        {/* Placeholder Image with Package Icon */}
        <div className="relative w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
          <Package className="h-16 w-16 text-gray-400" />
        </div>

        {/* Status Badges Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-green-500 backdrop-blur-sm z-10">Vật tư</Badge>
          {serviceItem.brand && (
            <Badge className="bg-green-500 backdrop-blur-sm z-10">{serviceItem.brand}</Badge>
          )}
        </div>

        {/* Status Badge on Right */}
        <div className="absolute top-4 right-4">{getStatusBadge(serviceItem.isActive)}</div>

        {/* Navigation Arrows (hidden for single image) */}
        {isHovered && placeholderImages.length > 1 && (
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

        {/* Image Counter (hidden for single image) */}
        {placeholderImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
            {currentImageIndex + 1}/{placeholderImages.length}
          </div>
        )}
      </div>

      <div className="px-1">
        {/* Price Section */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xl font-semibold">
              {formatCurrency(serviceItem.unitPrice, Currency.VND)}
              <span className="text-sm text-gray-400 ml-2">/cái</span>
            </p>
          </div>
        </div>

        {/* Service Item Details Icons */}
        <div className="flex justify-between items-center mb-2 text-foreground text-sm">
          <div className="flex items-center">
            <Clock className="size-4 mr-1" />
            <span>{serviceItem.warrantyPeriod} tháng</span>
          </div>
        </div>

        {/* Service Item Name */}
        <div className=" flex justify-between items-center">
          <span className="text-base font-medium line-clamp-2">{serviceItem.name}</span>
          <span className="font-medium text-sm">{serviceItem.stockQuantity} cái</span>
        </div>

        {/* Action Buttons */}
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
                <AlertDialogTitle>Xác nhận xóa vật tư</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa vật tư {serviceItem.name} ? Hành động này không thể hoàn
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
      </div>
    </div>
  );
}
