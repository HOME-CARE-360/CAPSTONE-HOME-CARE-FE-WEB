'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGetMaintenanceSuggestions } from '@/hooks/useUser';
import { MaintenanceSuggestionParams } from '@/lib/api/services/fetchUser';
import { useCategories } from '@/hooks/useCategory';
import { formatDate } from '@/utils/numbers/formatDate';
import { AlertTriangle, Clock, Wrench, Building2, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AssetSuggestionsPage() {
  const [filters, setFilters] = useState<MaintenanceSuggestionParams>({
    limit: 10,
    dueSoon: true,
    priorityFilter: 'HIGH',
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { data, isLoading, error } = useGetMaintenanceSuggestions(filters);
  const { data: categoriesData } = useCategories();

  const suggestions = data?.data || [];

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'default';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM':
        return <Clock className="w-4 h-4" />;
      case 'LOW':
        return <Wrench className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const getDueStatus = (dueInDays: number) => {
    if (dueInDays < 0) return { text: 'Quá hạn', variant: 'destructive' as const };
    if (dueInDays <= 7) return { text: 'Sắp đến hạn', variant: 'default' as const };
    if (dueInDays <= 30) return { text: 'Gần đến hạn', variant: 'secondary' as const };
    return { text: 'Còn thời gian', variant: 'outline' as const };
  };

  const handleFilterChange = (
    key: keyof MaintenanceSuggestionParams,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev: MaintenanceSuggestionParams) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      limit: 10,
      dueSoon: true,
      priorityFilter: 'HIGH',
      categoryId: undefined,
    });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Không thể tải gợi ý bảo trì</h3>
              <p className="text-muted-foreground">Vui lòng thử lại sau</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gợi ý bảo trì tài sản</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi lịch bảo trì tài sản</p>
        </div>

        <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Cài đặt bộ lọc</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-sm font-medium">
                    Danh mục
                  </Label>
                  <Select
                    value={filters.categoryId?.toString() || 'all'}
                    onValueChange={value =>
                      handleFilterChange('categoryId', value === 'all' ? undefined : Number(value))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {categoriesData?.categories?.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorityFilter" className="text-sm font-medium">
                    Mức độ ưu tiên
                  </Label>
                  <Select
                    value={filters.priorityFilter || 'HIGH'}
                    onValueChange={value => handleFilterChange('priorityFilter', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Thấp</SelectItem>
                      <SelectItem value="MEDIUM">Trung bình</SelectItem>
                      <SelectItem value="HIGH">Cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div className="space-y-2">
                  <Label htmlFor="limit" className="text-sm font-medium">
                    Giới hạn kết quả
                  </Label>
                  <Select
                    value={filters.limit?.toString() || '10'}
                    onValueChange={value => handleFilterChange('limit', Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                {/* <div className="flex items-center space-x-3 pt-6">
                  <Switch
                    id="dueSoon"
                    checked={filters.dueSoon || false}
                    onCheckedChange={checked => handleFilterChange('dueSoon', checked)}
                  />
                  <Label htmlFor="dueSoon" className="text-sm font-medium">
                    Chỉ hiển thị sắp đến hạn
                  </Label>
                </div> */}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={resetFilters} variant="outline" className="flex-1">
                  Đặt lại
                </Button>
                <Button onClick={() => setIsFiltersOpen(false)} className="flex-1">
                  Áp dụng
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {filters.categoryId && (
              <Badge variant="outline">
                Danh mục:{' '}
                {categoriesData?.categories?.find(c => c.id === filters.categoryId)?.name ||
                  filters.categoryId}
              </Badge>
            )}
            {filters.priorityFilter && (
              <Badge variant="outline">
                Ưu tiên:
                {getPriorityIcon(filters.priorityFilter)}
                {filters.priorityFilter === 'HIGH'
                  ? 'Cao'
                  : filters.priorityFilter === 'MEDIUM'
                    ? 'Trung bình'
                    : filters.priorityFilter === 'LOW'
                      ? 'Thấp'
                      : filters.priorityFilter}
              </Badge>
            )}
            {/* {filters.limit && <Badge variant="outline">Giới hạn: {filters.limit}</Badge>} */}
            {filters.dueSoon && <Badge variant="outline">Sắp đến hạn</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Grid */}
      {isLoading && suggestions.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map(suggestion => {
            const dueStatus = getDueStatus(suggestion.dueInDays);

            return (
              <Card
                key={suggestion.assetId}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold leading-tight">{suggestion.assetName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.brand} {suggestion.model}
                      </p>
                    </div>
                    <Badge variant={getPriorityVariant(suggestion.priority)} className="gap-1">
                      {getPriorityIcon(suggestion.priority)}
                      {suggestion.priority === 'HIGH'
                        ? 'Cao'
                        : suggestion.priority === 'MEDIUM'
                          ? 'Trung bình'
                          : suggestion.priority === 'LOW'
                            ? 'Thấp'
                            : suggestion.priority}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mã dịch vụ</span>
                      <span className="font-mono">{suggestion.code}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Điểm ưu tiên</span>
                      <span className="font-medium">{(suggestion.score * 100).toFixed(0)}%</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lần bảo trì</span>
                      <span className="font-medium">{suggestion.totalServicesCount}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ngày đến hạn</span>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(suggestion.nextDueDate)}</p>
                        <Badge variant={dueStatus.variant} className="text-xs">
                          {dueStatus.text}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lần cuối</span>
                      <span className="font-medium">{formatDate(suggestion.lastServiceDate)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Chu kỳ</span>
                      <span className="font-medium">{suggestion.intervalDays} ngày</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground italic">{suggestion.reason}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Không có gợi ý bảo trì</h3>
              <p className="text-muted-foreground">Thử điều chỉnh bộ lọc hoặc kiểm tra lại sau</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
