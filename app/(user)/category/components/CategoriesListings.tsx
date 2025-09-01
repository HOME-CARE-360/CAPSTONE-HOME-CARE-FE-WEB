'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/useCategory';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Search, RefreshCw, Loader2 } from 'lucide-react';
import { CategoryCard, CategoryCardSkeleton } from '@/components/CategoryCard';

export default function CategoriesListings() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams?.get('name') || '');

  // Only apply filters when search params are present (after form submission)
  const filters = useMemo(() => {
    const nameParam = searchParams?.get('name');
    const nextFilters: { name?: string } = {};
    if (nameParam?.trim()) nextFilters.name = nameParam.trim();
    return nextFilters;
  }, [searchParams]);

  const { data, isLoading, isError, error, isFetching } = useCategories(filters);

  useEffect(() => {
    const current = searchParams?.get('name') || '';
    setSearchTerm(current);
  }, [searchParams]);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('name', searchTerm.trim());
    const query = params.toString();
    router.push(query ? `?${query}` : '/category');
  };

  const onClear = () => {
    setSearchTerm('');
    router.push('/category');
  };

  if (isLoading) {
    return (
      <section className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background">
        <div className="mb-8">
          <div className="max-w-md">
            <Skeleton className="h-10 w-56 mb-3" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-background text-foreground">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Lỗi</h3>
          <p className="text-muted-foreground mb-2">Đã xảy ra lỗi khi tải danh mục</p>
          <p className="text-sm text-destructive mb-4">
            {error instanceof Error ? error.message : 'Không thể tải danh mục'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  const categories = data?.categories ?? [];

  return (
    <section className="w-full max-w-screen px-8 md:px-8 xl:px-32 mx-auto py-16 bg-background text-foreground">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Danh mục</h2>
        <p className="text-muted-foreground">Khám phá các danh mục dịch vụ</p>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1 max-w-2xl">
            <form onSubmit={onSubmitSearch} className="relative group">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm danh mục dịch vụ..."
                  className="pl-12 pr-4 h-12 text-base border-2 border-border focus:border-primary transition-colors duration-200 rounded-xl shadow-sm"
                  aria-label="Tìm kiếm danh mục"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="lg"
              disabled={isFetching}
              onClick={onSubmitSearch}
              className="px-6 h-12 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tìm...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </>
              )}
            </Button>
            {searchTerm && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onClear}
                className="px-4 h-12 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                aria-label="Xóa tìm kiếm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {searchTerm && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Kết quả tìm kiếm cho:</span>
            <span className="font-medium text-foreground">{searchTerm}</span>
            {categories.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                {categories.length} danh mục
              </span>
            )}
          </div>
        )}
      </div>

      {isFetching && <div className="mb-4 text-sm text-muted-foreground">Đang cập nhật...</div>}

      {categories.length === 0 ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center text-muted-foreground">Không có danh mục nào</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              size="sm"
              onClick={c => router.push(`/category/${c.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
