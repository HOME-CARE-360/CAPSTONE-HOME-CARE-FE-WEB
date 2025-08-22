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
import Image from 'next/image';

type WithdrawStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

const statusColorMap: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-50 text-gray-700 border-gray-200',
};

const statusTextMap: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
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

  const [updateStatus, setUpdateStatus] = useState<
    'APPROVED' | 'REJECTED' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
  >('PENDING');
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
      // {
      //   accessorKey: 'id',
      //   header: ({ column }) => (
      //     <Button
      //       variant="ghost"
      //       onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      //       className="h-8 px-2 text-left justify-start font-medium"
      //     >
      //       ID
      //       <ArrowUpDown className="ml-2 h-4 w-4" />
      //     </Button>
      //   ),
      //   cell: ({ row }) => <span className="font-mono text-sm">#{row.original.id}</span>,
      //   size: 80,
      // },
      {
        accessorKey: 'User.name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-left justify-start font-medium"
          >
            Người dùng
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          // Handle both response structures
          const user = row.original.User || row.original.User_WithdrawalRequest_userIdToUser;
          return (
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate">{user?.name ?? 'N/A'}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email ?? 'N/A'}</span>
              {user?.phone && (
                <span className="text-xs text-muted-foreground truncate">{user.phone}</span>
              )}
            </div>
          );
        },
        size: 200,
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
          <span className="font-semibold text-lg">
            {formatCurrency(row.original.amount, Currency.VND)}
          </span>
        ),
        size: 120,
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
        size: 120,
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
        size: 160,
      },
      {
        accessorKey: 'processedAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-left justify-start font-medium"
          >
            Thời gian xử lý
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.processedAt ? (
              <div className="inline-flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium text-foreground">
                    {new Date(row.original.processedAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(row.original.processedAt).toLocaleTimeString('vi-VN')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm">Chưa xử lý</span>
              </div>
            )}
          </div>
        ),
        size: 160,
      },
      {
        accessorKey: 'note',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-left justify-start font-medium"
          >
            Ghi chú
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm max-w-[200px]">
            {row.original.note ? (
              <span className="line-clamp-2 text-muted-foreground" title={row.original.note}>
                {row.original.note}
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
        size: 200,
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
        size: 120,
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
            <SelectItem value="CANCELLED">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-600" />
                Đã hủy
              </div>
            </SelectItem>
            <SelectItem value="COMPLETED">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Đã hoàn thành
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
        <SheetContent side="right" className="w-full h-screen md:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết rút tiền #{selectedId}</SheetTitle>
            <SheetDescription>Thông tin chi tiết yêu cầu rút tiền</SheetDescription>
          </SheetHeader>

          {isDetailLoading ? (
            <div className="space-y-3 mt-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} className="h-6 w-full" />
              ))}
            </div>
          ) : detail ? (
            <div className="mt-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 gap-4 p-4 bg-muted/20 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-muted-foreground">Mã yêu cầu</div>
                    <div className="font-mono font-medium">#{detail.id}</div>

                    <div className="text-muted-foreground">Số tiền yêu cầu</div>
                    <div className="font-bold text-lg text-primary">
                      {formatCurrency(detail.amount, Currency.VND)}
                    </div>

                    <div className="text-muted-foreground">Trạng thái</div>
                    <div>
                      <Badge
                        className={cn(
                          'border',
                          statusColorMap[detail.status] ??
                            'bg-slate-50 text-slate-700 border-slate-200'
                        )}
                      >
                        {statusTextMap[detail.status] ?? detail.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              {(() => {
                const user = detail.User || detail.User_WithdrawalRequest_userIdToUser;
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Thông tin người dùng</h3>
                    <div className="grid grid-cols-1 gap-4 p-4 bg-muted/20 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-muted-foreground">Tên</div>
                        <div className="font-medium">{user?.name ?? 'N/A'}</div>

                        <div className="text-muted-foreground">Email</div>
                        <div className="font-medium">{user?.email ?? 'N/A'}</div>

                        <div className="text-muted-foreground">Số điện thoại</div>
                        <div className="font-medium">{user?.phone ?? 'N/A'}</div>

                        <div className="text-muted-foreground">Avatar</div>
                        <div className="font-medium">
                          {user?.avatar ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                                <Image
                                  width={24}
                                  height={24}
                                  src={user.avatar}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">Có ảnh đại diện</span>
                            </div>
                          ) : (
                            'Chưa có ảnh đại diện'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Bank & Wallet Information */}
              {(() => {
                const user = detail.User || detail.User_WithdrawalRequest_userIdToUser;
                const wallet = user?.Wallet;
                return wallet ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Thông tin ngân hàng & ví</h3>
                    <div className="grid grid-cols-1 gap-4 p-4 bg-muted/20 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-muted-foreground">Ngân hàng</div>
                        <div className="font-medium">{wallet.bankName ?? 'N/A'}</div>

                        <div className="text-muted-foreground">Số tài khoản</div>
                        <div className="font-mono font-medium">{wallet.bankAccount ?? 'N/A'}</div>

                        <div className="text-muted-foreground">Chủ tài khoản</div>
                        <div className="font-medium">{wallet.accountHolder ?? 'N/A'}</div>

                        <div className="text-muted-foreground">Số dư ví hiện tại</div>
                        <div className="font-bold text-lg text-green-600">
                          {formatCurrency(wallet.balance, Currency.VND)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Thông tin ngân hàng & ví</h3>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Chưa có thông tin ngân hàng và ví
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Timeline Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thời gian xử lý</h3>
                <div className="grid grid-cols-1 gap-4 p-4 bg-muted/20 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-muted-foreground">Ngày tạo yêu cầu</div>
                    <div className="font-medium">
                      {new Date(detail.createdAt).toLocaleString('vi-VN')}
                    </div>

                    <div className="text-muted-foreground">Thời gian xử lý</div>
                    <div className="font-medium">
                      {detail.processedAt ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {new Date(detail.processedAt).toLocaleString('vi-VN')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Clock className="h-4 w-4" />
                          Chưa xử lý
                        </div>
                      )}
                    </div>

                    <div className="text-muted-foreground">Người xử lý</div>
                    <div className="font-medium">
                      {detail.processedById ? (
                        <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                          Manager ID: {detail.processedById}
                        </span>
                      ) : (
                        'Chưa có'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Analysis */}
              {(() => {
                const user = detail.User || detail.User_WithdrawalRequest_userIdToUser;
                const wallet = user?.Wallet;
                const canWithdraw = wallet && wallet.balance >= detail.amount;
                const isProcessed = detail.status !== 'PENDING';

                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Phân tích rút tiền</h3>
                    <div className="grid grid-cols-1 gap-4 p-4 bg-muted/20 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-muted-foreground">Số tiền yêu cầu</div>
                        <div className="font-bold text-red-600">
                          -{formatCurrency(detail.amount, Currency.VND)}
                        </div>

                        <div className="text-muted-foreground">Số dư hiện tại</div>
                        <div className="font-bold text-green-600">
                          {wallet ? formatCurrency(wallet.balance, Currency.VND) : 'N/A'}
                        </div>

                        <div className="text-muted-foreground">Số dư sau rút</div>
                        <div
                          className={cn(
                            'font-bold',
                            wallet && wallet.balance >= detail.amount
                              ? 'text-green-600'
                              : 'text-red-600'
                          )}
                        >
                          {wallet
                            ? formatCurrency(wallet.balance - detail.amount, Currency.VND)
                            : 'N/A'}
                        </div>

                        <div className="text-muted-foreground">Trạng thái khả thi</div>
                        <div>
                          {isProcessed ? (
                            <Badge variant="secondary">Đã xử lý</Badge>
                          ) : canWithdraw ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Có thể rút tiền
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              Số dư không đủ
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!isProcessed && !canWithdraw && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">
                            ⚠️ <strong>Cảnh báo:</strong> Số dư trong ví không đủ để thực hiện giao
                            dịch rút tiền này.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ghi chú hiện tại</h3>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm">
                    {detail.note ? (
                      <p className="text-muted-foreground italic">&quot;{detail.note}&quot;</p>
                    ) : (
                      <p className="text-muted-foreground">Chưa có ghi chú</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Update Section - Only show if status is PENDING or APPROVED */}
              {detail.status !== 'COMPLETED' && detail.status !== 'REJECTED' && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold">Cập nhật trạng thái</h3>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Trạng thái mới</Label>
                    <Select
                      value={updateStatus}
                      onValueChange={v =>
                        setUpdateStatus(
                          v as 'APPROVED' | 'CANCELLED' | 'COMPLETED' | 'PENDING' | 'REJECTED'
                        )
                      }
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            Chờ duyệt
                          </div>
                        </SelectItem>
                        <SelectItem value="APPROVED">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Đã duyệt
                          </div>
                        </SelectItem>
                        <SelectItem value="REJECTED">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Từ chối
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Đã hủy
                          </div>
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Đã hoàn thành
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="note" className="text-sm font-medium">
                      Ghi chú mới
                    </Label>
                    <Textarea
                      id="note"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Nhập ghi chú về quyết định xử lý (tuỳ chọn)"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Footer with conditional button */}
              <SheetFooter className="gap-2 pt-6">
                {detail.status !== 'COMPLETED' && detail.status !== 'REJECTED' ? (
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
                    className="flex-1"
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Đang cập nhật...
                      </div>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                ) : (
                  <div className="flex-1 p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      {detail.status === 'COMPLETED'
                        ? '✅ Yêu cầu đã được hoàn thành'
                        : '❌ Yêu cầu đã bị từ chối'}
                    </p>
                  </div>
                )}
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
