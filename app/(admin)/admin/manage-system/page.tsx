'use client';

import { useState, useMemo } from 'react';
import { useGetSystemConfigs, useUpdateSystemConfig } from '@/hooks/useAdmin';
import { UpdateSystemConfigRequest, SystemConfig } from '@/lib/api/services/fetchAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { SiteHeader } from '@/app/(admin)/components/SiteHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ManageSystemPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);

  const [editForm, setEditForm] = useState<UpdateSystemConfigRequest>({
    value: '',
  });

  // Helper function to get input type based on config key
  const getInputType = (configKey: string) => {
    const timeConfigs = [
      'WORKLOG_MAX_UPDATE_HOURS',
      'WORKLOG_MAX_CHECKOUT_HOURS',
      'BOOKING_ASSIGNMENT_DEADLINE_MINUTES_BEFORE',
      'WORKLOG_MAX_DATE_DIFF_DAYS',
      'BOOKING_AUTOCOMPLETED_DAYS',
      'WALLET_TOPUP_MIN',
      'BOOKING_DEPOSIT',
      'PROVIDER_PAYOUT_PERCENTAGE',
    ];

    const cronConfigs = [
      'BOOKING_CANCELLATION_CRON',
      'BOOKING_AUTOCOMPLETED_CRON',
      'SUGGEST_DEVICE_CRON',
    ];

    if (timeConfigs.includes(configKey)) {
      return 'number';
    }
    if (cronConfigs.includes(configKey)) {
      return 'cron';
    }
    return 'text';
  };

  // Cron expression options
  const cronOptions = [
    { value: '*/1 * * * *', label: 'Mỗi phút' },
    { value: '*/5 * * * *', label: 'Mỗi 5 phút' },
    { value: '*/10 * * * *', label: 'Mỗi 10 phút' },
    { value: '*/15 * * * *', label: 'Mỗi 15 phút' },
    { value: '*/30 * * * *', label: 'Mỗi 30 phút' },
    { value: '0 * * * *', label: 'Mỗi giờ' },
    { value: '0 */2 * * *', label: 'Mỗi 2 giờ' },
    { value: '0 */6 * * *', label: 'Mỗi 6 giờ' },
    { value: '0 */12 * * *', label: 'Mỗi 12 giờ' },
    { value: '0 0 * * *', label: 'Mỗi ngày' },
    { value: '0 0 */2 * *', label: 'Mỗi 2 ngày' },
    { value: '0 0 0 * *', label: 'Mỗi tháng' },
  ];

  // Time interval options for hours
  const hourOptions = [
    { value: '1', label: '1 giờ' },
    { value: '2', label: '2 giờ' },
    { value: '6', label: '6 giờ' },
    { value: '12', label: '12 giờ' },
    { value: '24', label: '24 giờ (1 ngày)' },
    { value: '48', label: '48 giờ (2 ngày)' },
    { value: '72', label: '72 giờ (3 ngày)' },
  ];

  // Time interval options for minutes
  const minuteOptions = [
    { value: '5', label: '5 phút' },
    { value: '10', label: '10 phút' },
    { value: '15', label: '15 phút' },
    { value: '30', label: '30 phút' },
    { value: '45', label: '45 phút' },
    { value: '60', label: '1 giờ' },
    { value: '90', label: '1.5 giờ' },
    { value: '120', label: '2 giờ' },
  ];

  // Day options
  const dayOptions = [
    { value: '1', label: '1 ngày' },
    { value: '2', label: '2 ngày' },
    { value: '3', label: '3 ngày' },
    { value: '4', label: '4 ngày' },
    { value: '5', label: '5 ngày' },
    { value: '7', label: '1 tuần' },
    { value: '14', label: '2 tuần' },
    { value: '30', label: '1 tháng' },
  ];

  // Amount options
  const amountOptions = [
    { value: '10000', label: '10,000 VNĐ' },
    { value: '20000', label: '20,000 VNĐ' },
    { value: '30000', label: '30,000 VNĐ' },
    { value: '50000', label: '50,000 VNĐ' },
    { value: '100000', label: '100,000 VNĐ' },
    { value: '200000', label: '200,000 VNĐ' },
    { value: '500000', label: '500,000 VNĐ' },
  ];

  // Percentage options
  const percentageOptions = [
    { value: '70', label: '70%' },
    { value: '75', label: '75%' },
    { value: '80', label: '80%' },
    { value: '85', label: '85%' },
    { value: '90', label: '90%' },
    { value: '95', label: '95%' },
  ];

  // Get options based on config key
  const getOptions = (configKey: string) => {
    if (configKey.includes('HOURS')) {
      return hourOptions;
    }
    if (configKey.includes('MINUTES')) {
      return minuteOptions;
    }
    if (configKey.includes('DAYS')) {
      return dayOptions;
    }
    if (configKey.includes('CRON')) {
      return cronOptions;
    }
    if (configKey.includes('DEPOSIT') || configKey.includes('TOPUP_MIN')) {
      return amountOptions;
    }
    if (configKey.includes('PERCENTAGE')) {
      return percentageOptions;
    }
    return [];
  };

  // Get formatted display value
  const getFormattedValue = (configKey: string, value: string) => {
    const options = getOptions(configKey);
    const option = options.find(opt => opt.value === value);

    if (option) {
      return option.label;
    }

    // Fallback formatting for values not in predefined options
    if (configKey.includes('DEPOSIT') || configKey.includes('TOPUP_MIN')) {
      return `${parseInt(value).toLocaleString('vi-VN')} VNĐ`;
    }

    if (configKey.includes('PERCENTAGE')) {
      return `${value}%`;
    }

    return value;
  };

  // Get formatted key display
  const getFormattedKey = (key: string) => {
    const keyMap: Record<string, string> = {
      WALLET_TOPUP_MIN: 'Số tiền nạp ví tối thiểu',
      BOOKING_DEPOSIT: 'Tiền đặt cọc đặt dịch vụ',
      PROVIDER_PAYOUT_PERCENTAGE: 'Phần trăm thanh toán cho nhà cung cấp',
      WORKLOG_MAX_UPDATE_HOURS: 'Thời gian tối đa cập nhật nhật ký làm việc (giờ)',
      WORKLOG_MAX_CHECKOUT_HOURS: 'Thời gian tối đa checkout nhật ký làm việc (giờ)',
      BOOKING_ASSIGNMENT_DEADLINE_MINUTES_BEFORE: 'Thời gian phân công trước khi thực hiện (phút)',
      WORKLOG_MAX_DATE_DIFF_DAYS: 'Số ngày tối đa chênh lệch nhật ký làm việc',
      BOOKING_AUTOCOMPLETED_DAYS: 'Số ngày tự động hoàn thành đặt dịch vụ',
      SERVICE_REQUEST_CANCEL_DEADLINE_HOURS: 'Thời gian tối đa hủy đặt dịch vụ (giờ)',
      BOOKING_CANCELLATION_CRON: 'Lịch trình hủy đặt dịch vụ tự động',
      BOOKING_AUTOCOMPLETED_CRON: 'Lịch trình hoàn thành đặt dịch vụ tự động',
      SUGGEST_DEVICE_CRON: 'Lịch trình gợi ý thiết bị',
    };

    return keyMap[key] || key;
  };

  // API hooks
  const {
    data: systemConfigsData,
    isLoading,
    error,
  } = useGetSystemConfigs({
    page: currentPage,
    limit: 10, // Default to 10 for now, as setPageSize is removed
    search: undefined, // searchTerm is removed
  });

  const { mutation: updateMutation, isLoading: isUpdating } = useUpdateSystemConfig();
  //   const { mutation: deleteMutation, isLoading: isDeleting } = useDeleteSystemConfig();

  // Computed values
  const systemConfigs = useMemo(() => systemConfigsData?.data?.items || [], [systemConfigsData]);
  const meta = useMemo(() => systemConfigsData?.data?.meta, [systemConfigsData]);
  const totalPages = meta?.totalPages || 1;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingConfig) return;

    try {
      await updateMutation.mutateAsync({
        id: editingConfig.id,
        data: editForm,
      });
      setIsEditDialogOpen(false);
      setEditingConfig(null);
      setEditForm({ value: '' });
      toast.success('Cập nhật cấu hình thành công');
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  //   const handleDelete = async (id: number) => {
  //     try {
  //       await deleteMutation.mutateAsync(id);
  //       toast.success('Xóa cấu hình thành công');
  //     } catch (error) {
  //       console.error('Delete error:', error);
  //     }
  //   };

  const handleEdit = (config: SystemConfig) => {
    setEditingConfig(config);
    setEditForm({
      value: config.value,
    });
    setIsEditDialogOpen(true);
  };

  //   const getTypeBadgeVariant = (type: string) => {
  //     switch (type) {
  //       case 'number':
  //         return 'default';
  //       case 'string':
  //         return 'secondary';
  //       case 'boolean':
  //         return 'outline';
  //       default:
  //         return 'default';
  //     }
  //   };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return 'Invalid date';
    }
  };

  if (error) {
    return (
      <>
        <SiteHeader title="Quản lý cấu hình hệ thống" />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive">Có lỗi xảy ra khi tải dữ liệu</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Quản lý cấu hình hệ thống" />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quản lý cấu hình hệ thống</h1>
              <p className="text-muted-foreground">
                Quản lý các cấu hình hệ thống và tham số hoạt động
              </p>
            </div>
            {/* <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Thêm cấu hình
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm cấu hình mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Khóa cấu hình *</Label>
                  <Input
                    id="key"
                    value={createForm.key}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="VD: BOOKING_DEPOSIT"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Giá trị *</Label>
                  <Textarea
                    id="value"
                    value={createForm.value}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Nhập giá trị cấu hình"
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Kiểu dữ liệu *</Label>
                  <Select
                    value={createForm.type}
                    onValueChange={(value: 'number' | 'string' | 'boolean') =>
                      setCreateForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Ngày hết hạn (tùy chọn)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={createForm.expiresAt || ''}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      expiresAt: e.target.value || null 
                    }))}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Đang tạo...' : 'Tạo cấu hình'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog> */}
          </div>

          {/* Filters */}
          {/* <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Tìm theo khóa hoặc giá trị..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pageSize">Số lượng hiển thị</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card> */}

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Danh sách cấu hình hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {/* <TableHead className="w-[100px]">ID</TableHead> */}
                        <TableHead>Khóa</TableHead>
                        <TableHead>Giá trị</TableHead>
                        {/* <TableHead className="w-[100px]">Kiểu</TableHead> */}
                        <TableHead className="w-[150px]">Ngày tạo</TableHead>
                        <TableHead className="w-[150px]">Ngày cập nhật</TableHead>
                        <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemConfigs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Settings className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">Không có cấu hình nào</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        systemConfigs.map(config => (
                          <TableRow key={config.id}>
                            {/* <TableCell>
                            <Badge variant="outline">{config.id}</Badge>
                          </TableCell> */}
                            <TableCell>
                              <div className="font-medium">{getFormattedKey(config.key)}</div>
                              <div className="text-xs text-muted-foreground mt-1">{config.key}</div>
                            </TableCell>
                            <TableCell>
                              <div
                                className="max-w-[200px] truncate"
                                title={getFormattedValue(config.key, config.value)}
                              >
                                {getFormattedValue(config.key, config.value)}
                              </div>
                            </TableCell>
                            {/* <TableCell>
                            <Badge variant={getTypeBadgeVariant(config.type)}>
                              {config.type}
                            </Badge>
                          </TableCell> */}
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(config.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(config.updatedAt)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(config)}
                                  disabled={isUpdating}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {/* <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xóa cấu hình "{config.key}"? 
                                      Hành động này không thể hoàn tác.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(config.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Xóa
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog> */}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {meta && totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={
                          currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <div className="text-center text-sm text-muted-foreground mt-4">
                  Trang {currentPage} của {totalPages} • Tổng {meta.total} cấu hình
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa cấu hình</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-key">Khóa cấu hình</Label>
                <Input
                  id="edit-key"
                  value={editingConfig?.key || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-value">Giá trị *</Label>
                {(() => {
                  const inputType = getInputType(editingConfig?.key || '');
                  const options = getOptions(editingConfig?.key || '');

                  if (inputType === 'cron' && options.length > 0) {
                    return (
                      <Select
                        value={editForm.value}
                        onValueChange={value => setEditForm(prev => ({ ...prev, value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tần suất thực hiện" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }

                  if (inputType === 'number' && options.length > 0) {
                    return (
                      <Select
                        value={editForm.value}
                        onValueChange={value => setEditForm(prev => ({ ...prev, value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giá trị" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }

                  return (
                    <Textarea
                      id="edit-value"
                      value={editForm.value}
                      onChange={e => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="Nhập giá trị cấu hình"
                      required
                      rows={3}
                    />
                  );
                })()}
              </div>
              {/* <div className="space-y-2">
               <Label htmlFor="edit-type">Kiểu dữ liệu</Label>
               <Input
                 id="edit-type"
                 value={editingConfig?.type || ''}
                 disabled
                 className="bg-muted"
               />
             </div> */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
