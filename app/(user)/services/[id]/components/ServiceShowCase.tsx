'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Camera, Search, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Service } from '@/lib/api/services/fetchService';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ServiceShowcaseProps {
  service: Service;
}

export default function ServiceShowcase({ service }: ServiceShowcaseProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showFocusedImage, setShowFocusedImage] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<number[]>([0]);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Only display first 5 images in the grid
  const displayImages = service.images.slice(0, 5);

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

  const handleNextImage = () => {
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev === service.images.length - 1 ? 0 : prev + 1));
  };
  const handlePrevImage = () => {
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev === 0 ? service.images.length - 1 : prev - 1));
  };
  const toggleZoom = () => setIsZoomed(!isZoomed);
  const openFocusedImage = (index: number) => {
    setIsImageLoading(true);
    setCurrentImageIndex(index);
    setShowFocusedImage(true);
  };

  return (
    <div id="service-showcase" className="mb-4 md:mb-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/services" className="flex items-center gap-1 md:gap-2">
                    <Search className="size-3 md:size-4" />
                    <span className="hidden sm:inline text-xs md:text-sm">Tìm kiếm</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1 md:gap-2">
                  <Home className="size-3 md:size-4" />
                  <span
                    className="font-medium text-xs md:text-sm max-w-[150px] md:max-w-[200px] lg:max-w-full max-lg:truncate"
                    title={service.name}
                  >
                    {service.name}
                  </span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Gallery Layout - 5 Images */}
      <div className="relative w-full mb-4 md:mb-8 rounded-xl overflow-hidden group">
        {/* Mobile View - Single Column */}
        <div className="md:hidden space-y-1 md:space-y-2">
          <div className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-md md:rounded-xl">
            {isImageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md md:rounded-xl" />
            )}
            <Image
              src={displayImages[0]}
              alt={`${service.name} - Main View`}
              fill
              className={cn(
                'object-cover rounded-md md:rounded-xl transition-transform duration-300 hover:scale-105',
                isImageLoading ? 'opacity-0' : 'opacity-100'
              )}
              sizes="100vw"
              priority
              loading="eager"
              quality={75}
              onLoad={() => setIsImageLoading(false)}
              onClick={() => openFocusedImage(0)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
            {displayImages.slice(1, 5).map((image, index) => (
              <motion.div
                key={index}
                className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-md md:rounded-xl"
                onClick={() => openFocusedImage(index + 1)}
              >
                <Image
                  src={image}
                  alt={`${service.name} - View ${index + 2}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="50vw"
                  loading="lazy"
                  quality={75}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop View - 2/5 + 3/5 grid */}
        <div className="hidden md:grid grid-cols-5 gap-2 h-[32rem]">
          {/* Main Large Image - 2/5 width */}
          <div
            className="col-span-2 relative cursor-zoom-in overflow-hidden"
            onClick={() => openFocusedImage(0)}
          >
            {isImageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
            )}
            <Image
              src={displayImages[0]}
              alt={`${service.name} - Main View`}
              fill
              className={cn(
                'object-cover rounded-xl transition-transform duration-300 hover:scale-105',
                isImageLoading ? 'opacity-0' : 'opacity-100'
              )}
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
              loading="eager"
              quality={75}
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
          {/* Right Side Grid - 4 Images - 3/5 width */}
          <div className="col-span-3 grid grid-cols-2 grid-rows-2 gap-2">
            {displayImages.slice(1, 5).map((image, index) => (
              <motion.div
                key={index}
                className="relative cursor-zoom-in overflow-hidden rounded-xl"
                onClick={() => openFocusedImage(index + 1)}
              >
                <Image
                  src={image}
                  alt={`${service.name} - View ${index + 2}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 30vw"
                  loading="lazy"
                  quality={75}
                />
                {/* Overlay for last image if more images exist */}
                {index === 3 && service.images.length > 5 && (
                  <button
                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg rounded-xl hover:bg-black/60 transition"
                    onClick={e => {
                      e.stopPropagation();
                      setShowAllImages(true);
                    }}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Xem tất cả {service.images.length} ảnh
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Gallery Modal */}
      {showAllImages && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          {/* Gallery Header */}
          <div className="sticky top-0 z-10 flex justify-between items-center p-2 md:p-4 bg-white border-b">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100"
              onClick={() => setShowAllImages(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <h2 className="md:text-lg text-sm font-medium max-md:truncate max-md:ml-2">
              {service.name}
            </h2>
            <div className="w-10" />
          </div>
          <div className="container mx-auto px-4 py-4 md:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {service.images.map((image, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer aspect-[4/3] rounded-lg overflow-hidden"
                  onClick={() => openFocusedImage(index)}
                >
                  <Image
                    src={image}
                    alt={`${service.name} - View ${index + 1}`}
                    fill
                    className="object-cover hover:opacity-95 transition-opacity"
                    loading="lazy"
                    quality={75}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Focused Image Modal */}
      {showFocusedImage && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 text-white">
            <span className="text-sm">
              {currentImageIndex + 1} / {service.images.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-gray-800"
              onClick={() => setShowFocusedImage(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Focused Image */}
          <div className="flex-1 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative w-full h-full flex items-center justify-center',
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                )}
                onClick={toggleZoom}
              >
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-xl" />
                )}
                <div className={cn('relative', isZoomed ? 'w-full h-full' : 'w-4/5 h-4/5')}>
                  <Image
                    src={service.images[currentImageIndex]}
                    alt={`${service.name} - View ${currentImageIndex + 1}`}
                    fill
                    className={cn(
                      'object-contain transition-transform duration-300',
                      isZoomed ? 'scale-125' : 'scale-100',
                      isImageLoading ? 'opacity-0' : 'opacity-100'
                    )}
                    quality={90}
                    priority
                    onLoad={() => setIsImageLoading(false)}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Navigation Controls */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={e => {
                e.stopPropagation();
                handlePrevImage();
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={e => {
                e.stopPropagation();
                handleNextImage();
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            {/* Zoom Control */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-4 right-4 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={e => {
                e.stopPropagation();
                toggleZoom();
              }}
            >
              {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
