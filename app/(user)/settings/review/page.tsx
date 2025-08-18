'use client';

import { useState } from 'react';
import { useDeleteUserReview, useGetUserReviews } from '@/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Calendar, Search, Star, Trash2 } from 'lucide-react';

export default function UserReviewsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState<string>('ALL');

  const { data, isLoading, isFetching, refetch } = useGetUserReviews({
    page,
    limit,
    search: search || undefined,
    rating: rating === 'ALL' ? undefined : Number(rating),
  });

  const { mutate: deleteReview, isPending: isDeleting } = useDeleteUserReview();

  const totalPages = data?.data.data.totalPages ?? 1;
  const totalItems = data?.data.data.totalItems ?? 0;
  const reviews = data?.data.data.reviews ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-semibold">Đánh giá của tôi</CardTitle>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo bình luận hoặc mã đơn..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {[5, 4, 3, 2, 1].map(n => (
                    <SelectItem key={n} value={String(n)}>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: n }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-500" />
                        ))}
                        {n} sao
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                Làm mới
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Điểm</TableHead>
                    <TableHead>Bình luận</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Không có đánh giá
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews.map(r => (
                      <TableRow key={r.id}>
                        <TableCell>#{r.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">#{r.booking?.id}</span>
                            {r.provider?.name && (
                              <span className="text-xs text-muted-foreground">
                                {r.provider.name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 text-yellow-500" />
                            ))}
                            <Badge variant="outline" className="ml-1">
                              {r.rating}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[420px] truncate" title={r.comment}>
                          {r.comment}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(r.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteReview({ reviewId: r.id })}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {totalItems > 10 && (
            <div className="mt-4 flex items-center justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + index;
                    if (p > totalPages) return null;
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={e => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
