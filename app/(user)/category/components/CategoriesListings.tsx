'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/useCategory';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { CategoryCard, CategoryCardSkeleton } from '@/components/CategoryCard';

export default function CategoriesListings() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('name') || '');

  const filters = useMemo(() => {
    const nextFilters: { name?: string } = {};
    if (searchTerm.trim()) nextFilters.name = searchTerm.trim();
    return nextFilters;
  }, [searchTerm]);

  const { data, isLoading, isError, error, isFetching } = useCategories(filters);

  useEffect(() => {
    const current = searchParams.get('name') || '';
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <div className="mb-6">
        <form onSubmit={onSubmitSearch} className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="pl-10 pr-24"
            aria-label="Tìm kiếm danh mục"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <Button type="submit" size="sm" disabled={isFetching}>
              Tìm
            </Button>
            {searchTerm && (
              <Button type="button" variant="outline" size="sm" onClick={onClear}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>

      {isFetching && <div className="mb-4 text-sm text-muted-foreground">Đang cập nhật...</div>}

      {categories.length === 0 ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center text-muted-foreground">Không có danh mục nào</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={c => router.push(`/category/${c.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
