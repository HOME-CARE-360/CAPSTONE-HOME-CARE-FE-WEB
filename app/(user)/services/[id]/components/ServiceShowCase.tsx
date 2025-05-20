'use client';

import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  //MapPin,
  X,
  ZoomIn,
  ZoomOut,
  Camera,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { useState } from 'react';
//import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Service } from '@/lib/api/services/fetchService';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

interface ServiceShowcaseProps {
  service: Service;
}

export default function ServiceShowcase({ service }: ServiceShowcaseProps) {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showFocusedImage, setShowFocusedImage] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Only display first 5 images in the grid
  const displayImages = service.imageUrls.slice(0, 5);

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === service.imageUrls.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? service.imageUrls.length - 1 : prev - 1));
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const openFocusedImage = (index: number) => {
    setCurrentImageIndex(index);
    setShowFocusedImage(true);
  };

  return (
    <div className="mb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
        <Link href="/properties" className="hover:text-foreground transition-colors">
          Tìm kiếm
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link
          href={`/services?city=${service.location.city}`}
          className="hover:text-foreground transition-colors"
        >
          {service.location.city}
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link
          href={`/services?district=${service.location.district}`}
          className="hover:text-foreground transition-colors"
        >
          {service.location.district}
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground font-medium">{service.name}</span>
      </nav>

      {/* Main Gallery Layout - 5 Images */}
      <div className="relative w-full mb-8 rounded-xl overflow-hidden group">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-[20rem] md:h-[40rem]">
          {/* Main Large Image */}
          <div
            className="col-span-1 md:col-span-6 relative cursor-zoom-in overflow-hidden"
            onClick={() => {
              setCurrentImageIndex(0);
              setShowAllImages(true);
            }}
          >
            <Image
              src={displayImages[0]}
              alt={`${service.name} - Main View`}
              fill
              className="object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none transition-transform duration-300 group-hover:scale-105"
              sizes="(max-inline-size: 768px) 100vw, 50vw"
              priority
              loading="eager"
              quality={75}
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Right Side Grid - 4 Images */}
          <div className="hidden md:grid md:col-span-6 grid-cols-2 grid-rows-2 gap-2">
            {displayImages.slice(1, 5).map((image, index) => (
              <motion.div
                key={index}
                className={`relative cursor-zoom-in overflow-hidden ${
                  index === 0 ? 'rounded-tr-xl' : index === 3 ? 'rounded-br-xl' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setCurrentImageIndex(index + 1);
                  setShowAllImages(true);
                }}
              >
                <Image
                  src={image}
                  alt={`${service.name} - View ${index + 2}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-inline-size: 768px) 100vw, 25vw"
                  loading="lazy"
                  quality={75}
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Show All Photos Button */}
        <Button
          variant="outline"
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-black font-medium rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all duration-300 opacity-90 group-hover:opacity-100"
          onClick={() => setShowAllImages(true)}
        >
          <Camera className="w-4 h-4 mr-2" />
          {t('service_detail.view_all')} {service.imageUrls.length} {t('service_detail.photos')}
        </Button>

        {/* Image Counter Badge */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {currentImageIndex + 1} / {service.imageUrls.length}
        </div>
      </div>

      {/* Full Gallery Modal */}
      {showAllImages && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          {/* Gallery Header */}
          <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100"
              onClick={() => setShowAllImages(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-medium">
              {service.name} {t('service_detail.photos')}
            </h2>
            <div className="w-10" /> {/* Empty div for balance */}
          </div>

          {/* Gallery Grid */}
          <div className="container mx-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {service.imageUrls.map((image, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer aspect-[9/16] rounded-lg overflow-hidden"
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
              {currentImageIndex + 1} / {service.imageUrls.length}
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
                className={`relative w-full h-full flex items-center justify-center ${
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={toggleZoom}
              >
                <div className={`relative ${isZoomed ? 'w-full h-full' : 'w-4/5 h-4/5'}`}>
                  <Image
                    src={service.imageUrls[currentImageIndex]}
                    alt={`${service.name} - View ${currentImageIndex + 1}`}
                    fill
                    className={`object-contain transition-transform duration-300 ${
                      isZoomed ? 'scale-125' : 'scale-100'
                    }`}
                    quality={90}
                    priority
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
