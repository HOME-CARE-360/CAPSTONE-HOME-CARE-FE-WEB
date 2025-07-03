/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ServiceItemSearchParams } from '@/lib/api/services/fetchServiceItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceItemTableFiltersProps {
  onFilterChange?: (filters: Partial<ServiceItemSearchParams>) => void;
}

export function ServiceItemTableFilters({ onFilterChange }: ServiceItemTableFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({
    name: '',
    brand: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    status: 'all',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Convert filters to API params
    const apiFilters: Partial<ServiceItemSearchParams> = {};

    if (newFilters.name) apiFilters.name = newFilters.name;
    if (newFilters.brand) apiFilters.brand = newFilters.brand;
    if (newFilters.model) apiFilters.model = newFilters.model;
    if (newFilters.minPrice) apiFilters.minPrice = parseFloat(newFilters.minPrice);
    if (newFilters.maxPrice) apiFilters.maxPrice = parseFloat(newFilters.maxPrice);
    if (newFilters.status !== 'all') {
      // Note: isActive filter will be handled in the API layer
      // For now, we'll pass it as a custom parameter
      (apiFilters as any).isActive = newFilters.status === 'active';
    }

    onFilterChange?.(apiFilters);
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      brand: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      status: 'all',
    });
    onFilterChange?.({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={filters.name}
            onChange={e => handleFilterChange('name', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Bộ lọc
          {hasActiveFilters && <div className="w-2 h-2 bg-primary rounded-full" />}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Thương hiệu</label>
                <Input
                  placeholder="Nhập thương hiệu..."
                  value={filters.brand}
                  onChange={e => handleFilterChange('brand', e.target.value)}
                />
              </div>

              {/* Model Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <Input
                  placeholder="Nhập model..."
                  value={filters.model}
                  onChange={e => handleFilterChange('model', e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={filters.status}
                  onValueChange={value => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Price Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Giá tối thiểu</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={e => handleFilterChange('minPrice', e.target.value)}
                />
              </div>

              {/* Max Price Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Giá tối đa</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.maxPrice}
                  onChange={e => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
