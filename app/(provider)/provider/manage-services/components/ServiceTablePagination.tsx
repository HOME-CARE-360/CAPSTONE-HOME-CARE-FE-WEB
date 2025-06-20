'use client';

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

interface ServiceTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ServiceTablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ServiceTablePaginationProps) {
  // Calculate the range of items being displayed
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 10; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex justify-between gap-4 px-2 py-4">
      <div className="text-muted-foreground">
        Hiển thị {startItem}-{endItem} trong tổng số {totalItems} dịch vụ
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={e => {
                e.preventDefault();
                if (page > 1) onPageChange(page - 1);
              }}
              className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              aria-disabled={page <= 1}
            />
          </PaginationItem>

          {getPageNumbers().map((pageNumber, i) => (
            <PaginationItem key={i}>
              {pageNumber === '...' ? (
                <Button variant="ghost" size="icon" disabled className="px-4 cursor-default">
                  ...
                </Button>
              ) : (
                <PaginationLink
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onPageChange(Number(pageNumber));
                  }}
                  isActive={page === pageNumber}
                  className="px-4"
                >
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={e => {
                e.preventDefault();
                if (page < totalPages) onPageChange(page + 1);
              }}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
              aria-disabled={page >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Hiển thị</span>
        <Select
          value={pageSize.toString()}
          onValueChange={value => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">mỗi trang</span>
      </div>
    </div>
  );
}
