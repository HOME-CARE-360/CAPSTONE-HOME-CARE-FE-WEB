'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ServiceItemForm } from './ServiceItemForm';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceItem } from '@/lib/api/services/fetchServiceItem';

interface ServiceItemCardProps {
  isEditMode: boolean;
  isLoading: boolean;
  serviceItemData?: ServiceItem | null;
}

export function ServiceItemCard({ isEditMode, isLoading, serviceItemData }: ServiceItemCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-5 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Item Name Field */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Brand and Model Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Price and Stock Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Image Upload Field */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>

          {/* Submit Button */}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Cập nhật mục dịch vụ' : 'Thêm mục dịch vụ'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Cập nhật mục dịch vụ của bạn'
            : 'Thêm mục dịch vụ mới vào danh sách của bạn'}
        </p>
      </div>
      <div className="mt-4">
        <ServiceItemForm initialData={serviceItemData} isEditMode={isEditMode} />
      </div>
    </div>
  );
}
