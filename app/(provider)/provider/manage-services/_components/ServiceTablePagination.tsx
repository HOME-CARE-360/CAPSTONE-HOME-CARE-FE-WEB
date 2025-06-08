import { useTranslation } from 'react-i18next';
import {
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationItem,
  PaginationEllipsis,
  PaginationNext,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';

interface ServiceTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function ServiceTablePagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: ServiceTablePaginationProps) {
  const { t } = useTranslation();

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {totalItems} {t('items')}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <PaginationPrevious className="h-4 w-4" />
            </Button>
          </PaginationItem>

          {/* First page */}
          {page > 2 && (
            <PaginationItem>
              <Button variant="ghost" size="icon" onClick={() => handlePageChange(1)}>
                1
              </Button>
            </PaginationItem>
          )}

          {/* Ellipsis if needed */}
          {page > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Previous page */}
          {page > 1 && (
            <PaginationItem>
              <Button variant="ghost" size="icon" onClick={() => handlePageChange(page - 1)}>
                {page - 1}
              </Button>
            </PaginationItem>
          )}

          {/* Current page */}
          <PaginationItem>
            <Button variant="default" size="icon" onClick={() => handlePageChange(page)}>
              {page}
            </Button>
          </PaginationItem>

          {/* Next page */}
          {page < totalPages && (
            <PaginationItem>
              <Button variant="ghost" size="icon" onClick={() => handlePageChange(page + 1)}>
                {page + 1}
              </Button>
            </PaginationItem>
          )}

          {/* Ellipsis if needed */}
          {page < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Last page */}
          {page < totalPages - 1 && (
            <PaginationItem>
              <Button variant="ghost" size="icon" onClick={() => handlePageChange(totalPages)}>
                {totalPages}
              </Button>
            </PaginationItem>
          )}

          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <PaginationNext className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
