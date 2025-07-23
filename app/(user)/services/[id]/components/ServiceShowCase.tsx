'use client';

import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Images,
  ChevronRight as ChevronRightIcon,
  ArrowLeft,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Service } from '@/lib/api/services/fetchService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ServiceShowcaseProps {
  service: Service;
}

export default function ServiceShowcase({ service }: ServiceShowcaseProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev === service.images.length - 1 ? 0 : prev + 1));
  }, [service.images.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev === 0 ? service.images.length - 1 : prev - 1));
  }, [service.images.length]);

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
    setIsZoomed(false);
  }, []);

  const closeLightbox = useCallback(() => {
    setShowLightbox(false);
    setIsZoomed(false);
  }, []);

  // Get main image and thumbnail images
  const mainImage = service.images[0];
  const thumbnailImages = service.images.slice(1, 5);

  return (
    <div className="mb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-3 text-sm mb-10" aria-label="Breadcrumb">
        <Link
          href="/services"
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dịch vụ
        </Link>
        <ChevronRightIcon className="w-4 h-4 text-gray-300" />
        <span className="text-gray-900 font-semibold truncate max-w-sm">{service.name}</span>
      </nav>

      {/* Main Gallery */}
      <div className="relative rounded-2xl overflow-hidden bg-white border-2 border-gray-200 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[28rem] md:h-[36rem]">
          {/* Main Image */}
          <div className="lg:col-span-3 relative group cursor-pointer overflow-hidden bg-gray-50">
            <Image
              src={mainImage}
              alt={service.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 75vw"
              priority
              quality={90}
              onClick={() => openLightbox(0)}
            />

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Image counter */}
            <div className="absolute top-6 left-6">
              <Badge className="bg-black/80 text-white backdrop-blur-sm border-0 px-3 py-2 font-semibold">
                1 / {service.images.length}
              </Badge>
            </div>

            {/* View all photos button */}
            {service.images.length > 1 && (
              <Button
                onClick={() => openLightbox(0)}
                className="absolute bottom-6 right-6 bg-white hover:bg-gray-100 text-gray-900 shadow-xl border-2 border-gray-200 font-semibold"
                size="default"
              >
                <Images className="w-4 h-4 mr-2" />
                Xem tất cả {service.images.length} ảnh
              </Button>
            )}
          </div>

          {/* Thumbnail Grid */}
          {thumbnailImages.length > 0 && (
            <div className="hidden lg:grid grid-rows-2 gap-3">
              {thumbnailImages.slice(0, 2).map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 border border-gray-200"
                  onClick={() => openLightbox(index + 1)}
                >
                  <Image
                    src={image}
                    alt={`${service.name} - Ảnh ${index + 2}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="25vw"
                    quality={75}
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}

              {/* More photos indicator */}
              {service.images.length > 3 && (
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-900/90 flex items-center justify-center border border-gray-200"
                  onClick={() => openLightbox(3)}
                >
                  {thumbnailImages[2] && (
                    <Image
                      src={thumbnailImages[2]}
                      alt={`${service.name} - Ảnh thêm`}
                      fill
                      className="object-cover opacity-40"
                      sizes="25vw"
                      quality={75}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Images className="w-7 h-7 mx-auto mb-2" />
                      <span className="text-lg font-bold">+{service.images.length - 3}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white">
                <span className="text-lg font-semibold">
                  {currentImageIndex + 1} / {service.images.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full w-12 h-12"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Main Image */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div
                className={cn(
                  'relative w-full h-full flex items-center justify-center cursor-pointer transition-transform duration-300',
                  isZoomed && 'cursor-zoom-out'
                )}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: isZoomed ? 1.5 : 1,
                      transition: { duration: 0.3 },
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative max-w-full max-h-full"
                  >
                    <Image
                      src={service.images[currentImageIndex]}
                      alt={`${service.name} - Ảnh ${currentImageIndex + 1}`}
                      width={1200}
                      height={800}
                      className="object-contain max-w-full max-h-full"
                      quality={95}
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation Controls */}
            {service.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-14 h-14 border border-white/20"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="w-7 h-7" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-14 h-14 border border-white/20"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="w-7 h-7" />
                </Button>
              </>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-center items-center space-x-6">
                <Button
                  variant="ghost"
                  size="default"
                  className="text-white hover:bg-white/20 border border-white/20 font-medium"
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  {isZoomed ? (
                    <ZoomOut className="w-5 h-5 mr-2" />
                  ) : (
                    <ZoomIn className="w-5 h-5 mr-2" />
                  )}
                  {isZoomed ? 'Thu nhỏ' : 'Phóng to'}
                </Button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {service.images.length > 1 && (
              <div className="absolute bottom-20 left-0 right-0 z-10">
                <div className="flex justify-center">
                  <div className="flex space-x-3 p-3 bg-black/50 rounded-xl backdrop-blur-sm max-w-lg overflow-x-auto border border-white/20">
                    {service.images.map((image, index) => (
                      <button
                        key={index}
                        className={cn(
                          'relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                          currentImageIndex === index
                            ? 'border-white scale-110'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        )}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
