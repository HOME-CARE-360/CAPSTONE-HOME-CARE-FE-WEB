'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ServiceForm } from './ServiceForm';
import { useServiceManagerDetail } from '@/hooks/useServiceManager';
import { useCategories } from '@/hooks/useCategory';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceSheetProps {
  serviceId?: number | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ServiceSheet({ serviceId, trigger, open, onOpenChange }: ServiceSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEditing = !!serviceId;

  const { data: serviceData, isLoading: isServiceLoading } = useServiceManagerDetail(
    serviceId || null
  );
  const { data: categoryData, isLoading: isCategoryLoading } = useCategories();

  const isLoading = isCategoryLoading || isServiceLoading;
  const allCategories = categoryData?.categories || [];

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const LoadingSkeleton = () => (
    <div className="space-y-6 p-4">
      {/* Service Name Field */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Price Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Submit Button */}
      <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Cập nhật thông tin dịch vụ của bạn'
              : 'Tạo dịch vụ mới để cung cấp cho khách hàng'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <ServiceForm
              initialData={serviceData?.data}
              categories={allCategories}
              isEditMode={isEditing}
              onSuccess={() => setIsOpen(false)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
