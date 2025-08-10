'use client';

import { useState } from 'react';
import { WorkLogCard } from './WorkLogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';

interface WorkLogListProps {
  workLogs: Array<{
    id: number;
    checkIn?: string | null;
    checkOut?: string | null;
    note?: string | null;
    createdAt: string;
    booking: {
      id: number;
      status: string;
      createdAt: string;
    };
  }>;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function WorkLogList({ workLogs, isLoading = false }: WorkLogListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Pagination
  const totalPages = Math.ceil(workLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWorkLogs = workLogs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1);
        items.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        items.push(1);
        items.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      }
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
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

  if (workLogs.length === 0) {
    return (
      <div className="space-y-6">
        <Alert className="border border-gray-200 bg-white">
          <AlertDescription className="text-gray-600">
            Chưa có dữ liệu work log nào. Hãy bắt đầu làm việc để thấy dữ liệu ở đây.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Work Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedWorkLogs.map(workLog => (
          <WorkLogCard key={workLog.id} workLog={workLog} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {generatePaginationItems().map((item, index) => (
              <PaginationItem key={index}>
                {item === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      handlePageChange(item as number);
                    }}
                    isActive={currentPage === item}
                    className={currentPage === item ? 'bg-gray-900 text-white' : ''}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
