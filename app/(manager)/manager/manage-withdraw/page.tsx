'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Currency, formatCurrency } from '@/utils/numbers/formatCurrency';
import {
  CalendarClock,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
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

  const headerActions = (
    <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center w-full gap-3">
        <Select value={status} onValueChange={v => setStatus(v as WithdrawStatus)}>
          <SelectTrigger className="w-full sm:w-[200px] h-10">
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
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-10 w-full sm:w-auto"
        >
          <RefreshCcw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
          Làm mới
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-0 md:p-0">
      <SiteHeader title="Quản lý rút tiền" />
      <div className="p-3 sm:p-4 pt-0 space-y-4 sm:space-y-6">
        <div>
          <CardHeader className="space-y-4 sm:space-y-6 pb-4 sm:pb-6 px-3 sm:px-6">
            {headerActions}
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            {isLoading ? (
              <div className="space-y-3 sm:space-y-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Card key={idx} className="border">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                        <div className="flex-shrink-0 space-y-3 w-full lg:w-1/3">
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                              <Skeleton className="h-3 w-32 sm:h-3 sm:w-48" />
                            </div>
                          </div>
                          <div className="text-center">
                            <Skeleton className="h-6 w-24 sm:h-8 sm:w-32 mx-auto mb-1" />
                            <Skeleton className="h-3 w-20 sm:h-3 sm:w-24 mx-auto" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-2">
                            <Skeleton className="h-5 w-16 sm:h-6 sm:w-20" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4" />
                              <div className="space-y-1">
                                <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
                                <Skeleton className="h-3 w-16 sm:h-3 sm:w-20" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                        <div className="flex-shrink-0 space-y-3">
                          <Skeleton className="w-full h-8 sm:w-24 sm:h-8" />
                          <Skeleton className="w-full h-6 sm:w-20 sm:h-6 mx-auto" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {rows.length === 0 ? (
                  <Card className="border">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-lg sm:text-xl">💰</span>
                        </div>
                        <p className="text-sm sm:text-base font-medium">
                          Không có yêu cầu rút tiền
                        </p>
                        <p className="text-xs sm:text-sm">Hãy thử thay đổi bộ lọc</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  rows.map((withdraw, index) => (
                    <Card
                      key={withdraw.id}
                      className={cn(
                        'border transition-all duration-200 hover:shadow-md',
                        index % 2 === 0 && 'bg-muted/10'
                      )}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                          {/* Left Section - User Info and Amount */}
                          <div className="flex-shrink-0 space-y-3 w-full lg:w-1/3">
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                {withdraw.User?.avatar ||
                                withdraw.User_WithdrawalRequest_userIdToUser?.avatar ? (
                                  <Image
                                    width={48}
                                    height={48}
                                    src={
                                      withdraw.User?.avatar ||
                                      withdraw.User_WithdrawalRequest_userIdToUser?.avatar ||
                                      ''
                                    }
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs sm:text-sm text-muted-foreground">
                                    {(
                                      withdraw.User?.name ||
                                      withdraw.User_WithdrawalRequest_userIdToUser?.name ||
                                      'U'
                                    )
                                      ?.slice(0, 1)
                                      .toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-medium truncate">
                                  {withdraw.User?.name ||
                                    withdraw.User_WithdrawalRequest_userIdToUser?.name ||
                                    'N/A'}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {withdraw.User?.email ||
                                    withdraw.User_WithdrawalRequest_userIdToUser?.email ||
                                    'N/A'}
                                </div>
                                {(withdraw.User?.phone ||
                                  withdraw.User_WithdrawalRequest_userIdToUser?.phone) && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {withdraw.User?.phone ||
                                      withdraw.User_WithdrawalRequest_userIdToUser?.phone}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-lg sm:text-2xl font-bold text-primary">
                                {formatCurrency(withdraw.amount, Currency.VND)}
                              </div>
                              <div className="text-xs text-muted-foreground">Số tiền yêu cầu</div>
                            </div>
                          </div>

                          {/* Center Section - Details and Timeline */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-2">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs backdrop-blur-sm">
                                    {statusTextMap[withdraw.status] ?? withdraw.status}
                                  </Badge>
                                </div>

                                {withdraw.note && (
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    <span className="font-medium">Ghi chú:</span> {withdraw.note}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Timeline Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 text-xs sm:text-sm">
                                <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="font-medium text-foreground">
                                    {new Date(withdraw.createdAt).toLocaleDateString('vi-VN')}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(withdraw.createdAt).toLocaleTimeString('vi-VN')}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs sm:text-sm">
                                {withdraw.processedAt ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <div className="font-medium text-foreground">
                                        {new Date(withdraw.processedAt).toLocaleDateString('vi-VN')}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(withdraw.processedAt).toLocaleTimeString('vi-VN')}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                      Chưa xử lý
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Bank Information */}
                            {(() => {
                              const user =
                                withdraw.User || withdraw.User_WithdrawalRequest_userIdToUser;
                              const wallet = user?.Wallet;
                              return wallet ? (
                                <div className="p-2 sm:p-3 bg-muted/20 rounded-lg">
                                  <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs">
                                    <div className="text-muted-foreground">Ngân hàng:</div>
                                    <div className="font-medium truncate">
                                      {wallet.bankName || '--'}
                                    </div>

                                    <div className="text-muted-foreground">Số tài khoản:</div>
                                    <div className="font-mono font-medium truncate">
                                      {wallet.bankAccount || '--'}
                                    </div>

                                    <div className="text-muted-foreground">Số dư hiện tại:</div>
                                    <div className="font-bold text-green-600 truncate">
                                      {formatCurrency(wallet.balance, Currency.VND)}
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>

                          {/* Right Section - Actions */}
                          <div className="flex-shrink-0 space-y-3 w-full lg:w-auto">
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedId(withdraw.id);
                                  setOpen(true);
                                }}
                                className="w-full sm:w-auto"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Chi tiết</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Tổng{' '}
                <span className="font-semibold text-foreground">
                  {data?.pagination?.total ?? 0}
                </span>{' '}
                yêu cầu
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (page > 1) setPage(page - 1);
                      }}
                      disabled={page <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
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
                          className="h-8 w-8 text-xs sm:text-sm"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (page < totalPages) setPage(page + 1);
                      }}
                      disabled={page >= totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full h-screen sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg sm:text-xl">Chi tiết rút tiền #{selectedId}</SheetTitle>
            <SheetDescription className="text-sm">
              Thông tin chi tiết yêu cầu rút tiền
            </SheetDescription>
          </SheetHeader>

          {isDetailLoading ? (
            <div className="space-y-3 mt-4 sm:mt-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} className="h-4 sm:h-6 w-full" />
              ))}
            </div>
          ) : detail ? (
            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="text-muted-foreground">Mã yêu cầu</div>
                    <div className="font-mono font-medium">#{detail.id}</div>

                    <div className="text-muted-foreground">Số tiền yêu cầu</div>
                    <div className="font-bold text-base sm:text-lg text-primary">
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
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Thông tin người dùng</h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
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
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted overflow-hidden">
                                <Image
                                  width={32}
                                  height={32}
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
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Thông tin ngân hàng & ví</h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="text-muted-foreground">Ngân hàng</div>
                        <div className="font-medium">{wallet.bankName ?? '--'}</div>

                        <div className="text-muted-foreground">Số tài khoản</div>
                        <div className="font-mono font-medium">{wallet.bankAccount ?? '--'}</div>

                        <div className="text-muted-foreground">Chủ tài khoản</div>
                        <div className="font-medium">{wallet.accountHolder ?? '--'}</div>

                        <div className="text-muted-foreground">Số dư ví hiện tại</div>
                        <div className="font-bold text-base sm:text-lg text-green-600">
                          {formatCurrency(wallet.balance, Currency.VND)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Thông tin ngân hàng & ví</h3>
                    <div className="p-3 sm:p-4 bg-muted/20 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Chưa có thông tin ngân hàng và ví
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Timeline Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold">Thời gian xử lý</h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
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
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Phân tích rút tiền</h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
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
                              Đang xử lý
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
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold">Ghi chú hiện tại</h3>
                <div className="p-3 sm:p-4 bg-muted/20 rounded-lg">
                  <div className="text-xs sm:text-sm">
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
                <div className="space-y-3 sm:space-y-4 border-t pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold">Cập nhật trạng thái</h3>

                  <div className="space-y-3">
                    <Label className="text-xs sm:text-sm font-medium">Trạng thái mới</Label>
                    <Select
                      value={updateStatus}
                      onValueChange={v =>
                        setUpdateStatus(
                          v as 'APPROVED' | 'CANCELLED' | 'COMPLETED' | 'PENDING' | 'REJECTED'
                        )
                      }
                    >
                      <SelectTrigger className="w-full h-9 sm:h-10">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            Chờ duyệt
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
                        <SelectItem value="APPROVED">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Đã duyệt
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
                    <Label htmlFor="note" className="text-xs sm:text-sm font-medium">
                      Ghi chú mới
                    </Label>
                    <Textarea
                      id="note"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Nhập ghi chú về quyết định xử lý (tuỳ chọn)"
                      rows={3}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Footer with conditional button */}
              <SheetFooter className="gap-2 pt-4 sm:pt-6">
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
                    className="flex-1 text-xs sm:text-sm"
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Đang cập nhật...</span>
                        <span className="sm:hidden">Đang cập nhật</span>
                      </div>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                ) : (
                  <div className="flex-1 p-3 bg-muted/20 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground text-center">
                      {detail.status === 'COMPLETED'
                        ? 'Yêu cầu đã được hoàn thành'
                        : 'Yêu cầu đã bị từ chối'}
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isUpdating}
                  className="text-xs sm:text-sm"
                >
                  Đóng
                </Button>
              </SheetFooter>
            </div>
          ) : (
            <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
              Không tìm thấy dữ liệu
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
