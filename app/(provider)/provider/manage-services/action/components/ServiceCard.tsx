'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ServiceForm } from './ServiceForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '@/lib/api/services/fetchCategory';
import { ServiceManager } from '@/lib/api/services/fetchServiceManager';

interface ServiceCardProps {
  isEditMode: boolean;
  isLoading: boolean;
  serviceData?: ServiceManager;
  categories: Category[];
}

export function ServiceCard({ isEditMode, isLoading, serviceData, categories }: ServiceCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-5 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Duration Field */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Categories Field */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-2/3" />
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
        <h1 className="text-2xl font-bold">{isEditMode ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ'}</h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Cập nhật dịch vụ của bạn'
            : 'Thêm dịch vụ mới vào danh sách dịch vụ của bạn'}
        </p>
      </div>
      <div className="mt-4">
        <ServiceForm initialData={serviceData} categories={categories} isEditMode={isEditMode} />
      </div>
    </div>
  );
}
