import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServicesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ServicesPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: ServicesPaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
      {/* Page Info */}
      <div className="text-sm text-muted-foreground">
        Trang <span className="font-medium">{currentPage}</span> trong{' '}
        <span className="font-medium">{totalPages}</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'h-9 w-9 border-green-200 hover:bg-green-50 hover:border-green-300',
            currentPage === 1 && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'h-9 w-9 border-green-200 hover:bg-green-50 hover:border-green-300',
            currentPage === 1 && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`dots-${index}`} className="h-9 w-9 flex items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'h-9 w-9 transition-all duration-200',
                  isActive
                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                    : 'border-green-200 hover:bg-green-50 hover:border-green-300 text-gray-700'
                )}
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'h-9 w-9 border-green-200 hover:bg-green-50 hover:border-green-300',
            currentPage === totalPages && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'h-9 w-9 border-green-200 hover:bg-green-50 hover:border-green-300',
            currentPage === totalPages && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || isLoading}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Items Info (Optional) */}
      <div className="text-sm text-muted-foreground hidden sm:block">
        {totalPages * 8 - 7} - {Math.min(currentPage * 8, totalPages * 8)} dịch vụ
      </div>
    </div>
  );
}
