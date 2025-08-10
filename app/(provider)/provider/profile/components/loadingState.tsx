import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingState() {
  return (
    <div className="container max-w-screen-2xl mx-auto py-10">
      {/* Skeleton for header/background */}
      <div className="relative w-full h-[200px] md:h-[350px] mb-6">
        <Skeleton className="h-full w-full rounded-lg" />
        <div className="absolute bottom-0 left-6 transform translate-y-1/2">
          <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full" />
        </div>
      </div>

      {/* Skeleton for profile info */}
      <div className="mt-16 md:mt-20 px-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Skeleton tabs */}
        <div className="mt-10 border-b mb-6">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border shadow-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton for about section */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
