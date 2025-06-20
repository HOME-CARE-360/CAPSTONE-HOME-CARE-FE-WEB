'use client';

import { useState } from 'react';
import { useServices } from '@/hooks/useService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceCard } from '@/components/ServiceCard';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function FeaturedServices() {
  const [page] = useState(1);

  const { data, isLoading, isError } = useServices({ page, limit: 10 });

  // Get featured services (for now, just take the first 4 services)
  // This can be updated once we have a featured flag in the API
  const featuredServices = data?.services?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <section className="flex justify-center items-center min-h-[500px] bg-background text-foreground ">
        <SkeletonGrid />
      </section>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[500px] text-red-500">
        Lỗi tải dịch vụ
      </div>
    );
  }

  return (
    <section className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background text-foreground ">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold">Dịch vụ nổi bật</h2>
          <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-5xl">
            Dịch vụ nổi bật
          </p>
        </div>
        <Link href="/services">
          <Button
            variant="outline"
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-600 hover:border-red-200"
          >
            Xem tất cả dịch vụ
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredServices.map((service, index) => (
          <ServiceCard key={service.id} service={service} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

// Skeleton component for loading state
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-screen-xl px-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-background border-muted-foreground/20">
          <Skeleton className="w-full h-64 rounded-t-lg" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between items-center mt-6">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
