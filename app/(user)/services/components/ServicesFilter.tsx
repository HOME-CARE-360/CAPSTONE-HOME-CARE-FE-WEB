'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/hooks/useCategory';
import { Search, Filter, X, ChevronDown, ChevronUp, Tag, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ServicesFilterProps {
  className?: string;
}

export default function ServicesFilter({ className }: ServicesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categoryData, isLoading: isCategoryLoading } = useCategories();

  // Local state for form inputs
  const [searchTerm, setSearchTerm] = useState(searchParams.get('name') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('categories') || []
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Apply filters to URL
  const applyFilters = (newSearchTerm: string, newCategories: string[]) => {
    const params = new URLSearchParams();

    if (newSearchTerm.trim()) {
      params.set('name', newSearchTerm.trim());
    }

    newCategories.forEach(categories => {
      params.append('categories', categories);
    });

    const newUrl = params.toString() ? `?${params.toString()}` : '/services';
    router.push(newUrl);
  };

  // Handle search term change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, selectedCategories);
  };

  // Handle category selection
  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    applyFilters(searchTerm, newCategories);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    router.push('/services');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm.trim() || selectedCategories.length > 0;

  return (
    <Card className={cn('w-full max-w-sm', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Bộ lọc dịch vụ
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="space-y-3">
          <Label htmlFor="search" className="text-sm font-medium">
            Tìm kiếm theo tên
          </Label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Nhập tên dịch vụ..."
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              className="pl-10 pr-4"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-3"
            >
              Tìm
            </Button>
          </form>
        </div>

        <Separator />

        {/* Categories Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Danh mục</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {isCategoryLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div
              className={cn(
                'space-y-2 transition-all duration-300 overflow-hidden',
                isExpanded ? 'max-h-none' : 'max-h-64'
              )}
            >
              {categoryData?.categories?.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id.toString())}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors hover:bg-muted/50',
                    selectedCategories.includes(category.id.toString())
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-background hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {category.logo && (
                      <Image
                        src={category.logo}
                        alt={category.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded object-cover"
                      />
                    )}
                    <span className="text-sm font-medium truncate">{category.name}</span>
                  </div>
                  {selectedCategories.includes(category.id.toString()) && (
                    <Badge variant="secondary" className="text-xs">
                      Đã chọn
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {!isCategoryLoading && categoryData?.categories?.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Không có danh mục nào</p>
            </div>
          )}

          {/* Show more/less button if there are many categories */}
          {!isCategoryLoading && categoryData?.categories && categoryData.categories.length > 8 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Xem thêm ({categoryData.categories.length - 8} danh mục)
                </>
              )}
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium">Bộ lọc đang áp dụng</Label>
              <div className="space-y-2">
                {searchTerm.trim() && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Tìm kiếm: {searchTerm}
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        applyFilters('', selectedCategories);
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {selectedCategories.map(categoryId => {
                  const category = categoryData?.categories?.find(
                    c => c.id.toString() === categoryId
                  );
                  return (
                    <Badge key={categoryId} variant="outline" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {category?.name || `Danh mục ${categoryId}`}
                      <button
                        onClick={() => handleCategoryToggle(categoryId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Xóa tất cả bộ lọc
          </Button>
        )}

        {/* Results Summary */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {hasActiveFilters ? (
            <p>Đang hiển thị kết quả với bộ lọc đã chọn</p>
          ) : (
            <p>Hiển thị tất cả dịch vụ</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
