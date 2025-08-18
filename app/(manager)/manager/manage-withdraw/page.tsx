'use client';

import { useMemo, useState, useEffect } from 'react';
import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { useGetListWithdraw, useGetWithdrawDetail, useUpdateWithdraw } from '@/hooks/useManager';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Currency, formatCurrency } from '@/utils/numbers/formatCurrency';
import { CalendarClock, ArrowUpDown, Filter, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type WithdrawStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const statusColorMap: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusTextMap: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export default function ManageWithdrawPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<WithdrawStatus>('ALL');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useGetListWithdraw({
    page,
    limit,
    status: status === 'ALL' ? undefined : status,
  });

  const totalPages = data?.pagination?.pages ?? 1;
  const rows = data?.data ?? [];

  const { data: detail, isLoading: isDetailLoading } = useGetWithdrawDetail(selectedId);
  const { mutate: updateWithdraw, isPending: isUpdating } = useUpdateWithdraw();

  const [updateStatus, setUpdateStatus] = useState<'APPROVED' | 'REJECTED' | 'PENDING'>('PENDING');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (detail) {
      const s = (detail.status as 'APPROVED' | 'REJECTED' | 'PENDING') || 'PENDING';
      setUpdateStatus(s);
      setNote(detail.note ?? '');
    }
  }, [detail]);

  const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-left justify-start font-medium"
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-mono text-sm">#{row.original.id}</span>,
        size: 80,
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-left justify-start font-medium"
          >
            Số tiền
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold">{formatCurrency(row.original.amount, Currency.VND)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-left justify-start font-medium"
          >
            Trạng thái
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge
            className={cn(
              'border',
              statusColorMap[row.original.status] ?? 'bg-slate-50 text-slate-700 border-slate-200'
            )}
          >
            {statusTextMap[row.original.status] ?? row.original.status}
          </Badge>
        ),
        size: 140,
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-left justify-start font-medium"
          >
            Thời gian tạo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="inline-flex items-center gap-2 text-muted-foreground whitespace-nowrap">
            <CalendarClock className="h-4 w-4" />
            <div className="text-sm">
              <div className="font-medium text-foreground">
                {new Date(row.original.createdAt).toLocaleDateString('vi-VN')}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(row.original.createdAt).toLocaleTimeString('vi-VN')}
              </div>
            </div>
          </div>
        ),
        size: 180,
      },
      {
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedId(row.original.id);
              setOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" /> Chi tiết
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const headerActions = (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={v => setStatus(v as WithdrawStatus)}>
          <SelectTrigger className="w-[200px] h-10">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Tất cả
              </div>
            </SelectItem>
            <SelectItem value="PENDING">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Chờ duyệt
              </div>
            </SelectItem>
            <SelectItem value="APPROVED">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Đã duyệt
              </div>
            </SelectItem>
            <SelectItem value="REJECTED">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-600" />
                Từ chối
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="h-10">
          Làm mới
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        Trang {page} / {totalPages}
      </div>
    </div>
  );

  return (
    <div className="p-0 md:p-0">
      <SiteHeader title="Quản lý rút tiền" />
      <div className="p-4 md:p-6 pt-0 space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-6 pb-6">{headerActions}</CardHeader>
          <CardContent className="px-6 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="rounded-lg border">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="p-4 border-b last:border-b-0">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                        {headerGroup.headers.map(header => (
                          <TableHead key={header.id} className="h-12 px-4 font-semibold">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-32 text-center">
                          <div className="text-sm text-muted-foreground">
                            Không có yêu cầu rút tiền
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row, index) => (
                        <TableRow
                          key={row.id}
                          className={cn(
                            'hover:bg-muted/50 transition-colors duration-150',
                            index % 2 === 0 && 'bg-muted/10'
                          )}
                        >
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id} className="px-4 py-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Tổng{' '}
                <span className="font-semibold text-foreground">
                  {data?.pagination?.total ?? 0}
                </span>{' '}
                yêu cầu
              </div>
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
          </CardContent>
        </Card>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Chi tiết rút tiền #{selectedId}</SheetTitle>
            <SheetDescription>Thông tin chi tiết yêu cầu rút tiền</SheetDescription>
          </SheetHeader>

          {isDetailLoading ? (
            <div className="space-y-3 mt-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-6 w-full" />
              ))}
            </div>
          ) : detail ? (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Mã yêu cầu</div>
                <div className="font-medium">#{detail.id}</div>

                <div className="text-muted-foreground">Số tiền</div>
                <div className="font-semibold">{formatCurrency(detail.amount, Currency.VND)}</div>

                <div className="text-muted-foreground">Trạng thái</div>
                <div>
                  <Badge
                    className={cn(
                      'border',
                      statusColorMap[detail.status] ?? 'bg-slate-50 text-slate-700 border-slate-200'
                    )}
                  >
                    {statusTextMap[detail.status] ?? detail.status}
                  </Badge>
                </div>

                <div className="text-muted-foreground">Ngày tạo</div>
                <div>{new Date(detail.createdAt).toLocaleString('vi-VN')}</div>

                <div className="text-muted-foreground">Xử lý lúc</div>
                <div>
                  {detail.processedAt ? new Date(detail.processedAt).toLocaleString('vi-VN') : '-'}
                </div>

                <div className="text-muted-foreground">Ghi chú</div>
                <div>{detail.note ?? '-'}</div>

                <div className="text-muted-foreground">Người dùng</div>
                <div>
                  {detail.User ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{detail.User.name ?? '-'}</span>
                      <span className="text-xs text-muted-foreground">
                        {detail.User.email ?? '-'}
                      </span>
                    </div>
                  ) : (
                    '-'
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Cập nhật trạng thái</Label>
                <Select
                  value={updateStatus}
                  onValueChange={v => setUpdateStatus(v as 'APPROVED' | 'REJECTED' | 'PENDING')}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                    <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                    <SelectItem value="REJECTED">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="note" className="text-sm font-medium">
                  Ghi chú
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Nhập ghi chú (tuỳ chọn)"
                />
              </div>

              <SheetFooter className="gap-2">
                <Button
                  onClick={() => {
                    if (!selectedId) return;
                    updateWithdraw(
                      { id: selectedId, status: updateStatus, note },
                      {
                        onSuccess: () => setOpen(false),
                      }
                    );
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={isUpdating}>
                  Đóng
                </Button>
              </SheetFooter>
            </div>
          ) : (
            <div className="mt-6 text-sm text-muted-foreground">Không tìm thấy dữ liệu</div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
