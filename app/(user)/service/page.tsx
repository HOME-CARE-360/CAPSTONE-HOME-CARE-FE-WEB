'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useServices } from '@/hooks/useService';
import { useCategories } from '@/hooks/useCategory';
import { ServiceCard } from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/lib/api/services/fetchCategory';
import type { Service } from '@/lib/api/services/fetchService';
import Image from 'next/image';

function ServiceSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Get search parameters from URL
  const urlSearch = searchParams?.get('search');
  const urlCategory = searchParams?.get('category');

  // Fetch categories for filtering
  const { data: categoriesData } = useCategories();

  // Fetch services based on search and filters
  const { data: servicesData, isLoading } = useServices({
    name: searchQuery || undefined,
    categories: selectedCategory ? [selectedCategory] : undefined,
    page: currentPage,
    limit: 12,
  });

  const categories = categoriesData?.categories || [];
  const services = servicesData?.services || [];
  const totalItems = servicesData?.totalItems || 0;
  const totalPages = servicesData?.totalPages || 1;

  // Initialize search from URL params
  useEffect(() => {
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlCategory) setSelectedCategory(parseInt(urlCategory));
  }, [urlSearch, urlCategory]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory.toString());
    router.push(`/service?${params.toString()}`);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (categoryId) params.append('category', categoryId.toString());
    router.push(`/service?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setCurrentPage(1);
    router.push('/service');
  };

  const hasActiveFilters = searchQuery.trim() || selectedCategory;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {hasActiveFilters ? 'Kết quả tìm kiếm' : 'Tất cả dịch vụ'}
        </h1>
        <p className="text-muted-foreground">
          {hasActiveFilters
            ? `Tìm thấy ${totalItems} dịch vụ phù hợp`
            : 'Khám phá các dịch vụ chất lượng từ nhà cung cấp uy tín'}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} className="px-6">
            Tìm kiếm
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => handleCategoryFilter(null)}
          >
            Tất cả
          </Badge>
          {categories.map((category: Category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => handleCategoryFilter(category.id)}
            >
              {category.logo && (
                <Image
                  width={20}
                  height={20}
                  src={category.logo}
                  alt={category.name}
                  className="w-4 h-4 rounded mr-2"
                />
              )}
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service: Service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy dịch vụ nào</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục'
              : 'Hiện tại chưa có dịch vụ nào'}
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline">
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ServiceSearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServiceSearchContent />
    </Suspense>
  );
}
