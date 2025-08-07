'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText, Calendar, Clock } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'search' | 'file' | 'calendar' | 'clock';
}

export function EmptyState({ title, description, icon = 'file' }: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return Search;
      case 'calendar':
        return Calendar;
      case 'clock':
        return Clock;
      default:
        return FileText;
    }
  };

  const Icon = getIcon();

  return (
    <div className="space-y-6">
      {/* Main Empty State */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 max-w-md leading-relaxed">{description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
