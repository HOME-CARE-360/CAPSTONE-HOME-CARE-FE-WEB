'use client';

import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

interface CategoryTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
  showPageSizeSelector?: boolean;
  showItemsInfo?: boolean;
  pageSizeOptions?: number[];
  maxVisiblePages?: number;
}

export function CategoryTablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  showPageSizeSelector = true,
  showItemsInfo = true,
  pageSizeOptions = [5, 10, 20, 50, 100],
  maxVisiblePages = 7,
}: CategoryTablePaginationProps) {
  // Calculate the range of items being displayed
  const startItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, totalItems);

  // Smart page number generation with better UX
  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor((maxVisiblePages - 2) / 2); // Reserve 2 slots for first/last

    // Show pages around current page
    if (page <= halfVisible + 2) {
      // Current page is near the beginning
      return [...Array.from({ length: maxVisiblePages - 2 }, (_, i) => i + 1), '...', totalPages];
    }

    if (page >= totalPages - halfVisible - 1) {
      // Current page is near the end
      return [
        1,
        '...',
        ...Array.from(
          { length: maxVisiblePages - 2 },
          (_, i) => totalPages - (maxVisiblePages - 3) + i
        ),
      ];
    }

    // Current page is in the middle
    return [1, '...', ...Array.from({ length: 3 }, (_, i) => page - 1 + i), '...', totalPages];
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (loading) return;

    // Calculate what item position user is currently viewing
    const currentFirstItem = (page - 1) * pageSize + 1;

    // Calculate what page this item would be on with new page size
    const newPage = Math.ceil(currentFirstItem / newPageSize);
    const maxNewPage = Math.ceil(totalItems / newPageSize);

    onPageSizeChange(newPageSize);

    // Adjust page if necessary
    if (newPage !== page && newPage <= maxNewPage) {
      onPageChange(Math.min(newPage, maxNewPage));
    }
  };

  const hasMultiplePages = totalPages > 1;

  return (
    <div className="flex flex-col gap-4 px-2 py-4">
      {/* Mobile Layout */}
      <div className="flex sm:hidden flex-col gap-4">
        {showItemsInfo && (
          <div className="text-sm text-muted-foreground text-center">
            Hiện {startItem} - {endItem} trên {totalItems} mục
          </div>
        )}

        {hasMultiplePages && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="flex items-center gap-2"
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-2"
            >
              Next
            </Button>
          </div>
        )}

        {showPageSizeSelector && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Hiển thị</span>
            <Select
              value={pageSize.toString()}
              onValueChange={value => handlePageSizeChange(Number(value))}
              disabled={loading}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">trên mỗi trang</span>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        {/* Items Info */}
        {showItemsInfo && (
          <div className="text-sm text-muted-foreground">
            Hiện{' '}
            <span className="font-medium">
              {startItem} - {endItem}
            </span>{' '}
            trên <span className="font-medium">{totalItems}</span> mục
          </div>
        )}

        {/* Pagination Controls */}
        {hasMultiplePages && (
          <Pagination>
            <PaginationContent>
              {/* First Page Button */}
              {totalPages > maxVisiblePages && page > Math.floor(maxVisiblePages / 2) + 1 && (
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={loading}
                    className="h-9 w-9"
                    title="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              )}

              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    handlePageChange(page - 1);
                  }}
                  className={
                    page <= 1 || loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                  aria-disabled={page <= 1 || loading}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {getVisiblePages().map((pageNumber, index) => (
                <PaginationItem key={`${pageNumber}-${index}`}>
                  {pageNumber === '...' ? (
                    <Button variant="ghost" size="icon" disabled className="h-9 w-9 cursor-default">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        handlePageChange(Number(pageNumber));
                      }}
                      isActive={page === pageNumber}
                      className={`h-9 w-9 ${
                        loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }`}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    handlePageChange(page + 1);
                  }}
                  className={
                    page >= totalPages || loading
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                  aria-disabled={page >= totalPages || loading}
                />
              </PaginationItem>

              {/* Last Page Button */}
              {totalPages > maxVisiblePages &&
                page < totalPages - Math.floor(maxVisiblePages / 2) && (
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={loading}
                      className="h-9 w-9"
                      title="Last page"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                )}
            </PaginationContent>
          </Pagination>
        )}

        {/* Page Size Selector */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Hiển thị</span>
            <Select
              value={pageSize.toString()}
              onValueChange={value => handlePageSizeChange(Number(value))}
              disabled={loading}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">trên mỗi trang</span>
          </div>
        )}
      </div>

      {/* Loading State Indicator */}
      {loading && <div className="text-center text-sm text-muted-foreground">Loading...</div>}
    </div>
  );
}
