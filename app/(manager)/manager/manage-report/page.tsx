'use client';

import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { useGetListReport, useUpdateReport, useGetManagerProfile } from '@/hooks/useManager';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  CalendarClock,
  Filter,
  RefreshCcw,
  ArrowUpDown,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { Report } from '@/lib/api/services/fetchManager';
import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { cn } from '@/lib/utils';

type StatusFilter = 'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED';

const statusColorMap: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
};

type IconComponent = ComponentType<{ className?: string }>;
const statusIconMap: Record<string, IconComponent> = {
  PENDING: Clock,
  RESOLVED: CheckCircle,
  REJECTED: XCircle,
};

const statusTextMap: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã xử lý',
  REJECTED: 'Từ chối',
};

export default function ManageReportPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, refetch, isFetching } = useGetListReport({
    page,
    limit,
    status: status === 'ALL' ? undefined : status,
  });

  // current manager profile (publics/get-me)
  const { data: me } = useGetManagerProfile();
  const currentUserId = me?.data?.id;

  // update report mutation
  const { mutate: updateReport, isPending: isUpdating } = useUpdateReport();
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState<string>('');
  const [lockedReportId, setLockedReportId] = useState<number | null>(null);

  // Update dialog (single button action) state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'RESOLVED' | 'REJECTED'>(
    'PENDING'
  );
  const [note, setNote] = useState<string>('');

  const handleSubmitUpdate = () => {
    if (!selectedReportId) return;
    updateReport(
      {
        id: selectedReportId,
        status: selectedStatus,
        reviewedAt: new Date().toISOString(),
        reviewedById: currentUserId ?? undefined,
        note: note?.trim() ? note.trim() : undefined,
      },
      {
        onSuccess: () => {
          setUpdateDialogOpen(false);
          setSelectedReportId(null);
          setNote('');
        },
        onError: (err: unknown) => {
          setLockedReportId(selectedReportId);
          const msg =
            typeof err === 'object' && err !== null && 'message' in err
              ? String((err as { message?: string }).message || '')
              : '';
          setErrorDialogMsg(
            msg || 'Không thể cập nhật báo cáo. Vui lòng thử lại hoặc liên hệ hỗ trợ.'
          );
          setErrorDialogOpen(true);
        },
      }
    );
  };

  const totalPages = data?.totalPages ?? 1;
  const reports = data?.data ?? [];

  const columns = useMemo<ColumnDef<Report>[]>(
    () => [
      // {
      //   accessorKey: 'id',
      //   header: ({ column }) => {
      //     return (
      //       <Button
      //         variant="ghost"
      //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      //         className="h-8 px-2 text-left justify-start font-medium"
      //       >
      //         ID
      //         <ArrowUpDown className="ml-2 h-4 w-4" />
      //       </Button>
      //     );
      //   },
      //   cell: ({ row }) => (
      //     <div className="font-mono text-sm font-medium text-muted-foreground">
      //       #{row.original.id}
      //     </div>
      //   ),
      //   size: 80,
      // },
      // {
      //   accessorKey: 'bookingId',
      //   header: ({ column }) => {
      //     return (
      //       <Button
      //         variant="ghost"
      //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      //         className="h-8 px-2 text-left justify-start font-medium"
      //       >
      //         Booking
      //         <ArrowUpDown className="ml-2 h-4 w-4" />
      //       </Button>
      //     );
      //   },
      //   cell: ({ row }) => (
      //     <div className="font-mono text-sm">
      //       <Badge variant="outline" className="font-medium">
      //         #{row.original.bookingId}
      //       </Badge>
      //     </div>
      //   ),
      //   size: 100,
      // },
      {
        accessorKey: 'imageUrls',
        header: 'Hình ảnh',
        cell: ({ row }) => (
          <div className="flex gap-2">
            {(row.original.imageUrls || []).slice(0, 3).map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`report-${row.original.id}-${idx}`}
                className="w-10 h-10 rounded object-cover border"
              />
            ))}
          </div>
        ),
        size: 160,
      },
      {
        accessorKey: 'reason',
        header: 'Lý do',
        cell: ({ row }) => (
          <div className="max-w-[280px]">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span
                className="text-sm font-medium leading-5 line-clamp-2"
                title={row.original.reason}
              >
                {row.original.reason}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Mô tả',
        cell: ({ row }) => (
          <div className="w-80">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p
                  className="text-sm text-muted-foreground leading-5"
                  title={row.original.description}
                >
                  {row.original.description}
                </p>
                {row.original.note && (
                  <p className="text-xs text-muted-foreground">
                    Ghi chú: <span className="text-foreground">{row.original.note}</span>
                  </p>
                )}
                {row.original.reviewResponse && (
                  <p className="text-xs text-muted-foreground">
                    Phản hồi: <span className="text-foreground">{row.original.reviewResponse}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 text-left justify-start font-medium"
            >
              Trạng thái
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = row.original.status;
          const StatusIcon = statusIconMap[status] || AlertCircle;

          return (
            <Badge
              className={cn(
                'border transition-colors duration-200',
                statusColorMap[status] ?? 'bg-slate-50 text-slate-700 border-slate-200'
              )}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusTextMap[status] || status}
              {row.original.reporterType && (
                <span className="ml-2 text-[10px] opacity-80">[{row.original.reporterType}]</span>
              )}
            </Badge>
          );
        },
        size: 140,
      },
      {
        accessorKey: 'CustomerProfile',
        header: 'Khách hàng',
        cell: ({ row }) => {
          const cp = row.original.CustomerProfile;
          return cp ? (
            <div className="flex items-center gap-2 max-w-[280px]">
              <img
                src={cp.user?.avatar || ''}
                alt={cp.user?.name || ''}
                className="w-8 h-8 rounded-full border object-cover"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{cp.user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{cp.user?.email}</div>
                <div className="text-xs text-muted-foreground truncate">{cp.user?.phone}</div>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">--</span>
          );
        },
        size: 260,
      },
      {
        accessorKey: 'ServiceProvider',
        header: 'Nhà cung cấp',
        cell: ({ row }) => {
          const sp = row.original.ServiceProvider;
          return sp ? (
            <div className="flex items-center gap-2 max-w-[320px]">
              <div className="w-8 h-8 rounded-full border bg-muted flex items-center justify-center overflow-hidden">
                {sp.logo ? (
                  <img
                    src={sp.logo}
                    alt={sp.user?.name || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] px-1 text-muted-foreground">
                    {sp.user?.name?.slice(0, 2).toUpperCase() || '--'}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{sp.user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{sp.user?.email}</div>
                <div className="text-xs text-muted-foreground truncate">{sp.address}</div>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">--</span>
          );
        },
        size: 320,
      },
      {
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => {
          if (lockedReportId === row.original.id) {
            return <span className="text-xs text-muted-foreground">--</span>;
          }
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                disabled={isUpdating}
                onClick={() => {
                  setSelectedReportId(row.original.id);
                  setSelectedStatus(
                    (row.original.status?.toUpperCase?.() as 'PENDING' | 'RESOLVED' | 'REJECTED') ||
                      'PENDING'
                  );
                  setNote(row.original.note || '');
                  setUpdateDialogOpen(true);
                }}
                title="Cập nhật báo cáo"
              >
                Cập nhật
              </Button>
            </div>
          );
        },
        size: 140,
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 text-left justify-start font-medium"
            >
              Thời gian
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
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
        size: 160,
      },
    ],
    []
  );

  const table = useReactTable({
    data: reports,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const headerActions = useMemo(
    () => (
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={v => setStatus(v as StatusFilter)}>
            <SelectTrigger className="w-[180px] h-10">
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
                  Chờ xử lý
                </div>
              </SelectItem>
              <SelectItem value="RESOLVED">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Đã xử lý
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

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10"
          >
            <RefreshCcw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
            Làm mới
          </Button>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm font-medium">
            Trang {page} / {totalPages}
          </span>
        </div>
      </div>
    ),
    [isFetching, page, refetch, status, totalPages]
  );

  return (
    <div className="p-0 md:p-0">
      <SiteHeader title="Quản lý báo cáo" />
      <div className="p-4 md:p-6 pt-0 space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-6 pb-6">{headerActions}</CardHeader>

          <CardContent className="px-6 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="rounded-lg border">
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-4">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-4 w-20" />
                      ))}
                    </div>
                  </div>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="p-4 border-b last:border-b-0">
                      <div className="flex items-center gap-4">
                        {Array.from({ length: 6 }).map((_, cellIdx) => (
                          <Skeleton key={cellIdx} className="h-8 flex-1" />
                        ))}
                      </div>
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
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileText className="h-8 w-8" />
                            <p className="text-sm font-medium">Không có báo cáo nào</p>
                            <p className="text-xs">Hãy thử thay đổi bộ lọc</p>
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

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground font-medium">
                  Tổng <span className="font-bold text-foreground">{data?.total ?? 0}</span> báo cáo
                </div>
                <Select value={String(limit)} onValueChange={v => setLimit(Number(v))}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / trang</SelectItem>
                    <SelectItem value="20">20 / trang</SelectItem>
                    <SelectItem value="50">50 / trang</SelectItem>
                  </SelectContent>
                </Select>
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
                      className={cn(page <= 1 && 'pointer-events-none opacity-50')}
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
                          className={cn(
                            p === page && 'bg-primary text-primary-foreground font-medium'
                          )}
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
                      className={cn(page >= totalPages && 'pointer-events-none opacity-50')}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lỗi cập nhật</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">{errorDialogMsg}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setErrorDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật báo cáo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm">Mã báo cáo: #{selectedReportId ?? '--'}</div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={selectedStatus}
                onValueChange={v => setSelectedStatus(v as 'PENDING' | 'RESOLVED' | 'REJECTED')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                  <SelectItem value="RESOLVED">Đã xử lý</SelectItem>
                  <SelectItem value="REJECTED">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                placeholder="Nhập ghi chú (tùy chọn)"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="min-h-[96px]"
              />
            </div> */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitUpdate} disabled={isUpdating}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
