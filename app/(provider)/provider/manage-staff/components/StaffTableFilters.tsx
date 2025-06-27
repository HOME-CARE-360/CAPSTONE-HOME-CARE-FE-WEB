import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { StaffSearchParams } from '@/lib/api/services/fetchStaff';
import { useCategories } from '@/hooks/useCategory';

interface StaffTableFiltersProps {
  filters: StaffSearchParams;
  onFilterChange: (filters: Partial<StaffSearchParams>) => void;
  onClearFilters: () => void;
}

export function StaffTableFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: StaffTableFiltersProps) {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];

  const hasActiveFilters = filters.name || filters.categories?.length || filters.orderBy !== 'desc';

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Bộ lọc</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tìm kiếm theo tên */}
        <div className="space-y-2">
          <Label htmlFor="name">Tìm kiếm theo tên</Label>
          <Input
            id="name"
            placeholder="Nhập tên nhân viên..."
            value={filters.name || ''}
            onChange={e => onFilterChange({ name: e.target.value, page: 1 })}
          />
        </div>

        {/* Sắp xếp */}
        <div className="space-y-2">
          <Label htmlFor="orderBy">Sắp xếp</Label>
          <Select
            value={filters.orderBy || 'desc'}
            onValueChange={(value: 'asc' | 'desc') => onFilterChange({ orderBy: value, page: 1 })}
          >
            <SelectTrigger id="orderBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Mới nhất</SelectItem>
              <SelectItem value="asc">Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Số lượng hiển thị */}
        <div className="space-y-2">
          <Label htmlFor="limit">Số lượng hiển thị</Label>
          <Select
            value={filters.limit?.toString() || '10'}
            onValueChange={value => onFilterChange({ limit: parseInt(value), page: 1 })}
          >
            <SelectTrigger id="limit">
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

      {/* Filter theo danh mục */}
      <div className="space-y-2">
        <Label>Lọc theo vai trò</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const isSelected = filters.categories?.includes(category.id);
            return (
              <Badge
                key={category.id}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => {
                  const currentCategories = filters.categories || [];
                  const newCategories = isSelected
                    ? currentCategories.filter(id => id !== category.id)
                    : [...currentCategories, category.id];
                  onFilterChange({ categories: newCategories, page: 1 });
                }}
              >
                {category.name}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Hiển thị active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>
          {filters.name && (
            <Badge variant="secondary" className="text-xs">
              Tên: {filters.name}
            </Badge>
          )}
          {filters.orderBy && (
            <Badge variant="secondary" className="text-xs">
              Sắp xếp: {filters.orderBy === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
            </Badge>
          )}
          {filters.categories?.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            return category ? (
              <Badge key={categoryId} variant="secondary" className="text-xs">
                Vai trò: {category.name}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
